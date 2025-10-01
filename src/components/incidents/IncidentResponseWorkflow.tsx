import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { workflowService } from '../../services/workflowService';
import { Plus, Edit, Trash2, Users, Clock, AlertTriangle } from 'lucide-react';

interface IncidentResponseWorkflowProps {
  incidentId: string;
  onWorkflowUpdate?: () => void;
}

interface WorkflowStep {
  id: string;
  step_name: string;
  assignee_role: string;
  assignee_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration: number; // hours
  actual_duration?: number;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_ROLES = [
  'incident_manager',
  'security_team',
  'it_support',
  'business_continuity',
  'executive_team',
  'external_vendor'
];

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  skipped: 'bg-purple-100 text-purple-800'
};

export default function IncidentResponseWorkflow({
  incidentId,
  onWorkflowUpdate
}: IncidentResponseWorkflowProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflowSteps();
  }, [incidentId]);

  async function loadWorkflowSteps() {
    try {
      setLoading(true);
      setError(null);

      // Get workflow steps for this incident
      const { data, error } = await supabase
        .from('incident_workflow_steps')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at');

      if (error) throw error;
      setSteps(data || []);
    } catch (err) {
      console.error('Error loading workflow steps:', err);
      setError('Failed to load workflow steps');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveStep = async (stepData: Partial<WorkflowStep>) => {
    try {
      setError(null);

      if (editingStep) {
        // Update existing step
        const { error } = await supabase
          .from('incident_workflow_steps')
          .update({
            ...stepData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingStep.id);

        if (error) throw error;
      } else {
        // Create new step
        const { error } = await supabase
          .from('incident_workflow_steps')
          .insert({
            incident_id: incidentId,
            ...stepData,
            status: 'pending'
          });

        if (error) throw error;
      }

      await loadWorkflowSteps();
      onWorkflowUpdate?.();
      setIsDialogOpen(false);
      setEditingStep(null);
    } catch (err) {
      console.error('Error saving step:', err);
      setError('Failed to save workflow step');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Bu adımı silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('incident_workflow_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      await loadWorkflowSteps();
      onWorkflowUpdate?.();
    } catch (err) {
      console.error('Error deleting step:', err);
      setError('Failed to delete workflow step');
    }
  };

  const handleStatusChange = async (stepId: string, newStatus: WorkflowStep['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'in_progress' && !steps.find(s => s.id === stepId)?.started_at) {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'completed' && !steps.find(s => s.id === stepId)?.completed_at) {
        updateData.completed_at = new Date().toISOString();
        const step = steps.find(s => s.id === stepId);
        if (step?.started_at) {
          const started = new Date(step.started_at);
          const completed = new Date();
          updateData.actual_duration = (completed.getTime() - started.getTime()) / (1000 * 60 * 60); // hours
        }
      }

      const { error } = await supabase
        .from('incident_workflow_steps')
        .update(updateData)
        .eq('id', stepId);

      if (error) throw error;

      await loadWorkflowSteps();
      onWorkflowUpdate?.();
    } catch (err) {
      console.error('Error updating step status:', err);
      setError('Failed to update step status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Incident Response Workflow <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">New</span>
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingStep ? 'Edit Response Step' : 'Add Response Step'}
              </DialogTitle>
            </DialogHeader>
            <WorkflowStepForm
              step={editingStep}
              onSave={handleSaveStep}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingStep(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card key={step.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-200 mt-1"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{step.step_name}</h4>
                      <Badge className={PRIORITY_COLORS[step.priority]}>
                        {step.priority}
                      </Badge>
                      <Badge className={STATUS_COLORS[step.status]}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{step.assignee_role}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{step.estimated_duration}h estimated</span>
                        {step.actual_duration && (
                          <span className="text-green-600">
                            ({step.actual_duration.toFixed(1)}h actual)
                          </span>
                        )}
                      </div>
                    </div>

                    {step.notes && (
                      <p className="text-sm text-gray-500">{step.notes}</p>
                    )}

                    {step.started_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        Started: {new Date(step.started_at).toLocaleString()}
                        {step.completed_at && (
                          <> • Completed: {new Date(step.completed_at).toLocaleString()}</>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {step.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(step.id, 'in_progress')}
                    >
                      Start
                    </Button>
                  )}
                  {step.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(step.id, 'completed')}
                    >
                      Complete
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingStep(step);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteStep(step.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {steps.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Response Steps</h3>
              <p className="text-gray-600 mb-4">
                Define the incident response workflow steps to coordinate the response effort.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Step
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface WorkflowStepFormProps {
  step?: WorkflowStep | null;
  onSave: (data: Partial<WorkflowStep>) => void;
  onCancel: () => void;
}

const WorkflowStepForm: React.FC<WorkflowStepFormProps> = ({
  step,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    step_name: step?.step_name || '',
    assignee_role: step?.assignee_role || '',
    assignee_id: step?.assignee_id || '',
    priority: step?.priority || 'medium',
    estimated_duration: step?.estimated_duration || 1,
    notes: step?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="step_name">Step Name</Label>
        <Input
          id="step_name"
          value={formData.step_name}
          onChange={(e) => setFormData(prev => ({ ...prev, step_name: e.target.value }))}
          placeholder="e.g., Assess Impact, Notify Stakeholders"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignee_role">Assignee Role</Label>
          <Select
            value={formData.assignee_role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, assignee_role: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: WorkflowStep['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="estimated_duration">Estimated Duration (hours)</Label>
        <Input
          id="estimated_duration"
          type="number"
          min="0.5"
          step="0.5"
          value={formData.estimated_duration}
          onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseFloat(e.target.value) }))}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional instructions or requirements..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {step ? 'Update Step' : 'Add Step'}
        </Button>
      </div>
    </form>
  );
};