import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import UserSelectionDropdown from './UserSelectionDropdown';

interface WorkflowStep {
  id?: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string | null;
  required: boolean;
  status?: string;
  comments?: string;
}

interface WorkflowStepEditorProps {
  step: WorkflowStep;
  onSave: (step: WorkflowStep) => void;
  onCancel: () => void;
  availableRoles: string[];
}

export default function WorkflowStepEditor({
  step,
  onSave,
  onCancel,
  availableRoles
}: WorkflowStepEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<WorkflowStep>({
    defaultValues: step
  });

  const selectedRole = watch('assignee_role');

  const onSubmit = (data: WorkflowStep) => {
    onSave(data);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">
              {step.step_order}. {step.step_name}
            </h3>
            <p className="text-sm text-gray-600">
              Role: {step.assignee_role}
              {step.assignee_id && " • Specific user assigned"}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Required:</span> {step.required ? "Yes" : "No"}
          </div>
          {step.comments && (
            <div>
              <span className="font-medium">Comments:</span> {step.comments}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step Name
            </label>
            <input
              {...register('step_name', { required: 'Step name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.step_name && (
              <p className="mt-1 text-sm text-red-600">{errors.step_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step Order
            </label>
            <input
              type="number"
              {...register('step_order', { 
                required: 'Step order is required',
                min: { value: 1, message: 'Step order must be at least 1' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.step_order && (
              <p className="mt-1 text-sm text-red-600">{errors.step_order.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee Role
            </label>
            <select
              {...register('assignee_role', { required: 'Assignee role is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.assignee_role && (
              <p className="mt-1 text-sm text-red-600">{errors.assignee_role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific User (Optional)
            </label>
            <UserSelectionDropdown
              value={watch('assignee_id')}
              onChange={(userId) => setValue('assignee_id', userId)}
              placeholder="Select a specific user..."
              filterByRole={selectedRole}
              disabled={!selectedRole}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comments
          </label>
          <textarea
            {...register('comments')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional comments for this step..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('required')}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Required step</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Save Step
          </button>
        </div>
      </form>
    </div>
  );
}
