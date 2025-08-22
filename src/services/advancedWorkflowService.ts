import { supabase } from '../lib/supabase';

export interface WorkflowCondition {
  id?: string;
  workflow_id: string;
  step_id: string;
  condition_name: string;
  condition_type: 'field_value' | 'risk_level' | 'amount_threshold' | 'user_role' | 'custom';
  condition_operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  condition_value: string;
  condition_metadata?: any;
  next_step_id?: string;
  is_active: boolean;
}

export interface BusinessRule {
  id?: string;
  workflow_id: string;
  rule_name: string;
  rule_type: 'condition' | 'action' | 'validation';
  rule_expression: string;
  rule_metadata?: any;
  is_active: boolean;
}

export interface ParallelExecution {
  id?: string;
  approval_request_id: string;
  parallel_group: string;
  step_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  started_at?: string;
  completed_at?: string;
  completed_by?: string;
  execution_order?: number;
}

export interface ConditionalStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string;
  required: boolean;
  condition_type: 'none' | 'field_value' | 'risk_level' | 'amount_threshold' | 'user_role' | 'custom';
  condition_expression?: string;
  condition_metadata?: any;
  next_step_id?: string;
  parallel_group?: string;
  is_parallel: boolean;
  parallel_order?: number;
}

export interface AdvancedWorkflow {
  id: string;
  name: string;
  description?: string;
  entity_type: string;
  is_active: boolean;
  execution_type: 'sequential' | 'parallel' | 'hybrid';
  convergence_step_id?: string;
  business_rules?: any;
  parallel_config?: any;
}

class AdvancedWorkflowService {
  // Business Rule Management
  async createBusinessRule(rule: BusinessRule): Promise<BusinessRule> {
    const { data, error } = await supabase
      .from('workflow_business_rules')
      .insert(rule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBusinessRules(workflowId: string): Promise<BusinessRule[]> {
    const { data, error } = await supabase
      .from('workflow_business_rules')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async updateBusinessRule(id: string, updates: Partial<BusinessRule>): Promise<BusinessRule> {
    const { data, error } = await supabase
      .from('workflow_business_rules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBusinessRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_business_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Workflow Condition Management
  async createWorkflowCondition(condition: WorkflowCondition): Promise<WorkflowCondition> {
    const { data, error } = await supabase
      .from('workflow_conditions')
      .insert(condition)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkflowConditions(workflowId: string): Promise<WorkflowCondition[]> {
    const { data, error } = await supabase
      .from('workflow_conditions')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async getStepConditions(stepId: string): Promise<WorkflowCondition[]> {
    const { data, error } = await supabase
      .from('workflow_conditions')
      .select('*')
      .eq('step_id', stepId)
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async updateWorkflowCondition(id: string, updates: Partial<WorkflowCondition>): Promise<WorkflowCondition> {
    const { data, error } = await supabase
      .from('workflow_conditions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkflowCondition(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_conditions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Parallel Execution Management
  async createParallelExecution(execution: ParallelExecution): Promise<ParallelExecution> {
    const { data, error } = await supabase
      .from('parallel_workflow_executions')
      .insert(execution)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getParallelExecutions(approvalRequestId: string): Promise<ParallelExecution[]> {
    const { data, error } = await supabase
      .from('parallel_workflow_executions')
      .select('*')
      .eq('approval_request_id', approvalRequestId)
      .order('execution_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getParallelGroupExecutions(approvalRequestId: string, parallelGroup: string): Promise<ParallelExecution[]> {
    const { data, error } = await supabase
      .from('parallel_workflow_executions')
      .select('*')
      .eq('approval_request_id', approvalRequestId)
      .eq('parallel_group', parallelGroup)
      .order('execution_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateParallelExecution(id: string, updates: Partial<ParallelExecution>): Promise<ParallelExecution> {
    const { data, error } = await supabase
      .from('parallel_workflow_executions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Advanced Workflow Management
  async getAdvancedWorkflow(workflowId: string): Promise<AdvancedWorkflow> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateAdvancedWorkflow(workflowId: string, updates: Partial<AdvancedWorkflow>): Promise<AdvancedWorkflow> {
    const { data, error } = await supabase
      .from('workflows')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConditionalSteps(workflowId: string): Promise<ConditionalStep[]> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateConditionalStep(stepId: string, updates: Partial<ConditionalStep>): Promise<ConditionalStep> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Business Rule Evaluation Engine
  async evaluateCondition(condition: WorkflowCondition, entityData: any): Promise<boolean> {
    try {
      switch (condition.condition_type) {
        case 'field_value':
          return this.evaluateFieldValue(condition, entityData);
        case 'risk_level':
          return this.evaluateRiskLevel(condition, entityData);
        case 'amount_threshold':
          return this.evaluateAmountThreshold(condition, entityData);
        case 'user_role':
          return this.evaluateUserRole(condition, entityData);
        case 'custom':
          return this.evaluateCustomCondition(condition, entityData);
        default:
          return true;
      }
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  private evaluateFieldValue(condition: WorkflowCondition, entityData: any): boolean {
    const fieldValue = this.getNestedValue(entityData, condition.condition_metadata?.field_path);
    const expectedValue = condition.condition_value;

    switch (condition.condition_operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'contains':
        return String(fieldValue).includes(expectedValue);
      case 'in':
        const values = expectedValue.split(',').map(v => v.trim());
        return values.includes(String(fieldValue));
      default:
        return false;
    }
  }

  private evaluateRiskLevel(condition: WorkflowCondition, entityData: any): boolean {
    const riskLevel = entityData.risk_level || entityData.severity;
    const expectedLevel = condition.condition_value;

    switch (condition.condition_operator) {
      case 'equals':
        return riskLevel === expectedLevel;
      case 'greater_than':
        const riskOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        return riskOrder[riskLevel] > riskOrder[expectedLevel];
      case 'less_than':
        const riskOrder2 = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        return riskOrder2[riskLevel] < riskOrder2[expectedLevel];
      default:
        return false;
    }
  }

  private evaluateAmountThreshold(condition: WorkflowCondition, entityData: any): boolean {
    const amount = parseFloat(entityData.amount || entityData.value || 0);
    const threshold = parseFloat(condition.condition_value);

    switch (condition.condition_operator) {
      case 'greater_than':
        return amount > threshold;
      case 'less_than':
        return amount < threshold;
      case 'equals':
        return amount === threshold;
      default:
        return false;
    }
  }

  private evaluateUserRole(condition: WorkflowCondition, entityData: any): boolean {
    const userRole = entityData.user_role || entityData.role;
    const expectedRole = condition.condition_value;

    switch (condition.condition_operator) {
      case 'equals':
        return userRole === expectedRole;
      case 'in':
        const roles = expectedRole.split(',').map(r => r.trim());
        return roles.includes(userRole);
      default:
        return false;
    }
  }

  private evaluateCustomCondition(condition: WorkflowCondition, entityData: any): boolean {
    try {
      // For custom conditions, we can implement a simple expression evaluator
      // This is a basic implementation - in production, you might want a more robust solution
      const expression = condition.condition_expression;
      if (!expression) return true;

      // Simple variable replacement
      let evalExpression = expression;
      Object.keys(entityData).forEach(key => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        evalExpression = evalExpression.replace(regex, JSON.stringify(entityData[key]));
      });

      // Note: Using eval is generally not recommended for security reasons
      // In production, use a proper expression parser/evaluator
      return eval(evalExpression);
    } catch (error) {
      console.error('Error evaluating custom condition:', error);
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    if (!path) return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Parallel Execution Logic
  async startParallelExecution(approvalRequestId: string, workflowId: string): Promise<void> {
    const workflow = await this.getAdvancedWorkflow(workflowId);
    const steps = await this.getConditionalSteps(workflowId);

    if (workflow.execution_type === 'parallel' || workflow.execution_type === 'hybrid') {
      const parallelGroups = this.groupParallelSteps(steps);
      
      for (const [groupName, groupSteps] of Object.entries(parallelGroups)) {
        for (let i = 0; i < groupSteps.length; i++) {
          const step = groupSteps[i];
          await this.createParallelExecution({
            approval_request_id: approvalRequestId,
            parallel_group: groupName,
            step_id: step.id,
            status: 'pending',
            execution_order: i + 1
          });
        }
      }
    }
  }

  private groupParallelSteps(steps: ConditionalStep[]): Record<string, ConditionalStep[]> {
    const groups: Record<string, ConditionalStep[]> = {};
    
    steps.forEach(step => {
      if (step.is_parallel && step.parallel_group) {
        if (!groups[step.parallel_group]) {
          groups[step.parallel_group] = [];
        }
        groups[step.parallel_group].push(step);
      }
    });

    return groups;
  }

  async checkParallelGroupCompletion(approvalRequestId: string, parallelGroup: string): Promise<boolean> {
    const executions = await this.getParallelGroupExecutions(approvalRequestId, parallelGroup);
    return executions.every(exec => exec.status === 'completed');
  }

  async getNextStep(workflowId: string, currentStepId: string, entityData: any): Promise<string | null> {
    const conditions = await this.getStepConditions(currentStepId);
    
    for (const condition of conditions) {
      const isMet = await this.evaluateCondition(condition, entityData);
      if (isMet && condition.next_step_id) {
        return condition.next_step_id;
      }
    }

    // If no conditions are met, return the next sequential step
    const steps = await this.getConditionalSteps(workflowId);
    const currentStepIndex = steps.findIndex(s => s.id === currentStepId);
    if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
      return steps[currentStepIndex + 1].id;
    }

    return null;
  }
}

export const advancedWorkflowService = new AdvancedWorkflowService();
