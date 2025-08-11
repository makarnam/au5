// Third Party Risk Management Types

export interface ThirdParty {
  id: string;
  name: string;
  legal_name?: string;
  vendor_id?: string;
  vendor_type: string;
  industry?: string;
  business_unit_id?: string;
  risk_classification: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  country?: string;
  registration_number?: string;
  tax_id?: string;
  annual_revenue?: number;
  employee_count?: number;
  founded_year?: number;
  certifications?: string[];
  compliance_frameworks?: string[];
  data_processing_activities?: string[];
  critical_services?: string[];
  contract_start_date?: string;
  contract_end_date?: string;
  renewal_date?: string;
  contract_value?: number;
  currency: string;
  payment_terms?: string;
  sla_requirements?: string;
  insurance_coverage?: string;
  financial_stability_rating?: string;
  credit_rating?: string;
  risk_score: number;
  last_assessment_date?: string;
  next_assessment_date?: string;
  assessment_frequency_months: number;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyAssessment {
  id: string;
  third_party_id: string;
  assessment_type: 'initial' | 'periodic' | 'incident_based' | 'contract_renewal';
  assessment_date: string;
  assessor_id?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  overall_risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  financial_risk_score?: number;
  operational_risk_score?: number;
  compliance_risk_score?: number;
  security_risk_score?: number;
  reputational_risk_score?: number;
  strategic_risk_score?: number;
  findings_summary?: string;
  recommendations?: string;
  mitigation_actions?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyEngagement {
  id: string;
  third_party_id: string;
  engagement_type: 'contract' | 'project' | 'service' | 'partnership';
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'planning' | 'active' | 'completed' | 'terminated' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  business_unit_id?: string;
  project_manager_id?: string;
  contract_manager_id?: string;
  contract_number?: string;
  contract_value?: number;
  currency: string;
  payment_schedule?: string;
  deliverables?: string[];
  key_performance_indicators?: string[];
  service_level_agreements?: string;
  termination_clauses?: string;
  renewal_terms?: string;
  risk_mitigation_measures?: string;
  compliance_requirements?: string[];
  security_requirements?: string[];
  insurance_requirements?: string;
  audit_rights?: string;
  data_processing_agreement: boolean;
  data_processing_activities?: string[];
  data_retention_period?: number;
  data_breach_notification_hours?: number;
  subcontractor_approval_required: boolean;
  subcontractors?: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyGovernance {
  id: string;
  third_party_id: string;
  governance_type: 'oversight' | 'performance' | 'compliance' | 'security';
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  last_review_date?: string;
  next_review_date?: string;
  status: 'active' | 'inactive' | 'completed';
  responsible_person_id?: string;
  review_committee?: string[];
  review_criteria?: string[];
  performance_metrics?: string[];
  compliance_checklist?: string[];
  security_requirements?: string[];
  audit_findings?: string[];
  corrective_actions?: string[];
  escalation_procedures?: string;
  reporting_requirements?: string;
  approval_workflow?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartySecurityMonitoring {
  id: string;
  third_party_id: string;
  monitoring_type: 'continuous' | 'periodic' | 'incident_based' | 'compliance_check';
  monitoring_date: string;
  security_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  security_controls_assessed?: number;
  security_controls_compliant?: number;
  compliance_percentage?: number;
  vulnerabilities_found?: number;
  critical_vulnerabilities?: number;
  high_vulnerabilities?: number;
  medium_vulnerabilities?: number;
  low_vulnerabilities?: number;
  security_incidents?: number;
  data_breaches?: number;
  security_certifications?: string[];
  security_assessments?: string[];
  penetration_testing_results?: string;
  security_audit_results?: string;
  compliance_gaps?: string[];
  remediation_actions?: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  automated_monitoring_enabled: boolean;
  monitoring_tools?: string[];
  alert_thresholds?: string;
  incident_response_plan?: string;
  business_continuity_plan?: string;
  disaster_recovery_plan?: string;
  insurance_coverage?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyDueDiligence {
  id: string;
  third_party_id: string;
  due_diligence_type: 'financial' | 'legal' | 'operational' | 'security' | 'compliance';
  due_diligence_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  responsible_person_id?: string;
  review_team?: string[];
  financial_review_completed: boolean;
  legal_review_completed: boolean;
  operational_review_completed: boolean;
  security_review_completed: boolean;
  compliance_review_completed: boolean;
  financial_risk_score?: number;
  legal_risk_score?: number;
  operational_risk_score?: number;
  security_risk_score?: number;
  compliance_risk_score?: number;
  overall_risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  findings_summary?: string;
  recommendations?: string;
  approval_decision?: 'approved' | 'approved_with_conditions' | 'rejected' | 'requires_further_review';
  approval_conditions?: string[];
  approval_date?: string;
  approved_by?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyPerformance {
  id: string;
  third_party_id: string;
  engagement_id?: string;
  performance_period: 'monthly' | 'quarterly' | 'annually';
  period_start_date: string;
  period_end_date: string;
  overall_performance_score?: number;
  performance_level?: 'excellent' | 'good' | 'satisfactory' | 'poor' | 'unacceptable';
  sla_compliance_percentage?: number;
  quality_score?: number;
  delivery_timeliness?: number;
  cost_effectiveness?: number;
  communication_effectiveness?: number;
  problem_resolution_time?: number;
  customer_satisfaction_score?: number;
  key_metrics?: string[];
  performance_issues?: string[];
  improvement_areas?: string[];
  corrective_actions?: string[];
  performance_bonus_earned: boolean;
  performance_penalty_applied: boolean;
  review_comments?: string;
  reviewed_by?: string;
  review_date?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyIncident {
  id: string;
  third_party_id: string;
  incident_type: 'security_breach' | 'service_outage' | 'compliance_violation' | 'financial_issue' | 'operational_failure';
  incident_date: string;
  incident_time?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  title: string;
  description: string;
  impact_assessment?: string;
  affected_services?: string[];
  affected_customers?: number;
  financial_impact?: number;
  business_impact?: string;
  root_cause?: string;
  immediate_actions?: string[];
  containment_measures?: string[];
  remediation_actions?: string[];
  lessons_learned?: string;
  preventive_measures?: string[];
  incident_response_team?: string[];
  escalation_level?: string;
  notification_sent: boolean;
  notification_recipients?: string[];
  regulatory_reporting_required: boolean;
  regulatory_reports_filed?: string[];
  insurance_claim_filed: boolean;
  insurance_claim_details?: string;
  investigation_completed: boolean;
  investigation_report?: string;
  resolution_date?: string;
  resolved_by?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyContract {
  id: string;
  third_party_id: string;
  contract_number: string;
  contract_type: 'service_agreement' | 'purchase_order' | 'partnership' | 'licensing' | 'consulting';
  contract_title: string;
  contract_description?: string;
  start_date: string;
  end_date?: string;
  renewal_date?: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'suspended';
  contract_value?: number;
  currency: string;
  payment_terms?: string;
  payment_schedule?: string;
  contract_manager_id?: string;
  business_owner_id?: string;
  legal_reviewer_id?: string;
  contract_terms?: string;
  service_level_agreements?: string;
  key_performance_indicators?: string[];
  deliverables?: string[];
  termination_clauses?: string;
  renewal_terms?: string;
  insurance_requirements?: string;
  compliance_requirements?: string[];
  security_requirements?: string[];
  audit_rights?: string;
  data_processing_agreement: boolean;
  data_processing_activities?: string[];
  data_retention_period?: number;
  data_breach_notification_hours?: number;
  subcontractor_approval_required: boolean;
  subcontractors?: string[];
  contract_attachments?: string[];
  approval_workflow?: string;
  risk_assessment_completed: boolean;
  risk_score?: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyRiskCategory {
  id: string;
  category_name: string;
  category_description?: string;
  risk_weight: number;
  assessment_criteria?: string[];
  mitigation_strategies?: string[];
  monitoring_requirements?: string[];
  reporting_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  responsible_role?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Form data interfaces for creating/editing
export interface ThirdPartyFormData {
  name: string;
  legal_name?: string;
  vendor_id?: string;
  vendor_type: string;
  industry?: string;
  business_unit_id?: string;
  risk_classification: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  country?: string;
  registration_number?: string;
  tax_id?: string;
  annual_revenue?: number | null;
  employee_count?: number | null;
  founded_year?: number | null;
  certifications?: string[];
  compliance_frameworks?: string[];
  data_processing_activities?: string[];
  critical_services?: string[];
  contract_start_date?: string;
  contract_end_date?: string;
  renewal_date?: string;
  contract_value?: number | null;
  currency: string;
  payment_terms?: string;
  sla_requirements?: string;
  insurance_coverage?: string;
  financial_stability_rating?: string;
  credit_rating?: string;
  assessment_frequency_months: number;
  notes?: string;
}

export interface ThirdPartyAssessmentFormData {
  third_party_id: string;
  assessment_type: 'initial' | 'periodic' | 'incident_based' | 'contract_renewal';
  assessment_date: string;
  assessor_id?: string;
  financial_risk_score?: number | null;
  operational_risk_score?: number | null;
  compliance_risk_score?: number | null;
  security_risk_score?: number | null;
  reputational_risk_score?: number | null;
  strategic_risk_score?: number | null;
  overall_risk_score?: number | null;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  approval_status?: 'pending' | 'approved' | 'rejected';
  findings_summary?: string;
  recommendations?: string;
  mitigation_actions?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
}

export interface ThirdPartyEngagementFormData {
  third_party_id: string;
  engagement_type: 'contract' | 'project' | 'service' | 'partnership';
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  business_unit_id?: string;
  project_manager_id?: string;
  contract_manager_id?: string;
  contract_number?: string;
  contract_value?: number;
  currency: string;
  payment_schedule?: string;
  deliverables?: string[];
  key_performance_indicators?: string[];
  service_level_agreements?: string;
  termination_clauses?: string;
  renewal_terms?: string;
  risk_mitigation_measures?: string;
  compliance_requirements?: string[];
  security_requirements?: string[];
  insurance_requirements?: string;
  audit_rights?: string;
  data_processing_agreement: boolean;
  data_processing_activities?: string[];
  data_retention_period?: number;
  data_breach_notification_hours?: number;
  subcontractor_approval_required: boolean;
  subcontractors?: string[];
}

// Dashboard and analytics interfaces
export interface ThirdPartyDashboardStats {
  total_third_parties: number;
  active_third_parties: number;
  high_risk_third_parties: number;
  critical_risk_third_parties: number;
  overdue_assessments: number;
  upcoming_renewals: number;
  active_incidents: number;
  average_risk_score: number;
}

export interface ThirdPartyRiskDistribution {
  risk_level: string;
  count: number;
  percentage: number;
}

export interface ThirdPartyAssessmentTrend {
  month: string;
  assessments_completed: number;
  average_risk_score: number;
}

export interface ThirdPartyIncidentTrend {
  month: string;
  incidents_count: number;
  critical_incidents: number;
}

export interface ThirdPartyPerformanceMetrics {
  third_party_id: string;
  third_party_name: string;
  overall_performance_score: number;
  sla_compliance_percentage: number;
  quality_score: number;
  delivery_timeliness: number;
  cost_effectiveness: number;
  communication_effectiveness: number;
  problem_resolution_time: number;
  customer_satisfaction_score: number;
}

// Search and filter interfaces
export interface ThirdPartySearchFilters {
  search?: string;
  risk_classification?: string[];
  status?: string[];
  vendor_type?: string[];
  business_unit_id?: string;
  assessment_overdue?: boolean;
  contract_expiring_soon?: boolean;
  high_risk_only?: boolean;
}

export interface ThirdPartyAssessmentFilters {
  third_party_id?: string;
  assessment_type?: string[];
  status?: string[];
  date_from?: string;
  date_to?: string;
  risk_level?: string[];
  assessor_id?: string;
}

export interface ThirdPartyIncidentFilters {
  third_party_id?: string;
  incident_type?: string[];
  severity?: string[];
  status?: string[];
  date_from?: string;
  date_to?: string;
  business_unit_id?: string;
}

export interface ThirdPartyDueDiligenceFormData {
  third_party_id: string;
  due_diligence_type: 'financial' | 'legal' | 'operational' | 'security' | 'compliance' | 'comprehensive';
  due_diligence_date: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  responsible_person_id?: string;
  review_team?: string[];
  financial_review_completed?: boolean;
  legal_review_completed?: boolean;
  operational_review_completed?: boolean;
  security_review_completed?: boolean;
  compliance_review_completed?: boolean;
  financial_risk_score?: number | null;
  legal_risk_score?: number | null;
  operational_risk_score?: number | null;
  security_risk_score?: number | null;
  compliance_risk_score?: number | null;
  overall_risk_score?: number | null;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  findings_summary?: string;
  recommendations?: string;
  approval_decision?: 'approved' | 'approved_with_conditions' | 'rejected' | 'requires_further_review';
  approval_conditions?: string[];
  approval_date?: string;
  approved_by?: string;
}
