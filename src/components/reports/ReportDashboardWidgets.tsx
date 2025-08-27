import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Download,
  Eye,
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

interface KPICard {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
}

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface ReportDashboardWidgetsProps {
  dateRange?: {
    start: Date;
    end: Date;
  };
  refreshInterval?: number; // in milliseconds
}

const ReportDashboardWidgets: React.FC<ReportDashboardWidgetsProps> = ({
  dateRange,
  refreshInterval = 30000
}) => {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get date range for filtering
      const now = new Date();
      const startDate = dateRange?.start || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.end || now;

      // Fetch KPI data using optimized database views/functions
      const [kpiData, reportTypeData, recentActivitiesData] = await Promise.all([
        getDashboardKPIs(),
        getReportTypeAnalysis(),
        getRecentActivities(),
      ]);

      // Transform KPI data
      const transformedKPIs: KPICard[] = [
        {
           title: t("reports.dashboard.totalReports"),
           value: kpiData.totalReports,
           change: kpiData.totalReportsChange,
           trend: kpiData.totalReportsChange > 0 ? 'up' : kpiData.totalReportsChange < 0 ? 'down' : 'stable',
           icon: FileText,
           color: "bg-blue-500",
           description: t("reports.dashboard.totalReportsDesc")
        },
        {
           title: t("reports.dashboard.reportsThisMonth"),
           value: kpiData.reportsThisMonth,
           change: kpiData.reportsThisMonthChange,
           trend: kpiData.reportsThisMonthChange > 0 ? 'up' : kpiData.reportsThisMonthChange < 0 ? 'down' : 'stable',
           icon: Calendar,
           color: "bg-green-500",
           description: t("reports.dashboard.reportsThisMonthDesc")
        },
        {
           title: t("reports.dashboard.activeUsers"),
           value: kpiData.activeUsers,
           change: kpiData.activeUsersChange,
           trend: kpiData.activeUsersChange > 0 ? 'up' : kpiData.activeUsersChange < 0 ? 'down' : 'stable',
           icon: Users,
           color: "bg-purple-500",
           description: t("reports.dashboard.activeUsersDesc")
        },
        {
           title: t("reports.dashboard.scheduledReports"),
           value: kpiData.scheduledReports,
           change: kpiData.scheduledReportsChange,
           trend: kpiData.scheduledReportsChange > 0 ? 'up' : kpiData.scheduledReportsChange < 0 ? 'down' : 'stable',
           icon: Clock,
           color: "bg-orange-500",
           description: t("reports.dashboard.scheduledReportsDesc")
        },
        {
           title: t("reports.dashboard.averageTime"),
           value: `${kpiData.averageGenerationTime}sn`,
           change: kpiData.averageGenerationTimeChange,
           trend: kpiData.averageGenerationTimeChange < 0 ? 'up' : kpiData.averageGenerationTimeChange > 0 ? 'down' : 'stable',
           icon: Zap,
           color: "bg-red-500",
           description: t("reports.dashboard.averageTimeDesc")
        },
        {
           title: t("reports.dashboard.popularType"),
           value: reportTypeData.type,
           icon: Target,
           color: "bg-indigo-500",
           description: t("reports.dashboard.popularTypeDesc")
        }
      ];

      setKpis(transformedKPIs);
      setChartData(reportTypeData.chartData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(t("reports.dashboard.errorLoading"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh
    const interval = setInterval(loadDashboardData, refreshInterval);

    return () => clearInterval(interval);
  }, [dateRange, refreshInterval]);

  const KPICardComponent: React.FC<{ kpi: KPICard }> = ({ kpi }) => {
    const Icon = kpi.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-2 rounded-lg ${kpi.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                  {kpi.change !== undefined && (
                    <div className={`flex items-center space-x-1 ${
                      kpi.trend === 'up' ? 'text-green-600' :
                      kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : kpi.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(kpi.change)}%
                      </span>
                    </div>
                  )}
                </div>
                {kpi.description && (
                  <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          {t("reports.dashboard.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            onClick={() => window.location.href = '/reports/wizard'}
          >
            <FileText className="w-6 h-6 text-blue-500 mb-2" />
            <div className="font-medium text-gray-900">{t("reports.dashboard.newReport")}</div>
            <div className="text-sm text-gray-500">{t("reports.dashboard.newReportDesc")}</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
            onClick={() => window.location.href = '/reports/scheduled'}
          >
            <Clock className="w-6 h-6 text-green-500 mb-2" />
            <div className="font-medium text-gray-900">{t("reports.dashboard.scheduling")}</div>
            <div className="text-sm text-gray-500">{t("reports.dashboard.schedulingDesc")}</div>
          </motion.button>
        </div>
      </CardContent>
    </Card>
  );

  const RecentActivity = () => {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
      const loadRecentActivities = async () => {
        const activitiesData = await getRecentActivities();
        setActivities(activitiesData);
      };

      loadRecentActivities();
    }, []);

    const formatTimeAgo = (timestamp: string) => {
      const now = new Date();
      const time = new Date(timestamp);
      const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
      if (diffInSeconds < 60) return t('date.today');
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
      return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              {t("reports.dashboard.recentActivity")}
            </span>
            <Badge variant="outline" className="text-xs">
              {t("reports.dashboard.last24Hours")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.length > 0 ? activities.map(activity => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className={`flex items-center space-x-3 p-3 rounded-lg ${activity.bgColor}`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                    <div className="text-xs text-gray-500">{activity.subtitle} • {formatTimeAgo(activity.timestamp)}</div>
                  </div>
                  <IconComponent className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
              );
            }) : (
              <div className="text-center py-4 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("reports.dashboard.noActivity")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("reports.dashboard.title")}</h2>
          <p className="text-gray-600">{t("reports.dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{t("reports.dashboard.lastUpdate")}: {lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={loadDashboardData}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <Activity className="w-4 h-4" />
            <span>{t("reports.dashboard.refresh")}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, index) => (
          <KPICardComponent key={index} kpi={kpi} />
        ))}
      </div>

      {/* Secondary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
};

// Helper functions using optimized database views and functions
const getDashboardKPIs = async () => {
  try {
    // Use the optimized dashboard_kpi_metrics view
    const { data: kpiData, error } = await supabase
      .from('dashboard_kpi_metrics')
      .select('*')
      .single();

    if (error) throw error;

    return {
      totalReports: kpiData.total_reports,
      totalReportsChange: kpiData.total_reports_change,
      reportsThisMonth: kpiData.total_reports, // Current month count
      reportsThisMonthChange: kpiData.total_reports_change,
      topReportType: 'General', // Will be updated with report type analysis
      averageGenerationTime: kpiData.avg_generation_time_seconds,
      averageGenerationTimeChange: kpiData.generation_time_change,
      activeUsers: kpiData.active_users,
      activeUsersChange: kpiData.active_users_change,
      scheduledReports: kpiData.active_schedules,
      scheduledReportsChange: kpiData.schedules_change,
      aiGeneratedReports: kpiData.ai_generated_reports,
      aiGeneratedReportsChange: kpiData.ai_generated_change
    };
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    // Fallback to individual queries if view doesn't exist
    const [
      totalReports,
      reportsThisMonth,
      averageGenerationTime,
      activeUsers,
      scheduledReports
    ] = await Promise.all([
      getTotalReports(),
      getReportsThisMonth(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      getAverageGenerationTime(),
      getActiveUsers(),
      getScheduledReports()
    ]);

    return {
      totalReports: totalReports.total,
      totalReportsChange: totalReports.change,
      reportsThisMonth: reportsThisMonth.count,
      reportsThisMonthChange: reportsThisMonth.change,
      topReportType: 'General',
      averageGenerationTime: averageGenerationTime.time,
      averageGenerationTimeChange: averageGenerationTime.change,
      activeUsers: activeUsers.count,
      activeUsersChange: activeUsers.change,
      scheduledReports: scheduledReports.count,
      scheduledReportsChange: scheduledReports.change,
      aiGeneratedReports: 0,
      aiGeneratedReportsChange: 0
    };
  }
};

const getReportTypeAnalysis = async () => {
  try {
    // Use the optimized report_type_analysis view
    const { data: reportTypes, error } = await supabase
      .from('report_type_analysis')
      .select('*')
      .order('count', { ascending: false })
      .limit(4);

    if (error) throw error;

    // Convert to chart data format
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

    const chartData = reportTypes?.map((type, index) => ({
      name: type.report_type,
      value: type.count,
      fill: colors[index % colors.length]
    })) || [];

    const topType = reportTypes?.[0]?.report_type || 'General';

    return {
      type: topType,
      chartData
    };
  } catch (error) {
    console.error('Error fetching report type analysis:', error);
    // Fallback to basic analysis
    return {
      type: "General",
      chartData: [
        { name: "General", value: 50, fill: "#6B7280" },
        { name: "Audit", value: 25, fill: "#3B82F6" },
        { name: "Compliance", value: 15, fill: "#10B981" },
        { name: "Risk", value: 10, fill: "#F59E0B" }
      ]
    };
  }
};

const getRecentActivities = async () => {
  try {
    // Use the optimized recent_activities view
    const { data: activities, error } = await supabase
      .from('recent_activities')
      .select('*')
      .limit(5);

    if (error) throw error;

    return activities?.map(activity => ({
      id: activity.activity_id,
      type: activity.activity_type,
      title: activity.title,
      subtitle: activity.subtitle,
      timestamp: activity.activity_timestamp,
      icon: activity.metadata === 'ai_generated' ? Sparkles :
            activity.activity_type === 'template_created' ? FileText :
            activity.activity_type === 'schedule_created' ? Clock : FileText,
      iconColor: activity.metadata === 'ai_generated' ? 'text-purple-500' :
                 activity.activity_type === 'template_created' ? 'text-green-500' :
                 activity.activity_type === 'schedule_created' ? 'text-orange-500' : 'text-blue-500',
      bgColor: activity.metadata === 'ai_generated' ? 'bg-purple-50' :
               activity.activity_type === 'template_created' ? 'bg-green-50' :
               activity.activity_type === 'schedule_created' ? 'bg-orange-50' : 'bg-blue-50'
    })) || [];
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    // Return empty array as fallback
    return [];
  }
};

// Fallback functions (used if optimized views don't exist)
const getTotalReports = async () => {
  const { count } = await supabase
    .from('report_instances')
    .select('*', { count: 'exact', head: true });
  return { total: count || 0, change: 0 };
};

const getReportsThisMonth = async (startDate: Date, endDate: Date) => {
  const { count } = await supabase
    .from('report_instances')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
  return { count: count || 0, change: 0 };
};

const getAverageGenerationTime = async () => {
  const { data: reports } = await supabase
    .from('report_instances')
    .select('created_at, updated_at')
    .eq('status', 'completed')
    .not('updated_at', 'is', null)
    .limit(50);

  if (!reports || reports.length === 0) {
    return { time: 0, change: 0 };
  }

  const avgTime = reports.reduce((sum, report) => {
    const created = new Date(report.created_at).getTime();
    const updated = new Date(report.updated_at!).getTime();
    return sum + Math.max(0, (updated - created) / 1000);
  }, 0) / reports.length;

  return { time: Math.round(avgTime), change: 0 };
};

const getActiveUsers = async () => {
  const { data: users } = await supabase
    .from('report_instances')
    .select('created_by')
    .not('created_by', 'is', null);

  const uniqueUsers = new Set(users?.map(r => r.created_by) || []);
  return { count: uniqueUsers.size, change: 0 };
};

const getScheduledReports = async () => {
  const { count } = await supabase
    .from('report_schedules')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  return { count: count || 0, change: 0 };
};

export default ReportDashboardWidgets;