import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ComplianceFrameworkService } from "../../services/complianceFrameworkService";
import type { ComplianceSnapshot } from "../../services/complianceFrameworkService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface ComplianceAnalyticsProps {
  frameworkId: string;
}

const ComplianceAnalytics: React.FC<ComplianceAnalyticsProps> = ({
  frameworkId,
}) => {
  const [snapshots, setSnapshots] = useState<ComplianceSnapshot[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [frameworkId, timeRange, refreshKey]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [metricsResult, trendsResult] = await Promise.all([
        ComplianceFrameworkService.getComplianceMetrics(frameworkId),
        ComplianceFrameworkService.getComplianceTrends(frameworkId, undefined, parseInt(timeRange)),
      ]);

      if (metricsResult.data) {
        setMetrics(metricsResult.data);
      }
      if (trendsResult.data) {
        setSnapshots(trendsResult.data as ComplianceSnapshot[]);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partially_compliant': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'not_applicable': return 'bg-blue-100 text-blue-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Prepare chart data
  const trendData = snapshots.map(snapshot => ({
    date: new Date(snapshot.snapshot_date).toLocaleDateString(),
    score: snapshot.overall_score || 0,
    compliant: snapshot.compliant_count,
    partiallyCompliant: snapshot.partially_compliant_count,
    nonCompliant: snapshot.non_compliant_count,
  }));

  const statusDistributionData = metrics ? [
    { name: 'Compliant', value: metrics.compliant_count || 0, color: '#10B981' },
    { name: 'Partially Compliant', value: metrics.partially_compliant_count || 0, color: '#F59E0B' },
    { name: 'Non-Compliant', value: metrics.non_compliant_count || 0, color: '#EF4444' },
    { name: 'Not Applicable', value: metrics.not_applicable_count || 0, color: '#3B82F6' },
    { name: 'Unknown', value: metrics.unknown_count || 0, color: '#6B7280' },
  ] : [];

  const timeRanges = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Analytics</h2>
          <p className="text-gray-600 mt-1">
            Monitor compliance performance and trends over time
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics?.overall_score || 0)}`}>
                  {metrics?.overall_score ? Math.round(metrics.overall_score) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge className={getScoreBadgeColor(metrics?.overall_score || 0)}>
                {metrics?.overall_score >= 90 ? "Excellent" : 
                 metrics?.overall_score >= 70 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.compliant_count || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {metrics?.total_requirements ? 
                  Math.round(((metrics.compliant_count || 0) / metrics.total_requirements) * 100) : 0}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partially Compliant</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics?.partially_compliant_count || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {metrics?.total_requirements ? 
                  Math.round(((metrics.partially_compliant_count || 0) / metrics.total_requirements) * 100) : 0}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics?.non_compliant_count || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {metrics?.total_requirements ? 
                  Math.round(((metrics.non_compliant_count || 0) / metrics.total_requirements) * 100) : 0}% of total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Trend</CardTitle>
            <CardDescription>
              Overall compliance score over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>No trend data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Current compliance status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistributionData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2" />
                  <p>No status data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Breakdown</CardTitle>
          <CardDescription>
            Detailed view of compliance status distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold">{item.value}</span>
                  <span className="text-sm text-gray-500">
                    {metrics?.total_requirements ? 
                      Math.round((item.value / metrics.total_requirements) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Snapshots */}
      {snapshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Snapshots</CardTitle>
            <CardDescription>
              Historical compliance snapshots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {snapshots.slice(0, 5).map((snapshot) => (
                <div key={snapshot.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(snapshot.snapshot_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold ${getScoreColor(snapshot.overall_score || 0)}`}>
                      {snapshot.overall_score ? Math.round(snapshot.overall_score) : 0}%
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="text-green-600">{snapshot.compliant_count}✓</span>
                      <span className="text-yellow-600">{snapshot.partially_compliant_count}⚠</span>
                      <span className="text-red-600">{snapshot.non_compliant_count}✗</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceAnalytics;
