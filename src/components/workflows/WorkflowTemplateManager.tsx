import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import WorkflowStepEditor from './WorkflowStepEditor';

interface WorkflowTemplate {
  id?: string;
  name: string;
  description?: string;
  entity_type: 'audit' | 'finding' | 'control' | 'risk';
  is_active: boolean;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id?: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string | null;
  required: boolean;
  comments?: string;
}

const ENTITY_TYPES = ['audit', 'finding', 'control', 'risk'];
const AVAILABLE_ROLES = [
  'super_admin',
  'admin', 
  'cro',
  'supervisor_auditor',
  'auditor',
  'reviewer',
  'viewer',
  'business_unit_manager',
  'business_unit_user'
];

export default function WorkflowTemplateManager() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<WorkflowTemplate>({
    defaultValues: {
      name: '',
      description: '',
      entity_type: 'risk',
      is_active: true,
      steps: []
    }
  });

  const selectedEntityType = watch('entity_type');

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const templatesWithSteps = data?.map(template => ({
        ...template,
        steps: template.workflow_steps || []
      })) || [];

      setTemplates(templatesWithSteps);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load workflow templates');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: WorkflowTemplate) => {
    try {
      setError(null);

      if (selectedTemplate?.id) {
        // Update existing template
        const { error: templateError } = await supabase
          .from('workflows')
          .update({
            name: data.name,
            description: data.description,
            entity_type: data.entity_type,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTemplate.id);

        if (templateError) throw templateError;

        // Update steps
        for (const step of data.steps) {
          if (step.id) {
            await supabase
              .from('workflow_steps')
              .update({
                step_order: step.step_order,
                step_name: step.step_name,
                assignee_role: step.assignee_role,
                assignee_id: step.assignee_id,
                required: step.required,
                comments: step.comments,
                updated_at: new Date().toISOString()
              })
              .eq('id', step.id);
          } else {
            await supabase
              .from('workflow_steps')
              .insert({
                workflow_id: selectedTemplate.id,
                step_order: step.step_order,
                step_name: step.step_name,
                assignee_role: step.assignee_role,
                assignee_id: step.assignee_id,
                required: step.required,
                comments: step.comments
              });
          }
        }
      } else {
        // Create new template
        const { data: newTemplate, error: templateError } = await supabase
          .from('workflows')
          .insert({
            name: data.name,
            description: data.description,
            entity_type: data.entity_type,
            is_active: data.is_active
          })
          .select()
          .single();

        if (templateError) throw templateError;

        // Create steps
        for (const step of data.steps) {
          await supabase
            .from('workflow_steps')
            .insert({
              workflow_id: newTemplate.id,
              step_order: step.step_order,
              step_name: step.step_name,
              assignee_role: step.assignee_role,
              assignee_id: step.assignee_id,
              required: step.required,
              comments: step.comments
            });
        }
      }

      await loadTemplates();
      reset();
      setSelectedTemplate(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save workflow template');
    }
  };

  const handleEditTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    reset(template);
    setIsCreating(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this workflow template?')) {
      return;
    }

    try {
      // Delete steps first
      await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', templateId);

      // Delete template
      await supabase
        .from('workflows')
        .delete()
        .eq('id', templateId);

      await loadTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete workflow template');
    }
  };

  const addStep = () => {
    const currentSteps = watch('steps') || [];
    const newStep: WorkflowStep = {
      step_order: currentSteps.length + 1,
      step_name: '',
      assignee_role: '',
      required: true,
      comments: ''
    };
    setValue('steps', [...currentSteps, newStep]);
  };

  const removeStep = (index: number) => {
    const currentSteps = watch('steps') || [];
    const updatedSteps = currentSteps.filter((_, i) => i !== index);
    // Reorder steps
    updatedSteps.forEach((step, i) => {
      step.step_order = i + 1;
    });
    setValue('steps', updatedSteps);
  };

  const updateStep = (index: number, updatedStep: WorkflowStep) => {
    const currentSteps = watch('steps') || [];
    const updatedSteps = [...currentSteps];
    updatedSteps[index] = updatedStep;
    setValue('steps', updatedSteps);
  };

  if (loading) {
    return <div className="p-6">Loading workflow templates...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workflow Template Management</h1>
        <button
          onClick={() => {
            setIsCreating(true);
            setSelectedTemplate(null);
            reset({
              name: '',
              description: '',
              entity_type: 'risk',
              is_active: true,
              steps: []
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Template
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Existing Templates</h2>
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEditTemplate(template)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-600">
                      {template.entity_type} • {template.steps.length} steps
                    </p>
                    {template.description && (
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      template.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id!);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        {(isCreating || selectedTemplate) && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {isCreating ? 'Create New Template' : 'Edit Template'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    {...register('name', { required: 'Template name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type
                  </label>
                  <select
                    {...register('entity_type', { required: 'Entity type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ENTITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.entity_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.entity_type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Active template</span>
                </label>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Workflow Steps</h3>
                  <button
                    type="button"
                    onClick={addStep}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {(watch('steps') || []).map((step, index) => (
                    <div key={index} className="relative">
                      <WorkflowStepEditor
                        step={step}
                        onSave={(updatedStep) => updateStep(index, updatedStep)}
                        onCancel={() => removeStep(index)}
                        availableRoles={AVAILABLE_ROLES}
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedTemplate(null);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {isCreating ? 'Create Template' : 'Update Template'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
