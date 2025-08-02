-- Findings Module: Triggers & Functions
-- Depends on sql/findings-module-migration.sql having been applied.
-- NOTE: Some environments may still have a NOT NULL severity column on public.findings (legacy).
-- We proactively default severity from risk_rating if present to avoid NULL constraint violations.

-- 1) Utility: compute jsonb diff between two rows
-- Simplified shallow diff: compares keys on the top level
CREATE OR REPLACE FUNCTION public.jsonb_shallow_diff(old_row jsonb, new_row jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  k text;
  old_v jsonb;
  new_v jsonb;
BEGIN
  FOR k IN SELECT DISTINCT key FROM (
    SELECT key FROM jsonb_each(old_row)
    UNION
    SELECT key FROM jsonb_each(new_row)
  ) t
  LOOP
    old_v := old_row -> k;
    new_v := new_row -> k;
    IF old_v IS DISTINCT FROM new_v THEN
      result := result || jsonb_build_object(k, jsonb_build_object('old', COALESCE(old_v, 'null'::jsonb), 'new', COALESCE(new_v, 'null'::jsonb)));
    END IF;
  END LOOP;
  RETURN result;
END
$$;

-- 2) Next version helper
CREATE OR REPLACE FUNCTION public.next_finding_version(p_finding_id uuid)
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(MAX(version), 0) + 1
  FROM public.findings_versions
  WHERE finding_id = p_finding_id;
$$;

-- 3) Build snapshot of a finding row (excluding volatile columns)
CREATE OR REPLACE FUNCTION public.build_finding_snapshot(p_id uuid)
RETURNS jsonb
LANGUAGE sql
AS $$
  SELECT to_jsonb(f) - 'created_at' - 'updated_at'
  FROM public.findings f
  WHERE f.id = p_id
$$;

-- 4) Trigger: version on insert and update
CREATE OR REPLACE FUNCTION public.tr_finding_version_upsert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_version integer;
  v_old jsonb;
  v_new jsonb;
  v_diff jsonb;
BEGIN
  -- ensure severity backfill on UPDATE if column exists and is null
  BEGIN
    IF TG_OP = 'UPDATE' AND NEW.severity IS NULL THEN
      NEW.severity := COALESCE(NULLIF(NEW.risk_rating::text, ''), 'medium')::character varying;
    END IF;
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;
  IF TG_OP = 'INSERT' THEN
    -- Backfill legacy NOT NULL severity from risk_rating if present
    BEGIN
      IF NEW.severity IS NULL THEN
        NEW.severity := COALESCE(NULLIF(NEW.risk_rating::text, ''), 'medium');
      END IF;
    EXCEPTION WHEN undefined_column THEN
      -- severity column may not exist in some environments; ignore
      NULL;
    END;
    v_version := 1;
    v_new := public.build_finding_snapshot(NEW.id);
    INSERT INTO public.findings_versions(finding_id, version, changed_by, changed_at, diff, snapshot)
    VALUES (NEW.id, v_version, NEW.updated_by, now(), '{}'::jsonb, v_new);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_version := public.next_finding_version(NEW.id);
    v_old := public.build_finding_snapshot(OLD.id);
    v_new := public.build_finding_snapshot(NEW.id);
    v_diff := public.jsonb_shallow_diff(v_old, v_new);
    INSERT INTO public.findings_versions(finding_id, version, changed_by, changed_at, diff, snapshot)
    VALUES (NEW.id, v_version, NEW.updated_by, now(), v_diff, v_new);
    RETURN NEW;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_finding_version_on_insert ON public.findings;
CREATE TRIGGER trg_finding_version_on_insert
AFTER INSERT ON public.findings
FOR EACH ROW
EXECUTE FUNCTION public.tr_finding_version_upsert();

DROP TRIGGER IF EXISTS trg_finding_version_on_update ON public.findings;
CREATE TRIGGER trg_finding_version_on_update
AFTER UPDATE ON public.findings
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION public.tr_finding_version_upsert();

-- 5) Status transition logic: auto-timestamps and history
CREATE OR REPLACE FUNCTION public.tr_finding_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_state finding_status;
  new_state finding_status;
  now_ts timestamptz := now();
BEGIN
  -- Determine states (support both legacy status and new workflow_status)
  old_state := COALESCE(OLD.workflow_status, 'draft');
  new_state := COALESCE(NEW.workflow_status, old_state);

  IF old_state IS DISTINCT FROM new_state THEN
    -- Set milestone timestamps
    CASE new_state
      WHEN 'draft' THEN NULL; -- no timestamp
      WHEN 'under_review' THEN NEW.submitted_at := COALESCE(NEW.submitted_at, now_ts);
      WHEN 'open' THEN NEW.opened_at := COALESCE(NEW.opened_at, now_ts);
      WHEN 'remediated' THEN NEW.remediated_at := COALESCE(NEW.remediated_at, now_ts);
      WHEN 'closed' THEN NEW.closed_at := COALESCE(NEW.closed_at, now_ts);
    END CASE;

    -- auto set reviewed_at when moving out of under_review to open/remediated/closed
    IF old_state = 'under_review' AND new_state IN ('open','remediated','closed') THEN
      NEW.reviewed_at := COALESCE(NEW.reviewed_at, now_ts);
    END IF;

    -- Insert status history
    INSERT INTO public.findings_status_history (finding_id, old_status, new_status, changed_by, changed_at, change_reason)
    VALUES (NEW.id, old_state, new_state, NEW.updated_by, now_ts, NULL);
  END IF;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_finding_status_transition ON public.findings;
CREATE TRIGGER trg_finding_status_transition
BEFORE UPDATE OF workflow_status ON public.findings
FOR EACH ROW
EXECUTE FUNCTION public.tr_finding_status_transition();

-- 6) Assignment notifications scaffold (reuse notifications table)
CREATE OR REPLACE FUNCTION public.enqueue_finding_assignment_notifications()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  now_ts timestamptz := now();
BEGIN
  -- Internal owner change
  IF OLD.internal_owner_id IS DISTINCT FROM NEW.internal_owner_id AND NEW.internal_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id, created_at)
    VALUES (NEW.internal_owner_id, 'finding_created',
      'Finding Assigned',
      'You have been assigned as Internal Owner for a finding.',
      'finding', NEW.id, now_ts);
  END IF;

  -- Remediation owner change
  IF OLD.remediation_owner_id IS DISTINCT FROM NEW.remediation_owner_id AND NEW.remediation_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id, created_at)
    VALUES (NEW.remediation_owner_id, 'finding_created',
      'Finding Assigned',
      'You have been assigned as Remediation Owner for a finding.',
      'finding', NEW.id, now_ts);
  END IF;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_finding_assignment_notify ON public.findings;
CREATE TRIGGER trg_finding_assignment_notify
AFTER INSERT OR UPDATE OF internal_owner_id, remediation_owner_id ON public.findings
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_finding_assignment_notifications();

-- 7) Due date nearing notifications (daily job-friendly)
CREATE OR REPLACE FUNCTION public.notify_findings_due_soon(p_days int DEFAULT 7)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  cnt int := 0;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id, created_at)
  SELECT DISTINCT COALESCE(f.remediation_owner_id, f.internal_owner_id) AS user_id,
         'due_date_reminder',
         'Finding Due Soon',
         'A finding is approaching its remediation due date.',
         'finding',
         f.id,
         now()
  FROM public.findings f
  WHERE f.remediation_due_date IS NOT NULL
    AND f.workflow_status IN ('open','under_review','remediated')
    AND f.remediation_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days;

  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END
$$;

-- 8) RPC: set finding status with audit
CREATE OR REPLACE FUNCTION public.set_finding_status(p_id uuid, p_new_status finding_status, p_reason text DEFAULT NULL)
RETURNS public.findings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.findings;
BEGIN
  UPDATE public.findings
  SET workflow_status = p_new_status,
      updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_row;

  -- Update updated_by may be set by app-level session using request.jwt.claims::json
  RETURN v_row;
END
$$;

-- 9) RPC: assign owners
CREATE OR REPLACE FUNCTION public.assign_finding_owners(p_id uuid, p_internal_owner uuid, p_remediation_owner uuid, p_due_date date)
RETURNS public.findings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.findings;
BEGIN
  UPDATE public.findings
  SET internal_owner_id = p_internal_owner,
      remediation_owner_id = p_remediation_owner,
      remediation_due_date = p_due_date,
      updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_row;
  RETURN v_row;
END
$$;

-- 10) RPC: search with filters
CREATE OR REPLACE FUNCTION public.search_findings(
  p_query text DEFAULT NULL,
  p_status finding_status[] DEFAULT NULL,
  p_risk text[] DEFAULT NULL,
  p_audit uuid DEFAULT NULL,
  p_due_before date DEFAULT NULL,
  p_tags text[] DEFAULT NULL
)
RETURNS SETOF public.findings
LANGUAGE sql
STABLE
AS $$
  SELECT f.*
  FROM public.findings f
  WHERE (p_query IS NULL OR f.title ILIKE '%'||p_query||'%' OR f.description ILIKE '%'||p_query||'%')
    AND (p_status IS NULL OR f.workflow_status = ANY(p_status))
    -- Cast risk_rating (which may be varchar in existing schema) to text and compare with provided text array
    AND (p_risk IS NULL OR (f.risk_rating::text = ANY(p_risk)))
    AND (p_audit IS NULL OR f.audit_id = p_audit)
    AND (p_due_before IS NULL OR f.remediation_due_date <= p_due_before)
    AND (p_tags IS NULL OR (f.tags && p_tags));
$$;

-- 11) RPC: versions for a finding
CREATE OR REPLACE FUNCTION public.get_finding_versions(p_id uuid)
RETURNS SETOF public.findings_versions
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.findings_versions
  WHERE finding_id = p_id
  ORDER BY version DESC;
$$;

-- 12) RPC: simple diff between two versions
CREATE OR REPLACE FUNCTION public.get_finding_diff(p_id uuid, p_from_version int, p_to_version int)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH a AS (
    SELECT snapshot FROM public.findings_versions 
    WHERE finding_id = p_id AND version = p_from_version
  ), b AS (
    SELECT snapshot FROM public.findings_versions 
    WHERE finding_id = p_id AND version = p_to_version
  )
  SELECT public.jsonb_shallow_diff(a.snapshot, b.snapshot)
  FROM a, b;
$$;