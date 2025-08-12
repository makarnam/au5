import { supabase } from '../lib/supabase';
import {
  AIModel,
  AIModelFormData,
  AIControl,
  AIControlFormData,
  AIRiskAssessment,
  AIRiskAssessmentFormData,
  AIComplianceFramework,
  AIComplianceFrameworkFormData,
  AIModelRiskManagement,
  AIModelRiskManagementFormData,
  AIGovernancePolicy,
  AIGovernancePolicyFormData,
  AIIncident,
  AIIncidentFormData,
  AIModelControl,
  AIModelMonitoring,
  AIGovernanceMetrics,
  AIGovernanceSearchParams,
  PaginatedResponse,
  ApiResponse,
  FormError
} from '../types/aiGovernance';

// AI Models Management
export const aiGovernanceService = {
  // AI Models
  async getAIModels(params?: AIGovernanceSearchParams): Promise<PaginatedResponse<AIModel>> {
    try {
      let query = supabase
        .from('ai_models')
        .select(`
          *,
          owner:users!ai_models_owner_id_fkey(first_name, last_name, email),
          business_unit:business_units!ai_models_business_unit_id_fkey(name, code)
        `);

      if (params?.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params?.filters) {
        const { filters } = params;
        if (filters.model_type?.length) {
          query = query.in('model_type', filters.model_type);
        }
        if (filters.provider?.length) {
          query = query.in('provider', filters.provider);
        }
        if (filters.risk_level?.length) {
          query = query.in('risk_level', filters.risk_level);
        }
        if (filters.compliance_status?.length) {
          query = query.in('compliance_status', filters.compliance_status);
        }
        if (filters.deployment_environment?.length) {
          query = query.in('deployment_environment', filters.deployment_environment);
        }
        if (filters.business_unit?.length) {
          query = query.in('business_unit_id', filters.business_unit);
        }
        if (filters.owner?.length) {
          query = query.in('owner_id', filters.owner);
        }
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);

      if (params?.sort_by) {
        query = query.order(params.sort_by, { ascending: params.sort_order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching AI models:', error);
      throw error;
    }
  },

  async getAIModel(id: string): Promise<AIModel> {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select(`
          *,
          owner:users!ai_models_owner_id_fkey(first_name, last_name, email),
          business_unit:business_units!ai_models_business_unit_id_fkey(name, code)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI model:', error);
      throw error;
    }
  },

  async createAIModel(formData: AIModelFormData): Promise<ApiResponse<AIModel>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Sanitize optional UUID fields to avoid sending empty strings
      const sanitizeOptionalUuid = (value?: string) => {
        if (value === undefined || value === null) return null;
        if (typeof value === 'string' && value.trim() === '') return null;
        return value;
      };

      const payload = {
        ...formData,
        business_unit_id: sanitizeOptionalUuid(formData.business_unit_id),
        owner_id: sanitizeOptionalUuid(formData.owner_id),
        created_by: user.id,
        last_updated: new Date().toISOString()
      } as const;

      const { data, error } = await supabase
        .from('ai_models')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI model created successfully'
      };
    } catch (error) {
      console.error('Error creating AI model:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create AI model',
        errors: []
      };
    }
  },

  async updateAIModel(id: string, formData: Partial<AIModelFormData>): Promise<ApiResponse<AIModel>> {
    try {
      // Sanitize optional UUID fields if present on update
      const sanitizeOptionalUuid = (value?: string) => {
        if (value === undefined || value === null) return null;
        if (typeof value === 'string' && value.trim() === '') return null;
        return value;
      };

      const updates: Record<string, any> = {
        ...formData,
        last_updated: new Date().toISOString()
      };

      if ('business_unit_id' in formData) {
        updates.business_unit_id = sanitizeOptionalUuid(formData.business_unit_id);
      }
      if ('owner_id' in formData) {
        updates.owner_id = sanitizeOptionalUuid(formData.owner_id);
      }

      const { data, error } = await supabase
        .from('ai_models')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI model updated successfully'
      };
    } catch (error) {
      console.error('Error updating AI model:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update AI model',
        errors: []
      };
    }
  },

  async deleteAIModel(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_models')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'AI model deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting AI model:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete AI model',
        errors: []
      };
    }
  },

  // AI Controls
  async getAIControls(params?: AIGovernanceSearchParams): Promise<PaginatedResponse<AIControl>> {
    try {
      let query = supabase
        .from('ai_controls')
        .select('*');

      if (params?.query) {
        query = query.or(`control_code.ilike.%${params.query}%,title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params?.filters) {
        const { filters } = params;
        if (filters.risk_level?.length) {
          query = query.in('risk_level', filters.risk_level);
        }
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching AI controls:', error);
      throw error;
    }
  },

  async getAIControl(id: string): Promise<AIControl> {
    try {
      const { data, error } = await supabase
        .from('ai_controls')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI control:', error);
      throw error;
    }
  },

  async createAIControl(formData: AIControlFormData): Promise<ApiResponse<AIControl>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_controls')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI control created successfully'
      };
    } catch (error) {
      console.error('Error creating AI control:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create AI control',
        errors: []
      };
    }
  },

  async updateAIControl(id: string, formData: Partial<AIControlFormData>): Promise<ApiResponse<AIControl>> {
    try {
      const { data, error } = await supabase
        .from('ai_controls')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI control updated successfully'
      };
    } catch (error) {
      console.error('Error updating AI control:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update AI control',
        errors: []
      };
    }
  },

  async deleteAIControl(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_controls')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'AI control deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting AI control:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete AI control',
        errors: []
      };
    }
  },

  // AI Risk Assessments
  async getAIRiskAssessments(params?: AIGovernanceSearchParams): Promise<PaginatedResponse<AIRiskAssessment>> {
    try {
      let query = supabase
        .from('ai_risk_assessments')
        .select(`
          *,
          model:ai_models!ai_risk_assessments_model_id_fkey(name, model_type),
          assessor:users!ai_risk_assessments_assessor_id_fkey(first_name, last_name, email)
        `);

      if (params?.query) {
        query = query.or(`assessment_name.ilike.%${params.query}%,findings.ilike.%${params.query}%`);
      }

      if (params?.filters) {
        const { filters } = params;
        if (filters.risk_level?.length) {
          query = query.in('risk_level', filters.risk_level);
        }
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching AI risk assessments:', error);
      throw error;
    }
  },

  async getAIRiskAssessment(id: string): Promise<AIRiskAssessment> {
    try {
      const { data, error } = await supabase
        .from('ai_risk_assessments')
        .select(`
          *,
          model:ai_models!ai_risk_assessments_model_id_fkey(name, model_type),
          assessor:users!ai_risk_assessments_assessor_id_fkey(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI risk assessment:', error);
      throw error;
    }
  },

  async createAIRiskAssessment(formData: AIRiskAssessmentFormData): Promise<ApiResponse<AIRiskAssessment>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_risk_assessments')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI risk assessment created successfully'
      };
    } catch (error) {
      console.error('Error creating AI risk assessment:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create AI risk assessment',
        errors: []
      };
    }
  },

  async updateAIRiskAssessment(id: string, formData: Partial<AIRiskAssessmentFormData>): Promise<ApiResponse<AIRiskAssessment>> {
    try {
      const { data, error } = await supabase
        .from('ai_risk_assessments')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI risk assessment updated successfully'
      };
    } catch (error) {
      console.error('Error updating AI risk assessment:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update AI risk assessment',
        errors: []
      };
    }
  },

  async deleteAIRiskAssessment(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_risk_assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'AI risk assessment deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting AI risk assessment:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete AI risk assessment',
        errors: []
      };
    }
  },

  // AI Compliance Frameworks
  async getAIComplianceFrameworks(params?: AIGovernanceSearchParams): Promise<PaginatedResponse<AIComplianceFramework>> {
    try {
      let query = supabase
        .from('ai_compliance_frameworks')
        .select(`
          *,
          responsible_party:users!ai_compliance_frameworks_responsible_party_id_fkey(first_name, last_name, email)
        `);

      if (params?.query) {
        query = query.or(`framework_name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching AI compliance frameworks:', error);
      throw error;
    }
  },

  async getAIComplianceFramework(id: string): Promise<AIComplianceFramework> {
    try {
      const { data, error } = await supabase
        .from('ai_compliance_frameworks')
        .select(`
          *,
          responsible_party:users!ai_compliance_frameworks_responsible_party_id_fkey(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI compliance framework:', error);
      throw error;
    }
  },

  async createAIComplianceFramework(formData: AIComplianceFrameworkFormData): Promise<ApiResponse<AIComplianceFramework>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_compliance_frameworks')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI compliance framework created successfully'
      };
    } catch (error) {
      console.error('Error creating AI compliance framework:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create AI compliance framework',
        errors: []
      };
    }
  },

  async updateAIComplianceFramework(id: string, formData: Partial<AIComplianceFrameworkFormData>): Promise<ApiResponse<AIComplianceFramework>> {
    try {
      const { data, error } = await supabase
        .from('ai_compliance_frameworks')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI compliance framework updated successfully'
      };
    } catch (error) {
      console.error('Error updating AI compliance framework:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update AI compliance framework',
        errors: []
      };
    }
  },

  async deleteAIComplianceFramework(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_compliance_frameworks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'AI compliance framework deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting AI compliance framework:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete AI compliance framework',
        errors: []
      };
    }
  },

  // AI Model Risk Management
  async getAIModelRiskManagement(params?: AIGovernanceSearchParams): Promise<PaginatedResponse<AIModelRiskManagement>> {
    try {
      let query = supabase
        .from('ai_model_risk_management')
        .select(`
          *,
          model:ai_models!ai_model_risk_management_model_id_fkey(name, model_type),
          owner:users!ai_model_risk_management_owner_id_fkey(first_name, last_name, email)
        `);

      if (params?.query) {
        query = query.or(`risk_description.ilike.%${params.query}%,mitigation_strategy.ilike.%${params.query}%`);
      }

      if (params?.filters) {
        const { filters } = params;
        if (filters.risk_level?.length) {
          query = query.in('probability', filters.risk_level);
        }
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching AI model risk management:', error);
      throw error;
    }
  },

  async getAIModelRiskManagementRecord(id: string): Promise<AIModelRiskManagement> {
    try {
      const { data, error } = await supabase
        .from('ai_model_risk_management')
        .select(`
          *,
          model:ai_models!ai_model_risk_management_model_id_fkey(name, model_type),
          owner:users!ai_model_risk_management_owner_id_fkey(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI model risk management record:', error);
      throw error;
    }
  },

  async createAIModelRiskManagement(formData: AIModelRiskManagementFormData): Promise<ApiResponse<AIModelRiskManagement>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_model_risk_management')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI model risk management record created successfully'
      };
    } catch (error) {
      console.error('Error creating AI model risk management record:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create AI model risk management record',
        errors: []
      };
    }
  },

  async updateAIModelRiskManagement(id: string, formData: Partial<AIModelRiskManagementFormData>): Promise<ApiResponse<AIModelRiskManagement>> {
    try {
      const { data, error } = await supabase
        .from('ai_model_risk_management')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI model risk management record updated successfully'
      };
    } catch (error) {
      console.error('Error updating AI model risk management record:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update AI model risk management record',
        errors: []
      };
    }
  },

  async deleteAIModelRiskManagement(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_model_risk_management')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'AI model risk management record deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting AI model risk management record:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete AI model risk management record',
        errors: []
      };
    }
  },

  // AI Governance Policies
  async getAIGovernancePolicies(params?: AIGovernanceSearchParams): Promise<PaginatedResponse<AIGovernancePolicy>> {
    try {
      let query = supabase
        .from('ai_governance_policies')
        .select(`
          *,
          approver:users!ai_governance_policies_approved_by_fkey(first_name, last_name, email)
        `);

      if (params?.query) {
        query = query.or(`policy_name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params?.filters) {
        const { filters } = params;
        if (filters.compliance_status?.length) {
          query = query.in('approval_status', filters.compliance_status);
        }
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching AI governance policies:', error);
      throw error;
    }
  },

  async getAIGovernancePolicy(id: string): Promise<AIGovernancePolicy> {
    try {
      const { data, error } = await supabase
        .from('ai_governance_policies')
        .select(`
          *,
          approver:users!ai_governance_policies_approved_by_fkey(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI governance policy:', error);
      throw error;
    }
  },

  async createAIGovernancePolicy(formData: AIGovernancePolicyFormData): Promise<ApiResponse<AIGovernancePolicy>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_governance_policies')
        .insert({
          ...formData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI governance policy created successfully'
      };
    } catch (error) {
      console.error('Error creating AI governance policy:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create AI governance policy',
        errors: []
      };
    }
  },

  async updateAIGovernancePolicy(id: string, formData: Partial<AIGovernancePolicyFormData>): Promise<ApiResponse<AIGovernancePolicy>> {
    try {
      const { data, error } = await supabase
        .from('ai_governance_policies')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI governance policy updated successfully'
      };
    } catch (error) {
      console.error('Error updating AI governance policy:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update AI governance policy',
        errors: []
      };
    }
  },

  async deleteAIGovernancePolicy(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_governance_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'AI governance policy deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting AI governance policy:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete AI governance policy',
        errors: []
      };
    }
  },

  // AI Incidents
  async getAIIncidents(params?: AIGovernanceSearchParams): Promise<PaginatedResponse<AIIncident>> {
    try {
      let query = supabase
        .from('ai_incidents')
        .select(`
          *,
          model:ai_models!ai_incidents_model_id_fkey(name, model_type),
          assigned_user:users!ai_incidents_assigned_to_fkey(first_name, last_name, email),
          reporter:users!ai_incidents_reported_by_fkey(first_name, last_name, email)
        `);

      if (params?.query) {
        query = query.or(`incident_title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params?.filters) {
        const { filters } = params;
        if (filters.risk_level?.length) {
          query = query.in('severity', filters.risk_level);
        }
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching AI incidents:', error);
      throw error;
    }
  },

  async getAIIncident(id: string): Promise<AIIncident> {
    try {
      const { data, error } = await supabase
        .from('ai_incidents')
        .select(`
          *,
          model:ai_models!ai_incidents_model_id_fkey(name, model_type),
          assigned_user:users!ai_incidents_assigned_to_fkey(first_name, last_name, email),
          reporter:users!ai_incidents_reported_by_fkey(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI incident:', error);
      throw error;
    }
  },

  async createAIIncident(formData: AIIncidentFormData): Promise<ApiResponse<AIIncident>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_incidents')
        .insert({
          ...formData,
          reported_by: user.id,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI incident created successfully'
      };
    } catch (error) {
      console.error('Error creating AI incident:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create AI incident',
        errors: []
      };
    }
  },

  async updateAIIncident(id: string, formData: Partial<AIIncidentFormData>): Promise<ApiResponse<AIIncident>> {
    try {
      const { data, error } = await supabase
        .from('ai_incidents')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'AI incident updated successfully'
      };
    } catch (error) {
      console.error('Error updating AI incident:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update AI incident',
        errors: []
      };
    }
  },

  async deleteAIIncident(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'AI incident deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting AI incident:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete AI incident',
        errors: []
      };
    }
  },

  // AI Model Controls
  async getAIModelControls(modelId: string): Promise<AIModelControl[]> {
    try {
      const { data, error } = await supabase
        .from('ai_model_controls')
        .select(`
          *,
          model:ai_models!ai_model_controls_model_id_fkey(name, model_type),
          control:ai_controls!ai_model_controls_control_id_fkey(control_code, title, control_type),
          assigned_user:users!ai_model_controls_assigned_to_fkey(first_name, last_name, email)
        `)
        .eq('model_id', modelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching AI model controls:', error);
      throw error;
    }
  },

  async assignControlToModel(modelId: string, controlId: string, assignedTo?: string): Promise<ApiResponse<AIModelControl>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_model_controls')
        .insert({
          model_id: modelId,
          control_id: controlId,
          assigned_to: assignedTo,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'Control assigned to model successfully'
      };
    } catch (error) {
      console.error('Error assigning control to model:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign control to model',
        errors: []
      };
    }
  },

  async updateModelControl(id: string, updates: Partial<AIModelControl>): Promise<ApiResponse<AIModelControl>> {
    try {
      const { data, error } = await supabase
        .from('ai_model_controls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'Model control updated successfully'
      };
    } catch (error) {
      console.error('Error updating model control:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update model control',
        errors: []
      };
    }
  },

  async removeControlFromModel(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ai_model_controls')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: undefined,
        success: true,
        message: 'Control removed from model successfully'
      };
    } catch (error) {
      console.error('Error removing control from model:', error);
      return {
        data: undefined,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove control from model',
        errors: []
      };
    }
  },

  // AI Model Monitoring
  async getAIModelMonitoring(modelId: string, limit: number = 50): Promise<AIModelMonitoring[]> {
    try {
      const { data, error } = await supabase
        .from('ai_model_monitoring')
        .select(`
          *,
          model:ai_models!ai_model_monitoring_model_id_fkey(name, model_type)
        `)
        .eq('model_id', modelId)
        .order('monitoring_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching AI model monitoring:', error);
      throw error;
    }
  },

  async addMonitoringData(monitoringData: Partial<AIModelMonitoring>): Promise<ApiResponse<AIModelMonitoring>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_model_monitoring')
        .insert({
          ...monitoringData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        success: true,
        message: 'Monitoring data added successfully'
      };
    } catch (error) {
      console.error('Error adding monitoring data:', error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add monitoring data',
        errors: []
      };
    }
  },

  // Dashboard Metrics
  async getAIGovernanceMetrics(): Promise<AIGovernanceMetrics> {
    try {
      // Get counts for different metrics
      const [
        { count: totalModels },
        { count: activeModels },
        { count: highRiskModels },
        { count: criticalRiskModels },
        { count: compliantModels },
        { count: nonCompliantModels },
        { count: totalControls },
        { count: totalIncidents },
        { count: openIncidents },
        { count: resolvedIncidents },
        { count: totalAssessments },
        { count: pendingAssessments },
        { count: completedAssessments }
      ] = await Promise.all([
        supabase.from('ai_models').select('*', { count: 'exact', head: true }),
        supabase.from('ai_models').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('ai_models').select('*', { count: 'exact', head: true }).eq('risk_level', 'high'),
        supabase.from('ai_models').select('*', { count: 'exact', head: true }).eq('risk_level', 'critical'),
        supabase.from('ai_models').select('*', { count: 'exact', head: true }).eq('compliance_status', 'compliant'),
        supabase.from('ai_models').select('*', { count: 'exact', head: true }).eq('compliance_status', 'non_compliant'),
        supabase.from('ai_controls').select('*', { count: 'exact', head: true }),
        supabase.from('ai_incidents').select('*', { count: 'exact', head: true }),
        supabase.from('ai_incidents').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('ai_incidents').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('ai_risk_assessments').select('*', { count: 'exact', head: true }),
        supabase.from('ai_risk_assessments').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('ai_risk_assessments').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      ]);

      // Get implemented and effective controls count
      const { count: implementedControls } = await supabase
        .from('ai_model_controls')
        .select('*', { count: 'exact', head: true })
        .eq('implementation_status', 'implemented');

      const { count: effectiveControls } = await supabase
        .from('ai_model_controls')
        .select('*', { count: 'exact', head: true })
        .eq('implementation_status', 'effective');

      return {
        total_models: totalModels || 0,
        active_models: activeModels || 0,
        high_risk_models: highRiskModels || 0,
        critical_risk_models: criticalRiskModels || 0,
        compliant_models: compliantModels || 0,
        non_compliant_models: nonCompliantModels || 0,
        total_controls: totalControls || 0,
        implemented_controls: implementedControls || 0,
        effective_controls: effectiveControls || 0,
        total_incidents: totalIncidents || 0,
        open_incidents: openIncidents || 0,
        resolved_incidents: resolvedIncidents || 0,
        total_assessments: totalAssessments || 0,
        pending_assessments: pendingAssessments || 0,
        completed_assessments: completedAssessments || 0
      };
    } catch (error) {
      console.error('Error fetching AI governance metrics:', error);
      throw error;
    }
  },

  // Utility functions
  async getBusinessUnits() {
    try {
      const { data, error } = await supabase
        .from('business_units')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching business units:', error);
      throw error;
    }
  },

  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};
