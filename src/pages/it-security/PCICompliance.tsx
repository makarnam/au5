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
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Building,
  Shield,
  TrendingUp,
  FileText,
  Award
} from 'lucide-react';
import { itSecurityService, PCICompliance, ITSecuritySearchParams } from '../../services/itSecurityService';
import { Link, useNavigate } from 'react-router-dom';

const PCICompliancePage: React.FC = () => {
  const [assessments, setAssessments] = useState<PCICompliance[]>([]);
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
    loadAssessments();
  }, [searchParams]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await itSecurityService.pciCompliance.getAll(searchParams);
      setAssessments(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PCI assessments');
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
    if (window.confirm('Are you sure you want to delete this PCI assessment?')) {
      try {
        await itSecurityService.pciCompliance.delete(id);
        loadAssessments();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete PCI assessment');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'remediated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMerchantLevelColor = (level: string) => {
    switch (level) {
      case 'level_1': return 'bg-red-100 text-red-800';
      case 'level_2': return 'bg-orange-100 text-orange-800';
      case 'level_3': return 'bg-yellow-100 text-yellow-800';
      case 'level_4': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssessmentTypeColor = (type: string) => {
    switch (type) {
      case 'roc': return 'bg-blue-100 text-blue-800';
      case 'saq_a': return 'bg-green-100 text-green-800';
      case 'saq_b': return 'bg-purple-100 text-purple-800';
      case 'saq_c': return 'bg-orange-100 text-orange-800';
      case 'saq_d': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isAssessmentDue = (assessment: PCICompliance) => {
    if (!assessment.next_assessment_date) return false;
    const dueDate = new Date(assessment.next_assessment_date);
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
          <Button onClick={loadAssessments}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PCI DSS Compliance</h1>
          <p className="text-gray-600 mt-2">
            Manage Payment Card Industry Data Security Standard compliance assessments
          </p>
        </div>
        <Button onClick={() => navigate('/it-security/pci-compliance/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
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
                placeholder="Search PCI assessments..."
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
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="remediated">Remediated</option>
                  </select>
                </div>
                <div>
                  <Label>Assessment Type</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ type: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Types</option>
                    <option value="roc">ROC</option>
                    <option value="saq_a">SAQ A</option>
                    <option value="saq_b">SAQ B</option>
                    <option value="saq_c">SAQ C</option>
                    <option value="saq_d">SAQ D</option>
                  </select>
                </div>
                <div>
                  <Label>Merchant Level</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ merchant_level: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Levels</option>
                    <option value="level_1">Level 1</option>
                    <option value="level_2">Level 2</option>
                    <option value="level_3">Level 3</option>
                    <option value="level_4">Level 4</option>
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
              <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Assessments</p>
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
                <p className="text-sm text-gray-600">Compliant</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'completed' && (a.compliance_score || 0) >= 90).length}
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
                <p className="text-sm text-gray-600">Due for Assessment</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => isAssessmentDue(a)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg. Compliance Score</p>
                <p className="text-2xl font-bold">
                  {assessments.length > 0 
                    ? Math.round(assessments.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / assessments.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PCI DSS Requirements Overview */}
      <Card>
        <CardHeader>
          <CardTitle>PCI DSS Requirements Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 1, title: 'Build and Maintain a Secure Network', description: 'Install and maintain a firewall configuration to protect cardholder data' },
              { id: 2, title: 'Protect Cardholder Data', description: 'Protect stored cardholder data and encrypt transmission of cardholder data' },
              { id: 3, title: 'Maintain Vulnerability Management', description: 'Use and regularly update anti-virus software and develop secure systems' },
              { id: 4, title: 'Implement Strong Access Control', description: 'Restrict access to cardholder data and assign unique IDs to each user' },
              { id: 5, title: 'Monitor and Test Networks', description: 'Track and monitor all access to network resources and cardholder data' },
              { id: 6, title: 'Maintain Information Security Policy', description: 'Maintain a policy that addresses information security' }
            ].map((requirement) => (
              <div key={requirement.id} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {requirement.id}
                  </div>
                  <h3 className="font-semibold text-sm">{requirement.title}</h3>
                </div>
                <p className="text-xs text-gray-600">{requirement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>PCI Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{assessment.title}</h3>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getMerchantLevelColor(assessment.merchant_level)}>
                        Level {assessment.merchant_level.replace('level_', '')}
                      </Badge>
                      <Badge className={getAssessmentTypeColor(assessment.assessment_type)}>
                        {assessment.assessment_type.toUpperCase()}
                      </Badge>
                      {isAssessmentDue(assessment) && (
                        <Badge className="bg-red-100 text-red-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Due
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{assessment.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>ID: {assessment.assessment_id}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>PCI DSS v{assessment.pci_dss_version}</span>
                      </div>
                      {assessment.compliance_score !== null && (
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          <span className={getComplianceScoreColor(assessment.compliance_score)}>
                            Score: {assessment.compliance_score}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mt-2">
                      {assessment.start_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Start: {new Date(assessment.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {assessment.end_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>End: {new Date(assessment.end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {assessment.next_assessment_date && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Next: {new Date(assessment.next_assessment_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {assessment.qsa_company && (
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>QSA: {assessment.qsa_company}</span>
                      </div>
                    )}

                    {assessment.business_unit && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Business Unit: {assessment.business_unit.name}</span>
                      </div>
                    )}

                    {assessment.non_compliant_requirements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-700 mb-1">Non-Compliant Requirements:</p>
                        <div className="flex flex-wrap gap-1">
                          {assessment.non_compliant_requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-red-600 border-red-300">
                              {req}
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
                      onClick={() => navigate(`/it-security/pci-compliance/${assessment.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/pci-compliance/${assessment.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(assessment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {assessments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No PCI assessments found</p>
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

export default PCICompliancePage;
