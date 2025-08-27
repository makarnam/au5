import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { BarChart3, TrendingUp, Users, FileText, Clock, Target, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";
import ReportDashboardWidgets from "../../components/reports/ReportDashboardWidgets";

interface AnalyticsData {
  totalReports: number;
  totalTemplates: number;
  activeUsers: number;
  avgGenerationTime: string;
  completedReports: number;
  aiGeneratedReports: number;
  topTemplates: Array<{ name: string; usage: number; percentage: number }>;
  monthlyTrends: Array<{ month: string; reports: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
}

const ReportAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get total reports count
      const { count: totalReports, error: reportsError } = await supabase
        .from('report_instances')
        .select('*', { count: 'exact', head: true });

      if (reportsError) throw reportsError;

      // Get total templates count
      const { count: totalTemplates, error: templatesError } = await supabase
        .from('report_templates')
        .select('*', { count: 'exact', head: true });

      if (templatesError) throw templatesError;

      // Get completed reports count
      const { count: completedReports, error: completedError } = await supabase
        .from('report_instances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Get AI generated reports count
      const { count: aiGeneratedReports, error: aiError } = await supabase
        .from('report_instances')
        .select('*', { count: 'exact', head: true })
        .eq('ai_generated', true);

      if (aiError) throw aiError;

      // Get active users (users who created reports)
      const { data: activeUsersData, error: usersError } = await supabase
        .from('report_instances')
        .select('created_by')
        .not('created_by', 'is', null);

      if (usersError) throw usersError;

      const activeUsers = new Set(activeUsersData?.map(item => item.created_by) || []).size;

      // Get top templates usage
      const { data: templateUsage, error: templateUsageError } = await supabase
        .from('report_instances')
        .select('template_id, report_templates(name)')
        .not('template_id', 'is', null);

      if (templateUsageError) throw templateUsageError;

      const templateCount = templateUsage?.reduce((acc, item) => {
        const templateName = (item.report_templates as any)?.name || 'Unknown';
        acc[templateName] = (acc[templateName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topTemplates = Object.entries(templateCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, usage]) => ({
          name,
          usage,
          percentage: totalReports ? Math.round((usage / totalReports) * 100) : 0
        }));

      // Get monthly trends for the last 6 months
      const monthlyTrends = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const { count: monthlyCount } = await supabase
          .from('report_instances')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString());

        monthlyTrends.push({
          month: date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
          reports: monthlyCount || 0
        });
      }

      // Get status distribution
      const { data: statusData, error: statusError } = await supabase
        .from('report_instances')
        .select('status');

      if (statusError) throw statusError;

      const statusCount = statusData?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const statusDistribution = Object.entries(statusCount)
        .map(([status, count]) => ({
          status,
          count,
          percentage: totalReports ? Math.round((count / totalReports) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate average generation time (mock for now - would need actual timing data)
      const avgGenerationTime = "2.4 dk";

      const analytics: AnalyticsData = {
        totalReports: totalReports || 0,
        totalTemplates: totalTemplates || 0,
        activeUsers,
        avgGenerationTime,
        completedReports: completedReports || 0,
        aiGeneratedReports: aiGeneratedReports || 0,
        topTemplates,
        monthlyTrends,
        statusDistribution
      };

      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError(error instanceof Error ? error.message : 'Analytics verileri yüklenirken hata oluştu');
      toast.error('Analytics verileri yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Report Analytics</h1>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Interactive Dashboard Widgets */}
      <ReportDashboardWidgets refreshInterval={60000} />

      {/* Detailed Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detailed Analytics</h2>
            <p className="text-gray-600 mt-2">
              In-depth insights into report generation and usage patterns
            </p>
          </div>
          <Button variant="outline" onClick={loadAnalyticsData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Report Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.statusDistribution.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="capitalize">
                    {status.status === 'draft' ? 'Taslak' :
                     status.status === 'completed' ? 'Tamamlandı' :
                     status.status === 'processing' ? 'İşleniyor' :
                     status.status === 'failed' ? 'Başarısız' : status.status}
                  </Badge>
                  <span className="font-medium">{status.count} reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.status === 'completed' ? 'bg-green-600' :
                        status.status === 'processing' ? 'bg-blue-600' :
                        status.status === 'failed' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {status.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Most Used Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topTemplates.map((template, index) => (
              <div key={template.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{template.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${template.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {template.usage}
                  </span>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {template.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Monthly Report Generation Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            {analyticsData.monthlyTrends.map((trend) => (
              <div key={trend.month} className="flex flex-col items-center">
                <div
                  className="bg-blue-600 w-16 rounded-t"
                  style={{ height: `${trend.reports * 8}px` }}
                />
                <span className="text-sm font-medium mt-2">{trend.month}</span>
                <span className="text-xs text-gray-500">{trend.reports} reports</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
};

export default ReportAnalyticsPage;