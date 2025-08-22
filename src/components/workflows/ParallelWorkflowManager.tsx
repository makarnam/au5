import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight, 
  GitBranch, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Play,
  Pause
} from 'lucide-react';
import { advancedWorkflowService, ConditionalStep, ParallelExecution, AdvancedWorkflow } from '../../services/advancedWorkflowService';
import { toast } from 'sonner';

interface ParallelWorkflowManagerProps {
  workflowId: string;
  approvalRequestId?: string;
}

export const ParallelWorkflowManager: React.FC<ParallelWorkflowManagerProps> = ({
  workflowId,
  approvalRequestId
}) => {
  const [workflow, setWorkflow] = useState<AdvancedWorkflow | null>(null);
  const [steps, setSteps] = useState<ConditionalStep[]>([]);
  const [parallelExecutions, setParallelExecutions] = useState<ParallelExecution[]>([]);
  const [selectedStep, setSelectedStep] = useState<ConditionalStep | null>(null);
  const [isConfiguringParallel, setIsConfiguringParallel] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for parallel configuration
  const [parallelForm, setParallelForm] = useState({
    parallel_group: '',
    execution_order: 1,
    is_parallel: false
  });

  useEffect(() => {
    loadWorkflowData();
  }, [workflowId, approvalRequestId]);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      const [workflowData, stepsData] = await Promise.all([
        advancedWorkflowService.getAdvancedWorkflow(workflowId),
        advancedWorkflowService.getConditionalSteps(workflowId)
      ]);
      setWorkflow(workflowData);
      setSteps(stepsData);

      if (approvalRequestId) {
        const executionsData = await advancedWorkflowService.getParallelExecutions(approvalRequestId);
        setParallelExecutions(executionsData);
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
      toast.error('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureParallel = (step: ConditionalStep) => {
    setSelectedStep(step);
    setParallelForm({
      parallel_group: step.parallel_group || '',
      execution_order: step.parallel_order || 1,
      is_parallel: step.is_parallel || false
    });
    setIsConfiguringParallel(true);
  };

  const handleSaveParallelConfig = async () => {
    if (!selectedStep) return;

    try {
      await advancedWorkflowService.updateConditionalStep(selectedStep.id, {
        parallel_group: parallelForm.parallel_group,
        parallel_order: parallelForm.execution_order,
        is_parallel: parallelForm.is_parallel
      });

      toast.success('Parallel configuration updated successfully');
      setIsConfiguringParallel(false);
      setSelectedStep(null);
      loadWorkflowData();
    } catch (error) {
      console.error('Error saving parallel configuration:', error);
      toast.error('Failed to save parallel configuration');
    }
  };

  const handleStartParallelExecution = async () => {
    if (!approvalRequestId) {
      toast.error('No approval request selected');
      return;
    }

    try {
      await advancedWorkflowService.startParallelExecution(approvalRequestId, workflowId);
      toast.success('Parallel execution started successfully');
      loadWorkflowData();
    } catch (error) {
      console.error('Error starting parallel execution:', error);
      toast.error('Failed to start parallel execution');
    }
  };

  const handleUpdateExecutionStatus = async (executionId: string, status: string) => {
    try {
      await advancedWorkflowService.updateParallelExecution(executionId, {
        status: status as any,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      });
      toast.success('Execution status updated successfully');
      loadWorkflowData();
    } catch (error) {
      console.error('Error updating execution status:', error);
      toast.error('Failed to update execution status');
    }
  };

  const getParallelGroups = () => {
    const groups: Record<string, ConditionalStep[]> = {};
    steps.forEach(step => {
      if (step.is_parallel && step.parallel_group) {
        if (!groups[step.parallel_group]) {
          groups[step.parallel_group] = [];
        }
        groups[step.parallel_group].push(step);
      }
    });
    return groups;
  };

  const getGroupExecutions = (groupName: string) => {
    return parallelExecutions.filter(exec => exec.parallel_group === groupName);
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getExecutionStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading workflow data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Parallel Workflow Execution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-6">
              {/* Workflow Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Workflow Configuration</h3>
                  <Badge variant={workflow?.execution_type === 'parallel' ? 'default' : 'secondary'}>
                    {workflow?.execution_type || 'sequential'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Execution Type</Label>
                    <Select
                      value={workflow?.execution_type || 'sequential'}
                      onValueChange={async (value) => {
                        try {
                          await advancedWorkflowService.updateAdvancedWorkflow(workflowId, {
                            execution_type: value as any
                          });
                          loadWorkflowData();
                        } catch (error) {
                          toast.error('Failed to update execution type');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="parallel">Parallel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Convergence Step</Label>
                    <Select
                      value={workflow?.convergence_step_id || ''}
                      onValueChange={async (value) => {
                        try {
                          await advancedWorkflowService.updateAdvancedWorkflow(workflowId, {
                            convergence_step_id: value || undefined
                          });
                          loadWorkflowData();
                        } catch (error) {
                          toast.error('Failed to update convergence step');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select convergence step" />
                      </SelectTrigger>
                      <SelectContent>
                        {steps.map((step) => (
                          <SelectItem key={step.id} value={step.id}>
                            {step.step_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Parallel Groups */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parallel Groups</h3>
                <div className="space-y-4">
                  {Object.entries(getParallelGroups()).map(([groupName, groupSteps]) => (
                    <Card key={groupName}>
                      <CardHeader>
                        <CardTitle className="text-base">{groupName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {groupSteps
                            .sort((a, b) => (a.parallel_order || 0) - (b.parallel_order || 0))
                            .map((step) => (
                              <div key={step.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <span className="font-medium">{step.step_name}</span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    Order: {step.parallel_order}
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleConfigureParallel(step)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Steps Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Steps Configuration</h3>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{step.step_name}</span>
                        {step.is_parallel && (
                          <Badge variant="secondary" className="ml-2">
                            Parallel: {step.parallel_group}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigureParallel(step)}
                      >
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="execution" className="space-y-6">
              {!approvalRequestId ? (
                <div className="text-center py-8 text-gray-500">
                  No approval request selected for execution tracking
                </div>
              ) : (
                <>
                  {/* Execution Controls */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Parallel Execution</h3>
                    <Button onClick={handleStartParallelExecution}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Parallel Execution
                    </Button>
                  </div>

                  {/* Execution Groups */}
                  <div className="space-y-4">
                    {Object.entries(getParallelGroups()).map(([groupName, groupSteps]) => {
                      const groupExecutions = getGroupExecutions(groupName);
                      const isCompleted = groupExecutions.every(exec => exec.status === 'completed');
                      
                      return (
                        <Card key={groupName}>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                              {groupName}
                              {isCompleted && (
                                <Badge variant="default">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {groupExecutions.map((execution) => {
                                const step = steps.find(s => s.id === execution.step_id);
                                return (
                                  <div key={execution.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex items-center gap-2">
                                      {getExecutionStatusIcon(execution.status || 'pending')}
                                      <span className="font-medium">{step?.step_name}</span>
                                      {getExecutionStatusBadge(execution.status || 'pending')}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateExecutionStatus(execution.id!, 'completed')}
                                        disabled={execution.status === 'completed'}
                                      >
                                        Complete
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateExecutionStatus(execution.id!, 'rejected')}
                                        disabled={execution.status === 'rejected'}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Parallel Configuration Modal */}
      {isConfiguringParallel && selectedStep && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Parallel Execution for {selectedStep.step_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_parallel"
                  checked={parallelForm.is_parallel}
                  onChange={(e) => setParallelForm({ ...parallelForm, is_parallel: e.target.checked })}
                />
                <Label htmlFor="is_parallel">Enable Parallel Execution</Label>
              </div>

              {parallelForm.is_parallel && (
                <>
                  <div>
                    <Label htmlFor="parallel_group">Parallel Group</Label>
                    <Input
                      id="parallel_group"
                      value={parallelForm.parallel_group}
                      onChange={(e) => setParallelForm({ ...parallelForm, parallel_group: e.target.value })}
                      placeholder="Enter parallel group name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="execution_order">Execution Order</Label>
                    <Input
                      id="execution_order"
                      type="number"
                      value={parallelForm.execution_order}
                      onChange={(e) => setParallelForm({ ...parallelForm, execution_order: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveParallelConfig}>
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsConfiguringParallel(false);
                    setSelectedStep(null);
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
