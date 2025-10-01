import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter
} from 'lucide-react';

interface IncidentAnalyticsProps {
  className?: string;
}

interface IncidentStats {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  avgResolutionTime: number;
  incidentsByType: Array<{ name: string; value: number; color: string }>;
  incidentsBySeverity: Array<{ name: string; value: number; color: string }>;
  incidentsOverTime: Array<{ date: string; count: number; resolved: number }>;
  resolutionTimeByType: Array<{ type: string; avgTime: number }>;
  topAffectedSystems: Array<{ system: string; count: number }>;
  incidentsByBusinessUnit: Array<{ unit: string; count: number }>;
}

const COLORS = {
  security: '#ef4444',
  operational: '#f97316',
  technical: '#eab308',
  compliance: '#22c55e',
  third_party: '#3b82f6',
  resilience: '#8b5cf6',
  other: '#6b7280',
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444'
};

const SEVERITY_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

export default function IncidentAnalytics({ className = "" }: IncidentAnalyticsProps) {
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get incidents within time range
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (incidentsError) throw incidentsError;

      // Calculate statistics
      const totalIncidents = incidents?.length || 0;
      const openIncidents = incidents?.filter(i => i.status === 'open' || i.status === 'investigating').length || 0;
      const resolvedIncidents = incidents?.filter(i => i.status === 'resolved' || i.status === 'closed').length || 0;
      const criticalIncidents = incidents?.filter(i => i.severity === 'critical').length || 0;

      // Calculate average resolution time
      const resolvedIncidentsData = incidents?.filter(i => i.status === 'resolved' || i.status === 'closed') || [];
      const avgResolutionTime = resolvedIncidentsData.length > 0
        ? resolvedIncidentsData.reduce((sum, incident) => {
            const created = new Date(incident.created_at);
            const resolved = new Date(incident.updated_at);
            return sum + (resolved.getTime() - created.getTime());
          }, 0) / resolvedIncidentsData.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      // Incidents by type
      const typeCounts = incidents?.reduce((acc, incident) => {
        acc[incident.incident_type] = (acc[incident.incident_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const incidentsByType = Object.entries(typeCounts).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        value: count as number,
        color: COLORS[type as keyof typeof COLORS] || COLORS.other
      }));

      // Incidents by severity
      const severityCounts = incidents?.reduce((acc, incident) => {
        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const incidentsBySeverity = Object.entries(severityCounts).map(([severity, count]) => ({
        name: severity.charAt(0).toUpperCase() + severity.slice(1),
        value: count as number,
        color: COLORS[severity as keyof typeof COLORS] || COLORS.low
      }));

      // Incidents over time (daily)
      const dailyCounts: Record<string, { total: number; resolved: number }> = {};
      incidents?.forEach(incident => {
        const date = new Date(incident.created_at).toISOString().split('T')[0];
        if (!dailyCounts[date]) {
          dailyCounts[date] = { total: 0, resolved: 0 };
        }
        dailyCounts[date].total++;
        if (incident.status === 'resolved' || incident.status === 'closed') {
          dailyCounts[date].resolved++;
        }
      });

      const incidentsOverTime = Object.entries(dailyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({
          date: new Date(date).toLocaleDateString(),
          count: counts.total,
          resolved: counts.resolved
        }));

      // Resolution time by type
      const resolutionByType: Record<string, { totalTime: number; count: number }> = {};
      resolvedIncidentsData.forEach(incident => {
        if (!resolutionByType[incident.incident_type]) {
          resolutionByType[incident.incident_type] = { totalTime: 0, count: 0 };
        }
        const created = new Date(incident.created_at);
        const resolved = new Date(incident.updated_at);
        resolutionByType[incident.incident_type].totalTime += resolved.getTime() - created.getTime();
        resolutionByType[incident.incident_type].count++;
      });

      const resolutionTimeByType = Object.entries(resolutionByType).map(([type, data]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        avgTime: data.count > 0 ? Math.round((data.totalTime / data.count) / (1000 * 60 * 60 * 24) * 10) / 10 : 0
      }));

      // Top affected systems
      const systemCounts: Record<string, number> = {};
      incidents?.forEach(incident => {
        incident.affected_systems?.forEach((system: string) => {
          systemCounts[system] = (systemCounts[system] || 0) + 1;
        });
      });

      const topAffectedSystems = Object.entries(systemCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([system, count]) => ({ system, count: count as number }));

      // Incidents by business unit
      const unitCounts = incidents?.reduce((acc, incident) => {
        const unit = incident.business_unit || 'Unknown';
        acc[unit] = (acc[unit] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const incidentsByBusinessUnit = Object.entries(unitCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([unit, count]) => ({ unit, count: count as number }));

      setStats({
        totalIncidents,
        openIncidents,
        resolvedIncidents,
        criticalIncidents,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        incidentsByType,
        incidentsBySeverity,
        incidentsOverTime,
        resolutionTimeByType,
        topAffectedSystems,
        incidentsByBusinessUnit
      });

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load incident analytics');
    } finally {
      setLoading(false);
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Incident Analytics <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">New</span></h2>
          <p className="text-gray-600">Comprehensive incident analysis and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
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
          <Button variant="outline" onClick={loadAnalytics}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-3xl font-bold text-blue-600">{stats.openIncidents}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedIncidents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Incidents</p>
                <p className="text-3xl font-bold text-red-600">{stats.criticalIncidents}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Incidents by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.incidentsByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.incidentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incidents by Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Incidents by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.incidentsBySeverity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {stats.incidentsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Incident Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.incidentsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Time by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Average Resolution Time by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.resolutionTimeByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} days`, 'Avg Resolution Time']} />
                <Bar dataKey="avgTime" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Affected Systems */}
        <Card>
          <CardHeader>
            <CardTitle>Top Affected Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topAffectedSystems.slice(0, 5).map((system, index) => (
                <div key={system.system} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{system.system}</span>
                  </div>
                  <Badge variant="secondary">{system.count} incidents</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incidents by Business Unit */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Business Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.incidentsByBusinessUnit.slice(0, 5).map((unit, index) => (
                <div key={unit.unit} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{unit.unit}</span>
                  </div>
                  <Badge variant="secondary">{unit.count} incidents</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}</div>
              <div className="text-sm text-gray-600">Avg Resolution Time (days)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalIncidents > 0 ? Math.round((stats.resolvedIncidents / stats.totalIncidents) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.incidentsByType.length}
              </div>
              <div className="text-sm text-gray-600">Incident Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.incidentsByBusinessUnit.length}
              </div>
              <div className="text-sm text-gray-600">Business Units Affected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}