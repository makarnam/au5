import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Edit, Trash2, FileText, Clock, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { policyService } from "../../services/policyService";
import PolicyApprovalWorkflow from "./PolicyApprovalWorkflow";
import PolicyComplianceMapping from "./PolicyComplianceMapping";
import PolicyAnalytics from "./PolicyAnalytics";
import type { Policy, PolicyVersion, PolicyVersionStatus } from "../../types/policies";

const PolicyLifecycleManager: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner_id: "",
    is_active: true,
    tags: [] as string[],
  });
  const [versionFormData, setVersionFormData] = useState({
    title: "",
    content: "",
    status: "draft" as PolicyVersionStatus,
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await policyService.listPolicies();
      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error("Error loading policies:", error);
      toast.error("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  const loadPolicyVersions = async (policyId: string) => {
    try {
      const { data, error } = await policyService.listVersions(policyId);
      if (error) throw error;
      setPolicyVersions(data || []);
    } catch (error) {
      console.error("Error loading policy versions:", error);
      toast.error("Failed to load policy versions");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      owner_id: "",
      is_active: true,
      tags: [],
    });
    setEditingPolicy(null);
  };

  const resetVersionForm = () => {
    setVersionFormData({
      title: "",
      content: "",
      status: "draft",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Policy name is required");
      return;
    }

    try {
      if (editingPolicy) {
        await policyService.updatePolicy(editingPolicy.id, formData);
        toast.success("Policy updated successfully");
      } else {
        await policyService.createPolicy(formData);
        toast.success("Policy created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadPolicies();
    } catch (error) {
      console.error("Error saving policy:", error);
      toast.error("Failed to save policy");
    }
  };

  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPolicy || !versionFormData.title.trim() || !versionFormData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      await policyService.createVersion(selectedPolicy.id, versionFormData);
      toast.success("Policy version created successfully");

      setIsVersionDialogOpen(false);
      resetVersionForm();
      loadPolicyVersions(selectedPolicy.id);
    } catch (error) {
      console.error("Error creating policy version:", error);
      toast.error("Failed to create policy version");
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name || "",
      description: policy.description || "",
      owner_id: policy.owner_id || "",
      is_active: policy.is_active ?? true,
      tags: policy.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleViewVersions = (policy: Policy) => {
    setSelectedPolicy(policy);
    loadPolicyVersions(policy.id);
  };

  const handleDelete = async (policyId: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) {
      return;
    }

    try {
      await policyService.deletePolicy(policyId);
      toast.success("Policy deleted successfully");
      loadPolicies();
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Failed to delete policy");
    }
  };

  const getStatusIcon = (status: PolicyVersionStatus) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "draft":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "archived":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: PolicyVersionStatus) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    } as const;

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Policy Lifecycle Management</h2>
          <p className="text-gray-600">Manage policy creation, versioning, and approval workflows</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? "Edit Policy" : "Create New Policy"}
              </DialogTitle>
              <DialogDescription>
                Define policy details and lifecycle parameters.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Policy Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter policy name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <Input
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    placeholder="Owner ID or name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Policy description and purpose"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.is_active ? "active" : "inactive"}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={formData.tags.join(", ")}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) })}
                    placeholder="Comma-separated tags"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPolicy ? "Update" : "Create"} Policy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          {selectedPolicy && <TabsTrigger value="versions">Versions</TabsTrigger>}
          {selectedPolicy && <TabsTrigger value="compliance">Compliance Mapping</TabsTrigger>}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="approvals">Approval Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Policy Library
                <Badge variant="outline" className="ml-2">New</Badge>
              </CardTitle>
              <CardDescription>
                Manage your organization's policies and their lifecycles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No policies created yet.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start by creating your first policy to establish governance standards.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{policy.description || "-"}</TableCell>
                        <TableCell>{policy.owner_id || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={policy.is_active ? "default" : "secondary"}>
                            {policy.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {policy.created_at ? new Date(policy.created_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(policy)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewVersions(policy)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(policy.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {selectedPolicy && (
          <TabsContent value="versions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Policy Versions: {selectedPolicy.name}
                    </CardTitle>
                    <CardDescription>
                      Manage versions and approval workflow for this policy
                    </CardDescription>
                  </div>
                  <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetVersionForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Version
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Create New Policy Version</DialogTitle>
                        <DialogDescription>
                          Create a new version of the policy with updated content.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleVersionSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Version Title *</label>
                            <Input
                              value={versionFormData.title}
                              onChange={(e) => setVersionFormData({ ...versionFormData, title: e.target.value })}
                              placeholder="Version title"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select
                              value={versionFormData.status}
                              onValueChange={(value) => setVersionFormData({ ...versionFormData, status: value as PolicyVersionStatus })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Content *</label>
                          <Textarea
                            value={versionFormData.content}
                            onChange={(e) => setVersionFormData({ ...versionFormData, content: e.target.value })}
                            placeholder="Policy content in markdown format"
                            rows={10}
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            Create Version
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {policyVersions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No versions created yet.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Create the first version of this policy to begin the lifecycle management.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policyVersions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell className="font-medium">v{version.version_number}</TableCell>
                          <TableCell>{version.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(version.status)}
                              {getStatusBadge(version.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {version.created_at ? new Date(version.created_at).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {selectedPolicy && (
          <TabsContent value="compliance" className="space-y-6">
            <PolicyComplianceMapping />
          </TabsContent>
        )}

        <TabsContent value="analytics" className="space-y-6">
          <PolicyAnalytics />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <PolicyApprovalWorkflow
            policy={policies[0] || { id: '', name: '', description: '', owner_id: '', is_active: true, tags: [], created_at: '', updated_at: '' }}
            versions={policyVersions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyLifecycleManager;