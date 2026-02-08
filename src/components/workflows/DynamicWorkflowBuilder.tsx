import React, { useState, useEffect, useRef } from 'react';
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
  Copy,
  Edit,
  GitBranch,
  Play,
  Plus,
  Save,
  Settings,
  Trash2,
  Zap,
  Move,
  ArrowRight,
  GitMerge
} from 'lucide-react';
import { workflowService, Workflow, WorkflowStep } from '../../services/workflowService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface DynamicWorkflowBuilderProps {
  workflowId?: string;
  onWorkflowSave?: (workflow: Workflow) => void;
  mode?: 'create' | 'edit' | 'template';
}

interface WorkflowNode {
  id: string;
  type: 'step' | 'condition' | 'parallel_start' | 'parallel_end';
  data: WorkflowStep | any;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowCanvas {
  nodes: WorkflowNode[];
  connections: Array<{ from: string; to: string }>;
}

const DynamicWorkflowBuilder: React.FC<DynamicWorkflowBuilderProps> = ({
  workflowId,
  onWorkflowSave,
  mode = 'create'
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [canvas, setCanvas] = useState<WorkflowCanvas>({ nodes: [], connections: [] });
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<WorkflowNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [newNode, setNewNode] = useState<Partial<WorkflowNode>>({
    type: 'step',
    data: {
      step_name: '',
      assignee_role: '',
      required: true
    }
  });

  useEffect(() => {
    loadWorkflows();
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
      const steps = await workflowService.getWorkflowSteps(id);

      setSelectedWorkflow(workflow);

      // Convert steps to canvas nodes
      const nodes: WorkflowNode[] = steps.map((step, index) => ({
        id: step.id,
        type: 'step',
        data: step,
        position: { x: 100 + (index * 200), y: 100 },
        connections: []
      }));

      // Create connections based on step_order and conditions
      const connections: Array<{ from: string; to: string }> = [];
      steps.forEach((step, index) => {
        if (index < steps.length - 1) {
          connections.push({
            from: step.id,
            to: steps[index + 1].id
          });
        }
      });

      setCanvas({ nodes, connections });
    } catch (error) {
      toast.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!draggedNode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update dragged node position
    setCanvas(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === draggedNode.id
          ? { ...node, position: { x, y } }
          : node
      )
    }));

    setDraggedNode(null);
  };

  const handleNodeClick = (node: WorkflowNode, event: React.MouseEvent) => {
    event.stopPropagation();

    if (isConnecting) {
      if (connectionStart && connectionStart !== node.id) {
        // Create connection
        setCanvas(prev => ({
          ...prev,
          connections: [...prev.connections, { from: connectionStart, to: node.id }]
        }));
        setIsConnecting(false);
        setConnectionStart(null);
      } else {
        setConnectionStart(node.id);
      }
    } else {
      setSelectedNode(node);
    }
  };

  const handleAddNode = (type: 'step' | 'condition' | 'parallel_start' | 'parallel_end') => {
    const nodeId = `node_${Date.now()}`;
    const newNode: WorkflowNode = {
      id: nodeId,
      type,
      data: type === 'step' ? {
        step_name: `New ${type}`,
        assignee_role: '',
        required: true
      } : {},
      position: { x: 200, y: 200 },
      connections: []
    };

    setCanvas(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    setSelectedNode(newNode);
    setShowNodeDialog(true);
  };

  const handleSaveNode = () => {
    if (!selectedNode) return;

    setCanvas(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...newNode.data } }
          : node
      )
    }));

    setShowNodeDialog(false);
    setNewNode({
      type: 'step',
      data: { step_name: '', assignee_role: '', required: true }
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setCanvas(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn =>
        conn.from !== nodeId && conn.to !== nodeId
      )
    }));
  };

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      setLoading(true);

      // Convert canvas nodes back to workflow steps
      const steps: Partial<WorkflowStep>[] = canvas.nodes
        .filter(node => node.type === 'step')
        .map((node, index) => ({
          id: node.data.id || undefined,
          workflow_id: selectedWorkflow.id,
          step_order: index + 1,
          step_name: node.data.step_name,
          assignee_role: node.data.assignee_role,
          assignee_id: node.data.assignee_id,
          required: node.data.required,
          status: node.data.status || 'pending'
        }));

      // Save/update steps
      for (const step of steps) {
        if (step.id) {
          await workflowService.updateWorkflowStep(step.id, step);
        } else {
          await workflowService.createWorkflowStep(step as any);
        }
      }

      // Validate workflow
      const validation = await workflowService.validateWorkflowStructure(selectedWorkflow.id);
      if (!validation.valid) {
        toast.error(`Workflow validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      toast.success('Workflow saved successfully');
      onWorkflowSave?.(selectedWorkflow);
    } catch (error) {
      toast.error('Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      setLoading(true);

      const customizations = {
        name: `Dynamic Workflow ${Date.now()}`,
        description: 'Created from template'
      };

      const newWorkflow = await workflowService.createDynamicWorkflow(templateId, customizations);
      await loadWorkflow(newWorkflow.id);

      setShowTemplateDialog(false);
      toast.success('Workflow created from template');
    } catch (error) {
      toast.error('Failed to create workflow from template');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      setLoading(true);
      const clone = await workflowService.cloneWorkflow(
        selectedWorkflow.id,
        `${selectedWorkflow.name} (Clone)`
      );
      await loadWorkflow(clone.id);
      toast.success('Workflow cloned successfully');
    } catch (error) {
      toast.error('Failed to clone workflow');
    } finally {
      setLoading(false);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'step': return <Play className="h-4 w-4" />;
      case 'condition': return <GitBranch className="h-4 w-4" />;
      case 'parallel_start': return <GitMerge className="h-4 w-4" />;
      case 'parallel_end': return <GitMerge className="h-4 w-4 rotate-180" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'step': return 'bg-blue-100 border-blue-300';
      case 'condition': return 'bg-yellow-100 border-yellow-300';
      case 'parallel_start': return 'bg-purple-100 border-purple-300';
      case 'parallel_end': return 'bg-purple-100 border-purple-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Dynamic Workflow Builder
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              New
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Create and modify workflows dynamically with drag-and-drop designer
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            From Template
          </Button>

          {selectedWorkflow && (
            <>
              <Button
                variant="outline"
                onClick={handleCloneWorkflow}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Clone
              </Button>

              <Button
                onClick={handleSaveWorkflow}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Workflow'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="designer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="designer">Designer</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="designer" className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleAddNode('step')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Step
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddNode('condition')}
                className="flex items-center gap-2"
              >
                <GitBranch className="h-4 w-4" />
                Add Condition
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddNode('parallel_start')}
                className="flex items-center gap-2"
              >
                <GitMerge className="h-4 w-4" />
                Parallel Start
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant={isConnecting ? 'default' : 'outline'}
                onClick={() => setIsConnecting(!isConnecting)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Nodes'}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div
                ref={canvasRef}
                className="relative w-full h-96 bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
                onClick={handleCanvasClick}
              >
                {canvas.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute p-3 rounded-lg border-2 cursor-move transition-all hover:shadow-lg ${getNodeColor(node.type)}`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      minWidth: '120px'
                    }}
                    onMouseDown={() => setDraggedNode(node)}
                    onClick={(e) => handleNodeClick(node, e)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getNodeIcon(node.type)}
                      <span className="font-medium text-sm">
                        {node.type === 'step' ? node.data.step_name : node.type}
                      </span>
                    </div>

                    {node.type === 'step' && (
                      <div className="text-xs text-muted-foreground">
                        {node.data.assignee_role}
                        {node.data.required && (
                          <Badge variant="destructive" className="ml-1 text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* Render connections */}
                <svg className="absolute inset-0 pointer-events-none">
                  {canvas.connections.map((conn, index) => {
                    const fromNode = canvas.nodes.find(n => n.id === conn.from);
                    const toNode = canvas.nodes.find(n => n.id === conn.to);

                    if (!fromNode || !toNode) return null;

                    const x1 = fromNode.position.x + 60;
                    const y1 = fromNode.position.y + 30;
                    const x2 = toNode.position.x + 60;
                    const y2 = toNode.position.y + 30;

                    return (
                      <line
                        key={index}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#666"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#666"
                      />
                    </marker>
                  </defs>
                </svg>

                {canvas.nodes.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Move className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Drag and drop workflow elements here</p>
                      <p className="text-sm">Use the toolbar above to add steps and conditions</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`cursor-pointer transition-colors ${
                  selectedWorkflow?.id === workflow.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => loadWorkflow(workflow.id)}
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

        <TabsContent value="templates" className="space-y-4">
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Workflow Templates</h3>
            <p className="text-muted-foreground">
              Create workflows from predefined templates (Coming Soon)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Node Configuration Dialog */}
      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {selectedNode?.type}</DialogTitle>
            <DialogDescription>
              Set up the properties for this workflow element
            </DialogDescription>
          </DialogHeader>

          {selectedNode?.type === 'step' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="step_name">Step Name</Label>
                <Input
                  id="step_name"
                  value={newNode.data?.step_name || ''}
                  onChange={(e) => setNewNode(prev => ({
                    ...prev,
                    data: { ...prev.data, step_name: e.target.value }
                  }))}
                  placeholder="e.g., Review Document"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee_role">Assignee Role</Label>
                <Input
                  id="assignee_role"
                  value={newNode.data?.assignee_role || ''}
                  onChange={(e) => setNewNode(prev => ({
                    ...prev,
                    data: { ...prev.data, assignee_role: e.target.value }
                  }))}
                  placeholder="e.g., Manager, Reviewer"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newNode.data?.required || false}
                  onChange={(e) => setNewNode(prev => ({
                    ...prev,
                    data: { ...prev.data, required: e.target.checked }
                  }))}
                />
                <Label htmlFor="required">Required Step</Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNodeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNode}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create from Template</DialogTitle>
            <DialogDescription>
              Choose a workflow template to create a new dynamic workflow
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            {workflows.slice(0, 6).map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCreateFromTemplate(workflow.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicWorkflowBuilder;