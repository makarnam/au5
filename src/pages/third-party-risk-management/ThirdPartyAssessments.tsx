import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Calendar,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyAssessment, ThirdPartyAssessmentFilters } from '../../types/thirdPartyRiskManagement';
import { Link } from 'react-router-dom';

const ThirdPartyAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<ThirdPartyAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ThirdPartyAssessmentFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<ThirdPartyAssessment | null>(null);

  const assessmentTypes = ['initial', 'periodic', 'incident_based', 'contract_renewal'];
  const statuses = ['draft', 'in_progress', 'completed', 'approved', 'rejected'];
  const riskLevels = ['low', 'medium', 'high', 'critical'];

  useEffect(() => {
    loadAssessments();
    loadThirdParties();
    loadUsers();
  }, [page, filters]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const result = await thirdPartyRiskManagementService.getAssessments(filters, page, 10);
      
      if (result.error) {
        console.error('Assessment loading error:', result.error);
        throw new Error('Failed to load assessments');
      }

      setAssessments(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Assessment loading error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadThirdParties = async () => {
    try {
      const result = await thirdPartyRiskManagementService.getThirdParties();
      if (!result.error) {
        setThirdParties(result.data);
      }
    } catch (err) {
      console.error('Failed to load third parties:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await thirdPartyRiskManagementService.getUsers();
      if (!result.error) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleFilterChange = (key: keyof ThirdPartyAssessmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssessmentTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'initial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'periodic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'incident_based': return 'bg-red-100 text-red-800 border-red-200';
      case 'contract_renewal': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && assessments.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Third Party Assessments</h1>
          <p className="text-gray-600 mt-2">Manage and track vendor risk assessments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link to="/third-party-risk-management/assessments/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Third Party
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.third_party_id || ''}
                  onChange={(e) => handleFilterChange('third_party_id', e.target.value || undefined)}
                >
                  <option value="">All Third Parties</option>
                  {thirdParties.map(party => (
                    <option key={party.id} value={party.id}>
                      {party.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.assessment_type?.[0] || ''}
                  onChange={(e) => handleFilterChange('assessment_type', e.target.value ? [e.target.value] : undefined)}
                >
                  <option value="">All Types</option>
                  {assessmentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : undefined)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.risk_level?.[0] || ''}
                  onChange={(e) => handleFilterChange('risk_level', e.target.value ? [e.target.value] : undefined)}
                >
                  <option value="">All Risk Levels</option>
                  {riskLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessor
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={filters.assessor_id || ''}
                  onChange={(e) => handleFilterChange('assessor_id', e.target.value || undefined)}
                >
                  <option value="">All Assessors</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Assessments ({total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assessment.third_parties?.name || 'Unknown Third Party'}
                      </h3>
                      <Badge className={getAssessmentTypeColor(assessment.assessment_type)}>
                        {assessment.assessment_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {assessment.risk_level && (
                        <Badge className={getRiskLevelColor(assessment.risk_level)}>
                          {assessment.risk_level.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {assessment.overall_risk_score && (
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Risk Score: {assessment.overall_risk_score}
                          </span>
                        </div>
                      )}

                      {assessment.assessor_id && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {users.find(u => u.id === assessment.assessor_id)?.first_name} {users.find(u => u.id === assessment.assessor_id)?.last_name}
                          </span>
                        </div>
                      )}

                      {assessment.follow_up_required && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-red-600">Follow-up Required</span>
                        </div>
                      )}
                    </div>

                    {assessment.findings_summary && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {assessment.findings_summary}
                      </p>
                    )}

                    {assessment.recommendations && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        <strong>Recommendations:</strong> {assessment.recommendations}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/third-party-risk-management/assessments/${assessment.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * 10 >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">
                Assessment Details - {selectedAssessment.third_parties?.name}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssessment(null)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assessment Type</label>
                  <p className="text-sm text-gray-900">
                    {selectedAssessment.assessment_type.replace('_', ' ').charAt(0).toUpperCase() + selectedAssessment.assessment_type.replace('_', ' ').slice(1)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assessment Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedAssessment.assessment_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-gray-900">
                    {selectedAssessment.status.replace('_', ' ').charAt(0).toUpperCase() + selectedAssessment.status.replace('_', ' ').slice(1)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                  <p className="text-sm text-gray-900">
                    {selectedAssessment.risk_level ? selectedAssessment.risk_level.charAt(0).toUpperCase() + selectedAssessment.risk_level.slice(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Overall Risk Score</label>
                  <p className="text-sm text-gray-900">
                    {selectedAssessment.overall_risk_score || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Follow-up Required</label>
                  <p className="text-sm text-gray-900">
                    {selectedAssessment.follow_up_required ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {selectedAssessment.financial_risk_score && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Financial Risk Score</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.financial_risk_score}</p>
                </div>
              )}

              {selectedAssessment.operational_risk_score && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operational Risk Score</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.operational_risk_score}</p>
                </div>
              )}

              {selectedAssessment.compliance_risk_score && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Compliance Risk Score</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.compliance_risk_score}</p>
                </div>
              )}

              {selectedAssessment.security_risk_score && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Security Risk Score</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.security_risk_score}</p>
                </div>
              )}

              {selectedAssessment.findings_summary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Findings Summary</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.findings_summary}</p>
                </div>
              )}

              {selectedAssessment.recommendations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.recommendations}</p>
                </div>
              )}

              {selectedAssessment.mitigation_actions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mitigation Actions</label>
                  <p className="text-sm text-gray-900">{selectedAssessment.mitigation_actions}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedAssessment(null)}
              >
                Close
              </Button>
              <Button asChild>
                <Link to={`/third-party-risk-management/assessments/${selectedAssessment.id}/edit`}>
                  Edit Assessment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyAssessments;
