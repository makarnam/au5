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
import { CreateRTOForm } from '../../types/bcp';

const CreateRTOPage: React.FC = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateRTOForm>({
    service_name: '',
    description: '',
    rto_hours: 4,
    rpo_hours: 1,
    mtta_hours: 0.5,
    mttr_hours: 2,
    sla_target: 99.9,
    priority: 'medium',
    dependencies: '',
    recovery_procedures: '',
    status: 'active',
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
      await bcpService.createRTO({
        ...formData,
        plan_id: planId
      });
      navigate(`/bcp/${planId}`);
    } catch (error) {
      console.error('Error creating RTO:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateRTOForm, value: any) => {
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
            <h1 className="text-2xl font-bold">Create RTO/RPO Entry</h1>
            <p className="text-muted-foreground">
              Add recovery time and point objectives to {plan.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
              <CardDescription>Define the service or system details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">Service Name *</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => handleInputChange('service_name', e.target.value)}
                  placeholder="e.g., Customer Database"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the service and its importance"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
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
              <CardDescription>Define RTO, RPO, and SLA targets</CardDescription>
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
                <p className="text-sm text-muted-foreground">
                  Maximum acceptable time to restore service
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Maximum acceptable data loss in hours
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sla_target">SLA Target (%)</Label>
                <Input
                  id="sla_target"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.sla_target}
                  onChange={(e) => handleInputChange('sla_target', parseFloat(e.target.value))}
                  placeholder="99.9"
                />
                <p className="text-sm text-muted-foreground">
                  Service level agreement target (e.g., 99.9% = 99.9)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mean Time Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Mean Time Metrics</CardTitle>
              <CardDescription>MTTA and MTTR objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mtta_hours">Mean Time To Acknowledge (MTTA) - Hours</Label>
                <Input
                  id="mtta_hours"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.mtta_hours}
                  onChange={(e) => handleInputChange('mtta_hours', parseFloat(e.target.value))}
                  placeholder="0.5"
                />
                <p className="text-sm text-muted-foreground">
                  Average time to acknowledge an incident
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mttr_hours">Mean Time To Recover (MTTR) - Hours</Label>
                <Input
                  id="mttr_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.mttr_hours}
                  onChange={(e) => handleInputChange('mttr_hours', parseFloat(e.target.value))}
                  placeholder="2"
                />
                <p className="text-sm text-muted-foreground">
                  Average time to recover from an incident
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dependencies & Procedures */}
          <Card>
            <CardHeader>
              <CardTitle>Dependencies & Procedures</CardTitle>
              <CardDescription>Service dependencies and recovery procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="recovery_procedures">Recovery Procedures</Label>
                <Textarea
                  id="recovery_procedures"
                  value={formData.recovery_procedures}
                  onChange={(e) => handleInputChange('recovery_procedures', e.target.value)}
                  placeholder="Step-by-step recovery procedures"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="lg:col-span-2">
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
                  placeholder="Additional notes, special considerations, or important information"
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
            {loading ? 'Creating...' : 'Create RTO/RPO Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRTOPage;
