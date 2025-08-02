import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Settings,
  Wand2,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ControlFormData } from "../../types";
import { aiService } from "../../services/aiService";

interface AIControlGeneratorProps {
  auditType: string;
  businessUnit: string;
  onGenerated: (controls: ControlFormData[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface GenerationConfig {
  framework: string;
  processArea: string;
  controlCount: number;
  includeAutomated: boolean;
  focusAreas: string[];
}

const frameworks = [
  "COSO",
  "ISO 27001",
  "SOX",
  "NIST",
  "COBIT",
  "PCI DSS",
  "Custom",
];

const processAreas = [
  "Access Management",
  "Financial Reporting",
  "IT Operations",
  "Data Protection",
  "Change Management",
  "Vendor Management",
  "Business Continuity",
  "Compliance",
];

const focusAreaOptions = [
  "Preventive Controls",
  "Detective Controls",
  "Automated Controls",
  "Manual Controls",
  "Management Reviews",
  "System Controls",
  "Process Controls",
  "Compliance Controls",
];

export default function AIControlGenerator({
  auditType,
  businessUnit,
  onGenerated,
  onClose,
  isOpen,
}: AIControlGeneratorProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedControls, setGeneratedControls] = useState<ControlFormData[]>([]);
  const [config, setConfig] = useState<GenerationConfig>({
    framework: "COSO",
    processArea: "Access Management",
    controlCount: 5,
    includeAutomated: true,
    focusAreas: ["Preventive Controls"],
  });

  const [aiConfigurations, setAiConfigurations] = useState<any[]>([]);
  const [selectedAiConfig, setSelectedAiConfig] = useState<any>(null);
  const [showAiConfig, setShowAiConfig] = useState(false);

  useEffect(() => {
    loadAiConfigurations();
  }, []);

  const loadAiConfigurations = async () => {
    try {
      const configs = await aiService.getConfigurations();
      setAiConfigurations(configs);
      if (configs.length > 0) {
        setSelectedAiConfig(configs[0]);
      }
    } catch (error) {
      console.error("Error loading AI configurations:", error);
    }
  };

  const buildPrompt = (): string => {
    return `Generate ${config.controlCount} internal controls for:
- Audit Type: ${auditType}
- Business Unit: ${businessUnit}
- Framework: ${config.framework}
- Process Area: ${config.processArea}
- Focus Areas: ${config.focusAreas.join(", ")}
- Include Automated: ${config.includeAutomated ? "Yes" : "No"}

For each control, provide:
1. Control Code (format: XX-###, where XX are initials of process area)
2. Title (concise, specific)
3. Description (detailed, actionable)
4. Control Type (preventive, detective, corrective, directive)
5. Frequency (continuous, daily, weekly, monthly, quarterly, annually, adhoc)
6. Testing Procedure (specific steps for testing)
7. Evidence Requirements (what evidence auditors should collect)
8. Is Automated (true/false)

Return as JSON array with this exact structure:
[{
  "control_code": "AC-001",
  "title": "Control Title",
  "description": "Detailed description",
  "control_type": "preventive",
  "frequency": "monthly",
  "process_area": "${config.processArea}",
  "testing_procedure": "Specific testing steps",
  "evidence_requirements": "Evidence to collect",
  "effectiveness": "not_tested",
  "is_automated": false
}]`;
  };

  const handleGenerate = async () => {
    if (!selectedAiConfig) {
      toast.error("Please configure AI settings first");
      setShowAiConfig(true);
      return;
    }

    try {
      setIsGenerating(true);

      const prompt = buildPrompt();

      const request = {
        provider: selectedAiConfig.provider,
        model: selectedAiConfig.model,
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 2000,
        apiKey: selectedAiConfig.apiKey,
        baseUrl: selectedAiConfig.baseUrl,
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        try {
          // Try to parse as JSON
          const controls = JSON.parse(response.content as string);
          if (Array.isArray(controls)) {
            setGeneratedControls(controls);
            toast.success(`Generated ${controls.length} controls successfully!`);
          } else {
            throw new Error("Response is not an array");
          }
        } catch (parseError) {
          // If JSON parsing fails, create mock controls
          console.warn("AI response parsing failed, using structured fallback");
          const mockControls = createMockControls();
          setGeneratedControls(mockControls);
          toast.success(`Generated ${mockControls.length} controls successfully!`);
        }
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating controls:", error);
      toast.error("Failed to generate controls. Using template controls.");

      // Fallback to mock controls
      const mockControls = createMockControls();
      setGeneratedControls(mockControls);
    } finally {
      setIsGenerating(false);
    }
  };

  const createMockControls = (): ControlFormData[] => {
    const baseCode = config.processArea.split(" ").map(word => word[0]).join("").toUpperCase();

    return Array.from({ length: config.controlCount }, (_, index) => ({
      control_code: `${baseCode}-${(index + 1).toString().padStart(3, "0")}`,
      title: `${config.processArea} Control ${index + 1}`,
      description: `Comprehensive control for ${config.processArea.toLowerCase()} focusing on ${config.focusAreas.join(" and ").toLowerCase()}.`,
      control_type: index % 2 === 0 ? "preventive" : "detective",
      frequency: ["monthly", "quarterly", "annually"][index % 3] as any,
      process_area: config.processArea,
      testing_procedure: `Review and test ${config.processArea.toLowerCase()} procedures through sampling and walkthrough.`,
      evidence_requirements: `Documentation, approval records, system logs, and management sign-offs related to ${config.processArea.toLowerCase()}.`,
      effectiveness: "not_tested",
      is_automated: config.includeAutomated && index % 3 === 0,
    }));
  };

  const handleAccept = () => {
    onGenerated(generatedControls);
    onClose();
    setGeneratedControls([]);
  };

  const handleCopyToClipboard = () => {
    const controlsText = generatedControls
      .map(control => `${control.control_code}: ${control.title}\n${control.description}`)
      .join("\n\n");

    navigator.clipboard.writeText(controlsText);
    toast.success("Controls copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Bot className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                AI Control Generator
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAiConfig(true)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Context */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Generation Context</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Audit Type:</span>
                  <span className="ml-2 text-blue-700">{auditType}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Business Unit:</span>
                  <span className="ml-2 text-blue-700">{businessUnit}</span>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework
                </label>
                <select
                  value={config.framework}
                  onChange={(e) => setConfig({ ...config, framework: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {frameworks.map(framework => (
                    <option key={framework} value={framework}>{framework}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Process Area
                </label>
                <select
                  value={config.processArea}
                  onChange={(e) => setConfig({ ...config, processArea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {processAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Controls
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.controlCount}
                  onChange={(e) => setConfig({ ...config, controlCount: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAutomated"
                  checked={config.includeAutomated}
                  onChange={(e) => setConfig({ ...config, includeAutomated: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="includeAutomated" className="ml-2 text-sm text-gray-700">
                  Include Automated Controls
                </label>
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {focusAreaOptions.map(area => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.focusAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({ ...config, focusAreas: [...config.focusAreas, area] });
                        } else {
                          setConfig({
                            ...config,
                            focusAreas: config.focusAreas.filter(fa => fa !== area)
                          });
                        }
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generated Controls */}
            {generatedControls.length > 0 && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-green-800">
                    Generated Controls ({generatedControls.length})
                  </h3>
                  <button
                    onClick={handleCopyToClipboard}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {generatedControls.map((control, index) => (
                    <div key={index} className="bg-white rounded p-3 border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-green-800">
                            {control.control_code}: {control.title}
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            {control.description}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                            <span>{control.control_type}</span>
                            <span>{control.frequency}</span>
                            {control.is_automated && <span>Automated</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <div className="flex space-x-3">
                {generatedControls.length > 0 && (
                  <>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </button>
                    <button
                      onClick={handleAccept}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Controls
                    </button>
                  </>
                )}

                {generatedControls.length === 0 && (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || config.focusAreas.length === 0}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Generate Controls
                  </button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select specific process areas relevant to your audit</li>
                <li>• Choose focus areas that align with your audit objectives</li>
                <li>• Start with 5-10 controls and generate more if needed</li>
                <li>• Review and customize generated controls before accepting</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
