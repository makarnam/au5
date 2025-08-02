-- Workflow core tables for audits and findings approval engine
-- Safe to run multiple times (uses IF NOT EXISTS where possible)

-- Workflows catalog (template)
CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  description text,
  entity_type public.workflow_entity_type NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workflow steps template
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  step_order int NOT NULL CHECK (step_order > 0),
  step_name varchar NOT NULL,
  -- role-based target; optional assignee override
  assignee_role varchar NOT NULL,
  assignee_id uuid REFERENCES public.users(id),
  required boolean DEFAULT true,
  status public.approval_step_status DEFAULT 'pending',
  completed_at timestamptz,
  completed_by uuid REFERENCES public.users(id),
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workflow_id, step_order)
);

-- Approval requests (instance)
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type public.workflow_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  workflow_id uuid NOT NULL REFERENCES public.workflows(id),
  current_step int DEFAULT 1,
  status public.approval_request_status DEFAULT 'pending_approval',
  requested_by uuid REFERENCES public.users(id),
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Approval steps instance (materialized from template at start)
CREATE TABLE IF NOT EXISTS public.approval_request_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL REFERENCES public.approval_requests(id) ON DELETE CASCADE,
  step_order int NOT NULL CHECK (step_order > 0),
  step_name varchar NOT NULL,
  assignee_role varchar NOT NULL,
  assignee_id uuid REFERENCES public.users(id),
  required boolean DEFAULT true,
  status public.approval_step_status DEFAULT 'pending',
  action_by uuid REFERENCES public.users(id),
  action_at timestamptz,
  action public.approval_action,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(request_id, step_order)
);

-- Approval action log
CREATE TABLE IF NOT EXISTS public.approval_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL REFERENCES public.approval_requests(id) ON DELETE CASCADE,
  step_id uuid REFERENCES public.approval_request_steps(id) ON DELETE SET NULL,
  performer_id uuid NOT NULL REFERENCES public.users(id),
  action public.approval_action NOT NULL,
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Convenience views (optional)
CREATE OR REPLACE VIEW public.v_pending_approvals AS
SELECT
  ars.id as step_id,
  ar.id as request_id,
  ar.entity_type,
  ar.entity_id,
  ar.status as request_status,
  ars.step_order,
  ars.step_name,
  ars.assignee_role,
  ars.assignee_id,
  ars.status as step_status,
  ar.current_step
FROM public.approval_request_steps ars
JOIN public.approval_requests ar ON ar.id = ars.request_id
WHERE ars.status = 'pending' AND ar.status IN ('pending_approval', 'in_progress');

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON public.approval_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_request ON public.approval_request_steps(request_id, step_order);
CREATE INDEX IF NOT EXISTS idx_approval_actions_request ON public.approval_actions(request_id, created_at);
