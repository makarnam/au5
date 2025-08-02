import { supabase } from "../lib/supabase";
import { ControlSet, Control, ControlFormData } from "../types";

interface CreateControlSetData {
  audit_id?: string;
  name: string;
  description: string;
  framework: string;
}

interface UpdateControlSetData {
  id: string;
  name?: string;
  description?: string;
  framework?: string;
}

interface CreateControlData {
  control_code: string;
  title: string;
  description: string;
  control_type: string;
  frequency: string;
  process_area: string;
  owner_id?: string;
  testing_procedure: string;
  evidence_requirements: string;
  effectiveness?: string;
  last_tested_date?: string;
  next_test_date?: string;
  is_automated: boolean;
}

interface UpdateControlData {
  id: string;
  [key: string]: any;
}

// Utility function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Utility function to check if string is empty or null
function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim() === "";
}

class ControlService {
  async createControlSet(data: CreateControlSetData): Promise<ControlSet> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Validate audit_id if provided
      if (data.audit_id && !isEmpty(data.audit_id) && !isValidUUID(data.audit_id)) {
        throw new Error("Invalid audit_id format");
      }

      const insertData: any = {
        name: data.name,
        description: data.description,
        framework: data.framework,
        created_by: user.id,
        controls_count: 0,
        ai_generated: false,
      };

      // Only add audit_id if it's a valid UUID
      if (data.audit_id && !isEmpty(data.audit_id) && isValidUUID(data.audit_id)) {
        insertData.audit_id = data.audit_id;
      }

      const { data: controlSet, error } = await supabase
        .from("control_sets")
        .insert(insertData)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return controlSet as ControlSet;
    } catch (error) {
      console.error("Error creating control set:", error);
      throw error;
    }
  }

  async updateControlSet(id: string, data: Partial<UpdateControlSetData>): Promise<ControlSet> {
    try {
      // Validate ID
      if (!isValidUUID(id)) {
        throw new Error("Invalid control set ID format");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data: controlSet, error } = await supabase
        .from("control_sets")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return controlSet as ControlSet;
    } catch (error) {
      console.error("Error updating control set:", error);
      throw error;
    }
  }

  async deleteControlSet(id: string): Promise<void> {
    try {
      // Validate ID
      if (!isValidUUID(id)) {
        throw new Error("Invalid control set ID format");
      }

      // Soft delete all controls in the set first
      const { error: controlsError } = await supabase
        .from("controls")
        .update({ is_deleted: true })
        .eq("control_set_id", id);

      if (controlsError) {
        throw new Error(`Error deleting controls: ${controlsError.message}`);
      }

      // Soft delete the control set
      const { error } = await supabase
        .from("control_sets")
        .update({ is_deleted: true })
        .eq("id", id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting control set:", error);
      throw error;
    }
  }

  async getControlSetsByAudit(auditId?: string): Promise<ControlSet[]> {
    try {
      let query = supabase
        .from("control_sets")
        .select("*")
        .eq("is_deleted", false);

      // Only filter by audit_id if it's provided and valid
      if (auditId && !isEmpty(auditId) && isValidUUID(auditId)) {
        query = query.eq("audit_id", auditId);
      } else if (isEmpty(auditId)) {
        // If auditId is empty, get all control sets (or filter by null audit_id)
        query = query.is("audit_id", null);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data as ControlSet[];
    } catch (error) {
      console.error("Error fetching control sets:", error);
      throw error;
    }
  }

  async getControlSet(id: string): Promise<ControlSet | null> {
    try {
      // Validate ID
      if (!isValidUUID(id)) {
        throw new Error("Invalid control set ID format");
      }

      const { data, error } = await supabase
        .from("control_sets")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return data as ControlSet;
    } catch (error) {
      console.error("Error fetching control set:", error);
      throw error;
    }
  }

  async createControl(controlSetId: string, data: ControlFormData): Promise<Control> {
    try {
      // Validate control set ID
      if (!isValidUUID(controlSetId)) {
        throw new Error("Invalid control set ID format");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Get the control set to get audit_id
      const controlSet = await this.getControlSet(controlSetId);
      if (!controlSet) {
        throw new Error("Control set not found");
      }

      const insertData: any = {
        control_set_id: controlSetId,
        control_code: data.control_code,
        title: data.title,
        description: data.description,
        control_type: data.control_type,
        frequency: data.frequency,
        process_area: data.process_area,
        testing_procedure: data.testing_procedure,
        evidence_requirements: data.evidence_requirements,
        effectiveness: data.effectiveness || "not_tested",
        is_automated: data.is_automated,
        ai_generated: false,
        created_by: user.id,
        is_deleted: false,
      };

      // Add optional fields if they exist and are valid
      if (controlSet.audit_id) {
        insertData.audit_id = controlSet.audit_id;
      }

      if (data.owner_id && !isEmpty(data.owner_id) && isValidUUID(data.owner_id)) {
        insertData.owner_id = data.owner_id;
      }

      if (data.last_tested_date && !isEmpty(data.last_tested_date)) {
        insertData.last_tested_date = data.last_tested_date;
      }

      if (data.next_test_date && !isEmpty(data.next_test_date)) {
        insertData.next_test_date = data.next_test_date;
      }

      const { data: control, error } = await supabase
        .from("controls")
        .insert(insertData)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return control as Control;
    } catch (error) {
      console.error("Error creating control:", error);
      throw error;
    }
  }

  async createMultipleControls(controlSetId: string, controlsData: ControlFormData[]): Promise<Control[]> {
    try {
      // Validate control set ID
      if (!isValidUUID(controlSetId)) {
        throw new Error("Invalid control set ID format");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Get the control set to get audit_id
      const controlSet = await this.getControlSet(controlSetId);
      if (!controlSet) {
        throw new Error("Control set not found");
      }

      const insertData = controlsData.map((data) => {
        const controlData: any = {
          control_set_id: controlSetId,
          control_code: data.control_code,
          title: data.title,
          description: data.description,
          control_type: data.control_type,
          frequency: data.frequency,
          process_area: data.process_area,
          testing_procedure: data.testing_procedure,
          evidence_requirements: data.evidence_requirements,
          effectiveness: data.effectiveness || "not_tested",
          is_automated: data.is_automated,
          ai_generated: true, // Mark as AI generated for bulk creation
          created_by: user.id,
          is_deleted: false,
        };

        // Add optional fields
        if (controlSet.audit_id) {
          controlData.audit_id = controlSet.audit_id;
        }

        if (data.owner_id && !isEmpty(data.owner_id) && isValidUUID(data.owner_id)) {
          controlData.owner_id = data.owner_id;
        }

        if (data.last_tested_date && !isEmpty(data.last_tested_date)) {
          controlData.last_tested_date = data.last_tested_date;
        }

        if (data.next_test_date && !isEmpty(data.next_test_date)) {
          controlData.next_test_date = data.next_test_date;
        }

        return controlData;
      });

      const { data: controls, error } = await supabase
        .from("controls")
        .insert(insertData)
        .select("*");

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return controls as Control[];
    } catch (error) {
      console.error("Error creating multiple controls:", error);
      throw error;
    }
  }

  async updateControl(id: string, data: Partial<ControlFormData>): Promise<Control> {
    try {
      // Validate ID
      if (!isValidUUID(id)) {
        throw new Error("Invalid control ID format");
      }

      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Validate owner_id if provided
      if (data.owner_id && !isEmpty(data.owner_id) && !isValidUUID(data.owner_id)) {
        throw new Error("Invalid owner_id format");
      }

      const { data: control, error } = await supabase
        .from("controls")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return control as Control;
    } catch (error) {
      console.error("Error updating control:", error);
      throw error;
    }
  }

  async deleteControl(id: string): Promise<void> {
    try {
      // Validate ID
      if (!isValidUUID(id)) {
        throw new Error("Invalid control ID format");
      }

      // Soft delete the control
      const { error } = await supabase
        .from("controls")
        .update({ is_deleted: true })
        .eq("id", id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting control:", error);
      throw error;
    }
  }

  async getControlsBySet(controlSetId: string): Promise<Control[]> {
    try {
      // Validate control set ID
      if (!isValidUUID(controlSetId)) {
        throw new Error("Invalid control set ID format");
      }

      const { data, error } = await supabase
        .from("controls")
        .select("*")
        .eq("control_set_id", controlSetId)
        .eq("is_deleted", false)
        .order("control_code", { ascending: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data as Control[];
    } catch (error) {
      console.error("Error fetching controls:", error);
      throw error;
    }
  }

  async getControl(id: string): Promise<Control | null> {
    try {
      // Validate ID
      if (!isValidUUID(id)) {
        throw new Error("Invalid control ID format");
      }

      const { data, error } = await supabase
        .from("controls")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return data as Control;
    } catch (error) {
      console.error("Error fetching control:", error);
      throw error;
    }
  }

  // AI Generation method (simplified)
  async generateControlsWithAI(
    controlSetId: string,
    options: {
      framework: string;
      processArea: string;
      count: number;
      provider?: string;
      model?: string;
    }
  ): Promise<Control[]> {
    try {
      // Validate control set ID
      if (!isValidUUID(controlSetId)) {
        throw new Error("Invalid control set ID format");
      }

      // This is a placeholder - you would implement actual AI generation here
      // For now, return sample generated controls
      const sampleControls: ControlFormData[] = Array.from({ length: options.count }, (_, index) => ({
        control_code: `${options.framework}-${String(index + 1).padStart(3, '0')}`,
        title: `AI Generated Control ${index + 1}`,
        description: `This is an AI-generated control for ${options.processArea} in ${options.framework} framework.`,
        control_type: ['preventive', 'detective', 'corrective', 'directive'][index % 4] as any,
        frequency: ['monthly', 'quarterly', 'annually'][index % 3] as any,
        process_area: options.processArea,
        testing_procedure: `Test this control by reviewing ${options.processArea} procedures.`,
        evidence_requirements: `Evidence required: Documentation, logs, and reports related to ${options.processArea}.`,
        effectiveness: 'not_tested' as any,
        is_automated: Math.random() > 0.5,
      }));

      return await this.createMultipleControls(controlSetId, sampleControls);
    } catch (error) {
      console.error("Error generating controls with AI:", error);
      throw error;
    }
  }

  // Search controls across all control sets
  async searchControls(query: string, filters?: {
    control_type?: string;
    effectiveness?: string;
    framework?: string;
    audit_id?: string;
  }): Promise<Control[]> {
    try {
      let queryBuilder = supabase
        .from("controls")
        .select(`
          *,
          control_sets!inner(name, framework, audit_id)
        `)
        .eq("is_deleted", false)
        .ilike("title", `%${query}%`);

      if (filters?.control_type) {
        queryBuilder = queryBuilder.eq("control_type", filters.control_type);
      }

      if (filters?.effectiveness) {
        queryBuilder = queryBuilder.eq("effectiveness", filters.effectiveness);
      }

      if (filters?.framework) {
        queryBuilder = queryBuilder.eq("control_sets.framework", filters.framework);
      }

      if (filters?.audit_id && isValidUUID(filters.audit_id)) {
        queryBuilder = queryBuilder.eq("control_sets.audit_id", filters.audit_id);
      }

      const { data, error } = await queryBuilder
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data as Control[];
    } catch (error) {
      console.error("Error searching controls:", error);
      throw error;
    }
  }

  // Get control statistics
  async getControlStats(auditId?: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byEffectiveness: Record<string, number>;
    byFramework: Record<string, number>;
  }> {
    try {
      let query = supabase
        .from("controls")
        .select(`
          control_type,
          effectiveness,
          control_sets!inner(framework, audit_id)
        `)
        .eq("is_deleted", false);

      if (auditId && isValidUUID(auditId)) {
        query = query.eq("control_sets.audit_id", auditId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const stats = {
        total: data.length,
        byType: {} as Record<string, number>,
        byEffectiveness: {} as Record<string, number>,
        byFramework: {} as Record<string, number>,
      };

      data.forEach((control: any) => {
        // Count by type
        stats.byType[control.control_type] = (stats.byType[control.control_type] || 0) + 1;

        // Count by effectiveness
        stats.byEffectiveness[control.effectiveness] = (stats.byEffectiveness[control.effectiveness] || 0) + 1;

        // Count by framework
        const framework = control.control_sets?.framework;
        if (framework) {
          stats.byFramework[framework] = (stats.byFramework[framework] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting control stats:", error);
      throw error;
    }
  }
}

export const controlService = new ControlService();
