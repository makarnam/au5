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
  FileText, 
  Shield, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit3
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { ITSecurityPolicy, ITSecurityPolicyFormData } from '../../../types/itSecurity';
import { userManagementService } from '../../../services/userManagementService';
import { User } from '../../../types/userManagement';

const EditPolicyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<ITSecurityPolicy | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ITSecurityPolicyFormData>>({});

  useEffect(() => {
    if (id) {
      loadPolicy();
      loadUsers();
    }
  }, [id]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const data = await itSecurityService.policies.getById(id!);
      setPolicy(data);
      setFormData({
        policy_code: data.policy_code,
        title: data.title,
        description: data.description,
        policy_type: data.policy_type,
        category: data.category,
        version: data.version,
        content: data.content,
        scope: data.scope,
        exceptions: data.exceptions,
        compliance_frameworks: data.compliance_frameworks,
        related_policies: data.related_policies,
        effective_date: data.effective_date,
        review_date: data.review_date,
        next_review_date: data.next_review_date,
        owner_id: data.owner_id,
        approver_id: data.approver_id,
        business_unit_id: data.business_unit_id
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policy');
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

  const handleInputChange = (field: keyof ITSecurityPolicyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof ITSecurityPolicyFormData, value: string[]) => {
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
      await itSecurityService.policies.update(id, formData);
      navigate(`/it-security/policies/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update policy');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'access_control': return 'bg-blue-100 text-blue-800';
      case 'data_protection': return 'bg-green-100 text-green-800';
      case 'network_security': return 'bg-purple-100 text-purple-800';
      case 'incident_response': return 'bg-red-100 text-red-800';
      case 'business_continuity': return 'bg-orange-100 text-orange-800';
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

  if (error || !policy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Policy not found'}</p>
          <Button onClick={() => navigate('/it-security/policies')}>Back to Policies</Button>
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
            onClick={() => navigate('/it-security/policies')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Policy</h1>
            <p className="text-gray-600">Update policy information and settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(policy.status)}>
            {policy.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPolicyTypeColor(policy.policy_type)}>
            {policy.policy_type.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Policy Content</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Review</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="policy_code">Policy Code</Label>
                    <Input
                      id="policy_code"
                      value={formData.policy_code || ''}
                      onChange={(e) => handleInputChange('policy_code', e.target.value)}
                      placeholder="POL-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version || ''}
                      onChange={(e) => handleInputChange('version', e.target.value)}
                      placeholder="1.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Policy title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Policy description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="policy_type">Policy Type</Label>
                    <select
                      id="policy_type"
                      value={formData.policy_type || ''}
                      onChange={(e) => handleInputChange('policy_type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select type</option>
                      <option value="access_control">Access Control</option>
                      <option value="data_protection">Data Protection</option>
                      <option value="network_security">Network Security</option>
                      <option value="incident_response">Incident Response</option>
                      <option value="business_continuity">Business Continuity</option>
                      <option value="vendor_management">Vendor Management</option>
                      <option value="acceptable_use">Acceptable Use</option>
                      <option value="password">Password</option>
                      <option value="encryption">Encryption</option>
                      <option value="backup">Backup</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select category</option>
                      <option value="technical">Technical</option>
                      <option value="administrative">Administrative</option>
                      <option value="physical">Physical</option>
                      <option value="organizational">Organizational</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Textarea
                    id="scope"
                    value={formData.scope || ''}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                    placeholder="Policy scope and applicability"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="exceptions">Exceptions</Label>
                  <Textarea
                    id="exceptions"
                    value={formData.exceptions || ''}
                    onChange={(e) => handleInputChange('exceptions', e.target.value)}
                    placeholder="Policy exceptions and special cases"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2" />
                  Policy Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="content">Policy Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Enter the full policy content..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Compliance & Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Compliance Frameworks</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {['ISO 27001', 'NIST CSF', 'PCI DSS', 'CMMC', 'GDPR', 'SOX'].map((framework) => (
                      <label key={framework} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.compliance_frameworks?.includes(framework) || false}
                          onChange={(e) => {
                            const current = formData.compliance_frameworks || [];
                            const updated = e.target.checked
                              ? [...current, framework]
                              : current.filter(f => f !== framework);
                            handleArrayChange('compliance_frameworks', updated);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{framework}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="effective_date">Effective Date</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_date || ''}
                      onChange={(e) => handleInputChange('effective_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="review_date">Review Date</Label>
                    <Input
                      id="review_date"
                      type="date"
                      value={formData.review_date || ''}
                      onChange={(e) => handleInputChange('review_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_review_date">Next Review Date</Label>
                    <Input
                      id="next_review_date"
                      type="date"
                      value={formData.next_review_date || ''}
                      onChange={(e) => handleInputChange('next_review_date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Related Policies</Label>
                  <Input
                    value={formData.related_policies?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('related_policies', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Enter related policy codes separated by commas"
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
                    <Label htmlFor="owner_id">Policy Owner</Label>
                    <select
                      id="owner_id"
                      value={formData.owner_id || ''}
                      onChange={(e) => handleInputChange('owner_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select owner</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="approver_id">Approver</Label>
                    <select
                      id="approver_id"
                      value={formData.approver_id || ''}
                      onChange={(e) => handleInputChange('approver_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select approver</option>
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
            onClick={() => navigate(`/it-security/policies/${id}`)}
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

export default EditPolicyPage;
