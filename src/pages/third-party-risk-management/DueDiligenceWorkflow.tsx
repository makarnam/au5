import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ThirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyDueDiligence, ThirdPartyDueDiligenceFormData } from '../../types/thirdPartyRiskManagement';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Edit, 
  Plus, 
  Filter,
  Users,
  Calendar,
  Target,
  BarChart3,
  Download,
  ArrowRight,
  CheckSquare,
  Square,
  UserCheck,
  UserX,
  FileCheck,
  Shield,
  DollarSign,
  Building,
  Lock
} from 'lucide-react';

const service = new ThirdPartyRiskManagementService();

const DueDiligenceWorkflow: React.FC = () => {
  const [dueDiligenceData, setDueDiligenceData] = useState<ThirdPartyDueDiligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedThirdParty, setSelectedThirdParty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDueDiligence, setSelectedDueDiligence] = useState<ThirdPartyDueDiligence | null>(null);

  // Form state for creating due diligence records
  const [formData, setFormData] = useState<ThirdPartyDueDiligenceFormData>({
    third_party_id: '',
    due_diligence_type: 'financial',
    due_diligence_date: new Date().toISOString().split('T')[0],
    status: 'planned',
    responsible_person_id: '',
    review_team: [],
    financial_review_completed: false,
    legal_review_completed: false,
    operational_review_completed: false,
    security_review_completed: false,
    compliance_review_completed: false,
    financial_risk_score: null,
    legal_risk_score: null,
    operational_risk_score: null,
    security_risk_score: null,
    compliance_risk_score: null,
    overall_risk_score: null,
    risk_level: 'medium',
    findings_summary: '',
    recommendations: '',
    approval_decision: 'requires_further_review',
    approval_conditions: [],
    approval_date: '',
    approved_by: ''
  });

  useEffect(() => {
    loadDueDiligenceData();
    loadThirdParties();
    loadUsers();
  }, [page, selectedThirdParty, selectedStatus]);

  const loadDueDiligenceData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedThirdParty) filters.third_party_id = selectedThirdParty;
      if (selectedStatus) filters.status = [selectedStatus];

      const result = await service.getDueDiligence(filters, page, limit);
      if (!result.error) {
        setDueDiligenceData(result.data);
        setTotal(result.total);
      } else {
        console.error('Error loading due diligence data:', result.error);
      }
    } catch (error) {
      console.error('Error loading due diligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThirdParties = async () => {
    try {
      const result = await service.getThirdParties();
      if (!result.error) {
        setThirdParties(result.data);
      }
    } catch (error) {
      console.error('Error loading third parties:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await service.getUsers();
      if (!result.error) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateDueDiligence = async () => {
    try {
      const result = await service.createDueDiligence(formData);
      if (!result.error) {
        setShowCreateModal(false);
        resetForm();
        // Reload the data to show the new record
        await loadDueDiligenceData();
      } else {
        console.error('Error creating due diligence record:', result.error);
        alert('Failed to create due diligence record');
      }
    } catch (error) {
      console.error('Error creating due diligence record:', error);
      alert('Failed to create due diligence record');
    }
  };

  const resetForm = () => {
    setFormData({
      third_party_id: '',
      due_diligence_type: 'financial',
      due_diligence_date: new Date().toISOString().split('T')[0],
      status: 'planned',
      responsible_person_id: '',
      review_team: [],
      financial_review_completed: false,
      legal_review_completed: false,
      operational_review_completed: false,
      security_review_completed: false,
      compliance_review_completed: false,
      financial_risk_score: null,
      legal_risk_score: null,
      operational_risk_score: null,
      security_risk_score: null,
      compliance_risk_score: null,
      overall_risk_score: null,
      risk_level: 'medium',
      findings_summary: '',
      recommendations: '',
      approval_decision: 'requires_further_review',
      approval_conditions: [],
      approval_date: '',
      approved_by: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'planned': return <Calendar className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved_with_conditions': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'requires_further_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateCompletionPercentage = (dueDiligence: ThirdPartyDueDiligence) => {
    const reviews = [
      dueDiligence.financial_review_completed,
      dueDiligence.legal_review_completed,
      dueDiligence.operational_review_completed,
      dueDiligence.security_review_completed,
      dueDiligence.compliance_review_completed
    ];
    const completed = reviews.filter(review => review).length;
    return Math.round((completed / reviews.length) * 100);
  };

  const filteredData = dueDiligenceData.filter(item => {
    if (selectedThirdParty && item.third_party_id !== selectedThirdParty) return false;
    if (selectedStatus && item.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Due Diligence Workflow</h1>
          <p className="text-gray-600 mt-2">Manage third-party due diligence processes and approvals</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Start Due Diligence
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="third-party-filter">Third Party</Label>
              <select
                id="third-party-filter"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedThirdParty}
                onChange={(e) => setSelectedThirdParty(e.target.value)}
              >
                <option value="">All Third Parties</option>
                {thirdParties.map((tp) => (
                  <option key={tp.id} value={tp.id}>{tp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Due Diligence</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-xs text-gray-500">All processes</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredData.filter(item => item.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-500">Active reviews</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredData.filter(item => item.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500">Finished reviews</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredData.filter(item => item.approval_decision === 'approved').length}
                </p>
                <p className="text-xs text-gray-500">Successful approvals</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Diligence List */}
      <Card>
        <CardHeader>
          <CardTitle>Due Diligence Processes ({filteredData.length})</CardTitle>
          <CardDescription>Third-party due diligence workflows and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading due diligence data...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No due diligence processes found</div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((dueDiligence) => (
                <div key={dueDiligence.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {(dueDiligence as any).third_parties?.name || (dueDiligence as any).third_parties?.legal_name || 'Unknown Third Party'}
                        </h3>
                        <Badge className={getStatusColor(dueDiligence.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(dueDiligence.status)}
                            {dueDiligence.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                        <Badge variant="outline">
                          {dueDiligence.due_diligence_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {dueDiligence.overall_risk_score > 0 && (
                          <Badge className={getRiskLevelColor(dueDiligence.risk_level)}>
                            {dueDiligence.risk_level.toUpperCase()} RISK
                          </Badge>
                        )}
                        {dueDiligence.approval_decision && dueDiligence.approval_decision !== 'requires_further_review' && (
                          <Badge className={getApprovalDecisionColor(dueDiligence.approval_decision)}>
                            {dueDiligence.approval_decision.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Completion Progress</span>
                          <span>{calculateCompletionPercentage(dueDiligence)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${calculateCompletionPercentage(dueDiligence)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Due Diligence Date:</span> {formatDate(dueDiligence.due_diligence_date)}
                        </div>
                        <div>
                          <span className="font-medium">Responsible Person:</span> {(dueDiligence as any).responsible_person?.email || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Review Team:</span> {dueDiligence.review_team.length} members
                        </div>
                        <div>
                          <span className="font-medium">Overall Risk Score:</span> {dueDiligence.overall_risk_score || 'Pending'}
                        </div>
                        <div>
                          <span className="font-medium">Financial Review:</span> {dueDiligence.financial_review_completed ? 'Completed' : 'Pending'}
                        </div>
                        <div>
                          <span className="font-medium">Legal Review:</span> {dueDiligence.legal_review_completed ? 'Completed' : 'Pending'}
                        </div>
                        <div>
                          <span className="font-medium">Operational Review:</span> {dueDiligence.operational_review_completed ? 'Completed' : 'Pending'}
                        </div>
                        <div>
                          <span className="font-medium">Security Review:</span> {dueDiligence.security_review_completed ? 'Completed' : 'Pending'}
                        </div>
                      </div>

                      {dueDiligence.findings_summary && (
                        <p className="text-gray-600 mt-2 text-sm">{dueDiligence.findings_summary}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDueDiligence(dueDiligence)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Due Diligence Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Start Due Diligence Process</h2>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="third-party-select">Third Party *</Label>
                <select
                  id="third-party-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.third_party_id}
                  onChange={(e) => setFormData({ ...formData, third_party_id: e.target.value })}
                  required
                >
                  <option value="">Select Third Party</option>
                  {thirdParties.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="due-diligence-type">Due Diligence Type *</Label>
                <select
                  id="due-diligence-type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.due_diligence_type}
                  onChange={(e) => setFormData({ ...formData, due_diligence_type: e.target.value as any })}
                  required
                >
                  <option value="financial">Financial</option>
                  <option value="legal">Legal</option>
                  <option value="operational">Operational</option>
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>

              <div>
                <Label htmlFor="due-diligence-date">Due Diligence Date *</Label>
                <Input
                  id="due-diligence-date"
                  type="date"
                  value={formData.due_diligence_date}
                  onChange={(e) => setFormData({ ...formData, due_diligence_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsible-person">Responsible Person *</Label>
                <select
                  id="responsible-person"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.responsible_person_id}
                  onChange={(e) => setFormData({ ...formData, responsible_person_id: e.target.value })}
                  required
                >
                  <option value="">Select Responsible Person</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="review-team">Review Team Members</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={formData.review_team.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, review_team: [...formData.review_team, user.id] });
                          } else {
                            setFormData({ ...formData, review_team: formData.review_team.filter(id => id !== user.id) });
                          }
                        }}
                      />
                      <Label htmlFor={`user-${user.id}`} className="text-sm">{user.email}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-3">Review Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="financial-review"
                      checked={formData.financial_review_completed}
                      onChange={(e) => setFormData({ ...formData, financial_review_completed: e.target.checked })}
                    />
                    <Label htmlFor="financial-review">Financial Review</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="legal-review"
                      checked={formData.legal_review_completed}
                      onChange={(e) => setFormData({ ...formData, legal_review_completed: e.target.checked })}
                    />
                    <Label htmlFor="legal-review">Legal Review</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="operational-review"
                      checked={formData.operational_review_completed}
                      onChange={(e) => setFormData({ ...formData, operational_review_completed: e.target.checked })}
                    />
                    <Label htmlFor="operational-review">Operational Review</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="security-review"
                      checked={formData.security_review_completed}
                      onChange={(e) => setFormData({ ...formData, security_review_completed: e.target.checked })}
                    />
                    <Label htmlFor="security-review">Security Review</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="compliance-review"
                      checked={formData.compliance_review_completed}
                      onChange={(e) => setFormData({ ...formData, compliance_review_completed: e.target.checked })}
                    />
                    <Label htmlFor="compliance-review">Compliance Review</Label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="findings-summary">Initial Findings Summary</Label>
                <Textarea
                  id="findings-summary"
                  value={formData.findings_summary}
                  onChange={(e) => setFormData({ ...formData, findings_summary: e.target.value })}
                  placeholder="Summary of initial findings and observations"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="recommendations">Initial Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="Initial recommendations and next steps"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDueDiligence}>
                Start Due Diligence
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Due Diligence Detail Modal */}
      {selectedDueDiligence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Due Diligence Details</h2>
              <Button variant="outline" onClick={() => setSelectedDueDiligence(null)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Third Party:</span> {(selectedDueDiligence as any).third_parties?.name || (selectedDueDiligence as any).third_parties?.legal_name || 'Unknown'}</div>
                  <div><span className="font-medium">Type:</span> {selectedDueDiligence.due_diligence_type.replace('_', ' ')}</div>
                  <div><span className="font-medium">Date:</span> {formatDate(selectedDueDiligence.due_diligence_date)}</div>
                  <div><span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedDueDiligence.status)}`}>
                      {selectedDueDiligence.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Responsible Person:</span> {(selectedDueDiligence as any).responsible_person?.email || 'N/A'}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Risk Assessment</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Overall Risk Score:</span> {selectedDueDiligence.overall_risk_score || 'Pending'}</div>
                  <div><span className="font-medium">Risk Level:</span>
                    <Badge className={`ml-2 ${getRiskLevelColor(selectedDueDiligence.risk_level)}`}>
                      {selectedDueDiligence.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Financial Risk:</span> {selectedDueDiligence.financial_risk_score || 'Pending'}</div>
                  <div><span className="font-medium">Legal Risk:</span> {selectedDueDiligence.legal_risk_score || 'Pending'}</div>
                  <div><span className="font-medium">Operational Risk:</span> {selectedDueDiligence.operational_risk_score || 'Pending'}</div>
                  <div><span className="font-medium">Security Risk:</span> {selectedDueDiligence.security_risk_score || 'Pending'}</div>
                  <div><span className="font-medium">Compliance Risk:</span> {selectedDueDiligence.compliance_risk_score || 'Pending'}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Review Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {selectedDueDiligence.financial_review_completed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                    <span>Financial Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDueDiligence.legal_review_completed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                    <span>Legal Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDueDiligence.operational_review_completed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                    <span>Operational Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDueDiligence.security_review_completed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                    <span>Security Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDueDiligence.compliance_review_completed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                    <span>Compliance Review</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Approval Information</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Decision:</span>
                    <Badge className={`ml-2 ${getApprovalDecisionColor(selectedDueDiligence.approval_decision)}`}>
                      {selectedDueDiligence.approval_decision.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Approval Date:</span> {formatDate(selectedDueDiligence.approval_date)}</div>
                  <div><span className="font-medium">Approved By:</span> {(selectedDueDiligence as any).approved_by_user?.email || 'N/A'}</div>
                </div>
              </div>

              {selectedDueDiligence.findings_summary && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Findings Summary</h3>
                  <p className="text-gray-700">{selectedDueDiligence.findings_summary}</p>
                </div>
              )}

              {selectedDueDiligence.recommendations && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <p className="text-gray-700">{selectedDueDiligence.recommendations}</p>
                </div>
              )}

              {selectedDueDiligence.approval_conditions && selectedDueDiligence.approval_conditions.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Approval Conditions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedDueDiligence.approval_conditions.map((condition, index) => (
                      <li key={index} className="text-gray-700">{condition}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Review Team</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDueDiligence.review_team.map((userId) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <Badge key={userId} variant="outline">
                        {user?.email || userId}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedDueDiligence(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueDiligenceWorkflow;
