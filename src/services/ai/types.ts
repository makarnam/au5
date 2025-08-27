export interface AIProvider {
  id: string;
  name: string;
  type: "ollama" | "openai" | "claude" | "gemini";
  description: string;
  requiresApiKey: boolean;
  models: string[];
  defaultModel: string;
}

export interface AIConfiguration {
  id?: string;
  provider: string;
  model_name: string;
  api_endpoint?: string;
  api_key?: string;
  temperature: number;
  max_tokens: number;
  created_by: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed fields for backward compatibility
  model?: string;
  baseUrl?: string;
}

export interface AITemplate {
  id: string;
  name: string;
  description: string;
  field_type: string;
  template_content: string;
  industry?: string;
  framework?: string;
  context_variables: Record<string, string>;
  is_active: boolean;
  is_default: boolean;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateSelectionCriteria {
  fieldType: string;
  industry?: string;
  framework?: string;
  auditType?: string;
  businessUnit?: string;
}

export interface AIGenerationRequest {
  provider: string;
  model: string;
  prompt: string;
  context: string;
  fieldType:
    | "description"
    | "objectives"
    | "scope"
    | "methodology"
    | "control_set_description"
    | "control_generation"
    | "executive_summary"
    | "dpia_description"
    | "dpia_risk_assessment"
    | "ropa_purpose"
    | "ropa_legal_basis"
    | "policy_content"
    | "policy_title"
    | "policy_description"
    | "policy_scope"
    | "policy_version_summary"
    | "compliance_mapping"
    | "policy_template"
    | "incident_response"
    | "esg_program"
    | "bcp_plan"
    | "bcp_description"
    | "bcp_scope"
    | "bcp_business_impact_analysis"
    | "bcp_risk_assessment"
    | "bcp_recovery_strategies"
    | "bcp_resource_requirements"
    | "bcp_communication_plan"
    | "bcp_testing_schedule"
    | "bcp_maintenance_schedule"
    | "bcp_critical_function_description"
    | "bcp_recovery_strategy"
    | "bcp_testing_scenario"
    | "vendor_assessment"
    | "vendor_due_diligence_report"
    | "vendor_contract_risk_analysis"
    | "vendor_risk_scoring"
    | "vendor_assessment_criteria"
    | "vendor_monitoring_plan"
    | "vendor_incident_response"
    | "vendor_performance_evaluation"
    | "vendor_compliance_assessment"
    | "vendor_financial_analysis"
    | "vendor_security_assessment"
    | "vendor_operational_assessment"
    | "security_policy"
    | "vulnerability_assessment_report"
    | "security_incident_response_plan"
    | "security_controls_mapping"
    | "security_framework_compliance"
    | "security_policy_description"
    | "security_policy_scope"
    | "security_policy_procedures"
    | "security_policy_roles"
    | "security_policy_incident_response"
    | "security_policy_access_control"
    | "security_policy_data_protection"
    | "training_program"
    | "training_description"
    | "learning_objectives"
    | "assessment_criteria"
    | "training_materials"
    | "training_schedule"
    | "certification_requirements"
    | "training_evaluation"
    | "competency_mapping"
    | "training_effectiveness"
    | "compliance_training"
    | "skill_development_plan"
    | "finding_description"
    | "finding_analysis"
    | "finding_impact"
    | "finding_recommendations"
    | "finding_action_plan"
    | "finding_risk_assessment"
    | "finding_root_cause"
    | "finding_evidence"
    | "finding_priority"
    | "finding_timeline"
    | "finding_assignee"
    | "finding_follow_up"
    | "resilience_assessment"
    | "resilience_strategy"
    | "crisis_management_plan"
    | "business_impact_analysis"
    | "recovery_strategies"
    | "resilience_metrics"
    | "scenario_analysis"
    | "resilience_framework"
    | "capacity_assessment"
    | "risk_control_matrix"
    | "adaptability_plan"
    | "resilience_monitoring"
    | "continuous_improvement"
    | "supply_chain_risk"
    | "supply_chain_risk_assessment"
    | "vendor_evaluation_criteria"
    | "risk_mitigation_strategies"
    | "supply_chain_mapping"
    | "vendor_tier_classification"
    | "risk_propagation_analysis"
    | "supply_chain_resilience_scoring"
    | "disruption_response_plan"
    | "supplier_development_program"
    | "performance_monitoring_framework"
    | "compliance_assessment_criteria"
    | "financial_stability_analysis"
    | "risk_control_matrix"
    | "chart_data"
    | "table_data"
    | "control_evaluation";
  auditData: {
    title?: string;
    audit_type?: string;
    business_unit?: string;
    scope?: string;
  };
  controlSetData?: {
    name?: string;
    framework?: string;
    audit_title?: string;
    audit_type?: string;
  };
  privacyData?: {
    title?: string;
    type?: "dpia" | "ropa";
    industry?: string;
    data_subjects?: string[];
    data_categories?: string[];
    risk_level?: string;
  };
  templateId?: string; // New field for template selection
  industry?: string; // New field for industry-specific templates
  framework?: string; // New field for framework-specific templates
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content: string;
  error?: string;
  tokensUsed?: number;
  model?: string;
  provider?: string;
}

export interface AIChatRequest {
  provider: string;
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OllamaStatus {
  isRunning: boolean;
  availableModels: string[];
  error?: string;
}