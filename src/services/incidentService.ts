import { supabase } from "../lib/supabase";
import { withErrorHandling } from "../lib/errorHandler";

export type UUID = string;

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";
export type ImplementationStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface Incident {
  id: UUID;
  title: string;
  description?: string | null;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reported_by?: UUID | null;
  assigned_to?: UUID | null;
  incident_date: string;
  resolution_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IncidentLessonsLearned {
  id: UUID;
  incident_id: UUID;
  title: string;
  description?: string | null;
  category?: string | null;
  impact_level?: string | null;
  preventive_actions?: string | null;
  responsible_party?: UUID | null;
  implementation_status?: ImplementationStatus | null;
  due_date?: string | null;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type IncidentFilter = {
  search?: string;
  status?: IncidentStatus | "all";
  severity?: IncidentSeverity | "all";
  category?: string;
};

type StatsResponse = {
  total: number;
  byStatus: Record<IncidentStatus, number>;
  bySeverity: Record<IncidentSeverity, number>;
  byCategory: Record<string, number>;
};

const tableIncidents = "incidents";
const tableLessonsLearned = "incident_lessons_learned";

function applyIncidentFilters(query: any, filter?: IncidentFilter) {
  let q = query;
  if (filter?.status && filter.status !== "all") {
    q = q.eq("status", filter.status);
  }
  if (filter?.severity && filter.severity !== "all") {
    q = q.eq("severity", filter.severity);
  }
  if (filter?.category) {
    q = q.ilike("category", `%${filter.category}%`);
  }
  if (filter?.search) {
    q = q.or(
      [
        `title.ilike.%${filter.search}%`,
        `description.ilike.%${filter.search}%`,
        `category.ilike.%${filter.search}%`,
      ].join(","),
    );
  }
  return q;
}

const incidentService = {
  async getIncidents(filter?: IncidentFilter): Promise<Incident[] | null> {
    return withErrorHandling(async () => {
      let query = supabase.from(tableIncidents).select("*").order("created_at", { ascending: false });
      query = applyIncidentFilters(query, filter);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Incident[]) ?? [];
    }, 'Get incidents');
  },

  async getIncident(id: UUID): Promise<Incident | null> {
    return withErrorHandling(async () => {
      const { data, error } = await supabase.from(tableIncidents).select("*").eq("id", id).single();
      if (error) throw error;
      return (data as Incident) ?? null;
    }, 'Get incident');
  },

  async createIncident(payload: Partial<Incident>): Promise<UUID | null> {
    return withErrorHandling(async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from(tableIncidents)
        .insert({
          ...payload,
          reported_by: user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return (data as any)?.id as UUID;
    }, 'Create incident');
  },

  async updateIncident(id: UUID, payload: Partial<Incident>): Promise<void | null> {
    return withErrorHandling(async () => {
      const { error } = await supabase.from(tableIncidents).update(payload).eq("id", id);
      if (error) throw error;
    }, 'Update incident');
  },

  async deleteIncident(id: UUID): Promise<void | null> {
    return withErrorHandling(async () => {
      const { error } = await supabase.from(tableIncidents).delete().eq("id", id);
      if (error) throw error;
    }, 'Delete incident');
  },

  async getLessonsLearned(incidentId: UUID): Promise<IncidentLessonsLearned[] | null> {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from(tableLessonsLearned)
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as IncidentLessonsLearned[]) ?? [];
    }, 'Get lessons learned');
  },

  async addLessonsLearned(incidentId: UUID, payload: Partial<IncidentLessonsLearned>): Promise<UUID | null> {
    return withErrorHandling(async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from(tableLessonsLearned)
        .insert({
          ...payload,
          incident_id: incidentId,
          created_by: user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return (data as any)?.id as UUID;
    }, 'Add lessons learned');
  },

  async updateLessonsLearned(id: UUID, payload: Partial<IncidentLessonsLearned>): Promise<void | null> {
    return withErrorHandling(async () => {
      const { error } = await supabase.from(tableLessonsLearned).update(payload).eq("id", id);
      if (error) throw error;
    }, 'Update lessons learned');
  },

  async deleteLessonsLearned(id: UUID): Promise<void | null> {
    return withErrorHandling(async () => {
      const { error } = await supabase.from(tableLessonsLearned).delete().eq("id", id);
      if (error) throw error;
    }, 'Delete lessons learned');
  },

  async getStats(filter?: IncidentFilter): Promise<StatsResponse> {
    const list = await this.getIncidents(filter);
    const incidents = list || [];
    const total = incidents.length;
    const byStatus: Record<IncidentStatus, number> = {
      open: 0,
      investigating: 0,
      resolved: 0,
      closed: 0,
    };
    const bySeverity: Record<IncidentSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    const byCategory: Record<string, number> = {};

    for (const incident of incidents) {
      byStatus[incident.status] = (byStatus[incident.status] ?? 0) + 1;
      bySeverity[incident.severity] = (bySeverity[incident.severity] ?? 0) + 1;
      const cat = incident.category || "Uncategorized";
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }

    return { total, byStatus, bySeverity, byCategory };
  },
};

export default incidentService;