import { supabase } from '../lib/supabase';
import type { UUID } from './compliance';

export type DpiaStatus = 'draft' | 'in_review' | 'approved' | 'rejected';
export type DpiaRisk = 'low' | 'medium' | 'high' | 'critical';

export type Dpia = {
  id: UUID;
  title: string;
  description?: string | null;
  owner?: string | null;
  owner_id?: UUID | null;
  status: DpiaStatus;
  risk_level: DpiaRisk;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export type Ropa = {
  id: UUID;
  name: string;
  purpose: string;
  controller: string;
  processor?: string | null;
  data_subjects: string[];
  data_categories: string[];
  recipients: string[];
  transfers: string[];
  retention?: string | null;
  legal_basis?: string | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
};

export const privacyService = {
  async listDPIA(params?: { search?: string; status?: DpiaStatus | 'all'; risk?: DpiaRisk | 'all' }): Promise<Dpia[]> {
    let q = supabase.from('privacy_dpia').select('*').order('updated_at', { ascending: false });
    if (params?.status && params.status !== 'all') q = q.eq('status', params.status);
    if (params?.risk && params.risk !== 'all') q = q.eq('risk_level', params.risk);
    if (params?.search) {
      q = q.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data as Dpia[]) ?? [];
  },
  async createDPIA(payload: Partial<Dpia>): Promise<UUID> {
    const { data, error } = await supabase
      .from('privacy_dpia')
      .insert({
        title: payload.title,
        description: payload.description ?? null,
        owner: payload.owner ?? null,
        owner_id: payload.owner_id ?? null,
        status: payload.status ?? 'draft',
        risk_level: payload.risk_level ?? 'medium',
      })
      .select('id')
      .single();
    if (error) throw error;
    return (data as any).id as UUID;
  },
  async updateDPIA(id: UUID, patch: Partial<Dpia>): Promise<void> {
    const { error } = await supabase
      .from('privacy_dpia')
      .update({
        title: patch.title,
        description: patch.description,
        owner: patch.owner,
        owner_id: patch.owner_id,
        status: patch.status,
        risk_level: patch.risk_level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
  },
  async deleteDPIA(id: UUID): Promise<void> {
    const { error } = await supabase
      .from('privacy_dpia')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async listRoPA(params?: { search?: string }): Promise<Ropa[]> {
    let q = supabase.from('privacy_ropa').select('*').order('updated_at', { ascending: false });
    if (params?.search) {
      q = q.or(`name.ilike.%${params.search}%,purpose.ilike.%${params.search}%`);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data as Ropa[]) ?? [];
  },
  async createRoPA(payload: Partial<Ropa>): Promise<UUID> {
    const { data, error } = await supabase
      .from('privacy_ropa')
      .insert({
        name: payload.name,
        purpose: payload.purpose,
        controller: payload.controller,
        processor: payload.processor ?? null,
        data_subjects: payload.data_subjects ?? [],
        data_categories: payload.data_categories ?? [],
        recipients: payload.recipients ?? [],
        transfers: payload.transfers ?? [],
        retention: payload.retention ?? null,
        legal_basis: payload.legal_basis ?? null,
      })
      .select('id')
      .single();
    if (error) throw error;
    return (data as any).id as UUID;
  },
  async updateRoPA(id: UUID, patch: Partial<Ropa>): Promise<void> {
    const { error } = await supabase
      .from('privacy_ropa')
      .update({
        name: patch.name,
        purpose: patch.purpose,
        controller: patch.controller,
        processor: patch.processor,
        data_subjects: patch.data_subjects,
        data_categories: patch.data_categories,
        recipients: patch.recipients,
        transfers: patch.transfers,
        retention: patch.retention,
        legal_basis: patch.legal_basis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteRoPA(id: UUID): Promise<void> {
    const { error } = await supabase
      .from('privacy_ropa')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
