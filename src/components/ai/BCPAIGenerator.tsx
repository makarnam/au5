import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Wand2,
  Loader2,
  CheckCircle,
  Settings,
  RefreshCw,
  Copy,
  X,
  AlertTriangle,
  Wrench,
  BookOpen,
  Shield,
  Users,
  Target,
  FileCheck,
  Clock,
  AlertCircle,
  Building,
  Zap,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  aiService,
  AIProvider,
  AIConfiguration,
  AIGenerationRequest,
} from "../../services/aiService";
import AIConfigurationComponent from "./AIConfiguration";
import OllamaDiagnostic from "./OllamaDiagnostic";

interface BCPAIGeneratorProps {
  fieldType: 
    | "bcp_plan"
    | "bcp_description"
    | "bcp_scope"
    | "bcp_business_impact_analysis"
    | "bcp_risk_assessment"
    | "bcp_recovery_strategies"
    | "bcp_resource_requirements"
    | "bcp_communication_plan"
    | "bcp_testing_schedule"
    | "bcp_maintenance_schedule"
    | "bcp_critical_function_description"
    | "bcp_recovery_strategy"
    | "bcp_testing_scenario";
  bcpData: {
    name?: string;
    description?: string;
    plan_type?: string;
    scope?: string;
    business_unit?: string;
    global_region?: string;
    criticality_level?: string;
    stakeholders?: string[];
    regulatory_compliance?: string[];
    business_impact_analysis?: string;
    risk_assessment?: string;
    recovery_strategies?: string;
    resource_requirements?: string;
    communication_plan?: string;
    testing_schedule?: string;
    maintenance_schedule?: string;
    budget_estimate?: number;
  };
  onGenerated: (content: string | string[]) => void;
  currentValue?: string | string[];
  className?: string;
  disabled?: boolean;
}

const bcpFieldTypes = [
  { value: "bcp_plan", label: "BCP Plan Content", icon: "📋" },
  { value: "bcp_description", label: "BCP Description", icon: "📝" },
  { value: "bcp_scope", label: "BCP Scope", icon: "🎯" },
  { value: "bcp_business_impact_analysis", label: "Business Impact Analysis", icon: "📊" },
  { value: "bcp_risk_assessment", label: "Risk Assessment", icon: "⚠️" },
  { value: "bcp_recovery_strategies", label: "Recovery Strategies", icon: "🔄" },
  { value: "bcp_resource_requirements", label: "Resource Requirements", icon: "💼" },
  { value: "bcp_communication_plan", label: "Communication Plan", icon: "📞" },
  { value: "bcp_testing_schedule", label: "Testing Schedule", icon: "🧪" },
  { value: "bcp_maintenance_schedule", label: "Maintenance Schedule", icon: "🔧" },
  { value: "bcp_critical_function_description", label: "Critical Function Description", icon: "⚡" },
  { value: "bcp_recovery_strategy", label: "Recovery Strategy", icon: "🚀" },
  { value: "bcp_testing_scenario", label: "Testing Scenario", icon: "🎭" },
];

const planTypes = [
  "Business Continuity",
  "IT Continuity",
  "Disaster Recovery",
  "Crisis Management",
  "Emergency Response",
  "Incident Management",
];

const businessUnits = [
  "IT",
  "Operations",
  "Finance",
  "Human Resources",
  "Marketing",
  "Sales",
  "Customer Service",
  "Legal",
  "Compliance",
  "Facilities",
  "Supply Chain",
  "Other",
];

const criticalityLevels = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const regulatoryFrameworks = [
  "ISO 22301",
  "ISO 27031",
  "NIST Cybersecurity Framework",
  "COBIT",
  "ITIL",
  "SOX",
  "GDPR",
  "HIPAA",
  "PCI DSS",
  "SOC 2",
  "Custom",
];

export default function BCPAIGenerator({
  fieldType,
  bcpData,
  onGenerated,
  currentValue,
  className = "",
  disabled = false,
}: BCPAIGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [selectedFieldType, setSelectedFieldType] = useState(fieldType);
  const [context, setContext] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [error, setError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load providers and configurations on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providersData = await aiService.getProviders();
        setProviders(providersData);
        
        if (providersData.length > 0) {
          setSelectedProvider(providersData[0].id);
          setSelectedModel(providersData[0].defaultModel);
        }
      } catch (err) {
        console.error("Failed to load providers:", err);
      }
    };

    const loadConfigurations = async () => {
      try {
        const configs = await aiService.getConfigurations();
        setConfigurations(configs);
        
        const activeConfig = configs.find(config => config.is_active);
        if (activeConfig) {
          setSelectedProvider(activeConfig.provider);
          setSelectedModel(activeConfig.model_name);
          setTemperature(activeConfig.temperature);
          setMaxTokens(activeConfig.max_tokens);
        }
      } catch (err) {
        console.error("Failed to load configurations:", err);
      }
    };

    loadProviders();
    loadConfigurations();
  }, []);

  const generateContent = useCallback(async () => {
    if (!selectedProvider || !selectedModel) {
      toast.error("Please select an AI provider and model");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build context from BCP data
      const contextParts = [];
      if (bcpData.name) contextParts.push(`Plan Name: ${bcpData.name}`);
      if (bcpData.plan_type) contextParts.push(`Plan Type: ${bcpData.plan_type}`);
      if (bcpData.business_unit) contextParts.push(`Business Unit: ${bcpData.business_unit}`);
      if (bcpData.global_region) contextParts.push(`Region: ${bcpData.global_region}`);
      if (bcpData.criticality_level) contextParts.push(`Criticality: ${bcpData.criticality_level}`);
      if (bcpData.stakeholders?.length) contextParts.push(`Stakeholders: ${bcpData.stakeholders.join(", ")}`);
      if (bcpData.regulatory_compliance?.length) contextParts.push(`Compliance: ${bcpData.regulatory_compliance.join(", ")}`);
      if (bcpData.budget_estimate) contextParts.push(`Budget: $${bcpData.budget_estimate.toLocaleString()}`);
      if (context) contextParts.push(`Additional Context: ${context}`);

      const fullContext = contextParts.join("\n");

      const request: AIGenerationRequest = {
        provider: selectedProvider,
        model: selectedModel,
        prompt: "",
        context: fullContext,
        fieldType: selectedFieldType as any,
        auditData: {
          title: bcpData.name || "Business Continuity Plan",
          audit_type: bcpData.plan_type || "business_continuity",
          business_unit: bcpData.business_unit || "General",
          scope: bcpData.scope || "Enterprise-wide",
        },
      };

      const result = await aiService.generateContent(request);
      
      if (typeof result === "string") {
        setGeneratedContent(result);
        setGenerationHistory(prev => [result, ...prev.slice(0, 4)]);
        toast.success("BCP content generated successfully!");
      } else {
        setGeneratedContent(result.join("\n\n"));
        setGenerationHistory(prev => [result.join("\n\n"), ...prev.slice(0, 4)]);
        toast.success("BCP content generated successfully!");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate content");
      toast.error("Failed to generate BCP content");
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedProvider,
    selectedModel,
    selectedFieldType,
    bcpData,
    context,
    temperature,
    maxTokens,
  ]);

  const handleApply = () => {
    if (generatedContent) {
      onGenerated(generatedContent);
      setIsOpen(false);
      toast.success("BCP content applied successfully!");
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
    generateContent();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success("Content copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy content");
    }
  };

  const getFieldIcon = (fieldType: string) => {
    const field = bcpFieldTypes.find(f => f.value === fieldType);
    return field?.icon || "📋";
  };

  const getFieldLabel = (fieldType: string) => {
    const field = bcpFieldTypes.find(f => f.value === fieldType);
    return field?.label || "BCP Content";
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Wand2 className="w-4 h-4" />
        Generate BCP Content
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      BCP AI Generator
                    </h2>
                    <p className="text-sm text-gray-600">
                      Generate comprehensive business continuity plan content
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex h-[calc(90vh-120px)]">
                {/* Left Panel - Configuration */}
                <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Field Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <select
                        value={selectedFieldType}
                        onChange={(e) => setSelectedFieldType(e.target.value as any)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {bcpFieldTypes.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.icon} {field.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Context Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Context
                      </label>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={4}
                        placeholder="Provide additional context or specific requirements for the BCP content..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* BCP Data Summary */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BCP Plan Information
                      </label>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                        {bcpData.name && (
                          <div><strong>Name:</strong> {bcpData.name}</div>
                        )}
                        {bcpData.plan_type && (
                          <div><strong>Type:</strong> {bcpData.plan_type}</div>
                        )}
                        {bcpData.business_unit && (
                          <div><strong>Business Unit:</strong> {bcpData.business_unit}</div>
                        )}
                        {bcpData.criticality_level && (
                          <div><strong>Criticality:</strong> {bcpData.criticality_level}</div>
                        )}
                        {bcpData.stakeholders?.length && (
                          <div><strong>Stakeholders:</strong> {bcpData.stakeholders.length} selected</div>
                        )}
                        {bcpData.regulatory_compliance?.length && (
                          <div><strong>Compliance:</strong> {bcpData.regulatory_compliance.length} frameworks</div>
                        )}
                        {!bcpData.name && !bcpData.plan_type && (
                          <div className="text-gray-500 italic">No BCP data provided</div>
                        )}
                      </div>
                    </div>

                    {/* AI Configuration */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          AI Configuration
                        </label>
                        <button
                          onClick={() => setShowConfig(!showConfig)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {showConfig ? "Hide" : "Configure"}
                        </button>
                      </div>
                      
                      {showConfig && (
                        <AIConfigurationComponent
                          providers={providers}
                          configurations={configurations}
                          selectedProvider={selectedProvider}
                          selectedModel={selectedModel}
                          temperature={temperature}
                          maxTokens={maxTokens}
                          onProviderChange={setSelectedProvider}
                          onModelChange={setSelectedModel}
                          onTemperatureChange={setTemperature}
                          onMaxTokensChange={setMaxTokens}
                        />
                      )}
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={generateContent}
                      disabled={isGenerating || !selectedProvider || !selectedModel}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate BCP Content
                        </>
                      )}
                    </button>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Error</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Generated Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Content Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFieldIcon(selectedFieldType)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getFieldLabel(selectedFieldType)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {generatedContent && (
                          <>
                            <button
                              onClick={copyToClipboard}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleRegenerate}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                              title="Regenerate content"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Generated Content */}
                    {generatedContent ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                              {generatedContent}
                            </pre>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleApply}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Apply to Form
                          </button>
                          <button
                            onClick={handleRegenerate}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="p-4 bg-blue-100 rounded-full mb-4">
                          <Wand2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Ready to Generate BCP Content
                        </h3>
                        <p className="text-sm text-gray-600 max-w-md">
                          Configure your settings and click "Generate BCP Content" to create comprehensive business continuity plan content.
                        </p>
                      </div>
                    )}

                    {/* Generation History */}
                    {generationHistory.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Recent Generations
                          </h4>
                          <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            {showHistory ? "Hide" : "Show"}
                          </button>
                        </div>
                        
                        {showHistory && (
                          <div className="space-y-2">
                            {generationHistory.map((content, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setGeneratedContent(content)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500">
                                    Generation {index + 1}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {content.length} characters
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {content.substring(0, 100)}...
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
