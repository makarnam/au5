import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Database,
  Plus,
  Eye,
  FileText,
  BarChart3,
  Calendar,
  Target,
  Zap,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { privacyService } from "../../services/privacyService";

interface PrivacyMetrics {
  totalDpias: number;
  totalRopas: number;
  dpiasInReview: number;
  dpiasApproved: number;
  dpiasRejected: number;
  highRiskDpias: number;
  criticalRiskDpias: number;
  recentDpias: number;
  recentRopas: number;
  complianceScore: number;
}

interface RecentActivity {
  id: string;
  type: "dpia" | "ropa";
  title: string;
  status: string;
  date: string;
  riskLevel?: string;
}

export default function PrivacyDashboard() {
  const [metrics, setMetrics] = useState<PrivacyMetrics>({
    totalDpias: 0,
    totalRopas: 0,
    dpiasInReview: 0,
    dpiasApproved: 0,
    dpiasRejected: 0,
    highRiskDpias: 0,
    criticalRiskDpias: 0,
    recentDpias: 0,
    recentRopas: 0,
    complianceScore: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load DPIAs and RoPAs
      const [dpias, ropas] = await Promise.all([
        privacyService.listDPIA(),
        privacyService.listRoPA()
      ]);

      // Calculate metrics
      const dpiasInReview = dpias.filter(d => d.status === 'in_review').length;
      const dpiasApproved = dpias.filter(d => d.status === 'approved').length;
      const dpiasRejected = dpias.filter(d => d.status === 'rejected').length;
      const highRiskDpias = dpias.filter(d => d.risk_level === 'high').length;
      const criticalRiskDpias = dpias.filter(d => d.risk_level === 'critical').length;
      
      // Calculate recent activities (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentDpias = dpias.filter(d => new Date(d.created_at) > thirtyDaysAgo).length;
      const recentRopas = ropas.filter(r => new Date(r.created_at) > thirtyDaysAgo).length;

      // Calculate compliance score
      const totalAssessments = dpias.length + ropas.length;
      const completedAssessments = dpiasApproved + ropas.length; // Assuming RoPAs are always completed
      const complianceScore = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

      setMetrics({
        totalDpias: dpias.length,
        totalRopas: ropas.length,
        dpiasInReview,
        dpiasApproved,
        dpiasRejected,
        highRiskDpias,
        criticalRiskDpias,
        recentDpias,
        recentRopas,
        complianceScore,
      });

      // Create recent activities
      const allActivities: RecentActivity[] = [
        ...dpias.slice(0, 5).map(dpia => ({
          id: dpia.id,
          type: 'dpia' as const,
          title: dpia.title,
          status: dpia.status,
          date: dpia.created_at,
          riskLevel: dpia.risk_level,
        })),
        ...ropas.slice(0, 5).map(ropa => ({
          id: ropa.id,
          type: 'ropa' as const,
          title: ropa.name,
          status: 'active',
          date: ropa.created_at,
        }))
      ];

      // Sort by date and take top 8
      allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(allActivities.slice(0, 8));

    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'in_review':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    return type === 'dpia' ? <ShieldAlert className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
            Privacy Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive overview of your privacy compliance and data protection activities
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/privacy/create-dpia')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New DPIA
          </button>
          <button 
            onClick={() => navigate('/privacy/create-ropa')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New RoPA
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total DPIAs */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total DPIAs</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalDpias}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+{metrics.recentDpias}</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        {/* Total RoPAs */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RoPAs</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalRopas}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+{metrics.recentRopas}</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        {/* Compliance Score */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Score</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.complianceScore}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.complianceScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* High Risk Items */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Items</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.highRiskDpias + metrics.criticalRiskDpias}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">{metrics.criticalRiskDpias} critical</span>
            <span className="text-gray-500 ml-2">• {metrics.highRiskDpias} high</span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DPIA Status Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            DPIA Status Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.dpiasApproved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">In Review</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.dpiasInReview}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Draft</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.totalDpias - metrics.dpiasApproved - metrics.dpiasInReview - metrics.dpiasRejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{metrics.dpiasRejected}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/privacy/create-dpia')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Create New DPIA</span>
            </button>
            <button 
              onClick={() => navigate('/privacy/create-ropa')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-green-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Add RoPA Entry</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-purple-50 transition-colors">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Generate Report</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-orange-50 transition-colors">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Schedule Review</span>
            </button>
          </div>
        </div>

        {/* Compliance Insights */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            Compliance Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">GDPR Article 30</p>
                <p className="text-xs text-green-600">RoPA Compliance</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">GDPR Article 35</p>
                <p className="text-xs text-blue-600">DPIA Requirements</p>
              </div>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-800">Data Subject Rights</p>
                <p className="text-xs text-yellow-600">Processing Records</p>
              </div>
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Activities
          </h3>
        </div>
        <div className="p-6">
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {activity.type.toUpperCase()} • {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.riskLevel && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(activity.riskLevel)}`}>
                        {activity.riskLevel}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activities found</p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Compliance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Data Protection Impact Assessments</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Total Assessments</span>
              <span className="font-semibold text-blue-900">{metrics.totalDpias}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">High Risk Items</span>
              <span className="font-semibold text-orange-600">{metrics.highRiskDpias}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Critical Risk Items</span>
              <span className="font-semibold text-red-600">{metrics.criticalRiskDpias}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Approval Rate</span>
              <span className="font-semibold text-green-600">
                {metrics.totalDpias > 0 ? Math.round((metrics.dpiasApproved / metrics.totalDpias) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Records of Processing Activities</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Total Records</span>
              <span className="font-semibold text-green-900">{metrics.totalRopas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">This Month</span>
              <span className="font-semibold text-green-600">+{metrics.recentRopas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">GDPR Article 30</span>
              <span className="font-semibold text-green-600">Compliant</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Data Subject Rights</span>
              <span className="font-semibold text-green-600">Tracked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
