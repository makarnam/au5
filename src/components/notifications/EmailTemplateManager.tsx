import React, { useState, useEffect } from 'react';
import { emailService, EmailTemplate } from '../../services/emailService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';

interface EmailTemplateManagerProps {
  onTemplateUpdate?: () => void;
}

export const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({ onTemplateUpdate }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, any>>({});

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    template_type: '',
    entity_type: '',
    description: '',
    is_active: true,
    variables: {}
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await emailService.getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load email templates');
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTemplate) {
        await emailService.updateEmailTemplate(selectedTemplate.id, formData);
        toast.success('Email template updated successfully');
      } else {
        await emailService.createEmailTemplate(formData);
        toast.success('Email template created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      loadTemplates();
      onTemplateUpdate?.();
    } catch (error) {
      toast.error('Failed to save email template');
      console.error('Error saving template:', error);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      template_type: template.template_type,
      entity_type: template.entity_type || '',
      description: template.description || '',
      is_active: template.is_active,
      variables: template.variables
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await emailService.deleteEmailTemplate(id);
      toast.success('Email template deleted successfully');
      loadTemplates();
      onTemplateUpdate?.();
    } catch (error) {
      toast.error('Failed to delete email template');
      console.error('Error deleting template:', error);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewVariables({});
    setIsPreviewOpen(true);
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      template_type: '',
      entity_type: '',
      description: '',
      is_active: true,
      variables: {}
    });
  };

  const processPreview = (template: string, variables: Record<string, any>): string => {
    let processed = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return processed;
  };

  const getTemplateTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      workflow_assignment: 'bg-blue-100 text-blue-800',
      workflow_reminder: 'bg-yellow-100 text-yellow-800',
      workflow_completion: 'bg-green-100 text-green-800',
      workflow_escalation: 'bg-red-100 text-red-800',
      audit_notification: 'bg-purple-100 text-purple-800',
      risk_notification: 'bg-orange-100 text-orange-800',
      finding_notification: 'bg-pink-100 text-pink-800',
      incident_notification: 'bg-red-100 text-red-800',
      system_notification: 'bg-gray-100 text-gray-800',
      reminder_notification: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-gray-600">Manage email notification templates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'Edit Email Template' : 'Create Email Template'}
              </DialogTitle>
              <DialogDescription>
                Configure email template for notifications
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="template_type">Template Type</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workflow_assignment">Workflow Assignment</SelectItem>
                      <SelectItem value="workflow_reminder">Workflow Reminder</SelectItem>
                      <SelectItem value="workflow_completion">Workflow Completion</SelectItem>
                      <SelectItem value="workflow_escalation">Workflow Escalation</SelectItem>
                      <SelectItem value="audit_notification">Audit Notification</SelectItem>
                      <SelectItem value="risk_notification">Risk Notification</SelectItem>
                      <SelectItem value="finding_notification">Finding Notification</SelectItem>
                      <SelectItem value="incident_notification">Incident Notification</SelectItem>
                      <SelectItem value="system_notification">System Notification</SelectItem>
                      <SelectItem value="reminder_notification">Reminder Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entity_type">Entity Type (Optional)</Label>
                  <Input
                    id="entity_type"
                    value={formData.entity_type}
                    onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                    placeholder="e.g., risk, audit, finding"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Template description"
                />
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject with variables like {{workflow_name}}"
                  required
                />
              </div>

              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Email body with variables like {{recipient_name}}"
                  rows={10}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    <Badge className={getTemplateTypeColor(template.template_type)}>
                      {template.template_type.replace('_', ' ')}
                    </Badge>
                    {!template.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {template.description || 'No description provided'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Subject:</strong> {template.subject}
                </div>
                <div>
                  <strong>Entity Type:</strong> {template.entity_type || 'All'}
                </div>
                <div>
                  <strong>Variables:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.keys(template.variables).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Email Template Preview</DialogTitle>
            <DialogDescription>
              Preview how the email will look with sample data
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Sample Variables</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.keys(selectedTemplate.variables).map((variable) => (
                    <div key={variable}>
                      <Label htmlFor={variable} className="text-sm">
                        {variable}
                      </Label>
                      <Input
                        id={variable}
                        value={previewVariables[variable] || ''}
                        onChange={(e) => setPreviewVariables({
                          ...previewVariables,
                          [variable]: e.target.value
                        })}
                        placeholder={`Enter ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-2">
                  <strong>Subject:</strong>
                  <div className="text-sm text-gray-700">
                    {processPreview(selectedTemplate.subject, previewVariables)}
                  </div>
                </div>
                <div>
                  <strong>Body:</strong>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
                    {processPreview(selectedTemplate.body, previewVariables)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
