import { supabase } from '../lib/supabase';
import {
  RegulatoryChange,
  RegulatoryRequirement,
  ComplianceAction,
  RiskAssessment,
  RiskFactor,
  RegulatoryImpact,
  RegulatoryMonitoring,
  MonitoringAlert,
  RegulatoryDashboard,
  RegulatoryChangeFilter,
  RegulatoryChangeReport
} from '../types/regulatoryChange';

export class RegulatoryChangeService {
  // Regulatory Changes
  async getRegulatoryChanges(filter?: RegulatoryChangeFilter): Promise<RegulatoryChange[]> {
    let query = supabase
      .from('regulatory_changes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }
      if (filter.severity && filter.severity.length > 0) {
        query = query.in('severity', filter.severity);
      }
      if (filter.jurisdiction && filter.jurisdiction.length > 0) {
        query = query.in('jurisdiction', filter.jurisdiction);
      }
      if (filter.changeType && filter.changeType.length > 0) {
        query = query.in('change_type', filter.changeType);
      }
      if (filter.priority && filter.priority.length > 0) {
        query = query.in('priority', filter.priority);
      }
      if (filter.assignedTo) {
        query = query.eq('assigned_to', filter.assignedTo);
      }
      if (filter.dateRange) {
        query = query.gte('publication_date', filter.dateRange.start.toISOString())
                   .lte('publication_date', filter.dateRange.end.toISOString());
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getRegulatoryChangeById(id: string): Promise<RegulatoryChange | null> {
    const { data, error } = await supabase
      .from('regulatory_changes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createRegulatoryChange(change: Omit<RegulatoryChange, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegulatoryChange> {
    const { data, error } = await supabase
      .from('regulatory_changes')
      .insert([change])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRegulatoryChange(id: string, updates: Partial<RegulatoryChange>): Promise<RegulatoryChange> {
    const { data, error } = await supabase
      .from('regulatory_changes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRegulatoryChange(id: string): Promise<void> {
    const { error } = await supabase
      .from('regulatory_changes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Regulatory Requirements
  async getRequirements(regulatoryChangeId: string): Promise<RegulatoryRequirement[]> {
    const { data, error } = await supabase
      .from('regulatory_requirements')
      .select('*')
      .eq('regulatory_change_id', regulatoryChangeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createRequirement(requirement: Omit<RegulatoryRequirement, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegulatoryRequirement> {
    const { data, error } = await supabase
      .from('regulatory_requirements')
      .insert([requirement])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRequirement(id: string, updates: Partial<RegulatoryRequirement>): Promise<RegulatoryRequirement> {
    const { data, error } = await supabase
      .from('regulatory_requirements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Compliance Actions
  async getComplianceActions(regulatoryChangeId?: string): Promise<ComplianceAction[]> {
    let query = supabase
      .from('compliance_actions')
      .select('*')
      .order('due_date', { ascending: true });

    if (regulatoryChangeId) {
      query = query.eq('regulatory_change_id', regulatoryChangeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getOverdueActions(): Promise<ComplianceAction[]> {
    const { data, error } = await supabase
      .from('compliance_actions')
      .select('*')
      .lt('due_date', new Date().toISOString())
      .not('status', 'in', ['completed', 'cancelled'])
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createComplianceAction(action: Omit<ComplianceAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceAction> {
    const { data, error } = await supabase
      .from('compliance_actions')
      .insert([action])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateComplianceAction(id: string, updates: Partial<ComplianceAction>): Promise<ComplianceAction> {
    const { data, error } = await supabase
      .from('compliance_actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Risk Assessments
  async getRiskAssessment(regulatoryChangeId: string): Promise<RiskAssessment | null> {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('regulatory_change_id', regulatoryChangeId)
      .single();

    if (error) throw error;
    return data;
  }

  async createRiskAssessment(assessment: Omit<RiskAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RiskAssessment> {
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert([assessment])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRiskAssessment(id: string, updates: Partial<RiskAssessment>): Promise<RiskAssessment> {
    const { data, error } = await supabase
      .from('risk_assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Risk Factors
  async getRiskFactors(riskAssessmentId: string): Promise<RiskFactor[]> {
    const { data, error } = await supabase
      .from('risk_factors')
      .select('*')
      .eq('risk_assessment_id', riskAssessmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createRiskFactor(factor: Omit<RiskFactor, 'id' | 'createdAt'>): Promise<RiskFactor> {
    const { data, error } = await supabase
      .from('risk_factors')
      .insert([factor])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Regulatory Impacts
  async getRegulatoryImpacts(regulatoryChangeId?: string): Promise<RegulatoryImpact[]> {
    let query = supabase
      .from('regulatory_impacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (regulatoryChangeId) {
      query = query.eq('regulatory_change_id', regulatoryChangeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createRegulatoryImpact(impact: Omit<RegulatoryImpact, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegulatoryImpact> {
    const { data, error } = await supabase
      .from('regulatory_impacts')
      .insert([impact])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Regulatory Monitoring
  async getRegulatoryMonitoring(regulatoryChangeId?: string): Promise<RegulatoryMonitoring[]> {
    let query = supabase
      .from('regulatory_monitoring')
      .select('*')
      .order('created_at', { ascending: false });

    if (regulatoryChangeId) {
      query = query.eq('regulatory_change_id', regulatoryChangeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createRegulatoryMonitoring(monitoring: Omit<RegulatoryMonitoring, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegulatoryMonitoring> {
    const { data, error } = await supabase
      .from('regulatory_monitoring')
      .insert([monitoring])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRegulatoryMonitoring(id: string, updates: Partial<RegulatoryMonitoring>): Promise<RegulatoryMonitoring> {
    const { data, error } = await supabase
      .from('regulatory_monitoring')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Monitoring Alerts
  async getMonitoringAlerts(regulatoryMonitoringId?: string): Promise<MonitoringAlert[]> {
    let query = supabase
      .from('monitoring_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (regulatoryMonitoringId) {
      query = query.eq('regulatory_monitoring_id', regulatoryMonitoringId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getUnreadAlerts(): Promise<MonitoringAlert[]> {
    const { data, error } = await supabase
      .from('monitoring_alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async markAlertAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('monitoring_alerts')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async createMonitoringAlert(alert: Omit<MonitoringAlert, 'id' | 'createdAt'>): Promise<MonitoringAlert> {
    const { data, error } = await supabase
      .from('monitoring_alerts')
      .insert([alert])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Dashboard Data
  async getDashboardData(): Promise<RegulatoryDashboard> {
    const [changes, actions, alerts] = await Promise.all([
      this.getRegulatoryChanges(),
      this.getComplianceActions(),
      this.getUnreadAlerts()
    ]);

    const activeChanges = changes.filter(change => change.status === 'published' || change.status === 'in_review');
    const criticalChanges = changes.filter(change => change.severity === 'critical');
    const overdueActions = await this.getOverdueActions();
    const highPriorityActions = actions.filter(action => action.priority === 'high' || action.priority === 'critical');

    const upcomingDeadlines = changes
      .filter(change => change.complianceDeadline && new Date(change.complianceDeadline) > new Date())
      .sort((a, b) => new Date(a.complianceDeadline!).getTime() - new Date(b.complianceDeadline!).getTime())
      .slice(0, 5);

    const recentChanges = changes.slice(0, 5);

    const totalEffort = changes.reduce((sum, change) => sum + change.estimatedEffort, 0);
    const totalCost = changes.reduce((sum, change) => sum + change.estimatedCost, 0);
    
    const averageRiskScore = changes.length > 0 
      ? changes.reduce((sum, change) => sum + (change.riskAssessment?.riskScore || 0), 0) / changes.length
      : 0;

    const complianceGap = actions.length > 0
      ? actions.reduce((sum, action) => sum + (100 - action.progress), 0) / actions.length
      : 0;

    return {
      totalChanges: changes.length,
      activeChanges: activeChanges.length,
      criticalChanges: criticalChanges.length,
      overdueActions: overdueActions.length,
      complianceRate: actions.length > 0 
        ? actions.reduce((sum, action) => sum + action.progress, 0) / actions.length
        : 0,
      upcomingDeadlines,
      recentChanges,
      highPriorityActions: highPriorityActions.slice(0, 5),
      riskAlerts: alerts.slice(0, 10),
      impactSummary: {
        totalEffort,
        totalCost,
        averageRiskScore,
        complianceGap
      }
    };
  }

  // Risk Assessment
  async assessRegulatoryRisk(regulatoryChangeId: string): Promise<RiskAssessment> {
    const change = await this.getRegulatoryChangeById(regulatoryChangeId);
    if (!change) throw new Error('Regulatory change not found');

    // Calculate risk score based on various factors
    let riskScore = 0;
    let probability = 0;
    const riskFactors: Omit<RiskFactor, 'id' | 'createdAt'>[] = [];

    // Severity factor
    const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };
    const severityScore = severityWeight[change.severity] * 25;
    riskScore += severityScore;

    // Impact level factor
    const impactWeight = { minimal: 1, moderate: 2, significant: 3, major: 4 };
    const impactScore = impactWeight[change.impactLevel] * 20;
    riskScore += impactScore;

    // Timeline factor
    const daysToDeadline = change.complianceDeadline 
      ? Math.max(0, (new Date(change.complianceDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    const timelineScore = Math.max(0, 100 - daysToDeadline);
    riskScore += timelineScore * 0.3;

    // Complexity factor
    const complexityScore = change.requirements.length * 10;
    riskScore += complexityScore;

    // Calculate probability
    probability = Math.min(100, (severityScore + impactScore + timelineScore) / 3);

    // Create risk factors
    riskFactors.push({
      riskAssessmentId: '', // Will be set after assessment creation
      factor: 'Regulatory Severity',
      description: `Regulatory change has ${change.severity} severity level`,
      impact: change.severity,
      probability: severityWeight[change.severity] * 25,
      riskScore: severityScore,
      mitigationStrategy: 'Implement comprehensive compliance program',
      status: 'active'
    });

    riskFactors.push({
      riskAssessmentId: '',
      factor: 'Business Impact',
      description: `Impact level is ${change.impactLevel}`,
      impact: change.impactLevel === 'major' ? 'critical' : change.impactLevel === 'significant' ? 'high' : 'medium',
      probability: impactWeight[change.impactLevel] * 20,
      riskScore: impactScore,
      mitigationStrategy: 'Conduct detailed impact analysis and resource planning',
      status: 'active'
    });

    if (change.complianceDeadline) {
      riskFactors.push({
        riskAssessmentId: '',
        factor: 'Timeline Pressure',
        description: `Compliance deadline is ${daysToDeadline.toFixed(0)} days away`,
        impact: daysToDeadline < 30 ? 'critical' : daysToDeadline < 90 ? 'high' : 'medium',
        probability: timelineScore,
        riskScore: timelineScore * 0.3,
        mitigationStrategy: 'Accelerate implementation timeline and allocate additional resources',
        status: 'active'
      });
    }

    // Create risk assessment
    const assessment: Omit<RiskAssessment, 'id' | 'createdAt' | 'updatedAt'> = {
      regulatoryChangeId,
      overallRisk: riskScore > 75 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low',
      riskFactors: [],
      impactAnalysis: {
        financial: Math.min(100, change.estimatedCost / 1000000 * 10),
        operational: Math.min(100, change.estimatedEffort / 1000 * 5),
        reputational: severityWeight[change.severity] * 25,
        compliance: 100 - (daysToDeadline / 365 * 100),
        strategic: impactWeight[change.impactLevel] * 25
      },
      probability,
      riskScore,
      mitigationStrategies: [
        'Establish dedicated compliance team',
        'Implement monitoring and reporting mechanisms',
        'Develop contingency plans',
        'Regular stakeholder communication'
      ],
      contingencyPlans: [
        'Escalate to senior management if timeline at risk',
        'Engage external consultants if needed',
        'Request deadline extension if justified'
      ],
      monitoringMeasures: [
        'Weekly progress reviews',
        'Monthly compliance assessments',
        'Quarterly risk reviews'
      ],
      reviewFrequency: 'monthly',
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assessedBy: 'System',
      assessmentDate: new Date()
    };

    const createdAssessment = await this.createRiskAssessment(assessment);

    // Create risk factors with proper assessment ID
    const createdFactors = await Promise.all(
      riskFactors.map(factor => 
        this.createRiskFactor({ ...factor, riskAssessmentId: createdAssessment.id })
      )
    );

    return { ...createdAssessment, riskFactors: createdFactors };
  }
}

export const regulatoryChangeService = new RegulatoryChangeService();
