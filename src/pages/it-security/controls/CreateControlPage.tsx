import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, Save, Shield, Target, Activity, BookOpen, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ControlFormData {
  name: string;
  description: string;
  control_type: 'preventive' | 'detective' | 'corrective' | 'deterrent' | 'recovery';
  category: 'access_control' | 'network_security' | 'data_protection' | 'incident_response' | 'business_continuity' | 'compliance';
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  implementation_status: 'not_implemented' | 'in_progress' | 'implemented' | 'testing' | 'operational';
  owner: string;
  responsible_team: string;
  implementation_date: string;
  review_frequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'as_needed';
  last_review_date: string;
  next_review_date: string;
  effectiveness_rating: number;
  cost: number;
  risk_mitigation: string;
  implementation_notes: string;
  testing_procedures: string;
  documentation: string;
  tags: string[];
}

const CreateControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ControlFormData>({
    name: '',
    description: '',
    control_type: 'preventive',
    category: 'access_control',
    status: 'draft',
    priority: 'medium',
    implementation_status: 'not_implemented',
    owner: '',
    responsible_team: '',
    implementation_date: '',
    review_frequency: 'quarterly',
    last_review_date: '',
    next_review_date: '',
    effectiveness_rating: 0,
    cost: 0,
    risk_mitigation: '',
    implementation_notes: '',
    testing_procedures: '',
    documentation: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const controlTypeOptions = [
    { value: 'preventive', label: 'Preventive' },
    { value: 'detective', label: 'Detective' },
    { value: 'corrective', label: 'Corrective' },
    { value: 'deterrent', label: 'Deterrent' },
    { value: 'recovery', label: 'Recovery' }
  ];

  const categoryOptions = [
    { value: 'access_control', label: 'Access Control' },
    { value: 'network_security', label: 'Network Security' },
    { value: 'data_protection', label: 'Data Protection' },
    { value: 'incident_response', label: 'Incident Response' },
    { value: 'business_continuity', label: 'Business Continuity' },
    { value: 'compliance', label: 'Compliance' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
    { value: 'deprecated', label: 'Deprecated' }
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const implementationStatusOptions = [
    { value: 'not_implemented', label: 'Not Implemented' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'implemented', label: 'Implemented' },
    { value: 'testing', label: 'Testing' },
    { value: 'operational', label: 'Operational' }
  ];

  const reviewFrequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi_annually', label: 'Semi-Annually' },
    { value: 'annually', label: 'Annually' },
    { value: 'as_needed', label: 'As Needed' }
  ];

  const handleInputChange = (field: keyof ControlFormData, value: string | number) => {
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
      // TODO: Implement API call to create control
      console.log('Creating control:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/it-security/controls');
    } catch (error) {
      console.error('Error creating control:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/it-security/controls">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Controls
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Control</h1>
            <p className="text-gray-600">Add a new IT security control to the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>Essential details about the control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Control Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Multi-Factor Authentication"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the control and its purpose..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="control_type">Control Type *</Label>
                <select
                  id="control_type"
                  value={formData.control_type}
                  onChange={(e) => handleInputChange('control_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {controlTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Status and Priority</span>
            </CardTitle>
            <CardDescription>Control status and priority levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <Label htmlFor="implementation_status">Implementation Status *</Label>
                <select
                  id="implementation_status"
                  value={formData.implementation_status}
                  onChange={(e) => handleInputChange('implementation_status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {implementationStatusOptions.map(option => (
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
            <CardDescription>Control ownership and responsible parties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Control Owner</Label>
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

        {/* Implementation and Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Implementation and Review</span>
            </CardTitle>
            <CardDescription>Implementation dates and review schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="implementation_date">Implementation Date</Label>
                <Input
                  id="implementation_date"
                  type="date"
                  value={formData.implementation_date}
                  onChange={(e) => handleInputChange('implementation_date', e.target.value)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="last_review_date">Last Review Date</Label>
                <Input
                  id="last_review_date"
                  type="date"
                  value={formData.last_review_date}
                  onChange={(e) => handleInputChange('last_review_date', e.target.value)}
                />
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

        {/* Metrics and Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Metrics and Cost</span>
            </CardTitle>
            <CardDescription>Effectiveness rating and cost information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effectiveness_rating">Effectiveness Rating (1-10)</Label>
                <Input
                  id="effectiveness_rating"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.effectiveness_rating}
                  onChange={(e) => handleInputChange('effectiveness_rating', parseInt(e.target.value) || 0)}
                  placeholder="1-10"
                />
              </div>
              <div>
                <Label htmlFor="cost">Implementation Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Mitigation and Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Risk Mitigation and Implementation</span>
            </CardTitle>
            <CardDescription>Risk mitigation details and implementation information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="risk_mitigation">Risk Mitigation</Label>
              <Textarea
                id="risk_mitigation"
                value={formData.risk_mitigation}
                onChange={(e) => handleInputChange('risk_mitigation', e.target.value)}
                placeholder="Describe how this control mitigates specific risks..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="implementation_notes">Implementation Notes</Label>
              <Textarea
                id="implementation_notes"
                value={formData.implementation_notes}
                onChange={(e) => handleInputChange('implementation_notes', e.target.value)}
                placeholder="Notes about implementation process, challenges, etc..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="testing_procedures">Testing Procedures</Label>
              <Textarea
                id="testing_procedures"
                value={formData.testing_procedures}
                onChange={(e) => handleInputChange('testing_procedures', e.target.value)}
                placeholder="Procedures for testing the effectiveness of this control..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="documentation">Documentation</Label>
              <Textarea
                id="documentation"
                value={formData.documentation}
                onChange={(e) => handleInputChange('documentation', e.target.value)}
                placeholder="Links to documentation, procedures, or related resources..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
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
          <Link to="/it-security/controls">
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
                Create Control
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateControlPage;
