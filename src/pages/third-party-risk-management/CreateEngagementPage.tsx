import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { ThirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyEngagementFormData, ThirdParty } from '../../types/thirdPartyRiskManagement';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const service = new ThirdPartyRiskManagementService();

const CreateEngagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<ThirdPartyEngagementFormData>({
    third_party_id: '',
    engagement_type: 'contract',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium',
    business_unit_id: '',
    project_manager_id: '',
    contract_manager_id: '',
    contract_number: '',
    contract_value: undefined,
    currency: 'USD',
    payment_schedule: '',
    deliverables: [],
    key_performance_indicators: [],
    service_level_agreements: '',
    termination_clauses: '',
    renewal_terms: '',
    risk_mitigation_measures: '',
    compliance_requirements: [],
    security_requirements: [],
    insurance_requirements: '',
    audit_rights: '',
    data_processing_agreement: false,
    data_processing_activities: [],
    data_retention_period: undefined,
    data_breach_notification_hours: undefined,
    subcontractor_approval_required: false,
    subcontractors: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newKPI, setNewKPI] = useState('');
  const [newComplianceReq, setNewComplianceReq] = useState('');
  const [newSecurityReq, setNewSecurityReq] = useState('');
  const [newDataActivity, setNewDataActivity] = useState('');
  const [newSubcontractor, setNewSubcontractor] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load third parties
      const thirdPartiesResult = await service.getThirdParties();
      if (thirdPartiesResult.data) {
        setThirdParties(thirdPartiesResult.data);
      }

      // Load business units
      const businessUnitsResult = await service.getBusinessUnits();
      if (businessUnitsResult.data) {
        setBusinessUnits(businessUnitsResult.data);
      }

      // Load users
      const usersResult = await service.getUsers();
      if (usersResult.data) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.third_party_id) {
      newErrors.third_party_id = 'Third party is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (formData.contract_value !== undefined && formData.contract_value < 0) {
      newErrors.contract_value = 'Contract value must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await service.createEngagement(formData);
      if (result.data) {
        navigate('/third-party-risk-management/engagements');
      } else {
        console.error('Error creating engagement:', result.error);
      }
    } catch (error) {
      console.error('Error creating engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ThirdPartyEngagementFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addArrayItem = (field: keyof ThirdPartyEngagementFormData, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[] || [];
      handleInputChange(field, [...currentArray, value.trim()]);
      setter('');
    }
  };

  const removeArrayItem = (field: keyof ThirdPartyEngagementFormData, index: number) => {
    const currentArray = formData[field] as string[] || [];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/third-party-risk-management/engagements">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Engagements
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Engagement</h1>
          <p className="text-gray-600 mt-2">Set up a new third-party engagement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="third_party_id">Third Party *</Label>
                <select
                  id="third_party_id"
                  className={`w-full p-2 border rounded-md ${errors.third_party_id ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.third_party_id}
                  onChange={(e) => handleInputChange('third_party_id', e.target.value)}
                >
                  <option value="">Select Third Party</option>
                  {thirdParties.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
                {errors.third_party_id && <p className="text-red-500 text-sm mt-1">{errors.third_party_id}</p>}
              </div>

              <div>
                <Label htmlFor="engagement_type">Engagement Type *</Label>
                <select
                  id="engagement_type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.engagement_type}
                  onChange={(e) => handleInputChange('engagement_type', e.target.value)}
                >
                  <option value="contract">Contract</option>
                  <option value="project">Project</option>
                  <option value="service">Service</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter engagement title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the engagement"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={errors.start_date ? 'border-red-500' : ''}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className={errors.end_date ? 'border-red-500' : ''}
                />
                {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <Label htmlFor="business_unit_id">Business Unit</Label>
                <select
                  id="business_unit_id"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.business_unit_id || ''}
                  onChange={(e) => handleInputChange('business_unit_id', e.target.value)}
                >
                  <option value="">Select Business Unit</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>{bu.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>Contract and financial information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_number">Contract Number</Label>
                <Input
                  id="contract_number"
                  value={formData.contract_number || ''}
                  onChange={(e) => handleInputChange('contract_number', e.target.value)}
                  placeholder="Enter contract number"
                />
              </div>

              <div>
                <Label htmlFor="contract_value">Contract Value</Label>
                <Input
                  id="contract_value"
                  type="number"
                  value={formData.contract_value || ''}
                  onChange={(e) => handleInputChange('contract_value', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Enter contract value"
                  className={errors.contract_value ? 'border-red-500' : ''}
                />
                {errors.contract_value && <p className="text-red-500 text-sm mt-1">{errors.contract_value}</p>}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>

              <div>
                <Label htmlFor="project_manager_id">Project Manager</Label>
                <select
                  id="project_manager_id"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.project_manager_id || ''}
                  onChange={(e) => handleInputChange('project_manager_id', e.target.value)}
                >
                  <option value="">Select Project Manager</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="contract_manager_id">Contract Manager</Label>
                <select
                  id="contract_manager_id"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.contract_manager_id || ''}
                  onChange={(e) => handleInputChange('contract_manager_id', e.target.value)}
                >
                  <option value="">Select Contract Manager</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="payment_schedule">Payment Schedule</Label>
                <Textarea
                  id="payment_schedule"
                  value={formData.payment_schedule || ''}
                  onChange={(e) => handleInputChange('payment_schedule', e.target.value)}
                  placeholder="Describe payment schedule"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliverables and KPIs */}
        <Card>
          <CardHeader>
            <CardTitle>Deliverables & Performance</CardTitle>
            <CardDescription>Define deliverables and key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Deliverables</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  placeholder="Add a deliverable"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('deliverables', newDeliverable, setNewDeliverable)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('deliverables', newDeliverable, setNewDeliverable)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.deliverables?.map((deliverable, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{deliverable}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('deliverables', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Key Performance Indicators</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newKPI}
                  onChange={(e) => setNewKPI(e.target.value)}
                  placeholder="Add a KPI"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('key_performance_indicators', newKPI, setNewKPI)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('key_performance_indicators', newKPI, setNewKPI)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.key_performance_indicators?.map((kpi, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{kpi}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('key_performance_indicators', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="service_level_agreements">Service Level Agreements</Label>
              <Textarea
                id="service_level_agreements"
                value={formData.service_level_agreements || ''}
                onChange={(e) => handleInputChange('service_level_agreements', e.target.value)}
                placeholder="Define service level agreements"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal and Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Legal & Compliance</CardTitle>
            <CardDescription>Legal terms and compliance requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="termination_clauses">Termination Clauses</Label>
                <Textarea
                  id="termination_clauses"
                  value={formData.termination_clauses || ''}
                  onChange={(e) => handleInputChange('termination_clauses', e.target.value)}
                  placeholder="Define termination clauses"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="renewal_terms">Renewal Terms</Label>
                <Textarea
                  id="renewal_terms"
                  value={formData.renewal_terms || ''}
                  onChange={(e) => handleInputChange('renewal_terms', e.target.value)}
                  placeholder="Define renewal terms"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="insurance_requirements">Insurance Requirements</Label>
                <Textarea
                  id="insurance_requirements"
                  value={formData.insurance_requirements || ''}
                  onChange={(e) => handleInputChange('insurance_requirements', e.target.value)}
                  placeholder="Define insurance requirements"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="audit_rights">Audit Rights</Label>
                <Textarea
                  id="audit_rights"
                  value={formData.audit_rights || ''}
                  onChange={(e) => handleInputChange('audit_rights', e.target.value)}
                  placeholder="Define audit rights"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label>Compliance Requirements</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newComplianceReq}
                  onChange={(e) => setNewComplianceReq(e.target.value)}
                  placeholder="Add compliance requirement"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('compliance_requirements', newComplianceReq, setNewComplianceReq)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('compliance_requirements', newComplianceReq, setNewComplianceReq)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.compliance_requirements?.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{req}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('compliance_requirements', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Security Requirements</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSecurityReq}
                  onChange={(e) => setNewSecurityReq(e.target.value)}
                  placeholder="Add security requirement"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('security_requirements', newSecurityReq, setNewSecurityReq)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('security_requirements', newSecurityReq, setNewSecurityReq)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.security_requirements?.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{req}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('security_requirements', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle>Data Protection & Risk Management</CardTitle>
            <CardDescription>Data processing and risk mitigation measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="data_processing_agreement"
                  checked={formData.data_processing_agreement}
                  onChange={(e) => handleInputChange('data_processing_agreement', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="data_processing_agreement">Data Processing Agreement Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="subcontractor_approval_required"
                  checked={formData.subcontractor_approval_required}
                  onChange={(e) => handleInputChange('subcontractor_approval_required', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="subcontractor_approval_required">Subcontractor Approval Required</Label>
              </div>

              <div>
                <Label htmlFor="data_retention_period">Data Retention Period (days)</Label>
                <Input
                  id="data_retention_period"
                  type="number"
                  value={formData.data_retention_period || ''}
                  onChange={(e) => handleInputChange('data_retention_period', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter retention period"
                />
              </div>

              <div>
                <Label htmlFor="data_breach_notification_hours">Data Breach Notification (hours)</Label>
                <Input
                  id="data_breach_notification_hours"
                  type="number"
                  value={formData.data_breach_notification_hours || ''}
                  onChange={(e) => handleInputChange('data_breach_notification_hours', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter notification time"
                />
              </div>
            </div>

            <div>
              <Label>Data Processing Activities</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newDataActivity}
                  onChange={(e) => setNewDataActivity(e.target.value)}
                  placeholder="Add data processing activity"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('data_processing_activities', newDataActivity, setNewDataActivity)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('data_processing_activities', newDataActivity, setNewDataActivity)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.data_processing_activities?.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{activity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('data_processing_activities', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Subcontractors</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSubcontractor}
                  onChange={(e) => setNewSubcontractor(e.target.value)}
                  placeholder="Add subcontractor"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('subcontractors', newSubcontractor, setNewSubcontractor)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('subcontractors', newSubcontractor, setNewSubcontractor)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {formData.subcontractors?.map((subcontractor, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{subcontractor}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('subcontractors', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="risk_mitigation_measures">Risk Mitigation Measures</Label>
              <Textarea
                id="risk_mitigation_measures"
                value={formData.risk_mitigation_measures || ''}
                onChange={(e) => handleInputChange('risk_mitigation_measures', e.target.value)}
                placeholder="Describe risk mitigation measures"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link to="/third-party-risk-management/engagements">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Create Engagement
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEngagementPage;
