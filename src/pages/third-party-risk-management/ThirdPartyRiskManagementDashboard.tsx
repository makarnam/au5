import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Building2, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import {
  ThirdPartyDashboardStats,
  ThirdPartyRiskDistribution,
  ThirdPartyAssessmentTrend,
  ThirdPartyIncidentTrend
} from '../../types/thirdPartyRiskManagement';
import { Link } from 'react-router-dom';

const ThirdPartyRiskManagementDashboard: React.FC = () => {
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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Third Party Risk Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive vendor risk management and monitoring</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/third-party-risk-management/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Third Party
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Third Parties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_third_parties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_third_parties || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Vendors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.high_risk_third_parties || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.critical_risk_third_parties || 0} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Assessments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.overdue_assessments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.active_incidents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Under investigation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskDistribution.map((item) => (
                <div key={item.risk_level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getRiskLevelIcon(item.risk_level)}</span>
                    <span className="font-medium capitalize">{item.risk_level}</span>
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
          </CardContent>
        </Card>

        {/* Assessment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Trends (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessmentTrends.slice(-6).map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {trend.assessments_completed} assessments
                    </span>
                    <Badge variant="outline">
                      Avg: {trend.average_risk_score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/third-party-risk-management/catalog">
                <Building2 className="h-6 w-6 mb-2" />
                <span>Third Party Catalog</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/third-party-risk-management/assessments">
                <FileText className="h-6 w-6 mb-2" />
                <span>Risk Assessments</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/third-party-risk-management/engagements">
                <Users className="h-6 w-6 mb-2" />
                <span>Engagements</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/third-party-risk-management/incidents">
                <AlertTriangle className="h-6 w-6 mb-2" />
                <span>Incidents</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.overdue_assessments && stats.overdue_assessments > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {stats.overdue_assessments} overdue assessment{stats.overdue_assessments > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600">Requires immediate attention</p>
                </div>
                <Button asChild size="sm" variant="outline" className="ml-auto">
                  <Link to="/third-party-risk-management/assessments">View</Link>
                </Button>
              </div>
            )}

            {stats?.upcoming_renewals && stats.upcoming_renewals > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.upcoming_renewals} contract{stats.upcoming_renewals > 1 ? 's' : ''} expiring soon
                  </p>
                  <p className="text-xs text-yellow-600">Within 30 days</p>
                </div>
                <Button asChild size="sm" variant="outline" className="ml-auto">
                  <Link to="/third-party-risk-management/contracts">View</Link>
                </Button>
              </div>
            )}

            {stats?.active_incidents && stats.active_incidents > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    {stats.active_incidents} active incident{stats.active_incidents > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-orange-600">Under investigation</p>
                </div>
                <Button asChild size="sm" variant="outline" className="ml-auto">
                  <Link to="/third-party-risk-management/incidents">View</Link>
                </Button>
              </div>
            )}

            {(!stats?.overdue_assessments || stats.overdue_assessments === 0) &&
             (!stats?.upcoming_renewals || stats.upcoming_renewals === 0) &&
             (!stats?.active_incidents || stats.active_incidents === 0) && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">All systems operational</p>
                  <p className="text-xs text-green-600">No critical alerts at this time</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats?.average_risk_score || 0}
              </div>
              <p className="text-sm text-gray-600">Average Risk Score</p>
              <div className="mt-2">
                <Badge className={getRiskLevelColor(
                  (stats?.average_risk_score || 0) >= 75 ? 'critical' :
                  (stats?.average_risk_score || 0) >= 50 ? 'high' :
                  (stats?.average_risk_score || 0) >= 25 ? 'medium' : 'low'
                )}>
                  {getRiskLevelIcon(
                    (stats?.average_risk_score || 0) >= 75 ? 'critical' :
                    (stats?.average_risk_score || 0) >= 50 ? 'high' :
                    (stats?.average_risk_score || 0) >= 25 ? 'medium' : 'low'
                  )}
                  {(stats?.average_risk_score || 0) >= 75 ? 'Critical' :
                   (stats?.average_risk_score || 0) >= 50 ? 'High' :
                   (stats?.average_risk_score || 0) >= 25 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats?.total_third_parties && stats?.active_third_parties 
                  ? Math.round((stats.active_third_parties / stats.total_third_parties) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Active Vendors</p>
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
              <p className="text-sm text-gray-600">High/Critical Risk</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats?.high_risk_third_parties || 0) + (stats?.critical_risk_third_parties || 0))} vendors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThirdPartyRiskManagementDashboard;
