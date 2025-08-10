import { supabase } from "../lib/supabase";
import { Audit } from "../types";

export interface CreateAuditData {
  title: string;
  description: string;
  audit_type: string;
  status: string;
  business_unit_id: string;
  lead_auditor_id: string;
  team_members?: string[];
  start_date: string;
  end_date: string;
  planned_hours: number;
  objectives: string[];
  scope: string;
  methodology: string;
  approval_status?: string;
}

export interface UpdateAuditData extends Partial<CreateAuditData> {
  id: string;
}

export interface CreateAuditTemplateData {
  name: string;
  description?: string;
  audit_type: string;
  objectives: string[];
  scope?: string;
  methodology?: string;
}

export interface UpdateAuditTemplateData extends Partial<CreateAuditTemplateData> {
  id: string;
}

export interface AuditTemplate {
  id: string;
  name: string;
  description?: string;
  audit_type: string;
  objectives: string[];
  scope?: string;
  methodology?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

class AuditService {
  async createAudit(auditData: CreateAuditData): Promise<Audit> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Prepare audit data for database
      const auditToInsert = {
        title: auditData.title,
        description: auditData.description,
        audit_type: auditData.audit_type,
        status: auditData.status,
        business_unit_id: auditData.business_unit_id,
        lead_auditor_id: auditData.lead_auditor_id,
        start_date: auditData.start_date,
        end_date: auditData.end_date,
        planned_hours: auditData.planned_hours,
        objectives: auditData.objectives,
        scope: auditData.scope,
        methodology: auditData.methodology,
        approval_status: auditData.approval_status || "draft",
        created_by: user.id,
        ai_generated: false,
      };

      console.log("Inserting audit data:", auditToInsert);

      // Insert audit into database
      const { data, error } = await supabase
        .from("audits")
        .insert([auditToInsert])
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Audit created successfully:", data);

      // Insert team members if provided
      if (auditData.team_members && auditData.team_members.length > 0) {
        const teamMemberData = auditData.team_members.map((memberId) => ({
          audit_id: data.id,
          user_id: memberId,
          role: "auditor",
          allocated_hours: 0,
          actual_hours: 0,
          is_active: true,
          added_by: user.id,
        }));

        const { error: teamError } = await supabase
          .from("audit_team_members")
          .insert(teamMemberData);

        if (teamError) {
          console.error("Error adding team members:", teamError);
          // Don't throw here, audit is already created
        }
      }

      // Insert objectives as separate records
      if (auditData.objectives && auditData.objectives.length > 0) {
        const objectiveData = auditData.objectives.map((objective, index) => ({
          audit_id: data.id,
          objective_text: objective,
          objective_order: index + 1,
          ai_generated: false,
          completion_status: "pending",
        }));

        const { error: objectiveError } = await supabase
          .from("audit_objectives")
          .insert(objectiveData);

        if (objectiveError) {
          console.error("Error adding objectives:", objectiveError);
          // Don't throw here, audit is already created
        }
      }

      return data as Audit;
    } catch (error) {
      console.error("Error creating audit:", error);
      throw error;
    }
  }

  async updateAudit(auditData: UpdateAuditData): Promise<Audit> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { id, ...updateData } = auditData;

      // Update audit in database
      const { data, error } = await supabase
        .from("audits")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Audit updated successfully:", data);
      return data as Audit;
    } catch (error) {
      console.error("Error updating audit:", error);
      throw error;
    }
  }

  async getAudit(id: string): Promise<Audit | null> {
    try {
      const { data, error } = await supabase
        .from("audits")
        .select(
          `
          *,
          business_units(name, code),
          lead_auditor:users!lead_auditor_id(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `,
        )
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No rows returned
        }
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as Audit;
    } catch (error) {
      console.error("Error fetching audit:", error);
      throw error;
    }
  }

  async getAllAudits(): Promise<Audit[]> {
    try {
      const { data, error } = await supabase
        .from("audits")
        .select(
          `
          *,
          business_units(name, code),
          lead_auditor:users!lead_auditor_id(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `,
        )
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as Audit[];
    } catch (error) {
      console.error("Error fetching audits:", error);
      throw error;
    }
  }

  async deleteAudit(id: string): Promise<void> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Soft delete the audit
      const { error } = await supabase
        .from("audits")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Audit deleted successfully");
    } catch (error) {
      console.error("Error deleting audit:", error);
      throw error;
    }
  }

  async getAuditsByUser(userId: string): Promise<Audit[]> {
    try {
      const { data, error } = await supabase
        .from("audits")
        .select(
          `
          *,
          business_units(name, code),
          lead_auditor:users!lead_auditor_id(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `,
        )
        .or(`lead_auditor_id.eq.${userId},created_by.eq.${userId}`)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as Audit[];
    } catch (error) {
      console.error("Error fetching user audits:", error);
      throw error;
    }
  }

  async getAuditsByStatus(status: string): Promise<Audit[]> {
    try {
      const { data, error } = await supabase
        .from("audits")
        .select(
          `
          *,
          business_units(name, code),
          lead_auditor:users!lead_auditor_id(first_name, last_name, email),
          created_by_user:users!created_by(first_name, last_name, email)
        `,
        )
        .eq("status", status)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as Audit[];
    } catch (error) {
      console.error("Error fetching audits by status:", error);
      throw error;
    }
  }

  async getAuditTeamMembers(auditId: string) {
    try {
      const { data, error } = await supabase
        .from("audit_team_members")
        .select(
          `
          *,
          users(first_name, last_name, email, role)
        `,
        )
        .eq("audit_id", auditId)
        .eq("is_active", true);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  }

  async getAuditObjectives(auditId: string) {
    try {
      const { data, error } = await supabase
        .from("audit_objectives")
        .select("*")
        .eq("audit_id", auditId)
        .order("objective_order");

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching objectives:", error);
      throw error;
    }
  }

  async updateAuditStatus(
    auditId: string,
    status: string,
    changeReason?: string,
  ): Promise<void> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Get current audit status
      const { data: currentAudit, error: fetchError } = await supabase
        .from("audits")
        .select("status")
        .eq("id", auditId)
        .single();

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Update audit status
      const { error: updateError } = await supabase
        .from("audits")
        .update({
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", auditId);

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`);
      }

      // Log status change
      const { error: historyError } = await supabase
        .from("audit_status_history")
        .insert([
          {
            audit_id: auditId,
            old_status: currentAudit.status,
            new_status: status,
            changed_by: user.id,
            change_reason: changeReason || "Status updated",
          },
        ]);

      if (historyError) {
        console.error("Error logging status change:", historyError);
        // Don't throw here, the main update succeeded
      }

      console.log("Audit status updated successfully");
    } catch (error) {
      console.error("Error updating audit status:", error);
      throw error;
    }
  }

  // Audit Template Methods
  async createAuditTemplate(templateData: CreateAuditTemplateData): Promise<AuditTemplate> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const templateToInsert = {
        name: templateData.name,
        description: templateData.description,
        audit_type: templateData.audit_type,
        objectives: templateData.objectives,
        scope: templateData.scope,
        methodology: templateData.methodology,
        is_active: true,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("audit_templates")
        .insert([templateToInsert])
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditTemplate;
    } catch (error) {
      console.error("Error creating audit template:", error);
      throw error;
    }
  }

  async updateAuditTemplate(templateData: UpdateAuditTemplateData): Promise<AuditTemplate> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { id, ...updateData } = templateData;

      const { data, error } = await supabase
        .from("audit_templates")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditTemplate;
    } catch (error) {
      console.error("Error updating audit template:", error);
      throw error;
    }
  }

  async getAuditTemplate(id: string): Promise<AuditTemplate | null> {
    try {
      const { data, error } = await supabase
        .from("audit_templates")
        .select("*")
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

      return data as AuditTemplate;
    } catch (error) {
      console.error("Error fetching audit template:", error);
      throw error;
    }
  }

  async getAllAuditTemplates(): Promise<AuditTemplate[]> {
    try {
      const { data, error } = await supabase
        .from("audit_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditTemplate[];
    } catch (error) {
      console.error("Error fetching audit templates:", error);
      throw error;
    }
  }

  async getAuditTemplatesByType(auditType: string): Promise<AuditTemplate[]> {
    try {
      const { data, error } = await supabase
        .from("audit_templates")
        .select("*")
        .eq("audit_type", auditType)
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data as AuditTemplate[];
    } catch (error) {
      console.error("Error fetching audit templates by type:", error);
      throw error;
    }
  }

  async deleteAuditTemplate(id: string): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("audit_templates")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting audit template:", error);
      throw error;
    }
  }

  async createAuditFromTemplate(templateId: string, auditData: Partial<CreateAuditData>): Promise<Audit> {
    try {
      const template = await this.getAuditTemplate(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Merge template data with provided audit data
      const mergedAuditData: CreateAuditData = {
        title: auditData.title || `Audit based on ${template.name}`,
        description: auditData.description || template.description || "",
        audit_type: auditData.audit_type || template.audit_type,
        status: auditData.status || "draft",
        business_unit_id: auditData.business_unit_id || "",
        lead_auditor_id: auditData.lead_auditor_id || "",
        team_members: auditData.team_members || [],
        start_date: auditData.start_date || "",
        end_date: auditData.end_date || "",
        planned_hours: auditData.planned_hours || 40,
        objectives: auditData.objectives || template.objectives || [],
        scope: auditData.scope || template.scope || "",
        methodology: auditData.methodology || template.methodology || "",
        approval_status: auditData.approval_status || "draft",
      };

      return await this.createAudit(mergedAuditData);
    } catch (error) {
      console.error("Error creating audit from template:", error);
      throw error;
    }
  }
}

export const auditService = new AuditService();
export default auditService;
