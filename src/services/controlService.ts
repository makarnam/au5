import { supabase } from "../lib/supabase";
import { ControlSet, Control, ControlFormData } from "../types";

interface CreateControlSetData {
  audit_id?: string;
  name: string;
  description: string;
  framework: string;
}

interface UpdateControlSetData {
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
  [key: string]: any;
}

// Utility function to validate UUID
function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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
      if (
        data.audit_id &&
        !isEmpty(data.audit_id) &&
        !isValidUUID(data.audit_id)
      ) {
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
      if (
        data.audit_id &&
        !isEmpty(data.audit_id) &&
        isValidUUID(data.audit_id)
      ) {
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

  async updateControlSet(
    id: string,
    data: UpdateControlSetData,
  ): Promise<ControlSet> {
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

  async getAllControlSets(): Promise<ControlSet[]> {
    try {
      const { data, error } = await supabase
        .from("control_sets")
        .select(
          `
          *,
          controls(
            id,
            effectiveness,
            is_deleted
          )
        `,
        )
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Calculate statistics for each control set
      const controlSetsWithStats = (data || []).map((set: any) => {
        const controls = set.controls?.filter((c: any) => !c.is_deleted) || [];
        const total_controls = controls.length;
        const tested_controls = controls.filter(
          (c: any) => c.effectiveness && c.effectiveness !== "not_tested",
        ).length;
        const effective_controls = controls.filter(
          (c: any) => c.effectiveness === "effective",
        ).length;

        // Remove the controls array from the response and add calculated fields
        const { controls: _, ...controlSet } = set;
        return {
          ...controlSet,
          total_controls,
          tested_controls,
          effective_controls,
        };
      });

      return controlSetsWithStats as ControlSet[];
    } catch (error) {
      console.error("Error fetching control sets:", error);
      throw error;
    }
  }

  async getControlSetsByAudit(auditId?: string): Promise<ControlSet[]> {
    try {
      let query = supabase
        .from("control_sets")
        .select(
          `
          *,
          controls(
            id,
            effectiveness,
            is_deleted
          )
        `,
        )
        .eq("is_deleted", false);

      // Only filter by audit_id if it's provided and valid
      if (auditId && !isEmpty(auditId) && isValidUUID(auditId)) {
        query = query.eq("audit_id", auditId);
      } else if (isEmpty(auditId)) {
        // If auditId is empty, get all control sets (or filter by null audit_id)
        query = query.is("audit_id", null);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Calculate statistics for each control set
      const controlSetsWithStats = (data || []).map((set: any) => {
        const controls = set.controls?.filter((c: any) => !c.is_deleted) || [];
        const total_controls = controls.length;
        const tested_controls = controls.filter(
          (c: any) => c.effectiveness && c.effectiveness !== "not_tested",
        ).length;
        const effective_controls = controls.filter(
          (c: any) => c.effectiveness === "effective",
        ).length;

        // Remove the controls array from the response and add calculated fields
        const { controls: _, ...controlSet } = set;
        return {
          ...controlSet,
          total_controls,
          tested_controls,
          effective_controls,
        };
      });

      return controlSetsWithStats as ControlSet[];
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
        .select(
          `
          *,
          controls(
            id,
            effectiveness,
            is_deleted
          )
        `,
        )
        .eq("id", id)
        .eq("is_deleted", false)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      // Calculate statistics
      const controls = data?.controls?.filter((c: any) => !c.is_deleted) || [];
      const total_controls = controls.length;
      const tested_controls = controls.filter(
        (c: any) => c.effectiveness && c.effectiveness !== "not_tested",
      ).length;
      const effective_controls = controls.filter(
        (c: any) => c.effectiveness === "effective",
      ).length;

      // Remove the controls array from the response and add calculated fields
      const { controls: _, ...controlSet } = data || {};
      return {
        ...controlSet,
        total_controls,
        tested_controls,
        effective_controls,
      } as ControlSet;
    } catch (error) {
      console.error("Error fetching control set:", error);
      throw error;
    }
  }

  async createControl(
    controlSetId: string,
    data: ControlFormData,
  ): Promise<Control> {
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

      console.log("Creating control with user ID:", user.id);

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
        is_automated: data.is_automated || false,
        ai_generated: false,
        created_by: user.id,
        is_deleted: false,
      };

      // Add optional fields if they exist and are valid
      if (controlSet.audit_id) {
        insertData.audit_id = controlSet.audit_id;
      }

      if (
        data.owner_id &&
        !isEmpty(data.owner_id) &&
        isValidUUID(data.owner_id)
      ) {
        insertData.owner_id = data.owner_id;
      }

      if (data.last_tested_date && !isEmpty(data.last_tested_date)) {
        insertData.last_tested_date = data.last_tested_date;
      }

      if (data.next_test_date && !isEmpty(data.next_test_date)) {
        insertData.next_test_date = data.next_test_date;
      }

      console.log("Insert data for control:", insertData);

      const { data: control, error } = await supabase
        .from("controls")
        .insert(insertData)
        .select("*")
        .single();

      if (error) {
        console.error("Detailed Supabase error:", error);

        // Check if it's an RLS policy error
        if (error.message.includes("row-level security policy")) {
          throw new Error(
            `RLS Policy Error: Unable to create control. This might be due to database permissions. ` +
              `Error details: ${error.message}. ` +
              `Please check that the user has proper permissions or contact your system administrator.`,
          );
        }

        throw new Error(`Database error: ${error.message}`);
      }

      return control as Control;
    } catch (error) {
      console.error("Error creating control:", error);
      throw error;
    }
  }

  async createMultipleControls(
    controlSetId: string,
    controlsData: ControlFormData[],
  ): Promise<Control[]> {
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

        if (
          data.owner_id &&
          !isEmpty(data.owner_id) &&
          isValidUUID(data.owner_id)
        ) {
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

  async updateControl(
    id: string,
    data: Partial<ControlFormData>,
  ): Promise<Control> {
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
      if (
        data.owner_id &&
        !isEmpty(data.owner_id) &&
        !isValidUUID(data.owner_id)
      ) {
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

  private async updateControlSetCounts(controlSetId: string): Promise<void> {
    try {
      if (!isValidUUID(controlSetId)) {
        return; // Skip if invalid ID
      }

      const { count, error } = await supabase
        .from("controls")
        .select("*", { count: "exact", head: true })
        .eq("control_set_id", controlSetId)
        .eq("is_deleted", false);

      if (!error) {
        await supabase
          .from("control_sets")
          .update({ controls_count: count || 0 })
          .eq("id", controlSetId);
      }
    } catch (error) {
      console.error("Error updating control set counts:", error);
      // Don't throw error as this is a background operation
    }
  }

  // AI Generation method for generating control data without saving to database
  async generateControlsWithAI(
    controlSetId: string | null,
    options: {
      framework: string;
      processArea: string;
      count: number;
      provider?: string;
      model?: string;
      prompt?: string;
    },
  ): Promise<Control[]> {
    try {
      // If controlSetId is provided and not null, validate it
      if (
        controlSetId &&
        controlSetId !== "temp" &&
        !isValidUUID(controlSetId)
      ) {
        throw new Error("Invalid control set ID format");
      }

      // Import AI service
      const { aiService } = await import("./aiService");

      let generatedControls: ControlFormData[] = [];

      // Try to use AI service if provider is specified
      if (options.provider && options.model) {
        try {
          const prompt =
            options.prompt || this.buildControlGenerationPrompt(options);

          const aiResponse = await aiService.generateContent({
            prompt,
            provider: options.provider as any,
            model: options.model,
            context: `Generate security controls for ${options.framework} compliance in ${options.processArea}`,
            fieldType: "description" as any,
            auditData: {
              title: `Security Control Generation`,
              audit_type: "control_generation",
              business_unit: options.processArea,
              scope: `Security controls for ${options.framework}`,
            },
            temperature: 0.3,
            maxTokens: 3000,
          });

          if (aiResponse.success && aiResponse.content) {
            generatedControls = this.parseAIGeneratedControls(
              aiResponse.content,
              options,
            );
          }
        } catch (aiError) {
          console.warn(
            "AI generation failed, falling back to sample controls:",
            aiError,
          );
        }
      }

      // Fallback to framework-specific template controls if AI generation failed
      if (generatedControls.length === 0) {
        generatedControls = this.createFrameworkSpecificControls(options);
      }

      // If we have a valid control set ID, save the controls to database
      if (
        controlSetId &&
        controlSetId !== "temp" &&
        isValidUUID(controlSetId)
      ) {
        return await this.createMultipleControls(
          controlSetId,
          generatedControls,
        );
      }

      // Otherwise, return the control data as mock Control objects
      return generatedControls.map((control, index) => ({
        id: `temp-${index}`,
        control_set_id: controlSetId || "temp",
        created_by: "temp-user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        ...control,
      })) as Control[];
    } catch (error) {
      console.error("Error generating controls with AI:", error);
      throw error;
    }
  }

  private buildControlGenerationPrompt(options: {
    framework: string;
    processArea: string;
    count: number;
  }): string {
    const frameworkTemplates = this.getFrameworkSpecificControls(
      options.framework,
    );

    return `You are a compliance and risk management expert specializing in ${options.framework}. Generate ${options.count} specific, implementable internal controls for ${options.framework} compliance in the ${options.processArea} process area.

IMPORTANT: Generate actual operational controls that organizations implement, not audit procedures or descriptions.

Context:
- Framework: ${options.framework}
- Process Area: ${options.processArea}
- Required Controls: ${options.count}

For each control, provide realistic and practical controls that address real business risks. Base your controls on industry best practices and actual ${options.framework} requirements.

Return ONLY a valid JSON array with this exact structure:

[
  {
    "control_code": "${this.generateControlCode(options.framework, 1)}",
    "title": "Specific Control Title",
    "description": "Detailed description of what the control does, how it works, and what it protects against. Include specific procedures and requirements.",
    "control_type": "preventive",
    "frequency": "monthly",
    "process_area": "${options.processArea}",
    "testing_procedure": "Specific steps to test this control including sampling methods, documentation review, and validation procedures.",
    "evidence_requirements": "Specific evidence auditors should collect: documents, reports, logs, approvals, screenshots, etc.",
    "is_automated": false
  }
]

Control Type Options (use exactly these values):
- "preventive": Prevents issues before they occur
- "detective": Detects issues after they occur
- "corrective": Corrects issues after detection
- "directive": Provides guidance and direction

Frequency Options (use exactly these values):
- "continuous": Real-time/automated monitoring
- "daily": Daily execution/review
- "weekly": Weekly execution/review
- "monthly": Monthly execution/review
- "quarterly": Quarterly execution/review
- "annually": Annual execution/review

Example controls for reference:
${frameworkTemplates.map((template) => `- ${template.title}: ${template.description.substring(0, 100)}...`).join("\n")}

Generate controls that are:
1. Specific to ${options.processArea} and ${options.framework}
2. Implementable by real organizations
3. Address actual business risks
4. Include clear testing procedures
5. Specify realistic evidence requirements

RETURN ONLY THE JSON ARRAY - NO ADDITIONAL TEXT OR FORMATTING.`;
  }

  private generateControlCode(framework: string, index: number): string {
    const frameworkCode =
      framework.replace(/[^A-Z]/g, "").substring(0, 3) ||
      framework.replace(/\s+/g, "").substring(0, 3).toUpperCase();
    return `${frameworkCode}-${String(index).padStart(3, "0")}`;
  }

  private getFrameworkSpecificControls(framework: string): any[] {
    const controlTemplates: { [key: string]: any[] } = {
      "ISO 27001": [
        {
          title: "Information Security Policy Management",
          description:
            "Establish, implement, maintain and continually improve an information security management system including policies approved by management.",
          control_type: "directive",
          frequency: "annually",
        },
        {
          title: "Access Rights Management",
          description:
            "Implement formal user access provisioning process to assign access rights for all user types to all systems and services.",
          control_type: "preventive",
          frequency: "monthly",
        },
        {
          title: "Vulnerability Management",
          description:
            "Establish process to identify technical vulnerabilities and take appropriate measures to address associated information security risks.",
          control_type: "detective",
          frequency: "weekly",
        },
      ],
      SOX: [
        {
          title: "Financial Reporting Controls",
          description:
            "Implement controls to ensure accuracy and completeness of financial data used in periodic reporting.",
          control_type: "preventive",
          frequency: "monthly",
        },
        {
          title: "Management Review and Approval",
          description:
            "Require appropriate management review and approval of significant financial transactions and journal entries.",
          control_type: "preventive",
          frequency: "daily",
        },
        {
          title: "Segregation of Duties",
          description:
            "Establish appropriate segregation of duties for financial processes to prevent errors and fraud.",
          control_type: "preventive",
          frequency: "continuous",
        },
      ],
      GDPR: [
        {
          title: "Data Processing Lawfulness",
          description:
            "Ensure all personal data processing has a lawful basis and document the basis for each processing activity.",
          control_type: "directive",
          frequency: "continuous",
        },
        {
          title: "Data Subject Rights Management",
          description:
            "Implement procedures to handle data subject requests for access, rectification, erasure, and portability.",
          control_type: "corrective",
          frequency: "continuous",
        },
        {
          title: "Privacy Impact Assessments",
          description:
            "Conduct privacy impact assessments for processing activities that pose high risks to data subjects.",
          control_type: "preventive",
          frequency: "adhoc",
        },
      ],
      NIST: [
        {
          title: "Asset Inventory Management",
          description:
            "Maintain accurate inventory of all hardware, software, and data assets within the organization.",
          control_type: "detective",
          frequency: "monthly",
        },
        {
          title: "Incident Response Planning",
          description:
            "Develop, maintain, and test incident response plans to handle cybersecurity incidents effectively.",
          control_type: "corrective",
          frequency: "quarterly",
        },
        {
          title: "Security Awareness Training",
          description:
            "Provide regular cybersecurity awareness training to all personnel to reduce human-related risks.",
          control_type: "preventive",
          frequency: "annually",
        },
      ],
    };

    return controlTemplates[framework] || controlTemplates["ISO 27001"];
  }

  private parseAIGeneratedControls(
    aiContent: string,
    options: { framework: string; processArea: string },
  ): ControlFormData[] {
    try {
      console.log("Raw AI response:", aiContent);
      console.log("Response length:", aiContent.length);
      console.log(
        "Framework:",
        options.framework,
        "Process Area:",
        options.processArea,
      );

      // Check if AI returned audit content instead of controls
      const auditKeywords = [
        "audit description",
        "purpose of this audit",
        "scope of this audit",
        "audit will be conducted",
        "evaluation of",
        "assessment of",
        "examination of",
      ];

      const hasAuditContent = auditKeywords.some((keyword) =>
        aiContent.toLowerCase().includes(keyword.toLowerCase()),
      );

      if (hasAuditContent) {
        console.warn(
          "AI returned audit content instead of controls, using fallbacks",
        );
        console.log(
          "Detected audit keywords:",
          auditKeywords.filter((keyword) =>
            aiContent.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );
        return this.createFallbackControls(options);
      }

      // Clean the response and try multiple parsing strategies
      let controls: any[] = [];

      // Strategy 1: Try to find JSON array in the response
      const jsonArrayMatch = aiContent.match(/\[[\s\S]*?\]/);
      if (jsonArrayMatch) {
        try {
          console.log(
            "Found JSON array match:",
            jsonArrayMatch[0].substring(0, 200) + "...",
          );
          controls = JSON.parse(jsonArrayMatch[0]);
          console.log(
            "Successfully parsed JSON array:",
            controls.length,
            "controls",
          );
        } catch (parseError) {
          console.warn("Failed to parse JSON array:", parseError);
          console.log("JSON that failed to parse:", jsonArrayMatch[0]);
        }
      }

      // Strategy 2: Try to find JSON objects and create array
      if (controls.length === 0) {
        console.log("Strategy 1 failed, trying Strategy 2: JSON objects");
        const jsonObjectMatches = aiContent.match(
          /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,
        );
        if (jsonObjectMatches) {
          try {
            console.log(
              "Found",
              jsonObjectMatches.length,
              "JSON object matches",
            );
            controls = jsonObjectMatches.map((match) => JSON.parse(match));
            console.log(
              "Successfully parsed JSON objects:",
              controls.length,
              "controls",
            );
          } catch (parseError) {
            console.warn("Failed to parse JSON objects:", parseError);
          }
        }
      }

      // Strategy 3: Extract structured text and convert to objects
      if (controls.length === 0) {
        console.log(
          "Strategies 1-2 failed, trying Strategy 3: structured text parsing",
        );
        controls = this.parseStructuredText(aiContent, options);
        console.log(
          "Structured text parsing result:",
          controls.length,
          "controls",
        );
      }

      // If still no controls, create fallback controls
      if (controls.length === 0) {
        console.warn(
          "All parsing strategies failed, creating fallback controls",
        );
        controls = this.createFallbackControls(options);
        console.log("Created fallback controls:", controls.length, "controls");
      }

      return controls.map((control: any, index: number) => ({
        control_code:
          control.control_code ||
          `${options.framework.replace(/\s+/g, "")}-${String(index + 1).padStart(3, "0")}`,
        title: control.title || `Generated Control ${index + 1}`,
        description:
          control.description || `Control for ${options.processArea}`,
        control_type: (this.validateControlType(control.control_type) ||
          "preventive") as any,
        frequency: (this.validateFrequency(control.frequency) ||
          "monthly") as any,
        process_area: control.process_area || options.processArea,
        testing_procedure:
          control.testing_procedure || "Manual testing required",
        evidence_requirements:
          control.evidence_requirements || "Documentation and records",
        effectiveness: "not_tested" as any,
        is_automated: Boolean(control.is_automated),
      }));
    } catch (error) {
      console.warn("Failed to parse AI generated controls:", error);
      // Return fallback controls instead of empty array
      return this.createFallbackControls(options);
    }
  }

  private parseStructuredText(
    aiContent: string,
    options: { framework: string; processArea: string },
  ): any[] {
    const controls: any[] = [];

    // Split by common delimiters or numbered items
    const sections = aiContent.split(/(?:\n\s*(?:\d+\.|\*|-|•)|\n\n)/);

    for (const section of sections) {
      if (section.trim().length < 20) continue; // Skip short sections

      const control = {
        title:
          this.extractField(section, ["title", "name", "control"]) ||
          `${options.framework} Control`,
        description:
          this.extractField(section, ["description", "desc", "purpose"]) ||
          section.trim().substring(0, 200),
        control_type: (this.extractField(section, ["type", "control_type"]) ||
          "preventive") as any,
        frequency: (this.extractField(section, ["frequency", "freq"]) ||
          "monthly") as any,
        testing_procedure:
          this.extractField(section, ["testing", "test", "procedure"]) ||
          "Manual review and testing required",
        evidence_requirements:
          this.extractField(section, ["evidence", "documentation"]) ||
          "Documentation and records required",
        is_automated: section.toLowerCase().includes("automat"),
      };

      controls.push(control);
    }

    return controls.slice(0, 10); // Limit to 10 controls
  }

  private extractField(text: string, fieldNames: string[]): string | null {
    for (const fieldName of fieldNames) {
      const regex = new RegExp(`${fieldName}[:\\-]?\\s*([^\\n]+)`, "i");
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  private createFallbackControls(options: {
    framework: string;
    processArea: string;
  }): any[] {
    const frameworkCode = options.framework.replace(/\s+/g, "");
    return [
      {
        control_code: `${frameworkCode}-001`,
        title: `${options.framework} Access Control Management`,
        description: `Implement role-based access controls for ${options.processArea} to ensure only authorized personnel can access sensitive systems and data based on their job responsibilities.`,
        control_type: "preventive" as any,
        frequency: "monthly" as any,
        process_area: options.processArea,
        testing_procedure:
          "Review user access lists, permissions, and conduct access certification quarterly",
        evidence_requirements:
          "Access control matrix, user access reviews, role definitions, and authorization documentation",
        is_automated: true,
      },
      {
        control_code: `${frameworkCode}-002`,
        title: `${options.framework} Data Protection and Encryption`,
        description: `Establish comprehensive data protection measures for ${options.processArea} including encryption of data at rest and in transit, and secure backup procedures.`,
        control_type: "preventive" as any,
        frequency: "quarterly" as any,
        process_area: options.processArea,
        testing_procedure:
          "Test data encryption implementation, key management, and backup restoration procedures",
        evidence_requirements:
          "Encryption certificates, key management logs, backup test results, and data classification records",
        is_automated: false,
      },
      {
        control_code: `${frameworkCode}-003`,
        title: `${options.framework} Security Monitoring and Incident Detection`,
        description: `Implement comprehensive security monitoring and logging for ${options.processArea} activities to detect and respond to security incidents promptly.`,
        control_type: "detective" as any,
        frequency: "continuous" as any,
        process_area: options.processArea,
        testing_procedure:
          "Review log completeness, monitoring effectiveness, and incident response procedures",
        evidence_requirements:
          "Security logs, monitoring dashboards, incident reports, and SIEM configuration documentation",
        is_automated: true,
      },
      {
        control_code: `${frameworkCode}-004`,
        title: `${options.framework} Vulnerability Management`,
        description: `Establish regular vulnerability assessments and patch management procedures for ${options.processArea} systems to maintain security posture.`,
        control_type: "corrective" as any,
        frequency: "monthly" as any,
        process_area: options.processArea,
        testing_procedure:
          "Review vulnerability scan results, patch deployment status, and remediation timelines",
        evidence_requirements:
          "Vulnerability scan reports, patch management logs, remediation tracking, and security testing results",
        is_automated: true,
      },
      {
        control_code: `${frameworkCode}-005`,
        title: `${options.framework} Security Awareness and Training`,
        description: `Provide regular security awareness training to all personnel involved in ${options.processArea} to ensure understanding of security policies and procedures.`,
        control_type: "directive" as any,
        frequency: "annually" as any,
        process_area: options.processArea,
        testing_procedure:
          "Review training completion rates, conduct security awareness assessments, and evaluate training effectiveness",
        evidence_requirements:
          "Training completion records, assessment results, training materials, and security incident trends",
        is_automated: false,
      },
    ];
  }

  private createFrameworkSpecificControls(options: {
    framework: string;
    processArea: string;
    count: number;
  }): ControlFormData[] {
    const templates = this.getFrameworkSpecificControls(options.framework);
    const frameworkCode = this.generateControlCode(options.framework, 1).split(
      "-",
    )[0];

    const controls: ControlFormData[] = [];

    // Use templates and extend if needed
    for (let i = 0; i < options.count; i++) {
      const template = templates[i % templates.length];
      const control: ControlFormData = {
        control_code: `${frameworkCode}-${String(i + 1).padStart(3, "0")}`,
        title: template.title,
        description: `${template.description} This control is specifically designed for ${options.processArea} operations within ${options.framework} compliance requirements.`,
        control_type: template.control_type as any,
        frequency: template.frequency as any,
        process_area: options.processArea,
        testing_procedure: `Review and validate ${template.title.toLowerCase()} implementation through documentation review, system testing, and process walkthrough. Sample relevant transactions and verify compliance with ${options.framework} requirements.`,
        evidence_requirements: `Documentation of ${template.title.toLowerCase()}, implementation evidence, testing results, management sign-offs, and compliance reports related to ${options.processArea}.`,
        effectiveness: "not_tested" as any,
        is_automated:
          template.frequency === "continuous" || template.frequency === "daily",
      };
      controls.push(control);
    }

    return controls;
  }

  private validateControlType(type: string): string | null {
    const validTypes = ["preventive", "detective", "corrective", "directive"];
    return validTypes.includes(type) ? type : null;
  }

  private validateFrequency(frequency: string): string | null {
    const validFrequencies = [
      "continuous",
      "daily",
      "weekly",
      "monthly",
      "quarterly",
      "annually",
    ];
    return validFrequencies.includes(frequency) ? frequency : null;
  }

  // Search controls across all control sets
  async searchControls(
    query: string,
    filters?: {
      control_type?: string;
      effectiveness?: string;
      framework?: string;
      audit_id?: string;
    },
  ): Promise<Control[]> {
    try {
      let queryBuilder = supabase
        .from("controls")
        .select(
          `
          *,
          control_sets!inner(name, framework, audit_id)
        `,
        )
        .eq("is_deleted", false)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,control_code.ilike.%${query}%`,
        );

      if (filters?.control_type) {
        queryBuilder = queryBuilder.eq("control_type", filters.control_type);
      }

      if (filters?.effectiveness) {
        queryBuilder = queryBuilder.eq("effectiveness", filters.effectiveness);
      }

      if (filters?.framework) {
        queryBuilder = queryBuilder.eq(
          "control_sets.framework",
          filters.framework,
        );
      }

      if (filters?.audit_id && isValidUUID(filters.audit_id)) {
        queryBuilder = queryBuilder.eq(
          "control_sets.audit_id",
          filters.audit_id,
        );
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
        .select(
          `
          control_type,
          effectiveness,
          control_sets!inner(framework, audit_id)
        `,
        )
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
        stats.byType[control.control_type] =
          (stats.byType[control.control_type] || 0) + 1;

        // Count by effectiveness
        stats.byEffectiveness[control.effectiveness] =
          (stats.byEffectiveness[control.effectiveness] || 0) + 1;

        // Count by framework
        const framework = control.control_sets?.framework;
        if (framework) {
          stats.byFramework[framework] =
            (stats.byFramework[framework] || 0) + 1;
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
