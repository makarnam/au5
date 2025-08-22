import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Workflow, Clock, AlertTriangle, CheckCircle, XCircle, Plus, Settings, BarChart3, Users, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import WorkflowCalendar from '../../components/workflows/WorkflowCalendar';
import DocumentWorkflowIntegration from '../../components/workflows/DocumentWorkflowIntegration';
import { workflowCalendarService } from '../../services/workflowCalendarService';
import { documentWorkflowService } from '../../services/documentWorkflowService';
import { format } from 'date-fns';

const WorkflowIntegrationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [calendarStats, setCalendarStats] = useState<any>(null);
  const [documentStats, setDocumentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<string>('all');
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [overdueEvents, setOverdueEvents] = useState<any[]>([]);
  const [documentsRequiringApproval, setDocumentsRequiringApproval] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        calendarStatsResult,
        documentStatsResult,
        upcomingEventsResult,
        overdueEventsResult,
        documentsApprovalResult
      ] = await Promise.all([
        workflowCalendarService.getCalendarStats(),
        documentWorkflowService.getDocumentWorkflowStats(),
        workflowCalendarService.getUpcomingEvents(7), // Next 7 days
        workflowCalendarService.getOverdueEvents(),
        documentWorkflowService.getDocumentsRequiringApproval()
      ]);

      if (calendarStatsResult.data) {
        setCalendarStats(calendarStatsResult.data);
      }
      if (documentStatsResult.data) {
        setDocumentStats(documentStatsResult.data);
      }
      if (upcomingEventsResult.data) {
        setUpcomingEvents(upcomingEventsResult.data);
      }
      if (overdueEventsResult.data) {
        setOverdueEvents(overdueEventsResult.data);
      }
      if (documentsApprovalResult.data) {
        setDocumentsRequiringApproval(documentsApprovalResult.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Integration Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage calendar events, document workflows, and integration settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calendar Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarStats?.total_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              {calendarStats?.upcoming_events || 0} upcoming, {calendarStats?.overdue_events || 0} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents with Workflows</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats?.total_documents_with_workflows || 0}</div>
            <p className="text-xs text-muted-foreground">
              {documentStats?.documents_pending_approval || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats?.active_workflows || 0}</div>
            <p className="text-xs text-muted-foreground">
              {documentStats?.documents_approved || 0} approved, {documentStats?.documents_rejected || 0} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{calendarStats?.overdue_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common workflow integration tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span>Schedule Meeting</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span>Create Document Workflow</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Clock className="w-6 h-6 mb-2" />
                  <span>Set Deadline</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events (Next 7 Days)</CardTitle>
                <CardDescription>
                  Calendar events and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming events
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <p className="text-xs text-gray-500">
                              {format(new Date(event.start_at), 'MMM d, HH:mm')}
                            </p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(event.priority)}>
                          {event.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Requiring Approval */}
            <Card>
              <CardHeader>
                <CardTitle>Documents Requiring Approval</CardTitle>
                <CardDescription>
                  Documents pending workflow approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentsRequiringApproval.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No documents pending approval
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentsRequiringApproval.slice(0, 5).map((doc) => (
                      <div key={doc.document_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-green-600" />
                          <div>
                            <h4 className="font-medium text-sm">{doc.document_name}</h4>
                            <p className="text-xs text-gray-500">
                              {doc.workflow_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Overdue Events Alert */}
          {overdueEvents.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Overdue Events ({overdueEvents.length})</span>
                </CardTitle>
                <CardDescription className="text-red-600">
                  These events require immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-red-600" />
                        <div>
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-500">
                            Due: {format(new Date(event.end_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        Overdue
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Calendar</CardTitle>
              <CardDescription>
                Manage calendar events, deadlines, and meetings for workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowCalendar showCreateButton={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Workflow Integration</CardTitle>
              <CardDescription>
                Configure document approval workflows and version control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentWorkflowIntegration showCreateButton={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure workflow integration preferences and automation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Calendar Integration Settings */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Calendar Integration Settings</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="default_reminder">Default Reminder Time</Label>
                      <Select defaultValue="15">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="1440">1 day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <Select defaultValue="UTC">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Document Workflow Settings */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Document Workflow Settings</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auto_version_control">Auto Version Control</Label>
                      <Select defaultValue="enabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="approval_threshold">Approval Threshold</Label>
                      <Select defaultValue="single">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Approval</SelectItem>
                          <SelectItem value="multiple">Multiple Approvals</SelectItem>
                          <SelectItem value="unanimous">Unanimous Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Notification Settings</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <Select defaultValue="enabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="in_app_notifications">In-App Notifications</Label>
                      <Select defaultValue="enabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowIntegrationDashboard;
