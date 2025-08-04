import { supabase } from '../lib/supabase';

export type UUID = string;

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
  status: 'unknown' | 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
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

// Light-weight row types for new relation maps
export type RequirementControlMap = {
  id: UUID;
  requirement_id: UUID;
  control_id: UUID;
  mapping_strength?: string | null;
  notes?: string | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type RequirementRiskMap = {
  id: UUID;
  requirement_id: UUID;
  risk_id: UUID;
  mapping_strength?: string | null;
  notes?: string | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type RequirementAuditMap = {
  id: UUID;
  requirement_id: UUID;
  audit_id: UUID;
  relation_type?: string | null;
  notes?: string | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export const ComplianceService = {
  // Frameworks
  async listFrameworks() {
    return supabase.from('compliance_frameworks').select('*').order('name', { ascending: true });
  },
  async getFramework(id: UUID) {
    return supabase.from('compliance_frameworks').select('*').eq('id', id).single();
  },
  async createFramework(payload: Partial<ComplianceFramework>) {
    return supabase.from('compliance_frameworks').insert(payload).select().single();
  },
  async updateFramework(id: UUID, patch: Partial<ComplianceFramework>) {
    return supabase.from('compliance_frameworks').update(patch).eq('id', id).select().single();
  },
  async deleteFramework(id: UUID) {
    return supabase.from('compliance_frameworks').delete().eq('id', id);
  },

  // Requirements
  async listRequirements(frameworkId: UUID) {
    return supabase
      .from('compliance_requirements')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('requirement_code', { ascending: true });
  },
  async upsertRequirement(payload: Partial<ComplianceRequirement>) {
    return supabase.from('compliance_requirements').upsert(payload).select().single();
  },

  // Profiles
  async listProfiles(frameworkId?: UUID) {
    let q = supabase.from('compliance_profiles').select('*').order('created_at', { ascending: false });
    if (frameworkId) q = q.eq('framework_id', frameworkId);
    return q;
  },
  async createProfile(payload: Partial<ComplianceProfile>) {
    // Ensure created_by = auth.uid() via RPC wrapper to satisfy RLS
    // Create a lightweight RPC using PostgREST single-row insert with default created_by set by trigger/policy
    // If no trigger exists, we explicitly set created_by from the current session
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    // Only send allowed/necessary columns; rely on defaults for others
    const toInsert: Partial<ComplianceProfile> = {
      name: payload.name,
      description: payload.description ?? null,
      framework_id: payload.framework_id as string,
      is_active: payload.is_active ?? true,
      created_by: userId as any,
    };

    return supabase.from('compliance_profiles').insert(toInsert).select().single();
  },

  // Profile requirement applicability
  async upsertProfileRequirement(payload: { profile_id: UUID; requirement_id: UUID; applicable?: boolean; applicability_notes?: string | null; }) {
    return supabase
      .from('compliance_profile_requirements')
      .upsert(payload, { onConflict: 'profile_id,requirement_id' })
      .select()
      .single();
  },

  // Assessments
  async listAssessmentsByProfile(profileId: UUID) {
    return supabase
      .from('compliance_assessments')
      .select('*, compliance_requirements (*)')
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false });
  },
  async upsertAssessment(payload: Partial<ComplianceAssessment>) {
    return supabase.from('compliance_assessments').upsert(payload).select().single();
  },

  // Mapping requirement to control
  async mapControl(requirementId: UUID, controlId: UUID, notes?: string) {
    return supabase
      .from('requirement_controls_map')
      .insert({ requirement_id: requirementId, control_id: controlId, notes })
      .select()
      .single();
  },

  // New: Mapping requirement to risk
  async mapRisk(requirementId: UUID, riskId: UUID, notes?: string, mapping_strength?: string) {
    return supabase
      .from('requirement_risks_map')
      .insert({
        requirement_id: requirementId,
        risk_id: riskId,
        notes,
        mapping_strength: mapping_strength ?? 'direct',
      })
      .select()
      .single();
  },
  async unmapRisk(requirementId: UUID, riskId: UUID) {
    return supabase
      .from('requirement_risks_map')
      .delete()
      .eq('requirement_id', requirementId)
      .eq('risk_id', riskId);
  },
  async listRequirementRisks(requirementId: UUID) {
    return supabase
      .from('requirement_risks_map')
      .select('*')
      .eq('requirement_id', requirementId)
      .order('created_at', { ascending: false });
  },

  // New: Mapping requirement to audit
  async mapAudit(requirementId: UUID, auditId: UUID, notes?: string, relation_type?: string) {
    return supabase
      .from('requirement_audits_map')
      .insert({
        requirement_id: requirementId,
        audit_id: auditId,
        notes,
        relation_type: relation_type ?? 'scoped',
      })
      .select()
      .single();
  },
  async unmapAudit(requirementId: UUID, auditId: UUID) {
    return supabase
      .from('requirement_audits_map')
      .delete()
      .eq('requirement_id', requirementId)
      .eq('audit_id', auditId);
  },
  async listRequirementAudits(requirementId: UUID) {
    return supabase
      .from('requirement_audits_map')
      .select('*')
      .eq('requirement_id', requirementId)
      .order('created_at', { ascending: false });
  },

  // Exceptions
  async listExceptions(frameworkId: UUID, profileId?: UUID) {
    let q = supabase.from('compliance_exceptions').select('*').eq('framework_id', frameworkId).order('created_at', { ascending: false });
    if (profileId) q = q.eq('profile_id', profileId);
    return q;
  },

  // Posture
  async computeSnapshot(frameworkId: UUID, profileId?: UUID) {
    const { error } = await supabase.rpc('compute_compliance_snapshot', {
      p_framework: frameworkId,
      p_profile: profileId ?? null,
    });
    return { error };
  },
};