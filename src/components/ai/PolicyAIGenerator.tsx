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

interface PolicyAIGeneratorProps {
  fieldType: 
    | "policy_title"
    | "policy_description" 
    | "policy_content"
    | "policy_scope"
    | "policy_version_summary"
    | "compliance_mapping"
    | "policy_template";
  policyData: {
    name?: string;
    description?: string;
    content?: string;
    scope?: string;
    industry?: string;
    framework?: string;
    compliance_requirements?: string[];
    target_audience?: string[];
    previous_version?: string;
  };
  onGenerated: (content: string | string[]) => void;
  currentValue?: string | string[];
  className?: string;
  disabled?: boolean;
}

const policyFieldTypes = [
  { value: "policy_title", label: "Policy Title", icon: "📋" },
  { value: "policy_description", label: "Policy Description", icon: "📝" },
  { value: "policy_content", label: "Policy Content", icon: "📄" },
  { value: "policy_scope", label: "Policy Scope", icon: "🎯" },
  { value: "policy_version_summary", label: "Version Change Summary", icon: "📊" },
  { value: "compliance_mapping", label: "Compliance Mapping", icon: "⚖️" },
  { value: "policy_template", label: "Policy Template", icon: "📚" },
];

const industries = [
  "Financial Services",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Retail",
  "Government",
  "Education",
  "Energy",
  "Other",
];

const frameworks = [
  "ISO 27001",
  "SOX",
  "GDPR",
  "NIST",
  "COBIT",
  "COSO",
  "ISO 9001",
  "PCI DSS",
  "HIPAA",
  "SOC 2",
  "Custom",
];

export default function PolicyAIGenerator({
  fieldType,
  policyData,
  onGenerated,
  currentValue,
  className = "",
  disabled = false,
}: PolicyAIGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<AIConfiguration | null>(
    null,
  );
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [context, setContext] = useState("");
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [lastError, setLastError] = useState<string>("");

  // Policy-specific configuration
  const [policyConfig, setPolicyConfig] = useState({
    industry: policyData.industry || "Technology",
    framework: policyData.framework || "ISO 27001",
    compliance_requirements: policyData.compliance_requirements || [],
    target_audience: policyData.target_audience || ["All Employees"],
    tone: "Professional",
    length: "Standard",
  });

  const loadConfigurations = useCallback(async () => {
    try {
      const configs = await aiService.getConfigurations();
      setConfigurations(configs);
      if (configs.length > 0 && !selectedConfig) {
        setSelectedConfig(configs[0]);
      }
    } catch (error) {
      console.error("Error loading configurations:", error);
    }
  }, [selectedConfig]);

  useEffect(() => {
    loadConfigurations();
    setProviders(aiService.getProviders());
  }, [loadConfigurations]);

  const getFieldDisplayName = (field: string) => {
    const fieldType = policyFieldTypes.find(f => f.value === field);
    return fieldType ? fieldType.label : "Policy Content";
  };

  const getFieldIcon = (field: string) => {
    const fieldType = policyFieldTypes.find(f => f.value === field);
    return fieldType ? fieldType.icon : "📋";
  };

  const buildPolicyPrompt = (): string => {
    const baseContext = `
Policy Name: ${policyData.name || "New Policy"}
Current Description: ${policyData.description || "None"}
Current Content: ${policyData.content || "None"}
Current Scope: ${policyData.scope || "None"}
Industry: ${policyConfig.industry}
Framework: ${policyConfig.framework}
Compliance Requirements: ${policyConfig.compliance_requirements.join(", ") || "None"}
Target Audience: ${policyConfig.target_audience.join(", ")}
Tone: ${policyConfig.tone}
Length: ${policyConfig.length}
`;

    const fieldSpecificPrompts = {
      policy_title: `Generate a clear, professional policy title for a ${policyConfig.industry} organization following ${policyConfig.framework} standards. The title should be concise and descriptive.`,
      policy_description: `Generate a comprehensive policy description that explains the purpose, scope, and key objectives of this policy. Consider the ${policyConfig.industry} industry context and ${policyConfig.framework} requirements.`,
      policy_content: `Generate complete policy content including sections for purpose, scope, definitions, policy statements, roles and responsibilities, compliance requirements, and enforcement. Follow ${policyConfig.framework} standards and ${policyConfig.industry} best practices.`,
      policy_scope: `Define the scope of this policy, including what it covers, who it applies to, and any exclusions. Consider the target audience: ${policyConfig.target_audience.join(", ")}.`,
      policy_version_summary: `Generate a summary of changes between the current version and the previous version. Previous version content: ${policyData.previous_version || "No previous version"}`,
      compliance_mapping: `Map this policy to relevant compliance frameworks and regulations. Include specific requirements from ${policyConfig.framework} and any other applicable standards for ${policyConfig.industry}.`,
      policy_template: `Create a policy template structure that can be used as a starting point for similar policies in ${policyConfig.industry} organizations following ${policyConfig.framework} standards.`,
    };

    return `${baseContext}\n\n${fieldSpecificPrompts[fieldType] || fieldSpecificPrompts.policy_content}`;
  };

  const handleGenerate = async () => {
    if (!selectedConfig) {
      toast.error("Please configure AI settings first");
      setShowConfiguration(true);
      return;
    }

    try {
      setIsGenerating(true);
      setLastError("");

      const prompt = buildPolicyPrompt();

      const request: AIGenerationRequest = {
        field_type: fieldType,
        context: context || prompt,
        audit_data: {
          title: policyData.name || "Policy Generation",
          audit_type: "Policy Management",
          business_unit: policyConfig.industry,
          scope: policyData.scope || "Policy Content Generation",
        },
        provider: selectedConfig.provider,
        model: selectedConfig.model,
        temperature: 0.7,
        max_tokens: 2000,
        api_key: selectedConfig.apiKey,
        base_url: selectedConfig.baseUrl,
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        setGeneratedContent(response.content as string);
        toast.success(`${getFieldDisplayName(fieldType)} generated successfully!`);
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating policy content:", error);
      setLastError(error instanceof Error ? error.message : "Generation failed");
      toast.error("Failed to generate policy content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGenerated = () => {
    if (generatedContent) {
      onGenerated(generatedContent);
      setIsOpen(false);
      setGeneratedContent("");
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success("Content copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
    handleGenerate();
  };

  return (
    <div className={`policy-ai-generator ${className}`}>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 size={16} />
        <span>Generate {getFieldDisplayName(fieldType)}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFieldIcon(fieldType)}</div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      Generate {getFieldDisplayName(fieldType)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      AI-powered policy content generation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex h-[calc(90vh-120px)]">
                {/* Configuration Panel */}
                <div className="w-1/3 border-r p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* AI Configuration */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">AI Configuration</h3>
                        <button
                          onClick={() => setShowConfiguration(!showConfiguration)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                      
                      {showConfiguration ? (
                        <AIConfigurationComponent
                          configurations={configurations}
                          selectedConfig={selectedConfig}
                          onConfigSelect={setSelectedConfig}
                          onConfigUpdate={loadConfigurations}
                        />
                      ) : (
                        <div className="text-sm text-gray-600">
                          {selectedConfig ? (
                            <div className="space-y-1">
                              <div>Provider: {selectedConfig.provider}</div>
                              <div>Model: {selectedConfig.model}</div>
                            </div>
                          ) : (
                            "No configuration selected"
                          )}
                        </div>
                      )}
                    </div>

                    {/* Policy Configuration */}
                    <div>
                      <h3 className="font-medium mb-3">Policy Settings</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Industry
                          </label>
                          <select
                            value={policyConfig.industry}
                            onChange={(e) =>
                              setPolicyConfig({
                                ...policyConfig,
                                industry: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded text-sm"
                          >
                            {industries.map((industry) => (
                              <option key={industry} value={industry}>
                                {industry}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Framework
                          </label>
                          <select
                            value={policyConfig.framework}
                            onChange={(e) =>
                              setPolicyConfig({
                                ...policyConfig,
                                framework: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded text-sm"
                          >
                            {frameworks.map((framework) => (
                              <option key={framework} value={framework}>
                                {framework}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Tone
                          </label>
                          <select
                            value={policyConfig.tone}
                            onChange={(e) =>
                              setPolicyConfig({
                                ...policyConfig,
                                tone: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="Professional">Professional</option>
                            <option value="Formal">Formal</option>
                            <option value="Clear">Clear and Simple</option>
                            <option value="Authoritative">Authoritative</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Length
                          </label>
                          <select
                            value={policyConfig.length}
                            onChange={(e) =>
                              setPolicyConfig({
                                ...policyConfig,
                                length: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="Concise">Concise</option>
                            <option value="Standard">Standard</option>
                            <option value="Detailed">Detailed</option>
                            <option value="Comprehensive">Comprehensive</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Context */}
                    <div>
                      <h3 className="font-medium mb-3">Additional Context</h3>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Add any additional context or requirements..."
                        className="w-full p-2 border rounded text-sm h-24 resize-none"
                      />
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedConfig}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          Generate {getFieldDisplayName(fieldType)}
                        </>
                      )}
                    </button>

                    {/* Diagnostic */}
                    <div>
                      <button
                        onClick={() => setShowDiagnostic(!showDiagnostic)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Wrench size={14} />
                        AI Diagnostic
                      </button>
                      {showDiagnostic && (
                        <div className="mt-2">
                          <OllamaDiagnostic />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generated Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {lastError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle size={16} />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{lastError}</p>
                    </div>
                  )}

                  {generatedContent ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Generated Content</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyToClipboard}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Copy size={14} />
                            Copy
                          </button>
                          <button
                            onClick={handleRegenerate}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            <RefreshCw size={14} />
                            Regenerate
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border rounded-md p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {generatedContent}
                        </pre>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleUseGenerated}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={16} />
                          Use Generated Content
                        </button>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Click "Generate" to create {getFieldDisplayName(fieldType).toLowerCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
