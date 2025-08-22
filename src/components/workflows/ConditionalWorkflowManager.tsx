import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, ArrowRight, GitBranch } from 'lucide-react';
import { advancedWorkflowService, WorkflowCondition, ConditionalStep } from '../../services/advancedWorkflowService';
import { toast } from 'sonner';

interface ConditionalWorkflowManagerProps {
  workflowId: string;
  entityType: string;
}

export const ConditionalWorkflowManager: React.FC<ConditionalWorkflowManagerProps> = ({
  workflowId,
  entityType
}) => {
  const [steps, setSteps] = useState<ConditionalStep[]>([]);
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  const [selectedStep, setSelectedStep] = useState<ConditionalStep | null>(null);
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [isEditingCondition, setIsEditingCondition] = useState(false);
  const [editingCondition, setEditingCondition] = useState<WorkflowCondition | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for new/editing condition
  const [conditionForm, setConditionForm] = useState({
    condition_name: '',
    condition_type: 'field_value' as const,
    condition_operator: 'equals' as const,
    condition_value: '',
    condition_metadata: {},
    next_step_id: ''
  });

  useEffect(() => {
    loadWorkflowData();
  }, [workflowId]);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      const [stepsData, conditionsData] = await Promise.all([
        advancedWorkflowService.getConditionalSteps(workflowId),
        advancedWorkflowService.getWorkflowConditions(workflowId)
      ]);
      setSteps(stepsData);
      setConditions(conditionsData);
    } catch (error) {
      console.error('Error loading workflow data:', error);
      toast.error('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = () => {
    if (!selectedStep) {
      toast.error('Please select a step first');
      return;
    }
    setIsAddingCondition(true);
    setConditionForm({
      condition_name: '',
      condition_type: 'field_value',
      condition_operator: 'equals',
      condition_value: '',
      condition_metadata: {},
      next_step_id: ''
    });
  };

  const handleEditCondition = (condition: WorkflowCondition) => {
    setEditingCondition(condition);
    setConditionForm({
      condition_name: condition.condition_name,
      condition_type: condition.condition_type,
      condition_operator: condition.condition_operator,
      condition_value: condition.condition_value,
      condition_metadata: condition.condition_metadata || {},
      next_step_id: condition.next_step_id || ''
    });
    setIsEditingCondition(true);
  };

  const handleDeleteCondition = async (conditionId: string) => {
    try {
      await advancedWorkflowService.deleteWorkflowCondition(conditionId);
      toast.success('Condition deleted successfully');
      loadWorkflowData();
    } catch (error) {
      console.error('Error deleting condition:', error);
      toast.error('Failed to delete condition');
    }
  };

  const handleSaveCondition = async () => {
    if (!selectedStep) return;

    try {
      const conditionData: Partial<WorkflowCondition> = {
        workflow_id: workflowId,
        step_id: selectedStep.id,
        condition_name: conditionForm.condition_name,
        condition_type: conditionForm.condition_type,
        condition_operator: conditionForm.condition_operator,
        condition_value: conditionForm.condition_value,
        condition_metadata: conditionForm.condition_metadata,
        next_step_id: conditionForm.next_step_id || undefined,
        is_active: true
      };

      if (isEditingCondition && editingCondition) {
        await advancedWorkflowService.updateWorkflowCondition(editingCondition.id!, conditionData);
        toast.success('Condition updated successfully');
      } else {
        await advancedWorkflowService.createWorkflowCondition(conditionData as WorkflowCondition);
        toast.success('Condition added successfully');
      }

      setIsAddingCondition(false);
      setIsEditingCondition(false);
      setEditingCondition(null);
      loadWorkflowData();
    } catch (error) {
      console.error('Error saving condition:', error);
      toast.error('Failed to save condition');
    }
  };

  const getConditionTypeOptions = () => {
    const baseOptions = [
      { value: 'field_value', label: 'Field Value' },
      { value: 'risk_level', label: 'Risk Level' },
      { value: 'amount_threshold', label: 'Amount Threshold' },
      { value: 'user_role', label: 'User Role' },
      { value: 'custom', label: 'Custom Expression' }
    ];

    // Add entity-specific options
    if (entityType === 'risk') {
      baseOptions.push({ value: 'risk_score', label: 'Risk Score' });
    } else if (entityType === 'audit') {
      baseOptions.push({ value: 'audit_type', label: 'Audit Type' });
    }

    return baseOptions;
  };

  const getOperatorOptions = (conditionType: string) => {
    const operators = {
      field_value: [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'in', label: 'In List' }
      ],
      risk_level: [
        { value: 'equals', label: 'Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' }
      ],
      amount_threshold: [
        { value: 'equals', label: 'Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' }
      ],
      user_role: [
        { value: 'equals', label: 'Equals' },
        { value: 'in', label: 'In Roles' }
      ],
      custom: [
        { value: 'custom', label: 'Custom Expression' }
      ]
    };

    return operators[conditionType as keyof typeof operators] || operators.field_value;
  };

  const getStepConditions = (stepId: string) => {
    return conditions.filter(c => c.step_id === stepId);
  };

  const getNextStepName = (nextStepId: string) => {
    const step = steps.find(s => s.id === nextStepId);
    return step?.step_name || 'Unknown Step';
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading workflow data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Conditional Workflow Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Steps List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Workflow Steps</h3>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStep?.id === step.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStep(step)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{step.step_name}</h4>
                        <p className="text-sm text-gray-600">Order: {step.step_order}</p>
                        {step.condition_type !== 'none' && (
                          <Badge variant="secondary" className="mt-1">
                            Conditional
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Conditions for {selectedStep?.step_name || 'Select a Step'}
                </h3>
                {selectedStep && (
                  <Button onClick={handleAddCondition} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                )}
              </div>

              {selectedStep && (
                <div className="space-y-3">
                  {getStepConditions(selectedStep.id).map((condition) => (
                    <div key={condition.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{condition.condition_name}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCondition(condition)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => condition.id && handleDeleteCondition(condition.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Type: {condition.condition_type}</p>
                        <p>Operator: {condition.condition_operator}</p>
                        <p>Value: {condition.condition_value}</p>
                        {condition.next_step_id && (
                          <p>Next: {getNextStepName(condition.next_step_id)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condition Form Modal */}
      {(isAddingCondition || isEditingCondition) && selectedStep && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditingCondition ? 'Edit Condition' : 'Add New Condition'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="condition_name">Condition Name</Label>
                <Input
                  id="condition_name"
                  value={conditionForm.condition_name}
                  onChange={(e) => setConditionForm({ ...conditionForm, condition_name: e.target.value })}
                  placeholder="Enter condition name"
                />
              </div>

              <div>
                <Label htmlFor="condition_type">Condition Type</Label>
                <Select
                  value={conditionForm.condition_type}
                  onValueChange={(value: any) => setConditionForm({ ...conditionForm, condition_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getConditionTypeOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition_operator">Operator</Label>
                <Select
                  value={conditionForm.condition_operator}
                  onValueChange={(value: any) => setConditionForm({ ...conditionForm, condition_operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorOptions(conditionForm.condition_type).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition_value">Value</Label>
                <Input
                  id="condition_value"
                  value={conditionForm.condition_value}
                  onChange={(e) => setConditionForm({ ...conditionForm, condition_value: e.target.value })}
                  placeholder="Enter condition value"
                />
              </div>

              <div>
                <Label htmlFor="next_step_id">Next Step (Optional)</Label>
                <Select
                  value={conditionForm.next_step_id}
                  onValueChange={(value) => setConditionForm({ ...conditionForm, next_step_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select next step" />
                  </SelectTrigger>
                  <SelectContent>
                    {steps
                      .filter(step => step.id !== selectedStep.id)
                      .map((step) => (
                        <SelectItem key={step.id} value={step.id}>
                          {step.step_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {conditionForm.condition_type === 'custom' && (
                <div>
                  <Label htmlFor="condition_expression">Custom Expression</Label>
                  <Textarea
                    id="condition_expression"
                    value={conditionForm.condition_metadata?.expression || ''}
                    onChange={(e) => setConditionForm({
                      ...conditionForm,
                      condition_metadata: { ...conditionForm.condition_metadata, expression: e.target.value }
                    })}
                    placeholder="Enter custom expression (e.g., ${risk_level} === 'high')"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveCondition}>
                  {isEditingCondition ? 'Update Condition' : 'Add Condition'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingCondition(false);
                    setIsEditingCondition(false);
                    setEditingCondition(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
