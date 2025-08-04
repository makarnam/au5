export type UUID = string;

export type ComplianceStatus = 'unknown' | 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
export type AttestationStatus = 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'expired';

export type ComplianceFramework = {
  id: UUID;
  code: string;
  name: string;
  version?: string | null;
  description?: string | null;
  authority?: string | null;
  category?: string | null;
  is_active: boolean;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceSection = {
  id: UUID;
  framework_id: UUID;
  parent_section_id?: UUID | null;
  code?: string | null;
  title: string;
  description?: string | null;
  sort_order?: number | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceRequirement = {
  id: UUID;
  framework_id: UUID;
  section_id?: UUID | null;
  requirement_code: string;
  title: string;
  text: string;
  guidance?: string | null;
  priority?: string | null;
  is_active: boolean;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceProfile = {
  id: UUID;
  name: string;
  description?: string | null;
  framework_id: UUID;
  business_unit_id?: UUID | null;
  owner_id?: UUID | null;
  is_active: boolean;
  tags?: string[] | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceAssessment = {
  id: UUID;
  framework_id: UUID;
  profile_id?: UUID | null;
  requirement_id: UUID;
  status: ComplianceStatus;
  justification?: string | null;
  target_remediation_date?: string | null;
  owner_id?: UUID | null;
  reviewer_id?: UUID | null;
  last_evaluated_at: string;
  score?: number | null;
  ai_generated: boolean;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceAttestation = {
  id: UUID;
  framework_id: UUID;
  profile_id?: UUID | null;
  period_start: string;
  period_end: string;
  status: AttestationStatus;
  attestor_id?: UUID | null;
  statement?: string | null;
  attachments?: any;
  submitted_at?: string | null;
  approved_by?: UUID | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceException = {
  id: UUID;
  framework_id: UUID;
  requirement_id: UUID;
  profile_id?: UUID | null;
  title: string;
  description?: string | null;
  compensating_controls?: string | null;
  risk_acceptance?: string | null;
  status: 'proposed' | 'approved' | 'rejected' | 'in_effect' | 'expired' | 'withdrawn';
  requested_by?: UUID | null;
  approver_id?: UUID | null;
  effective_from?: string | null;
  effective_to?: string | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};