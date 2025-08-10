import { useState, useEffect } from "react";
import { Wand2, Loader2, Settings } from "lucide-react";
import { toast } from "react-hot-toast";
import { aiService } from "../../services/aiService";

interface PrivacyAIGeneratorProps {
  fieldType: "dpia_description" | "dpia_risk_assessment" | "ropa_purpose" | "ropa_legal_basis";
  title: string;
  industry?: string;
  dataSubjects?: string[];
  dataCategories?: string[];
  riskLevel?: string;
  onGenerated: (content: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function PrivacyAIGenerator({
  fieldType,
  title,
  industry = "Technology",
  dataSubjects = [],
  dataCategories = [],
  riskLevel = "medium",
  onGenerated,
  className = "",
  disabled = false,
}: PrivacyAIGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfigurations, setAiConfigurations] = useState<any[]>([]);
  const [selectedAiConfig, setSelectedAiConfig] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    void loadAiConfigurations();
  }, []);

  const loadAiConfigurations = async () => {
    try {
      const configs = await aiService.getConfigurations();
      setAiConfigurations(configs);
      if (configs.length > 0) {
        setSelectedAiConfig(configs[0]);
      }
    } catch (error) {
      console.error("Failed to load AI configurations:", error);
    }
  };

  const getFieldLabel = () => {
    switch (fieldType) {
      case "dpia_description":
        return "Description";
      case "dpia_risk_assessment":
        return "Risk Assessment";
      case "ropa_purpose":
        return "Purpose";
      case "ropa_legal_basis":
        return "Legal Basis";
      default:
        return "Content";
    }
  };

  const getFieldIcon = () => {
    switch (fieldType) {
      case "dpia_description":
        return "📝";
      case "dpia_risk_assessment":
        return "⚠️";
      case "ropa_purpose":
        return "🎯";
      case "ropa_legal_basis":
        return "⚖️";
      default:
        return "✨";
    }
  };

  const handleGenerate = async () => {
    if (!selectedAiConfig || !title.trim()) {
      toast.error("Please provide a title and ensure AI is configured");
      return;
    }

    try {
      setIsGenerating(true);

      const request = {
        provider: selectedAiConfig.provider,
        model: selectedAiConfig.model_name,
        prompt: "", // Will be built by the service
        context: `Generate ${getFieldLabel().toLowerCase()} for: ${title}`,
        fieldType,
        auditData: {
          title: `Privacy ${getFieldLabel()}`,
          audit_type: "privacy_assessment",
          business_unit: industry,
          scope: `Privacy content for ${title}`,
        },
        privacyData: {
          title,
          type: fieldType.startsWith("dpia") ? "dpia" as const : "ropa" as const,
          industry,
          data_subjects: dataSubjects,
          data_categories: dataCategories,
          risk_level: riskLevel,
        },
        temperature: selectedAiConfig.temperature || 0.7,
        maxTokens: selectedAiConfig.max_tokens || 2000,
        apiKey: selectedAiConfig.api_key,
        baseUrl: selectedAiConfig.api_endpoint,
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        onGenerated(response.content);
        toast.success(`${getFieldLabel()} generated successfully!`);
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate ${getFieldLabel().toLowerCase()}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating || !title.trim()}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={`Generate ${getFieldLabel().toLowerCase()} using AI`}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {isGenerating ? "Generating..." : `AI ${getFieldLabel()}`}
        </span>
        <span className="text-lg">{getFieldIcon()}</span>
      </button>

      {aiConfigurations.length === 0 && (
        <button
          onClick={() => setShowSettings(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors"
          title="Configure AI settings"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Configure AI</span>
        </button>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please configure AI settings in the main AI Configuration section to use AI generation features.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
