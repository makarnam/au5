import { supabase } from "../lib/supabase";

export type UUID = string;

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type RiskStatus =
  | "identified"
  | "assessed"
  | "treating"
  | "monitoring"
  | "accepted"
  | "transferred"
  | "avoided"
  | "closed";

export interface Risk {
  id: UUID;
  title: string;
  description?: string | null;
  category: string;
  business_unit_id?: UUID | null;
  probability?: number | null;
  impact?: number | null;
  risk_level: RiskLevel;
  inherent_risk_score?: number | null;
  residual_risk_score?: number | null;
  mitigation_strategy?: string | null;
  owner_id?: UUID | null;
  status: RiskStatus;
  ai_generated?: boolean | null;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
  risk_category_id?: UUID | null;
  risk_matrix_id?: UUID | null;
  risk_source?: string | null;
  likelihood_trend?: "increasing" | "decreasing" | "stable" | null;
  impact_trend?: "increasing" | "decreasing" | "stable" | null;
  target_probability?: number | null;
  target_impact?: number | null;
  target_risk_score?: number | null;
  target_date?: string | null;
  escalation_criteria?: string | null;
  last_review_date?: string | null;
  next_review_date?: string | null;
  review_frequency?:
    | "weekly"
    | "monthly"
    | "quarterly"
    | "semi_annually"
    | "annually"
    | null;
  tags?: string[] | null;
  external_reference?: string | null;
  attachments?: any[] | null;
}

export interface RiskAssessment {
  id: UUID;
  risk_id: UUID;
  assessment_date: string;
  assessor_id?: UUID | null;
  assessment_type?: "initial" | "periodic" | "triggered" | "ad_hoc" | null;
  probability: number;
  impact: number;
  risk_score: number;
  risk_level: RiskLevel;
  assessment_notes?: string | null;
  key_assumptions?: string | null;
  data_sources?: string | null;
  confidence_level?: "low" | "medium" | "high" | null;
  review_trigger?: string | null;
  attachments?: any[] | null;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RiskTreatment {
  id: UUID;
  risk_id: UUID;
  treatment_type: "mitigate" | "accept" | "transfer" | "avoid" | "monitor";
  title: string;
  description: string;
  treatment_strategy?: string | null;
  cost_estimate?: number | null;
  currency?: string | null;
  assigned_to?: UUID | null;
  responsible_department?: string | null;
  priority?: "low" | "medium" | "high" | "critical" | null;
  status?:
    | "planned"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "on_hold"
    | "overdue"
    | null;
  start_date?: string | null;
  target_date?: string | null;
  completed_date?: string | null;
  effectiveness_rating?: number | null;
  effectiveness_notes?: string | null;
  success_criteria?: string | null;
  kpis?: any[] | null;
  dependencies?: string | null;
  constraints_limitations?: string | null;
  attachments?: any[] | null;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RiskIncident {
  id: UUID;
  risk_id: UUID;
  incident_title: string;
  incident_description: string;
  incident_date: string;
  discovered_date?: string | null;
  reported_by?: UUID | null;
  severity: "low" | "medium" | "high" | "critical";
  actual_impact?: string | null;
  financial_impact?: number | null;
  currency?: string | null;
  lessons_learned?: string | null;
  corrective_actions?: string | null;
  preventive_measures?: string | null;
  status?: "open" | "investigating" | "resolved" | "closed" | null;
  resolution_date?: string | null;
  attachments?: any[] | null;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RiskReview {
  id: UUID;
  risk_id: UUID;
  review_date: string;
  reviewer_id: UUID;
  review_type?: "periodic" | "triggered" | "incident_based" | "audit_based" | null;
  review_outcome?:
    | "no_change"
    | "updated"
    | "escalated"
    | "closed"
    | "transferred"
    | null;
  risk_status_before?: string | null;
  risk_status_after?: string | null;
  probability_before?: number | null;
  probability_after?: number | null;
  impact_before?: number | null;
  impact_after?: number | null;
  changes_made?: string | null;
  review_notes?: string | null;
  recommendations?: string | null;
  next_review_date?: string | null;
  attachments?: any[] | null;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type RiskFilter = {
  search?: string;
  status?: RiskStatus | "all";
  level?: RiskLevel | "all";
  category?: string;
};

type StatsResponse = {
  total: number;
  byStatus: Record<RiskStatus, number>;
  byLevel: Record<RiskLevel, number>;
  byCategory: Record<string, number>;
};

const tableRisks = "risks";
const tableAssessments = "risk_assessments";
const tableTreatments = "risk_treatments";
const tableIncidents = "risk_incidents";
const tableReviews = "risk_reviews";
const tableRiskControls = "risk_controls";
const tableControls = "controls";

function applyRiskFilters(query: any, filter?: RiskFilter) {
  let q = query;
  if (filter?.status && filter.status !== "all") {
    q = q.eq("status", filter.status);
  }
  if (filter?.level && filter.level !== "all") {
    q = q.eq("risk_level", filter.level);
  }
  if (filter?.category) {
    q = q.ilike("category", `%${filter.category}%`);
  }
  if (filter?.search) {
    // basic OR search on title/description/category
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

const riskService = {
  async getRisks(filter?: RiskFilter): Promise<Risk[]> {
    let query = supabase.from(tableRisks).select("*").order("created_at", { ascending: false });
    query = applyRiskFilters(query, filter);
    const { data, error } = await query;
    if (error) throw error;
    return (data as Risk[]) ?? [];
  },

  async getRisk(id: UUID): Promise<Risk | null> {
    const { data, error } = await supabase.from(tableRisks).select("*").eq("id", id).single();
    if (error) throw error;
    return (data as Risk) ?? null;
    },

  async createRisk(payload: Partial<Risk>): Promise<UUID> {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from(tableRisks)
      .insert({
        ...payload,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw error;
    // Ensure we always return the primitive UUID (string), not an object
    return (data as any)?.id as UUID;
  },

  async deleteRisk(id: UUID): Promise<void> {
    // Get current user for audit purposes
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Check if risk exists and user has permission to delete
    const { data: risk, error: fetchError } = await supabase
      .from(tableRisks)
      .select("id, title, created_by")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error("Risk not found");
    }

    // Optional: Check if user is the creator or has admin permissions
    // This can be enhanced based on your permission system
    if (risk.created_by !== user.id) {
      // You might want to check for admin permissions here
      // For now, we'll allow deletion if the risk exists
    }

    // Delete the risk
    const { error } = await supabase
      .from(tableRisks)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete risk: ${error.message}`);
    }
  },

  async getAssessments(riskId: UUID): Promise<RiskAssessment[]> {
    const { data, error } = await supabase
      .from(tableAssessments)
      .select("*")
      .eq("risk_id", riskId)
      .order("assessment_date", { ascending: false });
    if (error) throw error;
    return (data as RiskAssessment[]) ?? [];
  },

  async addAssessment(riskId: UUID, payload: Partial<RiskAssessment>): Promise<UUID> {
    // Prefer RPC to compute score/level if available
    const { data, error } = await supabase.rpc("create_risk_assessment", {
      p_risk_id: riskId,
      p_probability: payload.probability ?? 3,
      p_impact: payload.impact ?? 3,
      p_assessment_type: payload.assessment_type ?? "periodic",
      p_notes: payload.assessment_notes ?? null,
    });
    if (error) {
      // Fallback: direct insert if RPC unavailable
      const { data: ins, error: insErr } = await supabase
        .from(tableAssessments)
        .insert({ ...payload, risk_id: riskId })
        .select("id")
        .single();
      if (insErr) throw insErr;
      return ins!.id as UUID;
    }
    return data as UUID;
  },

  async updateAssessment(id: UUID, payload: Partial<RiskAssessment>): Promise<void> {
    const { error } = await supabase.from(tableAssessments).update(payload).eq("id", id);
    if (error) throw error;
  },

  async deleteAssessment(id: UUID): Promise<void> {
    const { error } = await supabase.from(tableAssessments).delete().eq("id", id);
    if (error) throw error;
  },

  async getTreatments(riskId: UUID): Promise<RiskTreatment[]> {
    const { data, error } = await supabase
      .from(tableTreatments)
      .select("*")
      .eq("risk_id", riskId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as RiskTreatment[]) ?? [];
  },

  async addTreatment(riskId: UUID, payload: Partial<RiskTreatment>): Promise<UUID> {
    // Prefer RPC for start_risk_treatment
    if (payload.title && payload.description && payload.treatment_type) {
      const { data, error } = await supabase.rpc("start_risk_treatment", {
        p_risk_id: riskId,
        p_treatment_type: payload.treatment_type,
        p_title: payload.title,
        p_description: payload.description,
      });
      if (!error && data) return data as UUID;
      // fallthrough if RPC error
    }
    const { data, error } = await supabase
      .from(tableTreatments)
      .insert({ ...payload, risk_id: riskId })
      .select("id")
      .single();
    if (error) throw error;
    return data!.id as UUID;
  },

  async updateTreatment(id: UUID, payload: Partial<RiskTreatment>): Promise<void> {
    const { error } = await supabase.from(tableTreatments).update(payload).eq("id", id);
    if (error) throw error;
  },

  async deleteTreatment(id: UUID): Promise<void> {
    const { error } = await supabase.from(tableTreatments).delete().eq("id", id);
    if (error) throw error;
  },

  async getIncidents(riskId: UUID): Promise<RiskIncident[]> {
    const { data, error } = await supabase
      .from(tableIncidents)
      .select("*")
      .eq("risk_id", riskId)
      .order("incident_date", { ascending: false });
    if (error) throw error;
    return (data as RiskIncident[]) ?? [];
  },

  async addIncident(riskId: UUID, payload: Partial<RiskIncident>): Promise<UUID> {
    const { data, error } = await supabase
      .from(tableIncidents)
      .insert({ ...payload, risk_id: riskId })
      .select("id")
      .single();
    if (error) throw error;
    return data!.id as UUID;
  },

  async updateIncident(id: UUID, payload: Partial<RiskIncident>): Promise<void> {
    const { error } = await supabase.from(tableIncidents).update(payload).eq("id", id);
    if (error) throw error;
  },

  async deleteIncident(id: UUID): Promise<void> {
    const { error } = await supabase.from(tableIncidents).delete().eq("id", id);
    if (error) throw error;
  },

  async getReviews(riskId: UUID): Promise<RiskReview[]> {
    const { data, error } = await supabase
      .from(tableReviews)
      .select("*")
      .eq("risk_id", riskId)
      .order("review_date", { ascending: false });
    if (error) throw error;
    return (data as RiskReview[]) ?? [];
  },

  async addReview(riskId: UUID, payload: Partial<RiskReview>): Promise<UUID> {
    const { data, error } = await supabase
      .from(tableReviews)
      .insert({ ...payload, risk_id: riskId })
      .select("id")
      .single();
    if (error) throw error;
    return data!.id as UUID;
  },

  async updateReview(id: UUID, payload: Partial<RiskReview>): Promise<void> {
    const { error } = await supabase.from(tableReviews).update(payload).eq("id", id);
    if (error) throw error;
  },

  async deleteReview(id: UUID): Promise<void> {
    const { error } = await supabase.from(tableReviews).delete().eq("id", id);
    if (error) throw error;
  },

  async linkControl(riskId: UUID, controlId: UUID): Promise<void> {
    const { error } = await supabase
      .from(tableRiskControls)
      .insert({ risk_id: riskId, control_id: controlId });
    if (error) {
      // Handle unique constraint violation gracefully
      if (error.code === '23505' && error.message.includes('risk_controls_risk_id_control_id_key')) {
        throw new Error('This control is already linked to this risk');
      }
      throw error;
    }
  },

  async unlinkControl(riskId: UUID, controlId: UUID): Promise<void> {
    const { error } = await supabase
      .from(tableRiskControls)
      .delete()
      .eq("risk_id", riskId)
      .eq("control_id", controlId);
    if (error) throw error;
  },

  async getLinkedControls(riskId: UUID): Promise<Array<{ 
    control_id: UUID; 
    control_title: string; 
    control_code: string;
    control_description: string;
    control_type: string;
    control_status?: string | null;
    effectiveness?: string | null;
    process_area: string;
    frequency: string;
    last_tested_date?: string | null;
    next_test_date?: string | null;
  }>> {
    // Join risk_controls with controls to fetch detailed info
    const { data, error } = await supabase
      .from(tableRiskControls)
      .select(`
        control_id, 
        controls!inner(
          id, 
          title, 
          control_code,
          description,
          control_type,
          effectiveness,
          process_area,
          frequency,
          last_tested_date,
          next_test_date
        )
      `)
      .eq("risk_id", riskId);
    if (error) throw error;
    const rows = (data as any[]) ?? [];
    return rows.map((r) => ({
      control_id: r.control_id ?? r.controls?.id,
      control_title: r.controls?.title ?? "Control",
      control_code: r.controls?.control_code ?? "",
      control_description: r.controls?.description ?? "",
      control_type: r.controls?.control_type ?? "",
      control_status: null, // controls table doesn't have a status column
      effectiveness: r.controls?.effectiveness ?? null,
      process_area: r.controls?.process_area ?? "",
      frequency: r.controls?.frequency ?? "",
      last_tested_date: r.controls?.last_tested_date ?? null,
      next_test_date: r.controls?.next_test_date ?? null,
    }));
  },

  async getStats(filter?: RiskFilter): Promise<StatsResponse> {
    // Basic client-side aggregation using fetched list for P1
    const list = await this.getRisks(filter);
    const total = list.length;
    const byStatus: Record<RiskStatus, number> = {
      identified: 0,
      assessed: 0,
      treating: 0,
      monitoring: 0,
      accepted: 0,
      transferred: 0,
      avoided: 0,
      closed: 0,
    };
    const byLevel: Record<RiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    const byCategory: Record<string, number> = {};

    for (const r of list) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byLevel[r.risk_level] = (byLevel[r.risk_level] ?? 0) + 1;
      const cat = r.category || "Uncategorized";
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }

    return { total, byStatus, byLevel, byCategory };
  },
};

export default riskService;