import { supabase } from '../lib/supabase';
import { FileText, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

export interface DashboardMetrics {
  totalAudits: number;
  activeAudits: number;
  totalFindings: number;
  criticalFindings: number;
  totalControls: number;
  effectiveControls: number;
  totalRisks: number;
  criticalRisks: number;
  complianceScore: number;
  grcScore: number;
}

export interface AuditStatusData {
  name: string;
  value: number;
  color: string;
  link: string;
}

export interface ComplianceStatus {
  framework: string;
  compliance: number;
  controls: number;
  findings: number;
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAssessment: string;
}

export interface MonthlyTrendData {
  month: string;
  audits: number;
  findings: number;
  controls: number;
  risks: number;
  compliance: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  user: string;
  timestamp: string;
  severity: string;
  link: string;
  module: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  assignee: string;
  progress: number;
  module: string;
  link: string;
}

export interface RiskHeatmapData {
  probability: number;
  impact: number;
  count: number;
  category: string;
  color: string;
}

export interface ModuleOverview {
  name: string;
  icon: React.ElementType;
  metrics: {
    total: number;
    active: number;
    critical: number;
    completed: number;
  };
  status: 'healthy' | 'warning' | 'critical';
  link: string;
}

export interface GRCMetric {
  id: string;
  title: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  category: string;
  lastUpdated: string;
}

class DashboardService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get audit metrics
      const { data: auditData, error: auditError } = await supabase
        .from('audits')
        .select('id, status')
        .eq('is_deleted', false);

      if (auditError) throw auditError;

      const totalAudits = auditData?.length || 0;
      const activeAudits = auditData?.filter(audit => 
        ['planning', 'in_progress', 'testing'].includes(audit.status)
      ).length || 0;

      // Get findings metrics
      const { data: findingsData, error: findingsError } = await supabase
        .from('findings')
        .select('id, severity, status');

      if (findingsError) throw findingsError;

      const totalFindings = findingsData?.length || 0;
      const criticalFindings = findingsData?.filter(finding => 
        finding.severity === 'critical' && finding.status !== 'closed'
      ).length || 0;

      // Get controls metrics
      const { data: controlsData, error: controlsError } = await supabase
        .from('controls')
        .select('id, effectiveness')
        .eq('is_deleted', false);

      if (controlsError) throw controlsError;

      const totalControls = controlsData?.length || 0;
      const effectiveControls = controlsData?.filter(control => 
        control.effectiveness === 'effective'
      ).length || 0;

      // Get risks metrics
      const { data: risksData, error: risksError } = await supabase
        .from('risks')
        .select('id, risk_level, status');

      if (risksError) throw risksError;

      const totalRisks = risksData?.length || 0;
      const criticalRisks = risksData?.filter(risk => 
        risk.risk_level === 'critical' && risk.status !== 'mitigated'
      ).length || 0;

      // Calculate compliance score (simplified)
      const complianceScore = Math.round((effectiveControls / Math.max(totalControls, 1)) * 100);

      // Calculate GRC score (simplified)
      const grcScore = Math.round(
        ((totalAudits - criticalFindings) / Math.max(totalAudits, 1)) * 40 +
        (complianceScore * 0.4) +
        ((totalRisks - criticalRisks) / Math.max(totalRisks, 1)) * 20
      );

      return {
        totalAudits,
        activeAudits,
        totalFindings,
        criticalFindings,
        totalControls,
        effectiveControls,
        totalRisks,
        criticalRisks,
        complianceScore,
        grcScore
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getAuditStatusData(): Promise<AuditStatusData[]> {
    try {
      const { data, error } = await supabase
        .from('v_audit_status_dashboard')
        .select('*');

      if (error) throw error;

      const statusColors = {
        'completed': '#10b981',
        'in_progress': '#f59e0b',
        'planning': '#3b82f6',
        'draft': '#6b7280',
        'testing': '#8b5cf6'
      };

      return data?.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
        value: parseInt(item.audit_count),
        color: statusColors[item.status as keyof typeof statusColors] || '#6b7280',
        link: `/audits?status=${item.status}`
      })) || [];
    } catch (error) {
      console.error('Error fetching audit status data:', error);
      throw error;
    }
  }

  async getComplianceData(): Promise<ComplianceStatus[]> {
    try {
      // Get compliance frameworks
      const { data: frameworks, error: frameworksError } = await supabase
        .from('compliance_frameworks')
        .select('*');

      if (frameworksError) throw frameworksError;

      // Get controls for each framework
      const complianceData: ComplianceStatus[] = [];

      for (const framework of frameworks || []) {
        const { data: controls, error: controlsError } = await supabase
          .from('controls')
          .select('id, effectiveness')
          .eq('is_deleted', false);

        if (controlsError) continue;

        const totalControls = controls?.length || 0;
        const effectiveControls = controls?.filter(c => c.effectiveness === 'effective').length || 0;
        const compliance = totalControls > 0 ? Math.round((effectiveControls / totalControls) * 100) : 0;

        // Get findings for this framework
        const { data: findings, error: findingsError } = await supabase
          .from('findings')
          .select('id')
          .eq('status', 'open');

        const totalFindings = findings?.length || 0;

        let status: 'compliant' | 'partial' | 'non-compliant' = 'non-compliant';
        if (compliance >= 90) status = 'compliant';
        else if (compliance >= 70) status = 'partial';

        complianceData.push({
          framework: framework.name,
          compliance,
          controls: totalControls,
          findings: totalFindings,
          status,
          lastAssessment: new Date().toISOString().split('T')[0]
        });
      }

      return complianceData;
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      throw error;
    }
  }

  async getMonthlyTrendData(): Promise<MonthlyTrendData[]> {
    try {
      const { data, error } = await supabase
        .from('v_monthly_audit_metrics')
        .select('*')
        .order('month_year', { ascending: false })
        .limit(12);

      if (error) throw error;

      return data?.map(item => ({
        month: new Date(item.month_year).toLocaleDateString('en-US', { month: 'short' }),
        audits: parseInt(item.audits_created) || 0,
        findings: 0, // Would need to calculate from findings table
        controls: 0, // Would need to calculate from controls table
        risks: 0, // Would need to calculate from risks table
        compliance: 85 // Placeholder
      })).reverse() || [];
    } catch (error) {
      console.error('Error fetching monthly trend data:', error);
      throw error;
    }
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      // Get recent audits
      const { data: audits, error: auditsError } = await supabase
        .from('audits')
        .select('id, title, status, created_at, created_by')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (auditsError) throw auditsError;

      // Get recent findings
      const { data: findings, error: findingsError } = await supabase
        .from('findings')
        .select('id, title, severity, created_at, created_by')
        .order('created_at', { ascending: false })
        .limit(2);

      if (findingsError) throw findingsError;

      const activities: RecentActivity[] = [];

      // Add audit activities
      for (const audit of audits || []) {
        activities.push({
          id: audit.id,
          type: 'audit_created',
          title: `Audit "${audit.title}" created`,
          description: `New audit with status: ${audit.status}`,
          user: 'System', // Would need to join with users table
          timestamp: this.formatTimestamp(audit.created_at),
          severity: 'info',
          link: `/audits/${audit.id}`,
          module: 'audit'
        });
      }

      // Add finding activities
      for (const finding of findings || []) {
        activities.push({
          id: finding.id,
          type: 'finding_created',
          title: `Finding "${finding.title}" created`,
          description: `New finding with severity: ${finding.severity}`,
          user: 'System', // Would need to join with users table
          timestamp: this.formatTimestamp(finding.created_at),
          severity: finding.severity === 'critical' ? 'critical' : 'info',
          link: `/findings/${finding.id}`,
          module: 'findings'
        });
      }

      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  async getUpcomingTasks(): Promise<UpcomingTask[]> {
    try {
      // Get upcoming audit due dates
      const { data: audits, error: auditsError } = await supabase
        .from('audits')
        .select('id, title, end_date, priority')
        .eq('is_deleted', false)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .lte('end_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('end_date', { ascending: true })
        .limit(3);

      if (auditsError) throw auditsError;

      // Get upcoming finding due dates
      const { data: findings, error: findingsError } = await supabase
        .from('findings')
        .select('id, title, due_date, severity')
        .eq('status', 'open')
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(2);

      if (findingsError) throw findingsError;

      const tasks: UpcomingTask[] = [];

      // Add audit tasks
      for (const audit of audits || []) {
        const daysUntilDue = Math.ceil((new Date(audit.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const progress = Math.max(0, Math.min(100, 100 - (daysUntilDue * 10)));

        tasks.push({
          id: audit.id,
          title: `Complete Audit: ${audit.title}`,
          dueDate: audit.end_date,
          priority: audit.priority || 'medium',
          assignee: 'You',
          progress,
          module: 'audits',
          link: `/audits/${audit.id}`
        });
      }

      // Add finding tasks
      for (const finding of findings || []) {
        const daysUntilDue = Math.ceil((new Date(finding.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const progress = Math.max(0, Math.min(100, 100 - (daysUntilDue * 15)));

        tasks.push({
          id: finding.id,
          title: `Remediate Finding: ${finding.title}`,
          dueDate: finding.due_date,
          priority: finding.severity === 'critical' ? 'critical' : 'high',
          assignee: 'You',
          progress,
          module: 'findings',
          link: `/findings/${finding.id}`
        });
      }

      return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      throw error;
    }
  }

  async getRiskHeatmapData(): Promise<RiskHeatmapData[]> {
    try {
      const { data, error } = await supabase
        .from('v_risk_heatmap')
        .select('*');

      if (error) throw error;

      const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b'];

      return data?.map((item, index) => ({
        probability: parseInt(item.probability) || 1,
        impact: parseInt(item.impact) || 1,
        count: parseInt(item.count) || 0,
        category: item.category || 'General',
        color: colors[index % colors.length]
      })) || [];
    } catch (error) {
      console.error('Error fetching risk heatmap data:', error);
      throw error;
    }
  }

  async getModuleOverview(): Promise<ModuleOverview[]> {
    try {
      const metrics = await this.getDashboardMetrics();

      return [
        {
          name: 'Audit Management',
          icon: FileText,
          metrics: {
            total: metrics.totalAudits,
            active: metrics.activeAudits,
            critical: metrics.criticalFindings,
            completed: metrics.totalAudits - metrics.activeAudits
          },
          status: metrics.criticalFindings > 5 ? 'warning' : 'healthy',
          link: '/audits'
        },
        {
          name: 'Risk Management',
          icon: AlertTriangle,
          metrics: {
            total: metrics.totalRisks,
            active: metrics.totalRisks,
            critical: metrics.criticalRisks,
            completed: 0
          },
          status: metrics.criticalRisks > 3 ? 'critical' : metrics.criticalRisks > 1 ? 'warning' : 'healthy',
          link: '/risks'
        },
        {
          name: 'Control Management',
          icon: Shield,
          metrics: {
            total: metrics.totalControls,
            active: metrics.effectiveControls,
            critical: metrics.totalControls - metrics.effectiveControls,
            completed: metrics.effectiveControls
          },
          status: metrics.complianceScore < 70 ? 'critical' : metrics.complianceScore < 85 ? 'warning' : 'healthy',
          link: '/controls'
        },
        {
          name: 'Compliance',
          icon: CheckCircle,
          metrics: {
            total: metrics.totalControls,
            active: metrics.effectiveControls,
            critical: metrics.totalControls - metrics.effectiveControls,
            completed: metrics.effectiveControls
          },
          status: metrics.complianceScore < 70 ? 'critical' : metrics.complianceScore < 85 ? 'warning' : 'healthy',
          link: '/compliance'
        }
      ];
    } catch (error) {
      console.error('Error fetching module overview:', error);
      throw error;
    }
  }

  async getGRCMetrics(): Promise<GRCMetric[]> {
    try {
      const metrics = await this.getDashboardMetrics();

      return [
        {
          id: '1',
          title: 'Overall GRC Score',
          value: metrics.grcScore,
          target: 90,
          status: metrics.grcScore >= 90 ? 'excellent' : metrics.grcScore >= 80 ? 'good' : metrics.grcScore >= 70 ? 'warning' : 'critical',
          trend: 'up',
          category: 'GRC',
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        {
          id: '2',
          title: 'Risk Coverage',
          value: metrics.totalRisks > 0 ? Math.round((metrics.totalRisks - metrics.criticalRisks) / metrics.totalRisks * 100) : 100,
          target: 95,
          status: 'excellent',
          trend: 'stable',
          category: 'Risk',
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        {
          id: '3',
          title: 'Control Effectiveness',
          value: metrics.complianceScore,
          target: 85,
          status: metrics.complianceScore >= 90 ? 'excellent' : metrics.complianceScore >= 80 ? 'good' : metrics.complianceScore >= 70 ? 'warning' : 'critical',
          trend: 'up',
          category: 'Control',
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        {
          id: '4',
          title: 'Compliance Rate',
          value: metrics.complianceScore,
          target: 90,
          status: metrics.complianceScore >= 90 ? 'excellent' : metrics.complianceScore >= 80 ? 'good' : metrics.complianceScore >= 70 ? 'warning' : 'critical',
          trend: 'up',
          category: 'Compliance',
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        {
          id: '5',
          title: 'Audit Completion',
          value: metrics.totalAudits > 0 ? Math.round((metrics.totalAudits - metrics.activeAudits) / metrics.totalAudits * 100) : 0,
          target: 80,
          status: 'good',
          trend: 'up',
          category: 'Audit',
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      ];
    } catch (error) {
      console.error('Error fetching GRC metrics:', error);
      throw error;
    }
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  }
}

export const dashboardService = new DashboardService();
