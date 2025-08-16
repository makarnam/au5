import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import WorkflowManager from '../../components/workflows/WorkflowManager';
import ApprovalRequestManager from '../../components/workflows/ApprovalRequestManager';
import WorkflowDashboard from '../../components/workflows/WorkflowDashboard';
import { 
  BarChart3, 
  Settings, 
  FileText, 
  CheckSquare, 
  Users, 
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react';

const WorkflowManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const quickStats = [
    {
      title: 'Active Workflows',
      value: '5',
      icon: <FileText className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Approvals',
      value: '12',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Completed Today',
      value: '8',
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Users',
      value: '24',
      icon: <Users className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WorkflowDashboard />;
      case 'workflows':
        return <WorkflowManager />;
      case 'approvals':
        return <ApprovalRequestManager />;
      default:
        return <WorkflowDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Management</h1>
          <p className="text-gray-600">
            Manage approval workflows, track requests, and monitor performance across your organization.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger value="approvals" className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Approvals
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {renderContent()}
              </div>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflow Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Performance charts will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Approval Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Time analysis charts will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Average Approval Time</h3>
                    <p className="text-3xl font-bold text-blue-600">2.4h</p>
                    <p className="text-sm text-gray-600">Last 30 days</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Success Rate</h3>
                    <p className="text-3xl font-bold text-green-600">87%</p>
                    <p className="text-sm text-gray-600">Approved requests</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Active Workflows</h3>
                    <p className="text-3xl font-bold text-purple-600">5</p>
                    <p className="text-sm text-gray-600">Currently running</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowManagementPage;
