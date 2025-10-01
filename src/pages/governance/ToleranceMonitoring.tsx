import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Target,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Bell,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Thermometer,
  Gauge,
  Eye,
  EyeOff,
  Filter,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';
import { GovernanceService } from '../../services/governanceService';
import type {
  RiskAppetiteFramework,
  RiskMeasurement,
  RiskScenario
} from '../../services/governanceService';
import { toast } from 'react-hot-toast';
import RiskToleranceChart from '../../components/governance/RiskToleranceChart';

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
  changeRate: number; // percentage change per minute
};

type Alert = {
  id: string;
  category: string;
  type: 'breach' | 'approaching' | 'trend' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
};

type MonitoringConfig = {
  refreshInterval: number;
  alertThresholds: {
    breach: number;
    approaching: number;
  };
  notifications: {
    email: boolean;
    dashboard: boolean;
    sound: boolean;
  };
  autoRefresh: boolean;
  showTrends: boolean;
  showAlerts: boolean;
};

export default function ToleranceMonitoring() {
  const { t } = useTranslation();
  const [frameworks, setFrameworks] = useState<RiskAppetiteFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<RiskAppetiteFramework | null>(null);
  const [toleranceLevels, setToleranceLevels] = useState<ToleranceLevel[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  // Monitoring state
  const [isMonitoringActive, setIsMonitoringActive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [config, setConfig] = useState<MonitoringConfig>({
    refreshInterval: 30,
    alertThresholds: { breach: 90, approaching: 75 },
    notifications: { email: true, dashboard: true, sound: false },
    autoRefresh: true,
    showTrends: true,
    showAlerts: true
  });

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'chart'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'within_appetite' | 'approaching_limit' | 'breached'>('all');
  const [sortBy, setSortBy] = useState<'category' | 'utilization' | 'status' | 'trend'>('utilization');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Load frameworks
  const loadFrameworks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getRiskAppetiteFrameworks();
      setFrameworks(data);
      if (data.length > 0 && !selectedFramework) {
        setSelectedFramework(data[0]);
      }
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error loading frameworks:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to load risk appetite frameworks');
      // Create a demo framework if none exist
      const demoFramework: RiskAppetiteFramework = {
        id: 'demo-framework',
        name: 'Demo Risk Appetite Framework',
        description: 'Demo framework for testing tolerance monitoring',
        risk_categories: {
          categories: ['Operational Risk', 'Financial Risk', 'Compliance Risk', 'Strategic Risk']
        },
        appetite_levels: {
          levels: {
            low: 'Acceptable risk level with minimal impact',
            moderate: 'Moderate risk requiring monitoring',
            high: 'High risk requiring immediate attention'
          }
        },
        tolerance_thresholds: {
          thresholds: {
            operational_risk: { min: 0, max: 100, unit: 'probability_percentage' },
            financial_risk: { min: 0, max: 5000000, unit: 'currency_usd' },
            compliance_risk: { min: 0, max: 50, unit: 'violations_per_quarter' },
            strategic_risk: { min: 0, max: 10, unit: 'probability_percentage' }
          }
        },
        review_frequency: 'quarterly',
        next_review_date: null,
        status: 'approved' as const,
        approved_by: 'demo-user',
        approval_date: new Date().toISOString(),
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setFrameworks([demoFramework]);
      setSelectedFramework(demoFramework);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tolerance levels with simulated real-time data
  const loadToleranceLevels = useCallback(async () => {
    if (!selectedFramework) return;

    try {
      const levels: ToleranceLevel[] = [];
      const categories = selectedFramework.risk_categories.categories;
      const thresholds = selectedFramework.tolerance_thresholds.thresholds;

      categories.forEach((category, index) => {
        const threshold = thresholds[category.toLowerCase().replace(' ', '_')];
        if (threshold) {
          // Simulate current values with some variation and trends
          const baseValue = Math.floor(Math.random() * (threshold.max - threshold.min + 1)) + threshold.min;
          const variation = (Math.random() - 0.5) * 0.05 * baseValue; // ±2.5% variation
          const currentValue = Math.max(threshold.min, Math.min(threshold.max, baseValue + variation));
          const utilization = (currentValue - threshold.min) / (threshold.max - threshold.min);

          // Simulate trend and change rate
          const trend = Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';
          const changeRate = trend === 'stable' ? 0 : (Math.random() - 0.5) * 2; // ±2% per minute

          let status: 'within_appetite' | 'approaching_limit' | 'breached' = 'within_appetite';
          if (utilization > 0.9) status = 'breached';
          else if (utilization > 0.75) status = 'approaching_limit';

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
            utilization: utilization * 100,
            changeRate
          });
        }
      });

      setToleranceLevels(levels);
      setLastRefresh(new Date());

      // Generate alerts based on current levels
      generateAlerts(levels);
    } catch (error) {
      console.error('Error loading tolerance levels:', error);
      setConnectionStatus('disconnected');
    }
  }, [selectedFramework]);

  // Generate alerts based on tolerance levels
  const generateAlerts = useCallback((levels: ToleranceLevel[]) => {
    const newAlerts: Alert[] = [];

    levels.forEach(level => {
      if (level.status === 'breached') {
        newAlerts.push({
          id: `alert_${level.id}_${Date.now()}`,
          category: level.category,
          type: 'breach',
          severity: 'critical',
          message: `${level.category} has breached the tolerance threshold (${level.utilization.toFixed(1)}% utilization)`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      } else if (level.status === 'approaching_limit') {
        newAlerts.push({
          id: `alert_${level.id}_${Date.now()}`,
          category: level.category,
          type: 'approaching',
          severity: 'high',
          message: `${level.category} is approaching the tolerance limit (${level.utilization.toFixed(1)}% utilization)`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      // Trend-based alerts
      if (Math.abs(level.changeRate) > 1.5) {
        newAlerts.push({
          id: `trend_${level.id}_${Date.now()}`,
          category: level.category,
          type: 'trend',
          severity: level.changeRate > 2 ? 'high' : 'medium',
          message: `${level.category} shows rapid ${level.trend === 'up' ? 'increase' : 'decrease'} (${level.changeRate > 0 ? '+' : ''}${level.changeRate.toFixed(1)}% per minute)`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
    });

    // Only keep recent alerts (last 50)
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
  }, []);

  // Filter and sort tolerance levels
  const filteredAndSortedLevels = toleranceLevels
    .filter(level => filterStatus === 'all' || level.status === filterStatus)
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'utilization':
          aValue = a.utilization;
          bValue = b.utilization;
          break;
        case 'status':
          const statusOrder = { breached: 3, approaching_limit: 2, within_appetite: 1 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case 'trend':
          aValue = a.changeRate;
          bValue = b.changeRate;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Control functions
  const toggleMonitoring = useCallback(() => {
    setIsMonitoringActive(!isMonitoringActive);
    toast.success(isMonitoringActive ? 'Monitoring paused' : 'Monitoring resumed');
  }, [isMonitoringActive]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await loadToleranceLevels();
    setLoading(false);
    toast.success('Data refreshed');
  }, [loadToleranceLevels]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const toggleCardExpansion = useCallback((levelId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!isMonitoringActive || !config.autoRefresh) return;

    const interval = setInterval(() => {
      loadToleranceLevels();
    }, config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isMonitoringActive, config.autoRefresh, config.refreshInterval, loadToleranceLevels]);

  // Initial load
  useEffect(() => {
    loadFrameworks();
  }, [loadFrameworks]);

  useEffect(() => {
    if (selectedFramework) {
      loadToleranceLevels();
    }
  }, [selectedFramework, loadToleranceLevels]);

  // Status helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within_appetite': return 'text-green-600 bg-green-100 border-green-200';
      case 'approaching_limit': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'breached': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'within_appetite': return <CheckCircle className="w-4 h-4" />;
      case 'approaching_limit': return <AlertTriangle className="w-4 h-4" />;
      case 'breached': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
      case 'stable': return <div className="w-4 h-0.5 bg-gray-400 rounded"></div>;
      default: return <div className="w-4 h-0.5 bg-gray-400 rounded"></div>;
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

  const getActiveAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const getCriticalAlertsCount = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length;

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
            <Activity className="w-8 h-8 mr-3 text-blue-600" />
            Tolerance Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of risk tolerance levels with instant alerts and trend analysis
          </p>
        </div>
        <div className="flex gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
            {connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>

          {/* Monitoring Controls */}
          <Button
            variant={isMonitoringActive ? "default" : "outline"}
            onClick={toggleMonitoring}
            className={isMonitoringActive ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {isMonitoringActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isMonitoringActive ? 'Pause' : 'Resume'}
          </Button>

          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Framework Selector and Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Framework Selector */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Framework
          </label>
          {loading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-500">Loading frameworks...</span>
            </div>
          ) : (
            <select
              value={selectedFramework?.id || ''}
              onChange={(e) => {
                const framework = frameworks.find(f => f.id === e.target.value);
                setSelectedFramework(framework || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {frameworks.map(framework => (
                <option key={framework.id} value={framework.id}>
                  {framework.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Status Indicators */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Last Update</div>
          <div className="text-lg font-semibold text-gray-900">
            {lastRefresh.toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Active Alerts</div>
          <div className="text-lg font-semibold text-orange-600">
            {getActiveAlertsCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Critical Alerts</div>
          <div className="text-lg font-semibold text-red-600">
            {getCriticalAlertsCount}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'grid', icon: BarChart3, label: 'Grid' },
                { id: 'list', icon: Activity, label: 'List' },
                { id: 'chart', icon: LineChart, label: 'Chart' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    viewMode === mode.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="within_appetite">Within Appetite</option>
              <option value="approaching_limit">Approaching Limit</option>
              <option value="breached">Breached</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="utilization">Utilization</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
              <option value="trend">Trend</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Tolerance Levels */}
        <div className="xl:col-span-3">
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <span className="text-gray-600">Loading tolerance levels...</span>
              </div>
            </div>
          ) : filteredAndSortedLevels.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tolerance Levels</h3>
                <p className="text-gray-600 mb-4">
                  {selectedFramework
                    ? "No tolerance levels found for the selected framework. The system will generate sample data for demonstration."
                    : "Please select a risk appetite framework to view tolerance levels."
                  }
                </p>
                {selectedFramework && (
                  <Button onClick={refreshData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Sample Data
                  </Button>
                )}
              </div>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedLevels.map((level) => (
                  <motion.div
                    key={level.id}
                    className={`bg-white border-2 rounded-lg p-6 hover:shadow-md transition-all duration-200 ${
                      getStatusColor(level.status)
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -2 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 truncate">{level.category}</h3>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(level.trend)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(level.status)}`}>
                          {getStatusIcon(level.status)}
                          <span className="ml-1 capitalize">{level.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Value Display */}
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatValue(level.currentValue, level.unit)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Threshold: {formatValue(level.thresholdMin, level.unit)} - {formatValue(level.thresholdMax, level.unit)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          level.status === 'breached' ? 'bg-red-500' :
                          level.status === 'approaching_limit' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(level.utilization, 100)}%` }}
                      ></div>
                    </div>

                    {/* Utilization & Trend */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{level.utilization.toFixed(1)}% utilized</span>
                      <span className={`font-medium ${
                        level.changeRate > 0 ? 'text-red-600' :
                        level.changeRate < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {level.changeRate > 0 ? '+' : ''}{level.changeRate.toFixed(1)}%/min
                      </span>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => toggleCardExpansion(level.id)}
                      className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                    >
                      {expandedCards.has(level.id) ? (
                        <>
                          <Minimize2 className="w-3 h-3" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3 h-3" />
                          Show More
                        </>
                      )}
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedCards.has(level.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Last Updated:</span>
                              <div className="font-medium">{new Date(level.lastUpdated).toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Change Rate:</span>
                              <div className="font-medium">{level.changeRate.toFixed(2)}% per minute</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            ) : null
          )}

          {viewMode === 'list' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedLevels.map((level) => (
                      <tr key={level.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{level.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatValue(level.currentValue, level.unit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatValue(level.thresholdMin, level.unit)} - {formatValue(level.thresholdMax, level.unit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  level.status === 'breached' ? 'bg-red-500' :
                                  level.status === 'approaching_limit' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(level.utilization, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{level.utilization.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(level.status)}`}>
                            {getStatusIcon(level.status)}
                            <span className="ml-1 capitalize">{level.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTrendIcon(level.trend)}
                            <span className={`ml-1 text-sm font-medium ${
                              level.changeRate > 0 ? 'text-red-600' :
                              level.changeRate < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {level.changeRate > 0 ? '+' : ''}{level.changeRate.toFixed(1)}%/min
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(level.lastUpdated).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === 'chart' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Tolerance Trends</h3>
              <RiskToleranceChart
                data={filteredAndSortedLevels.map(level => ({
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
          )}
        </div>

        {/* Alerts Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              <div className="flex items-center gap-2">
                {config.notifications.sound ? (
                  <Volume2 className="w-4 h-4 text-gray-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
                <Bell className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.filter(a => !a.acknowledged).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">No active alerts</p>
                </div>
              ) : (
                alerts.filter(a => !a.acknowledged).map((alert) => (
                  <motion.div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                      alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'high' ? 'text-orange-600' :
                            alert.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <span className="text-xs font-medium text-gray-600 uppercase">
                            {alert.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded"
                        title="Acknowledge alert"
                      >
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
                >
                  Acknowledge All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}