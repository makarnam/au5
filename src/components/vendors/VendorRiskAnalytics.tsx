import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Target,
  Calendar,
  RefreshCw,
  Eye,
  Download,
  Filter,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import type {
  ThirdPartyDashboardStats,
  ThirdPartyRiskDistribution,
  ThirdPartyAssessmentTrend,
  ThirdPartyIncidentTrend
} from '../../types/thirdPartyRiskManagement';

interface VendorRiskAnalyticsProps {
  vendorId?: string;
}

interface RiskAnalyticsData {
  stats: ThirdPartyDashboardStats | null;
  riskDistribution: ThirdPartyRiskDistribution[];
  assessmentTrends: ThirdPartyAssessmentTrend[];
  incidentTrends: ThirdPartyIncidentTrend[];
}

const VendorRiskAnalytics: React.FC<VendorRiskAnalyticsProps> = ({ vendorId }) => {
  const [analyticsData, setAnalyticsData] = useState<RiskAnalyticsData>({
    stats: null,
    riskDistribution: [],
    assessmentTrends: [],
    incidentTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('12months');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [vendorId, selectedTimeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load all analytics data in parallel
      const [statsResult, distributionResult, assessmentTrendsResult, incidentTrendsResult] = await Promise.all([
        thirdPartyRiskManagementService.getDashboardStats(),
        thirdPartyRiskManagementService.getRiskDistribution(),
        thirdPartyRiskManagementService.getAssessmentTrends(parseInt(selectedTimeframe.replace('months', ''))),
        thirdPartyRiskManagementService.getIncidentTrends(parseInt(selectedTimeframe.replace('months', '')))
      ]);

      if (statsResult.error) throw statsResult.error;
      if (distributionResult.error) throw distributionResult.error;
      if (assessmentTrendsResult.error) throw assessmentTrendsResult.error;
      if (incidentTrendsResult.error) throw incidentTrendsResult.error;

      setAnalyticsData({
        stats: statsResult.data,
        riskDistribution: distributionResult.data,
        assessmentTrends: assessmentTrendsResult.data,
        incidentTrends: incidentTrendsResult.data
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalyticsData = async () => {
    try {
      setIsRefreshing(true);
      await loadAnalyticsData();
      toast.success('Analytics data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh analytics data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className='h-4 w-4 text-red-500' />;
    if (current < previous) return <TrendingDown className='h-4 w-4 text-green-500' />;
    return <Activity className='h-4 w-4 text-gray-500' />;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, riskDistribution, assessmentTrends, incidentTrends } = analyticsData;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Vendor Risk Analytics
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>
            {vendorId ? `Risk analytics for vendor ${vendorId}` : 'Comprehensive risk analytics across all vendors'}
          </p>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='3months'>3 Months</SelectItem>
              <SelectItem value='6months'>6 Months</SelectItem>
              <SelectItem value='12months'>12 Months</SelectItem>
              <SelectItem value='24months'>24 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            onClick={refreshAnalyticsData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4 mr-2' />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Risk Metrics */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Total Vendors</p>
                  <p className='text-3xl font-bold text-gray-900'>{stats.total_third_parties}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {stats.active_third_parties} active
                  </p>
                </div>
                <Users className='h-8 w-8 text-blue-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Average Risk Score</p>
                  <p className={`text-3xl font-bold ${getRiskScoreColor(stats.average_risk_score)}`}>
                    {stats.average_risk_score}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    out of 100
                  </p>
                </div>
                <Shield className='h-8 w-8 text-purple-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>High Risk Vendors</p>
                  <p className='text-3xl font-bold text-orange-600'>
                    {stats.high_risk_third_parties + stats.critical_risk_third_parties}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    requiring attention
                  </p>
                </div>
                <AlertTriangle className='h-8 w-8 text-orange-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Active Incidents</p>
                  <p className='text-3xl font-bold text-red-600'>{stats.active_incidents}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    under investigation
                  </p>
                </div>
                <Activity className='h-8 w-8 text-red-600' />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='risk-distribution'>Risk Distribution</TabsTrigger>
          <TabsTrigger value='trends'>Trends</TabsTrigger>
          <TabsTrigger value='incidents'>Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Risk Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {riskDistribution.map((item) => (
                    <div key={item.risk_level} className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Badge className={getRiskColor(item.risk_level)}>
                          {item.risk_level.toUpperCase()}
                        </Badge>
                        <span className='text-sm text-gray-600'>{item.count} vendors</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-24 bg-gray-200 rounded-full h-2'>
                          <div
                            className={`h-2 rounded-full ${
                              item.risk_level === 'low' ? 'bg-green-600' :
                              item.risk_level === 'medium' ? 'bg-yellow-600' :
                              item.risk_level === 'high' ? 'bg-orange-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className='text-sm font-medium'>{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Assessment Status */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  Assessment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                    <div>
                      <h4 className='font-medium text-green-900'>Completed Assessments</h4>
                      <p className='text-sm text-green-700'>On schedule</p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-green-600'>
                        {assessmentTrends.reduce((sum, trend) => sum + trend.assessments_completed, 0)}
                      </div>
                      <p className='text-xs text-green-600'>total</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-red-50 rounded-lg'>
                    <div>
                      <h4 className='font-medium text-red-900'>Overdue Assessments</h4>
                      <p className='text-sm text-red-700'>Require immediate attention</p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-red-600'>
                        {stats?.overdue_assessments || 0}
                      </div>
                      <p className='text-xs text-red-600'>pending</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                    <div>
                      <h4 className='font-medium text-blue-900'>Upcoming Renewals</h4>
                      <p className='text-sm text-blue-700'>Within 30 days</p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {stats?.upcoming_renewals || 0}
                      </div>
                      <p className='text-xs text-blue-600'>contracts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='risk-distribution' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {riskDistribution.map((item) => (
                  <div key={item.risk_level} className='p-6 border border-gray-200 rounded-lg'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900 capitalize'>
                        {item.risk_level} Risk
                      </h3>
                      <Badge className={getRiskColor(item.risk_level)}>
                        {item.count} vendors
                      </Badge>
                    </div>

                    <div className='space-y-3'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Percentage of total:</span>
                        <span className='font-medium'>{item.percentage}%</span>
                      </div>

                      <Progress value={item.percentage} className='h-3' />

                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Risk threshold:</span>
                        <span className='font-medium'>
                          {item.risk_level === 'low' ? '< 40' :
                           item.risk_level === 'medium' ? '40-60' :
                           item.risk_level === 'high' ? '60-80' : '> 80'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='trends' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Assessment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <LineChart className='h-5 w-5' />
                  Assessment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {assessmentTrends.map((trend, index) => {
                    const prevTrend = assessmentTrends[index - 1];
                    const assessmentChange = prevTrend ?
                      trend.assessments_completed - prevTrend.assessments_completed : 0;
                    const riskChange = prevTrend ?
                      trend.average_risk_score - prevTrend.average_risk_score : 0;

                    return (
                      <div key={trend.month} className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                        <div className='font-medium text-gray-900'>
                          {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className='flex gap-6 text-sm'>
                          <div className='text-center'>
                            <div className='flex items-center gap-1'>
                              <span className='font-semibold text-blue-600'>{trend.assessments_completed}</span>
                              {getTrendIcon(trend.assessments_completed, prevTrend?.assessments_completed || 0)}
                            </div>
                            <div className='text-gray-500'>Assessments</div>
                          </div>
                          <div className='text-center'>
                            <div className='flex items-center gap-1'>
                              <span className={`font-semibold ${getRiskScoreColor(trend.average_risk_score)}`}>
                                {trend.average_risk_score}
                              </span>
                              {getTrendIcon(trend.average_risk_score, prevTrend?.average_risk_score || 0)}
                            </div>
                            <div className='text-gray-500'>Avg Risk</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Risk Score Trends */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Risk Score Evolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='text-center p-6 bg-gray-50 rounded-lg'>
                    <div className={`text-4xl font-bold ${getRiskScoreColor(stats?.average_risk_score || 0)}`}>
                      {stats?.average_risk_score || 0}
                    </div>
                    <p className='text-sm text-gray-600 mt-1'>Current Average Risk Score</p>
                    <div className='mt-4'>
                      <Progress
                        value={stats?.average_risk_score || 0}
                        className='h-3'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-4 bg-green-50 rounded-lg'>
                      <div className='text-2xl font-bold text-green-600'>
                        {riskDistribution.find(d => d.risk_level === 'low')?.count || 0}
                      </div>
                      <p className='text-sm text-gray-600'>Low Risk</p>
                    </div>
                    <div className='text-center p-4 bg-red-50 rounded-lg'>
                      <div className='text-2xl font-bold text-red-600'>
                        {riskDistribution.find(d => d.risk_level === 'critical')?.count || 0}
                      </div>
                      <p className='text-sm text-gray-600'>Critical Risk</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='incidents' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5' />
                Incident Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {incidentTrends.map((trend, index) => {
                  const prevTrend = incidentTrends[index - 1];
                  const incidentChange = prevTrend ?
                    trend.incidents_count - prevTrend.incidents_count : 0;
                  const criticalChange = prevTrend ?
                    trend.critical_incidents - prevTrend.critical_incidents : 0;

                  return (
                    <div key={trend.month} className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                      <div className='font-medium text-gray-900'>
                        {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className='flex gap-6 text-sm'>
                        <div className='text-center'>
                          <div className='flex items-center gap-1'>
                            <span className='font-semibold text-blue-600'>{trend.incidents_count}</span>
                            {getTrendIcon(trend.incidents_count, prevTrend?.incidents_count || 0)}
                          </div>
                          <div className='text-gray-500'>Total Incidents</div>
                        </div>
                        <div className='text-center'>
                          <div className='flex items-center gap-1'>
                            <span className='font-semibold text-red-600'>{trend.critical_incidents}</span>
                            {getTrendIcon(trend.critical_incidents, prevTrend?.critical_incidents || 0)}
                          </div>
                          <div className='text-gray-500'>Critical</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorRiskAnalytics;