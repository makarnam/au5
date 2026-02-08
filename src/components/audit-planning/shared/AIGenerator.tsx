import React, { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuditPlanningAIGenerationData } from '../form/aiGenerators';

interface AIGeneratorProps {
  fieldType: 'objectives' | 'description' | 'plan_item';
  auditPlanningData: AuditPlanningAIGenerationData;
  onGenerated: (content: any) => void;
  currentValue?: any;
  className?: string;
  auditType?: string; // For plan_item generation
}

const AIGenerator: React.FC<AIGeneratorProps> = ({
  fieldType,
  auditPlanningData,
  onGenerated,
  currentValue,
  className = '',
  auditType,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let result: any = null;

      switch (fieldType) {
        case 'objectives':
          const { generateStrategicObjectives } = await import('../form/aiGenerators');
          await generateStrategicObjectives(
            auditPlanningData,
            (objectives) => {
              result = objectives;
              onGenerated(objectives);
              toast.success(`Generated ${objectives.length} strategic objectives successfully`);
            },
            (error) => {
              console.error('AI generation failed:', error);
              toast.error(`AI generation failed: ${error}`);
              // Fallback objectives
              const fallbackObjectives = [
                `Assess the effectiveness of internal controls and risk management processes`,
                `Evaluate compliance with applicable regulatory requirements and standards`,
                `Identify potential areas for operational improvements and efficiency gains`,
                `Review the adequacy of documentation and record-keeping practices`,
                `Provide recommendations for strengthening governance and oversight`,
              ];
              onGenerated(fallbackObjectives);
              toast.success('Generated fallback objectives successfully');
            }
          );
          break;

        case 'description':
          const { generatePlanDescription } = await import('../form/aiGenerators');
          await generatePlanDescription(
            auditPlanningData,
            (description) => {
              result = description;
              onGenerated(description);
              toast.success('Generated plan description successfully');
            },
            (error) => {
              console.error('AI generation failed:', error);
              toast.error(`AI generation failed: ${error}`);
              // Fallback description
              const fallbackDescription = `This audit plan outlines a comprehensive approach to assessing and improving organizational controls, compliance, and operational effectiveness. The plan focuses on strategic risk management, regulatory compliance, and operational excellence to support organizational objectives and stakeholder expectations.`;
              onGenerated(fallbackDescription);
              toast.success('Generated fallback description successfully');
            }
          );
          break;

        case 'plan_item':
          if (auditType) {
            const { generateAuditPlanItem } = await import('../form/aiGenerators');
            await generateAuditPlanItem(
              auditPlanningData,
              auditType,
              (planItem) => {
                result = planItem;
                onGenerated(planItem);
                toast.success(`Generated ${auditType} audit details successfully`);
              },
              (error) => {
                console.error('AI generation failed:', error);
                toast.error(`AI generation failed: ${error}`);
                // Fallback plan item
                const fallbackItem = {
                  audit_title: `${auditType.charAt(0).toUpperCase() + auditType.slice(1)} Audit`,
                  planned_hours: 40,
                  team_size: 1,
                  audit_frequency_months: 12,
                };
                onGenerated(fallbackItem);
                toast.success('Generated fallback audit details successfully');
              }
            );
          }
          break;
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonText = () => {
    switch (fieldType) {
      case 'objectives':
        return 'Generate Objectives';
      case 'description':
        return 'Generate Description';
      case 'plan_item':
        return 'Generate Details';
      default:
        return 'Generate';
    }
  };

  const isDisabled = isGenerating || !auditPlanningData.plan_name;

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isDisabled}
      className={`flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={!auditPlanningData.plan_name ? 'Please enter a plan name first' : 'Generate content with AI'}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bot className="w-4 h-4" />
      )}
      <span>{isGenerating ? 'Generating...' : getButtonText()}</span>
    </button>
  );
};

export default AIGenerator;