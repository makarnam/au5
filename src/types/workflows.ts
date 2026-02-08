/**
 * Workflow module TypeScript types aligned with SQL schema in sql/workflows
 * Enums map 1:1 to Postgres enums to avoid mismatch.
 */

export type UUID = string;

export type WorkflowEntityType = 'audit' | 'finding' | 'control';

export type ApprovalRequestStatus =
  | 'pending_approval'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'revision_required'
  | 'cancelled';

export type ApprovalStepStatus = 'pending' | 'completed' | 'skipped' | 'rejected' | 'revision_required';

export type ApprovalAction = 'approve' | 'reject' | 'request_revision' | 'skip';

// Templates
export interface WorkflowTemplate {
  id: UUID;
  name: string;
  description?: string | null;
  entity_type: WorkflowEntityType;
  is_active: boolean;
  created_by: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStepTemplate {
  id: UUID;
  workflow_id: UUID;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: UUID | null;
  required: boolean;
  status: ApprovalStepStatus;
  completed_at?: string | null;
  completed_by?: UUID | null;
  comments?: string | null;
  created_at: string;
  updated_at: string;
}

// Instances
export interface ApprovalRequest {
  id: UUID;
  entity_type: WorkflowEntityType;
  entity_id: UUID;
  workflow_id: UUID;
  current_step: number;
  status: ApprovalRequestStatus;
  requested_by: UUID | null;
  requested_at: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequestStep {
  id: UUID;
  request_id: UUID;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: UUID | null;
  required: boolean;
  status: ApprovalStepStatus;
  action_by?: UUID | null;
  action_at?: string | null;
  action?: ApprovalAction | null;
  comments?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalActionLog {
  id: UUID;
  request_id: UUID;
  step_id?: UUID | null;
  performer_id: UUID;
  action: ApprovalAction;
  comments?: string | null;
  created_at: string;
}

// Convenience view row
export interface PendingApprovalView {
  step_id: UUID;
  request_id: UUID;
  entity_type: WorkflowEntityType;
  entity_id: UUID;
  request_status: ApprovalRequestStatus;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: UUID | null;
  step_status: ApprovalStepStatus;
  current_step: number;
}

// Payloads
export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  entity_type: WorkflowEntityType;
  is_active?: boolean;
  created_by?: UUID;
  steps?: Array<{
    step_order: number;
    step_name: string;
    assignee_role: string;
    assignee_id?: UUID | null;
    required?: boolean;
  }>;
}

export interface UpdateWorkflowPayload {
  name?: string;
  description?: string | null;
  entity_type?: WorkflowEntityType;
  is_active?: boolean;
  // When provided, full replace of steps for the template
  steps?: Array<{
    id?: UUID; // optional for existing
    step_order: number;
    step_name: string;
    assignee_role: string;
    assignee_id?: UUID | null;
    required?: boolean;
  }>;
}

export interface PaginationParams {
  page?: number; // 1-based
  limit?: number; // default 20
  search?: string;
  entity_type?: WorkflowEntityType;
  status?: ApprovalRequestStatus;
}

export interface StartApprovalPayload {
  entity_type: WorkflowEntityType;
  entity_id: UUID;
  workflow_id: UUID;
}

export interface ApproveRejectPayload {
  request_id: UUID;
  comments?: string;
}
