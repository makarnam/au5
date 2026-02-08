import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Edit, Trash2, Download, Clock, CheckCircle, GitBranch, History } from "lucide-react";
import { toast } from "react-hot-toast";
import { documentManagementService } from "../../services/documentManagementService";
import type { Document, DocumentVersion } from "../../types/documentManagement";

interface DocumentVersionControlProps {
  documentId: string;
}

const DocumentVersionControl: React.FC<DocumentVersionControlProps> = ({ documentId }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<DocumentVersion | null>(null);
  const [formData, setFormData] = useState({
    version_number: "",
    change_summary: "",
    file: null as File | null,
  });

  useEffect(() => {
    loadDocumentAndVersions();
  }, [documentId]);

  const loadDocumentAndVersions = async () => {
    try {
      setLoading(true);
      const [docData, versionsData] = await Promise.all([
        documentManagementService.getDocument(documentId),
        documentManagementService.getDocumentVersions(documentId)
      ]);
      setDocument(docData);
      setVersions(versionsData);
    } catch (error) {
      console.error("Error loading document versions:", error);
      toast.error("Failed to load document versions");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      version_number: "",
      change_summary: "",
      file: null,
    });
    setEditingVersion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.version_number.trim() || !formData.change_summary.trim()) {
      toast.error("Version number and change summary are required");
      return;
    }

    if (!editingVersion && !formData.file) {
      toast.error("Please select a file for the new version");
      return;
    }

    try {
      if (editingVersion) {
        // Update existing version metadata
        await documentManagementService.updateDocumentVersion(editingVersion.id, {
          change_summary: formData.change_summary,
        });
        toast.success("Version updated successfully");
      } else {
        // Create new version
        await documentManagementService.createDocumentVersion(documentId, {
          version_number: formData.version_number,
          change_summary: formData.change_summary,
          file: formData.file!,
        });
        toast.success("New version created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadDocumentAndVersions();
    } catch (error) {
      console.error("Error saving version:", error);
      toast.error("Failed to save version");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleDownload = async (versionId: string) => {
    try {
      const blob = await documentManagementService.downloadDocumentVersion(versionId);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `document-v${versions.find(v => v.id === versionId)?.version_number || versionId}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading version:", error);
      toast.error("Failed to download version");
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm("Are you sure you want to delete this version? This action cannot be undone.")) {
      return;
    }

    try {
      await documentManagementService.deleteDocumentVersion(versionId);
      toast.success("Version deleted successfully");
      loadDocumentAndVersions();
    } catch (error) {
      console.error("Error deleting version:", error);
      toast.error("Failed to delete version");
    }
  };

  const getStatusIcon = (isCurrent?: boolean) => {
    return isCurrent ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadge = (isCurrent?: boolean) => {
    return (
      <Badge variant={isCurrent ? "default" : "secondary"}>
        {isCurrent ? "Current" : "Historical"}
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

  if (!document) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Document not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Version Control
              <Badge variant="outline" className="ml-2">New</Badge>
            </CardTitle>
            <CardDescription>
              Manage versions for: {document.title}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Version
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVersion ? "Edit Version" : "Create New Version"}
                </DialogTitle>
                <DialogDescription>
                  {editingVersion ? "Update version information" : "Upload a new version of the document"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Version Number *</label>
                    <Input
                      value={formData.version_number}
                      onChange={(e) => setFormData({ ...formData, version_number: e.target.value })}
                      placeholder="e.g., 1.1, 2.0"
                      required
                      disabled={!!editingVersion}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">File {editingVersion ? "(Optional)" : "*"}</label>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
                      disabled={!!editingVersion}
                    />
                    {formData.file && (
                      <p className="text-sm text-gray-600 mt-1">{formData.file.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Change Description *</label>
                  <Textarea
                    value={formData.change_summary}
                    onChange={(e) => setFormData({ ...formData, change_summary: e.target.value })}
                    placeholder="Describe what changed in this version"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVersion ? "Update Version" : "Create Version"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No versions created yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Create the first version to start version control for this document.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Change Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium">
                    v{version.version_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(version.is_current)}
                      {getStatusBadge(version.is_current)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={version.change_summary}>
                      {version.change_summary}
                    </div>
                  </TableCell>
                  <TableCell>
                    {version.created_at ? new Date(version.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    {version.file_size ? `${(version.file_size / 1024 / 1024).toFixed(2)} MB` : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(version.id)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingVersion(version);
                          setFormData({
                            version_number: version.version_number,
                            change_summary: version.change_summary || "",
                            file: null,
                          });
                          setIsDialogOpen(true);
                        }}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!version.is_current && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(version.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {versions.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <GitBranch className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Version Control Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  • Current version is marked with a green checkmark<br/>
                  • Historical versions can be downloaded but not modified<br/>
                  • Only the current version can be replaced with a new version<br/>
                  • Deleted versions cannot be recovered
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentVersionControl;