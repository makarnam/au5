import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { RiskScenario } from '../../services/governanceService';

interface RiskScenarioFormProps {
  initialData?: Partial<RiskScenario>;
  onSubmit: (data: Omit<RiskScenario, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RiskScenarioForm({ initialData, onSubmit, onCancel, loading }: RiskScenarioFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    framework_id: initialData?.framework_id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    impact_level: initialData?.impact_level || 'medium' as 'low' | 'medium' | 'high' | 'critical',
    probability: initialData?.probability || 25,
    potential_loss: initialData?.potential_loss || 0,
    mitigation_plan: initialData?.mitigation_plan || '',
    status: initialData?.status || 'identified' as 'identified' | 'assessed' | 'mitigated'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Scenario title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.mitigation_plan.trim()) {
      newErrors.mitigation_plan = 'Mitigation plan is required';
    }

    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    if (formData.potential_loss < 0) {
      newErrors.potential_loss = 'Potential loss cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Get current user for created_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const scenarioData = {
        ...formData,
        created_by: user.id
      };

      await onSubmit(scenarioData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Scenario Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter scenario title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the risk scenario"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact Level
              </label>
              <Select
                value={formData.impact_level}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') =>
                  setFormData(prev => ({ ...prev, impact_level: value }))
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: 'identified' | 'assessed' | 'mitigated') =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="assessed">Assessed</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probability (%) *
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData(prev => ({ ...prev, probability: parseFloat(e.target.value) || 0 }))}
                className={errors.probability ? 'border-red-500' : ''}
              />
              {errors.probability && <p className="text-red-500 text-sm mt-1">{errors.probability}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potential Loss ($) *
              </label>
              <Input
                type="number"
                min="0"
                value={formData.potential_loss}
                onChange={(e) => setFormData(prev => ({ ...prev, potential_loss: parseFloat(e.target.value) || 0 }))}
                className={errors.potential_loss ? 'border-red-500' : ''}
              />
              {errors.potential_loss && <p className="text-red-500 text-sm mt-1">{errors.potential_loss}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mitigation Plan *
            </label>
            <Textarea
              value={formData.mitigation_plan}
              onChange={(e) => setFormData(prev => ({ ...prev, mitigation_plan: e.target.value }))}
              placeholder="Describe the mitigation strategy"
              rows={4}
              className={errors.mitigation_plan ? 'border-red-500' : ''}
            />
            {errors.mitigation_plan && <p className="text-red-500 text-sm mt-1">{errors.mitigation_plan}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Update Scenario' : 'Create Scenario'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}