import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Trash2, Users, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { AuditPlanningWizardData, AuditPlanItemFormData } from './form/validationSchemas';

interface PlanItemsStepProps {
  form: UseFormReturn<AuditPlanningWizardData>;
  users: any[];
  businessUnits: any[];
}

const PlanItemsStep: React.FC<PlanItemsStepProps> = ({ form, users, businessUnits }) => {
  const { control, formState: { errors }, watch } = form;
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "planItems",
  });

  const addPlanItem = () => {
    append({
      audit_title: '',
      audit_type: 'financial',
      priority_level: 'medium',
      planned_hours: 40,
      lead_auditor_id: '',
      team_size: 1,
      audit_frequency_months: 12,
      dependencies: [],
      resource_requirements: [],
    });
  };

  const calculateTotalHours = () => {
    return fields.reduce((total, _, index) => {
      const hours = watch(`planItems.${index}.planned_hours`) || 0;
      return total + hours;
    }, 0);
  };

  const calculateTotalBudget = () => {
    const totalHours = calculateTotalHours();
    const hourlyRate = 150; // Default hourly rate
    return totalHours * hourlyRate;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audit Plan Items *
          </label>
          <p className="text-sm text-gray-600">
            Define the specific audits to be conducted as part of this plan
          </p>
        </div>
        <button
          type="button"
          onClick={addPlanItem}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit items added</h3>
          <p className="text-sm">Click "Add Item" to define the audits for this plan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedItem(expandedItem === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {watch(`planItems.${index}.audit_title`) || `Audit Item ${index + 1}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {watch(`planItems.${index}.audit_type`) || 'Type not specified'} •
                        {watch(`planItems.${index}.planned_hours`) || 0} hours •
                        Priority: {watch(`planItems.${index}.priority_level`) || 'medium'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedItem === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-4 bg-white border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audit Title *
                      </label>
                      <input
                        {...form.register(`planItems.${index}.audit_title`)}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., IT Security Audit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audit Type *
                      </label>
                      <select
                        {...form.register(`planItems.${index}.audit_type`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="financial">Financial</option>
                        <option value="operational">Operational</option>
                        <option value="compliance">Compliance</option>
                        <option value="it">IT</option>
                        <option value="security">Security</option>
                        <option value="risk">Risk</option>
                        <option value="quality">Quality</option>
                        <option value="environmental">Environmental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority Level
                      </label>
                      <select
                        {...form.register(`planItems.${index}.priority_level`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Planned Hours *
                      </label>
                      <input
                        {...form.register(`planItems.${index}.planned_hours`, { valueAsNumber: true })}
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Size
                      </label>
                      <input
                        {...form.register(`planItems.${index}.team_size`, { valueAsNumber: true })}
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency (months)
                      </label>
                      <input
                        {...form.register(`planItems.${index}.audit_frequency_months`, { valueAsNumber: true })}
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Auditor *
                      </label>
                      <select
                        {...form.register(`planItems.${index}.lead_auditor_id`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Lead Auditor</option>
                        {users
                          .filter(user => ['auditor', 'supervisor_auditor'].includes(user.role))
                          .map(user => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.role})
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Unit
                      </label>
                      <select
                        {...form.register(`planItems.${index}.business_unit_id`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Business Unit</option>
                        {businessUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {fields.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-800">Total Items</p>
                <p className="text-lg font-semibold text-blue-900">{fields.length}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-800">Total Hours</p>
                <p className="text-lg font-semibold text-green-900">{calculateTotalHours()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-800">Estimated Budget</p>
                <p className="text-lg font-semibold text-purple-900">${calculateTotalBudget().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {errors.planItems && (
        <p className="text-sm text-red-600">{errors.planItems.message}</p>
      )}
    </motion.div>
  );
};

export default PlanItemsStep;