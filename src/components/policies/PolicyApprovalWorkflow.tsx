import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { CheckCircle, XCircle, Clock, Play, Eye, MessageSquare, User, FileText } from 'lucide-react';
import { workflowService } from '../../services/workflowService';
import { policyService } from '../../services/policyService';
import { toast } from 'react-hot-toast';
import type { Policy, PolicyVersion } from '../../types/policies';
import type { ApprovalRequest, ApprovalRequestStep } from '../../services/workflowService';

interface PolicyApprovalWorkflowProps {
  policy: Policy;
  versions: PolicyVersion[];
}

const PolicyApprovalWorkflow: React.FC<PolicyApprovalWorkflowProps> = ({
  policy,
  versions
}) => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [requestSteps, setRequestSteps] = useState<ApprovalRequestStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');

  useEffect(() => {
    loadApprovalRequests();
    loadWorkflows();
  }, [policy.id]);

  const loadApprovalRequests = async () => {
    try {
      setLoading(true);
      // Get approval requests for this policy
      const requests = await workflowService.getApprovalRequests();
      const policyRequests = requests.filter(req => req.entity_id === policy.id && req.entity_type === 'policy');
      setApprovalRequests(policyRequests);
    } catch (error) {
      console.error('Error loading approval requests:', error);
      toast.error('Approval requests could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const activeWorkflows = await workflowService.getActiveWorkflows();
      const policyWorkflows = activeWorkflows.filter(w => w.entity_type === 'policy');
      setWorkflows(policyWorkflows);
      if (policyWorkflows.length > 0) {
        setSelectedWorkflowId(policyWorkflows[0].id);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const loadRequestSteps = async (requestId: string) => {
    try {
      const steps = await workflowService.getApprovalRequestSteps(requestId);
      setRequestSteps(steps);
    } catch (error) {
      console.error('Error loading request steps:', error);
      toast.error('Request steps could not be loaded');
    }
  };

  const handleStartWorkflow = async () => {
    if (!selectedVersionId || !selectedWorkflowId) {
      toast.error('Please select a version and workflow');
      return;
    }

    try {
      const selectedVersion = versions.find(v => v.id === selectedVersionId);
      if (!selectedVersion) {
        toast.error('Selected version not found');
        return;
      }

      await workflowService.createApprovalRequest({
        entity_type: 'policy',
        entity_id: policy.id,
        workflow_id: selectedWorkflowId,
        title: `Policy Approval: ${policy.name} v${selectedVersion.version_number}`,
        description: `Approval workflow for policy version ${selectedVersion.title}`
      });

      toast.success('Approval workflow started successfully');
      setIsStartDialogOpen(false);
      setSelectedVersionId('');
      loadApprovalRequests();
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start approval workflow');
    }
  };

  const handleApprovalAction = async (stepId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      await workflowService.updateApprovalStep(stepId, {
        step_id: stepId,
        action,
        comments
      });

      toast.success(`Step ${action}d successfully`);
      if (selectedRequest) {
        loadRequestSteps(selectedRequest.id);
      }
      loadApprovalRequests();
    } catch (error) {
      console.error('Error updating approval step:', error);
      toast.error(`Failed to ${action} step`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_approval: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStepStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      completed: 'default',
      rejected: 'destructive',
      revision_required: 'outline',
      skipped: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Policy Approval Workflows
                <Badge variant="outline" className="ml-2">New</Badge>
              </CardTitle>
              <CardDescription>
                Manage approval workflows for policy versions
              </CardDescription>
            </div>
            <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Start Approval Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Start Policy Approval Workflow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Policy Version</label>
                    <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a version" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            v{version.version_number} - {version.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Select Workflow</label>
                    <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a workflow" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflows.map((workflow) => (
                          <SelectItem key={workflow.id} value={workflow.id}>
                            {workflow.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleStartWorkflow}>
                      Start Workflow
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {approvalRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No approval workflows started yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Start an approval workflow for a policy version to begin the review process.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.workflow_name || 'Policy Approval'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell>{request.current_step || 1}</TableCell>
                    <TableCell>{request.requester_name || request.requested_by}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRequest(request);
                          loadRequestSteps(request.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Workflow Details: {selectedRequest.workflow_name || 'Policy Approval'}
            </CardTitle>
            <CardDescription>
              Approval steps and current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestSteps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                          {step.step_order}
                        </div>
                        {index < requestSteps.length - 1 && (
                          <div className="w-0.5 h-6 bg-gray-200 mt-1"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.step_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{step.assignee_name || step.assignee_role}</span>
                          {getStepStatusBadge(step.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {step.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprovalAction(step.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprovalAction(step.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {step.comments && (
                    <div className="ml-11 mt-2 p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <MessageSquare className="h-3 w-3" />
                        <span className="font-medium">Comments:</span>
                      </div>
                      {step.comments}
                    </div>
                  )}
                  {step.action_at && (
                    <div className="ml-11 mt-2 text-xs text-gray-500">
                      Action taken on {new Date(step.action_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyApprovalWorkflow;