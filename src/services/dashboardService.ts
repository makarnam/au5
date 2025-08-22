import { supabase } from "../lib/supabase";

export interface DashboardMetrics {
  totalAudits: number;
  activeAudits: number;
  totalFindings: number;
  criticalFindings: number;
  totalControls: number;
  effectiveControls: number;
  openRisks: number;
  complianceScore: number;
  auditChange: number;
  riskChange: number;
  controlChange: number;
  complianceChange: number;
  auditTrend: number[];
  riskTrend: number[];
  controlTrend: number[];
  complianceTrend: number[];
}

export interface AuditStatusData {
  name: string;
  value: number;
  color?: string;
}

export interface ComplianceStatus {
  framework: string;
  compliance: number;
  controls: number;
  status: 'compliant' | 'non-compliant' | 'partial';
  lastAssessment: string;
}

export interface MonthlyTrendData {
  month: string;
  audits: number;
  risks: number;
  controls: number;
  findings: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  link: string;
  user: string;
  severity: 'success' | 'critical' | 'info' | 'warning';
}

export interface UpcomingTask {
  id: string;
  title: string;
  type: 'audit' | 'review' | 'assessment' | 'training';
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  progress: number;
  link?: string;
}

export interface RiskHeatmapData {
  probability: number;
  impact: number;
  count: number;
  category: string;
}

export interface ModuleOverview {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    total: number;
    active: number;
    critical: number;
    completed: number;
  };
  icon: any;
  link: string;
}

export interface GRCMetric {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: string;
  lastUpdated: string;
}

export interface EntityRelationship {
  source: string;
  target: string;
  type: 'audit-risk' | 'risk-control' | 'control-compliance' | 'audit-finding' | 'finding-risk';
  strength: number;
  description: string;
  count: number;
}

class DashboardService {
  async getDashboardMetrics(period: string = '30d'): Promise<DashboardMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get audit metrics
      const { data: audits } = await supabase
        .from('audits')
        .select('status, created_at')
        .eq('is_deleted', false);

      // Get risk metrics
      const { data: risks } = await supabase
        .from('risks')
        .select('status, created_at');

      // Get control metrics - use effectiveness instead of status
      const { data: controls } = await supabase
        .from('controls')
        .select('effectiveness, created_at')
        .eq('is_deleted', false);

      // Get findings metrics
      const { data: findings } = await supabase
        .from('findings')
        .select('severity, created_at');

      // Calculate metrics
      const totalAudits = audits?.length || 0;
      const activeAudits = audits?.filter(a => a.status === 'in_progress').length || 0;
      const totalFindings = findings?.length || 0;
      const criticalFindings = findings?.filter(f => f.severity === 'critical').length || 0;
      const totalControls = controls?.length || 0;
      const effectiveControls = controls?.filter(c => c.effectiveness === 'effective').length || 0;
      const openRisks = risks?.filter(r => r.status === 'identified').length || 0;

      // Calculate trends (simplified for now)
      const auditTrend = [12, 15, 18, 22, 25, 28, 30, 32, 35, 38, 40, 42];
      const riskTrend = [45, 48, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75];
      const controlTrend = [120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175];
      const complianceTrend = [75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97];

      return {
        totalAudits,
        activeAudits,
        totalFindings,
        criticalFindings,
        totalControls,
        effectiveControls,
        openRisks,
        complianceScore: 87,
        auditChange: 12,
        riskChange: -5,
        controlChange: 8,
        complianceChange: 3,
        auditTrend,
        riskTrend,
        controlTrend,
        complianceTrend
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getAuditStatusData(): Promise<AuditStatusData[]> {
    try {
      const { data: audits } = await supabase
        .from('audits')
        .select('status')
        .eq('is_deleted', false);

      const statusCounts = audits?.reduce((acc, audit) => {
        acc[audit.status] = (acc[audit.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return [
        { name: 'Planning', value: statusCounts.planning || 0, color: '#fbbf24' },
        { name: 'In Progress', value: statusCounts.in_progress || 0, color: '#3b82f6' },
        { name: 'Review', value: statusCounts.review || 0, color: '#8b5cf6' },
        { name: 'Completed', value: statusCounts.completed || 0, color: '#10b981' },
        { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#ef4444' }
      ];
    } catch (error) {
      console.error('Error fetching audit status data:', error);
      return [];
    }
  }

  async getComplianceData(): Promise<ComplianceStatus[]> {
    try {
      const { data: frameworks } = await supabase
        .from('compliance_frameworks')
        .select('name, created_at');

      return frameworks?.map(framework => ({
        framework: framework.name,
        compliance: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        controls: Math.floor(Math.random() * 50) + 20, // Random controls count
        status: Math.random() > 0.3 ? 'compliant' : 'partial' as any,
        lastAssessment: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })) || [];
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      return [];
    }
  }

  async getMonthlyTrendData(timeframe: string = '30d'): Promise<MonthlyTrendData[]> {
    try {
      // Generate sample trend data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({
        month,
        audits: Math.floor(Math.random() * 20) + 10,
        risks: Math.floor(Math.random() * 30) + 20,
        controls: Math.floor(Math.random() * 50) + 30,
        findings: Math.floor(Math.random() * 15) + 5
      }));
    } catch (error) {
      console.error('Error fetching monthly trend data:', error);
      return [];
    }
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get recent audits
      const { data: recentAudits } = await supabase
        .from('audits')
        .select('id, title, status, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent risks
      const { data: recentRisks } = await supabase
        .from('risks')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent findings
      const { data: recentFindings } = await supabase
        .from('findings')
        .select('id, title, severity, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      recentAudits?.forEach(audit => {
        activities.push({
          id: audit.id,
          title: `Audit "${audit.title}" status changed`,
          description: `Audit status changed to ${audit.status}`,
          timestamp: audit.created_at,
          link: `/audits/${audit.id}`,
          user: 'System',
          severity: audit.status === 'completed' ? 'success' : 'info'
        });
      });

      recentRisks?.forEach(risk => {
        activities.push({
          id: risk.id,
          title: `Risk "${risk.title}" was identified`,
          description: `New risk identified with status ${risk.status}`,
          timestamp: risk.created_at,
          link: `/risks/${risk.id}`,
          user: 'System',
          severity: 'info'
        });
      });

      recentFindings?.forEach(finding => {
        activities.push({
          id: finding.id,
          title: `Finding "${finding.title}" was created`,
          description: `Finding created with ${finding.severity} severity`,
          timestamp: finding.created_at,
          link: `/findings/${finding.id}`,
          user: 'System',
          severity: finding.severity === 'critical' ? 'critical' : 'warning'
        });
      });

      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  async getUpcomingTasks(): Promise<UpcomingTask[]> {
    try {
      // Get upcoming audit schedules
      const { data: upcomingAudits } = await supabase
        .from('audits')
        .select('id, title, start_date, lead_auditor_id')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .lte('start_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(10);

      return upcomingAudits?.map(audit => ({
        id: audit.id,
        title: audit.title,
        type: 'audit',
        dueDate: audit.start_date,
        priority: 'medium' as any,
        assignee: audit.lead_auditor_id || 'Unassigned',
        progress: Math.floor(Math.random() * 100),
        link: `/audits/${audit.id}`
      })) || [];
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      return [];
    }
  }

  async getRiskHeatmapData(): Promise<RiskHeatmapData[]> {
    try {
      const { data: risks } = await supabase
        .from('risks')
        .select('probability, impact, category');

      const heatmapData: Record<string, RiskHeatmapData> = {};

      risks?.forEach(risk => {
        const key = `${risk.probability || 1}-${risk.impact || 1}`;
        if (heatmapData[key]) {
          heatmapData[key].count++;
        } else {
          heatmapData[key] = {
            probability: risk.probability || 1,
            impact: risk.impact || 1,
            count: 1,
            category: risk.category || 'Unknown'
          };
        }
      });

      return Object.values(heatmapData);
    } catch (error) {
      console.error('Error fetching risk heatmap data:', error);
      return [];
    }
  }

  async getModuleOverview(): Promise<ModuleOverview[]> {
    try {
      const modules = [
        { name: 'Audits', table: 'audits', icon: 'FileText', link: '/audits' },
        { name: 'Risks', table: 'risks', icon: 'AlertTriangle', link: '/risks' },
        { name: 'Controls', table: 'controls', icon: 'Shield', link: '/controls' },
        { name: 'Findings', table: 'findings', icon: 'Search', link: '/findings' },
        { name: 'Compliance', table: 'compliance_frameworks', icon: 'CheckCircle', link: '/compliance' },
        { name: 'Documents', table: 'documents', icon: 'FileText', link: '/documents' }
      ];

      const overview: ModuleOverview[] = [];

      for (const module of modules) {
        const { count } = await supabase
          .from(module.table)
          .select('*', { count: 'exact', head: true });

        // Handle different status/effectiveness columns based on table
        let activeCount = 0;
        let criticalCount = 0;
        let completedCount = 0;

        if (module.table === 'audits') {
          const { count: active } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'in_progress')
            .eq('is_deleted', false);
          
          const { count: completed } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed')
            .eq('is_deleted', false);
          
          activeCount = active || 0;
          completedCount = completed || 0;
        } else if (module.table === 'controls') {
          const { count: effective } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('effectiveness', 'effective')
            .eq('is_deleted', false);
          
          activeCount = effective || 0;
        } else if (module.table === 'risks') {
          const { count: identified } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'identified');
          
          const { count: critical } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('risk_level', 'critical');
          
          activeCount = identified || 0;
          criticalCount = critical || 0;
        } else if (module.table === 'findings') {
          const { count: open } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open');
          
          const { count: critical } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('severity', 'critical');
          
          const { count: resolved } = await supabase
            .from(module.table)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'resolved');
          
          activeCount = open || 0;
          criticalCount = critical || 0;
          completedCount = resolved || 0;
        }

        overview.push({
          name: module.name,
          status: (count || 0) > 0 ? 'healthy' : 'critical',
          metrics: {
            total: count || 0,
            active: activeCount,
            critical: criticalCount,
            completed: completedCount
          },
          icon: module.icon,
          link: module.link
        });
      }

      return overview;
    } catch (error) {
      console.error('Error fetching module overview:', error);
      return [];
    }
  }

  async getGRCMetrics(): Promise<GRCMetric[]> {
    try {
      return [
        {
          id: '1',
          title: 'Risk Coverage',
          value: 85,
          target: 90,
          unit: '%',
          trend: 'up',
          status: 'good',
          category: 'Risk Management',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Control Effectiveness',
          value: 78,
          target: 85,
          unit: '%',
          trend: 'up',
          status: 'warning',
          category: 'Control Management',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Compliance Score',
          value: 92,
          target: 95,
          unit: '%',
          trend: 'stable',
          status: 'excellent',
          category: 'Compliance',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Audit Completion',
          value: 67,
          target: 80,
          unit: '%',
          trend: 'down',
          status: 'warning',
          category: 'Audit Management',
          lastUpdated: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching GRC metrics:', error);
      return [];
    }
  }

  async getEntityRelationships(): Promise<EntityRelationship[]> {
    try {
      // Get audit-risk relationships
      const { data: auditRisks } = await supabase
        .from('audits')
        .select('id, title')
        .eq('is_deleted', false)
        .limit(5);

      // Get risk-control relationships
      const { data: riskControls } = await supabase
        .from('risk_controls')
        .select('risk_id, control_id')
        .limit(5);

      // Get control-compliance relationships
      const { data: controlCompliance } = await supabase
        .from('requirement_controls_map')
        .select('control_id, requirement_id')
        .limit(5);

      const relationships: EntityRelationship[] = [];

      // Add audit-risk relationships
      auditRisks?.forEach(audit => {
        relationships.push({
          source: audit.title,
          target: 'Risk Assessment',
          type: 'audit-risk',
          strength: Math.floor(Math.random() * 30) + 70,
          description: 'Audit identifies risks that need assessment',
          count: Math.floor(Math.random() * 10) + 1
        });
      });

      // Add risk-control relationships
      riskControls?.forEach(rc => {
        relationships.push({
          source: 'Risk Management',
          target: 'Control Implementation',
          type: 'risk-control',
          strength: Math.floor(Math.random() * 30) + 70,
          description: 'Risks are mitigated by controls',
          count: Math.floor(Math.random() * 10) + 1
        });
      });

      // Add control-compliance relationships
      controlCompliance?.forEach(cc => {
        relationships.push({
          source: 'Control Framework',
          target: 'Compliance Requirements',
          type: 'control-compliance',
          strength: Math.floor(Math.random() * 30) + 70,
          description: 'Controls satisfy compliance requirements',
          count: Math.floor(Math.random() * 10) + 1
        });
      });

      return relationships;
    } catch (error) {
      console.error('Error fetching entity relationships:', error);
      return [];
    }
  }

  async getCrossModuleData() {
    try {
      // Get data that spans multiple modules
      const [
        { data: auditFindings },
        { data: riskTreatments },
        { data: controlTests }
      ] = await Promise.all([
        supabase
          .from('findings')
          .select('audit_id, severity, status')
          .limit(10),
        supabase
          .from('risk_treatments')
          .select('risk_id, treatment_type, status')
          .limit(10),
        supabase
          .from('control_tests')
          .select('control_id, test_result, test_date')
          .limit(10)
      ]);

      return {
        auditFindings: auditFindings || [],
        riskTreatments: riskTreatments || [],
        controlTests: controlTests || []
      };
    } catch (error) {
      console.error('Error fetching cross-module data:', error);
      return {
        auditFindings: [],
        riskTreatments: [],
        controlTests: []
      };
    }
  }
}

export const dashboardService = new DashboardService();
