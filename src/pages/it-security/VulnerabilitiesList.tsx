import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion } from 'framer-motion';
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
  Building,
  RefreshCw,
  ArrowRight,
  Bug
} from 'lucide-react';
import { itSecurityVulnerabilityService } from '../../services/itSecurityService';
import { ITSecurityVulnerability, ITSecuritySearchParams } from '../../types/itSecurity';
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
      const response = await itSecurityVulnerabilityService.getAll(searchParams);
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
        await itSecurityVulnerabilityService.delete(id);
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
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Security Vulnerabilities</h1>
          <p className="text-gray-600 text-lg">
            Manage and track security vulnerabilities across your IT infrastructure
          </p>
        </div>
        <Button 
          onClick={() => navigate('/it-security/vulnerabilities/create')}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Vulnerability
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Search & Filters</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
                >
                  <div>
                    <Label className="font-medium">Status</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <Label className="font-medium">Severity</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <Label className="font-medium">Priority</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handleFilter({ priority: e.target.value ? [e.target.value] : [] })}
                    >
                      <option value="">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-red-50/30">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg mr-4">
                  <Bug className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Vulnerabilities</p>
                  <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">High/Critical</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/30">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Open</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vulnerabilities.filter(v => v.status === 'open' || v.status === 'investigating').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Patched</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vulnerabilities.filter(v => v.status === 'patched' || v.status === 'verified').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Vulnerabilities List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {vulnerabilities.map((vulnerability) => (
                <motion.div
                  key={vulnerability.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: parseInt(vulnerability.id) * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{vulnerability.title}</h3>
                        <Badge className={getSeverityColor(vulnerability.severity)} variant="secondary">
                          {vulnerability.severity}
                        </Badge>
                        <Badge className={getStatusColor(vulnerability.status)} variant="secondary">
                          {vulnerability.status}
                        </Badge>
                        <Badge className={getPriorityColor(vulnerability.priority)} variant="secondary">
                          {vulnerability.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{vulnerability.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Discovered: {new Date(vulnerability.discovery_date).toLocaleDateString()}</span>
                        </div>
                        {vulnerability.due_date && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>Due: {new Date(vulnerability.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {vulnerability.cvss_score && (
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-purple-500" />
                            <span>CVSS: {vulnerability.cvss_score}</span>
                          </div>
                        )}
                      </div>

                      {vulnerability.affected_systems.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Affected Systems:</p>
                          <div className="flex flex-wrap gap-2">
                            {vulnerability.affected_systems.map((system, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                                {system}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {vulnerability.assigned_to_user && (
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          <span>Assigned to: <span className="font-medium">{vulnerability.assigned_to_user.first_name} {vulnerability.assigned_to_user.last_name}</span></span>
                        </div>
                      )}

                      {vulnerability.business_unit && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Building className="h-4 w-4 mr-2 text-orange-500" />
                          <span>Business Unit: <span className="font-medium">{vulnerability.business_unit.name}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/it-security/vulnerabilities/${vulnerability.id}`)}
                        className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/it-security/vulnerabilities/${vulnerability.id}/edit`)}
                        className="hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vulnerability.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {vulnerabilities.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-full inline-block mb-4">
                    <AlertTriangle className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No vulnerabilities found</p>
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
      </motion.div>
    </div>
  );
};

export default VulnerabilitiesList;
