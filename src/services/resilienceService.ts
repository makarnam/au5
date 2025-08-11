import { supabase } from '../lib/supabase';
import {
  ResilienceProgram,
  BusinessImpactAnalysis,
  Incident,
  Crisis,
  ScenarioAnalysis,
  ResilienceMetrics,
  ResilienceProgramItem,
  ResilienceStakeholder,
  IntegrationPoint,
  BusinessProcess,
  ImpactAssessment,
  RecoveryRequirement,
  IncidentAction,
  FollowUpAction,
  CrisisTeamMember,
  CrisisStakeholder as CrisisStakeholderType,
  CrisisCommunication,
  CrisisAction,
  Scenario,
  StressTest,
  ScenarioRecommendation
} from '../types/resilience';

export const resilienceService = {
  // Resilience Program Management
  async getPrograms(): Promise<ResilienceProgram[]> {
    const { data, error } = await supabase
      .from('resilience_programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching resilience programs: ${error.message}`);
    }

    return data as ResilienceProgram[];
  },

  async getProgramById(id: string): Promise<ResilienceProgram | null> {
    const { data, error } = await supabase
      .from('resilience_programs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching resilience program: ${error.message}`);
    }

    return data as ResilienceProgram;
  },

  async createProgram(program: Omit<ResilienceProgram, 'id' | 'created_at' | 'updated_at'>): Promise<ResilienceProgram> {
    const { data, error } = await supabase
      .from('resilience_programs')
      .insert([program])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating resilience program: ${error.message}`);
    }

    return data as ResilienceProgram;
  },

  async updateProgram(id: string, program: Partial<ResilienceProgram>): Promise<ResilienceProgram> {
    const { data, error } = await supabase
      .from('resilience_programs')
      .update(program)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating resilience program: ${error.message}`);
    }

    return data as ResilienceProgram;
  },

  async deleteProgram(id: string): Promise<void> {
    const { error } = await supabase
      .from('resilience_programs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting resilience program: ${error.message}`);
    }
  },

  // Business Impact Analysis
  async getBusinessImpactAnalyses(programId?: string): Promise<BusinessImpactAnalysis[]> {
    let query = supabase
      .from('business_impact_analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (programId) {
      query = query.eq('program_id', programId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching business impact analyses: ${error.message}`);
    }

    return data as BusinessImpactAnalysis[];
  },

  async getBusinessImpactAnalysisById(id: string): Promise<BusinessImpactAnalysis | null> {
    const { data, error } = await supabase
      .from('business_impact_analyses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching business impact analysis: ${error.message}`);
    }

    return data as BusinessImpactAnalysis;
  },

  async createBusinessImpactAnalysis(bia: Omit<BusinessImpactAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessImpactAnalysis> {
    const { data, error } = await supabase
      .from('business_impact_analyses')
      .insert([bia])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating business impact analysis: ${error.message}`);
    }

    return data as BusinessImpactAnalysis;
  },

  async updateBusinessImpactAnalysis(id: string, bia: Partial<BusinessImpactAnalysis>): Promise<BusinessImpactAnalysis> {
    const { data, error } = await supabase
      .from('business_impact_analyses')
      .update(bia)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating business impact analysis: ${error.message}`);
    }

    return data as BusinessImpactAnalysis;
  },

  // Business Processes
  async getBusinessProcesses(biaId: string): Promise<BusinessProcess[]> {
    const { data, error } = await supabase
      .from('business_processes')
      .select('*')
      .eq('bia_id', biaId)
      .order('criticality_level', { ascending: false });

    if (error) {
      throw new Error(`Error fetching business processes: ${error.message}`);
    }

    return data as BusinessProcess[];
  },

  async createBusinessProcess(process: Omit<BusinessProcess, 'id'>): Promise<BusinessProcess> {
    const { data, error } = await supabase
      .from('business_processes')
      .insert([process])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating business process: ${error.message}`);
    }

    return data as BusinessProcess;
  },

  async updateBusinessProcess(id: string, process: Partial<BusinessProcess>): Promise<BusinessProcess> {
    const { data, error } = await supabase
      .from('business_processes')
      .update(process)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating business process: ${error.message}`);
    }

    return data as BusinessProcess;
  },

  // Incident Management
  async getIncidents(filters?: {
    status?: string;
    severity?: string;
    incident_type?: string;
    assigned_to?: string;
  }): Promise<Incident[]> {
    let query = supabase
      .from('resilience_incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.incident_type) {
      query = query.eq('incident_type', filters.incident_type);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching incidents: ${error.message}`);
    }

    return data as Incident[];
  },

  async getIncidentById(id: string): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('resilience_incidents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching incident: ${error.message}`);
    }

    return data as Incident;
  },

  async createIncident(incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident> {
    const { data, error } = await supabase
      .from('resilience_incidents')
      .insert([incident])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating incident: ${error.message}`);
    }

    return data as Incident;
  },

  async updateIncident(id: string, incident: Partial<Incident>): Promise<Incident> {
    const { data, error } = await supabase
      .from('resilience_incidents')
      .update(incident)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating incident: ${error.message}`);
    }

    return data as Incident;
  },

  // Incident Actions
  async getIncidentActions(incidentId: string): Promise<IncidentAction[]> {
    const { data, error } = await supabase
      .from('incident_actions')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching incident actions: ${error.message}`);
    }

    return data as IncidentAction[];
  },

  async createIncidentAction(action: Omit<IncidentAction, 'id' | 'created_at'>): Promise<IncidentAction> {
    const { data, error } = await supabase
      .from('incident_actions')
      .insert([action])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating incident action: ${error.message}`);
    }

    return data as IncidentAction;
  },

  // Crisis Management
  async getCrises(filters?: {
    status?: string;
    severity?: string;
    crisis_type?: string;
  }): Promise<Crisis[]> {
    let query = supabase
      .from('crises')
      .select('*')
      .order('declared_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.crisis_type) {
      query = query.eq('crisis_type', filters.crisis_type);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching crises: ${error.message}`);
    }

    return data as Crisis[];
  },

  async getCrisisById(id: string): Promise<Crisis | null> {
    const { data, error } = await supabase
      .from('crises')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching crisis: ${error.message}`);
    }

    return data as Crisis;
  },

  async createCrisis(crisis: Omit<Crisis, 'id'>): Promise<Crisis> {
    const { data, error } = await supabase
      .from('crises')
      .insert([crisis])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating crisis: ${error.message}`);
    }

    return data as Crisis;
  },

  async updateCrisis(id: string, crisis: Partial<Crisis>): Promise<Crisis> {
    const { data, error } = await supabase
      .from('crises')
      .update(crisis)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating crisis: ${error.message}`);
    }

    return data as Crisis;
  },

  // Crisis Team Members
  async getCrisisTeamMembers(crisisId: string): Promise<CrisisTeamMember[]> {
    const { data, error } = await supabase
      .from('crisis_team_members')
      .select('*')
      .eq('crisis_id', crisisId)
      .order('escalation_level', { ascending: true });

    if (error) {
      throw new Error(`Error fetching crisis team members: ${error.message}`);
    }

    return data as CrisisTeamMember[];
  },

  async createCrisisTeamMember(member: Omit<CrisisTeamMember, 'id'>): Promise<CrisisTeamMember> {
    const { data, error } = await supabase
      .from('crisis_team_members')
      .insert([member])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating crisis team member: ${error.message}`);
    }

    return data as CrisisTeamMember;
  },

  // Scenario Analysis
  async getScenarioAnalyses(filters?: {
    status?: string;
    severity?: string;
    scenario_type?: string;
  }): Promise<ScenarioAnalysis[]> {
    let query = supabase
      .from('scenario_analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.scenario_type) {
      query = query.eq('scenario_type', filters.scenario_type);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching scenario analyses: ${error.message}`);
    }

    return data as ScenarioAnalysis[];
  },

  async getScenarioAnalysisById(id: string): Promise<ScenarioAnalysis | null> {
    const { data, error } = await supabase
      .from('scenario_analyses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching scenario analysis: ${error.message}`);
    }

    return data as ScenarioAnalysis;
  },

  async createScenarioAnalysis(analysis: Omit<ScenarioAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<ScenarioAnalysis> {
    const { data, error } = await supabase
      .from('scenario_analyses')
      .insert([analysis])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating scenario analysis: ${error.message}`);
    }

    return data as ScenarioAnalysis;
  },

  async updateScenarioAnalysis(id: string, analysis: Partial<ScenarioAnalysis>): Promise<ScenarioAnalysis> {
    const { data, error } = await supabase
      .from('scenario_analyses')
      .update(analysis)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating scenario analysis: ${error.message}`);
    }

    return data as ScenarioAnalysis;
  },

  // Scenarios
  async getScenarios(analysisId: string): Promise<Scenario[]> {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching scenarios: ${error.message}`);
    }

    return data as Scenario[];
  },

  async createScenario(scenario: Omit<Scenario, 'id'>): Promise<Scenario> {
    const { data, error } = await supabase
      .from('scenarios')
      .insert([scenario])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating scenario: ${error.message}`);
    }

    return data as Scenario;
  },

  // Stress Tests
  async getStressTests(analysisId: string): Promise<StressTest[]> {
    const { data, error } = await supabase
      .from('stress_tests')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('conducted_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching stress tests: ${error.message}`);
    }

    return data as StressTest[];
  },

  async createStressTest(test: Omit<StressTest, 'id'>): Promise<StressTest> {
    const { data, error } = await supabase
      .from('stress_tests')
      .insert([test])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating stress test: ${error.message}`);
    }

    return data as StressTest;
  },

  // Resilience Metrics
  async getResilienceMetrics(programId: string): Promise<ResilienceMetrics[]> {
    const { data, error } = await supabase
      .from('resilience_metrics')
      .select('*')
      .eq('program_id', programId)
      .order('measurement_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching resilience metrics: ${error.message}`);
    }

    return data as ResilienceMetrics[];
  },

  async createResilienceMetrics(metrics: Omit<ResilienceMetrics, 'id'>): Promise<ResilienceMetrics> {
    const { data, error } = await supabase
      .from('resilience_metrics')
      .insert([metrics])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating resilience metrics: ${error.message}`);
    }

    return data as ResilienceMetrics;
  },

  // Resilience Program Items
  async getProgramItems(programId: string): Promise<ResilienceProgramItem[]> {
    const { data, error } = await supabase
      .from('resilience_program_items')
      .select('*')
      .eq('program_id', programId)
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(`Error fetching program items: ${error.message}`);
    }

    return data as ResilienceProgramItem[];
  },

  async createProgramItem(item: Omit<ResilienceProgramItem, 'id' | 'created_at' | 'updated_at'>): Promise<ResilienceProgramItem> {
    const { data, error } = await supabase
      .from('resilience_program_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating program item: ${error.message}`);
    }

    return data as ResilienceProgramItem;
  },

  async updateProgramItem(id: string, item: Partial<ResilienceProgramItem>): Promise<ResilienceProgramItem> {
    const { data, error } = await supabase
      .from('resilience_program_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating program item: ${error.message}`);
    }

    return data as ResilienceProgramItem;
  },

  async deleteProgramItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('resilience_program_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting program item: ${error.message}`);
    }
  }
};

// Utility functions for filtering and sorting
export interface ProgramFilters {
  status?: string;
  maturity_level?: string;
  owner?: string;
  query?: string;
}

export interface ProgramMetrics {
  totalPrograms: number;
  activePrograms: number;
  draftPrograms: number;
  inactivePrograms: number;
  avgMaturityScore: number;
  programsNeedingReview: number;
  upcomingReviews: number;
}

export function filterAndSortPrograms(
  programs: ResilienceProgram[],
  options: {
    query?: string;
    status?: string;
    maturity_level?: string;
    owner?: string;
    sortBy?: 'updated' | 'name' | 'maturity' | 'status';
    sortDir?: 'asc' | 'desc';
  } = {}
): ResilienceProgram[] {
  let filtered = [...programs];

  // Apply filters
  if (options.query) {
    const query = options.query.toLowerCase();
    filtered = filtered.filter(
      program =>
        program.name.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query) ||
        program.owner.toLowerCase().includes(query)
    );
  }

  if (options.status && options.status !== 'all') {
    filtered = filtered.filter(program => program.status === options.status);
  }

  if (options.maturity_level && options.maturity_level !== 'all') {
    filtered = filtered.filter(program => program.maturity_level === options.maturity_level);
  }

  if (options.owner) {
    filtered = filtered.filter(program => 
      program.owner.toLowerCase().includes(options.owner!.toLowerCase())
    );
  }

  // Apply sorting
  const sortBy = options.sortBy || 'updated';
  const sortDir = options.sortDir || 'desc';

  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'maturity':
        const maturityOrder = { basic: 1, intermediate: 2, advanced: 3, world_class: 4 };
        aValue = maturityOrder[a.maturity_level as keyof typeof maturityOrder];
        bValue = maturityOrder[b.maturity_level as keyof typeof maturityOrder];
        break;
      case 'status':
        const statusOrder = { draft: 1, active: 2, inactive: 3, under_review: 4 };
        aValue = statusOrder[a.status as keyof typeof statusOrder];
        bValue = statusOrder[b.status as keyof typeof statusOrder];
        break;
      default:
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
    }

    if (sortDir === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filtered;
}

export function computeProgramMetrics(programs: ResilienceProgram[]): ProgramMetrics {
  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.status === 'active').length;
  const draftPrograms = programs.filter(p => p.status === 'draft').length;
  const inactivePrograms = programs.filter(p => p.status === 'inactive').length;

  const maturityScores = { basic: 25, intermediate: 50, advanced: 75, world_class: 100 };
  const avgMaturityScore = programs.length > 0 
    ? programs.reduce((sum, p) => sum + maturityScores[p.maturity_level as keyof typeof maturityScores], 0) / programs.length
    : 0;

  const programsNeedingReview = programs.filter(p => {
    if (!p.next_review_date) return false;
    const reviewDate = new Date(p.next_review_date);
    const today = new Date();
    return reviewDate <= today;
  }).length;

  const upcomingReviews = programs.filter(p => {
    if (!p.next_review_date) return false;
    const reviewDate = new Date(p.next_review_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return reviewDate > today && reviewDate <= thirtyDaysFromNow;
  }).length;

  return {
    totalPrograms,
    activePrograms,
    draftPrograms,
    inactivePrograms,
    avgMaturityScore: Math.round(avgMaturityScore),
    programsNeedingReview,
    upcomingReviews
  };
}

export function computeIncidentMetrics(incidents: Incident[]) {
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const investigatingIncidents = incidents.filter(i => i.status === 'investigating').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const highPriorityIncidents = incidents.filter(i => i.priority === 'critical' || i.priority === 'high').length;

  const avgResolutionTime = incidents
    .filter(i => i.resolved_at)
    .reduce((sum, i) => {
      const created = new Date(i.created_at).getTime();
      const resolved = new Date(i.resolved_at!).getTime();
      return sum + (resolved - created);
    }, 0) / incidents.filter(i => i.resolved_at).length || 0;

  return {
    totalIncidents,
    openIncidents,
    investigatingIncidents,
    resolvedIncidents,
    criticalIncidents,
    highPriorityIncidents,
    avgResolutionTimeHours: Math.round(avgResolutionTime / (1000 * 60 * 60))
  };
}

export function computeCrisisMetrics(crises: Crisis[]) {
  const totalCrises = crises.length;
  const activeCrises = crises.filter(c => c.status === 'active').length;
  const resolvedCrises = crises.filter(c => c.status === 'resolved').length;
  const criticalCrises = crises.filter(c => c.severity === 'critical').length;

  const avgResolutionTime = crises
    .filter(c => c.resolved_at)
    .reduce((sum, c) => {
      const declared = new Date(c.declared_at).getTime();
      const resolved = new Date(c.resolved_at!).getTime();
      return sum + (resolved - declared);
    }, 0) / crises.filter(c => c.resolved_at).length || 0;

  return {
    totalCrises,
    activeCrises,
    resolvedCrises,
    criticalCrises,
    avgResolutionTimeHours: Math.round(avgResolutionTime / (1000 * 60 * 60))
  };
}
