import { supabase } from '../lib/supabase';

export interface WorkflowPerformanceMetrics {
  total_workflows: number;
  completed_workflows: number;
  pending_workflows: number;
  average_completion_time_hours: number;
  median_completion_time_hours: number;
  workflow_efficiency_score: number;
  bottleneck_steps: BottleneckStep[];
  completion_trends: CompletionTrend[];
  entity_type_breakdown: EntityTypeBreakdown[];
  step_performance: StepPerformance[];
}

export interface BottleneckStep {
  step_name: string;
  workflow_name: string;
  average_duration_hours: number;
  total_instances: number;
  bottleneck_score: number;
}

export interface CompletionTrend {
  date: string;
  completed_count: number;
  average_duration_hours: number;
}

export interface EntityTypeBreakdown {
  entity_type: string;
  total_workflows: number;
  completed_workflows: number;
  average_completion_time_hours: number;
  success_rate: number;
}

export interface StepPerformance {
  step_name: string;
  total_instances: number;
  average_duration_hours: number;
  completion_rate: number;
  role: string;
}

export interface WorkflowAnalyticsFilters {
  date_from?: string;
  date_to?: string;
  entity_type?: string;
  workflow_id?: string;
  status?: string;
}

class WorkflowAnalyticsService {
  async getWorkflowPerformanceMetrics(filters?: WorkflowAnalyticsFilters): Promise<WorkflowPerformanceMetrics> {
    try {
      // Build the base query
      let query = supabase
        .from('approval_requests')
        .select(`
          id,
          entity_type,
          status,
          requested_at,
          completed_at,
          workflows!inner(
            id,
            name
          ),
          approval_request_steps(
            id,
            step_name,
            step_order,
            assignee_role,
            status,
            action_at,
            created_at
          )
        `);

      // Apply filters
      if (filters?.date_from) {
        query = query.gte('requested_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('requested_at', filters.date_to);
      }
      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters?.workflow_id) {
        query = query.eq('workflow_id', filters.workflow_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data: workflows, error } = await query;

      if (error) {
        console.error('Error fetching workflow data:', error);
        throw new Error(`Failed to fetch workflow data: ${error.message}`);
      }

      if (!workflows || workflows.length === 0) {
        return this.getEmptyMetrics();
      }

      // Calculate metrics
      const totalWorkflows = workflows.length;
      const completedWorkflows = workflows.filter(w => w.status === 'approved' || w.status === 'rejected').length;
      const pendingWorkflows = totalWorkflows - completedWorkflows;

      // Calculate completion times
      const completionTimes = workflows
        .filter(w => w.completed_at && w.requested_at)
        .map(w => {
          const start = new Date(w.requested_at);
          const end = new Date(w.completed_at);
          return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
        });

      const averageCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
        : 0;

      const medianCompletionTime = completionTimes.length > 0
        ? this.calculateMedian(completionTimes)
        : 0;

      // Calculate efficiency score (0-100)
      const efficiencyScore = this.calculateEfficiencyScore(workflows, completionTimes);

      // Calculate bottlenecks
      const bottleneckSteps = this.calculateBottlenecks(workflows);

      // Calculate completion trends (last 30 days)
      const completionTrends = this.calculateCompletionTrends(workflows);

      // Calculate entity type breakdown
      const entityTypeBreakdown = this.calculateEntityTypeBreakdown(workflows);

      // Calculate step performance
      const stepPerformance = this.calculateStepPerformance(workflows);

      return {
        total_workflows: totalWorkflows,
        completed_workflows: completedWorkflows,
        pending_workflows: pendingWorkflows,
        average_completion_time_hours: Math.round(averageCompletionTime * 100) / 100,
        median_completion_time_hours: Math.round(medianCompletionTime * 100) / 100,
        workflow_efficiency_score: Math.round(efficiencyScore * 100) / 100,
        bottleneck_steps: bottleneckSteps,
        completion_trends: completionTrends,
        entity_type_breakdown: entityTypeBreakdown,
        step_performance: stepPerformance
      };
    } catch (error) {
      console.error('Error in getWorkflowPerformanceMetrics:', error);
      throw error;
    }
  }

  async getWorkflowComparisonData(workflowIds: string[]): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          id,
          workflow_id,
          status,
          requested_at,
          completed_at,
          workflows!inner(
            id,
            name
          )
        `)
        .in('workflow_id', workflowIds);

      if (error) throw error;

      // Group by workflow and calculate metrics
      const workflowMetrics = workflowIds.map(id => {
        const workflows = data?.filter(w => w.workflow_id === id) || [];
        const completed = workflows.filter(w => w.status === 'approved' || w.status === 'rejected');
        const avgTime = this.calculateAverageCompletionTime(completed);
        
        return {
          workflow_id: id,
          workflow_name: workflows[0]?.workflows?.name || 'Unknown',
          total_workflows: workflows.length,
          completed_workflows: completed.length,
          average_completion_time: avgTime,
          success_rate: workflows.length > 0 ? (completed.length / workflows.length) * 100 : 0
        };
      });

      return workflowMetrics;
    } catch (error) {
      console.error('Error in getWorkflowComparisonData:', error);
      throw error;
    }
  }

  async getRealTimeWorkflowStatus(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          id,
          entity_type,
          status,
          current_step,
          requested_at,
          workflows!inner(
            id,
            name
          ),
          approval_request_steps(
            id,
            step_name,
            step_order,
            status,
            action_at
          )
        `)
        .eq('status', 'pending_approval')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      return data?.map(workflow => ({
        id: workflow.id,
        entity_type: workflow.entity_type,
        workflow_name: workflow.workflows?.name,
        current_step: workflow.current_step,
        requested_at: workflow.requested_at,
        duration_hours: workflow.requested_at 
          ? (new Date().getTime() - new Date(workflow.requested_at).getTime()) / (1000 * 60 * 60)
          : 0,
        steps: workflow.approval_request_steps
      })) || [];
    } catch (error) {
      console.error('Error in getRealTimeWorkflowStatus:', error);
      throw error;
    }
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  private calculateEfficiencyScore(workflows: any[], completionTimes: number[]): number {
    if (workflows.length === 0) return 0;

    // Factors for efficiency calculation
    const completionRate = workflows.filter(w => w.status === 'approved' || w.status === 'rejected').length / workflows.length;
    const avgTimeScore = completionTimes.length > 0 ? Math.max(0, 1 - (this.calculateMedian(completionTimes) / 168)) : 0; // 168 hours = 1 week
    const stepEfficiency = this.calculateStepEfficiency(workflows);

    // Weighted average
    return (completionRate * 0.4 + avgTimeScore * 0.4 + stepEfficiency * 0.2) * 100;
  }

  private calculateStepEfficiency(workflows: any[]): number {
    let totalSteps = 0;
    let completedSteps = 0;

    workflows.forEach(workflow => {
      if (workflow.approval_request_steps) {
        totalSteps += workflow.approval_request_steps.length;
        completedSteps += workflow.approval_request_steps.filter((step: any) => 
          step.status === 'completed' || step.status === 'skipped'
        ).length;
      }
    });

    return totalSteps > 0 ? completedSteps / totalSteps : 0;
  }

  private calculateBottlenecks(workflows: any[]): BottleneckStep[] {
    const stepDurations: { [key: string]: number[] } = {};

    workflows.forEach(workflow => {
      if (workflow.approval_request_steps) {
        workflow.approval_request_steps.forEach((step: any, index: number) => {
          const stepKey = `${workflow.workflows?.name}-${step.step_name}`;
          if (!stepDurations[stepKey]) {
            stepDurations[stepKey] = [];
          }

          if (step.action_at && step.created_at) {
            const duration = (new Date(step.action_at).getTime() - new Date(step.created_at).getTime()) / (1000 * 60 * 60);
            stepDurations[stepKey].push(duration);
          }
        });
      }
    });

    return Object.entries(stepDurations)
      .map(([stepKey, durations]) => {
        const [workflowName, stepName] = stepKey.split('-');
        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const bottleneckScore = avgDuration * durations.length; // Weight by frequency

        return {
          step_name: stepName,
          workflow_name: workflowName,
          average_duration_hours: Math.round(avgDuration * 100) / 100,
          total_instances: durations.length,
          bottleneck_score: Math.round(bottleneckScore * 100) / 100
        };
      })
      .sort((a, b) => b.bottleneck_score - a.bottleneck_score)
      .slice(0, 5); // Top 5 bottlenecks
  }

  private calculateCompletionTrends(workflows: any[]): CompletionTrend[] {
    const trends: { [key: string]: { count: number; totalTime: number } } = {};

    workflows
      .filter(w => w.completed_at && w.requested_at)
      .forEach(workflow => {
        const date = new Date(workflow.completed_at).toISOString().split('T')[0];
        const duration = (new Date(workflow.completed_at).getTime() - new Date(workflow.requested_at).getTime()) / (1000 * 60 * 60);

        if (!trends[date]) {
          trends[date] = { count: 0, totalTime: 0 };
        }
        trends[date].count++;
        trends[date].totalTime += duration;
      });

    return Object.entries(trends)
      .map(([date, data]) => ({
        date,
        completed_count: data.count,
        average_duration_hours: Math.round((data.totalTime / data.count) * 100) / 100
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  }

  private calculateEntityTypeBreakdown(workflows: any[]): EntityTypeBreakdown[] {
    const breakdown: { [key: string]: any } = {};

    workflows.forEach(workflow => {
      if (!breakdown[workflow.entity_type]) {
        breakdown[workflow.entity_type] = {
          total_workflows: 0,
          completed_workflows: 0,
          total_time: 0,
          completed_count: 0
        };
      }

      breakdown[workflow.entity_type].total_workflows++;

      if (workflow.status === 'approved' || workflow.status === 'rejected') {
        breakdown[workflow.entity_type].completed_workflows++;
        
        if (workflow.completed_at && workflow.requested_at) {
          const duration = (new Date(workflow.completed_at).getTime() - new Date(workflow.requested_at).getTime()) / (1000 * 60 * 60);
          breakdown[workflow.entity_type].total_time += duration;
          breakdown[workflow.entity_type].completed_count++;
        }
      }
    });

    return Object.entries(breakdown).map(([entityType, data]) => ({
      entity_type: entityType,
      total_workflows: data.total_workflows,
      completed_workflows: data.completed_workflows,
      average_completion_time_hours: data.completed_count > 0 
        ? Math.round((data.total_time / data.completed_count) * 100) / 100 
        : 0,
      success_rate: Math.round((data.completed_workflows / data.total_workflows) * 100)
    }));
  }

  private calculateStepPerformance(workflows: any[]): StepPerformance[] {
    const stepStats: { [key: string]: any } = {};

    workflows.forEach(workflow => {
      if (workflow.approval_request_steps) {
        workflow.approval_request_steps.forEach((step: any) => {
          const stepKey = step.step_name;
          if (!stepStats[stepKey]) {
            stepStats[stepKey] = {
              total_instances: 0,
              completed_instances: 0,
              total_duration: 0,
              completed_count: 0,
              role: step.assignee_role
            };
          }

          stepStats[stepKey].total_instances++;

          if (step.status === 'completed') {
            stepStats[stepKey].completed_instances++;
            
            if (step.action_at && step.created_at) {
              const duration = (new Date(step.action_at).getTime() - new Date(step.created_at).getTime()) / (1000 * 60 * 60);
              stepStats[stepKey].total_duration += duration;
              stepStats[stepKey].completed_count++;
            }
          }
        });
      }
    });

    return Object.entries(stepStats).map(([stepName, stats]) => ({
      step_name: stepName,
      total_instances: stats.total_instances,
      average_duration_hours: stats.completed_count > 0 
        ? Math.round((stats.total_duration / stats.completed_count) * 100) / 100 
        : 0,
      completion_rate: Math.round((stats.completed_instances / stats.total_instances) * 100),
      role: stats.role
    }));
  }

  private calculateAverageCompletionTime(workflows: any[]): number {
    const completionTimes = workflows
      .filter(w => w.completed_at && w.requested_at)
      .map(w => {
        const start = new Date(w.requested_at);
        const end = new Date(w.completed_at);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      });

    return completionTimes.length > 0 
      ? Math.round((completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length) * 100) / 100
      : 0;
  }

  private getEmptyMetrics(): WorkflowPerformanceMetrics {
    return {
      total_workflows: 0,
      completed_workflows: 0,
      pending_workflows: 0,
      average_completion_time_hours: 0,
      median_completion_time_hours: 0,
      workflow_efficiency_score: 0,
      bottleneck_steps: [],
      completion_trends: [],
      entity_type_breakdown: [],
      step_performance: []
    };
  }
}

export const workflowAnalyticsService = new WorkflowAnalyticsService();
