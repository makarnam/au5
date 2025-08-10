import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { 
  AuditPlan, 
  AuditPlanItem,
  PlanType, 
  PlanStatus,
  AuditPlanFormData 
} from '../../types/auditPlanning';

interface AuditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: AuditPlan;
  onSave: (data: AuditPlanFormData) => void;
}

const AuditPlanModal: React.FC<AuditPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSave
}) => {
  const [formData, setFormData] = useState<AuditPlanFormData>({
    plan_name: '',
    plan_type: 'annual',
    plan_year: new Date().getFullYear(),
    description: '',
    strategic_objectives: [],
    total_budget: undefined,
    risk_based_coverage_percentage: undefined,
    compliance_coverage_percentage: undefined
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name,
        plan_type: plan.plan_type,
        plan_year: plan.plan_year,
        description: plan.description || '',
        strategic_objectives: plan.strategic_objectives || [],
        total_budget: plan.total_budget,
        risk_based_coverage_percentage: plan.risk_based_coverage_percentage,
        compliance_coverage_percentage: plan.compliance_coverage_percentage
      });
    } else {
      setFormData({
        plan_name: '',
        plan_type: 'annual',
        plan_year: new Date().getFullYear(),
        description: '',
        strategic_objectives: [],
        total_budget: undefined,
        risk_based_coverage_percentage: undefined,
        compliance_coverage_percentage: undefined
      });
    }
  }, [plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      strategic_objectives: [...(formData.strategic_objectives || []), '']
    });
  };

  const updateObjective = (index: number, value: string) => {
    const objectives = [...(formData.strategic_objectives || [])];
    objectives[index] = value;
    setFormData({
      ...formData,
      strategic_objectives: objectives
    });
  };

  const removeObjective = (index: number) => {
    const objectives = [...(formData.strategic_objectives || [])];
    objectives.splice(index, 1);
    setFormData({
      ...formData,
      strategic_objectives: objectives
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {plan ? 'Edit Audit Plan' : 'Create New Audit Plan'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan Type *
                </label>
                <select
                  required
                  value={formData.plan_type}
                  onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as PlanType })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="annual">Annual</option>
                  <option value="multi_year">Multi-Year</option>
                  <option value="strategic">Strategic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan Year *
                </label>
                <input
                  type="number"
                  required
                  min={new Date().getFullYear()}
                  value={formData.plan_year}
                  onChange={(e) => setFormData({ ...formData, plan_year: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Budget
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_budget || ''}
                  onChange={(e) => setFormData({ ...formData, total_budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Risk-Based Coverage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.risk_based_coverage_percentage || ''}
                  onChange={(e) => setFormData({ ...formData, risk_based_coverage_percentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Compliance Coverage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.compliance_coverage_percentage || ''}
                  onChange={(e) => setFormData({ ...formData, compliance_coverage_percentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Strategic Objectives
              </label>
              <div className="space-y-2">
                {formData.strategic_objectives?.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter strategic objective"
                    />
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addObjective}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Objective
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {plan ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AuditPlans: React.FC = () => {
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    plan_type: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AuditPlan | undefined>();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await auditPlanningService.getAllAuditPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (formData: AuditPlanFormData) => {
    try {
      await auditPlanningService.createAuditPlan(formData);
      setIsModalOpen(false);
      loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit plan');
    }
  };

  const handleUpdatePlan = async (formData: AuditPlanFormData) => {
    if (!editingPlan) return;
    
    try {
      await auditPlanningService.updateAuditPlan(editingPlan.id, formData);
      setIsModalOpen(false);
      setEditingPlan(undefined);
      loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update audit plan');
    }
  };

  const handleApprovePlan = async (planId: string) => {
    try {
      await auditPlanningService.approveAuditPlan(planId);
      loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve audit plan');
    }
  };

  const handleEdit = (plan: AuditPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'in_review': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'archived': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanTypeIcon = (type: PlanType) => {
    switch (type) {
      case 'annual': return <Calendar className="h-4 w-4" />;
      case 'multi_year': return <TrendingUp className="h-4 w-4" />;
      case 'strategic': return <Target className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedFilters.plan_type || plan.plan_type === selectedFilters.plan_type;
    const matchesStatus = !selectedFilters.status || plan.status === selectedFilters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Plans</h1>
          <p className="text-gray-600">Manage strategic audit planning and resource allocation</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadPlans}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedFilters.plan_type}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, plan_type: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Plan Types</option>
                <option value="annual">Annual</option>
                <option value="multi_year">Multi-Year</option>
                <option value="strategic">Strategic</option>
              </select>

              <select
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getPlanTypeIcon(plan.plan_type)}
                  <span className="ml-2 text-sm font-medium text-gray-500 capitalize">
                    {plan.plan_type.replace('_', ' ')}
                  </span>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                  {plan.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {plan.plan_name}
              </h3>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {plan.description}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Year:</span>
                  <span className="font-medium">{plan.plan_year}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Planned Audits:</span>
                  <span className="font-medium">{plan.total_planned_audits}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Hours:</span>
                  <span className="font-medium">{plan.total_planned_hours.toLocaleString()}</span>
                </div>

                {plan.total_budget && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-medium">${plan.total_budget.toLocaleString()}</span>
                  </div>
                )}

                {plan.risk_based_coverage_percentage && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Risk Coverage:</span>
                    <span className="font-medium">{plan.risk_based_coverage_percentage}%</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Created by {plan.created_by_user?.first_name} {plan.created_by_user?.last_name}
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/audit-planning/plans/${plan.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {plan.status === 'draft' && (
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {plan.status === 'in_review' && (
                    <button
                      onClick={() => handleApprovePlan(plan.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit plans found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new audit plan.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AuditPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(undefined);
        }}
        plan={editingPlan}
        onSave={editingPlan ? handleUpdatePlan : handleCreatePlan}
      />
    </div>
  );
};

export default AuditPlans;
