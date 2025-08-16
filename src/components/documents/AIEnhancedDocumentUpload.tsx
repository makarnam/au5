import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  File,
  X,
  Brain,
  Tag,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Settings,
  BookOpen,
  Hash,
  Star,
  Info,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { documentManagementService } from '../../services/documentManagementService';
import { DocumentCategory, DocumentTag } from '../../types/documentManagement';
import { formatBytes } from '../../utils/displayUtils';

interface AIEnhancedDocumentUploadProps {
  onUploadComplete?: (document: any) => void;
  onCancel?: () => void;
  categories?: DocumentCategory[];
  tags?: DocumentTag[];
}

interface UploadedFile {
  file: File;
  preview: string;
  analysis?: any;
  processing: boolean;
}

interface AIAnalysis {
  confidence: number;
  suggestedCategory: string;
  suggestedTags: string[];
  complianceFrameworks: string[];
  riskLevel: string;
  documentType: string;
  summary: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

const AIEnhancedDocumentUpload: React.FC<AIEnhancedDocumentUploadProps> = ({
  onUploadComplete,
  onCancel,
  categories = [],
  tags = [],
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'review' | 'complete'>('upload');
  const [processing, setProcessing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoClassify, setAutoClassify] = useState(true);
  const [autoTag, setAutoTag] = useState(true);
  const [complianceScan, setComplianceScan] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [confidentialityLevel, setConfidentialityLevel] = useState<string>('internal');
  const [complianceFrameworks, setComplianceFrameworks] = useState<string[]>([]);
  const [auditEvidence, setAuditEvidence] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      processing: false,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    if (aiEnabled) {
      setCurrentStep('analysis');
      await processFilesWithAI(newFiles);
    } else {
      setCurrentStep('review');
    }
  }, [aiEnabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
    },
    multiple: true,
  });

  const processFilesWithAI = async (files: UploadedFile[]) => {
    setProcessing(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update processing status
        setUploadedFiles(prev => prev.map((f, index) => 
          f.file === file.file ? { ...f, processing: true } : f
        ));

        // Simulate AI analysis
        const analysis = await simulateAIAnalysis(file.file);
        
        // Update file with analysis
        setUploadedFiles(prev => prev.map((f, index) => 
          f.file === file.file ? { ...f, analysis, processing: false } : f
        ));

        // Apply AI suggestions if auto-classify is enabled
        if (autoClassify && analysis.suggestedCategory) {
          setSelectedCategory(analysis.suggestedCategory);
        }

        if (autoTag && analysis.suggestedTags.length > 0) {
          setSelectedTags(prev => [...new Set([...prev, ...analysis.suggestedTags])]);
        }

        if (complianceScan && analysis.complianceFrameworks.length > 0) {
          setComplianceFrameworks(prev => [...new Set([...prev, ...analysis.complianceFrameworks])]);
        }
      }
    } catch (error) {
      console.error('Error processing files with AI:', error);
    } finally {
      setProcessing(false);
      setCurrentStep('review');
    }
  };

  const simulateAIAnalysis = async (file: File): Promise<AIAnalysis> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Mock AI analysis based on file type and name
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    let analysis: AIAnalysis = {
      confidence: 0.85 + Math.random() * 0.1,
      suggestedCategory: 'General',
      suggestedTags: [],
      complianceFrameworks: [],
      riskLevel: 'low',
      documentType: 'Unknown',
      summary: 'Document analysis completed successfully.',
      entities: [],
    };

    // Analyze based on file name patterns
    if (fileName.includes('policy') || fileName.includes('procedure')) {
      analysis.suggestedCategory = 'Policies & Procedures';
      analysis.suggestedTags = ['policy', 'procedure', 'compliance'];
      analysis.documentType = 'Policy Document';
      analysis.riskLevel = 'medium';
    } else if (fileName.includes('audit') || fileName.includes('report')) {
      analysis.suggestedCategory = 'Audit & Reports';
      analysis.suggestedTags = ['audit', 'report', 'assessment'];
      analysis.documentType = 'Audit Report';
      analysis.riskLevel = 'high';
    } else if (fileName.includes('contract') || fileName.includes('agreement')) {
      analysis.suggestedCategory = 'Contracts & Agreements';
      analysis.suggestedTags = ['contract', 'agreement', 'legal'];
      analysis.documentType = 'Legal Document';
      analysis.riskLevel = 'high';
    } else if (fileName.includes('financial') || fileName.includes('budget')) {
      analysis.suggestedCategory = 'Financial';
      analysis.suggestedTags = ['financial', 'budget', 'accounting'];
      analysis.documentType = 'Financial Document';
      analysis.complianceFrameworks = ['SOX'];
      analysis.riskLevel = 'high';
    } else if (fileName.includes('privacy') || fileName.includes('gdpr')) {
      analysis.suggestedCategory = 'Privacy & Data Protection';
      analysis.suggestedTags = ['privacy', 'gdpr', 'data-protection'];
      analysis.documentType = 'Privacy Document';
      analysis.complianceFrameworks = ['GDPR', 'CCPA'];
      analysis.riskLevel = 'high';
    }

    // Add some random entities
    analysis.entities = [
      { type: 'PERSON', value: 'John Doe', confidence: 0.9 },
      { type: 'ORGANIZATION', value: 'Company Inc', confidence: 0.8 },
      { type: 'DATE', value: '2024-01-15', confidence: 0.95 },
    ];

    return analysis;
  };

  const handleUpload = async () => {
    setProcessing(true);
    
    try {
      const uploadPromises = uploadedFiles.map(async (uploadedFile) => {
        const request = {
          file: uploadedFile.file,
          title: uploadedFile.file.name.replace(/\.[^/.]+$/, ''),
          description: description || uploadedFile.analysis?.summary || '',
          category_id: selectedCategory,
          tags: selectedTags,
          priority: priority,
          confidentiality_level: confidentialityLevel,
          compliance_frameworks: complianceFrameworks,
          regulatory_requirements: uploadedFile.analysis?.complianceFrameworks || [],
          audit_evidence: auditEvidence,
        };

        return await documentManagementService.uploadDocument(request);
      });

      const results = await Promise.all(uploadPromises);
      
      setCurrentStep('complete');
      onUploadComplete?.(results);
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = (fileToRemove: UploadedFile) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove.file));
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">AI-Enhanced Document Upload</h2>
        <p className="text-gray-600">
          Upload documents with intelligent classification, compliance detection, and automatic tagging.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2">Upload</span>
          </div>
          <div className={`w-8 h-1 ${currentStep === 'analysis' || currentStep === 'review' || currentStep === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${currentStep === 'analysis' ? 'text-blue-600' : currentStep === 'review' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'analysis' ? 'bg-blue-600 text-white' : currentStep === 'review' || currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              <Brain className="w-4 h-4" />
            </div>
            <span className="ml-2">AI Analysis</span>
          </div>
          <div className={`w-8 h-1 ${currentStep === 'review' || currentStep === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-blue-600 text-white' : currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2">Review</span>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      {currentStep === 'upload' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              AI Processing Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable AI Analysis</Label>
                <p className="text-xs text-gray-600">Automatically analyze documents for classification and compliance</p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>
            
            {aiEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto-classify documents</Label>
                  <Switch checked={autoClassify} onCheckedChange={setAutoClassify} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto-tag documents</Label>
                  <Switch checked={autoTag} onCheckedChange={setAutoTag} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Compliance framework detection</Label>
                  <Switch checked={complianceScan} onCheckedChange={setComplianceScan} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      {currentStep === 'upload' && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-gray-600 mb-4">
                or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, Word, Excel, text files, and images
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      {currentStep === 'analysis' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Analysis in Progress
              </CardTitle>
              <CardDescription>
                Analyzing {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.file.name}</p>
                        <p className="text-sm text-gray-600">{formatBytes(file.file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">Analyzing...</span>
                        </>
                      ) : file.analysis ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review and Configure */}
      {currentStep === 'review' && (
        <div className="space-y-6">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="files">Files ({uploadedFiles.length})</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <File className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.file.name}</p>
                          <p className="text-sm text-gray-600">{formatBytes(file.file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {file.analysis && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">AI Analysis Results</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-2 font-medium">{Math.round(file.analysis.confidence * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Document Type:</span>
                            <span className="ml-2 font-medium">{file.analysis.documentType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk Level:</span>
                            <Badge className={`ml-2 ${getRiskLevelColor(file.analysis.riskLevel)}`}>
                              {file.analysis.riskLevel}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Suggested Category:</span>
                            <span className="ml-2 font-medium">{file.analysis.suggestedCategory}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {uploadedFiles.map((file, index) => file.analysis && (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{file.file.name}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Suggested Tags</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {file.analysis.suggestedTags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Compliance Frameworks</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {file.analysis.complianceFrameworks.map((framework, fwIndex) => (
                              <Badge key={fwIndex} variant="outline" className="text-xs">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Summary</Label>
                          <p className="text-sm text-gray-600 mt-1">{file.analysis.summary}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter document description..."
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="mt-1">
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

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="mt-1">
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
                      <Label htmlFor="confidentiality">Confidentiality Level</Label>
                      <Select value={confidentialityLevel} onValueChange={setConfidentialityLevel}>
                        <SelectTrigger className="mt-1">
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

                    <div>
                      <Label htmlFor="audit-evidence">Audit Evidence</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Switch
                          id="audit-evidence"
                          checked={auditEvidence}
                          onCheckedChange={setAuditEvidence}
                        />
                        <Label htmlFor="audit-evidence" className="text-sm">
                          Mark as audit evidence
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => setSelectedTags(prev => prev.filter((_, i) => i !== index))}
                        >
                          {tag} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Compliance Frameworks</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {complianceFrameworks.map((framework, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => setComplianceFrameworks(prev => prev.filter((_, i) => i !== index))}
                        >
                          {framework} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={processing || uploadedFiles.length === 0}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Complete */}
      {currentStep === 'complete' && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload Complete!</h3>
            <p className="text-gray-600 mb-6">
              {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's have' : ' has'} been successfully uploaded and processed.
            </p>
            <Button onClick={onCancel}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIEnhancedDocumentUpload;
