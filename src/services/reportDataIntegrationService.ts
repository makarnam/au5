import { supabase } from "../lib/supabase";

export interface IntegratedReportData {
  auditData?: {
    audits: any[];
    findings: any[];
    controls: any[];
    objectives: any[];
    team_members: any[];
  };
  riskData?: {
    risks: any[];
    assessments: any[];
    treatments: any[];
    incidents: any[];
    categories: any[];
  };
  complianceData?: {
    frameworks: any[];
    requirements: any[];
    assessments: any[];
    attestations: any[];
    mappings: any[];
  };
  controlData?: {
    controls: any[];
    tests: any[];
    sets: any[];
    mappings: any[];
  };
  summary?: {
    total_audits: number;
    open_findings: number;
    active_risks: number;
    compliance_score: number;
    control_effectiveness: number;
  };
}

export interface DataIntegrationQuery {
  entity_type?: 'audit' | 'risk' | 'finding' | 'control' | 'compliance' | 'general';
  entity_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  filters?: {
    severity?: string[];
    status?: string[];
    business_unit?: string[];
    risk_level?: string[];
    compliance_framework?: string[];
  };
  include_related?: boolean;
  aggregation_level?: 'summary' | 'detailed' | 'raw';
}

export interface CrossModuleCorrelation {
  audit_findings: any[];
  risk_controls: any[];
  compliance_mappings: any[];
  control_effectiveness: any[];
  risk_treatments: any[];
  audit_recommendations: any[];
}

export class ReportDataIntegrationService {
  private static instance: ReportDataIntegrationService;

  static getInstance(): ReportDataIntegrationService {
    if (!ReportDataIntegrationService.instance) {
      ReportDataIntegrationService.instance = new ReportDataIntegrationService();
    }
    return ReportDataIntegrationService.instance;
  }

  async getIntegratedData(query: DataIntegrationQuery): Promise<IntegratedReportData> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const integratedData: IntegratedReportData = {};

    try {
      // Get audit data
      if (!query.entity_type || query.entity_type === 'audit' || query.entity_type === 'general') {
        integratedData.auditData = await this.getAuditData(query);
      }

      // Get risk data
      if (!query.entity_type || query.entity_type === 'risk' || query.entity_type === 'general') {
        integratedData.riskData = await this.getRiskData(query);
      }

      // Get compliance data
      if (!query.entity_type || query.entity_type === 'compliance' || query.entity_type === 'general') {
        integratedData.complianceData = await this.getComplianceData(query);
      }

      // Get control data
      if (!query.entity_type || query.entity_type === 'control' || query.entity_type === 'general') {
        integratedData.controlData = await this.getControlData(query);
      }

      // Generate summary if requested
      if (query.aggregation_level !== 'raw') {
        integratedData.summary = await this.generateSummary(integratedData);
      }

    } catch (error) {
      console.error("Error in data integration:", error);
      throw error;
    }

    return integratedData;
  }

  private async getAuditData(query: DataIntegrationQuery) {
    const auditData: any = {};

    // Build base query
    let auditQuery = supabase
      .from('audits')
      .select(`
        *,
        business_units(name, code),
        lead_auditor:users!lead_auditor_id(first_name, last_name, email),
        audit_objectives(*),
        audit_team_members(users(first_name, last_name, email))
      `);

    // Apply filters
    if (query.entity_id) {
      auditQuery = auditQuery.eq('id', query.entity_id);
    }

    if (query.date_range) {
      auditQuery = auditQuery
        .gte('start_date', query.date_range.start)
        .lte('end_date', query.date_range.end);
    }

    if (query.filters?.business_unit?.length) {
      auditQuery = auditQuery.in('business_unit_id', query.filters.business_unit);
    }

    if (query.filters?.status?.length) {
      auditQuery = auditQuery.in('status', query.filters.status);
    }

    // Execute query
    const { data: audits, error } = await auditQuery.order('created_at', { ascending: false });
    if (error) throw error;
    auditData.audits = audits || [];

    // Get related findings if requested
    if (query.include_related && audits) {
      const auditIds = audits.map((audit: any) => audit.id);
      const { data: findings } = await supabase
        .from('findings')
        .select(`
          *,
          audit:audits(title),
          assigned_to_user:users!assigned_to(first_name, last_name, email)
        `)
        .in('audit_id', auditIds)
        .order('created_at', { ascending: false });

      auditData.findings = findings || [];
    }

    // Get related controls
    if (query.include_related && audits) {
      const auditIds = audits.map((audit: any) => audit.id);
      const { data: controls } = await supabase
        .from('controls')
        .select('*')
        .in('audit_id', auditIds)
        .order('created_at', { ascending: false });

      auditData.controls = controls || [];
    }

    return auditData;
  }

  private async getRiskData(query: DataIntegrationQuery) {
    const riskData: any = {};

    let riskQuery = supabase
      .from('risks')
      .select(`
        *,
        risk_categories(name),
        business_units(name, code),
        owner:users!owner_id(first_name, last_name, email)
      `);

    // Apply filters
    if (query.entity_id) {
      riskQuery = riskQuery.eq('id', query.entity_id);
    }

    if (query.date_range) {
      riskQuery = riskQuery
        .gte('created_at', query.date_range.start)
        .lte('updated_at', query.date_range.end);
    }

    if (query.filters?.business_unit?.length) {
      riskQuery = riskQuery.in('business_unit_id', query.filters.business_unit);
    }

    if (query.filters?.risk_level?.length) {
      riskQuery = riskQuery.in('level', query.filters.risk_level);
    }

    // Execute query
    const { data: risks, error } = await riskQuery.order('created_at', { ascending: false });
    if (error) throw error;
    riskData.risks = risks || [];

    // Get related data if requested
    if (query.include_related && risks) {
      const riskIds = risks.map((risk: any) => risk.id);

      // Risk assessments
      const { data: assessments } = await supabase
        .from('risk_assessments')
        .select('*')
        .in('risk_id', riskIds)
        .order('created_at', { ascending: false });

      riskData.assessments = assessments || [];

      // Risk treatments
      const { data: treatments } = await supabase
        .from('risk_treatments')
        .select('*')
        .in('risk_id', riskIds)
        .order('created_at', { ascending: false });

      riskData.treatments = treatments || [];

      // Risk incidents
      const { data: incidents } = await supabase
        .from('risk_incidents')
        .select('*')
        .in('risk_id', riskIds)
        .order('created_at', { ascending: false });

      riskData.incidents = incidents || [];
    }

    return riskData;
  }

  private async getComplianceData(query: DataIntegrationQuery) {
    const complianceData: any = {};

    // Get compliance frameworks
    let frameworkQuery = supabase
      .from('compliance_frameworks')
      .select('*');

    if (query.filters?.compliance_framework?.length) {
      frameworkQuery = frameworkQuery.in('name', query.filters.compliance_framework);
    }

    const { data: frameworks, error: frameworkError } = await frameworkQuery.order('name');
    if (frameworkError) throw frameworkError;
    complianceData.frameworks = frameworks || [];

    // Get compliance requirements
    const { data: requirements } = await supabase
      .from('compliance_requirements')
      .select(`
        *,
        compliance_frameworks(name)
      `)
      .order('created_at', { ascending: false });

    complianceData.requirements = requirements || [];

    // Get compliance assessments
    const { data: assessments } = await supabase
      .from('compliance_assessments')
      .select(`
        *,
        compliance_frameworks(name),
        users(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    complianceData.assessments = assessments || [];

    // Get compliance attestations
    const { data: attestations } = await supabase
      .from('compliance_attestations')
      .select(`
        *,
        compliance_frameworks(name),
        users(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    complianceData.attestations = attestations || [];

    return complianceData;
  }

  private async getControlData(query: DataIntegrationQuery) {
    const controlData: any = {};

    let controlQuery = supabase
      .from('controls')
      .select('*');

    // Apply filters
    if (query.entity_id) {
      controlQuery = controlQuery.eq('id', query.entity_id);
    }

    if (query.filters?.status?.length) {
      controlQuery = controlQuery.in('status', query.filters.status);
    }

    // Execute query
    const { data: controls, error } = await controlQuery.order('created_at', { ascending: false });
    if (error) throw error;
    controlData.controls = controls || [];

    // Get related data if requested
    if (query.include_related && controls) {
      const controlIds = controls.map((control: any) => control.id);

      // Control tests
      const { data: tests } = await supabase
        .from('control_tests')
        .select('*')
        .in('control_id', controlIds)
        .order('created_at', { ascending: false });

      controlData.tests = tests || [];

      // Control sets
      const { data: sets } = await supabase
        .from('control_sets')
        .select('*')
        .order('created_at', { ascending: false });

      controlData.sets = sets || [];

      // Control mappings
      const { data: mappings } = await supabase
        .from('risk_control_mappings')
        .select('*')
        .in('control_id', controlIds)
        .order('created_at', { ascending: false });

      controlData.mappings = mappings || [];
    }

    return controlData;
  }

  async getCrossModuleCorrelations(query: DataIntegrationQuery): Promise<CrossModuleCorrelation> {
    const correlations: CrossModuleCorrelation = {
      audit_findings: [],
      risk_controls: [],
      compliance_mappings: [],
      control_effectiveness: [],
      risk_treatments: [],
      audit_recommendations: []
    };

    try {
      // Get audit-findings correlations
      const { data: auditFindings } = await supabase
        .from('findings')
        .select(`
          *,
          audit:audits(id, title, status),
          assigned_to_user:users!assigned_to(first_name, last_name, email)
        `)
        .not('audit_id', 'is', null)
        .order('created_at', { ascending: false });

      correlations.audit_findings = auditFindings || [];

      // Get risk-control correlations
      const { data: riskControls } = await supabase
        .from('risk_control_mappings')
        .select(`
          *,
          risk:risks(id, title, level),
          control:controls(id, title, status)
        `)
        .order('created_at', { ascending: false });

      correlations.risk_controls = riskControls || [];

      // Get compliance mappings
      const { data: complianceMappings } = await supabase
        .from('requirement_controls_map')
        .select(`
          *,
          requirement:compliance_requirements(id, title),
          control:controls(id, title, status)
        `)
        .order('created_at', { ascending: false });

      correlations.compliance_mappings = complianceMappings || [];

      // Get control effectiveness data
      const { data: controlEffectiveness } = await supabase
        .from('control_tests')
        .select(`
          *,
          control:controls(id, title, status)
        `)
        .order('created_at', { ascending: false });

      correlations.control_effectiveness = controlEffectiveness || [];

      // Get risk treatments
      const { data: riskTreatments } = await supabase
        .from('risk_treatments')
        .select(`
          *,
          risk:risks(id, title, level)
        `)
        .order('created_at', { ascending: false });

      correlations.risk_treatments = riskTreatments || [];

    } catch (error) {
      console.error("Error getting cross-module correlations:", error);
      throw error;
    }

    return correlations;
  }

  private async generateSummary(data: IntegratedReportData): Promise<IntegratedReportData['summary']> {
    const summary = {
      total_audits: 0,
      open_findings: 0,
      active_risks: 0,
      compliance_score: 0,
      control_effectiveness: 0
    };

    // Calculate totals
    if (data.auditData?.audits) {
      summary.total_audits = data.auditData.audits.length;
    }

    if (data.auditData?.findings) {
      summary.open_findings = data.auditData.findings.filter((f: any) => f.status !== 'closed').length;
    }

    if (data.riskData?.risks) {
      summary.active_risks = data.riskData.risks.filter((r: any) => r.status === 'active').length;
    }

    // Calculate compliance score (simplified)
    if (data.complianceData?.assessments) {
      const totalAssessments = data.complianceData.assessments.length;
      const compliantAssessments = data.complianceData.assessments.filter((a: any) => a.status === 'compliant').length;
      summary.compliance_score = totalAssessments > 0 ? (compliantAssessments / totalAssessments) * 100 : 0;
    }

    // Calculate control effectiveness (simplified)
    if (data.controlData?.tests) {
      const totalTests = data.controlData.tests.length;
      const effectiveTests = data.controlData.tests.filter((t: any) => t.result === 'effective').length;
      summary.control_effectiveness = totalTests > 0 ? (effectiveTests / totalTests) * 100 : 0;
    }

    return summary;
  }

  // Data transformation methods for reports
  transformAuditDataForReport(auditData: any[]): any[] {
    return auditData.map(audit => ({
      id: audit.id,
      title: audit.title,
      status: audit.status,
      start_date: audit.start_date,
      end_date: audit.end_date,
      business_unit: audit.business_units?.name || 'N/A',
      lead_auditor: audit.lead_auditor ? `${audit.lead_auditor.first_name} ${audit.lead_auditor.last_name}` : 'N/A',
      objectives_count: audit.audit_objectives?.length || 0,
      team_members_count: audit.audit_team_members?.length || 0
    }));
  }

  transformRiskDataForReport(riskData: any[]): any[] {
    return riskData.map(risk => ({
      id: risk.id,
      title: risk.title,
      level: risk.level,
      impact: risk.impact,
      likelihood: risk.likelihood,
      score: risk.impact && risk.likelihood ? this.calculateRiskScore(risk.impact, risk.likelihood) : 0,
      status: risk.status,
      category: risk.risk_categories?.name || 'N/A',
      business_unit: risk.business_units?.name || 'N/A',
      owner: risk.owner ? `${risk.owner.first_name} ${risk.owner.last_name}` : 'N/A'
    }));
  }

  transformFindingDataForReport(findingData: any[]): any[] {
    return findingData.map(finding => ({
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
      status: finding.status,
      audit_title: finding.audit?.title || 'N/A',
      assigned_to: finding.assigned_to_user ? `${finding.assigned_to_user.first_name} ${finding.assigned_to_user.last_name}` : 'N/A',
      due_date: finding.due_date,
      description: finding.description
    }));
  }

  transformComplianceDataForReport(complianceData: any[]): any[] {
    return complianceData.map(item => ({
      id: item.id,
      framework_name: item.compliance_frameworks?.name || 'N/A',
      requirement_title: item.title || 'N/A',
      status: item.status || 'N/A',
      due_date: item.due_date,
      description: item.description
    }));
  }

  private calculateRiskScore(impact: string, likelihood: string): number {
    const impactScore = { low: 1, medium: 2, high: 3 }[impact.toLowerCase()] || 1;
    const likelihoodScore = { low: 1, medium: 2, high: 3 }[likelihood.toLowerCase()] || 1;
    return impactScore * likelihoodScore;
  }

  // Method to get data sources for report builder
  async getAvailableDataSources(): Promise<any[]> {
    const dataSources = [];

    // Audit data sources
    dataSources.push({
      id: 'audit_data',
      name: 'Audit Data',
      type: 'database',
      description: 'Comprehensive audit information including findings and controls',
      tables: ['audits', 'findings', 'controls', 'audit_objectives']
    });

    // Risk data sources
    dataSources.push({
      id: 'risk_data',
      name: 'Risk Data',
      type: 'database',
      description: 'Risk register with assessments, treatments, and incidents',
      tables: ['risks', 'risk_assessments', 'risk_treatments', 'risk_incidents']
    });

    // Compliance data sources
    dataSources.push({
      id: 'compliance_data',
      name: 'Compliance Data',
      type: 'database',
      description: 'Compliance frameworks, requirements, and assessments',
      tables: ['compliance_frameworks', 'compliance_requirements', 'compliance_assessments']
    });

    // Control data sources
    dataSources.push({
      id: 'control_data',
      name: 'Control Data',
      type: 'database',
      description: 'Control library with testing and effectiveness data',
      tables: ['controls', 'control_tests', 'control_sets', 'risk_control_mappings']
    });

    return dataSources;
  }
}

// Export singleton instance
export const reportDataIntegrationService = ReportDataIntegrationService.getInstance();
export default reportDataIntegrationService;