import React, { useState } from "react";
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
  Shield,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  aiService,
  AIProvider,
  AIConfiguration,
  AIGenerationRequest,
} from "../../services/aiService";
import AIConfigurationComponent from "./AIConfiguration";

interface IncidentAIGeneratorProps {
  fieldType:
    | "incident_description"
    | "response_procedures"
    | "root_cause_analysis"
    | "lessons_learned"
    | "incident_response";
  title: string;
  incidentType?: string;
  severity?: string;
  businessUnit?: string;
  affectedSystems?: string[];
  stakeholders?: string[];
  onGenerated: (content: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function IncidentAIGenerator({
  fieldType,
  title,
  incidentType = "security",
  severity = "medium",
  businessUnit = "IT",
  affectedSystems = [],
  stakeholders = [],
  onGenerated,
  className = "",
  disabled = false,
}: IncidentAIGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AIConfiguration | null>(null);
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [context, setContext] = useState("");

  const getFieldLabel = () => {
    switch (fieldType) {
      case "incident_description":
        return "Incident Description";
      case "response_procedures":
        return "Response Procedures";
      case "root_cause_analysis":
        return "Root Cause Analysis";
      case "lessons_learned":
        return "Lessons Learned";
      case "incident_response":
        return "Incident Response";
      default:
        return "Content";
    }
  };

  const getFieldIcon = () => {
    switch (fieldType) {
      case "incident_description":
        return "📝";
      case "response_procedures":
        return "🚨";
      case "root_cause_analysis":
        return "🔍";
      case "lessons_learned":
        return "📚";
      case "incident_response":
        return "🛡️";
      default:
        return "✨";
    }
  };

  const getFieldDescription = () => {
    switch (fieldType) {
      case "incident_description":
        return "Generate a comprehensive incident description including timeline, impact, and initial assessment";
      case "response_procedures":
        return "Create detailed response procedures and escalation protocols";
      case "root_cause_analysis":
        return "Analyze the root cause and contributing factors of the incident";
      case "lessons_learned":
        return "Document lessons learned and improvement recommendations";
      case "incident_response":
        return "Generate complete incident response documentation";
      default:
        return "Generate content using AI";
    }
  };

  const loadConfigurations = async () => {
    try {
      const configs = await aiService.getConfigurations();
      setConfigurations(configs);
      if (configs.length > 0 && !selectedConfig) {
        setSelectedConfig(configs[0]);
      }
    } catch (error) {
      console.error("Error loading AI configurations:", error);
      toast.error("Failed to load AI configurations");
    }
  };

  const buildContext = () => {
    const contextParts = [];

    if (title) {
      contextParts.push(`Incident Title: ${title}`);
    }

    if (incidentType) {
      contextParts.push(`Incident Type: ${incidentType}`);
    }

    if (severity) {
      contextParts.push(`Severity: ${severity}`);
    }

    if (businessUnit) {
      contextParts.push(`Business Unit: ${businessUnit}`);
    }

    if (affectedSystems.length > 0) {
      contextParts.push(`Affected Systems: ${affectedSystems.join(", ")}`);
    }

    if (stakeholders.length > 0) {
      contextParts.push(`Stakeholders: ${stakeholders.join(", ")}`);
    }

    if (context.trim()) {
      contextParts.push(`Additional Context: ${context}`);
    }

    return contextParts.join("\n");
  };

  const handleGenerate = async () => {
    if (!selectedConfig) {
      toast.error("Please select an AI configuration first");
      return;
    }

    if (!title.trim()) {
      toast.error("Please provide an incident title before generating content");
      return;
    }

    try {
      setIsGenerating(true);

      const request: AIGenerationRequest = {
        provider: selectedConfig.provider,
        model: selectedConfig.model_name,
        prompt: "", // Will be built by the service
        context: buildContext(),
        fieldType: "incident_response", // Map to the supported field type
        auditData: {
          title: title,
          audit_type: incidentType,
          business_unit: businessUnit,
          scope: context,
        },
        temperature: selectedConfig.temperature,
        maxTokens: selectedConfig.max_tokens,
        apiKey: selectedConfig.api_key,
        baseUrl: selectedConfig.api_endpoint,
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        const content = Array.isArray(response.content)
          ? response.content.join("\n")
          : response.content;
        
        setGeneratedContent(content);
        onGenerated(content);

        // Log the generation
        await aiService.logGeneration(request, response);

        toast.success(`${getFieldLabel()} generated successfully!`);
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success("Content copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy content:", error);
      toast.error("Failed to copy content");
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
    handleGenerate();
  };

  React.useEffect(() => {
    loadConfigurations();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getFieldIcon()}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getFieldLabel()}
            </h3>
            <p className="text-sm text-gray-600">{getFieldDescription()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="AI Configuration"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* AI Configuration */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <AIConfigurationComponent
              configurations={configurations}
              selectedConfig={selectedConfig}
              onConfigSelect={setSelectedConfig}
              onConfigUpdate={loadConfigurations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Context (Optional)
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Provide additional context about the incident..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={disabled}
        />
      </div>

      {/* Generate Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleGenerate}
          disabled={disabled || isGenerating || !selectedConfig}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          <span>
            {isGenerating ? "Generating..." : `Generate ${getFieldLabel()}`}
          </span>
        </button>

        {!selectedConfig && (
          <span className="text-sm text-red-600">
            Please configure AI settings first
          </span>
        )}
      </div>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Generated Content</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRegenerate}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGeneratedContent("")}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-3 rounded border">
                {generatedContent}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incident Context Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Incident Context</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Title:</span>
            <span className="ml-2 text-blue-700">{title || "Not provided"}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Type:</span>
            <span className="ml-2 text-blue-700">{incidentType}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Severity:</span>
            <span className="ml-2 text-blue-700">{severity}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Business Unit:</span>
            <span className="ml-2 text-blue-700">{businessUnit}</span>
          </div>
          {affectedSystems.length > 0 && (
            <div className="col-span-2">
              <span className="font-medium text-blue-800">Affected Systems:</span>
              <span className="ml-2 text-blue-700">{affectedSystems.join(", ")}</span>
            </div>
          )}
          {stakeholders.length > 0 && (
            <div className="col-span-2">
              <span className="font-medium text-blue-800">Stakeholders:</span>
              <span className="ml-2 text-blue-700">{stakeholders.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
