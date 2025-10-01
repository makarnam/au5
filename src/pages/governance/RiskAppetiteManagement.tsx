import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Target,
  Edit,
  Plus,
  Eye,
  BarChart3,
  Activity,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  Bell,
  Layers,
  Thermometer,
  Gauge,
  Trash2,
  RefreshCw,
  Save,
  TrendingDown,
  Minus,
  DollarSign,
  Percent,
  PieChart,
  LineChart,
  Filter,
  Download,
  Upload,
  Search,
  MoreVertical,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { GovernanceService } from '../../services/governanceService';
import type {
  RiskAppetiteFramework,
  RiskMeasurement,
  RiskScenario,
  RiskAppetiteFormData
} from '../../services/governanceService';
import { toast } from 'react-hot-toast';
import RiskToleranceChart from '../../components/governance/RiskToleranceChart';

type RiskAppetiteMetrics = {
  totalCategories: number;
  categoriesWithinAppetite: number;
  categoriesApproachingLimit: number;
  categoriesBreached: number;
  overallAppetiteStatus: 'healthy' | 'warning' | 'critical';
  averageThresholdUtilization: number;
  recentBreaches: number;
  upcomingReviews: number;
  totalScenarios: number;
  mitigatedScenarios: number;
  activeScenarios: number;
  totalExposure: number;
  riskConcentration: number;
};

type ToleranceLevel = {
  id: string;
  category: string;
  currentValue: number;
  thresholdMin: number;
  thresholdMax: number;
  unit: string;
  status: 'within_appetite' | 'approaching_limit' | 'breached';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  utilization: number;
};

export default function RiskAppetiteManagement() {
  const { t } = useTranslation();
  const [frameworks, setFrameworks] = useState<RiskAppetiteFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<RiskAppetiteFramework | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'scenarios' | 'monitoring' | 'analytics' | 'settings'>('overview');

  // Enhanced state
  const [toleranceLevels, setToleranceLevels] = useState<ToleranceLevel[]>([]);
  const [metrics, setMetrics] = useState<RiskAppetiteMetrics | null>(null);
  const [riskScenarios, setRiskScenarios] = useState<RiskScenario[]>([]);
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'within_appetite' | 'approaching_limit' | 'breached'>('all');

  // Load frameworks
  const loadFrameworks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getRiskAppetiteFrameworks();
      setFrameworks(data);
      if (data.length > 0 && !selectedFramework) {
        setSelectedFramework(data[0]);
      }
    } catch (error) {
      console.error('Error loading frameworks:', error);
      toast.error('Failed to load risk appetite frameworks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tolerance levels
  const loadToleranceLevels = useCallback(async () => {
    if (!selectedFramework) return;

    try {
      // Simulate loading tolerance levels based on framework thresholds
      const levels: ToleranceLevel[] = [];
      const categories = selectedFramework.risk_categories.categories;
      const thresholds = selectedFramework.tolerance_thresholds.thresholds;

      categories.forEach((category, index) => {
        const threshold = thresholds[category.toLowerCase().replace(' ', '_')];
        if (threshold) {
          // Simulate current values with some variation
          const baseValue = Math.floor(Math.random() * (threshold.max - threshold.min + 1)) + threshold.min;
          const variation = (Math.random() - 0.5) * 0.1 * baseValue; // ±5% variation
          const currentValue = Math.max(threshold.min, Math.min(threshold.max, baseValue + variation));
          const utilization = (currentValue - threshold.min) / (threshold.max - threshold.min);

          let status: 'within_appetite' | 'approaching_limit' | 'breached' = 'within_appetite';
          if (utilization > 0.8) status = 'breached';
          else if (utilization > 0.6) status = 'approaching_limit';

          // Simulate trend
          const trend = Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';

          levels.push({
            id: `level_${index}`,
            category,
            currentValue,
            thresholdMin: threshold.min,
            thresholdMax: threshold.max,
            unit: threshold.unit,
            status,
            trend,
            lastUpdated: new Date().toISOString(),
            utilization: utilization * 100
          });
        }
      });

      setToleranceLevels(levels);
    } catch (error) {
      console.error('Error loading tolerance levels:', error);
    }
  }, [selectedFramework]);

  // Load risk scenarios
  const loadRiskScenarios = useCallback(async () => {
    try {
      const scenarios = await GovernanceService.getRiskScenarios();
      setRiskScenarios(scenarios);
    } catch (error) {
      console.error('Error loading risk scenarios:', error);
    }
  }, []);

  // Calculate metrics
  const calculateMetrics = useCallback(() => {
    if (toleranceLevels.length === 0) return;

    const totalCategories = toleranceLevels.length;
    const categoriesWithinAppetite = toleranceLevels.filter(l => l.status === 'within_appetite').length;
    const categoriesApproachingLimit = toleranceLevels.filter(l => l.status === 'approaching_limit').length;
    const categoriesBreached = toleranceLevels.filter(l => l.status === 'breached').length;

    let overallAppetiteStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (categoriesBreached > 0) overallAppetiteStatus = 'critical';
    else if (categoriesApproachingLimit > 0) overallAppetiteStatus = 'warning';

    const averageThresholdUtilization = toleranceLevels.reduce((sum, l) => sum + l.utilization, 0) / toleranceLevels.length;
    const totalScenarios = riskScenarios.length;
    const mitigatedScenarios = riskScenarios.filter(s => s.status === 'mitigated').length;
    const activeScenarios = riskScenarios.filter(s => s.status === 'identified' || s.status === 'assessed').length;

    // Calculate total exposure (simplified)
    const totalExposure = riskScenarios.reduce((sum, s) => sum + s.potential_loss, 0);
    const riskConcentration = totalCategories > 0 ? (categoriesBreached / totalCategories) * 100 : 0;

    setMetrics({
      totalCategories,
      categoriesWithinAppetite,
      categoriesApproachingLimit,
      categoriesBreached,
      overallAppetiteStatus,
      averageThresholdUtilization,
      recentBreaches: categoriesBreached,
      upcomingReviews: 2, // This would be calculated from framework review dates
      totalScenarios,
      mitigatedScenarios,
      activeScenarios,
      totalExposure,
      riskConcentration
    });
  }, [toleranceLevels, riskScenarios]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadToleranceLevels(),
      loadRiskScenarios()
    ]);
    setLastRefresh(new Date());
    toast.success('Data refreshed successfully');
  }, [loadToleranceLevels, loadRiskScenarios]);

  // Toggle monitoring
  const toggleMonitoring = useCallback(() => {
    setIsMonitoringActive(!isMonitoringActive);
    toast.success(isMonitoringActive ? 'Monitoring paused' : 'Monitoring resumed');
  }, [isMonitoringActive]);

  // Filter tolerance levels
  const filteredToleranceLevels = toleranceLevels.filter(level => {
    const matchesSearch = level.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || level.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadFrameworks();
    loadRiskScenarios();
  }, [loadFrameworks, loadRiskScenarios]);

  useEffect(() => {
    if (selectedFramework) {
      loadToleranceLevels();
    }
  }, [selectedFramework, loadToleranceLevels]);

  useEffect(() => {
    if (toleranceLevels.length > 0) {
      calculateMetrics();
    }
  }, [toleranceLevels, calculateMetrics]);

  // Auto-refresh every 30 seconds when monitoring is active
  useEffect(() => {
    if (!isMonitoringActive) return;

    const interval = setInterval(() => {
      loadToleranceLevels();
    }, 30000);

    return () => clearInterval(interval);
  }, [isMonitoringActive, loadToleranceLevels]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within_appetite': return 'text-green-600 bg-green-100';
      case 'approaching_limit': return 'text-yellow-600 bg-yellow-100';
      case 'breached': return 'text-red-600 bg-red-100';
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'within_appetite':
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'approaching_limit':
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'breached':
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    const unitLabels = {
      probability_percentage: '%',
      impact_score: 'pts',
      currency_usd: '$',
      violations_per_quarter: '/quarter',
      breach_probability: '%',
      negative_sentiment_score: 'pts'
    };

    const unitSymbol = unitLabels[unit as keyof typeof unitLabels] || unit;
    return `${value.toLocaleString()}${unitSymbol}`;
  };

  return (
    <motion.div
      className="p-6 space-y-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Risk Appetite Management
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor, analyze, and manage organizational risk tolerance with real-time insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={toggleMonitoring}
            className={isMonitoringActive ? 'border-green-500 text-green-600' : 'border-gray-300'}
          >
            {isMonitoringActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isMonitoringActive ? 'Pause Monitoring' : 'Resume Monitoring'}
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Framework Selector */}
      {frameworks.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Active Framework
              </label>
              <select
                value={selectedFramework?.id || ''}
                onChange={(e) => {
                  const framework = frameworks.find(f => f.id === e.target.value);
                  setSelectedFramework(framework || null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {frameworks.map(framework => (
                  <option key={framework.id} value={framework.id}>
                    {framework.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Dashboard */}
      {metrics && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Categories</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.totalCategories}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Within Appetite</p>
                <p className="text-2xl font-bold text-green-600">{metrics.categoriesWithinAppetite}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approaching Limit</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.categoriesApproachingLimit}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Breached</p>
                <p className="text-2xl font-bold text-red-600">{metrics.categoriesBreached}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.averageThresholdUtilization.toFixed(0)}%</p>
              </div>
              <Gauge className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Appetite Status</p>
                <p className={`text-lg font-bold capitalize ${
                  metrics.overallAppetiteStatus === 'healthy' ? 'text-green-600' :
                  metrics.overallAppetiteStatus === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {metrics.overallAppetiteStatus}
                </p>
              </div>
              <Thermometer className={`w-8 h-8 ${
                metrics.overallAppetiteStatus === 'healthy' ? 'text-green-600' :
                metrics.overallAppetiteStatus === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'categories', label: 'Categories', icon: Target },
              { id: 'scenarios', label: 'Scenarios', icon: Zap },
              { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Appetite Status Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Appetite Status</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metrics?.overallAppetiteStatus || 'healthy')}`}>
                        {getStatusIcon(metrics?.overallAppetiteStatus || 'healthy')}
                        <span className="ml-1 capitalize">{metrics?.overallAppetiteStatus || 'healthy'}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Categories Monitored</span>
                      <span className="font-medium">{metrics?.totalCategories || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Scenarios</span>
                      <span className="font-medium">{metrics?.activeScenarios || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Concentration</span>
                      <span className="font-medium">{metrics?.riskConcentration.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Threshold check completed</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Risk scenario updated</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Approaching limit alert</p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="text-sm">Add Category</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Zap className="w-6 h-6 mb-2" />
                    <span className="text-sm">New Scenario</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Download className="w-6 h-6 mb-2" />
                    <span className="text-sm">Export Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Bell className="w-6 h-6 mb-2" />
                    <span className="text-sm">Configure Alerts</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="within_appetite">Within Appetite</option>
                  <option value="approaching_limit">Approaching Limit</option>
                  <option value="breached">Breached</option>
                </select>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredToleranceLevels.map((level) => (
                  <div key={level.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{level.category}</h4>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(level.trend)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(level.status)}`}>
                          {level.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatValue(level.currentValue, level.unit)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Threshold: {formatValue(level.thresholdMin, level.unit)} - {formatValue(level.thresholdMax, level.unit)}
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full ${
                          level.status === 'breached' ? 'bg-red-500' :
                          level.status === 'approaching_limit' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(level.utilization, 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{level.utilization.toFixed(1)}% utilized</span>
                      <span>Updated {new Date(level.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Risk Scenarios</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Scenario
                </Button>
              </div>

              <div className="space-y-4">
                {riskScenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scenario.impact_level === 'critical' ? 'bg-red-100 text-red-800' :
                            scenario.impact_level === 'high' ? 'bg-orange-100 text-orange-800' :
                            scenario.impact_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {scenario.impact_level}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scenario.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                            scenario.status === 'assessed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {scenario.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Probability:</span>
                            <span className="ml-2 font-medium">{scenario.probability}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Potential Loss:</span>
                            <span className="ml-2 font-medium">${scenario.potential_loss.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Mitigation Plan</h5>
                      <p className="text-sm text-gray-600">{scenario.mitigation_plan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Live Tolerance Monitoring</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isMonitoringActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isMonitoringActive ? 'Monitoring Active' : 'Monitoring Paused'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-time Chart Placeholder */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Risk Utilization Trends</h4>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Real-time chart visualization</p>
                      <p className="text-sm text-gray-400">Chart component would be implemented here</p>
                    </div>
                  </div>
                </div>

                {/* Alert Feed */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Recent Alerts</h4>
                  <div className="space-y-3">
                    {toleranceLevels.filter(l => l.status !== 'within_appetite').map((level, index) => (
                      <div key={level.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <AlertTriangle className={`w-5 h-5 ${
                          level.status === 'breached' ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{level.category}</p>
                          <p className="text-xs text-gray-500">
                            {level.status === 'breached' ? 'Threshold breached' : 'Approaching limit'} • {level.utilization.toFixed(1)}% utilized
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {index + 1}m ago
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && metrics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Risk Appetite Analytics</h3>

              {/* Chart Visualization */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <RiskToleranceChart
                  data={toleranceLevels.map(level => ({
                    category: level.category,
                    currentValue: level.currentValue,
                    thresholdMin: level.thresholdMin,
                    thresholdMax: level.thresholdMax,
                    utilization: level.utilization,
                    status: level.status,
                    trend: level.trend
                  }))}
                  height={400}
                  showThresholds={true}
                  showTrends={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Status Distribution</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Within Appetite</span>
                      <span className="font-medium text-green-600">{metrics.categoriesWithinAppetite}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approaching Limit</span>
                      <span className="font-medium text-yellow-600">{metrics.categoriesApproachingLimit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Breached</span>
                      <span className="font-medium text-red-600">{metrics.categoriesBreached}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Utilization</span>
                      <span className="font-medium text-blue-600">{metrics.averageThresholdUtilization.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Scenarios</span>
                      <span className="font-medium text-purple-600">{metrics.totalScenarios}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mitigated Scenarios</span>
                      <span className="font-medium text-green-600">{metrics.mitigatedScenarios}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Concentration</span>
                      <span className="font-medium text-orange-600">{metrics.riskConcentration.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Trend Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {toleranceLevels.slice(0, 6).map((level) => (
                    <div key={level.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{level.category}</span>
                        {getTrendIcon(level.trend)}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {level.changeRate > 0 ? '+' : ''}{level.changeRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">per minute change</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Risk Appetite Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Monitoring Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refresh Interval
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="30">30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                        <option value="900">15 minutes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alert Thresholds
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <span className="text-sm">Email notifications</span>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <span className="text-sm">Dashboard alerts</span>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm">SMS notifications</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Data Management</h4>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Configuration
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Configuration
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}