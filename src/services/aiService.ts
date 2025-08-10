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
    | "ropa_legal_basis";
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
      const prompt = this.buildPrompt(request);

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
