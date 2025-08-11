import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { aiGovernanceService } from '../../services/aiGovernanceService';
import { AIIncident, AIGovernanceSearchParams } from '../../types/aiGovernance';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';

const AIIncidentsList: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<AIIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    severity: '',
    incident_type: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadIncidents();
  }, [pagination.page, searchQuery, filters]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const searchParams: AIGovernanceSearchParams = {
        query: searchQuery || undefined,
        page: pagination.page,
        page_size: pagination.pageSize,
        filters: {
          risk_level: filters.severity ? [filters.severity] : undefined,
          incident_type: filters.incident_type ? [filters.incident_type] : undefined,
          status: filters.status ? [filters.status] : undefined
        }
      };

      const response = await aiGovernanceService.getAIIncidents(searchParams);
      setIncidents(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      await aiGovernanceService.deleteAIIncident(id);
      loadIncidents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete incident');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'mitigating': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'investigating': return <Activity className="w-4 h-4" />;
      case 'mitigating': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const clearFilters = () => {
    setFilters({
      severity: '',
      incident_type: '',
      status: ''
    });
  };

  const getDaysSinceIncident = (incidentDate: string) => {
    const incident = new Date(incidentDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - incident.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && incidents.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">AI Incidents</h1>
          <p className="text-gray-600 mt-2">
            Track and manage AI-related incidents and issues
          </p>
        </div>
        <Button
          onClick={() => navigate('/ai-governance/incidents/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              {Object.values(filters).some(f => f) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Severity
                  </label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Incident Type
                  </label>
                  <select
                    value={filters.incident_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, incident_type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="bias">Bias</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="security">Security</option>
                    <option value="privacy">Privacy</option>
                    <option value="performance">Performance</option>
                    <option value="availability">Availability</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="mitigating">Mitigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      {loading ? (
        <LoadingSpinner />
      ) : incidents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => f)
                ? 'Try adjusting your search or filters'
                : 'No incidents have been reported yet'
              }
            </p>
            <Button
              onClick={() => navigate('/ai-governance/incidents/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{incident.incident_title}</h3>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span>Type: {incident.incident_type}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Date: {new Date(incident.incident_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{getDaysSinceIncident(incident.incident_date)} days ago</span>
                      </div>
                      {incident.assigned_user && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Assigned: {incident.assigned_user.first_name} {incident.assigned_user.last_name}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                      {incident.description}
                    </p>

                    {incident.model && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Model:</span> {incident.model.name} ({incident.model.model_type})
                      </div>
                    )}

                    {incident.impact_assessment && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Impact:</span> {incident.impact_assessment}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/ai-governance/incidents/${incident.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/ai-governance/incidents/${incident.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(incident.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} incidents
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIIncidentsList;
