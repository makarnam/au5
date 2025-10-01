import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Save,
  X,
  TrendingUp,
  Calendar,
  Target,
  FileText,
  Hash,
  DollarSign,
  Percent
} from 'lucide-react';
import { GovernanceService, KPIFormData, GovernanceKPI } from '../../services/governanceService';
import toast from 'react-hot-toast';

interface KPIFormProps {
  kpi?: GovernanceKPI | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function KPIForm({ kpi, onSuccess, onCancel }: KPIFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<KPIFormData>({
    name: '',
    description: '',
    category: '',
    metric_type: 'percentage',
    target_value: 0,
    current_value: 0,
    unit: '',
    frequency: 'quarterly',
    calculation_method: '',
    data_source: '',
    responsible_person: '',
    status: 'active'
  });

  useEffect(() => {
    if (kpi) {
      setFormData({
        name: kpi.name,
        description: kpi.description,
        category: kpi.category,
        metric_type: kpi.metric_type,
        target_value: kpi.target_value || 0,
        current_value: kpi.current_value || 0,
        unit: kpi.unit || '',
        frequency: kpi.frequency,
        calculation_method: kpi.calculation_method || '',
        data_source: kpi.data_source || '',
        responsible_person: kpi.responsible_person || '',
        status: kpi.status
      });
    }
  }, [kpi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (kpi) {
        await GovernanceService.updateKPI(kpi.id, formData);
        toast.success('KPI updated successfully!');
      } else {
        await GovernanceService.createKPI(formData);
        toast.success('KPI created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving KPI:', error);
      toast.error('Failed to save KPI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMetricTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'currency':
        return <DollarSign className="w-4 h-4" />;
      case 'count':
        return <Hash className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
            <BarChart3 className="w-6 h-6 text-blue-600" />
            {kpi ? 'Edit Governance KPI' : 'Create Governance KPI'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">KPI Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter KPI name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Financial, Operational, Compliance"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this KPI measures"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Metric Type</label>
                <Select
                  value={formData.metric_type}
                  onValueChange={(value: 'percentage' | 'count' | 'currency' | 'ratio' | 'index') =>
                    setFormData(prev => ({ ...prev, metric_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="count">Count (Number)</SelectItem>
                    <SelectItem value="currency">Currency ($)</SelectItem>
                    <SelectItem value="ratio">Ratio</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Unit</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., %, USD, items"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Frequency</label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual') =>
                    setFormData(prev => ({ ...prev, frequency: value }))
                  }
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Target Value *</label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter target value"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Current Value</label>
                <Input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter current value"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Responsible Person</label>
                <Input
                  value={formData.responsible_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsible_person: e.target.value }))}
                  placeholder="Person responsible for this KPI"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'archived') =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Calculation Method</label>
              <Textarea
                value={formData.calculation_method}
                onChange={(e) => setFormData(prev => ({ ...prev, calculation_method: e.target.value }))}
                placeholder="Describe how this KPI is calculated"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data Source</label>
              <Input
                value={formData.data_source}
                onChange={(e) => setFormData(prev => ({ ...prev, data_source: e.target.value }))}
                placeholder="Source system or method for KPI data"
              />
            </div>

            {/* KPI Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                KPI Preview
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formData.name || 'KPI Name'}</div>
                  <div className="text-sm text-gray-600">{formData.category || 'Category'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formData.current_value || 0}</div>
                  <div className="text-sm text-gray-600">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{formData.target_value || 0}</div>
                  <div className="text-sm text-gray-600">Target</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.status)}`}>
                  {formData.status}
                </span>
                <span className="text-xs text-gray-600 capitalize">{formData.frequency}</span>
                {getMetricTypeIcon(formData.metric_type)}
                <span className="text-xs text-gray-600">{formData.metric_type}</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : (kpi ? 'Update KPI' : 'Create KPI')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}