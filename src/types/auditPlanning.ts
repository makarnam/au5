// Audit Planning Types

// Audit Universe Types
export type EntityType = 'process' | 'system' | 'department' | 'location' | 'vendor' | 'project' | 'application';
export type ClassificationCategory = 'financial' | 'operational' | 'compliance' | 'strategic' | 'technology' | 'security';

export interface AuditUniverse {
  id: string;
  entity_name: string;
  entity_type: EntityType;
  business_unit_id?: string;
  description?: string;
  classification_category: ClassificationCategory;
  geography?: string;
  regulatory_requirements?: string[];
  inherent_risk_score?: number;
  control_maturity_level?: number;
  last_audit_date?: string;
  last_audit_findings_count?: number;
  audit_frequency_months?: number;
  is_active?: boolean;
  parent_entity_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  business_unit?: {
    name: string;
    code: string;
  };
  parent_entity?: {
    entity_name: string;
    entity_type: EntityType;
  };
  created_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AuditUniverseHistory {
  id: string;
  universe_entity_id: string;
  audit_id?: string;
  audit_type: string;
  audit_date: string;
  findings_count: number;
  critical_findings_count: number;
  high_findings_count: number;
  medium_findings_count: number;
  low_findings_count: number;
  audit_rating?: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  auditor_notes?: string;
  created_at: string;
  // Joined data
  audit?: {
    title: string;
    status: string;
  };
}

// Audit Plans Types
export type PlanType = 'annual' | 'multi_year' | 'strategic';
export type PlanStatus = 'draft' | 'in_review' | 'approved' | 'active' | 'completed' | 'archived';

export interface AuditPlan {
  id: string;
  plan_name: string;
  plan_type: PlanType;
  plan_year: number;
  description?: string;
  strategic_objectives?: string[];
  total_planned_audits?: number;
  total_planned_hours?: number;
  total_budget?: number;
  risk_based_coverage_percentage?: number;
  compliance_coverage_percentage?: number;
  status: PlanStatus;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  approved_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  created_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AuditPlanItem {
  id: string;
  audit_plan_id: string;
  universe_entity_id?: string;
  audit_id?: string;
  audit_title: string;
  audit_type: string;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  risk_score?: number;
  planned_start_date?: string;
  planned_end_date?: string;
  planned_hours?: number;
  lead_auditor_id?: string;
  team_size?: number;
  business_unit_id?: string;
  regulatory_requirement?: string;
  audit_frequency_months?: number;
  dependencies?: string[];
  resource_requirements?: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
  actual_start_date?: string;
  actual_end_date?: string;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  universe_entity?: {
    entity_name: string;
    entity_type: EntityType;
    classification_category: ClassificationCategory;
  };
  audit?: {
    title: string;
    status: string;
  };
  lead_auditor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Auditor Competencies Types
export type CompetencyArea = 
  | 'financial_audit' 
  | 'operational_audit' 
  | 'it_audit' 
  | 'compliance_audit' 
  | 'risk_assessment' 
  | 'data_analytics' 
  | 'forensic_audit' 
  | 'cybersecurity' 
  | 'business_process' 
  | 'regulatory_compliance';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface AuditorCompetency {
  id: string;
  user_id: string;
  competency_area: CompetencyArea;
  proficiency_level: ProficiencyLevel;
  years_experience: number;
  certifications?: string[];
  last_assessment_date?: string;
  next_assessment_date?: string;
  assessed_by?: string;
  assessment_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  assessed_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Auditor Availability Types
export type AvailabilityType = 'available' | 'partially_available' | 'unavailable' | 'vacation' | 'training' | 'sick_leave' | 'other';

export interface AuditorAvailability {
  id: string;
  user_id: string;
  date: string;
  availability_type: AvailabilityType;
  available_hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Resource Allocation Types
export type AuditorRole = 'lead_auditor' | 'senior_auditor' | 'auditor' | 'reviewer' | 'specialist' | 'trainee';

export interface AuditResourceAllocation {
  id: string;
  audit_plan_item_id: string;
  user_id: string;
  role: AuditorRole;
  allocated_hours: number;
  actual_hours: number;
  start_date?: string;
  end_date?: string;
  allocation_percentage?: number;
  skills_required?: string[];
  training_needed?: string[];
  allocation_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  audit_plan_item?: {
    audit_title: string;
    audit_type: string;
  };
}

// Capacity Planning Types
export interface AuditCapacityPlanning {
  id: string;
  period_start_date: string;
  period_end_date: string;
  total_available_hours: number;
  total_allocated_hours: number;
  total_planned_hours: number;
  capacity_utilization_percentage?: number;
  business_unit_id?: string;
  audit_type?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  business_unit?: {
    name: string;
    code: string;
  };
  created_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Training Needs Types
export type TrainingType = 'technical' | 'soft_skills' | 'certification' | 'compliance' | 'tool_training';
export type TrainingStatus = 'identified' | 'approved' | 'in_progress' | 'completed' | 'deferred';

export interface AuditTrainingNeed {
  id: string;
  user_id: string;
  training_area: string;
  training_type: TrainingType;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  required_by_date?: string;
  estimated_hours: number;
  training_provider?: string;
  training_cost: number;
  status: TrainingStatus;
  approved_by?: string;
  approved_at?: string;
  completion_date?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  approved_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Risk Assessment Types
export interface AuditRiskAssessment {
  id: string;
  universe_entity_id: string;
  assessment_date: string;
  inherent_risk_factors: Record<string, any>;
  inherent_risk_score: number;
  control_effectiveness_score?: number;
  residual_risk_score?: number;
  risk_factors?: string[];
  control_gaps?: string[];
  mitigation_recommendations?: string[];
  assessed_by: string;
  reviewed_by?: string;
  review_date?: string;
  review_notes?: string;
  next_assessment_date?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  universe_entity?: {
    entity_name: string;
    entity_type: EntityType;
  };
  assessed_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reviewed_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Form Data Types
export interface AuditUniverseFormData {
  entity_name: string;
  entity_type: EntityType;
  business_unit_id?: string;
  description?: string;
  classification_category: ClassificationCategory;
  geography?: string;
  regulatory_requirements?: string[];
  inherent_risk_score?: number;
  control_maturity_level?: number;
  audit_frequency_months?: number;
  parent_entity_id?: string;
}

export interface AuditPlanFormData {
  plan_name: string;
  plan_type: PlanType;
  plan_year: number;
  description?: string;
  strategic_objectives?: string[];
  total_budget?: number;
  risk_based_coverage_percentage?: number;
  compliance_coverage_percentage?: number;
}

export interface AuditPlanItemFormData {
  audit_plan_id: string;
  universe_entity_id?: string;
  audit_title: string;
  audit_type: string;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  risk_score?: number;
  planned_start_date?: string;
  planned_end_date?: string;
  planned_hours?: number;
  lead_auditor_id?: string;
  team_size?: number;
  business_unit_id?: string;
  regulatory_requirement?: string;
  audit_frequency_months?: number;
  dependencies?: string[];
  resource_requirements?: string[];
}

export interface AuditorCompetencyFormData {
  user_id: string;
  competency_area: CompetencyArea;
  proficiency_level: ProficiencyLevel;
  years_experience: number;
  certifications?: string[];
  next_assessment_date?: string;
  assessment_notes?: string;
}

export interface AuditorAvailabilityFormData {
  user_id: string;
  date: string;
  availability_type: AvailabilityType;
  available_hours: number;
  notes?: string;
}

export interface ResourceAllocationFormData {
  audit_plan_item_id: string;
  user_id: string;
  role: AuditorRole;
  allocated_hours: number;
  start_date?: string;
  end_date?: string;
  allocation_percentage?: number;
  skills_required?: string[];
  training_needed?: string[];
  allocation_notes?: string;
}

export interface TrainingNeedFormData {
  user_id: string;
  training_area: string;
  training_type: TrainingType;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  required_by_date?: string;
  estimated_hours: number;
  training_provider?: string;
  training_cost: number;
}

export interface RiskAssessmentFormData {
  universe_entity_id: string;
  assessment_date: string;
  inherent_risk_factors: Record<string, any>;
  inherent_risk_score: number;
  control_effectiveness_score?: number;
  residual_risk_score?: number;
  risk_factors?: string[];
  control_gaps?: string[];
  mitigation_recommendations?: string[];
  next_assessment_date?: string;
}

// Dashboard and Analytics Types
export interface AuditPlanningMetrics {
  total_universe_entities: number;
  high_risk_entities: number;
  overdue_audits: number;
  planned_audits: number;
  total_audit_hours: number;
  capacity_utilization: number;
  training_needs_count: number;
  competency_gaps: number;
}

export interface CoverageAnalysis {
  business_unit: string;
  total_entities: number;
  audited_entities: number;
  coverage_percentage: number;
  risk_level: string;
}

export interface ResourceUtilization {
  user_id: string;
  user_name: string;
  allocated_hours: number;
  available_hours: number;
  utilization_percentage: number;
  skills: string[];
}

// Filter and Search Types
export interface AuditPlanningFilters {
  business_unit?: string[];
  entity_type?: EntityType[];
  classification_category?: ClassificationCategory[];
  risk_level?: string[];
  audit_status?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  competency_area?: CompetencyArea[];
  availability_type?: AvailabilityType[];
}

export interface AuditPlanningSearchParams {
  query?: string;
  filters?: AuditPlanningFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
