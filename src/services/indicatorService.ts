import { supabase } from "../lib/supabase";

export type UUID = string;

export interface KeyIndicator {
  id: UUID;
  name: string;
  description?: string | null;
  unit?: string | null;
  owner_id?: UUID | null;
  target?: number | null;
  threshold_warning?: number | null;
  threshold_critical?: number | null;
  direction: "higher_is_better" | "lower_is_better";
  created_at?: string | null;
  updated_at?: string | null;
}

export interface KeyIndicatorReading {
  id: UUID;
  indicator_id: UUID;
  reading_date: string; // ISO date
  value: number;
  note?: string | null;
  created_at?: string | null;
}

const table = "key_indicators";
const readings = "key_indicator_readings";

export const indicatorService = {
  async list(): Promise<KeyIndicator[]> {
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as KeyIndicator[]) ?? [];
  },
  async get(id: UUID): Promise<KeyIndicator | null> {
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
    if (error) throw error;
    return (data as KeyIndicator) ?? null;
  },
  async create(payload: Partial<KeyIndicator>): Promise<UUID> {
    const insert = {
      name: payload.name,
      description: payload.description ?? null,
      unit: payload.unit ?? null,
      owner_id: payload.owner_id ?? null,
      target: payload.target ?? null,
      threshold_warning: payload.threshold_warning ?? null,
      threshold_critical: payload.threshold_critical ?? null,
      direction: payload.direction ?? "higher_is_better",
    };
    const { data, error } = await supabase.from(table).insert(insert).select("id").single();
    if (error) throw error;
    return (data as any).id as UUID;
  },
  async update(id: UUID, payload: Partial<KeyIndicator>): Promise<void> {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (error) throw error;
  },
  async remove(id: UUID): Promise<void> {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },

  async readings(indicatorId: UUID): Promise<KeyIndicatorReading[]> {
    const { data, error } = await supabase
      .from(readings)
      .select("*")
      .eq("indicator_id", indicatorId)
      .order("reading_date", { ascending: false });
    if (error) throw error;
    return (data as KeyIndicatorReading[]) ?? [];
  },
  async addReading(indicatorId: UUID, payload: Partial<KeyIndicatorReading>): Promise<UUID> {
    const insert = {
      indicator_id: indicatorId,
      reading_date: payload.reading_date,
      value: payload.value,
      note: payload.note ?? null,
    };
    const { data, error } = await supabase.from(readings).insert(insert).select("id").single();
    if (error) throw error;
    return (data as any).id as UUID;
  },
  async removeReading(id: UUID): Promise<void> {
    const { error } = await supabase.from(readings).delete().eq("id", id);
    if (error) throw error;
  },
};

export default indicatorService;


