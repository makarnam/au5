import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Share2, 
  Calendar,
  Target,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  Eye,
  Plus
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { AuditPlan, AuditPlanItem } from '../../types/auditPlanning';

const PlanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<AuditPlan | null>(null);
  const [planItems, setPlanItems] = useState<AuditPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPlanDetails();
    }
  }, [id]);

  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      const [planData, itemsData] = await Promise.all([
        auditPlanningService.getAuditPlan(id!),
        auditPlanningService.getAuditPlanItems(id!)
      ]);

      setPlan(planData);
      setPlanItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'in_review': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateProgress = () => {
    if (!planItems.length) return 0;
    const completed = planItems.filter(item => item.status === 'completed').length;
    return Math.round((completed / planItems.length) * 100);
  };

  const calculateTotalHours = () => {
    return planItems.reduce((total, item) => total + (item.planned_hours || 0), 0);
  };

  const calculateActualHours = () => {
    return planItems.reduce((total, item) => total + (item.actual_hours || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error || 'Plan not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
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
            <h1 className="text-2xl font-bold text-gray-900">{plan.plan_name}</h1>
            <p className="text-gray-600">Audit Plan Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <Link
            to={`/audit-planning/plans/${plan.id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan Info */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Plan Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Plan Type</label>
              <p className="text-sm text-gray-900 capitalize">{plan.plan_type.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Plan Year</label>
              <p className="text-sm text-gray-900">{plan.plan_year}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                {plan.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Created By</label>
              <p className="text-sm text-gray-900">
                {plan.created_by_user?.first_name} {plan.created_by_user?.last_name}
              </p>
            </div>
            {plan.approved_by_user && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Approved By</label>
                <p className="text-sm text-gray-900">
                  {plan.approved_by_user.first_name} {plan.approved_by_user.last_name}
                </p>
              </div>
            )}
            {plan.approved_at && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Approved At</label>
                <p className="text-sm text-gray-900">
                  {new Date(plan.approved_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {plan.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
              <p className="text-sm text-gray-900">{plan.description}</p>
            </div>
          )}

          {plan.strategic_objectives && plan.strategic_objectives.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">Strategic Objectives</label>
              <ul className="list-disc list-inside space-y-1">
                {plan.strategic_objectives.map((objective, index) => (
                  <li key={index} className="text-sm text-gray-900">{objective}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Total Items</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{planItems.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Planned Hours</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{calculateTotalHours()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">Budget</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                ${plan.total_budget?.toLocaleString() || '0'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm text-gray-600">Progress</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{calculateProgress()}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Analysis */}
      {(plan.risk_based_coverage_percentage || plan.compliance_coverage_percentage) && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Coverage Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.risk_based_coverage_percentage && (
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Risk-Based Coverage</p>
                  <p className="text-lg font-semibold text-gray-900">{plan.risk_based_coverage_percentage}%</p>
                </div>
              </div>
            )}
            {plan.compliance_coverage_percentage && (
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Compliance Coverage</p>
                  <p className="text-lg font-semibold text-gray-900">{plan.compliance_coverage_percentage}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Items */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Audit Plan Items</h2>
            <Link
              to={`/audit-planning/plans/${plan.id}/items/create`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Link>
          </div>
        </div>

        {planItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No audit items added to this plan yet.</p>
            <Link
              to={`/audit-planning/plans/${plan.id}/items/create`}
              className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add your first audit item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audit Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {planItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.audit_title}</div>
                        {item.universe_entity && (
                          <div className="text-sm text-gray-500">
                            {item.universe_entity.entity_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.audit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority_level)}`}>
                        {item.priority_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.planned_hours}h
                      {item.actual_hours > 0 && (
                        <span className="text-gray-500 ml-1">({item.actual_hours}h actual)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.team_size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/audit-planning/plans/${plan.id}/items/${item.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/audit-planning/plans/${plan.id}/items/${item.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white shadow rounded-lg p-6 mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Plan Created</p>
              <p className="text-sm text-gray-500">{new Date(plan.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {plan.approved_at && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Plan Approved</p>
                <p className="text-sm text-gray-500">{new Date(plan.approved_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {plan.updated_at && plan.updated_at !== plan.created_at && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Edit className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-500">{new Date(plan.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetailsPage;
