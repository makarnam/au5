import React, { useState, useEffect } from 'react';
import { FileText, Workflow, Clock, CheckCircle, XCircle, Plus, Settings, History, AlertTriangle, Download, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { documentWorkflowService, DocumentWorkflowIntegration, DocumentWorkflowHistory, CreateDocumentWorkflowPayload } from '../../services/documentWorkflowService';
import { format } from 'date-fns';

interface DocumentWorkflowIntegrationProps {
  documentId?: string;
  workflowId?: string;
  showCreateButton?: boolean;
  onIntegrationChange?: () => void;
}

const DocumentWorkflowIntegration: React.FC<DocumentWorkflowIntegrationProps> = ({
  documentId,
  workflowId,
  showCreateButton = true,
  onIntegrationChange
}) => {
  const [integrations, setIntegrations] = useState<DocumentWorkflowIntegration[]>([]);
  const [history, setHistory] = useState<DocumentWorkflowHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('integrations');

  // Load data
  useEffect(() => {
    loadData();
  }, [documentId, workflowId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [integrationsResult, historyResult, statsResult] = await Promise.all([
        documentWorkflowService.getIntegrations(documentId, workflowId),
        documentWorkflowService.getHistory(documentId, workflowId),
        documentWorkflowService.getDocumentWorkflowStats()
      ]);

      if (integrationsResult.data) {
        setIntegrations(integrationsResult.data);
      }
      if (historyResult.data) {
        setHistory(historyResult.data);
      }
      if (statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async (integrationData: CreateDocumentWorkflowPayload) => {
    try {
      const result = await documentWorkflowService.createIntegration({
        ...integrationData,
        document_id: documentId || '',
        workflow_id: workflowId || '',
      });

      if (result.data) {
        setCreateDialogOpen(false);
        loadData();
        onIntegrationChange?.();
      }
    } catch (error) {
      console.error('Error creating integration:', error);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      const result = await documentWorkflowService.deleteIntegration(integrationId);
      if (!result.error) {
        loadData();
        onIntegrationChange?.();
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const handleStartWorkflow = async (documentId: string, workflowId: string) => {
    try {
      const result = await documentWorkflowService.startDocumentApprovalWorkflow(documentId, workflowId);
      if (result.data) {
        loadData();
        onIntegrationChange?.();
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  };

  const getIntegrationIcon = (integrationType: string) => {
    switch (integrationType) {
      case 'approval_workflow':
        return <CheckCircle className="w-4 h-4" />;
      case 'version_control':
        return <Download className="w-4 h-4" />;
      case 'workflow_trigger':
        return <AlertTriangle className="w-4 h-4" />;
      case 'workflow_history':
        return <History className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getIntegrationColor = (integrationType: string) => {
    switch (integrationType) {
      case 'approval_workflow':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'version_control':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'workflow_trigger':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'workflow_history':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'workflow_started':
        return <Workflow className="w-4 h-4" />;
      case 'workflow_completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'approval_granted':
        return <CheckCircle className="w-4 h-4" />;
      case 'approval_denied':
        return <XCircle className="w-4 h-4" />;
      case 'document_updated':
        return <Upload className="w-4 h-4" />;
      case 'version_created':
        return <Download className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'workflow_started':
        return 'bg-blue-100 text-blue-800';
      case 'workflow_completed':
        return 'bg-green-100 text-green-800';
      case 'approval_granted':
        return 'bg-green-100 text-green-800';
      case 'approval_denied':
        return 'bg-red-100 text-red-800';
      case 'document_updated':
        return 'bg-orange-100 text-orange-800';
      case 'version_created':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Document Workflow Integration</h2>
          {stats && (
            <div className="flex space-x-4">
              <Badge variant="outline" className="text-sm">
                {stats.total_documents_with_workflows} Documents with Workflows
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.documents_pending_approval} Pending Approval
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.active_workflows} Active Workflows
              </Badge>
            </div>
          )}
        </div>

        {showCreateButton && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Document Workflow Integration</DialogTitle>
                <DialogDescription>
                  Configure how documents integrate with workflows.
                </DialogDescription>
              </DialogHeader>
              <CreateIntegrationForm onSubmit={handleCreateIntegration} onCancel={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="approval-status">Approval Status</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Integrations</CardTitle>
              <CardDescription>
                Configure how documents interact with workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No workflow integrations configured for this document.
                </div>
              ) : (
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className={`p-4 rounded-lg border ${getIntegrationColor(integration.integration_type)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getIntegrationIcon(integration.integration_type)}
                          <div>
                            <h3 className="font-medium capitalize">
                              {integration.integration_type.replace('_', ' ')}
                            </h3>
                            <p className="text-sm opacity-75">
                              {integration.trigger_condition || 'No trigger condition'}
                            </p>
                            <div className="flex items-center space-x-4 text-xs mt-1">
                              <span className="flex items-center space-x-1">
                                <span>Auto Start:</span>
                                <span className={integration.auto_start ? 'text-green-600' : 'text-gray-500'}>
                                  {integration.auto_start ? 'Yes' : 'No'}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>Version Control:</span>
                                <span className={integration.version_control_enabled ? 'text-green-600' : 'text-gray-500'}>
                                  {integration.version_control_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>Approval Required:</span>
                                <span className={integration.approval_required ? 'text-green-600' : 'text-gray-500'}>
                                  {integration.approval_required ? 'Yes' : 'No'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {integration.integration_type === 'approval_workflow' && !integration.approval_request_id && (
                            <Button
                              size="sm"
                              onClick={() => handleStartWorkflow(integration.document_id, integration.workflow_id)}
                            >
                              Start Workflow
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteIntegration(integration.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow History</CardTitle>
              <CardDescription>
                Track all workflow-related activities for this document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No workflow history found for this document.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getActionIcon(entry.action_type)}
                            <Badge className={getActionColor(entry.action_type)}>
                              {entry.action_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.action_details ? (
                              <pre className="text-xs bg-gray-100 p-2 rounded">
                                {JSON.stringify(entry.action_details, null, 2)}
                              </pre>
                            ) : (
                              <span className="text-gray-500">No details</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {entry.performed_by || 'System'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {format(new Date(entry.performed_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval-status" className="space-y-4">
          <ApprovalStatusTab documentId={documentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Create Integration Form Component
const CreateIntegrationForm: React.FC<{
  onSubmit: (data: CreateDocumentWorkflowPayload) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    integration_type: 'approval_workflow' as const,
    trigger_condition: '',
    auto_start: false,
    version_control_enabled: true,
    approval_required: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="integration_type">Integration Type</Label>
        <Select value={formData.integration_type} onValueChange={(value: any) => setFormData({ ...formData, integration_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approval_workflow">Approval Workflow</SelectItem>
            <SelectItem value="version_control">Version Control</SelectItem>
            <SelectItem value="workflow_trigger">Workflow Trigger</SelectItem>
            <SelectItem value="workflow_history">Workflow History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="trigger_condition">Trigger Condition</Label>
        <Input
          id="trigger_condition"
          value={formData.trigger_condition}
          onChange={(e) => setFormData({ ...formData, trigger_condition: e.target.value })}
          placeholder="e.g., document_updated, version_created"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto_start">Auto Start Workflow</Label>
          <Switch
            id="auto_start"
            checked={formData.auto_start}
            onCheckedChange={(checked) => setFormData({ ...formData, auto_start: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="version_control_enabled">Enable Version Control</Label>
          <Switch
            id="version_control_enabled"
            checked={formData.version_control_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, version_control_enabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="approval_required">Require Approval</Label>
          <Switch
            id="approval_required"
            checked={formData.approval_required}
            onCheckedChange={(checked) => setFormData({ ...formData, approval_required: checked })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Integration
        </Button>
      </div>
    </form>
  );
};

// Approval Status Tab Component
const ApprovalStatusTab: React.FC<{ documentId?: string }> = ({ documentId }) => {
  const [approvalStatus, setApprovalStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (documentId) {
      loadApprovalStatus();
    }
  }, [documentId]);

  const loadApprovalStatus = async () => {
    setLoading(true);
    try {
      const result = await documentWorkflowService.getDocumentApprovalStatus(documentId!);
      if (result.data) {
        setApprovalStatus(result.data);
      }
    } catch (error) {
      console.error('Error loading approval status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!approvalStatus) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-gray-500">
          No approval status information available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Approval Status</CardTitle>
        <CardDescription>
          Current approval workflow status and details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Has Approval Workflow</Label>
              <div className="mt-1">
                <Badge className={approvalStatus.has_approval_workflow ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {approvalStatus.has_approval_workflow ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Approval Status</Label>
              <div className="mt-1">
                <Badge className="bg-blue-100 text-blue-800">
                  {approvalStatus.approval_status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Step</Label>
              <div className="mt-1 text-sm text-gray-600">
                {approvalStatus.current_step || 'Not available'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Workflow Name</Label>
              <div className="mt-1 text-sm text-gray-600">
                {approvalStatus.workflow_name || 'Not available'}
              </div>
            </div>
          </div>

          {approvalStatus.approval_request_id && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Approval Request Details</h4>
              <div className="text-sm text-blue-800">
                <p>Request ID: {approvalStatus.approval_request_id}</p>
                <p>Status: {approvalStatus.approval_status}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentWorkflowIntegration;
