import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BusinessContinuityPlan, 
  BCMDashboardStats, 
  BCMKPIMetrics, 
  BCMPlanMetrics,
  BCMPlanStatusFilter 
} from '../../types/bcp';
import { bcpService, filterAndSortPlans } from '../../services/bcpService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Globe, 
  Shield, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Plus,
  Search,
  Filter,
  BarChart3,
  Users,
  Building2,
  Zap,
  Calendar,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

const BCPDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<BusinessContinuityPlan[]>([]);
  const [dashboardStats, setDashboardStats] = useState<BCMDashboardStats | null>(null);
  const [kpiMetrics, setKpiMetrics] = useState<BCMKPIMetrics | null>(null);
  const [planMetrics, setPlanMetrics] = useState<BCMPlanMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BCMPlanStatusFilter['status']>('all');
  const [planType, setPlanType] = useState<BCMPlanStatusFilter['plan_type']>('all');
  const [criticality, setCriticality] = useState<BCMPlanStatusFilter['criticality']>('all');
  const [approval, setApproval] = useState<BCMPlanStatusFilter['approval']>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'readiness'>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansData, statsData, kpiData] = await Promise.all([
          bcpService.getPlans(),
          bcpService.getDashboardStats(),
          bcpService.getKPIMetrics()
        ]);
        
        setPlans(plansData);
        setDashboardStats(statsData);
        setKpiMetrics(kpiData);

        // Fetch plan metrics for each plan
        const metricsPromises = plansData.map(plan => bcpService.getPlanMetrics(plan.id));
        const metrics = await Promise.all(metricsPromises);
        setPlanMetrics(metrics);
      } catch (err) {
        setError('Failed to load business continuity data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreatePlan = () => {
    navigate('/bcp/create');
  };

  const handleViewPlan = (id: string) => {
    navigate(`/bcp/${id}`);
  };

  const filteredPlans = useMemo(
    () => filterAndSortPlans(plans, { query, status, owner: '', sortBy, sortDir }),
    [plans, query, status, sortBy, sortDir]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatAvailability = (availability: number) => {
    return `${(availability * 100).toFixed(4)}%`;
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Continuity Management</h1>
          <p className="text-gray-600 mt-1">Global enterprise business continuity and IT continuity management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.total_plans}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.active_plans} active, {dashboardStats.plans_needing_review} need review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.overall_readiness_score}%</div>
              <div className="flex items-center mt-2">
                <Progress value={dashboardStats.overall_readiness_score} className="flex-1 mr-2" />
                <Badge variant={dashboardStats.compliance_status === 'compliant' ? 'default' : 'destructive'}>
                  {dashboardStats.compliance_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Recovery Times</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatHours(dashboardStats.average_rto_hours)}</div>
              <p className="text-xs text-muted-foreground">
                RTO: {formatHours(dashboardStats.average_rto_hours)} | RPO: {formatHours(dashboardStats.average_rpo_hours)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.open_incidents}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.upcoming_exercises} exercises planned
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* KPI Metrics */}
      {kpiMetrics && (
        <Tabs defaultValue="availability" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="recovery">Recovery</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Current Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatAvailability(kpiMetrics.availability_metrics.current_availability)}</div>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(kpiMetrics.availability_metrics.trend)}
                    <span className="ml-2 text-sm text-muted-foreground">
                      Target: {formatAvailability(kpiMetrics.availability_metrics.target_availability)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Uptime</span>
                      <span className="font-semibold">{formatAvailability(kpiMetrics.availability_metrics.current_availability)}</span>
                    </div>
                    <Progress value={kpiMetrics.availability_metrics.current_availability * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Global Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{plans.filter(p => p.global_region).length}</div>
                  <p className="text-sm text-muted-foreground">Regions covered</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average RTO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatHours(kpiMetrics.recovery_metrics.average_rto)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average RPO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatHours(kpiMetrics.recovery_metrics.average_rpo)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average MTTA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatHours(kpiMetrics.recovery_metrics.average_mtta)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average MTTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatHours(kpiMetrics.recovery_metrics.average_mttr)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exercises This Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiMetrics.testing_metrics.exercises_completed_this_year}</div>
                  <p className="text-sm text-muted-foreground">of {kpiMetrics.testing_metrics.exercises_planned_this_year} planned</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Last Exercise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpiMetrics.testing_metrics.last_exercise_date 
                      ? new Date(kpiMetrics.testing_metrics.last_exercise_date).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Exercise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpiMetrics.testing_metrics.next_exercise_date 
                      ? new Date(kpiMetrics.testing_metrics.next_exercise_date).toLocaleDateString()
                      : 'Not scheduled'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">High Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{kpiMetrics.risk_metrics.high_risk_items}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Medium Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{kpiMetrics.risk_metrics.medium_risk_items}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Low Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{kpiMetrics.risk_metrics.low_risk_items}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Mitigated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{kpiMetrics.risk_metrics.mitigated_risks}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{kpiMetrics.compliance_metrics.compliant_plans}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Non-Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{kpiMetrics.compliance_metrics.non_compliant_plans}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{kpiMetrics.compliance_metrics.pending_reviews}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Business Continuity Plans</CardTitle>
          <CardDescription>
            Manage and monitor your business continuity plans across all regions and business units
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plans, descriptions, owners..."
                className="pl-8"
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as any)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planType} onValueChange={(value) => setPlanType(value as any)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Plan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="business_continuity">Business Continuity</SelectItem>
                <SelectItem value="it_continuity">IT Continuity</SelectItem>
                <SelectItem value="disaster_recovery">Disaster Recovery</SelectItem>
                <SelectItem value="crisis_management">Crisis Management</SelectItem>
              </SelectContent>
            </Select>
            <Select value={criticality} onValueChange={(value) => setCriticality(value as any)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plans Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead>Last Exercise</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => {
                  const metrics = planMetrics.find(m => m.plan_id === plan.id);
                  return (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-gray-500">{plan.business_unit || 'No unit'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {plan.plan_type?.replace('_', ' ') || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCriticalityColor(plan.criticality_level)}>
                          {plan.criticality_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={metrics?.readiness_score || 0} className="w-16" />
                          <span className="text-sm font-medium">{metrics?.readiness_score || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.last_exercise_date 
                          ? new Date(plan.last_exercise_date).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>{plan.owner}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPlan(plan.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/bcp/${plan.id}/edit`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
              <p className="text-gray-500 mb-4">
                {query || status !== 'all' || planType !== 'all' || criticality !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first business continuity plan'
                }
              </p>
              {!query && status === 'all' && planType === 'all' && criticality === 'all' && (
                <Button onClick={handleCreatePlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BCPDashboard;
