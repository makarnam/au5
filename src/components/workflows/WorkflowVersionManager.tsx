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
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  GitBranch,
  History,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  User,
  Zap
} from 'lucide-react';
import { workflowService, Workflow } from '../../services/workflowService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface WorkflowVersionManagerProps {
  workflowId?: string;
  onVersionActivate?: (version: any) => void;
}

interface WorkflowVersion {
  id: string;
  workflow_id: string;
  version_number: number;
  version_name: string;
  description?: string;
  workflow_data: any;
  steps_data: any[];
  conditions_data?: any[];
  created_by: string;
  created_at: string;
  is_active: boolean;
  change_summary?: string;
  parent_version_id?: string;
  creator_name?: string;
}

const WorkflowVersionManager: React.FC<WorkflowVersionManagerProps> = ({
  workflowId,
  onVersionActivate
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<WorkflowVersion | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version_name: '',
    description: '',
    change_summary: ''
  });
  const [compareVersions, setCompareVersions] = useState({
    version1: '',
    version2: ''
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
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

  const loadWorkflow = async (id: string) => {
    try {
      setLoading(true);
      const workflow = await workflowService.getWorkflowById(id);
      setSelectedWorkflow(workflow);
      await loadWorkflowVersions(id);
    } catch (error) {
      toast.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowVersions = async (workflowId: string) => {
    try {
      const data = await workflowService.getWorkflowVersions(workflowId);
      setVersions(data);
    } catch (error) {
      toast.error('Failed to load workflow versions');
    }
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    loadWorkflow(workflow.id);
  };

  const handleCreateVersion = async () => {
    if (!selectedWorkflow || !newVersion.version_name.trim()) {
      toast.error('Please fill in version name');
      return;
    }

    try {
      setLoading(true);
      await workflowService.createWorkflowVersion(selectedWorkflow.id, {
        version_name: newVersion.version_name,
        description: newVersion.description,
        change_summary: newVersion.change_summary
      });

      await loadWorkflowVersions(selectedWorkflow.id);
      setShowCreateDialog(false);
      setNewVersion({ version_name: '', description: '', change_summary: '' });

      toast.success('Workflow version created successfully');
    } catch (error) {
      toast.error('Failed to create workflow version');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateVersion = async (version: WorkflowVersion) => {
    try {
      setLoading(true);
      await workflowService.activateWorkflowVersion(version.id);

      // Reload versions to reflect changes
      await loadWorkflowVersions(selectedWorkflow!.id);

      onVersionActivate?.(version);
      toast.success(`Version ${version.version_number} activated successfully`);
    } catch (error) {
      toast.error('Failed to activate workflow version');
    } finally {
      setLoading(false);
    }
  };

  const handleCompareVersions = async () => {
    if (!compareVersions.version1 || !compareVersions.version2) {
      toast.error('Please select both versions to compare');
      return;
    }

    try {
      setLoading(true);
      const result = await workflowService.compareWorkflowVersions(
        compareVersions.version1,
        compareVersions.version2
      );
      setComparisonResult(result);
    } catch (error) {
      toast.error('Failed to compare versions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    try {
      setLoading(true);
      await workflowService.deleteWorkflowVersion(versionId);
      await loadWorkflowVersions(selectedWorkflow!.id);
      toast.success('Version deleted successfully');
    } catch (error) {
      toast.error('Failed to delete version');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVersionStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const renderComparisonResult = () => {
    if (!comparisonResult) return null;

    const { version1, version2, changes } = comparisonResult;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <h4 className="font-semibold">{version1.name}</h4>
            <p className="text-sm text-muted-foreground">
              Version {version1.number} • {formatDate(version1.created_at)}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="text-center">
            <h4 className="font-semibold">{version2.name}</h4>
            <p className="text-sm text-muted-foreground">
              Version {version2.number} • {formatDate(version2.created_at)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Workflow Changes */}
          {changes.workflow.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Workflow Changes</h5>
              <div className="space-y-2">
                {changes.workflow.map((change: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Badge variant={
                      change.change_type === 'added' ? 'default' :
                      change.change_type === 'removed' ? 'destructive' : 'secondary'
                    }>
                      {change.change_type}
                    </Badge>
                    <span className="font-medium">{change.field}:</span>
                    <span className="text-red-600 line-through">{JSON.stringify(change.old_value)}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-green-600">{JSON.stringify(change.new_value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps Changes */}
          <div>
            <h5 className="font-medium mb-2">Steps Changes</h5>

            {changes.steps.added.length > 0 && (
              <div className="mb-4">
                <h6 className="text-sm font-medium text-green-700 mb-2">Added Steps</h6>
                {changes.steps.added.map((step: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>{step.step_name}</span>
                  </div>
                ))}
              </div>
            )}

            {changes.steps.removed.length > 0 && (
              <div className="mb-4">
                <h6 className="text-sm font-medium text-red-700 mb-2">Removed Steps</h6>
                {changes.steps.removed.map((step: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                    <Trash2 className="h-4 w-4 text-red-600" />
                    <span>{step.step_name}</span>
                  </div>
                ))}
              </div>
            )}

            {changes.steps.modified.length > 0 && (
              <div className="mb-4">
                <h6 className="text-sm font-medium text-blue-700 mb-2">Modified Steps</h6>
                {changes.steps.modified.map((mod: any, index: number) => (
                  <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium mb-2">{mod.step_name}</div>
                    {mod.changes.map((change: any, changeIndex: number) => (
                      <div key={changeIndex} className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{change.field}:</span>
                        <span className="text-red-600 line-through">{JSON.stringify(change.old_value)}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="text-green-600">{JSON.stringify(change.new_value)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {changes.steps.added.length === 0 && changes.steps.removed.length === 0 && changes.steps.modified.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No step changes detected</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Workflow Version Manager
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
              New
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Track workflow changes, compare versions, and rollback when needed
          </p>
        </div>

        {selectedWorkflow && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Version
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowCompareDialog(true)}
              className="flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4" />
              Compare Versions
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
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
                    <History className="h-4 w-4" />
                    <span>{versions.filter(v => v.workflow_id === workflow.id).length} versions</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entity: {workflow.entity_type}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          {selectedWorkflow ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Versions for {selectedWorkflow.name}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {versions.length} total versions
                </div>
              </div>

              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Versions</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first version to start tracking changes
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    Create First Version
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <Card key={version.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              v{version.version_number}
                            </Badge>
                            <span>{version.version_name}</span>
                            <Badge className={getVersionStatusColor(version.is_active)}>
                              {version.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            {!version.is_active && (
                              <Button
                                size="sm"
                                onClick={() => handleActivateVersion(version)}
                                disabled={loading}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}

                            {!version.is_active && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteVersion(version.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardTitle>

                        <CardDescription className="space-y-2">
                          {version.description && <p>{version.description}</p>}
                          {version.change_summary && (
                            <p className="text-sm">
                              <strong>Changes:</strong> {version.change_summary}
                            </p>
                          )}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{version.creator_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(version.created_at)}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div>{version.steps_data?.length || 0} steps</div>
                            <div>{version.conditions_data?.length || 0} conditions</div>
                          </div>
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
                Select a workflow from the Workflows tab to manage versions
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Version History</h3>
            <p className="text-muted-foreground">
              Detailed change history and audit trail (Coming Soon)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Version Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Save the current state of the workflow as a new version
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version_name">Version Name</Label>
              <Input
                id="version_name"
                value={newVersion.version_name}
                onChange={(e) => setNewVersion(prev => ({
                  ...prev,
                  version_name: e.target.value
                }))}
                placeholder="e.g., Version 2.0 - Enhanced Approval Flow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newVersion.description}
                onChange={(e) => setNewVersion(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Describe what this version includes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="change_summary">Change Summary</Label>
              <Textarea
                id="change_summary"
                value={newVersion.change_summary}
                onChange={(e) => setNewVersion(prev => ({
                  ...prev,
                  change_summary: e.target.value
                }))}
                placeholder="Brief summary of changes made..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateVersion} disabled={loading}>
              {loading ? 'Creating...' : 'Create Version'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare Workflow Versions</DialogTitle>
            <DialogDescription>
              Compare two versions to see what changed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Version 1</Label>
                <Select
                  value={compareVersions.version1}
                  onValueChange={(value) => setCompareVersions(prev => ({
                    ...prev,
                    version1: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version_number} - {version.version_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Version 2</Label>
                <Select
                  value={compareVersions.version2}
                  onValueChange={(value) => setCompareVersions(prev => ({
                    ...prev,
                    version2: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version_number} - {version.version_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleCompareVersions} disabled={loading}>
                {loading ? 'Comparing...' : 'Compare Versions'}
              </Button>
            </div>

            {comparisonResult && renderComparisonResult()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowVersionManager;