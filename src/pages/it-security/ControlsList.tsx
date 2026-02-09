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
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  TestTube,
  Calendar,
  User,
  Building,
  Zap,
  RefreshCw,
  ArrowRight,
  Lock
} from 'lucide-react';
import { itControlService } from '../../services/itSecurityService';
import { ITControl, ITSecuritySearchParams } from '../../types/itSecurity';
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
      const response = await itControlService.getAll(searchParams);
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
        await itControlService.delete(id);
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
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">IT Security Controls</h1>
          <p className="text-gray-600 text-lg">
            Manage and monitor IT security controls across your organization
          </p>
        </div>
        <Button 
          onClick={() => navigate('/it-security/controls/create')}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Control
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
                  placeholder="Search controls..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t"
                >
                  <div>
                    <Label className="font-medium">Implementation Status</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <Label className="font-medium">Control Type</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <Label className="font-medium">Category</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <Label className="font-medium">Framework</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Controls</p>
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
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Implemented</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {controls.filter(c => c.implementation_status === 'implemented' || c.implementation_status === 'operational').length}
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
                  <p className="text-sm text-gray-600 font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {controls.filter(c => c.implementation_status === 'in_progress').length}
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
          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Automated</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {controls.filter(c => c.automated).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Controls List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {controls.map((control) => (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: parseInt(control.id) * 0.05 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{control.title}</h3>
                        <Badge className={getImplementationStatusColor(control.implementation_status)} variant="secondary">
                          {control.implementation_status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getControlTypeColor(control.control_type)} variant="secondary">
                          {control.control_type}
                        </Badge>
                        <Badge className={getCategoryColor(control.category)} variant="secondary">
                          {control.category.replace('_', ' ')}
                        </Badge>
                        {control.automated && (
                          <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                            <Zap className="h-3 w-3 mr-1" />
                            Automated
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{control.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Code: {control.control_code}</span>
                        </div>
                        {control.framework && (
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-green-500" />
                            <span>Framework: {control.framework.replace('_', ' ').toUpperCase()}</span>
                          </div>
                        )}
                        {control.effectiveness && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                            <span>Effectiveness: {control.effectiveness.replace('_', ' ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <TestTube className="h-4 w-4 mr-2 text-orange-500" />
                          <span>Testing: {control.testing_frequency.replace('_', ' ')}</span>
                        </div>
                        {control.last_tested_date && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span>Last Tested: {new Date(control.last_tested_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {control.next_test_date && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>Next Test: {new Date(control.next_test_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {control.owner && (
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          <span>Owner: <span className="font-medium">{control.owner.first_name} {control.owner.last_name}</span></span>
                        </div>
                      )}

                      {control.business_unit && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Building className="h-4 w-4 mr-2 text-orange-500" />
                          <span>Business Unit: <span className="font-medium">{control.business_unit.name}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/it-security/controls/${control.id}`)}
                        className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/it-security/controls/${control.id}/edit`)}
                        className="hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/it-security/controls/${control.id}/tests`)}
                        className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(control.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {controls.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-50 rounded-full inline-block mb-4">
                    <Shield className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No controls found</p>
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
                    className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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
                    className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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

export default ControlsList;
