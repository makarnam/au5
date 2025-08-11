// IT & Security Risk Management Types

// Incident Management Types
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'urgent';
export type IncidentType = 
  | 'malware'
  | 'phishing'
  | 'data_breach'
  | 'ddos'
  | 'insider_threat'
  | 'physical_security'
  | 'social_engineering'
  | 'system_compromise'
  | 'network_intrusion'
  | 'application_vulnerability'
  | 'other';

export interface ITSecurityIncident {
  id: string;
  incident_number: string;
  title: string;
  description: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  priority: IncidentPriority;
  detected_at: string;
  reported_at: string;
  contained_at?: string;
  resolved_at?: string;
  closed_at?: string;
  affected_systems: string[];
  affected_users?: number;
  data_breach: boolean;
  data_types_affected: string[];
  regulatory_impact: string[];
  financial_impact?: number;
  reputation_impact?: string;
  root_cause?: string;
  lessons_learned?: string;
  remediation_actions: string[];
  assigned_to?: string;
  incident_manager_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assigned_to_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  incident_manager?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Policy Management Types
export type PolicyStatus = 'draft' | 'review' | 'approved' | 'active' | 'archived';
export type PolicyType = 
  | 'access_control'
  | 'data_protection'
  | 'network_security'
  | 'incident_response'
  | 'business_continuity'
  | 'vendor_management'
  | 'acceptable_use'
  | 'password'
  | 'encryption'
  | 'backup'
  | 'other';

export type PolicyCategory = 
  | 'technical'
  | 'administrative'
  | 'physical'
  | 'organizational';

export interface ITSecurityPolicy {
  id: string;
  policy_code: string;
  title: string;
  description: string;
  policy_type: PolicyType;
  category: PolicyCategory;
  version: string;
  status: PolicyStatus;
  effective_date?: string;
  review_date?: string;
  next_review_date?: string;
  approval_status: string;
  content: string;
  scope?: string;
  exceptions?: string;
  compliance_frameworks: string[];
  related_policies: string[];
  owner_id?: string;
  approver_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  approver?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Vulnerability Management Types
export type VulnerabilityStatus = 'open' | 'investigating' | 'patching' | 'patched' | 'verified' | 'closed';
export type VulnerabilityPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ITSecurityVulnerability {
  id: string;
  vulnerability_id: string;
  title: string;
  description: string;
  cve_id?: string;
  cvss_score?: number;
  cvss_vector?: string;
  severity: IncidentSeverity;
  status: VulnerabilityStatus;
  priority: VulnerabilityPriority;
  affected_systems: string[];
  affected_software: string[];
  affected_versions: string[];
  discovery_date: string;
  due_date?: string;
  patched_date?: string;
  verified_date?: string;
  remediation_plan?: string;
  remediation_status: string;
  risk_score?: number;
  business_impact?: string;
  technical_impact?: string;
  exploit_available: boolean;
  exploit_public: boolean;
  assigned_to?: string;
  owner_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assigned_to_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
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

// Risk Assessment Types
export type RiskAssessmentStatus = 'planned' | 'in_progress' | 'completed' | 'reviewed' | 'approved';
export type RiskAssessmentType = 
  | 'infrastructure'
  | 'application'
  | 'network'
  | 'data'
  | 'cloud'
  | 'third_party'
  | 'comprehensive';

export interface ITRiskAssessment {
  id: string;
  assessment_number: string;
  title: string;
  description: string;
  assessment_type: RiskAssessmentType;
  scope: string;
  methodology?: string;
  status: RiskAssessmentStatus;
  start_date: string;
  end_date?: string;
  completed_date?: string;
  risk_matrix_id?: string;
  inherent_risk_score?: number;
  residual_risk_score?: number;
  risk_level?: string;
  key_findings: string[];
  recommendations: string[];
  next_assessment_date?: string;
  assessor_id?: string;
  reviewer_id?: string;
  approver_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assessor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reviewer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  approver?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// IT Controls Types
export type ITControlType = 
  | 'preventive'
  | 'detective'
  | 'corrective'
  | 'deterrent'
  | 'recovery'
  | 'compensating';

export type ITControlCategory = 
  | 'access_control'
  | 'network_security'
  | 'data_protection'
  | 'incident_response'
  | 'business_continuity'
  | 'monitoring'
  | 'compliance'
  | 'other';

export type ITControlFramework = 
  | 'nist_csf'
  | 'iso_27001'
  | 'cobit'
  | 'itil'
  | 'pci_dss'
  | 'cmmc'
  | 'custom';

export type ITControlImplementationStatus = 'planned' | 'in_progress' | 'implemented' | 'operational' | 'decommissioned';
export type ITControlTestingFrequency = 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'ad_hoc';

export interface ITControl {
  id: string;
  control_code: string;
  title: string;
  description: string;
  control_type: ITControlType;
  category: ITControlCategory;
  framework?: ITControlFramework;
  control_family?: string;
  implementation_status: ITControlImplementationStatus;
  effectiveness: string;
  testing_frequency: ITControlTestingFrequency;
  last_tested_date?: string;
  next_test_date?: string;
  automated: boolean;
  monitoring_enabled: boolean;
  alerting_enabled: boolean;
  documentation_url?: string;
  owner_id?: string;
  tester_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  tester?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// PCI Compliance Types
export type PCIAssessmentStatus = 'planned' | 'in_progress' | 'completed' | 'failed' | 'remediated';
export type PCIMerchantLevel = 'level_1' | 'level_2' | 'level_3' | 'level_4';
export type PCIServiceProviderLevel = 'level_1' | 'level_2' | 'level_3' | 'level_4';
export type PCIAssessmentType = 'roc' | 'saq_a' | 'saq_a_ep' | 'saq_b' | 'saq_b_ip' | 'saq_c' | 'saq_c_vt' | 'saq_d' | 'saq_d_merchant' | 'saq_d_service_provider' | 'saq_p2pe';

export interface PCICompliance {
  id: string;
  assessment_id: string;
  title: string;
  description: string;
  pci_dss_version: string;
  merchant_level: PCIMerchantLevel;
  service_provider_level?: PCIServiceProviderLevel;
  assessment_type: PCIAssessmentType;
  scope: string;
  status: PCIAssessmentStatus;
  start_date: string;
  end_date?: string;
  completed_date?: string;
  next_assessment_date?: string;
  qsa_company?: string;
  qsa_contact?: string;
  roc_attestation: boolean;
  saq_type?: string;
  compliance_score?: number;
  non_compliant_requirements: string[];
  remediation_plan?: string;
  remediation_status: string;
  assessor_id?: string;
  reviewer_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assessor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reviewer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// ISMS Management Types
export type ISMSStatus = 'planning' | 'implementation' | 'certification' | 'maintenance' | 'surveillance';
export type ISMSCertificationStatus = 'not_certified' | 'in_progress' | 'certified' | 'surveillance' | 'recertification';

export interface ISMSManagement {
  id: string;
  isms_id: string;
  title: string;
  description: string;
  scope: string;
  status: ISMSStatus;
  certification_status: ISMSCertificationStatus;
  iso_version: string;
  implementation_start_date?: string;
  certification_date?: string;
  next_surveillance_date?: string;
  recertification_date?: string;
  certification_body?: string;
  auditor_contact?: string;
  statement_of_applicability?: string;
  risk_assessment_date?: string;
  management_review_date?: string;
  internal_audit_date?: string;
  corrective_actions: string[];
  preventive_actions: string[];
  continual_improvement_plan?: string;
  isms_manager_id?: string;
  management_representative_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  isms_manager?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  management_representative?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// CMMC Management Types
export type CMMCStatus = 'planning' | 'implementation' | 'assessment' | 'certified' | 'maintenance';
export type CMMCCertificationStatus = 'not_certified' | 'in_progress' | 'certified' | 'surveillance';

export interface CMMCManagement {
  id: string;
  cmmc_id: string;
  title: string;
  description: string;
  target_level: number;
  current_level: number;
  scope: string;
  status: CMMCStatus;
  certification_status: CMMCCertificationStatus;
  implementation_start_date?: string;
  target_certification_date?: string;
  certification_date?: string;
  next_assessment_date?: string;
  c3pao_company?: string;
  c3pao_contact?: string;
  gap_assessment_date?: string;
  gap_assessment_results?: string;
  implementation_plan?: string;
  practice_implementation_status?: Record<string, any>;
  process_maturity_status?: Record<string, any>;
  corrective_actions: string[];
  cmmc_manager_id?: string;
  assessor_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  cmmc_manager?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  assessor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Control Testing Types
export type ControlTestResult = 'passed' | 'failed' | 'partially_passed' | 'not_applicable' | 'not_tested';
export type ControlTestType = 'automated' | 'manual' | 'interview' | 'observation' | 'documentation_review' | 'sampling';

export interface ITControlTest {
  id: string;
  test_id: string;
  control_id: string;
  test_name: string;
  test_description: string;
  test_type: ControlTestType;
  test_methodology?: string;
  test_date: string;
  test_result: ControlTestResult;
  sample_size?: number;
  exceptions_found: number;
  exceptions_details: string[];
  evidence_files: string[];
  findings: string[];
  recommendations: string[];
  next_test_date?: string;
  tester_id: string;
  reviewer_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  control?: ITControl;
  tester?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reviewer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Security Monitoring Types
export type MonitoringStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned';
export type MonitoringType = 'siem' | 'ids_ips' | 'endpoint' | 'network' | 'application' | 'database' | 'cloud' | 'physical';

export interface ITSecurityMonitoring {
  id: string;
  monitoring_id: string;
  title: string;
  description: string;
  monitoring_type: MonitoringType;
  system_monitored: string;
  monitoring_tool?: string;
  alert_threshold?: string;
  status: MonitoringStatus;
  uptime_percentage?: number;
  last_alert_date?: string;
  alert_count_24h: number;
  alert_count_7d: number;
  alert_count_30d: number;
  false_positive_rate?: number;
  response_time_avg?: number;
  escalation_procedure?: string;
  notification_contacts: string[];
  integration_details?: Record<string, any>;
  owner_id?: string;
  operator_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  operator?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Security Alerts Types
export type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
export type AlertType = 
  | 'malware_detection'
  | 'suspicious_activity'
  | 'failed_login'
  | 'data_exfiltration'
  | 'network_anomaly'
  | 'vulnerability_scan'
  | 'policy_violation'
  | 'system_compromise'
  | 'other';

export interface ITSecurityAlert {
  id: string;
  alert_id: string;
  title: string;
  description: string;
  alert_type: AlertType;
  severity: IncidentSeverity;
  status: AlertStatus;
  source_system: string;
  source_ip?: string;
  destination_ip?: string;
  affected_asset?: string;
  affected_user?: string;
  alert_time: string;
  acknowledged_time?: string;
  resolved_time?: string;
  closed_time?: string;
  investigation_notes?: string;
  resolution_notes?: string;
  false_positive: boolean;
  escalated: boolean;
  escalation_level: number;
  assigned_to?: string;
  escalated_to?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assigned_to_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  escalated_to_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Security Assets Types
export type AssetClassification = 'public' | 'internal' | 'confidential' | 'restricted';
export type AssetCriticality = 'low' | 'medium' | 'high' | 'critical';
export type AssetType = 
  | 'server'
  | 'workstation'
  | 'network_device'
  | 'mobile_device'
  | 'application'
  | 'database'
  | 'cloud_service'
  | 'physical_asset'
  | 'other';

export type AssetCategory = 
  | 'infrastructure'
  | 'endpoint'
  | 'network'
  | 'application'
  | 'data'
  | 'cloud'
  | 'physical'
  | 'other';

export interface ITSecurityAsset {
  id: string;
  asset_id: string;
  name: string;
  description?: string;
  asset_type: AssetType;
  category: AssetCategory;
  classification: AssetClassification;
  criticality: AssetCriticality;
  location?: string;
  ip_address?: string;
  mac_address?: string;
  operating_system?: string;
  software_versions: string[];
  patch_level?: string;
  last_patch_date?: string;
  next_patch_date?: string;
  antivirus_status?: string;
  firewall_status?: string;
  encryption_status?: string;
  backup_status?: string;
  monitoring_enabled: boolean;
  vulnerability_scan_enabled: boolean;
  last_scan_date?: string;
  risk_score?: number;
  owner_id?: string;
  custodian_id?: string;
  business_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  custodian?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// Form Data Types
export interface ITSecurityIncidentFormData {
  title: string;
  description: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  detected_at: string;
  reported_at: string;
  affected_systems: string[];
  affected_users?: number;
  data_breach: boolean;
  data_types_affected: string[];
  regulatory_impact: string[];
  financial_impact?: number;
  reputation_impact?: string;
  assigned_to?: string;
  incident_manager_id?: string;
  business_unit_id?: string;
}

export interface ITSecurityPolicyFormData {
  policy_code: string;
  title: string;
  description: string;
  policy_type: PolicyType;
  category: PolicyCategory;
  version: string;
  content: string;
  scope?: string;
  exceptions?: string;
  compliance_frameworks: string[];
  related_policies: string[];
  effective_date?: string;
  review_date?: string;
  next_review_date?: string;
  owner_id?: string;
  approver_id?: string;
  business_unit_id?: string;
}

export interface ITSecurityVulnerabilityFormData {
  vulnerability_id: string;
  title: string;
  description: string;
  cve_id?: string;
  cvss_score?: number;
  cvss_vector?: string;
  severity: IncidentSeverity;
  priority: VulnerabilityPriority;
  affected_systems: string[];
  affected_software: string[];
  affected_versions: string[];
  discovery_date: string;
  due_date?: string;
  remediation_plan?: string;
  risk_score?: number;
  business_impact?: string;
  technical_impact?: string;
  exploit_available: boolean;
  exploit_public: boolean;
  assigned_to?: string;
  owner_id?: string;
  business_unit_id?: string;
}

export interface ITRiskAssessmentFormData {
  assessment_number: string;
  title: string;
  description: string;
  assessment_type: RiskAssessmentType;
  scope: string;
  methodology?: string;
  start_date: string;
  end_date?: string;
  risk_matrix_id?: string;
  key_findings: string[];
  recommendations: string[];
  next_assessment_date?: string;
  assessor_id?: string;
  reviewer_id?: string;
  approver_id?: string;
  business_unit_id?: string;
}

export interface ITControlFormData {
  control_code: string;
  title: string;
  description: string;
  control_type: ITControlType;
  category: ITControlCategory;
  framework?: ITControlFramework;
  control_family?: string;
  implementation_status: ITControlImplementationStatus;
  testing_frequency: ITControlTestingFrequency;
  last_tested_date?: string;
  next_test_date?: string;
  automated: boolean;
  monitoring_enabled: boolean;
  alerting_enabled: boolean;
  documentation_url?: string;
  owner_id?: string;
  tester_id?: string;
  business_unit_id?: string;
}

export interface PCIComplianceFormData {
  assessment_id: string;
  title: string;
  description: string;
  pci_dss_version: string;
  merchant_level: PCIMerchantLevel;
  service_provider_level?: PCIServiceProviderLevel;
  assessment_type: PCIAssessmentType;
  scope: string;
  start_date: string;
  end_date?: string;
  next_assessment_date?: string;
  qsa_company?: string;
  qsa_contact?: string;
  roc_attestation: boolean;
  saq_type?: string;
  non_compliant_requirements: string[];
  remediation_plan?: string;
  assessor_id?: string;
  reviewer_id?: string;
  business_unit_id?: string;
}

export interface ISMSManagementFormData {
  isms_id: string;
  title: string;
  description: string;
  scope: string;
  iso_version: string;
  implementation_start_date?: string;
  certification_date?: string;
  next_surveillance_date?: string;
  recertification_date?: string;
  certification_body?: string;
  auditor_contact?: string;
  statement_of_applicability?: string;
  risk_assessment_date?: string;
  management_review_date?: string;
  internal_audit_date?: string;
  corrective_actions: string[];
  preventive_actions: string[];
  continual_improvement_plan?: string;
  isms_manager_id?: string;
  management_representative_id?: string;
  business_unit_id?: string;
}

export interface CMMCManagementFormData {
  cmmc_id: string;
  title: string;
  description: string;
  target_level: number;
  current_level: number;
  scope: string;
  implementation_start_date?: string;
  target_certification_date?: string;
  certification_date?: string;
  next_assessment_date?: string;
  c3pao_company?: string;
  c3pao_contact?: string;
  gap_assessment_date?: string;
  gap_assessment_results?: string;
  implementation_plan?: string;
  practice_implementation_status?: Record<string, any>;
  process_maturity_status?: Record<string, any>;
  corrective_actions: string[];
  cmmc_manager_id?: string;
  assessor_id?: string;
  business_unit_id?: string;
}

export interface ITControlTestFormData {
  test_id: string;
  control_id: string;
  test_name: string;
  test_description: string;
  test_type: ControlTestType;
  test_methodology?: string;
  test_date: string;
  test_result: ControlTestResult;
  sample_size?: number;
  exceptions_found: number;
  exceptions_details: string[];
  evidence_files: string[];
  findings: string[];
  recommendations: string[];
  next_test_date?: string;
  tester_id: string;
  reviewer_id?: string;
  business_unit_id?: string;
}

export interface ITSecurityMonitoringFormData {
  monitoring_id: string;
  title: string;
  description: string;
  monitoring_type: MonitoringType;
  system_monitored: string;
  monitoring_tool?: string;
  alert_threshold?: string;
  escalation_procedure?: string;
  notification_contacts: string[];
  integration_details?: Record<string, any>;
  owner_id?: string;
  operator_id?: string;
  business_unit_id?: string;
}

export interface ITSecurityAlertFormData {
  alert_id: string;
  title: string;
  description: string;
  alert_type: AlertType;
  severity: IncidentSeverity;
  source_system: string;
  source_ip?: string;
  destination_ip?: string;
  affected_asset?: string;
  affected_user?: string;
  alert_time: string;
  investigation_notes?: string;
  resolution_notes?: string;
  false_positive: boolean;
  escalated: boolean;
  escalation_level: number;
  assigned_to?: string;
  escalated_to?: string;
  business_unit_id?: string;
}

export interface ITSecurityAssetFormData {
  asset_id: string;
  name: string;
  description?: string;
  asset_type: AssetType;
  category: AssetCategory;
  classification: AssetClassification;
  criticality: AssetCriticality;
  location?: string;
  ip_address?: string;
  mac_address?: string;
  operating_system?: string;
  software_versions: string[];
  patch_level?: string;
  last_patch_date?: string;
  next_patch_date?: string;
  antivirus_status?: string;
  firewall_status?: string;
  encryption_status?: string;
  backup_status?: string;
  monitoring_enabled: boolean;
  vulnerability_scan_enabled: boolean;
  last_scan_date?: string;
  risk_score?: number;
  owner_id?: string;
  custodian_id?: string;
  business_unit_id?: string;
}

// Dashboard and Analytics Types
export interface ITSecurityDashboardMetrics {
  total_incidents: number;
  open_incidents: number;
  critical_incidents: number;
  resolved_incidents_30d: number;
  total_vulnerabilities: number;
  high_critical_vulnerabilities: number;
  patched_vulnerabilities_30d: number;
  total_policies: number;
  active_policies: number;
  policies_due_review: number;
  total_controls: number;
  implemented_controls: number;
  effective_controls: number;
  total_assets: number;
  critical_assets: number;
  assets_with_vulnerabilities: number;
  pci_compliance_score: number;
  isms_certification_status: string;
  cmmc_current_level: number;
  security_alerts_24h: number;
  false_positive_rate: number;
}

// Filter and Search Types
export interface ITSecurityFilterOptions {
  status?: string[];
  severity?: string[];
  priority?: string[];
  type?: string[];
  category?: string[];
  framework?: string[];
  merchant_level?: string[];
  target_level?: string[];
  certification_status?: string[];
  classification?: string[];
  criticality?: string[];
  control_id?: string[];
  business_unit?: string[];
  assigned_to?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ITSecuritySearchParams {
  query?: string;
  filters?: ITSecurityFilterOptions;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
