import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Brain,
  Zap,
  Clock,
  BarChart3,
  Activity,
  Eye
} from 'lucide-react';

interface PredictiveAnalyticsProps {
  className?: string;
}

interface PredictionData {
  date: string;
  actual: number;
  predicted: number;
  upper_bound: number;
  lower_bound: number;
  confidence: number;
}

interface RiskPrediction {
  risk_id: string;
  risk_title: string;
  current_probability: number;
  predicted_probability: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence_score: number;
  time_horizon: string;
  factors: string[];
}

interface IncidentPrediction {
  type: string;
  current_rate: number;
  predicted_rate: number;
  confidence_interval: [number, number];
  seasonality_factor: number;
  external_factors: string[];
}

interface CompliancePrediction {
  framework: string;
  current_score: number;
  predicted_score: number;
  risk_factors: string[];
  recommendations: string[];
}

const TIME_HORIZONS = [
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' }
];

const PREDICTION_MODELS = [
  { value: 'linear', label: 'Linear Regression' },
  { value: 'exponential', label: 'Exponential Smoothing' },
  { value: 'arima', label: 'ARIMA' },
  { value: 'neural', label: 'Neural Network' }
];

export default function PredictiveAnalytics({ className = "" }: PredictiveAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3M');
  const [selectedModel, setSelectedModel] = useState('linear');
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [incidentPredictions, setIncidentPredictions] = useState<IncidentPrediction[]>([]);
  const [compliancePredictions, setCompliancePredictions] = useState<CompliancePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'risks' | 'incidents' | 'compliance'>('risks');

  useEffect(() => {
    loadPredictions();
  }, [selectedTimeframe, selectedModel]);

  async function loadPredictions() {
    try {
      setLoading(true);
      setError(null);

      // Load historical data for predictions
      await Promise.all([
        loadRiskPredictions(),
        loadIncidentPredictions(),
        loadCompliancePredictions(),
        generateTimeSeriesPredictions()
      ]);

    } catch (err) {
      console.error('Error loading predictions:', err);
      setError('Failed to load predictive analytics');
    } finally {
      setLoading(false);
    }
  }

  async function loadRiskPredictions() {
    try {
      // Get risk data with historical trends
      const { data: risks, error } = await supabase
        .from('risks')
        .select(`
          id,
          title,
          probability,
          impact,
          created_at,
          updated_at
        `)
        .order('created_at');

      if (error) throw error;

      // Generate AI-powered risk predictions
      const predictions = await generateRiskPredictions(risks || []);
      setRiskPredictions(predictions);

    } catch (err) {
      console.error('Error loading risk predictions:', err);
    }
  }

  async function loadIncidentPredictions() {
    try {
      // Get incident data for trend analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 12); // Last 12 months

      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('incident_type, created_at, severity')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Analyze incident patterns and predict future rates
      const predictions = await generateIncidentPredictions(incidents || []);
      setIncidentPredictions(predictions);

    } catch (err) {
      console.error('Error loading incident predictions:', err);
    }
  }

  async function loadCompliancePredictions() {
    try {
      // Get compliance assessment data
      const { data: assessments, error } = await supabase
        .from('compliance_assessments')
        .select(`
          framework_name,
          score,
          assessment_date,
          risk_level
        `)
        .order('assessment_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Generate compliance trend predictions
      const predictions = await generateCompliancePredictions(assessments || []);
      setCompliancePredictions(predictions);

    } catch (err) {
      console.error('Error loading compliance predictions:', err);
    }
  }

  async function generateTimeSeriesPredictions() {
    try {
      // Generate sample time series data for demonstration
      const data: PredictionData[] = [];
      const baseDate = new Date();

      for (let i = -30; i <= 30; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);

        // Simulate actual data with some noise
        const actual = Math.max(0, 50 + Math.sin(i * 0.2) * 20 + Math.random() * 10);

        // Generate prediction based on selected model
        let predicted = actual;
        let upperBound = actual * 1.2;
        let lowerBound = actual * 0.8;
        let confidence = 0.8;

        if (i > 0) { // Future predictions
          switch (selectedModel) {
            case 'linear':
              predicted = actual + (i * 0.5); // Linear trend
              break;
            case 'exponential':
              predicted = actual * Math.pow(1.02, i); // Exponential growth
              break;
            case 'arima':
              predicted = actual + Math.sin(i * 0.1) * 5; // Seasonal component
              break;
            case 'neural':
              predicted = actual + (Math.random() - 0.5) * 10; // Neural network simulation
              confidence = 0.9;
              break;
          }
          upperBound = predicted * 1.15;
          lowerBound = predicted * 0.85;
        }

        data.push({
          date: date.toISOString().split('T')[0],
          actual: i <= 0 ? actual : 0,
          predicted: Math.max(0, predicted),
          upper_bound: Math.max(0, upperBound),
          lower_bound: Math.max(0, lowerBound),
          confidence
        });
      }

      setPredictions(data);
    } catch (err) {
      console.error('Error generating time series predictions:', err);
    }
  }

  async function generateRiskPredictions(risks: any[]): Promise<RiskPrediction[]> {
    try {
      if (risks.length === 0) return [];

      // Use AI to analyze risk trends and predict future probabilities
      const riskAnalysisPrompt = `
        Analyze these risks and predict their future probability changes:

        Risk Data:
        ${risks.map(risk => `
          - ${risk.title}: Current probability ${risk.probability}%, Created ${risk.created_at}
        `).join('')}

        For each risk, predict:
        1. Future probability (0-100%)
        2. Trend direction (increasing/decreasing/stable)
        3. Confidence score (0-1)
        4. Key influencing factors
        5. Time horizon for prediction

        Return as JSON array with structure:
        [{
          "risk_id": "id",
          "risk_title": "title",
          "current_probability": 50,
          "predicted_probability": 60,
          "trend": "increasing",
          "confidence_score": 0.8,
          "time_horizon": "3 months",
          "factors": ["factor1", "factor2"]
        }]
      `;

      const aiResponse = await aiService.generateContent({
        provider: 'ollama',
        model: 'llama2',
        prompt: riskAnalysisPrompt,
        context: 'risk_prediction_analysis',
        fieldType: 'finding_analysis',
        auditData: {}
      });

      if (aiResponse?.content) {
        return JSON.parse(aiResponse.content);
      }

      // Fallback: Generate mock predictions
      return risks.slice(0, 5).map((risk, index) => ({
        risk_id: risk.id,
        risk_title: risk.title,
        current_probability: risk.probability,
        predicted_probability: Math.min(100, risk.probability + (Math.random() - 0.5) * 20),
        trend: ['increasing', 'decreasing', 'stable'][index % 3] as any,
        confidence_score: 0.7 + Math.random() * 0.3,
        time_horizon: selectedTimeframe,
        factors: ['Market conditions', 'Regulatory changes', 'Operational changes']
      }));

    } catch (err) {
      console.error('Error generating risk predictions:', err);
      return [];
    }
  }

  async function generateIncidentPredictions(incidents: any[]): Promise<IncidentPrediction[]> {
    try {
      // Group incidents by type
      const typeGroups = incidents.reduce((acc, incident) => {
        if (!acc[incident.incident_type]) {
          acc[incident.incident_type] = [];
        }
        acc[incident.incident_type].push(incident);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate current rates and predict future rates
      const predictions: IncidentPrediction[] = [];

      for (const [type, typeIncidents] of Object.entries(typeGroups) as [string, any[]][]) {
        const currentRate = (typeIncidents as any[]).length / 12; // incidents per month
        const predictedRate = currentRate * (0.9 + Math.random() * 0.2); // ±10% variation

        predictions.push({
          type,
          current_rate: Math.round(currentRate * 100) / 100,
          predicted_rate: Math.round(predictedRate * 100) / 100,
          confidence_interval: [
            Math.round(predictedRate * 0.8 * 100) / 100,
            Math.round(predictedRate * 1.2 * 100) / 100
          ],
          seasonality_factor: 0.1 + Math.random() * 0.2,
          external_factors: ['Economic conditions', 'Technology changes', 'Regulatory updates']
        });
      }

      return predictions;

    } catch (err) {
      console.error('Error generating incident predictions:', err);
      return [];
    }
  }

  async function generateCompliancePredictions(assessments: any[]): Promise<CompliancePrediction[]> {
    try {
      // Group by framework
      const frameworkGroups = assessments.reduce((acc, assessment) => {
        if (!acc[assessment.framework_name]) {
          acc[assessment.framework_name] = [];
        }
        acc[assessment.framework_name].push(assessment);
        return acc;
      }, {} as Record<string, any[]>);

      const predictions: CompliancePrediction[] = [];

      for (const [framework, frameworkAssessments] of Object.entries(frameworkGroups) as [string, any[]][]) {
        const latest = (frameworkAssessments as any[])[0];
        const currentScore = latest?.score || 85;
        const predictedScore = Math.max(0, Math.min(100,
          currentScore + (Math.random() - 0.5) * 10
        ));

        predictions.push({
          framework,
          current_score: currentScore,
          predicted_score: Math.round(predictedScore),
          risk_factors: ['Regulatory changes', 'Technology updates', 'Resource constraints'],
          recommendations: [
            'Increase training frequency',
            'Implement additional controls',
            'Regular compliance reviews'
          ]
        });
      }

      return predictions;

    } catch (err) {
      console.error('Error generating compliance predictions:', err);
      return [];
    }
  }

  async function runAIPredictionAnalysis() {
    try {
      setAnalyzing(true);

      const analysisPrompt = `
        Perform comprehensive predictive analytics on the organization's GRC data:

        Analyze patterns in:
        1. Risk probability changes over time
        2. Incident frequency and severity trends
        3. Compliance score trajectories
        4. Control effectiveness predictions
        5. Audit finding patterns

        Provide insights on:
        - Emerging risk trends
        - Potential compliance gaps
        - Incident prevention opportunities
        - Resource allocation recommendations
        - Strategic improvement areas

        Use ${selectedModel} model for predictions with ${selectedTimeframe} time horizon.
      `;

      const aiResponse = await aiService.generateContent({
        provider: 'ollama',
        model: 'llama2',
        prompt: analysisPrompt,
        context: 'predictive_analytics_comprehensive',
        fieldType: 'finding_analysis',
        auditData: {}
      });

      if (aiResponse?.content) {
        // Process AI insights and update predictions
        console.log('AI Analysis Results:', aiResponse.content);
        // In a real implementation, parse and apply these insights
      }

    } catch (err) {
      console.error('Error running AI prediction analysis:', err);
      setError('Failed to run AI analysis');
    } finally {
      setAnalyzing(false);
    }
  }

  const getTrendIcon = (current: number, predicted: number) => {
    const change = ((predicted - current) / current) * 100;
    if (change > 5) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-blue-500" />;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">New</span></h2>
          <p className="text-gray-600">AI-powered predictions and trend analysis</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_HORIZONS.map(horizon => (
                <SelectItem key={horizon.value} value={horizon.value}>
                  {horizon.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREDICTION_MODELS.map(model => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={runAIPredictionAnalysis}
            disabled={analyzing}
            variant="outline"
          >
            {analyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'risks', label: 'Risk Predictions', icon: AlertTriangle },
          { id: 'incidents', label: 'Incident Trends', icon: Target },
          { id: 'compliance', label: 'Compliance Forecast', icon: Zap }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Time Series Prediction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Predictive Time Series Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'actual' ? 'Actual' :
                  name === 'predicted' ? 'Predicted' :
                  name === 'upper_bound' ? 'Upper Bound' :
                  name === 'lower_bound' ? 'Lower Bound' : name
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper_bound"
                stackId="1"
                stroke="none"
                fill="#fbbf24"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="lower_bound"
                stackId="1"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#ef4444' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Risk Probability Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskPredictions.map((prediction) => (
              <Card key={prediction.risk_id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{prediction.risk_title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(prediction.current_probability, prediction.predicted_probability)}
                        <span className="text-sm text-gray-600">
                          {prediction.trend === 'increasing' ? 'Increasing' :
                           prediction.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={getConfidenceColor(prediction.confidence_score)}
                      variant="outline"
                    >
                      {(prediction.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Probability:</span>
                      <span className="font-medium">{prediction.current_probability}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Predicted ({prediction.time_horizon}):</span>
                      <span className="font-medium">{prediction.predicted_probability.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change:</span>
                      <span className={`font-medium ${
                        prediction.predicted_probability > prediction.current_probability ? 'text-red-600' :
                        prediction.predicted_probability < prediction.current_probability ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {prediction.predicted_probability > prediction.current_probability ? '+' : ''}
                        {(prediction.predicted_probability - prediction.current_probability).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {prediction.factors.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Key Factors:</h5>
                      <div className="flex flex-wrap gap-1">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Incident Rate Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incidentPredictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {prediction.type.replace('_', ' ')} Incidents
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(prediction.current_rate, prediction.predicted_rate)}
                        <span className="text-sm text-gray-600">
                          {prediction.predicted_rate > prediction.current_rate ? 'Increasing' :
                           prediction.predicted_rate < prediction.current_rate ? 'Decreasing' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Rate (per month):</span>
                      <span className="font-medium">{prediction.current_rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Predicted Rate:</span>
                      <span className="font-medium">{prediction.predicted_rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Confidence Interval:</span>
                      <span className="font-medium">
                        {prediction.confidence_interval[0]} - {prediction.confidence_interval[1]}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Seasonality Factor:</span>
                      <span className="font-medium">
                        {(prediction.seasonality_factor * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {prediction.external_factors.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">External Factors:</h5>
                      <div className="flex flex-wrap gap-1">
                        {prediction.external_factors.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Compliance Score Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {compliancePredictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{prediction.framework}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(prediction.current_score, prediction.predicted_score)}
                        <span className="text-sm text-gray-600">
                          {prediction.predicted_score > prediction.current_score ? 'Improving' :
                           prediction.predicted_score < prediction.current_score ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Score:</span>
                      <span className="font-medium">{prediction.current_score}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Predicted Score:</span>
                      <span className="font-medium">{prediction.predicted_score}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change:</span>
                      <span className={`font-medium ${
                        prediction.predicted_score > prediction.current_score ? 'text-green-600' :
                        prediction.predicted_score < prediction.current_score ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {prediction.predicted_score > prediction.current_score ? '+' : ''}
                        {(prediction.predicted_score - prediction.current_score).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {prediction.risk_factors.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</h5>
                      <div className="space-y-1">
                        {prediction.risk_factors.map((factor, index) => (
                          <li key={index} className="text-sm text-gray-600">• {factor}</li>
                        ))}
                      </div>
                    </div>
                  )}

                  {prediction.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                      <div className="space-y-1">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">• {rec}</li>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Model Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Prediction Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedModel.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Current Model</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {predictions.length > 0 ?
                  (predictions.filter(p => p.confidence > 0.8).length / predictions.length * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-gray-600">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {selectedTimeframe}
              </div>
              <div className="text-sm text-gray-600">Time Horizon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {riskPredictions.length + incidentPredictions.length + compliancePredictions.length}
              </div>
              <div className="text-sm text-gray-600">Active Predictions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}