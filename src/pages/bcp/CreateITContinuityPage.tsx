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
import { CreateITContinuityForm } from '../../types/bcp';

const CreateITContinuityPage: React.FC = () => {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [formData, setFormData] = useState<CreateITContinuityForm>({
    environment: '',
    infrastructure: '',
    primary_location: '',
    secondary_location: '',
    network_redundancy: 'partial',
    power_redundancy: 'partial',
    cooling_redundancy: 'partial',
    monitoring_tools: '',
    alerting_systems: '',
    incident_response_team: '',
    escalation_procedures: '',
    backup_strategy: '',
    disaster_recovery_procedures: '',
    testing_schedule: '',
    maintenance_schedule: '',
    vendor_contacts: '',
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
      await bcpService.createITContinuityPlan({
        ...formData,
        plan_id: planId
      });
      navigate(`/bcp/${planId}`);
    } catch (error) {
      console.error('Error creating IT continuity plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateITContinuityForm, value: any) => {
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
            <h1 className="text-2xl font-bold">Create IT Continuity Plan</h1>
            <p className="text-muted-foreground">
              Add IT continuity details to {plan.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Environment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
              <CardDescription>Define the IT environment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="environment">Environment *</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value) => handleInputChange('environment', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="disaster_recovery">Disaster Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="infrastructure">Infrastructure Description</Label>
                <Textarea
                  id="infrastructure"
                  value={formData.infrastructure}
                  onChange={(e) => handleInputChange('infrastructure', e.target.value)}
                  placeholder="Describe the IT infrastructure components"
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
                    <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Primary and secondary locations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary_location">Primary Location</Label>
                <Input
                  id="primary_location"
                  value={formData.primary_location}
                  onChange={(e) => handleInputChange('primary_location', e.target.value)}
                  placeholder="e.g., Main Data Center - Building A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_location">Secondary Location</Label>
                <Input
                  id="secondary_location"
                  value={formData.secondary_location}
                  onChange={(e) => handleInputChange('secondary_location', e.target.value)}
                  placeholder="e.g., Backup Data Center - Building B"
                />
              </div>
            </CardContent>
          </Card>

          {/* Redundancy Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Redundancy Configuration</CardTitle>
              <CardDescription>Define redundancy levels for critical systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network_redundancy">Network Redundancy</Label>
                <Select
                  value={formData.network_redundancy}
                  onValueChange={(value) => handleInputChange('network_redundancy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="geo_redundant">Geo-Redundant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="power_redundancy">Power Redundancy</Label>
                <Select
                  value={formData.power_redundancy}
                  onValueChange={(value) => handleInputChange('power_redundancy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="ups_battery">UPS + Battery</SelectItem>
                    <SelectItem value="generator">Generator Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooling_redundancy">Cooling Redundancy</Label>
                <Select
                  value={formData.cooling_redundancy}
                  onValueChange={(value) => handleInputChange('cooling_redundancy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="n_plus_1">N+1</SelectItem>
                    <SelectItem value="n_plus_2">N+2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring & Alerting */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Alerting</CardTitle>
              <CardDescription>Monitoring tools and alerting systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monitoring_tools">Monitoring Tools</Label>
                <Textarea
                  id="monitoring_tools"
                  value={formData.monitoring_tools}
                  onChange={(e) => handleInputChange('monitoring_tools', e.target.value)}
                  placeholder="List monitoring tools and systems"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alerting_systems">Alerting Systems</Label>
                <Textarea
                  id="alerting_systems"
                  value={formData.alerting_systems}
                  onChange={(e) => handleInputChange('alerting_systems', e.target.value)}
                  placeholder="Describe alerting systems and escalation procedures"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Incident Response */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Response</CardTitle>
              <CardDescription>Team structure and escalation procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incident_response_team">Incident Response Team</Label>
                <Textarea
                  id="incident_response_team"
                  value={formData.incident_response_team}
                  onChange={(e) => handleInputChange('incident_response_team', e.target.value)}
                  placeholder="List team members and roles"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation_procedures">Escalation Procedures</Label>
                <Textarea
                  id="escalation_procedures"
                  value={formData.escalation_procedures}
                  onChange={(e) => handleInputChange('escalation_procedures', e.target.value)}
                  placeholder="Define escalation procedures and contact information"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Backup & Recovery */}
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>Backup strategy and disaster recovery procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup_strategy">Backup Strategy</Label>
                <Textarea
                  id="backup_strategy"
                  value={formData.backup_strategy}
                  onChange={(e) => handleInputChange('backup_strategy', e.target.value)}
                  placeholder="Describe backup strategy, frequency, and retention"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disaster_recovery_procedures">Disaster Recovery Procedures</Label>
                <Textarea
                  id="disaster_recovery_procedures"
                  value={formData.disaster_recovery_procedures}
                  onChange={(e) => handleInputChange('disaster_recovery_procedures', e.target.value)}
                  placeholder="Step-by-step disaster recovery procedures"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Testing & Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Testing & Maintenance</CardTitle>
              <CardDescription>Testing schedule and maintenance procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testing_schedule">Testing Schedule</Label>
                <Textarea
                  id="testing_schedule"
                  value={formData.testing_schedule}
                  onChange={(e) => handleInputChange('testing_schedule', e.target.value)}
                  placeholder="Define testing schedule and frequency"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance_schedule">Maintenance Schedule</Label>
                <Textarea
                  id="maintenance_schedule"
                  value={formData.maintenance_schedule}
                  onChange={(e) => handleInputChange('maintenance_schedule', e.target.value)}
                  placeholder="Define maintenance schedule and procedures"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>Vendor contacts and support information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_contacts">Vendor Contacts</Label>
                <Textarea
                  id="vendor_contacts"
                  value={formData.vendor_contacts}
                  onChange={(e) => handleInputChange('vendor_contacts', e.target.value)}
                  placeholder="List vendor contacts and support information"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or comments"
                  rows={3}
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
            {loading ? 'Creating...' : 'Create IT Continuity Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateITContinuityPage;
