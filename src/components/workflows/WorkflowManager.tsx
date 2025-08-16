import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import workflowService, { 
  Workflow, 
  WorkflowStep, 
  CreateWorkflowData, 
  CreateWorkflowStepData 
} from '../../services/workflowService';
import { Plus, Edit, Trash2, Play, Pause, Eye, Settings } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const WorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    entity_type: '',
    is_active: true
  });

  const [stepForm, setStepForm] = useState({
    step_name: '',
    assignee_role: '',
    assignee_id: '',
    required: true,
    step_order: 1
  });

  const entityTypes = [
    { value: 'audit', label: 'Audit' },
    { value: 'risk', label: 'Risk' },
    { value: 'finding', label: 'Finding' },
    { value: 'control', label: 'Control' },
    { value: 'policy', label: 'Policy' },
    { value: 'incident', label: 'Incident' },
    { value: 'document', label: 'Document' }
  ];

  const roleTypes = [
    { value: 'auditor', label: 'Auditor' },
    { value: 'risk_manager', label: 'Risk Manager' },
    { value: 'business_unit_manager', label: 'Business Unit Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'compliance_officer', label: 'Compliance Officer' },
    { value: 'security_officer', label: 'Security Officer' }
  ];

  useEffect(() => {
    loadWorkflows();
    loadUsers();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowSteps = async (workflowId: string) => {
    try {
      const data = await workflowService.getWorkflowSteps(workflowId);
      setWorkflowSteps(data);
    } catch (error) {
      console.error('Error loading workflow steps:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const data = await workflowService.createWorkflow(workflowForm);
      setWorkflows([data, ...workflows]);
      setWorkflowForm({ name: '', description: '', entity_type: '', is_active: true });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handleAddStep = async () => {
    if (!selectedWorkflow) return;

    try {
      const stepData: CreateWorkflowStepData = {
        workflow_id: selectedWorkflow.id,
        step_order: workflowSteps.length + 1,
        step_name: stepForm.step_name,
        assignee_role: stepForm.assignee_role,
        assignee_id: stepForm.assignee_id || undefined,
        required: stepForm.required
      };

      const data = await workflowService.createWorkflowStep(stepData);
      setWorkflowSteps([...workflowSteps, data]);
      setStepForm({
        step_name: '',
        assignee_role: '',
        assignee_id: '',
        required: true,
        step_order: workflowSteps.length + 1
      });
    } catch (error) {
      console.error('Error adding step:', error);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await workflowService.deleteWorkflowStep(stepId);
      setWorkflowSteps(workflowSteps.filter(step => step.id !== stepId));
    } catch (error) {
      console.error('Error deleting step:', error);
    }
  };

  const handleToggleWorkflowStatus = async (workflow: Workflow) => {
    try {
      await workflowService.updateWorkflow(workflow.id, { is_active: !workflow.is_active });
      setWorkflows(workflows.map(w => 
        w.id === workflow.id ? { ...w, is_active: !w.is_active } : w
      ));
    } catch (error) {
      console.error('Error toggling workflow status:', error);
    }
  };

  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    loadWorkflowSteps(workflow.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflow Management</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant={workflow.is_active ? "default" : "secondary"}>
                      {workflow.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Entity Type:</span>
                      <Badge variant="outline">{workflow.entity_type}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Created:</span>
                      <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectWorkflow(workflow)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleWorkflowStatus(workflow)}
                      >
                        {workflow.is_active ? (
                          <Pause className="w-4 h-4 mr-1" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        {workflow.is_active ? "Pause" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          {selectedWorkflow ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow: {selectedWorkflow.name}</CardTitle>
                  <p className="text-sm text-gray-600">{selectedWorkflow.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Add New Step</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input
                          placeholder="Step Name"
                          value={stepForm.step_name}
                          onChange={(e) => setStepForm({...stepForm, step_name: e.target.value})}
                        />
                        <Select
                          value={stepForm.assignee_role}
                          onValueChange={(value) => setStepForm({...stepForm, assignee_role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleTypes.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleAddStep}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Step
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Workflow Steps</Label>
                      {workflowSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{step.step_order}</Badge>
                            <div>
                              <p className="font-medium">{step.step_name}</p>
                              <p className="text-sm text-gray-600">{step.assignee_role}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStep(step.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workflow Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflowSteps.map((step, index) => (
                      <div key={step.id} className="relative">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {step.step_order}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.step_name}</p>
                            <p className="text-sm text-gray-600">{step.assignee_role}</p>
                          </div>
                          <Badge variant={step.required ? "default" : "secondary"}>
                            {step.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                        {index < workflowSteps.length - 1 && (
                          <div className="absolute left-4 top-12 w-0.5 h-4 bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">Select a workflow to view and edit its steps</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <p className="text-sm text-gray-600">Pre-built workflow templates for common scenarios</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <h4 className="font-medium">3-Level Audit Approval</h4>
                    <p className="text-sm text-gray-600 mt-1">Auditor → Business Unit Manager → Admin</p>
                    <Button size="sm" className="mt-2">Use Template</Button>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Risk Assessment Workflow</h4>
                    <p className="text-sm text-gray-600 mt-1">Risk Manager → Supervisor → Admin</p>
                    <Button size="sm" className="mt-2">Use Template</Button>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Incident Response</h4>
                    <p className="text-sm text-gray-600 mt-1">Security Officer → Manager → CISO</p>
                    <Button size="sm" className="mt-2">Use Template</Button>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Policy Approval</h4>
                    <p className="text-sm text-gray-600 mt-1">Author → Legal → Executive</p>
                    <Button size="sm" className="mt-2">Use Template</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Workflow Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({...workflowForm, name: e.target.value})}
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({...workflowForm, description: e.target.value})}
                  placeholder="Enter workflow description"
                />
              </div>
              <div>
                <Label>Entity Type</Label>
                <Select
                  value={workflowForm.entity_type}
                  onValueChange={(value) => setWorkflowForm({...workflowForm, entity_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateWorkflow} className="flex-1">
                  Create Workflow
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;
