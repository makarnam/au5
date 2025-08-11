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
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  TestTube,
  Calendar,
  User,
  Building,
  Zap
} from 'lucide-react';
import { itSecurityService, ITControl, ITSecuritySearchParams } from '../../services/itSecurityService';
import { Link, useNavigate } from 'react-router-dom';

const ControlsList: React.FC = () => {
  const [controls, setControls] = useState<ITControl[]>([]);
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
    loadControls();
  }, [searchParams]);

  const loadControls = async () => {
    try {
      setLoading(true);
      const response = await itSecurityService.controls.getAll(searchParams);
      setControls(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load controls');
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
    if (window.confirm('Are you sure you want to delete this control?')) {
      try {
        await itSecurityService.controls.delete(id);
        loadControls();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete control');
      }
    }
  };

  const getImplementationStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
      case 'operational': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'decommissioned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getControlTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'bg-blue-100 text-blue-800';
      case 'detective': return 'bg-purple-100 text-purple-800';
      case 'corrective': return 'bg-orange-100 text-orange-800';
      case 'deterrent': return 'bg-red-100 text-red-800';
      case 'recovery': return 'bg-green-100 text-green-800';
      case 'compensating': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'access_control': return 'bg-blue-100 text-blue-800';
      case 'network_security': return 'bg-green-100 text-green-800';
      case 'data_protection': return 'bg-purple-100 text-purple-800';
      case 'incident_response': return 'bg-red-100 text-red-800';
      case 'business_continuity': return 'bg-orange-100 text-orange-800';
      case 'monitoring': return 'bg-indigo-100 text-indigo-800';
      case 'compliance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective': return 'bg-green-100 text-green-800';
      case 'partially_effective': return 'bg-yellow-100 text-yellow-800';
      case 'ineffective': return 'bg-red-100 text-red-800';
      case 'not_assessed': return 'bg-gray-100 text-gray-800';
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
          <Button onClick={loadControls}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Security Controls</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor IT security controls across your organization
          </p>
        </div>
        <Button onClick={() => navigate('/it-security/controls/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Control
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
                placeholder="Search controls..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Label>Implementation Status</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ status: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Statuses</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="implemented">Implemented</option>
                    <option value="operational">Operational</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                </div>
                <div>
                  <Label>Control Type</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ type: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Types</option>
                    <option value="preventive">Preventive</option>
                    <option value="detective">Detective</option>
                    <option value="corrective">Corrective</option>
                    <option value="deterrent">Deterrent</option>
                    <option value="recovery">Recovery</option>
                    <option value="compensating">Compensating</option>
                  </select>
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ category: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Categories</option>
                    <option value="access_control">Access Control</option>
                    <option value="network_security">Network Security</option>
                    <option value="data_protection">Data Protection</option>
                    <option value="incident_response">Incident Response</option>
                    <option value="business_continuity">Business Continuity</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="compliance">Compliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Framework</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ framework: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Frameworks</option>
                    <option value="nist_csf">NIST CSF</option>
                    <option value="iso_27001">ISO 27001</option>
                    <option value="cobit">COBIT</option>
                    <option value="itil">ITIL</option>
                    <option value="pci_dss">PCI DSS</option>
                    <option value="cmmc">CMMC</option>
                    <option value="custom">Custom</option>
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
              <Shield className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Controls</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Implemented</p>
                <p className="text-2xl font-bold">
                  {controls.filter(c => c.implementation_status === 'implemented' || c.implementation_status === 'operational').length}
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
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {controls.filter(c => c.implementation_status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Automated</p>
                <p className="text-2xl font-bold">
                  {controls.filter(c => c.automated).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls List */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {controls.map((control) => (
              <div
                key={control.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{control.title}</h3>
                      <Badge className={getImplementationStatusColor(control.implementation_status)}>
                        {control.implementation_status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getControlTypeColor(control.control_type)}>
                        {control.control_type}
                      </Badge>
                      <Badge className={getCategoryColor(control.category)}>
                        {control.category.replace('_', ' ')}
                      </Badge>
                      {control.automated && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Automated
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{control.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Code: {control.control_code}</span>
                      </div>
                      {control.framework && (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          <span>Framework: {control.framework.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      )}
                      {control.effectiveness && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span>Effectiveness: {control.effectiveness.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        <span>Testing: {control.testing_frequency.replace('_', ' ')}</span>
                      </div>
                      {control.last_tested_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Last Tested: {new Date(control.last_tested_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {control.next_test_date && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Next Test: {new Date(control.next_test_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {control.owner && (
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>Owner: {control.owner.first_name} {control.owner.last_name}</span>
                      </div>
                    )}

                    {control.business_unit && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Business Unit: {control.business_unit.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/controls/${control.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/controls/${control.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/controls/${control.id}/tests`)}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(control.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {controls.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No controls found</p>
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

export default ControlsList;
