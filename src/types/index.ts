// User Management Types
export type UserRole =
  | "super_admin"
  | "admin"
  | "cro"
  | "supervisor_auditor"
  | "auditor"
  | "reviewer"
  | "viewer"
  | "business_unit_manager"
  | "business_unit_user";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department: string;
  business_unit_id?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager_id: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Audit Management Types
export type AuditStatus =
  | "draft"
  | "planning"
  | "in_progress"
  | "testing"
  | "reporting"
  | "completed"
  | "cancelled"
  | "on_hold";

export type AuditType =
  | "internal"
  | "external"
  | "compliance"
  | "operational"
  | "financial"
  | "it"
  | "quality"
  | "environmental";

export interface Audit {
  id: string;
  title: string;
  description: string;
  audit_type: AuditType;
  status: AuditStatus;
  business_unit_id: string;
  lead_auditor_id: string;
  team_members: string[];
  start_date: string;
  end_date: string;
  planned_hours: number;
  actual_hours?: number;
  objectives: string[];
  scope: string;
  methodology: string;
  ai_generated: boolean;
  ai_model_used?: string;
  approval_status: ApprovalStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data from Supabase queries
  lead_auditor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  created_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_units?: {
    name: string;
    code: string;
  };
}

// Form data type for audit creation/editing
export interface AuditFormData {
  title: string;
  description: string;
  audit_type: AuditType;
  status: AuditStatus;
  business_unit_id: string;
  lead_auditor_id: string;
  team_members?: string[];
  start_date: string;
  end_date: string;
  planned_hours: number;
  objectives: string[];
  scope: string;
  methodology: string;
  approval_status?: ApprovalStatus;
}

// Control Management Types
export type ControlType =
  | "preventive"
  | "detective"
  | "corrective"
  | "directive";

export type ControlFrequency =
  | "continuous"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annually"
  | "ad_hoc";

export type ControlEffectiveness =
  | "not_tested"
  | "effective"
  | "partially_effective"
  | "ineffective";

export interface Control {
  id: string;
  control_set_id: string;
  control_code: string;
  title: string;
  description: string;
  control_type: ControlType;
  frequency: ControlFrequency;
  process_area: string;
  owner_id: string;
  testing_procedure: string;
  evidence_requirements: string;
  effectiveness: ControlEffectiveness;
  last_tested_date?: string;
  next_test_date?: string;
  is_automated: boolean;
  ai_generated: boolean;
  ai_model_used?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ControlSet {
  id: string;
  audit_id: string;
  name: string;
  description: string;
  process_area: string;
  total_controls: number;
  tested_controls: number;
  effective_controls: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ControlFormData {
  control_code: string;
  title: string;
  description: string;
  control_type: ControlType;
  frequency: ControlFrequency;
  process_area: string;
  owner_id: string;
  testing_procedure: string;
  evidence_requirements: string;
  effectiveness?: ControlEffectiveness;
  last_tested_date?: string;
  next_test_date?: string;
  is_automated: boolean;
}

export interface ControlSetFormData {
  name: string;
  description: string;
  process_area: string;
}

// Risk Management Types
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type RiskCategory =
  | "operational"
  | "financial"
  | "compliance"
  | "strategic"
  | "reputation"
  | "technology"
  | "human_resources";

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  business_unit_id: string;
  probability: number; // 1-5
  impact: number; // 1-5
  risk_level: RiskLevel;
  inherent_risk_score: number;
  residual_risk_score: number;
  mitigation_strategy: string;
  owner_id: string;
  status: "identified" | "assessed" | "mitigated" | "accepted" | "transferred";
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Control Management Types
export type ControlType =
  | "preventive"
  | "detective"
  | "corrective"
  | "directive";

export type ControlFrequency =
  | "continuous"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annually"
  | "ad_hoc";

export type ControlEffectiveness =
  | "not_tested"
  | "effective"
  | "partially_effective"
  | "ineffective";

export interface Control {
  id: string;
  code: string;
  title: string;
  description: string;
  control_type: ControlType;
  frequency: ControlFrequency;
  business_unit_id: string;
  process_area: string;
  owner_id: string;
  risk_ids: string[];
  testing_procedure: string;
  evidence_requirements: string[];
  effectiveness: ControlEffectiveness;
  last_tested_date?: string;
  next_test_date?: string;
  automated: boolean;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Testing and Findings Types
export type TestResult = "passed" | "failed" | "not_applicable" | "not_tested";
export type FindingSeverity = "low" | "medium" | "high" | "critical";
export type FindingStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "deferred";

export interface ControlTest {
  id: string;
  control_id: string;
  audit_id: string;
  tester_id: string;
  test_date: string;
  test_result: TestResult;
  sample_size?: number;
  exceptions_noted?: number;
  testing_notes: string;
  evidence_files: string[];
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: string;
  audit_id: string;
  control_id?: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed" | "deferred";
  risk_rating: "low" | "medium" | "high" | "critical";
  business_impact: string;
  root_cause: string;
  recommendation: string;
  assigned_to?: string;
  due_date?: string;
  evidence_files?: string[];
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Control Management Types
export type ControlType =
  | "preventive"
  | "detective"
  | "corrective"
  | "directive";

export type ControlFrequency =
  | "continuous"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annually"
  | "adhoc";

export type ControlEffectiveness =
  | "not_tested"
  | "effective"
  | "partially_effective"
  | "ineffective";

export interface ControlSet {
  id: string;
  audit_id: string;
  name: string;
  description: string;
  framework: string;
  controls_count: number;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Control {
  id: string;
  control_set_id: string;
  audit_id: string;
  control_code: string;
  title: string;
  description: string;
  control_type: ControlType;
  frequency: ControlFrequency;
  process_area: string;
  owner_id?: string;
  testing_procedure: string;
  evidence_requirements: string;
  effectiveness: ControlEffectiveness;
  last_tested_date?: string;
  next_test_date?: string;
  is_automated: boolean;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ControlFormData {
  control_code: string;
  title: string;
  description: string;
  control_type: ControlType;
  frequency: ControlFrequency;
  process_area: string;
  owner_id?: string;
  testing_procedure: string;
  evidence_requirements: string;
  effectiveness: ControlEffectiveness;
  last_tested_date?: string;
  next_test_date?: string;
  is_automated: boolean;
}

export interface ControlSetFormData {
  name: string;
  description: string;
  framework: string;
  controls: ControlFormData[];
}

// Workflow Management Types
export type ApprovalStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "revision_required";

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  assignee_role: UserRole;
  assignee_id?: string;
  required: boolean;
  status: "pending" | "completed" | "skipped";
  completed_at?: string;
  completed_by?: string;
  comments?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  entity_type: "audit" | "finding" | "control" | "risk";
  steps: WorkflowStep[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  entity_type: "audit" | "finding" | "control" | "risk";
  entity_id: string;
  workflow_id: string;
  current_step: number;
  status: ApprovalStatus;
  requested_by: string;
  requested_at: string;
  completed_at?: string;
}

// AI Integration Types
export type AIProvider = "ollama" | "openai" | "claude" | "gemini";

export interface AIConfiguration {
  id: string;
  provider: AIProvider;
  model_name: string;
  api_endpoint?: string;
  api_key?: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AIRequest {
  id: string;
  user_id: string;
  provider: AIProvider;
  model_name: string;
  prompt: string;
  response: string;
  tokens_used: number;
  request_type:
    | "control_generation"
    | "risk_assessment"
    | "audit_plan"
    | "finding_analysis";
  entity_id?: string;
  created_at: string;
}

// Dashboard and Analytics Types
export interface DashboardMetrics {
  total_audits: number;
  active_audits: number;
  completed_audits: number;
  overdue_audits: number;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  resolved_findings: number;
  total_controls: number;
  effective_controls: number;
  ineffective_controls: number;
  untested_controls: number;
  total_risks: number;
  high_risks: number;
  critical_risks: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Comment and Communication Types
export interface Comment {
  id: string;
  entity_type: "audit" | "finding" | "control" | "risk";
  entity_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// File and Evidence Types
export interface EvidenceFile {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  entity_type: "audit" | "finding" | "control" | "test";
  entity_id: string;
  uploaded_by: string;
  uploaded_at: string;
}

// Notification Types
export type NotificationType =
  | "audit_assigned"
  | "finding_created"
  | "approval_required"
  | "due_date_reminder"
  | "test_overdue"
  | "comment_added";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
}

// Form and Validation Types
export interface FormError {
  field: string;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: FormError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter and Search Types
export interface FilterOptions {
  status?: string[];
  type?: string[];
  severity?: string[];
  business_unit?: string[];
  assigned_to?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface SearchParams {
  query?: string;
  filters?: FilterOptions;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

// Language and Localization Types
export type SupportedLanguage = "en" | "es" | "fr" | "de" | "tr";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

// Re-export ESG types
export * from './esg';
