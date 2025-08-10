import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { AuditPlanningMetrics, CoverageAnalysis, ResourceUtilization } from '../../types/auditPlanning';

const AuditPlanningDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AuditPlanningMetrics | null>(null);
  const [coverageAnalysis, setCoverageAnalysis] = useState<CoverageAnalysis[]>([]);
  const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, coverageData, utilizationData] = await Promise.all([
        auditPlanningService.getAuditPlanningMetrics(),
        auditPlanningService.getCoverageAnalysis(),
        auditPlanningService.getResourceUtilization()
      ]);

      setMetrics(metricsData);
      setCoverageAnalysis(coverageData);
      setResourceUtilization(utilizationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Planning Dashboard</h1>
          <p className="text-gray-600">Strategic audit planning and resource management</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/audit-planning/create-plan"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Universe Entities
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.total_universe_entities}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      High Risk Entities
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.high_risk_entities}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Overdue Audits
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.overdue_audits}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Planned Audits
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.planned_audits}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/audit-planning/universe"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Audit Universe</h4>
                <p className="text-sm text-gray-500">Manage auditable entities</p>
              </div>
            </Link>

            <Link
              to="/audit-planning/plans"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Audit Plans</h4>
                <p className="text-sm text-gray-500">Create and manage plans</p>
              </div>
            </Link>

            <Link
              to="/audit-planning/resources"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Resource Management</h4>
                <p className="text-sm text-gray-500">Allocate and track resources</p>
              </div>
            </Link>

            <Link
              to="/audit-planning/competencies"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Competencies</h4>
                <p className="text-sm text-gray-500">Manage auditor skills</p>
              </div>
            </Link>

            <Link
              to="/audit-planning/training"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Training Needs</h4>
                <p className="text-sm text-gray-500">Identify and track training</p>
              </div>
            </Link>

            <Link
              to="/audit-planning/risk-assessments"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Risk Assessments</h4>
                <p className="text-sm text-gray-500">Assess entity risks</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Coverage Analysis */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Audit Coverage Analysis</h3>
            <Link
              to="/audit-planning/coverage"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View Details →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Entities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audited
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coverageAnalysis.slice(0, 5).map((coverage, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {coverage.business_unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coverage.total_entities}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coverage.audited_entities}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getCoverageColor(coverage.coverage_percentage)}`}>
                      {coverage.coverage_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(coverage.risk_level)}`}>
                      {coverage.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Resource Utilization</h3>
            <Link
              to="/audit-planning/resources"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View Details →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auditor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resourceUtilization.slice(0, 5).map((resource, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {resource.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.allocated_hours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.available_hours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${resource.utilization_percentage > 80 ? 'text-red-600' : resource.utilization_percentage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {resource.utilization_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.slice(0, 2).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {resource.skills.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          +{resource.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Audit Hours
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.total_audit_hours.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Capacity Utilization
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.capacity_utilization}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Training Needs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.training_needs_count}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditPlanningDashboard;
