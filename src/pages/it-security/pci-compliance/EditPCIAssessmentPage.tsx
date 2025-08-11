import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Shield, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Target
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { PCICompliance, PCIComplianceFormData } from '../../../types/itSecurity';
import { userManagementService } from '../../../services/userManagementService';
import { User } from '../../../types/userManagement';

const EditPCIAssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<PCICompliance | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PCIComplianceFormData>>({});

  useEffect(() => {
    if (id) {
      loadAssessment();
      loadUsers();
    }
  }, [id]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const data = await itSecurityService.pciCompliance.getById(id!);
      setAssessment(data);
      setFormData({
        assessment_id: data.assessment_id,
        title: data.title,
        description: data.description,
        pci_dss_version: data.pci_dss_version,
        merchant_level: data.merchant_level,
        service_provider_level: data.service_provider_level,
        assessment_type: data.assessment_type,
        scope: data.scope,
        start_date: data.start_date,
        end_date: data.end_date,
        next_assessment_date: data.next_assessment_date,
        qsa_company: data.qsa_company,
        qsa_contact: data.qsa_contact,
        roc_attestation: data.roc_attestation,
        saq_type: data.saq_type,
        non_compliant_requirements: data.non_compliant_requirements,
        remediation_plan: data.remediation_plan,
        assessor_id: data.assessor_id,
        reviewer_id: data.reviewer_id,
        business_unit_id: data.business_unit_id
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userManagementService.getAll({ page_size: 100 });
      setUsers(data.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleInputChange = (field: keyof PCIComplianceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof PCIComplianceFormData, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      await itSecurityService.pciCompliance.update(id, formData);
      navigate(`/it-security/pci-compliance/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assessment');
    } finally {
      setSaving(false);
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

  const getAssessmentTypeColor = (type: string) => {
    switch (type) {
      case 'roc': return 'bg-blue-100 text-blue-800';
      case 'saq_a': return 'bg-green-100 text-green-800';
      case 'saq_d': return 'bg-purple-100 text-purple-800';
      case 'saq_c': return 'bg-orange-100 text-orange-800';
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

  if (error || !assessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Assessment not found'}</p>
          <Button onClick={() => navigate('/it-security/pci-compliance')}>Back to PCI Compliance</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/it-security/pci-compliance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit PCI Assessment</h1>
            <p className="text-gray-600">Update PCI DSS compliance assessment details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(assessment.status)}>
            {assessment.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getAssessmentTypeColor(assessment.assessment_type)}>
            {assessment.assessment_type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="assessment">Assessment Details</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Requirements</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessment_id">Assessment ID</Label>
                    <Input
                      id="assessment_id"
                      value={formData.assessment_id || ''}
                      onChange={(e) => handleInputChange('assessment_id', e.target.value)}
                      placeholder="PCI-2024001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pci_dss_version">PCI DSS Version</Label>
                    <select
                      id="pci_dss_version"
                      value={formData.pci_dss_version || ''}
                      onChange={(e) => handleInputChange('pci_dss_version', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="4.0">PCI DSS 4.0</option>
                      <option value="3.2.1">PCI DSS 3.2.1</option>
                      <option value="3.2">PCI DSS 3.2</option>
                      <option value="3.1">PCI DSS 3.1</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="PCI DSS Compliance Assessment 2024"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the scope and purpose of this PCI assessment"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Textarea
                    id="scope"
                    value={formData.scope || ''}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                    placeholder="Define the scope of systems, processes, and locations covered by this assessment"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Assessment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="merchant_level">Merchant Level</Label>
                    <select
                      id="merchant_level"
                      value={formData.merchant_level || ''}
                      onChange={(e) => handleInputChange('merchant_level', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="level_1">Level 1 (6M+ transactions/year)</option>
                      <option value="level_2">Level 2 (1M-6M transactions/year)</option>
                      <option value="level_3">Level 3 (20K-1M transactions/year)</option>
                      <option value="level_4">Level 4 (Less than 20K transactions/year)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="service_provider_level">Service Provider Level</Label>
                    <select
                      id="service_provider_level"
                      value={formData.service_provider_level || ''}
                      onChange={(e) => handleInputChange('service_provider_level', e.target.value || undefined)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Not applicable</option>
                      <option value="level_1">Level 1 (300K+ transactions/year)</option>
                      <option value="level_2">Level 2 (Less than 300K transactions/year)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessment_type">Assessment Type</Label>
                    <select
                      id="assessment_type"
                      value={formData.assessment_type || ''}
                      onChange={(e) => handleInputChange('assessment_type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="roc">Report on Compliance (ROC)</option>
                      <option value="saq_a">SAQ A</option>
                      <option value="saq_a_ep">SAQ A-EP</option>
                      <option value="saq_b">SAQ B</option>
                      <option value="saq_b_ip">SAQ B-IP</option>
                      <option value="saq_c">SAQ C</option>
                      <option value="saq_c_vt">SAQ C-VT</option>
                      <option value="saq_d">SAQ D</option>
                      <option value="saq_d_merchant">SAQ D-Merchant</option>
                      <option value="saq_d_service_provider">SAQ D-Service Provider</option>
                      <option value="saq_p2pe">SAQ P2PE</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="saq_type">SAQ Type (if applicable)</Label>
                    <Input
                      id="saq_type"
                      value={formData.saq_type || ''}
                      onChange={(e) => handleInputChange('saq_type', e.target.value)}
                      placeholder="e.g., SAQ D v4.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date || ''}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date || ''}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_assessment_date">Next Assessment Date</Label>
                    <Input
                      id="next_assessment_date"
                      type="date"
                      value={formData.next_assessment_date || ''}
                      onChange={(e) => handleInputChange('next_assessment_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qsa_company">QSA Company</Label>
                    <Input
                      id="qsa_company"
                      value={formData.qsa_company || ''}
                      onChange={(e) => handleInputChange('qsa_company', e.target.value)}
                      placeholder="Qualified Security Assessor company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="qsa_contact">QSA Contact</Label>
                    <Input
                      id="qsa_contact"
                      value={formData.qsa_contact || ''}
                      onChange={(e) => handleInputChange('qsa_contact', e.target.value)}
                      placeholder="QSA contact person"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="roc_attestation"
                    checked={formData.roc_attestation || false}
                    onChange={(e) => handleInputChange('roc_attestation', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="roc_attestation">ROC Attestation Required</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Compliance & Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Non-Compliant Requirements</Label>
                  <Textarea
                    value={formData.non_compliant_requirements?.join('\n') || ''}
                    onChange={(e) => handleArrayChange('non_compliant_requirements', e.target.value.split('\n').filter(line => line.trim()))}
                    placeholder="Enter non-compliant requirements, one per line"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="remediation_plan">Remediation Plan</Label>
                  <Textarea
                    id="remediation_plan"
                    value={formData.remediation_plan || ''}
                    onChange={(e) => handleInputChange('remediation_plan', e.target.value)}
                    placeholder="Describe the remediation plan for non-compliant requirements"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessor_id">Assessor</Label>
                    <select
                      id="assessor_id"
                      value={formData.assessor_id || ''}
                      onChange={(e) => handleInputChange('assessor_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select assessor</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="reviewer_id">Reviewer</Label>
                    <select
                      id="reviewer_id"
                      value={formData.reviewer_id || ''}
                      onChange={(e) => handleInputChange('reviewer_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select reviewer</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/it-security/pci-compliance/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPCIAssessmentPage;
