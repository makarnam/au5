import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart,
  Scatter, ComposedChart, Legend, FunnelChart, Funnel, Cell as FunnelCell
} from 'recharts';
import {
  FileText, Shield, AlertTriangle, Search, TrendingUp, TrendingDown,
  Activity, Clock, CheckCircle, XCircle, AlertCircle, Users, Calendar,
  Target, BarChart3, PieChart as PieChartIcon, Filter, Download,
  Eye, Settings, Zap, Globe, Lock, Database, Server, Network,
  Building2, Gauge, Target as TargetIcon, AlertOctagon, ShieldCheck,
  UserCheck, FileCheck, CalendarCheck, Clock3, Star, Award,
  ChevronRight, ExternalLink, RefreshCw, Maximize2, Minimize2,
  Link as LinkIcon, GitBranch, GitCommit, GitPullRequest
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { formatNumber, formatPercentage, getChartColors } from '../utils';
import { 
  dashboardService, 
  DashboardMetrics, 
  AuditStatusData, 
  ComplianceStatus, 
  MonthlyTrendData, 
  RecentActivity, 
  UpcomingTask, 
  RiskHeatmapData, 
  ModuleOverview, 
  GRCMetric 
} from '../services/dashboardService';

interface MetricCard {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  trend: number[];
  link?: string;
  category: 'audit' | 'risk' | 'control' | 'compliance' | 'esg' | 'security';
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
  link?: string;
}

interface RelationshipData {
  source: string;
  target: string;
  type: 'audit-risk' | 'risk-control' | 'control-compliance' | 'audit-finding' | 'finding-risk';
  strength: number;
  description: string;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'analytics' | 'relationships'>('overview');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Real data state
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [auditStatusData, setAuditStatusData] = useState<AuditStatusData[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceStatus[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrendData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [riskHeatmapData, setRiskHeatmapData] = useState<RiskHeatmapData[]>([]);
  const [moduleOverview, setModuleOverview] = useState<ModuleOverview[]>([]);
  const [grcMetrics, setGrcMetrics] = useState<GRCMetric[]>([]);
  const [relationships, setRelationships] = useState<RelationshipData[]>([]);

  // Enhanced Metrics Data - will be populated from real data
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedTimeframe]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all dashboard data
      const [
        metricsData,
        auditStatus,
        complianceStatus,
        monthlyTrends,
        recentActivity,
        upcomingTasksData,
        riskHeatmap,
        moduleOverviewData,
        grcMetricsData,
        relationshipsData
      ] = await Promise.all([
        dashboardService.getDashboardMetrics(selectedPeriod),
        dashboardService.getAuditStatusData(),
        dashboardService.getComplianceStatus(),
        dashboardService.getMonthlyTrends(selectedTimeframe),
        dashboardService.getRecentActivity(),
        dashboardService.getUpcomingTasks(),
        dashboardService.getRiskHeatmapData(),
        dashboardService.getModuleOverview(),
        dashboardService.getGRCMetrics(),
        dashboardService.getEntityRelationships()
      ]);

      setDashboardMetrics(metricsData);
      setAuditStatusData(auditStatus);
      setComplianceData(complianceStatus);
      setMonthlyTrendData(monthlyTrends);
      setRecentActivities(recentActivity);
      setUpcomingTasks(upcomingTasksData);
      setRiskHeatmapData(riskHeatmap);
      setModuleOverview(moduleOverviewData);
      setGrcMetrics(grcMetricsData);
      setRelationships(relationshipsData);

      // Transform metrics data
      const transformedMetrics: MetricCard[] = [
        {
          title: t('dashboard.activeAudits'),
          value: metricsData.activeAudits,
          change: metricsData.auditChange,
          changeType: metricsData.auditChange > 0 ? 'increase' : 'decrease',
          icon: FileText,
          color: '#3b82f6',
          trend: metricsData.auditTrend,
          link: '/audits',
          category: 'audit'
        },
        {
          title: t('dashboard.openRisks'),
          value: metricsData.openRisks,
          change: metricsData.riskChange,
          changeType: metricsData.riskChange > 0 ? 'increase' : 'decrease',
          icon: AlertTriangle,
          color: '#ef4444',
          trend: metricsData.riskTrend,
          link: '/risks',
          category: 'risk'
        },
        {
          title: t('dashboard.activeControls'),
          value: metricsData.activeControls,
          change: metricsData.controlChange,
          changeType: metricsData.controlChange > 0 ? 'increase' : 'decrease',
          icon: Shield,
          color: '#10b981',
          trend: metricsData.controlTrend,
          link: '/controls',
          category: 'control'
        },
        {
          title: t('dashboard.complianceScore'),
          value: metricsData.complianceScore,
          change: metricsData.complianceChange,
          changeType: metricsData.complianceChange > 0 ? 'increase' : 'decrease',
          icon: CheckCircle,
          color: '#8b5cf6',
          trend: metricsData.complianceTrend,
          link: '/compliance',
          category: 'compliance'
        }
      ];

      setMetrics(transformedMetrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetricClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  const toggleModuleExpansion = (moduleName: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(name => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const renderRelationshipGraph = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <GitBranch className="w-5 h-5 mr-2" />
          {t('dashboard.entityRelationships')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relationships.map((rel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">{rel.source}</span>
                </div>
                <div className="text-xs text-gray-500">{rel.strength}%</div>
              </div>
              <div className="text-xs text-gray-600 mb-2">{rel.description}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{rel.type}</span>
                <span className="text-xs font-medium">{rel.target}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderMetricsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleMetricClick(metric.link)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${metric.color}20` }}>
              <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
            </div>
            <div className="flex items-center space-x-1">
              {metric.changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          </div>
          
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{formatNumber(metric.value)}</h3>
            <p className="text-sm text-gray-600">{metric.title}</p>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <span>View details</span>
            <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderViewTabs = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {[
       { key: 'overview', label: t('dashboard.overviewView'), icon: BarChart3 },
       { key: 'detailed', label: t('dashboard.detailedView'), icon: PieChartIcon },
       { key: 'analytics', label: t('dashboard.analyticsView'), icon: TrendingUp },
       { key: 'relationships', label: t('dashboard.relationships'), icon: GitBranch }
     ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setSelectedView(tab.key as any)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedView === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{t('dashboard.welcomeBack', { name: user?.first_name || user?.email || 'User' })}</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">{t('dashboard.last7Days')}</option>
            <option value="30d">{t('dashboard.last30Days')}</option>
            <option value="90d">{t('dashboard.last90Days')}</option>
            <option value="1y">{t('dashboard.lastYear')}</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('dashboard.refresh')}</span>
          </button>
        </div>
      </div>

      {renderViewTabs()}

      {selectedView === 'overview' && (
        <>
          {renderMetricsGrid()}
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audit Status Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.auditStatusDistribution')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={auditStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {auditStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChartColors()[index % getChartColors().length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Heatmap */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.riskHeatmap')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="probability" name="Probability" />
                  <YAxis type="number" dataKey="impact" name="Impact" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={riskHeatmapData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {selectedView === 'relationships' && (
        <div className="space-y-6">
          {renderRelationshipGraph()}

          {/* Cross-Module Relationships */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.crossModuleIntegration')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Audit → Risk</h4>
                <p className="text-sm text-gray-600">Audits identify risks that need assessment</p>
                <div className="mt-2 text-xs text-blue-600">View related risks</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Risk → Control</h4>
                <p className="text-sm text-gray-600">Risks are mitigated by controls</p>
                <div className="mt-2 text-xs text-blue-600">View related controls</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Control → Compliance</h4>
                <p className="text-sm text-gray-600">Controls satisfy compliance requirements</p>
                <div className="mt-2 text-xs text-blue-600">View compliance status</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`p-2 rounded-full ${activity.type === 'audit' ? 'bg-blue-100' : activity.type === 'risk' ? 'bg-red-100' : 'bg-green-100'}`}>
                {activity.type === 'audit' && <FileText className="w-4 h-4 text-blue-600" />}
                {activity.type === 'risk' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                {activity.type === 'control' && <Shield className="w-4 h-4 text-green-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
              <Link to={activity.link} className="text-blue-600 hover:text-blue-800 text-sm">
                View
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;