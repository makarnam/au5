import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { aiGovernanceService } from '../../services/aiGovernanceService';
import { AIModelFormData, AIModelType, AIProvider, DeploymentEnvironment, RiskLevel } from '../../types/aiGovernance';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

const CreateEditAIModel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState<AIModelFormData>({
    name: '',
    description: '',
    model_type: 'llm',
    provider: 'openai',
    version: '',
    deployment_environment: 'development',
    business_unit_id: '',
    owner_id: '',
    risk_level: 'medium',
    data_sources: [],
    training_data_description: '',
    model_performance_metrics: {}
  });

  const [newDataSource, setNewDataSource] = useState('');
  const [newMetricKey, setNewMetricKey] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [businessUnitsData, usersData] = await Promise.all([
        aiGovernanceService.getBusinessUnits(),
        aiGovernanceService.getUsers()
      ]);

      setBusinessUnits(businessUnitsData);
      setUsers(usersData);

      if (isEdit && id) {
        const modelData = await aiGovernanceService.getAIModel(id);
        setFormData({
          name: modelData.name,
          description: modelData.description || '',
          model_type: modelData.model_type,
          provider: modelData.provider,
          version: modelData.version || '',
          deployment_environment: modelData.deployment_environment,
          business_unit_id: modelData.business_unit_id || '',
          owner_id: modelData.owner_id || '',
          risk_level: modelData.risk_level,
          data_sources: modelData.data_sources || [],
          training_data_description: modelData.training_data_description || '',
          model_performance_metrics: modelData.model_performance_metrics || {}
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AIModelFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addDataSource = () => {
    if (newDataSource.trim()) {
      setFormData(prev => ({
        ...prev,
        data_sources: [...(prev.data_sources || []), newDataSource.trim()]
      }));
      setNewDataSource('');
    }
  };

  const removeDataSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      data_sources: prev.data_sources?.filter((_, i) => i !== index) || []
    }));
  };

  const addPerformanceMetric = () => {
    if (newMetricKey.trim() && newMetricValue.trim()) {
      const value = isNaN(Number(newMetricValue)) ? newMetricValue : Number(newMetricValue);
      setFormData(prev => ({
        ...prev,
        model_performance_metrics: {
          ...prev.model_performance_metrics,
          [newMetricKey.trim()]: value
        }
      }));
      setNewMetricKey('');
      setNewMetricValue('');
    }
  };

  const removePerformanceMetric = (key: string) => {
    setFormData(prev => {
      const newMetrics = { ...prev.model_performance_metrics };
      delete newMetrics[key];
      return {
        ...prev,
        model_performance_metrics: newMetrics
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Model name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEdit && id) {
        await aiGovernanceService.updateAIModel(id, formData);
      } else {
        await aiGovernanceService.createAIModel(formData);
      }

      navigate('/ai-governance/models');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save model');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/ai-governance/models')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Models
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit AI Model' : 'Create AI Model'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update the AI model information' : 'Add a new AI model to the governance system'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter model name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="e.g., 1.0.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the model's purpose and capabilities"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="model_type">Model Type *</Label>
                <select
                  id="model_type"
                  value={formData.model_type}
                  onChange={(e) => handleInputChange('model_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="llm">Large Language Model (LLM)</option>
                  <option value="ml">Machine Learning</option>
                  <option value="nlp">Natural Language Processing</option>
                  <option value="computer_vision">Computer Vision</option>
                  <option value="recommendation">Recommendation System</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="provider">Provider *</Label>
                <select
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="meta">Meta</option>
                  <option value="custom">Custom</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="deployment_environment">Environment *</Label>
                <select
                  id="deployment_environment"
                  value={formData.deployment_environment}
                  onChange={(e) => handleInputChange('deployment_environment', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="research">Research</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ownership & Risk */}
        <Card>
          <CardHeader>
            <CardTitle>Ownership & Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="business_unit">Business Unit</Label>
                <select
                  id="business_unit"
                  value={formData.business_unit_id}
                  onChange={(e) => handleInputChange('business_unit_id', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Business Unit</option>
                  {businessUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="owner">Model Owner</Label>
                <select
                  id="owner"
                  value={formData.owner_id}
                  onChange={(e) => handleInputChange('owner_id', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="risk_level">Risk Level *</Label>
                <select
                  id="risk_level"
                  value={formData.risk_level}
                  onChange={(e) => handleInputChange('risk_level', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newDataSource}
                onChange={(e) => setNewDataSource(e.target.value)}
                placeholder="Enter data source"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDataSource())}
              />
              <Button
                type="button"
                onClick={addDataSource}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.data_sources && formData.data_sources.length > 0 && (
              <div className="space-y-2">
                {formData.data_sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{source}</span>
                    <Button
                      type="button"
                      onClick={() => removeDataSource(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="training_data">Training Data Description</Label>
              <Textarea
                id="training_data"
                value={formData.training_data_description}
                onChange={(e) => handleInputChange('training_data_description', e.target.value)}
                placeholder="Describe the training data used for this model"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={newMetricKey}
                onChange={(e) => setNewMetricKey(e.target.value)}
                placeholder="Metric name"
              />
              <Input
                value={newMetricValue}
                onChange={(e) => setNewMetricValue(e.target.value)}
                placeholder="Metric value"
              />
              <Button
                type="button"
                onClick={addPerformanceMetric}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Metric
              </Button>
            </div>

            {formData.model_performance_metrics && Object.keys(formData.model_performance_metrics).length > 0 && (
              <div className="space-y-2">
                {Object.entries(formData.model_performance_metrics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">{key}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{value}</span>
                      <Button
                        type="button"
                        onClick={() => removePerformanceMetric(key)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/ai-governance/models')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Model' : 'Create Model'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditAIModel;
