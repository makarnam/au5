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
import { CreateEmergencyContactForm } from '../../types/bcp';

const CreateEmergencyContactPage: React.FC = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateEmergencyContactForm>({
    name: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    role: 'primary',
    availability: '24_7',
    escalation_level: 1,
    backup_contact: '',
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
      await bcpService.createEmergencyContact({
        ...formData,
        plan_id: planId
      });
      navigate(`/bcp/${planId}`);
    } catch (error) {
      console.error('Error creating emergency contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateEmergencyContactForm, value: any) => {
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
            <h1 className="text-2xl font-bold">Create Emergency Contact</h1>
            <p className="text-muted-foreground">
              Add an emergency contact to {plan.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Basic contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., IT Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Information Technology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </CardContent>
          </Card>

          {/* Role & Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Availability</CardTitle>
              <CardDescription>Contact role and availability information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Contact Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Contact</SelectItem>
                    <SelectItem value="secondary">Secondary Contact</SelectItem>
                    <SelectItem value="backup">Backup Contact</SelectItem>
                    <SelectItem value="escalation">Escalation Contact</SelectItem>
                    <SelectItem value="technical">Technical Contact</SelectItem>
                    <SelectItem value="management">Management Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => handleInputChange('availability', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24_7">24/7 Available</SelectItem>
                    <SelectItem value="business_hours">Business Hours Only</SelectItem>
                    <SelectItem value="on_call">On-Call</SelectItem>
                    <SelectItem value="weekends">Weekends Only</SelectItem>
                    <SelectItem value="emergency_only">Emergency Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation_level">Escalation Level</Label>
                <Select
                  value={formData.escalation_level.toString()}
                  onValueChange={(value) => handleInputChange('escalation_level', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - First Response</SelectItem>
                    <SelectItem value="2">Level 2 - Technical Support</SelectItem>
                    <SelectItem value="3">Level 3 - Management</SelectItem>
                    <SelectItem value="4">Level 4 - Executive</SelectItem>
                    <SelectItem value="5">Level 5 - C-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup_contact">Backup Contact</Label>
                <Input
                  id="backup_contact"
                  value={formData.backup_contact}
                  onChange={(e) => handleInputChange('backup_contact', e.target.value)}
                  placeholder="Name of backup contact person"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Additional notes and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this contact, special instructions, or important information"
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
            {loading ? 'Creating...' : 'Create Emergency Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmergencyContactPage;
