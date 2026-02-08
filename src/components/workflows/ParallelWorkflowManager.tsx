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
import { AlertCircle, GitBranch, Plus, Settings, Users } from 'lucide-react';
import { workflowService, Workflow, WorkflowStep } from '../../services/workflowService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ParallelWorkflowManagerProps {
  workflowId?: string;
  onWorkflowChange?: (workflow: Workflow) => void;
}

interface ParallelGroup {
  id: string;
  name: string;
  steps: WorkflowStep[];
  workflow_id: string;
}

const ParallelWorkflowManager: React.FC<ParallelWorkflowManagerProps> = ({
  workflowId,
  onWorkflowChange
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [parallelGroups, setParallelGroups] = useState<ParallelGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showParallelDialog, setShowParallelDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ParallelGroup | null>(null);
  const [newGroup, setNewGroup] = useState<Partial<ParallelGroup>>({
    name: '',
    steps: []
  });
  const [newStep, setNewStep] = useState<Partial<WorkflowStep>>({
    step_name: '',
    assignee_role: '',
    required: true,
    is_parallel: true,
    parallel_order: 1
  });

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

      // Group parallel steps
      const groups = organizeParallelGroups(steps);
      setParallelGroups(groups);
    } catch (error) {
      toast.error('Failed to load workflow details');
    } finally {
      setLoading(false);
    }
  };

  const organizeParallelGroups = (steps: WorkflowStep[]): ParallelGroup[] => {
    const groups: { [key: string]: ParallelGroup } = {};
    const sequentialSteps: WorkflowStep[] = [];

    steps.forEach(step => {
      if (step.is_parallel && step.parallel_group) {
        if (!groups[step.parallel_group]) {
          groups[step.parallel_group] = {
            id: step.parallel_group,
            name: `Parallel Group ${step.parallel_group}`,
            steps: [],
            workflow_id: step.workflow_id
          };
        }
        groups[step.parallel_group].steps.push(step);
      } else {
        sequentialSteps.push(step);
      }
    });

    // Sort steps within each group by parallel_order
    Object.values(groups).forEach(group => {
      group.steps.sort((a, b) => (a.parallel_order || 0) - (b.parallel_order || 0));
    });

    return Object.values(groups);
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    loadWorkflowDetails(workflow.id);
    onWorkflowChange?.(workflow);
  };

  const handleCreateParallelGroup = () => {
    if (!selectedWorkflow) return;

    const groupId = `group_${Date.now()}`;
    setNewGroup({
      id: groupId,
      name: '',
      steps: [],
      workflow_id: selectedWorkflow.id
    });
    setSelectedGroup(null);
    setShowParallelDialog(true);
  };

  const handleEditParallelGroup = (group: ParallelGroup) => {
    setSelectedGroup(group);
    setNewGroup({ ...group });
    setShowParallelDialog(true);
  };

  const handleSaveParallelGroup = async () => {
    if (!newGroup.name || !selectedWorkflow) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Save group name (you might want to create a separate table for group metadata)
      // For now, we'll just update the steps

      // Update all steps in the group
      for (const step of newGroup.steps || []) {
        const stepData = {
          ...step,
          parallel_group: newGroup.id,
          is_parallel: true,
          workflow_id: selectedWorkflow.id
        };

        if (step.id) {
          // Update existing step
          await workflowService.updateWorkflowStep(step.id, stepData);
        } else {
          // Create new step
          await workflowService.createWorkflowStep({
            ...stepData,
            step_order: getNextStepOrder()
          });
        }
      }

      // Reload workflow details
      await loadWorkflowDetails(selectedWorkflow.id);
      setShowParallelDialog(false);
      setNewGroup({ name: '', steps: [] });

      toast.success('Parallel group saved successfully');
    } catch (error) {
      toast.error('Failed to save parallel group');
    } finally {
      setLoading(false);
    }
  };

  const getNextStepOrder = (): number => {
    const maxOrder = Math.max(...workflowSteps.map(s => s.step_order), 0);
    return maxOrder + 1;
  };

  const handleAddStepToGroup = () => {
    if (!newStep.step_name || !newStep.assignee_role) {
      toast.error('Please fill in step name and assignee role');
      return;
    }

    const step: WorkflowStep = {
      id: `temp_${Date.now()}`,
      workflow_id: selectedWorkflow?.id || '',
      step_order: getNextStepOrder(),
      step_name: newStep.step_name,
      assignee_role: newStep.assignee_role,
      assignee_id: newStep.assignee_id,
      required: newStep.required || true,
      status: 'pending',
      is_parallel: true,
      parallel_group: newGroup.id,
      parallel_order: (newGroup.steps?.length || 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setNewGroup(prev => ({
      ...prev,
      steps: [...(prev.steps || []), step]
    }));

    setNewStep({
      step_name: '',
      assignee_role: '',
      required: true,
      is_parallel: true,
      parallel_order: (newGroup.steps?.length || 0) + 2
    });
  };

  const handleRemoveStepFromGroup = (stepId: string) => {
    setNewGroup(prev => ({
      ...prev,
      steps: prev.steps?.filter(s => s.id !== stepId) || []
    }));
  };

  const handleDeleteParallelGroup = async (groupId: string) => {
    if (!selectedWorkflow) return;

    try {
      setLoading(true);

      // Get all steps in the group
      const { data: stepsToDelete } = await supabase
        .from('workflow_steps')
        .select('id')
        .eq('parallel_group', groupId)
        .eq('is_parallel', true);

      // Delete all steps in the group
      if (stepsToDelete) {
        for (const step of stepsToDelete) {
          await workflowService.deleteWorkflowStep(step.id);
        }
      }

      // Reload workflow details
      await loadWorkflowDetails(selectedWorkflow.id);

      toast.success('Parallel group deleted successfully');
    } catch (error) {
      toast.error('Failed to delete parallel group');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Parallel Workflow Manager
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              New
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Configure parallel approval paths for concurrent workflow execution
          </p>
        </div>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="parallel">Parallel Groups</TabsTrigger>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitBranch className="h-4 w-4" />
                    <span>{parallelGroups.length} parallel groups</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entity: {workflow.entity_type}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="parallel" className="space-y-4">
          {selectedWorkflow ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Parallel Groups for {selectedWorkflow.name}
                </h3>
                <Button onClick={handleCreateParallelGroup} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Parallel Group
                </Button>
              </div>

              {parallelGroups.length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Parallel Groups</h3>
                  <p className="text-muted-foreground mb-4">
                    Create parallel approval paths for concurrent workflow execution
                  </p>
                  <Button onClick={handleCreateParallelGroup}>
                    Create First Parallel Group
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {parallelGroups.map((group) => (
                    <Card key={group.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-purple-600" />
                            {group.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {group.steps.length} steps
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditParallelGroup(group)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteParallelGroup(group.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardTitle>
                        <CardDescription>
                          Parallel approval paths executed concurrently
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {group.steps.map((step, index) => (
                            <div
                              key={step.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{index + 1}</Badge>
                                <div>
                                  <p className="font-medium">{step.step_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {step.assignee_role}
                                    {step.assignee_id && ' (Assigned)'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStepStatusColor(step.status)}>
                                  {step.status}
                                </Badge>
                                {step.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Workflow Selected</h3>
              <p className="text-muted-foreground">
                Select a workflow from the Workflows tab to configure parallel groups
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Parallel Group Dialog */}
      <Dialog open={showParallelDialog} onOpenChange={setShowParallelDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? 'Edit' : 'Create'} Parallel Group
            </DialogTitle>
            <DialogDescription>
              Configure concurrent approval steps that execute in parallel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="group_name">Group Name</Label>
              <Input
                id="group_name"
                value={newGroup.name || ''}
                onChange={(e) => setNewGroup(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="e.g., Risk Assessment Team Approval"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold">Parallel Steps</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStepToGroup}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </div>

              {/* Add New Step Form */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="step_name">Step Name</Label>
                      <Input
                        id="step_name"
                        value={newStep.step_name || ''}
                        onChange={(e) => setNewStep(prev => ({
                          ...prev,
                          step_name: e.target.value
                        }))}
                        placeholder="e.g., Compliance Review"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignee_role">Assignee Role</Label>
                      <Input
                        id="assignee_role"
                        value={newStep.assignee_role || ''}
                        onChange={(e) => setNewStep(prev => ({
                          ...prev,
                          assignee_role: e.target.value
                        }))}
                        placeholder="e.g., Compliance Officer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newStep.required || false}
                        onChange={(e) => setNewStep(prev => ({
                          ...prev,
                          required: e.target.checked
                        }))}
                      />
                      <Label htmlFor="required">Required</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Steps in Group */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Steps in this Group:</h5>
                {newGroup.steps?.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{step.step_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {step.assignee_role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveStepFromGroup(step.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {(!newGroup.steps || newGroup.steps.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No steps added yet. Add steps above to create parallel approval paths.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowParallelDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveParallelGroup} disabled={loading}>
              {loading ? 'Saving...' : 'Save Parallel Group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParallelWorkflowManager;
