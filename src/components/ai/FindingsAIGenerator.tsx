import { useState, useEffect } from "react";
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
  Search,
  AlertCircle,
  FileText,
  Target,
  TrendingUp,
  Shield,
  Clock,
  UserCheck,
  Calendar,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { aiService } from "../../services/aiService";

interface FindingsAIGeneratorProps {
  fieldType: 
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
    | "finding_follow_up";
  title: string;
  auditType?: string;
  severity?: string;
  category?: string;
  businessUnit?: string;
  onGenerated: (content: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function FindingsAIGenerator({
  fieldType,
  title,
  auditType = "internal",
  severity = "medium",
  category = "compliance",
  businessUnit = "General",
  onGenerated,
  className = "",
  disabled = false,
}: FindingsAIGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [context, setContext] = useState("");

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const configs = await aiService.getConfigurations();
      setConfigurations(configs);
      if (configs.length > 0 && !selectedConfig) {
        setSelectedConfig(configs[0]);
      }
    } catch (error) {
      console.error("Error loading configurations:", error);
    }
  };

  const getFieldLabel = () => {
    switch (fieldType) {
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
      default:
        return "Finding Content";
    }
  };

  const getFieldIcon = () => {
    switch (fieldType) {
      case "finding_description":
        return <FileText className="w-4 h-4" />;
      case "finding_analysis":
        return <Search className="w-4 h-4" />;
      case "finding_impact":
        return <AlertCircle className="w-4 h-4" />;
      case "finding_recommendations":
        return <Lightbulb className="w-4 h-4" />;
      case "finding_action_plan":
        return <Target className="w-4 h-4" />;
      case "finding_risk_assessment":
        return <Shield className="w-4 h-4" />;
      case "finding_root_cause":
        return <Search className="w-4 h-4" />;
      case "finding_evidence":
        return <FileText className="w-4 h-4" />;
      case "finding_priority":
        return <AlertTriangle className="w-4 h-4" />;
      case "finding_timeline":
        return <Clock className="w-4 h-4" />;
      case "finding_assignee":
        return <UserCheck className="w-4 h-4" />;
      case "finding_follow_up":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Wand2 className="w-4 h-4" />;
    }
  };

  const buildContext = () => {
    const contextParts = [];

    if (context.trim()) {
      contextParts.push(`Additional context: ${context}`);
    }

    if (auditType) {
      contextParts.push(`Audit type: ${auditType}`);
    }

    if (severity) {
      contextParts.push(`Severity: ${severity}`);
    }

    if (category) {
      contextParts.push(`Category: ${category}`);
    }

    if (businessUnit) {
      contextParts.push(`Business unit: ${businessUnit}`);
    }

    return contextParts.join("\n");
  };

  const handleGenerate = async () => {
    if (!selectedConfig) {
      toast.error("Please select an AI configuration first");
      setShowConfiguration(true);
      return;
    }

    if (disabled) {
      toast.error("AI generation is disabled");
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedContent("");

      const auditData = {
        title: title,
        audit_type: auditType,
        business_unit: businessUnit,
        scope: `Finding: ${title}`,
      };

      const request = {
        fieldType: fieldType,
        auditData: auditData,
        context: buildContext(),
        provider: selectedConfig.provider,
        model: selectedConfig.model,
        apiKey: selectedConfig.apiKey,
        baseUrl: selectedConfig.baseUrl,
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        const content = Array.isArray(response.content) 
          ? response.content.join("\n") 
          : response.content;
        
        setGeneratedContent(content);
        onGenerated(content);
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

  const handleUseContent = () => {
    onGenerated(generatedContent);
    setGeneratedContent("");
    toast.success("Content applied to form!");
  };

  const handleRegenerate = () => {
    setGeneratedContent("");
    handleGenerate();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4 mr-2" />
        )}
        {isGenerating ? "Generating..." : `Generate ${getFieldLabel()}`}
      </button>

      {/* Configuration Button */}
      <button
        onClick={() => setShowConfiguration(!showConfiguration)}
        className="ml-2 inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Configuration Panel */}
      <AnimatePresence>
        {showConfiguration && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Configuration
                </label>
                <select
                  value={selectedConfig?.id || ""}
                  onChange={(e) => {
                    const config = configurations.find(c => c.id === e.target.value);
                    setSelectedConfig(config);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {configurations.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name} ({config.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Context
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Add any additional context or requirements for the finding content..."
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Content Display */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getFieldIcon()}
                <h4 className="ml-2 text-sm font-medium text-red-800">
                  Generated {getFieldLabel()}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </button>
                <button
                  onClick={handleRegenerate}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </button>
                <button
                  onClick={handleUseContent}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Use
                </button>
                <button
                  onClick={() => setGeneratedContent("")}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-red-900 bg-white p-3 rounded border">
                {generatedContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
