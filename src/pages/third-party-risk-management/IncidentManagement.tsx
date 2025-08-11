import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ThirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyIncident, ThirdPartyIncidentFilters } from '../../types/thirdPartyRiskManagement';
import { Plus, Search, Filter, Eye, Edit, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

const service = new ThirdPartyRiskManagementService();

const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<ThirdPartyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<ThirdPartyIncidentFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ThirdPartyIncident | null>(null);
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Form state for creating/editing incidents
  const [formData, setFormData] = useState({
    third_party_id: '',
    incident_type: 'security_breach' as const,
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: new Date().toTimeString().split(' ')[0],
    severity: 'medium' as const,
    title: '',
    description: '',
    impact_assessment: '',
    affected_services: [] as string[],
    affected_customers: 0,
    financial_impact: 0,
    business_impact: '',
    root_cause: '',
    immediate_actions: [] as string[],
    containment_measures: [] as string[],
    remediation_actions: [] as string[],
    lessons_learned: '',
    preventive_measures: [] as string[],
    incident_response_team: [] as string[],
    escalation_level: '',
    notification_sent: false,
    notification_recipients: [] as string[],
    regulatory_reporting_required: false,
    regulatory_reports_filed: [] as string[],
    insurance_claim_filed: false,
    insurance_claim_details: '',
    investigation_completed: false,
    investigation_report: '',
    resolution_date: '',
    resolved_by: ''
  });

  useEffect(() => {
    loadIncidents();
    loadThirdParties();
    loadUsers();
  }, [page, filters]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const result = await service.getIncidents(filters, page, limit);
      if (result.error) {
        console.error('Error loading incidents:', result.error);
      } else {
        setIncidents(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThirdParties = async () => {
    try {
      const result = await service.getThirdParties();
      if (!result.error) {
        setThirdParties(result.data);
      }
    } catch (error) {
      console.error('Error loading third parties:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await service.getUsers();
      if (!result.error) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateIncident = async () => {
    try {
      const result = await service.createIncident(formData);
      if (result.error) {
        console.error('Error creating incident:', result.error);
        alert('Failed to create incident');
      } else {
        setShowCreateModal(false);
        resetForm();
        loadIncidents();
        alert('Incident created successfully');
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Failed to create incident');
    }
  };

  const resetForm = () => {
    setFormData({
      third_party_id: '',
      incident_type: 'security_breach',
      incident_date: new Date().toISOString().split('T')[0],
      incident_time: new Date().toTimeString().split(' ')[0],
      severity: 'medium',
      title: '',
      description: '',
      impact_assessment: '',
      affected_services: [],
      affected_customers: 0,
      financial_impact: 0,
      business_impact: '',
      root_cause: '',
      immediate_actions: [],
      containment_measures: [],
      remediation_actions: [],
      lessons_learned: '',
      preventive_measures: [],
      incident_response_team: [],
      escalation_level: '',
      notification_sent: false,
      notification_recipients: [],
      regulatory_reporting_required: false,
      regulatory_reports_filed: [],
      insurance_claim_filed: false,
      insurance_claim_details: '',
      investigation_completed: false,
      investigation_report: '',
      resolution_date: '',
      resolved_by: ''
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage third-party incidents</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Incident
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search incidents..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="third-party">Third Party</Label>
              <select
                id="third-party"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.third_party_id || ''}
                onChange={(e) => setFilters({ ...filters, third_party_id: e.target.value })}
              >
                <option value="">All Third Parties</option>
                {thirdParties.map((tp) => (
                  <option key={tp.id} value={tp.id}>{tp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.severity?.[0] || ''}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : undefined })}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents ({total})</CardTitle>
          <CardDescription>Recent third-party incidents and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No incidents found</div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(incident.status)}
                            {incident.status.toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{incident.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(incident.incident_date)}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {incident.incident_type.replace('_', ' ')}
                        </div>
                        {incident.financial_impact && (
                          <div>
                            <span className="font-medium">Financial Impact:</span> {formatCurrency(incident.financial_impact)}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Affected Customers:</span> {incident.affected_customers || 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Incident</h2>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="third-party-select">Third Party *</Label>
                <select
                  id="third-party-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.third_party_id}
                  onChange={(e) => setFormData({ ...formData, third_party_id: e.target.value })}
                  required
                >
                  <option value="">Select Third Party</option>
                  {thirdParties.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="incident-type">Incident Type *</Label>
                <select
                  id="incident-type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value as any })}
                  required
                >
                  <option value="security_breach">Security Breach</option>
                  <option value="service_outage">Service Outage</option>
                  <option value="compliance_violation">Compliance Violation</option>
                  <option value="financial_issue">Financial Issue</option>
                  <option value="operational_failure">Operational Failure</option>
                </select>
              </div>

              <div>
                <Label htmlFor="incident-date">Incident Date *</Label>
                <Input
                  id="incident-date"
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="incident-time">Incident Time</Label>
                <Input
                  id="incident-time"
                  type="time"
                  value={formData.incident_time}
                  onChange={(e) => setFormData({ ...formData, incident_time: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="severity-select">Severity *</Label>
                <select
                  id="severity-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief incident title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the incident"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="impact-assessment">Impact Assessment</Label>
                <Textarea
                  id="impact-assessment"
                  value={formData.impact_assessment}
                  onChange={(e) => setFormData({ ...formData, impact_assessment: e.target.value })}
                  placeholder="Assessment of business impact"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="affected-customers">Affected Customers</Label>
                <Input
                  id="affected-customers"
                  type="number"
                  value={formData.affected_customers}
                  onChange={(e) => setFormData({ ...formData, affected_customers: parseInt(e.target.value) || 0 })}
                  placeholder="Number of affected customers"
                />
              </div>

              <div>
                <Label htmlFor="financial-impact">Financial Impact ($)</Label>
                <Input
                  id="financial-impact"
                  type="number"
                  value={formData.financial_impact}
                  onChange={(e) => setFormData({ ...formData, financial_impact: parseFloat(e.target.value) || 0 })}
                  placeholder="Estimated financial impact"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="business-impact">Business Impact</Label>
                <Textarea
                  id="business-impact"
                  value={formData.business_impact}
                  onChange={(e) => setFormData({ ...formData, business_impact: e.target.value })}
                  placeholder="Description of business impact"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="root-cause">Root Cause</Label>
                <Textarea
                  id="root-cause"
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  placeholder="Identified root cause"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIncident}>
                Create Incident
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Incident Details</h2>
              <Button variant="outline" onClick={() => setSelectedIncident(null)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Title:</span> {selectedIncident.title}</div>
                  <div><span className="font-medium">Type:</span> {selectedIncident.incident_type.replace('_', ' ')}</div>
                  <div><span className="font-medium">Date:</span> {formatDate(selectedIncident.incident_date)}</div>
                  <div><span className="font-medium">Severity:</span> 
                    <Badge className={`ml-2 ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedIncident.status)}`}>
                      {selectedIncident.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Impact Assessment</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Affected Customers:</span> {selectedIncident.affected_customers || 0}</div>
                  <div><span className="font-medium">Financial Impact:</span> {selectedIncident.financial_impact ? formatCurrency(selectedIncident.financial_impact) : 'N/A'}</div>
                  <div><span className="font-medium">Investigation Completed:</span> {selectedIncident.investigation_completed ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Notification Sent:</span> {selectedIncident.notification_sent ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedIncident.description}</p>
              </div>

              {selectedIncident.impact_assessment && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Impact Assessment</h3>
                  <p className="text-gray-700">{selectedIncident.impact_assessment}</p>
                </div>
              )}

              {selectedIncident.business_impact && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Business Impact</h3>
                  <p className="text-gray-700">{selectedIncident.business_impact}</p>
                </div>
              )}

              {selectedIncident.root_cause && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Root Cause</h3>
                  <p className="text-gray-700">{selectedIncident.root_cause}</p>
                </div>
              )}

              {selectedIncident.lessons_learned && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Lessons Learned</h3>
                  <p className="text-gray-700">{selectedIncident.lessons_learned}</p>
                </div>
              )}

              {selectedIncident.investigation_report && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Investigation Report</h3>
                  <p className="text-gray-700">{selectedIncident.investigation_report}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedIncident(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;
