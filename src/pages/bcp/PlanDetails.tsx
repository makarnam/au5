import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BusinessContinuityPlan, 
  CriticalFunction,
  ITContinuityPlan,
  RecoveryTimeObjective,
  EmergencyContact,
  BCMRiskAssessment,
  BCMTestingExercise,
  BCMCommunicationPlan,
  BCMResource,
  BCMIncident,
  BCMMetric,
  BCMPlanMetrics
} from '../../types/bcp';
import { bcpService } from '../../services/bcpService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Globe, 
  Shield, 
  Target, 
  Users, 
  Building2, 
  Zap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TestTube,
  MessageSquare,
  Database,
  Server,
  Network,
  HardDrive,
  Wifi,
  Power,
  Thermometer,
  Lock,
  Bell,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';

const PlanDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<BusinessContinuityPlan | null>(null);
  const [planMetrics, setPlanMetrics] = useState<BCMPlanMetrics | null>(null);
  const [criticalFunctions, setCriticalFunctions] = useState<CriticalFunction[]>([]);
  const [itContinuityPlans, setITContinuityPlans] = useState<ITContinuityPlan[]>([]);
  const [rtos, setRTOs] = useState<RecoveryTimeObjective[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<BCMRiskAssessment[]>([]);
  const [testingExercises, setTestingExercises] = useState<BCMTestingExercise[]>([]);
  const [communicationPlans, setCommunicationPlans] = useState<BCMCommunicationPlan[]>([]);
  const [resources, setResources] = useState<BCMResource[]>([]);
  const [incidents, setIncidents] = useState<BCMIncident[]>([]);
  const [metrics, setMetrics] = useState<BCMMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [
          planData,
          metricsData,
          functionsData,
          itPlansData,
          rtosData,
          contactsData,
          risksData,
          exercisesData,
          commPlansData,
          resourcesData,
          incidentsData,
          metricsData2
        ] = await Promise.all([
          bcpService.getPlanById(id),
          bcpService.getPlanMetrics(id),
          bcpService.getCriticalFunctions(id),
          bcpService.getITContinuityPlans(id),
          bcpService.getRTOs(id),
          bcpService.getEmergencyContacts(id),
          bcpService.getRiskAssessments(id),
          bcpService.getTestingExercises(id),
          bcpService.getCommunicationPlans(id),
          bcpService.getResources(id),
          bcpService.getIncidents(id),
          bcpService.getMetrics(id)
        ]);

        setPlan(planData);
        setPlanMetrics(metricsData);
        setCriticalFunctions(functionsData);
        setITContinuityPlans(itPlansData);
        setRTOs(rtosData);
        setEmergencyContacts(contactsData);
        setRiskAssessments(risksData);
        setTestingExercises(exercisesData);
        setCommunicationPlans(commPlansData);
        setResources(resourcesData);
        setIncidents(incidentsData);
        setMetrics(metricsData2);
      } catch (err) {
        console.error('Failed to load plan data', err);
        setError('Failed to load business continuity plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [id]);

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

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const formatAvailability = (availability: number) => {
    return `${(availability * 100).toFixed(4)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'Business continuity plan not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
          <p className="text-gray-600 mt-1">{plan.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
            <Badge className={getCriticalityColor(plan.criticality_level)}>{plan.criticality_level}</Badge>
            {plan.global_region && <Badge variant="outline">{plan.global_region}</Badge>}
            {plan.business_unit && <Badge variant="outline">{plan.business_unit}</Badge>}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/bcp/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
          <Button onClick={() => navigate('/bcp')}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
        </div>
      </div>

      {/* Plan Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planMetrics?.readiness_score || 0}%</div>
            <Progress value={planMetrics?.readiness_score || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Functions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planMetrics?.critical_functions_count || 0}</div>
            <p className="text-xs text-muted-foreground">functions defined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planMetrics?.emergency_contacts_count || 0}</div>
            <p className="text-xs text-muted-foreground">contacts available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planMetrics?.open_incidents_count || 0}</div>
            <p className="text-xs text-muted-foreground">active incidents</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="it-continuity">IT Continuity</TabsTrigger>
          <TabsTrigger value="rto-rpo">RTO/RPO</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plan Type</label>
                    <p className="text-sm">{plan.plan_type?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Version</label>
                    <p className="text-sm">{plan.version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner</label>
                    <p className="text-sm">{plan.owner}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approval Status</label>
                    <Badge className={getStatusColor(plan.approval_status)}>{plan.approval_status}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">MTTA</label>
                    <p className="text-sm">{formatHours(plan.mtta_hours)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">MTTR</label>
                    <p className="text-sm">{formatHours(plan.mttr_hours)}</p>
                  </div>
                </div>
                {plan.scope && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scope</label>
                    <p className="text-sm">{plan.scope}</p>
                  </div>
                )}
                {plan.business_impact_analysis && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Impact Analysis</label>
                    <p className="text-sm">{plan.business_impact_analysis}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{metric.metric_name}</p>
                        <p className="text-xs text-gray-500">{metric.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {metric.actual_value !== null ? metric.actual_value : 'N/A'} {metric.unit}
                        </p>
                        <p className="text-xs text-gray-500">Target: {metric.target_value} {metric.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.slice(0, 5).map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{incident.incident_title}</div>
                          <div className="text-sm text-gray-500">{incident.incident_description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {incident.incident_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(incident.severity_level)}>
                          {incident.severity_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(incident.reported_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Critical Business Functions</h3>
            <Button onClick={() => navigate(`/bcp/${id}/functions/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Function
            </Button>
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>RTO</TableHead>
                    <TableHead>RPO</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Tested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalFunctions.map((func) => (
                    <TableRow key={func.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{func.name}</div>
                          <div className="text-sm text-gray-500">{func.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCriticalityColor(func.recovery_priority)}>
                          {func.recovery_priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatHours(func.rto_hours)}</TableCell>
                      <TableCell>{formatHours(func.rpo_hours)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(func.status)}>
                          {func.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {func.last_tested_date 
                          ? new Date(func.last_tested_date).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="it-continuity" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">IT Continuity Plans</h3>
            <Button onClick={() => navigate(`/bcp/${id}/it-continuity/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add IT Plan
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {itContinuityPlans.map((itPlan) => (
              <Card key={itPlan.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {itPlan.name}
                  </CardTitle>
                  <CardDescription>{itPlan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Environment</label>
                      <p className="text-sm">{itPlan.it_environment}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Infrastructure</label>
                      <p className="text-sm">{itPlan.infrastructure_type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Primary: {itPlan.data_center_primary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Secondary: {itPlan.data_center_secondary}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {itPlan.network_redundancy && <Badge variant="outline">Network Redundancy</Badge>}
                    {itPlan.power_redundancy && <Badge variant="outline">Power Redundancy</Badge>}
                    {itPlan.cooling_redundancy && <Badge variant="outline">Cooling Redundancy</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rto-rpo" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recovery Time & Point Objectives</h3>
            <Button onClick={() => navigate(`/bcp/${id}/rto/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add RTO/RPO
            </Button>
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>RTO</TableHead>
                    <TableHead>RPO</TableHead>
                    <TableHead>MTTA</TableHead>
                    <TableHead>MTTR</TableHead>
                    <TableHead>SLA Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rtos.map((rto) => (
                    <TableRow key={rto.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rto.service_name}</div>
                          <div className="text-sm text-gray-500">{rto.recovery_strategy}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatHours(rto.rto_hours)}</TableCell>
                      <TableCell>{formatHours(rto.rpo_hours)}</TableCell>
                      <TableCell>{formatHours(rto.mtta_hours)}</TableCell>
                      <TableCell>{formatHours(rto.mttr_hours)}</TableCell>
                      <TableCell>{formatAvailability(rto.sla_target)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(rto.status)}>
                          {rto.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Emergency Contacts</h3>
            <Button onClick={() => navigate(`/bcp/${id}/contacts/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyContacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {contact.name}
                  </CardTitle>
                  <CardDescription>{contact.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{contact.mobile}</span>
                  </div>
                  <div>
                    <Badge variant="outline">Level {contact.escalation_level}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Available: {contact.availability_hours}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Risk Assessments</h3>
            <Button onClick={() => navigate(`/bcp/${id}/risks/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Likelihood</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskAssessments.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{risk.risk_name}</div>
                          <div className="text-sm text-gray-500">{risk.risk_description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{risk.risk_category}</TableCell>
                      <TableCell>{risk.likelihood_rating}/5</TableCell>
                      <TableCell>{risk.impact_rating}/5</TableCell>
                      <TableCell>{risk.risk_score}</TableCell>
                      <TableCell>
                        <Badge className={getCriticalityColor(risk.risk_level)}>
                          {risk.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(risk.status)}>
                          {risk.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Testing & Exercises</h3>
            <Button onClick={() => navigate(`/bcp/${id}/testing/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Exercise
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testingExercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    {exercise.exercise_name}
                  </CardTitle>
                  <CardDescription>{exercise.exercise_type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-sm">{new Date(exercise.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p className="text-sm">{exercise.duration_hours}h</p>
                    </div>
                  </div>
                  
                  <div>
                    <Badge className={getStatusColor(exercise.status)}>
                      {exercise.status}
                    </Badge>
                  </div>

                  {exercise.results && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Results</label>
                      <p className="text-sm">{exercise.results}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Resources</h3>
            <Button onClick={() => navigate(`/bcp/${id}/resources/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Criticality</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{resource.resource_name}</div>
                          <div className="text-sm text-gray-500">{resource.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {resource.resource_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{resource.quantity}</TableCell>
                      <TableCell>{resource.location}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(resource.availability_status)}>
                          {resource.availability_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCriticalityColor(resource.criticality_level)}>
                          {resource.criticality_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanDetails;
