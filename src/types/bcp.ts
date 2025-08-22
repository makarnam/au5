// Enhanced Business Continuity Management Types for Global Enterprise
// Comprehensive BCM system with RPO/RTO, IT continuity, risk assessments, and more

export interface BusinessContinuityPlan {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  owner: string;
  version: string;
  created_at: string;
  updated_at: string;
  
  // Enhanced fields for global enterprise
  plan_type: 'business_continuity' | 'it_continuity' | 'disaster_recovery' | 'crisis_management';
  scope: string;
  business_impact_analysis: string;
  risk_assessment: string;
  recovery_strategies: string;
  resource_requirements: string;
  communication_plan: string;
  testing_schedule: string;
  maintenance_schedule: string;
  regulatory_compliance: string[];
  stakeholders: string[];
  budget_estimate: number;
  approval_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  approved_by: string | null;
  approved_at: string | null;
  next_review_date: string | null;
  last_exercise_date: string | null;
  exercise_results: string | null;
  lessons_learned: string | null;
  continuous_improvement: string | null;
  global_region: string | null;
  business_unit: string | null;
  criticality_level: 'low' | 'medium' | 'high' | 'critical';
  mtta_hours: number; // Mean Time To Acknowledge
  mttr_hours: number; // Mean Time To Recover
  availability_target: number; // 99.99%
  tags: string[];

  // Legacy JSONB fields (kept for backward compatibility)
  critical_functions?: CriticalFunction[];
  emergency_contacts?: EmergencyContact[];
  recovery_time_objectives?: RecoveryTimeObjective[];
}

export interface CriticalFunction {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  business_impact_rating: number; // 1-5 scale
  recovery_priority: 'low' | 'medium' | 'high' | 'critical';
  rto_hours: number; // Recovery Time Objective
  rpo_hours: number; // Recovery Point Objective
  mtta_hours: number; // Mean Time To Acknowledge
  mttr_hours: number; // Mean Time To Recover
  dependencies: string[];
  recovery_strategy: string;
  alternate_sites: string[];
  resource_requirements: string;
  testing_frequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  last_tested_date: string | null;
  test_results: string | null;
  status: 'active' | 'inactive' | 'deprecated';
  created_at: string;
  updated_at: string;
}

export interface ITContinuityPlan {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  it_environment: string;
  infrastructure_type: string;
  data_center_primary: string;
  data_center_secondary: string;
  cloud_providers: string[];
  backup_strategy: string;
  disaster_recovery_site: string;
  network_redundancy: boolean;
  power_redundancy: boolean;
  cooling_redundancy: boolean;
  security_measures: string;
  monitoring_tools: string[];
  alerting_systems: string[];
  incident_response_team: string[];
  escalation_procedures: string;
  created_at: string;
  updated_at: string;
}

export interface RecoveryTimeObjective {
  id: string;
  plan_id: string;
  function_id: string;
  service_name: string;
  rto_hours: number;
  rpo_hours: number;
  mtta_hours: number;
  mttr_hours: number;
  sla_target: number; // 99.99%
  recovery_strategy: string;
  dependencies: string[];
  resource_requirements: string;
  testing_frequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  last_tested_date: string | null;
  test_results: string | null;
  status: 'active' | 'inactive' | 'deprecated';
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  plan_id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  role: string;
  responsibility: string;
  escalation_level: number;
  availability_hours: string;
  backup_contact_id: string | null;
  notification_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BCMRiskAssessment {
  id: string;
  plan_id: string;
  risk_name: string;
  risk_description: string;
  risk_category: string;
  likelihood_rating: number; // 1-5 scale
  impact_rating: number; // 1-5 scale
  risk_score: number; // Calculated field
  risk_level: 'low' | 'medium' | 'high' | 'critical'; // Calculated field
  mitigation_strategies: string;
  controls: string[];
  residual_risk_level: string;
  review_frequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  last_reviewed_date: string | null;
  next_review_date: string | null;
  status: 'active' | 'inactive' | 'mitigated';
  created_at: string;
  updated_at: string;
}

export interface BCMTestingExercise {
  id: string;
  plan_id: string;
  exercise_name: string;
  exercise_type: 'tabletop' | 'walkthrough' | 'simulation' | 'full_scale' | 'drill';
  description: string;
  objectives: string[];
  scope: string;
  participants: string[];
  scenario: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  results: string | null;
  lessons_learned: string[];
  recommendations: string[];
  action_items: string[];
  follow_up_date: string | null;
  success_criteria: string[];
  actual_outcomes: string | null;
  improvement_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface BCMCommunicationPlan {
  id: string;
  plan_id: string;
  communication_type: string;
  audience: string[];
  message_template: string;
  delivery_method: string;
  frequency: string;
  escalation_procedures: string;
  contact_information: Record<string, any>;
  approval_required: boolean;
  approval_workflow: string;
  created_at: string;
  updated_at: string;
}

export interface BCMResource {
  id: string;
  plan_id: string;
  resource_name: string;
  resource_type: 'hardware' | 'software' | 'personnel' | 'facility' | 'network' | 'other';
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  availability_status: 'available' | 'in_use' | 'maintenance' | 'unavailable';
  location: string;
  supplier: string;
  contact_information: Record<string, any>;
  maintenance_schedule: string;
  replacement_lead_time: number;
  criticality_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface BCMIncident {
  id: string;
  plan_id: string;
  incident_title: string;
  incident_description: string;
  incident_type: 'system_failure' | 'cyber_attack' | 'natural_disaster' | 'power_outage' | 'network_issue' | 'other';
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolving' | 'resolved' | 'closed';
  reported_at: string;
  reported_by: string;
  affected_services: string[];
  business_impact: string;
  response_actions: string[];
  resolution: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  lessons_learned: string | null;
  created_at: string;
  updated_at: string;
}

export interface BCMMetric {
  id: string;
  plan_id: string;
  metric_name: string;
  metric_type: 'availability' | 'recovery_time' | 'recovery_point' | 'mtta' | 'mttr' | 'cost' | 'other';
  description: string;
  target_value: number;
  actual_value: number | null;
  unit: string;
  measurement_frequency: string;
  last_measured_at: string | null;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  status: 'on_target' | 'below_target' | 'above_target' | 'unknown';
  created_at: string;
  updated_at: string;
}

// Dashboard and Analytics Types
export interface BCMDashboardStats {
  total_plans: number;
  active_plans: number;
  plans_needing_review: number;
  upcoming_exercises: number;
  open_incidents: number;
  average_rto_hours: number;
  average_rpo_hours: number;
  overall_readiness_score: number;
  compliance_status: 'compliant' | 'non_compliant' | 'partial';
  last_updated: string;
}

export interface BCMKPIMetrics {
  availability_metrics: {
    current_availability: number;
    target_availability: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  recovery_metrics: {
    average_rto: number;
    average_rpo: number;
    average_mtta: number;
    average_mttr: number;
  };
  testing_metrics: {
    exercises_completed_this_year: number;
    exercises_planned_this_year: number;
    last_exercise_date: string | null;
    next_exercise_date: string | null;
  };
  risk_metrics: {
    high_risk_items: number;
    medium_risk_items: number;
    low_risk_items: number;
    mitigated_risks: number;
  };
  compliance_metrics: {
    compliant_plans: number;
    non_compliant_plans: number;
    pending_reviews: number;
  };
}

export interface BCMPlanMetrics {
  plan_id: string;
  plan_name: string;
  readiness_score: number;
  last_exercise_date: string | null;
  next_exercise_date: string | null;
  risk_level: string;
  compliance_status: string;
  critical_functions_count: number;
  emergency_contacts_count: number;
  rto_objectives_count: number;
  open_incidents_count: number;
}

export interface BCMFilterOptions {
  status?: string;
  plan_type?: string;
  business_unit?: string;
  global_region?: string;
  criticality_level?: string;
  approval_status?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export interface BCMPlanStatusFilter {
  status: 'all' | 'active' | 'draft' | 'inactive' | 'archived';
  plan_type: 'all' | 'business_continuity' | 'it_continuity' | 'disaster_recovery' | 'crisis_management';
  criticality: 'all' | 'low' | 'medium' | 'high' | 'critical';
  approval: 'all' | 'pending' | 'approved' | 'rejected' | 'under_review';
}

// Form Types for creating/editing
export interface CreateBCMPlanForm {
  name: string;
  description: string;
  plan_type: string;
  scope: string;
  business_unit: string;
  global_region: string;
  criticality_level: string;
  stakeholders: string[];
  regulatory_compliance: string[];
  budget_estimate: number;
}

export interface CreateCriticalFunctionForm {
  name: string;
  description: string;
  business_impact_rating: number;
  recovery_priority: string;
  rto_hours: number;
  rpo_hours: number;
  mtta_hours: number;
  mttr_hours: number;
  dependencies: string[];
  recovery_strategy: string;
  alternate_sites: string[];
  resource_requirements: string;
  testing_frequency: string;
}

export interface CreateRTOForm {
  service_name: string;
  rto_hours: number;
  rpo_hours: number;
  mtta_hours: number;
  mttr_hours: number;
  sla_target: number;
  recovery_strategy: string;
  dependencies: string[];
  resource_requirements: string;
  testing_frequency: string;
}

export interface CreateEmergencyContactForm {
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  role: string;
  responsibility: string;
  escalation_level: number;
  availability_hours: string;
  notification_preferences: Record<string, any>;
}

export interface CreateRiskAssessmentForm {
  risk_name: string;
  risk_description: string;
  risk_category: string;
  likelihood_rating: number;
  impact_rating: number;
  mitigation_strategies: string;
  controls: string[];
  review_frequency: string;
}

export interface CreateTestingExerciseForm {
  exercise_name: string;
  exercise_type: string;
  description: string;
  objectives: string[];
  scope: string;
  participants: string[];
  scenario: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  success_criteria: string[];
}

// Legacy types for backward compatibility
export interface BCPPlanItem {
  id: string;
  plan_id: string;
  item_type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  due_date: string;
  completed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  template_type: string;
  subject: string;
  body: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface ExerciseSchedule {
  id: string;
  plan_id: string;
  exercise_name: string;
  exercise_type: string;
  scheduled_date: string;
  status: string;
  participants: string[];
  objectives: string[];
  created_at: string;
  updated_at: string;
}

export interface AlternateSite {
  id: string;
  plan_id: string;
  site_name: string;
  site_type: string;
  location: string;
  capacity: string;
  availability: string;
  contact_information: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DataBackup {
  id: string;
  plan_id: string;
  backup_name: string;
  backup_type: string;
  frequency: string;
  retention_period: string;
  location: string;
  encryption: boolean;
  last_backup: string | null;
  next_backup: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanTestResult {
  id: string;
  plan_id: string;
  test_name: string;
  test_date: string;
  test_type: string;
  participants: string[];
  objectives: string[];
  results: string;
  lessons_learned: string[];
  recommendations: string[];
  action_items: string[];
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}
