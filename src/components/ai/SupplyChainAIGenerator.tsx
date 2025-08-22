import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Wand2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Factory, 
  Truck, 
  Globe, 
  Shield,
  TrendingUp,
  MapPin,
  Users,
  FileText,
  BarChart3,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiService } from '../../services/aiService';

interface SupplyChainAIGeneratorProps {
  onGenerate: (field: string, content: string) => void;
  context?: {
    nodeType?: string;
    industry?: string;
    location?: string;
    riskLevel?: string;
    supplierTier?: string;
  };
}

const SupplyChainAIGenerator: React.FC<SupplyChainAIGeneratorProps> = ({ 
  onGenerate, 
  context = {} 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedField, setSelectedField] = useState<string>('');

  const fieldTypes = [
    {
      id: 'supply_chain_risk_assessment',
      name: 'Supply Chain Risk Assessment',
      description: 'Comprehensive risk assessment for supply chain nodes',
      icon: <AlertTriangle className="h-4 w-4" />,
      placeholder: 'Generate a comprehensive risk assessment for this supply chain node...'
    },
    {
      id: 'vendor_evaluation_criteria',
      name: 'Vendor Evaluation Criteria',
      description: 'Detailed evaluation criteria for vendor assessment',
      icon: <Factory className="h-4 w-4" />,
      placeholder: 'Generate vendor evaluation criteria based on industry standards...'
    },
    {
      id: 'risk_mitigation_strategies',
      name: 'Risk Mitigation Strategies',
      description: 'Strategic approaches to mitigate identified risks',
      icon: <Shield className="h-4 w-4" />,
      placeholder: 'Generate risk mitigation strategies for the identified risks...'
    },
    {
      id: 'supply_chain_mapping',
      name: 'Supply Chain Mapping',
      description: 'Detailed mapping of supply chain relationships and dependencies',
      icon: <MapPin className="h-4 w-4" />,
      placeholder: 'Generate a comprehensive supply chain mapping analysis...'
    },
    {
      id: 'vendor_tier_classification',
      name: 'Vendor Tier Classification',
      description: 'Classification criteria for vendor tiering system',
      icon: <Target className="h-4 w-4" />,
      placeholder: 'Generate vendor tier classification criteria and methodology...'
    },
    {
      id: 'risk_propagation_analysis',
      name: 'Risk Propagation Analysis',
      description: 'Analysis of how risks propagate through the supply chain',
      icon: <TrendingUp className="h-4 w-4" />,
      placeholder: 'Generate risk propagation analysis for the supply chain...'
    },
    {
      id: 'supply_chain_resilience_scoring',
      name: 'Supply Chain Resilience Scoring',
      description: 'Scoring methodology for supply chain resilience assessment',
      icon: <BarChart3 className="h-4 w-4" />,
      placeholder: 'Generate supply chain resilience scoring methodology...'
    },
    {
      id: 'disruption_response_plan',
      name: 'Disruption Response Plan',
      description: 'Comprehensive response plan for supply chain disruptions',
      icon: <Zap className="h-4 w-4" />,
      placeholder: 'Generate a disruption response plan for supply chain incidents...'
    },
    {
      id: 'supplier_development_program',
      name: 'Supplier Development Program',
      description: 'Program for developing and improving supplier capabilities',
      icon: <Users className="h-4 w-4" />,
      placeholder: 'Generate a supplier development program framework...'
    },
    {
      id: 'performance_monitoring_framework',
      name: 'Performance Monitoring Framework',
      description: 'Framework for monitoring supplier and supply chain performance',
      icon: <RefreshCw className="h-4 w-4" />,
      placeholder: 'Generate a performance monitoring framework for supply chain...'
    },
    {
      id: 'compliance_assessment_criteria',
      name: 'Compliance Assessment Criteria',
      description: 'Criteria for assessing regulatory and industry compliance',
      icon: <FileText className="h-4 w-4" />,
      placeholder: 'Generate compliance assessment criteria for supply chain...'
    },
    {
      id: 'financial_stability_analysis',
      name: 'Financial Stability Analysis',
      description: 'Analysis framework for supplier financial stability',
      icon: <TrendingUp className="h-4 w-4" />,
      placeholder: 'Generate financial stability analysis framework...'
    }
  ];

  const generateContent = async (fieldType: string, customContext?: string) => {
    try {
      setLoading(fieldType);
      setSelectedField(fieldType);

      const contextInfo = {
        ...context,
        customContext: customContext || ''
      };

      const result = await aiService.generateContent({
        fieldType,
        context: contextInfo,
        customPrompt: customPrompt || undefined
      });

      setGeneratedContent(prev => ({
        ...prev,
        [fieldType]: result.content
      }));

      toast.success(`${fieldTypes.find(f => f.id === fieldType)?.name} generated successfully!`);
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const applyContent = (fieldType: string, content: string) => {
    onGenerate(fieldType, content);
    toast.success('Content applied to form!');
  };

  const getContextDisplay = () => {
    const contextItems = [];
    if (context.nodeType) contextItems.push(`Node Type: ${context.nodeType}`);
    if (context.industry) contextItems.push(`Industry: ${context.industry}`);
    if (context.location) contextItems.push(`Location: ${context.location}`);
    if (context.riskLevel) contextItems.push(`Risk Level: ${context.riskLevel}`);
    if (context.supplierTier) contextItems.push(`Supplier Tier: ${context.supplierTier}`);
    
    return contextItems.length > 0 ? contextItems.join(' • ') : 'No context provided';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supply Chain AI Generator</h2>
          <p className="text-gray-600">Generate comprehensive supply chain risk management content</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Supply Chain Risk
        </Badge>
      </div>

      {/* Context Information */}
      {Object.keys(context).length > 0 && (
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Context:</strong> {getContextDisplay()}
          </AlertDescription>
        </Alert>
      )}

      {/* Custom Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Custom Prompt (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add custom instructions or context for AI generation..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
          />
          <p className="text-sm text-gray-500 mt-2">
            This prompt will be combined with the field-specific templates for enhanced generation.
          </p>
        </CardContent>
      </Card>

      {/* Field Types Grid */}
      <Tabs defaultValue="risk-assessment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="vendor-evaluation">Vendor Evaluation</TabsTrigger>
          <TabsTrigger value="mitigation-strategies">Mitigation</TabsTrigger>
          <TabsTrigger value="mapping-analysis">Mapping & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="risk-assessment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldTypes.slice(0, 3).map((field) => (
              <Card key={field.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {field.icon}
                    {field.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{field.description}</p>
                  <Button
                    onClick={() => generateContent(field.id)}
                    disabled={loading === field.id}
                    className="w-full"
                    size="sm"
                  >
                    {loading === field.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate {field.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vendor-evaluation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldTypes.slice(3, 6).map((field) => (
              <Card key={field.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {field.icon}
                    {field.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{field.description}</p>
                  <Button
                    onClick={() => generateContent(field.id)}
                    disabled={loading === field.id}
                    className="w-full"
                    size="sm"
                  >
                    {loading === field.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate {field.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mitigation-strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldTypes.slice(6, 9).map((field) => (
              <Card key={field.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {field.icon}
                    {field.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{field.description}</p>
                  <Button
                    onClick={() => generateContent(field.id)}
                    disabled={loading === field.id}
                    className="w-full"
                    size="sm"
                  >
                    {loading === field.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate {field.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mapping-analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldTypes.slice(9, 12).map((field) => (
              <Card key={field.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {field.icon}
                    {field.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{field.description}</p>
                  <Button
                    onClick={() => generateContent(field.id)}
                    disabled={loading === field.id}
                    className="w-full"
                    size="sm"
                  >
                    {loading === field.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate {field.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generated Content Display */}
      {selectedField && generatedContent[selectedField] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generated Content
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent[selectedField])}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => applyContent(selectedField, generatedContent[selectedField])}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply to Form
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {generatedContent[selectedField]}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => generateContent('supply_chain_risk_assessment')}
              disabled={loading !== null}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Quick Risk Assessment</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => generateContent('vendor_evaluation_criteria')}
              disabled={loading !== null}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Factory className="h-6 w-6" />
              <span>Vendor Criteria</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => generateContent('risk_mitigation_strategies')}
              disabled={loading !== null}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Shield className="h-6 w-6" />
              <span>Mitigation Strategies</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplyChainAIGenerator;
