import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { emailService } from '../../services/emailService';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Settings,
  TrendingUp,
  Timer,
  Zap
} from 'lucide-react';

interface SLAMonitoringProps {
  incidentId?: string;
  className?: string;
}

interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_levels: EscalationLevel[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EscalationLevel {
  level: number;
  time_hours: number;
  notify_roles: string[];
  auto_escalate: boolean;
}

interface SLAMonitoringData {
  id: string;
  incident_id: string;
  sla_policy_id: string;
  response_deadline: string;
  resolution_deadline: string;
  actual_response_time?: number;
  actual_resolution_time?: number;
  response_sla_met: boolean;
  resolution_sla_met: boolean;
  current_escalation_level: number;
  last_escalation_at?: string;
  alerts_sent: string[];
  created_at: string;
  updated_at: string;
}

interface SLAAlert {
  id: string;
  incident_id: string;
  alert_type: 'response_warning' | 'response_breach' | 'resolution_warning' | 'resolution_breach' | 'escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  sent_to: string[];
  sent_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

const SLA_COLORS = {
  met: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  breached: 'bg-red-100 text-red-800',
  pending: 'bg-blue-100 text-blue-800'
};

const SEVERITY_CONFIG = {
  low: { response: 24, resolution: 72, color: 'bg-green-100 text-green-800' },
  medium: { response: 8, resolution: 24, color: 'bg-yellow-100 text-yellow-800' },
  high: { response: 4, resolution: 12, color: 'bg-orange-100 text-orange-800' },
  critical: { response: 1, resolution: 4, color: 'bg-red-100 text-red-800' }
};

export default function SLAMonitoring({ incidentId, className = "" }: SLAMonitoringProps) {
  const [slaData, setSlaData] = useState<SLAMonitoringData | null>(null);
  const [slaPolicy, setSlaPolicy] = useState<SLAPolicy | null>(null);
  const [alerts, setAlerts] = useState<SLAAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPolicy, setEditingPolicy] = useState<SLAPolicy | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (incidentId) {
      loadSLAMonitoring();
      // Set up real-time monitoring
      const interval = setInterval(checkSLAs, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [incidentId]);

  async function loadSLAMonitoring() {
    if (!incidentId) return;

    try {
      setLoading(true);
      setError(null);

      // Get incident details
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', incidentId)
        .single();

      if (incidentError) throw incidentError;

      // Get SLA policy for this severity
      const { data: policy, error: policyError } = await supabase
        .from('sla_policies')
        .select('*')
        .eq('severity', incident.severity)
        .eq('is_active', true)
        .single();

      if (policyError && policyError.code !== 'PGRST116') throw policyError; // PGRST116 = no rows

      // Get or create SLA monitoring data
      let { data: monitoring, error: monitoringError } = await supabase
        .from('sla_monitoring')
        .select('*')
        .eq('incident_id', incidentId)
        .single();

      if (monitoringError && monitoringError.code === 'PGRST116') {
        // Create new SLA monitoring record
        if (policy) {
          const createdAt = new Date(incident.created_at);
          const responseDeadline = new Date(createdAt.getTime() + policy.response_time_hours * 60 * 60 * 1000);
          const resolutionDeadline = new Date(createdAt.getTime() + policy.resolution_time_hours * 60 * 60 * 1000);

          const { data: newMonitoring, error: createError } = await supabase
            .from('sla_monitoring')
            .insert({
              incident_id: incidentId,
              sla_policy_id: policy.id,
              response_deadline: responseDeadline.toISOString(),
              resolution_deadline: resolutionDeadline.toISOString(),
              response_sla_met: false,
              resolution_sla_met: false,
              current_escalation_level: 0,
              alerts_sent: []
            })
            .select()
            .single();

          if (createError) throw createError;
          monitoring = newMonitoring;
        }
      } else if (monitoringError) {
        throw monitoringError;
      }

      // Get SLA alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('sla_alerts')
        .select('*')
        .eq('incident_id', incidentId)
        .order('sent_at', { ascending: false });

      if (alertsError) throw alertsError;

      setSlaPolicy(policy || null);
      setSlaData(monitoring || null);
      setAlerts(alertsData || []);

    } catch (err) {
      console.error('Error loading SLA monitoring:', err);
      setError('Failed to load SLA monitoring');
    } finally {
      setLoading(false);
    }
  }

  async function checkSLAs() {
    if (!slaData || !slaPolicy || !incidentId) return;

    const now = new Date();
    const responseDeadline = new Date(slaData.response_deadline);
    const resolutionDeadline = new Date(slaData.resolution_deadline);

    // Check response time SLA
    if (!slaData.actual_response_time && now > responseDeadline) {
      await handleSLABreach('response_breach', `Response time SLA breached for incident ${incidentId}`);
    } else if (!slaData.actual_response_time && now > new Date(responseDeadline.getTime() - 2 * 60 * 60 * 1000)) {
      await handleSLAWarning('response_warning', `Response time SLA warning for incident ${incidentId}`);
    }

    // Check resolution time SLA
    if (!slaData.actual_resolution_time && now > resolutionDeadline) {
      await handleSLABreach('resolution_breach', `Resolution time SLA breached for incident ${incidentId}`);
    } else if (!slaData.actual_resolution_time && now > new Date(resolutionDeadline.getTime() - 4 * 60 * 60 * 1000)) {
      await handleSLAWarning('resolution_warning', `Resolution time SLA warning for incident ${incidentId}`);
    }

    // Check escalation levels
    const timeSinceCreation = (now.getTime() - new Date(slaData.created_at).getTime()) / (1000 * 60 * 60);
    const escalationLevel = slaPolicy.escalation_levels.find(level => timeSinceCreation >= level.time_hours);

    if (escalationLevel && escalationLevel.level > slaData.current_escalation_level) {
      await handleEscalation(escalationLevel);
    }
  }

  async function handleSLABreach(type: 'response_breach' | 'resolution_breach', message: string) {
    await createSLAAlert(type, 'critical', message);
    // Send email notifications
    await sendSLANotifications(type, message);
  }

  async function handleSLAWarning(type: 'response_warning' | 'resolution_warning', message: string) {
    await createSLAAlert(type, 'high', message);
    // Send email notifications
    await sendSLANotifications(type, message);
  }

  async function handleEscalation(escalationLevel: EscalationLevel) {
    const message = `Incident ${incidentId} escalated to level ${escalationLevel.level}`;
    await createSLAAlert('escalation', 'high', message);

    // Update escalation level
    await supabase
      .from('sla_monitoring')
      .update({
        current_escalation_level: escalationLevel.level,
        last_escalation_at: new Date().toISOString()
      })
      .eq('id', slaData!.id);

    // Send notifications to escalation roles
    await sendEscalationNotifications(escalationLevel.notify_roles, message);

    // Reload data
    await loadSLAMonitoring();
  }

  async function createSLAAlert(type: SLAAlert['alert_type'], severity: SLAAlert['severity'], message: string) {
    if (!incidentId) return;

    // Check if alert already exists (avoid duplicates)
    const existingAlert = alerts.find(alert =>
      alert.alert_type === type &&
      new Date(alert.sent_at).getTime() > Date.now() - 60 * 60 * 1000 // Within last hour
    );

    if (existingAlert) return;

    const { error } = await supabase
      .from('sla_alerts')
      .insert({
        incident_id: incidentId,
        alert_type: type,
        severity,
        message,
        sent_to: [], // Will be populated by notification logic
        sent_at: new Date().toISOString(),
        acknowledged: false
      });

    if (error) console.error('Error creating SLA alert:', error);
  }

  async function sendSLANotifications(alertType: string, message: string) {
    try {
      // Get users to notify (incident manager, supervisors, etc.)
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('role', ['admin', 'incident_manager', 'supervisor'])
        .eq('is_active', true);

      if (error) throw error;

      for (const user of users || []) {
        if (user.email) {
          await emailService.sendWorkflowStepAssignmentEmail(
            user.id,
            'SLA Alert',
            alertType,
            'incident',
            incidentId || '',
            new Date().toISOString().split('T')[0],
            'high',
            message
          );
        }
      }
    } catch (err) {
      console.error('Error sending SLA notifications:', err);
    }
  }

  async function sendEscalationNotifications(roles: string[], message: string) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('role', roles)
        .eq('is_active', true);

      if (error) throw error;

      for (const user of users || []) {
        if (user.email) {
          await emailService.sendWorkflowEscalationEmail(
            user.id,
            'Incident Escalation',
            `Escalation Alert`,
            'incident',
            incidentId || '',
            'System',
            new Date().toISOString(),
            0,
            message
          );
        }
      }
    } catch (err) {
      console.error('Error sending escalation notifications:', err);
    }
  }

  async function acknowledgeAlert(alertId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('sla_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      await loadSLAMonitoring();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  }

  const getSLAStatus = () => {
    if (!slaData) return { status: 'no_sla', color: 'bg-gray-100 text-gray-800' };

    const now = new Date();
    const responseDeadline = new Date(slaData.response_deadline);
    const resolutionDeadline = new Date(slaData.resolution_deadline);

    if (slaData.actual_response_time && slaData.actual_resolution_time) {
      const bothMet = slaData.response_sla_met && slaData.resolution_sla_met;
      return {
        status: bothMet ? 'met' : 'breached',
        color: bothMet ? SLA_COLORS.met : SLA_COLORS.breached
      };
    }

    if (now > resolutionDeadline) {
      return { status: 'breached', color: SLA_COLORS.breached };
    }

    if (now > new Date(resolutionDeadline.getTime() - 4 * 60 * 60 * 1000) ||
        now > new Date(responseDeadline.getTime() - 2 * 60 * 60 * 1000)) {
      return { status: 'warning', color: SLA_COLORS.warning };
    }

    return { status: 'pending', color: SLA_COLORS.pending };
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Overdue';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const slaStatus = getSLAStatus();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            SLA Monitoring & Alerts <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">New</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Service Level Agreement tracking and automated alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={slaStatus.color}>
            SLA: {slaStatus.status.toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadSLAMonitoring}>
            <Settings className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* SLA Status Cards */}
      {slaData && slaPolicy && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time SLA</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {slaData.actual_response_time ?
                      `${slaData.actual_response_time.toFixed(1)}h` :
                      getTimeRemaining(slaData.response_deadline)
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {slaPolicy.response_time_hours}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Time SLA</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {slaData.actual_resolution_time ?
                      `${slaData.actual_resolution_time.toFixed(1)}h` :
                      getTimeRemaining(slaData.resolution_deadline)
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {slaPolicy.resolution_time_hours}h
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalation Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {slaData.current_escalation_level}
                  </p>
                  <p className="text-xs text-gray-500">
                    {slaData.last_escalation_at ?
                      `Last: ${new Date(slaData.last_escalation_at).toLocaleDateString()}` :
                      'No escalations'
                    }
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SLA Policy Info */}
      {slaPolicy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              SLA Policy: {slaPolicy.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Response & Resolution Times</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span className="font-medium">{slaPolicy.response_time_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution Time:</span>
                    <span className="font-medium">{slaPolicy.resolution_time_hours} hours</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Escalation Levels</h4>
                <div className="space-y-2 text-sm">
                  {slaPolicy.escalation_levels.map((level) => (
                    <div key={level.level} className="flex justify-between">
                      <span>Level {level.level} ({level.time_hours}h):</span>
                      <span className="font-medium">{level.notify_roles.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLA Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            SLA Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${
                  alert.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        'text-yellow-600'
                      }`} />
                      <span className="font-medium capitalize">
                        {alert.alert_type.replace('_', ' ')}
                      </span>
                      <Badge variant={alert.acknowledged ? "secondary" : "destructive"}>
                        {alert.acknowledged ? 'Acknowledged' : 'Active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="text-xs text-gray-500">
                      Sent: {new Date(alert.sent_at).toLocaleString()}
                      {alert.acknowledged && alert.acknowledged_at && (
                        <> • Ack: {new Date(alert.acknowledged_at).toLocaleString()}</>
                      )}
                    </div>
                  </div>

                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No SLA alerts at this time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SLA Policy Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            SLA Policy Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Configure SLA policies for different incident severities
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage SLA Policies
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>SLA Policy Configuration</DialogTitle>
                </DialogHeader>
                <SLAPolicyForm
                  policy={editingPolicy}
                  onSave={async (policyData) => {
                    // Save SLA policy logic would go here
                    console.log('Saving SLA policy:', policyData);
                    setIsDialogOpen(false);
                    setEditingPolicy(null);
                  }}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingPolicy(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SLAPolicyFormProps {
  policy?: SLAPolicy | null;
  onSave: (data: Partial<SLAPolicy>) => void;
  onCancel: () => void;
}

const SLAPolicyForm: React.FC<SLAPolicyFormProps> = ({
  policy,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: policy?.name || '',
    description: policy?.description || '',
    severity: policy?.severity || 'medium',
    response_time_hours: policy?.response_time_hours || 8,
    resolution_time_hours: policy?.resolution_time_hours || 24,
    escalation_levels: policy?.escalation_levels || [
      { level: 1, time_hours: 4, notify_roles: ['supervisor'], auto_escalate: true },
      { level: 2, time_hours: 8, notify_roles: ['admin'], auto_escalate: true }
    ],
    is_active: policy?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Policy Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., High Priority SLA"
            required
          />
        </div>

        <div>
          <Label htmlFor="severity">Severity</Label>
          <Select
            value={formData.severity}
            onValueChange={(value: SLAPolicy['severity']) =>
              setFormData(prev => ({ ...prev, severity: value }))
            }
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
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Policy description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Response Time (hours)</Label>
          <Input
            type="number"
            min="1"
            value={formData.response_time_hours}
            onChange={(e) => setFormData(prev => ({ ...prev, response_time_hours: parseInt(e.target.value) }))}
          />
        </div>
        <div>
          <Label>Resolution Time (hours)</Label>
          <Input
            type="number"
            min="1"
            value={formData.resolution_time_hours}
            onChange={(e) => setFormData(prev => ({ ...prev, resolution_time_hours: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="is_active">Active Policy</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {policy ? 'Update Policy' : 'Create Policy'}
        </Button>
      </div>
    </form>
  );
};