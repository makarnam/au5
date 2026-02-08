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
  ai_generated: boolean;
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
  description?: string | null;
  text: string;
  guidance?: string | null;
  category?: string | null;
  priority?: string | null;
  implementation_level?: string | null;
  evidence_required?: string | null;
  assessment_frequency?: string | null;
  is_active: boolean;
  tags?: string[] | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceSection = {
  id: UUID;
  framework_id: UUID;
  section_code: string;
  title: string;
  description?: string | null;
  parent_section_id?: UUID | null;
  sort_order: number;
  is_active: boolean;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceMapping = {
  id: UUID;
  requirement_id: UUID;
  entity_type: 'risk' | 'control' | 'policy' | 'process' | 'asset';
  entity_id: UUID;
  mapping_type?: 'direct' | 'indirect' | 'supporting' | 'compensating';
  coverage_percentage?: number | null;
  mapping_strength?: 'weak' | 'moderate' | 'strong' | 'complete';
  notes?: string | null;
  mapped_by?: UUID | null;
  mapped_at: string;
};

export type ComplianceAssessment = {
  id: UUID;
  framework_id: UUID;
  profile_id?: UUID | null;
  requirement_id: UUID;
  status: 'unknown' | 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable' | 'under_review';
  justification?: string | null;
  evidence_description?: string | null;
  evidence_location?: string | null;
  target_remediation_date?: string | null;
  actual_remediation_date?: string | null;
  owner_id?: UUID | null;
  reviewer_id?: UUID | null;
  assessment_score?: number | null;
  risk_rating?: 'low' | 'medium' | 'high' | 'critical';
  last_evaluated_at: string;
  next_review_date?: string | null;
  ai_generated: boolean;
  ai_confidence?: number | null;
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
  metadata?: Record<string, any> | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceSnapshot = {
  id: UUID;
  framework_id: UUID;
  profile_id?: UUID | null;
  snapshot_date: string;
  overall_score?: number | null;
  compliant_count: number;
  partially_compliant_count: number;
  non_compliant_count: number;
  not_applicable_count: number;
  unknown_count: number;
  total_requirements: number;
  metadata?: Record<string, any> | null;
  created_by?: UUID | null;
  created_at: string;
};

export const ComplianceFrameworkService = {
  // =====================================================================================
  // FRAMEWORK MANAGEMENT
  // =====================================================================================

  async listFrameworks() {
    return supabase
      .from('compliance_frameworks')
      .select('*')
      .order('name', { ascending: true });
  },

  async getFramework(id: UUID) {
    return supabase
      .from('compliance_frameworks')
      .select('*')
      .eq('id', id)
      .single();
  },

  async createFramework(payload: Partial<ComplianceFramework>) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = {
      ...payload,
      created_by: userId,
      is_active: payload.is_active ?? true,
    };

    return supabase
      .from('compliance_frameworks')
      .insert(toInsert)
      .select()
      .single();
  },

  async updateFramework(id: UUID, payload: Partial<ComplianceFramework>) {
    return supabase
      .from('compliance_frameworks')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteFramework(id: UUID) {
    return supabase
      .from('compliance_frameworks')
      .delete()
      .eq('id', id);
  },

  // =====================================================================================
  // SECTION MANAGEMENT
  // =====================================================================================

  async listSections(frameworkId: UUID) {
    return supabase
      .from('compliance_sections')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('sort_order', { ascending: true });
  },

  async createSection(payload: Partial<ComplianceSection>) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = {
      ...payload,
      created_by: userId,
      is_active: payload.is_active ?? true,
      sort_order: payload.sort_order ?? 0,
    };

    return supabase
      .from('compliance_sections')
      .insert(toInsert)
      .select()
      .single();
  },

  async updateSection(id: UUID, payload: Partial<ComplianceSection>) {
    return supabase
      .from('compliance_sections')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteSection(id: UUID) {
    return supabase
      .from('compliance_sections')
      .delete()
      .eq('id', id);
  },

  // =====================================================================================
  // REQUIREMENT MANAGEMENT
  // =====================================================================================

  async listRequirements(frameworkId: UUID, sectionId?: UUID) {
    let query = supabase
      .from('compliance_requirements')
      .select('*')
      .eq('framework_id', frameworkId);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    return query.order('requirement_code', { ascending: true });
  },

  async getRequirement(id: UUID) {
    return supabase
      .from('compliance_requirements')
      .select('*')
      .eq('id', id)
      .single();
  },

  async createRequirement(payload: Partial<ComplianceRequirement>) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = {
      ...payload,
      created_by: userId,
      is_active: payload.is_active ?? true,
      assessment_frequency: payload.assessment_frequency ?? 'annual',
    };

    return supabase
      .from('compliance_requirements')
      .insert(toInsert)
      .select()
      .single();
  },

  async updateRequirement(id: UUID, payload: Partial<ComplianceRequirement>) {
    return supabase
      .from('compliance_requirements')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteRequirement(id: UUID) {
    return supabase
      .from('compliance_requirements')
      .delete()
      .eq('id', id);
  },

  // =====================================================================================
  // MAPPING MANAGEMENT
  // =====================================================================================

  async createMapping(payload: Partial<ComplianceMapping>) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = {
      ...payload,
      mapped_by: userId,
      mapped_at: new Date().toISOString(),
    };

    return supabase
      .from('compliance_mappings')
      .insert(toInsert)
      .select()
      .single();
  },

  async listMappings(requirementId: UUID) {
    return supabase
      .from('compliance_mappings')
      .select('*')
      .eq('requirement_id', requirementId)
      .order('mapped_at', { ascending: false });
  },

  async deleteMapping(id: UUID) {
    return supabase
      .from('compliance_mappings')
      .delete()
      .eq('id', id);
  },

  // =====================================================================================
  // ASSESSMENT MANAGEMENT
  // =====================================================================================

  async listAssessments(frameworkId: UUID, profileId?: UUID) {
    let query = supabase
      .from('compliance_assessments')
      .select(`
        *,
        compliance_requirements (*),
        compliance_profiles (*)
      `)
      .eq('framework_id', frameworkId);

    if (profileId) {
      query = query.eq('profile_id', profileId);
    }

    return query.order('updated_at', { ascending: false });
  },

  async createAssessment(payload: Partial<ComplianceAssessment>) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = {
      ...payload,
      created_by: userId,
      last_evaluated_at: new Date().toISOString(),
      ai_generated: payload.ai_generated ?? false,
    };

    return supabase
      .from('compliance_assessments')
      .insert(toInsert)
      .select()
      .single();
  },

  async updateAssessment(id: UUID, payload: Partial<ComplianceAssessment>) {
    return supabase
      .from('compliance_assessments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteAssessment(id: UUID) {
    return supabase
      .from('compliance_assessments')
      .delete()
      .eq('id', id);
  },

  // =====================================================================================
  // PROFILE MANAGEMENT
  // =====================================================================================

  async listProfiles(frameworkId?: UUID) {
    let query = supabase
      .from('compliance_profiles')
      .select(`
        *,
        compliance_frameworks (*)
      `);

    if (frameworkId) {
      query = query.eq('framework_id', frameworkId);
    }

    return query.order('created_at', { ascending: false });
  },

  async createProfile(payload: Partial<ComplianceProfile>) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = {
      ...payload,
      created_by: userId,
      is_active: payload.is_active ?? true,
      metadata: payload.metadata ?? {},
    };

    return supabase
      .from('compliance_profiles')
      .insert(toInsert)
      .select()
      .single();
  },

  async updateProfile(id: UUID, payload: Partial<ComplianceProfile>) {
    return supabase
      .from('compliance_profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteProfile(id: UUID) {
    return supabase
      .from('compliance_profiles')
      .delete()
      .eq('id', id);
  },

  // =====================================================================================
  // ANALYTICS & REPORTING
  // =====================================================================================

  async getComplianceMetrics(frameworkId: UUID, profileId?: UUID) {
    const { data, error } = await supabase.rpc('compute_compliance_snapshot', {
      p_framework: frameworkId,
      p_profile: profileId || null,
    });

    return { data, error };
  },

  async getComplianceTrends(frameworkId: UUID, profileId?: UUID, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('compliance_snapshots')
      .select('*')
      .eq('framework_id', frameworkId)
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (profileId) {
      query = query.eq('profile_id', profileId);
    }

    return query;
  },

  async getRequirementCoverage(frameworkId: UUID) {
    return supabase
      .from('compliance_requirements')
      .select(`
        *,
        compliance_mappings (*),
        compliance_assessments (*)
      `)
      .eq('framework_id', frameworkId)
      .eq('is_active', true);
  },

  // =====================================================================================
  // AI INTEGRATION
  // =====================================================================================

  async generateAIAssessment(requirementId: UUID, context?: string) {
    // This would integrate with the AI service to generate assessments
    // For now, return a placeholder structure
    console.log('Generating AI assessment for requirement:', requirementId, context);
    return {
      data: {
        status: 'under_review',
        justification: 'AI-generated assessment pending review',
        ai_generated: true,
        ai_confidence: 0.8,
      },
      error: null,
    };
  },

  async analyzeComplianceGaps(frameworkId: UUID, profileId?: UUID) {
    // This would integrate with AI to analyze compliance gaps
    console.log('Analyzing compliance gaps for framework:', frameworkId, 'profile:', profileId);
    return {
      data: {
        gaps: [],
        recommendations: [],
        risk_level: 'medium',
      },
      error: null,
    };
  },

  // =====================================================================================
  // UTILITY FUNCTIONS
  // =====================================================================================

  async bulkCreateRequirements(frameworkId: UUID, requirements: Partial<ComplianceRequirement>[]) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = requirements.map(req => ({
      ...req,
      framework_id: frameworkId,
      created_by: userId,
      is_active: req.is_active ?? true,
      assessment_frequency: req.assessment_frequency ?? 'annual',
    }));

    return supabase
      .from('compliance_requirements')
      .insert(toInsert)
      .select();
  },

  async exportFramework(frameworkId: UUID) {
    const { data: framework } = await this.getFramework(frameworkId);
    const { data: sections } = await this.listSections(frameworkId);
    const { data: requirements } = await this.listRequirements(frameworkId);

    return {
      framework,
      sections,
      requirements,
    };
  },

  async importFramework(frameworkData: {
    framework: Partial<ComplianceFramework>;
    sections: Partial<ComplianceSection>[];
    requirements: Partial<ComplianceRequirement>[];
  }) {
    // Create framework first
    const { data: framework, error: frameworkError } = await this.createFramework(frameworkData.framework);
    if (frameworkError) return { data: null, error: frameworkError };

    // Create sections
    const sectionsWithFrameworkId = frameworkData.sections.map(section => ({
      ...section,
      framework_id: framework.id,
    }));

    const { data: sections, error: sectionsError } = await supabase
      .from('compliance_sections')
      .insert(sectionsWithFrameworkId)
      .select();

    if (sectionsError) return { data: null, error: sectionsError };

    // Create requirements
    const requirementsWithFrameworkId = frameworkData.requirements.map(req => ({
      ...req,
      framework_id: framework.id,
    }));

    const { data: requirements, error: requirementsError } = await supabase
      .from('compliance_requirements')
      .insert(requirementsWithFrameworkId)
      .select();

    return {
      data: {
        framework,
        sections,
        requirements,
      },
      error: requirementsError,
    };
  },

  // =====================================================================================
  // ENHANCED FRAMEWORK MANAGEMENT
  // =====================================================================================

  async validateFrameworkCode(code: string, excludeId?: UUID) {
    const query = supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('code', code)
      .eq('is_active', true);

    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data, error } = await query;
    return { isValid: !data || data.length === 0, error };
  },

  async getFrameworkStats(frameworkId: UUID) {
    const { data: requirements } = await this.listRequirements(frameworkId);
    const { data: sections } = await this.listSections(frameworkId);
    const { data: profiles } = await this.listProfiles(frameworkId);
    const { data: assessments } = await this.listAssessments(frameworkId);

    return {
      requirementsCount: requirements?.length || 0,
      sectionsCount: sections?.length || 0,
      profilesCount: profiles?.length || 0,
      assessmentsCount: assessments?.length || 0,
    };
  },

  async duplicateFramework(frameworkId: UUID, newCode: string, newName: string) {
    // Get original framework
    const { data: original, error: fetchError } = await this.getFramework(frameworkId);
    if (fetchError || !original) return { data: null, error: fetchError };

    // Create new framework
    const newFramework = {
      ...original,
      code: newCode,
      name: newName,
      ai_generated: false,
    };
    delete newFramework.id;
    delete newFramework.created_at;
    delete newFramework.updated_at;

    const { data: framework, error: createError } = await this.createFramework(newFramework);
    if (createError || !framework) return { data: null, error: createError };

    // Copy sections
    const { data: sections } = await this.listSections(frameworkId);
    if (sections) {
      const sectionsToCreate = sections.map(section => {
        const { id, created_at, updated_at, ...sectionData } = section;
        return {
          ...sectionData,
          framework_id: framework.id,
        };
      });

      await supabase.from('compliance_sections').insert(sectionsToCreate);
    }

    // Copy requirements
    const { data: requirements } = await this.listRequirements(frameworkId);
    if (requirements) {
      const requirementsToCreate = requirements.map(req => {
        const { id, created_at, updated_at, ...reqData } = req;
        return {
          ...reqData,
          framework_id: framework.id,
        };
      });

      await supabase.from('compliance_requirements').insert(requirementsToCreate);
    }

    return { data: framework, error: null };
  },

  // =====================================================================================
  // ENHANCED AI INTEGRATION
  // =====================================================================================

  async generateFrameworkWithAI(frameworkSpec: {
    name: string;
    code: string;
    description?: string;
    category?: string;
    authority?: string;
    version?: string;
  }) {
    // This would integrate with AI service to generate a complete framework
    console.log('Generating framework with AI:', frameworkSpec);

    // For now, create a basic framework and mark as AI generated
    const framework = {
      ...frameworkSpec,
      ai_generated: true,
      is_active: true,
    };

    return this.createFramework(framework);
  },

  async enhanceRequirementWithAI(requirementId: UUID, enhancementType: 'guidance' | 'evidence' | 'implementation') {
    // This would use AI to enhance specific aspects of requirements
    console.log('Enhancing requirement with AI:', requirementId, enhancementType);

    const { data: requirement } = await this.getRequirement(requirementId);
    if (!requirement) return { data: null, error: new Error('Requirement not found') };

    // Placeholder for AI enhancement
    const enhancements = {
      guidance: 'AI-generated guidance for this requirement...',
      evidence: 'Suggested evidence collection methods...',
      implementation: 'Implementation recommendations...',
    };

    return {
      data: {
        requirement,
        enhancement: enhancements[enhancementType],
        type: enhancementType,
      },
      error: null,
    };
  },

  async analyzeFrameworkGaps(frameworkId: UUID, targetFrameworkId: UUID) {
    // Compare two frameworks to identify gaps
    const { data: sourceReqs } = await this.listRequirements(frameworkId);
    const { data: targetReqs } = await this.listRequirements(targetFrameworkId);

    // Simple gap analysis (would be enhanced with AI)
    const gaps = targetReqs?.filter(targetReq =>
      !sourceReqs?.some(sourceReq =>
        sourceReq.title.toLowerCase().includes(targetReq.title.toLowerCase().split(' ')[0])
      )
    ) || [];

    return {
      data: {
        sourceFrameworkId: frameworkId,
        targetFrameworkId: targetFrameworkId,
        gaps: gaps,
        coverage: sourceReqs && targetReqs ? ((targetReqs.length - gaps.length) / targetReqs.length) * 100 : 0,
      },
      error: null,
    };
  },

  // =====================================================================================
  // BULK OPERATIONS
  // =====================================================================================

  async bulkUpdateRequirements(frameworkId: UUID, updates: { id: UUID; updates: Partial<ComplianceRequirement> }[]) {
    const promises = updates.map(({ id, updates: reqUpdates }) =>
      this.updateRequirement(id, reqUpdates)
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      data: { successful, failed, total: updates.length },
      error: failed > 0 ? new Error(`${failed} updates failed`) : null,
    };
  },

  async bulkDeleteRequirements(requirementIds: UUID[]) {
    const { error } = await supabase
      .from('compliance_requirements')
      .delete()
      .in('id', requirementIds);

    return { error };
  },

  // =====================================================================================
  // ADVANCED MAPPING OPERATIONS
  // =====================================================================================

  async getFrameworkMappings(frameworkId: UUID) {
    // Get all mappings for a framework's requirements
    const { data: requirements } = await this.listRequirements(frameworkId);
    if (!requirements) return { data: [], error: null };

    const requirementIds = requirements.map(r => r.id);

    const { data: mappings, error } = await supabase
      .from('compliance_mappings')
      .select(`
        *,
        compliance_requirements (*)
      `)
      .in('requirement_id', requirementIds);

    return { data: mappings || [], error };
  },

  async createBulkMappings(mappings: Partial<ComplianceMapping>[]) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const toInsert = mappings.map(mapping => ({
      ...mapping,
      mapped_by: userId,
      mapped_at: new Date().toISOString(),
    }));

    return supabase
      .from('compliance_mappings')
      .insert(toInsert)
      .select();
  },

  // =====================================================================================
  // COMPLIANCE DASHBOARD METRICS
  // =====================================================================================

  async getComplianceDashboardData(frameworkId?: UUID) {
    // Get overall compliance metrics
    const { data: metrics, error: metricsError } = await supabase.rpc('compute_compliance_snapshot', {
      p_framework: frameworkId || null,
      p_profile: null,
    });

    // Get framework statistics
    const { data: frameworks } = await this.listFrameworks();
    const { data: profiles } = await this.listProfiles(frameworkId);

    // Get recent assessments
    const { data: recentAssessments } = await supabase
      .from('compliance_assessments')
      .select(`
        *,
        compliance_requirements (*),
        compliance_profiles (*)
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    // Get compliance trends (last 30 days) - only if frameworkId is provided
    let trends: any[] = [];
    if (frameworkId) {
      const { data: trendsData } = await this.getComplianceTrends(frameworkId, undefined, 30);
      trends = trendsData || [];
    }

    return {
      data: {
        metrics,
        frameworks: frameworks || [],
        profiles: profiles || [],
        recentAssessments: recentAssessments || [],
        trends,
      },
      error: metricsError,
    };
  },
};
