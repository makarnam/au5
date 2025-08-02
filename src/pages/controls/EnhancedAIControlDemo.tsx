import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Settings,
  ArrowLeft,
  RefreshCw,
  Eye,
  Download,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ControlFormData } from "../../types";
import EnhancedAIControlGenerator from "../../components/controls/EnhancedAIControlGenerator";
// import { controlService } from "../../services/controlService";
import { aiService } from "../../services/aiService";

const EnhancedAIControlDemo: React.FC = () => {
  const navigate = useNavigate();

  // Demo state
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedControls, setGeneratedControls] = useState<ControlFormData[]>(
    [],
  );
  const [aiConfigurations, setAiConfigurations] = useState<any[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<string>("basic");

  // Demo scenarios
  const demoScenarios = {
    basic: {
      title: "Basic Financial Audit",
      auditType: "financial",
      businessUnit: "Finance Department",
      description:
        "Generate controls for a standard financial audit focusing on SOX compliance",
      existingControls: [],
    },
    complex: {
      title: "Complex IT Security Audit",
      auditType: "it_security",
      businessUnit: "Information Technology",
      description:
        "Generate controls for a comprehensive IT security audit with existing controls context",
      existingControls: [
        {
          control_code: "IT-001",
          title: "User Access Management",
          description: "Existing control for managing user access to systems",
          control_type: "preventive" as any,
          frequency: "monthly" as any,
          process_area: "Access Management",
          testing_procedure: "Review user access lists monthly",
          evidence_requirements: "Access control matrices, user lists",
          effectiveness: "effective" as any,
          is_automated: true,
        },
        {
          control_code: "IT-002",
          title: "Network Security Monitoring",
          description:
            "Existing control for monitoring network security events",
          control_type: "detective" as any,
          frequency: "continuous" as any,
          process_area: "Network Security",
          testing_procedure: "Review security logs and alerts",
          evidence_requirements: "Security logs, incident reports",
          effectiveness: "effective" as any,
          is_automated: true,
        },
      ],
    },
    healthcare: {
      title: "Healthcare HIPAA Compliance",
      auditType: "compliance",
      businessUnit: "Healthcare Operations",
      description:
        "Generate HIPAA-specific controls for healthcare data protection",
      existingControls: [],
    },
  };

  useEffect(() => {
    loadAiConfigurations();
  }, []);

  const loadAiConfigurations = async () => {
    try {
      const configs = await aiService.getConfigurations();
      setAiConfigurations(configs);
    } catch (error) {
      console.error("Error loading AI configurations:", error);
    }
  };

  const handleGeneratedControls = (controls: ControlFormData[]) => {
    setGeneratedControls(controls);
    setShowGenerator(false);
    toast.success(`Generated ${controls.length} controls successfully!`);
  };

  const handleOpenGenerator = (scenario: string) => {
    setSelectedDemo(scenario);
    setShowGenerator(true);
  };

  const handleExportControls = () => {
    if (generatedControls.length === 0) {
      toast.error("No controls to export");
      return;
    }

    const dataStr = JSON.stringify(generatedControls, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `enhanced_ai_controls_${selectedDemo}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Controls exported successfully");
  };

  const handleCopyControls = () => {
    if (generatedControls.length === 0) {
      toast.error("No controls to copy");
      return;
    }

    const controlsText = generatedControls
      .map(
        (control) =>
          `${control.control_code}: ${control.title}\n${control.description}\n\nTesting: ${control.testing_procedure}\n\nEvidence: ${control.evidence_requirements}\n`,
      )
      .join("\n---\n\n");

    navigator.clipboard.writeText(controlsText);
    toast.success("Controls copied to clipboard");
  };

  const selectedScenario =
    demoScenarios[selectedDemo as keyof typeof demoScenarios];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/controls")}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Bot className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Enhanced AI Control Generator Demo
                  </h1>
                  <p className="text-sm text-gray-600">
                    Experience the power of AI-driven control generation
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                {aiConfigurations.length > 0 ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    AI Configured
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    AI Setup Required
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate("/settings")}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="AI Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white mb-8"
        >
          <div className="flex items-center mb-4">
            <Sparkles className="w-8 h-8 mr-3" />
            <h2 className="text-3xl font-bold">
              Welcome to Enhanced AI Control Generation
            </h2>
          </div>
          <p className="text-lg opacity-90 mb-6">
            Our enhanced AI control generator creates contextual,
            industry-specific controls that are actually implementable in real
            organizations. Unlike generic templates, these controls are tailored
            to your specific audit context, industry, and risk environment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 Context-Aware</h3>
              <p>
                Considers your audit type, business unit, and existing controls
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🏭 Industry-Specific</h3>
              <p>Tailored to industry practices and regulatory requirements</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-semibold mb-2">✏️ Fully Editable</h3>
              <p>Preview, edit, and customize before saving to your audit</p>
            </div>
          </div>
        </motion.div>

        {/* Demo Scenarios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Try Different Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(demoScenarios).map(([key, scenario]) => (
              <div
                key={key}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedDemo === key
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedDemo(key)}
              >
                <h4 className="font-semibold text-gray-900 mb-2">
                  {scenario.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {scenario.description}
                </p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium">Audit Type:</span>{" "}
                    {scenario.auditType}
                  </div>
                  <div>
                    <span className="font-medium">Business Unit:</span>{" "}
                    {scenario.businessUnit}
                  </div>
                  <div>
                    <span className="font-medium">Existing Controls:</span>{" "}
                    {scenario.existingControls.length}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenGenerator(key);
                  }}
                  className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Generate Controls
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Generated Controls Preview */}
        {generatedControls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Generated Controls
                </h3>
                <p className="text-gray-600">
                  {generatedControls.length} controls generated for{" "}
                  {selectedScenario.title}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopyControls}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </button>
                <button
                  onClick={handleExportControls}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </button>
                <button
                  onClick={() => handleOpenGenerator(selectedDemo)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {generatedControls.map((control, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
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
                                : control.control_type === "corrective"
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {control.title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {control.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            Testing Procedure
                          </h5>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                            {control.testing_procedure}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">
                            Evidence Requirements
                          </h5>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                            {control.evidence_requirements}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                AI-Powered Generation
              </h4>
              <p className="text-sm text-gray-600">
                Uses advanced AI to create contextually relevant controls
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Preview & Edit
              </h4>
              <p className="text-sm text-gray-600">
                Review and customize controls before adding to your audit
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Industry-Specific
              </h4>
              <p className="text-sm text-gray-600">
                Tailored to your industry and compliance requirements
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Custom Templates
              </h4>
              <p className="text-sm text-gray-600">
                Save and reuse your customized control templates
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced AI Control Generator Modal */}
      {showGenerator && (
        <EnhancedAIControlGenerator
          auditType={selectedScenario.auditType}
          businessUnit={selectedScenario.businessUnit}
          onGenerated={handleGeneratedControls}
          onClose={() => setShowGenerator(false)}
          isOpen={showGenerator}
          existingControls={selectedScenario.existingControls}
        />
      )}
    </div>
  );
};

export default EnhancedAIControlDemo;
