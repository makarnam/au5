import { supabase } from '../lib/supabase';

export type WorkflowEntityType = 'audit' | 'finding';

export async function startApproval(opts: { entityType: WorkflowEntityType; entityId: string; workflowId: string }) {
  const { entityType, entityId, workflowId } = opts;
  const { data, error } = await supabase.rpc('rpc_start_approval', {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_workflow_id: workflowId,
  });
  if (error) throw error;
  return data as string; // request_id
}

export async function approve(requestId: string, comments?: string) {
  const { error } = await supabase.rpc('rpc_approve', { p_request_id: requestId, p_comments: comments ?? null });
  if (error) throw error;
}

export async function reject(requestId: string, comments?: string) {
  const { error } = await supabase.rpc('rpc_reject', { p_request_id: requestId, p_comments: comments ?? null });
  if (error) throw error;
}

export async function requestRevision(requestId: string, comments?: string) {
  const { error } = await supabase.rpc('rpc_request_revision', { p_request_id: requestId, p_comments: comments ?? null });
  if (error) throw error;
}

export async function skipStep(requestId: string, comments?: string) {
  const { error } = await supabase.rpc('rpc_skip_step', { p_request_id: requestId, p_comments: comments ?? null });
  if (error) throw error;
}

export async function fetchAvailableWorkflows(entityType: WorkflowEntityType) {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('entity_type', entityType)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchApprovalRequestsForEntity(entityType: WorkflowEntityType, entityId: string) {
  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchApprovalSteps(requestId: string) {
  const { data, error } = await supabase
    .from('approval_request_steps')
    .select('*')
    .eq('request_id', requestId)
    .order('step_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchPendingApprovals() {
  // v_pending_approvals view does not include created_at; order by request_id/step_order instead
  const { data, error } = await supabase
    .from('v_pending_approvals')
    .select('*')
    .order('request_id', { ascending: false })
    .order('step_order', { ascending: true });
  if (error) throw error;
  return data;
}