import { aiService } from '../../../services/aiService';

export interface AuditPlanningAIGenerationData {
  plan_name?: string;
  plan_type?: string;
  plan_year?: number;
  business_unit?: string;
  description?: string;
  strategic_objectives?: string[];
}

export const generateStrategicObjectives = async (
  auditPlanningData: AuditPlanningAIGenerationData,
  onSuccess: (objectives: string[]) => void,
  onError: (error: string) => void
) => {
  try {
    const configurations = await aiService.getConfigurations();
    if (configurations.length === 0) {
      throw new Error('No AI configuration found. Please configure AI settings first.');
    }

    const selectedConfig = configurations[0];

    const existingObjectives = auditPlanningData.strategic_objectives || [];
    const existingCount = existingObjectives.length;

    const context = `Generate strategic objectives for an audit plan with the following details:
- Plan Name: ${auditPlanningData.plan_name || 'Audit Plan'}
- Plan Type: ${auditPlanningData.plan_type || 'Annual'}
- Plan Year: ${auditPlanningData.plan_year || new Date().getFullYear()}
- Description: ${auditPlanningData.description || 'No description provided'}

${existingCount > 0 ? `Existing strategic objectives (${existingCount}):
${existingObjectives.map((obj, index) => `${index + 1}. ${obj}`).join('\n')}

Please generate ${5 - existingCount} additional strategic objectives that complement the existing ones and ensure a comprehensive audit plan. ` : 'Please generate 3-5 comprehensive strategic objectives that would be appropriate for this audit plan. '}

Each objective should be specific, measurable, and aligned with audit planning best practices. Avoid duplicating the existing objectives if any exist.`;

    const response = await aiService.generateContent({
      provider: selectedConfig.provider,
      model: selectedConfig.model_name,
      prompt: '',
      context,
      fieldType: 'objectives',
      auditData: auditPlanningData,
      temperature: selectedConfig.temperature,
      maxTokens: selectedConfig.max_tokens,
      apiKey: selectedConfig.api_key,
      baseUrl: selectedConfig.api_endpoint,
    });

    if (response.success) {
      let generatedObjectives: string[] = [];

      if (typeof response.content === 'string') {
        try {
          const parsed = JSON.parse(response.content);
          if (Array.isArray(parsed)) {
            generatedObjectives = parsed;
          } else {
            generatedObjectives = response.content
              .split('\n')
              .filter((line) => line.trim())
              .map((line) =>
                line
                  .replace(/^[-•*]\s*/, '')
                  .replace(/^\d+\.\s*/, '')
                  .trim(),
              )
              .filter((line) => line.length > 10);
          }
        } catch {
          generatedObjectives = response.content
            .split('\n')
            .filter((line) => line.trim())
            .map((line) =>
              line
                .replace(/^[-•*]\s*/, '')
                .replace(/^\d+\.\s*/, '')
                .trim(),
            )
            .filter((line) => line.length > 10);
        }
      } else if (Array.isArray(response.content)) {
        generatedObjectives = response.content;
      }

      onSuccess(generatedObjectives);

      // Log the generation
      await aiService.logGeneration(
        {
          provider: selectedConfig.provider,
          model: selectedConfig.model_name,
          prompt: '',
          context,
          fieldType: 'objectives',
          auditData: auditPlanningData,
          temperature: selectedConfig.temperature,
          maxTokens: selectedConfig.max_tokens,
          apiKey: selectedConfig.api_key,
          baseUrl: selectedConfig.api_endpoint,
        },
        response,
      );
    } else {
      throw new Error(response.error || 'AI generation failed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onError(errorMessage);
  }
};

export const generatePlanDescription = async (
  auditPlanningData: AuditPlanningAIGenerationData,
  onSuccess: (description: string) => void,
  onError: (error: string) => void
) => {
  try {
    const configurations = await aiService.getConfigurations();
    if (configurations.length === 0) {
      throw new Error('No AI configuration found. Please configure AI settings first.');
    }

    const selectedConfig = configurations[0];

    const context = `Generate a comprehensive description for an audit plan with the following details:
- Plan Name: ${auditPlanningData.plan_name || 'Audit Plan'}
- Plan Type: ${auditPlanningData.plan_type || 'Annual'}
- Plan Year: ${auditPlanningData.plan_year || new Date().getFullYear()}
- Business Unit: ${auditPlanningData.business_unit || 'General'}

Please write a professional, detailed description (200-400 words) that explains the purpose, scope, and strategic importance of this audit plan. Include information about risk management, compliance objectives, and resource allocation considerations.`;

    const response = await aiService.generateContent({
      provider: selectedConfig.provider,
      model: selectedConfig.model_name,
      prompt: '',
      context,
      fieldType: 'description',
      auditData: auditPlanningData,
      temperature: selectedConfig.temperature,
      maxTokens: selectedConfig.max_tokens,
      apiKey: selectedConfig.api_key,
      baseUrl: selectedConfig.api_endpoint,
    });

    if (response.success) {
      const description = typeof response.content === 'string' ? response.content : String(response.content);
      onSuccess(description);

      // Log the generation
      await aiService.logGeneration(
        {
          provider: selectedConfig.provider,
          model: selectedConfig.model_name,
          prompt: '',
          context,
          fieldType: 'description',
          auditData: auditPlanningData,
          temperature: selectedConfig.temperature,
          maxTokens: selectedConfig.max_tokens,
          apiKey: selectedConfig.api_key,
          baseUrl: selectedConfig.api_endpoint,
        },
        response,
      );
    } else {
      throw new Error(response.error || 'AI generation failed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onError(errorMessage);
  }
};

export const generateAuditPlanItem = async (
  auditPlanningData: AuditPlanningAIGenerationData,
  auditType: string,
  onSuccess: (planItem: Partial<{
    audit_title: string;
    planned_hours: number;
    team_size: number;
    audit_frequency_months: number;
  }>) => void,
  onError: (error: string) => void
) => {
  try {
    const configurations = await aiService.getConfigurations();
    if (configurations.length === 0) {
      throw new Error('No AI configuration found. Please configure AI settings first.');
    }

    const selectedConfig = configurations[0];

    const context = `Generate details for a ${auditType} audit within an audit plan with the following context:
- Plan Name: ${auditPlanningData.plan_name || 'Audit Plan'}
- Plan Type: ${auditPlanningData.plan_type || 'Annual'}
- Plan Year: ${auditPlanningData.plan_year || new Date().getFullYear()}
- Business Unit: ${auditPlanningData.business_unit || 'General'}

Please suggest:
1. A descriptive audit title for this ${auditType} audit
2. Estimated hours required (realistic range based on audit type)
3. Recommended team size
4. Appropriate audit frequency in months

Return the response as a JSON object with keys: audit_title, planned_hours, team_size, audit_frequency_months.`;

    const response = await aiService.generateContent({
      provider: selectedConfig.provider,
      model: selectedConfig.model_name,
      prompt: '',
      context,
      fieldType: 'description',
      auditData: { ...auditPlanningData, audit_type: auditType },
      temperature: selectedConfig.temperature,
      maxTokens: selectedConfig.max_tokens,
      apiKey: selectedConfig.api_key,
      baseUrl: selectedConfig.api_endpoint,
    });

    if (response.success) {
      let planItemData: any = {};

      if (typeof response.content === 'string') {
        try {
          planItemData = JSON.parse(response.content);
        } catch {
          // If JSON parsing fails, create a basic structure
          planItemData = {
            audit_title: `${auditType.charAt(0).toUpperCase() + auditType.slice(1)} Audit`,
            planned_hours: 40,
            team_size: 1,
            audit_frequency_months: 12,
          };
        }
      } else if (typeof response.content === 'object') {
        planItemData = response.content;
      }

      onSuccess({
        audit_title: planItemData.audit_title || `${auditType.charAt(0).toUpperCase() + auditType.slice(1)} Audit`,
        planned_hours: planItemData.planned_hours || 40,
        team_size: planItemData.team_size || 1,
        audit_frequency_months: planItemData.audit_frequency_months || 12,
      });

      // Log the generation
      await aiService.logGeneration(
        {
          provider: selectedConfig.provider,
          model: selectedConfig.model_name,
          prompt: '',
          context,
          fieldType: 'description',
          auditData: { ...auditPlanningData, audit_type: auditType },
          temperature: selectedConfig.temperature,
          maxTokens: selectedConfig.max_tokens,
          apiKey: selectedConfig.api_key,
          baseUrl: selectedConfig.api_endpoint,
        },
        response,
      );
    } else {
      throw new Error(response.error || 'AI generation failed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onError(errorMessage);
  }
};