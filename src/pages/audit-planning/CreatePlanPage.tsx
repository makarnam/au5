import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  Target,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { AuditPlanFormData, AuditPlanItemFormData } from '../../types/auditPlanning';

const CreatePlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState<AuditPlanFormData>({
    plan_name: '',
    plan_type: 'annual',
    plan_year: new Date().getFullYear(),
    description: '',
    strategic_objectives: [],
    total_budget: undefined,
    risk_based_coverage_percentage: undefined,
    compliance_coverage_percentage: undefined
  });

  const [planItems, setPlanItems] = useState<Partial<AuditPlanItemFormData>[]>([]);
  const [currentObjective, setCurrentObjective] = useState('');

  const handlePlanDataChange = (field: keyof AuditPlanFormData, value: any) => {
    setPlanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addStrategicObjective = () => {
    if (currentObjective.trim()) {
      setPlanData(prev => ({
        ...prev,
        strategic_objectives: [...(prev.strategic_objectives || []), currentObjective.trim()]
      }));
      setCurrentObjective('');
    }
  };

  const removeStrategicObjective = (index: number) => {
    setPlanData(prev => ({
      ...prev,
      strategic_objectives: prev.strategic_objectives?.filter((_, i) => i !== index) || []
    }));
  };

  const addPlanItem = () => {
    setPlanItems(prev => [...prev, {
      audit_title: '',
      audit_type: '',
      priority_level: 'medium',
      planned_hours: 0,
      team_size: 1,
      audit_frequency_months: 12
    }]);
  };

  const updatePlanItem = (index: number, field: keyof AuditPlanItemFormData, value: any) => {
    setPlanItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removePlanItem = (index: number) => {
    setPlanItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the audit plan
      const createdPlan = await auditPlanningService.createAuditPlan(planData);

      // Create plan items
      for (const item of planItems) {
        if (item.audit_title && item.audit_type) {
          await auditPlanningService.createAuditPlanItem({
            ...item,
            audit_plan_id: createdPlan.id
          } as AuditPlanItemFormData);
        }
      }

      navigate(`/audit-planning/plans/${createdPlan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit plan');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = () => {
    return planItems.reduce((total, item) => total + (item.planned_hours || 0), 0);
  };

  const calculateTotalBudget = () => {
    const totalHours = calculateTotalHours();
    const hourlyRate = 150; // Default hourly rate
    return totalHours * hourlyRate;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/audit-planning/plans')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Plans
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Audit Plan</h1>
            <p className="text-gray-600">Define your audit strategy and objectives</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Plan Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Plan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                required
                value={planData.plan_name}
                onChange={(e) => handlePlanDataChange('plan_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024 Annual Audit Plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type *
              </label>
              <select
                required
                value={planData.plan_type}
                onChange={(e) => handlePlanDataChange('plan_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="annual">Annual</option>
                <option value="multi_year">Multi-Year</option>
                <option value="strategic">Strategic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Year *
              </label>
              <input
                type="number"
                required
                value={planData.plan_year}
                onChange={(e) => handlePlanDataChange('plan_year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={planData.total_budget || ''}
                  onChange={(e) => handlePlanDataChange('total_budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={planData.description || ''}
              onChange={(e) => handlePlanDataChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the audit plan objectives and scope..."
            />
          </div>
        </div>

        {/* Strategic Objectives */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Strategic Objectives</h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentObjective}
                onChange={(e) => setCurrentObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrategicObjective())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a strategic objective..."
              />
              <button
                type="button"
                onClick={addStrategicObjective}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {planData.strategic_objectives && planData.strategic_objectives.length > 0 && (
              <div className="space-y-2">
                {planData.strategic_objectives.map((objective, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">{objective}</span>
                    <button
                      type="button"
                      onClick={() => removeStrategicObjective(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coverage Targets */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Coverage Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk-Based Coverage Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={planData.risk_based_coverage_percentage || ''}
                  onChange={(e) => handlePlanDataChange('risk_based_coverage_percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Coverage Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={planData.compliance_coverage_percentage || ''}
                  onChange={(e) => handlePlanDataChange('compliance_coverage_percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Audit Plan Items</h2>
            <button
              type="button"
              onClick={addPlanItem}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          {planItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No audit items added yet. Click "Add Item" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {planItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Audit Item {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removePlanItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audit Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.audit_title || ''}
                        onChange={(e) => updatePlanItem(index, 'audit_title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., IT Security Audit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audit Type *
                      </label>
                      <select
                        required
                        value={item.audit_type || ''}
                        onChange={(e) => updatePlanItem(index, 'audit_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="financial">Financial</option>
                        <option value="operational">Operational</option>
                        <option value="compliance">Compliance</option>
                        <option value="it">IT</option>
                        <option value="security">Security</option>
                        <option value="risk">Risk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority Level
                      </label>
                      <select
                        value={item.priority_level || 'medium'}
                        onChange={(e) => updatePlanItem(index, 'priority_level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Planned Hours *
                      </label>
                      <input
                        type="number"
                        required
                        value={item.planned_hours || ''}
                        onChange={(e) => updatePlanItem(index, 'planned_hours', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Size
                      </label>
                      <input
                        type="number"
                        value={item.team_size || ''}
                        onChange={(e) => updatePlanItem(index, 'team_size', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency (months)
                      </label>
                      <input
                        type="number"
                        value={item.audit_frequency_months || ''}
                        onChange={(e) => updatePlanItem(index, 'audit_frequency_months', parseInt(e.target.value) || 12)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="12"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Plan Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-lg font-semibold text-gray-900">{planItems.length}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-lg font-semibold text-gray-900">{calculateTotalHours()}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Estimated Budget</p>
                <p className="text-lg font-semibold text-gray-900">${calculateTotalBudget().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/audit-planning/plans')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlanPage;
