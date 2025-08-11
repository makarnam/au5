import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, Save, FileText, Users, Calendar, Shield, BookOpen, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PolicyFormData {
  title: string;
  description: string;
  policy_type: 'security' | 'access_control' | 'data_protection' | 'incident_response' | 'business_continuity' | 'compliance';
  status: 'draft' | 'active' | 'inactive' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  responsible_team: string;
  effective_date: string;
  review_frequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'as_needed';
  next_review_date: string;
  scope: string;
  policy_content: string;
  procedures: string;
  exceptions: string;
  compliance_requirements: string;
  training_requirements: string;
  enforcement_mechanisms: string;
  tags: string[];
}

const CreatePolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PolicyFormData>({
    title: '',
    description: '',
    policy_type: 'security',
    status: 'draft',
    priority: 'medium',
    owner: '',
    responsible_team: '',
    effective_date: '',
    review_frequency: 'annually',
    next_review_date: '',
    scope: '',
    policy_content: '',
    procedures: '',
    exceptions: '',
    compliance_requirements: '',
    training_requirements: '',
    enforcement_mechanisms: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const policyTypeOptions = [
    { value: 'security', label: 'Security Policy' },
    { value: 'access_control', label: 'Access Control Policy' },
    { value: 'data_protection', label: 'Data Protection Policy' },
    { value: 'incident_response', label: 'Incident Response Policy' },
    { value: 'business_continuity', label: 'Business Continuity Policy' },
    { value: 'compliance', label: 'Compliance Policy' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const reviewFrequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi_annually', label: 'Semi-Annually' },
    { value: 'annually', label: 'Annually' },
    { value: 'as_needed', label: 'As Needed' }
  ];

  const handleInputChange = (field: keyof PolicyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement API call to create policy
      console.log('Creating policy:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/it-security/policies');
    } catch (error) {
      console.error('Error creating policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/it-security/policies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policies
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Policy</h1>
            <p className="text-gray-600">Add a new IT security policy to the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>Essential details about the policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Policy Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Password Security Policy"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the policy and its purpose..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="policy_type">Policy Type *</Label>
                <select
                  id="policy_type"
                  value={formData.policy_type}
                  onChange={(e) => handleInputChange('policy_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {policyTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ownership and Responsibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Ownership and Responsibility</span>
            </CardTitle>
            <CardDescription>Policy ownership and responsible parties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Policy Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => handleInputChange('owner', e.target.value)}
                  placeholder="Enter owner name or email"
                />
              </div>
              <div>
                <Label htmlFor="responsible_team">Responsible Team</Label>
                <Input
                  id="responsible_team"
                  value={formData.responsible_team}
                  onChange={(e) => handleInputChange('responsible_team', e.target.value)}
                  placeholder="e.g., IT Security Team"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Effective Dates and Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Effective Dates and Review</span>
            </CardTitle>
            <CardDescription>Policy effective dates and review schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleInputChange('effective_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="review_frequency">Review Frequency *</Label>
                <select
                  id="review_frequency"
                  value={formData.review_frequency}
                  onChange={(e) => handleInputChange('review_frequency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {reviewFrequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="next_review_date">Next Review Date</Label>
                <Input
                  id="next_review_date"
                  type="date"
                  value={formData.next_review_date}
                  onChange={(e) => handleInputChange('next_review_date', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Policy Scope</span>
            </CardTitle>
            <CardDescription>Define the scope and applicability of the policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scope">Scope *</Label>
              <Textarea
                id="scope"
                value={formData.scope}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                placeholder="Define who this policy applies to, what systems/processes it covers..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Policy Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Policy Content</span>
            </CardTitle>
            <CardDescription>The main policy content and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="policy_content">Policy Content *</Label>
              <Textarea
                id="policy_content"
                value={formData.policy_content}
                onChange={(e) => handleInputChange('policy_content', e.target.value)}
                placeholder="Detailed policy content, requirements, and guidelines..."
                rows={8}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Procedures and Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Procedures and Implementation</span>
            </CardTitle>
            <CardDescription>Implementation procedures and operational details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="procedures">Procedures</Label>
              <Textarea
                id="procedures"
                value={formData.procedures}
                onChange={(e) => handleInputChange('procedures', e.target.value)}
                placeholder="Step-by-step procedures for implementing this policy..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="exceptions">Exceptions</Label>
              <Textarea
                id="exceptions"
                value={formData.exceptions}
                onChange={(e) => handleInputChange('exceptions', e.target.value)}
                placeholder="Document any exceptions or special cases to this policy..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Compliance and Training */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Compliance and Training</span>
            </CardTitle>
            <CardDescription>Compliance requirements and training needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="compliance_requirements">Compliance Requirements</Label>
              <Textarea
                id="compliance_requirements"
                value={formData.compliance_requirements}
                onChange={(e) => handleInputChange('compliance_requirements', e.target.value)}
                placeholder="List any regulatory or compliance requirements this policy addresses..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="training_requirements">Training Requirements</Label>
              <Textarea
                id="training_requirements"
                value={formData.training_requirements}
                onChange={(e) => handleInputChange('training_requirements', e.target.value)}
                placeholder="Specify training requirements for policy implementation..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="enforcement_mechanisms">Enforcement Mechanisms</Label>
              <Textarea
                id="enforcement_mechanisms"
                value={formData.enforcement_mechanisms}
                onChange={(e) => handleInputChange('enforcement_mechanisms', e.target.value)}
                placeholder="Describe how this policy will be enforced and monitored..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to categorize and organize the policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tags">Add Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link to="/it-security/policies">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Policy
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePolicyPage;
