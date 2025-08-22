import { supabase } from "../lib/supabase";

export interface AIProvider {
  id: string;
  name: string;
  type: "ollama" | "openai" | "claude" | "gemini";
  description: string;
  requiresApiKey: boolean;
  models: string[];
  defaultModel: string;
}

export interface AIConfiguration {
  id?: string;
  provider: string;
  model_name: string;
  api_endpoint?: string;
  api_key?: string;
  temperature: number;
  max_tokens: number;
  created_by: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed fields for backward compatibility
  model?: string;
  baseUrl?: string;
}

export interface AITemplate {
  id: string;
  name: string;
  description: string;
  field_type: string;
  template_content: string;
  industry?: string;
  framework?: string;
  context_variables: Record<string, string>;
  is_active: boolean;
  is_default: boolean;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateSelectionCriteria {
  fieldType: string;
  industry?: string;
  framework?: string;
  auditType?: string;
  businessUnit?: string;
}

export interface AIGenerationRequest {
  provider: string;
  model: string;
  prompt: string;
  context: string;
  fieldType:
    | "description"
    | "objectives"
    | "scope"
    | "methodology"
    | "control_set_description"
    | "control_generation"
    | "dpia_description"
    | "dpia_risk_assessment"
    | "ropa_purpose"
    | "ropa_legal_basis"
    | "policy_content"
    | "policy_title"
    | "policy_description"
    | "policy_scope"
    | "policy_version_summary"
    | "compliance_mapping"
    | "policy_template"
    | "incident_response"
    | "esg_program"
    | "bcp_plan"
    | "bcp_description"
    | "bcp_scope"
    | "bcp_business_impact_analysis"
    | "bcp_risk_assessment"
    | "bcp_recovery_strategies"
    | "bcp_resource_requirements"
    | "bcp_communication_plan"
    | "bcp_testing_schedule"
    | "bcp_maintenance_schedule"
    | "bcp_critical_function_description"
    | "bcp_recovery_strategy"
    | "bcp_testing_scenario"
    | "vendor_assessment"
    | "vendor_due_diligence_report"
    | "vendor_contract_risk_analysis"
    | "vendor_risk_scoring"
    | "vendor_assessment_criteria"
    | "vendor_monitoring_plan"
    | "vendor_incident_response"
    | "vendor_performance_evaluation"
    | "vendor_compliance_assessment"
    | "vendor_financial_analysis"
    | "vendor_security_assessment"
    | "vendor_operational_assessment"
    | "security_policy"
    | "vulnerability_assessment_report"
    | "security_incident_response_plan"
    | "security_controls_mapping"
    | "security_framework_compliance"
    | "security_policy_description"
    | "security_policy_scope"
    | "security_policy_procedures"
    | "security_policy_roles"
    | "security_policy_incident_response"
    | "security_policy_access_control"
    | "security_policy_data_protection"
    | "training_program"
    | "training_description"
    | "learning_objectives"
    | "assessment_criteria"
    | "training_materials"
    | "training_schedule"
    | "certification_requirements"
    | "training_evaluation"
    | "competency_mapping"
    | "training_effectiveness"
    | "compliance_training"
    | "skill_development_plan"
    | "finding_description"
    | "finding_analysis"
    | "finding_impact"
    | "finding_recommendations"
    | "finding_action_plan"
    | "finding_risk_assessment"
    | "finding_root_cause"
    | "finding_evidence"
    | "finding_priority"
    | "finding_timeline"
    | "finding_assignee"
    | "finding_follow_up"
    | "resilience_assessment"
    | "resilience_strategy"
    | "crisis_management_plan"
    | "business_impact_analysis"
    | "recovery_strategies"
    | "resilience_metrics"
    | "scenario_analysis"
    | "resilience_framework"
    | "capacity_assessment"
    | "adaptability_plan"
    | "resilience_monitoring"
    | "continuous_improvement"
    | "supply_chain_risk"
    | "supply_chain_risk_assessment"
    | "vendor_evaluation_criteria"
    | "risk_mitigation_strategies"
    | "supply_chain_mapping"
    | "vendor_tier_classification"
    | "risk_propagation_analysis"
    | "supply_chain_resilience_scoring"
    | "disruption_response_plan"
    | "supplier_development_program"
    | "performance_monitoring_framework"
    | "compliance_assessment_criteria"
    | "financial_stability_analysis";
  auditData: {
    title?: string;
    audit_type?: string;
    business_unit?: string;
    scope?: string;
  };
  controlSetData?: {
    name?: string;
    framework?: string;
    audit_title?: string;
    audit_type?: string;
  };
  privacyData?: {
    title?: string;
    type?: "dpia" | "ropa";
    industry?: string;
    data_subjects?: string[];
    data_categories?: string[];
    risk_level?: string;
  };
  templateId?: string; // New field for template selection
  industry?: string; // New field for industry-specific templates
  framework?: string; // New field for framework-specific templates
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content: string;
  error?: string;
  tokensUsed?: number;
  model?: string;
  provider?: string;
}

class AIService {
  private static instance: AIService;
  private providers: AIProvider[] = [
    {
      id: "ollama",
      name: "Ollama (Local)",
      type: "ollama",
      description: "Local LLM server running on your machine",
      requiresApiKey: false,
      models: [
        "llama3.2",
        "llama3.1",
        "mistral",
        "codellama",
        "phi3",
        "gemma2",
      ],
      defaultModel: "llama3.2",
    },
    {
      id: "openai",
      name: "OpenAI GPT",
      type: "openai",
      description: "OpenAI GPT models via API",
      requiresApiKey: true,
      models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
      defaultModel: "gpt-4o-mini",
    },
    {
      id: "claude",
      name: "Anthropic Claude",
      type: "claude",
      description: "Anthropic Claude models via API",
      requiresApiKey: true,
      models: [
        "claude-3-5-sonnet-20241022",
        "claude-3-haiku-20240307",
        "claude-3-opus-20240229",
      ],
      defaultModel: "claude-3-5-sonnet-20241022",
    },
    {
      id: "gemini",
      name: "Google Gemini",
      type: "gemini",
      description: "Google Gemini models via API",
      requiresApiKey: true,
      models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
      defaultModel: "gemini-1.5-flash",
    },
  ];

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async getOllamaModels(
    baseUrl: string = "http://localhost:11434",
  ): Promise<string[]> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.warn("Failed to fetch Ollama models:", error);
      // Return default models as fallback
      return ["llama3.2", "llama3.1", "mistral", "codellama", "phi3", "gemma2"];
    }
  }

  getProviders(): AIProvider[] {
    return this.providers;
  }

  async getProviderWithLiveModels(
    providerId: string,
    baseUrl?: string,
  ): Promise<AIProvider | null> {
    const provider = this.providers.find((p) => p.id === providerId);
    if (!provider) return null;

    if (provider.type === "ollama") {
      const liveModels = await this.getOllamaModels(baseUrl);
      return {
        ...provider,
        models: liveModels.length > 0 ? liveModels : provider.models,
        defaultModel:
          liveModels.length > 0 ? liveModels[0] : provider.defaultModel,
      };
    }

    return provider;
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.find((p) => p.id === id);
  }

  async saveConfiguration(
    config: Omit<AIConfiguration, "id" | "created_at" | "updated_at">,
  ): Promise<AIConfiguration> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Check if configuration already exists for this user and provider
      const { data: existing } = await supabase
        .from("ai_configurations")
        .select("*")
        .eq("created_by", user.id)
        .eq("provider", config.provider)
        .single();

      let result;
      if (existing) {
        // Update existing configuration
        const { data, error } = await supabase
          .from("ai_configurations")
          .update({
            model_name: config.model_name,
            api_key: config.api_key,
            api_endpoint: config.api_endpoint,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
            is_active: config.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from("ai_configurations")
          .insert([
            {
              provider: config.provider,
              model_name: config.model_name,
              api_key: config.api_key,
              api_endpoint: config.api_endpoint,
              temperature: config.temperature,
              max_tokens: config.max_tokens,
              created_by: user.id,
              is_active: config.is_active,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        provider: result.provider,
        model_name: result.model_name,
        api_key: result.api_key,
        api_endpoint: result.api_endpoint,
        temperature: result.temperature,
        max_tokens: result.max_tokens,
        created_by: result.created_by,
        is_active: result.is_active,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
    } catch (error) {
      console.error("Error saving AI configuration:", error);
      throw error;
    }
  }

  // Read configurations with local fallback when user is not authenticated or DB unavailable.
  async getConfigurations(): Promise<AIConfiguration[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        // Fallback to localStorage configuration for unauthenticated sessions
        const raw = localStorage.getItem("ai_configurations_fallback");
        if (raw) {
          const parsed = JSON.parse(raw) as AIConfiguration[];
          return parsed.map((c) => ({
            ...c,
            model: c.model_name,
            baseUrl: c.api_endpoint,
            is_active: c.is_active ?? true,
            created_by: c.created_by || "local",
          }));
        }
        // Provide sensible defaults (Ollama local)
        const defaults: AIConfiguration[] = [
          {
            id: "local-ollama",
            provider: "ollama",
            model_name: "llama3.2",
            api_endpoint: "http://localhost:11434",
            temperature: 0.7,
            max_tokens: 500,
            created_by: "local",
            is_active: true,
            model: "llama3.2",
            baseUrl: "http://localhost:11434",
          },
        ];
        return defaults;
      }

      const { data, error } = await supabase
        .from("ai_configurations")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      return (data || []).map((config) => ({
        id: config.id,
        provider: config.provider,
        model_name: config.model_name,
        api_key: config.api_key,
        api_endpoint: config.api_endpoint,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        created_by: config.created_by,
        is_active: config.is_active,
        created_at: config.created_at,
        updated_at: config.updated_at,
        // Add computed fields for backward compatibility
        model: config.model_name,
        baseUrl: config.api_endpoint,
      }));
    } catch (error) {
      // On any error, return local fallback to keep UI working
      try {
        const raw = localStorage.getItem("ai_configurations_fallback");
        if (raw) {
          const parsed = JSON.parse(raw) as AIConfiguration[];
          return parsed.map((c) => ({
            ...c,
            model: c.model_name,
            baseUrl: c.api_endpoint,
            is_active: c.is_active ?? true,
            created_by: c.created_by || "local",
          }));
        }
      } catch {}
      console.error("Error fetching AI configurations:", error);
      return [
        {
          id: "local-ollama",
          provider: "ollama",
          model_name: "llama3.2",
          api_endpoint: "http://localhost:11434",
          temperature: 0.7,
          max_tokens: 500,
          created_by: "local",
          is_active: true,
          model: "llama3.2",
          baseUrl: "http://localhost:11434",
        },
      ];
    }
  }

  async testConnection(
    provider: string,
    model: string,
    apiKey?: string,
    baseUrl?: string,
  ): Promise<boolean> {
    try {
      const testRequest: AIGenerationRequest = {
        provider,
        model,
        prompt: "Test connection",
        context: "This is a test to verify the AI connection is working.",
        fieldType: "description",
        auditData: { title: "Test Audit" },
        temperature: 0.1,
        maxTokens: 50,
        apiKey,
        baseUrl,
      };

      const response = await this.generateContent(testRequest);
      return response.success;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const { fieldType, auditData, context, controlSetData } = request;

    let basePrompt = "";
    const auditInfo = `
Audit Information:
- Title: ${auditData.title || "Not specified"}
- Type: ${auditData.audit_type || "Not specified"}
- Business Unit: ${auditData.business_unit || "Not specified"}
- Existing Scope: ${auditData.scope || "Not specified"}
    `.trim();

    switch (fieldType) {
      case "description":
        basePrompt = `You are an expert audit professional. Generate a comprehensive audit description based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create a detailed, professional audit description
- Ensure the description is specifically relevant to "${auditData.title}"
- Include the purpose, scope overview, and key focus areas
- Use professional audit terminology
- Keep it between 100-300 words
- Make it specific to the audit type and business unit

Generate only the description text, no additional formatting or explanations.`;
        break;

      case "objectives":
        const auditTypeSpecificGuidance = this.getAuditTypeSpecificGuidance(
          auditData.audit_type || "internal",
        );

        basePrompt = `You are an expert audit professional with extensive experience in ${auditData.audit_type} audits. Generate specific, realistic audit objectives for "${auditData.title}" based on the following information:

${auditInfo}

Context: ${context}

Audit Type Specific Focus Areas:
${auditTypeSpecificGuidance}

Requirements:
- Create 4-6 specific, measurable audit objectives
- Each objective must be directly related to "${auditData.title}" and ${auditData.audit_type} audit type
- Objectives should be realistic, achievable, and follow professional audit standards
- Use action-oriented language (assess, evaluate, review, verify, test, examine, analyze, etc.)
- Include both compliance and operational effectiveness objectives
- Consider risk-based audit approach
- Make them specific to the business unit: ${auditData.business_unit}
- Each objective should be a complete, professional statement
- Focus on what auditors would realistically examine for this specific audit

Format: Return only the objectives as a clean JSON array of strings, no additional text or formatting.
Example: ["Assess the effectiveness of internal controls over financial reporting processes", "Evaluate compliance with regulatory requirements for data privacy", "Review the adequacy of risk management frameworks"]`;
        break;

      case "scope":
        basePrompt = `You are an expert audit professional. Generate a detailed audit scope based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Define what will be included and excluded in the audit
- Be specific to "${auditData.title}" and the business unit
- Include relevant systems, processes, locations, and time periods
- Mention key stakeholders and departments involved
- Keep it comprehensive but focused
- Use professional audit language

Generate only the scope text, no additional formatting or explanations.`;
        break;

      case "methodology":
        basePrompt = `You are an expert audit professional. Generate a comprehensive audit methodology based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Describe the audit approach and techniques to be used
- Include specific methods relevant to "${auditData.title}"
- Mention risk assessment, testing procedures, and evaluation criteria
- Include data collection methods and sampling techniques
- Reference relevant standards or frameworks if applicable
- Be specific to the audit type and business unit
- Keep it detailed but practical

Generate only the methodology text, no additional formatting or explanations.`;
        break;

      case "control_set_description":
        const controlSetInfo = controlSetData
          ? `
Control Set Information:
- Name: ${controlSetData.name || "Not specified"}
- Framework: ${controlSetData.framework || "Not specified"}
- Associated Audit: ${controlSetData.audit_title || "Not specified"}
- Audit Type: ${controlSetData.audit_type || "Not specified"}
        `.trim()
          : "";

        basePrompt = `You are an expert in governance, risk, and compliance (GRC) with extensive knowledge of control frameworks. Generate a comprehensive control set description based on the following information:

${controlSetInfo}

Context: ${context}

Requirements:
- Create a detailed, professional description for the control set "${controlSetData?.name}"
- The description should explain the purpose and scope of this control set
- Include what types of controls are typically included in this framework
- Explain how this control set helps with compliance and risk management
- Make it relevant to the framework: ${controlSetData?.framework}
- If associated with an audit, relate it to the audit context
- Use professional GRC and compliance terminology
- Keep it between 150-400 words
- Make it informative for auditors and compliance professionals

Generate only the description text, no additional formatting or explanations.`;
        break;

      case "control_generation":
        const controlSetInfoGen = controlSetData
          ? `
Control Set Information:
- Name: ${controlSetData.name || "Not specified"}
- Framework: ${controlSetData.framework || "Not specified"}
- Associated Audit: ${controlSetData.audit_title || "Not specified"}
- Audit Type: ${controlSetData.audit_type || "Not specified"}
        `.trim()
          : "";

        basePrompt = `You are an expert in governance, risk, and compliance (GRC) with extensive knowledge of control frameworks. Generate 5-6 specific, actionable controls for the control set "${controlSetData?.name}" based on the following information:

${controlSetInfoGen}

Context: ${context}

Requirements:
- Create 5-6 realistic, implementable controls
- Each control should be relevant to the ${controlSetData?.framework} framework
- Controls should be specific to the control set purpose
- Include a mix of preventive, detective, and corrective controls
- Use professional control language and terminology
- Each control should have a clear, actionable description
- Controls should address key risk areas for this framework
- Make them practical for real-world implementation

Format your response as a JSON array of objects with the following structure:
[
  {
    "control_code": "CC-001",
    "title": "Control Title",
    "description": "Detailed control description explaining what needs to be done",
    "control_type": "preventive|detective|corrective",
    "frequency": "continuous|daily|weekly|monthly|quarterly|annually",
    "process_area": "Relevant process area",
    "testing_procedure": "How to test this control",
    "evidence_requirements": "What evidence is needed to verify this control"
  }
]

Generate only the JSON array, no additional text or formatting.`;
        break;

      case "dpia_description":
        const dpiaInfo = request.privacyData
          ? `
DPIA Information:
- Title: ${request.privacyData.title || "Not specified"}
- Industry: ${request.privacyData.industry || "Not specified"}
- Data Subjects: ${request.privacyData.data_subjects?.join(", ") || "Not specified"}
- Data Categories: ${request.privacyData.data_categories?.join(", ") || "Not specified"}
- Risk Level: ${request.privacyData.risk_level || "Not specified"}
        `.trim()
          : "";

        basePrompt = `You are a privacy expert specializing in Data Protection Impact Assessments (DPIAs) and GDPR compliance. Generate a comprehensive DPIA description based on the following information:

${dpiaInfo}

Context: ${context}

Requirements:
- Create a detailed, professional DPIA description
- Ensure the description is specifically relevant to "${request.privacyData?.title}"
- Include the purpose, scope, and key privacy considerations
- Address the specific data subjects and categories mentioned
- Consider the industry context and risk level
- Use professional privacy and GDPR terminology
- Keep it between 150-400 words
- Make it specific to the processing activity and industry

Generate only the description text, no additional formatting or explanations.`;
        break;

      case "dpia_risk_assessment":
        const dpiaRiskInfo = request.privacyData
          ? `
DPIA Risk Assessment Information:
- Title: ${request.privacyData.title || "Not specified"}
- Industry: ${request.privacyData.industry || "Not specified"}
- Data Subjects: ${request.privacyData.data_subjects?.join(", ") || "Not specified"}
- Data Categories: ${request.privacyData.data_categories?.join(", ") || "Not specified"}
- Current Risk Level: ${request.privacyData.risk_level || "Not specified"}
        `.trim()
          : "";

        basePrompt = `You are a privacy expert specializing in Data Protection Impact Assessments (DPIAs) and GDPR compliance. Generate a comprehensive risk assessment for the DPIA "${request.privacyData?.title}" based on the following information:

${dpiaRiskInfo}

Context: ${context}

Requirements:
- Assess privacy risks based on the data subjects and categories
- Consider industry-specific privacy challenges
- Evaluate likelihood and impact of privacy breaches
- Identify specific privacy risks and their potential consequences
- Suggest risk mitigation strategies
- Use professional privacy and GDPR terminology
- Keep it between 200-500 words
- Make it specific to the processing activity and industry context

Generate only the risk assessment text, no additional formatting or explanations.`;
        break;

      case "ropa_purpose":
        const ropaInfo = request.privacyData
          ? `
RoPA Information:
- Title: ${request.privacyData.title || "Not specified"}
- Industry: ${request.privacyData.industry || "Not specified"}
- Data Subjects: ${request.privacyData.data_subjects?.join(", ") || "Not specified"}
- Data Categories: ${request.privacyData.data_categories?.join(", ") || "Not specified"}
        `.trim()
          : "";

        basePrompt = `You are a privacy expert specializing in Records of Processing Activities (RoPA) and GDPR Article 30 compliance. Generate a comprehensive purpose description for the RoPA "${request.privacyData?.title}" based on the following information:

${ropaInfo}

Context: ${context}

Requirements:
- Create a detailed, professional purpose description
- Ensure the description is specifically relevant to "${request.privacyData?.title}"
- Explain why the data is being processed and the legitimate business purpose
- Address the specific data subjects and categories mentioned
- Consider the industry context and typical processing activities
- Use professional privacy and GDPR terminology
- Keep it between 100-300 words
- Make it specific to the processing activity and industry

Generate only the purpose text, no additional formatting or explanations.`;
        break;

      case "ropa_legal_basis":
        const ropaLegalInfo = request.privacyData
          ? `
RoPA Legal Basis Information:
- Title: ${request.privacyData.title || "Not specified"}
- Industry: ${request.privacyData.industry || "Not specified"}
- Data Subjects: ${request.privacyData.data_subjects?.join(", ") || "Not specified"}
- Data Categories: ${request.privacyData.data_categories?.join(", ") || "Not specified"}
        `.trim()
          : "";

        basePrompt = `You are a privacy expert specializing in Records of Processing Activities (RoPA) and GDPR Article 6 legal basis. Generate appropriate legal basis for the RoPA "${request.privacyData?.title}" based on the following information:

${ropaLegalInfo}

Context: ${context}

Requirements:
- Identify the most appropriate legal basis under GDPR Article 6
- Consider the data subjects and processing purpose
- Explain why this legal basis applies to this specific processing activity
- Consider industry-specific legal requirements
- Use professional privacy and GDPR terminology
- Keep it between 100-250 words
- Make it specific to the processing activity and industry context

Generate only the legal basis text, no additional formatting or explanations.`;
        break;

      case "policy_content":
        basePrompt = `You are an expert in policy development and governance. Generate comprehensive policy content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed, professional policy content
- Ensure the content is specifically relevant to "${auditData.title}"
- Include policy objectives, scope, responsibilities, and procedures
- Use professional policy language and structure
- Keep it between 200-500 words
- Make it specific to the policy type and business unit
- Include compliance requirements and enforcement mechanisms

Generate only the policy content text, no additional formatting or explanations.`;
        break;

      case "incident_response":
        basePrompt = `You are an expert in incident response and crisis management. Generate comprehensive incident response procedures based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed incident response procedures
- Ensure the procedures are specifically relevant to "${auditData.title}"
- Include detection, containment, eradication, and recovery steps
- Use professional incident response terminology
- Keep it between 200-500 words
- Make it specific to the incident type and business unit
- Include escalation procedures and communication protocols

Generate only the incident response text, no additional formatting or explanations.`;
        break;

      case "esg_program":
        basePrompt = `You are an expert in Environmental, Social, and Governance (ESG) programs. Generate comprehensive ESG program content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed ESG program descriptions and objectives
- Ensure the content is specifically relevant to "${auditData.title}"
- Include environmental, social, and governance aspects
- Use professional ESG terminology and frameworks
- Keep it between 200-500 words
- Make it specific to the ESG focus area and business unit
- Include sustainability goals and measurement metrics

Generate only the ESG program text, no additional formatting or explanations.`;
        break;

      case "bcp_plan":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive BCP plan content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed business continuity plan content
- Ensure the content is specifically relevant to "${auditData.title}"
- Include recovery objectives, procedures, and resource requirements
- Use professional BCP terminology and standards
- Keep it between 200-500 words
- Make it specific to the business function and unit
- Include RTO/RPO requirements and testing procedures

Generate only the BCP plan text, no additional formatting or explanations.`;
        break;

      case "bcp_description":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive BCP plan description based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed business continuity plan description
- Ensure the description is specifically relevant to "${auditData.title}"
- Include plan purpose, scope, and key objectives
- Use professional BCP terminology and standards
- Keep it between 150-300 words
- Make it specific to the business function and unit
- Include high-level recovery strategies and governance

Generate only the BCP description text, no additional formatting or explanations.`;
        break;

      case "bcp_scope":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive BCP plan scope based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed business continuity plan scope definition
- Ensure the scope is specifically relevant to "${auditData.title}"
- Include organizational boundaries, business functions, and systems
- Use professional BCP terminology and standards
- Keep it between 100-250 words
- Make it specific to the business function and unit
- Include in-scope and out-of-scope elements

Generate only the BCP scope text, no additional formatting or explanations.`;
        break;

      case "bcp_business_impact_analysis":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive business impact analysis based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed business impact analysis for BCP
- Ensure the analysis is specifically relevant to "${auditData.title}"
- Include impact assessment, recovery priorities, and dependencies
- Use professional BCP terminology and standards
- Keep it between 200-400 words
- Make it specific to the business function and unit
- Include financial, operational, and reputational impacts

Generate only the business impact analysis text, no additional formatting or explanations.`;
        break;

      case "bcp_risk_assessment":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive risk assessment for BCP based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed risk assessment for business continuity
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include threat identification, vulnerability analysis, and risk scoring
- Use professional BCP terminology and standards
- Keep it between 200-400 words
- Make it specific to the business function and unit
- Include risk mitigation strategies and controls

Generate only the risk assessment text, no additional formatting or explanations.`;
        break;

      case "bcp_recovery_strategies":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive recovery strategies based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed recovery strategies for business continuity
- Ensure the strategies are specifically relevant to "${auditData.title}"
- Include recovery procedures, resource allocation, and timelines
- Use professional BCP terminology and standards
- Keep it between 200-400 words
- Make it specific to the business function and unit
- Include RTO/RPO requirements and escalation procedures

Generate only the recovery strategies text, no additional formatting or explanations.`;
        break;

      case "bcp_resource_requirements":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive resource requirements based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed resource requirements for business continuity
- Ensure the requirements are specifically relevant to "${auditData.title}"
- Include personnel, technology, facilities, and financial resources
- Use professional BCP terminology and standards
- Keep it between 150-300 words
- Make it specific to the business function and unit
- Include resource allocation and procurement procedures

Generate only the resource requirements text, no additional formatting or explanations.`;
        break;

      case "bcp_communication_plan":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive communication plan based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed communication plan for business continuity
- Ensure the plan is specifically relevant to "${auditData.title}"
- Include stakeholder communication, escalation procedures, and messaging
- Use professional BCP terminology and standards
- Keep it between 150-300 words
- Make it specific to the business function and unit
- Include communication channels and frequency

Generate only the communication plan text, no additional formatting or explanations.`;
        break;

      case "bcp_testing_schedule":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive testing schedule based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed testing schedule for business continuity
- Ensure the schedule is specifically relevant to "${auditData.title}"
- Include exercise types, frequency, and participants
- Use professional BCP terminology and standards
- Keep it between 150-300 words
- Make it specific to the business function and unit
- Include testing objectives and success criteria

Generate only the testing schedule text, no additional formatting or explanations.`;
        break;

      case "bcp_maintenance_schedule":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive maintenance schedule based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed maintenance schedule for business continuity
- Ensure the schedule is specifically relevant to "${auditData.title}"
- Include review cycles, updates, and continuous improvement
- Use professional BCP terminology and standards
- Keep it between 150-300 words
- Make it specific to the business function and unit
- Include maintenance responsibilities and procedures

Generate only the maintenance schedule text, no additional formatting or explanations.`;
        break;

      case "bcp_critical_function_description":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive critical function description based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed critical function description for business continuity
- Ensure the description is specifically relevant to "${auditData.title}"
- Include function purpose, dependencies, and recovery requirements
- Use professional BCP terminology and standards
- Keep it between 150-300 words
- Make it specific to the business function and unit
- Include RTO/RPO requirements and resource needs

Generate only the critical function description text, no additional formatting or explanations.`;
        break;

      case "bcp_recovery_strategy":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive recovery strategy based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed recovery strategy for business continuity
- Ensure the strategy is specifically relevant to "${auditData.title}"
- Include recovery procedures, resource allocation, and timelines
- Use professional BCP terminology and standards
- Keep it between 200-400 words
- Make it specific to the business function and unit
- Include escalation procedures and decision-making authority

Generate only the recovery strategy text, no additional formatting or explanations.`;
        break;

      case "bcp_testing_scenario":
        basePrompt = `You are an expert in Business Continuity Planning (BCP). Generate comprehensive testing scenario based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed testing scenario for business continuity
- Ensure the scenario is specifically relevant to "${auditData.title}"
- Include scenario description, objectives, and success criteria
- Use professional BCP terminology and standards
- Keep it between 200-400 words
- Make it specific to the business function and unit
- Include participant roles and expected outcomes

Generate only the testing scenario text, no additional formatting or explanations.`;
        break;

      case "vendor_assessment":
        basePrompt = `You are an expert in vendor management and third-party risk assessment. Generate comprehensive vendor assessment criteria based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor assessment criteria and procedures
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include financial, operational, security, and compliance criteria
- Use professional vendor management terminology
- Keep it between 200-500 words
- Make it specific to the vendor type and business unit
- Include risk scoring and monitoring requirements

Generate only the vendor assessment text, no additional formatting or explanations.`;
        break;

      case "vendor_due_diligence_report":
        basePrompt = `You are an expert in vendor due diligence and third-party risk management. Generate comprehensive due diligence report based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor due diligence report
- Ensure the report is specifically relevant to "${auditData.title}"
- Include financial analysis, legal review, and operational assessment
- Use professional due diligence terminology and standards
- Keep it between 300-600 words
- Make it specific to the vendor type and business unit
- Include risk findings and recommendations

Generate only the due diligence report text, no additional formatting or explanations.`;
        break;

      case "vendor_contract_risk_analysis":
        basePrompt = `You are an expert in vendor contract risk analysis and third-party risk management. Generate comprehensive contract risk analysis based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor contract risk analysis
- Ensure the analysis is specifically relevant to "${auditData.title}"
- Include contract terms, obligations, and risk exposure
- Use professional contract analysis terminology
- Keep it between 250-500 words
- Make it specific to the vendor type and business unit
- Include risk mitigation strategies and recommendations

Generate only the contract risk analysis text, no additional formatting or explanations.`;
        break;

      case "vendor_risk_scoring":
        basePrompt = `You are an expert in vendor risk scoring and third-party risk management. Generate comprehensive vendor risk scoring methodology based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor risk scoring methodology
- Ensure the scoring is specifically relevant to "${auditData.title}"
- Include risk factors, scoring criteria, and rating scales
- Use professional risk management terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include scoring methodology and risk levels

Generate only the vendor risk scoring text, no additional formatting or explanations.`;
        break;

      case "vendor_assessment_criteria":
        basePrompt = `You are an expert in vendor assessment criteria and third-party risk management. Generate comprehensive vendor assessment criteria based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor assessment criteria and standards
- Ensure the criteria are specifically relevant to "${auditData.title}"
- Include financial, operational, security, and compliance criteria
- Use professional vendor management terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include assessment methodology and evaluation standards

Generate only the vendor assessment criteria text, no additional formatting or explanations.`;
        break;

      case "vendor_monitoring_plan":
        basePrompt = `You are an expert in vendor monitoring and third-party risk management. Generate comprehensive vendor monitoring plan based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor monitoring plan and procedures
- Ensure the plan is specifically relevant to "${auditData.title}"
- Include monitoring frequency, metrics, and reporting requirements
- Use professional vendor management terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include monitoring schedule and escalation procedures

Generate only the vendor monitoring plan text, no additional formatting or explanations.`;
        break;

      case "vendor_incident_response":
        basePrompt = `You are an expert in vendor incident response and third-party risk management. Generate comprehensive vendor incident response plan based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor incident response procedures
- Ensure the response plan is specifically relevant to "${auditData.title}"
- Include incident classification, response procedures, and escalation
- Use professional incident management terminology
- Keep it between 250-500 words
- Make it specific to the vendor type and business unit
- Include response timelines and communication procedures

Generate only the vendor incident response text, no additional formatting or explanations.`;
        break;

      case "vendor_performance_evaluation":
        basePrompt = `You are an expert in vendor performance evaluation and third-party risk management. Generate comprehensive vendor performance evaluation based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor performance evaluation criteria
- Ensure the evaluation is specifically relevant to "${auditData.title}"
- Include performance metrics, KPIs, and evaluation methods
- Use professional vendor management terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include evaluation frequency and reporting requirements

Generate only the vendor performance evaluation text, no additional formatting or explanations.`;
        break;

      case "vendor_compliance_assessment":
        basePrompt = `You are an expert in vendor compliance assessment and third-party risk management. Generate comprehensive vendor compliance assessment based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor compliance assessment criteria
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include regulatory requirements, industry standards, and compliance frameworks
- Use professional compliance terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include compliance monitoring and reporting requirements

Generate only the vendor compliance assessment text, no additional formatting or explanations.`;
        break;

      case "vendor_financial_analysis":
        basePrompt = `You are an expert in vendor financial analysis and third-party risk management. Generate comprehensive vendor financial analysis based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor financial analysis and assessment
- Ensure the analysis is specifically relevant to "${auditData.title}"
- Include financial stability, creditworthiness, and risk factors
- Use professional financial analysis terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include financial risk indicators and monitoring requirements

Generate only the vendor financial analysis text, no additional formatting or explanations.`;
        break;

      case "vendor_security_assessment":
        basePrompt = `You are an expert in vendor security assessment and third-party risk management. Generate comprehensive vendor security assessment based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor security assessment criteria
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include security controls, data protection, and cybersecurity measures
- Use professional security assessment terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include security monitoring and incident response requirements

Generate only the vendor security assessment text, no additional formatting or explanations.`;
        break;

      case "vendor_operational_assessment":
        basePrompt = `You are an expert in vendor operational assessment and third-party risk management. Generate comprehensive vendor operational assessment based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed vendor operational assessment criteria
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include operational capabilities, processes, and performance metrics
- Use professional operational assessment terminology
- Keep it between 200-400 words
- Make it specific to the vendor type and business unit
- Include operational risk factors and monitoring requirements

Generate only the vendor operational assessment text, no additional formatting or explanations.`;
        break;

      case "security_policy":
        basePrompt = `You are an expert in information security policy development. Generate comprehensive security policy content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed security policy content and procedures
- Ensure the policy is specifically relevant to "${auditData.title}"
- Include access controls, data protection, and incident response
- Use professional cybersecurity terminology and standards
- Keep it between 200-500 words
- Make it specific to the security domain and business unit
- Include compliance requirements and enforcement mechanisms

Generate only the security policy text, no additional formatting or explanations.`;
        break;

      case "training_program":
        basePrompt = `You are an expert in training and development program design. Generate comprehensive training program content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed training program descriptions and objectives
- Ensure the program is specifically relevant to "${auditData.title}"
- Include learning objectives, curriculum, and assessment methods
- Use professional training and development terminology
- Keep it between 200-500 words
- Make it specific to the training topic and business unit
- Include competency requirements and certification criteria

Generate only the training program text, no additional formatting or explanations.`;
        break;

      case "training_description":
        basePrompt = `You are an expert in training program design. Generate comprehensive training program descriptions based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed training program descriptions and overviews
- Ensure the description is specifically relevant to "${auditData.title}"
- Include program purpose, scope, and target audience
- Use professional training and development terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include program benefits and expected outcomes

Generate only the training description text, no additional formatting or explanations.`;
        break;

      case "learning_objectives":
        basePrompt = `You are an expert in instructional design and learning objectives. Generate comprehensive learning objectives based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create specific, measurable, achievable, relevant, and time-bound (SMART) learning objectives
- Ensure the objectives are specifically relevant to "${auditData.title}"
- Include cognitive, affective, and psychomotor learning domains
- Use professional instructional design terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include assessment criteria and success indicators

Generate only the learning objectives text, no additional formatting or explanations.`;
        break;

      case "assessment_criteria":
        basePrompt = `You are an expert in training assessment and evaluation. Generate comprehensive assessment criteria based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed assessment criteria and evaluation methods
- Ensure the criteria are specifically relevant to "${auditData.title}"
- Include knowledge, skills, and competency assessments
- Use professional assessment and evaluation terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include scoring rubrics and performance standards

Generate only the assessment criteria text, no additional formatting or explanations.`;
        break;

      case "training_materials":
        basePrompt = `You are an expert in training material development. Generate comprehensive training materials outline based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed training materials outline and content structure
- Ensure the materials are specifically relevant to "${auditData.title}"
- Include course modules, activities, and resources
- Use professional training development terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include learning activities and engagement strategies

Generate only the training materials outline text, no additional formatting or explanations.`;
        break;

      case "training_schedule":
        basePrompt = `You are an expert in training program scheduling and logistics. Generate comprehensive training schedule based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed training schedule and timeline
- Ensure the schedule is specifically relevant to "${auditData.title}"
- Include session breakdown, duration, and sequencing
- Use professional training scheduling terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include logistics and resource requirements

Generate only the training schedule text, no additional formatting or explanations.`;
        break;

      case "certification_requirements":
        basePrompt = `You are an expert in professional certification and credentialing. Generate comprehensive certification requirements based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed certification requirements and criteria
- Ensure the requirements are specifically relevant to "${auditData.title}"
- Include eligibility criteria, assessment methods, and renewal requirements
- Use professional certification terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include continuing education and maintenance requirements

Generate only the certification requirements text, no additional formatting or explanations.`;
        break;

      case "training_evaluation":
        basePrompt = `You are an expert in training evaluation and effectiveness measurement. Generate comprehensive training evaluation framework based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed training evaluation framework and methods
- Ensure the evaluation is specifically relevant to "${auditData.title}"
- Include Kirkpatrick's four levels of evaluation
- Use professional training evaluation terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include ROI measurement and continuous improvement

Generate only the training evaluation text, no additional formatting or explanations.`;
        break;

      case "competency_mapping":
        basePrompt = `You are an expert in competency mapping and skill development. Generate comprehensive competency mapping framework based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed competency mapping and skill frameworks
- Ensure the mapping is specifically relevant to "${auditData.title}"
- Include knowledge, skills, abilities, and behaviors (KSABs)
- Use professional competency mapping terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include proficiency levels and development pathways

Generate only the competency mapping text, no additional formatting or explanations.`;
        break;

      case "training_effectiveness":
        basePrompt = `You are an expert in training effectiveness and performance improvement. Generate comprehensive training effectiveness analysis based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed training effectiveness analysis and metrics
- Ensure the analysis is specifically relevant to "${auditData.title}"
- Include performance improvement and behavior change measurement
- Use professional training effectiveness terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include success metrics and continuous improvement strategies

Generate only the training effectiveness text, no additional formatting or explanations.`;
        break;

      case "compliance_training":
        basePrompt = `You are an expert in compliance training and regulatory education. Generate comprehensive compliance training content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed compliance training content and requirements
- Ensure the training is specifically relevant to "${auditData.title}"
- Include regulatory requirements, policies, and procedures
- Use professional compliance training terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include regulatory updates and ongoing compliance requirements

Generate only the compliance training text, no additional formatting or explanations.`;
        break;

      case "skill_development_plan":
        basePrompt = `You are an expert in skill development and career planning. Generate comprehensive skill development plan based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed skill development plan and career pathway
- Ensure the plan is specifically relevant to "${auditData.title}"
- Include skill gaps, development goals, and action plans
- Use professional skill development terminology
- Keep it between 200-400 words
- Make it specific to the training topic and business unit
- Include timeline, resources, and success indicators

Generate only the skill development plan text, no additional formatting or explanations.`;
        break;

      case "finding_description":
        basePrompt = `You are an expert in audit findings and issue management. Generate comprehensive finding descriptions based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding descriptions and analysis
- Ensure the finding is specifically relevant to "${auditData.title}"
- Include issue identification, impact assessment, and root cause analysis
- Use professional audit and compliance terminology
- Keep it between 200-500 words
- Make it specific to the finding type and business unit
- Include risk implications and remediation recommendations

Generate only the finding description text, no additional formatting or explanations.`;
        break;

      case "finding_analysis":
        basePrompt = `You are an expert in audit findings analysis. Generate comprehensive finding analysis based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding analysis and evaluation
- Ensure the analysis is specifically relevant to "${auditData.title}"
- Include technical analysis, compliance gaps, and control deficiencies
- Use professional audit and analysis terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include detailed technical assessment and implications

Generate only the finding analysis text, no additional formatting or explanations.`;
        break;

      case "finding_impact":
        basePrompt = `You are an expert in audit finding impact assessment. Generate comprehensive finding impact analysis based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding impact assessment and evaluation
- Ensure the impact analysis is specifically relevant to "${auditData.title}"
- Include business impact, operational impact, and financial impact
- Use professional audit and risk assessment terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include risk quantification and business implications

Generate only the finding impact text, no additional formatting or explanations.`;
        break;

      case "finding_recommendations":
        basePrompt = `You are an expert in audit finding recommendations. Generate comprehensive finding recommendations based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding recommendations and remediation strategies
- Ensure the recommendations are specifically relevant to "${auditData.title}"
- Include corrective actions, preventive measures, and improvement opportunities
- Use professional audit and compliance terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include actionable recommendations and implementation guidance

Generate only the finding recommendations text, no additional formatting or explanations.`;
        break;

      case "finding_action_plan":
        basePrompt = `You are an expert in audit finding action planning. Generate comprehensive finding action plan based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding action plan and implementation strategy
- Ensure the action plan is specifically relevant to "${auditData.title}"
- Include specific steps, timelines, and resource requirements
- Use professional audit and project management terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include detailed implementation steps and success criteria

Generate only the finding action plan text, no additional formatting or explanations.`;
        break;

      case "finding_risk_assessment":
        basePrompt = `You are an expert in audit finding risk assessment. Generate comprehensive finding risk assessment based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding risk assessment and evaluation
- Ensure the risk assessment is specifically relevant to "${auditData.title}"
- Include risk likelihood, impact, and overall risk rating
- Use professional audit and risk management terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include risk scoring and mitigation strategies

Generate only the finding risk assessment text, no additional formatting or explanations.`;
        break;

      case "finding_root_cause":
        basePrompt = `You are an expert in audit finding root cause analysis. Generate comprehensive finding root cause analysis based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding root cause analysis and investigation
- Ensure the root cause analysis is specifically relevant to "${auditData.title}"
- Include underlying causes, contributing factors, and systemic issues
- Use professional audit and investigation terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include detailed cause analysis and contributing factors

Generate only the finding root cause text, no additional formatting or explanations.`;
        break;

      case "finding_evidence":
        basePrompt = `You are an expert in audit finding evidence documentation. Generate comprehensive finding evidence documentation based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding evidence documentation and support
- Ensure the evidence is specifically relevant to "${auditData.title}"
- Include supporting documentation, test results, and observations
- Use professional audit and documentation terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include detailed evidence description and support materials

Generate only the finding evidence text, no additional formatting or explanations.`;
        break;

      case "finding_priority":
        basePrompt = `You are an expert in audit finding prioritization. Generate comprehensive finding priority assessment based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding priority assessment and ranking
- Ensure the priority assessment is specifically relevant to "${auditData.title}"
- Include urgency, importance, and resource allocation considerations
- Use professional audit and prioritization terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include priority justification and resource requirements

Generate only the finding priority text, no additional formatting or explanations.`;
        break;

      case "finding_timeline":
        basePrompt = `You are an expert in audit finding timeline planning. Generate comprehensive finding timeline based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding timeline and milestone planning
- Ensure the timeline is specifically relevant to "${auditData.title}"
- Include remediation phases, deadlines, and critical path activities
- Use professional audit and project management terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include detailed timeline with milestones and dependencies

Generate only the finding timeline text, no additional formatting or explanations.`;
        break;

      case "finding_assignee":
        basePrompt = `You are an expert in audit finding assignment and responsibility. Generate comprehensive finding assignee recommendations based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding assignee recommendations and responsibility matrix
- Ensure the assignment is specifically relevant to "${auditData.title}"
- Include role responsibilities, skill requirements, and accountability
- Use professional audit and organizational terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include detailed role assignments and responsibilities

Generate only the finding assignee text, no additional formatting or explanations.`;
        break;

      case "finding_follow_up":
        basePrompt = `You are an expert in audit finding follow-up and monitoring. Generate comprehensive finding follow-up plan based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed finding follow-up plan and monitoring strategy
- Ensure the follow-up plan is specifically relevant to "${auditData.title}"
- Include verification activities, progress monitoring, and closure criteria
- Use professional audit and monitoring terminology
- Keep it between 200-400 words
- Make it specific to the finding type and business unit
- Include detailed follow-up activities and success criteria

Generate only the finding follow-up text, no additional formatting or explanations.`;
        break;

      case "resilience_assessment":
        basePrompt = `You are an expert in organizational resilience and risk management. Generate comprehensive resilience assessment content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed resilience assessment criteria and procedures
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include organizational capacity, adaptability, and recovery capabilities
- Use professional resilience and risk management terminology
- Keep it between 200-500 words
- Make it specific to the resilience domain and business unit
- Include measurement frameworks and improvement strategies

Generate only the resilience assessment text, no additional formatting or explanations.`;
        break;

      case "resilience_strategy":
        basePrompt = `You are an expert in organizational resilience strategy development. Generate comprehensive resilience strategy content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed resilience strategy framework and approach
- Ensure the strategy is specifically relevant to "${auditData.title}"
- Include strategic objectives, key initiatives, and implementation roadmap
- Use professional strategy and resilience terminology
- Keep it between 300-600 words
- Make it specific to the resilience domain and business unit
- Include governance structure and success metrics

Generate only the resilience strategy text, no additional formatting or explanations.`;
        break;

      case "crisis_management_plan":
        basePrompt = `You are an expert in crisis management and emergency response planning. Generate comprehensive crisis management plan content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed crisis management procedures and response protocols
- Ensure the plan is specifically relevant to "${auditData.title}"
- Include crisis identification, escalation procedures, and response teams
- Use professional crisis management and emergency response terminology
- Keep it between 300-600 words
- Make it specific to the crisis management domain and business unit
- Include communication protocols and recovery procedures

Generate only the crisis management plan text, no additional formatting or explanations.`;
        break;

      case "business_impact_analysis":
        basePrompt = `You are an expert in business impact analysis and continuity planning. Generate comprehensive business impact analysis content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed business impact assessment criteria and methodology
- Ensure the analysis is specifically relevant to "${auditData.title}"
- Include critical business functions, dependencies, and recovery priorities
- Use professional business continuity and impact analysis terminology
- Keep it between 300-600 words
- Make it specific to the business impact domain and business unit
- Include quantitative and qualitative impact assessments

Generate only the business impact analysis text, no additional formatting or explanations.`;
        break;

      case "recovery_strategies":
        basePrompt = `You are an expert in business recovery and continuity strategies. Generate comprehensive recovery strategies content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed recovery strategies and implementation approaches
- Ensure the strategies are specifically relevant to "${auditData.title}"
- Include recovery time objectives, resource requirements, and procedures
- Use professional business continuity and recovery terminology
- Keep it between 300-600 words
- Make it specific to the recovery domain and business unit
- Include escalation procedures and success criteria

Generate only the recovery strategies text, no additional formatting or explanations.`;
        break;

      case "resilience_metrics":
        basePrompt = `You are an expert in resilience measurement and performance metrics. Generate comprehensive resilience metrics content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed resilience metrics framework and measurement criteria
- Ensure the metrics are specifically relevant to "${auditData.title}"
- Include key performance indicators, measurement methods, and targets
- Use professional metrics and performance management terminology
- Keep it between 200-500 words
- Make it specific to the resilience metrics domain and business unit
- Include reporting frequency and improvement tracking

Generate only the resilience metrics text, no additional formatting or explanations.`;
        break;

      case "scenario_analysis":
        basePrompt = `You are an expert in scenario planning and risk analysis. Generate comprehensive scenario analysis content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed scenario analysis framework and methodology
- Ensure the analysis is specifically relevant to "${auditData.title}"
- Include scenario development, impact assessment, and response planning
- Use professional scenario planning and risk analysis terminology
- Keep it between 300-600 words
- Make it specific to the scenario analysis domain and business unit
- Include probability assessment and mitigation strategies

Generate only the scenario analysis text, no additional formatting or explanations.`;
        break;

      case "resilience_framework":
        basePrompt = `You are an expert in resilience frameworks and governance structures. Generate comprehensive resilience framework content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed resilience framework structure and governance model
- Ensure the framework is specifically relevant to "${auditData.title}"
- Include framework components, roles, responsibilities, and processes
- Use professional framework and governance terminology
- Keep it between 300-600 words
- Make it specific to the resilience framework domain and business unit
- Include implementation roadmap and maturity assessment

Generate only the resilience framework text, no additional formatting or explanations.`;
        break;

      case "capacity_assessment":
        basePrompt = `You are an expert in organizational capacity assessment and capability building. Generate comprehensive capacity assessment content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed capacity assessment criteria and evaluation methodology
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include capacity gaps, capability requirements, and development needs
- Use professional capacity building and assessment terminology
- Keep it between 300-600 words
- Make it specific to the capacity assessment domain and business unit
- Include improvement recommendations and development plans

Generate only the capacity assessment text, no additional formatting or explanations.`;
        break;

      case "adaptability_plan":
        basePrompt = `You are an expert in organizational adaptability and change management. Generate comprehensive adaptability plan content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed adaptability plan framework and implementation approach
- Ensure the plan is specifically relevant to "${auditData.title}"
- Include adaptability strategies, change management processes, and learning mechanisms
- Use professional adaptability and change management terminology
- Keep it between 300-600 words
- Make it specific to the adaptability domain and business unit
- Include continuous improvement and learning frameworks

Generate only the adaptability plan text, no additional formatting or explanations.`;
        break;

      case "resilience_monitoring":
        basePrompt = `You are an expert in resilience monitoring and performance tracking. Generate comprehensive resilience monitoring content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed resilience monitoring framework and tracking mechanisms
- Ensure the monitoring is specifically relevant to "${auditData.title}"
- Include monitoring indicators, reporting processes, and alert mechanisms
- Use professional monitoring and performance tracking terminology
- Keep it between 200-500 words
- Make it specific to the resilience monitoring domain and business unit
- Include early warning systems and response triggers

Generate only the resilience monitoring text, no additional formatting or explanations.`;
        break;

      case "continuous_improvement":
        basePrompt = `You are an expert in continuous improvement and organizational learning. Generate comprehensive continuous improvement content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed continuous improvement framework and methodology
- Ensure the improvement plan is specifically relevant to "${auditData.title}"
- Include improvement cycles, learning mechanisms, and feedback processes
- Use professional continuous improvement and learning terminology
- Keep it between 300-600 words
- Make it specific to the continuous improvement domain and business unit
- Include measurement of improvement and success criteria

Generate only the continuous improvement text, no additional formatting or explanations.`;
        break;

      case "supply_chain_risk":
        basePrompt = `You are an expert in supply chain risk management. Generate comprehensive supply chain risk assessment content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed supply chain risk assessment criteria and procedures
- Ensure the assessment is specifically relevant to "${auditData.title}"
- Include supplier risk, logistics risk, and operational continuity
- Use professional supply chain and risk management terminology
- Keep it between 200-500 words
- Make it specific to the supply chain domain and business unit
- Include risk mitigation strategies and monitoring requirements

Generate only the supply chain risk text, no additional formatting or explanations.`;
        break;
    }

    return basePrompt;
  }

  private getAuditTypeSpecificGuidance(auditType: string): string {
    switch (auditType) {
      case "internal":
        return `- Focus on internal controls, governance, and operational efficiency
- Review compliance with internal policies and procedures
- Assess risk management processes and control environment
- Evaluate operational effectiveness and efficiency
- Review management oversight and reporting mechanisms`;

      case "external":
        return `- Focus on external relationships and third-party risk management
- Review vendor management and contract compliance
- Assess external regulatory compliance
- Evaluate customer-facing processes and controls
- Review external reporting and communication controls`;

      case "compliance":
        return `- Focus on adherence to laws, regulations, and industry standards
- Review compliance monitoring and reporting systems
- Assess training and awareness programs
- Evaluate compliance testing and validation processes
- Review incident management and corrective action procedures`;

      case "operational":
        return `- Focus on business process efficiency and effectiveness
- Review operational controls and performance metrics
- Assess resource utilization and cost management
- Evaluate process automation and technology usage
- Review operational risk management and business continuity`;

      case "financial":
        return `- Focus on financial reporting accuracy and completeness
- Review internal controls over financial reporting (ICFR)
- Assess revenue recognition and expense management
- Evaluate financial close processes and reconciliations
- Review cash management and treasury functions`;

      case "it":
        return `- Focus on IT governance, security, and infrastructure
- Review system access controls and user management
- Assess data integrity and backup/recovery procedures
- Evaluate cybersecurity controls and incident response
- Review IT project management and change controls`;

      case "quality":
        return `- Focus on quality management systems and standards
- Review product/service quality controls and testing
- Assess customer satisfaction and complaint handling
- Evaluate quality assurance and continuous improvement
- Review supplier quality and inspection processes`;

      case "environmental":
        return `- Focus on environmental compliance and sustainability
- Review environmental management systems and reporting
- Assess waste management and pollution control
- Evaluate energy efficiency and resource conservation
- Review environmental risk assessment and mitigation`;

      default:
        return `- Focus on relevant controls and compliance requirements
- Review applicable policies, procedures, and standards
- Assess operational effectiveness and risk management
- Evaluate monitoring and reporting mechanisms
- Review continuous improvement and corrective actions`;
    }
  }

  // Enhanced template-based prompt building
  private async buildEnhancedPrompt(request: AIGenerationRequest): Promise<string> {
    try {
      // Try to find a matching template first
      const template = await this.findBestTemplate(request);
      
      if (template) {
        return this.processTemplate(template, request);
      }
      
      // Fallback to the original buildPrompt method
      return this.buildPrompt(request);
    } catch (error) {
      console.warn("Template-based prompt building failed, falling back to default:", error);
      return this.buildPrompt(request);
    }
  }

  private async findBestTemplate(request: AIGenerationRequest): Promise<AITemplate | null> {
    try {
      const { data: templates, error } = await supabase
        .from('ai_templates')
        .select('*')
        .eq('field_type', request.fieldType)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('version', { ascending: false });

      if (error || !templates || templates.length === 0) {
        return null;
      }

      // Find the best matching template based on industry and framework
      let bestTemplate = templates[0]; // Default to first template

      for (const template of templates) {
        // Perfect match: industry and framework
        if (request.industry && template.industry === request.industry &&
            request.framework && template.framework === request.framework) {
          return template;
        }
        
        // Industry match only
        if (request.industry && template.industry === request.industry && !template.framework) {
          bestTemplate = template;
        }
        
        // Framework match only
        if (request.framework && template.framework === request.framework && !template.industry) {
          bestTemplate = template;
        }
        
        // Default template (no industry/framework specified)
        if (!template.industry && !template.framework && template.is_default) {
          bestTemplate = template;
        }
      }

      return bestTemplate;
    } catch (error) {
      console.error("Error finding template:", error);
      return null;
    }
  }

  private processTemplate(template: AITemplate, request: AIGenerationRequest): string {
    let prompt = template.template_content;

    // Replace template variables with actual values
    const auditInfo = `
Audit Information:
- Title: ${request.auditData.title || "Not specified"}
- Type: ${request.auditData.audit_type || "Not specified"}
- Business Unit: ${request.auditData.business_unit || "Not specified"}
- Existing Scope: ${request.auditData.scope || "Not specified"}
    `.trim();

    // Replace common placeholders
    prompt = prompt.replace(/\{\{title\}\}/g, request.auditData.title || "Not specified");
    prompt = prompt.replace(/\{\{audit_type\}\}/g, request.auditData.audit_type || "Not specified");
    prompt = prompt.replace(/\{\{business_unit\}\}/g, request.auditData.business_unit || "Not specified");
    prompt = prompt.replace(/\{\{scope\}\}/g, request.auditData.scope || "Not specified");
    prompt = prompt.replace(/\{\{context\}\}/g, request.context || "");
    prompt = prompt.replace(/\{\{auditInfo\}\}/g, auditInfo);

    // Add industry-specific context if available
    if (request.industry && template.industry) {
      prompt += `\n\nIndustry Context: This template is specifically designed for the ${request.industry} industry.`;
    }

    // Add framework-specific context if available
    if (request.framework && template.framework) {
      prompt += `\n\nFramework Context: This template follows ${request.framework} standards and best practices.`;
    }

    return prompt;
  }

  // Template management methods
  async getTemplates(criteria?: TemplateSelectionCriteria): Promise<AITemplate[]> {
    try {
      let query = supabase
        .from('ai_templates')
        .select('*')
        .eq('is_active', true)
        .order('field_type')
        .order('name');

      if (criteria) {
        if (criteria.fieldType) {
          query = query.eq('field_type', criteria.fieldType);
        }
        if (criteria.industry) {
          query = query.eq('industry', criteria.industry);
        }
        if (criteria.framework) {
          query = query.eq('framework', criteria.framework);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  async createTemplate(template: Omit<AITemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AITemplate | null> {
    try {
      const { data, error } = await supabase
        .from('ai_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating template:", error);
      return null;
    }
  }

  async updateTemplate(id: string, updates: Partial<AITemplate>): Promise<AITemplate | null> {
    try {
      const { data, error } = await supabase
        .from('ai_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating template:", error);
      return null;
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }

  // General chat support: accepts a free-form messages array and optional system prompt.
  // Streams are handled by the caller using web APIs where supported; here we provide non-streaming convenience.
  async generateChat(request: {
    provider: string;
    model: string;
    messages: { role: "system" | "user" | "assistant"; content: string }[];
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIGenerationResponse> {
    const { provider, model, messages, apiKey, baseUrl, temperature, maxTokens } = request;

    // Fallback: if only a user message exists, re-route through generateContent using a generic prompt
    const systemPrefix = messages.find(m => m.role === "system")?.content ||
      "You are a helpful AI assistant for governance, risk, audit, and any general topic. Respond clearly and provide actionable steps when relevant.";

    const unifiedPrompt = `${systemPrefix}\n\nConversation so far:\n${messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n")}\n\nPlease reply to the last USER message.`;

    try {
      switch (provider) {
        case "ollama":
          // For Ollama, emulate chat using a single prompt; many models don't support chat natively
          return await this.generateWithOllama(unifiedPrompt, {
            provider,
            model,
            prompt: unifiedPrompt,
            context: "",
            fieldType: "description",
            auditData: { title: "AI Chat" },
            apiKey,
            baseUrl,
            temperature,
            maxTokens
          });
        case "openai": {
          if (!apiKey) throw new Error("OpenAI API key is required");
          const url = (baseUrl || "https://api.openai.com/v1") + "/chat/completions";
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: temperature ?? 0.7,
              max_tokens: maxTokens ?? 500,
            }),
          });
          if (!resp.ok) {
            const errorData = await resp.json().catch(() => null);
            throw new Error(`OpenAI API error: ${resp.status} ${errorData?.error?.message || resp.statusText}`);
          }
          const data = await resp.json();
          return {
            success: true,
            content: data.choices?.[0]?.message?.content || "",
            tokensUsed: data.usage?.total_tokens,
            model,
            provider: "openai",
          };
        }
        case "claude": {
          if (!apiKey) throw new Error("Claude API key is required");
          const url = (baseUrl || "https://api.anthropic.com/v1") + "/messages";
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model,
              max_tokens: maxTokens ?? 500,
              temperature: temperature ?? 0.7,
              messages,
            }),
          });
          if (!resp.ok) {
            const errorData = await resp.json().catch(() => null);
            throw new Error(`Claude API error: ${resp.status} ${errorData?.error?.message || resp.statusText}`);
          }
          const data = await resp.json();
          return {
            success: true,
            content: data.content?.[0]?.text || "",
            model,
            provider: "claude",
          };
        }
        case "gemini": {
          if (!apiKey) throw new Error("Gemini API key is required");
          const url =
            (baseUrl || "https://generativelanguage.googleapis.com/v1beta") +
            `/models/${model}:generateContent?key=${apiKey}`;
          const geminiContents = [
            {
              parts: [{ text: systemPrefix }],
              role: "user",
            },
            ...messages.map(m => ({ parts: [{ text: m.content }], role: m.role })),
          ];
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: geminiContents,
              generationConfig: {
                temperature: temperature ?? 0.7,
                maxOutputTokens: maxTokens ?? 500,
              },
            }),
          });
          if (!resp.ok) {
            const errorData = await resp.json().catch(() => null);
            throw new Error(`Gemini API error: ${resp.status} ${errorData?.error?.message || resp.statusText}`);
          }
          const data = await resp.json();
          return {
            success: true,
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
            model,
            provider: "gemini",
          };
        }
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        content: "",
        error: error instanceof Error ? error.message : "Chat generation failed",
      };
    }
  }

  async generateContent(
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      const prompt = await this.buildEnhancedPrompt(request);

      switch (request.provider) {
        case "ollama":
          return await this.generateWithOllama(prompt, request);
        case "openai":
          return await this.generateWithOpenAI(prompt, request);
        case "claude":
          return await this.generateWithClaude(prompt, request);
        case "gemini":
          return await this.generateWithGemini(prompt, request);
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async generateWithOllama(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      const baseUrl = request.baseUrl || "http://localhost:11434";

      // First check if Ollama is running
      try {
        const healthCheck = await fetch(`${baseUrl}/api/tags`, {
          method: "GET",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!healthCheck.ok) {
          throw new Error("Ollama service is not responding");
        }
      } catch (healthError) {
        throw new Error(
          `Ollama is not running or not accessible at ${baseUrl}. Please ensure Ollama is installed and running. Visit https://ollama.ai for installation instructions.`,
        );
      }

      // Check if the model exists
      try {
        const modelsResponse = await fetch(`${baseUrl}/api/tags`);
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          const availableModels =
            modelsData.models?.map((m: any) => m.name) || [];
          if (
            !availableModels.some((name: string) =>
              name.startsWith(request.model),
            )
          ) {
            throw new Error(
              `Model "${request.model}" not found. Available models: ${availableModels.join(", ")}. Run "ollama pull ${request.model}" to download it.`,
            );
          }
        }
      } catch (modelError) {
        if (
          modelError instanceof Error &&
          modelError.message.includes("not found")
        ) {
          throw modelError;
        }
        // Continue if we can't check models - maybe the model exists
      }

      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: request.temperature || 0.7,
            num_predict: request.maxTokens || 500,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Model "${request.model}" not found in Ollama. Run "ollama pull ${request.model}" to download it.`,
          );
        }
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      let content = data.response;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        model: request.model,
        provider: "ollama",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Ollama generation failed",
      };
    }
  }

  private async generateWithOpenAI(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      if (!request.apiKey) {
        throw new Error("OpenAI API key is required");
      }

      const baseUrl = request.baseUrl || "https://api.openai.com/v1";
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: [{ role: "user", content: prompt }],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `OpenAI API error: ${response.status} ${errorData?.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      let content = data.choices[0].message.content;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        tokensUsed: data.usage?.total_tokens,
        model: request.model,
        provider: "openai",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "OpenAI generation failed",
      };
    }
  }

  private async generateWithClaude(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      if (!request.apiKey) {
        throw new Error("Claude API key is required");
      }

      const baseUrl = request.baseUrl || "https://api.anthropic.com/v1";
      const response = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": request.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens || 500,
          temperature: request.temperature || 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Claude API error: ${response.status} ${errorData?.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      let content = data.content[0].text;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        model: request.model,
        provider: "claude",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Claude generation failed",
      };
    }
  }

  private async generateWithGemini(
    prompt: string,
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    try {
      if (!request.apiKey) {
        throw new Error("Gemini API key is required");
      }

      const baseUrl =
        request.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
      const response = await fetch(
        `${baseUrl}/models/${request.model}:generateContent?key=${request.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 500,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Gemini API error: ${response.status} ${errorData?.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      let content = data.candidates[0].content.parts[0].text;

      // If field type is objectives and response looks like JSON, try to parse it
      if (
        request.fieldType === "objectives" &&
        content.trim().startsWith("[")
      ) {
        try {
          const objectives = JSON.parse(content);
          if (Array.isArray(objectives)) {
            content = objectives;
          }
        } catch {
          // If parsing fails, keep original content
        }
      }

      return {
        success: true,
        content: content,
        model: request.model,
        provider: "gemini",
      };
    } catch (error) {
      return {
        success: false,
        content: "",
        error:
          error instanceof Error ? error.message : "Gemini generation failed",
      };
    }
  }

  async logGeneration(
    request: AIGenerationRequest,
    response: AIGenerationResponse,
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      await supabase.from("ai_generation_logs").insert([
        {
          user_id: user.id,
          provider: request.provider,
          model_name: request.model,
          prompt: request.prompt,
          response: response.content,
          tokens_used: response.tokensUsed || 0,
          request_type: request.fieldType,
          success: response.success,
          error_message: response.error,
        },
      ]);
    } catch (error) {
      console.error("Error logging AI generation:", error);
    }
  }

  async deleteConfiguration(configId: string): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("ai_configurations")
        .delete()
        .eq("id", configId)
        .eq("created_by", user.id); // Ensure user can only delete their own configs

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting AI configuration:", error);
      throw error;
    }
  }

  async checkOllamaStatus(baseUrl: string = "http://localhost:11434"): Promise<{
    isRunning: boolean;
    availableModels: string[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return {
          isRunning: false,
          availableModels: [],
          error: `Ollama API returned ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const models = data.models?.map((m: any) => m.name) || [];

      return {
        isRunning: true,
        availableModels: models,
      };
    } catch (error) {
      return {
        isRunning: false,
        availableModels: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const aiService = AIService.getInstance();
export default aiService;
