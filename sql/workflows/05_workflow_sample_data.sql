-- Sample workflow templates and steps for audits and findings
-- Creates a 3-step approval: Level1 (auditor/supervisor_auditor), Level2 (business_unit_manager), Level3 (admin/cro)

-- Audit Approval Workflow Template
INSERT INTO public.workflows (id, name, description, entity_type, is_active, created_by)
VALUES (
  COALESCE((SELECT id FROM public.workflows WHERE name = 'Audit 3-Level Approval' AND entity_type = 'audit' LIMIT 1), uuid_generate_v4()),
  'Audit 3-Level Approval',
  'Three-level approval for audits: Auditor -> Business Unit Manager -> Admin/CRO',
  'audit',
  true,
  (SELECT id FROM public.users ORDER BY created_at LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Ensure we have the id we just inserted (or existing one)
WITH w AS (
  SELECT id FROM public.workflows WHERE name = 'Audit 3-Level Approval' AND entity_type = 'audit' LIMIT 1
)
INSERT INTO public.workflow_steps (workflow_id, step_order, step_name, assignee_role, required, status)
SELECT w.id, 1, 'Level 1 - Auditor Review', 'auditor', true, 'pending' FROM w
ON CONFLICT DO NOTHING;

WITH w AS (
  SELECT id FROM public.workflows WHERE name = 'Audit 3-Level Approval' AND entity_type = 'audit' LIMIT 1
)
INSERT INTO public.workflow_steps (workflow_id, step_order, step_name, assignee_role, required, status)
SELECT w.id, 2, 'Level 2 - Business Unit Manager Approval', 'business_unit_manager', true, 'pending' FROM w
ON CONFLICT DO NOTHING;

WITH w AS (
  SELECT id FROM public.workflows WHERE name = 'Audit 3-Level Approval' AND entity_type = 'audit' LIMIT 1
)
INSERT INTO public.workflow_steps (workflow_id, step_order, step_name, assignee_role, required, status)
SELECT w.id, 3, 'Level 3 - Admin/CRO Sign-off', 'admin', true, 'pending' FROM w
ON CONFLICT DO NOTHING;

-- Finding Approval Workflow Template
INSERT INTO public.workflows (id, name, description, entity_type, is_active, created_by)
VALUES (
  COALESCE((SELECT id FROM public.workflows WHERE name = 'Finding 3-Level Approval' AND entity_type = 'finding' LIMIT 1), uuid_generate_v4()),
  'Finding 3-Level Approval',
  'Three-level approval for findings: Auditor -> Business Unit Manager -> Admin/CRO',
  'finding',
  true,
  (SELECT id FROM public.users ORDER BY created_at LIMIT 1)
)
ON CONFLICT DO NOTHING;

WITH w AS (
  SELECT id FROM public.workflows WHERE name = 'Finding 3-Level Approval' AND entity_type = 'finding' LIMIT 1
)
INSERT INTO public.workflow_steps (workflow_id, step_order, step_name, assignee_role, required, status)
SELECT w.id, 1, 'Level 1 - Auditor Review', 'auditor', true, 'pending' FROM w
ON CONFLICT DO NOTHING;

WITH w AS (
  SELECT id FROM public.workflows WHERE name = 'Finding 3-Level Approval' AND entity_type = 'finding' LIMIT 1
)
INSERT INTO public.workflow_steps (workflow_id, step_order, step_name, assignee_role, required, status)
SELECT w.id, 2, 'Level 2 - Business Unit Manager Approval', 'business_unit_manager', true, 'pending' FROM w
ON CONFLICT DO NOTHING;

WITH w AS (
  SELECT id FROM public.workflows WHERE name = 'Finding 3-Level Approval' AND entity_type = 'finding' LIMIT 1
)
INSERT INTO public.workflow_steps (workflow_id, step_order, step_name, assignee_role, required, status)
SELECT w.id, 3, 'Level 3 - Admin/CRO Sign-off', 'admin', true, 'pending' FROM w
ON CONFLICT DO NOTHING;

-- Note: Level 3 required roles include 'admin' or 'cro' enforced by function fn_required_roles_for_step