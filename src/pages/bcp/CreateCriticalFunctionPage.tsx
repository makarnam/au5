import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import { bcpService } from '../../services/bcpService';
import { CreateCriticalFunctionForm, CriticalFunction } from '../../types/bcp';

const CreateCriticalFunctionPage: React.FC = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateCriticalFunctionForm>({
    name: '',
    description: '',
    priority: 'medium',
    rto_hours: 4,
    rpo_hours: 1,
    dependencies: '',
    recovery_procedures: '',
    resource_requirements: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    status: 'active',
    last_tested: null,
    next_test_date: null,
    test_results: '',
    notes: ''
  });

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      const planData = await bcpService.getPlanById(planId!);
      setPlan(planData);
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;

    setLoading(true);
    try {
      await bcpService.createCriticalFunction({
        ...formData,
        plan_id: planId
      });
      navigate(`/bcp/${planId}`);
    } catch (error) {
      console.error('Error creating critical function:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCriticalFunctionForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!plan) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/bcp/${planId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Critical Function</h1>
            <p className="text-muted-foreground">
              Add a critical business function to {plan.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the critical function details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Function Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Customer Service Operations"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the critical function and its importance"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Objectives</CardTitle>
              <CardDescription>Define RTO and RPO requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rto_hours">Recovery Time Objective (RTO) - Hours</Label>
                <Input
                  id="rto_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.rto_hours}
                  onChange={(e) => handleInputChange('rto_hours', parseFloat(e.target.value))}
                  placeholder="4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpo_hours">Recovery Point Objective (RPO) - Hours</Label>
                <Input
                  id="rpo_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.rpo_hours}
                  onChange={(e) => handleInputChange('rpo_hours', parseFloat(e.target.value))}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependencies">Dependencies</Label>
                <Textarea
                  id="dependencies"
                  value={formData.dependencies}
                  onChange={(e) => handleInputChange('dependencies', e.target.value)}
                  placeholder="List any dependencies or prerequisites"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recovery Procedures */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Procedures</CardTitle>
              <CardDescription>Define recovery steps and resource requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery_procedures">Recovery Procedures</Label>
                <Textarea
                  id="recovery_procedures"
                  value={formData.recovery_procedures}
                  onChange={(e) => handleInputChange('recovery_procedures', e.target.value)}
                  placeholder="Step-by-step recovery procedures"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource_requirements">Resource Requirements</Label>
                <Textarea
                  id="resource_requirements"
                  value={formData.resource_requirements}
                  onChange={(e) => handleInputChange('resource_requirements', e.target.value)}
                  placeholder="List required resources (personnel, equipment, etc.)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Primary contact for this function</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="john.doe@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Testing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Information</CardTitle>
              <CardDescription>Testing schedule and results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="next_test_date">Next Test Date</Label>
                <Input
                  id="next_test_date"
                  type="date"
                  value={formData.next_test_date || ''}
                  onChange={(e) => handleInputChange('next_test_date', e.target.value || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test_results">Test Results</Label>
                <Textarea
                  id="test_results"
                  value={formData.test_results}
                  onChange={(e) => handleInputChange('test_results', e.target.value)}
                  placeholder="Results from last test or exercise"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any additional information or notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or comments"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/bcp/${planId}`)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Critical Function'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCriticalFunctionPage;
