import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Server,
  Database,
  Wifi,
  Shield,
  Zap
} from 'lucide-react';
import { Incident, IncidentAction } from '../../types/resilience';
import { resilienceService } from '../../services/resilienceService';

const IncidentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set());
  
  // Filters
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const data = await resilienceService.getIncidents();
        setIncidents(data);
      } catch (err) {
        setError('Failed to load incidents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const handleCreateIncident = async (incidentData: Partial<Incident>) => {
    try {
      const newIncident = await resilienceService.createIncident({
        ...incidentData,
        detected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Incident);
      
      setIncidents([newIncident, ...incidents]);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create incident:', err);
    }
  };

  const handleUpdateIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      const updatedIncident = await resilienceService.updateIncident(id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      setIncidents(incidents.map(incident => 
        incident.id === id ? updatedIncident : incident
      ));
      setSelectedIncident(null);
    } catch (err) {
      console.error('Failed to update incident:', err);
    }
  };

  const handleAddAction = async (incidentId: string, actionData: Partial<IncidentAction>) => {
    try {
      const newAction = await resilienceService.createIncidentAction({
        ...actionData,
        incident_id: incidentId,
        created_at: new Date().toISOString()
      } as IncidentAction);
      
      // Update the incident with the new action
      setIncidents(incidents.map(incident => {
        if (incident.id === incidentId) {
          return {
            ...incident,
            containment_actions: [...incident.containment_actions, newAction]
          };
        }
        return incident;
      }));
    } catch (err) {
      console.error('Failed to add action:', err);
    }
  };

  const toggleExpanded = (incidentId: string) => {
    const newExpanded = new Set(expandedIncidents);
    if (newExpanded.has(incidentId)) {
      newExpanded.delete(incidentId);
    } else {
      newExpanded.add(incidentId);
    }
    setExpandedIncidents(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'investigating': return 'text-orange-600 bg-orange-100';
      case 'contained': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cyber': return <Shield className="h-4 w-4" />;
      case 'physical': return <MapPin className="h-4 w-4" />;
      case 'natural_disaster': return <AlertCircle className="h-4 w-4" />;
      case 'supply_chain': return <Database className="h-4 w-4" />;
      case 'operational': return <Server className="h-4 w-4" />;
      case 'regulatory': return <Zap className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesQuery = !query || 
      incident.title.toLowerCase().includes(query.toLowerCase()) ||
      incident.description.toLowerCase().includes(query.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesType = typeFilter === 'all' || incident.incident_type === typeFilter;
    
    return matchesQuery && matchesStatus && matchesSeverity && matchesType;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage business disruptions and incidents
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search incidents..."
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-9 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="border border-gray-300 rounded-md py-2 px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="contained">Contained</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value)} 
              className="border border-gray-300 rounded-md py-2 px-3 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="border border-gray-300 rounded-md py-2 px-3 text-sm"
            >
              <option value="all">All Types</option>
              <option value="cyber">Cyber</option>
              <option value="physical">Physical</option>
              <option value="natural_disaster">Natural Disaster</option>
              <option value="supply_chain">Supply Chain</option>
              <option value="operational">Operational</option>
              <option value="regulatory">Regulatory</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Incident Form */}
      {showCreateForm && (
        <IncidentForm
          onSave={handleCreateIncident}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Incidents List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Incidents ({filteredIncidents.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredIncidents.map((incident) => (
            <div key={incident.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleExpanded(incident.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedIncidents.has(incident.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(incident.incident_type)}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{incident.title}</h4>
                      <p className="text-sm text-gray-500">{incident.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <div className="text-sm text-gray-500">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedIncident(incident)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedIncidents.has(incident.id) && (
                <div className="mt-4 pl-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Incident Details</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Type:</span> {incident.incident_type.replace('_', ' ')}</div>
                        <div><span className="font-medium">Priority:</span> {incident.priority}</div>
                        <div><span className="font-medium">Reported by:</span> {incident.reported_by}</div>
                        <div><span className="font-medium">Assigned to:</span> {incident.assigned_to || 'Unassigned'}</div>
                        <div><span className="font-medium">Detected:</span> {new Date(incident.detected_at).toLocaleString()}</div>
                        {incident.resolved_at && (
                          <div><span className="font-medium">Resolved:</span> {new Date(incident.resolved_at).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Impact</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Business Impact:</span> {incident.business_impact}</div>
                        <div><span className="font-medium">Affected Systems:</span> {incident.affected_systems.join(', ')}</div>
                        <div><span className="font-medium">Affected Processes:</span> {incident.affected_processes.join(', ')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Actions</h5>
                      <button
                        onClick={() => {/* Add action modal */}}
                        className="text-sm text-blue-600 hover:text-blue-900"
                      >
                        Add Action
                      </button>
                    </div>
                    <div className="space-y-2">
                      {incident.containment_actions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{action.description}</div>
                            <div className="text-xs text-gray-500">
                              {action.action_type} • {action.assigned_to} • {new Date(action.created_at).toLocaleString()}
                            </div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            action.status === 'completed' ? 'text-green-600 bg-green-100' :
                            action.status === 'in_progress' ? 'text-blue-600 bg-blue-100' :
                            'text-yellow-600 bg-yellow-100'
                          }`}>
                            {action.status}
                          </span>
                        </div>
                      ))}
                      {incident.containment_actions.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          No actions recorded yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lessons Learned */}
                  {incident.lessons_learned.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Lessons Learned</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {incident.lessons_learned.map((lesson, index) => (
                          <li key={index}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {filteredIncidents.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by reporting a new incident.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Report Incident
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Incident Modal */}
      {selectedIncident && (
        <IncidentForm
          incident={selectedIncident}
          onSave={(updates) => handleUpdateIncident(selectedIncident.id, updates)}
          onCancel={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
};

// Incident Form Component
interface IncidentFormProps {
  incident?: Incident;
  onSave: (incident: Partial<Incident>) => void;
  onCancel: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ incident, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    incident_type: incident?.incident_type || 'operational',
    severity: incident?.severity || 'medium',
    priority: incident?.priority || 'medium',
    assigned_to: incident?.assigned_to || '',
    affected_systems: incident?.affected_systems || [],
    affected_processes: incident?.affected_processes || [],
    business_impact: incident?.business_impact || '',
    status: incident?.status || 'open'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {incident ? 'Edit Incident' : 'Report New Incident'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cyber">Cyber</option>
                  <option value="physical">Physical</option>
                  <option value="natural_disaster">Natural Disaster</option>
                  <option value="supply_chain">Supply Chain</option>
                  <option value="operational">Operational</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Business Impact</label>
              <textarea
                value={formData.business_impact}
                onChange={(e) => setFormData({ ...formData, business_impact: e.target.value })}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <input
                type="text"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {incident && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="contained">Contained</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {incident ? 'Update' : 'Create'} Incident
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidentManagement;
