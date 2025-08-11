import { supabase } from '../lib/supabase';
import {
  ESGProgram,
  ESGProgramFormData,
  ESGMetric,
  ESGMetricFormData,
  ESGDataCollection,
  ESGDataCollectionFormData,
  CarbonManagement,
  CarbonManagementFormData,
  ESGDisclosure,
  ESGDisclosureFormData,
  ESGPortfolioAssessment,
  ESGPortfolioAssessmentFormData,
  DoubleMaterialityAssessment,
  DoubleMaterialityAssessmentFormData,
  ESGGoal,
  ESGGoalFormData,
  ESGStakeholderEngagement,
  ESGStakeholderEngagementFormData,
  ESGDashboardMetrics,
  ESGCarbonSummary,
  ESGMaterialityMatrix,
  ESGSearchParams,
  ESGFilterOptions,
  ApiResponse,
  PaginatedResponse,
} from '../types';

class ESGService {
  // ESG Programs
  async getESGPrograms(params?: ESGSearchParams): Promise<PaginatedResponse<ESGProgram>> {
    try {
      let query = supabase
        .from('esg_programs')
        .select(`
          *,
          owner:users!esg_programs_owner_id_fkey(first_name, last_name, email),
          business_unit:business_units!esg_programs_business_unit_id_fkey(name, code)
        `);

      if (params?.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params?.filters) {
        if (params.filters.program_type?.length) {
          query = query.in('program_type', params.filters.program_type);
        }
        if (params.filters.status?.length) {
          query = query.in('status', params.filters.status);
        }
        if (params.filters.business_unit?.length) {
          query = query.in('business_unit_id', params.filters.business_unit);
        }
      }

      if (params?.sort_by) {
        query = query.order(params.sort_by, { ascending: params.sort_order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const page = params?.page || 1;
      const pageSize = params?.page_size || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error('Error fetching ESG programs:', error);
      throw error;
    }
  }

  async getESGProgram(id: string): Promise<ESGProgram> {
    try {
      const { data, error } = await supabase
        .from('esg_programs')
        .select(`
          *,
          owner:users!esg_programs_owner_id_fkey(first_name, last_name, email),
          business_unit:business_units!esg_programs_business_unit_id_fkey(name, code)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching ESG program:', error);
      throw error;
    }
  }

  async createESGProgram(formData: ESGProgramFormData): Promise<ESGProgram> {
    try {
      const { data, error } = await supabase
        .from('esg_programs')
        .insert([formData])
        .select(`
          *,
          owner:users!esg_programs_owner_id_fkey(first_name, last_name, email),
          business_unit:business_units!esg_programs_business_unit_id_fkey(name, code)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ESG program:', error);
      throw error;
    }
  }

  async updateESGProgram(id: string, formData: Partial<ESGProgramFormData>): Promise<ESGProgram> {
    try {
      const { data, error } = await supabase
        .from('esg_programs')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          owner:users!esg_programs_owner_id_fkey(first_name, last_name, email),
          business_unit:business_units!esg_programs_business_unit_id_fkey(name, code)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating ESG program:', error);
      throw error;
    }
  }

  async deleteESGProgram(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('esg_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting ESG program:', error);
      throw error;
    }
  }

  // ESG Metrics
  async getESGMetrics(programId?: string, params?: ESGSearchParams): Promise<PaginatedResponse<ESGMetric>> {
    try {
      let query = supabase
        .from('esg_metrics')
        .select(`
          *,
          program:esg_programs!esg_metrics_program_id_fkey(name, program_type)
        `);

      if (programId) {
        query = query.eq('program_id', programId);
      }

      if (params?.filters?.category?.length) {
        query = query.in('category', params.filters.category);
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching ESG metrics:', error);
      throw error;
    }
  }

  async createESGMetric(formData: ESGMetricFormData): Promise<ESGMetric> {
    try {
      const { data, error } = await supabase
        .from('esg_metrics')
        .insert([formData])
        .select(`
          *,
          program:esg_programs!esg_metrics_program_id_fkey(name, program_type)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ESG metric:', error);
      throw error;
    }
  }

  async updateESGMetric(id: string, formData: Partial<ESGMetricFormData>): Promise<ESGMetric> {
    try {
      const { data, error } = await supabase
        .from('esg_metrics')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          program:esg_programs!esg_metrics_program_id_fkey(name, program_type)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating ESG metric:', error);
      throw error;
    }
  }

  // ESG Data Collection
  async getESGDataCollection(metricId?: string, params?: ESGSearchParams): Promise<PaginatedResponse<ESGDataCollection>> {
    try {
      let query = supabase
        .from('esg_data_collection')
        .select(`
          *,
          metric:esg_metrics!esg_data_collection_metric_id_fkey(metric_name, metric_code, category, unit_of_measure),
          verified_by_user:users!esg_data_collection_verified_by_fkey(first_name, last_name)
        `);

      if (metricId) {
        query = query.eq('metric_id', metricId);
      }

      if (params?.filters?.verification_status?.length) {
        query = query.in('verification_status', params.filters.verification_status);
      }

      const { data, error, count } = await query.order('reporting_period', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching ESG data collection:', error);
      throw error;
    }
  }

  async createESGDataCollection(formData: ESGDataCollectionFormData): Promise<ESGDataCollection> {
    try {
      const { data, error } = await supabase
        .from('esg_data_collection')
        .insert([formData])
        .select(`
          *,
          metric:esg_metrics!esg_data_collection_metric_id_fkey(metric_name, metric_code, category, unit_of_measure),
          verified_by_user:users!esg_data_collection_verified_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ESG data collection:', error);
      throw error;
    }
  }

  async verifyESGDataCollection(id: string, verifiedBy: string): Promise<ESGDataCollection> {
    try {
      const { data, error } = await supabase
        .from('esg_data_collection')
        .update({
          verification_status: 'verified',
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          metric:esg_metrics!esg_data_collection_metric_id_fkey(metric_name, metric_code, category, unit_of_measure),
          verified_by_user:users!esg_data_collection_verified_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying ESG data collection:', error);
      throw error;
    }
  }

  // Carbon Management
  async getCarbonManagement(programId?: string, params?: ESGSearchParams): Promise<PaginatedResponse<CarbonManagement>> {
    try {
      let query = supabase
        .from('carbon_management')
        .select(`
          *,
          program:esg_programs!carbon_management_program_id_fkey(name, program_type),
          business_unit:business_units!carbon_management_business_unit_id_fkey(name, code)
        `);

      if (programId) {
        query = query.eq('program_id', programId);
      }

      if (params?.filters?.verification_status?.length) {
        query = query.in('verification_status', params.filters.verification_status);
      }

      const { data, error, count } = await query.order('reporting_period', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching carbon management data:', error);
      throw error;
    }
  }

  async createCarbonManagement(formData: CarbonManagementFormData): Promise<CarbonManagement> {
    try {
      const { data, error } = await supabase
        .from('carbon_management')
        .insert([formData])
        .select(`
          *,
          program:esg_programs!carbon_management_program_id_fkey(name, program_type),
          business_unit:business_units!carbon_management_business_unit_id_fkey(name, code)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating carbon management record:', error);
      throw error;
    }
  }

  async getCarbonSummary(): Promise<ESGCarbonSummary> {
    try {
      const { data, error } = await supabase
        .from('carbon_management')
        .select('scope, co2_equivalent, reporting_period');

      if (error) throw error;

      const scope1Total = data?.filter(d => d.scope === 'scope1').reduce((sum, d) => sum + (d.co2_equivalent || 0), 0) || 0;
      const scope2Total = data?.filter(d => d.scope === 'scope2').reduce((sum, d) => sum + (d.co2_equivalent || 0), 0) || 0;
      const scope3Total = data?.filter(d => d.scope === 'scope3').reduce((sum, d) => sum + (d.co2_equivalent || 0), 0) || 0;

      return {
        scope1_total: scope1Total,
        scope2_total: scope2Total,
        scope3_total: scope3Total,
        total_emissions: scope1Total + scope2Total + scope3Total,
        year_over_year_change: 0, // Calculate based on historical data
        reduction_target: 0, // Set based on company goals
        progress_percentage: 0, // Calculate based on target vs current
      };
    } catch (error) {
      console.error('Error calculating carbon summary:', error);
      throw error;
    }
  }

  // ESG Disclosures
  async getESGDisclosures(programId?: string, params?: ESGSearchParams): Promise<PaginatedResponse<ESGDisclosure>> {
    try {
      let query = supabase
        .from('esg_disclosures')
        .select(`
          *,
          program:esg_programs!esg_disclosures_program_id_fkey(name, program_type),
          approver:users!esg_disclosures_approver_id_fkey(first_name, last_name)
        `);

      if (programId) {
        query = query.eq('program_id', programId);
      }

      if (params?.filters?.status?.length) {
        query = query.in('status', params.filters.status);
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching ESG disclosures:', error);
      throw error;
    }
  }

  async createESGDisclosure(formData: ESGDisclosureFormData): Promise<ESGDisclosure> {
    try {
      const { data, error } = await supabase
        .from('esg_disclosures')
        .insert([formData])
        .select(`
          *,
          program:esg_programs!esg_disclosures_program_id_fkey(name, program_type),
          approver:users!esg_disclosures_approver_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ESG disclosure:', error);
      throw error;
    }
  }

  async approveESGDisclosure(id: string, approverId: string): Promise<ESGDisclosure> {
    try {
      const { data, error } = await supabase
        .from('esg_disclosures')
        .update({
          status: 'approved',
          approver_id: approverId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          program:esg_programs!esg_disclosures_program_id_fkey(name, program_type),
          approver:users!esg_disclosures_approver_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving ESG disclosure:', error);
      throw error;
    }
  }

  // ESG Portfolio Assessments
  async getESGPortfolioAssessments(params?: ESGSearchParams): Promise<PaginatedResponse<ESGPortfolioAssessment>> {
    try {
      let query = supabase
        .from('esg_portfolio_assessments')
        .select('*');

      if (params?.filters?.portfolio_type?.length) {
        query = query.in('portfolio_type', params.filters.portfolio_type);
      }

      const { data, error, count } = await query.order('assessment_date', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching ESG portfolio assessments:', error);
      throw error;
    }
  }

  async createESGPortfolioAssessment(formData: ESGPortfolioAssessmentFormData): Promise<ESGPortfolioAssessment> {
    try {
      const { data, error } = await supabase
        .from('esg_portfolio_assessments')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ESG portfolio assessment:', error);
      throw error;
    }
  }

  // Double Materiality Assessments
  async getDoubleMaterialityAssessments(params?: ESGSearchParams): Promise<PaginatedResponse<DoubleMaterialityAssessment>> {
    try {
      let query = supabase
        .from('double_materiality_assessments')
        .select(`
          *,
          assessor:users!double_materiality_assessments_assessor_id_fkey(first_name, last_name)
        `);

      if (params?.filters?.topic_category?.length) {
        query = query.in('topic_category', params.filters.topic_category);
      }

      if (params?.filters?.materiality_level?.length) {
        query = query.in('materiality_level', params.filters.materiality_level);
      }

      const { data, error, count } = await query.order('assessment_date', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching double materiality assessments:', error);
      throw error;
    }
  }

  async createDoubleMaterialityAssessment(formData: DoubleMaterialityAssessmentFormData): Promise<DoubleMaterialityAssessment> {
    try {
      // Calculate combined materiality score
      const impactScore = formData.impact_materiality_score || 0;
      const financialScore = formData.financial_materiality_score || 0;
      const combinedScore = (impactScore + financialScore) / 2;

      // Determine materiality level
      let materialityLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      if (combinedScore >= 4.5) materialityLevel = 'critical';
      else if (combinedScore >= 3.5) materialityLevel = 'high';
      else if (combinedScore >= 2.5) materialityLevel = 'medium';
      else materialityLevel = 'low';

      const { data, error } = await supabase
        .from('double_materiality_assessments')
        .insert([{
          ...formData,
          combined_materiality_score: combinedScore,
          materiality_level: materialityLevel,
        }])
        .select(`
          *,
          assessor:users!double_materiality_assessments_assessor_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating double materiality assessment:', error);
      throw error;
    }
  }

  async getMaterialityMatrix(): Promise<ESGMaterialityMatrix[]> {
    try {
      const { data, error } = await supabase
        .from('double_materiality_assessments')
        .select('topic_name, impact_materiality_score, financial_materiality_score, combined_materiality_score, materiality_level, topic_category')
        .order('combined_materiality_score', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        topic_name: item.topic_name,
        impact_score: item.impact_materiality_score || 0,
        financial_score: item.financial_materiality_score || 0,
        combined_score: item.combined_materiality_score || 0,
        materiality_level: item.materiality_level,
        category: item.topic_category,
      })) || [];
    } catch (error) {
      console.error('Error fetching materiality matrix:', error);
      throw error;
    }
  }

  // ESG Goals
  async getESGGoals(programId?: string, params?: ESGSearchParams): Promise<PaginatedResponse<ESGGoal>> {
    try {
      let query = supabase
        .from('esg_goals')
        .select(`
          *,
          program:esg_programs!esg_goals_program_id_fkey(name, program_type),
          owner:users!esg_goals_owner_id_fkey(first_name, last_name)
        `);

      if (programId) {
        query = query.eq('program_id', programId);
      }

      if (params?.filters?.category?.length) {
        query = query.in('category', params.filters.category);
      }

      if (params?.filters?.status?.length) {
        query = query.in('status', params.filters.status);
      }

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching ESG goals:', error);
      throw error;
    }
  }

  async createESGGoal(formData: ESGGoalFormData): Promise<ESGGoal> {
    try {
      // Calculate progress percentage
      let progressPercentage = 0;
      if (formData.target_value && formData.current_value && formData.baseline_value) {
        const totalProgress = formData.target_value - formData.baseline_value;
        const currentProgress = formData.current_value - formData.baseline_value;
        progressPercentage = totalProgress > 0 ? (currentProgress / totalProgress) * 100 : 0;
      }

      const { data, error } = await supabase
        .from('esg_goals')
        .insert([{
          ...formData,
          progress_percentage: progressPercentage,
        }])
        .select(`
          *,
          program:esg_programs!esg_goals_program_id_fkey(name, program_type),
          owner:users!esg_goals_owner_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ESG goal:', error);
      throw error;
    }
  }

  // ESG Stakeholder Engagement
  async getESGStakeholderEngagement(programId?: string, params?: ESGSearchParams): Promise<PaginatedResponse<ESGStakeholderEngagement>> {
    try {
      let query = supabase
        .from('esg_stakeholder_engagement')
        .select(`
          *,
          program:esg_programs!esg_stakeholder_engagement_program_id_fkey(name, program_type)
        `);

      if (programId) {
        query = query.eq('program_id', programId);
      }

      if (params?.filters?.status?.length) {
        query = query.in('status', params.filters.status);
      }

      const { data, error, count } = await query.order('engagement_date', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        pageSize: count || 0,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching ESG stakeholder engagement:', error);
      throw error;
    }
  }

  async createESGStakeholderEngagement(formData: ESGStakeholderEngagementFormData): Promise<ESGStakeholderEngagement> {
    try {
      const { data, error } = await supabase
        .from('esg_stakeholder_engagement')
        .insert([formData])
        .select(`
          *,
          program:esg_programs!esg_stakeholder_engagement_program_id_fkey(name, program_type)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating ESG stakeholder engagement:', error);
      throw error;
    }
  }

  // Dashboard Metrics
  async getESGDashboardMetrics(): Promise<ESGDashboardMetrics> {
    try {
      // Get programs count
      const { count: totalPrograms } = await supabase
        .from('esg_programs')
        .select('*', { count: 'exact', head: true });

      const { count: activePrograms } = await supabase
        .from('esg_programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get metrics count
      const { count: totalMetrics } = await supabase
        .from('esg_metrics')
        .select('*', { count: 'exact', head: true });

      // Get data collection rate
      const { count: totalDataCollections } = await supabase
        .from('esg_data_collection')
        .select('*', { count: 'exact', head: true });

      const { count: verifiedDataCollections } = await supabase
        .from('esg_data_collection')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

      const dataCollectionRate = totalDataCollections > 0 ? (verifiedDataCollections / totalDataCollections) * 100 : 0;

      // Get carbon footprint total
      const { data: carbonData } = await supabase
        .from('carbon_management')
        .select('co2_equivalent');

      const carbonFootprintTotal = carbonData?.reduce((sum, item) => sum + (item.co2_equivalent || 0), 0) || 0;

      // Get disclosure completion rate
      const { count: totalDisclosures } = await supabase
        .from('esg_disclosures')
        .select('*', { count: 'exact', head: true });

      const { count: completedDisclosures } = await supabase
        .from('esg_disclosures')
        .select('*', { count: 'exact', head: true })
        .in('status', ['approved', 'published']);

      const disclosureCompletionRate = totalDisclosures > 0 ? (completedDisclosures / totalDisclosures) * 100 : 0;

      // Get portfolio assessments count
      const { count: portfolioAssessments } = await supabase
        .from('esg_portfolio_assessments')
        .select('*', { count: 'exact', head: true });

      // Get materiality assessments count
      const { count: materialityAssessments } = await supabase
        .from('double_materiality_assessments')
        .select('*', { count: 'exact', head: true });

      // Get goals on track and at risk
      const { count: goalsOnTrack } = await supabase
        .from('esg_goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: goalsAtRisk } = await supabase
        .from('esg_goals')
        .select('*', { count: 'exact', head: true })
        .in('status', ['behind_schedule', 'at_risk']);

      return {
        total_programs: totalPrograms || 0,
        active_programs: activePrograms || 0,
        total_metrics: totalMetrics || 0,
        data_collection_rate: dataCollectionRate,
        carbon_footprint_total: carbonFootprintTotal,
        disclosure_completion_rate: disclosureCompletionRate,
        portfolio_assessments: portfolioAssessments || 0,
        materiality_assessments: materialityAssessments || 0,
        goals_on_track: goalsOnTrack || 0,
        goals_at_risk: goalsAtRisk || 0,
      };
    } catch (error) {
      console.error('Error fetching ESG dashboard metrics:', error);
      throw error;
    }
  }
}

export const esgService = new ESGService();
