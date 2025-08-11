import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Award
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { ISMSManagementFormData } from '../../../types/itSecurity';
import { userManagementService } from '../../../services/userManagementService';
import { User } from '../../../types/userManagement';

const CreateISMSProgramPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ISMSManagementFormData>({
    isms_id: '',
    title: '',
    description: '',
    scope: '',
    iso_version: '27001:2022',
    implementation_start_date: new Date().toISOString().split('T')[0],
    certification_date: '',
    next_surveillance_date: '',
    recertification_date: '',
    certification_body: '',
    auditor_contact: '',
    statement_of_applicability: '',
    risk_assessment_date: '',
    management_review_date: '',
    internal_audit_date: '',
    corrective_actions: [],
    preventive_actions: [],
    continual_improvement_plan: '',
    isms_manager_id: '',
    management_representative_id: '',
    business_unit_id: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userManagementService.getAll({ page_size: 100 });
      setUsers(data.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleInputChange = (field: keyof ISMSManagementFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof ISMSManagementFormData, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const newISMS = await itSecurityService.isms.create(formData);
      navigate(`/it-security/isms/${newISMS.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ISMS program');
    } finally {
      setSaving(false);
    }
  };

  const generateISMSId = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ISMS-${timestamp}-${random}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/it-security/isms')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create ISMS Program</h1>
            <p className="text-gray-600">Set up a new ISO 27001 Information Security Management System</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="certification">Certification Details</TabsTrigger>
            <TabsTrigger value="management">Management & Reviews</TabsTrigger>
            <TabsTrigger value="actions">Actions & Improvements</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isms_id">ISMS ID</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="isms_id"
                        value={formData.isms_id}
                        onChange={(e) => handleInputChange('isms_id', e.target.value)}
                        placeholder="ISMS-2024001"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleInputChange('isms_id', generateISMSId())}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="iso_version">ISO Version</Label>
                    <select
                      id="iso_version"
                      value={formData.iso_version}
                      onChange={(e) => handleInputChange('iso_version', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="27001:2022">ISO 27001:2022</option>
                      <option value="27001:2013">ISO 27001:2013</option>
                      <option value="27001:2005">ISO 27001:2005</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Program Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="ISO 27001 Information Security Management System"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the ISMS program scope and objectives"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Textarea
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                    placeholder="Define the scope of the ISMS including organizational boundaries and exclusions"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="statement_of_applicability">Statement of Applicability</Label>
                  <Textarea
                    id="statement_of_applicability"
                    value={formData.statement_of_applicability || ''}
                    onChange={(e) => handleInputChange('statement_of_applicability', e.target.value)}
                    placeholder="Document the Statement of Applicability (SoA) for ISO 27001 controls"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certification Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certification_body">Certification Body</Label>
                    <Input
                      id="certification_body"
                      value={formData.certification_body || ''}
                      onChange={(e) => handleInputChange('certification_body', e.target.value)}
                      placeholder="e.g., BSI, DNV, SGS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="auditor_contact">Auditor Contact</Label>
                    <Input
                      id="auditor_contact"
                      value={formData.auditor_contact || ''}
                      onChange={(e) => handleInputChange('auditor_contact', e.target.value)}
                      placeholder="Lead auditor name and contact"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="implementation_start_date">Implementation Start Date</Label>
                    <Input
                      id="implementation_start_date"
                      type="date"
                      value={formData.implementation_start_date}
                      onChange={(e) => handleInputChange('implementation_start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certification_date">Certification Date</Label>
                    <Input
                      id="certification_date"
                      type="date"
                      value={formData.certification_date}
                      onChange={(e) => handleInputChange('certification_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_surveillance_date">Next Surveillance Date</Label>
                    <Input
                      id="next_surveillance_date"
                      type="date"
                      value={formData.next_surveillance_date}
                      onChange={(e) => handleInputChange('next_surveillance_date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="recertification_date">Recertification Date</Label>
                  <Input
                    id="recertification_date"
                    type="date"
                    value={formData.recertification_date}
                    onChange={(e) => handleInputChange('recertification_date', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Management & Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="risk_assessment_date">Risk Assessment Date</Label>
                    <Input
                      id="risk_assessment_date"
                      type="date"
                      value={formData.risk_assessment_date}
                      onChange={(e) => handleInputChange('risk_assessment_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="management_review_date">Management Review Date</Label>
                    <Input
                      id="management_review_date"
                      type="date"
                      value={formData.management_review_date}
                      onChange={(e) => handleInputChange('management_review_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="internal_audit_date">Internal Audit Date</Label>
                    <Input
                      id="internal_audit_date"
                      type="date"
                      value={formData.internal_audit_date}
                      onChange={(e) => handleInputChange('internal_audit_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Actions & Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Corrective Actions</Label>
                  <Textarea
                    value={formData.corrective_actions?.join('\n') || ''}
                    onChange={(e) => handleArrayChange('corrective_actions', e.target.value.split('\n').filter(line => line.trim()))}
                    placeholder="Enter corrective actions, one per line"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Preventive Actions</Label>
                  <Textarea
                    value={formData.preventive_actions?.join('\n') || ''}
                    onChange={(e) => handleArrayChange('preventive_actions', e.target.value.split('\n').filter(line => line.trim()))}
                    placeholder="Enter preventive actions, one per line"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="continual_improvement_plan">Continual Improvement Plan</Label>
                  <Textarea
                    id="continual_improvement_plan"
                    value={formData.continual_improvement_plan || ''}
                    onChange={(e) => handleInputChange('continual_improvement_plan', e.target.value)}
                    placeholder="Describe the continual improvement plan for the ISMS"
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
                    <Label htmlFor="isms_manager_id">ISMS Manager</Label>
                    <select
                      id="isms_manager_id"
                      value={formData.isms_manager_id}
                      onChange={(e) => handleInputChange('isms_manager_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select ISMS manager</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="management_representative_id">Management Representative</Label>
                    <select
                      id="management_representative_id"
                      value={formData.management_representative_id}
                      onChange={(e) => handleInputChange('management_representative_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select management representative</option>
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
            onClick={() => navigate('/it-security/isms')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create ISMS Program
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateISMSProgramPage;
