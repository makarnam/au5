import React from 'react';
import { EmailTemplateManager } from '../../components/notifications/EmailTemplateManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Mail, Settings } from 'lucide-react';

export const EmailTemplateManagement: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Email Template Management</h1>
          <p className="text-gray-600">Create and manage email notification templates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Template Configuration
          </CardTitle>
          <CardDescription>
            Configure email templates for different types of notifications. Templates support variables that will be replaced with actual data when emails are sent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailTemplateManager />
        </CardContent>
      </Card>
    </div>
  );
};
