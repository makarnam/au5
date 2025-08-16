import { supabase } from '../lib/supabase';
import {
  Document,
  DocumentCategory,
  DocumentTag,
  DocumentVersion,
  DocumentPermission,
  DocumentSharing,
  DocumentComment,
  DocumentApproval,
  DocumentApprovalStep,
  DocumentAccessLog,
  DocumentRetentionPolicy,
  DocumentTemplate,
  DocumentBulkOperation,
  DocumentAIProcessing,
  DocumentUploadRequest,
  DocumentSearchFilters,
  DocumentSearchResult,
  DocumentBulkActionRequest,
  DocumentSharingRequest,
  DocumentApprovalRequest,
  DocumentCommentRequest,
  DocumentVersionRequest,
  DocumentPermissionRequest,
  DocumentRetentionPolicyRequest,
  DocumentTemplateRequest,
  DocumentAIProcessingRequest,
  DocumentDashboardStats,
  DocumentAnalytics,
} from '../types/documentManagement';

class DocumentManagementService {
  // Document CRUD Operations
  async uploadDocument(request: DocumentUploadRequest): Promise<Document> {
    try {
      // Upload file to Supabase Storage
      const fileExt = request.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, request.file);

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Calculate file hash (simplified)
      const fileHash = await this.calculateFileHash(request.file);

      // Create document record
      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          title: request.title,
          description: request.description,
          file_name: request.file.name,
          file_size: request.file.size,
          file_type: fileExt || '',
          file_path: filePath,
          file_hash: fileHash,
          mime_type: request.file.type,
          category_id: request.category_id,
          priority: request.priority || 'medium',
          confidentiality_level: request.confidentiality_level || 'internal',
          compliance_frameworks: request.compliance_frameworks,
          regulatory_requirements: request.regulatory_requirements,
          audit_evidence: request.audit_evidence || false,
          retention_policy_id: request.retention_policy_id,
          owner_id: (await supabase.auth.getUser()).data.user?.id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select(`
          *,
          category:document_categories(*),
          owner:users!documents_owner_id_fkey(id, email, full_name),
          creator:users!documents_created_by_fkey(id, email, full_name)
        `)
        .single();

      if (error) throw error;

      // Add tags if provided
      if (request.tags && request.tags.length > 0) {
        await this.addTagsToDocument(document.id, request.tags);
      }

      // Queue AI processing
      await this.queueAIProcessing({
        document_id: document.id,
        processing_type: 'classification',
        priority: 5,
      });

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getDocument(id: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        category:document_categories(*),
        tags:document_tags_relation(
          tag:document_tags(*)
        ),
        versions:document_versions(*),
        permissions:document_permissions(
          *,
          user:users(id, email, full_name)
        ),
        comments:document_comments(
          *,
          author:users(id, email, full_name),
          replies:document_comments(
            *,
            author:users(id, email, full_name)
          )
        ),
        approval:document_approvals(
          *,
          steps:document_approval_steps(
            *,
            approver:users(id, email, full_name)
          )
        ),
        owner:users!documents_owner_id_fkey(id, email, full_name),
        creator:users!documents_created_by_fkey(id, email, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', id)
      .select(`
        *,
        category:document_categories(*),
        owner:users!documents_owner_id_fkey(id, email, full_name),
        creator:users!documents_created_by_fkey(id, email, full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;
  }

  // Document Search and Filtering
  async searchDocuments(filters: DocumentSearchFilters, page: number = 1, pageSize: number = 20): Promise<DocumentSearchResult> {
    let query = supabase
      .from('documents')
      .select(`
        *,
        category:document_categories(*),
        tags:document_tags_relation(
          tag:document_tags(*)
        ),
        owner:users!documents_owner_id_fkey(id, email, full_name),
        creator:users!documents_created_by_fkey(id, email, full_name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.textSearch('search_vector', filters.search);
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters.confidentiality_level && filters.confidentiality_level.length > 0) {
      query = query.in('confidentiality_level', filters.confidentiality_level);
    }

    if (filters.compliance_frameworks && filters.compliance_frameworks.length > 0) {
      query = query.overlaps('compliance_frameworks', filters.compliance_frameworks);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.file_types && filters.file_types.length > 0) {
      query = query.in('file_type', filters.file_types);
    }

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters.audit_evidence !== undefined) {
      query = query.eq('audit_evidence', filters.audit_evidence);
    }

    if (filters.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived);
    }

    if (filters.retention_date_from) {
      query = query.gte('retention_date', filters.retention_date_from);
    }

    if (filters.retention_date_to) {
      query = query.lte('retention_date', filters.retention_date_to);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      documents: data || [],
      total_count: count || 0,
      page,
      page_size: pageSize,
      total_pages: Math.ceil((count || 0) / pageSize),
    };
  }

  // Document Categories
  async getCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createCategory(category: Partial<DocumentCategory>): Promise<DocumentCategory> {
    const { data, error } = await supabase
      .from('document_categories')
      .insert({
        ...category,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: Partial<DocumentCategory>): Promise<DocumentCategory> {
    const { data, error } = await supabase
      .from('document_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Document Tags
  async getTags(): Promise<DocumentTag[]> {
    const { data, error } = await supabase
      .from('document_tags')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createTag(tag: Partial<DocumentTag>): Promise<DocumentTag> {
    const { data, error } = await supabase
      .from('document_tags')
      .insert({
        ...tag,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addTagsToDocument(documentId: string, tagIds: string[]): Promise<void> {
    const relations = tagIds.map(tagId => ({
      document_id: documentId,
      tag_id: tagId,
    }));

    const { error } = await supabase
      .from('document_tags_relation')
      .insert(relations);

    if (error) throw error;
  }

  async removeTagsFromDocument(documentId: string, tagIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('document_tags_relation')
      .delete()
      .eq('document_id', documentId)
      .in('tag_id', tagIds);

    if (error) throw error;
  }

  // Document Versions
  async createVersion(request: DocumentVersionRequest): Promise<DocumentVersion> {
    // Upload new version file
    const fileExt = request.file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/versions/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, request.file);

    if (uploadError) throw uploadError;

    // Get current version number
    const { data: currentDoc } = await supabase
      .from('documents')
      .select('version')
      .eq('id', request.document_id)
      .single();

    const currentVersion = currentDoc?.version || '1.0';
    const newVersion = this.incrementVersion(currentVersion);

    // Create version record
    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: request.document_id,
        version_number: newVersion,
        file_name: request.file.name,
        file_size: request.file.size,
        file_path: filePath,
        change_summary: request.change_summary,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Update document version
    await this.updateDocument(request.document_id, { version: newVersion });

    return data;
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Document Permissions
  async grantPermission(request: DocumentPermissionRequest): Promise<DocumentPermission> {
    const { data, error } = await supabase
      .from('document_permissions')
      .insert({
        document_id: request.document_id,
        user_id: request.user_id,
        permission_type: request.permission_type,
        granted_by: (await supabase.auth.getUser()).data.user?.id,
        expires_at: request.expires_at,
      })
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async revokePermission(documentId: string, userId: string, permissionType: string): Promise<void> {
    const { error } = await supabase
      .from('document_permissions')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .eq('permission_type', permissionType);

    if (error) throw error;
  }

  async getDocumentPermissions(documentId: string): Promise<DocumentPermission[]> {
    const { data, error } = await supabase
      .from('document_permissions')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .eq('document_id', documentId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  // Document Sharing
  async shareDocument(request: DocumentSharingRequest): Promise<DocumentSharing> {
    const shareToken = this.generateShareToken();

    const { data, error } = await supabase
      .from('document_sharing')
      .insert({
        document_id: request.document_id,
        shared_by: (await supabase.auth.getUser()).data.user?.id,
        shared_with_email: request.shared_with_email,
        shared_with_user_id: request.shared_with_user_id,
        share_type: request.share_type,
        access_level: request.access_level,
        share_token: shareToken,
        expires_at: request.expires_at,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSharedDocuments(): Promise<DocumentSharing[]> {
    const { data, error } = await supabase
      .from('document_sharing')
      .select(`
        *,
        document:documents(*)
      `)
      .eq('shared_by', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async revokeSharing(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('document_sharing')
      .update({ is_active: false })
      .eq('id', shareId);

    if (error) throw error;
  }

  // Document Comments
  async addComment(request: DocumentCommentRequest): Promise<DocumentComment> {
    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_id: request.document_id,
        parent_comment_id: request.parent_comment_id,
        content: request.content,
        author_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select(`
        *,
        author:users(id, email, full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    const { data, error } = await supabase
      .from('document_comments')
      .select(`
        *,
        author:users(id, email, full_name),
        replies:document_comments(
          *,
          author:users(id, email, full_name)
        )
      `)
      .eq('document_id', documentId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async resolveComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('document_comments')
      .update({
        is_resolved: true,
        resolved_by: (await supabase.auth.getUser()).data.user?.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) throw error;
  }

  // Document Approvals
  async requestApproval(request: DocumentApprovalRequest): Promise<DocumentApproval> {
    const { data, error } = await supabase
      .from('document_approvals')
      .insert({
        document_id: request.document_id,
        workflow_id: request.workflow_id,
        requested_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create approval steps if provided
    if (request.approvers && request.approvers.length > 0) {
      const steps = request.approvers.map(approver => ({
        approval_id: data.id,
        step_number: approver.step_number,
        approver_id: approver.user_id,
        approver_role: approver.role,
      }));

      await supabase
        .from('document_approval_steps')
        .insert(steps);
    }

    return data;
  }

  async approveDocument(approvalId: string, stepId: string, comments?: string): Promise<void> {
    const { error } = await supabase
      .from('document_approval_steps')
      .update({
        status: 'approved',
        comments,
        approved_at: new Date().toISOString(),
      })
      .eq('id', stepId);

    if (error) throw error;

    // Check if all steps are approved
    const { data: steps } = await supabase
      .from('document_approval_steps')
      .select('status')
      .eq('approval_id', approvalId);

    const allApproved = steps?.every(step => step.status === 'approved');

    if (allApproved) {
      await supabase
        .from('document_approvals')
        .update({
          status: 'approved',
          completed_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', approvalId);
    }
  }

  async rejectDocument(approvalId: string, stepId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('document_approval_steps')
      .update({
        status: 'rejected',
        comments: reason,
        approved_at: new Date().toISOString(),
      })
      .eq('id', stepId);

    if (error) throw error;

    await supabase
      .from('document_approvals')
      .update({
        status: 'rejected',
        completed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', approvalId);
  }

  // Document Access Logging
  async logAccess(documentId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('document_access_logs')
      .insert({
        document_id: documentId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action,
        metadata,
      });

    if (error) throw error;
  }

  async getAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
    const { data, error } = await supabase
      .from('document_access_logs')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .eq('document_id', documentId)
      .order('accessed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Document Retention Policies
  async getRetentionPolicies(): Promise<DocumentRetentionPolicy[]> {
    const { data, error } = await supabase
      .from('document_retention_policies')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createRetentionPolicy(request: DocumentRetentionPolicyRequest): Promise<DocumentRetentionPolicy> {
    const { data, error } = await supabase
      .from('document_retention_policies')
      .insert({
        ...request,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Document Templates
  async getTemplates(): Promise<DocumentTemplate[]> {
    const { data, error } = await supabase
      .from('document_templates')
      .select(`
        *,
        category:document_categories(*)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createTemplate(request: DocumentTemplateRequest): Promise<DocumentTemplate> {
    let filePath: string | undefined;

    if (request.file) {
      const fileExt = request.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      filePath = `templates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, request.file);

      if (uploadError) throw uploadError;
    }

    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        ...request,
        file_path: filePath,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select(`
        *,
        category:document_categories(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Document Bulk Operations
  async bulkAction(request: DocumentBulkActionRequest): Promise<DocumentBulkOperation> {
    const { data, error } = await supabase
      .from('document_bulk_operations')
      .insert({
        operation_type: request.action,
        total_files: request.document_ids.length,
        operation_config: request.parameters,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Process bulk action
    await this.processBulkAction(data.id, request);

    return data;
  }

  async processBulkAction(operationId: string, request: DocumentBulkActionRequest): Promise<void> {
    try {
      let processed = 0;
      let failed = 0;

      for (const documentId of request.document_ids) {
        try {
          switch (request.action) {
            case 'archive':
              await this.updateDocument(documentId, { is_archived: true });
              break;
            case 'delete':
              await this.deleteDocument(documentId);
              break;
            case 'change_category':
              await this.updateDocument(documentId, { category_id: request.parameters?.category_id });
              break;
            case 'add_tags':
              if (request.parameters?.tag_ids) {
                await this.addTagsToDocument(documentId, request.parameters.tag_ids);
              }
              break;
            case 'remove_tags':
              if (request.parameters?.tag_ids) {
                await this.removeTagsFromDocument(documentId, request.parameters.tag_ids);
              }
              break;
            case 'change_status':
              await this.updateDocument(documentId, { status: request.parameters?.status });
              break;
            case 'change_priority':
              await this.updateDocument(documentId, { priority: request.parameters?.priority });
              break;
            case 'apply_retention_policy':
              await this.updateDocument(documentId, { retention_policy_id: request.parameters?.retention_policy_id });
              break;
          }
          processed++;
        } catch (error) {
          failed++;
          console.error(`Error processing document ${documentId}:`, error);
        }
      }

      // Update operation status
      await supabase
        .from('document_bulk_operations')
        .update({
          status: 'completed',
          processed_files: processed,
          failed_files: failed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', operationId);
    } catch (error) {
      await supabase
        .from('document_bulk_operations')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', operationId);
      throw error;
    }
  }

  // Document AI Processing
  async queueAIProcessing(request: DocumentAIProcessingRequest): Promise<DocumentAIProcessing> {
    const { data, error } = await supabase
      .from('document_ai_processing')
      .insert({
        document_id: request.document_id,
        processing_type: request.processing_type,
        priority: request.priority || 5,
        processing_config: request.processing_config,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAIProcessingQueue(): Promise<DocumentAIProcessing[]> {
    const { data, error } = await supabase
      .from('document_ai_processing')
      .select('*')
      .in('status', ['queued', 'processing'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Dashboard and Analytics
  async getDashboardStats(): Promise<DocumentDashboardStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get total documents
    const { count: totalDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    // Get documents by status
    const { data: statusStats } = await supabase
      .from('documents')
      .select('status')
      .eq('is_deleted', false);

    const documentsByStatus = statusStats?.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get documents by category
    const { data: categoryStats } = await supabase
      .from('documents')
      .select('category_id')
      .eq('is_deleted', false);

    const documentsByCategory = categoryStats?.reduce((acc, doc) => {
      acc[doc.category_id || 'uncategorized'] = (acc[doc.category_id || 'uncategorized'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get documents by priority
    const { data: priorityStats } = await supabase
      .from('documents')
      .select('priority')
      .eq('is_deleted', false);

    const documentsByPriority = priorityStats?.reduce((acc, doc) => {
      acc[doc.priority] = (acc[doc.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentUploads } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get pending approvals
    const { count: pendingApprovals } = await supabase
      .from('document_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get expiring retention (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { count: expiringRetention } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .not('retention_date', 'is', null)
      .lte('retention_date', thirtyDaysFromNow.toISOString());

    // Get AI processing queue
    const { count: aiProcessingQueue } = await supabase
      .from('document_ai_processing')
      .select('*', { count: 'exact', head: true })
      .in('status', ['queued', 'processing']);

    // Get bulk operations
    const { count: bulkOperations } = await supabase
      .from('document_bulk_operations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processing']);

    return {
      total_documents: totalDocuments || 0,
      documents_by_status: documentsByStatus,
      documents_by_category: documentsByCategory,
      documents_by_priority: documentsByPriority,
      recent_uploads: recentUploads || 0,
      pending_approvals: pendingApprovals || 0,
      expiring_retention: expiringRetention || 0,
      storage_used: 0, // TODO: Calculate from storage
      storage_limit: 0, // TODO: Get from settings
      ai_processing_queue: aiProcessingQueue || 0,
      bulk_operations: bulkOperations || 0,
    };
  }

  async getAnalytics(): Promise<DocumentAnalytics> {
    // Get upload trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: uploadTrends } = await supabase
      .from('documents')
      .select('created_at, file_size')
      .eq('is_deleted', false)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    const trends = uploadTrends?.reduce((acc, doc) => {
      const date = new Date(doc.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, size: 0 };
      }
      acc[date].count++;
      acc[date].size += doc.file_size;
      return acc;
    }, {} as Record<string, { date: string; count: number; size: number }>);

    // Get access patterns
    const { data: accessPatterns } = await supabase
      .from('document_access_logs')
      .select(`
        document_id,
        accessed_at,
        document:documents(title)
      `)
      .gte('accessed_at', thirtyDaysAgo.toISOString())
      .order('accessed_at', { ascending: false });

    const accessCounts = accessPatterns?.reduce((acc, log) => {
      if (!acc[log.document_id]) {
        acc[log.document_id] = {
          document_id: log.document_id,
          title: (log.document as any)?.title || 'Unknown',
          access_count: 0,
          last_accessed: log.accessed_at,
        };
      }
      acc[log.document_id].access_count++;
      return acc;
    }, {} as Record<string, any>);

    // Get category distribution
    const { data: categoryDistribution } = await supabase
      .from('documents')
      .select(`
        category_id,
        category:document_categories(name)
      `)
      .eq('is_deleted', false);

    const categoryCounts = categoryDistribution?.reduce((acc, doc) => {
      const categoryName = (doc.category as any)?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = { category_id: doc.category_id, category_name: categoryName, count: 0, percentage: 0 };
      }
      acc[categoryName].count++;
      return acc;
    }, {} as Record<string, any>);

    const totalDocs = Object.values(categoryCounts || {}).reduce((sum: number, cat: any) => sum + cat.count, 0);
    Object.values(categoryCounts || {}).forEach((cat: any) => {
      cat.percentage = (cat.count / totalDocs) * 100;
    });

    // Get user activity
    const { data: userActivity } = await supabase
      .from('documents')
      .select(`
        created_by,
        owner:users!documents_created_by_fkey(email, full_name)
      `)
      .eq('is_deleted', false)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const userStats = userActivity?.reduce((acc, doc) => {
      const userId = doc.created_by;
      const userEmail = (doc.owner as any)?.email || 'Unknown';
      const userName = (doc.owner as any)?.full_name || 'Unknown';

      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          user_email: userEmail,
          user_name: userName,
          documents_uploaded: 0,
          documents_accessed: 0,
          last_activity: doc.created_at,
        };
      }
      acc[userId].documents_uploaded++;
      return acc;
    }, {} as Record<string, any>);

    // Get compliance coverage
    const { data: complianceData } = await supabase
      .from('documents')
      .select('compliance_frameworks')
      .eq('is_deleted', false)
      .not('compliance_frameworks', 'is', null);

    const frameworkCounts = complianceData?.reduce((acc, doc) => {
      doc.compliance_frameworks?.forEach((framework: string) => {
        if (!acc[framework]) {
          acc[framework] = { framework, document_count: 0, coverage_percentage: 0 };
        }
        acc[framework].document_count++;
      });
      return acc;
    }, {} as Record<string, any>);

    const totalComplianceDocs = Object.values(frameworkCounts || {}).reduce((sum: number, fw: any) => sum + fw.document_count, 0);
    Object.values(frameworkCounts || {}).forEach((fw: any) => {
      fw.coverage_percentage = (fw.document_count / totalComplianceDocs) * 100;
    });

    return {
      upload_trends: Object.values(trends || {}),
      access_patterns: Object.values(accessCounts || {}),
      category_distribution: Object.values(categoryCounts || {}),
      user_activity: Object.values(userStats || {}),
      compliance_coverage: Object.values(frameworkCounts || {}),
    };
  }

  // AI Processing Methods
  async getAIAnalysis(documentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('document_ai_processing')
        .select('*')
        .eq('document_id', documentId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        // Parse AI analysis results
        const analysis = {
          confidence: data.confidence_score || 0,
          extractedText: data.extracted_text || '',
          keywords: data.keywords || [],
          classification: data.classification || {
            category: 'Unknown',
            type: 'Unknown',
            risk_level: 'unknown',
            compliance_frameworks: []
          },
          entities: data.entities || [],
          summary: data.summary || ''
        };
        return analysis;
      }

      return null;
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      throw error;
    }
  }

  async triggerAIAnalysis(documentId: string): Promise<void> {
    try {
      // Create AI processing record
      const { error } = await supabase
        .from('document_ai_processing')
        .insert({
          document_id: documentId,
          processing_type: 'full_analysis',
          status: 'pending',
          priority: 5,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      // In a real implementation, this would trigger a background job
      // For now, we'll simulate the processing
      setTimeout(async () => {
        await this.simulateAIProcessing(documentId);
      }, 1000);
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      throw error;
    }
  }

  private async simulateAIProcessing(documentId: string): Promise<void> {
    try {
      // Simulate AI processing results
      const mockAnalysis = {
        confidence_score: 0.85,
        extracted_text: 'Sample extracted text from document...',
        keywords: ['compliance', 'risk', 'audit', 'policy', 'security'],
        classification: {
          category: 'Compliance',
          type: 'Policy Document',
          risk_level: 'medium',
          compliance_frameworks: ['SOX', 'GDPR']
        },
        entities: [
          { type: 'PERSON', value: 'John Doe', confidence: 0.9 },
          { type: 'ORGANIZATION', value: 'Company Inc', confidence: 0.8 }
        ],
        summary: 'This document contains compliance policies and procedures related to data protection and financial controls.'
      };

      // Update the processing record
      const { error } = await supabase
        .from('document_ai_processing')
        .update({
          status: 'completed',
          confidence_score: mockAnalysis.confidence_score,
          extracted_text: mockAnalysis.extracted_text,
          keywords: mockAnalysis.keywords,
          classification: mockAnalysis.classification,
          entities: mockAnalysis.entities,
          summary: mockAnalysis.summary,
          completed_at: new Date().toISOString(),
        })
        .eq('document_id', documentId)
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      console.error('Error in AI processing simulation:', error);
    }
  }

  async getDocumentUrl(documentId: string): Promise<{ url: string }> {
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(document.file_path);

      return { url: urlData.publicUrl };
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  }

  // Utility methods
  private async calculateFileHash(file: File): Promise<string> {
    // Simplified hash calculation - in production, use a proper hashing library
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0]) || 1;
    const minor = parseInt(parts[1]) || 0;
    return `${major}.${minor + 1}`;
  }
}

export const documentManagementService = new DocumentManagementService();
