import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, Plus, Settings, Zap } from 'lucide-react';
import { workflowService, Workflow, WorkflowStep } from '../../services/workflowService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ConditionalWorkflowManagerProps {
  workflowId?: string;
  onWorkflowChange?: (workflow: Workflow) => void;
}

interface WorkflowCondition {
  id: string;
  step_id: string;
  condition_name: string;
  condition_type: string;
  condition_operator: string;
  condition_value: string;
  condition_metadata?: any;
  next_step_id?: string;
  is_active: boolean;
}

const ConditionalWorkflowManager: React.FC<ConditionalWorkflowManagerProps> = ({
  workflowId,
  onWorkflowChange
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [newCondition, setNewCondition] = useState<Partial<WorkflowCondition>>({
    condition_type: 'field_comparison',
    condition_operator: 'equals',
    is_active: true
  });

  // Toast notifications using sonner

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (workflowId) {
      loadWorkflowDetails(workflowId);
    }
  }, [workflowId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowDetails = async (id: string) => {
    try {
      setLoading(true);
      const workflow = await workflowService.getWorkflowById(id);
      const steps = await workflowService.getWorkflowSteps(id);

      setSelectedWorkflow(workflow);
      setWorkflowSteps(steps);

      // Load conditions for all steps
      const allConditions: WorkflowCondition[] = [];
      for (const step of steps) {
        try {
          const { data } = await supabase
            .from('workflow_conditions')
            .select('*')
            .eq('step_id', step.id);

          if (data) {
            allConditions.push(...data);
          }
        } catch (error) {
          console.error(`Error loading conditions for step ${step.id}:`, error);
        }
      }

      setConditions(allConditions);
    } catch (error) {
      toast.error('Failed to load workflow details');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    loadWorkflowDetails(workflow.id);
    onWorkflowChange?.(workflow);
  };

  const handleAddCondition = (step: WorkflowStep) => {
    setSelectedStep(step);
    setNewCondition({
      step_id: step.id,
      condition_type: 'field_comparison',
      condition_operator: 'equals',
      is_active: true
    });
    setShowConditionDialog(true);
  };

  const handleSaveCondition = async () => {
    if (!selectedStep || !newCondition.condition_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const conditionData = {
        ...newCondition,
        workflow_id: selectedWorkflow?.id,
        step_id: selectedStep.id,
      };

      const { data, error } = await supabase
        .from('workflow_conditions')
        .insert([conditionData])
        .select()
        .single();

      if (error) throw error;

      setConditions(prev => [...prev, data]);
      setShowConditionDialog(false);
      setNewCondition({
        condition_type: 'field_comparison',
        condition_operator: 'equals',
        is_active: true
      });

      toast.success('Condition added successfully');
    } catch (error) {
      toast.error('Failed to save condition');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCondition = async (conditionId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('workflow_conditions')
        .delete()
        .eq('id', conditionId);

      if (error) throw error;

      setConditions(prev => prev.filter(c => c.id !== conditionId));

      toast.success('Condition deleted successfully');
    } catch (error) {
      toast.error('Failed to delete condition');
    } finally {
      setLoading(false);
    }
  };

  const getConditionTypeLabel = (type: string) => {
    const labels = {
      field_comparison: 'Field Comparison',
      approval_result: 'Approval Result',
      time_based: 'Time Based',
      custom_logic: 'Custom Logic'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getOperatorLabel = (operator: string) => {
    const labels = {
      equals: 'Equals',
      not_equals: 'Not Equals',
      greater_than: 'Greater Than',
      less_than: 'Less Than',
      contains: 'Contains',
      before: 'Before',
      after: 'After'
    };
    return labels[operator as keyof typeof labels] || operator;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Conditional Workflow Manager
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              New
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Configure conditional logic for workflow steps
          </p>
        </div>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`cursor-pointer transition-colors ${
                  selectedWorkflow?.id === workflow.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleWorkflowSelect(workflow)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {workflow.name}
                    <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Entity: {workflow.entity_type}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          {selectedWorkflow ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Conditions for {selectedWorkflow.name}
                </h3>
              </div>

              {workflowSteps.map((step) => (
                <Card key={step.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Step {step.step_order}: {step.step_name}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddCondition(step)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Condition
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Assignee: {step.assignee_role}
                      {step.condition_type && step.condition_type !== 'none' && (
                        <Badge variant="outline" className="ml-2">
                          <Zap className="h-3 w-3 mr-1" />
                          Has Conditions
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {conditions
                        .filter(c => c.step_id === step.id)
                        .map((condition) => (
                          <div
                            key={condition.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                {getConditionTypeLabel(condition.condition_type)}
                              </Badge>
                              <span className="font-medium">{condition.condition_name}</span>
                              <span className="text-sm text-muted-foreground">
                                {getOperatorLabel(condition.condition_operator)} {condition.condition_value}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={condition.is_active ? 'default' : 'secondary'}>
                                {condition.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCondition(condition.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}

                      {conditions.filter(c => c.step_id === step.id).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No conditions configured for this step
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Workflow Selected</h3>
              <p className="text-muted-foreground">
                Select a workflow from the Workflows tab to configure conditions
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Condition Dialog */}
      <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Condition</DialogTitle>
            <DialogDescription>
              Configure a condition for step: {selectedStep?.step_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition_name">Condition Name</Label>
                <Input
                  id="condition_name"
                  value={newCondition.condition_name || ''}
                  onChange={(e) => setNewCondition(prev => ({
                    ...prev,
                    condition_name: e.target.value
                  }))}
                  placeholder="e.g., High Risk Approval"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition_type">Condition Type</Label>
                <Select
                  value={newCondition.condition_type}
                  onValueChange={(value) => setNewCondition(prev => ({
                    ...prev,
                    condition_type: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_comparison">Field Comparison</SelectItem>
                    <SelectItem value="approval_result">Approval Result</SelectItem>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="custom_logic">Custom Logic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition_operator">Operator</Label>
                <Select
                  value={newCondition.condition_operator}
                  onValueChange={(value) => setNewCondition(prev => ({
                    ...prev,
                    condition_operator: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="before">Before</SelectItem>
                    <SelectItem value="after">After</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition_value">Value</Label>
                <Input
                  id="condition_value"
                  value={newCondition.condition_value || ''}
                  onChange={(e) => setNewCondition(prev => ({
                    ...prev,
                    condition_value: e.target.value
                  }))}
                  placeholder="e.g., high, approved, 2024-01-01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_step">Next Step (Optional)</Label>
              <Select
                value={newCondition.next_step_id || ''}
                onValueChange={(value) => setNewCondition(prev => ({
                  ...prev,
                  next_step_id: value || undefined
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select next step" />
                </SelectTrigger>
                <SelectContent>
                  {workflowSteps
                    .filter(step => step.id !== selectedStep?.id)
                    .map((step) => (
                      <SelectItem key={step.id} value={step.id}>
                        Step {step.step_order}: {step.step_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">Additional Metadata (JSON)</Label>
              <Textarea
                id="metadata"
                value={JSON.stringify(newCondition.condition_metadata || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const metadata = JSON.parse(e.target.value);
                    setNewCondition(prev => ({
                      ...prev,
                      condition_metadata: metadata
                    }));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"field": "risk_level", "logic": "AND"}'
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConditionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCondition} disabled={loading}>
              {loading ? 'Saving...' : 'Save Condition'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConditionalWorkflowManager;
