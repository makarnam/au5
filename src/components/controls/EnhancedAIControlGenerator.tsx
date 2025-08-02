import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  RefreshCw,
  Save,
  Edit3,
  Copy,
  Check,
  Plus,
  Trash2,
  Settings,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ControlFormData } from "../../types";
import { aiService } from "../../services/aiService";
import { controlService } from "../../services/controlService";

interface EnhancedAIControlGeneratorProps {
  auditType: string;
  businessUnit: string;
  onGenerated: (controls: ControlFormData[]) => void;
  onClose: () => void;
  isOpen: boolean;
  existingControls?: ControlFormData[];
}

interface GenerationConfig {
  framework: string;
  processArea: string;
  controlCount: number;
  includeAutomated: boolean;
  focusAreas: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  industry: string;
}

interface CustomControlTemplate {
  id: string;
  name: string;
  description: string;
  controls: Partial<ControlFormData>[];
  framework: string;
  industry: string;
  created_at: string;
}

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
  "Custom",
];

const processAreas = [
  "Access Management",
  "Data Protection",
  "Financial Reporting",
  "IT Security",
  "Privacy Management",
  "Risk Management",
  "Business Continuity",
  "Vendor Management",
  "Asset Management",
];

const focusAreaOptions = [
  "Preventive Controls",
  "Detective Controls",
  "Corrective Controls",
  "Automated Controls",
  "Manual Controls",
  "IT Controls",
  "Business Process Controls",
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

export default function EnhancedAIControlGenerator({
  auditType,
  businessUnit,
  onGenerated,
  onClose,
  isOpen,
  existingControls = [],
}: EnhancedAIControlGeneratorProps) {
  // const { t } = useTranslation();

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedControls, setGeneratedControls] = useState<ControlFormData[]>(
    [],
  );
  const [editingControlId, setEditingControlId] = useState<string | null>(null);
  const [editingControl, setEditingControl] = useState<ControlFormData | null>(
    null,
  );

  // Configuration state
  const [config, setConfig] = useState<GenerationConfig>({
    framework: "ISO 27001",
    processArea: "Access Management",
    controlCount: 8,
    includeAutomated: true,
    focusAreas: ["Preventive Controls"],
    riskLevel: "medium",
    industry: "Technology",
  });

  // AI and template state
  const [aiConfigurations, setAiConfigurations] = useState<any[]>([]);
  const [selectedAiConfig, setSelectedAiConfig] = useState<any>(null);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<
    CustomControlTemplate[]
  >([]);
  const [, setSelectedTemplate] = useState<string>("");

  // UI state
  const [activeTab, setActiveTab] = useState<
    "generate" | "templates" | "preview"
  >("generate");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");

  useEffect(() => {
    loadAiConfigurations();
    loadCustomTemplates();
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

  const loadCustomTemplates = async () => {
    try {
      const templates = JSON.parse(
        localStorage.getItem("customControlTemplates") || "[]",
      );
      setCustomTemplates(templates);
    } catch (error) {
      console.error("Error loading custom templates:", error);
    }
  };

  const saveCustomTemplates = (templates: CustomControlTemplate[]) => {
    localStorage.setItem("customControlTemplates", JSON.stringify(templates));
    setCustomTemplates(templates);
  };

  const buildEnhancedPrompt = (): string => {
    const contextualInfo = `
Context Information:
- Audit Type: ${auditType}
- Business Unit: ${businessUnit}
- Framework: ${config.framework}
- Process Area: ${config.processArea}
- Industry: ${config.industry}
- Risk Level: ${config.riskLevel}
- Focus Areas: ${config.focusAreas.join(", ")}
- Include Automated Controls: ${config.includeAutomated ? "Yes" : "No"}
- Existing Controls Count: ${existingControls.length}

${
  existingControls.length > 0
    ? `
Existing Controls to Consider:
${existingControls
  .slice(0, 3)
  .map((control) => `- ${control.control_code}: ${control.title}`)
  .join("\n")}
`
    : ""
}`;

    return `You are a compliance expert specializing in ${config.framework} controls for ${config.industry} organizations. Generate ${config.controlCount} specific, implementable internal controls for ${config.processArea} in a ${config.riskLevel} risk environment.

${contextualInfo}

CRITICAL REQUIREMENTS:
1. Generate actual OPERATIONAL CONTROLS, not audit procedures
2. Controls must be specific to ${config.industry} industry practices
3. Address ${config.riskLevel} risk level appropriately
4. Focus on ${config.focusAreas.join(" and ")}
5. Ensure controls complement existing controls (avoid duplication)

Return ONLY a valid JSON array with this exact structure:

[
  {
    "control_code": "${config.framework.replace(/\s+/g, "")}-001",
    "title": "Specific Control Title",
    "description": "Detailed description of what the control does, how it operates, and what risks it mitigates. Include specific procedures, responsibilities, and measurable outcomes. Tailor to ${config.industry} industry and ${config.riskLevel} risk environment.",
    "control_type": "preventive",
    "frequency": "monthly",
    "process_area": "${config.processArea}",
    "testing_procedure": "Detailed testing procedure including: 1) Sample selection criteria, 2) Evidence to examine, 3) Testing steps, 4) Expected results, 5) Evaluation criteria. Be specific to ${config.framework} requirements.",
    "evidence_requirements": "Specific evidence types: documents, logs, reports, approvals, screenshots, system outputs, third-party confirmations. Include format requirements and retention periods.",
    "is_automated": ${config.includeAutomated}
  }
]

Control Type Options: "preventive", "detective", "corrective", "directive"
Frequency Options: "continuous", "daily", "weekly", "monthly", "quarterly", "annually"

Industry-Specific Considerations for ${config.industry}:
- Regulatory requirements specific to ${config.industry}
- Common business processes and risks
- Technology stack typically used
- Compliance challenges unique to the industry

Risk Level ${config.riskLevel} Requirements:
- ${
      config.riskLevel === "low"
        ? "Basic controls with standard monitoring"
        : config.riskLevel === "medium"
          ? "Enhanced controls with regular review"
          : config.riskLevel === "high"
            ? "Rigorous controls with frequent monitoring"
            : "Critical controls with continuous monitoring and real-time alerting"
    }

Generate practical, implementable controls that a ${config.industry} organization would actually use.

RETURN ONLY THE JSON ARRAY - NO ADDITIONAL TEXT.`;
  };

  const handleGenerate = async () => {
    if (!selectedAiConfig) {
      toast.error("Please configure AI settings first");
      setShowAiConfig(true);
      return;
    }

    try {
      setIsGenerating(true);
      const prompt = buildEnhancedPrompt();

      const request = {
        provider: selectedAiConfig.provider,
        model: selectedAiConfig.model,
        prompt: prompt,
        temperature: 0.3,
        maxTokens: 4000,
        apiKey: selectedAiConfig.apiKey,
        baseUrl: selectedAiConfig.baseUrl,
        context: `Generate security controls for ${config.framework} compliance in ${config.processArea}`,
        fieldType: "description" as any,
        auditData: {
          title: `Enhanced Control Generation`,
          audit_type: auditType,
          business_unit: businessUnit,
          scope: `Security controls for ${config.framework}`,
        },
      };

      const response = await aiService.generateContent(request);

      if (response.success) {
        try {
          const controls = JSON.parse(response.content as string);
          if (Array.isArray(controls)) {
            setGeneratedControls(controls);
            setActiveTab("preview");
            toast.success(
              `Generated ${controls.length} controls successfully!`,
            );
          } else {
            throw new Error("Response is not an array");
          }
        } catch (parseError) {
          console.warn(
            "AI response parsing failed, using framework-specific controls",
          );
          const frameworkControls = await controlService.generateControlsWithAI(
            null,
            {
              framework: config.framework,
              processArea: config.processArea,
              count: config.controlCount,
            },
          );
          setGeneratedControls(
            frameworkControls.map((control) => ({
              control_code: control.control_code,
              title: control.title,
              description: control.description,
              control_type: control.control_type,
              frequency: control.frequency,
              process_area: control.process_area,
              testing_procedure: control.testing_procedure,
              evidence_requirements: control.evidence_requirements,
              effectiveness: control.effectiveness,
              is_automated: control.is_automated,
            })),
          );
          setActiveTab("preview");
          toast.success(
            `Generated ${config.controlCount} framework-specific controls!`,
          );
        }
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating controls:", error);

      // Try fallback to framework-specific template controls
      try {
        console.log("Attempting fallback to framework-specific controls...");
        const frameworkControls = await controlService.generateControlsWithAI(
          null,
          {
            framework: config.framework,
            processArea: config.processArea,
            count: config.controlCount,
          },
        );

        if (frameworkControls && frameworkControls.length > 0) {
          setGeneratedControls(
            frameworkControls.map((control) => ({
              control_code: control.control_code,
              title: control.title,
              description: control.description,
              control_type: control.control_type,
              frequency: control.frequency,
              process_area: control.process_area,
              testing_procedure: control.testing_procedure,
              evidence_requirements: control.evidence_requirements,
              effectiveness: control.effectiveness,
              is_automated: control.is_automated,
            })),
          );
          setActiveTab("preview");
          toast.success(
            `AI generation failed, but created ${config.controlCount} framework-specific template controls for ${config.framework}`,
          );
        } else {
          throw new Error("Fallback also failed");
        }
      } catch (fallbackError) {
        console.error("Fallback generation also failed:", fallbackError);

        // Show more helpful error message based on the original error
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("Ollama") || errorMessage.includes("404")) {
          toast.error(
            "AI service unavailable. Please configure an AI provider in settings or install Ollama locally.",
            { duration: 6000 },
          );
        } else if (
          errorMessage.includes("API key") ||
          errorMessage.includes("401")
        ) {
          toast.error(
            "Invalid API key. Please check your AI provider configuration.",
            { duration: 6000 },
          );
        } else if (
          errorMessage.includes("quota") ||
          errorMessage.includes("limit")
        ) {
          toast.error(
            "API quota exceeded. Please check your provider billing or try a different AI service.",
            { duration: 6000 },
          );
        } else {
          toast.error(
            "Failed to generate controls. Please check AI configuration or try again later.",
            { duration: 6000 },
          );
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditControl = (control: ControlFormData, index: number) => {
    setEditingControlId(`control-${index}`);
    setEditingControl({ ...control });
  };

  const handleSaveEdit = () => {
    if (editingControl && editingControlId) {
      const index = parseInt(editingControlId.split("-")[1]);
      const updatedControls = [...generatedControls];
      updatedControls[index] = editingControl;
      setGeneratedControls(updatedControls);
      setEditingControlId(null);
      setEditingControl(null);
      toast.success("Control updated successfully");
    }
  };

  const handleCancelEdit = () => {
    setEditingControlId(null);
    setEditingControl(null);
  };

  const handleDeleteControl = (index: number) => {
    const updatedControls = generatedControls.filter((_, i) => i !== index);
    setGeneratedControls(updatedControls);
    toast.success("Control deleted");
  };

  const handleAddNewControl = () => {
    const newControl: ControlFormData = {
      control_code: `${config.framework.replace(/\s+/g, "")}-${String(generatedControls.length + 1).padStart(3, "0")}`,
      title: "New Control",
      description: "Enter control description here",
      control_type: "preventive",
      frequency: "monthly",
      process_area: config.processArea,
      testing_procedure: "Enter testing procedure here",
      evidence_requirements: "Enter evidence requirements here",
      effectiveness: "not_tested",
      is_automated: false,
    };

    setGeneratedControls([...generatedControls, newControl]);
    setEditingControlId(`control-${generatedControls.length}`);
    setEditingControl(newControl);
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const newTemplate: CustomControlTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: newTemplateDescription,
      controls: generatedControls,
      framework: config.framework,
      industry: config.industry,
      created_at: new Date().toISOString(),
    };

    const updatedTemplates = [...customTemplates, newTemplate];
    saveCustomTemplates(updatedTemplates);

    setShowTemplateModal(false);
    setNewTemplateName("");
    setNewTemplateDescription("");
    toast.success("Template saved successfully");
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = customTemplates.find((t) => t.id === templateId);
    if (template) {
      setGeneratedControls(template.controls as ControlFormData[]);
      setActiveTab("preview");
      toast.success("Template loaded successfully");
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = customTemplates.filter((t) => t.id !== templateId);
    saveCustomTemplates(updatedTemplates);
    toast.success("Template deleted");
  };

  const handleExportControls = () => {
    const dataStr = JSON.stringify(generatedControls, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.framework}_controls_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Controls exported successfully");
  };

  const handleImportControls = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const controls = JSON.parse(e.target?.result as string);
          if (Array.isArray(controls)) {
            setGeneratedControls(controls);
            setActiveTab("preview");
            toast.success("Controls imported successfully");
          } else {
            toast.error("Invalid file format");
          }
        } catch (error) {
          toast.error("Failed to parse file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAccept = () => {
    onGenerated(generatedControls);
    onClose();
    setGeneratedControls([]);
    setActiveTab("generate");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Bot className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                Enhanced AI Control Generator
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAiConfig(true)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="AI Configuration"
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

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-6 py-3 font-medium ${
                activeTab === "generate"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Generate Controls
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-6 py-3 font-medium ${
                activeTab === "templates"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Custom Templates
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-6 py-3 font-medium ${
                activeTab === "preview"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              disabled={generatedControls.length === 0}
            >
              Preview & Edit ({generatedControls.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "generate" && (
              <div className="p-6 h-full overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration Panel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Configuration
                    </h3>

                    {/* Framework */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Framework
                      </label>
                      <select
                        value={config.framework}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            framework: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {frameworks.map((framework) => (
                          <option key={framework} value={framework}>
                            {framework}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Process Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Process Area
                      </label>
                      <select
                        value={config.processArea}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            processArea: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {processAreas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <select
                        value={config.industry}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            industry: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Risk Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Risk Level
                      </label>
                      <select
                        value={config.riskLevel}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            riskLevel: e.target.value as any,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">Low Risk Environment</option>
                        <option value="medium">Medium Risk Environment</option>
                        <option value="high">High Risk Environment</option>
                        <option value="critical">
                          Critical Risk Environment
                        </option>
                      </select>
                    </div>

                    {/* Control Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Controls
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={config.controlCount}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            controlCount: parseInt(e.target.value) || 5,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Focus Areas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Focus Areas
                      </label>
                      <div className="space-y-2">
                        {focusAreaOptions.map((area) => (
                          <label key={area} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={config.focusAreas.includes(area)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfig((prev) => ({
                                    ...prev,
                                    focusAreas: [...prev.focusAreas, area],
                                  }));
                                } else {
                                  setConfig((prev) => ({
                                    ...prev,
                                    focusAreas: prev.focusAreas.filter(
                                      (f) => f !== area,
                                    ),
                                  }));
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">
                              {area}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Include Automated */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.includeAutomated}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              includeAutomated: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          Include Automated Controls
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Context Panel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Context Information
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">
                          Audit Type:
                        </span>
                        <span className="ml-2 text-gray-600">{auditType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Business Unit:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {businessUnit}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Existing Controls:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {existingControls.length} controls
                        </span>
                      </div>
                    </div>

                    {existingControls.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Recent Existing Controls:
                        </h4>
                        <div className="space-y-2">
                          {existingControls
                            .slice(0, 3)
                            .map((control, index) => (
                              <div
                                key={index}
                                className="bg-blue-50 rounded p-3"
                              >
                                <div className="font-medium text-blue-800">
                                  {control.control_code}
                                </div>
                                <div className="text-sm text-blue-600">
                                  {control.title}
                                </div>
                              </div>
                            ))}
                          {existingControls.length > 3 && (
                            <div className="text-sm text-gray-500">
                              And {existingControls.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Configuration Status */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Bot className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="font-medium text-purple-800">
                          AI Configuration
                        </h4>
                      </div>
                      {selectedAiConfig ? (
                        <div className="space-y-1 text-sm">
                          <div className="text-purple-700">
                            Provider: {selectedAiConfig.provider}
                          </div>
                          <div className="text-purple-700">
                            Model: {selectedAiConfig.model}
                          </div>
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Ready to generate
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center text-orange-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              No AI configuration available
                            </span>
                          </div>

                          {aiConfigurations.length === 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-blue-900 mb-2">
                                Quick Setup Guide
                              </h4>
                              <div className="text-xs text-blue-800 space-y-2">
                                <div>
                                  <strong>Option 1 - Local AI (Free):</strong>
                                  <br />
                                  1. Install Ollama:{" "}
                                  <code className="bg-blue-100 px-1 rounded">
                                    brew install ollama
                                  </code>
                                  <br />
                                  2. Start:{" "}
                                  <code className="bg-blue-100 px-1 rounded">
                                    ollama serve
                                  </code>
                                  <br />
                                  3. Download model:{" "}
                                  <code className="bg-blue-100 px-1 rounded">
                                    ollama pull llama3.2
                                  </code>
                                </div>
                                <div>
                                  <strong>Option 2 - Cloud AI:</strong>
                                  <br />
                                  Configure OpenAI, Claude, or Gemini with API
                                  key in AI settings
                                </div>
                                <button
                                  onClick={() => setShowAiConfig(true)}
                                  className="mt-2 text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  Open AI Configuration →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={
                        selectedAiConfig
                          ? handleGenerate
                          : () => setShowAiConfig(true)
                      }
                      disabled={isGenerating}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Generating Controls...
                        </>
                      ) : selectedAiConfig ? (
                        <>
                          <Bot className="w-5 h-5 mr-2" />
                          Generate AI Controls
                        </>
                      ) : (
                        <>
                          <Settings className="w-5 h-5 mr-2" />
                          Setup AI Configuration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "templates" && (
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Custom Control Templates
                  </h3>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    disabled={generatedControls.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Current as Template
                  </button>
                </div>

                {customTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Custom Templates
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Generate some controls first, then save them as a template
                      for future use.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div>Framework: {template.framework}</div>
                          <div>Industry: {template.industry}</div>
                          <div>Controls: {template.controls.length}</div>
                          <div>
                            Created:{" "}
                            {new Date(template.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleLoadTemplate(template.id)}
                          className="w-full bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Load Template
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "preview" && (
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Generated Controls ({generatedControls.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportControls}
                      className="hidden"
                      id="import-controls"
                    />
                    <label
                      htmlFor="import-controls"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </label>
                    <button
                      onClick={handleExportControls}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button
                      onClick={handleAddNewControl}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Control
                    </button>
                  </div>
                </div>

                {generatedControls.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Controls Generated
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Go to the Generate tab to create controls using AI.
                    </p>
                    <button
                      onClick={() => setActiveTab("generate")}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Generate Controls
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedControls.map((control, index) => (
                      <div
                        key={`control-${index}`}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        {editingControlId === `control-${index}` ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Control Code
                                </label>
                                <input
                                  type="text"
                                  value={editingControl?.control_code || ""}
                                  onChange={(e) =>
                                    setEditingControl((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            control_code: e.target.value,
                                          }
                                        : null,
                                    )
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Control Type
                                </label>
                                <select
                                  value={
                                    editingControl?.control_type || "preventive"
                                  }
                                  onChange={(e) =>
                                    setEditingControl((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            control_type: e.target.value as any,
                                          }
                                        : null,
                                    )
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                  <option value="preventive">Preventive</option>
                                  <option value="detective">Detective</option>
                                  <option value="corrective">Corrective</option>
                                  <option value="directive">Directive</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                              </label>
                              <input
                                type="text"
                                value={editingControl?.title || ""}
                                onChange={(e) =>
                                  setEditingControl((prev) =>
                                    prev
                                      ? { ...prev, title: e.target.value }
                                      : null,
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                              </label>
                              <textarea
                                value={editingControl?.description || ""}
                                onChange={(e) =>
                                  setEditingControl((prev) =>
                                    prev
                                      ? { ...prev, description: e.target.value }
                                      : null,
                                  )
                                }
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Frequency
                                </label>
                                <select
                                  value={editingControl?.frequency || "monthly"}
                                  onChange={(e) =>
                                    setEditingControl((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            frequency: e.target.value as any,
                                          }
                                        : null,
                                    )
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                  <option value="continuous">Continuous</option>
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="quarterly">Quarterly</option>
                                  <option value="annually">Annually</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Process Area
                                </label>
                                <input
                                  type="text"
                                  value={editingControl?.process_area || ""}
                                  onChange={(e) =>
                                    setEditingControl((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            process_area: e.target.value,
                                          }
                                        : null,
                                    )
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Testing Procedure
                              </label>
                              <textarea
                                value={editingControl?.testing_procedure || ""}
                                onChange={(e) =>
                                  setEditingControl((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          testing_procedure: e.target.value,
                                        }
                                      : null,
                                  )
                                }
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Evidence Requirements
                              </label>
                              <textarea
                                value={
                                  editingControl?.evidence_requirements || ""
                                }
                                onChange={(e) =>
                                  setEditingControl((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          evidence_requirements: e.target.value,
                                        }
                                      : null,
                                  )
                                }
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    editingControl?.is_automated || false
                                  }
                                  onChange={(e) =>
                                    setEditingControl((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            is_automated: e.target.checked,
                                          }
                                        : null,
                                    )
                                  }
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                  Automated Control
                                </span>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                              <button
                                onClick={handleSaveEdit}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded mr-2">
                                    {control.control_code}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      control.control_type === "preventive"
                                        ? "bg-green-100 text-green-800"
                                        : control.control_type === "detective"
                                          ? "bg-blue-100 text-blue-800"
                                          : control.control_type ===
                                              "corrective"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {control.control_type}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 ml-2">
                                    {control.frequency}
                                  </span>
                                  {control.is_automated && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 ml-2">
                                      Automated
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                  {control.title}
                                </h4>
                                <p className="text-gray-600 mb-4">
                                  {control.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">
                                      Testing Procedure
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      {control.testing_procedure}
                                    </p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">
                                      Evidence Requirements
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      {control.evidence_requirements}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() =>
                                    handleEditControl(control, index)
                                  }
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit Control"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const controlText = `${control.control_code}: ${control.title}\n\n${control.description}\n\nTesting: ${control.testing_procedure}\n\nEvidence: ${control.evidence_requirements}`;
                                    navigator.clipboard.writeText(controlText);
                                    toast.success(
                                      "Control copied to clipboard",
                                    );
                                  }}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Copy Control"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteControl(index)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Control"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === "preview" && generatedControls.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {generatedControls.length} controls ready to be added
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveTab("generate")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back to Generator
                  </button>
                  <button
                    onClick={handleAccept}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Add All Controls
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Save Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Save as Template
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter template description"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setNewTemplateName("");
                    setNewTemplateDescription("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
