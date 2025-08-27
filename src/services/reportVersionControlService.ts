import { supabase } from "../lib/supabase";

export interface ReportVersion {
  id: string;
  report_instance_id: string;
  version_number: number;
  version_label?: string;
  content_snapshot: any;
  change_summary?: string;
  change_reason?: string;
  created_by: string;
  created_at: string;
  created_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  version_label?: string;
  template_snapshot: any;
  change_summary?: string;
  change_reason?: string;
  created_by: string;
  created_at: string;
  created_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface VersionComparison {
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'added' | 'removed' | 'modified';
  }[];
  summary: {
    totalChanges: number;
    additions: number;
    modifications: number;
    deletions: number;
  };
}

class ReportVersionControlService {
  private static instance: ReportVersionControlService;

  static getInstance(): ReportVersionControlService {
    if (!ReportVersionControlService.instance) {
      ReportVersionControlService.instance = new ReportVersionControlService();
    }
    return ReportVersionControlService.instance;
  }

  // Report Version Control Methods
  async createReportVersion(
    reportInstanceId: string,
    contentSnapshot: any,
    changeSummary?: string,
    changeReason?: string,
    versionLabel?: string
  ): Promise<ReportVersion | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get the next version number
      const nextVersionNumber = await this.getNextReportVersionNumber(reportInstanceId);

      const { data, error } = await supabase
        .from('report_versions')
        .insert([{
          report_instance_id: reportInstanceId,
          version_number: nextVersionNumber,
          version_label: versionLabel,
          content_snapshot: contentSnapshot,
          change_summary: changeSummary,
          change_reason: changeReason,
          created_by: user.user.id,
        }])
        .select(`
          *,
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .single();

      if (error) throw error;

      // Notify stakeholders about the new version
      await this.notifyVersionCreated(reportInstanceId, nextVersionNumber, 'report');

      return data;
    } catch (error) {
      console.error("Error creating report version:", error);
      return null;
    }
  }

  async getReportVersions(reportInstanceId: string): Promise<ReportVersion[]> {
    try {
      const { data, error } = await supabase
        .from('report_versions')
        .select(`
          *,
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .eq('report_instance_id', reportInstanceId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching report versions:", error);
      return [];
    }
  }

  async getReportVersion(versionId: string): Promise<ReportVersion | null> {
    try {
      const { data, error } = await supabase
        .from('report_versions')
        .select(`
          *,
          created_by_user:users!created_by(first_name, last_name, email)
        `)
        .eq('id', versionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching report version:", error);
      return null;
    }
  }

  async restoreReportVersion(versionId: string): Promise<boolean> {
    try {
      const version = await this.getReportVersion(versionId);
      if (!version) return false;

      // Update the report instance with the version content
      const { error } = await supabase
        .from('report_instances')
        .update({
          content: version.content_snapshot,
          updated_at: new Date().toISOString(),
        })
        .eq('id', version.report_instance_id);

      if (error) throw error;

      // Create a new version with the restored content
      await this.createReportVersion(
        version.report_instance_id,
        version.content_snapshot,
        `Restored from version ${version.version_number}`,
        "Version restoration"
      );

      return true;
    } catch (error) {
      console.error("Error restoring report version:", error);
      return false;
    }
  }

  async compareReportVersions(versionId1: string, versionId2: string): Promise<VersionComparison | null> {
    try {
      const [version1, version2] = await Promise.all([
        this.getReportVersion(versionId1),
        this.getReportVersion(versionId2)
      ]);

      if (!version1 || !version2) return null;

      const changes = this.compareContentSnapshots(
        version1.content_snapshot,
        version2.content_snapshot
      );

      const summary = {
        totalChanges: changes.length,
        additions: changes.filter(c => c.changeType === 'added').length,
        modifications: changes.filter(c => c.changeType === 'modified').length,
        deletions: changes.filter(c => c.changeType === 'removed').length,
      };

      return { changes, summary };
    } catch (error) {
      console.error("Error comparing report versions:", error);
      return null;
    }
  }

  // Template Version Control Methods
  async createTemplateVersion(
    templateId: string,
    templateSnapshot: any,
    changeSummary?: string,
    changeReason?: string,
    versionLabel?: string
  ): Promise<TemplateVersion | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // For templates, we'll store versions in a separate table or extend the existing structure
      // For now, let's create a template_versions table entry
      const nextVersionNumber = await this.getNextTemplateVersionNumber(templateId);

      // Since we don't have a template_versions table, let's store in report_versions with a flag
      // or create a simple approach by updating the template and keeping history in JSON
      const { data, error } = await supabase
        .from('report_templates')
        .update({
          template_structure: templateSnapshot,
          version: nextVersionNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // Create a version record in a more flexible way
      const versionData = {
        template_id: templateId,
        version_number: nextVersionNumber,
        version_label: versionLabel,
        template_snapshot: templateSnapshot,
        change_summary: changeSummary,
        change_reason: changeReason,
        created_by: user.user.id,
        created_at: new Date().toISOString(),
      };

      // Store template version history (you might want to create a dedicated table for this)
      const { error: versionError } = await supabase
        .from('audit_logs') // Using audit_logs as a temporary storage for template versions
        .insert([{
          action: 'template_version_created',
          entity_type: 'template',
          entity_id: templateId,
          details: versionData,
          performed_by: user.user.id,
        }]);

      if (versionError) {
        console.warn("Could not store template version history:", versionError);
      }

      await this.notifyVersionCreated(templateId, nextVersionNumber, 'template');

      return {
        ...versionData,
        id: data.id, // Using template ID as version ID for now
        created_by_user: {
          first_name: user.user.user_metadata?.first_name || '',
          last_name: user.user.user_metadata?.last_name || '',
          email: user.user.email || '',
        }
      } as TemplateVersion;
    } catch (error) {
      console.error("Error creating template version:", error);
      return null;
    }
  }

  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    try {
      // Retrieve template versions from audit_logs (temporary approach)
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'template')
        .eq('entity_id', templateId)
        .eq('action', 'template_version_created')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const versions: TemplateVersion[] = [];
      for (const log of data || []) {
        if (log.details && typeof log.details === 'object') {
          const versionData = log.details as any;
          versions.push({
            ...versionData,
            id: log.id,
            created_by_user: await this.getUserInfo(versionData.created_by),
          });
        }
      }

      return versions;
    } catch (error) {
      console.error("Error fetching template versions:", error);
      return [];
    }
  }

  async restoreTemplateVersion(versionId: string): Promise<boolean> {
    try {
      // Get version data from audit_logs
      const { data: logEntry, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', versionId)
        .eq('action', 'template_version_created')
        .single();

      if (error || !logEntry) return false;

      const versionData = logEntry.details as any;

      // Update the template with the version content
      const { error: updateError } = await supabase
        .from('report_templates')
        .update({
          template_structure: versionData.template_snapshot,
          version: versionData.version_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', versionData.template_id);

      if (updateError) throw updateError;

      // Create a new version with the restored content
      await this.createTemplateVersion(
        versionData.template_id,
        versionData.template_snapshot,
        `Restored from version ${versionData.version_number}`,
        "Template restoration"
      );

      return true;
    } catch (error) {
      console.error("Error restoring template version:", error);
      return false;
    }
  }

  // Utility Methods
  private async getNextReportVersionNumber(reportInstanceId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('report_versions')
        .select('version_number')
        .eq('report_instance_id', reportInstanceId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      return data && data.length > 0 ? data[0].version_number + 1 : 1;
    } catch (error) {
      console.error("Error getting next version number:", error);
      return 1;
    }
  }

  private async getNextTemplateVersionNumber(templateId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('version')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      return (data?.version || 0) + 1;
    } catch (error) {
      console.error("Error getting next template version number:", error);
      return 1;
    }
  }

  private compareContentSnapshots(oldContent: any, newContent: any): VersionComparison['changes'] {
    const changes: VersionComparison['changes'] = [];

    // Compare sections
    if (oldContent.sections && newContent.sections) {
      const oldSections = oldContent.sections || [];
      const newSections = newContent.sections || [];

      // Check for added sections
      newSections.forEach((newSection: any, index: number) => {
        const oldSection = oldSections.find((s: any) => s.id === newSection.id);
        if (!oldSection) {
          changes.push({
            field: `Section ${index + 1}: ${newSection.name}`,
            oldValue: null,
            newValue: newSection,
            changeType: 'added',
          });
        } else {
          // Compare section properties
          if (oldSection.content !== newSection.content) {
            changes.push({
              field: `Section "${newSection.name}" content`,
              oldValue: oldSection.content,
              newValue: newSection.content,
              changeType: 'modified',
            });
          }
          if (oldSection.configuration?.ai_enabled !== newSection.configuration?.ai_enabled) {
            changes.push({
              field: `Section "${newSection.name}" AI settings`,
              oldValue: oldSection.configuration?.ai_enabled,
              newValue: newSection.configuration?.ai_enabled,
              changeType: 'modified',
            });
          }
        }
      });

      // Check for removed sections
      oldSections.forEach((oldSection: any) => {
        const newSection = newSections.find((s: any) => s.id === oldSection.id);
        if (!newSection) {
          changes.push({
            field: `Section: ${oldSection.name}`,
            oldValue: oldSection,
            newValue: null,
            changeType: 'removed',
          });
        }
      });
    }

    // Compare metadata
    ['title', 'description', 'entity_type'].forEach(field => {
      if (oldContent[field] !== newContent[field]) {
        changes.push({
          field: field.charAt(0).toUpperCase() + field.slice(1),
          oldValue: oldContent[field],
          newValue: newContent[field],
          changeType: oldContent[field] ? 'modified' : 'added',
        });
      }
    });

    return changes;
  }

  private async getUserInfo(userId: string): Promise<{ first_name: string; last_name: string; email: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        email: data?.email || '',
      };
    } catch (error) {
      console.error("Error fetching user info:", error);
      return { first_name: '', last_name: '', email: '' };
    }
  }

  private async notifyVersionCreated(entityId: string, versionNumber: number, entityType: 'report' | 'template'): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const entityName = entityType === 'report' ? 'report' : 'template';

      await supabase
        .from('notifications')
        .insert([{
          user_id: user.user.id,
          title: `New ${entityName} version created`,
          message: `Version ${versionNumber} of the ${entityName} has been created`,
          type: 'version_created',
          entity_type: entityType,
          entity_id: entityId,
          action_url: entityType === 'report' ? `/reports/${entityId}` : `/templates/${entityId}`
        }]);
    } catch (error) {
      console.error("Error sending version notification:", error);
    }
  }
}

export const reportVersionControlService = ReportVersionControlService.getInstance();
export default reportVersionControlService;