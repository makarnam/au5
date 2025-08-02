-- Compliance Module - Seeds and Scheduled Jobs (Optional)
-- Safe to run multiple times (uses IF NOT EXISTS guards where applicable)

-- 1) Minimal seed frameworks (ISO 27001, SOC 2, NIST 800-53)
WITH upsert_framework AS (
  INSERT INTO public.compliance_frameworks (code, name, version, description, authority, category)
  VALUES
    ('ISO27001-2022', 'ISO/IEC 27001', '2022', 'Information Security Management System', 'ISO', 'security'),
    ('SOC2-TSC-2017', 'AICPA SOC 2 Trust Services Criteria', '2017', 'Security, Availability, Processing Integrity, Confidentiality, Privacy', 'AICPA', 'security'),
    ('NIST-800-53r5', 'NIST SP 800-53 Revision 5', 'Rev5', 'Security and Privacy Controls for Information Systems', 'NIST', 'security')
  ON CONFLICT (code) DO UPDATE
    SET name = EXCLUDED.name,
        version = EXCLUDED.version,
        description = EXCLUDED.description,
        authority = EXCLUDED.authority,
        category = EXCLUDED.category
  RETURNING id, code
)
SELECT * FROM upsert_framework;

-- 2) Insert a few demo sections/requirements for ISO 27001 (illustrative)
DO $$
DECLARE
  v_fw uuid;
  v_sec uuid;
BEGIN
  SELECT id INTO v_fw FROM public.compliance_frameworks WHERE code = 'ISO27001-2022';
  IF v_fw IS NULL THEN
    RAISE NOTICE 'ISO27001-2022 framework not found; skipping section/requirement seeds.';
    RETURN;
  END IF;

  -- Section: A.5 Organizational Controls
  INSERT INTO public.compliance_sections (framework_id, code, title, description)
  VALUES (v_fw, 'A.5', 'Organizational Controls', 'Organizational level information security controls')
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_sec FROM public.compliance_sections
    WHERE framework_id = v_fw AND code = 'A.5';

  -- Requirements (minimal illustrative examples)
  INSERT INTO public.compliance_requirements (framework_id, section_id, requirement_code, title, text, guidance, priority, is_active)
  VALUES
    (v_fw, v_sec, 'A.5.1', 'Information security policies',
      'Policies for information security shall be defined, approved by management, published, communicated, and reviewed at planned intervals.',
      'Establish, maintain, and review security policies. Ensure communication and awareness.',
      'medium', true),
    (v_fw, v_sec, 'A.5.2', 'Roles and responsibilities',
      'Information security roles and responsibilities shall be defined and assigned.',
      'Define and assign roles including control owners and reviewers.',
      'medium', true)
  ON CONFLICT (framework_id, requirement_code) DO UPDATE
    SET title = EXCLUDED.title,
        text = EXCLUDED.text,
        guidance = EXCLUDED.guidance,
        priority = EXCLUDED.priority,
        is_active = EXCLUDED.is_active;
END $$;

-- 3) Demo profile for a Business Unit (no hard dependency)
DO $$
DECLARE
  v_fw uuid;
  v_bu uuid;
  v_profile uuid;
BEGIN
  SELECT id INTO v_fw FROM public.compliance_frameworks WHERE code = 'ISO27001-2022';

  -- Try to pick an existing business unit if any
  SELECT id INTO v_bu FROM public.business_units WHERE is_active = true ORDER BY created_at LIMIT 1;

  INSERT INTO public.compliance_profiles (name, description, framework_id, business_unit_id, is_active, tags)
  VALUES ('Default ISO27001 Profile', 'Default organization-wide scope', v_fw, v_bu, true, ARRAY['default'])
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_profile FROM public.compliance_profiles
    WHERE framework_id = v_fw AND name = 'Default ISO27001 Profile';

  -- Mark all ISO reqs applicable by default for the profile
  INSERT INTO public.compliance_profile_requirements (profile_id, requirement_id, applicable)
  SELECT v_profile, r.id, true
  FROM public.compliance_requirements r
  WHERE r.framework_id = v_fw
  ON CONFLICT (profile_id, requirement_id) DO NOTHING;
END $$;

-- 4) Demo assessments (all unknown initially)
DO $$
DECLARE
  v_fw uuid;
  v_profile uuid;
BEGIN
  SELECT id INTO v_fw FROM public.compliance_frameworks WHERE code = 'ISO27001-2022';
  SELECT id INTO v_profile FROM public.compliance_profiles WHERE framework_id = v_fw AND name = 'Default ISO27001 Profile';

  INSERT INTO public.compliance_assessments (framework_id, profile_id, requirement_id, status, justification, score, ai_generated)
  SELECT r.framework_id, v_profile, r.id, 'unknown', 'Initial seed', NULL, false
  FROM public.compliance_requirements r
  WHERE r.framework_id = v_fw
  ON CONFLICT (requirement_id, profile_id) DO NOTHING;
END $$;

-- 5) Optional: schedule daily snapshot computation
-- If using supabase cron (pg_net/cron), adapt accordingly. Here a helper function to compute for all profiles/frameworks today.
CREATE OR REPLACE FUNCTION public.compute_all_compliance_snapshots_for_today()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT DISTINCT framework_id, profile_id
    FROM public.compliance_assessments
  LOOP
    PERFORM public.compute_compliance_snapshot(rec.framework_id, rec.profile_id, CURRENT_DATE);
  END LOOP;
END;
$$;

-- Example trigger for end-of-day snapshot via simple NOTIFY/listener (optional)
-- CREATE EXTENSION IF NOT EXISTS pg_cron; -- If allowed
-- SELECT cron.schedule('daily-compliance-snapshot', '0 2 * * *', $$SELECT public.compute_all_compliance_snapshots_for_today();$$);

-- 6) Posture demo run once
SELECT public.compute_all_compliance_snapshots_for_today();

-- 7) Small demo data: exception proposal (optional)
DO $$
DECLARE
  v_fw uuid;
  v_profile uuid;
  v_req uuid;
BEGIN
  SELECT id INTO v_fw FROM public.compliance_frameworks WHERE code = 'ISO27001-2022';
  SELECT id INTO v_profile FROM public.compliance_profiles WHERE framework_id = v_fw AND name = 'Default ISO27001 Profile';
  SELECT id INTO v_req FROM public.compliance_requirements WHERE framework_id = v_fw AND requirement_code = 'A.5.1';

  IF v_fw IS NOT NULL AND v_profile IS NOT NULL AND v_req IS NOT NULL THEN
    INSERT INTO public.compliance_exceptions (framework_id, profile_id, requirement_id, title, description, compensating_controls, status)
    VALUES (v_fw, v_profile, v_req, 'Temporary policy gap', 'Policy set under revision, final approval pending', 'Weekly management review and change freeze', 'proposed')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;