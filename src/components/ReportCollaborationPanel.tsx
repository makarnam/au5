import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Share,
  UserCheck,
  Send,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Crown,
  AtSign,
  Paperclip,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

import {
  reportCollaborationService,
  ReportComment,
  ReportSharing,
  ApprovalRequest,
  ReportStakeholder
} from "../services/reportCollaborationService";
import { useAuthStore } from "../store/authStore";

interface ReportCollaborationPanelProps {
  reportId: string;
  reportTitle: string;
  onUpdate: () => void;
}

export const ReportCollaborationPanel: React.FC<ReportCollaborationPanelProps> = ({
  reportId,
  reportTitle,
  onUpdate,
}) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'comments' | 'sharing' | 'approvals' | 'stakeholders'>('comments');

  // Comments state
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Sharing state
  const [sharedReports, setSharedReports] = useState<ReportSharing[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'comment' | 'admin'>('view');
  const [shareExpiry, setShareExpiry] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Approval state
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [newApprovalTitle, setNewApprovalTitle] = useState('');
  const [newApprovalDescription, setNewApprovalDescription] = useState('');
  const [newApprovalPriority, setNewApprovalPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newApprovalAssignee, setNewApprovalAssignee] = useState('');
  const [newApprovalDueDate, setNewApprovalDueDate] = useState('');
  const [isCreatingApproval, setIsCreatingApproval] = useState(false);

  // Stakeholder state
  const [stakeholders, setStakeholders] = useState<ReportStakeholder[]>([]);
  const [newStakeholderEmail, setNewStakeholderEmail] = useState('');
  const [newStakeholderRole, setNewStakeholderRole] = useState<'owner' | 'editor' | 'reviewer' | 'viewer' | 'approver'>('viewer');
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (reportId) {
      loadComments();
      loadSharedReports();
      loadApprovalRequests();
      loadStakeholders();
    }
  }, [reportId]);

  const loadComments = async () => {
    const data = await reportCollaborationService.getComments(reportId);
    setComments(data);
  };

  const loadSharedReports = async () => {
    const data = await reportCollaborationService.getSharedReports();
    setSharedReports(data.filter(share => share.report_id === reportId));
  };

  const loadApprovalRequests = async () => {
    const data = await reportCollaborationService.getApprovalRequests();
    setApprovalRequests(data.filter(req => req.entity_id === reportId && req.entity_type === 'report'));
  };

  const loadStakeholders = async () => {
    const data = await reportCollaborationService.getStakeholders(reportId);
    setStakeholders(data);
  };

  // Comments handlers
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      const mentions = extractMentions(newComment);
      await reportCollaborationService.addComment(
        reportId,
        newComment,
        selectedSectionId || undefined,
        undefined,
        mentions
      );
      setNewComment('');
      setSelectedSectionId('');
      await loadComments();
      onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleResolveComment = async (commentId: string, resolved: boolean) => {
    await reportCollaborationService.resolveComment(commentId, resolved);
    await loadComments();
  };

  // Sharing handlers
  const handleShareReport = async () => {
    if (!shareEmail.trim()) return;

    setIsSharing(true);
    try {
      await reportCollaborationService.shareReport(
        reportId,
        shareEmail,
        sharePermission,
        shareExpiry || undefined
      );
      setShareEmail('');
      setSharePermission('view');
      setShareExpiry('');
      await loadSharedReports();
    } catch (error) {
      console.error('Error sharing report:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    await reportCollaborationService.revokeShare(shareId);
    await loadSharedReports();
  };

  // Approval handlers
  const handleCreateApproval = async () => {
    if (!newApprovalTitle.trim() || !newApprovalAssignee) return;

    setIsCreatingApproval(true);
    try {
      await reportCollaborationService.createApprovalRequest(
        'report',
        reportId,
        newApprovalTitle,
        newApprovalDescription || undefined,
        newApprovalAssignee,
        newApprovalDueDate || undefined,
        newApprovalPriority
      );
      setNewApprovalTitle('');
      setNewApprovalDescription('');
      setNewApprovalAssignee('');
      setNewApprovalDueDate('');
      setNewApprovalPriority('medium');
      await loadApprovalRequests();
    } catch (error) {
      console.error('Error creating approval request:', error);
    } finally {
      setIsCreatingApproval(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    await reportCollaborationService.approveRequest(requestId);
    await loadApprovalRequests();
  };

  const handleRejectRequest = async (requestId: string) => {
    await reportCollaborationService.rejectRequest(requestId);
    await loadApprovalRequests();
  };

  // Stakeholder handlers
  const handleAddStakeholder = async () => {
    if (!newStakeholderEmail.trim()) return;

    setIsAddingStakeholder(true);
    try {
      // Find user by email (this would need a user lookup service)
      const permissions = getRolePermissions(newStakeholderRole);
      await reportCollaborationService.addStakeholder(
        reportId,
        newStakeholderEmail, // This should be user ID, not email
        newStakeholderRole,
        permissions
      );
      setNewStakeholderEmail('');
      setNewStakeholderRole('viewer');
      await loadStakeholders();
    } catch (error) {
      console.error('Error adding stakeholder:', error);
    } finally {
      setIsAddingStakeholder(false);
    }
  };

  const handleUpdateStakeholderPermissions = async (stakeholderId: string, role: string, permissions: string[]) => {
    await reportCollaborationService.updateStakeholderPermissions(
      stakeholderId,
      role as any,
      permissions
    );
    await loadStakeholders();
  };

  const handleRemoveStakeholder = async (stakeholderId: string) => {
    await reportCollaborationService.removeStakeholder(stakeholderId);
    await loadStakeholders();
  };

  // Utility functions
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'owner': return ['read', 'write', 'delete', 'share', 'approve'];
      case 'editor': return ['read', 'write', 'comment'];
      case 'reviewer': return ['read', 'comment', 'approve'];
      case 'viewer': return ['read'];
      case 'approver': return ['read', 'approve'];
      default: return ['read'];
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />;
      case 'editor': return <Edit className="w-4 h-4" />;
      case 'reviewer': return <Eye className="w-4 h-4" />;
      case 'approver': return <UserCheck className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comments" className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center">
              <Share className="w-4 h-4 mr-1" />
              Sharing ({sharedReports.length})
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center">
              <UserCheck className="w-4 h-4 mr-1" />
              Approvals ({approvalRequests.length})
            </TabsTrigger>
            <TabsTrigger value="stakeholders" className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Stakeholders ({stakeholders.length})
            </TabsTrigger>
          </TabsList>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="newComment">Add Comment</Label>
                <Textarea
                  id="newComment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment... Use @username to mention someone"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    size="sm"
                  >
                    {isSubmittingComment ? (
                      <Clock className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1" />
                    )}
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {comment.author_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {comment.author_name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleResolveComment(comment.id, !comment.is_resolved)}
                          >
                            {comment.is_resolved ? 'Unresolve' : 'Resolve'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
                    {comment.is_resolved && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shareEmail">Email Address</Label>
                <Input
                  id="shareEmail"
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="sharePermission">Permission Level</Label>
                <Select value={sharePermission} onValueChange={(value: any) => setSharePermission(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="comment">Can Comment</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                    <SelectItem value="admin">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shareExpiry">Expiry Date (Optional)</Label>
                <Input
                  id="shareExpiry"
                  type="date"
                  value={shareExpiry}
                  onChange={(e) => setShareExpiry(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleShareReport}
                  disabled={!shareEmail.trim() || isSharing}
                  className="w-full"
                >
                  {isSharing ? (
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Share className="w-4 h-4 mr-1" />
                  )}
                  {isSharing ? 'Sharing...' : 'Share Report'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shared With</Label>
              {sharedReports.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{share.shared_with_email || share.shared_with}</div>
                    <div className="text-sm text-gray-500 capitalize">{share.permission_level} access</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeShare(share.id)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="approvalTitle">Title</Label>
                <Input
                  id="approvalTitle"
                  value={newApprovalTitle}
                  onChange={(e) => setNewApprovalTitle(e.target.value)}
                  placeholder="Approval request title"
                />
              </div>
              <div>
                <Label htmlFor="approvalAssignee">Assign To</Label>
                <Input
                  id="approvalAssignee"
                  value={newApprovalAssignee}
                  onChange={(e) => setNewApprovalAssignee(e.target.value)}
                  placeholder="Assignee email or ID"
                />
              </div>
              <div>
                <Label htmlFor="approvalPriority">Priority</Label>
                <Select value={newApprovalPriority} onValueChange={(value: any) => setNewApprovalPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approvalDueDate">Due Date (Optional)</Label>
                <Input
                  id="approvalDueDate"
                  type="date"
                  value={newApprovalDueDate}
                  onChange={(e) => setNewApprovalDueDate(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="approvalDescription">Description (Optional)</Label>
                <Textarea
                  id="approvalDescription"
                  value={newApprovalDescription}
                  onChange={(e) => setNewApprovalDescription(e.target.value)}
                  placeholder="Describe what needs approval"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  onClick={handleCreateApproval}
                  disabled={!newApprovalTitle.trim() || !newApprovalAssignee || isCreatingApproval}
                  className="w-full"
                >
                  {isCreatingApproval ? (
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4 mr-1" />
                  )}
                  {isCreatingApproval ? 'Creating...' : 'Create Approval Request'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Approval Requests</Label>
              {approvalRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{request.title}</h4>
                        <Badge className={`${getPriorityColor(request.priority)} text-white`}>
                          {request.priority}
                        </Badge>
                        <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                      {request.description && (
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        Requested by {request.requested_by_user?.first_name} {request.requested_by_user?.last_name} •
                        Assigned to {request.assigned_to_user?.first_name} {request.assigned_to_user?.last_name}
                        {request.due_date && ` • Due ${formatDate(request.due_date)}`}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Stakeholders Tab */}
          <TabsContent value="stakeholders" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stakeholderEmail">Email Address</Label>
                <Input
                  id="stakeholderEmail"
                  type="email"
                  value={newStakeholderEmail}
                  onChange={(e) => setNewStakeholderEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="stakeholderRole">Role</Label>
                <Select value={newStakeholderRole} onValueChange={(value: any) => setNewStakeholderRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="approver">Approver</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddStakeholder}
                  disabled={!newStakeholderEmail.trim() || isAddingStakeholder}
                  className="w-full"
                >
                  {isAddingStakeholder ? (
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-1" />
                  )}
                  {isAddingStakeholder ? 'Adding...' : 'Add Stakeholder'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Stakeholders</Label>
              {stakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {stakeholder.user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {stakeholder.user?.first_name} {stakeholder.user?.last_name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        {getRoleIcon(stakeholder.role)}
                        <span className="ml-1 capitalize">{stakeholder.role}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStakeholderPermissions(stakeholder.id, 'viewer', ['read'])}
                      >
                        Change to Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStakeholderPermissions(stakeholder.id, 'editor', ['read', 'write'])}
                      >
                        Change to Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveStakeholder(stakeholder.id)}
                        className="text-red-600"
                      >
                        Remove Stakeholder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportCollaborationPanel;