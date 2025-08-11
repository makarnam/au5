import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Activity,
  FileText,
  Calendar,
  MapPin,
  Bell,
  Settings,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Info,
  Clock,
  Users,
  DollarSign,
  AlertCircle,
  PieChart,
  LineChart,
  BarChart,
  Scatter,
  Layers,
  Database,
  Cpu,
  Network,
  Globe,
  Building,
  Truck,
  Heart,
  Brain,
  Wifi,
  Server,
  Download,
  RefreshCw,
  Filter as FilterIcon,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ResilienceMetrics, ResilienceProgram, Crisis, Incident, ScenarioAnalysis } from '../../types/resilience';
import { resilienceService } from '../../services/resilienceService';

const ResilienceMetricsPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<ResilienceMetrics[]>([]);
  const [programs, setPrograms] = useState<ResilienceProgram[]>([]);
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [scenarioAnalyses, setScenarioAnalyses] = useState<ScenarioAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState('30d');
  const [programFilter, setProgramFilter] = useState('all');
  const [metricType, setMetricType] = useState('all');

  // Chart states
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'overview' | 'detailed' | 'trends'>('overview');

  useEffect(() => {
    fetchData();
  }, [dateRange, programFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsData, programsData, crisesData, incidentsData, scenarioData] = await Promise.all([
        resilienceService.getResilienceMetrics('all'), // Get all metrics
        resilienceService.getPrograms(),
        resilienceService.getCrises(),
        resilienceService.getIncidents(),
        resilienceService.getScenarioAnalyses()
      ]);
      
      setMetrics(metricsData);
      setPrograms(programsData);
      setCrises(crisesData);
      setIncidents(incidentsData);
      setScenarioAnalyses(scenarioData);
    } catch (err) {
      setError('Failed to load metrics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallResilienceScore = () => {
    if (metrics.length === 0) return 0;
    
    const latestMetrics = metrics[metrics.length - 1];
    return latestMetrics.overall_resilience_score;
  };

  const calculateTrend = (metricName: keyof ResilienceMetrics) => {
    if (metrics.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];
    
    const currentValue = recent[metricName] as number;
    const previousValue = previous[metricName] as number;
    
    if (previousValue === 0) return { direction: 'stable', percentage: 0 };
    
    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable';
    
    return { direction, percentage: Math.abs(percentage) };
  };

  const getMetricColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMetricBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'All Time';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overallScore = calculateOverallResilienceScore();
  const businessContinuityTrend = calculateTrend('business_continuity_score');
  const incidentResponseTrend = calculateTrend('incident_response_score');
  const crisisManagementTrend = calculateTrend('crisis_management_score');
  const scenarioPlanningTrend = calculateTrend('scenario_planning_score');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resilience Metrics Dashboard</h1>
          <p className="text-gray-600">Executive reporting and KPI tracking for organizational resilience</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Resilience Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Overall Resilience Score</h2>
            <p className="text-blue-100">Comprehensive assessment of organizational resilience</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-2">{overallScore}</div>
            <div className="text-blue-100">out of 100</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-blue-700 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${overallScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Business Continuity</h3>
            {getTrendIcon(businessContinuityTrend.direction)}
          </div>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${getMetricColor(metrics[metrics.length - 1]?.business_continuity_score || 0)}`}>
              {metrics[metrics.length - 1]?.business_continuity_score || 0}
            </span>
            <span className={`ml-2 text-sm ${getTrendColor(businessContinuityTrend.direction)}`}>
              {businessContinuityTrend.percentage > 0 ? '+' : ''}{businessContinuityTrend.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getMetricBgColor(metrics[metrics.length - 1]?.business_continuity_score || 0)}`}
                style={{ width: `${metrics[metrics.length - 1]?.business_continuity_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Incident Response</h3>
            {getTrendIcon(incidentResponseTrend.direction)}
          </div>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${getMetricColor(metrics[metrics.length - 1]?.incident_response_score || 0)}`}>
              {metrics[metrics.length - 1]?.incident_response_score || 0}
            </span>
            <span className={`ml-2 text-sm ${getTrendColor(incidentResponseTrend.direction)}`}>
              {incidentResponseTrend.percentage > 0 ? '+' : ''}{incidentResponseTrend.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getMetricBgColor(metrics[metrics.length - 1]?.incident_response_score || 0)}`}
                style={{ width: `${metrics[metrics.length - 1]?.incident_response_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Crisis Management</h3>
            {getTrendIcon(crisisManagementTrend.direction)}
          </div>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${getMetricColor(metrics[metrics.length - 1]?.crisis_management_score || 0)}`}>
              {metrics[metrics.length - 1]?.crisis_management_score || 0}
            </span>
            <span className={`ml-2 text-sm ${getTrendColor(crisisManagementTrend.direction)}`}>
              {crisisManagementTrend.percentage > 0 ? '+' : ''}{crisisManagementTrend.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getMetricBgColor(metrics[metrics.length - 1]?.crisis_management_score || 0)}`}
                style={{ width: `${metrics[metrics.length - 1]?.crisis_management_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Scenario Planning</h3>
            {getTrendIcon(scenarioPlanningTrend.direction)}
          </div>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${getMetricColor(metrics[metrics.length - 1]?.scenario_planning_score || 0)}`}>
              {metrics[metrics.length - 1]?.scenario_planning_score || 0}
            </span>
            <span className={`ml-2 text-sm ${getTrendColor(scenarioPlanningTrend.direction)}`}>
              {scenarioPlanningTrend.percentage > 0 ? '+' : ''}{scenarioPlanningTrend.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getMetricBgColor(metrics[metrics.length - 1]?.scenario_planning_score || 0)}`}
                style={{ width: `${metrics[metrics.length - 1]?.scenario_planning_score || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident and Crisis Summary */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Incident & Crisis Summary</h2>
            <p className="text-sm text-gray-600">{getDateRangeLabel()}</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{incidents.length}</div>
                <div className="text-sm text-gray-600">Total Incidents</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{crises.length}</div>
                <div className="text-sm text-gray-600">Active Crises</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Critical Incidents</span>
                <span className="text-sm font-medium">
                  {incidents.filter(i => i.severity === 'critical').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolved Today</span>
                <span className="text-sm font-medium">
                  {incidents.filter(i => 
                    i.status === 'resolved' && 
                    new Date(i.resolved_at || '').toDateString() === new Date().toDateString()
                  ).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Resolution Time</span>
                <span className="text-sm font-medium">4.2 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Program Performance */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Program Performance</h2>
            <p className="text-sm text-gray-600">Resilience program maturity and status</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{programs.length}</div>
                <div className="text-sm text-gray-600">Total Programs</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {programs.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active Programs</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Advanced Maturity</span>
                <span className="text-sm font-medium">
                  {programs.filter(p => p.maturity_level === 'advanced' || p.maturity_level === 'world_class').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Needs Review</span>
                <span className="text-sm font-medium">
                  {programs.filter(p => p.status === 'under_review').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Maturity Score</span>
                <span className="text-sm font-medium">72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Impact Analysis */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Financial Impact Analysis</h2>
          <p className="text-sm text-gray-600">Cost analysis and financial resilience metrics</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {formatCurrency(2500000)}
              </div>
              <div className="text-sm text-gray-600">Potential Losses Averted</div>
              <div className="text-xs text-green-600 mt-1">+15% vs last period</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(450000)}
              </div>
              <div className="text-sm text-gray-600">Recovery Investment</div>
              <div className="text-xs text-gray-500 mt-1">This period</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                5.6:1
              </div>
              <div className="text-sm text-gray-600">ROI Ratio</div>
              <div className="text-xs text-green-600 mt-1">+0.8 vs target</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Trend Analysis</h2>
              <p className="text-sm text-gray-600">Performance trends over time</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartView('overview')}
                className={`px-3 py-1 rounded text-sm ${
                  chartView === 'overview' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setChartView('detailed')}
                className={`px-3 py-1 rounded text-sm ${
                  chartView === 'detailed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setChartView('trends')}
                className={`px-3 py-1 rounded text-sm ${
                  chartView === 'trends' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Trends
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          {chartView === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Resilience Score Trend</h3>
                  <div className="h-32 bg-white rounded border flex items-center justify-center">
                    <span className="text-gray-500">Chart placeholder</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Incident Frequency</h3>
                  <div className="h-32 bg-white rounded border flex items-center justify-center">
                    <span className="text-gray-500">Chart placeholder</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {chartView === 'detailed' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Component Scores</h3>
                  <div className="space-y-2">
                    {metrics[metrics.length - 1] && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Business Continuity</span>
                          <span className="text-sm font-medium">{metrics[metrics.length - 1].business_continuity_score}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Incident Response</span>
                          <span className="text-sm font-medium">{metrics[metrics.length - 1].incident_response_score}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Crisis Management</span>
                          <span className="text-sm font-medium">{metrics[metrics.length - 1].crisis_management_score}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Scenario Planning</span>
                          <span className="text-sm font-medium">{metrics[metrics.length - 1].scenario_planning_score}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Stakeholder Confidence</h3>
                  <div className="h-32 bg-white rounded border flex items-center justify-center">
                    <span className="text-gray-500">Chart placeholder</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {chartView === 'trends' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Monthly Trends</h3>
                  <div className="h-32 bg-white rounded border flex items-center justify-center">
                    <span className="text-gray-500">Chart placeholder</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Benchmark Comparison</h3>
                  <div className="h-32 bg-white rounded border flex items-center justify-center">
                    <span className="text-gray-500">Chart placeholder</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Key Recommendations</h2>
          <p className="text-sm text-gray-600">Priority actions to improve resilience</p>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Enhance Crisis Communication</h3>
                <p className="text-sm text-gray-600">Improve communication protocols and stakeholder engagement during crisis events.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Increase Scenario Testing</h3>
                <p className="text-sm text-gray-600">Conduct more frequent stress tests and tabletop exercises to validate response plans.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Invest in Technology</h3>
                <p className="text-sm text-gray-600">Upgrade monitoring and alerting systems to improve incident detection and response times.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ResilienceMetricsPage;
