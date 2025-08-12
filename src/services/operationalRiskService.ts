import { supabase } from "../lib/supabase";

export type UUID = string;

export type OperationalRiskStatus =
  | "identified"
  | "assessed"
  | "treating"
  | "monitoring"
  | "accepted"
  | "closed";

export interface OperationalRisk {
  id: UUID;
  title: string;
  description?: string | null;
  category?: string | null;
  owner_id?: UUID | null;
  probability?: number | null; // 1..5
  impact?: number | null; // 1..5
  status: OperationalRiskStatus;
  mitigation?: string | null;
  review_frequency?: string | null;
  next_review_at?: string | null; // ISO date
  created_at?: string | null;
  updated_at?: string | null;
}

const table = "operational_risks";

export const operationalRiskService = {
  async list(): Promise<OperationalRisk[]> {
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as OperationalRisk[]) ?? [];
  },
  async get(id: UUID): Promise<OperationalRisk | null> {
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
    if (error) throw error;
    return (data as OperationalRisk) ?? null;
  },
  async create(payload: Partial<OperationalRisk>): Promise<UUID> {
    const insert = {
      title: payload.title,
      description: payload.description ?? null,
      category: payload.category ?? null,
      owner_id: payload.owner_id ?? null,
      probability: payload.probability ?? 3,
      impact: payload.impact ?? 3,
      status: payload.status ?? "identified",
      mitigation: payload.mitigation ?? null,
      review_frequency: payload.review_frequency ?? "quarterly",
      next_review_at: payload.next_review_at ?? null,
    };
    const { data, error } = await supabase.from(table).insert(insert).select("id").single();
    if (error) throw error;
    return (data as any).id as UUID;
  },
  async update(id: UUID, payload: Partial<OperationalRisk>): Promise<void> {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (error) throw error;
  },
  async remove(id: UUID): Promise<void> {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },
};

export default operationalRiskService;


