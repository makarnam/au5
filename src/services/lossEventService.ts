import { supabase } from "../lib/supabase";

export type UUID = string;

export type LossEventStatus = "open" | "investigating" | "resolved" | "closed";

export interface LossEvent {
  id: UUID;
  occurred_at: string; // ISO date
  discovered_at?: string | null;
  business_unit?: string | null;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  direct_loss: number;
  indirect_loss: number;
  currency: string; // 3-letter code
  root_cause?: string | null;
  control_failures?: string | null;
  linked_risk_id?: UUID | null;
  status: LossEventStatus;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const table = "loss_events";

export const lossEventService = {
  async list(): Promise<LossEvent[]> {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("occurred_at", { ascending: false });
    if (error) throw error;
    return (data as LossEvent[]) ?? [];
  },

  async get(id: UUID): Promise<LossEvent | null> {
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
    if (error) throw error;
    return (data as LossEvent) ?? null;
  },

  async create(payload: Partial<LossEvent>): Promise<UUID> {
    const insert = {
      occurred_at: payload.occurred_at,
      discovered_at: payload.discovered_at ?? null,
      business_unit: payload.business_unit ?? null,
      category: payload.category ?? null,
      subcategory: payload.subcategory ?? null,
      description: payload.description ?? null,
      direct_loss: payload.direct_loss ?? 0,
      indirect_loss: payload.indirect_loss ?? 0,
      currency: payload.currency ?? "USD",
      root_cause: payload.root_cause ?? null,
      control_failures: payload.control_failures ?? null,
      linked_risk_id: payload.linked_risk_id ?? null,
      status: payload.status ?? "open",
    };
    const { data, error } = await supabase
      .from(table)
      .insert(insert)
      .select("id")
      .single();
    if (error) throw error;
    return (data as any).id as UUID;
  },

  async update(id: UUID, payload: Partial<LossEvent>): Promise<void> {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (error) throw error;
  },

  async remove(id: UUID): Promise<void> {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },
};

export default lossEventService;


