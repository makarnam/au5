import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  FileText,
  Shield,
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { formatNumber, formatPercentage, getChartColors } from '../utils';

interface MetricCard {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  trend: number[];
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - In real app, this would come from API
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: t('dashboard.totalAudits'),
      value: 156,
      change: 12,
      changeType: 'increase',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      trend: [45, 52, 48, 61, 70, 65, 74, 82, 95, 87, 92, 98]
    },
    {
      title: t('dashboard.activeAudits'),
      value: 23,
      change: 8,
      changeType: 'increase',
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600',
      trend: [12, 15, 18, 22, 25, 28, 24, 27, 31, 29, 26, 23]
    },
    {
      title: t('dashboard.totalFindings'),
      value: 89,
      change: -5,
      changeType: 'decrease',
      icon: Search,
      color: 'from-orange-500 to-orange-600',
      trend: [120, 115, 108, 102, 95, 98, 92, 88, 85, 91, 87, 89]
    },
    {
      title: t('dashboard.criticalFindings'),
      value: 12,
      change: -18,
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      trend: [18, 16, 15, 17, 14, 13, 15, 12, 11, 13, 10, 12]
    },
    {
      title: t('dashboard.totalControls'),
      value: 342,
      change: 6,
      changeType: 'increase',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      trend: [310, 315, 322, 328, 335, 338, 342, 340, 345, 348, 344, 342]
    },
    {
      title: t('dashboard.effectiveControls'),
      value: 298,
      change: 4,
      changeType: 'increase',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      trend: [280, 285, 288, 292, 295, 294, 296, 298, 300, 299, 297, 298]
    }
  ]);

  // Chart data
  const auditStatusData: ChartData[] = [
    { name: 'Completed', value: 65, color: '#10b981' },
    { name: 'In Progress', value: 23, color: '#f59e0b' },
    { name: 'Planning', value: 18, color: '#3b82f6' },
    { name: 'Draft', value: 12, color: '#6b7280' }
  ];

  const findingsSeverityData: ChartData[] = [
    { name: 'Low', value: 45, color: '#10b981' },
    { name: 'Medium', value: 28, color: '#f59e0b' },
    { name: 'High', value: 12, color: '#f97316' },
    { name: 'Critical', value: 4, color: '#ef4444' }
  ];

  const monthlyTrendData = [
    { month: 'Jan', audits: 12, findings: 45, controls: 280 },
    { month: 'Feb', audits: 15, findings: 38, controls: 285 },
    { month: 'Mar', audits: 18, findings: 52, controls: 290 },
    { month: 'Apr', audits: 14, findings: 41, controls: 295 },
    { month: 'May', audits: 22, findings: 35, controls: 300 },
    { month: 'Jun', audits: 19, findings: 48, controls: 305 },
    { month: 'Jul', audits: 25, findings: 42, controls: 310 },
    { month: 'Aug', audits: 21, findings: 39, controls: 315 },
    { month: 'Sep', audits: 28, findings: 33, controls: 320 },
    { month: 'Oct', audits: 24, findings: 46, controls: 325 },
    { month: 'Nov', audits: 30, findings: 29, controls: 330 },
    { month: 'Dec', audits: 23, findings: 35, controls: 342 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'audit_completed',
      title: 'IT Security Audit completed',
      description: 'Annual IT security audit has been completed with 3 findings',
      user: 'John Smith',
      timestamp: '2 hours ago',
      severity: 'success'
    },
    {
      id: 2,
      type: 'finding_created',
      title: 'Critical finding identified',
      description: 'Database access control vulnerability found',
      user: 'Sarah Johnson',
      timestamp: '4 hours ago',
      severity: 'critical'
    },
    {
      id: 3,
      type: 'control_updated',
      title: 'Control effectiveness updated',
      description: 'Password policy control marked as effective',
      user: 'Mike Davis',
      timestamp: '6 hours ago',
      severity: 'info'
    },
    {
      id: 4,
      type: 'audit_assigned',
      title: 'New audit assigned',
      description: 'Financial compliance audit assigned to your team',
      user: 'Lisa Brown',
      timestamp: '1 day ago',
      severity: 'info'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Review Financial Controls',
      dueDate: '2024-01-15',
      priority: 'high',
      assignee: 'You',
      progress: 75
    },
    {
      id: 2,
      title: 'Complete SOX Testing',
      dueDate: '2024-01-18',
      priority: 'critical',
      assignee: 'John Smith',
      progress: 45
    },
    {
      id: 3,
      title: 'Update Risk Assessment',
      dueDate: '2024-01-20',
      priority: 'medium',
      assignee: 'Sarah Johnson',
      progress: 30
    },
    {
      id: 4,
      title: 'Audit Report Review',
      dueDate: '2024-01-22',
      priority: 'medium',
      assignee: 'Mike Davis',
      progress: 80
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your audits today.
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
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
              <h3 className="text-2xl font-bold text-gray-900">
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
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
              {t('dashboard.auditsByStatus')}
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

        {/* Findings by Severity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
              {t('dashboard.findingsBySeverity')}
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={findingsSeverityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {findingsSeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
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
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
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
            </LineChart>
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
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            {t('dashboard.recentActivity')}
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
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
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-500" />
            {t('dashboard.upcomingTasks')}
          </h3>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
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
    </div>
  );
};

export default Dashboard;
