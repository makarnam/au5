import React, { useState, useEffect } from 'react';
import { emailService, EmailPreferences } from '../../services/emailService';
import { useAuth } from '../../store/authStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { Mail, Bell, Clock, Calendar } from 'lucide-react';

export const EmailPreferencesManager: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let data = await emailService.getUserEmailPreferences(user.id);
      
      if (!data) {
        // Create default preferences if none exist
        data = await emailService.createUserEmailPreferences({
          user_id: user.id,
          workflow_notifications: true,
          audit_notifications: true,
          risk_notifications: true,
          finding_notifications: true,
          incident_notifications: true,
          system_notifications: true,
          reminder_notifications: true,
          daily_digest: false,
          weekly_digest: false,
          email_frequency: 'immediate'
        });
      }
      
      setPreferences(data);
    } catch (error) {
      toast.error('Failed to load email preferences');
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof EmailPreferences, value: boolean) => {
    if (!preferences || !user) return;
    
    try {
      setSaving(true);
      const updatedPreferences = await emailService.updateUserEmailPreferences(user.id, {
        [key]: value
      });
      setPreferences(updatedPreferences);
      toast.success('Email preferences updated');
    } catch (error) {
      toast.error('Failed to update email preferences');
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = async (frequency: 'immediate' | 'daily' | 'weekly') => {
    if (!preferences || !user) return;
    
    try {
      setSaving(true);
      const updatedPreferences = await emailService.updateUserEmailPreferences(user.id, {
        email_frequency: frequency
      });
      setPreferences(updatedPreferences);
      toast.success('Email frequency updated');
    } catch (error) {
      toast.error('Failed to update email frequency');
      console.error('Error updating frequency:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Unable to load email preferences</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Preferences</h2>
        <p className="text-gray-600">Configure your email notification preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Email Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Email Frequency
            </CardTitle>
            <CardDescription>
              Choose how often you want to receive email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-frequency">Notification Frequency</Label>
                <Select
                  value={preferences.email_frequency}
                  onValueChange={handleFrequencyChange}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="daily_digest"
                    checked={preferences.daily_digest}
                    onCheckedChange={(checked) => handleToggle('daily_digest', checked)}
                    disabled={saving}
                  />
                  <Label htmlFor="daily_digest">Daily Digest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weekly_digest"
                    checked={preferences.weekly_digest}
                    onCheckedChange={(checked) => handleToggle('weekly_digest', checked)}
                    disabled={saving}
                  />
                  <Label htmlFor="weekly_digest">Weekly Digest</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Workflow Notifications
            </CardTitle>
            <CardDescription>
              Receive email notifications for workflow activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="workflow_notifications">Workflow Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Notifications for workflow assignments, reminders, and completions
                  </p>
                </div>
                <Switch
                  id="workflow_notifications"
                  checked={preferences.workflow_notifications}
                  onCheckedChange={(checked) => handleToggle('workflow_notifications', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Audit Notifications
            </CardTitle>
            <CardDescription>
              Receive email notifications for audit-related activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit_notifications">Audit Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Notifications for audit assignments, updates, and completions
                  </p>
                </div>
                <Switch
                  id="audit_notifications"
                  checked={preferences.audit_notifications}
                  onCheckedChange={(checked) => handleToggle('audit_notifications', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Risk Notifications
            </CardTitle>
            <CardDescription>
              Receive email notifications for risk-related activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="risk_notifications">Risk Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Notifications for risk assessments, updates, and treatments
                  </p>
                </div>
                <Switch
                  id="risk_notifications"
                  checked={preferences.risk_notifications}
                  onCheckedChange={(checked) => handleToggle('risk_notifications', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finding Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Finding Notifications
            </CardTitle>
            <CardDescription>
              Receive email notifications for audit findings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="finding_notifications">Finding Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Notifications for new findings, updates, and remediation status
                  </p>
                </div>
                <Switch
                  id="finding_notifications"
                  checked={preferences.finding_notifications}
                  onCheckedChange={(checked) => handleToggle('finding_notifications', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incident Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Incident Notifications
            </CardTitle>
            <CardDescription>
              Receive email notifications for security incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="incident_notifications">Incident Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Notifications for security incidents, updates, and resolutions
                  </p>
                </div>
                <Switch
                  id="incident_notifications"
                  checked={preferences.incident_notifications}
                  onCheckedChange={(checked) => handleToggle('incident_notifications', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              System Notifications
            </CardTitle>
            <CardDescription>
              Receive email notifications for system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system_notifications">System Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Notifications for system maintenance, updates, and alerts
                  </p>
                </div>
                <Switch
                  id="system_notifications"
                  checked={preferences.system_notifications}
                  onCheckedChange={(checked) => handleToggle('system_notifications', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Reminder Notifications
            </CardTitle>
            <CardDescription>
              Receive email notifications for reminders and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminder_notifications">Reminder Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Notifications for upcoming deadlines, reviews, and reminders
                  </p>
                </div>
                <Switch
                  id="reminder_notifications"
                  checked={preferences.reminder_notifications}
                  onCheckedChange={(checked) => handleToggle('reminder_notifications', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {saving && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
          <span>Saving preferences...</span>
        </div>
      )}
    </div>
  );
};
