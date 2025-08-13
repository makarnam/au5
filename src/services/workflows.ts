import { supabase } from '../lib/supabase';
import type {
  UUID,
  WorkflowTemplate,
  WorkflowStepTemplate,
  ApprovalRequest,
  ApprovalRequestStep,
  ApprovalActionLog,
  PendingApprovalView,
  PaginationParams,
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  StartApprovalPayload,
  ApproveRejectPayload,
  WorkflowEntityType,
} from '../types/workflows';

type QueryResult<T> = { data: T | null; error: any | null };

const paginate = (params?: PaginationParams) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to, search: params?.search };
};

/**
 * Workflows (templates)
 */
export async function listWorkflows(params?: PaginationParams): Promise<QueryResult<WorkflowTemplate[]>> {
  const { from, to, search } = paginate(params);
  let query = supabase.from('workflows').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);

  if (params?.entity_type) {
    query = query.eq('entity_type', params.entity_type);
  }
  if (typeof params?.search === 'string' && params.search.trim() !== '') {
    query = query.ilike('name', `%${search}%`);
  }
  const { data, error } = await query;
  return { data, error };
}

// Alias for backward compatibility
export const getWorkflows = listWorkflows;

export async function getWorkflow(id: UUID): Promise<QueryResult<WorkflowTemplate & { steps: WorkflowStepTemplate[] }>> {
  const { data: wf, error } = await supabase.from('workflows').select('*').eq('id', id).single();
  if (error || !wf) return { data: null, error };
  const { data: steps, error: stepsErr } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', id)
    .order('step_order', { ascending: true });
  if (stepsErr) return { data: null, error: stepsErr };
  return { data: { ...(wf as WorkflowTemplate), steps: (steps || []) as WorkflowStepTemplate[] }, error: null };
}

export async function createWorkflow(payload: CreateWorkflowPayload): Promise<QueryResult<WorkflowTemplate & { steps: WorkflowStepTemplate[] }>> {
  // Create workflow
  const insertPayload = {
    name: payload.name,
    description: payload.description ?? null,
    entity_type: payload.entity_type,
    is_active: payload.is_active ?? true,
    created_by: payload.created_by ?? null,
  };
  const { data: wfRows, error: wfErr } = await supabase.from('workflows').insert(insertPayload).select('*').limit(1);
  if (wfErr || !wfRows || wfRows.length === 0) return { data: null, error: wfErr || new Error('Failed to create workflow') };
  const wf = wfRows[0] as WorkflowTemplate;

  // Optionally insert steps
  let steps: WorkflowStepTemplate[] = [];
  if (payload.steps && payload.steps.length > 0) {
    const stepRows = payload.steps.map((s) => ({
      workflow_id: wf.id,
      step_order: s.step_order,
      step_name: s.step_name,
      assignee_role: s.assignee_role,
      assignee_id: s.assignee_id ?? null,
      required: s.required ?? true,
      status: 'pending' as const,
    }));
    const { data: insSteps, error: stepErr } = await supabase.from('workflow_steps').insert(stepRows).select('*');
    if (stepErr) return { data: null, error: stepErr };
    steps = (insSteps || []) as WorkflowStepTemplate[];
  } else {
    steps = [];
  }

  return { data: { ...wf, steps }, error: null };
}

export async function updateWorkflow(id: UUID, payload: UpdateWorkflowPayload): Promise<QueryResult<WorkflowTemplate & { steps: WorkflowStepTemplate[] }>> {
  const updatePayload: Partial<WorkflowTemplate> = {};
  if (payload.name !== undefined) updatePayload.name = payload.name;
  if (payload.description !== undefined) updatePayload.description = payload.description;
  if (payload.entity_type !== undefined) updatePayload.entity_type = payload.entity_type as WorkflowEntityType;
  if (payload.is_active !== undefined) updatePayload.is_active = payload.is_active;

  if (Object.keys(updatePayload).length > 0) {
    const { error: upErr } = await supabase.from('workflows').update(updatePayload).eq('id', id);
    if (upErr) return { data: null, error: upErr };
  }

  // Replace steps if provided
  if (payload.steps) {
    // Strategy: delete existing, reinsert supplied list
    const { error: delErr } = await supabase.from('workflow_steps').delete().eq('workflow_id', id);
    if (delErr) return { data: null, error: delErr };
    if (payload.steps.length > 0) {
      const stepRows = payload.steps.map((s) => ({
        workflow_id: id,
        step_order: s.step_order,
        step_name: s.step_name,
        assignee_role: s.assignee_role,
        assignee_id: s.assignee_id ?? null,
        required: s.required ?? true,
        status: 'pending' as const,
      }));
      const { error: insErr } = await supabase.from('workflow_steps').insert(stepRows);
      if (insErr) return { data: null, error: insErr };
    }
  }

  return await getWorkflow(id);
}

export async function deleteWorkflow(id: UUID): Promise<QueryResult<null>> {
  // Cascade will remove steps via FK ON DELETE CASCADE
  const { error } = await supabase.from('workflows').delete().eq('id', id);
  return { data: error ? null : null, error };
}

/**
 * Instances and actions
 */
export async function startWorkflow(payload: StartApprovalPayload): Promise<QueryResult<{ request_id: UUID }>> {
  // Calls RPC wrapper which uses SECURITY DEFINER
  const { data, error } = await supabase.rpc('rpc_start_approval', {
    p_entity_type: payload.entity_type,
    p_entity_id: payload.entity_id,
    p_workflow_id: payload.workflow_id,
  });
  if (error) return { data: null, error };
  return { data: { request_id: data as UUID }, error: null };
}

export async function getInstances(params?: PaginationParams): Promise<QueryResult<ApprovalRequest[]>> {
  const { from, to } = paginate(params);
  let query = supabase.from('approval_requests').select('*').order('created_at', { ascending: false }).range(from, to);
  if (params?.status) query = query.eq('status', params.status);
  if (params?.entity_type) query = query.eq('entity_type', params.entity_type);
  const { data, error } = await query;
  return { data: data as ApprovalRequest[] | null, error };
}

export async function getInstance(id: UUID): Promise<QueryResult<ApprovalRequest & { steps: ApprovalRequestStep[]; actions: ApprovalActionLog[] }>> {
  const { data: req, error } = await supabase.from('approval_requests').select('*').eq('id', id).single();
  if (error || !req) return { data: null, error };

  const [{ data: steps, error: stepsErr }, { data: actions, error: actErr }] = await Promise.all([
    supabase.from('approval_request_steps').select('*').eq('request_id', id).order('step_order', { ascending: true }),
    supabase.from('approval_actions').select('*').eq('request_id', id).order('created_at', { ascending: true }),
  ]);
  if (stepsErr) return { data: null, error: stepsErr };
  if (actErr) return { data: null, error: actErr };

  return {
    data: {
      ...(req as ApprovalRequest),
      steps: (steps || []) as ApprovalRequestStep[],
      actions: (actions || []) as ApprovalActionLog[],
    },
    error: null,
  };
}

export async function approveStep(payload: ApproveRejectPayload): Promise<QueryResult<null>> {
  const { error } = await supabase.rpc('rpc_approve', {
    p_request_id: payload.request_id,
    p_comments: payload.comments ?? null,
  });
  return { data: null, error };
}

export async function rejectStep(payload: ApproveRejectPayload): Promise<QueryResult<null>> {
  const { error } = await supabase.rpc('rpc_reject', {
    p_request_id: payload.request_id,
    p_comments: payload.comments ?? null,
  });
  return { data: null, error };
}

export async function requestRevision(payload: ApproveRejectPayload): Promise<QueryResult<null>> {
  const { error } = await supabase.rpc('rpc_request_revision', {
    p_request_id: payload.request_id,
    p_comments: payload.comments ?? null,
  });
  return { data: null, error };
}

export async function skipStep(payload: ApproveRejectPayload): Promise<QueryResult<null>> {
  const { error } = await supabase.rpc('rpc_skip_step', {
    p_request_id: payload.request_id,
    p_comments: payload.comments ?? null,
  });
  return { data: null, error };
}

/**
 * Derived views/queries
 */
export async function getMyTasks(): Promise<QueryResult<PendingApprovalView[]>> {
  // v_pending_approvals already filters by pending step; RLS limits visibility
  const { data, error } = await supabase.from('v_pending_approvals').select('*').order('step_order', { ascending: true });
  return { data: data as PendingApprovalView[] | null, error };
}

// Workflow step management functions
export async function getWorkflowSteps(workflowId: UUID): Promise<QueryResult<WorkflowStepTemplate[]>> {
  const { data, error } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('step_order', { ascending: true });
  return { data: data as WorkflowStepTemplate[] | null, error };
}

export async function createWorkflowStep(step: Partial<WorkflowStepTemplate>): Promise<QueryResult<WorkflowStepTemplate>> {
  const { data, error } = await supabase
    .from('workflow_steps')
    .insert(step)
    .select('*')
    .single();
  return { data: data as WorkflowStepTemplate | null, error };
}

export async function updateWorkflowStep(stepId: UUID, updates: Partial<WorkflowStepTemplate>): Promise<QueryResult<WorkflowStepTemplate>> {
  const { data, error } = await supabase
    .from('workflow_steps')
    .update(updates)
    .eq('id', stepId)
    .select('*')
    .single();
  return { data: data as WorkflowStepTemplate | null, error };
}

export async function deleteWorkflowStep(stepId: UUID): Promise<QueryResult<null>> {
  const { error } = await supabase
    .from('workflow_steps')
    .delete()
    .eq('id', stepId);
  return { data: null, error };
}
