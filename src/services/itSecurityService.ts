import { supabase } from '../lib/supabase';
import {
  ITSecurityIncident,
  ITSecurityIncidentFormData,
  ITSecurityPolicy,
  ITSecurityPolicyFormData,
  ITSecurityVulnerability,
  ITSecurityVulnerabilityFormData,
  ITRiskAssessment,
  ITRiskAssessmentFormData,
  ITControl,
  ITControlFormData,
  PCICompliance,
  PCIComplianceFormData,
  ISMSManagement,
  ISMSManagementFormData,
  CMMCManagement,
  CMMCManagementFormData,
  ITControlTest,
  ITControlTestFormData,
  ITSecurityMonitoring,
  ITSecurityMonitoringFormData,
  ITSecurityAlert,
  ITSecurityAlertFormData,
  ITSecurityAsset,
  ITSecurityAssetFormData,
  ITSecurityDashboardMetrics,
  ITSecuritySearchParams,
  PaginatedResponse
} from '../types/itSecurity';

// Incident Management
export const itSecurityIncidentService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITSecurityIncident>> {
    let query = supabase
      .from('it_security_incidents')
      .select(`
        *,
        assigned_to_user:users!assigned_to(first_name, last_name, email),
        incident_manager:users!incident_manager_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,incident_number.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.severity?.length) {
      query = query.in('severity', params.filters.severity);
    }

    if (params?.filters?.priority?.length) {
      query = query.in('priority', params.filters.priority);
    }

    if (params?.filters?.type?.length) {
      query = query.in('incident_type', params.filters.type);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('assigned_to', params.filters.assigned_to);
    }

    if (params?.filters?.date_range) {
      query = query.gte('detected_at', params.filters.date_range.start)
                   .lte('detected_at', params.filters.date_range.end);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITSecurityIncident> {
    const { data, error } = await supabase
      .from('it_security_incidents')
      .select(`
        *,
        assigned_to_user:users!assigned_to(first_name, last_name, email),
        incident_manager:users!incident_manager_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITSecurityIncidentFormData): Promise<ITSecurityIncident> {
    const incidentNumber = `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('it_security_incidents')
      .insert({
        ...formData,
        incident_number: incidentNumber,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITSecurityIncidentFormData>): Promise<ITSecurityIncident> {
    const { data, error } = await supabase
      .from('it_security_incidents')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_security_incidents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<ITSecurityIncident> {
    const updateData: any = { status };
    
    if (status === 'contained') {
      updateData.contained_at = new Date().toISOString();
    } else if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    } else if (status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('it_security_incidents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Policy Management
export const itSecurityPolicyService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITSecurityPolicy>> {
    let query = supabase
      .from('it_security_policies')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        approver:users!approver_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,policy_code.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.type?.length) {
      query = query.in('policy_type', params.filters.type);
    }

    if (params?.filters?.category?.length) {
      query = query.in('category', params.filters.category);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITSecurityPolicy> {
    const { data, error } = await supabase
      .from('it_security_policies')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        approver:users!approver_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITSecurityPolicyFormData): Promise<ITSecurityPolicy> {
    const { data, error } = await supabase
      .from('it_security_policies')
      .insert({
        ...formData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITSecurityPolicyFormData>): Promise<ITSecurityPolicy> {
    const { data, error } = await supabase
      .from('it_security_policies')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_security_policies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, approvalStatus?: string): Promise<ITSecurityPolicy> {
    const updateData: any = { status };
    if (approvalStatus) {
      updateData.approval_status = approvalStatus;
    }

    const { data, error } = await supabase
      .from('it_security_policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Vulnerability Management
export const itSecurityVulnerabilityService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITSecurityVulnerability>> {
    let query = supabase
      .from('it_security_vulnerabilities')
      .select(`
        *,
        assigned_to_user:users!assigned_to(first_name, last_name, email),
        owner:users!owner_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,vulnerability_id.ilike.%${params.query}%,cve_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.severity?.length) {
      query = query.in('severity', params.filters.severity);
    }

    if (params?.filters?.priority?.length) {
      query = query.in('priority', params.filters.priority);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITSecurityVulnerability> {
    const { data, error } = await supabase
      .from('it_security_vulnerabilities')
      .select(`
        *,
        assigned_to_user:users!assigned_to(first_name, last_name, email),
        owner:users!owner_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITSecurityVulnerabilityFormData): Promise<ITSecurityVulnerability> {
    const { data, error } = await supabase
      .from('it_security_vulnerabilities')
      .insert({
        ...formData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITSecurityVulnerabilityFormData>): Promise<ITSecurityVulnerability> {
    const { data, error } = await supabase
      .from('it_security_vulnerabilities')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_security_vulnerabilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, remediationStatus?: string): Promise<ITSecurityVulnerability> {
    const updateData: any = { status };
    if (remediationStatus) {
      updateData.remediation_status = remediationStatus;
    }

    if (status === 'patched') {
      updateData.patched_date = new Date().toISOString();
    } else if (status === 'verified') {
      updateData.verified_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('it_security_vulnerabilities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Dashboard Metrics
export const itSecurityDashboardService = {
  async getMetrics(): Promise<ITSecurityDashboardMetrics> {
    const [
      incidentsResult,
      vulnerabilitiesResult,
      policiesResult,
      controlsResult,
      assetsResult,
      pciResult,
      ismsResult,
      cmmcResult,
      alertsResult
    ] = await Promise.all([
      supabase.from('it_security_incidents').select('*'),
      supabase.from('it_security_vulnerabilities').select('*'),
      supabase.from('it_security_policies').select('*'),
      supabase.from('it_controls').select('*'),
      supabase.from('it_security_assets').select('*'),
      supabase.from('pci_compliance').select('*'),
      supabase.from('isms_management').select('*'),
      supabase.from('cmmc_management').select('*'),
      supabase.from('it_security_alerts').select('*')
    ]);

    const incidents = incidentsResult.data || [];
    const vulnerabilities = vulnerabilitiesResult.data || [];
    const policies = policiesResult.data || [];
    const controls = controlsResult.data || [];
    const assets = assetsResult.data || [];
    const pciAssessments = pciResult.data || [];
    const ismsPrograms = ismsResult.data || [];
    const cmmcPrograms = cmmcResult.data || [];
    const alerts = alertsResult.data || [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metrics: ITSecurityDashboardMetrics = {
      total_incidents: incidents.length,
      open_incidents: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
      critical_incidents: incidents.filter(i => i.severity === 'critical').length,
      resolved_incidents_30d: incidents.filter(i => 
        i.resolved_at && new Date(i.resolved_at) >= thirtyDaysAgo
      ).length,
      total_vulnerabilities: vulnerabilities.length,
      high_critical_vulnerabilities: vulnerabilities.filter(v => 
        v.severity === 'high' || v.severity === 'critical'
      ).length,
      patched_vulnerabilities_30d: vulnerabilities.filter(v => 
        v.patched_date && new Date(v.patched_date) >= thirtyDaysAgo
      ).length,
      total_policies: policies.length,
      active_policies: policies.filter(p => p.status === 'active').length,
      policies_due_review: policies.filter(p => 
        p.next_review_date && new Date(p.next_review_date) <= new Date()
      ).length,
      total_controls: controls.length,
      implemented_controls: controls.filter(c => 
        c.implementation_status === 'implemented' || c.implementation_status === 'operational'
      ).length,
      effective_controls: controls.filter(c => c.effectiveness === 'effective').length,
      total_assets: assets.length,
      critical_assets: assets.filter(a => a.criticality === 'critical').length,
      assets_with_vulnerabilities: assets.filter(a => a.risk_score && a.risk_score > 5).length,
      pci_compliance_score: pciAssessments.length > 0 ? 
        pciAssessments.reduce((sum, p) => sum + (p.compliance_score || 0), 0) / pciAssessments.length : 0,
      isms_certification_status: ismsPrograms.length > 0 ? 
        ismsPrograms[0].certification_status : 'not_certified',
      cmmc_current_level: cmmcPrograms.length > 0 ? 
        cmmcPrograms[0].current_level : 1,
      security_alerts_24h: alerts.filter(a => 
        new Date(a.alert_time) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      false_positive_rate: alerts.length > 0 ? 
        (alerts.filter(a => a.false_positive).length / alerts.length) * 100 : 0
    };

    return metrics;
  }
};

// IT Risk Assessment Service
export const itRiskAssessmentService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITRiskAssessment>> {
    let query = supabase
      .from('it_risk_assessments')
      .select(`
        *,
        assessor:users!assessor_id(first_name, last_name, email),
        reviewer:users!reviewer_id(first_name, last_name, email),
        approver:users!approver_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,assessment_number.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.type?.length) {
      query = query.in('assessment_type', params.filters.type);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('assessor_id', params.filters.assigned_to);
    }

    if (params?.filters?.date_range) {
      query = query.gte('start_date', params.filters.date_range.start)
                   .lte('start_date', params.filters.date_range.end);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITRiskAssessment> {
    const { data, error } = await supabase
      .from('it_risk_assessments')
      .select(`
        *,
        assessor:users!assessor_id(first_name, last_name, email),
        reviewer:users!reviewer_id(first_name, last_name, email),
        approver:users!approver_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITRiskAssessmentFormData): Promise<ITRiskAssessment> {
    const { data, error } = await supabase
      .from('it_risk_assessments')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITRiskAssessmentFormData>): Promise<ITRiskAssessment> {
    const { data, error } = await supabase
      .from('it_risk_assessments')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_risk_assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, completedDate?: string): Promise<ITRiskAssessment> {
    const updateData: any = { status };
    if (completedDate) {
      updateData.completed_date = completedDate;
    }

    const { data, error } = await supabase
      .from('it_risk_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// IT Control Service
export const itControlService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITControl>> {
    let query = supabase
      .from('it_controls')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        tester:users!tester_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,control_code.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('implementation_status', params.filters.status);
    }

    if (params?.filters?.type?.length) {
      query = query.in('control_type', params.filters.type);
    }

    if (params?.filters?.category?.length) {
      query = query.in('category', params.filters.category);
    }

    if (params?.filters?.framework?.length) {
      query = query.in('framework', params.filters.framework);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('owner_id', params.filters.assigned_to);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITControl> {
    const { data, error } = await supabase
      .from('it_controls')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        tester:users!tester_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITControlFormData): Promise<ITControl> {
    const { data, error } = await supabase
      .from('it_controls')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITControlFormData>): Promise<ITControl> {
    const { data, error } = await supabase
      .from('it_controls')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_controls')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, implementationStatus: string, effectiveness?: string): Promise<ITControl> {
    const updateData: any = { implementation_status: implementationStatus };
    if (effectiveness) {
      updateData.effectiveness = effectiveness;
    }

    const { data, error } = await supabase
      .from('it_controls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// PCI Compliance Service
export const pciComplianceService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<PCICompliance>> {
    let query = supabase
      .from('pci_compliance')
      .select(`
        *,
        assessor:users!assessor_id(first_name, last_name, email),
        reviewer:users!reviewer_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,assessment_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.type?.length) {
      query = query.in('assessment_type', params.filters.type);
    }

    if (params?.filters?.merchant_level?.length) {
      query = query.in('merchant_level', params.filters.merchant_level);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('assessor_id', params.filters.assigned_to);
    }

    if (params?.filters?.date_range) {
      query = query.gte('start_date', params.filters.date_range.start)
                   .lte('start_date', params.filters.date_range.end);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<PCICompliance> {
    const { data, error } = await supabase
      .from('pci_compliance')
      .select(`
        *,
        assessor:users!assessor_id(first_name, last_name, email),
        reviewer:users!reviewer_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: PCIComplianceFormData): Promise<PCICompliance> {
    const { data, error } = await supabase
      .from('pci_compliance')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<PCIComplianceFormData>): Promise<PCICompliance> {
    const { data, error } = await supabase
      .from('pci_compliance')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pci_compliance')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, completedDate?: string): Promise<PCICompliance> {
    const updateData: any = { status };
    if (completedDate) {
      updateData.completed_date = completedDate;
    }

    const { data, error } = await supabase
      .from('pci_compliance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ISMS Management Service
export const ismsManagementService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ISMSManagement>> {
    let query = supabase
      .from('isms_management')
      .select(`
        *,
        isms_manager:users!isms_manager_id(first_name, last_name, email),
        management_representative:users!management_representative_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,isms_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.certification_status?.length) {
      query = query.in('certification_status', params.filters.certification_status);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('isms_manager_id', params.filters.assigned_to);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ISMSManagement> {
    const { data, error } = await supabase
      .from('isms_management')
      .select(`
        *,
        isms_manager:users!isms_manager_id(first_name, last_name, email),
        management_representative:users!management_representative_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ISMSManagementFormData): Promise<ISMSManagement> {
    const { data, error } = await supabase
      .from('isms_management')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ISMSManagementFormData>): Promise<ISMSManagement> {
    const { data, error } = await supabase
      .from('isms_management')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('isms_management')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, certificationStatus?: string): Promise<ISMSManagement> {
    const updateData: any = { status };
    if (certificationStatus) {
      updateData.certification_status = certificationStatus;
    }

    const { data, error } = await supabase
      .from('isms_management')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// CMMC Management Service
export const cmmcManagementService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<CMMCManagement>> {
    let query = supabase
      .from('cmmc_management')
      .select(`
        *,
        cmmc_manager:users!cmmc_manager_id(first_name, last_name, email),
        assessor:users!assessor_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,cmmc_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.certification_status?.length) {
      query = query.in('certification_status', params.filters.certification_status);
    }

    if (params?.filters?.target_level?.length) {
      query = query.in('target_level', params.filters.target_level);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('cmmc_manager_id', params.filters.assigned_to);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<CMMCManagement> {
    const { data, error } = await supabase
      .from('cmmc_management')
      .select(`
        *,
        cmmc_manager:users!cmmc_manager_id(first_name, last_name, email),
        assessor:users!assessor_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: CMMCManagementFormData): Promise<CMMCManagement> {
    const { data, error } = await supabase
      .from('cmmc_management')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<CMMCManagementFormData>): Promise<CMMCManagement> {
    const { data, error } = await supabase
      .from('cmmc_management')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cmmc_management')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, certificationStatus?: string): Promise<CMMCManagement> {
    const updateData: any = { status };
    if (certificationStatus) {
      updateData.certification_status = certificationStatus;
    }

    const { data, error } = await supabase
      .from('cmmc_management')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// IT Control Test Service
export const itControlTestService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITControlTest>> {
    let query = supabase
      .from('it_control_tests')
      .select(`
        *,
        control:it_controls(*),
        tester:users!tester_id(first_name, last_name, email),
        reviewer:users!reviewer_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`test_name.ilike.%${params.query}%,test_description.ilike.%${params.query}%,test_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('test_result', params.filters.status);
    }

    if (params?.filters?.type?.length) {
      query = query.in('test_type', params.filters.type);
    }

    if (params?.filters?.control_id?.length) {
      query = query.in('control_id', params.filters.control_id);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('tester_id', params.filters.assigned_to);
    }

    if (params?.filters?.date_range) {
      query = query.gte('test_date', params.filters.date_range.start)
                   .lte('test_date', params.filters.date_range.end);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITControlTest> {
    const { data, error } = await supabase
      .from('it_control_tests')
      .select(`
        *,
        control:it_controls(*),
        tester:users!tester_id(first_name, last_name, email),
        reviewer:users!reviewer_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITControlTestFormData): Promise<ITControlTest> {
    const { data, error } = await supabase
      .from('it_control_tests')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITControlTestFormData>): Promise<ITControlTest> {
    const { data, error } = await supabase
      .from('it_control_tests')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_control_tests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// IT Security Monitoring Service
export const itSecurityMonitoringService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITSecurityMonitoring>> {
    let query = supabase
      .from('it_security_monitoring')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        operator:users!operator_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,monitoring_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.type?.length) {
      query = query.in('monitoring_type', params.filters.type);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('owner_id', params.filters.assigned_to);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITSecurityMonitoring> {
    const { data, error } = await supabase
      .from('it_security_monitoring')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        operator:users!operator_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITSecurityMonitoringFormData): Promise<ITSecurityMonitoring> {
    const { data, error } = await supabase
      .from('it_security_monitoring')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITSecurityMonitoringFormData>): Promise<ITSecurityMonitoring> {
    const { data, error } = await supabase
      .from('it_security_monitoring')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_security_monitoring')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string): Promise<ITSecurityMonitoring> {
    const { data, error } = await supabase
      .from('it_security_monitoring')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// IT Security Alert Service
export const itSecurityAlertService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITSecurityAlert>> {
    let query = supabase
      .from('it_security_alerts')
      .select(`
        *,
        assigned_to_user:users!assigned_to(first_name, last_name, email),
        escalated_to_user:users!escalated_to(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%,alert_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.status?.length) {
      query = query.in('status', params.filters.status);
    }

    if (params?.filters?.severity?.length) {
      query = query.in('severity', params.filters.severity);
    }

    if (params?.filters?.type?.length) {
      query = query.in('alert_type', params.filters.type);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('assigned_to', params.filters.assigned_to);
    }

    if (params?.filters?.date_range) {
      query = query.gte('alert_time', params.filters.date_range.start)
                   .lte('alert_time', params.filters.date_range.end);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITSecurityAlert> {
    const { data, error } = await supabase
      .from('it_security_alerts')
      .select(`
        *,
        assigned_to_user:users!assigned_to(first_name, last_name, email),
        escalated_to_user:users!escalated_to(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITSecurityAlertFormData): Promise<ITSecurityAlert> {
    const { data, error } = await supabase
      .from('it_security_alerts')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITSecurityAlertFormData>): Promise<ITSecurityAlert> {
    const { data, error } = await supabase
      .from('it_security_alerts')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_security_alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<ITSecurityAlert> {
    const updateData: any = { status };
    if (notes) {
      updateData.investigation_notes = notes;
    }

    if (status === 'acknowledged') {
      updateData.acknowledged_time = new Date().toISOString();
    } else if (status === 'resolved') {
      updateData.resolved_time = new Date().toISOString();
    } else if (status === 'closed') {
      updateData.closed_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('it_security_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// IT Security Asset Service
export const itSecurityAssetService = {
  async getAll(params?: ITSecuritySearchParams): Promise<PaginatedResponse<ITSecurityAsset>> {
    let query = supabase
      .from('it_security_assets')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        custodian:users!custodian_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `);

    if (params?.query) {
      query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%,asset_id.ilike.%${params.query}%`);
    }

    if (params?.filters?.type?.length) {
      query = query.in('asset_type', params.filters.type);
    }

    if (params?.filters?.category?.length) {
      query = query.in('category', params.filters.category);
    }

    if (params?.filters?.classification?.length) {
      query = query.in('classification', params.filters.classification);
    }

    if (params?.filters?.criticality?.length) {
      query = query.in('criticality', params.filters.criticality);
    }

    if (params?.filters?.business_unit?.length) {
      query = query.in('business_unit_id', params.filters.business_unit);
    }

    if (params?.filters?.assigned_to?.length) {
      query = query.in('owner_id', params.filters.assigned_to);
    }

    const page = params?.page || 1;
    const pageSize = params?.page_size || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(params?.sort_by || 'created_at', { ascending: params?.sort_order === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getById(id: string): Promise<ITSecurityAsset> {
    const { data, error } = await supabase
      .from('it_security_assets')
      .select(`
        *,
        owner:users!owner_id(first_name, last_name, email),
        custodian:users!custodian_id(first_name, last_name, email),
        business_unit:business_units(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(formData: ITSecurityAssetFormData): Promise<ITSecurityAsset> {
    const { data, error } = await supabase
      .from('it_security_assets')
      .insert([formData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<ITSecurityAssetFormData>): Promise<ITSecurityAsset> {
    const { data, error } = await supabase
      .from('it_security_assets')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('it_security_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Export all services
export const itSecurityService = {
  incidents: itSecurityIncidentService,
  policies: itSecurityPolicyService,
  vulnerabilities: itSecurityVulnerabilityService,
  riskAssessments: itRiskAssessmentService,
  controls: itControlService,
  pciCompliance: pciComplianceService,
  ismsManagement: ismsManagementService,
  cmmcManagement: cmmcManagementService,
  controlTests: itControlTestService,
  monitoring: itSecurityMonitoringService,
  alerts: itSecurityAlertService,
  assets: itSecurityAssetService,
  dashboard: itSecurityDashboardService
};
