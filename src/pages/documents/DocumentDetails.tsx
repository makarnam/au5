import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Share2,
  Edit,
  History,
  MessageSquare,
  Users,
  Eye,
  Lock,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Reply,
  Flag,
  Star,
  Bookmark,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { documentManagementService } from "../../services/documentManagementService";
import {
  Document,
  DocumentVersion,
  DocumentComment,
  DocumentPermission,
  DocumentSharing,
  DocumentAccessLog,
  DocumentApproval,
  DocumentApprovalStep,
} from "../../types/documentManagement";
import { formatBytes, formatDate, formatDateTime, getRelativeTime } from "../../utils/displayUtils";

interface DocumentDetailsProps {
  documentId: string;
  onClose?: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ documentId, onClose }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  const [accessLogs, setAccessLogs] = useState<DocumentAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);

  useEffect(() => {
    loadDocumentData();
  }, [documentId]);

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      const [
        documentData,
        versionsData,
        commentsData,
        permissionsData,
        accessLogsData,
      ] = await Promise.all([
        documentManagementService.getDocument(documentId),
        documentManagementService.getDocumentVersions(documentId),
        documentManagementService.getDocumentComments(documentId),
        documentManagementService.getDocumentPermissions(documentId),
        documentManagementService.getAccessLogs(documentId),
      ]);

      setDocument(documentData);
      setVersions(versionsData);
      setComments(commentsData);
      setPermissions(permissionsData);
      setAccessLogs(accessLogsData);
    } catch (error) {
      console.error('Error loading document data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await documentManagementService.addComment({
        document_id: documentId,
        content: newComment,
        parent_comment_id: replyTo || undefined,
      });

      setComments(prev => [comment, ...prev]);
      setNewComment("");
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await documentManagementService.resolveComment(commentId);
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, is_resolved: true }
            : comment
        )
      );
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidentialityColor = (level: string) => {
    switch (level) {
      case 'restricted': return 'bg-red-100 text-red-800';
      case 'confidential': return 'bg-orange-100 text-orange-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'public': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'xls':
      case 'xlsx': return <FileText className="h-4 w-4 text-green-500" />;
      case 'ppt':
      case 'pptx': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Document not found</h3>
        <p className="text-muted-foreground">The document you're looking for doesn't exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {getFileIcon(document.file_name)}
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <p className="text-muted-foreground">{document.file_name}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getStatusColor(document.status)} variant="secondary">
                {document.status}
              </Badge>
              <Badge className={getPriorityColor(document.priority)} variant="secondary">
                {document.priority}
              </Badge>
              <Badge className={getConfidentialityColor(document.confidentiality_level)} variant="secondary">
                {document.confidentiality_level}
              </Badge>
              {document.audit_evidence && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Audit Evidence
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Information */}
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">File Size:</span>
                    <p>{formatBytes(document.file_size)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">File Type:</span>
                    <p className="uppercase">{document.file_type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Version:</span>
                    <p>{document.version}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Created:</span>
                    <p>{formatDate(document.created_at)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Last Modified:</span>
                    <p>{formatDate(document.updated_at)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Owner:</span>
                    <p>{document.owner?.full_name || document.owner?.email}</p>
                  </div>
                </div>

                {document.description && (
                  <div>
                    <span className="font-medium text-muted-foreground">Description:</span>
                    <p className="mt-1">{document.description}</p>
                  </div>
                )}

                {document.category && (
                  <div>
                    <span className="font-medium text-muted-foreground">Category:</span>
                    <Badge variant="outline" className="mt-1">
                      {document.category.name}
                    </Badge>
                  </div>
                )}

                {document.tags && document.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance & Retention */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.compliance_frameworks && document.compliance_frameworks.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">Compliance Frameworks:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.compliance_frameworks.map((framework) => (
                        <Badge key={framework} variant="secondary">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {document.regulatory_requirements && document.regulatory_requirements.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">Regulatory Requirements:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.regulatory_requirements.map((requirement) => (
                        <Badge key={requirement} variant="outline">
                          {requirement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {document.retention_date && (
                  <div>
                    <span className="font-medium text-muted-foreground">Retention Date:</span>
                    <p className="mt-1">{formatDate(document.retention_date)}</p>
                  </div>
                )}

                {document.archive_date && (
                  <div>
                    <span className="font-medium text-muted-foreground">Archive Date:</span>
                    <p className="mt-1">{formatDate(document.archive_date)}</p>
                  </div>
                )}

                {document.ai_keywords && document.ai_keywords.length > 0 && (
                  <div>
                    <span className="font-medium text-muted-foreground">AI Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {document.ai_keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Version History</h3>
            <Button onClick={() => setShowVersionDialog(true)}>
              <History className="h-4 w-4 mr-2" />
              Upload New Version
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Change Summary</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <Badge variant={version.version_number === document.version ? "default" : "secondary"}>
                          {version.version_number}
                        </Badge>
                      </TableCell>
                      <TableCell>{version.file_name}</TableCell>
                      <TableCell>{formatBytes(version.file_size)}</TableCell>
                      <TableCell>{version.change_summary || '-'}</TableCell>
                      <TableCell>User Name</TableCell>
                      <TableCell>{formatDate(version.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
          </div>

          {/* Add Comment */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  {replyTo && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Replying to comment</span>
                      <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className={comment.is_resolved ? 'opacity-75' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {comment.author?.full_name?.charAt(0) || comment.author?.email?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {comment.author?.full_name || comment.author?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(comment.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {comment.is_resolved && (
                        <Badge variant="secondary" className="text-xs">
                          Resolved
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment.id)}>
                        <Reply className="h-3 w-3" />
                      </Button>
                      {!comment.is_resolved && (
                        <Button variant="ghost" size="sm" onClick={() => handleResolveComment(comment.id)}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {reply.author?.full_name?.charAt(0) || reply.author?.email?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm">
                                {reply.author?.full_name || reply.author?.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getRelativeTime(reply.created_at)}
                              </p>
                            </div>
                            <p className="text-sm mt-1">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Access Permissions</h3>
            <Button onClick={() => setShowPermissionsDialog(true)}>
              <Users className="h-4 w-4 mr-2" />
              Grant Permission
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Granted By</TableHead>
                    <TableHead>Granted At</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{permission.user?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{permission.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.permission_type}</Badge>
                      </TableCell>
                      <TableCell>Admin User</TableCell>
                      <TableCell>{formatDate(permission.granted_at)}</TableCell>
                      <TableCell>
                        {permission.expires_at ? formatDate(permission.expires_at) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <h3 className="text-lg font-medium">Access Activity</h3>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Accessed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.user?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{log.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.ip_address || '-'}</TableCell>
                      <TableCell>{formatDateTime(log.accessed_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Tab */}
        <TabsContent value="approval" className="space-y-4">
          {document.approval ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Approval Workflow</h3>
                <Badge className={getStatusColor(document.approval.status)} variant="secondary">
                  {document.approval.status}
                </Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Approval Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {document.approval.steps?.map((step) => (
                      <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium">{step.step_number}</span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {step.approver?.full_name || step.approver_role || 'Unassigned'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {step.approver?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(step.status)} variant="secondary">
                            {step.status}
                          </Badge>
                          {step.comments && (
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No approval workflow</h3>
              <p className="text-muted-foreground">This document doesn't have an active approval workflow.</p>
              <Button className="mt-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Request Approval
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentDetails;
