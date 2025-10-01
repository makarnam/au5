import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import { RiskAppetiteFormData } from '../../services/governanceService';

interface RiskAppetiteFormProps {
  initialData?: Partial<RiskAppetiteFormData>;
  onSubmit: (data: RiskAppetiteFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RiskAppetiteForm({ initialData, onSubmit, onCancel, loading }: RiskAppetiteFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RiskAppetiteFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    risk_categories: initialData?.risk_categories || [],
    appetite_levels: initialData?.appetite_levels || {
      low: 'Accept low levels of risk, conservative approach',
      moderate: 'Accept moderate levels of risk, balanced approach',
      high: 'Accept higher levels of risk, aggressive approach'
    },
    tolerance_thresholds: initialData?.tolerance_thresholds || {},
    review_frequency: initialData?.review_frequency || 'quarterly',
    next_review_date: initialData?.next_review_date || '',
    status: initialData?.status || 'draft'
  });

  const [newCategory, setNewCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Framework name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.risk_categories.length === 0) {
      newErrors.risk_categories = 'At least one risk category is required';
    }

    if (!formData.next_review_date) {
      newErrors.next_review_date = 'Next review date is required';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.risk_categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        risk_categories: [...prev.risk_categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => {
      const newThresholds = { ...prev.tolerance_thresholds };
      delete newThresholds[category.toLowerCase().replace(' ', '_')];

      return {
        ...prev,
        risk_categories: prev.risk_categories.filter(c => c !== category),
        tolerance_thresholds: newThresholds
      };
    });
  };

  const updateThreshold = (category: string, field: 'min' | 'max' | 'unit', value: string | number) => {
    const key = category.toLowerCase().replace(' ', '_');
    setFormData(prev => ({
      ...prev,
      tolerance_thresholds: {
        ...prev.tolerance_thresholds,
        [key]: {
          ...prev.tolerance_thresholds[key],
          [field]: value
        }
      }
    }));
  };

  const getThresholdForCategory = (category: string) => {
    const key = category.toLowerCase().replace(' ', '_');
    return formData.tolerance_thresholds[key] || { min: 0, max: 100, unit: 'percentage' };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Framework Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter framework name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the risk appetite framework"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Frequency
              </label>
              <Select
                value={formData.review_frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, review_frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Review Date *
              </label>
              <Input
                type="date"
                value={formData.next_review_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_review_date: e.target.value }))}
                className={errors.next_review_date ? 'border-red-500' : ''}
              />
              {errors.next_review_date && <p className="text-red-500 text-sm mt-1">{errors.next_review_date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'approved' | 'under_review') =>
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add risk category"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            />
            <Button type="button" onClick={addCategory} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {errors.risk_categories && <p className="text-red-500 text-sm">{errors.risk_categories}</p>}

          <div className="flex flex-wrap gap-2">
            {formData.risk_categories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                {category}
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appetite Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Appetite Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.appetite_levels).map(([level, description]) => (
            <div key={level} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {level} Risk Appetite
              </label>
              <Textarea
                value={description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  appetite_levels: {
                    ...prev.appetite_levels,
                    [level]: e.target.value
                  }
                }))}
                placeholder={`Describe ${level} risk appetite`}
                rows={2}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tolerance Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Tolerance Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.risk_categories.map((category) => {
            const threshold = getThresholdForCategory(category);
            return (
              <div key={category} className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                    <Input
                      type="number"
                      value={threshold.min}
                      onChange={(e) => updateThreshold(category, 'min', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                    <Input
                      type="number"
                      value={threshold.max}
                      onChange={(e) => updateThreshold(category, 'max', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Unit</label>
                    <Select
                      value={threshold.unit}
                      onValueChange={(value) => updateThreshold(category, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="currency_usd">USD ($)</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="violations_per_quarter">Violations/Quarter</SelectItem>
                        <SelectItem value="breach_probability">Breach Probability (%)</SelectItem>
                        <SelectItem value="negative_sentiment_score">Sentiment Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
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
              {initialData ? 'Update Framework' : 'Create Framework'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}