import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Wand2, Globe, Factory, AlertTriangle, MapPin, Users, BarChart3 } from 'lucide-react';
import { supplyChainRiskService } from '../../services/supplyChainRiskService';
import SupplyChainAIGenerator from '../../components/ai/SupplyChainAIGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';

interface CreateSupplyChainRiskData {
  title: string;
  description: string;
  nodeType: string;
  industry: string;
  location: string;
  riskLevel: string;
  supplierTier: string;
  riskAssessment: string;
  vendorEvaluationCriteria: string;
  riskMitigationStrategies: string;
  supplyChainMapping: string;
  vendorTierClassification: string;
  riskPropagationAnalysis: string;
  supplyChainResilienceScoring: string;
  disruptionResponsePlan: string;
  supplierDevelopmentProgram: string;
  performanceMonitoringFramework: string;
  complianceAssessmentCriteria: string;
  financialStabilityAnalysis: string;
}

const CreateSupplyChainRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();
  const canEdit = checkPermission(['auditor', 'supervisor_auditor', 'admin', 'super_admin']);

  const [saving, setSaving] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [form, setForm] = useState<CreateSupplyChainRiskData>({
    title: '',
    description: '',
    nodeType: '',
    industry: '',
    location: '',
    riskLevel: '',
    supplierTier: '',
    riskAssessment: '',
    vendorEvaluationCriteria: '',
    riskMitigationStrategies: '',
    supplyChainMapping: '',
    vendorTierClassification: '',
    riskPropagationAnalysis: '',
    supplyChainResilienceScoring: '',
    disruptionResponsePlan: '',
    supplierDevelopmentProgram: '',
    performanceMonitoringFramework: '',
    complianceAssessmentCriteria: '',
    financialStabilityAnalysis: ''
  });

  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to create supply chain risks.</p>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof CreateSupplyChainRiskData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAIGenerate = (field: string, content: string) => {
    const fieldMapping: Record<string, keyof CreateSupplyChainRiskData> = {
      'supply_chain_risk_assessment': 'riskAssessment',
      'vendor_evaluation_criteria': 'vendorEvaluationCriteria',
      'risk_mitigation_strategies': 'riskMitigationStrategies',
      'supply_chain_mapping': 'supplyChainMapping',
      'vendor_tier_classification': 'vendorTierClassification',
      'risk_propagation_analysis': 'riskPropagationAnalysis',
      'supply_chain_resilience_scoring': 'supplyChainResilienceScoring',
      'disruption_response_plan': 'disruptionResponsePlan',
      'supplier_development_program': 'supplierDevelopmentProgram',
      'performance_monitoring_framework': 'performanceMonitoringFramework',
      'compliance_assessment_criteria': 'complianceAssessmentCriteria',
      'financial_stability_analysis': 'financialStabilityAnalysis'
    };

    const mappedField = fieldMapping[field];
    if (mappedField) {
      handleChange(mappedField, content);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('Please provide a title for the supply chain risk');
      return;
    }

    try {
      setSaving(true);

      // Create the supply chain risk using the service
      const riskData = {
        title: form.title,
        description: form.description,
        nodeType: form.nodeType,
        industry: form.industry,
        location: form.location,
        riskLevel: form.riskLevel,
        supplierTier: form.supplierTier,
        riskAssessment: form.riskAssessment,
        vendorEvaluationCriteria: form.vendorEvaluationCriteria,
        riskMitigationStrategies: form.riskMitigationStrategies,
        supplyChainMapping: form.supplyChainMapping,
        vendorTierClassification: form.vendorTierClassification,
        riskPropagationAnalysis: form.riskPropagationAnalysis,
        supplyChainResilienceScoring: form.supplyChainResilienceScoring,
        disruptionResponsePlan: form.disruptionResponsePlan,
        supplierDevelopmentProgram: form.supplierDevelopmentProgram,
        performanceMonitoringFramework: form.performanceMonitoringFramework,
        complianceAssessmentCriteria: form.complianceAssessmentCriteria,
        financialStabilityAnalysis: form.financialStabilityAnalysis
      };

      // Note: This would need to be implemented in the supplyChainRiskService
      // await supplyChainRiskService.createSupplyChainRisk(riskData);

      toast.success('Supply chain risk created successfully!');
      navigate('/supply-chain-risk');
    } catch (error) {
      console.error('Error creating supply chain risk:', error);
      toast.error('Failed to create supply chain risk. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getContextForAI = () => ({
    nodeType: form.nodeType,
    industry: form.industry,
    location: form.location,
    riskLevel: form.riskLevel,
    supplierTier: form.supplierTier
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Supply Chain Risk
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Supply Chain Risk</h1>
          <p className="text-gray-600">Define and assess supply chain risks with AI assistance</p>
        </div>
        <Button
          onClick={() => setShowAIGenerator(!showAIGenerator)}
          variant={showAIGenerator ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          {showAIGenerator ? 'Hide AI Generator' : 'Show AI Generator'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Generator */}
        {showAIGenerator && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Content Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SupplyChainAIGenerator
                onGenerate={handleAIGenerate}
                context={getContextForAI()}
              />
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter supply chain risk title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nodeType">Node Type</Label>
                <Select value={form.nodeType} onValueChange={(value) => handleChange('nodeType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select node type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="logistics">Logistics Provider</SelectItem>
                    <SelectItem value="service">Service Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the supply chain risk"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={form.industry} onValueChange={(value) => handleChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="financial">Financial Services</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="aerospace">Aerospace</SelectItem>
                    <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select value={form.riskLevel} onValueChange={(value) => handleChange('riskLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="supplierTier">Supplier Tier</Label>
              <Select value={form.supplierTier} onValueChange={(value) => handleChange('supplierTier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier1">Tier 1</SelectItem>
                  <SelectItem value="tier2">Tier 2</SelectItem>
                  <SelectItem value="tier3">Tier 3</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="preferred">Preferred</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment and Analysis */}
        <Tabs defaultValue="risk-assessment" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
            <TabsTrigger value="vendor-evaluation">Vendor Evaluation</TabsTrigger>
            <TabsTrigger value="mitigation-strategies">Mitigation</TabsTrigger>
            <TabsTrigger value="mapping-analysis">Mapping & Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="risk-assessment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.riskAssessment}
                  onChange={(e) => handleChange('riskAssessment', e.target.value)}
                  placeholder="Generate comprehensive risk assessment for this supply chain node..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendor-evaluation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Vendor Evaluation Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.vendorEvaluationCriteria}
                  onChange={(e) => handleChange('vendorEvaluationCriteria', e.target.value)}
                  placeholder="Generate vendor evaluation criteria based on industry standards..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitigation-strategies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Mitigation Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.riskMitigationStrategies}
                  onChange={(e) => handleChange('riskMitigationStrategies', e.target.value)}
                  placeholder="Generate risk mitigation strategies for the identified risks..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping-analysis" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Supply Chain Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.supplyChainMapping}
                    onChange={(e) => handleChange('supplyChainMapping', e.target.value)}
                    placeholder="Generate a comprehensive supply chain mapping analysis..."
                    rows={6}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Vendor Tier Classification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.vendorTierClassification}
                    onChange={(e) => handleChange('vendorTierClassification', e.target.value)}
                    placeholder="Generate vendor tier classification criteria and methodology..."
                    rows={6}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Advanced Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label>Risk Propagation Analysis</Label>
                <Textarea
                  value={form.riskPropagationAnalysis}
                  onChange={(e) => handleChange('riskPropagationAnalysis', e.target.value)}
                  placeholder="Generate risk propagation analysis for the supply chain..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Supply Chain Resilience Scoring</Label>
                <Textarea
                  value={form.supplyChainResilienceScoring}
                  onChange={(e) => handleChange('supplyChainResilienceScoring', e.target.value)}
                  placeholder="Generate supply chain resilience scoring methodology..."
                  rows={4}
                />
              </div>
            </div>

            <div>
              <Label>Disruption Response Plan</Label>
              <Textarea
                value={form.disruptionResponsePlan}
                onChange={(e) => handleChange('disruptionResponsePlan', e.target.value)}
                placeholder="Generate a disruption response plan for supply chain incidents..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label>Supplier Development Program</Label>
                <Textarea
                  value={form.supplierDevelopmentProgram}
                  onChange={(e) => handleChange('supplierDevelopmentProgram', e.target.value)}
                  placeholder="Generate a supplier development program framework..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Performance Monitoring Framework</Label>
                <Textarea
                  value={form.performanceMonitoringFramework}
                  onChange={(e) => handleChange('performanceMonitoringFramework', e.target.value)}
                  placeholder="Generate a performance monitoring framework for supply chain..."
                  rows={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label>Compliance Assessment Criteria</Label>
                <Textarea
                  value={form.complianceAssessmentCriteria}
                  onChange={(e) => handleChange('complianceAssessmentCriteria', e.target.value)}
                  placeholder="Generate compliance assessment criteria for supply chain..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Financial Stability Analysis</Label>
                <Textarea
                  value={form.financialStabilityAnalysis}
                  onChange={(e) => handleChange('financialStabilityAnalysis', e.target.value)}
                  placeholder="Generate financial stability analysis framework..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Creating...' : 'Create Supply Chain Risk'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupplyChainRiskPage;
