import { supabase } from "../../lib/supabase";
import type { AITemplate, TemplateSelectionCriteria, AIGenerationRequest } from "./types";

export class AITemplatesService {
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

  async findBestTemplate(request: AIGenerationRequest): Promise<AITemplate | null> {
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

  processTemplate(template: AITemplate, request: AIGenerationRequest): string {
    let prompt = template.template_content;

    // Handle undefined auditData gracefully
    const safeAuditData = request.auditData || {};

    // Replace template variables with actual values
    const auditInfo = `
Audit Information:
- Title: ${safeAuditData.title || "Not specified"}
- Type: ${safeAuditData.audit_type || "Not specified"}
- Business Unit: ${safeAuditData.business_unit || "Not specified"}
- Existing Scope: ${safeAuditData.scope || "Not specified"}
    `.trim();

    // Replace common placeholders
    prompt = prompt.replace(/\{\{title\}\}/g, safeAuditData.title || "Not specified");
    prompt = prompt.replace(/\{\{audit_type\}\}/g, safeAuditData.audit_type || "Not specified");
    prompt = prompt.replace(/\{\{business_unit\}\}/g, safeAuditData.business_unit || "Not specified");
    prompt = prompt.replace(/\{\{scope\}\}/g, safeAuditData.scope || "Not specified");
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
}

export const aiTemplatesService = new AITemplatesService();