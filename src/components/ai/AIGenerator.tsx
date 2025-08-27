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
import AIConfigurationComponent from "./AIConfiguration";
import OllamaDiagnostic from "./OllamaDiagnostic";

interface AIGeneratorProps {
  fieldType: 
    | "description" 
    | "objectives" 
    | "scope" 
    | "methodology"
    | "policy_content"
    | "incident_response"
    | "esg_program"
    | "bcp_plan"
    | "vendor_assessment"
    | "security_policy"
    | "training_program"
    | "training_description"
    | "learning_objectives"
    | "assessment_criteria"
    | "training_materials"
    | "training_schedule"
    | "certification_requirements"
    | "training_evaluation"
    | "competency_mapping"
    | "training_effectiveness"
    | "compliance_training"
    | "skill_development_plan"
    | "finding_description"
    | "finding_analysis"
    | "finding_impact"
    | "finding_recommendations"
    | "finding_action_plan"
    | "finding_risk_assessment"
    | "finding_root_cause"
    | "finding_evidence"
    | "finding_priority"
    | "finding_timeline"
    | "finding_assignee"
    | "finding_follow_up"
    | "resilience_assessment"
    | "supply_chain_risk";
  auditData: {
    title?: string;
    audit_type?: string;
    business_unit?: string;
    scope?: string;
  };
  onGenerated: (content: string | string[]) => void;
  currentValue?: string | string[];
  className?: string;
}

export default function AIGenerator({
  fieldType,
  auditData,
  onGenerated,
  currentValue,
  className = "",
}: AIGeneratorProps) {
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

  const getFieldDisplayName = (field: string) => {
    switch (field) {
      case "description":
        return "Description";
      case "objectives":
        return "Objectives";
      case "scope":
        return "Scope";
      case "methodology":
        return "Methodology";
      case "policy_content":
        return "Policy Content";
      case "incident_response":
        return "Incident Response";
      case "esg_program":
        return "ESG Program";
      case "bcp_plan":
        return "BCP Plan";
      case "vendor_assessment":
        return "Vendor Assessment";
      case "security_policy":
        return "Security Policy";
      case "vulnerability_assessment_report":
        return "Vulnerability Assessment Report";
      case "security_incident_response_plan":
        return "Security Incident Response Plan";
      case "security_controls_mapping":
        return "Security Controls Mapping";
      case "security_framework_compliance":
        return "Security Framework Compliance";
      case "security_policy_description":
        return "Security Policy Description";
      case "security_policy_scope":
        return "Security Policy Scope";
      case "security_policy_procedures":
        return "Security Policy Procedures";
      case "security_policy_roles":
        return "Security Policy Roles";
      case "security_policy_incident_response":
        return "Security Policy Incident Response";
      case "security_policy_access_control":
        return "Security Policy Access Control";
      case "security_policy_data_protection":
        return "Security Policy Data Protection";
      case "training_program":
        return "Training Program";
      case "training_description":
        return "Training Description";
      case "learning_objectives":
        return "Learning Objectives";
      case "assessment_criteria":
        return "Assessment Criteria";
      case "training_materials":
        return "Training Materials";
      case "training_schedule":
        return "Training Schedule";
      case "certification_requirements":
        return "Certification Requirements";
      case "training_evaluation":
        return "Training Evaluation";
      case "competency_mapping":
        return "Competency Mapping";
      case "training_effectiveness":
        return "Training Effectiveness";
      case "compliance_training":
        return "Compliance Training";
      case "skill_development_plan":
        return "Skill Development Plan";
      case "finding_description":
        return "Finding Description";
      case "finding_analysis":
        return "Finding Analysis";
      case "finding_impact":
        return "Finding Impact";
      case "finding_recommendations":
        return "Finding Recommendations";
      case "finding_action_plan":
        return "Finding Action Plan";
      case "finding_risk_assessment":
        return "Finding Risk Assessment";
      case "finding_root_cause":
        return "Finding Root Cause";
      case "finding_evidence":
        return "Finding Evidence";
      case "finding_priority":
        return "Finding Priority";
      case "finding_timeline":
        return "Finding Timeline";
      case "finding_assignee":
        return "Finding Assignee";
      case "finding_follow_up":
        return "Finding Follow-up";
      case "resilience_assessment":
        return "Resilience Assessment";
      case "supply_chain_risk":
        return "Supply Chain Risk";
      case "supply_chain_risk_assessment":
        return "Supply Chain Risk Assessment";
      case "vendor_evaluation_criteria":
        return "Vendor Evaluation Criteria";
      case "risk_mitigation_strategies":
        return "Risk Mitigation Strategies";
      case "supply_chain_mapping":
        return "Supply Chain Mapping";
      case "vendor_tier_classification":
        return "Vendor Tier Classification";
      case "risk_propagation_analysis":
        return "Risk Propagation Analysis";
      case "supply_chain_resilience_scoring":
        return "Supply Chain Resilience Scoring";
      case "disruption_response_plan":
        return "Disruption Response Plan";
      case "supplier_development_program":
        return "Supplier Development Program";
      case "performance_monitoring_framework":
        return "Performance Monitoring Framework";
      case "compliance_assessment_criteria":
        return "Compliance Assessment Criteria";
      case "financial_stability_analysis":
        return "Financial Stability Analysis";
      default:
        return field;
    }
  };

  const buildContext = () => {
    const contextParts = [];

    if (currentValue) {
      if (Array.isArray(currentValue)) {
        contextParts.push(`Current ${fieldType}: ${currentValue.join(", ")}`);
      } else {
        contextParts.push(`Current ${fieldType}: ${currentValue}`);
      }
    }

    if (context.trim()) {
      contextParts.push(`Additional context: ${context}`);
    }

    return contextParts.join("\n");
  };

  const handleGenerate = async () => {
    if (!selectedConfig) {
      toast.error("Please select an AI configuration first");
      return;
    }

    // For risk treatments and similar non-audit contexts, allow generation with a fallback title
    if (!auditData.title || auditData.title.trim().length === 0) {
      // If the caller passed an audit_type that indicates risk/treatment context, proceed with a sensible default
      const nonAuditContext =
        auditData.audit_type?.toLowerCase().includes("risk") ||
        auditData.audit_type?.toLowerCase().includes("treatment");
      if (!nonAuditContext) {
        toast.error("Please provide a title before generating content");
        return;
      }
    }

    try {
      setIsGenerating(true);

      const request: AIGenerationRequest = {
        provider: selectedConfig.provider,
        model: selectedConfig.model_name,
        prompt: "", // Will be built by the service
        context: buildContext(),
        fieldType,
        auditData,
        temperature: selectedConfig.temperature,
        maxTokens: selectedConfig.max_tokens,
        apiKey: selectedConfig.api_key,
        baseUrl: selectedConfig.api_endpoint,
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        const processedContent = Array.isArray(response.content)
          ? response.content.join("\n")
          : response.content;

        setGeneratedContent(processedContent);

        // Log the generation
        await aiService.logGeneration(request, response);

        // Automatically call onGenerated for immediate population
        if (fieldType === "description") {
          onGenerated(processedContent);
          setIsOpen(false);
          toast.success(
            `${getFieldDisplayName(fieldType)} generated and applied successfully!`,
          );
        } else {
          toast.success(
            `${getFieldDisplayName(fieldType)} generated successfully!`,
          );
        }
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setLastError(errorMessage);

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
    if (fieldType === "objectives") {
      // Try to parse as array for objectives
      try {
        const lines = generatedContent
          .split("\n")
          .filter((line) => line.trim());
        const objectives = lines.map((line) =>
          line.replace(/^[-•*]\s*/, "").trim(),
        );
        onGenerated(objectives);
      } catch {
        onGenerated([generatedContent]);
      }
    } else {
      onGenerated(generatedContent);
    }
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

  // Do NOT early-return a different button. Always render the same trigger to avoid unmount/remount flashes.
  // If there are no configurations, clicking the trigger will open the modal and we show the Manage panel inside.

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
        title={`Generate ${getFieldDisplayName(fieldType)} with AI`}
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
                    Generate {getFieldDisplayName(fieldType)}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Audit Context */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Audit Context
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Title:</strong> {auditData.title || "Not specified"}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {auditData.audit_type || "Not specified"}
                  </p>
                  <p>
                    <strong>Business Unit:</strong>{" "}
                    {auditData.business_unit || "Not specified"}
                  </p>
                  {auditData.scope && (
                    <p>
                      <strong>Scope:</strong> {auditData.scope}
                    </p>
                  )}
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
                  placeholder={`Provide additional context for generating the ${fieldType}...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Current Value Display */}
              {currentValue && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Current {getFieldDisplayName(fieldType)}:
                  </h4>
                  <div className="text-sm text-yellow-700">
                    {Array.isArray(currentValue) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {currentValue.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{currentValue}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Generated Content */}
              {generatedContent && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">
                      Generated {getFieldDisplayName(fieldType)}:
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
                  <li>• Provide a clear and specific audit title</li>
                  <li>
                    • Add context about special requirements or focus areas
                  </li>
                  <li>
                    • Use the regenerate button to get different variations
                  </li>
                  <li>
                    • Generated content will be relevant to your audit type and
                    business unit
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
