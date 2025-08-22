import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { 
  GitBranch, 
  Users, 
  Settings, 
  Workflow,
  ArrowLeft
} from 'lucide-react';
import { ConditionalWorkflowManager } from '../../components/workflows/ConditionalWorkflowManager';
import { ParallelWorkflowManager } from '../../components/workflows/ParallelWorkflowManager';
import { workflowService } from '../../services/workflowService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  entity_type: string;
  is_active: boolean;
  execution_type?: string;
}

export const AdvancedWorkflowManagement: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const workflowsData = await workflowService.getWorkflows();
      setWorkflows(workflowsData);
      
      // Select the first workflow by default
      if (workflowsData.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(workflowsData[0]);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowChange = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    setSelectedWorkflow(workflow || null);
  };

  const getExecutionTypeBadge = (executionType?: string) => {
    if (!executionType || executionType === 'sequential') {
      return <Badge variant="secondary">Sequential</Badge>;
    } else if (executionType === 'parallel') {
      return <Badge variant="default">Parallel</Badge>;
    } else if (executionType === 'hybrid') {
      return <Badge variant="outline">Hybrid</Badge>;
    }
    return <Badge variant="secondary">Sequential</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading workflows...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/workflows')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Advanced Workflow Management</h1>
            <p className="text-gray-600">Configure conditional logic and parallel execution for workflows</p>
          </div>
        </div>
      </div>

      {/* Workflow Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Workflow</label>
              <Select
                value={selectedWorkflow?.id || ''}
                onValueChange={handleWorkflowChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{workflow.name}</span>
                        {getExecutionTypeBadge(workflow.execution_type)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Entity Type</label>
              <div className="p-3 border rounded-md bg-gray-50">
                <span className="font-medium capitalize">
                  {selectedWorkflow?.entity_type || 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Execution Type</label>
              <div className="p-3 border rounded-md bg-gray-50">
                {getExecutionTypeBadge(selectedWorkflow?.execution_type)}
              </div>
            </div>
          </div>

          {selectedWorkflow && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{selectedWorkflow.name}</h3>
              <p className="text-blue-700 text-sm">
                {selectedWorkflow.description || 'No description available'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Workflow Management Tabs */}
      {selectedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Configuration for {selectedWorkflow.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="conditional" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conditional" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Conditional Logic
                </TabsTrigger>
                <TabsTrigger value="parallel" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Parallel Execution
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conditional" className="mt-6">
                <ConditionalWorkflowManager
                  workflowId={selectedWorkflow.id}
                  entityType={selectedWorkflow.entity_type}
                />
              </TabsContent>

              <TabsContent value="parallel" className="mt-6">
                <ParallelWorkflowManager
                  workflowId={selectedWorkflow.id}
                  approvalRequestId={selectedApprovalRequest}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {selectedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/workflows/templates/${selectedWorkflow.id}`)}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Workflow className="h-6 w-6 mb-2" />
                <span>Edit Template</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(`/workflows/analytics`)}
                className="h-20 flex flex-col items-center justify-center"
              >
                <GitBranch className="h-6 w-6 mb-2" />
                <span>View Analytics</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(`/workflows/instances`)}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Active Instances</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Workflow Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Conditional Logic</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Dynamic workflow paths based on conditions</li>
                <li>• Field value, risk level, and amount threshold conditions</li>
                <li>• Custom expression evaluation</li>
                <li>• Conditional approval requirements</li>
                <li>• Risk-based workflow routing</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Parallel Execution</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multiple simultaneous approval paths</li>
                <li>• Parallel workflow execution</li>
                <li>• Workflow convergence and divergence</li>
                <li>• Parallel approval tracking</li>
                <li>• Group-based execution management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
