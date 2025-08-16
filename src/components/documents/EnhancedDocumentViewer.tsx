import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {
  FileText,
  Download,
  Share2,
  Search,
  Eye,
  EyeOff,
  RotateCw,
  ZoomIn,
  ZoomOut,
  File,
  Brain,
  Tag,
  Shield,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Settings,
  BookOpen,
  Hash,
  Star,
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
import { documentManagementService } from '../../services/documentManagementService';
import { Document, DocumentAIProcessing } from '../../types/documentManagement';
import { formatBytes, formatDate } from '../../utils/displayUtils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface EnhancedDocumentViewerProps {
  document: Document;
  onClose?: () => void;
  onUpdate?: (document: Document) => void;
}

interface AIAnalysis {
  confidence: number;
  extractedText: string;
  keywords: string[];
  classification: {
    category: string;
    type: string;
    risk_level: string;
    compliance_frameworks: string[];
  };
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  summary: string;
}

const EnhancedDocumentViewer: React.FC<EnhancedDocumentViewerProps> = ({
  document,
  onClose,
  onUpdate,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [showTextLayer, setShowTextLayer] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiProcessing, setAiProcessing] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');

  useEffect(() => {
    loadDocumentUrl();
    loadAIAnalysis();
  }, [document]);

  const loadDocumentUrl = async () => {
    try {
      const { data } = await documentManagementService.getDocumentUrl(document.id);
      setDocumentUrl(data.url);
    } catch (error) {
      console.error('Error loading document URL:', error);
    }
  };

  const loadAIAnalysis = async () => {
    try {
      setAiProcessing(true);
      const analysis = await documentManagementService.getAIAnalysis(document.id);
      if (analysis) {
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error loading AI analysis:', error);
    } finally {
      setAiProcessing(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
  };

  const changeScale = (newScale: number) => {
    setScale(Math.min(Math.max(0.5, newScale), 3.0));
  };

  const rotateDocument = () => {
    setRotation((prevRotation + 90) % 360);
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  }, []);

  const customTextRenderer = useCallback(
    (textItem: any) => {
      if (!searchText) return textItem.str;
      const regex = new RegExp(`(${searchText})`, 'gi');
      return textItem.str.replace(regex, '<mark>$1</mark>');
    },
    [searchText]
  );

  const downloadDocument = async () => {
    try {
      await documentManagementService.downloadDocument(document.id);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const shareDocument = async () => {
    try {
      const shareData = await documentManagementService.createShareLink(document.id);
      // Handle share link creation
      console.log('Share link created:', shareData);
    } catch (error) {
      console.error('Error creating share link:', error);
    }
  };

  const triggerAIAnalysis = async () => {
    try {
      setAiProcessing(true);
      await documentManagementService.triggerAIAnalysis(document.id);
      // Poll for completion
      setTimeout(loadAIAnalysis, 2000);
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
    }
  };

  const getConfidentialityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'confidential': return 'bg-yellow-100 text-yellow-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`fixed inset-0 bg-white z-50 ${isFullscreen ? '' : 'm-4 rounded-lg shadow-2xl'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{document.title}</h2>
            <p className="text-sm text-gray-600">
              {document.file_name} • {formatBytes(document.file_size)} • {document.file_type}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(document.status)}>
            {document.status}
          </Badge>
          <Badge className={getConfidentialityColor(document.confidentiality_level)}>
            {document.confidentiality_level}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto">
          <Tabs defaultValue="info" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="ai">AI Analysis</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Document Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Description</Label>
                    <p className="text-sm">{document.description || 'No description'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">Version</Label>
                    <p className="text-sm">{document.version}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">Created</Label>
                    <p className="text-sm">{formatDate(document.created_at)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">Last Modified</Label>
                    <p className="text-sm">{formatDate(document.updated_at)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">Owner</Label>
                    <p className="text-sm">{document.owner?.full_name || document.owner?.email}</p>
                  </div>
                </CardContent>
              </Card>

              {document.compliance_frameworks && document.compliance_frameworks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Compliance Frameworks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {document.compliance_frameworks.map((framework, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {document.regulatory_requirements && document.regulatory_requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Regulatory Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {document.regulatory_requirements.map((requirement, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {requirement}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ai" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Processing AI analysis...</span>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Confidence Score</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${aiAnalysis.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(aiAnalysis.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">Classification</Label>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {aiAnalysis.classification.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {aiAnalysis.classification.type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              aiAnalysis.classification.risk_level === 'high' ? 'border-red-300 text-red-700' :
                              aiAnalysis.classification.risk_level === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }`}
                          >
                            Risk: {aiAnalysis.classification.risk_level}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">Keywords</Label>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.keywords.slice(0, 10).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">Summary</Label>
                        <p className="text-sm text-gray-700">{aiAnalysis.summary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Brain className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-3">No AI analysis available</p>
                      <Button size="sm" onClick={triggerAIAnalysis}>
                        Run AI Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Document Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={downloadDocument}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={shareDocument}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={triggerAIAnalysis}>
                    <Brain className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Viewer Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Text Layer</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTextLayer(!showTextLayer)}
                    >
                      {showTextLayer ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Annotations</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAnnotations(!showAnnotations)}
                    >
                      {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm">
                  Page {pageNumber} of {numPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeScale(scale - 0.1)}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-sm min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeScale(scale + 0.1)}
                  disabled={scale >= 3.0}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={rotateDocument}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search in document..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            {documentUrl ? (
              <div className="flex justify-center">
                <Document
                  file={documentUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onMouseUp={handleTextSelection}
                  className="shadow-lg bg-white"
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={showTextLayer}
                    renderAnnotationLayer={showAnnotations}
                    customTextRenderer={customTextRenderer}
                    className="border"
                  />
                </Document>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <File className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Loading document...</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Text Panel */}
          {selectedText && (
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Selected Text</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedText('')}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={selectedText}
                readOnly
                className="min-h-[60px]"
                placeholder="No text selected"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDocumentViewer;
