import { supabase } from "../lib/supabase";
import {
  AuditUniverse,
  AuditUniverseHistory,
  AuditPlan,
  AuditPlanItem,
  AuditorCompetency,
  AuditorAvailability,
  AuditResourceAllocation,
  AuditCapacityPlanning,
  AuditTrainingNeed,
  AuditRiskAssessment,
  AuditUniverseFormData,
  AuditPlanFormData,
  AuditPlanItemFormData,
  AuditorCompetencyFormData,
  AuditorAvailabilityFormData,
  ResourceAllocationFormData,
  TrainingNeedFormData,
  RiskAssessmentFormData,
  AuditPlanningMetrics,
  CoverageAnalysis,
  ResourceUtilization,
  AuditPlanningSearchParams,
} from "../types/auditPlanning";

class AuditPlanningService {
  // Audit Universe Management
  async createAuditUniverse(universeData: AuditUniverseFormData): Promise<AuditUniverse> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("audit_universe")
        .insert([{
          ...universeData,
          created_by: user.id,
          is_active: true,
        }])
        .select(`
          *,
          business_units(name, code),
          parent_entity:audit_universe!parent_entity_id(entity_name, entity_type),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditUniverse;
    } catch (error) {
      console.error("Error creating audit universe:", error);
      throw error;
    }
  }

  async updateAuditUniverse(id: string, universeData: Partial<AuditUniverseFormData>): Promise<AuditUniverse> {
    try {
      const { data, error } = await supabase
        .from("audit_universe")
        .update({
          ...universeData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          business_units(name, code),
          parent_entity:audit_universe!parent_entity_id(entity_name, entity_type),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditUniverse;
    } catch (error) {
      console.error("Error updating audit universe:", error);
      throw error;
    }
  }

  async getAuditUniverse(id: string): Promise<AuditUniverse | null> {
    try {
      const { data, error } = await supabase
        .from("audit_universe")
        .select(`
          *,
          business_units(name, code),
          parent_entity:audit_universe!parent_entity_id(entity_name, entity_type),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditUniverse;
    } catch (error) {
      console.error("Error fetching audit universe:", error);
      throw error;
    }
  }

  async getAllAuditUniverse(searchParams?: AuditPlanningSearchParams): Promise<AuditUniverse[]> {
    try {
      let query = supabase
        .from("audit_universe")
        .select(`
          *,
          business_units(name, code),
          parent_entity:audit_universe!parent_entity_id(entity_name, entity_type),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .eq("is_active", true);

      if (searchParams?.query) {
        query = query.or(`entity_name.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`);
      }

      if (searchParams?.filters?.business_unit?.length) {
        query = query.in("business_unit_id", searchParams.filters.business_unit);
      }

      if (searchParams?.filters?.entity_type?.length) {
        query = query.in("entity_type", searchParams.filters.entity_type);
      }

      if (searchParams?.filters?.classification_category?.length) {
        query = query.in("classification_category", searchParams.filters.classification_category);
      }

      if (searchParams?.sort_by) {
        query = query.order(searchParams.sort_by, { 
          ascending: searchParams.sort_order === "asc" 
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditUniverse[];
    } catch (error) {
      console.error("Error fetching audit universe:", error);
      throw error;
    }
  }

  async addAuditUniverseHistory(historyData: {
    universe_entity_id: string;
    audit_id?: string;
    audit_type: string;
    audit_date: string;
    findings_count?: number;
    critical_findings_count?: number;
    high_findings_count?: number;
    medium_findings_count?: number;
    low_findings_count?: number;
    audit_rating?: string;
    auditor_notes?: string;
  }): Promise<AuditUniverseHistory> {
    try {
      const { data, error } = await supabase
        .from("audit_universe_history")
        .insert([historyData])
        .select(`
          *,
          audit:audits(title, status)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditUniverseHistory;
    } catch (error) {
      console.error("Error adding audit universe history:", error);
      throw error;
    }
  }

  // Audit Plans Management
  async createAuditPlan(planData: AuditPlanFormData): Promise<AuditPlan> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("audit_plans")
        .insert([{
          ...planData,
          created_by: user.id,
          status: "draft",
        }])
        .select(`
          *,
          approved_by_user:users!approved_by(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlan;
    } catch (error) {
      console.error("Error creating audit plan:", error);
      throw error;
    }
  }

  async updateAuditPlan(id: string, planData: Partial<AuditPlanFormData>): Promise<AuditPlan> {
    try {
      const { data, error } = await supabase
        .from("audit_plans")
        .update({
          ...planData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          approved_by_user:users!approved_by(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlan;
    } catch (error) {
      console.error("Error updating audit plan:", error);
      throw error;
    }
  }

  async getAuditPlan(id: string): Promise<AuditPlan | null> {
    try {
      const { data, error } = await supabase
        .from("audit_plans")
        .select(`
          *,
          approved_by_user:users!approved_by(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlan;
    } catch (error) {
      console.error("Error fetching audit plan:", error);
      throw error;
    }
  }

  async getAllAuditPlans(): Promise<AuditPlan[]> {
    try {
      const { data, error } = await supabase
        .from("audit_plans")
        .select(`
          *,
          approved_by_user:users!approved_by(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlan[];
    } catch (error) {
      console.error("Error fetching audit plans:", error);
      throw error;
    }
  }

  async approveAuditPlan(id: string): Promise<AuditPlan> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("audit_plans")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          approved_by_user:users!approved_by(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlan;
    } catch (error) {
      console.error("Error approving audit plan:", error);
      throw error;
    }
  }

  // Audit Plan Items Management
  async createAuditPlanItem(itemData: AuditPlanItemFormData): Promise<AuditPlanItem> {
    try {
      const { data, error } = await supabase
        .from("audit_plan_items")
        .insert([itemData])
        .select(`
          *,
          universe_entity:audit_universe(entity_name, entity_type, classification_category),
          audit:audits(title, status),
          lead_auditor:users!lead_auditor_id(first_name, last_name, email),
          business_unit:business_units(name, code)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlanItem;
    } catch (error) {
      console.error("Error creating audit plan item:", error);
      throw error;
    }
  }

  async updateAuditPlanItem(id: string, itemData: Partial<AuditPlanItemFormData>): Promise<AuditPlanItem> {
    try {
      const { data, error } = await supabase
        .from("audit_plan_items")
        .update({
          ...itemData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          universe_entity:audit_universe(entity_name, entity_type, classification_category),
          audit:audits(title, status),
          lead_auditor:users!lead_auditor_id(first_name, last_name, email),
          business_unit:business_units(name, code)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlanItem;
    } catch (error) {
      console.error("Error updating audit plan item:", error);
      throw error;
    }
  }

  async getAuditPlanItems(planId: string): Promise<AuditPlanItem[]> {
    try {
      const { data, error } = await supabase
        .from("audit_plan_items")
        .select(`
          *,
          universe_entity:audit_universe(entity_name, entity_type, classification_category),
          audit:audits(title, status),
          lead_auditor:users!lead_auditor_id(first_name, last_name, email),
          business_unit:business_units(name, code)
        `)
        .eq("audit_plan_id", planId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditPlanItem[];
    } catch (error) {
      console.error("Error fetching audit plan items:", error);
      throw error;
    }
  }

  // Auditor Competencies Management
  async createAuditorCompetency(competencyData: AuditorCompetencyFormData): Promise<AuditorCompetency> {
    try {
      const { data, error } = await supabase
        .from("auditor_competencies")
        .insert([competencyData])
        .select(`
          *,
          user:users(first_name, last_name, email),
          assessed_by_user:users!assessed_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditorCompetency;
    } catch (error) {
      console.error("Error creating auditor competency:", error);
      throw error;
    }
  }

  async getAuditorCompetencies(userId: string): Promise<AuditorCompetency[]> {
    try {
      const { data, error } = await supabase
        .from("auditor_competencies")
        .select(`
          *,
          user:users(first_name, last_name, email),
          assessed_by_user:users!assessed_by(first_name, last_name, email)
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditorCompetency[];
    } catch (error) {
      console.error("Error fetching auditor competencies:", error);
      throw error;
    }
  }

  // Auditor Availability Management
  async createAuditorAvailability(availabilityData: AuditorAvailabilityFormData): Promise<AuditorAvailability> {
    try {
      const { data, error } = await supabase
        .from("auditor_availability")
        .insert([availabilityData])
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditorAvailability;
    } catch (error) {
      console.error("Error creating auditor availability:", error);
      throw error;
    }
  }

  async getAuditorAvailability(userId: string, startDate: string, endDate: string): Promise<AuditorAvailability[]> {
    try {
      const { data, error } = await supabase
        .from("auditor_availability")
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditorAvailability[];
    } catch (error) {
      console.error("Error fetching auditor availability:", error);
      throw error;
    }
  }

  // Resource Allocation Management
  async createResourceAllocation(allocationData: ResourceAllocationFormData): Promise<AuditResourceAllocation> {
    try {
      const { data, error } = await supabase
        .from("audit_resource_allocation")
        .insert([allocationData])
        .select(`
          *,
          user:users(first_name, last_name, email),
          audit_plan_item:audit_plan_items(audit_title, audit_type)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditResourceAllocation;
    } catch (error) {
      console.error("Error creating resource allocation:", error);
      throw error;
    }
  }

  async getResourceAllocations(planItemId: string): Promise<AuditResourceAllocation[]> {
    try {
      const { data, error } = await supabase
        .from("audit_resource_allocation")
        .select(`
          *,
          user:users(first_name, last_name, email),
          audit_plan_item:audit_plan_items(audit_title, audit_type)
        `)
        .eq("audit_plan_item_id", planItemId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditResourceAllocation[];
    } catch (error) {
      console.error("Error fetching resource allocations:", error);
      throw error;
    }
  }

  // Training Needs Management
  async createTrainingNeed(trainingData: TrainingNeedFormData): Promise<AuditTrainingNeed> {
    try {
      const { data, error } = await supabase
        .from("audit_training_needs")
        .insert([trainingData])
        .select(`
          *,
          user:users(first_name, last_name, email),
          approved_by_user:users!approved_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditTrainingNeed;
    } catch (error) {
      console.error("Error creating training need:", error);
      throw error;
    }
  }

  async getTrainingNeeds(): Promise<AuditTrainingNeed[]> {
    try {
      const { data, error } = await supabase
        .from("audit_training_needs")
        .select(`
          *,
          user:users(first_name, last_name, email),
          approved_by_user:users!approved_by(first_name, last_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditTrainingNeed[];
    } catch (error) {
      console.error("Error fetching training needs:", error);
      throw error;
    }
  }

  // Risk Assessment Management
  async createRiskAssessment(assessmentData: RiskAssessmentFormData): Promise<AuditRiskAssessment> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("audit_risk_assessments")
        .insert([{
          ...assessmentData,
          assessed_by: user.id,
        }])
        .select(`
          *,
          universe_entity:audit_universe(entity_name, entity_type),
          assessed_by_user:users!assessed_by(first_name, last_name, email),
          reviewed_by_user:users!reviewed_by(first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditRiskAssessment;
    } catch (error) {
      console.error("Error creating risk assessment:", error);
      throw error;
    }
  }

  async getRiskAssessments(universeEntityId: string): Promise<AuditRiskAssessment[]> {
    try {
      const { data, error } = await supabase
        .from("audit_risk_assessments")
        .select(`
          *,
          universe_entity:audit_universe(entity_name, entity_type),
          assessed_by_user:users!assessed_by(first_name, last_name, email),
          reviewed_by_user:users!reviewed_by(first_name, last_name, email)
        `)
        .eq("universe_entity_id", universeEntityId)
        .order("assessment_date", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditRiskAssessment[];
    } catch (error) {
      console.error("Error fetching risk assessments:", error);
      throw error;
    }
  }

  // Analytics and Dashboard
  async getAuditPlanningMetrics(): Promise<AuditPlanningMetrics> {
    try {
      // Get total universe entities
      const { data: universeData, error: universeError } = await supabase
        .from("audit_universe")
        .select("id, inherent_risk_score")
        .eq("is_active", true);

      if (universeError) {
        throw new Error(`Database error: ${universeError.message}`);
      }

      // Get planned audits
      const { data: planItemsData, error: planItemsError } = await supabase
        .from("audit_plan_items")
        .select("planned_hours, status, planned_start_date");

      if (planItemsError) {
        throw new Error(`Database error: ${planItemsError.message}`);
      }

      // Get training needs
      const { data: trainingData, error: trainingError } = await supabase
        .from("audit_training_needs")
        .select("id")
        .eq("status", "identified");

      if (trainingError) {
        throw new Error(`Database error: ${trainingError.message}`);
      }

      const totalUniverseEntities = universeData?.length || 0;
      const highRiskEntities = universeData?.filter(e => e.inherent_risk_score && e.inherent_risk_score >= 4).length || 0;
      const overdueAudits = planItemsData?.filter(item => 
        item.status === "planned" && 
        item.planned_start_date && 
        new Date(item.planned_start_date) < new Date()
      ).length || 0;
      const plannedAudits = planItemsData?.filter(item => item.status === "planned").length || 0;
      const totalAuditHours = planItemsData?.reduce((sum, item) => sum + (Number(item.planned_hours) || 0), 0) || 0;
      const trainingNeedsCount = trainingData?.length || 0;

      return {
        total_universe_entities: totalUniverseEntities,
        high_risk_entities: highRiskEntities,
        overdue_audits: overdueAudits,
        planned_audits: plannedAudits,
        total_audit_hours: totalAuditHours,
        capacity_utilization: 0, // TODO: Calculate based on resource allocation
        training_needs_count: trainingNeedsCount,
        competency_gaps: 0, // TODO: Calculate based on competency assessments
      };
    } catch (error) {
      console.error("Error fetching audit planning metrics:", error);
      throw error;
    }
  }

  async getCoverageAnalysis(): Promise<CoverageAnalysis[]> {
    try {
      // Use a direct query instead of RPC to avoid type issues
      const { data, error } = await supabase
        .from('audit_universe')
        .select(`
          business_units(name),
          id,
          last_audit_date,
          inherent_risk_score
        `)
        .eq('is_active', true);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Group by business unit and calculate metrics
      const businessUnitMap = new Map<string, { total: number; audited: number; riskScores: number[] }>();
      
      data?.forEach((item: any) => {
        const businessUnit = item.business_units?.name || 'Unknown';
        const current = businessUnitMap.get(businessUnit) || { total: 0, audited: 0, riskScores: [] };
        
        current.total += 1;
        if (item.last_audit_date) {
          current.audited += 1;
        }
        if (item.inherent_risk_score) {
          current.riskScores.push(item.inherent_risk_score);
        }
        
        businessUnitMap.set(businessUnit, current);
      });

      // Convert to CoverageAnalysis format
      const result: CoverageAnalysis[] = Array.from(businessUnitMap.entries()).map(([businessUnit, metrics]) => {
        const coveragePercentage = metrics.total > 0 ? (metrics.audited / metrics.total) * 100 : 0;
        const avgRiskScore = metrics.riskScores.length > 0 
          ? metrics.riskScores.reduce((sum, score) => sum + score, 0) / metrics.riskScores.length 
          : 0;
        
        let riskLevel = 'Low';
        if (coveragePercentage < 50) {
          riskLevel = 'High';
        } else if (coveragePercentage < 80) {
          riskLevel = 'Medium';
        }

        return {
          business_unit: businessUnit,
          total_entities: metrics.total,
          audited_entities: metrics.audited,
          coverage_percentage: Number(Math.round(coveragePercentage * 100) / 100),
          risk_level: riskLevel
        };
      });

      return result.sort((a, b) => a.coverage_percentage - b.coverage_percentage);
    } catch (error) {
      console.error("Error fetching coverage analysis:", error);
      throw error;
    }
  }

  async getResourceUtilization(): Promise<ResourceUtilization[]> {
    try {
      // Use a direct query instead of RPC to avoid type issues
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          audit_resource_allocation(allocated_hours)
        `)
        .eq('is_active', true);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Convert to ResourceUtilization format
      return (data || []).map((user: any) => {
        const allocatedHours = user.audit_resource_allocation?.reduce((sum: number, allocation: any) => 
          sum + (Number(allocation.allocated_hours) || 0), 0) || 0;
        const availableHours = 160; // Assuming 160 hours per month
        const utilizationPercentage = availableHours > 0 ? (allocatedHours / availableHours) * 100 : 0;

        return {
          user_id: user.id,
          user_name: `${user.first_name} ${user.last_name}`,
          allocated_hours: allocatedHours,
          available_hours: availableHours,
          utilization_percentage: Math.round(utilizationPercentage * 100) / 100,
          skills: ['Financial Audit', 'IT Audit', 'Compliance'] // Mock skills for now
        };
      }).sort((a, b) => b.utilization_percentage - a.utilization_percentage);
    } catch (error) {
      console.error("Error fetching resource utilization:", error);
      throw error;
    }
  }
}

export const auditPlanningService = new AuditPlanningService();
export default auditPlanningService;
