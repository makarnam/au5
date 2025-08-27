import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart,
  Scatter, ComposedChart, Legend, FunnelChart, Funnel, Cell as FunnelCell
} from 'recharts';
import {
  BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Target,
  AlertTriangle, CheckCircle, Clock, Users, Calendar, Download,
  Filter, RefreshCw, Eye, Settings, Zap, Globe, Lock, Database,
  Building2, Gauge, Target as TargetIcon, AlertOctagon, ShieldCheck,
  UserCheck, FileCheck, CalendarCheck, Clock3, Star, Award,
  ChevronRight, ExternalLink, Maximize2, Minimize2, Grid3X3
} from 'lucide-react';
import { riskControlMatrixService } from '../../services/riskControlMatrixService';
import { RiskControlMatrix, MatrixAnalytics as MatrixAnalyticsType } from '../../types/riskControlMatrix';
import LoadingSpinner from '../LoadingSpinner';
import { getChartColors } from '../../utils';

interface MatrixAnalyticsProps {
  matrixId?: string;
  onMatrixSelect?: (matrixId: string) => void;
}

const MatrixAnalytics: React.FC<MatrixAnalyticsProps> = ({ matrixId, onMatrixSelect }) => {
  const [analytics, setAnalytics] = useState<MatrixAnalyticsType | null>(null);
  const [matrices, setMatrices] = useState<RiskControlMatrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<string>(matrixId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');

  const COLORS = getChartColors(10);

  useEffect(() => {
    loadMatrices();
  }, []);

  useEffect(() => {
    if (selectedMatrix) {
      loadAnalytics();
    }
  }, [selectedMatrix, timeRange]);

  const loadMatrices = async () => {
    try {
      const matricesData = await riskControlMatrixService.getMatrices({});
      setMatrices(matricesData);
      if (matricesData.length > 0 && !selectedMatrix) {
        setSelectedMatrix(matricesData[0].id);
      }
    } catch (err) {
      setError('Failed to load matrices');
    }
  };

  const loadAnalytics = async () => {
    if (!selectedMatrix) return;
    
    try {
      setLoading(true);
      const analyticsData = await riskControlMatrixService.getMatrixAnalytics(selectedMatrix, timeRange);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleMatrixChange = (matrixId: string) => {
    setSelectedMatrix(matrixId);
    onMatrixSelect?.(matrixId);
  };

  const handleExportAnalytics = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedMatrix) return;
    
    try {
      const blob = await riskControlMatrixService.exportMatrix(selectedMatrix, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `matrix-analytics-${selectedMatrix}-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getControlEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness.toLowerCase()) {
      case 'excellent': return '#22c55e';
      case 'good': return '#84cc16';
      case 'adequate': return '#eab308';
      case 'weak': return '#f97316';
      case 'inadequate': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading && !analytics) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matrix Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your risk control matrices</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Matrix Selector */}
          <select
            value={selectedMatrix}
            onChange={(e) => handleMatrixChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {matrices.map((matrix) => (
              <option key={matrix.id} value={matrix.id}>
                {matrix.name}
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Export Button */}
          <div className="relative group">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExportAnalytics('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExportAnalytics('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExportAnalytics('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
            { id: 'trends', label: 'Trends', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                viewMode === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {!analytics ? (
        <div className="text-center py-12">
          <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Select a matrix to view analytics</p>
        </div>
      ) : (
        <>
          {/* Overview Mode */}
          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Risks</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalRisks}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600">+12% from last month</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Controls</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalControls}</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600">+8% from last month</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Coverage Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.coverageRate}%</p>
                    </div>
                    <Target className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600">+5% from last month</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Risk Items</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.highRiskItems}</p>
                    </div>
                    <AlertOctagon className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-red-600">-3% from last month</span>
                  </div>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRiskLevelColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Control Effectiveness */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Control Effectiveness</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.controlEffectiveness}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {analytics.controlEffectiveness.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getControlEffectivenessColor(entry.name)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Trend */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.riskTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="medium" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Coverage by Category */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.coverageByCategory} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="coverage" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Analysis Mode */}
          {viewMode === 'detailed' && (
            <div className="space-y-6">
              {/* Risk Control Matrix Heatmap */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Control Matrix Heatmap</h3>
                <div className="grid grid-cols-5 gap-2 max-w-2xl">
                  {analytics.matrixHeatmap.map((cell, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: cell.color }}
                      title={`${cell.riskLevel} Risk, ${cell.controlEffectiveness} Control: ${cell.count} items`}
                    >
                      {cell.count}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>Risk Level: Low → High</span>
                  <span>Control Effectiveness: Inadequate → Excellent</span>
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Control Gaps</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <FunnelChart>
                      <Tooltip />
                      <Funnel
                        dataKey="value"
                        data={analytics.controlGaps}
                        isAnimationActive
                      >
                        {analytics.controlGaps.map((entry, index) => (
                          <FunnelCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Exposure</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics.riskExposure}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Current" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Target" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Trends Mode */}
          {viewMode === 'trends' && (
            <div className="space-y-6">
              {/* Time Series Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.riskScoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="averageScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Control Effectiveness Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.controlEffectivenessTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="effectiveness" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scatter Plot */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk vs Control Correlation</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis type="number" dataKey="riskScore" name="Risk Score" />
                    <YAxis type="number" dataKey="controlScore" name="Control Score" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Risk-Control Pairs" data={analytics.riskControlCorrelation} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MatrixAnalytics;
