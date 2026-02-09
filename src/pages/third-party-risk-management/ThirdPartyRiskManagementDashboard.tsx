import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { 
  Building2, 
  Shield, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  Calendar,
  Plus,
  RefreshCw
} from 'lucide-react';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import {
  ThirdPartyDashboardStats,
  ThirdPartyRiskDistribution,
  ThirdPartyAssessmentTrend,
  ThirdPartyIncidentTrend
} from '../../types/thirdPartyRiskManagement';
import { useNavigate } from 'react-router-dom';

const ThirdPartyRiskManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ThirdPartyDashboardStats | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<ThirdPartyRiskDistribution[]>([]);
  const [assessmentTrends, setAssessmentTrends] = useState<ThirdPartyAssessmentTrend[]>([]);
  const [incidentTrends, setIncidentTrends] = useState<ThirdPartyIncidentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsResult,
        riskDistributionResult,
        assessmentTrendsResult,
        incidentTrendsResult
      ] = await Promise.all([
        thirdPartyRiskManagementService.getDashboardStats(),
        thirdPartyRiskManagementService.getRiskDistribution(),
        thirdPartyRiskManagementService.getAssessmentTrends(),
        thirdPartyRiskManagementService.getIncidentTrends()
      ]);

      if (statsResult.error) throw new Error('Failed to load dashboard stats');
      if (riskDistributionResult.error) throw new Error('Failed to load risk distribution');
      if (assessmentTrendsResult.error) throw new Error('Failed to load assessment trends');
      if (incidentTrendsResult.error) throw new Error('Failed to load incident trends');

      setStats(statsResult.data);
      setRiskDistribution(riskDistributionResult.data);
      setAssessmentTrends(assessmentTrendsResult.data);
      setIncidentTrends(incidentTrendsResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Third Party Risk Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive vendor risk management and monitoring
          </p>
        </div>

        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/third-party-risk-management/create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Third Party
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Third Parties</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_third_parties || 0}</p>
              <p className="text-xs text-gray-500">{stats?.active_third_parties || 0} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">High Risk Vendors</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.high_risk_third_parties || 0}</p>
              <p className="text-xs text-gray-500">{stats?.critical_risk_third_parties || 0} critical</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Overdue Assessments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.overdue_assessments || 0}</p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Active Incidents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.active_incidents || 0}</p>
              <p className="text-xs text-gray-500">Under investigation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {riskDistribution.map((item) => (
                <div key={item.risk_level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRiskLevelIcon(item.risk_level)}
                    <span className="font-medium capitalize text-gray-900">{item.risk_level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.risk_level === 'critical' ? 'bg-red-500' :
                          item.risk_level === 'high' ? 'bg-orange-500' :
                          item.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assessment Trends */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Assessment Trends (Last 12 Months)</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {assessmentTrends.slice(-6).map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {trend.assessments_completed} assessments
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(String(trend.average_risk_score))}`}>
                      Avg: {trend.average_risk_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/third-party-risk-management/catalog')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <Building2 className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Third Party Catalog</span>
            </button>
            
            <button
              onClick={() => navigate('/third-party-risk-management/assessments')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <FileText className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Risk Assessments</span>
            </button>
            
            <button
              onClick={() => navigate('/third-party-risk-management/engagements')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <Users className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Engagements</span>
            </button>
            
            <button
              onClick={() => navigate('/third-party-risk-management/incidents')}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Incidents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats?.overdue_assessments && stats.overdue_assessments > 0 && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {stats.overdue_assessments} overdue assessment{stats.overdue_assessments > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600">Requires immediate attention</p>
                </div>
                <button
                  onClick={() => navigate('/third-party-risk-management/assessments')}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  View
                </button>
              </div>
            )}

            {stats?.upcoming_renewals && stats.upcoming_renewals > 0 && (
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.upcoming_renewals} contract{stats.upcoming_renewals > 1 ? 's' : ''} expiring soon
                  </p>
                  <p className="text-xs text-yellow-600">Within 30 days</p>
                </div>
                <button
                  onClick={() => navigate('/third-party-risk-management/contracts')}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  View
                </button>
              </div>
            )}

            {stats?.active_incidents && stats.active_incidents > 0 && (
              <div className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    {stats.active_incidents} active incident{stats.active_incidents > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-orange-600">Under investigation</p>
                </div>
                <button
                  onClick={() => navigate('/third-party-risk-management/incidents')}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  View
                </button>
              </div>
            )}

            {(!stats?.overdue_assessments || stats.overdue_assessments === 0) &&
             (!stats?.upcoming_renewals || stats.upcoming_renewals === 0) &&
             (!stats?.active_incidents || stats.active_incidents === 0) && (
              <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">All systems operational</p>
                  <p className="text-xs text-green-600">No critical alerts at this time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats?.average_risk_score || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">Average Risk Score</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(
                  (stats?.average_risk_score || 0) >= 75 ? 'critical' :
                  (stats?.average_risk_score || 0) >= 50 ? 'high' :
                  (stats?.average_risk_score || 0) >= 25 ? 'medium' : 'low'
                )}`}>
                  {(stats?.average_risk_score || 0) >= 75 ? 'Critical' :
                   (stats?.average_risk_score || 0) >= 50 ? 'High' :
                   (stats?.average_risk_score || 0) >= 25 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats?.total_third_parties && stats?.active_third_parties 
                  ? Math.round((stats.active_third_parties / stats.total_third_parties) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Active Vendors</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.active_third_parties || 0} of {stats?.total_third_parties || 0}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats?.total_third_parties && stats?.high_risk_third_parties && stats?.critical_risk_third_parties
                  ? Math.round(((stats.high_risk_third_parties + stats.critical_risk_third_parties) / stats.total_third_parties) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600 mt-1">High/Critical Risk</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats?.high_risk_third_parties || 0) + (stats?.critical_risk_third_parties || 0))} vendors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyRiskManagementDashboard;
