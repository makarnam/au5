import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Plus,
  Trash2,
  Save,
  X,
  Calendar,
  Users,
  Target,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { GovernanceService, InitiativeFormData, StrategicInitiative } from '../../services/governanceService';
import toast from 'react-hot-toast';

interface InitiativeFormProps {
  initiative?: StrategicInitiative | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InitiativeForm({ initiative, onSuccess, onCancel }: InitiativeFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InitiativeFormData>({
    title: '',
    description: '',
    objective: '',
    strategic_alignment: '',
    priority: 'medium',
    status: 'planned',
    start_date: '',
    target_completion_date: '',
    budget_allocated: 0,
    sponsor: '',
    project_manager: '',
    stakeholders: [],
    deliverables: [],
    risks: []
  });

  useEffect(() => {
    if (initiative) {
      setFormData({
        title: initiative.title,
        description: initiative.description,
        objective: initiative.objective,
        strategic_alignment: initiative.strategic_alignment,
        priority: initiative.priority,
        status: initiative.status,
        start_date: initiative.start_date || '',
        target_completion_date: initiative.target_completion_date || '',
        budget_allocated: initiative.budget_allocated || 0,
        sponsor: initiative.sponsor || '',
        project_manager: initiative.project_manager || '',
        stakeholders: initiative.stakeholders,
        deliverables: initiative.deliverables,
        risks: initiative.risks
      });
    }
  }, [initiative]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty arrays
      const cleanedStakeholders = formData.stakeholders.filter(s => s.trim() !== '');
      const cleanedDeliverables = formData.deliverables.filter(d => d.trim() !== '');
      const cleanedRisks = formData.risks.filter(r => r.trim() !== '');

      const submitData = {
        ...formData,
        stakeholders: cleanedStakeholders.length > 0 ? cleanedStakeholders : [],
        deliverables: cleanedDeliverables.length > 0 ? cleanedDeliverables : [],
        risks: cleanedRisks.length > 0 ? cleanedRisks : []
      };

      if (initiative) {
        await GovernanceService.updateInitiative(initiative.id, submitData);
        toast.success('Initiative updated successfully!');
      } else {
        await GovernanceService.createInitiative(submitData);
        toast.success('Initiative created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving initiative:', error);
      toast.error('Failed to save initiative. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addStakeholder = () => {
    setFormData(prev => ({
      ...prev,
      stakeholders: [...prev.stakeholders, '']
    }));
  };

  const updateStakeholder = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.map((stakeholder, i) => i === index ? value : stakeholder)
    }));
  };

  const removeStakeholder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter((_, i) => i !== index)
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((deliverable, i) => i === index ? value : deliverable)
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const addRisk = () => {
    setFormData(prev => ({
      ...prev,
      risks: [...prev.risks, '']
    }));
  };

  const updateRisk = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.map((risk, i) => i === index ? value : risk)
    }));
  };

  const removeRisk = (index: number) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            {initiative ? 'Edit Strategic Initiative' : 'Create Strategic Initiative'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter initiative title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') =>
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the strategic initiative"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Strategic Objective *</label>
              <Textarea
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="What is the main objective of this initiative?"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Strategic Alignment</label>
              <Textarea
                value={formData.strategic_alignment}
                onChange={(e) => setFormData(prev => ({ ...prev, strategic_alignment: e.target.value }))}
                placeholder="How does this align with organizational strategy?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled') =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Target Completion Date</label>
                <Input
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_completion_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Budget Allocated</label>
                <Input
                  type="number"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_allocated: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sponsor</label>
                <Input
                  value={formData.sponsor}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsor: e.target.value }))}
                  placeholder="Executive sponsor"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Project Manager</label>
                <Input
                  value={formData.project_manager}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_manager: e.target.value }))}
                  placeholder="Project manager"
                />
              </div>
            </div>

            {/* Stakeholders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Key Stakeholders</label>
                <Button type="button" variant="outline" size="sm" onClick={addStakeholder}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Stakeholder
                </Button>
              </div>
              <AnimatePresence>
                {formData.stakeholders.map((stakeholder, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <Input
                      value={stakeholder}
                      onChange={(e) => updateStakeholder(index, e.target.value)}
                      placeholder={`Stakeholder ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.stakeholders.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStakeholder(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Deliverables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Key Deliverables</label>
                <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Deliverable
                </Button>
              </div>
              <AnimatePresence>
                {formData.deliverables.map((deliverable, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <Input
                      value={deliverable}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                      placeholder={`Deliverable ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.deliverables.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Risks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Potential Risks</label>
                <Button type="button" variant="outline" size="sm" onClick={addRisk}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Risk
                </Button>
              </div>
              <AnimatePresence>
                {formData.risks.map((risk, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <Input
                      value={risk}
                      onChange={(e) => updateRisk(index, e.target.value)}
                      placeholder={`Risk ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.risks.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRisk(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : (initiative ? 'Update Initiative' : 'Create Initiative')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}