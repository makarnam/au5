// Note on Supabase typings:
// This project appears to use a Supabase client without generated database types.
// The correct generic signatures are:
// - supabase.from&lt;Row, Insert&gt;('table')
// - supabase.rpc&lt;Return, Args&gt;('fn', args)
// To satisfy the compiler errors, we will remove single generic usages and rely on runtime types,
// or provide both generics where helpful. The method return types already ensure strong typing.
import { supabase } from '../lib/supabase';

export type FindingStatus = 'draft' | 'under_review' | 'open' | 'remediated' | 'closed';
export type RiskRating = 'low' | 'medium' | 'high' | 'critical';

export interface Finding {
  id: string;
  audit_id: string;
  control_id?: string | null;
  title: string;
  description?: string | null;
  risk_rating: RiskRating;
  business_impact?: string | null;
  root_cause?: string | null;
  recommendation?: string | null;
  management_response?: string | null;
  control_failure?: boolean | null;
  audit_reference?: string | null;
  tags?: string[] | null;
  attachments?: any[] | null; // jsonb[]
  internal_owner_id?: string | null;
  remediation_owner_id?: string | null;
  remediation_due_date?: string | null; // ISO date
  workflow_status: FindingStatus;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  opened_at?: string | null;
  remediated_at?: string | null;
  closed_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FindingInput {
  audit_id: string;
  title: string;
  risk_rating: RiskRating;
  description?: string;
  root_cause?: string;
  control_failure?: boolean;
  audit_reference?: string;
  tags?: string[];
  attachments?: any[];
  internal_owner_id?: string;
  remediation_owner_id?: string;
  remediation_due_date?: string; // ISO date
}

export interface FindingsSavedView {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, any>;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FindingVersion {
  id: string;
  finding_id: string;
  version: number;
  changed_by?: string | null;
  changed_at: string;
  diff: Record<string, any> | null;
  snapshot: Record<string, any>;
}

// Validation utilities
export function validateFindingInput(input: FindingInput): string[] {
  const errs: string[] = [];
  if (!input.title || input.title.trim().length === 0) errs.push('Title is required');
  if (input.title && input.title.length > 200) errs.push('Title must be at most 200 characters');
  if (!input.audit_id) errs.push('Audit is required');
  if (!input.risk_rating) errs.push('Risk rating is required');
  if (input.audit_reference && input.audit_reference.length > 120) errs.push('Audit Reference max length is 120');
  return errs;
}

const TABLE = 'findings';
const SAVED_VIEWS = 'findings_saved_views';

export const findingsService = {
  async create(input: FindingInput): Promise<Finding> {
    const errors = validateFindingInput(input);
    if (errors.length) {
      throw new Error(errors.join('; '));
    }
    const payload = {
      ...input,
      // Backfill legacy required column 'severity' (if present in DB) from risk_rating
      // Severity allowed values: low, medium, high, critical (aligned to risk_rating)
      severity: (input as any).severity ?? input.risk_rating,
      workflow_status: 'draft' as FindingStatus,
      tags: input.tags ?? [],
      attachments: input.attachments ?? [],
    };
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
    if (error) throw error;
    return data!;
  },

  async update(id: string, patch: Partial<FindingInput> & Partial<Pick<Finding, 'workflow_status'>>): Promise<Finding> {
    if (patch.title || patch.audit_reference || patch.risk_rating) {
      const errs = validateFindingInput({
        audit_id: patch.audit_id as string ?? 'dummy',
        title: patch.title ?? 'x',
        risk_rating: (patch.risk_rating as RiskRating) ?? 'medium',
        description: patch.description,
        root_cause: patch.root_cause,
        control_failure: patch.control_failure,
        audit_reference: patch.audit_reference,
        tags: patch.tags,
        attachments: patch.attachments,
        internal_owner_id: patch.internal_owner_id,
        remediation_owner_id: patch.remediation_owner_id,
        remediation_due_date: patch.remediation_due_date,
      });
      // remove dummy audit check if not provided
      if (!patch.audit_id) {
        const idx = errs.indexOf('Audit is required');
        if (idx >= 0) errs.splice(idx, 1);
      }
      if (errs.length) throw new Error(errs.join('; '));
    }

    // Ensure severity backfill as well on update for legacy schema
    const updatePayload: any = { ...patch } as any;
    if ((updatePayload as any).severity == null && updatePayload.risk_rating) {
      updatePayload.severity = updatePayload.risk_rating;
    }
    const { data, error } = await supabase.from(TABLE)
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data!;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async get(id: string): Promise<Finding | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) {
      if ((error as any).code === 'PGRST116') return null; // not found
      throw error;
    }
    return data;
  },

  async list(params?: {
    query?: string;
    status?: FindingStatus[];
    risk?: RiskRating[];
    auditId?: string;
    dueBefore?: string; // ISO date
    tags?: string[];
    limit?: number;
    offset?: number;
    orderBy?: keyof Finding;
    orderDir?: 'asc' | 'desc';
  }): Promise<{ items: Finding[]; count: number | null; }> {
    // Prefer RPC search for complex filters
    const { data, error } = await supabase.rpc('search_findings', {
      p_query: params?.query ?? null,
      p_status: params?.status ?? null,
      p_risk: params?.risk ?? null,
      p_audit: params?.auditId ?? null,
      p_due_before: params?.dueBefore ?? null,
      p_tags: params?.tags ?? null,
    });
    if (error) throw error;
    let items = (data ?? []) as Finding[];
    if (params?.orderBy) {
      items = items.sort((a: any, b: any) => {
        const dir = params.orderDir === 'desc' ? -1 : 1;
        const av = a[params.orderBy!];
        const bv = b[params.orderBy!];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return av > bv ? dir : av < bv ? -dir : 0;
      });
    }
    if (params?.offset != null || params?.limit != null) {
      const start = params.offset ?? 0;
      const end = params.limit != null ? start + params.limit : undefined;
      items = items.slice(start, end);
    }
    return { items, count: null };
  },

  async setStatus(id: string, newStatus: FindingStatus, reason?: string): Promise<Finding> {
    const { data, error } = await supabase.rpc('set_finding_status', {
      p_id: id,
      p_new_status: newStatus,
      p_reason: reason ?? null,
    });
    if (error) throw error;
    return data as Finding;
  },

  async assignOwners(id: string, params: {
    internal_owner_id?: string | null;
    remediation_owner_id?: string | null;
    remediation_due_date?: string | null;
  }): Promise<Finding> {
    const { data, error } = await supabase.rpc('assign_finding_owners', {
      p_id: id,
      p_internal_owner: params.internal_owner_id ?? null,
      p_remediation_owner: params.remediation_owner_id ?? null,
      p_due_date: params.remediation_due_date ?? null,
    });
    if (error) throw error;
    return data as Finding;
  },

  async listVersions(id: string): Promise<FindingVersion[]> {
    const { data, error } = await supabase.rpc('get_finding_versions', { p_id: id });
    if (error) throw error;
    return (data ?? []) as FindingVersion[];
  },

  async diffVersions(id: string, fromVersion: number, toVersion: number): Promise<Record<string, any>> {
    const { data, error } = await supabase.rpc('get_finding_diff', {
      p_id: id,
      p_from_version: fromVersion,
      p_to_version: toVersion,
    });
    if (error) throw error;
    return (data ?? {}) as Record<string, any>;
  },

  // Saved views
  async getSavedViews(): Promise<FindingsSavedView[]> {
    const { data, error } = await supabase.from(SAVED_VIEWS)
      .select('*')
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async createSavedView(name: string, filters: Record<string, any>, is_default = false): Promise<FindingsSavedView> {
    const { data, error } = await supabase.from(SAVED_VIEWS)
      .insert({ name, filters, is_default })
      .select('*')
      .single();
    if (error) throw error;
    return data!;
  },

  async updateSavedView(id: string, patch: Partial<Pick<FindingsSavedView, 'name' | 'filters' | 'is_default'>>): Promise<FindingsSavedView> {
    const { data, error } = await supabase.from(SAVED_VIEWS)
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data!;
  },

  async deleteSavedView(id: string): Promise<void> {
    const { error } = await supabase.from(SAVED_VIEWS).delete().eq('id', id);
    if (error) throw error;
  },
};

export default findingsService;