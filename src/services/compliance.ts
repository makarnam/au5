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
    return supabase.from('compliance_profiles').insert(payload).select().single();
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