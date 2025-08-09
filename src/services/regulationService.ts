import { supabase } from '../lib/supabase';
import type { UUID, Regulation, Amendment, RegulationImpact, ImpactStatus, ImpactLevel, ImpactTargetType, RegulationStatus } from '../types/regulation';

type RegulationFilter = {
  search?: string;
  status?: RegulationStatus | 'all';
  category?: string;
  jurisdiction?: string;
};

function applyRegulationFilters(q: any, filter?: RegulationFilter) {
  let query = q;
  if (filter?.status && filter.status !== 'all') query = query.eq('status', filter.status);
  if (filter?.category) query = query.ilike('category', `%${filter.category}%`);
  if (filter?.jurisdiction) query = query.ilike('jurisdiction', `%${filter.jurisdiction}%`);
  if (filter?.search) {
    query = query.or([
      `code.ilike.%${filter.search}%`,
      `title.ilike.%${filter.search}%`,
      `description.ilike.%${filter.search}%`,
      `tags.cs.{${filter.search}}`,
    ].join(','));
  }
  return query;
}

export const regulationService = {
  async listRegulations(filter?: RegulationFilter): Promise<Regulation[]> {
    let q = supabase.from('regulations').select('*').order('created_at', { ascending: false });
    q = applyRegulationFilters(q, filter);
    const { data, error } = await q;
    if (error) throw error;
    return (data as Regulation[]) ?? [];
  },

  async getRegulation(id: UUID): Promise<Regulation | null> {
    const { data, error } = await supabase.from('regulations').select('*').eq('id', id).single();
    if (error) throw error;
    return (data as Regulation) ?? null;
  },

  async createRegulation(payload: Partial<Regulation>): Promise<UUID> {
    const { data, error } = await supabase.from('regulations').insert(payload).select('id').single();
    if (error) throw error;
    return (data as any).id as UUID;
  },

  async updateRegulation(id: UUID, patch: Partial<Regulation>): Promise<void> {
    const { error } = await supabase.from('regulations').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },

  async deleteRegulation(id: UUID): Promise<void> {
    const { error } = await supabase.from('regulations').delete().eq('id', id);
    if (error) throw error;
  },

  async listAmendments(regulationId: UUID): Promise<Amendment[]> {
    const { data, error } = await supabase
      .from('amendments')
      .select('*')
      .eq('regulation_id', regulationId)
      .order('effective_date', { ascending: false });
    if (error) throw error;
    return (data as Amendment[]) ?? [];
  },

  async createAmendment(regulationId: UUID, payload: Partial<Amendment>): Promise<UUID> {
    const { data, error } = await supabase
      .from('amendments')
      .insert({ ...payload, regulation_id: regulationId })
      .select('id')
      .single();
    if (error) throw error;
    return (data as any).id as UUID;
  },

  async listImpacts(regulationId: UUID): Promise<RegulationImpact[]> {
    const { data, error } = await supabase
      .from('regulation_impact')
      .select('*')
      .eq('regulation_id', regulationId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data as RegulationImpact[]) ?? [];
  },

  async upsertImpact(payload: Partial<RegulationImpact>): Promise<UUID> {
    const { data, error } = await supabase
      .from('regulation_impact')
      .upsert(payload)
      .select('id')
      .single();
    if (error) throw error;
    return (data as any).id as UUID;
  },

  async setImpactStatus(impactId: UUID, status: ImpactStatus): Promise<void> {
    const { error } = await supabase
      .from('regulation_impact')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', impactId);
    if (error) throw error;
  },
};

export type { RegulationFilter };


