import { supabase } from "../lib/supabase";
import { User } from "../types";

// Local Risk types aligned with Supabase_Database_Schema.sql
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
  id: string;
  title: string;
  description: string | null;
  category: string;
  business_unit_id: string | null;
  probability: number | null;
  impact: number | null;
  risk_level: RiskLevel;
  inherent_risk_score: number | null;
  residual_risk_score: number | null;
  mitigation_strategy: string | null;
  owner_id: string | null;
  status: RiskStatus;
  ai_generated: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  risk_category_id: string | null;
  risk_matrix_id: string | null;
  risk_source: string | null;
  likelihood_trend: "increasing" | "decreasing" | "stable" | null;
  impact_trend: "increasing" | "decreasing" | "stable" | null;
  target_probability: number | null;
  target_impact: number | null;
  target_risk_score: number | null;
  target_date: string | null;
  escalation_criteria: string | null;
  last_review_date: string | null;
  next_review_date: string | null;
  review_frequency: "weekly" | "monthly" | "quarterly" | "semi_annually" | "annually" | null;
  tags: string[] | null;
  external_reference: string | null;
  attachments: any | null;
  // Expanded selects (optional)
  business_units?: { name: string } | null;
  owner?: { first_name: string; last_name: string; email: string } | null;
}

export interface CreateRiskData {
  title: string;
  description?: string;
  category: string;
  business_unit_id?: string;
  probability?: number;
  impact?: number;
  risk_level: RiskLevel;
  mitigation_strategy?: string;
  owner_id?: string;
  status?: RiskStatus;
  risk_category_id?: string;
  risk_matrix_id?: string;
  risk_source?: string;
  likelihood_trend?: "increasing" | "decreasing" | "stable";
  impact_trend?: "increasing" | "decreasing" | "stable";
  target_probability?: number;
  target_impact?: number;
  target_date?: string;
  escalation_criteria?: string;
  review_frequency?: "weekly" | "monthly" | "quarterly" | "semi_annually" | "annually";
  tags?: string[];
  external_reference?: string;
}

export interface UpdateRiskData extends Partial<CreateRiskData> {
  id: string;
}

export interface RiskFilter {
  search?: string; // title/description ilike
  status?: RiskStatus | "all";
  level?: RiskLevel | "all";
  category?: string; // category string or risk_category_id; here use category string
  business_unit_id?: string;
  owner_id?: string;
}

export interface RiskAssessment {
  id: string;
  risk_id: string;
  assessment_date: string;
  assessor_id: string | null;
  assessment_type: "initial" | "periodic" | "triggered" | "ad_hoc";
  probability: number;
  impact: number;
  risk_score: number;
  risk_level: RiskLevel;
  assessment_notes: string | null;
  key_assumptions: string | null;
  data_sources: string | null;
  confidence_level: "low" | "medium" | "high";
  review_trigger: string | null;
  attachments: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskTreatment {
  id: string;
  risk_id: string;
  treatment_type: "mitigate" | "accept" | "transfer" | "avoid" | "monitor";
  title: string;
  description: string;
  treatment_strategy: string | null;
  cost_estimate: number | null;
  currency: string | null;
  assigned_to: string | null;
  responsible_department: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "planned" | "in_progress" | "completed" | "cancelled" | "on_hold" | "overdue";
  start_date: string | null;
  target_date: string | null;
  completed_date: string | null;
  effectiveness_rating: number | null;
  effectiveness_notes: string | null;
  success_criteria: string | null;
  kpis: any | null;
  dependencies: string | null;
  constraints_limitations: string | null;
  attachments: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskIncident {
  id: string;
  risk_id: string;
  incident_title: string;
  incident_description: string;
  incident_date: string;
  discovered_date: string | null;
  reported_by: string | null;
  severity: RiskLevel;
  actual_impact: string | null;
  financial_impact: number | null;
  currency: string | null;
  lessons_learned: string | null;
  corrective_actions: string | null;
  preventive_measures: string | null;
  status: "open" | "investigating" | "resolved" | "closed";
  resolution_date: string | null;
  attachments: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskReview {
  id: string;
  risk_id: string;
  review_date: string;
  reviewer_id: string;
  review_type: "periodic" | "triggered" | "incident_based" | "audit_based";
  review_outcome: "no_change" | "updated" | "escalated" | "closed" | "transferred";
  risk_status_before: string | null;
  risk_status_after: string | null;
  probability_before: number | null;
  probability_after: number | null;
  impact_before: number | null;
  impact_after: number | null;
  changes_made: string | null;
  review_notes: string | null;
  recommendations: string | null;
  next_review_date: string | null;
  attachments: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

function isUUID(v?: string | null): v is string {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

class RiskService {
  // Create Risk
  async createRisk(payload: CreateRiskData): Promise<Risk> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    const insertData: any = {
      ...payload,
      created_by: user.id,
      status: payload.status || "identified",
      likelihood_trend: payload.likelihood_trend || "stable",
      impact_trend: payload.impact_trend || "stable",
      tags: payload.tags || [],
    };

    const { data, error } = await supabase
      .from("risks")
      .insert(insertData)
      .select("*")
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data as Risk;
  }

  // Update Risk
  async updateRisk({ id, ...updates }: UpdateRiskData): Promise<Risk> {
    if (!isUUID(id)) throw new Error("Invalid risk ID");

    const { data, error } = await supabase
      .from("risks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data as Risk;
  }

  // Get a Risk by id (with optional owner and business unit info)
  async getRisk(id: string): Promise<Risk | null> {
    if (!isUUID(id)) throw new Error("Invalid risk ID");

    // Basic select; if PostgREST relationships are defined, can expand
    const { data, error } = await supabase.from("risks").select("*").eq("id", id).single();

    if (error) {
      if ((error as any).code === "PGRST116") return null;
      throw new Error(`Database error: ${error.message}`);
    }
    return data as Risk;
  }

  // List Risks with filters
  async getRisks(filters?: RiskFilter): Promise<Risk[]> {
    let query = supabase.from("risks").select("*").order("created_at", { ascending: false });

    if (filters?.search) {
      const s = filters.search;
      query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
    }
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters?.level && filters.level !== "all") {
      query = query.eq("risk_level", filters.level);
    }
    if (filters?.category) {
      query = query.ilike("category", `%${filters.category}%`);
    }
    if (filters?.business_unit_id && isUUID(filters.business_unit_id)) {
      query = query.eq("business_unit_id", filters.business_unit_id);
    }
    if (filters?.owner_id && isUUID(filters.owner_id)) {
      query = query.eq("owner_id", filters.owner_id);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Database error: ${error.message}`);
    return (data || []) as Risk[];
  }

  // Delete Risk (hard delete is not allowed by design here; could implement soft-delete pattern)
  async deleteRisk(id: string): Promise<void> {
    if (!isUUID(id)) throw new Error("Invalid risk ID");

    const { error } = await supabase.from("risks").delete().eq("id", id);
    if (error) throw new Error(`Database error: ${error.message}`);
  }

  // ------- Related Entities -------

  // Assessments
  async addAssessment(riskId: string, assessment: Omit<RiskAssessment, "id" | "created_at" | "updated_at">): Promise<RiskAssessment> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const payload = { ...assessment, risk_id: riskId };

    const { data, error } = await supabase.from("risk_assessments").insert(payload).select("*").single();
    if (error) throw new Error(`Database error: ${error.message}`);
    return data as RiskAssessment;
  }

  async getAssessments(riskId: string): Promise<RiskAssessment[]> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const { data, error } = await supabase
      .from("risk_assessments")
      .select("*")
      .eq("risk_id", riskId)
      .order("assessment_date", { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);
    return (data || []) as RiskAssessment[];
  }

  // Treatments
  async addTreatment(riskId: string, treatment: Omit<RiskTreatment, "id" | "created_at" | "updated_at">): Promise<RiskTreatment> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const payload = { ...treatment, risk_id: riskId };

    const { data, error } = await supabase.from("risk_treatments").insert(payload).select("*").single();
    if (error) throw new Error(`Database error: ${error.message}`);
    return data as RiskTreatment;
  }

  async getTreatments(riskId: string): Promise<RiskTreatment[]> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const { data, error } = await supabase
      .from("risk_treatments")
      .select("*")
      .eq("risk_id", riskId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);
    return (data || []) as RiskTreatment[];
  }

  // Incidents
  async addIncident(riskId: string, incident: Omit<RiskIncident, "id" | "created_at" | "updated_at">): Promise<RiskIncident> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const payload = { ...incident, risk_id: riskId };

    const { data, error } = await supabase.from("risk_incidents").insert(payload).select("*").single();
    if (error) throw new Error(`Database error: ${error.message}`);
    return data as RiskIncident;
  }

  async getIncidents(riskId: string): Promise<RiskIncident[]> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const { data, error } = await supabase
      .from("risk_incidents")
      .select("*")
      .eq("risk_id", riskId)
      .order("incident_date", { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);
    return (data || []) as RiskIncident[];
  }

  // Reviews
  async addReview(riskId: string, review: Omit<RiskReview, "id" | "created_at" | "updated_at">): Promise<RiskReview> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const payload = { ...review, risk_id: riskId };

    const { data, error } = await supabase.from("risk_reviews").insert(payload).select("*").single();
    if (error) throw new Error(`Database error: ${error.message}`);
    return data as RiskReview;
  }

  async getReviews(riskId: string): Promise<RiskReview[]> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    const { data, error } = await supabase
      .from("risk_reviews")
      .select("*")
      .eq("risk_id", riskId)
      .order("review_date", { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);
    return (data || []) as RiskReview[];
  }

  // Link Controls <-> Risk
  async linkControl(riskId: string, controlId: string, meta?: Partial<Pick<RiskTreatment, "effectiveness_rating">>): Promise<void> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    if (!isUUID(controlId)) throw new Error("Invalid control ID");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("risk_controls").insert({
      risk_id: riskId,
      control_id: controlId,
      created_by: user?.id ?? null,
      relationship_notes: null,
      last_tested_date: null,
      next_test_date: null,
    });
    if (error) throw new Error(`Database error: ${error.message}`);
  }

  async unlinkControl(riskId: string, controlId: string): Promise<void> {
    if (!isUUID(riskId)) throw new Error("Invalid risk ID");
    if (!isUUID(controlId)) throw new Error("Invalid control ID");

    const { error } = await supabase
      .from("risk_controls")
      .delete()
      .eq("risk_id", riskId)
      .eq("control_id", controlId);

    if (error) throw new Error(`Database error: ${error.message}`);
  }

  // Stats for list page
  async getStats(filters?: Partial<RiskFilter>): Promise<{
    total: number;
    byStatus: Record<RiskStatus, number>;
    byLevel: Record<RiskLevel, number>;
    byCategory: Record<string, number>;
  }> {
    // Fetch minimal fields for counting
    let query = supabase.from("risks").select("status, risk_level, category", { count: "exact" });

    if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
    if (filters?.level && filters.level !== "all") query = query.eq("risk_level", filters.level);
    if (filters?.category) query = query.ilike("category", `%${filters.category}%`);
    if (filters?.business_unit_id && isUUID(filters.business_unit_id))
      query = query.eq("business_unit_id", filters.business_unit_id);

    const { data, count, error } = await query;
    if (error) throw new Error(`Database error: ${error.message}`);

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
    const byLevel: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const byCategory: Record<string, number> = {};

    (data || []).forEach((r: any) => {
      if (r.status in byStatus) byStatus[r.status as RiskStatus] += 1;
      if (r.risk_level in byLevel) byLevel[r.risk_level as RiskLevel] += 1;
      if (r.category) byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    });

    return {
      total: count || 0,
      byStatus,
      byLevel,
      byCategory,
    };
  }
}

export const riskService = new RiskService();
export default riskService;