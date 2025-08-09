import { supabase } from '../lib/supabase';
import { BusinessContinuityPlan, BCPPlanItem } from '../types/bcp';

export const bcpService = {
  // Get all business continuity plans
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

  // Get a specific business continuity plan by ID
  async getPlanById(id: string): Promise<BusinessContinuityPlan | null> {
    const { data, error } = await supabase
      .from('business_continuity_plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching plan: ${error.message}`);
    }

    return data as BusinessContinuityPlan;
  },

  // Create a new business continuity plan
  async createPlan(plan: Omit<BusinessContinuityPlan, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessContinuityPlan> {
    const { data, error } = await supabase
      .from('business_continuity_plans')
      .insert([plan])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating plan: ${error.message}`);
    }

    return data as BusinessContinuityPlan;
  },

  // Update an existing business continuity plan
  async updatePlan(id: string, plan: Partial<BusinessContinuityPlan>): Promise<BusinessContinuityPlan> {
    const { data, error } = await supabase
      .from('business_continuity_plans')
      .update(plan)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating plan: ${error.message}`);
    }

    return data as BusinessContinuityPlan;
  },

  // Delete a business continuity plan
  async deletePlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_continuity_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting plan: ${error.message}`);
    }
  },

  // Get plan items for a specific plan
  async getPlanItems(planId: string): Promise<BCPPlanItem[]> {
    const { data, error } = await supabase
      .from('bcp_plan_items')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching plan items: ${error.message}`);
    }

    return data as BCPPlanItem[];
  },

  // Create a new plan item
  async createPlanItem(item: Omit<BCPPlanItem, 'id' | 'created_at' | 'updated_at'>): Promise<BCPPlanItem> {
    const { data, error } = await supabase
      .from('bcp_plan_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating plan item: ${error.message}`);
    }

    return data as BCPPlanItem;
  },

  // Update a plan item
  async updatePlanItem(id: string, item: Partial<BCPPlanItem>): Promise<BCPPlanItem> {
    const { data, error } = await supabase
      .from('bcp_plan_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating plan item: ${error.message}`);
    }

    return data as BCPPlanItem;
  },

  // Delete a plan item
  async deletePlanItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('bcp_plan_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting plan item: ${error.message}`);
    }
  },
};

// ---------- Client-side helpers for BCM analytics/UI ----------

export interface PlanKpis {
  totalPlans: number;
  activePlans: number;
  draftPlans: number;
  inactivePlans: number;
  avgCriticalFunctionsPerPlan: number;
  avgContactsPerPlan: number;
}

export interface PlanMetrics {
  criticalFunctionsCount: number;
  emergencyContactsCount: number;
  averageRtoHours: number | null;
  highPriorityFunctions: number;
  readinessScore: number; // 0-100
  lastUpdatedDaysAgo: number | null;
}

/**
 * Compute high-level KPIs across a set of BCPs without additional API calls.
 */
export function computeKpis(plans: BusinessContinuityPlan[]): PlanKpis {
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.status === 'active').length;
  const draftPlans = plans.filter((p) => p.status === 'draft').length;
  const inactivePlans = plans.filter((p) => p.status !== 'active' && p.status !== 'draft').length;

  const avgCriticalFunctionsPerPlan =
    totalPlans === 0
      ? 0
      : plans.reduce((sum, p) => sum + (p.critical_functions?.length ?? 0), 0) / totalPlans;
  const avgContactsPerPlan =
    totalPlans === 0
      ? 0
      : plans.reduce((sum, p) => sum + (p.emergency_contacts?.length ?? 0), 0) / totalPlans;

  return {
    totalPlans,
    activePlans,
    draftPlans,
    inactivePlans,
    avgCriticalFunctionsPerPlan: Number(avgCriticalFunctionsPerPlan.toFixed(1)),
    avgContactsPerPlan: Number(avgContactsPerPlan.toFixed(1)),
  };
}

/**
 * Compute per-plan metrics and an opinionated readiness score based on available data.
 */
export function computePlanMetrics(plan: BusinessContinuityPlan): PlanMetrics {
  const criticalFunctionsCount = plan.critical_functions?.length ?? 0;
  const emergencyContactsCount = plan.emergency_contacts?.length ?? 0;
  const rtos = (plan.recovery_time_objectives ?? []).map((r) => r.rto_hours).filter((n) => Number.isFinite(n));
  const averageRtoHours = rtos.length > 0 ? rtos.reduce((a, b) => a + b, 0) / rtos.length : null;
  const highPriorityFunctions = (plan.critical_functions ?? []).filter((f) => f.recovery_priority === 'high').length;

  // Simple readiness scoring model (0-100)
  // We reward presence of functions, contacts, and RTO coverage, and penalize long average RTOs
  const hasFunctions = criticalFunctionsCount > 0;
  const hasContacts = emergencyContactsCount > 0;
  const hasRto = (plan.recovery_time_objectives?.length ?? 0) > 0;
  let readinessScore = 0;
  readinessScore += hasFunctions ? 35 : 0;
  readinessScore += hasContacts ? 35 : 0;
  readinessScore += hasRto ? 20 : 0;
  if (averageRtoHours != null) {
    readinessScore += averageRtoHours <= 8 ? 10 : averageRtoHours <= 24 ? 5 : 0;
  }
  readinessScore = Math.min(100, Math.max(0, Math.round(readinessScore)));

  const lastUpdatedDaysAgo = plan.updated_at ? Math.round((Date.now() - new Date(plan.updated_at).getTime()) / (1000 * 60 * 60 * 24)) : null;

  return {
    criticalFunctionsCount,
    emergencyContactsCount,
    averageRtoHours: averageRtoHours != null ? Number(averageRtoHours.toFixed(1)) : null,
    highPriorityFunctions,
    readinessScore,
    lastUpdatedDaysAgo,
  };
}

export type PlanStatusFilter = 'all' | 'active' | 'draft' | 'inactive';

/**
 * Client-side filtering and sorting for BCP plans
 */
export function filterAndSortPlans(
  plans: BusinessContinuityPlan[],
  options: {
    query?: string;
    status?: PlanStatusFilter;
    owner?: string;
    sortBy?: 'updated' | 'name' | 'readiness';
    sortDir?: 'asc' | 'desc';
  } = {}
): BusinessContinuityPlan[] {
  const { query = '', status = 'all', owner = '', sortBy = 'updated', sortDir = 'desc' } = options;
  const q = query.trim().toLowerCase();
  const ownerQ = owner.trim().toLowerCase();

  let result = plans.filter((p) => {
    const matchesQuery = q
      ? [p.name, p.description, p.owner, p.version]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(q))
      : true;
    const matchesStatus = status === 'all' ? true : p.status === status;
    const matchesOwner = ownerQ ? (p.owner || '').toLowerCase().includes(ownerQ) : true;
    return matchesQuery && matchesStatus && matchesOwner;
  });

  result = result.sort((a, b) => {
    if (sortBy === 'name') {
      const c = a.name.localeCompare(b.name);
      return sortDir === 'asc' ? c : -c;
    }
    if (sortBy === 'readiness') {
      const aScore = computePlanMetrics(a).readinessScore;
      const bScore = computePlanMetrics(b).readinessScore;
      return sortDir === 'asc' ? aScore - bScore : bScore - aScore;
    }
    // default: updated
    const aT = new Date(a.updated_at || a.created_at).getTime();
    const bT = new Date(b.updated_at || b.created_at).getTime();
    return sortDir === 'asc' ? aT - bT : bT - aT;
  });

  return result;
}

