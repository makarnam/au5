import React from 'react';
import { motion } from 'framer-motion';
import { FileText, DollarSign } from 'lucide-react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { AuditPlanFormData } from './form/validationSchemas';
import AIGenerator from './shared/AIGenerator';
import { AuditPlanningAIGenerationData } from './form/aiGenerators';

interface PlanDetailsStepProps {
  form: UseFormReturn<any>;
}

const PlanDetailsStep: React.FC<PlanDetailsStepProps> = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const planDataErrors = errors.planData || {};

  // Watch form values for AI generation
  const planName = watch('planData.plan_name');
  const planType = watch('planData.plan_type');
  const planYear = watch('planData.plan_year');

  const aiData: AuditPlanningAIGenerationData = {
    plan_name: planName,
    plan_type: planType,
    plan_year: planYear,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Required Fields Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Required Fields for Step 1
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Plan Name</strong> - Enter a descriptive name for your audit plan</li>
              <li>• <strong>Plan Type</strong> - Select Annual, Multi-Year, or Strategic</li>
              <li>• <strong>Plan Year</strong> - The year this plan covers (auto-filled)</li>
            </ul>
            <p className="text-xs text-blue-700 mt-2">
              Fill in all required fields to enable the Next button.
            </p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plan Name *
        </label>
        <input
          {...register("planData.plan_name")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="e.g., 2024 Annual Audit Plan"
        />
        {(planDataErrors as any)?.plan_name && (
          <p className="mt-1 text-sm text-red-600">{(planDataErrors as any)?.plan_name?.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Type *
          </label>
          <select
            {...register("planData.plan_type")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="annual">Annual</option>
            <option value="multi_year">Multi-Year</option>
            <option value="strategic">Strategic</option>
          </select>
          {(planDataErrors as any)?.plan_type && (
            <p className="mt-1 text-sm text-red-600">{(planDataErrors as any)?.plan_type?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Year *
          </label>
          <input
            {...register("planData.plan_year", { valueAsNumber: true })}
            type="number"
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {(planDataErrors as any)?.plan_year && (
            <p className="mt-1 text-sm text-red-600">{(planDataErrors as any)?.plan_year?.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register("planData.description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Describe the audit plan objectives and scope..."
        />
        {(planDataErrors as any)?.description && (
          <p className="mt-1 text-sm text-red-600">{(planDataErrors as any)?.description?.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Budget
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              {...register("planData.total_budget", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="0.00"
            />
          </div>
          {(planDataErrors as any)?.total_budget && (
            <p className="mt-1 text-sm text-red-600">{(planDataErrors as any)?.total_budget?.message}</p>
          )}
        </div>

        <div className="flex items-end">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk-Based Coverage %
            </label>
            <div className="relative">
              <input
                {...register("planData.risk_based_coverage_percentage", { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="0"
              />
              <span className="absolute right-3 top-2.5 text-gray-500">%</span>
            </div>
            {(planDataErrors as any)?.risk_based_coverage_percentage && (
              <p className="mt-1 text-sm text-red-600">{(planDataErrors as any)?.risk_based_coverage_percentage?.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compliance Coverage %
        </label>
        <div className="relative">
          <input
            {...register("planData.compliance_coverage_percentage", { valueAsNumber: true })}
            type="number"
            min="0"
            max="100"
            step="0.1"
            className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="0"
          />
          <span className="absolute right-3 top-2.5 text-gray-500">%</span>
        </div>
        {(planDataErrors as any)?.compliance_coverage_percentage && (
          <p className="mt-1 text-sm text-red-600">{(planDataErrors as any)?.compliance_coverage_percentage?.message}</p>
        )}
      </div>
    </motion.div>
  );
};

export default PlanDetailsStep;