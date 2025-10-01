import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/aiService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart as LineChartIcon,
  Zap,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface TrendAnalysisProps {
  className?: string;
}

interface TrendData {
  date: string;
  value: number;
  baseline?: number;
  upper_threshold?: number;
  lower_threshold?: number;
  anomaly_score?: number;
  forecast?: number;
}

interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number;
  r_squared: number;
  seasonality: boolean;
  seasonality_period?: number;
  anomalies: Anomaly[];
  forecast: ForecastData[];
  confidence: number;
  insights: string[];
}

interface Anomaly {
  date: string;
  value: number;
  expected_value: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation?: string;
}

interface ForecastData {
  date: string;
  value: number;
  upper_bound: number;
  lower_bound: number;
  confidence: number;
}

interface MetricConfig {
  id: string;
  name: string;
  table: string;
  column: string;
  aggregation: 'count' | 'sum' | 'avg' | 'max' | 'min';
  filters?: Record<string, any>;
  description: string;
}

const AVAILABLE_METRICS: MetricConfig[] = [
  {
    id: 'risk_count',
    name: 'Risk Count',
    table: 'risks',
    column: 'id',
    aggregation: 'count',
    description: 'Total number of active risks'
  },
  {
    id: 'risk_probability_avg',
    name: 'Average Risk Probability',
    table: 'risks',
    column: 'probability',
    aggregation: 'avg',
    description: 'Average probability of all risks'
  },
  {
    id: 'incident_count',
    name: 'Incident Count',
    table: 'incidents',
    column: 'id',
    aggregation: 'count',
    description: 'Total number of incidents'
  },
  {
    id: 'incident_severity_avg',
    name: 'Average Incident Severity',
    table: 'incidents',
    column: 'severity',
    aggregation: 'avg',
    filters: { severity_numeric: true },
    description: 'Average severity score of incidents'
  },
  {
    id: 'control_effectiveness',
    name: 'Control Effectiveness',
    table: 'controls',
    column: 'effectiveness',
    aggregation: 'avg',
    description: 'Average control effectiveness score'
  },
  {
    id: 'compliance_score',
    name: 'Compliance Score',
    table: 'compliance_assessments',
    column: 'score',
    aggregation: 'avg',
    description: 'Average compliance assessment score'
  },
  {
    id: 'audit_findings',
    name: 'Audit Findings',
    table: 'findings',
    column: 'id',
    aggregation: 'count',
    description: 'Number of audit findings'
  }
];

const TIME_PERIODS = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '6M', label: 'Last 6 months', days: 180 },
  { value: '1Y', label: 'Last year', days: 365 }
];

const TREND_TYPES = [
  { value: 'linear', label: 'Linear Trend' },
  { value: 'exponential', label: 'Exponential Trend' },
  { value: 'polynomial', label: 'Polynomial Trend' },
  { value: 'moving_average', label: 'Moving Average' }
];

export default function TrendAnalysis({ className = "" }: TrendAnalysisProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('risk_count');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [selectedTrendType, setSelectedTrendType] = useState<string>('linear');
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMetric) {
      loadTrendData();
    }
  }, [selectedMetric, selectedPeriod]);

  async function loadTrendData() {
    try {
      setLoading(true);
      setError(null);

      const metric = AVAILABLE_METRICS.find(m => m.id === selectedMetric);
      if (!metric) return;

      const period = TIME_PERIODS.find(p => p.value === selectedPeriod);
      if (!period) return;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period.days);

      // Build query based on metric
      let query = supabase.from(metric.table).select('*');

      // Apply date filter
      if (metric.table === 'incidents' || metric.table === 'risks' || metric.table === 'findings') {
        query = query.gte('created_at', startDate.toISOString());
      } else if (metric.table === 'compliance_assessments') {
        query = query.gte('assessment_date', startDate.toISOString());
      }

      // Apply additional filters
      if (metric.filters) {
        Object.entries(metric.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process data into daily aggregations
      const dailyData = processDataIntoDailyTrends(data || [], metric, startDate, endDate);
      setTrendData(dailyData);

      // Auto-run analysis
      await analyzeTrends(dailyData, metric);

    } catch (err) {
      console.error('Error loading trend data:', err);
      setError('Failed to load trend data');
    } finally {
      setLoading(false);
    }
  }

  function processDataIntoDailyTrends(data: any[], metric: MetricConfig, startDate: Date, endDate: Date): TrendData[] {
    const dailyMap = new Map<string, any[]>();

    // Group data by date
    data.forEach(item => {
      let dateKey: string;
      if (metric.table === 'compliance_assessments') {
        dateKey = new Date(item.assessment_date).toISOString().split('T')[0];
      } else {
        dateKey = new Date(item.created_at).toISOString().split('T')[0];
      }

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push(item);
    });

    // Calculate daily aggregations
    const result: TrendData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = dailyMap.get(dateKey) || [];

      let value = 0;
      switch (metric.aggregation) {
        case 'count':
          value = dayData.length;
          break;
        case 'sum':
          value = dayData.reduce((sum, item) => sum + (item[metric.column] || 0), 0);
          break;
        case 'avg':
          value = dayData.length > 0
            ? dayData.reduce((sum, item) => sum + (item[metric.column] || 0), 0) / dayData.length
            : 0;
          break;
        case 'max':
          value = dayData.length > 0 ? Math.max(...dayData.map(item => item[metric.column] || 0)) : 0;
          break;
        case 'min':
          value = dayData.length > 0 ? Math.min(...dayData.map(item => item[metric.column] || 0)) : 0;
          break;
      }

      result.push({
        date: dateKey,
        value: Math.round(value * 100) / 100 // Round to 2 decimal places
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  async function analyzeTrends(data: TrendData[], metric: MetricConfig) {
    try {
      setAnalyzing(true);

      // Calculate basic statistics
      const values = data.map(d => d.value);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Calculate trend slope using linear regression
      const n = data.length;
      const sumX = data.reduce((sum, _, i) => sum + i, 0);
      const sumY = values.reduce((sum, val) => sum + val, 0);
      const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
      const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Calculate R-squared
      const yMean = sumY / n;
      const ssRes = data.reduce((sum, d, i) => {
        const predicted = slope * i + intercept;
        return sum + Math.pow(d.value - predicted, 2);
      }, 0);
      const ssTot = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
      const rSquared = 1 - (ssRes / ssTot);

      // Detect anomalies (values beyond 2 standard deviations)
      const anomalies: Anomaly[] = [];
      data.forEach((d, i) => {
        const predicted = slope * i + intercept;
        const deviation = Math.abs(d.value - predicted);
        const zScore = deviation / stdDev;

        if (zScore > 2) {
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (zScore > 3) severity = 'critical';
          else if (zScore > 2.5) severity = 'high';
          else if (zScore > 2) severity = 'medium';

          anomalies.push({
            date: d.date,
            value: d.value,
            expected_value: Math.round(predicted * 100) / 100,
            deviation: Math.round(deviation * 100) / 100,
            severity
          });
        }
      });

      // Generate forecast
      const forecast: ForecastData[] = [];
      for (let i = 1; i <= forecastDays; i++) {
        const futureIndex = n + i - 1;
        const predictedValue = slope * futureIndex + intercept;
        const confidence = Math.max(0.1, Math.min(0.95, rSquared)); // Confidence based on R-squared

        forecast.push({
          date: new Date(data[data.length - 1].date).toISOString().split('T')[0],
          value: Math.round(predictedValue * 100) / 100,
          upper_bound: Math.round((predictedValue + 1.96 * stdDev) * 100) / 100,
          lower_bound: Math.round((predictedValue - 1.96 * stdDev) * 100) / 100,
          confidence: Math.round(confidence * 100) / 100
        });
      }

      // Determine trend direction
      let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
      if (Math.abs(slope) < 0.01) {
        trend = 'stable';
      } else if (slope > 0.01) {
        trend = 'increasing';
      } else if (slope < -0.01) {
        trend = 'decreasing';
      } else {
        trend = 'volatile';
      }

      // Check for seasonality (simple check for weekly patterns)
      const seasonality = checkSeasonality(data);

      // Generate AI insights
      const insights = await generateAIInsights(metric, trend, slope, rSquared, anomalies.length);

      setAnalysis({
        metric: metric.name,
        trend,
        slope: Math.round(slope * 1000) / 1000,
        r_squared: Math.round(rSquared * 1000) / 1000,
        seasonality,
        anomalies,
        forecast,
        confidence: Math.round(rSquared * 100) / 100,
        insights
      });

    } catch (err) {
      console.error('Error analyzing trends:', err);
    } finally {
      setAnalyzing(false);
    }
  }

  function checkSeasonality(data: TrendData[]): boolean {
    if (data.length < 14) return false; // Need at least 2 weeks

    // Simple autocorrelation check for weekly patterns
    const values = data.map(d => d.value);
    let maxCorrelation = 0;

    for (let lag = 7; lag <= 14; lag++) {
      if (lag >= values.length) break;

      let correlation = 0;
      let count = 0;

      for (let i = 0; i < values.length - lag; i++) {
        correlation += (values[i] - values[i + lag]);
        count++;
      }

      correlation = Math.abs(correlation / count);
      maxCorrelation = Math.max(maxCorrelation, correlation);
    }

    return maxCorrelation > 0.3; // Threshold for seasonality detection
  }

  async function generateAIInsights(
    metric: MetricConfig,
    trend: string,
    slope: number,
    rSquared: number,
    anomalyCount: number
  ): Promise<string[]> {
    try {
      const prompt = `
        Analyze this trend data for ${metric.name}:

        Trend: ${trend}
        Slope: ${slope.toFixed(3)}
        R-squared: ${rSquared.toFixed(3)}
        Anomalies detected: ${anomalyCount}

        Provide 3-5 key insights about what this trend means for the organization,
        potential causes, and recommended actions.

        Format as a JSON array of strings.
      `;

      const aiResponse = await aiService.generateContent({
        provider: 'ollama',
        model: 'llama2',
        prompt,
        context: 'trend_analysis_insights',
        fieldType: 'finding_analysis',
        auditData: {}
      });

      if (aiResponse?.content) {
        try {
          return JSON.parse(aiResponse.content);
        } catch {
          // Fallback if AI doesn't return valid JSON
          return [
            `The ${trend} trend in ${metric.name} indicates ${slope > 0 ? 'growing' : 'declining'} activity.`,
            `Model fit quality: ${rSquared > 0.7 ? 'Good' : rSquared > 0.5 ? 'Moderate' : 'Poor'} (R² = ${rSquared.toFixed(2)}).`,
            `${anomalyCount} anomalies detected, requiring investigation.`,
            'Consider implementing preventive measures based on trend direction.',
            'Regular monitoring recommended to track trend changes.'
          ];
        }
      }

      return [
        `Trend analysis shows ${trend} pattern for ${metric.name}.`,
        `Statistical confidence: ${Math.round(rSquared * 100)}%.`,
        `${anomalyCount} unusual data points identified.`,
        'Further investigation recommended for anomalies.',
        'Consider adjusting strategies based on trend direction.'
      ];

    } catch (err) {
      console.error('Error generating AI insights:', err);
      return [
        'Trend analysis completed.',
        'Monitor for significant changes.',
        'Review anomalies for potential issues.',
        'Consider implementing trend-based alerts.'
      ];
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case 'volatile':
        return <Activity className="w-5 h-5 text-yellow-500" />;
      default:
        return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAnomalyColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const exportData = () => {
    const csvData = [
      ['Date', 'Value', 'Baseline', 'Anomaly Score'],
      ...trendData.map(d => [
        d.date,
        d.value,
        d.baseline || '',
        d.anomaly_score || ''
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMetric}_trend_analysis.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trend Analysis & Forecasting <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">New</span></h2>
          <p className="text-gray-600">Advanced trend detection, anomaly analysis, and forecasting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadTrendData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="metric">Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_METRICS.map(metric => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Time Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trendType">Trend Type</Label>
              <Select value={selectedTrendType} onValueChange={setSelectedTrendType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TREND_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="forecast">Forecast Days</Label>
              <Input
                id="forecast"
                type="number"
                min="7"
                max="365"
                value={forecastDays}
                onChange={(e) => setForecastDays(parseInt(e.target.value) || 30)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Overview */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trend Direction</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getTrendIcon(analysis.trend)}
                    <span className="font-medium capitalize">{analysis.trend}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trend Slope</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysis.slope > 0 ? '+' : ''}{analysis.slope.toFixed(3)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Model Fit (R²)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(analysis.r_squared * 100).toFixed(0)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Anomalies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysis.anomalies.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="w-5 h-5" />
            Trend Analysis Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'value' ? 'Actual' :
                  name === 'baseline' ? 'Baseline' :
                  name === 'forecast' ? 'Forecast' : name
                ]}
              />
              <Legend />

              {/* Actual data */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />

              {/* Trend line */}
              {analysis && (
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}

              {/* Forecast data */}
              {analysis?.forecast && (
                <Line
                  type="monotone"
                  data={analysis.forecast}
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="10 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {analysis && analysis.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Detected Anomalies ({analysis.anomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.anomalies.slice(0, 10).map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      anomaly.severity === 'critical' ? 'bg-red-500' :
                      anomaly.severity === 'high' ? 'bg-orange-500' :
                      anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {new Date(anomaly.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Value: {anomaly.value} (Expected: {anomaly.expected_value})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getAnomalyColor(anomaly.severity)}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      ±{anomaly.deviation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {analysis && analysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Summary */}
      {analysis && analysis.forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Forecast Summary ({forecastDays} days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.forecast[analysis.forecast.length - 1]?.value.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Predicted Final Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(analysis.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Forecast Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.seasonality ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-600">Seasonal Pattern</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}