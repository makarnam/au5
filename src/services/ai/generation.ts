import type { AIGenerationRequest, AIGenerationResponse } from "./types";
import { aiTemplatesService } from "./templates";

export class AIContentGenerationService {
  private buildPrompt(request: AIGenerationRequest): string {
    const { fieldType, auditData, context, controlSetData } = request;

    let basePrompt = "";

    // Handle undefined auditData gracefully
    const safeAuditData = auditData || {};
    const auditInfo = `
Audit Information:
- Title: ${safeAuditData.title || "Not specified"}
- Type: ${safeAuditData.audit_type || "Not specified"}
- Business Unit: ${safeAuditData.business_unit || "Not specified"}
- Existing Scope: ${safeAuditData.scope || "Not specified"}
    `.trim();

    switch (fieldType) {
      case "description":
        basePrompt = `You are an expert audit professional. Generate a comprehensive audit description based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create a detailed, professional audit description
- Ensure the description is specifically relevant to "${safeAuditData.title || "the audit"}"
- Include the purpose, scope overview, and key focus areas
- Use professional audit terminology
- Keep it between 100-300 words
- Make it specific to the audit type and business unit

Generate only the description text, no additional formatting or explanations.`;
        break;

      case "objectives":
        const auditTypeSpecificGuidance = this.getAuditTypeSpecificGuidance(
          safeAuditData.audit_type || "internal",
        );

        basePrompt = `You are an expert audit professional with extensive experience in ${safeAuditData.audit_type || "internal"} audits. Generate specific, realistic audit objectives for "${safeAuditData.title || "the audit"}" based on the following information:

${auditInfo}

Context: ${context}

Audit Type Specific Focus Areas:
${auditTypeSpecificGuidance}

Requirements:
- Create 4-6 specific, measurable audit objectives
- Each objective must be directly related to "${safeAuditData.title || "the audit"}" and ${safeAuditData.audit_type || "internal"} audit type
- Objectives should be realistic, achievable, and follow professional audit standards
- Use action-oriented language (assess, evaluate, review, verify, test, examine, analyze, etc.)
- Include both compliance and operational effectiveness objectives
- Consider risk-based audit approach
- Make them specific to the business unit: ${safeAuditData.business_unit || "the organization"}
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
- Be specific to "${safeAuditData.title || "the audit"}" and the business unit
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
- Include specific methods relevant to "${safeAuditData.title || "the audit"}"
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

      case "executive_summary":
        basePrompt = `You are an expert audit professional with extensive experience in writing executive summaries for audit reports. Generate a comprehensive executive summary for the following audit:

${auditInfo}

Context: ${context}

Requirements:
- Write a professional executive summary suitable for senior management and audit committees
- Start with a brief overview of the audit's purpose and scope
- Summarize key findings, observations, and conclusions
- Highlight any significant risks or control weaknesses identified
- Include recommendations for improvement where applicable
- Mention the overall audit opinion or assessment
- Keep it concise but comprehensive (150-300 words)
- Use professional audit terminology and business language
- Structure it with clear paragraphs covering: purpose, scope, methodology, key findings, conclusions, and recommendations
- Make it specific to the audit title, type, and business unit provided

Write only the executive summary content, no additional formatting, headers, or explanations.`;
        break;

      // Add more cases for other field types...
      default:
        basePrompt = `You are an expert in governance, risk, and compliance (GRC) content generation. Generate comprehensive content based on the following information:

${auditInfo}

Context: ${context}

Requirements:
- Create detailed, professional content relevant to "${safeAuditData.title || "the topic"}"
- Ensure the content is specifically tailored to the GRC context and requirements
- Use professional terminology appropriate to the field
- Keep it between 200-400 words
- Make it specific to the business unit and context provided
- Include actionable insights and recommendations where applicable

Generate only the content text, no additional formatting or explanations.`;
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
  async buildEnhancedPrompt(request: AIGenerationRequest): Promise<string> {
    try {
      // Try to find a matching template first
      const template = await aiTemplatesService.findBestTemplate(request);

      if (template) {
        return aiTemplatesService.processTemplate(template, request);
      }

      // Fallback to the original buildPrompt method
      return this.buildPrompt(request);
    } catch (error) {
      console.warn("Template-based prompt building failed, falling back to default:", error);
      return this.buildPrompt(request);
    }
  }

  // Main generation method - will be implemented with provider-specific logic
  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // This will be implemented when we create the main service orchestrator
      // For now, return a placeholder response
      return {
        success: false,
        content: "",
        error: "Content generation service not fully implemented yet",
      };
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
}

export const aiContentGenerationService = new AIContentGenerationService();