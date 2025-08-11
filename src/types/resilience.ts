export interface ResilienceProgram {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive' | 'under_review';
  owner: string;
  version: string;
  created_at: string;
  updated_at: string;
  maturity_level: 'basic' | 'intermediate' | 'advanced' | 'world_class';
  last_assessment_date?: string | null;
  next_review_date?: string | null;
  program_scope: string[];
  stakeholders: ResilienceStakeholder[];
  integration_points: IntegrationPoint[];
}

export interface ResilienceStakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  responsibility_level: 'primary' | 'secondary' | 'consultant';
  notification_preferences: NotificationPreference[];
}

export interface NotificationPreference {
  id: string;
  channel: 'email' | 'sms' | 'phone' | 'slack' | 'teams';
  incident_types: string[];
  priority_levels: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface IntegrationPoint {
  id: string;
  system_name: string;
  integration_type: 'risk_management' | 'it_security' | 'third_party_risk' | 'compliance' | 'operations';
  status: 'active' | 'inactive' | 'planned';
  last_sync_at?: string | null;
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
}

// Business Impact Analysis
export interface BusinessImpactAnalysis {
  id: string;
  program_id: string;
  name: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved';
  created_at: string;
  updated_at: string;
  conducted_by: string;
  approved_by?: string | null;
  business_processes: BusinessProcess[];
  impact_assessments: ImpactAssessment[];
  recovery_requirements: RecoveryRequirement[];
}

export interface BusinessProcess {
  id: string;
  name: string;
  description: string;
  department: string;
  criticality_level: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  rto_hours: number;
  rpo_hours: number;
  max_tolerable_outage: number;
  financial_impact_per_hour: number;
  regulatory_impact: string[];
  customer_impact: string;
  recovery_strategy: string;
  alternate_processes: string[];
}

export interface ImpactAssessment {
  id: string;
  process_id: string;
  impact_type: 'financial' | 'operational' | 'reputational' | 'regulatory' | 'customer';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation_measures: string[];
  assessment_date: string;
  assessed_by: string;
}

export interface RecoveryRequirement {
  id: string;
  process_id: string;
  requirement_type: 'technology' | 'personnel' | 'facility' | 'supplier' | 'data';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimated_cost: number;
  lead_time_days: number;
  dependencies: string[];
  status: 'identified' | 'planned' | 'implemented' | 'tested';
}

// Incident Management
export interface Incident {
  id: string;
  title: string;
  description: string;
  incident_type: 'cyber' | 'physical' | 'natural_disaster' | 'supply_chain' | 'operational' | 'regulatory' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  detected_at: string;
  resolved_at?: string | null;
  reported_by: string;
  assigned_to?: string | null;
  affected_systems: string[];
  affected_processes: string[];
  business_impact: string;
  containment_actions: IncidentAction[];
  resolution_actions: IncidentAction[];
  lessons_learned: string[];
  follow_up_actions: FollowUpAction[];
}

export interface IncidentAction {
  id: string;
  incident_id: string;
  action_type: 'containment' | 'investigation' | 'resolution' | 'communication' | 'escalation';
  description: string;
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string | null;
  notes: string;
  attachments: string[];
}

export interface FollowUpAction {
  id: string;
  incident_id: string;
  description: string;
  assigned_to: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'prevention' | 'detection' | 'response' | 'recovery' | 'improvement';
}

// Crisis Management
export interface Crisis {
  id: string;
  title: string;
  description: string;
  crisis_type: 'cyber_attack' | 'data_breach' | 'natural_disaster' | 'pandemic' | 'financial' | 'reputational' | 'regulatory' | 'supply_chain' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'declared' | 'active' | 'contained' | 'recovering' | 'resolved' | 'closed';
  declared_at: string;
  resolved_at?: string | null;
  declared_by: string;
  crisis_team: CrisisTeamMember[];
  stakeholders: CrisisStakeholder[];
  communications: CrisisCommunication[];
  actions: CrisisAction[];
  lessons_learned: string[];
}

export interface CrisisTeamMember {
  id: string;
  crisis_id: string;
  name: string;
  role: string;
  responsibility: string;
  contact_info: string;
  availability: 'available' | 'unavailable' | 'limited';
  escalation_level: number;
}

export interface CrisisStakeholder {
  id: string;
  crisis_id: string;
  name: string;
  organization: string;
  role: string;
  contact_info: string;
  communication_frequency: 'immediate' | 'hourly' | 'daily' | 'as_needed';
  last_contacted?: string | null;
  status: 'informed' | 'engaged' | 'consulted' | 'accountable';
}

export interface CrisisCommunication {
  id: string;
  crisis_id: string;
  audience: string;
  message: string;
  channel: 'email' | 'phone' | 'sms' | 'press_release' | 'social_media' | 'internal_announcement';
  sent_at: string;
  sent_by: string;
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  response_received?: string | null;
}

export interface CrisisAction {
  id: string;
  crisis_id: string;
  action_type: 'immediate_response' | 'containment' | 'investigation' | 'recovery' | 'communication' | 'coordination';
  description: string;
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string | null;
  completed_at?: string | null;
  notes: string;
}

// Operational Scenario Analysis
export interface ScenarioAnalysis {
  id: string;
  name: string;
  description: string;
  scenario_type: 'cyber_attack' | 'natural_disaster' | 'supply_chain_disruption' | 'pandemic' | 'financial_crisis' | 'regulatory_change' | 'reputation_damage' | 'technology_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact_areas: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  status: 'draft' | 'active' | 'archived';
  scenarios: Scenario[];
  stress_tests: StressTest[];
  recommendations: ScenarioRecommendation[];
}

export interface Scenario {
  id: string;
  analysis_id: string;
  name: string;
  description: string;
  trigger_conditions: string[];
  timeline: ScenarioTimeline[];
  impact_assessment: ScenarioImpact;
  response_actions: ScenarioAction[];
  recovery_actions: ScenarioAction[];
  probability_factors: ProbabilityFactor[];
}

export interface ScenarioTimeline {
  id: string;
  scenario_id: string;
  phase: 'pre_incident' | 'immediate_response' | 'containment' | 'recovery' | 'post_incident';
  time_from_trigger: number; // hours
  description: string;
  key_activities: string[];
  decision_points: string[];
}

export interface ScenarioImpact {
  id: string;
  scenario_id: string;
  financial_impact: {
    direct_losses: number;
    indirect_losses: number;
    recovery_costs: number;
    total_impact: number;
  };
  operational_impact: {
    affected_processes: string[];
    downtime_hours: number;
    capacity_reduction: number; // percentage
    customer_impact: string;
  };
  reputational_impact: {
    media_coverage: string;
    stakeholder_concerns: string[];
    brand_damage_assessment: string;
  };
  regulatory_impact: {
    compliance_breaches: string[];
    reporting_requirements: string[];
    potential_penalties: number;
  };
}

export interface ScenarioAction {
  id: string;
  scenario_id: string;
  action_type: 'response' | 'recovery' | 'prevention' | 'detection';
  description: string;
  responsible_party: string;
  timeline_hours: number;
  dependencies: string[];
  resource_requirements: string[];
  success_criteria: string[];
  cost_estimate: number;
}

export interface ProbabilityFactor {
  id: string;
  scenario_id: string;
  factor_name: string;
  description: string;
  current_probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  trend: 'decreasing' | 'stable' | 'increasing';
  mitigation_measures: string[];
  monitoring_indicators: string[];
}

export interface StressTest {
  id: string;
  analysis_id: string;
  name: string;
  description: string;
  test_type: 'tabletop' | 'simulation' | 'full_scale' | 'partial' | 'automated';
  scenario_ids: string[];
  conducted_at: string;
  conducted_by: string;
  participants: string[];
  results: StressTestResult;
  findings: string[];
  recommendations: string[];
  next_test_date?: string | null;
}

export interface StressTestResult {
  id: string;
  test_id: string;
  overall_score: number; // 0-100
  response_time_score: number;
  coordination_score: number;
  communication_score: number;
  resource_adequacy_score: number;
  plan_effectiveness_score: number;
  gaps_identified: string[];
  strengths_identified: string[];
  improvement_areas: string[];
}

export interface ScenarioRecommendation {
  id: string;
  analysis_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'prevention' | 'detection' | 'response' | 'recovery' | 'improvement';
  estimated_cost: number;
  implementation_timeline: string;
  responsible_party: string;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string | null;
}

// Resilience Metrics and KPIs
export interface ResilienceMetrics {
  id: string;
  program_id: string;
  measurement_date: string;
  overall_resilience_score: number; // 0-100
  business_continuity_score: number;
  incident_response_score: number;
  crisis_management_score: number;
  scenario_planning_score: number;
  stakeholder_confidence: number;
  regulatory_compliance_score: number;
  financial_resilience_score: number;
  operational_resilience_score: number;
  reputational_resilience_score: number;
  trend_analysis: TrendAnalysis[];
  benchmark_comparison: BenchmarkComparison[];
}

export interface TrendAnalysis {
  id: string;
  metrics_id: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  trend: 'improving' | 'stable' | 'declining';
  change_percentage: number;
  factors_contributing: string[];
}

export interface BenchmarkComparison {
  id: string;
  metrics_id: string;
  metric_name: string;
  industry_average: number;
  best_in_class: number;
  your_score: number;
  percentile_rank: number;
  gap_analysis: string;
  improvement_opportunities: string[];
}

// Resilience Program Item (for task management)
export interface ResilienceProgramItem {
  id: string;
  program_id: string;
  item_type: 'bia_task' | 'incident_response' | 'crisis_management' | 'scenario_analysis' | 'training' | 'testing' | 'review' | 'improvement';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string;
  due_date: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  dependencies: string[];
  progress_percentage: number;
  notes: string;
  attachments: string[];
}
