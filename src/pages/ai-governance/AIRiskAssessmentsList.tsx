import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { aiGovernanceService } from '../../services/aiGovernanceService';
import { AIRiskAssessment, AIGovernanceSearchParams } from '../../types/aiGovernance';
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
  Target,
  BarChart3
} from 'lucide-react';

const AIRiskAssessmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AIRiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    risk_level: '',
    assessment_type: '',
    risk_domain: '',
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
    loadAssessments();
  }, [pagination.page, searchQuery, filters]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const searchParams: AIGovernanceSearchParams = {
        query: searchQuery || undefined,
        page: pagination.page,
        page_size: pagination.pageSize,
        filters: {
          risk_level: filters.risk_level ? [filters.risk_level] : undefined,
          assessment_type: filters.assessment_type ? [filters.assessment_type] : undefined,
          risk_domain: filters.risk_domain ? [filters.risk_domain] : undefined,
          status: filters.status ? [filters.status] : undefined
        }
      };

      const response = await aiGovernanceService.getAIRiskAssessments(searchParams);
      setAssessments(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;

    try {
      await aiGovernanceService.deleteAIRiskAssessment(id);
      loadAssessments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setFilters({
      risk_level: '',
      assessment_type: '',
      risk_domain: '',
      status: ''
    });
  };

  if (loading && assessments.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">AI Risk Assessments</h1>
          <p className="text-gray-600 mt-2">
            Manage and track risk assessments for AI models
          </p>
        </div>
        <Button
          onClick={() => navigate('/ai-governance/assessments/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Assessment
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
                placeholder="Search assessments..."
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Risk Level
                  </label>
                  <select
                    value={filters.risk_level}
                    onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Assessment Type
                  </label>
                  <select
                    value={filters.assessment_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, assessment_type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="initial">Initial</option>
                    <option value="periodic">Periodic</option>
                    <option value="change_triggered">Change Triggered</option>
                    <option value="incident_triggered">Incident Triggered</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Risk Domain
                  </label>
                  <select
                    value={filters.risk_domain}
                    onChange={(e) => setFilters(prev => ({ ...prev, risk_domain: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Domains</option>
                    <option value="privacy">Privacy</option>
                    <option value="security">Security</option>
                    <option value="bias">Bias</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="reliability">Reliability</option>
                    <option value="transparency">Transparency</option>
                    <option value="accountability">Accountability</option>
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
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {loading ? (
        <LoadingSpinner />
      ) : assessments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => f)
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first risk assessment'
              }
            </p>
            <Button
              onClick={() => navigate('/ai-governance/assessments/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{assessment.assessment_name}</h3>
                      <Badge className={getRiskLevelColor(assessment.risk_level)}>
                        {assessment.risk_level.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        <span>Domain: {assessment.risk_domain}</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span>Type: {assessment.assessment_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Date: {new Date(assessment.assessment_date).toLocaleDateString()}</span>
                      </div>
                      {assessment.assessor && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Assessor: {assessment.assessor.first_name} {assessment.assessor.last_name}</span>
                        </div>
                      )}
                    </div>

                    {assessment.findings && (
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {assessment.findings}
                      </p>
                    )}

                    {assessment.model && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Model:</span> {assessment.model.name} ({assessment.model.model_type})
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/ai-governance/assessments/${assessment.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/ai-governance/assessments/${assessment.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(assessment.id)}
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
            {pagination.total} assessments
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

export default AIRiskAssessmentsList;
