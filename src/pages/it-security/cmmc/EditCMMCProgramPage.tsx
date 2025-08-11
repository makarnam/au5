import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Award,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { itSecurityService } from '../../../services/itSecurityService';
import { CMMCManagementFormData, CMMCManagement } from '../../../types/itSecurity';
import { userManagementService } from '../../../services/userManagementService';
import { User } from '../../../types/userManagement';

const EditCMMCProgramPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CMMCManagementFormData>({
    cmmc_id: '',
    title: '',
    description: '',
    target_level: 1,
    current_level: 1,
    scope: '',
    implementation_start_date: '',
    target_certification_date: '',
    certification_date: '',
    next_assessment_date: '',
    c3pao_company: '',
    c3pao_contact: '',
    gap_assessment_date: '',
    gap_assessment_results: '',
    implementation_plan: '',
    practice_implementation_status: {},
    process_maturity_status: {},
    corrective_actions: [],
    cmmc_manager_id: '',
    assessor_id: '',
    business_unit_id: ''
  });

  useEffect(() => {
    if (id) {
      loadCMMCProgram();
      loadUsers();
    }
  }, [id]);

  const loadCMMCProgram = async () => {
    try {
      setLoading(true);
      const program = await itSecurityService.cmmcManagement.getById(id!);
      
      setFormData({
        cmmc_id: program.cmmc_id,
        title: program.title,
        description: program.description,
        target_level: program.target_level,
        current_level: program.current_level,
        scope: program.scope,
        implementation_start_date: program.implementation_start_date || '',
        target_certification_date: program.target_certification_date || '',
        certification_date: program.certification_date || '',
        next_assessment_date: program.next_assessment_date || '',
        c3pao_company: program.c3pao_company || '',
        c3pao_contact: program.c3pao_contact || '',
        gap_assessment_date: program.gap_assessment_date || '',
        gap_assessment_results: program.gap_assessment_results || '',
        implementation_plan: program.implementation_plan || '',
        practice_implementation_status: program.practice_implementation_status || {},
        process_maturity_status: program.process_maturity_status || {},
        corrective_actions: program.corrective_actions || [],
        cmmc_manager_id: program.cmmc_manager_id || '',
        assessor_id: program.assessor_id || '',
        business_unit_id: program.business_unit_id || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CMMC program');
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

  const handleInputChange = (field: keyof CMMCManagementFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof CMMCManagementFormData, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await itSecurityService.cmmcManagement.update(id!, formData);
      navigate(`/it-security/cmmc/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update CMMC program');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading CMMC program...</span>
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
            onClick={() => navigate(`/it-security/cmmc/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit CMMC Program</h1>
            <p className="text-gray-600">Update the Cybersecurity Maturity Model Certification program</p>
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
            <TabsTrigger value="levels">CMMC Levels</TabsTrigger>
            <TabsTrigger value="assessment">Assessment Details</TabsTrigger>
            <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
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
                    <Label htmlFor="cmmc_id">CMMC ID</Label>
                    <Input
                      id="cmmc_id"
                      value={formData.cmmc_id}
                      onChange={(e) => handleInputChange('cmmc_id', e.target.value)}
                      placeholder="CMMC-2024001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="implementation_start_date">Implementation Start Date</Label>
                    <Input
                      id="implementation_start_date"
                      type="date"
                      value={formData.implementation_start_date}
                      onChange={(e) => handleInputChange('implementation_start_date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Program Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="CMMC Level 3 Certification Program"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the CMMC program objectives and scope..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Textarea
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                    placeholder="Define the scope of systems, networks, and data covered by this CMMC program..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  CMMC Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="current_level">Current Level</Label>
                    <select
                      id="current_level"
                      value={formData.current_level}
                      onChange={(e) => handleInputChange('current_level', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={1}>Level 1 - Basic Cyber Hygiene</option>
                      <option value={2}>Level 2 - Intermediate Cyber Hygiene</option>
                      <option value={3}>Level 3 - Good Cyber Hygiene</option>
                      <option value={4}>Level 4 - Proactive</option>
                      <option value={5}>Level 5 - Advanced/Progressive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="target_level">Target Level</Label>
                    <select
                      id="target_level"
                      value={formData.target_level}
                      onChange={(e) => handleInputChange('target_level', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value={1}>Level 1 - Basic Cyber Hygiene</option>
                      <option value={2}>Level 2 - Intermediate Cyber Hygiene</option>
                      <option value={3}>Level 3 - Good Cyber Hygiene</option>
                      <option value={4}>Level 4 - Proactive</option>
                      <option value={5}>Level 5 - Advanced/Progressive</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-900 mb-2">CMMC Level Overview</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Level 1:</strong> Basic cyber hygiene practices (17 practices)</p>
                    <p><strong>Level 2:</strong> Intermediate cyber hygiene (55 practices)</p>
                    <p><strong>Level 3:</strong> Good cyber hygiene (110 practices)</p>
                    <p><strong>Level 4:</strong> Proactive (156 practices)</p>
                    <p><strong>Level 5:</strong> Advanced/Progressive (171 practices)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Assessment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_certification_date">Target Certification Date</Label>
                    <Input
                      id="target_certification_date"
                      type="date"
                      value={formData.target_certification_date}
                      onChange={(e) => handleInputChange('target_certification_date', e.target.value)}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="next_assessment_date">Next Assessment Date</Label>
                    <Input
                      id="next_assessment_date"
                      type="date"
                      value={formData.next_assessment_date}
                      onChange={(e) => handleInputChange('next_assessment_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gap_assessment_date">Gap Assessment Date</Label>
                    <Input
                      id="gap_assessment_date"
                      type="date"
                      value={formData.gap_assessment_date}
                      onChange={(e) => handleInputChange('gap_assessment_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c3pao_company">C3PAO Company</Label>
                    <Input
                      id="c3pao_company"
                      value={formData.c3pao_company}
                      onChange={(e) => handleInputChange('c3pao_company', e.target.value)}
                      placeholder="Certified Third-Party Assessment Organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="c3pao_contact">C3PAO Contact</Label>
                    <Input
                      id="c3pao_contact"
                      value={formData.c3pao_contact}
                      onChange={(e) => handleInputChange('c3pao_contact', e.target.value)}
                      placeholder="Contact person at C3PAO"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gap_assessment_results">Gap Assessment Results</Label>
                  <Textarea
                    id="gap_assessment_results"
                    value={formData.gap_assessment_results}
                    onChange={(e) => handleInputChange('gap_assessment_results', e.target.value)}
                    placeholder="Document the results of the gap assessment..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Implementation Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="implementation_plan">Implementation Plan</Label>
                  <Textarea
                    id="implementation_plan"
                    value={formData.implementation_plan}
                    onChange={(e) => handleInputChange('implementation_plan', e.target.value)}
                    placeholder="Detail the implementation plan for achieving the target CMMC level..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="corrective_actions">Corrective Actions</Label>
                  <Textarea
                    id="corrective_actions"
                    value={formData.corrective_actions.join('\n')}
                    onChange={(e) => handleArrayChange('corrective_actions', e.target.value.split('\n').filter(line => line.trim()))}
                    placeholder="Enter corrective actions, one per line..."
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
                    <Label htmlFor="cmmc_manager_id">CMMC Manager</Label>
                    <select
                      id="cmmc_manager_id"
                      value={formData.cmmc_manager_id}
                      onChange={(e) => handleInputChange('cmmc_manager_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select CMMC Manager</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="assessor_id">Assessor</Label>
                    <select
                      id="assessor_id"
                      value={formData.assessor_id}
                      onChange={(e) => handleInputChange('assessor_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Assessor</option>
                      {users.map(user => (
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

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/it-security/cmmc/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
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

export default EditCMMCProgramPage;
