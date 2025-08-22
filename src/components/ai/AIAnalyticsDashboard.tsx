import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  Target, 
  Users, 
  FileText,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIAnalyticsData {
  totalGenerations: number;
  successRate: number;
  averageQuality: number;
  averageGenerationTime: number;
  topModules: Array<{ module: string; count: number }>;
  topFieldTypes: Array<{ fieldType: string; count: number }>;
  qualityTrends: Array<{ date: string; averageQuality: number }>;
  usageByUser: Array<{ userId: string; userName: string; count: number }>;
  providerUsage: Array<{ provider: string; count: number }>;
  templateUsage: Array<{ template: string; count: number }>;
}

interface AnalyticsFilters {
  dateRange: string;
  module: string;
  fieldType: string;
  provider: string;
  user: string;
}

const AIAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AIAnalyticsData | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30d',
    module: 'all',
    fieldType: 'all',
    provider: 'all',
    user: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: analytics, error: analyticsError } = await supabase
        .from('ai_analytics')
        .select('*')
        .gte('created_at', getDateRangeFilter(filters.dateRange));

      if (analyticsError) throw analyticsError;

      const { data: qualityRatings, error: qualityError } = await supabase
        .from('ai_quality_ratings')
        .select('*')
        .gte('created_at', getDateRangeFilter(filters.dateRange));

      if (qualityError) throw qualityError;

      const processedData = processAnalyticsData(analytics, qualityRatings);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRangeFilter = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const processAnalyticsData = (analytics: any[], qualityRatings: any[]): AIAnalyticsData => {
    const totalGenerations = analytics.length;
    const successfulGenerations = analytics.filter(a => a.success).length;
    const successRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0;
    
    const averageQuality = qualityRatings.length > 0 
      ? qualityRatings.reduce((sum, q) => sum + (q.overall_rating || 0), 0) / qualityRatings.length 
      : 0;
    
    const averageGenerationTime = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.generation_time_ms || 0), 0) / analytics.length
      : 0;

    // Process module usage
    const moduleCounts = analytics.reduce((acc, a) => {
      acc[a.module] = (acc[a.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topModules = Object.entries(moduleCounts)
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Process field type usage
    const fieldTypeCounts = analytics.reduce((acc, a) => {
      acc[a.field_type] = (acc[a.field_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topFieldTypes = Object.entries(fieldTypeCounts)
      .map(([fieldType, count]) => ({ fieldType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Process quality trends (last 7 days)
    const qualityTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRatings = qualityRatings.filter(q => 
        q.created_at.startsWith(dateStr)
      );
      
      const avgQuality = dayRatings.length > 0
        ? dayRatings.reduce((sum, q) => sum + (q.overall_rating || 0), 0) / dayRatings.length
        : 0;
      
      qualityTrends.push({ date: dateStr, averageQuality: avgQuality });
    }

    // Process provider usage
    const providerCounts = analytics.reduce((acc, a) => {
      acc[a.provider] = (acc[a.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const providerUsage = Object.entries(providerCounts)
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count);

    // Process template usage
    const templateCounts = analytics.reduce((acc, a) => {
      if (a.template_used) {
        acc[a.template_used] = (acc[a.template_used] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const templateUsage = Object.entries(templateCounts)
      .map(([template, count]) => ({ template, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalGenerations,
      successRate,
      averageQuality,
      averageGenerationTime,
      topModules,
      topFieldTypes,
      qualityTrends,
      usageByUser: [], // Would need user data to populate
      providerUsage,
      templateUsage
    };
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className={`h-3 w-3 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert>
        <AlertDescription>No analytics data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics for AI generation usage and quality</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadAnalyticsData}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Generations"
              value={analyticsData.totalGenerations.toLocaleString()}
              subtitle="AI content generations"
              icon={Zap}
            />
            <StatCard
              title="Success Rate"
              value={`${analyticsData.successRate.toFixed(1)}%`}
              subtitle="Successful generations"
              icon={Target}
            />
            <StatCard
              title="Average Quality"
              value={analyticsData.averageQuality.toFixed(2)}
              subtitle="Out of 5.0 rating"
              icon={Star}
            />
            <StatCard
              title="Avg Generation Time"
              value={`${(analyticsData.averageGenerationTime / 1000).toFixed(1)}s`}
              subtitle="Response time"
              icon={Clock}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topModules.map((module, index) => (
                    <div key={module.module} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{module.module}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{module.count} generations</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Top Field Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topFieldTypes.map((fieldType, index) => (
                    <div key={fieldType.fieldType} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{fieldType.fieldType}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{fieldType.count} uses</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Quality Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.qualityTrends.map((trend) => (
                  <div key={trend.date} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{trend.date}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(trend.averageQuality / 5) * 100} className="w-32" />
                      <span className="text-sm">{trend.averageQuality.toFixed(2)}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Provider Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.providerUsage.map((provider) => (
                    <div key={provider.provider} className="flex items-center justify-between">
                      <span className="font-medium">{provider.provider}</span>
                      <span className="text-sm text-muted-foreground">{provider.count} uses</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Template Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.templateUsage.map((template) => (
                    <div key={template.template} className="flex items-center justify-between">
                      <span className="font-medium">{template.template}</span>
                      <span className="text-sm text-muted-foreground">{template.count} uses</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analyticsData.averageGenerationTime.toFixed(0)}ms</div>
                  <div className="text-sm text-muted-foreground">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analyticsData.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analyticsData.totalGenerations}</div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;
