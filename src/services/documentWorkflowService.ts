import { supabase } from "../lib/supabase";

export type UUID = string;

export interface DocumentWorkflowIntegration {
  id: UUID;
  document_id: UUID;
  workflow_id: UUID;
  approval_request_id?: UUID;
  integration_type: 'approval_workflow' | 'version_control' | 'workflow_trigger' | 'workflow_history';
  trigger_condition?: string;
  auto_start: boolean;
  version_control_enabled: boolean;
  approval_required: boolean;
  created_by?: UUID;
  created_at: string;
  updated_at: string;
}

export interface DocumentWorkflowHistory {
  id: UUID;
  document_id: UUID;
  workflow_id: UUID;
  approval_request_id?: UUID;
  action_type: 'workflow_started' | 'workflow_completed' | 'approval_granted' | 'approval_denied' | 'document_updated' | 'version_created';
  action_details?: any;
  performed_by?: UUID;
  performed_at: string;
  document_version_id?: UUID;
}

export interface CreateDocumentWorkflowPayload {
  document_id: UUID;
  workflow_id: UUID;
  integration_type: DocumentWorkflowIntegration['integration_type'];
  trigger_condition?: string;
  auto_start?: boolean;
  version_control_enabled?: boolean;
  approval_required?: boolean;
}

export interface UpdateDocumentWorkflowPayload {
  trigger_condition?: string;
  auto_start?: boolean;
  version_control_enabled?: boolean;
  approval_required?: boolean;
}

type Result<T> = { data: T | null; error: any | null };

export const documentWorkflowService = {
  // Create document workflow integration
  async createIntegration(payload: CreateDocumentWorkflowPayload): Promise<Result<{ integration_id: UUID }>> {
    try {
      const { data, error } = await supabase
        .from('document_workflow_integrations')
        .insert({
          document_id: payload.document_id,
          workflow_id: payload.workflow_id,
          integration_type: payload.integration_type,
          trigger_condition: payload.trigger_condition,
          auto_start: payload.auto_start || false,
          version_control_enabled: payload.version_control_enabled !== false,
          approval_required: payload.approval_required !== false,
        })
        .select('id')
        .single();

      if (error) return { data: null, error };
      return { data: { integration_id: data.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get document workflow integrations
  async getIntegrations(documentId?: UUID, workflowId?: UUID): Promise<Result<DocumentWorkflowIntegration[]>> {
    try {
      let query = supabase
        .from('document_workflow_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (documentId) {
        query = query.eq('document_id', documentId);
      }
      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;
      if (error) return { data: null, error };
      return { data: data as DocumentWorkflowIntegration[], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update document workflow integration
  async updateIntegration(integrationId: UUID, payload: UpdateDocumentWorkflowPayload): Promise<Result<null>> {
    try {
      const { error } = await supabase
        .from('document_workflow_integrations')
        .update(payload)
        .eq('id', integrationId);

      if (error) return { data: null, error };
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete document workflow integration
  async deleteIntegration(integrationId: UUID): Promise<Result<null>> {
    try {
      const { error } = await supabase
        .from('document_workflow_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) return { data: null, error };
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Add workflow history entry
  async addHistoryEntry(payload: {
    document_id: UUID;
    workflow_id: UUID;
    approval_request_id?: UUID;
    action_type: DocumentWorkflowHistory['action_type'];
    action_details?: any;
    document_version_id?: UUID;
  }): Promise<Result<{ history_id: UUID }>> {
    try {
      const { data, error } = await supabase
        .from('document_workflow_history')
        .insert({
          document_id: payload.document_id,
          workflow_id: payload.workflow_id,
          approval_request_id: payload.approval_request_id,
          action_type: payload.action_type,
          action_details: payload.action_details,
          document_version_id: payload.document_version_id,
        })
        .select('id')
        .single();

      if (error) return { data: null, error };
      return { data: { history_id: data.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get document workflow history
  async getHistory(documentId?: UUID, workflowId?: UUID): Promise<Result<DocumentWorkflowHistory[]>> {
    try {
      let query = supabase
        .from('document_workflow_history')
        .select('*')
        .order('performed_at', { ascending: false });

      if (documentId) {
        query = query.eq('document_id', documentId);
      }
      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;
      if (error) return { data: null, error };
      return { data: data as DocumentWorkflowHistory[], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Start document approval workflow
  async startDocumentApprovalWorkflow(documentId: UUID, workflowId: UUID): Promise<Result<{ approval_request_id: UUID }>> {
    try {
      // Import the workflow service
      const { startWorkflow } = await import('./workflows');
      
      // Start the workflow
      const result = await startWorkflow({
        entity_type: 'document',
        entity_id: documentId,
        workflow_id: workflowId,
      });

      if (result.error) return { data: null, error: result.error };

      // Add history entry
      await this.addHistoryEntry({
        document_id: documentId,
        workflow_id: workflowId,
        approval_request_id: result.data?.request_id,
        action_type: 'workflow_started',
        action_details: { workflow_id: workflowId },
      });

      return { data: { approval_request_id: result.data?.request_id || '' }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create document version and trigger workflow
  async createDocumentVersion(documentId: UUID, versionData: {
    version_number: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    checksum: string;
    created_by: UUID;
  }): Promise<Result<{ version_id: UUID }>> {
    try {
      // Create document version
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: versionData.version_number,
          file_path: versionData.file_path,
          file_size: versionData.file_size,
          mime_type: versionData.mime_type,
          checksum: versionData.checksum,
          created_by: versionData.created_by,
        })
        .select('id')
        .single();

      if (versionError) return { data: null, error: versionError };

      // Check if there are any workflow triggers for document updates
      const { data: integrations } = await this.getIntegrations(documentId);
      const updateTriggers = integrations?.filter(i => 
        i.integration_type === 'workflow_trigger' && 
        i.trigger_condition === 'document_updated' &&
        i.auto_start
      );

      // Start workflows for each trigger
      for (const trigger of updateTriggers || []) {
        await this.startDocumentApprovalWorkflow(documentId, trigger.workflow_id);
      }

      // Add history entry
      await this.addHistoryEntry({
        document_id: documentId,
        workflow_id: '', // No specific workflow for version creation
        action_type: 'version_created',
        action_details: { version_id: version.id, version_number: versionData.version_number },
        document_version_id: version.id,
      });

      return { data: { version_id: version.id }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get documents requiring approval
  async getDocumentsRequiringApproval(): Promise<Result<Array<{
    document_id: UUID;
    document_name: string;
    workflow_id: UUID;
    workflow_name: string;
    approval_request_id: UUID;
    status: string;
    created_at: string;
  }>>> {
    try {
      const { data, error } = await supabase
        .from('document_workflow_integrations')
        .select(`
          document_id,
          workflow_id,
          approval_request_id,
          documents(name),
          workflows(name),
          approval_requests(status, created_at)
        `)
        .eq('approval_required', true)
        .not('approval_request_id', 'is', null);

      if (error) return { data: null, error };

      const result = data?.map(item => ({
        document_id: item.document_id,
        document_name: (item.documents as any)?.name || '',
        workflow_id: item.workflow_id,
        workflow_name: (item.workflows as any)?.name || '',
        approval_request_id: item.approval_request_id,
        status: (item.approval_requests as any)?.status || '',
        created_at: (item.approval_requests as any)?.created_at || '',
      })) || [];

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get document approval status
  async getDocumentApprovalStatus(documentId: UUID): Promise<Result<{
    has_approval_workflow: boolean;
    approval_status: string;
    current_step: string;
    approval_request_id?: UUID;
    workflow_name?: string;
  }>> {
    try {
      const { data: integrations } = await this.getIntegrations(documentId);
      const approvalIntegration = integrations?.find(i => i.integration_type === 'approval_workflow');

      if (!approvalIntegration) {
        return {
          data: {
            has_approval_workflow: false,
            approval_status: 'no_workflow',
            current_step: '',
          },
          error: null
        };
      }

      // Get approval request details
      const { data: request } = await supabase
        .from('approval_requests')
        .select('status, workflow_id, workflows(name)')
        .eq('id', approvalIntegration.approval_request_id)
        .single();

      return {
        data: {
          has_approval_workflow: true,
          approval_status: request?.status || 'unknown',
          current_step: '', // Would need to get from approval_request_steps
          approval_request_id: approvalIntegration.approval_request_id,
          workflow_name: (request?.workflows as any)?.name,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get document workflow statistics
  async getDocumentWorkflowStats(): Promise<Result<{
    total_documents_with_workflows: number;
    documents_pending_approval: number;
    documents_approved: number;
    documents_rejected: number;
    active_workflows: number;
  }>> {
    try {
      // Get total documents with workflows
      const { count: total } = await supabase
        .from('document_workflow_integrations')
        .select('*', { count: 'exact', head: true });

      // Get documents pending approval
      const { count: pending } = await supabase
        .from('document_workflow_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('approval_required', true)
        .not('approval_request_id', 'is', null);

      // Get documents approved/rejected from history
      const { data: history } = await this.getHistory();
      const approved = history?.filter(h => h.action_type === 'approval_granted').length || 0;
      const rejected = history?.filter(h => h.action_type === 'approval_denied').length || 0;

      // Get active workflows
      const { count: active } = await supabase
        .from('approval_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      return {
        data: {
          total_documents_with_workflows: total || 0,
          documents_pending_approval: pending || 0,
          documents_approved: approved,
          documents_rejected: rejected,
          active_workflows: active || 0,
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Bulk create document workflow integrations
  async bulkCreateIntegrations(integrations: CreateDocumentWorkflowPayload[]): Promise<Result<{ created_count: number; errors: any[] }>> {
    try {
      const results = await Promise.allSettled(
        integrations.map(integration => this.createIntegration(integration))
      );

      const created = results.filter(r => r.status === 'fulfilled' && r.value?.data).length;
      const errors = results
        .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.error))
        .map(r => r.status === 'rejected' ? r.reason : (r as any).value?.error);

      return {
        data: { created_count: created, errors },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },
};

export default documentWorkflowService;
