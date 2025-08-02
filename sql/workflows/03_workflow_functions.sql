-- Workflow engine functions for starting requests and performing approvals
-- Assumes auth.uid() available (Supabase), and users.role in public.users

-- Helper: check if a user has one of the required roles
CREATE OR REPLACE FUNCTION public.fn_user_has_any_role(p_user uuid, p_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = p_user
      AND u.role = ANY(p_roles)
  );
$$;

-- Helper: get entity display title for notifications/logging
CREATE OR REPLACE FUNCTION public.fn_entity_title(p_entity_type public.workflow_entity_type, p_entity_id uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN p_entity_type = 'audit' THEN (SELECT a.title FROM public.audits a WHERE a.id = p_entity_id)
    WHEN p_entity_type = 'finding' THEN (SELECT f.title FROM public.findings f WHERE f.id = p_entity_id)
    ELSE NULL
  END;
$$;

-- Start an approval request by cloning the workflow template steps
-- Returns approval_requests.id
CREATE OR REPLACE FUNCTION public.fn_start_approval_request(
  p_entity_type public.workflow_entity_type,
  p_entity_id uuid,
  p_workflow_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_request_id uuid;
  v_total_steps int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- basic existence checks
  IF p_entity_type = 'audit' AND NOT EXISTS (SELECT 1 FROM public.audits a WHERE a.id = p_entity_id) THEN
    RAISE EXCEPTION 'Audit not found';
  ELSIF p_entity_type = 'finding' AND NOT EXISTS (SELECT 1 FROM public.findings f WHERE f.id = p_entity_id) THEN
    RAISE EXCEPTION 'Finding not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = p_workflow_id AND w.is_active = true AND w.entity_type = p_entity_type) THEN
    RAISE EXCEPTION 'Workflow not found or not active for this entity type';
  END IF;

  INSERT INTO public.approval_requests(entity_type, entity_id, workflow_id, requested_by, status, current_step)
  VALUES (p_entity_type, p_entity_id, p_workflow_id, v_user, 'pending_approval', 1)
  RETURNING id INTO v_request_id;

  -- materialize steps
  INSERT INTO public.approval_request_steps(
    request_id, step_order, step_name, assignee_role, assignee_id, required, status
  )
  SELECT
    v_request_id, ws.step_order, ws.step_name, ws.assignee_role, ws.assignee_id, ws.required, 'pending'
  FROM public.workflow_steps ws
  WHERE ws.workflow_id = p_workflow_id
  ORDER BY ws.step_order;

  -- compute number of steps
  SELECT COALESCE(MAX(step_order), 0) INTO v_total_steps FROM public.approval_request_steps WHERE request_id = v_request_id;

  IF v_total_steps = 0 THEN
    RAISE EXCEPTION 'Workflow has no steps';
  END IF;

  -- update parent entity approval_status if applicable
  IF p_entity_type = 'audit' THEN
    UPDATE public.audits SET approval_status = 'pending_approval', updated_at = now() WHERE id = p_entity_id;
  ELSIF p_entity_type = 'finding' THEN
    UPDATE public.findings SET workflow_status = 'pending_approval', updated_at = now() WHERE id = p_entity_id;
  END IF;

  RETURN v_request_id;
END;
$$;

-- Internal role map for step levels:
-- Level 1: auditor OR supervisor_auditor
-- Level 2: business_unit_manager
-- Level 3: admin OR cro
CREATE OR REPLACE FUNCTION public.fn_required_roles_for_step(p_step_order int)
RETURNS text[]
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF p_step_order = 1 THEN
    RETURN ARRAY['auditor','supervisor_auditor']::text[];
  ELSIF p_step_order = 2 THEN
    RETURN ARRAY['business_unit_manager']::text[];
  ELSIF p_step_order = 3 THEN
    RETURN ARRAY['admin','cro']::text[];
  ELSE
    -- default fallback for any additional steps if defined
    RETURN ARRAY['admin']::text[];
  END IF;
END;
$$;

-- Perform an approval action on the current step.
-- Only the current step can be actioned. Role enforcement based on step order.
CREATE OR REPLACE FUNCTION public.fn_perform_approval_action(
  p_request_id uuid,
  p_action public.approval_action,
  p_comments text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_req RECORD;
  v_step RECORD;
  v_required_roles text[];
  v_next_step int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_req FROM public.approval_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval request not found';
  END IF;

  IF v_req.status IN ('approved','rejected','cancelled') THEN
    RAISE EXCEPTION 'Cannot perform action. Request already %', v_req.status;
  END IF;

  SELECT * INTO v_step
  FROM public.approval_request_steps
  WHERE request_id = p_request_id AND step_order = v_req.current_step
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Current step not found';
  END IF;

  -- role check
  v_required_roles := public.fn_required_roles_for_step(v_step.step_order);
  IF NOT public.fn_user_has_any_role(v_user, v_required_roles) THEN
    RAISE EXCEPTION 'Insufficient role to perform this action';
  END IF;

  -- record action
  INSERT INTO public.approval_actions(request_id, step_id, performer_id, action, comments)
  VALUES (p_request_id, v_step.id, v_user, p_action, p_comments);

  -- apply step state
  IF p_action = 'approve' THEN
    UPDATE public.approval_request_steps
    SET status = 'completed', action_by = v_user, action_at = now(), action = p_action, comments = p_comments, updated_at = now()
    WHERE id = v_step.id;

    -- advance
    SELECT v_req.current_step + 1 INTO v_next_step;

    IF EXISTS (SELECT 1 FROM public.approval_request_steps WHERE request_id = p_request_id AND step_order = v_next_step) THEN
      UPDATE public.approval_requests
      SET status = 'in_progress', current_step = v_next_step, updated_at = now()
      WHERE id = p_request_id;
    ELSE
      -- finished
      UPDATE public.approval_requests
      SET status = 'approved', completed_at = now(), updated_at = now()
      WHERE id = p_request_id;

      -- update entity final status
      IF v_req.entity_type = 'audit' THEN
        UPDATE public.audits SET approval_status = 'approved', approved_by = v_user, approved_at = now(), updated_at = now()
        WHERE id = v_req.entity_id;
      ELSIF v_req.entity_type = 'finding' THEN
        UPDATE public.findings SET workflow_status = 'approved', updated_at = now()
        WHERE id = v_req.entity_id;
      END IF;
    END IF;

  ELSIF p_action = 'reject' THEN
    UPDATE public.approval_request_steps
    SET status = 'rejected', action_by = v_user, action_at = now(), action = p_action, comments = p_comments, updated_at = now()
    WHERE id = v_step.id;

    UPDATE public.approval_requests
    SET status = 'rejected', completed_at = now(), updated_at = now()
    WHERE id = p_request_id;

    IF v_req.entity_type = 'audit' THEN
      UPDATE public.audits SET approval_status = 'rejected', updated_at = now()
      WHERE id = v_req.entity_id;
    ELSIF v_req.entity_type = 'finding' THEN
      UPDATE public.findings SET workflow_status = 'rejected', updated_at = now()
      WHERE id = v_req.entity_id;
    END IF;

  ELSIF p_action = 'request_revision' THEN
    UPDATE public.approval_request_steps
    SET status = 'revision_required', action_by = v_user, action_at = now(), action = p_action, comments = p_comments, updated_at = now()
    WHERE id = v_step.id;

    UPDATE public.approval_requests
    SET status = 'revision_required', updated_at = now()
    WHERE id = p_request_id;

    IF v_req.entity_type = 'audit' THEN
      UPDATE public.audits SET approval_status = 'revision_required', updated_at = now()
      WHERE id = v_req.entity_id;
    ELSIF v_req.entity_type = 'finding' THEN
      UPDATE public.findings SET workflow_status = 'revision_required', updated_at = now()
      WHERE id = v_req.entity_id;
    END IF;

  ELSIF p_action = 'skip' THEN
    UPDATE public.approval_request_steps
    SET status = 'skipped', action_by = v_user, action_at = now(), action = p_action, comments = p_comments, updated_at = now()
    WHERE id = v_step.id;

    SELECT v_req.current_step + 1 INTO v_next_step;

    IF EXISTS (SELECT 1 FROM public.approval_request_steps WHERE request_id = p_request_id AND step_order = v_next_step) THEN
      UPDATE public.approval_requests
      SET status = 'in_progress', current_step = v_next_step, updated_at = now()
      WHERE id = p_request_id;
    ELSE
      UPDATE public.approval_requests
      SET status = 'approved', completed_at = now(), updated_at = now()
      WHERE id = p_request_id;

      IF v_req.entity_type = 'audit' THEN
        UPDATE public.audits SET approval_status = 'approved', approved_by = v_user, approved_at = now(), updated_at = now()
        WHERE id = v_req.entity_id;
      ELSIF v_req.entity_type = 'finding' THEN
        UPDATE public.findings SET workflow_status = 'approved', updated_at = now()
        WHERE id = v_req.entity_id;
      END IF;
    END IF;

  ELSE
    RAISE EXCEPTION 'Unsupported action %', p_action;
  END IF;
END;
$$;

-- Convenience RPC wrappers for Supabase JS client
CREATE OR REPLACE FUNCTION public.rpc_start_approval(
  p_entity_type text,
  p_entity_id uuid,
  p_workflow_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_type public.workflow_entity_type;
  v_id uuid;
BEGIN
  v_type := p_entity_type::public.workflow_entity_type;
  v_id := public.fn_start_approval_request(v_type, p_entity_id, p_workflow_id);
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_approve(p_request_id uuid, p_comments text DEFAULT NULL)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.fn_perform_approval_action(p_request_id, 'approve', p_comments);
$$;

CREATE OR REPLACE FUNCTION public.rpc_reject(p_request_id uuid, p_comments text DEFAULT NULL)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.fn_perform_approval_action(p_request_id, 'reject', p_comments);
$$;

CREATE OR REPLACE FUNCTION public.rpc_request_revision(p_request_id uuid, p_comments text DEFAULT NULL)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.fn_perform_approval_action(p_request_id, 'request_revision', p_comments);
$$;

CREATE OR REPLACE FUNCTION public.rpc_skip_step(p_request_id uuid, p_comments text DEFAULT NULL)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.fn_perform_approval_action(p_request_id, 'skip', p_comments);
$$;