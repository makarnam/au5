import { supabase } from "../lib/supabase";

export interface ReportComment {
  id: string;
  report_id?: string;
  section_id?: string;
  parent_id?: string;
  content: string;
  author_id: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  is_resolved?: boolean;
  mentions?: string[];
  attachments?: string[];
}

export interface ReportSharing {
  id: string;
  report_id: string;
  shared_by: string;
  shared_with: string;
  shared_with_email?: string;
  permission_level: 'view' | 'edit' | 'comment' | 'admin';
  expires_at?: string;
  created_at: string;
  access_token?: string;
  is_active: boolean;
}

export interface ApprovalRequest {
  id: string;
  entity_type: 'report' | 'audit' | 'finding';
  entity_id: string;
  requested_by: string;
  assigned_to: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  approval_steps?: ApprovalStep[];
  requested_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_to_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ApprovalStep {
  id: string;
  approval_request_id: string;
  step_order: number;
  assigned_to: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  approved_at?: string;
  required_role?: string;
}

export interface ReportStakeholder {
  id: string;
  report_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer' | 'approver';
  permissions: string[];
  added_by: string;
  added_at: string;
  is_active: boolean;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  added_by_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

class ReportCollaborationService {
  private static instance: ReportCollaborationService;

  static getInstance(): ReportCollaborationService {
    if (!ReportCollaborationService.instance) {
      ReportCollaborationService.instance = new ReportCollaborationService();
    }
    return ReportCollaborationService.instance;
  }

  // Comments Management
  async addComment(
    reportId: string,
    content: string,
    sectionId?: string,
    parentId?: string,
    mentions?: string[]
  ): Promise<ReportComment | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('report_comments')
        .insert([{
          report_id: reportId,
          section_id: sectionId,
          parent_id: parentId,
          content,
          author_id: user.user.id,
          mentions: mentions || [],
          is_resolved: false
        }])
        .select(`
          *,
          author:users!author_id(first_name, last_name, email)
        `)
        .single();

      if (error) throw error;

      // Notify mentioned users
      if (mentions && mentions.length > 0) {
        await this.notifyMentionedUsers(reportId, mentions, content, user.user.id);
      }

      return data;
    } catch (error) {
      console.error("Error adding comment:", error);
      return null;
    }
  }

  async getComments(reportId: string, sectionId?: string): Promise<ReportComment[]> {
    try {
      let query = supabase
        .from('report_comments')
        .select(`
          *,
          author:users!author_id(first_name, last_name, email),
          replies:report_comments!parent_id(*, author:users!author_id(first_name, last_name, email))
        `)
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  async resolveComment(commentId: string, resolved: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_comments')
        .update({ is_resolved: resolved })
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error resolving comment:", error);
      return false;
    }
  }

  // Report Sharing Management
  async shareReport(
    reportId: string,
    sharedWith: string,
    permissionLevel: 'view' | 'edit' | 'comment' | 'admin',
    expiresAt?: string
  ): Promise<ReportSharing | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('report_sharing')
        .insert([{
          report_id: reportId,
          shared_by: user.user.id,
          shared_with: sharedWith,
          permission_level: permissionLevel,
          expires_at: expiresAt,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notification to shared user
      await this.notifyShare(sharedWith, reportId, permissionLevel);

      return data;
    } catch (error) {
      console.error("Error sharing report:", error);
      return null;
    }
  }

  async getSharedReports(userId?: string): Promise<ReportSharing[]> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('report_sharing')
        .select(`
          *,
          report:generated_reports(title, description, created_at),
          shared_by_user:users!shared_by(first_name, last_name, email)
        `)
        .eq('shared_with', targetUserId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching shared reports:", error);
      return [];
    }
  }

  async revokeShare(shareId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_sharing')
        .update({ is_active: false })
        .eq('id', shareId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error revoking share:", error);
      return false;
    }
  }

  // Approval Workflows
  async createApprovalRequest(
    entityType: 'report' | 'audit' | 'finding',
    entityId: string,
    title: string,
    description?: string,
    assignedTo?: string,
    dueDate?: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<ApprovalRequest | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const assignedUserId = assignedTo || user.user.id;

      const { data, error } = await supabase
        .from('approval_requests')
        .insert([{
          entity_type: entityType,
          entity_id: entityId,
          requested_by: user.user.id,
          assigned_to: assignedUserId,
          title,
          description,
          due_date: dueDate,
          priority,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Notify assigned user
      await this.notifyApprovalRequest(data.id, assignedUserId, title);

      return data;
    } catch (error) {
      console.error("Error creating approval request:", error);
      return null;
    }
  }

  async getApprovalRequests(userId?: string): Promise<ApprovalRequest[]> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          requested_by_user:users!requested_by(first_name, last_name, email),
          assigned_to_user:users!assigned_to(first_name, last_name, email)
        `)
        .eq('assigned_to', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching approval requests:", error);
      return [];
    }
  }

  async approveRequest(
    requestId: string,
    comments?: string
  ): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log approval action
      await supabase
        .from('approval_actions')
        .insert([{
          approval_request_id: requestId,
          action: 'approved',
          performed_by: user.user.id,
          comments
        }]);

      return true;
    } catch (error) {
      console.error("Error approving request:", error);
      return false;
    }
  }

  async rejectRequest(
    requestId: string,
    comments?: string
  ): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('approval_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log rejection action
      await supabase
        .from('approval_actions')
        .insert([{
          approval_request_id: requestId,
          action: 'rejected',
          performed_by: user.user.id,
          comments
        }]);

      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      return false;
    }
  }

  // Stakeholder Management
  async addStakeholder(
    reportId: string,
    userId: string,
    role: 'owner' | 'editor' | 'reviewer' | 'viewer' | 'approver',
    permissions: string[]
  ): Promise<ReportStakeholder | null> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('report_stakeholders')
        .insert([{
          report_id: reportId,
          user_id: userId,
          role,
          permissions,
          added_by: currentUser.user.id,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding stakeholder:", error);
      return null;
    }
  }

  async getStakeholders(reportId: string): Promise<ReportStakeholder[]> {
    try {
      const { data, error } = await supabase
        .from('report_stakeholders')
        .select(`
          *,
          user:users!user_id(first_name, last_name, email),
          added_by_user:users!added_by(first_name, last_name, email)
        `)
        .eq('report_id', reportId)
        .eq('is_active', true)
        .order('added_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching stakeholders:", error);
      return [];
    }
  }

  async updateStakeholderPermissions(
    stakeholderId: string,
    role: 'owner' | 'editor' | 'reviewer' | 'viewer' | 'approver',
    permissions: string[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_stakeholders')
        .update({ role, permissions })
        .eq('id', stakeholderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating stakeholder permissions:", error);
      return false;
    }
  }

  async removeStakeholder(stakeholderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_stakeholders')
        .update({ is_active: false })
        .eq('id', stakeholderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing stakeholder:", error);
      return false;
    }
  }

  // Notification Helpers
  private async notifyMentionedUsers(
    reportId: string,
    mentions: string[],
    content: string,
    authorId: string
  ): Promise<void> {
    try {
      const { data: author } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', authorId)
        .single();

      const authorName = author ? `${author.first_name} ${author.last_name}` : 'Someone';

      const notifications = mentions.map(userId => ({
        user_id: userId,
        title: 'You were mentioned in a report comment',
        message: `${authorName} mentioned you in a report comment: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
        type: 'mention',
        entity_type: 'report',
        entity_id: reportId,
        action_url: `/reports/${reportId}`
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    } catch (error) {
      console.error("Error sending mention notifications:", error);
    }
  }

  private async notifyShare(
    sharedWith: string,
    reportId: string,
    permissionLevel: string
  ): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { data: report } = await supabase
        .from('generated_reports')
        .select('title')
        .eq('id', reportId)
        .single();

      const reportTitle = report?.title || 'a report';

      await supabase
        .from('notifications')
        .insert([{
          user_id: sharedWith,
          title: 'Report shared with you',
          message: `${currentUser.user.email} shared "${reportTitle}" with you (${permissionLevel} access)`,
          type: 'share',
          entity_type: 'report',
          entity_id: reportId,
          action_url: `/reports/${reportId}`
        }]);
    } catch (error) {
      console.error("Error sending share notification:", error);
    }
  }

  private async notifyApprovalRequest(
    requestId: string,
    assignedTo: string,
    title: string
  ): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert([{
          user_id: assignedTo,
          title: 'New approval request',
          message: `You have a new approval request: "${title}"`,
          type: 'approval',
          entity_type: 'approval_request',
          entity_id: requestId,
          action_url: `/approvals/${requestId}`
        }]);
    } catch (error) {
      console.error("Error sending approval notification:", error);
    }
  }
}

export const reportCollaborationService = ReportCollaborationService.getInstance();
export default reportCollaborationService;