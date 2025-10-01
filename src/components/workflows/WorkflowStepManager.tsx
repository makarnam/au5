import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import workflows from '../../services/workflows';
import { WorkflowStep, Workflow, UserRole } from '../../types';
import { Plus, Edit, Trash2, Users, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';
import UserSelectionDropdown from './UserSelectionDropdown';

interface WorkflowStepManagerProps {
  workflowId: string;
  onStepsChange?: (steps: WorkflowStep[]) => void;
}

const WorkflowStepManager: React.FC<WorkflowStepManagerProps> = ({ 
  workflowId, 
  onStepsChange 
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const availableRoles = [
    'admin',
    'super_admin', 
    'risk_manager',
    'supervisor',
    'auditor',
    'supervisor_auditor',
    'compliance_manager',
    'business_unit_manager'
  ];

  useEffect(() => {
    loadSteps();
  }, [workflowId]);

  const loadSteps = async () => {
    try {
      setLoading(true);
      const result = await workflows.getWorkflowSteps(workflowId);
      if (result.data) {
        const sortedSteps = result.data.sort((a, b) => a.step_order - b.step_order);
        setSteps(sortedSteps);
        onStepsChange?.(sortedSteps);
      }
    } catch (error) {
      console.error('Workflow adımları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStep = async (stepData: Partial<WorkflowStep>) => {
    try {
      if (editingStep) {
        // Güncelleme
        await workflows.updateWorkflowStep(editingStep.id, stepData);
      } else {
        // Yeni adım ekleme
        const newStep = {
          ...stepData,
          workflow_id: workflowId,
          step_order: steps.length + 1,
          required: true,
          status: 'pending'
        } as WorkflowStep;
        
        await workflows.createWorkflowStep(newStep);
      }
      
      await loadSteps();
      setIsDialogOpen(false);
      setEditingStep(null);
    } catch (error) {
      console.error('Adım kaydedilirken hata:', error);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Bu adımı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await workflows.deleteWorkflowStep(stepId);
      await loadSteps();
    } catch (error) {
      console.error('Adım silinirken hata:', error);
    }
  };

  const moveStep = async (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    try {
      // Adımların sırasını değiştir
      const updatedSteps = [...steps];
      const [movedStep] = updatedSteps.splice(currentIndex, 1);
      updatedSteps.splice(newIndex, 0, movedStep);

      // Sıra numaralarını güncelle
      const reorderedSteps = updatedSteps.map((step, index) => ({
        ...step,
        step_order: index + 1
      }));

      // Veritabanını güncelle
      for (const step of reorderedSteps) {
        await workflows.updateWorkflowStep(step.id, { step_order: step.step_order });
      }

      await loadSteps();
    } catch (error) {
      console.error('Adım sırası değiştirilirken hata:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', text: 'Bekliyor' },
      in_progress: { color: 'bg-blue-100 text-blue-800', text: 'Devam Ediyor' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Tamamlandı' },
      skipped: { color: 'bg-yellow-100 text-yellow-800', text: 'Atlandı' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
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
        <h3 className="text-lg font-medium">Workflow Adımları</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adım Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingStep ? 'Adım Düzenle' : 'Yeni Adım Ekle'}
              </DialogTitle>
            </DialogHeader>
            <WorkflowStepForm
              step={editingStep}
              availableRoles={availableRoles}
              onSave={handleSaveStep}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingStep(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card key={step.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {step.step_order}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-200 mt-1"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{step.step_name}</h4>
                      {getStatusBadge(step.status)}
                      {step.required && (
                        <Badge variant="outline" className="text-xs">Zorunlu</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{step.assignee_role}</span>
                      </div>
                      {step.assignee_id && (
                        <span>• Belirli Kullanıcı: {step.assignee_id}</span>
                      )}
                    </div>
                    {step.comments && (
                      <p className="text-sm text-gray-500 mt-1">{step.comments}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveStep(step.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveStep(step.id, 'down')}
                    disabled={index === steps.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
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
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Adım Yok</h3>
              <p className="text-gray-600 mb-4">
                Bu workflow için henüz adım tanımlanmamış.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Adımı Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

interface WorkflowStepFormProps {
  step?: WorkflowStep | null;
  availableRoles: string[];
  onSave: (data: Partial<WorkflowStep>) => void;
  onCancel: () => void;
}

const WorkflowStepForm: React.FC<WorkflowStepFormProps> = ({
  step,
  availableRoles,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<{
    step_name: string;
    assignee_role: UserRole;
    assignee_id: string | undefined;
    required: boolean;
    comments: string;
  }>({
    step_name: step?.step_name || '',
    assignee_role: step?.assignee_role || 'admin',
    assignee_id: step?.assignee_id,
    required: step?.required ?? true,
    comments: step?.comments || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="step_name">Adım Adı</Label>
        <Input
          id="step_name"
          value={formData.step_name}
          onChange={(e) => setFormData(prev => ({ ...prev, step_name: e.target.value }))}
          placeholder="Örn: Risk Değerlendirmesi"
          required
        />
      </div>

      <div>
        <Label htmlFor="assignee_role">Atanan Rol</Label>
        <Select
          value={formData.assignee_role}
          onValueChange={(value) => setFormData(prev => ({ ...prev, assignee_role: value as UserRole }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Rol seçin" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assignee_id">Belirli Kullanıcı (Opsiyonel)</Label>
        <UserSelectionDropdown
          value={formData.assignee_id}
          onChange={(userId) => setFormData(prev => ({ ...prev, assignee_id: userId || undefined }))}
          placeholder="Kullanıcı seçin..."
          filterByRole={formData.assignee_role}
          disabled={!formData.assignee_role}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="required"
          checked={formData.required}
          onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="required">Bu adım zorunlu</Label>
      </div>

      <div>
        <Label htmlFor="comments">Açıklama</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
          placeholder="Adım hakkında açıklama..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit">
          {step ? 'Güncelle' : 'Ekle'}
        </Button>
      </div>
    </form>
  );
};

export default WorkflowStepManager;
