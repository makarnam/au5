import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, X } from 'lucide-react';
import { UseFormReturn, useFieldArray, FieldArrayPath, useWatch } from 'react-hook-form';
import { AuditPlanningWizardData } from './form/validationSchemas';
import AIGenerator from './shared/AIGenerator';
import { AuditPlanningAIGenerationData } from './form/aiGenerators';

interface ObjectivesStepProps {
  form: UseFormReturn<AuditPlanningWizardData>;
}

const ObjectivesStep: React.FC<ObjectivesStepProps> = ({ form }) => {
  const { control, formState: { errors }, watch, setValue } = form;
  const [currentObjective, setCurrentObjective] = useState('');

  // Watch form values for AI generation
  const planName = watch('planData.plan_name');
  const planType = watch('planData.plan_type');
  const planYear = watch('planData.plan_year');
  const description = watch('planData.description');
  const existingObjectives = watch('planData.strategic_objectives') || [];

  const aiData: AuditPlanningAIGenerationData = {
    plan_name: planName,
    plan_type: planType,
    plan_year: planYear,
    description: description,
    strategic_objectives: existingObjectives,
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "planData.strategic_objectives" as FieldArrayPath<AuditPlanningWizardData>,
  });

  const addObjective = () => {
    if (currentObjective.trim()) {
      console.log('📝 Adding objective:', currentObjective.trim());
      (append as any)(currentObjective.trim());
      setCurrentObjective('');
      console.log('📝 Current fields after append:', fields.length);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addObjective();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Strategic Objectives *
        </label>

        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={currentObjective}
            onChange={(e) => setCurrentObjective(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Add a strategic objective..."
          />
          <button
            type="button"
            onClick={addObjective}
            disabled={!currentObjective.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
          <AIGenerator
            fieldType="objectives"
            auditPlanningData={aiData}
            onGenerated={(objectives: string[]) => {
              const existingObjectives = watch('planData.strategic_objectives') || [];
              // Append new objectives to existing ones
              setValue('planData.strategic_objectives', [...existingObjectives, ...objectives]);
            }}
            currentValue={fields}
          />
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <input
                {...form.register(`planData.strategic_objectives.${index}` as const)}
                type="text"
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500"
                placeholder={`Objective ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No strategic objectives added yet.</p>
            <p className="text-sm">Add your first objective above to get started.</p>
          </div>
        )}

        {(errors.planData as any)?.strategic_objectives && (
          <p className="mt-2 text-sm text-red-600">{(errors.planData as any)?.strategic_objectives?.message}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Strategic Objectives Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Define high-level goals for the audit plan</li>
              <li>• Align with organizational risk management objectives</li>
              <li>• Consider regulatory compliance requirements</li>
              <li>• Include resource optimization goals</li>
              <li>• Address stakeholder expectations</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ObjectivesStep;