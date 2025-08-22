import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../lib/supabase';

interface ResilienceIncident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  detected_at: string;
  resolved_at?: string;
  reported_by: string;
  assigned_to?: string;
  affected_systems: string[];
  affected_processes: string[];
  business_impact: string;
  containment_actions: any[];
  resolution_actions: any[];
  lessons_learned: string[];
  follow_up_actions: any[];
  reporter?: {
    id: string;
    email: string;
    full_name?: string;
  };
  assignee?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface CrisisManagement {
  id: string;
  title: string;
  description: string;
  crisis_type: string;
  severity: string;
  status: string;
  declared_at: string;
  resolved_at?: string;
  declared_by: string;
  crisis_team: any[];
  stakeholders: any[];
  communications: any[];
  actions: any[];
  lessons_learned: string[];
  declarer?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface CommunicationLog {
  id: string;
  incident_id: string;
  crisis_id?: string;
  type: 'internal' | 'external' | 'stakeholder' | 'regulatory';
  subject: string;
  message: string;
  recipients: string[];
  sent_at: string;
  sent_by: string;
  status: 'draft' | 'sent' | 'delivered' | 'failed';
}

interface IncidentAction {
  id: string;
  incident_id: string;
  crisis_id?: string;
  action_type: 'containment' | 'investigation' | 'remediation' | 'communication' | 'escalation';
  title: string;
  description: string;
  assigned_to: string;
  due_date?: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function IncidentResponseDashboard() {
  const [incidents, setIncidents] = useState<ResilienceIncident[]>([]);
  const [crises, setCrises] = useState<CrisisManagement[]>([]);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [actions, setActions] = useState<IncidentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<ResilienceIncident | null>(null);
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisManagement | null>(null);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    openIncidents: 0,
    criticalIncidents: 0,
    resolvedIncidents: 0,
    activeCrises: 0,
    resolvedCrises: 0,
    averageResolutionTime: 0,
    pendingActions: 0
  });

  useEffect(() => {
    loadIncidentData();
  }, []);

  const loadIncidentData = async () => {
    try {
      setLoading(true);

      // Load incidents with related data
      const { data: incidentsData } = await supabase
        .from('resilience_incidents')
        .select(`
          *,
          reporter:users!reported_by(id, email, full_name),
          assignee:users!assigned_to(id, email, full_name)
        `)
        .order('created_at', { ascending: false });

      // Load crises with related data
      const { data: crisesData } = await supabase
        .from('crisis_management')
        .select(`
          *,
          declarer:users!declared_by(id, email, full_name)
        `)
        .order('declared_at', { ascending: false });

      // Load communications
      const { data: communicationsData } = await supabase
        .from('incident_communications')
        .select('*')
        .order('sent_at', { ascending: false });

      // Load actions
      const { data: actionsData } = await supabase
        .from('incident_actions')
        .select('*')
        .order('created_at', { ascending: false });

      setIncidents(incidentsData || []);
      setCrises(crisesData || []);
      setCommunications(communicationsData || []);
      setActions(actionsData || []);

      // Calculate statistics
      const openIncidents = incidentsData?.filter(i => i.status === 'open').length || 0;
      const criticalIncidents = incidentsData?.filter(i => i.severity === 'critical').length || 0;
      const resolvedIncidents = incidentsData?.filter(i => i.status === 'resolved').length || 0;
      const activeCrises = crisesData?.filter(c => c.status === 'active').length || 0;
      const resolvedCrises = crisesData?.filter(c => c.status === 'resolved').length || 0;
      const pendingActions = actionsData?.filter(a => a.status === 'pending' || a.status === 'in_progress').length || 0;

      // Calculate average resolution time
      const resolvedWithTime = incidentsData?.filter(i => i.resolved_at && i.detected_at) || [];
      const totalResolutionTime = resolvedWithTime.reduce((total, incident) => {
        const detected = new Date(incident.detected_at);
        const resolved = new Date(incident.resolved_at!);
        return total + (resolved.getTime() - detected.getTime());
      }, 0);
      const averageResolutionTime = resolvedWithTime.length > 0 ? totalResolutionTime / resolvedWithTime.length / (1000 * 60 * 60) : 0; // in hours

      setStats({
        totalIncidents: incidentsData?.length || 0,
        openIncidents,
        criticalIncidents,
        resolvedIncidents,
        activeCrises,
        resolvedCrises,
        averageResolutionTime,
        pendingActions
      });

    } catch (error) {
      console.error('Error loading incident data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-red-100 text-red-800';
      case 'declared': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const createNewIncident = async (incidentData: Partial<ResilienceIncident>) => {
    try {
      const { data, error } = await supabase
        .from('resilience_incidents')
        .insert([incidentData])
        .select()
        .single();

      if (error) throw error;
      await loadIncidentData();
      return data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('resilience_incidents')
        .update(updateData)
        .eq('id', incidentId);

      if (error) throw error;
      await loadIncidentData();
    } catch (error) {
      console.error('Error updating incident status:', error);
    }
  };

  const addCommunication = async (communicationData: Partial<CommunicationLog>) => {
    try {
      const { error } = await supabase
        .from('incident_communications')
        .insert([communicationData]);

      if (error) throw error;
      await loadIncidentData();
    } catch (error) {
      console.error('Error adding communication:', error);
    }
  };

  const addAction = async (actionData: Partial<IncidentAction>) => {
    try {
      const { error } = await supabase
        .from('incident_actions')
        .insert([actionData]);

      if (error) throw error;
      await loadIncidentData();
    } catch (error) {
      console.error('Error adding action:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incident Response & Crisis Management</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">New Communication</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Communication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comm-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="stakeholder">Stakeholder</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="comm-subject">Subject</Label>
                  <Input id="comm-subject" placeholder="Communication subject" />
                </div>
                <div>
                  <Label htmlFor="comm-message">Message</Label>
                  <Textarea id="comm-message" placeholder="Communication message" />
                </div>
                <Button onClick={() => {}}>Send Communication</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Declare Crisis</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Declare Crisis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="crisis-title">Title</Label>
                  <Input id="crisis-title" placeholder="Crisis title" />
                </div>
                <div>
                  <Label htmlFor="crisis-description">Description</Label>
                  <Textarea id="crisis-description" placeholder="Crisis description" />
                </div>
                <div>
                  <Label htmlFor="crisis-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crisis type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="reputational">Reputational</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="crisis-severity">Severity</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => {}}>Declare Crisis</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Badge variant="secondary">All Time</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openIncidents} currently open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <Badge variant="destructive">High Priority</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crises</CardTitle>
            <Badge variant="destructive">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCrises}</div>
            <p className="text-xs text-muted-foreground">
              {stats.resolvedCrises} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Badge variant="outline">Performance</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingActions} actions pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="crises">Crises</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="lessons">Lessons Learned</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.filter(i => i.status !== 'resolved').map((incident) => (
                  <div key={incident.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{incident.title}</h3>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Type: {incident.incident_type}</span>
                          <span>Detected: {new Date(incident.detected_at).toLocaleDateString()}</span>
                          <span>Reporter: {incident.reporter?.full_name || incident.reporter?.email}</span>
                          {incident.assignee && (
                            <span>Assigned: {incident.assignee.full_name || incident.assignee.email}</span>
                          )}
                        </div>
                        {incident.affected_systems.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Affected Systems: </span>
                            {incident.affected_systems.map((system, index) => (
                              <Badge key={index} variant="outline" className="text-xs mr-1">
                                {system}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedIncident(incident)}>
                          View Details
                        </Button>
                        {incident.status === 'open' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateIncidentStatus(incident.id, 'in_progress')}
                          >
                            Start Response
                          </Button>
                        )}
                        {incident.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crisis Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crises.map((crisis) => (
                  <div key={crisis.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{crisis.title}</h3>
                          <Badge className={getSeverityColor(crisis.severity)}>
                            {crisis.severity}
                          </Badge>
                          <Badge className={getStatusColor(crisis.status)}>
                            {crisis.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{crisis.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Type: {crisis.crisis_type}</span>
                          <span>Declared: {new Date(crisis.declared_at).toLocaleDateString()}</span>
                          <span>Declared by: {crisis.declarer?.full_name || crisis.declarer?.email}</span>
                        </div>
                        {crisis.crisis_team.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Crisis Team: </span>
                            {crisis.crisis_team.map((member: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs mr-1">
                                {member.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedCrisis(crisis)}>
                          View Details
                        </Button>
                        {crisis.status === 'active' && (
                          <Button size="sm">Manage Crisis</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{comm.subject}</h3>
                          <Badge variant="outline">{comm.type}</Badge>
                          <Badge className={comm.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {comm.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{comm.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Sent: {new Date(comm.sent_at).toLocaleString()}</span>
                          <span>Recipients: {comm.recipients.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{action.title}</h3>
                          <Badge variant="outline">{action.action_type}</Badge>
                          <Badge className={getActionStatusColor(action.status)}>
                            {action.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getSeverityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Assigned: {action.assigned_to}</span>
                          {action.due_date && (
                            <span>Due: {new Date(action.due_date).toLocaleDateString()}</span>
                          )}
                          {action.completed_at && (
                            <span>Completed: {new Date(action.completed_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        {action.status === 'pending' && (
                          <Button size="sm">Start Action</Button>
                        )}
                        {action.status === 'in_progress' && (
                          <Button size="sm">Complete</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lessons Learned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">From Incidents</h3>
                  <div className="space-y-3">
                    {incidents
                      .filter(i => i.lessons_learned && i.lessons_learned.length > 0)
                      .map((incident) => (
                        <div key={incident.id} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm mb-2">{incident.title}</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {incident.lessons_learned.map((lesson, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{lesson}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-4">From Crises</h3>
                  <div className="space-y-3">
                    {crises
                      .filter(c => c.lessons_learned && c.lessons_learned.length > 0)
                      .map((crisis) => (
                        <div key={crisis.id} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm mb-2">{crisis.title}</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {crisis.lessons_learned.map((lesson, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{lesson}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
