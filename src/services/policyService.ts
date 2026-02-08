import { supabase } from '../lib/supabase';
import type { Policy, PolicyVersion, PolicyVersionStatus } from '../types/policies';

export const policyService = {
  // Policies
  async listPolicies() {
    return await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async getPolicy(id: string) {
    return await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .single();
  },

  async createPolicy(input: Partial<Policy>) {
    const { data: auth } = await supabase.auth.getUser();
    const created_by = auth.user?.id ?? null;

    return await supabase
      .from('policies')
      .insert({
        name: input.name,
        description: input.description ?? null,
        owner_id: input.owner_id ?? null,
        is_active: input.is_active ?? true,
        tags: input.tags ?? [],
        created_by,
      })
      .select()
      .single();
  },

  async updatePolicy(id: string, input: Partial<Policy>) {
    return await supabase
      .from('policies')
      .update({
        name: input.name,
        description: input.description ?? null,
        owner_id: input.owner_id ?? null,
        is_active: input.is_active ?? true,
        tags: input.tags ?? [],
      })
      .eq('id', id)
      .select()
      .single();
  },

  async deletePolicy(id: string) {
    return await supabase.from('policies').delete().eq('id', id);
  },

  // Versions
  async listVersions(policy_id: string) {
    return await supabase
      .from('policy_versions')
      .select('*')
      .eq('policy_id', policy_id)
      .order('version_number', { ascending: false });
  },

  async getVersion(id: string) {
    return await supabase
      .from('policy_versions')
      .select('*')
      .eq('id', id)
      .single();
  },

  async nextVersionNumber(policy_id: string) {
    const { data, error } = await supabase.rpc('next_policy_version', { p_policy: policy_id });
    if (error) return { data: null, error };
    return { data: (data as number) ?? 1, error: null };
  },

  async createVersion(policy_id: string, input: Partial<PolicyVersion> & { title: string; content: string }) {
    const { data: auth } = await supabase.auth.getUser();
    const created_by = auth.user?.id ?? null;

    // compute next version number via RPC
    const next = await this.nextVersionNumber(policy_id);
    if (next.error) return { data: null, error: next.error };
    const version_number = next.data ?? 1;

    return await supabase
      .from('policy_versions')
      .insert({
        policy_id,
        version_number,
        title: input.title,
        content: input.content,
        status: (input.status as PolicyVersionStatus) ?? 'draft',
        ai_generated: input.ai_generated ?? false,
        created_by,
      })
      .select()
      .single();
  },

  async updateVersion(id: string, input: Partial<PolicyVersion>) {
    return await supabase
      .from('policy_versions')
      .update({
        title: input.title,
        content: input.content,
        status: input.status as PolicyVersionStatus | undefined,
        ai_generated: input.ai_generated,
      })
      .eq('id', id)
      .select()
      .single();
  },

  async deleteVersion(id: string) {
    return await supabase.from('policy_versions').delete().eq('id', id);
  },

  // Analytics methods
  async getPolicyAnalytics() {
    // Get total policies count
    const { data: totalPolicies, error: totalError } = await supabase
      .from('policies')
      .select('id', { count: 'exact' });

    if (totalError) return { data: null, error: totalError };

    // Get active policies count
    const { data: activePolicies, error: activeError } = await supabase
      .from('policies')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    if (activeError) return { data: null, error: activeError };

    // Get total versions count
    const { data: totalVersions, error: versionsError } = await supabase
      .from('policy_versions')
      .select('id', { count: 'exact' });

    if (versionsError) return { data: null, error: versionsError };

    // Get version status distribution
    const { data: versionStatuses, error: statusError } = await supabase
      .from('policy_versions')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        const statusCounts = data?.reduce((acc: Record<string, number>, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}) || {};
        return { data: statusCounts, error: null };
      });

    if (statusError) return { data: null, error: statusError };

    // Get policies by owner
    const { data: policiesByOwner, error: ownerError } = await supabase
      .from('policies')
      .select('owner_id')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        const ownerCounts = data?.reduce((acc: Record<string, number>, item) => {
          const owner = item.owner_id || 'Unassigned';
          acc[owner] = (acc[owner] || 0) + 1;
          return acc;
        }, {}) || {};
        return { data: ownerCounts, error: null };
      });

    if (ownerError) return { data: null, error: ownerError };

    // Get recent policy activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentPolicies, error: recentError } = await supabase
      .from('policies')
      .select('id', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) return { data: null, error: recentError };

    const { data: recentVersions, error: recentVersionsError } = await supabase
      .from('policy_versions')
      .select('id', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentVersionsError) return { data: null, error: recentVersionsError };

    return {
      data: {
        totalPolicies: totalPolicies?.length || 0,
        activePolicies: activePolicies?.length || 0,
        inactivePolicies: (totalPolicies?.length || 0) - (activePolicies?.length || 0),
        totalVersions: totalVersions?.length || 0,
        versionStatuses: versionStatuses || {},
        policiesByOwner: policiesByOwner || {},
        recentPolicies: recentPolicies?.length || 0,
        recentVersions: recentVersions?.length || 0,
      },
      error: null,
    };
  },

  async getPolicyTrends(months: number = 12) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const { data: policies, error: policiesError } = await supabase
        .from('policies')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString());

      const { data: versions, error: versionsError } = await supabase
        .from('policy_versions')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString());

      if (policiesError || versionsError) continue;

      trends.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        policies: policies?.length || 0,
        versions: versions?.length || 0,
      });
    }

    return { data: trends, error: null };
  },
};