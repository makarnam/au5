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
  Target,
  Plus,
  Trash2,
  Save,
  X,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';
import { GovernanceService, StrategyFormData, GovernanceStrategy } from '../../services/governanceService';
import toast from 'react-hot-toast';

interface StrategyFormProps {
  strategy?: GovernanceStrategy | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface StrategicGoal {
  name: string;
  target: number;
  unit: string;
}

interface KPIGoal {
  name: string;
  target: string;
  frequency: string;
}

export default function StrategyForm({ strategy, onSuccess, onCancel }: StrategyFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StrategyFormData>({
    title: '',
    description: '',
    status: 'draft',
    version: '1.0',
    effective_date: '',
    review_date: '',
    objectives: [''],
    strategic_goals: { goals: [] },
    kpis: { kpis: [] }
  });

  useEffect(() => {
    if (strategy) {
      setFormData({
        title: strategy.title,
        description: strategy.description,
        status: strategy.status,
        version: strategy.version,
        effective_date: strategy.effective_date || '',
        review_date: strategy.review_date || '',
        objectives: strategy.objectives.length > 0 ? strategy.objectives : [''],
        strategic_goals: strategy.strategic_goals,
        kpis: strategy.kpis
      });
    }
  }, [strategy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty objectives
      const cleanedObjectives = formData.objectives.filter(obj => obj.trim() !== '');
      const submitData = {
        ...formData,
        objectives: cleanedObjectives.length > 0 ? cleanedObjectives : ['']
      };

      console.log('Submitting strategy data:', submitData);
      console.log('Form data structure:', JSON.stringify(submitData, null, 2));
      console.log('Strategic goals type:', typeof submitData.strategic_goals);
      console.log('KPIs type:', typeof submitData.kpis);
      console.log('Objectives type:', typeof submitData.objectives);

      if (strategy) {
        await GovernanceService.updateStrategy(strategy.id, submitData);
        toast.success('Strategy updated successfully!');
      } else {
        await GovernanceService.createStrategy(submitData);
        toast.success('Strategy created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving strategy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save strategy. Please try again.';
      console.error('Error details:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addStrategicGoal = () => {
    setFormData(prev => ({
      ...prev,
      strategic_goals: {
        goals: [...prev.strategic_goals.goals, { name: '', target: 0, unit: 'percentage' }]
      }
    }));
  };

  const updateStrategicGoal = (index: number, field: keyof StrategicGoal, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      strategic_goals: {
        goals: prev.strategic_goals.goals.map((goal, i) =>
          i === index ? { ...goal, [field]: value } : goal
        )
      }
    }));
  };

  const removeStrategicGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strategic_goals: {
        goals: prev.strategic_goals.goals.filter((_, i) => i !== index)
      }
    }));
  };

  const addKPI = () => {
    setFormData(prev => ({
      ...prev,
      kpis: {
        kpis: [...prev.kpis.kpis, { name: '', target: '', frequency: 'quarterly' }]
      }
    }));
  };

  const updateKPI = (index: number, field: keyof KPIGoal, value: string) => {
    setFormData(prev => ({
      ...prev,
      kpis: {
        kpis: prev.kpis.kpis.map((kpi, i) =>
          i === index ? { ...kpi, [field]: value } : kpi
        )
      }
    }));
  };

  const removeKPI = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kpis: {
        kpis: prev.kpis.kpis.filter((_, i) => i !== index)
      }
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
            <Target className="w-6 h-6 text-blue-600" />
            {strategy ? 'Edit Governance Strategy' : 'Create Governance Strategy'}
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
                  placeholder="Enter strategy title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Version</label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the governance strategy"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'active' | 'archived') =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Effective Date</label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Review Date</label>
                <Input
                  type="date"
                  value={formData.review_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, review_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Strategic Objectives */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Strategic Objectives</label>
                <Button type="button" variant="outline" size="sm" onClick={addObjective}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Objective
                </Button>
              </div>
              <AnimatePresence>
                {formData.objectives.map((objective, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <Input
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder={`Objective ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.objectives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeObjective(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Strategic Goals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Strategic Goals</label>
                <Button type="button" variant="outline" size="sm" onClick={addStrategicGoal}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </div>
              <AnimatePresence>
                {formData.strategic_goals.goals.map((goal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg"
                  >
                    <Input
                      value={goal.name}
                      onChange={(e) => updateStrategicGoal(index, 'name', e.target.value)}
                      placeholder="Goal name"
                    />
                    <Input
                      type="number"
                      value={goal.target}
                      onChange={(e) => updateStrategicGoal(index, 'target', parseFloat(e.target.value) || 0)}
                      placeholder="Target"
                    />
                    <Select
                      value={goal.unit}
                      onValueChange={(value) => updateStrategicGoal(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeStrategicGoal(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* KPIs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Key Performance Indicators</label>
                <Button type="button" variant="outline" size="sm" onClick={addKPI}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add KPI
                </Button>
              </div>
              <AnimatePresence>
                {formData.kpis.kpis.map((kpi, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg"
                  >
                    <Input
                      value={kpi.name}
                      onChange={(e) => updateKPI(index, 'name', e.target.value)}
                      placeholder="KPI name"
                    />
                    <Input
                      value={kpi.target}
                      onChange={(e) => updateKPI(index, 'target', e.target.value)}
                      placeholder="Target value"
                    />
                    <Select
                      value={kpi.frequency}
                      onValueChange={(value) => updateKPI(index, 'frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeKPI(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                {loading ? 'Saving...' : (strategy ? 'Update Strategy' : 'Create Strategy')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}