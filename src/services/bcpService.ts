import { supabase } from '../lib/supabase';
import { 
  BusinessContinuityPlan, 
  CriticalFunction,
  ITContinuityPlan,
  RecoveryTimeObjective,
  EmergencyContact,
  BCMRiskAssessment,
  BCMTestingExercise,
  BCMCommunicationPlan,
  BCMResource,
  BCMIncident,
  BCMMetric,
  BCMDashboardStats,
  BCMKPIMetrics,
  BCMPlanMetrics,
  BCMFilterOptions,
  BCMPlanStatusFilter,
  CreateBCMPlanForm,
  CreateCriticalFunctionForm,
  CreateRTOForm,
  CreateEmergencyContactForm,
  CreateRiskAssessmentForm,
  CreateTestingExerciseForm
} from '../types/bcp';

export const bcpService = {
  // Enhanced Business Continuity Plans
  async getPlans(): Promise<BusinessContinuityPlan[]> {
    const { data, error } = await supabase
      .from('business_continuity_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching plans: ${error.message}`);
    }

    return data as BusinessContinuityPlan[];
  },

  async getPlanById(id: string): Promise<BusinessContinuityPlan | null> {
    const { data, error } = await supabase
      .from('business_continuity_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching plan: ${error.message}`);
    }

    return data as BusinessContinuityPlan;
  },

  async createPlan(plan: CreateBCMPlanForm): Promise<BusinessContinuityPlan> {
    const { data, error } = await supabase
      .from('business_continuity_plans')
      .insert([{
        ...plan,
        status: 'draft',
        version: '1.0',
        owner: (await supabase.auth.getUser()).data.user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating plan: ${error.message}`);
    }

    return data as BusinessContinuityPlan;
  },

  async updatePlan(id: string, updates: Partial<BusinessContinuityPlan>): Promise<BusinessContinuityPlan> {
    const { data, error } = await supabase
      .from('business_continuity_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating plan: ${error.message}`);
    }

    return data as BusinessContinuityPlan;
  },

  async deletePlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_continuity_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting plan: ${error.message}`);
    }
  },

  // Critical Functions
  async getCriticalFunctions(planId: string): Promise<CriticalFunction[]> {
    const { data, error } = await supabase
      .from('bcm_critical_functions')
      .select('*')
      .eq('plan_id', planId)
      .order('recovery_priority', { ascending: false });

    if (error) {
      throw new Error(`Error fetching critical functions: ${error.message}`);
    }

    return data as CriticalFunction[];
  },

  async createCriticalFunction(functionData: CreateCriticalFunctionForm & { plan_id: string }): Promise<CriticalFunction> {
    const { data, error } = await supabase
      .from('bcm_critical_functions')
      .insert([functionData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating critical function: ${error.message}`);
    }

    return data as CriticalFunction;
  },

  async updateCriticalFunction(id: string, updates: Partial<CriticalFunction>): Promise<CriticalFunction> {
    const { data, error } = await supabase
      .from('bcm_critical_functions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating critical function: ${error.message}`);
    }

    return data as CriticalFunction;
  },

  async deleteCriticalFunction(id: string): Promise<void> {
    const { error } = await supabase
      .from('bcm_critical_functions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting critical function: ${error.message}`);
    }
  },

  // IT Continuity Plans
  async getITContinuityPlans(planId: string): Promise<ITContinuityPlan[]> {
    const { data, error } = await supabase
      .from('bcm_it_continuity_plans')
      .select('*')
      .eq('plan_id', planId);

    if (error) {
      throw new Error(`Error fetching IT continuity plans: ${error.message}`);
    }

    return data as ITContinuityPlan[];
  },

  async createITContinuityPlan(itPlan: Omit<ITContinuityPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ITContinuityPlan> {
    const { data, error } = await supabase
      .from('bcm_it_continuity_plans')
      .insert([itPlan])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating IT continuity plan: ${error.message}`);
    }

    return data as ITContinuityPlan;
  },

  // Recovery Time Objectives
  async getRTOs(planId: string): Promise<RecoveryTimeObjective[]> {
    const { data, error } = await supabase
      .from('bcm_recovery_time_objectives')
      .select('*')
      .eq('plan_id', planId)
      .order('rto_hours', { ascending: true });

    if (error) {
      throw new Error(`Error fetching RTOs: ${error.message}`);
    }

    return data as RecoveryTimeObjective[];
  },

  async createRTO(rtoData: CreateRTOForm & { plan_id: string; function_id?: string }): Promise<RecoveryTimeObjective> {
    const { data, error } = await supabase
      .from('bcm_recovery_time_objectives')
      .insert([rtoData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating RTO: ${error.message}`);
    }

    return data as RecoveryTimeObjective;
  },

  // Emergency Contacts
  async getEmergencyContacts(planId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('bcm_emergency_contacts')
      .select('*')
      .eq('plan_id', planId)
      .order('escalation_level', { ascending: true });

    if (error) {
      throw new Error(`Error fetching emergency contacts: ${error.message}`);
    }

    return data as EmergencyContact[];
  },

  async createEmergencyContact(contactData: CreateEmergencyContactForm & { plan_id: string }): Promise<EmergencyContact> {
    const { data, error } = await supabase
      .from('bcm_emergency_contacts')
      .insert([contactData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating emergency contact: ${error.message}`);
    }

    return data as EmergencyContact;
  },

  // Risk Assessments
  async getRiskAssessments(planId: string): Promise<BCMRiskAssessment[]> {
    const { data, error } = await supabase
      .from('bcm_risk_assessments')
      .select('*')
      .eq('plan_id', planId)
      .order('risk_score', { ascending: false });

    if (error) {
      throw new Error(`Error fetching risk assessments: ${error.message}`);
    }

    return data as BCMRiskAssessment[];
  },

  async createRiskAssessment(riskData: CreateRiskAssessmentForm & { plan_id: string }): Promise<BCMRiskAssessment> {
    const { data, error } = await supabase
      .from('bcm_risk_assessments')
      .insert([riskData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating risk assessment: ${error.message}`);
    }

    return data as BCMRiskAssessment;
  },

  // Testing and Exercises
  async getTestingExercises(planId: string): Promise<BCMTestingExercise[]> {
    const { data, error } = await supabase
      .from('bcm_testing_exercises')
      .select('*')
      .eq('plan_id', planId)
      .order('start_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching testing exercises: ${error.message}`);
    }

    return data as BCMTestingExercise[];
  },

  async createTestingExercise(exerciseData: CreateTestingExerciseForm & { plan_id: string }): Promise<BCMTestingExercise> {
    const { data, error } = await supabase
      .from('bcm_testing_exercises')
      .insert([exerciseData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating testing exercise: ${error.message}`);
    }

    return data as BCMTestingExercise;
  },

  // Communication Plans
  async getCommunicationPlans(planId: string): Promise<BCMCommunicationPlan[]> {
    const { data, error } = await supabase
      .from('bcm_communication_plans')
      .select('*')
      .eq('plan_id', planId);

    if (error) {
      throw new Error(`Error fetching communication plans: ${error.message}`);
    }

    return data as BCMCommunicationPlan[];
  },

  // Resources
  async getResources(planId: string): Promise<BCMResource[]> {
    const { data, error } = await supabase
      .from('bcm_resources')
      .select('*')
      .eq('plan_id', planId)
      .order('criticality_level', { ascending: false });

    if (error) {
      throw new Error(`Error fetching resources: ${error.message}`);
    }

    return data as BCMResource[];
  },

  // Incidents
  async getIncidents(planId: string): Promise<BCMIncident[]> {
    const { data, error } = await supabase
      .from('bcm_incidents')
      .select('*')
      .eq('plan_id', planId)
      .order('reported_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching incidents: ${error.message}`);
    }

    return data as BCMIncident[];
  },

  async createIncident(incidentData: Omit<BCMIncident, 'id' | 'created_at' | 'updated_at'>): Promise<BCMIncident> {
    const { data, error } = await supabase
      .from('bcm_incidents')
      .insert([incidentData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating incident: ${error.message}`);
    }

    return data as BCMIncident;
  },

  // Metrics
  async getMetrics(planId: string): Promise<BCMMetric[]> {
    const { data, error } = await supabase
      .from('bcm_metrics')
      .select('*')
      .eq('plan_id', planId)
      .order('metric_name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching metrics: ${error.message}`);
    }

    return data as BCMMetric[];
  },

  // Dashboard Analytics
  async getDashboardStats(): Promise<BCMDashboardStats> {
    const { data: plans } = await supabase
      .from('business_continuity_plans')
      .select('status, criticality_level, approval_status, last_exercise_date, mtta_hours, mttr_hours');

    const { data: incidents } = await supabase
      .from('bcm_incidents')
      .select('status')
      .eq('status', 'open');

    const { data: exercises } = await supabase
      .from('bcm_testing_exercises')
      .select('start_date, status')
      .gte('start_date', new Date().toISOString())
      .eq('status', 'planned');

    const totalPlans = plans?.length || 0;
    const activePlans = plans?.filter(p => p.status === 'active').length || 0;
    const plansNeedingReview = plans?.filter(p => 
      p.last_exercise_date && 
      new Date(p.last_exercise_date) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    ).length || 0;
    const upcomingExercises = exercises?.length || 0;
    const openIncidents = incidents?.length || 0;

    const averageRTO = plans?.reduce((acc, p) => acc + (p.mttr_hours || 24), 0) / totalPlans || 24;
    const averageRPO = plans?.reduce((acc, p) => acc + (p.mtta_hours || 4), 0) / totalPlans || 4;

    const readinessScore = calculateReadinessScore(plans || []);

    return {
      total_plans: totalPlans,
      active_plans: activePlans,
      plans_needing_review: plansNeedingReview,
      upcoming_exercises: upcomingExercises,
      open_incidents: openIncidents,
      average_rto_hours: averageRTO,
      average_rpo_hours: averageRPO,
      overall_readiness_score: readinessScore,
      compliance_status: readinessScore >= 80 ? 'compliant' : readinessScore >= 60 ? 'partial' : 'non_compliant',
      last_updated: new Date().toISOString()
    };
  },

  async getKPIMetrics(): Promise<BCMKPIMetrics> {
    const { data: plans } = await supabase
      .from('business_continuity_plans')
      .select('mtta_hours, mttr_hours, availability_target');

    const { data: exercises } = await supabase
      .from('bcm_testing_exercises')
      .select('start_date, status');

    const { data: risks } = await supabase
      .from('bcm_risk_assessments')
      .select('risk_level, status');

    const currentYear = new Date().getFullYear();
    const exercisesThisYear = exercises?.filter(e => 
      new Date(e.start_date).getFullYear() === currentYear && e.status === 'completed'
    ).length || 0;

    const plannedExercises = exercises?.filter(e => 
      new Date(e.start_date).getFullYear() === currentYear && e.status === 'planned'
    ).length || 0;

    const averageRTO = plans?.reduce((acc, p) => acc + (p.mttr_hours || 24), 0) / (plans?.length || 1) || 24;
    const averageRPO = plans?.reduce((acc, p) => acc + (p.mtta_hours || 4), 0) / (plans?.length || 1) || 4;
    const averageMTTA = plans?.reduce((acc, p) => acc + (p.mtta_hours || 4), 0) / (plans?.length || 1) || 4;
    const averageMTTR = plans?.reduce((acc, p) => acc + (p.mttr_hours || 24), 0) / (plans?.length || 1) || 24;

    const currentAvailability = plans?.reduce((acc, p) => acc + (p.availability_target || 0.9999), 0) / (plans?.length || 1) || 0.9999;

    const highRiskItems = risks?.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length || 0;
    const mediumRiskItems = risks?.filter(r => r.risk_level === 'medium').length || 0;
    const lowRiskItems = risks?.filter(r => r.risk_level === 'low').length || 0;
    const mitigatedRisks = risks?.filter(r => r.status === 'mitigated').length || 0;

    return {
      availability_metrics: {
        current_availability: currentAvailability,
        target_availability: 0.9999,
        trend: currentAvailability >= 0.9999 ? 'improving' : currentAvailability >= 0.9995 ? 'stable' : 'declining'
      },
      recovery_metrics: {
        average_rto: averageRTO,
        average_rpo: averageRPO,
        average_mtta: averageMTTA,
        average_mttr: averageMTTR
      },
      testing_metrics: {
        exercises_completed_this_year: exercisesThisYear,
        exercises_planned_this_year: plannedExercises,
        last_exercise_date: exercises?.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0]?.start_date || null,
        next_exercise_date: exercises?.filter(e => e.status === 'planned').sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0]?.start_date || null
      },
      risk_metrics: {
        high_risk_items: highRiskItems,
        medium_risk_items: mediumRiskItems,
        low_risk_items: lowRiskItems,
        mitigated_risks: mitigatedRisks
      },
      compliance_metrics: {
        compliant_plans: plans?.filter(p => p.status === 'active').length || 0,
        non_compliant_plans: plans?.filter(p => p.status === 'inactive').length || 0,
        pending_reviews: plans?.filter(p => p.approval_status === 'pending').length || 0
      }
    };
  },

  // Filtering and Search
  async getFilteredPlans(filters: BCMFilterOptions): Promise<BusinessContinuityPlan[]> {
    let query = supabase
      .from('business_continuity_plans')
      .select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.plan_type) {
      query = query.eq('plan_type', filters.plan_type);
    }
    if (filters.business_unit) {
      query = query.eq('business_unit', filters.business_unit);
    }
    if (filters.global_region) {
      query = query.eq('global_region', filters.global_region);
    }
    if (filters.criticality_level) {
      query = query.eq('criticality_level', filters.criticality_level);
    }
    if (filters.approval_status) {
      query = query.eq('approval_status', filters.approval_status);
    }
    if (filters.date_range) {
      query = query.gte('created_at', filters.date_range.start_date)
                   .lte('created_at', filters.date_range.end_date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching filtered plans: ${error.message}`);
    }

    return data as BusinessContinuityPlan[];
  },

  // Utility Functions
  async getPlanMetrics(planId: string): Promise<BCMPlanMetrics> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const criticalFunctions = await this.getCriticalFunctions(planId);
    const emergencyContacts = await this.getEmergencyContacts(planId);
    const rtos = await this.getRTOs(planId);
    const incidents = await this.getIncidents(planId);

    const readinessScore = calculatePlanReadinessScore(plan, criticalFunctions, rtos);

    return {
      plan_id: planId,
      plan_name: plan.name,
      readiness_score: readinessScore,
      last_exercise_date: plan.last_exercise_date,
      next_exercise_date: plan.next_review_date,
      risk_level: plan.criticality_level,
      compliance_status: plan.approval_status,
      critical_functions_count: criticalFunctions.length,
      emergency_contacts_count: emergencyContacts.length,
      rto_objectives_count: rtos.length,
      open_incidents_count: incidents.filter(i => i.status === 'open').length
    };
  }
};

// Helper Functions
function calculateReadinessScore(plans: any[]): number {
  if (plans.length === 0) return 0;

  const scores = plans.map(plan => {
    let score = 0;
    
    // Status score (40%)
    if (plan.status === 'active') score += 40;
    else if (plan.status === 'draft') score += 20;
    
    // Exercise score (30%)
    if (plan.last_exercise_date) {
      const daysSinceExercise = (Date.now() - new Date(plan.last_exercise_date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceExercise <= 90) score += 30;
      else if (daysSinceExercise <= 365) score += 20;
      else score += 10;
    }
    
    // Approval score (20%)
    if (plan.approval_status === 'approved') score += 20;
    else if (plan.approval_status === 'pending') score += 10;
    
    // Criticality score (10%)
    if (plan.criticality_level === 'critical') score += 10;
    else if (plan.criticality_level === 'high') score += 8;
    else if (plan.criticality_level === 'medium') score += 6;
    else score += 4;
    
    return score;
  });

  return Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
}

function calculatePlanReadinessScore(plan: BusinessContinuityPlan, criticalFunctions: CriticalFunction[], rtos: RecoveryTimeObjective[]): number {
  let score = 0;
  
  // Plan status (25%)
  if (plan.status === 'active') score += 25;
  else if (plan.status === 'draft') score += 15;
  
  // Critical functions (25%)
  if (criticalFunctions.length > 0) {
    const functionScores = criticalFunctions.map(f => {
      let fScore = 0;
      if (f.status === 'active') fScore += 10;
      if (f.recovery_strategy) fScore += 10;
      if (f.last_tested_date) fScore += 5;
      return fScore;
    });
    score += Math.min(25, functionScores.reduce((acc, s) => acc + s, 0) / criticalFunctions.length);
  }
  
  // RTOs (25%)
  if (rtos.length > 0) {
    const rtoScores = rtos.map(r => {
      let rScore = 0;
      if (r.status === 'active') rScore += 10;
      if (r.recovery_strategy) rScore += 10;
      if (r.last_tested_date) rScore += 5;
      return rScore;
    });
    score += Math.min(25, rtoScores.reduce((acc, s) => acc + s, 0) / rtos.length);
  }
  
  // Exercise history (25%)
  if (plan.last_exercise_date) {
    const daysSinceExercise = (Date.now() - new Date(plan.last_exercise_date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceExercise <= 90) score += 25;
    else if (daysSinceExercise <= 365) score += 15;
    else score += 5;
  }
  
  return Math.round(score);
}

// Legacy functions for backward compatibility
export const computeKpis = (plans: BusinessContinuityPlan[]) => {
  return {
    total: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    draft: plans.filter(p => p.status === 'draft').length,
    inactive: plans.filter(p => p.status === 'inactive').length,
  };
};

export const computePlanMetrics = (plan: BusinessContinuityPlan) => {
  return {
    readiness_score: calculatePlanReadinessScore(plan, [], []),
    last_exercise_days: plan.last_exercise_date 
      ? Math.floor((Date.now() - new Date(plan.last_exercise_date).getTime()) / (1000 * 60 * 60 * 24))
      : null,
    next_review_days: plan.next_review_date
      ? Math.floor((new Date(plan.next_review_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  };
};

export const filterAndSortPlans = (
  plans: BusinessContinuityPlan[],
  filters: {
    query: string;
    status: BCMPlanStatusFilter['status'];
    owner: string;
    sortBy: 'updated' | 'name' | 'readiness';
    sortDir: 'asc' | 'desc';
  }
) => {
  let filtered = plans;

  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.owner.toLowerCase().includes(query)
    );
  }

  if (filters.status !== 'all') {
    filtered = filtered.filter(p => p.status === filters.status);
  }

  if (filters.owner) {
    filtered = filtered.filter(p => p.owner.toLowerCase().includes(filters.owner.toLowerCase()));
  }

  return filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (filters.sortBy) {
      case 'updated':
        aVal = new Date(a.updated_at).getTime();
        bVal = new Date(b.updated_at).getTime();
        break;
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'readiness':
        aVal = calculatePlanReadinessScore(a, [], []);
        bVal = calculatePlanReadinessScore(b, [], []);
        break;
      default:
        return 0;
    }

    if (filters.sortDir === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

