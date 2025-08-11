// AI Governance Types

export type AIModelType = 
  | 'llm' 
  | 'ml' 
  | 'nlp' 
  | 'computer_vision' 
  | 'recommendation' 
  | 'other';

export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'meta' 
  | 'custom' 
  | 'other';

export type DeploymentEnvironment = 
  | 'development' 
  | 'staging' 
  | 'production' 
  | 'research';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ComplianceStatus = 
  | 'pending' 
  | 'compliant' 
  | 'non_compliant' 
  | 'under_review';

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  model_type: AIModelType;
  provider: AIProvider;
  version?: string;
  deployment_environment: DeploymentEnvironment;
  business_unit_id?: string;
  owner_id?: string;
  risk_level: RiskLevel;
  data_sources?: string[];
  training_data_description?: string;
  model_performance_metrics?: Record<string, any>;
  last_updated: string;
  is_active: boolean;
  compliance_status: ComplianceStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

export type AIControlType = 
  | 'preventive' 
  | 'detective' 
  | 'corrective' 
  | 'directive';

export type AIControlCategory = 
  | 'data_governance' 
  | 'model_governance' 
  | 'deployment_governance' 
  | 'monitoring' 
  | 'compliance';

export type AIControlFrequency = 
  | 'continuous' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'quarterly' 
  | 'annually';

export interface AIControl {
  id: string;
  control_code: string;
  title: string;
  description: string;
  control_type: AIControlType;
  category: AIControlCategory;
  framework?: string;
  risk_level: RiskLevel;
  implementation_guidance?: string;
  testing_procedure?: string;
  evidence_requirements?: string;
  frequency: AIControlFrequency;
  is_automated: boolean;
  is_template: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type AIRiskAssessmentType = 
  | 'initial' 
  | 'periodic' 
  | 'change_triggered' 
  | 'incident_triggered';

export type AIRiskDomain = 
  | 'privacy' 
  | 'security' 
  | 'bias' 
  | 'accuracy' 
  | 'reliability' 
  | 'transparency' 
  | 'accountability';

export type AssessmentStatus = 
  | 'draft' 
  | 'in_progress' 
  | 'completed' 
  | 'approved' 
  | 'archived';

export interface AIRiskAssessment {
  id: string;
  model_id: string;
  assessment_name: string;
  assessment_type: AIRiskAssessmentType;
  risk_domain: AIRiskDomain;
  risk_score?: number;
  risk_level: RiskLevel;
  assessment_date: string;
  next_assessment_date?: string;
  assessor_id?: string;
  methodology?: string;
  findings?: string;
  recommendations?: string;
  mitigation_actions?: string;
  status: AssessmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  model?: {
    name: string;
    model_type: AIModelType;
  };
  assessor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export type ComplianceFrameworkType = 
  | 'eu_ai_act' 
  | 'nist_ai_rmf' 
  | 'iso_42001' 
  | 'custom';

export interface AIComplianceFramework {
  id: string;
  framework_name: string;
  framework_type: ComplianceFrameworkType;
  version?: string;
  description?: string;
  applicable_regions?: string[];
  requirements?: Record<string, any>;
  compliance_status: ComplianceStatus;
  last_assessment_date?: string;
  next_assessment_date?: string;
  responsible_party_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  responsible_party?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export type AIRiskCategory = 
  | 'bias' 
  | 'accuracy' 
  | 'security' 
  | 'privacy' 
  | 'reliability' 
  | 'transparency';

export type RiskStatus = 
  | 'active' 
  | 'mitigated' 
  | 'accepted' 
  | 'transferred';

export interface AIModelRiskManagement {
  id: string;
  model_id: string;
  risk_category: AIRiskCategory;
  risk_description: string;
  risk_impact?: string;
  probability: RiskLevel;
  impact_level: RiskLevel;
  risk_score?: number;
  mitigation_strategy?: string;
  controls_applied?: string[];
  monitoring_frequency: string;
  last_review_date?: string;
  next_review_date?: string;
  status: RiskStatus;
  owner_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  model?: {
    name: string;
    model_type: AIModelType;
  };
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export type ImplementationStatus = 
  | 'not_implemented' 
  | 'in_progress' 
  | 'implemented' 
  | 'tested' 
  | 'effective';

export type TestingResult = 
  | 'passed' 
  | 'failed' 
  | 'not_applicable';

export interface AIModelControl {
  id: string;
  model_id: string;
  control_id: string;
  implementation_status: ImplementationStatus;
  implementation_date?: string;
  testing_date?: string;
  testing_result?: TestingResult;
  testing_notes?: string;
  evidence_files?: string[];
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  model?: {
    name: string;
    model_type: AIModelType;
  };
  control?: {
    control_code: string;
    title: string;
    control_type: AIControlType;
  };
  assigned_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export type PolicyType = 
  | 'development' 
  | 'deployment' 
  | 'monitoring' 
  | 'retirement' 
  | 'data_governance';

export type ApprovalStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected';

export interface AIGovernancePolicy {
  id: string;
  policy_name: string;
  policy_type: PolicyType;
  version: string;
  description?: string;
  policy_content: string;
  applicable_models?: string[];
  compliance_frameworks?: string[];
  approval_status: ApprovalStatus;
  approved_by?: string;
  approval_date?: string;
  effective_date?: string;
  review_frequency: string;
  last_review_date?: string;
  next_review_date?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  approver?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export type MonitoringType = 
  | 'performance' 
  | 'bias' 
  | 'drift' 
  | 'security' 
  | 'usage';

export interface AIModelMonitoring {
  id: string;
  model_id: string;
  monitoring_type: MonitoringType;
  metric_name: string;
  metric_value?: number;
  metric_unit?: string;
  threshold_min?: number;
  threshold_max?: number;
  alert_triggered: boolean;
  alert_message?: string;
  monitoring_date: string;
  data_source?: string;
  created_by: string;
  created_at: string;
  // Joined data
  model?: {
    name: string;
    model_type: AIModelType;
  };
}

export type IncidentType = 
  | 'bias' 
  | 'accuracy' 
  | 'security' 
  | 'privacy' 
  | 'performance' 
  | 'availability';

export type IncidentStatus = 
  | 'open' 
  | 'investigating' 
  | 'mitigating' 
  | 'resolved' 
  | 'closed';

export interface AIIncident {
  id: string;
  incident_title: string;
  model_id?: string;
  incident_type: IncidentType;
  severity: RiskLevel;
  description: string;
  impact_assessment?: string;
  root_cause?: string;
  mitigation_actions?: string;
  resolution?: string;
  incident_date: string;
  detection_date: string;
  resolution_date?: string;
  status: IncidentStatus;
  assigned_to?: string;
  reported_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  model?: {
    name: string;
    model_type: AIModelType;
  };
  assigned_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reporter?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Form data types
export interface AIModelFormData {
  name: string;
  description?: string;
  model_type: AIModelType;
  provider: AIProvider;
  version?: string;
  deployment_environment: DeploymentEnvironment;
  business_unit_id?: string;
  owner_id?: string;
  risk_level: RiskLevel;
  data_sources?: string[];
  training_data_description?: string;
  model_performance_metrics?: Record<string, any>;
}

export interface AIControlFormData {
  control_code: string;
  title: string;
  description: string;
  control_type: AIControlType;
  category: AIControlCategory;
  framework?: string;
  risk_level: RiskLevel;
  implementation_guidance?: string;
  testing_procedure?: string;
  evidence_requirements?: string;
  frequency: AIControlFrequency;
  is_automated: boolean;
}

export interface AIRiskAssessmentFormData {
  model_id: string;
  assessment_name: string;
  assessment_type: AIRiskAssessmentType;
  risk_domain: AIRiskDomain;
  risk_score?: number;
  risk_level: RiskLevel;
  assessment_date: string;
  next_assessment_date?: string;
  assessor_id?: string;
  methodology?: string;
  findings?: string;
  recommendations?: string;
  mitigation_actions?: string;
}

export interface AIComplianceFrameworkFormData {
  framework_name: string;
  framework_type: ComplianceFrameworkType;
  version?: string;
  description?: string;
  applicable_regions?: string[];
  requirements?: Record<string, any>;
  responsible_party_id?: string;
}

export interface AIModelRiskManagementFormData {
  model_id: string;
  risk_category: AIRiskCategory;
  risk_description: string;
  risk_impact?: string;
  probability: RiskLevel;
  impact_level: RiskLevel;
  risk_score?: number;
  mitigation_strategy?: string;
  controls_applied?: string[];
  monitoring_frequency: string;
  owner_id?: string;
}

export interface AIGovernancePolicyFormData {
  policy_name: string;
  policy_type: PolicyType;
  version: string;
  description?: string;
  policy_content: string;
  applicable_models?: string[];
  compliance_frameworks?: string[];
  effective_date?: string;
  review_frequency: string;
}

export interface AIIncidentFormData {
  incident_title: string;
  model_id?: string;
  incident_type: IncidentType;
  severity: RiskLevel;
  description: string;
  impact_assessment?: string;
  assigned_to?: string;
}

// Dashboard metrics
export interface AIGovernanceMetrics {
  total_models: number;
  active_models: number;
  high_risk_models: number;
  critical_risk_models: number;
  compliant_models: number;
  non_compliant_models: number;
  total_controls: number;
  implemented_controls: number;
  effective_controls: number;
  total_incidents: number;
  open_incidents: number;
  resolved_incidents: number;
  total_assessments: number;
  pending_assessments: number;
  completed_assessments: number;
}

// Search and filter types
export interface AIGovernanceSearchParams {
  query?: string;
  filters?: {
    model_type?: AIModelType[];
    provider?: AIProvider[];
    risk_level?: RiskLevel[];
    compliance_status?: ComplianceStatus[];
    deployment_environment?: DeploymentEnvironment[];
    business_unit?: string[];
    owner?: string[];
    date_range?: {
      start: string;
      end: string;
    };
  };
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
