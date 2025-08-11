import { supabase } from '../lib/supabase';
import {
  ThirdParty,
  ThirdPartyAssessment,
  ThirdPartyEngagement,
  ThirdPartyGovernance,
  ThirdPartySecurityMonitoring,
  ThirdPartyDueDiligence,
  ThirdPartyPerformance,
  ThirdPartyIncident,
  ThirdPartyContract,
  ThirdPartyRiskCategory,
  ThirdPartyFormData,
  ThirdPartyAssessmentFormData,
  ThirdPartyEngagementFormData,
  ThirdPartyDashboardStats,
  ThirdPartyRiskDistribution,
  ThirdPartyAssessmentTrend,
  ThirdPartyIncidentTrend,
  ThirdPartyPerformanceMetrics,
  ThirdPartySearchFilters,
  ThirdPartyAssessmentFilters,
  ThirdPartyIncidentFilters
} from '../types/thirdPartyRiskManagement';

export class ThirdPartyRiskManagementService {
  // Third Party Catalog Operations
  async getThirdParties(filters?: ThirdPartySearchFilters, page = 1, limit = 10): Promise<{ data: ThirdParty[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('third_parties')
        .select('*, business_units(name)', { count: 'exact' });

      // Apply filters
      if (filters) {
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%,vendor_id.ilike.%${filters.search}%`);
        }
        if (filters.risk_classification && filters.risk_classification.length > 0) {
          query = query.in('risk_classification', filters.risk_classification);
        }
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }
        if (filters.vendor_type && filters.vendor_type.length > 0) {
          query = query.in('vendor_type', filters.vendor_type);
        }
        if (filters.business_unit_id) {
          query = query.eq('business_unit_id', filters.business_unit_id);
        }
        if (filters.assessment_overdue) {
          query = query.lt('next_assessment_date', new Date().toISOString().split('T')[0]);
        }
        if (filters.contract_expiring_soon) {
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          query = query.lt('contract_end_date', thirtyDaysFromNow.toISOString().split('T')[0]);
        }
        if (filters.high_risk_only) {
          query = query.in('risk_classification', ['high', 'critical']);
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async getThirdParty(id: string): Promise<{ data: ThirdParty | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_parties')
        .select('*, business_units(name)')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createThirdParty(thirdParty: ThirdPartyFormData): Promise<{ data: ThirdParty | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_parties')
        .insert([thirdParty])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateThirdParty(id: string, updates: Partial<ThirdPartyFormData>): Promise<{ data: ThirdParty | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_parties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteThirdParty(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('third_parties')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Third Party Assessment Operations
  async getAssessments(filters?: ThirdPartyAssessmentFilters, page = 1, limit = 10): Promise<{ data: ThirdPartyAssessment[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('third_party_assessments')
        .select('*, third_parties(name), users(email)', { count: 'exact' });

      if (filters) {
        if (filters.third_party_id) {
          query = query.eq('third_party_id', filters.third_party_id);
        }
        if (filters.assessment_type && filters.assessment_type.length > 0) {
          query = query.in('assessment_type', filters.assessment_type);
        }
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }
        if (filters.date_from) {
          query = query.gte('assessment_date', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('assessment_date', filters.date_to);
        }
        if (filters.risk_level && filters.risk_level.length > 0) {
          query = query.in('risk_level', filters.risk_level);
        }
        if (filters.assessor_id) {
          query = query.eq('assessor_id', filters.assessor_id);
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('assessment_date', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async createAssessment(assessment: ThirdPartyAssessmentFormData): Promise<{ data: ThirdPartyAssessment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_party_assessments')
        .insert([assessment])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateAssessment(id: string, updates: Partial<ThirdPartyAssessmentFormData>): Promise<{ data: ThirdPartyAssessment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_party_assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Third Party Engagement Operations
  async getEngagements(thirdPartyId?: string, page = 1, limit = 10): Promise<{ data: ThirdPartyEngagement[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('third_party_engagements')
        .select('*, third_parties(name), business_units(name)', { count: 'exact' });

      if (thirdPartyId) {
        query = query.eq('third_party_id', thirdPartyId);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async createEngagement(engagement: ThirdPartyEngagementFormData): Promise<{ data: ThirdPartyEngagement | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_party_engagements')
        .insert([engagement])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Third Party Security Monitoring Operations
  async getSecurityMonitoring(thirdPartyId?: string, page = 1, limit = 10): Promise<{ data: ThirdPartySecurityMonitoring[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('third_party_security_monitoring')
        .select('*, third_parties(name)', { count: 'exact' });

      if (thirdPartyId) {
        query = query.eq('third_party_id', thirdPartyId);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('monitoring_date', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  // Third Party Incidents Operations
  async getIncidents(filters?: ThirdPartyIncidentFilters, page = 1, limit = 10): Promise<{ data: ThirdPartyIncident[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('third_party_incidents')
        .select('*, third_parties(name)', { count: 'exact' });

      if (filters) {
        if (filters.third_party_id) {
          query = query.eq('third_party_id', filters.third_party_id);
        }
        if (filters.incident_type && filters.incident_type.length > 0) {
          query = query.in('incident_type', filters.incident_type);
        }
        if (filters.severity && filters.severity.length > 0) {
          query = query.in('severity', filters.severity);
        }
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }
        if (filters.date_from) {
          query = query.gte('incident_date', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('incident_date', filters.date_to);
        }
        if (filters.business_unit_id) {
          query = query.eq('business_unit_id', filters.business_unit_id);
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('incident_date', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async createIncident(incident: Partial<ThirdPartyIncident>): Promise<{ data: ThirdPartyIncident | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_party_incidents')
        .insert([incident])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Third Party Contracts Operations
  async getContracts(thirdPartyId?: string, page = 1, limit = 10): Promise<{ data: ThirdPartyContract[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('third_party_contracts')
        .select('*, third_parties(name)', { count: 'exact' });

      if (thirdPartyId) {
        query = query.eq('third_party_id', thirdPartyId);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  // Dashboard Analytics
  async getDashboardStats(): Promise<{ data: ThirdPartyDashboardStats | null; error: any }> {
    try {
      // Get total third parties
      const { count: totalThirdParties } = await supabase
        .from('third_parties')
        .select('*', { count: 'exact', head: true });

      // Get active third parties
      const { count: activeThirdParties } = await supabase
        .from('third_parties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get high risk third parties
      const { count: highRiskThirdParties } = await supabase
        .from('third_parties')
        .select('*', { count: 'exact', head: true })
        .eq('risk_classification', 'high');

      // Get critical risk third parties
      const { count: criticalRiskThirdParties } = await supabase
        .from('third_parties')
        .select('*', { count: 'exact', head: true })
        .eq('risk_classification', 'critical');

      // Get overdue assessments
      const { count: overdueAssessments } = await supabase
        .from('third_parties')
        .select('*', { count: 'exact', head: true })
        .lt('next_assessment_date', new Date().toISOString().split('T')[0]);

      // Get upcoming renewals (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const { count: upcomingRenewals } = await supabase
        .from('third_parties')
        .select('*', { count: 'exact', head: true })
        .lt('contract_end_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gte('contract_end_date', new Date().toISOString().split('T')[0]);

      // Get active incidents
      const { count: activeIncidents } = await supabase
        .from('third_party_incidents')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'investigating']);

      // Get average risk score
      const { data: riskScores } = await supabase
        .from('third_parties')
        .select('risk_score');

      const averageRiskScore = riskScores && riskScores.length > 0
        ? riskScores.reduce((sum, item) => sum + (item.risk_score || 0), 0) / riskScores.length
        : 0;

      const stats: ThirdPartyDashboardStats = {
        total_third_parties: totalThirdParties || 0,
        active_third_parties: activeThirdParties || 0,
        high_risk_third_parties: highRiskThirdParties || 0,
        critical_risk_third_parties: criticalRiskThirdParties || 0,
        overdue_assessments: overdueAssessments || 0,
        upcoming_renewals: upcomingRenewals || 0,
        active_incidents: activeIncidents || 0,
        average_risk_score: Math.round(averageRiskScore)
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getRiskDistribution(): Promise<{ data: ThirdPartyRiskDistribution[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_parties')
        .select('risk_classification');

      if (error) return { data: [], error };

      const distribution = data?.reduce((acc, item) => {
        const level = item.risk_classification;
        const existing = acc.find(d => d.risk_level === level);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ risk_level: level, count: 1, percentage: 0 });
        }
        return acc;
      }, [] as ThirdPartyRiskDistribution[]) || [];

      const total = distribution.reduce((sum, item) => sum + item.count, 0);
      distribution.forEach(item => {
        item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
      });

      return { data: distribution, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  async getAssessmentTrends(months = 12): Promise<{ data: ThirdPartyAssessmentTrend[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_party_assessments')
        .select('assessment_date, overall_risk_score')
        .gte('assessment_date', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) return { data: [], error };

      const trends = data?.reduce((acc, item) => {
        const month = new Date(item.assessment_date).toISOString().slice(0, 7);
        const existing = acc.find(t => t.month === month);
        if (existing) {
          existing.assessments_completed++;
          existing.average_risk_score = Math.round((existing.average_risk_score + (item.overall_risk_score || 0)) / 2);
        } else {
          acc.push({
            month,
            assessments_completed: 1,
            average_risk_score: item.overall_risk_score || 0
          });
        }
        return acc;
      }, [] as ThirdPartyAssessmentTrend[]) || [];

      return { data: trends.sort((a, b) => a.month.localeCompare(b.month)), error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  async getIncidentTrends(months = 12): Promise<{ data: ThirdPartyIncidentTrend[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_party_incidents')
        .select('incident_date, severity')
        .gte('incident_date', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) return { data: [], error };

      const trends = data?.reduce((acc, item) => {
        const month = new Date(item.incident_date).toISOString().slice(0, 7);
        const existing = acc.find(t => t.month === month);
        if (existing) {
          existing.incidents_count++;
          if (item.severity === 'critical') {
            existing.critical_incidents++;
          }
        } else {
          acc.push({
            month,
            incidents_count: 1,
            critical_incidents: item.severity === 'critical' ? 1 : 0
          });
        }
        return acc;
      }, [] as ThirdPartyIncidentTrend[]) || [];

      return { data: trends.sort((a, b) => a.month.localeCompare(b.month)), error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Risk Categories
  async getRiskCategories(): Promise<{ data: ThirdPartyRiskCategory[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('third_party_risk_categories')
        .select('*')
        .order('category_name');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Business Units for dropdowns
  async getBusinessUnits(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('business_units')
        .select('id, name')
        .order('name');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Users for dropdowns
  async getUsers(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .order('first_name');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Calculate risk score for a third party
  async calculateRiskScore(thirdPartyId: string): Promise<{ data: number; error: any }> {
    try {
      // Get the latest assessment
      const { data: assessment } = await supabase
        .from('third_party_assessments')
        .select('financial_risk_score, operational_risk_score, compliance_risk_score, security_risk_score, reputational_risk_score, strategic_risk_score')
        .eq('third_party_id', thirdPartyId)
        .eq('status', 'completed')
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single();

      if (!assessment) {
        return { data: 0, error: null };
      }

      // Calculate weighted average based on risk categories
      const { data: categories } = await this.getRiskCategories();
      const totalWeight = categories.reduce((sum, cat) => sum + cat.risk_weight, 0);

      let weightedScore = 0;
      if (assessment.financial_risk_score) {
        const financialCategory = categories.find(c => c.category_name === 'Financial Risk');
        weightedScore += (assessment.financial_risk_score * (financialCategory?.risk_weight || 1));
      }
      if (assessment.operational_risk_score) {
        const operationalCategory = categories.find(c => c.category_name === 'Operational Risk');
        weightedScore += (assessment.operational_risk_score * (operationalCategory?.risk_weight || 1));
      }
      if (assessment.compliance_risk_score) {
        const complianceCategory = categories.find(c => c.category_name === 'Compliance Risk');
        weightedScore += (assessment.compliance_risk_score * (complianceCategory?.risk_weight || 1));
      }
      if (assessment.security_risk_score) {
        const securityCategory = categories.find(c => c.category_name === 'Security Risk');
        weightedScore += (assessment.security_risk_score * (securityCategory?.risk_weight || 1));
      }
      if (assessment.reputational_risk_score) {
        const reputationalCategory = categories.find(c => c.category_name === 'Reputational Risk');
        weightedScore += (assessment.reputational_risk_score * (reputationalCategory?.risk_weight || 1));
      }

      const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
      return { data: finalScore, error: null };
    } catch (error) {
      return { data: 0, error };
    }
  }

  // Update third party risk score
  async updateRiskScore(thirdPartyId: string): Promise<{ error: any }> {
    try {
      const { data: riskScore } = await this.calculateRiskScore(thirdPartyId);
      
      const { error } = await supabase
        .from('third_parties')
        .update({ risk_score: riskScore })
        .eq('id', thirdPartyId);

      return { error };
    } catch (error) {
      return { error };
    }
  }
}

export const thirdPartyRiskManagementService = new ThirdPartyRiskManagementService();
