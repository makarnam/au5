import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { itSecurityService, ITSecurityIncident, ITSecuritySearchParams } from '../../../services/itSecurityService';
import { IncidentSeverity, IncidentStatus, IncidentPriority, IncidentType } from '../../../types/itSecurity';

const IncidentsList: React.FC = () => {
  const [incidents, setIncidents] = useState<ITSecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<ITSecuritySearchParams>({
    page: 1,
    page_size: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, [searchParams]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await itSecurityService.incidents.getAll(searchParams);
      setIncidents(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
  };

  const handleFilter = (filters: any) => {
    setSearchParams(prev => ({ ...prev, filters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'contained': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'investigating': return <Clock className="h-4 w-4" />;
      case 'contained': return <CheckCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Incidents</h1>
          <p className="text-gray-600 mt-2">
            Manage and track security incidents across the organization
          </p>
        </div>
        <Link to="/it-security/incidents/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search incidents..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Status</Label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  onChange={(e) => handleFilter({ status: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="contained">Contained</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <Label>Severity</Label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  onChange={(e) => handleFilter({ severity: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  onChange={(e) => handleFilter({ priority: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  onChange={(e) => handleFilter({ type: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">All Types</option>
                  <option value="malware">Malware</option>
                  <option value="phishing">Phishing</option>
                  <option value="data_breach">Data Breach</option>
                  <option value="ddos">DDoS</option>
                  <option value="insider_threat">Insider Threat</option>
                  <option value="physical_security">Physical Security</option>
                  <option value="social_engineering">Social Engineering</option>
                  <option value="system_compromise">System Compromise</option>
                  <option value="network_intrusion">Network Intrusion</option>
                  <option value="application_vulnerability">Application Vulnerability</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Incidents ({totalItems})</span>
            <div className="text-sm text-gray-500">
              Page {searchParams.page} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadIncidents}>Retry</Button>
            </div>
          )}

          {!error && incidents.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No incidents found</p>
              <Link to="/it-security/incidents/create">
                <Button>Report First Incident</Button>
              </Link>
            </div>
          )}

          {!error && incidents.length > 0 && (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {incident.incident_number}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {incident.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {getStatusIcon(incident.status)}
                          <span className="ml-1">{incident.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(incident.priority)}>
                          {incident.priority}
                        </Badge>
                        <Badge variant="outline">
                          {incident.incident_type.replace('_', ' ')}
                        </Badge>
                        {incident.data_breach && (
                          <Badge className="bg-red-100 text-red-800">
                            Data Breach
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Detected: {formatDate(incident.detected_at)}
                        </div>
                        {incident.assigned_to_user && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {incident.assigned_to_user.first_name} {incident.assigned_to_user.last_name}
                          </div>
                        )}
                        {incident.business_unit && (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {incident.business_unit.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/it-security/incidents/${incident.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/it-security/incidents/${incident.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={searchParams.page === 1}
                onClick={() => handlePageChange(searchParams.page - 1)}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={searchParams.page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                disabled={searchParams.page === totalPages}
                onClick={() => handlePageChange(searchParams.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentsList;
