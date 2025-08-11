import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ThirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyContract } from '../../types/thirdPartyRiskManagement';
import { Plus, Search, Filter, Eye, Edit, FileText, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

const service = new ThirdPartyRiskManagementService();

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<ThirdPartyContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ThirdPartyContract | null>(null);
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Form state for creating/editing contracts
  const [formData, setFormData] = useState({
    third_party_id: '',
    contract_number: '',
    contract_type: 'service_agreement' as const,
    contract_title: '',
    contract_description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    renewal_date: '',
    status: 'draft' as const,
    contract_value: 0,
    currency: 'USD',
    payment_terms: '',
    payment_schedule: '',
    contract_manager_id: '',
    business_owner_id: '',
    legal_reviewer_id: '',
    contract_terms: '',
    service_level_agreements: '',
    key_performance_indicators: [] as string[],
    deliverables: [] as string[],
    termination_clauses: '',
    renewal_terms: '',
    insurance_requirements: '',
    compliance_requirements: [] as string[],
    security_requirements: [] as string[],
    audit_rights: '',
    data_processing_agreement: false,
    data_processing_activities: [] as string[],
    data_retention_period: 0,
    data_breach_notification_hours: 72,
    subcontractor_approval_required: false,
    subcontractors: [] as string[],
    contract_attachments: [] as string[],
    approval_workflow: '',
    risk_assessment_completed: false,
    risk_score: 0
  });

  useEffect(() => {
    loadContracts();
    loadThirdParties();
    loadUsers();
  }, [page]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const result = await service.getContracts(undefined, page, limit);
      if (result.error) {
        console.error('Error loading contracts:', result.error);
      } else {
        setContracts(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
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

  const handleCreateContract = async () => {
    try {
      // Note: We need to add createContract method to the service
      // For now, we'll show an alert
      alert('Contract creation functionality will be implemented with the service method');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Failed to create contract');
    }
  };

  const resetForm = () => {
    setFormData({
      third_party_id: '',
      contract_number: '',
      contract_type: 'service_agreement',
      contract_title: '',
      contract_description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      renewal_date: '',
      status: 'draft',
      contract_value: 0,
      currency: 'USD',
      payment_terms: '',
      payment_schedule: '',
      contract_manager_id: '',
      business_owner_id: '',
      legal_reviewer_id: '',
      contract_terms: '',
      service_level_agreements: '',
      key_performance_indicators: [],
      deliverables: [],
      termination_clauses: '',
      renewal_terms: '',
      insurance_requirements: '',
      compliance_requirements: [],
      security_requirements: [],
      audit_rights: '',
      data_processing_agreement: false,
      data_processing_activities: [],
      data_retention_period: 0,
      data_breach_notification_hours: 72,
      subcontractor_approval_required: false,
      subcontractors: [],
      contract_attachments: [],
      approval_workflow: '',
      risk_assessment_completed: false,
      risk_score: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'terminated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'terminated': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const isContractExpiringSoon = (endDate: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return end <= thirtyDaysFromNow && end >= now;
  };

  const isContractExpired = (endDate: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-2">Manage third-party contracts and agreements</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Contract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold text-green-600">
                  {contracts.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {contracts.filter(c => isContractExpiringSoon(c.end_date || '')).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {contracts.filter(c => isContractExpired(c.end_date || '')).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts ({total})</CardTitle>
          <CardDescription>Third-party contracts and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No contracts found</div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{contract.contract_title}</h3>
                        <Badge className={getStatusColor(contract.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(contract.status)}
                            {contract.status.toUpperCase()}
                          </div>
                        </Badge>
                        {isContractExpiringSoon(contract.end_date || '') && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            <Clock className="w-4 h-4" />
                            EXPIRING SOON
                          </Badge>
                        )}
                        {isContractExpired(contract.end_date || '') && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="w-4 h-4" />
                            EXPIRED
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{contract.contract_description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Contract #:</span> {contract.contract_number}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {contract.contract_type.replace('_', ' ')}
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span> {formatDate(contract.start_date)}
                        </div>
                        <div>
                          <span className="font-medium">End Date:</span> {formatDate(contract.end_date || '')}
                        </div>
                        {contract.contract_value && (
                          <div>
                            <span className="font-medium">Value:</span> {formatCurrency(contract.contract_value, contract.currency)}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Risk Score:</span> {contract.risk_score || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Risk Assessment:</span> {contract.risk_assessment_completed ? 'Completed' : 'Pending'}
                        </div>
                        <div>
                          <span className="font-medium">Data Processing:</span> {contract.data_processing_agreement ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContract(contract)}
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

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Contract</h2>
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
                <Label htmlFor="contract-number">Contract Number *</Label>
                <Input
                  id="contract-number"
                  value={formData.contract_number}
                  onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                  placeholder="CON-2024-001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contract-type">Contract Type *</Label>
                <select
                  id="contract-type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as any })}
                  required
                >
                  <option value="service_agreement">Service Agreement</option>
                  <option value="purchase_order">Purchase Order</option>
                  <option value="partnership">Partnership</option>
                  <option value="licensing">Licensing</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>

              <div>
                <Label htmlFor="contract-title">Contract Title *</Label>
                <Input
                  id="contract-title"
                  value={formData.contract_title}
                  onChange={(e) => setFormData({ ...formData, contract_title: e.target.value })}
                  placeholder="Contract title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="renewal-date">Renewal Date</Label>
                <Input
                  id="renewal-date"
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <Label htmlFor="contract-value">Contract Value</Label>
                <Input
                  id="contract-value"
                  type="number"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              <div>
                <Label htmlFor="contract-manager">Contract Manager</Label>
                <select
                  id="contract-manager"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.contract_manager_id}
                  onChange={(e) => setFormData({ ...formData, contract_manager_id: e.target.value })}
                >
                  <option value="">Select Contract Manager</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="business-owner">Business Owner</Label>
                <select
                  id="business-owner"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.business_owner_id}
                  onChange={(e) => setFormData({ ...formData, business_owner_id: e.target.value })}
                >
                  <option value="">Select Business Owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contract-description">Contract Description</Label>
                <Textarea
                  id="contract-description"
                  value={formData.contract_description}
                  onChange={(e) => setFormData({ ...formData, contract_description: e.target.value })}
                  placeholder="Brief description of the contract"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contract-terms">Contract Terms</Label>
                <Textarea
                  id="contract-terms"
                  value={formData.contract_terms}
                  onChange={(e) => setFormData({ ...formData, contract_terms: e.target.value })}
                  placeholder="Key terms and conditions"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="service-level-agreements">Service Level Agreements</Label>
                <Textarea
                  id="service-level-agreements"
                  value={formData.service_level_agreements}
                  onChange={(e) => setFormData({ ...formData, service_level_agreements: e.target.value })}
                  placeholder="SLA requirements and metrics"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Input
                  id="payment-terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="Net 30, upfront, etc."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="termination-clauses">Termination Clauses</Label>
                <Textarea
                  id="termination-clauses"
                  value={formData.termination_clauses}
                  onChange={(e) => setFormData({ ...formData, termination_clauses: e.target.value })}
                  placeholder="Termination conditions and procedures"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="renewal-terms">Renewal Terms</Label>
                <Textarea
                  id="renewal-terms"
                  value={formData.renewal_terms}
                  onChange={(e) => setFormData({ ...formData, renewal_terms: e.target.value })}
                  placeholder="Renewal conditions and procedures"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="data-processing-agreement"
                    checked={formData.data_processing_agreement}
                    onChange={(e) => setFormData({ ...formData, data_processing_agreement: e.target.checked })}
                  />
                  <Label htmlFor="data-processing-agreement">Data Processing Agreement Required</Label>
                </div>
              </div>

              {formData.data_processing_agreement && (
                <>
                  <div>
                    <Label htmlFor="data-retention-period">Data Retention Period (days)</Label>
                    <Input
                      id="data-retention-period"
                      type="number"
                      value={formData.data_retention_period}
                      onChange={(e) => setFormData({ ...formData, data_retention_period: parseInt(e.target.value) || 0 })}
                      placeholder="365"
                    />
                  </div>

                  <div>
                    <Label htmlFor="breach-notification-hours">Breach Notification (hours)</Label>
                    <Input
                      id="breach-notification-hours"
                      type="number"
                      value={formData.data_breach_notification_hours}
                      onChange={(e) => setFormData({ ...formData, data_breach_notification_hours: parseInt(e.target.value) || 72 })}
                      placeholder="72"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="subcontractor-approval"
                    checked={formData.subcontractor_approval_required}
                    onChange={(e) => setFormData({ ...formData, subcontractor_approval_required: e.target.checked })}
                  />
                  <Label htmlFor="subcontractor-approval">Subcontractor Approval Required</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateContract}>
                Create Contract
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Contract Details</h2>
              <Button variant="outline" onClick={() => setSelectedContract(null)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Title:</span> {selectedContract.contract_title}</div>
                  <div><span className="font-medium">Contract #:</span> {selectedContract.contract_number}</div>
                  <div><span className="font-medium">Type:</span> {selectedContract.contract_type.replace('_', ' ')}</div>
                  <div><span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedContract.status)}`}>
                      {selectedContract.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Start Date:</span> {formatDate(selectedContract.start_date)}</div>
                  <div><span className="font-medium">End Date:</span> {formatDate(selectedContract.end_date || '')}</div>
                  <div><span className="font-medium">Renewal Date:</span> {formatDate(selectedContract.renewal_date || '')}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Financial Information</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Contract Value:</span> {selectedContract.contract_value ? formatCurrency(selectedContract.contract_value, selectedContract.currency) : 'N/A'}</div>
                  <div><span className="font-medium">Currency:</span> {selectedContract.currency}</div>
                  <div><span className="font-medium">Payment Terms:</span> {selectedContract.payment_terms || 'N/A'}</div>
                  <div><span className="font-medium">Risk Score:</span> {selectedContract.risk_score || 'N/A'}</div>
                  <div><span className="font-medium">Risk Assessment:</span> {selectedContract.risk_assessment_completed ? 'Completed' : 'Pending'}</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedContract.contract_description || 'No description provided'}</p>
              </div>

              {selectedContract.contract_terms && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Contract Terms</h3>
                  <p className="text-gray-700">{selectedContract.contract_terms}</p>
                </div>
              )}

              {selectedContract.service_level_agreements && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Service Level Agreements</h3>
                  <p className="text-gray-700">{selectedContract.service_level_agreements}</p>
                </div>
              )}

              {selectedContract.termination_clauses && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Termination Clauses</h3>
                  <p className="text-gray-700">{selectedContract.termination_clauses}</p>
                </div>
              )}

              {selectedContract.renewal_terms && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Renewal Terms</h3>
                  <p className="text-gray-700">{selectedContract.renewal_terms}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Compliance & Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div><span className="font-medium">Data Processing Agreement:</span> {selectedContract.data_processing_agreement ? 'Yes' : 'No'}</div>
                    <div><span className="font-medium">Data Retention Period:</span> {selectedContract.data_retention_period || 'N/A'} days</div>
                    <div><span className="font-medium">Breach Notification:</span> {selectedContract.data_breach_notification_hours || 'N/A'} hours</div>
                  </div>
                  <div>
                    <div><span className="font-medium">Subcontractor Approval:</span> {selectedContract.subcontractor_approval_required ? 'Required' : 'Not Required'}</div>
                    <div><span className="font-medium">Audit Rights:</span> {selectedContract.audit_rights || 'N/A'}</div>
                    <div><span className="font-medium">Insurance Requirements:</span> {selectedContract.insurance_requirements || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedContract(null)}>
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

export default ContractManagement;
