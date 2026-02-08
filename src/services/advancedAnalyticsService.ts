import { supabase } from "../lib/supabase";
import { withErrorHandling } from "../lib/errorHandler";

export type UUID = string;

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  confidence: number;
  period: string;
  dataPoints: AnalyticsDataPoint[];
}

export interface PredictiveModel {
  id: UUID;
  name: string;
  type: 'linear' | 'exponential' | 'seasonal' | 'ml';
  accuracy: number;
  lastTrained: string;
  predictions: AnalyticsDataPoint[];
}

export interface BenchmarkData {
  entityId: UUID;
  entityName: string;
  metric: string;
  value: number;
  benchmark: number;
  percentile: number;
  industryAverage?: number;
}

export interface CustomReportConfig {
  id: UUID;
  name: string;
  description?: string;
  dataSources: string[];
  filters: Record<string, any>;
  aggregations: string[];
  visualizations: string[];
  createdBy: UUID;
  createdAt: string;
}

const advancedAnalyticsService = {
  // Data Aggregation Functions
  async aggregateRiskData(
    startDate: string,
    endDate: string,
    groupBy: 'category' | 'level' | 'status' | 'month' = 'month'
  ): Promise<AnalyticsDataPoint[] | null> {
    return withErrorHandling(async () => {
      let query = supabase
        .from('risks')
        .select('created_at, category, risk_level, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data, error } = await query;
      if (error) throw error;

      // Group and aggregate data
      const aggregated = new Map<string, number>();

      for (const risk of data || []) {
        let key: string;
        if (groupBy === 'month') {
          key = new Date(risk.created_at).toISOString().substring(0, 7);
        } else if (groupBy === 'category') {
          key = risk.category || 'unknown';
        } else if (groupBy === 'level') {
          key = risk.risk_level || 'unknown';
        } else if (groupBy === 'status') {
          key = risk.status || 'unknown';
        } else {
          key = 'unknown';
        }

        aggregated.set(key, (aggregated.get(key) || 0) + 1);
      }

      return Array.from(aggregated.entries()).map(([category, value]) => ({
        date: groupBy === 'month' ? category + '-01' : new Date().toISOString(),
        value,
        category,
      }));
    }, 'Aggregate risk data')!;
  },

  async aggregateControlData(
    startDate: string,
    endDate: string,
    groupBy: 'type' | 'effectiveness' | 'process_area' = 'type'
  ): Promise<AnalyticsDataPoint[]> {
    try {
      const { data, error } = await supabase
        .from('controls')
        .select('created_at, control_type, effectiveness, process_area')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const aggregated = new Map<string, number>();

      for (const control of data || []) {
        let key: string;
        if (groupBy === 'type') {
          key = control.control_type || 'unknown';
        } else if (groupBy === 'effectiveness') {
          key = control.effectiveness || 'unknown';
        } else if (groupBy === 'process_area') {
          key = control.process_area || 'unknown';
        } else {
          key = 'unknown';
        }
        aggregated.set(key, (aggregated.get(key) || 0) + 1);
      }

      return Array.from(aggregated.entries()).map(([category, value]) => ({
        date: new Date().toISOString(),
        value,
        category,
      }));
    } catch (error) {
      console.error('Error aggregating control data:', error);
      return [];
    }
  },

  async aggregateComplianceData(
    startDate: string,
    endDate: string
  ): Promise<AnalyticsDataPoint[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('assessment_date, compliance_score, framework_id')
        .gte('assessment_date', startDate)
        .lte('assessment_date', endDate);

      if (error) throw error;

      const aggregated = new Map<string, { total: number; count: number }>();

      for (const assessment of data || []) {
        const date = new Date(assessment.assessment_date).toISOString().substring(0, 10);
        const existing = aggregated.get(date) || { total: 0, count: 0 };
        existing.total += assessment.compliance_score || 0;
        existing.count += 1;
        aggregated.set(date, existing);
      }

      return Array.from(aggregated.entries()).map(([date, data]) => ({
        date,
        value: data.count > 0 ? data.total / data.count : 0,
        category: 'compliance_score',
      }));
    } catch (error) {
      console.error('Error aggregating compliance data:', error);
      return [];
    }
  },

  // Trend Analysis
  async analyzeTrends(
    dataPoints: AnalyticsDataPoint[],
    period: string = 'monthly'
  ): Promise<TrendAnalysis> {
    try {
      if (dataPoints.length < 2) {
        return {
          trend: 'stable',
          slope: 0,
          confidence: 0,
          period,
          dataPoints,
        };
      }

      // Simple linear regression for trend analysis
      const n = dataPoints.length;
      const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
      const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
      const sumXY = dataPoints.reduce((sum, point, i) => sum + i * point.value, 0);
      const sumXX = dataPoints.reduce((sum, _, i) => sum + i * i, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Calculate R-squared for confidence
      const yMean = sumY / n;
      const ssRes = dataPoints.reduce((sum, point, i) => {
        const predicted = slope * i + intercept;
        return sum + Math.pow(point.value - predicted, 2);
      }, 0);
      const ssTot = dataPoints.reduce((sum, point) => sum + Math.pow(point.value - yMean, 2), 0);
      const rSquared = 1 - (ssRes / ssTot);

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (Math.abs(slope) > 0.1) {
        trend = slope > 0 ? 'increasing' : 'decreasing';
      }

      return {
        trend,
        slope,
        confidence: rSquared,
        period,
        dataPoints,
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return {
        trend: 'stable',
        slope: 0,
        confidence: 0,
        period,
        dataPoints: [],
      };
    }
  },

  // Predictive Analytics
  async generatePredictions(
    historicalData: AnalyticsDataPoint[],
    periods: number = 6,
    modelType: 'linear' | 'exponential' = 'linear'
  ): Promise<PredictiveModel> {
    try {
      const modelId = crypto.randomUUID();

      if (historicalData.length < 3) {
        return {
          id: modelId,
          name: `Prediction Model ${modelType}`,
          type: modelType,
          accuracy: 0,
          lastTrained: new Date().toISOString(),
          predictions: [],
        };
      }

      // Simple linear prediction for now
      const predictions: AnalyticsDataPoint[] = [];
      const lastValue = historicalData[historicalData.length - 1].value;
      const trend = historicalData.length > 1
        ? (lastValue - historicalData[0].value) / historicalData.length
        : 0;

      for (let i = 1; i <= periods; i++) {
        const predictedValue = Math.max(0, lastValue + trend * i);
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + i);

        predictions.push({
          date: nextDate.toISOString().substring(0, 10),
          value: predictedValue,
          category: 'prediction',
        });
      }

      return {
        id: modelId,
        name: `Prediction Model ${modelType}`,
        type: modelType,
        accuracy: 0.75, // Placeholder accuracy
        lastTrained: new Date().toISOString(),
        predictions,
      };
    } catch (error) {
      console.error('Error generating predictions:', error);
      return {
        id: crypto.randomUUID(),
        name: 'Prediction Model',
        type: modelType,
        accuracy: 0,
        lastTrained: new Date().toISOString(),
        predictions: [],
      };
    }
  },

  // Benchmarking
  async getBenchmarks(
    entityType: 'risk' | 'control' | 'compliance',
    metric: string,
    entityIds?: UUID[]
  ): Promise<BenchmarkData[]> {
    try {
      // This would typically fetch from a benchmarks table or external API
      // For now, return mock data
      const mockBenchmarks: BenchmarkData[] = [
        {
          entityId: 'mock-entity-1',
          entityName: 'Sample Entity',
          metric,
          value: 85,
          benchmark: 80,
          percentile: 75,
          industryAverage: 78,
        },
      ];

      return mockBenchmarks;
    } catch (error) {
      console.error('Error getting benchmarks:', error);
      return [];
    }
  },

  // Custom Report Generation
  async generateCustomReport(config: CustomReportConfig): Promise<any> {
    try {
      // This would implement custom report generation logic
      // For now, return a basic structure
      return {
        id: config.id,
        name: config.name,
        generatedAt: new Date().toISOString(),
        data: {},
        visualizations: [],
      };
    } catch (error) {
      console.error('Error generating custom report:', error);
      return null;
    }
  },

  // Risk Heatmap Data
  async getRiskHeatmapData(
    startDate: string,
    endDate: string
  ): Promise<Array<{ x: number; y: number; value: number; riskId: UUID; title: string }>> {
    try {
      const { data, error } = await supabase
        .from('risks')
        .select('id, title, probability, impact, risk_level')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      return (data || []).map(risk => ({
        x: risk.probability || 3,
        y: risk.impact || 3,
        value: (risk.probability || 3) * (risk.impact || 3),
        riskId: risk.id,
        title: risk.title,
      }));
    } catch (error) {
      console.error('Error getting risk heatmap data:', error);
      return [];
    }
  },

  // Performance Metrics
  async getPerformanceMetrics(
    entityType: 'risk' | 'control' | 'audit',
    timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<Record<string, number>> {
    try {
      const now = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Mock performance metrics - would be calculated from actual data
      return {
        totalEntities: 150,
        activeEntities: 120,
        completedEntities: 95,
        overdueEntities: 5,
        averageCompletionTime: 15,
        efficiency: 85,
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {};
    }
  },
};

export default advancedAnalyticsService;