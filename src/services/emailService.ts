import { supabase } from '../lib/supabase';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: string;
  entity_type?: string;
  variables: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  description?: string;
}

export interface EmailLog {
  id: string;
  user_id: string;
  template_id: string;
  notification_id?: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

export interface EmailPreferences {
  id: string;
  user_id: string;
  workflow_notifications: boolean;
  audit_notifications: boolean;
  risk_notifications: boolean;
  finding_notifications: boolean;
  incident_notifications: boolean;
  system_notifications: boolean;
  reminder_notifications: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

export interface EmailConfiguration {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SendEmailRequest {
  template_id: string;
  user_id: string;
  recipient_email: string;
  variables: Record<string, any>;
  notification_id?: string;
}

class EmailService {
  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmailTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Email Configuration
  async getEmailConfiguration(): Promise<EmailConfiguration | null> {
    const { data, error } = await supabase
      .from('email_configuration')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmailConfiguration(config: Partial<EmailConfiguration>): Promise<EmailConfiguration> {
    const { data, error } = await supabase
      .from('email_configuration')
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq('is_active', true)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Email Preferences
  async getUserEmailPreferences(userId: string): Promise<EmailPreferences | null> {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async createUserEmailPreferences(preferences: Omit<EmailPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<EmailPreferences> {
    const { data, error } = await supabase
      .from('email_preferences')
      .insert(preferences)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserEmailPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<EmailPreferences> {
    const { data, error } = await supabase
      .from('email_preferences')
      .update({ ...preferences, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Email Logs
  async getEmailLogs(userId?: string, limit = 50): Promise<EmailLog[]> {
    let query = supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createEmailLog(log: Omit<EmailLog, 'id' | 'created_at'>): Promise<EmailLog> {
    const { data, error } = await supabase
      .from('email_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmailLogStatus(id: string, status: EmailLog['status'], errorMessage?: string): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.error_message = errorMessage;
      updateData.retry_count = supabase.sql`retry_count + 1`;
    }

    const { error } = await supabase
      .from('email_logs')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  }

  // Email Sending
  async sendEmail(request: SendEmailRequest): Promise<EmailLog> {
    try {
      // Get template
      const template = await this.getEmailTemplate(request.template_id);
      if (!template) {
        throw new Error('Email template not found');
      }

      // Get user preferences
      const preferences = await this.getUserEmailPreferences(request.user_id);
      if (!preferences) {
        throw new Error('User email preferences not found');
      }

      // Check if user wants this type of email
      if (!this.shouldSendEmail(template.template_type, preferences)) {
        throw new Error('User has disabled this type of email notification');
      }

      // Process template variables
      const processedSubject = this.processTemplate(template.subject, request.variables);
      const processedBody = this.processTemplate(template.body, request.variables);

      // Create email log
      const emailLog = await this.createEmailLog({
        user_id: request.user_id,
        template_id: request.template_id,
        notification_id: request.notification_id,
        recipient_email: request.recipient_email,
        subject: processedSubject,
        body: processedBody,
        status: 'pending',
        retry_count: 0
      });

      // TODO: Integrate with actual SMTP service
      // For now, simulate email sending
      await this.simulateEmailSending(emailLog.id);

      return emailLog;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private shouldSendEmail(templateType: string, preferences: EmailPreferences): boolean {
    switch (templateType) {
      case 'workflow_assignment':
      case 'workflow_reminder':
      case 'workflow_completion':
      case 'workflow_escalation':
        return preferences.workflow_notifications;
      case 'audit_notification':
        return preferences.audit_notifications;
      case 'risk_notification':
        return preferences.risk_notifications;
      case 'finding_notification':
        return preferences.finding_notifications;
      case 'incident_notification':
        return preferences.incident_notifications;
      case 'system_notification':
        return preferences.system_notifications;
      case 'reminder_notification':
        return preferences.reminder_notifications;
      default:
        return true;
    }
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return processed;
  }

  private async simulateEmailSending(emailLogId: string): Promise<void> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update status to sent
    await this.updateEmailLogStatus(emailLogId, 'sent');

    // Simulate delivery delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update status to delivered
    await this.updateEmailLogStatus(emailLogId, 'delivered');
  }

  // Workflow Email Notifications
  async sendWorkflowStepAssignmentEmail(
    userId: string,
    workflowName: string,
    stepName: string,
    entityType: string,
    entityName: string,
    dueDate: string,
    priority: string,
    actionDescription: string
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user?.email) return;

    await this.sendEmail({
      template_id: await this.getTemplateIdByType('workflow_assignment'),
      user_id: userId,
      recipient_email: user.email,
      variables: {
        recipient_name: user.full_name || user.email,
        workflow_name: workflowName,
        step_name: stepName,
        entity_type: entityType,
        entity_name: entityName,
        due_date: dueDate,
        priority: priority,
        action_description: actionDescription,
        system_name: 'AU5 System'
      }
    });
  }

  async sendWorkflowReminderEmail(
    userId: string,
    workflowName: string,
    stepName: string,
    entityType: string,
    entityName: string,
    dueDate: string,
    daysOverdue: number,
    actionDescription: string
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user?.email) return;

    await this.sendEmail({
      template_id: await this.getTemplateIdByType('workflow_reminder'),
      user_id: userId,
      recipient_email: user.email,
      variables: {
        recipient_name: user.full_name || user.email,
        workflow_name: workflowName,
        step_name: stepName,
        entity_type: entityType,
        entity_name: entityName,
        due_date: dueDate,
        days_overdue: daysOverdue,
        action_description: actionDescription,
        system_name: 'AU5 System'
      }
    });
  }

  async sendWorkflowCompletionEmail(
    userId: string,
    workflowName: string,
    entityType: string,
    entityName: string,
    completionDate: string,
    duration: string,
    completionSummary: string
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user?.email) return;

    await this.sendEmail({
      template_id: await this.getTemplateIdByType('workflow_completion'),
      user_id: userId,
      recipient_email: user.email,
      variables: {
        recipient_name: user.full_name || user.email,
        workflow_name: workflowName,
        entity_type: entityType,
        entity_name: entityName,
        completion_date: completionDate,
        duration: duration,
        completion_summary: completionSummary,
        system_name: 'AU5 System'
      }
    });
  }

  async sendWorkflowEscalationEmail(
    userId: string,
    workflowName: string,
    stepName: string,
    entityType: string,
    entityName: string,
    originalAssignee: string,
    dueDate: string,
    daysOverdue: number,
    actionDescription: string
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user?.email) return;

    await this.sendEmail({
      template_id: await this.getTemplateIdByType('workflow_escalation'),
      user_id: userId,
      recipient_email: user.email,
      variables: {
        recipient_name: user.full_name || user.email,
        workflow_name: workflowName,
        step_name: stepName,
        entity_type: entityType,
        entity_name: entityName,
        original_assignee: originalAssignee,
        due_date: dueDate,
        days_overdue: daysOverdue,
        action_description: actionDescription,
        system_name: 'AU5 System'
      }
    });
  }

  private async getUserById(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  private async getTemplateIdByType(templateType: string): Promise<string> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('id')
      .eq('template_type', templateType)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data.id;
  }
}

export const emailService = new EmailService();
