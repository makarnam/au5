import { supabase } from '../lib/supabase';
import { emailService } from './emailService';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  entity_type: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string;
  required: boolean;
  status: string;
  completed_at?: string;
  completed_by?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  entity_type: string;
  entity_id: string;
  workflow_id: string;
  current_step: number;
  status: string;
  requested_by: string;
  requested_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  workflow_name?: string;
}

export interface ApprovalRequestStep {
  id: string;
  request_id: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string;
  required: boolean;
  status: 'pending' | 'completed' | 'rejected' | 'revision_required' | 'skipped';
  action_by?: string;
  action_at?: string;
  action?: 'approve' | 'reject' | 'request_revision' | 'skip';
  comments?: string;
  created_at: string;
  updated_at: string;
  assignee_name?: string;
}

export interface WorkflowStats {
  total_workflows: number;
  active_workflows: number;
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  avg_approval_time: number;
  completion_rate: number;
}

export interface WorkflowPerformance {
  workflow_name: string;
  total_requests: number;
  avg_completion_time: number;
  success_rate: number;
  pending_count: number;
}

export interface CreateWorkflowData {
  name: string;
  description: string;
  entity_type: string;
  is_active?: boolean;
}

export interface CreateWorkflowStepData {
  workflow_id: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string;
  required?: boolean;
}

export interface CreateApprovalRequestData {
  entity_type: string;
  entity_id: string;
  workflow_id: string;
  title?: string;
  description?: string;
  priority?: string;
}

export interface UpdateApprovalStepData {
  step_id: string;
  action: 'approve' | 'reject' | 'request_revision' | 'skip';
  comments?: string;
}

class WorkflowService {
  // Workflow Management
  async getWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWorkflowById(id: string): Promise<Workflow | null> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createWorkflow(workflowData: CreateWorkflowData): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .insert([workflowData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Workflow Steps Management
  async getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order');

    if (error) throw error;
    return data || [];
  }

  async createWorkflowStep(stepData: CreateWorkflowStepData): Promise<WorkflowStep> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .insert([{
        ...stepData,
        status: 'pending',
        required: stepData.required ?? true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkflowStep(id: string, updates: Partial<WorkflowStep>): Promise<WorkflowStep> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkflowStep(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_steps')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Approval Requests Management
  async getApprovalRequests(): Promise<ApprovalRequest[]> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        *,
        requester:users!approval_requests_requested_by_fkey(full_name),
        workflow:workflows(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      ...item,
      requester_name: item.requester?.full_name,
      workflow_name: item.workflow?.name
    })) || [];
  }

  async getApprovalRequestById(id: string): Promise<ApprovalRequest | null> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        *,
        requester:users!approval_requests_requested_by_fkey(full_name),
        workflow:workflows(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return data ? {
      ...data,
      requester_name: data.requester?.full_name,
      workflow_name: data.workflow?.name
    } : null;
  }

  async createApprovalRequest(requestData: CreateApprovalRequestData): Promise<ApprovalRequest> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('approval_requests')
      .insert([{
        ...requestData,
        requested_by: user.id,
        status: 'pending_approval',
        current_step: 1
      }])
      .select()
      .single();

    if (error) throw error;

    // Create approval request steps based on workflow
    await this.createApprovalRequestSteps(data.id, requestData.workflow_id);

    // Send email notifications to assignees
    await this.sendWorkflowAssignmentEmails(data.id);

    return data;
  }

  async updateApprovalRequest(id: string, updates: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const { data, error } = await supabase
      .from('approval_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send email notifications based on action
    await this.sendWorkflowStepUpdateEmails(stepId, updateData.action, data);

    return data;
  }

  // Approval Request Steps Management
  async getApprovalRequestSteps(requestId: string): Promise<ApprovalRequestStep[]> {
    const { data, error } = await supabase
      .from('approval_request_steps')
      .select(`
        *,
        assignee:users!approval_request_steps_assignee_id_fkey(full_name)
      `)
      .eq('request_id', requestId)
      .order('step_order');

    if (error) throw error;

    return data?.map(item => ({
      ...item,
      assignee_name: item.assignee?.full_name
    })) || [];
  }

  async createApprovalRequestSteps(requestId: string, workflowId: string): Promise<void> {
    // Get workflow steps
    const workflowSteps = await this.getWorkflowSteps(workflowId);

    // Create approval request steps
    const approvalSteps = workflowSteps.map(step => ({
      request_id: requestId,
      step_order: step.step_order,
      step_name: step.step_name,
      assignee_role: step.assignee_role,
      assignee_id: step.assignee_id,
      status: 'pending' as const,
      required: step.required
    }));

    const { error } = await supabase
      .from('approval_request_steps')
      .insert(approvalSteps);

    if (error) throw error;
  }

  async updateApprovalStep(stepId: string, updateData: UpdateApprovalStepData): Promise<ApprovalRequestStep> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('approval_request_steps')
      .update({
        status: updateData.action === 'approve' ? 'completed' : 
               updateData.action === 'reject' ? 'rejected' : 
               updateData.action === 'request_revision' ? 'revision_required' : 'skipped',
        action_by: user.id,
        action_at: new Date().toISOString(),
        action: updateData.action,
        comments: updateData.comments
      })
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics and Statistics
  async getWorkflowStats(): Promise<WorkflowStats> {
    // Get workflow counts
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select('id, is_active');

    if (workflowError) throw workflowError;

    // Get approval request counts
    const { data: requests, error: requestError } = await supabase
      .from('approval_requests')
      .select('status, created_at, updated_at');

    if (requestError) throw requestError;

    // Calculate statistics
    const totalWorkflows = workflows?.length || 0;
    const activeWorkflows = workflows?.filter(w => w.is_active).length || 0;
    const totalRequests = requests?.length || 0;
    const pendingRequests = requests?.filter(r => r.status === 'pending_approval').length || 0;
    const approvedRequests = requests?.filter(r => r.status === 'approved').length || 0;
    const rejectedRequests = requests?.filter(r => r.status === 'rejected').length || 0;

    // Calculate average approval time
    const completedRequests = requests?.filter(r => r.status === 'approved' || r.status === 'rejected') || [];
    const totalTime = completedRequests.reduce((sum, req) => {
      const created = new Date(req.created_at).getTime();
      const updated = new Date(req.updated_at).getTime();
      return sum + (updated - created);
    }, 0);
    const avgApprovalTime = completedRequests.length > 0 ? totalTime / completedRequests.length / (1000 * 60 * 60) : 0;

    // Calculate completion rate
    const completionRate = totalRequests > 0 ? ((approvedRequests + rejectedRequests) / totalRequests) * 100 : 0;

    return {
      total_workflows: totalWorkflows,
      active_workflows: activeWorkflows,
      total_requests: totalRequests,
      pending_requests: pendingRequests,
      approved_requests: approvedRequests,
      rejected_requests: rejectedRequests,
      avg_approval_time: Math.round(avgApprovalTime * 100) / 100,
      completion_rate: Math.round(completionRate * 100) / 100
    };
  }

  async getWorkflowPerformance(): Promise<WorkflowPerformance[]> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        workflow:workflows(name),
        status,
        created_at,
        updated_at
      `);

    if (error) throw error;

    // Group by workflow and calculate metrics
    const workflowGroups = data?.reduce((acc, item) => {
      const workflowName = item.workflow?.name || 'Unknown';
      if (!acc[workflowName]) {
        acc[workflowName] = {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          totalTime: 0,
          completedCount: 0
        };
      }
      
      acc[workflowName].total++;
      
      if (item.status === 'approved') acc[workflowName].approved++;
      else if (item.status === 'rejected') acc[workflowName].rejected++;
      else if (item.status === 'pending_approval') acc[workflowName].pending++;

      if (item.status === 'approved' || item.status === 'rejected') {
        const created = new Date(item.created_at).getTime();
        const updated = new Date(item.updated_at).getTime();
        acc[workflowName].totalTime += (updated - created);
        acc[workflowName].completedCount++;
      }

      return acc;
    }, {} as Record<string, any>) || {};

    return Object.entries(workflowGroups).map(([name, data]) => ({
      workflow_name: name,
      total_requests: data.total,
      avg_completion_time: data.completedCount > 0 ? 
        Math.round((data.totalTime / data.completedCount / (1000 * 60 * 60)) * 100) / 100 : 0,
      success_rate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
      pending_count: data.pending
    }));
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        id,
        entity_type,
        status,
        created_at,
        requester:users!approval_requests_requested_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      action: 'Approval Request Created',
      entity_type: item.entity_type,
      user_name: item.requester?.full_name || 'Unknown',
      timestamp: item.created_at,
      status: item.status
    })) || [];
  }

  // Utility Methods
  async getUsersByRole(role: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('role', role)
      .order('full_name');

    if (error) throw error;
    return data || [];
  }

  async getActiveWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getPendingApprovalRequests(): Promise<ApprovalRequest[]> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        *,
        requester:users!approval_requests_requested_by_fkey(full_name),
        workflow:workflows(name)
      `)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      ...item,
      requester_name: item.requester?.full_name,
      workflow_name: item.workflow?.name
    })) || [];
  }

  // Email Notification Methods
  private async sendWorkflowAssignmentEmails(requestId: string): Promise<void> {
    try {
      // Get approval request with workflow details
      const request = await this.getApprovalRequestById(requestId);
      if (!request) return;

      // Get workflow steps
      const steps = await this.getApprovalRequestSteps(requestId);

      // Send email to each assignee
      for (const step of steps) {
        if (step.assignee_id && step.status === 'pending') {
          await emailService.sendWorkflowStepAssignmentEmail(
            step.assignee_id,
            request.workflow_name || 'Workflow',
            step.step_name,
            request.entity_type,
            request.entity_id, // This should be entity name, but we have ID
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            'medium',
            `Please review and approve the ${request.entity_type} request.`
          );
        }
      }
    } catch (error) {
      console.error('Error sending workflow assignment emails:', error);
      // Don't throw error to avoid breaking workflow creation
    }
  }

  private async sendWorkflowStepUpdateEmails(stepId: string, action: string, stepData: ApprovalRequestStep): Promise<void> {
    try {
      // Get step details with request info
      const { data: stepWithRequest, error } = await supabase
        .from('approval_request_steps')
        .select(`
          *,
          request:approval_requests(
            entity_type,
            entity_id,
            workflow:workflows(name),
            requester:users!approval_requests_requested_by_fkey(full_name)
          )
        `)
        .eq('id', stepId)
        .single();

      if (error || !stepWithRequest) return;

      const request = stepWithRequest.request;
      const workflowName = request.workflow?.name || 'Workflow';

      // Send completion email to requester
      if (action === 'approve' && request.requester?.id) {
        await emailService.sendWorkflowCompletionEmail(
          request.requester.id,
          workflowName,
          request.entity_type,
          request.entity_id,
          new Date().toISOString(),
          'Completed',
          `Step "${stepData.step_name}" has been approved.`
        );
      }

      // Send rejection email to requester
      if (action === 'reject' && request.requester?.id) {
        await emailService.sendWorkflowEscalationEmail(
          request.requester.id,
          workflowName,
          stepData.step_name,
          request.entity_type,
          request.entity_id,
          stepData.assignee_name || 'Unknown',
          new Date().toISOString(),
          0,
          `Step "${stepData.step_name}" has been rejected. ${stepData.comments || ''}`
        );
      }

    } catch (error) {
      console.error('Error sending workflow step update emails:', error);
      // Don't throw error to avoid breaking workflow updates
    }
  }
}

export const workflowService = new WorkflowService();
export default workflowService;
