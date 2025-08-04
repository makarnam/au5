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
};