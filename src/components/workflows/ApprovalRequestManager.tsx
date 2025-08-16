import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { supabase } from '../../lib/supabase';
import { Plus, Eye, Check, X, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  entity_type: string;
  entity_id: string;
  workflow_id: string;
  requester_id: string;
  status: string;
  title: string;
  description: string;
  priority: string;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  workflow_name?: string;
}

interface ApprovalRequestStep {
  id: string;
  approval_request_id: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string;
  assignee_name?: string;
  status: string;
  completed_at?: string;
  completed_by?: string;
  comments?: string;
  required: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  entity_type: string;
  is_active: boolean;
}

const ApprovalRequestManager: React.FC = () => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [requestSteps, setRequestSteps] = useState<ApprovalRequestStep[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [requestForm, setRequestForm] = useState({
    entity_type: '',
    entity_id: '',
    workflow_id: '',
    title: '',
    description: '',
    priority: 'medium'
  });

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    loadApprovalRequests();
    loadWorkflows();
  }, []);

  const loadApprovalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          requester:users!approval_requests_requester_id_fkey(full_name),
          workflow:workflows(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        requester_name: item.requester?.full_name,
        workflow_name: item.workflow?.name
      })) || [];

      setApprovalRequests(formattedData);
    } catch (error) {
      console.error('Error loading approval requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const loadRequestSteps = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('approval_request_steps')
        .select(`
          *,
          assignee:users!approval_request_steps_assignee_id_fkey(full_name)
        `)
        .eq('approval_request_id', requestId)
        .order('step_order');

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        assignee_name: item.assignee?.full_name
      })) || [];

      setRequestSteps(formattedData);
    } catch (error) {
      console.error('Error loading request steps:', error);
    }
  };

  const handleCreateRequest = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('approval_requests')
        .insert([{
          ...requestForm,
          requester_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Create approval request steps based on workflow
      await createApprovalRequestSteps(data.id, requestForm.workflow_id);

      setApprovalRequests([data, ...approvalRequests]);
      setRequestForm({
        entity_type: '',
        entity_id: '',
        workflow_id: '',
        title: '',
        description: '',
        priority: 'medium'
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating approval request:', error);
    }
  };

  const createApprovalRequestSteps = async (requestId: string, workflowId: string) => {
    try {
      // Get workflow steps
      const { data: workflowSteps, error: workflowError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order');

      if (workflowError) throw workflowError;

      // Create approval request steps
      const approvalSteps = workflowSteps.map(step => ({
        approval_request_id: requestId,
        step_order: step.step_order,
        step_name: step.step_name,
        assignee_role: step.assignee_role,
        assignee_id: step.assignee_id,
        status: 'pending',
        required: step.required
      }));

      const { error } = await supabase
        .from('approval_request_steps')
        .insert(approvalSteps);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating approval request steps:', error);
    }
  };

  const handleApproveStep = async (stepId: string, comments?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('approval_request_steps')
        .update({
          status: 'approved',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          comments
        })
        .eq('id', stepId);

      if (error) throw error;

      // Reload steps
      if (selectedRequest) {
        loadRequestSteps(selectedRequest.id);
      }
    } catch (error) {
      console.error('Error approving step:', error);
    }
  };

  const handleRejectStep = async (stepId: string, comments?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('approval_request_steps')
        .update({
          status: 'rejected',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          comments
        })
        .eq('id', stepId);

      if (error) throw error;

      // Update approval request status to rejected
      if (selectedRequest) {
        await supabase
          .from('approval_requests')
          .update({ status: 'rejected' })
          .eq('id', selectedRequest.id);
      }

      // Reload steps
      if (selectedRequest) {
        loadRequestSteps(selectedRequest.id);
      }
    } catch (error) {
      console.error('Error rejecting step:', error);
    }
  };

  const handleSelectRequest = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    loadRequestSteps(request.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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
        <h1 className="text-3xl font-bold">Approval Requests</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="my-approvals">My Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvalRequests.map((request) => (
              <Card key={request.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{request.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Requester:</span>
                      <span>{request.requester_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Workflow:</span>
                      <span>{request.workflow_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Priority:</span>
                      <Badge className={priorityOptions.find(p => p.value === request.priority)?.color}>
                        {request.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Created:</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvalRequests
              .filter(request => request.status === 'pending' || request.status === 'in_progress')
              .map((request) => (
                <Card key={request.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{request.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Requester:</span>
                        <span>{request.requester_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Priority:</span>
                        <Badge className={priorityOptions.find(p => p.value === request.priority)?.color}>
                          {request.priority}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="my-approvals" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">My approval assignments will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedRequest.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.description}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={statusColors[selectedRequest.status as keyof typeof statusColors]}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={priorityOptions.find(p => p.value === selectedRequest.priority)?.color}>
                      {selectedRequest.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Requester</Label>
                    <p>{selectedRequest.requester_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Approval Steps</Label>
                  <div className="space-y-3 mt-2">
                    {requestSteps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {step.step_order}
                            </div>
                            <div>
                              <p className="font-medium">{step.step_name}</p>
                              <p className="text-sm text-gray-600">{step.assignee_role}</p>
                              {step.assignee_name && (
                                <p className="text-sm text-gray-500">Assigned to: {step.assignee_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[step.status as keyof typeof statusColors]}>
                              {step.status}
                            </Badge>
                            {step.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveStep(step.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectStep(step.id)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        {step.comments && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">Comments:</p>
                            <p>{step.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Request Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Approval Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                  placeholder="Enter request title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                  placeholder="Enter request description"
                />
              </div>
              <div>
                <Label>Entity Type</Label>
                <Select
                  value={requestForm.entity_type}
                  onValueChange={(value) => setRequestForm({...requestForm, entity_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="finding">Finding</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Entity ID</Label>
                <Input
                  value={requestForm.entity_id}
                  onChange={(e) => setRequestForm({...requestForm, entity_id: e.target.value})}
                  placeholder="Enter entity ID"
                />
              </div>
              <div>
                <Label>Workflow</Label>
                <Select
                  value={requestForm.workflow_id}
                  onValueChange={(value) => setRequestForm({...requestForm, workflow_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows
                      .filter(w => w.entity_type === requestForm.entity_type || !requestForm.entity_type)
                      .map((workflow) => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={requestForm.priority}
                  onValueChange={(value) => setRequestForm({...requestForm, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateRequest} className="flex-1">
                  Create Request
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

export default ApprovalRequestManager;
