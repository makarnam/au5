import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Database,
  FileText,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Target,
  Zap,
  Eye,
  Lock,
  Globe,
  Code,
  Cpu,
  Network,
  HardDrive,
  Monitor,
  AlertCircle,
  Info,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { aiGovernanceService } from '../../services/aiGovernanceService';
import { AIGovernanceMetrics } from '../../types/aiGovernance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'model_created' | 'assessment_completed' | 'incident_reported' | 'control_implemented';
  title: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const AIGovernanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AIGovernanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await aiGovernanceService.getAIGovernanceMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for charts
  const modelTypeData: ChartData[] = [
    { name: 'LLM', value: 45, color: '#3B82F6' },
    { name: 'ML', value: 30, color: '#10B981' },
    { name: 'NLP', value: 15, color: '#F59E0B' },
    { name: 'Computer Vision', value: 10, color: '#EF4444' }
  ];

  const riskDistributionData: ChartData[] = [
    { name: 'Low Risk', value: 60, color: '#10B981' },
    { name: 'Medium Risk', value: 25, color: '#F59E0B' },
    { name: 'High Risk', value: 12, color: '#F97316' },
    { name: 'Critical Risk', value: 3, color: '#EF4444' }
  ];

  const complianceTrendData = [
    { month: 'Jan', compliant: 85, non_compliant: 15 },
    { month: 'Feb', compliant: 88, non_compliant: 12 },
    { month: 'Mar', compliant: 92, non_compliant: 8 },
    { month: 'Apr', compliant: 89, non_compliant: 11 },
    { month: 'May', compliant: 95, non_compliant: 5 },
    { month: 'Jun', compliant: 91, non_compliant: 9 }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'model_created',
      title: 'New AI Model Registered',
      description: 'GPT-4 model added to production environment',
      timestamp: '2024-01-15T10:30:00Z',
      severity: 'medium'
    },
    {
      id: '2',
      type: 'assessment_completed',
      title: 'Risk Assessment Completed',
      description: 'Privacy risk assessment for customer data model',
      timestamp: '2024-01-15T09:15:00Z',
      severity: 'low'
    },
    {
      id: '3',
      type: 'incident_reported',
      title: 'AI Incident Reported',
      description: 'Bias detection in recommendation algorithm',
      timestamp: '2024-01-15T08:45:00Z',
      severity: 'high'
    },
    {
      id: '4',
      type: 'control_implemented',
      title: 'New Control Implemented',
      description: 'Automated bias monitoring control activated',
      timestamp: '2024-01-15T07:30:00Z',
      severity: 'low'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'model_created': return <Brain className="h-4 w-4" />;
      case 'assessment_completed': return <CheckCircle className="h-4 w-4" />;
      case 'incident_reported': return <AlertTriangle className="h-4 w-4" />;
      case 'control_implemented': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Governance Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive oversight and management of AI systems, controls, and compliance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Models</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_models || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Controls</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.implemented_controls || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.open_incidents || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_models ? Math.round((metrics.compliant_models / metrics.total_models) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current risk levels across AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${item.value}%`, 
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common governance tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/ai-governance/models/create">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Register New Model
              </Button>
            </Link>
            <Link to="/ai-governance/assessments/create">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Start Risk Assessment
              </Button>
            </Link>
            <Link to="/ai-governance/incidents/create">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </Link>
            <Link to="/ai-governance/controls/create">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Create Control
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Types Chart */}
            <Card>
              <CardHeader>
                <CardTitle>AI Model Types</CardTitle>
                <CardDescription>Distribution by model type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelTypeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.value} models</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest governance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getRiskLevelColor(activity.severity || 'low')}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">AI Models Management</h2>
              <p className="text-gray-600">Manage and monitor AI models across the organization</p>
            </div>
            <Link to="/ai-governance/models">
              <Button>
                View All Models
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Active Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{metrics?.active_models || 0}</div>
                <p className="text-sm text-gray-600">Currently deployed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  High Risk Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{metrics?.high_risk_models || 0}</div>
                <p className="text-sm text-gray-600">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Critical Risk Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{metrics?.critical_risk_models || 0}</div>
                <p className="text-sm text-gray-600">Immediate action needed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">AI Controls Library</h2>
              <p className="text-gray-600">Manage controls and their implementation status</p>
            </div>
            <Link to="/ai-governance/controls">
              <Button>
                View All Controls
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Total Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{metrics?.total_controls || 0}</div>
                <p className="text-sm text-gray-600">Available controls</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Implemented Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{metrics?.implemented_controls || 0}</div>
                <p className="text-sm text-gray-600">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Effective Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{metrics?.effective_controls || 0}</div>
                <p className="text-sm text-gray-600">Proven effective</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Compliance Overview</h2>
              <p className="text-gray-600">Track compliance with AI regulations and frameworks</p>
            </div>
            <Link to="/ai-governance/compliance">
              <Button>
                View Compliance Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Compliant Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{metrics?.compliant_models || 0}</div>
                <p className="text-sm text-gray-600">Meet requirements</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Non-Compliant Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{metrics?.non_compliant_models || 0}</div>
                <p className="text-sm text-gray-600">Need remediation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Pending Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{metrics?.pending_assessments || 0}</div>
                <p className="text-sm text-gray-600">Awaiting review</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Incident Management</h2>
              <p className="text-gray-600">Track and manage AI-related incidents</p>
            </div>
            <Link to="/ai-governance/incidents">
              <Button>
                View All Incidents
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Total Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{metrics?.total_incidents || 0}</div>
                <p className="text-sm text-gray-600">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Open Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{metrics?.open_incidents || 0}</div>
                <p className="text-sm text-gray-600">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Resolved Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{metrics?.resolved_incidents || 0}</div>
                <p className="text-sm text-gray-600">Successfully closed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/ai-governance/models">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Manage AI model inventory and lifecycle</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/ai-governance/controls">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Controls Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Access and manage AI governance controls</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/ai-governance/assessments">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Risk Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Conduct and track risk assessments</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/ai-governance/compliance">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Monitor regulatory compliance</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AIGovernanceDashboard;
