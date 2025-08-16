import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users, 
  FileText,
  Activity,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';

interface WorkflowStats {
  total_workflows: number;
  active_workflows: number;
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  avg_approval_time: number;
  completion_rate: number;
}

interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  user_name: string;
  timestamp: string;
  status: string;
}

interface WorkflowPerformance {
  workflow_name: string;
  total_requests: number;
  avg_completion_time: number;
  success_rate: number;
  pending_count: number;
}

const WorkflowDashboard: React.FC = () => {
  const [stats, setStats] = useState<WorkflowStats>({
    total_workflows: 0,
    active_workflows: 0,
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    avg_approval_time: 0,
    completion_rate: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [workflowPerformance, setWorkflowPerformance] = useState<WorkflowPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadWorkflowStats(),
        loadRecentActivities(),
        loadWorkflowPerformance()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowStats = async () => {
    try {
      // Get workflow counts
      const { data: workflows, error: workflowError } = await supabase
        .from('workflows')
        .select('id, is_active');

      if (workflowError) throw workflowError;

      // Get approval request counts
      const { data: requests, error: requestError } = await supabase
        .from('approval_requests')
        .select('status, created_at, updated_at');

      if (requestError) throw requestError;

      // Calculate statistics
      const totalWorkflows = workflows?.length || 0;
      const activeWorkflows = workflows?.filter(w => w.is_active).length || 0;
      const totalRequests = requests?.length || 0;
      const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
      const approvedRequests = requests?.filter(r => r.status === 'approved').length || 0;
      const rejectedRequests = requests?.filter(r => r.status === 'rejected').length || 0;

      // Calculate average approval time
      const completedRequests = requests?.filter(r => r.status === 'approved' || r.status === 'rejected') || [];
      const totalTime = completedRequests.reduce((sum, req) => {
        const created = new Date(req.created_at).getTime();
        const updated = new Date(req.updated_at).getTime();
        return sum + (updated - created);
      }, 0);
      const avgApprovalTime = completedRequests.length > 0 ? totalTime / completedRequests.length / (1000 * 60 * 60) : 0; // in hours

      // Calculate completion rate
      const completionRate = totalRequests > 0 ? ((approvedRequests + rejectedRequests) / totalRequests) * 100 : 0;

      setStats({
        total_workflows: totalWorkflows,
        active_workflows: activeWorkflows,
        total_requests: totalRequests,
        pending_requests: pendingRequests,
        approved_requests: approvedRequests,
        rejected_requests: rejectedRequests,
        avg_approval_time: Math.round(avgApprovalTime * 100) / 100,
        completion_rate: Math.round(completionRate * 100) / 100
      });
    } catch (error) {
      console.error('Error loading workflow stats:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          id,
          entity_type,
          title,
          status,
          created_at,
          requester:users!approval_requests_requester_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const activities = data?.map(item => ({
        id: item.id,
        action: 'Approval Request Created',
        entity_type: item.entity_type,
        entity_name: item.title,
        user_name: item.requester?.full_name || 'Unknown',
        timestamp: item.created_at,
        status: item.status
      })) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const loadWorkflowPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          workflow:workflows(name),
          status,
          created_at,
          updated_at
        `);

      if (error) throw error;

      // Group by workflow and calculate metrics
      const workflowGroups = data?.reduce((acc, item) => {
        const workflowName = item.workflow?.name || 'Unknown';
        if (!acc[workflowName]) {
          acc[workflowName] = {
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0,
            totalTime: 0,
            completedCount: 0
          };
        }
        
        acc[workflowName].total++;
        
        if (item.status === 'approved') acc[workflowName].approved++;
        else if (item.status === 'rejected') acc[workflowName].rejected++;
        else if (item.status === 'pending') acc[workflowName].pending++;

        if (item.status === 'approved' || item.status === 'rejected') {
          const created = new Date(item.created_at).getTime();
          const updated = new Date(item.updated_at).getTime();
          acc[workflowName].totalTime += (updated - created);
          acc[workflowName].completedCount++;
        }

        return acc;
      }, {} as Record<string, any>) || {};

      const performance = Object.entries(workflowGroups).map(([name, data]) => ({
        workflow_name: name,
        total_requests: data.total,
        avg_completion_time: data.completedCount > 0 ? 
          Math.round((data.totalTime / data.completedCount / (1000 * 60 * 60)) * 100) / 100 : 0,
        success_rate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
        pending_count: data.pending
      }));

      setWorkflowPerformance(performance);
    } catch (error) {
      console.error('Error loading workflow performance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_workflows}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_workflows} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_requests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending_requests} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved_requests} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Approval Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_approval_time}h</div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending</span>
                    </div>
                    <span className="font-medium">{stats.pending_requests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Approved</span>
                    </div>
                    <span className="font-medium">{stats.approved_requests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Rejected</span>
                    </div>
                    <span className="font-medium">{stats.rejected_requests}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Status */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Active Workflows</span>
                    </div>
                    <span className="font-medium">{stats.active_workflows}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Inactive Workflows</span>
                    </div>
                    <span className="font-medium">{stats.total_workflows - stats.active_workflows}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowPerformance.map((workflow, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{workflow.workflow_name}</h3>
                      <Badge variant="outline">{workflow.total_requests} requests</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <div className="font-medium">{workflow.success_rate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Time:</span>
                        <div className="font-medium">{workflow.avg_completion_time}h</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Pending:</span>
                        <div className="font-medium">{workflow.pending_count}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">
                          {activity.entity_name} • {activity.user_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowDashboard;
