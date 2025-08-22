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
import { CreateResourceForm } from '../../types/bcp';

const CreateResourcePage: React.FC = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateResourceForm>({
    resource_name: '',
    resource_type: 'hardware',
    description: '',
    quantity: 1,
    unit_cost: 0,
    location: '',
    supplier: '',
    supplier_contact: '',
    lead_time_days: 0,
    availability: 'available',
    maintenance_schedule: '',
    last_maintenance: null,
    next_maintenance: null,
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
      await bcpService.createResource({
        ...formData,
        plan_id: planId
      });
      navigate(`/bcp/${planId}`);
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateResourceForm, value: any) => {
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
            <h1 className="text-2xl font-bold">Create Resource</h1>
            <p className="text-muted-foreground">
              Add a resource to {plan.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Information */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Information</CardTitle>
              <CardDescription>Define the resource details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource_name">Resource Name *</Label>
                <Input
                  id="resource_name"
                  value={formData.resource_name}
                  onChange={(e) => handleInputChange('resource_name', e.target.value)}
                  placeholder="e.g., Backup Server"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource_type">Resource Type *</Label>
                <Select
                  value={formData.resource_type}
                  onValueChange={(value) => handleInputChange('resource_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="personnel">Personnel</SelectItem>
                    <SelectItem value="facility">Facility</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the resource and its purpose"
                  rows={3}
                />
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
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Cost */}
          <Card>
            <CardHeader>
              <CardTitle>Quantity & Cost</CardTitle>
              <CardDescription>Resource quantity and cost information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_cost">Unit Cost ($)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Total Cost</Label>
                <Input
                  value={`$${(formData.quantity * formData.unit_cost).toFixed(2)}`}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Availability</CardTitle>
              <CardDescription>Where the resource is located and its availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Main Data Center, Building A"
                />
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
              <CardDescription>Supplier details and lead times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="e.g., ABC Technologies Inc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_contact">Supplier Contact</Label>
                <Input
                  id="supplier_contact"
                  value={formData.supplier_contact}
                  onChange={(e) => handleInputChange('supplier_contact', e.target.value)}
                  placeholder="Contact person or department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                <Input
                  id="lead_time_days"
                  type="number"
                  min="0"
                  value={formData.lead_time_days}
                  onChange={(e) => handleInputChange('lead_time_days', parseInt(e.target.value))}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Maintenance dates and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maintenance_schedule">Maintenance Schedule</Label>
                <Textarea
                  id="maintenance_schedule"
                  value={formData.maintenance_schedule}
                  onChange={(e) => handleInputChange('maintenance_schedule', e.target.value)}
                  placeholder="Describe maintenance schedule and frequency"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_maintenance">Last Maintenance Date</Label>
                <Input
                  id="last_maintenance"
                  type="date"
                  value={formData.last_maintenance || ''}
                  onChange={(e) => handleInputChange('last_maintenance', e.target.value || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_maintenance">Next Maintenance Date</Label>
                <Input
                  id="next_maintenance"
                  type="date"
                  value={formData.next_maintenance || ''}
                  onChange={(e) => handleInputChange('next_maintenance', e.target.value || null)}
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
                  placeholder="Additional notes, special instructions, or important information"
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
            {loading ? 'Creating...' : 'Create Resource'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateResourcePage;
