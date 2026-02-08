import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';
import { FileText, Target, Settings, CheckCircle, Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import {
   AuditPlanningWizardData,
   auditPlanningWizardSchema
 } from './form/validationSchemas';
import ProgressIndicator from './shared/ProgressIndicator';
import FormNavigation from './shared/FormNavigation';
import ErrorDisplay from './shared/ErrorDisplay';
import PlanDetailsStep from './PlanDetailsStep';
import ObjectivesStep from './ObjectivesStep';
import PlanItemsStep from './PlanItemsStep';
import ReviewStep from './ReviewStep';
import { useFormPersistence } from './shared/useFormPersistence';

interface ValidationError {
  field: string;
  message: string;
}

interface AuditPlanningFormProps {
  onSave: (data: AuditPlanningWizardData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<AuditPlanningWizardData>;
}

const steps = [
  { id: 1, name: 'Plan Details', icon: FileText },
  { id: 2, name: 'Strategic Objectives', icon: Target },
  { id: 3, name: 'Audit Plan Items', icon: Settings },
  { id: 4, name: 'Review & Submit', icon: CheckCircle },
];

const AuditPlanningForm: React.FC<AuditPlanningFormProps> = ({
   onSave,
   isLoading = false,
   initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const form = useForm<AuditPlanningWizardData>({
    resolver: zodResolver(auditPlanningWizardSchema),
    defaultValues: {
      planData: {
        plan_name: '',
        plan_type: 'annual',
        plan_year: new Date().getFullYear(),
        description: '',
        strategic_objectives: [],
        total_budget: undefined,
        risk_based_coverage_percentage: undefined,
        compliance_coverage_percentage: undefined,
      },
      planItems: [],
      ...initialData,
    },
  });

  const { handleSubmit, trigger, formState: { errors, isValid }, watch } = form;

  // Form persistence
  const {
    saveFormData,
    loadFormData,
    clearFormData,
    hasSavedData,
  } = useFormPersistence({
    form,
    storageKey: 'audit-planning-form-draft',
    autoSave: true,
    autoSaveDelay: 3000, // Auto-save every 3 seconds
  });

  // Watch form data for validation
  const watchedPlanData = watch('planData');
  const watchedPlanItems = watch('planItems');
  const watchedObjectives = watch('planData.strategic_objectives');

  // Memoize canGoNext to prevent unnecessary re-calculations
  const canGoNextValue = React.useMemo(() => {
    console.log('🔍 canGoNextValue recalculating for step:', currentStep);
    switch (currentStep) {
      case 1:
        console.log('📋 Step 1 validation - watchedPlanData:', watchedPlanData);
        console.log('📝 plan_name:', watchedPlanData?.plan_name, 'plan_type:', watchedPlanData?.plan_type, 'plan_year:', watchedPlanData?.plan_year);
        const planNameValid = watchedPlanData?.plan_name && watchedPlanData.plan_name.length >= 3;
        const planTypeValid = watchedPlanData?.plan_type;
        const planYearValid = watchedPlanData?.plan_year && watchedPlanData.plan_year >= new Date().getFullYear();
        const canGo = !!(planNameValid && planTypeValid && planYearValid);
        console.log('✅ Can go next (step 1):', canGo, '(name:', planNameValid, 'type:', planTypeValid, 'year:', planYearValid, ')');
        return {
          canGo,
          errors: {
            planName: !planNameValid ? 'Plan name is required and must be at least 3 characters long' : null,
            planType: !planTypeValid ? 'Plan type is required' : null,
            planYear: !planYearValid ? 'Plan year is required and must be greater than or equal to the current year' : null,
          },
        };
      case 2:
        console.log('🎯 Step 2 validation - watchedObjectives:', watchedObjectives);
        console.log('🎯 Step 2 validation - watchedPlanData?.strategic_objectives:', watchedPlanData?.strategic_objectives);

        const objectives = watchedObjectives || watchedPlanData?.strategic_objectives;
        console.log('🎯 Step 2 validation - final objectives:', objectives);
        console.log('🎯 Step 2 validation - objectives length:', objectives?.length);

        // Check that we have at least one objective and each objective meets minimum length requirement
        const hasValidObjectives = !!(objectives &&
          Array.isArray(objectives) &&
          objectives.length > 0 &&
          objectives.every(obj => obj && typeof obj === 'string' && obj.length >= 10));

        console.log('✅ Can go next (step 2):', hasValidObjectives, {
          hasObjectives: !!objectives,
          isArray: Array.isArray(objectives),
          length: objectives?.length,
          allValidLength: objectives?.every(obj => obj && obj.length >= 10)
        });
        return {
          canGo: hasValidObjectives,
          errors: {
            objectives: !hasValidObjectives ? 'At least one objective is required and must be at least 10 characters long' : null,
          },
        };
      case 3:
        console.log('📊 Step 3 validation - watchedPlanItems:', watchedPlanItems);
        console.log('📊 Step 3 validation - watchedPlanItems length:', watchedPlanItems?.length);

        // Check if we have any plan items at all
        if (!watchedPlanItems || !Array.isArray(watchedPlanItems) || watchedPlanItems.length === 0) {
          return {
            canGo: false,
            errors: {
              noItems: 'En az bir audit plan item eklemeniz gerekiyor. "Add Item" butonuna tıklayarak yeni audit planı oluşturabilirsiniz.',
            },
          };
        }

        // Check each item for required fields
        const errors: Record<string, string> = {};
        let hasValidItems = true;

        watchedPlanItems.forEach((item, index) => {
          if (!item) {
            hasValidItems = false;
            errors[`item${index}`] = `${index + 1}. audit item için gerekli bilgiler eksik`;
            return;
          }

          if (!item.audit_title || item.audit_title.length < 3) {
            hasValidItems = false;
            errors[`item${index}_title`] = `${index + 1}. audit için başlık en az 3 karakter olmalıdır`;
          }

          if (!item.audit_type) {
            hasValidItems = false;
            errors[`item${index}_type`] = `${index + 1}. audit için tür seçilmelidir`;
          }

          if (!item.priority_level) {
            hasValidItems = false;
            errors[`item${index}_priority`] = `${index + 1}. audit için öncelik seviyesi seçilmelidir`;
          }

          if (!item.planned_hours || item.planned_hours < 1) {
            hasValidItems = false;
            errors[`item${index}_hours`] = `${index + 1}. audit için en az 1 saat planlanmalıdır`;
          }

          if (!item.lead_auditor_id) {
            hasValidItems = false;
            errors[`item${index}_auditor`] = `${index + 1}. audit için baş denetçi seçilmelidir`;
          }

          if (!item.team_size || item.team_size < 1) {
            hasValidItems = false;
            errors[`item${index}_team`] = `${index + 1}. audit için ekip büyüklüğü en az 1 olmalıdır`;
          }
        });

        return {
          canGo: hasValidItems,
          errors,
        };
      case 4:
        console.log('🏁 Step 4 validation - isValid:', isValid);
        return {
          canGo: isValid,
          errors: {},
        };
      default:
        return {
          canGo: true,
          errors: {},
        };
    }
  }, [currentStep, watchedPlanData, watchedPlanItems, watchedObjectives, isValid]);

  // Update validation errors when canGoNextValue changes
  useEffect(() => {
    const errors: ValidationError[] = [];

    Object.entries(canGoNextValue.errors).forEach(([key, message]) => {
      if (message) {
        errors.push({
          field: key,
          message,
        });
      }
    });

    setValidationErrors(errors);
  }, [canGoNextValue]);

  // Load users and business units
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('is_active', true)
          .order('first_name');

        if (usersError) {
          console.error('Error loading users:', usersError);
          toast.error('Failed to load users');
        } else {
          setUsers(usersData || []);
        }

        // Load business units
        const { data: businessUnitsData, error: businessUnitsError } = await supabase
          .from('business_units')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (businessUnitsError) {
          console.error('Error loading business units:', businessUnitsError);
          toast.error('Failed to load business units');
        } else {
          setBusinessUnits(businessUnitsData || []);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        toast.error('Failed to load form data');
      }
    };

    loadData();
  }, []);

  const handleNextStep = async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid.canGo) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = async (): Promise<{ canGo: boolean; errors: Record<string, string> }> => {
    console.log('🔍 validateCurrentStep called for step:', currentStep);

    switch (currentStep) {
      case 1:
        const step1Valid = await trigger(['planData.plan_name', 'planData.plan_type', 'planData.plan_year'] as any);
        console.log('🔍 Step 1 validation result:', step1Valid);
        return {
          canGo: step1Valid,
          errors: {},
        };
      case 2:
        console.log('🔍 Validating step 2 - strategic_objectives field');
        console.log('🔍 Current form values:', watchedPlanData);
        const step2Valid = await trigger(['planData.strategic_objectives'] as any);
        console.log('🔍 Step 2 validation result:', step2Valid);
        console.log('🔍 Step 2 errors:', errors.planData?.strategic_objectives);
        return {
          canGo: step2Valid,
          errors: {},
        };
      case 3:
        console.log('🔍 Validating step 3 - planItems field');
        console.log('🔍 Current planItems:', watchedPlanItems);

        // For array validation, we need to check if the array exists and has valid items
        // The trigger function might not work correctly with complex array validation
        const hasValidPlanItems = !!(watchedPlanItems &&
          Array.isArray(watchedPlanItems) &&
          watchedPlanItems.length > 0 &&
          watchedPlanItems.every(item =>
            item &&
            item.audit_title &&
            item.audit_title.length >= 3 &&
            item.audit_type &&
            ['financial', 'operational', 'compliance', 'it', 'security', 'risk', 'quality', 'environmental', 'internal', 'external'].includes(item.audit_type) &&
            item.priority_level &&
            ['critical', 'high', 'medium', 'low'].includes(item.priority_level) &&
            item.planned_hours &&
            item.planned_hours >= 1 &&
            item.lead_auditor_id &&
            item.lead_auditor_id.length >= 1 &&
            item.team_size &&
            item.team_size >= 1
          ));

        console.log('🔍 Step 3 validation result (manual):', hasValidPlanItems);
        console.log('🔍 Step 3 validation details:', {
          hasItems: !!watchedPlanItems,
          isArray: Array.isArray(watchedPlanItems),
          length: watchedPlanItems?.length,
          allValid: watchedPlanItems?.every(item =>
            item && item.audit_title && item.audit_type && item.priority_level
          )
        });

        return {
          canGo: hasValidPlanItems,
          errors: {},
        };
      case 4:
        const step4Valid = await trigger(['planData', 'planItems'] as any);
        console.log('🔍 Step 4 validation result:', step4Valid);
        return {
          canGo: step4Valid,
          errors: {},
        };
      default:
        return {
          canGo: true,
          errors: {},
        };
    }
  };

  const onSubmit = async (data: AuditPlanningWizardData) => {
    try {
      await onSave(data);
      // Clear saved draft on successful submission
      clearFormData();
    } catch (error) {
      console.error('Error saving audit plan:', error);
      // Error is handled by the parent component
    }
  };

  const handleSaveDraft = () => {
    const success = saveFormData();
    if (success) {
      toast.success('Draft saved successfully');
    } else {
      toast.error('Failed to save draft');
    }
  };

  const handleLoadDraft = () => {
    const success = loadFormData();
    if (success) {
      toast.success('Draft loaded successfully');
    } else {
      toast.error('No saved draft found');
    }
  };

  const handleClearDraft = () => {
    const success = clearFormData();
    if (success) {
      toast.success('Draft cleared');
      // Reset form to initial state
      form.reset({
        planData: {
          plan_name: '',
          plan_type: 'annual',
          plan_year: new Date().getFullYear(),
          description: '',
          strategic_objectives: [],
          total_budget: undefined,
          risk_based_coverage_percentage: undefined,
          compliance_coverage_percentage: undefined,
        },
        planItems: [],
      });
    } else {
      toast.error('Failed to clear draft');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PlanDetailsStep form={form as any} />;
      case 2:
        return <ObjectivesStep form={form as any} />;
      case 3:
        return <PlanItemsStep form={form} users={users} businessUnits={businessUnits} />;
      case 4:
        return <ReviewStep form={form} users={users} businessUnits={businessUnits} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Audit Plan
          </h1>
          <p className="mt-2 text-gray-600">
            Define your strategic audit planning and resource allocation
          </p>

          {/* Draft Management */}
          {hasSavedData() && (
            <div className="mt-4 flex justify-center space-x-3">
              <button
                type="button"
                onClick={handleLoadDraft}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Load Draft</span>
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <span>Clear Draft</span>
              </button>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        {/* Error Display */}
        <ErrorDisplay
          errors={errors}
          validationErrors={validationErrors}
          onDismiss={(field) => {
            // Clear specific field error if needed
            form.clearErrors(field as any);
          }}
        />

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Form Navigation */}
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={handlePrevStep}
          onNext={handleNextStep}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isLoading}
          isValid={isValid}
          canGoNext={canGoNextValue.canGo}
          validationErrors={validationErrors}
        />
      </form>
    </div>
  );
};

export default AuditPlanningForm;
