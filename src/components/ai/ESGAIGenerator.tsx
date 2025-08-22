import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Wand2, 
  Leaf, 
  Users, 
  Shield, 
  Target, 
  TrendingUp, 
  Globe, 
  Building2,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { ESGProgramType, ESGCategory } from '../../types/esg';

interface ESGAIGeneratorProps {
  onGenerationComplete?: (field: string, content: string) => void;
  initialData?: {
    title?: string;
    program_type?: ESGProgramType;
    business_unit?: string;
    industry?: string;
    framework?: string;
  };
  className?: string;
}

interface GenerationField {
  id: string;
  label: string;
  description: string;
  fieldType: string;
  icon: React.ReactNode;
  placeholder: string;
}

const ESGAIGenerator: React.FC<ESGAIGeneratorProps> = ({
  onGenerationComplete,
  initialData = {},
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [generationStatus, setGenerationStatus] = useState<Record<string, 'idle' | 'generating' | 'success' | 'error'>>({});
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    program_type: initialData.program_type || 'integrated' as ESGProgramType,
    business_unit: initialData.business_unit || '',
    industry: initialData.industry || '',
    framework: initialData.framework || '',
    context: ''
  });

  const generationFields: GenerationField[] = [
    {
      id: 'esg_program',
      label: 'ESG Program Description',
      description: 'Comprehensive ESG program description with objectives and scope',
      fieldType: 'esg_program',
      icon: <Building2 className="h-4 w-4" />,
      placeholder: 'Generate ESG program description...'
    },
    {
      id: 'sustainability_goals',
      label: 'Sustainability Goals & Targets',
      description: 'Specific, measurable sustainability goals and targets',
      fieldType: 'esg_program',
      icon: <Target className="h-4 w-4" />,
      placeholder: 'Generate sustainability goals and targets...'
    },
    {
      id: 'carbon_analysis',
      label: 'Carbon Footprint Analysis',
      description: 'Carbon footprint assessment and reduction strategies',
      fieldType: 'esg_program',
      icon: <Leaf className="h-4 w-4" />,
      placeholder: 'Generate carbon footprint analysis...'
    },
    {
      id: 'stakeholder_engagement',
      label: 'Stakeholder Engagement Strategies',
      description: 'Comprehensive stakeholder engagement and communication strategies',
      fieldType: 'esg_program',
      icon: <Users className="h-4 w-4" />,
      placeholder: 'Generate stakeholder engagement strategies...'
    }
  ];

  const programTypeOptions = [
    { value: 'environmental', label: 'Environmental', icon: <Leaf className="h-4 w-4" /> },
    { value: 'social', label: 'Social', icon: <Users className="h-4 w-4" /> },
    { value: 'governance', label: 'Governance', icon: <Shield className="h-4 w-4" /> },
    { value: 'integrated', label: 'Integrated', icon: <Building2 className="h-4 w-4" /> }
  ];

  const industryOptions = [
    'Financial Services',
    'Healthcare',
    'Technology',
    'Manufacturing',
    'Retail',
    'Energy',
    'Transportation',
    'Real Estate',
    'Agriculture',
    'Other'
  ];

  const frameworkOptions = [
    'GRI (Global Reporting Initiative)',
    'SASB (Sustainability Accounting Standards Board)',
    'TCFD (Task Force on Climate-related Financial Disclosures)',
    'CDP (Carbon Disclosure Project)',
    'UN SDGs (Sustainable Development Goals)',
    'ISO 14001 (Environmental Management)',
    'ISO 26000 (Social Responsibility)',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = async (field: GenerationField) => {
    try {
      setGenerationStatus(prev => ({ ...prev, [field.id]: 'generating' }));
      setIsGenerating(true);

      const context = `ESG Program: ${formData.title}
Program Type: ${formData.program_type}
Business Unit: ${formData.business_unit}
Industry: ${formData.industry}
Framework: ${formData.framework}
Additional Context: ${formData.context}

Field Type: ${field.label}`;

      const response = await aiService.generateContent({
        provider: 'default',
        model: 'default',
        prompt: `Generate ${field.label.toLowerCase()} for an ESG program with the following specifications:
- Program Type: ${formData.program_type}
- Industry: ${formData.industry}
- Framework: ${formData.framework}
- Business Unit: ${formData.business_unit}

Focus on: ${field.description}`,
        context,
        fieldType: field.fieldType as any,
        auditData: {
          title: formData.title,
          audit_type: 'ESG Program',
          business_unit: formData.business_unit
        }
      });

      const content = response.content;
      setGeneratedContent(prev => ({ ...prev, [field.id]: content }));
      setGenerationStatus(prev => ({ ...prev, [field.id]: 'success' }));

      if (onGenerationComplete) {
        onGenerationComplete(field.id, content);
      }

    } catch (error) {
      console.error(`Error generating ${field.label}:`, error);
      setGenerationStatus(prev => ({ ...prev, [field.id]: 'error' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateContent = async (field: GenerationField) => {
    setGeneratedContent(prev => ({ ...prev, [field.id]: '' }));
    setGenerationStatus(prev => ({ ...prev, [field.id]: 'idle' }));
    await generateContent(field);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generating':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-green-600" />
            ESG AI Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive ESG program content using AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Program Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter ESG program title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program_type">Program Type</Label>
              <Select
                value={formData.program_type}
                onValueChange={(value) => handleInputChange('program_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program type" />
                </SelectTrigger>
                <SelectContent>
                  {programTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_unit">Business Unit</Label>
              <Input
                id="business_unit"
                value={formData.business_unit}
                onChange={(e) => handleInputChange('business_unit', e.target.value)}
                placeholder="Enter business unit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="framework">ESG Framework</Label>
              <Select
                value={formData.framework}
                onValueChange={(value) => handleInputChange('framework', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ESG framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map((framework) => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea
                id="context"
                value={formData.context}
                onChange={(e) => handleInputChange('context', e.target.value)}
                placeholder="Provide additional context, specific requirements, or focus areas..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generate Content</h3>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            ESG Focus
          </Badge>
        </div>

        {generationFields.map((field) => (
          <Card key={field.id} className={`transition-colors ${getStatusColor(generationStatus[field.id] || 'idle')}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {field.icon}
                  <div>
                    <CardTitle className="text-base">{field.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {field.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(generationStatus[field.id] || 'idle')}
                  {generationStatus[field.id] === 'success' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateContent(field)}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedContent[field.id] ? (
                <div className="space-y-2">
                  <Textarea
                    value={generatedContent[field.id]}
                    onChange={(e) => setGeneratedContent(prev => ({ 
                      ...prev, 
                      [field.id]: e.target.value 
                    }))}
                    placeholder={field.placeholder}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onGenerationComplete) {
                          onGenerationComplete(field.id, generatedContent[field.id]);
                        }
                      }}
                    >
                      Use This Content
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => generateContent(field)}
                  disabled={isGenerating || !formData.title}
                  className="w-full"
                >
                  {isGenerating && generationStatus[field.id] === 'generating' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate {field.label}
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                generationFields.forEach(field => {
                  if (!generatedContent[field.id]) {
                    generateContent(field);
                  }
                });
              }}
              disabled={isGenerating || !formData.title}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGeneratedContent({});
                setGenerationStatus({});
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGAIGenerator;
