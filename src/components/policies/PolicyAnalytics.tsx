import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart3, TrendingUp, FileText, Users, Activity, PieChart, LineChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { policyService } from '../../services/policyService';

interface PolicyAnalyticsData {
  totalPolicies: number;
  activePolicies: number;
  inactivePolicies: number;
  totalVersions: number;
  versionStatuses: Record<string, number>;
  policiesByOwner: Record<string, number>;
  policiesByCategory: { category: string; count: number }[];
  recentPolicies: number;
  recentVersions: number;
  trends?: { month: string; policies: number; versions: number }[];
}

const PolicyAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<PolicyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedCategory]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Get analytics data from policy service
      const analyticsResult = await policyService.getPolicyAnalytics();
      if (analyticsResult.error) {
        throw analyticsResult.error;
      }

      // Get trends data
      const trendsResult = await policyService.getPolicyTrends(12);
      if (trendsResult.error) {
        console.warn('Failed to load trends data:', trendsResult.error);
      }

      const analyticsData: PolicyAnalyticsData = {
        ...analyticsResult.data,
        policiesByCategory: [], // TODO: Implement categories from tags or other field
        trends: trendsResult.data || [],
      };

      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Unable to load policy analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Policy Analytics Dashboard
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">New</span>
          </h2>
          <p className="text-gray-600">Comprehensive analytics and insights for policy management</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {analyticsData.policiesByCategory.map((cat: { category: string; count: number }) => (
                <SelectItem key={cat.category} value={cat.category.toLowerCase()}>
                  {cat.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.totalPolicies}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analyticsData.activePolicies} active, {analyticsData.inactivePolicies} inactive
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Versions</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.totalVersions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Across all policies
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.recentPolicies}</p>
                <p className="text-xs text-gray-500 mt-1">
                  New policies (30 days)
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Version Activity</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.recentVersions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  New versions (30 days)
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Owners</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Version Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Version Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.versionStatuses).map(([status, count]) => {
                    const percentage = analyticsData.totalVersions > 0 ? Math.round((count / analyticsData.totalVersions) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                          <span className="text-sm text-gray-600">{count} versions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Policy Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {analyticsData.recentPolicies}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">New Policies Created</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.activePolicies}
                      </div>
                      <p className="text-sm text-gray-600">Active Policies</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.recentVersions}
                      </div>
                      <p className="text-sm text-gray-600">New Versions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Policies by Owner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.policiesByOwner).map(([owner, count]) => {
                  const percentage = analyticsData.totalPolicies > 0 ? Math.round((count / analyticsData.totalPolicies) * 100) : 0;
                  return (
                    <div key={owner} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{owner}</h4>
                          <span className="text-sm text-gray-500">{count} policies</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-600">{percentage}% of total</span>
                          <span className="text-xs text-gray-600">Click for details</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Creation Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Policy Creation Trends (12 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trends?.map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-900">{trend.month}</div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{trend.policies}</div>
                          <div className="text-gray-500">Policies</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{trend.versions}</div>
                          <div className="text-gray-500">Versions</div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No trend data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.totalPolicies}
                      </div>
                      <p className="text-sm text-gray-600">Total Policies</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.totalVersions}
                      </div>
                      <p className="text-sm text-gray-600">Total Versions</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {analyticsData.recentPolicies} policies, {analyticsData.recentVersions} versions
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Created in the last 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyAnalytics;