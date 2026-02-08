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
  condition_type?: string;
  condition_expression?: string;
  condition_metadata?: any;
  next_step_id?: string;
  parallel_group?: string;
  is_parallel?: boolean;
  parallel_order?: number;
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

    // Get request details for condition evaluation
    const { data: stepWithRequest } = await supabase
      .from('approval_request_steps')
      .select(`
        request_id,
        step_order,
        request:approval_requests(
          entity_type,
          entity_id,
          workflow_id
        )
      `)
      .eq('id', stepId)
      .single();

    if (stepWithRequest && updateData.action === 'approve') {
      // Evaluate conditions and advance to next step
      await this.advanceWorkflowToNextStep(
        stepWithRequest.request_id,
        stepWithRequest.step_order,
        stepWithRequest.request
      );
    }

    // Send email notifications
    await this.sendWorkflowStepUpdateEmails(stepId, updateData.action, data);

    return data;
  }

  private async advanceWorkflowToNextStep(requestId: string, currentStepOrder: number, requestData: any): Promise<void> {
    try {
      // Get current step details
      const { data: currentStep } = await supabase
        .from('workflow_steps')
        .select('id, workflow_id, parallel_group, is_parallel')
        .eq('workflow_id', requestData.workflow_id)
        .eq('step_order', currentStepOrder)
        .single();

      if (!currentStep) return;

      // Check if this is part of a parallel group
      if (currentStep.parallel_group && currentStep.is_parallel) {
        await this.handleParallelStepCompletion(requestId, currentStep, requestData);
      } else {
        await this.handleSequentialStepCompletion(requestId, currentStepOrder, requestData);
      }
    } catch (error) {
      console.error('Error advancing workflow:', error);
    }
  }

  private async handleParallelStepCompletion(requestId: string, currentStep: any, requestData: any): Promise<void> {
    const { parallel_group, workflow_id } = currentStep;

    // Get all steps in the same parallel group
    const { data: parallelSteps } = await supabase
      .from('workflow_steps')
      .select('id, step_order')
      .eq('workflow_id', workflow_id)
      .eq('parallel_group', parallel_group)
      .eq('is_parallel', true);

    if (!parallelSteps || parallelSteps.length === 0) return;

    // Check if all parallel steps are completed
    const { data: parallelRequestSteps } = await supabase
      .from('approval_request_steps')
      .select('id, status')
      .eq('request_id', requestId)
      .in('step_order', parallelSteps.map(s => s.step_order));

    const allCompleted = parallelRequestSteps?.every(step => step.status === 'completed') || false;

    if (allCompleted) {
      // All parallel steps completed, advance to next sequential step
      const maxStepOrder = Math.max(...parallelSteps.map(s => s.step_order));
      await this.handleSequentialStepCompletion(requestId, maxStepOrder, requestData);
    }
  }

  private async handleSequentialStepCompletion(requestId: string, currentStepOrder: number, requestData: any): Promise<void> {
    // Get entity data for condition evaluation
    const entityData = await this.getEntityData(requestData.entity_type, requestData.entity_id);

    // Get current step details
    const { data: currentStep } = await supabase
      .from('workflow_steps')
      .select('id, workflow_id')
      .eq('workflow_id', requestData.workflow_id)
      .eq('step_order', currentStepOrder)
      .single();

    if (!currentStep) return;

    // Evaluate conditions to determine next step
    const nextStepId = await this.evaluateStepConditions(requestId, currentStep.id, entityData);

    if (nextStepId) {
      // Get next step details
      const { data: nextStepDetails } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('id', nextStepId)
        .single();

      if (nextStepDetails) {
        // Check if next step is parallel
        if (nextStepDetails.is_parallel && nextStepDetails.parallel_group) {
          // Create all parallel steps in the group
          await this.createParallelSteps(requestId, nextStepDetails.parallel_group, requestData.workflow_id);
        } else {
          // Create single sequential step
          await this.createSequentialStep(requestId, nextStepDetails);
        }

        // Update request current step
        await supabase
          .from('approval_requests')
          .update({ current_step: nextStepDetails.step_order })
          .eq('id', requestId);
      }
    } else {
      // No more steps - mark request as completed
      await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          completed_at: new Date().toISOString()
        })
        .eq('id', requestId);
    }
  }

  private async createParallelSteps(requestId: string, parallelGroup: string, workflowId: string): Promise<void> {
    // Get all steps in the parallel group
    const { data: parallelSteps } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('parallel_group', parallelGroup)
      .eq('is_parallel', true)
      .order('parallel_order');

    if (!parallelSteps) return;

    // Create approval request steps for all parallel steps
    const parallelRequestSteps = parallelSteps.map(step => ({
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
      .insert(parallelRequestSteps);

    if (!error) {
      // Send assignment emails for all parallel steps
      await this.sendWorkflowAssignmentEmails(requestId);
    }
  }

  private async createSequentialStep(requestId: string, stepDetails: any): Promise<void> {
    // Check if step already exists
    const { data: existingStep } = await supabase
      .from('approval_request_steps')
      .select('id')
      .eq('request_id', requestId)
      .eq('step_order', stepDetails.step_order)
      .single();

    if (!existingStep) {
      await supabase
        .from('approval_request_steps')
        .insert({
          request_id: requestId,
          step_order: stepDetails.step_order,
          step_name: stepDetails.step_name,
          assignee_role: stepDetails.assignee_role,
          assignee_id: stepDetails.assignee_id,
          status: 'pending',
          required: stepDetails.required
        });

      // Send assignment emails
      await this.sendWorkflowAssignmentEmails(requestId);
    }
  }

  private async getEntityData(entityType: string, entityId: string): Promise<any> {
    // Get entity data based on type for condition evaluation
    try {
      switch (entityType) {
        case 'risk':
          const { data: risk } = await supabase
            .from('risks')
            .select('*')
            .eq('id', entityId)
            .single();
          return risk;
        case 'control':
          const { data: control } = await supabase
            .from('controls')
            .select('*')
            .eq('id', entityId)
            .single();
          return control;
        case 'incident':
          const { data: incident } = await supabase
            .from('incidents')
            .select('*')
            .eq('id', entityId)
            .single();
          return incident;
        default:
          return null;
      }
    } catch {
      return null;
    }
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
        workflow_id,
        status,
        created_at,
        updated_at
      `);

    if (error) throw error;

    // Get workflow names
    const workflowIds = [...new Set(data?.map(item => item.workflow_id) || [])];
    const { data: workflows } = await supabase
      .from('workflows')
      .select('id, name')
      .in('id', workflowIds);

    const workflowMap = new Map(workflows?.map(w => [w.id, w.name]) || []);

    // Group by workflow and calculate metrics
    const workflowGroups = data?.reduce((acc, item) => {
      const workflowName = workflowMap.get(item.workflow_id) || 'Unknown';
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
        requested_by
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get user names
    const userIds = [...new Set(data?.map(item => item.requested_by) || [])];
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds);

    const userMap = new Map(users?.map(u => [u.id, u.full_name]) || []);

    return data?.map(item => ({
      id: item.id,
      action: 'Approval Request Created',
      entity_type: item.entity_type,
      user_name: userMap.get(item.requested_by) || 'Unknown',
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

  // Conditional Workflow Logic
  async evaluateStepConditions(requestId: string, currentStepId: string, entityData?: any): Promise<string | null> {
    // Get current step with conditions
    const { data: step, error } = await supabase
      .from('workflow_steps')
      .select(`
        *,
        conditions:workflow_conditions(*)
      `)
      .eq('id', currentStepId)
      .single();

    if (error || !step) return null;

    // Check step-level conditions first
    if (step.condition_type && step.condition_type !== 'none') {
      const conditionMet = await this.evaluateCondition(step, entityData);
      if (conditionMet && step.next_step_id) {
        return step.next_step_id;
      }
    }

    // Check workflow_conditions table
    if (step.conditions && step.conditions.length > 0) {
      for (const condition of step.conditions) {
        if (condition.is_active) {
          const conditionMet = await this.evaluateWorkflowCondition(condition, entityData);
          if (conditionMet && condition.next_step_id) {
            return condition.next_step_id;
          }
        }
      }
    }

    // Default: next step by order
    const { data: nextStep } = await supabase
      .from('workflow_steps')
      .select('id')
      .eq('workflow_id', step.workflow_id)
      .eq('step_order', step.step_order + 1)
      .single();

    return nextStep?.id || null;
  }

  private async evaluateCondition(step: any, entityData?: any): Promise<boolean> {
    const { condition_type, condition_expression, condition_metadata } = step;

    switch (condition_type) {
      case 'field_value':
        return this.evaluateFieldCondition(condition_expression, entityData);
      case 'approval_status':
        return this.evaluateApprovalCondition(condition_expression, entityData);
      case 'risk_level':
        return this.evaluateRiskCondition(condition_expression, entityData);
      case 'custom':
        return this.evaluateCustomCondition(condition_expression, condition_metadata, entityData);
      default:
        return true; // No condition = always true
    }
  }

  private async evaluateWorkflowCondition(condition: any, entityData?: any): Promise<boolean> {
    const { condition_type, condition_operator, condition_value, condition_metadata } = condition;

    switch (condition_type) {
      case 'field_comparison':
        return this.evaluateFieldComparison(condition_operator, condition_value, entityData);
      case 'approval_result':
        return this.evaluateApprovalResult(condition_operator, condition_value, entityData);
      case 'time_based':
        return this.evaluateTimeBasedCondition(condition_operator, condition_value);
      case 'custom_logic':
        return this.evaluateCustomLogic(condition_metadata, entityData);
      default:
        return true;
    }
  }

  private evaluateFieldCondition(expression: string, entityData?: any): boolean {
    if (!entityData || !expression) return true;

    try {
      // Simple field comparison: "risk_level == 'high'"
      const [field, operator, value] = expression.split(/\s+/);
      const fieldValue = this.getNestedValue(entityData, field);

      switch (operator) {
        case '==': return fieldValue == value.replace(/'/g, '');
        case '!=': return fieldValue != value.replace(/'/g, '');
        case '>': return Number(fieldValue) > Number(value);
        case '<': return Number(fieldValue) < Number(value);
        case '>=': return Number(fieldValue) >= Number(value);
        case '<=': return Number(fieldValue) <= Number(value);
        default: return true;
      }
    } catch {
      return true;
    }
  }

  private evaluateApprovalCondition(expression: string, entityData?: any): boolean {
    if (!entityData || !expression) return true;

    // Check if approval was granted/rejected
    const approvalResult = entityData.approval_result || entityData.status;
    return expression.includes(approvalResult);
  }

  private evaluateRiskCondition(expression: string, entityData?: any): boolean {
    if (!entityData || !expression) return true;

    const riskLevel = entityData.risk_level || entityData.level;
    return expression.includes(riskLevel);
  }

  private evaluateCustomCondition(expression: string, metadata: any, entityData?: any): boolean {
    // Custom logic evaluation - can be extended
    try {
      if (metadata?.script) {
        // Simple eval for custom conditions (use with caution)
        const func = new Function('data', `return ${metadata.script}`);
        return func(entityData) === true;
      }
      return true;
    } catch {
      return true;
    }
  }

  private evaluateFieldComparison(operator: string, value: string, entityData?: any): boolean {
    if (!entityData) return true;

    // Compare entity field with value
    const fieldValue = entityData[value] || value;
    // This is a simplified version - can be extended
    return fieldValue !== undefined;
  }

  private evaluateApprovalResult(operator: string, value: string, entityData?: any): boolean {
    if (!entityData) return true;

    const result = entityData.result || entityData.status;
    return result === value;
  }

  private evaluateTimeBasedCondition(operator: string, value: string): boolean {
    const now = new Date();
    const targetDate = new Date(value);

    switch (operator) {
      case 'before': return now < targetDate;
      case 'after': return now > targetDate;
      case 'equals': return now.getTime() === targetDate.getTime();
      default: return true;
    }
  }

  private evaluateCustomLogic(metadata: any, entityData?: any): boolean {
    // Custom business logic evaluation
    if (metadata?.logic_type === 'and') {
      return metadata.conditions?.every((cond: any) => this.evaluateSimpleCondition(cond, entityData)) || false;
    } else if (metadata?.logic_type === 'or') {
      return metadata.conditions?.some((cond: any) => this.evaluateSimpleCondition(cond, entityData)) || false;
    }
    return true;
  }

  private evaluateSimpleCondition(condition: any, entityData?: any): boolean {
    const fieldValue = this.getNestedValue(entityData, condition.field);
    const compareValue = condition.value;

    switch (condition.operator) {
      case 'equals': return fieldValue == compareValue;
      case 'not_equals': return fieldValue != compareValue;
      case 'greater_than': return Number(fieldValue) > Number(compareValue);
      case 'less_than': return Number(fieldValue) < Number(compareValue);
      case 'contains': return String(fieldValue).includes(compareValue);
      default: return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Workflow Versioning Methods
  async createWorkflowVersion(workflowId: string, versionData: {
    version_name?: string;
    description?: string;
    change_summary?: string;
  }): Promise<any> {
    // Get current workflow and steps
    const workflow = await this.getWorkflowById(workflowId);
    const steps = await this.getWorkflowSteps(workflowId);

    // Get current version number
    const { data: versions } = await supabase
      .from('workflow_versions')
      .select('version_number')
      .eq('workflow_id', workflowId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create version record
    const { data, error } = await supabase
      .from('workflow_versions')
      .insert({
        workflow_id: workflowId,
        version_number: nextVersionNumber,
        version_name: versionData.version_name || `Version ${nextVersionNumber}`,
        description: versionData.description,
        workflow_data: workflow,
        steps_data: steps,
        conditions_data: [], // TODO: Add conditions data
        created_by: user.id,
        change_summary: versionData.change_summary,
        is_active: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkflowVersions(workflowId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('workflow_versions')
      .select(`
        *,
        creator:users!workflow_versions_created_by_fkey(full_name)
      `)
      .eq('workflow_id', workflowId)
      .order('version_number', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      ...item,
      creator_name: item.creator?.full_name || 'Unknown'
    })) || [];
  }

  async activateWorkflowVersion(versionId: string): Promise<void> {
    // Get version details
    const { data: version, error: versionError } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError || !version) throw new Error('Version not found');

    // Deactivate all other versions for this workflow
    await supabase
      .from('workflow_versions')
      .update({ is_active: false })
      .eq('workflow_id', version.workflow_id);

    // Activate this version
    await supabase
      .from('workflow_versions')
      .update({ is_active: true })
      .eq('id', versionId);

    // Restore workflow from version
    await this.restoreWorkflowFromVersion(versionId);
  }

  async restoreWorkflowFromVersion(versionId: string): Promise<void> {
    // Get version data
    const { data: version, error } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error || !version) throw new Error('Version not found');

    // Update workflow
    await supabase
      .from('workflows')
      .update(version.workflow_data)
      .eq('id', version.workflow_id);

    // Delete existing steps
    await supabase
      .from('workflow_steps')
      .delete()
      .eq('workflow_id', version.workflow_id);

    // Restore steps
    if (version.steps_data && version.steps_data.length > 0) {
      const stepsToInsert = version.steps_data.map((step: any) => ({
        ...step,
        id: undefined, // Let it generate new ID
        created_at: undefined,
        updated_at: undefined
      }));

      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;
    }
  }

  async compareWorkflowVersions(versionId1: string, versionId2: string): Promise<any> {
    // Get both versions
    const { data: version1 } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('id', versionId1)
      .single();

    const { data: version2 } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('id', versionId2)
      .single();

    if (!version1 || !version2) throw new Error('One or both versions not found');

    // Compare workflow data
    const workflowChanges = this.compareObjects(version1.workflow_data, version2.workflow_data);

    // Compare steps
    const steps1 = version1.steps_data || [];
    const steps2 = version2.steps_data || [];
    const stepsChanges = this.compareSteps(steps1, steps2);

    return {
      version1: {
        number: version1.version_number,
        name: version1.version_name,
        created_at: version1.created_at
      },
      version2: {
        number: version2.version_number,
        name: version2.version_name,
        created_at: version2.created_at
      },
      changes: {
        workflow: workflowChanges,
        steps: stepsChanges
      }
    };
  }

  private compareObjects(obj1: any, obj2: any): any[] {
    const changes: any[] = [];
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    for (const key of allKeys) {
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          field: key,
          old_value: val1,
          new_value: val2,
          change_type: !val1 ? 'added' : !val2 ? 'removed' : 'modified'
        });
      }
    }

    return changes;
  }

  private compareSteps(steps1: any[], steps2: any[]): any {
    const changes = {
      added: [] as any[],
      removed: [] as any[],
      modified: [] as any[]
    };

    // Create maps for easy lookup
    const steps1Map = new Map(steps1.map(s => [s.step_name || s.id, s]));
    const steps2Map = new Map(steps2.map(s => [s.step_name || s.id, s]));

    // Find added steps
    for (const [key, step] of steps2Map) {
      if (!steps1Map.has(key)) {
        changes.added.push(step);
      }
    }

    // Find removed steps
    for (const [key, step] of steps1Map) {
      if (!steps2Map.has(key)) {
        changes.removed.push(step);
      }
    }

    // Find modified steps
    for (const [key, step1] of steps1Map) {
      const step2 = steps2Map.get(key);
      if (step2) {
        const stepChanges = this.compareObjects(step1, step2);
        if (stepChanges.length > 0) {
          changes.modified.push({
            step_name: key,
            changes: stepChanges
          });
        }
      }
    }

    return changes;
  }

  async deleteWorkflowVersion(versionId: string): Promise<void> {
    // Check if version is active
    const { data: version } = await supabase
      .from('workflow_versions')
      .select('is_active')
      .eq('id', versionId)
      .single();

    if (version?.is_active) {
      throw new Error('Cannot delete active version');
    }

    const { error } = await supabase
      .from('workflow_versions')
      .delete()
      .eq('id', versionId);

    if (error) throw error;
  }

  async getActiveWorkflowVersion(workflowId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  // Dynamic Workflow Creation Methods
  async createDynamicWorkflow(templateId: string, customizations: any): Promise<Workflow> {
    // Get template workflow
    const template = await this.getWorkflowById(templateId);
    if (!template) throw new Error('Template workflow not found');

    // Get template steps
    const templateSteps = await this.getWorkflowSteps(templateId);

    // Create new workflow based on template
    const newWorkflow = await this.createWorkflow({
      name: customizations.name || `${template.name} (Dynamic)`,
      description: customizations.description || template.description,
      entity_type: template.entity_type,
      is_active: true
    });

    // Create customized steps
    for (const templateStep of templateSteps) {
      const customizedStep = this.applyStepCustomizations(templateStep, customizations);
      await this.createWorkflowStep({
        workflow_id: newWorkflow.id,
        step_order: customizedStep.step_order || templateStep.step_order,
        step_name: customizedStep.step_name || templateStep.step_name,
        assignee_role: customizedStep.assignee_role || templateStep.assignee_role,
        assignee_id: customizedStep.assignee_id || templateStep.assignee_id,
        required: customizedStep.required ?? templateStep.required
      });
    }

    return newWorkflow;
  }

  private applyStepCustomizations(templateStep: WorkflowStep, customizations: any): Partial<WorkflowStep> {
    const customized = { ...templateStep };

    // Apply role mappings
    if (customizations.roleMappings && customizations.roleMappings[templateStep.assignee_role]) {
      customized.assignee_role = customizations.roleMappings[templateStep.assignee_role];
    }

    // Apply step name customizations
    if (customizations.stepNames && customizations.stepNames[templateStep.step_name]) {
      customized.step_name = customizations.stepNames[templateStep.step_name];
    }

    // Apply conditional customizations
    if (customizations.conditions && customizations.conditions[templateStep.id]) {
      customized.condition_type = customizations.conditions[templateStep.id].type;
      customized.condition_expression = customizations.conditions[templateStep.id].expression;
      customized.condition_metadata = customizations.conditions[templateStep.id].metadata;
    }

    return customized;
  }

  async modifyWorkflowAtRuntime(workflowId: string, modifications: any): Promise<void> {
    // This allows runtime modifications to active workflows
    const workflow = await this.getWorkflowById(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    // Apply modifications
    if (modifications.addSteps) {
      for (const step of modifications.addSteps) {
        await this.createWorkflowStep({
          workflow_id: workflowId,
          ...step
        });
      }
    }

    if (modifications.updateSteps) {
      for (const update of modifications.updateSteps) {
        await this.updateWorkflowStep(update.stepId, update.changes);
      }
    }

    if (modifications.removeSteps) {
      for (const stepId of modifications.removeSteps) {
        await this.deleteWorkflowStep(stepId);
      }
    }
  }

  async cloneWorkflow(workflowId: string, newName: string): Promise<Workflow> {
    const original = await this.getWorkflowById(workflowId);
    if (!original) throw new Error('Workflow not found');

    const steps = await this.getWorkflowSteps(workflowId);

    // Create clone
    const clone = await this.createWorkflow({
      name: newName,
      description: `${original.description} (Cloned)`,
      entity_type: original.entity_type,
      is_active: false // Start inactive
    });

    // Clone all steps
    for (const step of steps) {
      await this.createWorkflowStep({
        workflow_id: clone.id,
        step_order: step.step_order,
        step_name: step.step_name,
        assignee_role: step.assignee_role,
        assignee_id: step.assignee_id,
        required: step.required
      });
    }

    return clone;
  }

  async getWorkflowTemplates(): Promise<Workflow[]> {
    // Return workflows marked as templates
    return this.getWorkflows(); // For now, return all. Could add template flag later
  }

  async validateWorkflowStructure(workflowId: string): Promise<{ valid: boolean; errors: string[] }> {
    const steps = await this.getWorkflowSteps(workflowId);
    const errors: string[] = [];

    // Check for circular references
    const stepMap = new Map(steps.map(s => [s.id, s]));
    for (const step of steps) {
      if (step.next_step_id && !stepMap.has(step.next_step_id)) {
        errors.push(`Step ${step.step_name} references non-existent next step`);
      }
    }

    // Check parallel groups
    const parallelGroups = steps.filter(s => s.is_parallel);
    const groupCounts = new Map<string, number>();
    parallelGroups.forEach(step => {
      if (step.parallel_group) {
        groupCounts.set(step.parallel_group, (groupCounts.get(step.parallel_group) || 0) + 1);
      }
    });

    // Parallel groups should have at least 2 steps
    for (const [group, count] of groupCounts) {
      if (count < 2) {
        errors.push(`Parallel group ${group} has only ${count} step(s), minimum 2 required`);
      }
    }

    // Check for missing assignees
    const missingAssignees = steps.filter(s => !s.assignee_role && !s.assignee_id);
    if (missingAssignees.length > 0) {
      errors.push(`${missingAssignees.length} steps have no assignee`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
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
