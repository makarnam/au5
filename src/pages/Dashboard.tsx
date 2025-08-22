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
  ChevronRight, ExternalLink, RefreshCw, Maximize2, Minimize2
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





const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'analytics'>('overview');
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

  // Enhanced Metrics Data - will be populated from real data
  const [metrics, setMetrics] = useState<MetricCard[]>([]);



  // Detailed View Data
  const detailedMetrics = {
    auditBreakdown: [
      { type: 'Internal', count: 45, percentage: 29, color: '#3b82f6' },
      { type: 'External', count: 23, percentage: 15, color: '#10b981' },
      { type: 'Compliance', count: 34, percentage: 22, color: '#f59e0b' },
      { type: 'IT Security', count: 28, percentage: 18, color: '#ef4444' },
      { type: 'Financial', count: 26, percentage: 16, color: '#8b5cf6' }
    ],
    riskMatrix: [
      { probability: 1, impact: 1, count: 15, color: '#10b981' },
      { probability: 2, impact: 1, count: 8, color: '#f59e0b' },
      { probability: 3, impact: 2, count: 12, color: '#f97316' },
      { probability: 4, impact: 3, count: 6, color: '#ef4444' },
      { probability: 5, impact: 4, count: 3, color: '#dc2626' },
      { probability: 5, impact: 5, count: 2, color: '#991b1b' }
    ],
    controlEffectiveness: [
      { category: 'Preventive', effective: 85, total: 120, color: '#10b981' },
      { category: 'Detective', effective: 78, total: 95, color: '#f59e0b' },
      { category: 'Corrective', effective: 92, total: 67, color: '#3b82f6' },
      { category: 'Directive', effective: 88, total: 60, color: '#8b5cf6' }
    ]
  };

  // Analytics View Data
  const analyticsData = {
    trendAnalysis: [
      { month: 'Jan', grcScore: 82, riskScore: 78, controlScore: 85, complianceScore: 88 },
      { month: 'Feb', grcScore: 84, riskScore: 80, controlScore: 86, complianceScore: 89 },
      { month: 'Mar', grcScore: 83, riskScore: 82, controlScore: 87, complianceScore: 87 },
      { month: 'Apr', grcScore: 85, riskScore: 85, controlScore: 88, complianceScore: 90 },
      { month: 'May', grcScore: 86, riskScore: 87, controlScore: 89, complianceScore: 91 },
      { month: 'Jun', grcScore: 87, riskScore: 89, controlScore: 90, complianceScore: 92 },
      { month: 'Jul', grcScore: 88, riskScore: 91, controlScore: 91, complianceScore: 93 },
      { month: 'Aug', grcScore: 87, riskScore: 93, controlScore: 92, complianceScore: 92 },
      { month: 'Sep', grcScore: 89, riskScore: 94, controlScore: 93, complianceScore: 94 },
      { month: 'Oct', grcScore: 88, riskScore: 95, controlScore: 94, complianceScore: 93 },
      { month: 'Nov', grcScore: 90, riskScore: 96, controlScore: 95, complianceScore: 95 },
      { month: 'Dec', grcScore: 87, riskScore: 94, controlScore: 89, complianceScore: 92 }
    ],
    performanceIndicators: [
      { name: 'Risk Reduction', current: 23, target: 25, unit: '%', trend: 'up' },
      { name: 'Control Coverage', current: 94, target: 95, unit: '%', trend: 'up' },
      { name: 'Audit Efficiency', current: 78, target: 80, unit: '%', trend: 'up' },
      { name: 'Compliance Score', current: 92, target: 90, unit: '%', trend: 'up' },
      { name: 'Incident Response', current: 85, target: 90, unit: 'min', trend: 'down' },
      { name: 'Training Completion', current: 96, target: 95, unit: '%', trend: 'up' }
    ],
    predictiveInsights: [
      { insight: 'Risk exposure likely to decrease by 8% in Q1', confidence: 85, impact: 'high' },
      { insight: 'Control effectiveness expected to reach 92% by March', confidence: 78, impact: 'medium' },
      { insight: 'Compliance gaps may increase in Q2 due to new regulations', confidence: 92, impact: 'high' },
      { insight: 'Audit completion rate on track to exceed target', confidence: 88, impact: 'medium' }
    ]
  };




  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching dashboard data...');
        
        // Fetch all dashboard data in parallel
        const [
          metricsData,
          auditStatus,
          compliance,
          monthlyTrends,
          activities,
          tasks,
          riskHeatmap,
          modules,
          grcMetricsData
        ] = await Promise.all([
          dashboardService.getDashboardMetrics().catch(err => {
            console.error('Error fetching metrics:', err);
            return null;
          }),
          dashboardService.getAuditStatusData().catch(err => {
            console.error('Error fetching audit status:', err);
            return [];
          }),
          dashboardService.getComplianceData().catch(err => {
            console.error('Error fetching compliance data:', err);
            return [];
          }),
          dashboardService.getMonthlyTrendData().catch(err => {
            console.error('Error fetching monthly trends:', err);
            return [];
          }),
          dashboardService.getRecentActivities().catch(err => {
            console.error('Error fetching recent activities:', err);
            return [];
          }),
          dashboardService.getUpcomingTasks().catch(err => {
            console.error('Error fetching upcoming tasks:', err);
            return [];
          }),
          dashboardService.getRiskHeatmapData().catch(err => {
            console.error('Error fetching risk heatmap:', err);
            return [];
          }),
          dashboardService.getModuleOverview().catch(err => {
            console.error('Error fetching module overview:', err);
            return [];
          }),
          dashboardService.getGRCMetrics().catch(err => {
            console.error('Error fetching GRC metrics:', err);
            return [];
          })
        ]);

        console.log('Dashboard data fetched:', {
          metrics: metricsData,
          auditStatus: auditStatus?.length,
          compliance: compliance?.length,
          monthlyTrends: monthlyTrends?.length,
          activities: activities?.length,
          tasks: tasks?.length,
          riskHeatmap: riskHeatmap?.length,
          modules: modules?.length,
          grcMetrics: grcMetricsData?.length
        });

        // Update state with real data
        setDashboardMetrics(metricsData);
        setAuditStatusData(auditStatus || []);
        setComplianceData(compliance || []);
        setMonthlyTrendData(monthlyTrends || []);
        setRecentActivities(activities || []);
        setUpcomingTasks(tasks || []);
        setRiskHeatmapData(riskHeatmap || []);
        setModuleOverview(modules || []);
        setGrcMetrics(grcMetricsData || []);

        // Update metrics cards with real data
        if (metricsData) {
          const updatedMetrics: MetricCard[] = [
            {
              title: t('dashboard.totalAudits'),
              value: metricsData.totalAudits,
              change: 12, // Would need to calculate from historical data
              changeType: 'increase',
              icon: FileText,
              color: 'from-blue-500 to-blue-600',
              trend: [45, 52, 48, 61, 70, 65, 74, 82, 95, 87, 92, 98], // Placeholder
              category: 'audit',
              link: '/audits'
            },
            {
              title: t('dashboard.activeAudits'),
              value: metricsData.activeAudits,
              change: 8, // Would need to calculate from historical data
              changeType: 'increase',
              icon: Activity,
              color: 'from-emerald-500 to-emerald-600',
              trend: [12, 15, 18, 22, 25, 28, 24, 27, 31, 29, 26, 23], // Placeholder
              category: 'audit',
              link: '/audits'
            },
            {
              title: t('dashboard.totalFindings'),
              value: metricsData.totalFindings,
              change: -5, // Would need to calculate from historical data
              changeType: 'decrease',
              icon: Search,
              color: 'from-orange-500 to-orange-600',
              trend: [120, 115, 108, 102, 95, 98, 92, 88, 85, 91, 87, 89], // Placeholder
              category: 'audit',
              link: '/findings'
            },
            {
              title: t('dashboard.criticalFindings'),
              value: metricsData.criticalFindings,
              change: -18, // Would need to calculate from historical data
              changeType: 'decrease',
              icon: AlertTriangle,
              color: 'from-red-500 to-red-600',
              trend: [18, 16, 15, 17, 14, 13, 15, 12, 11, 13, 10, 12], // Placeholder
              category: 'audit',
              link: '/findings'
            },
            {
              title: t('dashboard.totalControls'),
              value: metricsData.totalControls,
              change: 6, // Would need to calculate from historical data
              changeType: 'increase',
              icon: Shield,
              color: 'from-purple-500 to-purple-600',
              trend: [310, 315, 322, 328, 335, 338, 342, 340, 345, 348, 344, 342], // Placeholder
              category: 'control',
              link: '/controls'
            },
            {
              title: t('dashboard.effectiveControls'),
              value: metricsData.effectiveControls,
              change: 4, // Would need to calculate from historical data
              changeType: 'increase',
              icon: CheckCircle,
              color: 'from-green-500 to-green-600',
              trend: [280, 285, 288, 292, 295, 294, 296, 298, 300, 299, 297, 298], // Placeholder
              category: 'control',
              link: '/controls'
            }
          ];

          setMetrics(updatedMetrics);
        }
        
        setIsLoading(false);
        console.log('Dashboard data loading completed');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'non-compliant': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const toggleModuleExpansion = (moduleName: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(name => name !== moduleName)
        : [...prev, moduleName]
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

    const renderOverviewView = (): JSX.Element => (
    <>
      {/* Enhanced Metrics Cards with Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => metric.link && navigate(metric.link)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {formatNumber(metric.value)}
              </h3>
              <p className="text-sm text-gray-600">{metric.title}</p>
            </div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metric.trend.map((value, i) => ({ value, index: i }))}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={metric.color.includes('blue') ? '#3b82f6' :
                           metric.color.includes('emerald') ? '#10b981' :
                           metric.color.includes('orange') ? '#f59e0b' :
                           metric.color.includes('red') ? '#ef4444' :
                           metric.color.includes('purple') ? '#8b5cf6' : '#10b981'}
                    fill={metric.color.includes('blue') ? '#dbeafe' :
                          metric.color.includes('emerald') ? '#d1fae5' :
                          metric.color.includes('orange') ? '#fef3c7' :
                          metric.color.includes('red') ? '#fee2e2' :
                          metric.color.includes('purple') ? '#ede9fe' : '#d1fae5'}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {metric.link && (
              <div className="flex items-center justify-end mt-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">View Details</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Module Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleOverview.map((module, index) => {
          // Create icon mapping
          const iconMap: { [key: string]: React.ElementType } = {
            FileText,
            AlertTriangle,
            Shield,
            Search,
            CheckCircle
          };
          
          const ModuleIcon = iconMap[module.icon] || FileText;
          
          return (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(module.link)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                    module.status === 'healthy' ? 'from-green-500 to-green-600' :
                    module.status === 'warning' ? 'from-yellow-500 to-yellow-600' :
                    'from-red-500 to-red-600'
                  } flex items-center justify-center`}>
                    <ModuleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {module.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleStatusColor(module.status)}`}>
                      {module.status}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{module.metrics.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{module.metrics.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{module.metrics.critical}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{module.metrics.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
              Audits by Status
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={auditStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {auditStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Compliance Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
              Compliance Status
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {complianceData.map((framework, index) => (
              <div key={framework.framework} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium text-gray-900">{framework.framework}</div>
                    <div className="text-sm text-gray-600">{framework.controls} controls</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{framework.compliance}%</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getComplianceStatusColor(framework.status)}`}>
                    {framework.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Monthly Trends
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Audits</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Findings</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Controls</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Risks</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="audits"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="findings"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="controls"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="risks"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Activity and Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => activity.link && navigate(activity.link)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <Users className="w-3 h-3 mr-1" />
                    {activity.user} • {activity.timestamp}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-500" />
            Upcoming Tasks
          </h3>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id} 
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer group"
                onClick={() => task.link && navigate(task.link)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {task.dueDate}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {task.assignee}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{task.progress}% complete</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );

  const renderDetailedView = (): JSX.Element => (
    <>
      {/* GRC Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grcMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{metric.title}</h3>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                {metric.status}
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-600">Target: {metric.target}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                {getTrendIcon(metric.trend)}
                <span className="ml-1">Last updated: {metric.lastUpdated}</span>
              </div>
              <div className="text-xs text-gray-500">{metric.category}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Type Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Audit Type Breakdown
          </h3>
          <div className="space-y-4">
            {detailedMetrics.auditBreakdown.map((audit, index) => (
              <div key={audit.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: audit.color }}></div>
                  <span className="font-medium text-gray-900">{audit.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{audit.count} audits</span>
                  <span className="text-sm font-semibold text-gray-900">{audit.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Control Effectiveness by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            Control Effectiveness by Category
          </h3>
          <div className="space-y-4">
            {detailedMetrics.controlEffectiveness.map((control, index) => (
              <div key={control.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{control.category}</span>
                  <span className="text-sm text-gray-600">{control.effective}/{control.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(control.effective / control.total) * 100}%`,
                      backgroundColor: control.color
                    }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    {Math.round((control.effective / control.total) * 100)}% effective
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk Matrix Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          Risk Matrix Heatmap
        </h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {detailedMetrics.riskMatrix.map((risk, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: risk.color }}
            >
              {risk.count}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Low Probability</span>
          <span>High Probability</span>
        </div>
        <div className="flex flex-col items-end text-xs text-gray-600 mt-2">
          <span>High Impact</span>
          <span>Low Impact</span>
        </div>
      </motion.div>
    </>
  );

  const renderAnalyticsView = (): JSX.Element => (
    <>
      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsData.performanceIndicators.map((indicator, index) => (
          <motion.div
            key={indicator.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
              {getTrendIcon(indicator.trend)}
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-gray-900">{indicator.current}</div>
              <div className="text-sm text-gray-600">{indicator.unit}</div>
            </div>
            <div className="text-sm text-gray-600">Target: {indicator.target} {indicator.unit}</div>
          </motion.div>
        ))}
      </div>

      {/* Trend Analysis Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          GRC Performance Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.trendAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="grcScore" stroke="#3b82f6" strokeWidth={3} name="GRC Score" />
              <Line type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={3} name="Risk Score" />
              <Line type="monotone" dataKey="controlScore" stroke="#10b981" strokeWidth={3} name="Control Score" />
              <Line type="monotone" dataKey="complianceScore" stroke="#f59e0b" strokeWidth={3} name="Compliance Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Predictive Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Predictive Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsData.predictiveInsights.map((insight, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-900 mb-3">{insight.insight}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">Confidence:</span>
                  <span className="text-sm font-semibold text-gray-900">{insight.confidence}%</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                  {insight.impact} impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6 space-y-6">
        {/* Enhanced Header with View Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Your comprehensive GRC overview and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border">
              {['overview', 'detailed', 'analytics'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedView === view
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border shadow-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Based on Selected View */}
        {selectedView === 'overview' && renderOverviewView()}
        {selectedView === 'detailed' && renderDetailedView()}
        {selectedView === 'analytics' && renderAnalyticsView()}
      </div>
    </div>
  );
};

export default Dashboard;
