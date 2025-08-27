import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Wand2,
  Loader2,
  CheckCircle,
  Settings,
  RefreshCw,
  Copy,
  X,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  aiService,
  AIProvider,
  AIConfiguration,
  AIGenerationRequest,
} from "../../services/aiService";
import { ReportSection } from "../../services/reportAIService";
import AIConfigurationComponent from "./AIConfiguration";
import OllamaDiagnostic from "./OllamaDiagnostic";

interface ReportAIGeneratorProps {
  section: ReportSection;
  reportData: {
    title?: string;
    entity_type?: string;
    entity_id?: string;
    regulatory_context?: any;
  };
  onGenerated: (content: string) => void;
  currentValue?: string;
  className?: string;
}

export default function ReportAIGenerator({
  section,
  reportData,
  onGenerated,
  currentValue,
  className = "",
}: ReportAIGeneratorProps) {
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

  const getSectionDisplayName = (sectionType: string) => {
    switch (sectionType) {
      case "text":
        return "Text Content";
      case "chart":
        return "Chart Data";
      case "table":
        return "Table Data";
      case "kpi":
        return "KPI Metrics";
      case "finding":
        return "Findings Summary";
      case "risk":
        return "Risk Assessment";
      case "control":
        return "Control Evaluation";
      default:
        return sectionType;
    }
  };

  const mapSectionTypeToFieldType = (sectionType: string): string => {
    switch (sectionType) {
      case "text":
        return "description";
      case "kpi":
        return "objectives";
      case "finding":
        return "finding_description";
      case "risk":
        return "risk_assessment";
      case "control":
        return "control_evaluation";
      case "chart":
        return "chart_data";
      case "table":
        return "table_data";
      default:
        return "description";
    }
  };

  const buildContext = () => {
    const contextParts = [];

    if (currentValue) {
      contextParts.push(`Current content: ${currentValue}`);
    }

    if (context.trim()) {
      contextParts.push(`Additional context: ${context}`);
    }

    // Add report context
    if (reportData.title) {
      contextParts.push(`Report Title: ${reportData.title}`);
    }
    if (reportData.entity_type) {
      contextParts.push(`Entity Type: ${reportData.entity_type}`);
    }
    if (reportData.regulatory_context) {
      contextParts.push(`Regulatory Context: ${JSON.stringify(reportData.regulatory_context)}`);
    }

    return contextParts.join("\n");
  };

  const handleGenerate = async () => {
    console.log("Starting AI generation for section:", section.name);
    console.log("Available configurations:", configurations);
    console.log("Selected config:", selectedConfig);

    if (!selectedConfig) {
      toast.error("Please select an AI configuration first");
      console.error("No AI configuration selected");
      return;
    }

    try {
      setIsGenerating(true);
      console.log("Building context...");

      const contextData = buildContext();
      console.log("Context built:", contextData);

      const request: AIGenerationRequest = {
        provider: selectedConfig.provider,
        model: selectedConfig.model_name,
        prompt: "", // Will be built by the service
        context: contextData,
        fieldType: mapSectionTypeToFieldType(section.type) as any,
        auditData: {
          title: reportData.title || section.name,
          audit_type: reportData.entity_type || 'general',
          business_unit: 'General',
          scope: context,
        },
        temperature: selectedConfig.temperature,
        maxTokens: selectedConfig.max_tokens,
        apiKey: selectedConfig.api_key,
        baseUrl: selectedConfig.api_endpoint,
      };

      console.log("AI Generation Request:", request);

      const response = await aiService.generateContent(request);
      console.log("AI Generation Response:", response);

      if (response.success) {
        const content = Array.isArray(response.content)
          ? response.content.join("\n")
          : response.content;

        console.log("Generated content:", content);
        setGeneratedContent(content);

        // Log the generation
        await aiService.logGeneration(request, response);

        toast.success(
          `${getSectionDisplayName(section.type)} generated successfully!`,
        );
      } else {
        console.error("AI generation failed:", response.error);
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setLastError(errorMessage);
      console.error("Error message:", errorMessage);

      // Show diagnostic button for Ollama errors
      if (
        selectedConfig?.provider === "ollama" &&
        errorMessage.includes("404")
      ) {
        toast.error(
          <div className="flex items-center justify-between">
            <span>Ollama connection failed</span>
            <button
              onClick={() => setShowDiagnostic(true)}
              className="ml-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Diagnose
            </button>
          </div>,
          { duration: 6000 },
        );
      } else {
        toast.error(`Failed to generate content: ${errorMessage}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    onGenerated(generatedContent);
    setIsOpen(false);
    setGeneratedContent("");
    setContext("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Content copied to clipboard");
  };

  const getProviderIcon = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    switch (provider?.type) {
      case "ollama":
        return <Brain className="w-4 h-4 text-blue-500" />;
      case "openai":
        return <Brain className="w-4 h-4 text-green-500" />;
      case "claude":
        return <Brain className="w-4 h-4 text-purple-500" />;
      case "gemini":
        return <Brain className="w-4 h-4 text-orange-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
        title={`Generate ${getSectionDisplayName(section.type)} with AI`}
        type="button"
      >
        <Wand2 className="w-4 h-4 mr-1" />
        AI Generate
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Wand2 className="w-6 h-6 text-purple-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Generate {getSectionDisplayName(section.type)}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Report Context */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Report Context
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Report Title:</strong> {reportData.title || "Not specified"}
                  </p>
                  <p>
                    <strong>Entity Type:</strong>{" "}
                    {reportData.entity_type || "General"}
                  </p>
                  <p>
                    <strong>Section Type:</strong>{" "}
                    {getSectionDisplayName(section.type)}
                  </p>
                  <p>
                    <strong>Section Name:</strong>{" "}
                    {section.name}
                  </p>
                </div>
              </div>

              {/* AI Configuration Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    AI Configuration
                  </label>
                  <div className="flex items-center space-x-3">
                    {configurations.length === 0 && (
                      <div className="text-xs text-red-600">
                        No active AI configuration found.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfiguration(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Settings className="w-4 h-4 inline mr-1" />
                      Manage
                    </button>
                  </div>
                </div>
                <select
                  value={selectedConfig?.id || ""}
                  onChange={(e) => {
                    const config = configurations.find(
                      (c) => c.id === e.target.value,
                    );
                    setSelectedConfig(config || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {configurations.map((config) => {
                    const provider = providers.find(
                      (p) => p.id === config.provider,
                    );
                    return (
                      <option key={config.id} value={config.id}>
                        {(provider?.name || config.provider)} - {config.model_name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Additional Context */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  placeholder={`Provide additional context for generating the ${section.type} content...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Current Value Display */}
              {currentValue && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Current Content:
                  </h4>
                  <div className="text-sm text-yellow-700 whitespace-pre-wrap">
                    {currentValue}
                  </div>
                </div>
              )}

              {/* Generated Content */}
              {generatedContent && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">
                      Generated Content:
                    </h4>
                    <button
                      onClick={handleCopy}
                      className="text-green-600 hover:text-green-700"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-green-700 whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedConfig}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      {getProviderIcon(selectedConfig?.provider || "")}
                      <span className="ml-2">Generate</span>
                    </>
                  )}
                </button>

                {generatedContent && (
                  <>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAccept}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  type="button"
                >
                  Close
                </button>
              </div>

              {/* Error Help */}
              {lastError &&
                selectedConfig?.provider === "ollama" &&
                lastError.includes("404") && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-900 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Ollama Connection Issue
                      </h4>
                      <button
                        onClick={() => setShowDiagnostic(true)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        Diagnose
                      </button>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      Cannot connect to Ollama. This usually means:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Ollama is not running (run "ollama serve")</li>
                      <li>
                        • Model not downloaded (run "ollama pull{" "}
                        {selectedConfig.model_name}")
                      </li>
                      <li>• Wrong endpoint URL</li>
                    </ul>
                  </div>
                )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  💡 Tips for Better Results
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Provide a clear report title and context</li>
                  <li>
                    • Add specific requirements for the section type
                  </li>
                  <li>
                    • Use the regenerate button to get different variations
                  </li>
                  <li>
                    • Generated content will be relevant to your report context
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIConfigurationComponent
        isOpen={showConfiguration}
        onClose={() => {
          setShowConfiguration(false);
          loadConfigurations();
        }}
      />

      <OllamaDiagnostic
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
        baseUrl={selectedConfig?.api_endpoint || "http://localhost:11434"}
      />
    </>
  );
}