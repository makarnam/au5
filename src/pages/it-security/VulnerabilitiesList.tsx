import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { itSecurityService, ITSecurityVulnerability, ITSecuritySearchParams } from '../../services/itSecurityService';
import { Link, useNavigate } from 'react-router-dom';

const VulnerabilitiesList: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<ITSecurityVulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<ITSecuritySearchParams>({
    page: 1,
    page_size: 20
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadVulnerabilities();
  }, [searchParams]);

  const loadVulnerabilities = async () => {
    try {
      setLoading(true);
      const response = await itSecurityService.vulnerabilities.getAll(searchParams);
      setVulnerabilities(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vulnerabilities');
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

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSearchParams(prev => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vulnerability?')) {
      try {
        await itSecurityService.vulnerabilities.delete(id);
        loadVulnerabilities();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete vulnerability');
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'patching': return 'bg-yellow-100 text-yellow-800';
      case 'patched': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadVulnerabilities}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Vulnerabilities</h1>
          <p className="text-gray-600 mt-2">
            Manage and track security vulnerabilities across your IT infrastructure
          </p>
        </div>
        <Button onClick={() => navigate('/it-security/vulnerabilities/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Vulnerability
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vulnerabilities..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ status: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="patching">Patching</option>
                    <option value="patched">Patched</option>
                    <option value="verified">Verified</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
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
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ priority: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Vulnerabilities</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">High/Critical</p>
                <p className="text-2xl font-bold">
                  {vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">
                  {vulnerabilities.filter(v => v.status === 'open' || v.status === 'investigating').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Patched</p>
                <p className="text-2xl font-bold">
                  {vulnerabilities.filter(v => v.status === 'patched' || v.status === 'verified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerabilities List */}
      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vulnerabilities.map((vulnerability) => (
              <div
                key={vulnerability.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{vulnerability.title}</h3>
                      <Badge className={getSeverityColor(vulnerability.severity)}>
                        {vulnerability.severity}
                      </Badge>
                      <Badge className={getStatusColor(vulnerability.status)}>
                        {vulnerability.status}
                      </Badge>
                      <Badge className={getPriorityColor(vulnerability.priority)}>
                        {vulnerability.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{vulnerability.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Discovered: {new Date(vulnerability.discovery_date).toLocaleDateString()}</span>
                      </div>
                      {vulnerability.due_date && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Due: {new Date(vulnerability.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {vulnerability.cvss_score && (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          <span>CVSS: {vulnerability.cvss_score}</span>
                        </div>
                      )}
                    </div>

                    {vulnerability.affected_systems.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Affected Systems:</p>
                        <div className="flex flex-wrap gap-1">
                          {vulnerability.affected_systems.map((system, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {vulnerability.assigned_to_user && (
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>Assigned to: {vulnerability.assigned_to_user.first_name} {vulnerability.assigned_to_user.last_name}</span>
                      </div>
                    )}

                    {vulnerability.business_unit && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Business Unit: {vulnerability.business_unit.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/vulnerabilities/${vulnerability.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/vulnerabilities/${vulnerability.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(vulnerability.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {vulnerabilities.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No vulnerabilities found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {((searchParams.page || 1) - 1) * (searchParams.page_size || 20) + 1} to{' '}
                {Math.min((searchParams.page || 1) * (searchParams.page_size || 20), totalItems)} of {totalItems} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchParams.page === 1}
                  onClick={() => handlePageChange((searchParams.page || 1) - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {searchParams.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchParams.page === totalPages}
                  onClick={() => handlePageChange((searchParams.page || 1) + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VulnerabilitiesList;
