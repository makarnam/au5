import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
  Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle,
  BarChart3, PieChart as PieChartIcon, Activity, Target, Users,
  Calendar, Filter, Download, RefreshCw, Eye, Settings, Zap,
  ArrowUpRight, ArrowDownRight, Minus, AlertCircle, CheckSquare,
  XCircle, Pause, Play, StopCircle, Timer, Gauge, Target as TargetIcon
} from 'lucide-react';
import { workflowAnalyticsService, WorkflowPerformanceMetrics, WorkflowAnalyticsFilters } from '../../services/workflowAnalyticsService';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import LoadingSpinner from '../LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon: Icon, color, description }) => {
  const getChangeIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-gray-500" />;
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {change !== undefined && (
          <div className="flex items-center space-x-1 mt-2">
            {getChangeIcon()}
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WorkflowAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<WorkflowPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkflowAnalyticsFilters>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
    loadRealTimeData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [filters, selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Apply date filters based on selected timeframe
      const dateFilters = { ...filters };
      if (selectedTimeframe !== 'all') {
        const now = new Date();
        const daysAgo = parseInt(selectedTimeframe.replace('d', ''));
        dateFilters.date_from = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      }

      const data = await workflowAnalyticsService.getWorkflowPerformanceMetrics(dateFilters);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const data = await workflowAnalyticsService.getRealTimeWorkflowStatus();
      setRealTimeData(data);
    } catch (err) {
      console.error('Failed to load real-time data:', err);
    }
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading workflow analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading analytics: {error}</span>
            </div>
            <Button onClick={loadAnalytics} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              No workflow data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into workflow performance and efficiency
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entity-type">Entity Type</Label>
              <Select 
                value={filters.entity_type || ''} 
                onValueChange={(value) => setFilters({ ...filters, entity_type: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="finding">Finding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status || ''} 
                onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-from">Date From</Label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Workflows"
          value={metrics.total_workflows}
          icon={BarChart3}
          color="text-blue-600"
          description="Total workflow instances"
        />
        <MetricCard
          title="Completed Workflows"
          value={metrics.completed_workflows}
          icon={CheckCircle}
          color="text-green-600"
          description={`${metrics.total_workflows > 0 ? Math.round((metrics.completed_workflows / metrics.total_workflows) * 100) : 0}% completion rate`}
        />
        <MetricCard
          title="Pending Workflows"
          value={metrics.pending_workflows}
          icon={Clock}
          color="text-yellow-600"
          description="Currently in progress"
        />
        <MetricCard
          title="Efficiency Score"
          value={`${metrics.workflow_efficiency_score}%`}
          icon={Target}
          color={getEfficiencyColor(metrics.workflow_efficiency_score)}
          description="Overall workflow efficiency"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>Completion Time Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Completion Time</span>
                <span className="font-semibold">{formatDuration(metrics.average_completion_time_hours)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Median Completion Time</span>
                <span className="font-semibold">{formatDuration(metrics.median_completion_time_hours)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Efficiency Score</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${getEfficiencyColor(metrics.workflow_efficiency_score)}`}>
                    {metrics.workflow_efficiency_score}%
                  </span>
                  {getEfficiencyBadge(metrics.workflow_efficiency_score)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Real-Time Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeData.slice(0, 5).map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{workflow.workflow_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {workflow.entity_type} • Step {workflow.current_step}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatDuration(workflow.duration_hours)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(workflow.requested_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {realTimeData.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No pending workflows
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
            <CardDescription>Workflow completion trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.completion_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="completed_count" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Entity Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Type Performance</CardTitle>
            <CardDescription>Workflow performance by entity type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.entity_type_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="entity_type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success_rate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottlenecks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Top Bottlenecks</span>
          </CardTitle>
          <CardDescription>Steps causing the most delays in workflow completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.bottleneck_steps.map((bottleneck, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <div>
                    <div className="font-medium">{bottleneck.step_name}</div>
                    <div className="text-sm text-muted-foreground">{bottleneck.workflow_name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatDuration(bottleneck.average_duration_hours)}</div>
                  <div className="text-sm text-muted-foreground">
                    {bottleneck.total_instances} instances
                  </div>
                </div>
              </div>
            ))}
            {metrics.bottleneck_steps.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No significant bottlenecks identified
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Step Performance Analysis</CardTitle>
          <CardDescription>Performance metrics for each workflow step</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Step Name</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-right p-2">Instances</th>
                  <th className="text-right p-2">Avg Duration</th>
                  <th className="text-right p-2">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.step_performance.map((step, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{step.step_name}</td>
                    <td className="p-2 text-muted-foreground">{step.role}</td>
                    <td className="p-2 text-right">{step.total_instances}</td>
                    <td className="p-2 text-right">{formatDuration(step.average_duration_hours)}</td>
                    <td className="p-2 text-right">
                      <Badge variant={step.completion_rate >= 80 ? 'default' : step.completion_rate >= 60 ? 'secondary' : 'destructive'}>
                        {step.completion_rate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowAnalyticsDashboard;
