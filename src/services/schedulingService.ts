import { supabase } from "../lib/supabase";

export type UUID = string;

export interface CreateSchedulePayload {
  audit_id: UUID;
  title: string;
  description?: string;
  start_at: string; // ISO string
  end_at: string;   // ISO string
  timezone?: string; // IANA timezone, default 'UTC'
  recurrence_rule?: string | null; // iCal RRULE (e.g., FREQ=WEEKLY;BYDAY=MO)
  created_by?: UUID | null;
}

export interface ScheduleRow {
  id: UUID;
  audit_id: UUID;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  timezone: string;
  recurrence_rule: string | null;
  status: "scheduled" | "running" | "completed" | "cancelled";
  created_by: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface UpcomingScheduleView extends ScheduleRow {
  audit_title: string;
  audit_status: string;
}

type Result<T> = { data: T | null; error: any | null };

export const schedulingService = {
  async createSchedule(payload: CreateSchedulePayload): Promise<Result<{ schedule_id: UUID }>> {
    // Prefer RPC to enforce policy and auditing in DB
    const { data, error } = await supabase.rpc("create_audit_schedule", {
      p_audit_id: payload.audit_id,
      p_title: payload.title,
      p_description: payload.description ?? null,
      p_start_at: payload.start_at,
      p_end_at: payload.end_at,
      p_timezone: payload.timezone ?? "UTC",
      p_recurrence_rule: payload.recurrence_rule ?? null,
      p_created_by: payload.created_by ?? null,
    });
    if (error) return { data: null, error };
    return { data: { schedule_id: data as UUID }, error: null };
  },

  async listUpcoming(): Promise<Result<UpcomingScheduleView[]>> {
    const { data, error } = await supabase
      .from("v_upcoming_audit_schedules")
      .select("*")
      .order("start_at", { ascending: true });
    return { data: (data as UpcomingScheduleView[]) ?? null, error };
  },

  async listByAudit(auditId: UUID): Promise<Result<ScheduleRow[]>> {
    const { data, error } = await supabase
      .from("workflow_schedules")
      .select("*")
      .eq("audit_id", auditId)
      .order("start_at", { ascending: true });
    return { data: (data as ScheduleRow[]) ?? null, error };
  },

  async cancelSchedule(scheduleId: UUID): Promise<Result<null>> {
    const { error } = await supabase
      .from("workflow_schedules")
      .update({ status: "cancelled" })
      .eq("id", scheduleId);
    return { data: error ? null : null, error };
  },
};

export default schedulingService;
