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
  Calendar,
  User,
  Building,
  Award,
  FileText,
  TrendingUp,
  Target,
  Star,
  Layers
} from 'lucide-react';
import { itSecurityService, CMMCManagement, ITSecuritySearchParams } from '../../services/itSecurityService';
import { Link, useNavigate } from 'react-router-dom';

const CMMCManagementPage: React.FC = () => {
  const [cmmcPrograms, setCmmcPrograms] = useState<CMMCManagement[]>([]);
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
    loadCMMCPrograms();
  }, [searchParams]);

  const loadCMMCPrograms = async () => {
    try {
      setLoading(true);
      const response = await itSecurityService.cmmcManagement.getAll(searchParams);
      setCmmcPrograms(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CMMC programs');
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
    if (window.confirm('Are you sure you want to delete this CMMC program?')) {
      try {
        await itSecurityService.cmmcManagement.delete(id);
        loadCMMCPrograms();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete CMMC program');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'certified': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-blue-100 text-blue-800';
      case 'implementation': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'certified': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'surveillance': return 'bg-purple-100 text-purple-800';
      case 'not_certified': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-purple-100 text-purple-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAssessmentDue = (program: CMMCManagement) => {
    if (!program.next_assessment_date) return false;
    const dueDate = new Date(program.next_assessment_date);
    const today = new Date();
    return dueDate <= today;
  };

  const isCertificationDue = (program: CMMCManagement) => {
    if (!program.target_certification_date) return false;
    const dueDate = new Date(program.target_certification_date);
    const today = new Date();
    return dueDate <= today;
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
          <Button onClick={loadCMMCPrograms}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CMMC Management</h1>
          <p className="text-gray-600 mt-2">
            Manage Cybersecurity Maturity Model Certification (CMMC) programs for DoD compliance
          </p>
        </div>
        <Button onClick={() => navigate('/it-security/cmmc/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New CMMC Program
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
                placeholder="Search CMMC programs..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ status: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Statuses</option>
                    <option value="planning">Planning</option>
                    <option value="implementation">Implementation</option>
                    <option value="assessment">Assessment</option>
                    <option value="certified">Certified</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <Label>Certification Status</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ certification_status: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Certification Statuses</option>
                    <option value="not_certified">Not Certified</option>
                    <option value="in_progress">In Progress</option>
                    <option value="certified">Certified</option>
                    <option value="surveillance">Surveillance</option>
                  </select>
                </div>
                <div>
                  <Label>Target Level</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ target_level: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Levels</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                  </select>
                </div>
                <div>
                  <Label>Business Unit</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ business_unit: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Business Units</option>
                    {/* Add business unit options dynamically */}
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
                <p className="text-sm text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Certified</p>
                <p className="text-2xl font-bold">
                  {cmmcPrograms.filter(p => p.certification_status === 'certified').length}
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
                <p className="text-sm text-gray-600">Assessment Due</p>
                <p className="text-2xl font-bold">
                  {cmmcPrograms.filter(p => isAssessmentDue(p)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {cmmcPrograms.filter(p => p.status === 'implementation' || p.status === 'assessment').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CMMC Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle>CMMC 2.0 Levels Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                level: 1, 
                title: 'Foundational', 
                description: 'Basic cyber hygiene practices',
                practices: '17 practices',
                processes: 'Basic'
              },
              { 
                level: 2, 
                title: 'Advanced', 
                description: 'Intermediate cyber hygiene practices',
                practices: '110 practices',
                processes: 'Intermediate'
              },
              { 
                level: 3, 
                title: 'Expert', 
                description: 'Good cyber hygiene practices',
                practices: '110+ practices',
                processes: 'Good'
              }
            ].map((level) => (
              <div key={level.level} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 ${getLevelColor(level.level)} rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                    {level.level}
                  </div>
                  <div>
                    <h3 className="font-semibold">{level.title}</h3>
                    <p className="text-xs text-gray-600">{level.description}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Practices:</strong> {level.practices}</p>
                  <p><strong>Processes:</strong> {level.processes}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CMMC Programs List */}
      <Card>
        <CardHeader>
          <CardTitle>CMMC Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cmmcPrograms.map((program) => (
              <div
                key={program.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{program.title}</h3>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                      <Badge className={getCertificationStatusColor(program.certification_status)}>
                        {program.certification_status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getLevelColor(program.current_level)}>
                        Level {program.current_level}
                      </Badge>
                      <Badge className={getLevelColor(program.target_level)}>
                        Target: Level {program.target_level}
                      </Badge>
                      {isAssessmentDue(program) && (
                        <Badge className="bg-red-100 text-red-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Assessment Due
                        </Badge>
                      )}
                      {isCertificationDue(program) && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Target className="h-3 w-3 mr-1" />
                          Certification Due
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{program.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>ID: {program.cmmc_id}</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Scope: {program.scope}</span>
                      </div>
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 mr-2" />
                        <span>Current → Target: {program.current_level} → {program.target_level}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mt-2">
                      {program.implementation_start_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Started: {new Date(program.implementation_start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {program.certification_date && (
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          <span>Certified: {new Date(program.certification_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {program.next_assessment_date && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Next Assessment: {new Date(program.next_assessment_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {program.c3pao_company && (
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>C3PAO: {program.c3pao_company}</span>
                      </div>
                    )}

                    {program.cmmc_manager && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>CMMC Manager: {program.cmmc_manager.first_name} {program.cmmc_manager.last_name}</span>
                      </div>
                    )}

                    {program.business_unit && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Business Unit: {program.business_unit.name}</span>
                      </div>
                    )}

                    {program.gap_assessment_results && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">Gap Assessment Results:</p>
                        <p className="text-xs text-gray-600">{program.gap_assessment_results}</p>
                      </div>
                    )}

                    {program.corrective_actions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-orange-700 mb-1">Corrective Actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {program.corrective_actions.map((action, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-orange-600 border-orange-300">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/cmmc/${program.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/cmmc/${program.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {cmmcPrograms.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No CMMC programs found</p>
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

export default CMMCManagementPage;
