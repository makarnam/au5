import { useState, useEffect } from "react";
import { Wand2, Loader2, Settings, Shield, AlertTriangle, FileText, Users, Lock, Database, Network, Server } from "lucide-react";
import { toast } from "react-hot-toast";
import { aiService } from "../../services/aiService";

interface ITSecurityAIGeneratorProps {
  fieldType: 
    | "security_policy"
    | "vulnerability_assessment_report"
    | "security_incident_response_plan"
    | "security_controls_mapping"
    | "security_framework_compliance"
    | "security_policy_description"
    | "security_policy_scope"
    | "security_policy_procedures"
    | "security_policy_roles"
    | "security_policy_incident_response"
    | "security_policy_access_control"
    | "security_policy_data_protection";
  title: string;
  industry?: string;
  framework?: string;
  securityLevel?: string;
  assetType?: string;
  threatLevel?: string;
  onGenerated: (content: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function ITSecurityAIGenerator({
  fieldType,
  title,
  industry = "Technology",
  framework = "ISO 27001",
  securityLevel = "medium",
  assetType = "IT Infrastructure",
  threatLevel = "medium",
  onGenerated,
  className = "",
  disabled = false,
}: ITSecurityAIGeneratorProps) {
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
      default:
        return "IT Security Content";
    }
  };

  const getFieldIcon = () => {
    switch (fieldType) {
      case "security_policy":
      case "security_policy_description":
      case "security_policy_scope":
      case "security_policy_procedures":
      case "security_policy_roles":
      case "security_policy_incident_response":
      case "security_policy_access_control":
      case "security_policy_data_protection":
        return Shield;
      case "vulnerability_assessment_report":
        return AlertTriangle;
      case "security_incident_response_plan":
        return AlertTriangle;
      case "security_controls_mapping":
        return FileText;
      case "security_framework_compliance":
        return Shield;
      default:
        return Shield;
    }
  };

  const handleGenerate = async () => {
    if (!selectedAiConfig) {
      toast.error("Please configure AI settings first");
      setShowSettings(true);
      return;
    }

    if (!title.trim()) {
      toast.error("Please provide a title for the security content");
      return;
    }

    try {
      setIsGenerating(true);

      const request = {
        provider: selectedAiConfig.provider,
        model: selectedAiConfig.model_name,
        prompt: "", // Will be built by the service
        context: `Title: ${title}\nIndustry: ${industry}\nFramework: ${framework}\nSecurity Level: ${securityLevel}\nAsset Type: ${assetType}\nThreat Level: ${threatLevel}`,
        fieldType,
        auditData: {
          title,
          audit_type: "IT Security",
          business_unit: industry,
          scope: assetType,
        },
        industry,
        framework,
        temperature: selectedAiConfig.temperature,
        maxTokens: selectedAiConfig.max_tokens,
        apiKey: selectedAiConfig.api_key,
        baseUrl: selectedAiConfig.api_endpoint,
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        onGenerated(response.content as string);
        toast.success(`${getFieldLabel()} generated successfully!`);
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating IT Security content:", error);
      toast.error("Failed to generate IT Security content");
    } finally {
      setIsGenerating(false);
    }
  };

  const IconComponent = getFieldIcon();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          disabled || isGenerating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
        }`}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <IconComponent className="w-4 h-4" />
        )}
        <span>
          {isGenerating ? "Generating..." : `Generate ${getFieldLabel()}`}
        </span>
      </button>

      <button
        onClick={() => setShowSettings(true)}
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        title="AI Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <select
                  value={selectedAiConfig?.id || ""}
                  onChange={(e) => {
                    const config = aiConfigurations.find(c => c.id === e.target.value);
                    setSelectedAiConfig(config || null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {aiConfigurations.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.provider} - {config.model_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
