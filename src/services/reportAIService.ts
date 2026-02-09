import { supabase } from "../lib/supabase";
import { aiService } from "./aiService";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template_structure: any;
  category: string;
  data_sources: string[];
  parameters: Record<string, any>;
  export_formats: string[];
  is_ai_enabled: boolean;
  ai_prompt_template?: string;
  regulatory_mappings?: Record<string, any>;
  stakeholder_groups?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  id: string;
  name: string;
  type: 'text' | 'chart' | 'table' | 'kpi' | 'finding' | 'risk' | 'control';
  content?: string;
  configuration: Record<string, any>;
  data_source?: string;
  ai_generated?: boolean;
  order_index: number;
}

export interface ReportDataSource {
  id: string;
  name: string;
  type: 'audit' | 'risk' | 'finding' | 'control' | 'compliance' | 'custom';
  entity_id?: string;
  filters?: Record<string, any>;
  mapping?: Record<string, string>;
}

export interface ReportGenerationRequest {
  template_id?: string;
  entity_type: 'audit' | 'risk' | 'finding' | 'general';
  entity_id?: string;
  title: string;
  sections: ReportSection[];
  data_sources: ReportDataSource[];
  parameters: Record<string, any>;
  ai_config?: {
    provider: string;
    model: string;
    temperature?: number;
    max_tokens?: number;
  };
  regulatory_context?: {
    frameworks?: string[];
    requirements?: string[];
    industry?: string;
  };
}

export interface ReportGenerationResponse {
  success: boolean;
  report_id?: string;
  content?: any;
  error?: string;
  ai_generated_sections?: string[];
  quality_score?: number;
}

export interface ReportQualityMetrics {
  completeness: number;
  accuracy: number;
  relevance: number;
  compliance_alignment: number;
  overall_score: number;
  recommendations: string[];
}

class ReportAIService {
  private static instance: ReportAIService;

  static getInstance(): ReportAIService {
    if (!ReportAIService.instance) {
      ReportAIService.instance = new ReportAIService();
    }
    return ReportAIService.instance;
  }

  // Generate AI-powered report content for specific sections
  async generateSectionContent(
    section: ReportSection,
    context: {
      entity_type: string;
      entity_data?: any;
      regulatory_context?: any;
      data_sources?: ReportDataSource[];
      parameters?: Record<string, any>;
    },
    aiConfig?: {
      provider: string;
      model: string;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<string> {
    try {
      // Get AI configuration
      const aiConfigurations = await aiService.getConfigurations();
      const config = aiConfig
        ? aiConfigurations.find(c => c.provider === aiConfig.provider)
        : aiConfigurations.find(c => c.is_active);

      if (!config) {
        throw new Error("No AI configuration available");
      }

      // Build context-aware prompt
      const prompt = await this.buildSectionPrompt(section, context);

      // Generate content using AI service
      const response = await aiService.generateContent({
        provider: aiConfig?.provider || config.provider,
        model: aiConfig?.model || config.model_name,
        prompt: prompt,
        context: JSON.stringify(context),
        fieldType: "description", // Use existing field type for report generation
        auditData: context.entity_data || {},
        temperature: aiConfig?.temperature || 0.7,
        maxTokens: aiConfig?.max_tokens || 1000,
      });

      if (!response.success) {
        throw new Error(response.error || "AI generation failed");
      }

      return response.content;
    } catch (error) {
      console.error("Error generating section content:", error);
      throw error;
    }
  }

  // Generate complete report with AI enhancement
  async generateReport(
    request: ReportGenerationRequest
  ): Promise<ReportGenerationResponse> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("User not authenticated");
      }

      // Get entity data if entity_id is provided
      let entityData = null;
      if (request.entity_id && request.entity_type !== 'general') {
        entityData = await this.getEntityData(request.entity_type, request.entity_id);
      }

      // Generate AI content for eligible sections
      const enhancedSections = await Promise.all(
        request.sections.map(async (section) => {
          if (section.configuration.ai_enabled && request.ai_config) {
            try {
              const aiContent = await this.generateSectionContent(section, {
                entity_type: request.entity_type,
                entity_data: entityData,
                regulatory_context: request.regulatory_context,
                data_sources: request.data_sources,
                parameters: request.parameters,
              }, request.ai_config);

              return {
                ...section,
                content: aiContent,
                ai_generated: true,
              };
            } catch (error) {
              console.warn(`AI generation failed for section ${section.name}:`, error);
              return section; // Return original section if AI fails
            }
          }
          return section;
        })
      );

      // Create report record
      const reportData = {
        title: request.title,
        entity_type: request.entity_type,
        entity_id: request.entity_id,
        template_id: request.template_id,
        sections: enhancedSections,
        data_sources: request.data_sources,
        parameters: request.parameters,
        regulatory_context: request.regulatory_context,
        ai_generated_sections: enhancedSections
          .filter(s => s.ai_generated)
          .map(s => s.id),
        created_by: user.user.id,
      };

      const { data: report, error } = await supabase
        .from('generated_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      // Calculate quality metrics
      const qualityMetrics = await this.calculateReportQuality(enhancedSections, request);

      return {
        success: true,
        report_id: report.id,
        content: {
          sections: enhancedSections,
          metadata: reportData,
          quality_metrics: qualityMetrics,
        },
        ai_generated_sections: reportData.ai_generated_sections,
        quality_score: qualityMetrics.overall_score,
      };

    } catch (error) {
      console.error("Error generating report:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Report generation failed",
      };
    }
  }

  // Generate executive summary with AI
  async generateExecutiveSummary(
    reportData: {
      title: string;
      entity_type: string;
      entity_data?: any;
      key_findings?: string[];
      recommendations?: string[];
      regulatory_context?: any;
    },
    aiConfig?: { provider: string; model: string; temperature?: number }
  ): Promise<string> {
    try {
      const prompt = `You are an expert GRC professional writing an executive summary for a ${reportData.entity_type} report.

REPORT DETAILS:
- Title: ${reportData.title}
- Type: ${reportData.entity_type}
- Entity Data: ${JSON.stringify(reportData.entity_data || {})}

KEY FINDINGS:
${(reportData.key_findings || []).map(f => `- ${f}`).join('\n')}

RECOMMENDATIONS:
${(reportData.recommendations || []).map(r => `- ${r}`).join('\n')}

REGULATORY CONTEXT:
${JSON.stringify(reportData.regulatory_context || {})}

Write a comprehensive executive summary that:
1. Provides high-level overview of the ${reportData.entity_type}
2. Summarizes key findings and their business impact
3. Highlights critical issues requiring attention
4. Presents actionable recommendations
5. Considers regulatory compliance implications
6. Uses professional business language suitable for senior executives
7. Is concise but comprehensive (200-400 words)

Focus on strategic implications and business value.`;

      const aiConfigurations = await aiService.getConfigurations();
      const config = aiConfig
        ? aiConfigurations.find(c => c.provider === aiConfig.provider)
        : aiConfigurations.find(c => c.is_active);

      if (!config) {
        throw new Error("No AI configuration available");
      }

      const response = await aiService.generateContent({
        provider: aiConfig?.provider || config.provider,
        model: aiConfig?.model || config.model_name,
        prompt: prompt,
        context: "Executive summary generation for GRC report",
        fieldType: "description",
        auditData: { title: reportData.title, audit_type: reportData.entity_type },
        temperature: aiConfig?.temperature || 0.7,
        maxTokens: 800,
      });

      if (!response.success) {
        throw new Error(response.error || "AI generation failed");
      }

      return response.content;
    } catch (error) {
      console.error("Error generating executive summary:", error);
      throw error;
    }
  }

  // Generate report recommendations with AI
  async generateRecommendations(
    context: {
      entity_type: string;
      findings: Array<{
        severity: string;
        description: string;
        impact: string;
      }>;
      current_controls?: Array<{
        effectiveness: string;
        description: string;
      }>;
      regulatory_requirements?: string[];
    },
    aiConfig?: { provider: string; model: string; temperature?: number }
  ): Promise<Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    timeframe: string;
    recommendation: string;
    rationale: string;
    responsible_party: string;
  }>> {
    try {
      const prompt = `You are a senior GRC consultant providing actionable recommendations for a ${context.entity_type} assessment.

CURRENT SITUATION:
${context.findings.map(f => `- ${f.severity.toUpperCase()}: ${f.description} (Impact: ${f.impact})`).join('\n')}

CURRENT CONTROLS:
${(context.current_controls || []).map(c => `- ${c.effectiveness}: ${c.description}`).join('\n')}

REGULATORY REQUIREMENTS:
${(context.regulatory_requirements || []).join(', ')}

Provide 4-6 prioritized recommendations that:
1. Address the most critical findings first
2. Are specific, measurable, and actionable
3. Include realistic timeframes for implementation
4. Consider resource requirements and responsible parties
5. Align with regulatory requirements where applicable
6. Provide clear rationale for each recommendation

Format your response as JSON array with this structure:
[
  {
    "priority": "critical|high|medium|low",
    "timeframe": "immediate|short-term|medium-term|long-term",
    "recommendation": "Specific actionable recommendation",
    "rationale": "Explanation of why this recommendation is needed",
    "responsible_party": "Who should implement this"
  }
]

Focus on practical, implementable solutions that provide real business value.`;

      const aiConfigurations = await aiService.getConfigurations();
      const config = aiConfig
        ? aiConfigurations.find(c => c.provider === aiConfig.provider)
        : aiConfigurations.find(c => c.is_active);

      if (!config) {
        throw new Error("No AI configuration available");
      }

      const response = await aiService.generateContent({
        provider: aiConfig?.provider || config.provider,
        model: aiConfig?.model || config.model_name,
        prompt: prompt,
        context: "Recommendations generation for GRC assessment",
        fieldType: "description",
        auditData: { audit_type: context.entity_type },
        temperature: aiConfig?.temperature || 0.6,
        maxTokens: 1200,
      });

      if (!response.success) {
        throw new Error(response.error || "AI generation failed");
      }

      // Parse JSON response
      try {
        const recommendations = JSON.parse(response.content);
        return Array.isArray(recommendations) ? recommendations : [];
      } catch (parseError) {
        console.warn("Failed to parse AI recommendations as JSON:", parseError);
        return [];
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  }

  // Get entity data for report context
  private async getEntityData(entityType: string, entityId: string): Promise<any> {
    try {
      let tableName: string;
      let selectFields: string;

      switch (entityType) {
        case 'audit':
          tableName = 'audits';
          selectFields = `
            *,
            business_units(name, code),
            lead_auditor:users!lead_auditor_id(first_name, last_name, email),
            audit_objectives(*),
            audit_team_members(users(first_name, last_name, email))
          `;
          break;
        case 'risk':
          tableName = 'risks';
          selectFields = `
            *,
            risk_categories(name),
            business_units(name, code),
            owner:users!owner_id(first_name, last_name, email)
          `;
          break;
        case 'finding':
          tableName = 'findings';
          selectFields = `
            *,
            audit:audits(title),
            assigned_to_user:users!assigned_to(first_name, last_name, email)
          `;
          break;
        default:
          return null;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq('id', entityId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching entity data:", error);
      return null;
    }
  }

  // Calculate report quality metrics
  private async calculateReportQuality(
    sections: ReportSection[],
    request: ReportGenerationRequest
  ): Promise<ReportQualityMetrics> {
    // This is a simplified version - in a real implementation, this could use AI
    // to analyze the report content for quality metrics

    const aiGeneratedSections = sections.filter(s => s.ai_generated).length;
    const totalSections = sections.length;

    const completeness = totalSections > 0 ? (aiGeneratedSections / totalSections) * 100 : 0;

    // Basic quality scoring based on content length and structure
    const accuracy = 70; // Base score
    let relevance = 75; // Base score
    let compliance_alignment = 80; // Base score

    // Adjust scores based on regulatory context
    if (request.regulatory_context?.frameworks?.length) {
      compliance_alignment += 10;
    }

    // Adjust scores based on data sources
    if (request.data_sources?.length) {
      relevance += 10;
    }

    const overall_score = (completeness + accuracy + relevance + compliance_alignment) / 4;

    const recommendations = [];
    if (completeness < 50) {
      recommendations.push("Consider adding more AI-generated content for comprehensive coverage");
    }
    if (compliance_alignment < 70) {
      recommendations.push("Review regulatory mappings to ensure compliance alignment");
    }
    if (relevance < 70) {
      recommendations.push("Consider adding more specific data sources for better relevance");
    }

    return {
      completeness,
      accuracy,
      relevance,
      compliance_alignment,
      overall_score,
      recommendations,
    };
  }

  // Build section-specific prompts
  private async buildSectionPrompt(
    section: ReportSection,
    context: {
      entity_type: string;
      entity_data?: any;
      regulatory_context?: any;
      data_sources?: ReportDataSource[];
      parameters?: Record<string, any>;
    }
  ): Promise<string> {
    const baseContext = `
ENTITY TYPE: ${context.entity_type}
ENTITY DATA: ${JSON.stringify(context.entity_data || {})}
REGULATORY CONTEXT: ${JSON.stringify(context.regulatory_context || {})}
PARAMETERS: ${JSON.stringify(context.parameters || {})}
DATA SOURCES: ${JSON.stringify(context.data_sources || [])}
    `.trim();

    switch (section.type) {
      case 'text':
        return `You are a GRC expert writing a ${section.name} section for a ${context.entity_type} report.

${baseContext}

SECTION REQUIREMENTS:
${JSON.stringify(section.configuration)}

Write a comprehensive, professional ${section.name} section that:
1. Is specifically relevant to the ${context.entity_type} context
2. Uses professional business language
3. Incorporates relevant data from the provided sources
4. Considers regulatory requirements where applicable
5. Is well-structured and easy to understand
6. Provides actionable insights

Focus on clarity, accuracy, and business value.`;

      case 'finding':
        return `You are a GRC auditor documenting findings for a ${context.entity_type} assessment.

${baseContext}

FINDING CRITERIA:
${JSON.stringify(section.configuration)}

Document findings that:
1. Are based on evidence from the assessment
2. Include clear descriptions of issues identified
3. Assess the impact and risk level
4. Provide specific recommendations
5. Are relevant to the ${context.entity_type} context
6. Follow professional auditing standards

Present findings in a clear, structured format.`;

      case 'risk':
        return `You are a risk management expert assessing risks for a ${context.entity_type} context.

${baseContext}

RISK ASSESSMENT CRITERIA:
${JSON.stringify(section.configuration)}

Assess risks that:
1. Are relevant to the ${context.entity_type} context
2. Include probability and impact analysis
3. Identify existing controls and their effectiveness
4. Provide risk mitigation recommendations
5. Consider regulatory compliance requirements
6. Follow established risk management frameworks

Use quantitative risk scoring where possible.`;

      case 'control':
        return `You are a controls expert evaluating control effectiveness for a ${context.entity_type} assessment.

${baseContext}

CONTROL EVALUATION CRITERIA:
${JSON.stringify(section.configuration)}

Evaluate controls that:
1. Are relevant to the ${context.entity_type} objectives
2. Assess design and operating effectiveness
3. Identify control gaps and weaknesses
4. Provide remediation recommendations
5. Consider automation opportunities
6. Align with regulatory requirements

Focus on practical control improvements.`;

      default:
        return `You are a GRC expert writing content for a ${section.type} section in a ${context.entity_type} report.

${baseContext}

SECTION REQUIREMENTS:
${JSON.stringify(section.configuration)}

Create content that is:
1. Professional and well-structured
2. Relevant to the ${context.entity_type} context
3. Data-driven where possible
4. Compliant with applicable regulations
5. Actionable and business-focused

Adapt your writing style to the section type and audience.`;
    }
  }

  // Template management methods
  async getTemplates(category?: string): Promise<ReportTemplate[]> {
    try {
      let query = supabase
        .from('report_templates')
        .select('*')
        .eq('is_system', false)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching report templates:", error);
      return [];
    }
  }

  async createTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReportTemplate | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('report_templates')
        .insert([{
          ...template,
          created_by: user.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating report template:", error);
      return null;
    }
  }

  async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating report template:", error);
      return null;
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting report template:", error);
      return false;
    }
  }
}

export const reportAIService = ReportAIService.getInstance();
export default reportAIService;