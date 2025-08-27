import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, RefreshCw, Star, Settings, FileText, Target, Zap } from 'lucide-react';
import { generateContent } from '@/services/aiService';

interface UniversalAIGeneratorProps {
  module: string;
  entityId?: string;
  entityType?: string;
  availableFields: FieldConfig[];
  onGenerationComplete?: (results: GenerationResult[]) => void;
  onQualityRating?: (rating: QualityRating) => void;
  className?: string;
}

interface FieldConfig {
  id: string;
  name: string;
  type: string;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  fieldType: string;
  context?: string;
}

interface GenerationResult {
  fieldId: string;
  fieldName: string;
  content: string;
  quality: number;
  timestamp: string;
  templateUsed?: string;
  contextUsed?: string;
}

interface QualityRating {
  overall: number;
  relevance: number;
  completeness: number;
  clarity: number;
  accuracy: number;
  feedback?: string;
}

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  fieldType: string;
  industry?: string;
  framework?: string;
  quality: number;
}

const UniversalAIGenerator: React.FC<UniversalAIGeneratorProps> = ({
  module,
  entityId,
  entityType,
  availableFields,
  onGenerationComplete,
  onQualityRating,
  className = ''
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [qualityRating, setQualityRating] = useState<QualityRating | null>(null);
  const [activeTab, setActiveTab] = useState('fields');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [generationMode, setGenerationMode] = useState<'single' | 'batch' | 'smart'>('single');
  const [error, setError] = useState<string | null>(null);

  // Load available templates
  useEffect(() => {
    loadTemplates();
  }, [module]);

  const loadTemplates = async () => {
    try {
      // This would fetch templates from the database
      // For now, we'll create mock templates
      const mockTemplates: TemplateInfo[] = [
        {
          id: 'template-1',
          name: 'Standard Template',
          description: 'Standard generation template for general use',
          fieldType: 'general',
          quality: 4.2
        },
        {
          id: 'template-2',
          name: 'Compliance Focused',
          description: 'Template optimized for compliance content',
          fieldType: 'compliance',
          framework: 'SOX',
          quality: 4.5
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleFieldSelection = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, fieldId]);
    } else {
      setSelectedFields(prev => prev.filter(id => id !== fieldId));
    }
  };

  const generateSingleField = async (field: FieldConfig): Promise<GenerationResult> => {
    const prompt = buildContextAwarePrompt(field, context);
    
    const response = await generateContent({
      provider: 'default',
      model: 'gpt-4',
      prompt,
      context: context || 'No additional context provided',
      fieldType: field.fieldType
    });

    return {
      fieldId: field.id,
      fieldName: field.name,
      content: response.content,
      quality: calculateQuality(response.content, field),
      timestamp: new Date().toISOString(),
      templateUsed: selectedTemplate,
      contextUsed: context
    };
  };

  const generateBatchFields = async (fields: FieldConfig[]): Promise<GenerationResult[]> => {
    const results: GenerationResult[] = [];
    const totalFields = fields.length;

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      setGenerationProgress((i / totalFields) * 100);
      
      try {
        const result = await generateSingleField(field);
        results.push(result);
      } catch (error) {
        console.error(`Error generating field ${field.name}:`, error);
        results.push({
          fieldId: field.id,
          fieldName: field.name,
          content: 'Generation failed',
          quality: 0,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  };

  const generateSmartFields = async (fields: FieldConfig[]): Promise<GenerationResult[]> => {
    // Smart generation analyzes field relationships and generates content accordingly
    const fieldGroups = analyzeFieldRelationships(fields);
    const results: GenerationResult[] = [];

    for (const group of fieldGroups) {
      const groupContext = buildGroupContext(group, context);
      
      for (const field of group) {
        const result = await generateSingleField({
          ...field,
          context: groupContext
        });
        results.push(result);
      }
    }

    return results;
  };

  const analyzeFieldRelationships = (fields: FieldConfig[]): FieldConfig[][] => {
    // Group fields by type and relationships
    const groups: FieldConfig[][] = [];
    const processed = new Set<string>();

    fields.forEach(field => {
      if (processed.has(field.id)) return;

      const relatedFields = fields.filter(f => 
        f.type === field.type || 
        f.fieldType === field.fieldType ||
        f.name.toLowerCase().includes(field.name.toLowerCase())
      );

      groups.push(relatedFields);
      relatedFields.forEach(f => processed.add(f.id));
    });

    return groups;
  };

  const buildContextAwarePrompt = (field: FieldConfig, context: string): string => {
    const basePrompt = `Generate content for ${field.name} in the ${module} module.`;
    const contextPrompt = context ? `Context: ${context}` : '';
    const templatePrompt = selectedTemplate ? `Use template: ${selectedTemplate}` : '';
    
    return `${basePrompt} ${contextPrompt} ${templatePrompt}`.trim();
  };

  const buildGroupContext = (fields: FieldConfig[], baseContext: string): string => {
    const fieldNames = fields.map(f => f.name).join(', ');
    return `${baseContext} Related fields: ${fieldNames}`;
  };

  const calculateQuality = (content: string, field: FieldConfig): number => {
    // Simple quality calculation based on content length, structure, etc.
    let quality = 0;
    
    if (content.length > 50) quality += 1;
    if (content.length > 200) quality += 1;
    if (content.includes('.')) quality += 1;
    if (content.includes(',')) quality += 1;
    if (content.split(' ').length > 10) quality += 1;
    
    return Math.min(quality, 5);
  };

  const handleGenerate = async () => {
    if (selectedFields.length === 0) {
      setError('Please select at least one field to generate');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      const selectedFieldConfigs = availableFields.filter(field => 
        selectedFields.includes(field.id)
      );

      let generationResults: GenerationResult[] = [];

      switch (generationMode) {
        case 'single':
          if (selectedFields.length === 1) {
            const field = selectedFieldConfigs[0];
            const result = await generateSingleField(field);
            generationResults = [result];
          } else {
            setError('Single mode can only generate one field at a time');
            setIsGenerating(false);
            return;
          }
          break;

        case 'batch':
          generationResults = await generateBatchFields(selectedFieldConfigs);
          break;

        case 'smart':
          generationResults = await generateSmartFields(selectedFieldConfigs);
          break;
      }

      setResults(generationResults);
      setGenerationProgress(100);
      
      // Calculate overall quality rating
      const overallQuality = generationResults.reduce((sum, result) => sum + result.quality, 0) / generationResults.length;
      const qualityRating: QualityRating = {
        overall: overallQuality,
        relevance: overallQuality * 0.9,
        completeness: overallQuality * 0.95,
        clarity: overallQuality * 0.85,
        accuracy: overallQuality * 0.8
      };
      
      setQualityRating(qualityRating);
      
      if (onGenerationComplete) {
        onGenerationComplete(generationResults);
      }
      
      if (onQualityRating) {
        onQualityRating(qualityRating);
      }

    } catch (error) {
      console.error('Generation error:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;

    try {
      const result = await generateSingleField(field);
      setResults(prev => prev.map(r => r.fieldId === fieldId ? result : r));
    } catch (error) {
      console.error('Regeneration error:', error);
      setError('Failed to regenerate content');
    }
  };

  const handleQualityFeedback = (rating: Partial<QualityRating>) => {
    setQualityRating(prev => prev ? { ...prev, ...rating } : null);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Universal AI Generator
          <Badge variant="secondary">{module}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <Label>Select Fields to Generate</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFields.map(field => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onChange={(e) => handleFieldSelection(field.id, e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={field.id} className="text-sm">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Generation Mode</Label>
              <Select value={generationMode} onValueChange={(value: 'single' | 'batch' | 'smart') => setGenerationMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Field</SelectItem>
                  <SelectItem value="batch">Batch Generation</SelectItem>
                  <SelectItem value="smart">Smart Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="context" className="space-y-4">
            <div className="space-y-3">
              <Label>Additional Context</Label>
              <Textarea
                placeholder="Provide additional context to improve generation quality..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-3">
              <Label>Select Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.quality}/5)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || selectedFields.length === 0}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={() => setSelectedFields([])}>
            Clear Selection
          </Button>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <Label>Generation Progress</Label>
            <Progress value={generationProgress} className="w-full" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <Label>Generated Results</Label>
            </div>
            
            {results.map((result, index) => (
              <div key={result.fieldId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{result.fieldName}</Label>
                    <Badge variant="outline">Quality: {result.quality}/5</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate(result.fieldId)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                <Textarea
                  value={result.content}
                  readOnly
                  rows={4}
                  className="font-mono text-sm"
                />
                
                <div className="text-xs text-muted-foreground">
                  Generated at: {new Date(result.timestamp).toLocaleString()}
                  {result.templateUsed && ` | Template: ${result.templateUsed}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {qualityRating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <Label>Quality Assessment</Label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(qualityRating).map(([key, value]) => {
                if (key === 'feedback') return null;
                return (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold">{value.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalAIGenerator;
