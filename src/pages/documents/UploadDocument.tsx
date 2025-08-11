import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  FolderOpen,
  Shield,
  Calendar,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { documentManagementService } from "../../services/documentManagementService";
import {
  DocumentCategory,
  DocumentTag,
  DocumentRetentionPolicy,
  DocumentUploadRequest,
} from "../../types/documentManagement";
import { formatBytes } from "../../utils/displayUtils";

interface UploadDocumentProps {
  onUploadComplete?: () => void;
  onCancel?: () => void;
}

const UploadDocument: React.FC<UploadDocumentProps> = ({ onUploadComplete, onCancel }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [tags, setTags] = useState<DocumentTag[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<DocumentRetentionPolicy[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state for each file
  const [fileMetadata, setFileMetadata] = useState<Record<string, {
    title: string;
    description: string;
    category_id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    confidentiality_level: 'public' | 'internal' | 'confidential' | 'restricted';
    compliance_frameworks: string[];
    regulatory_requirements: string[];
    audit_evidence: boolean;
    retention_policy_id: string;
  }>>({});

  React.useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [categoriesData, tagsData, policiesData] = await Promise.all([
        documentManagementService.getCategories(),
        documentManagementService.getTags(),
        documentManagementService.getRetentionPolicies(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
      setRetentionPolicies(policiesData);
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    
    // Initialize metadata for new files
    const newMetadata = { ...fileMetadata };
    acceptedFiles.forEach(file => {
      if (!newMetadata[file.name]) {
        newMetadata[file.name] = {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          description: '',
          category_id: '',
          priority: 'medium',
          confidentiality_level: 'internal',
          compliance_frameworks: [],
          regulatory_requirements: [],
          audit_evidence: false,
          retention_policy_id: '',
        };
      }
    });
    setFileMetadata(newMetadata);
  }, [fileMetadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
    },
    multiple: true,
  });

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    const newMetadata = { ...fileMetadata };
    delete newMetadata[fileName];
    setFileMetadata(newMetadata);
  };

  const updateFileMetadata = (fileName: string, field: string, value: any) => {
    setFileMetadata(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        [field]: value,
      },
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({});

    try {
      for (const file of files) {
        const metadata = fileMetadata[file.name];
        
        const uploadRequest: DocumentUploadRequest = {
          file,
          title: metadata.title,
          description: metadata.description,
          category_id: metadata.category_id || undefined,
          tags: selectedTags,
          priority: metadata.priority,
          confidentiality_level: metadata.confidentiality_level,
          compliance_frameworks: metadata.compliance_frameworks,
          regulatory_requirements: metadata.regulatory_requirements,
          audit_evidence: metadata.audit_evidence,
          retention_policy_id: metadata.retention_policy_id || undefined,
        };

        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.name] || 0;
            if (current >= 90) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [file.name]: current + 10 };
          });
        }, 200);

        await documentManagementService.uploadDocument(uploadRequest);
        
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      onUploadComplete?.();
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <File className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx': return <File className="h-4 w-4 text-blue-500" />;
      case 'xls':
      case 'xlsx': return <File className="h-4 w-4 text-green-500" />;
      case 'ppt':
      case 'pptx': return <File className="h-4 w-4 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <File className="h-4 w-4 text-purple-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground">
            Upload and categorize documents with metadata and compliance information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} Document{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Select Files</CardTitle>
          <CardDescription>
            Drag and drop files here, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports PDF, Word, Excel, PowerPoint, images, and more
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files to Upload ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.name} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadProgress[file.name] !== undefined && (
                        <div className="text-sm text-muted-foreground">
                          {uploadProgress[file.name]}%
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.name)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* File Metadata Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`title-${file.name}`}>Title</Label>
                      <Input
                        id={`title-${file.name}`}
                        value={fileMetadata[file.name]?.title || ''}
                        onChange={(e) => updateFileMetadata(file.name, 'title', e.target.value)}
                        placeholder="Document title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`category-${file.name}`}>Category</Label>
                      <Select
                        value={fileMetadata[file.name]?.category_id || ''}
                        onValueChange={(value) => updateFileMetadata(file.name, 'category_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`priority-${file.name}`}>Priority</Label>
                      <Select
                        value={fileMetadata[file.name]?.priority || 'medium'}
                        onValueChange={(value: any) => updateFileMetadata(file.name, 'priority', value)}
                      >
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

                    <div className="space-y-2">
                      <Label htmlFor={`confidentiality-${file.name}`}>Confidentiality</Label>
                      <Select
                        value={fileMetadata[file.name]?.confidentiality_level || 'internal'}
                        onValueChange={(value: any) => updateFileMetadata(file.name, 'confidentiality_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="confidential">Confidential</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`description-${file.name}`}>Description</Label>
                      <Textarea
                        id={`description-${file.name}`}
                        value={fileMetadata[file.name]?.description || ''}
                        onChange={(e) => updateFileMetadata(file.name, 'description', e.target.value)}
                        placeholder="Document description"
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`audit-evidence-${file.name}`}
                          checked={fileMetadata[file.name]?.audit_evidence || false}
                          onCheckedChange={(checked) => 
                            updateFileMetadata(file.name, 'audit_evidence', checked)
                          }
                        />
                        <Label htmlFor={`audit-evidence-${file.name}`}>
                          This document is audit evidence
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      Advanced Options
                    </Button>

                    {showAdvanced && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor={`retention-${file.name}`}>Retention Policy</Label>
                          <Select
                            value={fileMetadata[file.name]?.retention_policy_id || ''}
                            onValueChange={(value) => updateFileMetadata(file.name, 'retention_policy_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select retention policy" />
                            </SelectTrigger>
                            <SelectContent>
                              {retentionPolicies.map((policy) => (
                                <SelectItem key={policy.id} value={policy.id}>
                                  {policy.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Compliance Frameworks</Label>
                          <div className="space-y-2">
                            {['GDPR', 'SOX', 'ISO 27001', 'PCI DSS', 'HIPAA'].map((framework) => (
                              <div key={framework} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${framework}-${file.name}`}
                                  checked={fileMetadata[file.name]?.compliance_frameworks?.includes(framework) || false}
                                  onCheckedChange={(checked) => {
                                    const current = fileMetadata[file.name]?.compliance_frameworks || [];
                                    const updated = checked
                                      ? [...current, framework]
                                      : current.filter(f => f !== framework);
                                    updateFileMetadata(file.name, 'compliance_frameworks', updated);
                                  }}
                                />
                                <Label htmlFor={`${framework}-${file.name}`} className="text-sm">
                                  {framework}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Tags */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Apply Tags to All Documents</CardTitle>
            <CardDescription>
              Select tags to apply to all uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTags(prev => [...prev, tag.id]);
                      } else {
                        setSelectedTags(prev => prev.filter(id => id !== tag.id));
                      }
                    }}
                  />
                  <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                    <Badge variant="outline" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                      {tag.name}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadDocument;
