import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter, Treemap
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import advancedAnalyticsService from '../../services/advancedAnalyticsService';

interface AnalyticsData {
  auditMetrics: any[];
  riskMetrics: any[];
  complianceMetrics: any[];
  performanceMetrics: any[];
  teamWorkload: any[];
  aiUsage: any[];
  predictiveData: any[];
  trendAnalysis: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    auditMetrics: [],
    riskMetrics: [],
    complianceMetrics: [],
    performanceMetrics: [],
    teamWorkload: [],
    aiUsage: [],
    predictiveData: [],
    trendAnalysis: null
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load audit metrics
      const { data: auditData } = await supabase
        .from('v_monthly_audit_metrics')
        .select('*')
        .limit(12);

      // Load risk metrics
      const { data: riskData } = await supabase
        .from('v_risk_trends')
        .select('*')
        .limit(12);

      // Load compliance metrics
      const { data: complianceData } = await supabase
        .from('v_requirement_posture')
        .select('*');

      // Load performance metrics
      const { data: performanceData } = await supabase
        .from('v_audit_performance_metrics')
        .select('*');

      // Load team workload
      const { data: workloadData } = await supabase
        .from('v_team_workload')
        .select('*');

      // Load AI usage analytics
      const { data: aiData } = await supabase
        .from('v_ai_usage_analytics')
        .select('*')
        .limit(12);

      // Load predictive analytics data
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const endDate = new Date();

      const riskAggregatedData = await advancedAnalyticsService.aggregateRiskData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        'month'
      );

      const trendAnalysis = riskAggregatedData ? await advancedAnalyticsService.analyzeTrends(riskAggregatedData) : null;

      const predictiveModel = riskAggregatedData ? await advancedAnalyticsService.generatePredictions(riskAggregatedData, 6) : null;

      setData({
        auditMetrics: auditData || [],
        riskMetrics: riskData || [],
        complianceMetrics: complianceData || [],
        performanceMetrics: performanceData || [],
        teamWorkload: workloadData || [],
        aiUsage: aiData || [],
        predictiveData: predictiveModel?.predictions || [],
        trendAnalysis
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audits">Audit Analytics</TabsTrigger>
          <TabsTrigger value="risks">Risk Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="ai">AI Analytics</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
                <Badge variant="secondary">Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.auditMetrics.length > 0 ? data.auditMetrics[data.auditMetrics.length - 1]?.total_audits || 0 : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risks</CardTitle>
                <Badge variant="destructive">Critical</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.riskMetrics.length > 0 ? data.riskMetrics.filter((r: any) => r.risk_level === 'High').length : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  -5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <Badge variant="outline">Good</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.complianceMetrics.length > 0 ? 
                    Math.round(data.complianceMetrics[0]?.compliance_score || 0) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
                <Badge variant="secondary">Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.aiUsage.length > 0 ? data.aiUsage[data.aiUsage.length - 1]?.total_requests || 0 : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.auditMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="completed_audits" stroke="#8884d8" />
                    <Line type="monotone" dataKey="total_audits" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.riskMetrics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.riskMetrics.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.auditMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="completed_audits" fill="#8884d8" />
                    <Bar dataKey="in_progress_audits" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Type Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={data.auditMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="audit_type" />
                    <PolarRadiusAxis />
                    <Radar name="Audits" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.riskMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="high_risks" stackId="1" stroke="#ff4444" fill="#ff4444" />
                    <Area type="monotone" dataKey="medium_risks" stackId="1" stroke="#ffaa00" fill="#ffaa00" />
                    <Area type="monotone" dataKey="low_risks" stackId="1" stroke="#00aa00" fill="#00aa00" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Control Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={data.riskMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="risk_count" fill="#8884d8" />
                    <Line type="monotone" dataKey="control_coverage" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Posture by Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.complianceMetrics} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="framework_name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="compliance_score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirement Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.complianceMetrics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="requirement_count"
                    >
                      {data.complianceMetrics.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={data.teamWorkload}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="audits_completed" name="Audits Completed" />
                    <YAxis dataKey="avg_completion_time" name="Avg Completion Time (days)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Scatter name="Team Performance" dataKey="efficiency_score" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Tracking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="audit_type" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="planned_hours" fill="#8884d8" />
                    <Bar dataKey="actual_hours" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.aiUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="total_requests" stroke="#8884d8" />
                    <Line type="monotone" dataKey="successful_requests" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="failed_requests" stroke="#ff4444" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <Treemap
                    data={data.aiUsage}
                    dataKey="total_requests"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                  >
                    <Tooltip content={<CustomTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Trend Direction:</span>
                    <Badge variant={
                      data.trendAnalysis?.trend === 'increasing' ? 'destructive' :
                      data.trendAnalysis?.trend === 'decreasing' ? 'default' : 'secondary'
                    }>
                      {data.trendAnalysis?.trend || 'stable'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Slope:</span>
                    <span className="text-sm">{data.trendAnalysis?.slope?.toFixed(3) || '0.000'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Confidence:</span>
                    <span className="text-sm">{data.trendAnalysis?.confidence ? (data.trendAnalysis.confidence * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Predictions (Next 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.predictiveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#ff7300" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.auditMetrics.length > 0 ? data.auditMetrics[data.auditMetrics.length - 1]?.total_audits || 0 : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Audits</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {data.complianceMetrics.length > 0 ?
                      Math.round(data.complianceMetrics[0]?.compliance_score || 0) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Compliance Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {data.predictiveData.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Prediction Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
