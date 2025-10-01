import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { supabase } from '../../lib/supabase';
import { aiService } from '../../services/aiService';
import {
  FileText,
  Brain,
  Tag,
  CheckCircle,
  AlertTriangle,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Zap
} from 'lucide-react';

interface AIDocumentClassifierProps {
  className?: string;
}

interface DocumentClassification {
  id: string;
  document_id: string;
  document_name: string;
  predicted_category: string;
  confidence_score: number;
  suggested_tags: string[];
  extracted_entities: Record<string, any>;
  classification_reasoning: string;
  manual_override?: boolean;
  manual_category?: string;
  created_at: string;
  updated_at: string;
}

interface ClassificationRule {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  patterns: string[];
  priority: number;
  is_active: boolean;
  accuracy_score?: number;
}

interface ClassificationStats {
  total_documents: number;
  classified_documents: number;
  manual_overrides: number;
  average_confidence: number;
  top_categories: Array<{ category: string; count: number }>;
  accuracy_trends: Array<{ date: string; accuracy: number }>;
}

const DOCUMENT_CATEGORIES = [
  'Policy',
  'Procedure',
  'Risk Assessment',
  'Audit Report',
  'Compliance Framework',
  'Contract',
  'Training Material',
  'Incident Report',
  'Security Assessment',
  'Vendor Agreement',
  'Regulatory Document',
  'Internal Memo',
  'Financial Report',
  'Legal Document',
  'Technical Documentation'
];

const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.6,
  low: 0.4
};

export default function AIDocumentClassifier({ className = "" }: AIDocumentClassifierProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<DocumentClassification[]>([]);
  const [rules, setRules] = useState<ClassificationRule[]>([]);
  const [stats, setStats] = useState<ClassificationStats | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadDocuments(),
        loadClassifications(),
        loadClassificationRules(),
        loadStats()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load classification data');
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  }

  async function loadClassifications() {
    try {
      const { data, error } = await supabase
        .from('document_classifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClassifications(data || []);
    } catch (err) {
      console.error('Error loading classifications:', err);
    }
  }

  async function loadClassificationRules() {
    try {
      const { data, error } = await supabase
        .from('classification_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (err) {
      console.error('Error loading classification rules:', err);
    }
  }

  async function loadStats() {
    try {
      // Calculate statistics from classifications
      const totalDocs = documents.length;
      const classifiedDocs = classifications.length;
      const manualOverrides = classifications.filter(c => c.manual_override).length;
      const avgConfidence = classifications.length > 0
        ? classifications.reduce((sum, c) => sum + c.confidence_score, 0) / classifications.length
        : 0;

      // Top categories
      const categoryCount = classifications.reduce((acc, c) => {
        const category = c.manual_override ? c.manual_category : c.predicted_category;
        if (category) {
          acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      setStats({
        total_documents: totalDocs,
        classified_documents: classifiedDocs,
        manual_overrides: manualOverrides,
        average_confidence: avgConfidence,
        top_categories: topCategories,
        accuracy_trends: [] // Would be calculated from historical data
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  }

  async function classifyDocument(document: any) {
    try {
      setIsClassifying(true);
      setError(null);

      // Get document content (this would typically come from file storage)
      const documentContent = await getDocumentContent(document.id);

      // Use AI to classify the document
      const classificationPrompt = `
        Analyze this document and classify it into one of the following categories:
        ${DOCUMENT_CATEGORIES.join(', ')}

        Document Title: ${document.title}
        Document Content Preview: ${documentContent.substring(0, 1000)}

        Provide:
        1. Predicted category
        2. Confidence score (0-1)
        3. Suggested tags (3-5 relevant tags)
        4. Key entities extracted (people, organizations, dates, etc.)
        5. Reasoning for the classification

        Return as JSON with this structure:
        {
          "category": "string",
          "confidence": 0.85,
          "tags": ["tag1", "tag2", "tag3"],
          "entities": {"key": "value"},
          "reasoning": "explanation"
        }
      `;

      const aiResponse = await aiService.generateContent({
        provider: 'ollama',
        model: 'llama2',
        prompt: classificationPrompt,
        context: 'document_classification',
        fieldType: 'finding_analysis',
        auditData: {}
      });

      if (aiResponse?.content) {
        const result = JSON.parse(aiResponse.content);

        // Save classification to database
        const classification: Omit<DocumentClassification, 'id' | 'created_at' | 'updated_at'> = {
          document_id: document.id,
          document_name: document.title,
          predicted_category: result.category,
          confidence_score: result.confidence,
          suggested_tags: result.tags,
          extracted_entities: result.entities,
          classification_reasoning: result.reasoning,
          manual_override: false
        };

        const { data, error } = await supabase
          .from('document_classifications')
          .insert(classification)
          .select()
          .single();

        if (error) throw error;

        // Update document with classification
        await supabase
          .from('documents')
          .update({
            category: result.category,
            tags: result.tags,
            ai_processed: true,
            ai_confidence: result.confidence
          })
          .eq('id', document.id);

        await loadClassifications();
        await loadStats();
      }
    } catch (err) {
      console.error('Error classifying document:', err);
      setError('Failed to classify document');
    } finally {
      setIsClassifying(false);
    }
  }

  async function getDocumentContent(documentId: string): Promise<string> {
    try {
      // This would typically extract text from the document file
      // For now, return mock content based on document title
      const mockContent = `
        This is a ${documentId} document. It contains information about various business processes,
        compliance requirements, risk assessments, and operational procedures. The document
        discusses important topics related to governance, risk management, and compliance.
        It includes sections on policies, procedures, controls, and monitoring activities.
      `;
      return mockContent;
    } catch (err) {
      console.error('Error getting document content:', err);
      return 'Document content not available';
    }
  }

  async function overrideClassification(classificationId: string, newCategory: string) {
    try {
      const { error } = await supabase
        .from('document_classifications')
        .update({
          manual_override: true,
          manual_category: newCategory,
          updated_at: new Date().toISOString()
        })
        .eq('id', classificationId);

      if (error) throw error;

      // Update document category
      const classification = classifications.find(c => c.id === classificationId);
      if (classification) {
        await supabase
          .from('documents')
          .update({ category: newCategory })
          .eq('id', classification.document_id);
      }

      await loadClassifications();
      await loadStats();
    } catch (err) {
      console.error('Error overriding classification:', err);
      setError('Failed to override classification');
    }
  }

  async function trainClassificationModel() {
    try {
      setIsTraining(true);
      setError(null);

      // Get training data from existing classifications
      const trainingData = classifications.map(c => ({
        content: `Title: ${c.document_name}\nReasoning: ${c.classification_reasoning}`,
        category: c.manual_override ? c.manual_category : c.predicted_category,
        tags: c.suggested_tags
      }));

      // Use AI to improve classification rules
      const trainingPrompt = `
        Based on these classified documents, generate improved classification rules:

        Training Data:
        ${trainingData.map(d => `${d.category}: ${d.content.substring(0, 200)}...`).join('\n')}

        Generate:
        1. Updated keyword lists for each category
        2. Pattern matching rules
        3. Priority rankings
        4. Accuracy improvements

        Return as JSON array of classification rules.
      `;

      const aiResponse = await aiService.generateContent({
        provider: 'ollama',
        model: 'llama2',
        prompt: trainingPrompt,
        context: 'classification_rule_training',
        fieldType: 'finding_analysis',
        auditData: {}
      });

      if (aiResponse?.content) {
        const newRules = JSON.parse(aiResponse.content);

        // Save new rules to database
        for (const rule of newRules) {
          await supabase
            .from('classification_rules')
            .upsert({
              name: rule.name,
              category: rule.category,
              keywords: rule.keywords,
              patterns: rule.patterns,
              priority: rule.priority,
              is_active: true,
              accuracy_score: rule.accuracy
            });
        }

        await loadClassificationRules();
      }
    } catch (err) {
      console.error('Error training model:', err);
      setError('Failed to train classification model');
    } finally {
      setIsTraining(false);
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= CONFIDENCE_THRESHOLDS.high) return 'text-green-600 bg-green-100';
    if (score >= CONFIDENCE_THRESHOLDS.medium) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= CONFIDENCE_THRESHOLDS.high) return 'High';
    if (score >= CONFIDENCE_THRESHOLDS.medium) return 'Medium';
    return 'Low';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' ||
      classifications.find(c => c.document_id === doc.id)?.predicted_category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Document Classification</h2>
          <p className="text-gray-600">Automatically classify and tag documents using AI</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={trainClassificationModel}
            disabled={isTraining}
          >
            {isTraining ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Training...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Train Model
              </>
            )}
          </Button>
          <Button onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.classified_documents}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(stats.average_confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Manual Overrides</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.manual_overrides}</p>
                </div>
                <Edit className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Documents</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DOCUMENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Classification List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.map((document) => {
          const classification = classifications.find(c => c.document_id === document.id);

          return (
            <Card key={document.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-lg">{document.title}</h3>
                      {classification && (
                        <Badge className={getConfidenceColor(classification.confidence_score)}>
                          {getConfidenceLabel(classification.confidence_score)} Confidence
                        </Badge>
                      )}
                    </div>

                    {document.description && (
                      <p className="text-gray-600 mb-3">{document.description}</p>
                    )}

                    {classification ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Predicted Category:</span>
                            <Badge variant="outline" className="ml-2">
                              {classification.manual_override
                                ? classification.manual_category
                                : classification.predicted_category}
                            </Badge>
                            {classification.manual_override && (
                              <Badge variant="secondary" className="ml-2">Manual Override</Badge>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Confidence:</span>
                            <span className="ml-2 font-medium">
                              {(classification.confidence_score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {classification.suggested_tags.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Suggested Tags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {classification.suggested_tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          <strong>Reasoning:</strong> {classification.classification_reasoning}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        Not yet classified
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!classification ? (
                      <Button
                        onClick={() => classifyDocument(document)}
                        disabled={isClassifying}
                        size="sm"
                      >
                        {isClassifying ? (
                          <>
                            <Brain className="w-4 h-4 mr-2 animate-spin" />
                            Classifying...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Classify
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(document)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Select
                          onValueChange={(value) => overrideClassification(classification.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Override" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOCUMENT_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload some documents to get started with AI classification.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Top Categories */}
      {stats && stats.top_categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Document Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.top_categories.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <Badge variant="secondary">{item.count} documents</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}