export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  parent_category?: DocumentCategory;
  sub_categories?: DocumentCategory[];
}

export interface DocumentTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: string;
  file_name: string;
  file_size: number;
  file_path: string;
  file_hash?: string;
  change_summary?: string;
  created_by: string;
  created_at: string;
}

export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id: string;
  permission_type: 'read' | 'write' | 'admin' | 'delete';
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface DocumentSharing {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with_email?: string;
  shared_with_user_id?: string;
  share_type: 'link' | 'email' | 'user';
  access_level: 'read' | 'write' | 'comment';
  share_link?: string;
  share_token: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  parent_comment_id?: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  author?: {
    id: string;
    email: string;
    full_name?: string;
  };
  replies?: DocumentComment[];
}

export interface DocumentApproval {
  id: string;
  document_id: string;
  workflow_id?: string;
  current_step: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_by: string;
  requested_at: string;
  completed_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  steps?: DocumentApprovalStep[];
}

export interface DocumentApprovalStep {
  id: string;
  approval_id: string;
  step_number: number;
  approver_id?: string;
  approver_role?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  approved_at?: string;
  created_at: string;
  approver?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  user_id?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
  session_id?: string;
  metadata?: Record<string, any>;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface DocumentRetentionPolicy {
  id: string;
  name: string;
  description?: string;
  retention_period_months: number;
  archive_period_months?: number;
  disposal_method: 'delete' | 'archive' | 'transfer';
  compliance_frameworks?: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: string;
  category_id?: string;
  file_path?: string;
  template_content?: Record<string, any>;
  compliance_frameworks?: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  category?: DocumentCategory;
}

export interface DocumentBulkOperation {
  id: string;
  operation_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_files: number;
  processed_files: number;
  failed_files: number;
  operation_config?: Record<string, any>;
  results?: Record<string, any>;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface DocumentAIProcessing {
  id: string;
  document_id: string;
  processing_type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  processing_config?: Record<string, any>;
  results?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  file_hash?: string;
  mime_type?: string;
  
  // Document metadata
  category_id?: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived' | 'deleted';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidentiality_level: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Retention and lifecycle
  retention_policy_id?: string;
  retention_date?: string;
  archive_date?: string;
  is_archived: boolean;
  is_deleted: boolean;
  
  // AI classification
  ai_classification?: Record<string, any>;
  ai_confidence_score?: number;
  ai_extracted_text?: string;
  ai_keywords?: string[];
  
  // Audit and compliance
  compliance_frameworks?: string[];
  regulatory_requirements?: string[];
  audit_evidence: boolean;
  
  // Access control
  owner_id: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  category?: DocumentCategory;
  tags?: DocumentTag[];
  versions?: DocumentVersion[];
  permissions?: DocumentPermission[];
  comments?: DocumentComment[];
  approval?: DocumentApproval;
  owner?: {
    id: string;
    email: string;
    full_name?: string;
  };
  creator?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface DocumentUploadRequest {
  file: File;
  title: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  confidentiality_level?: 'public' | 'internal' | 'confidential' | 'restricted';
  compliance_frameworks?: string[];
  regulatory_requirements?: string[];
  audit_evidence?: boolean;
  retention_policy_id?: string;
}

export interface DocumentSearchFilters {
  search?: string;
  category_id?: string;
  tags?: string[];
  status?: string[];
  priority?: string[];
  confidentiality_level?: string[];
  compliance_frameworks?: string[];
  date_from?: string;
  date_to?: string;
  file_types?: string[];
  owner_id?: string;
  created_by?: string;
  audit_evidence?: boolean;
  is_archived?: boolean;
  retention_date_from?: string;
  retention_date_to?: string;
}

export interface DocumentSearchResult {
  documents: Document[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DocumentBulkActionRequest {
  document_ids: string[];
  action: 'archive' | 'delete' | 'change_category' | 'add_tags' | 'remove_tags' | 'change_status' | 'change_priority' | 'apply_retention_policy';
  parameters?: Record<string, any>;
}

export interface DocumentSharingRequest {
  document_id: string;
  share_type: 'link' | 'email' | 'user';
  shared_with_email?: string;
  shared_with_user_id?: string;
  access_level: 'read' | 'write' | 'comment';
  expires_at?: string;
}

export interface DocumentApprovalRequest {
  document_id: string;
  workflow_id?: string;
  approvers?: Array<{
    user_id?: string;
    role?: string;
    step_number: number;
  }>;
  comments?: string;
}

export interface DocumentCommentRequest {
  document_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface DocumentVersionRequest {
  document_id: string;
  file: File;
  change_summary?: string;
}

export interface DocumentPermissionRequest {
  document_id: string;
  user_id: string;
  permission_type: 'read' | 'write' | 'admin' | 'delete';
  expires_at?: string;
}

export interface DocumentRetentionPolicyRequest {
  name: string;
  description?: string;
  retention_period_months: number;
  archive_period_months?: number;
  disposal_method: 'delete' | 'archive' | 'transfer';
  compliance_frameworks?: string[];
}

export interface DocumentTemplateRequest {
  name: string;
  description?: string;
  template_type: string;
  category_id?: string;
  file?: File;
  template_content?: Record<string, any>;
  compliance_frameworks?: string[];
}

export interface DocumentAIProcessingRequest {
  document_id: string;
  processing_type: 'classification' | 'extraction' | 'summarization' | 'translation' | 'ocr';
  processing_config?: Record<string, any>;
  priority?: number;
}

export interface DocumentDashboardStats {
  total_documents: number;
  documents_by_status: Record<string, number>;
  documents_by_category: Record<string, number>;
  documents_by_priority: Record<string, number>;
  recent_uploads: number;
  pending_approvals: number;
  expiring_retention: number;
  storage_used: number;
  storage_limit: number;
  ai_processing_queue: number;
  bulk_operations: number;
}

export interface DocumentAnalytics {
  upload_trends: Array<{
    date: string;
    count: number;
    size: number;
  }>;
  access_patterns: Array<{
    document_id: string;
    title: string;
    access_count: number;
    last_accessed: string;
  }>;
  category_distribution: Array<{
    category_id: string;
    category_name: string;
    count: number;
    percentage: number;
  }>;
  user_activity: Array<{
    user_id: string;
    user_email: string;
    user_name: string;
    documents_uploaded: number;
    documents_accessed: number;
    last_activity: string;
  }>;
  compliance_coverage: Array<{
    framework: string;
    document_count: number;
    coverage_percentage: number;
  }>;
}
