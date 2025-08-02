-- Row Level Security and policies for workflow engine
-- Assumes Supabase auth and public.users table with role column

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_request_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user has any of roles
CREATE OR REPLACE FUNCTION public.fn_current_user_has_any_role(p_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = ANY(p_roles)
  );
$$;

-- Policy logic:
-- Admin-like roles get broad access
-- Creators can see their own workflows they created/requested
-- Approvers can read the steps assigned to their role; actions via RPC go through SECURITY DEFINER functions
-- For simplicity:
--   read: creator/requester, admin, cro
--   insert/update/delete: only via RPC (deny direct DML), except admins.

-- Workflows (templates) policies
DROP POLICY IF EXISTS workflows_read ON public.workflows;
CREATE POLICY workflows_read ON public.workflows
FOR SELECT
USING (
  public.fn_current_user_has_any_role(ARRAY['admin','cro'])
  OR created_by = auth.uid()
);

DROP POLICY IF EXISTS workflows_admin_all ON public.workflows;
CREATE POLICY workflows_admin_all ON public.workflows
FOR ALL
USING (public.fn_current_user_has_any_role(ARRAY['admin','cro']))
WITH CHECK (public.fn_current_user_has_any_role(ARRAY['admin','cro']));

-- workflow_steps (template)
DROP POLICY IF EXISTS workflow_steps_read ON public.workflow_steps;
CREATE POLICY workflow_steps_read ON public.workflow_steps
FOR SELECT
USING (
  public.fn_current_user_has_any_role(ARRAY['admin','cro'])
  OR workflow_id IN (SELECT id FROM public.workflows w WHERE w.created_by = auth.uid())
);

DROP POLICY IF EXISTS workflow_steps_admin_all ON public.workflow_steps;
CREATE POLICY workflow_steps_admin_all ON public.workflow_steps
FOR ALL
USING (public.fn_current_user_has_any_role(ARRAY['admin','cro']))
WITH CHECK (public.fn_current_user_has_any_role(ARRAY['admin','cro']));

-- approval_requests (instances)
DROP POLICY IF EXISTS approval_requests_read ON public.approval_requests;
CREATE POLICY approval_requests_read ON public.approval_requests
FOR SELECT
USING (
  public.fn_current_user_has_any_role(ARRAY['admin','cro'])
  OR requested_by = auth.uid()
  OR id IN (
    SELECT ars.request_id
    FROM public.approval_request_steps ars
    WHERE ars.assignee_id = auth.uid()
       OR public.fn_current_user_has_any_role(ARRAY[ars.assignee_role])
  )
);

-- Block direct insert/update/delete for normal users; use RPC
DROP POLICY IF EXISTS approval_requests_admin_all ON public.approval_requests;
CREATE POLICY approval_requests_admin_all ON public.approval_requests
FOR ALL
USING (public.fn_current_user_has_any_role(ARRAY['admin','cro']))
WITH CHECK (public.fn_current_user_has_any_role(ARRAY['admin','cro']));

-- approval_request_steps
DROP POLICY IF EXISTS approval_request_steps_read ON public.approval_request_steps;
CREATE POLICY approval_request_steps_read ON public.approval_request_steps
FOR SELECT
USING (
  public.fn_current_user_has_any_role(ARRAY['admin','cro'])
  OR request_id IN (
    SELECT id FROM public.approval_requests ar
    WHERE ar.requested_by = auth.uid()
       OR EXISTS (
         SELECT 1 FROM public.approval_request_steps s
         WHERE s.request_id = ar.id
           AND (s.assignee_id = auth.uid() OR public.fn_current_user_has_any_role(ARRAY[s.assignee_role]))
       )
  )
);

DROP POLICY IF EXISTS approval_request_steps_admin_all ON public.approval_request_steps;
CREATE POLICY approval_request_steps_admin_all ON public.approval_request_steps
FOR ALL
USING (public.fn_current_user_has_any_role(ARRAY['admin','cro']))
WITH CHECK (public.fn_current_user_has_any_role(ARRAY['admin','cro']));

-- approval_actions (audit log)
DROP POLICY IF EXISTS approval_actions_read ON public.approval_actions;
CREATE POLICY approval_actions_read ON public.approval_actions
FOR SELECT
USING (
  public.fn_current_user_has_any_role(ARRAY['admin','cro'])
  OR request_id IN (SELECT id FROM public.approval_requests WHERE requested_by = auth.uid())
  OR performer_id = auth.uid()
);

DROP POLICY IF EXISTS approval_actions_admin_all ON public.approval_actions;
CREATE POLICY approval_actions_admin_all ON public.approval_actions
FOR ALL
USING (public.fn_current_user_has_any_role(ARRAY['admin','cro']))
WITH CHECK (public.fn_current_user_has_any_role(ARRAY['admin','cro']));

-- Optional: deny by default for write operations for non-admins by not creating permissive policies.
-- RPC functions are SECURITY DEFINER and will perform the necessary writes.

-- Minimal grants to public for execution of RPCs
REVOKE ALL ON FUNCTION public.rpc_start_approval(text, uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_approve(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_reject(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_request_revision(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_skip_step(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.rpc_start_approval(text, uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_approve(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_reject(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_request_revision(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rpc_skip_step(uuid, text) TO anon, authenticated, service_role;