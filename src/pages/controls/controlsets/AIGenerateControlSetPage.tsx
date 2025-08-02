import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Sparkles, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { Audit } from "../../../types";

interface CreateControlSetFormData {
  name: string;
  description: string;
  framework: string;
}

import { controlService } from "../../../services/controlService";
import { auditService } from "../../../services/auditService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import EnhancedAIControlGenerator from "../../../components/controls/EnhancedAIControlGenerator";

const AIGenerateControlSetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get("audit_id");

  const [formData, setFormData] = useState<CreateControlSetFormData>({
    name: "",
    description: "",
    framework: "ISO 27001",
  });
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedControls, setGeneratedControls] = useState<any[]>([]);
  const [showEnhancedGenerator, setShowEnhancedGenerator] = useState(false);
  const [existingControls, setExistingControls] = useState<any[]>([]);

  // Load existing controls for context
  useEffect(() => {
    if (auditId) {
      loadAuditData();
    }
    loadExistingControls();
  }, [auditId]);

  const loadExistingControls = async () => {
    try {
      if (auditId) {
        const response = await controlService.getControlSetsByAudit(auditId);
        const allControls: any[] = [];
        for (const controlSet of response) {
          const controls = await controlService.getControlsBySet(controlSet.id);
          allControls.push(...controls);
        }
        setExistingControls(allControls);
      }
    } catch (error) {
      console.error("Error loading existing controls:", error);
    }
  };

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const auditData = await auditService.getAudit(auditId!);
      setAudit(auditData);

      // Pre-populate some fields based on audit data
      if (auditData) {
        setFormData((prev) => ({
          ...prev,
          name: `${auditData.title} - AI Control Set`,
          framework:
            auditData.audit_type === "financial"
              ? "SOX"
              : auditData.audit_type === "it"
                ? "ISO 27001"
                : auditData.audit_type === "operational"
                  ? "COBIT"
                  : "ISO 27001",
        }));
      }
    } catch (error) {
      console.error("Error loading audit:", error);
      toast.error("Failed to load audit data");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratedControls = (controls: any[]) => {
    setGeneratedControls(controls);
    setShowEnhancedGenerator(false);
    toast.success(`Successfully generated ${controls.length} controls!`);
  };

  const handleOpenEnhancedGenerator = () => {
    if (!formData.name.trim() || !formData.framework.trim()) {
      toast.error("Please fill in the control set name and framework first");
      return;
    }
    setShowEnhancedGenerator(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.framework.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const controlSetData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        framework: formData.framework.trim(),
        audit_id: auditId || undefined,
      };

      const controlSet = await controlService.createControlSet(controlSetData);

      // If we have generated controls, create them as well
      if (generatedControls && generatedControls.length > 0) {
        await controlService.createMultipleControls(
          controlSet.id,
          generatedControls,
        );
      }

      toast.success("AI-generated control set created successfully");

      // Navigate back to controls list with audit filter if applicable
      const returnPath = auditId
        ? `/controls?audit_id=${auditId}`
        : "/controls";
      navigate(returnPath);
    } catch (error) {
      console.error("Error creating control set:", error);
      toast.error("Failed to create control set");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateControlSetFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    const returnPath = auditId ? `/controls?audit_id=${auditId}` : "/controls";
    navigate(returnPath);
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading audit data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bot className="w-8 h-8 mr-3 text-purple-600" />
              AI Generate Control Set
            </h1>
            <p className="text-gray-600 mt-2">
              {audit
                ? `Generate an AI-powered control set for ${audit.title}`
                : "Generate an AI-powered control set using machine learning"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Control Set Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter control set name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework *
                  </label>
                  <select
                    value={formData.framework}
                    onChange={(e) =>
                      handleInputChange("framework", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a framework</option>
                    <option value="ISO 27001">ISO 27001</option>
                    <option value="SOX">SOX</option>
                    <option value="GDPR">GDPR</option>
                    <option value="NIST">NIST</option>
                    <option value="COBIT">COBIT</option>
                    <option value="COSO">COSO</option>
                    <option value="ISO 9001">ISO 9001</option>
                    <option value="PCI DSS">PCI DSS</option>
                    <option value="HIPAA">HIPAA</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Configuration */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI Generation Settings
              </h3>
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Bot className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-purple-800">
                      Enhanced AI Control Generator
                    </h4>
                    <p className="text-sm text-purple-600">
                      Generate contextual, industry-specific controls with
                      advanced AI
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEnhancedGenerator}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Open Enhanced AI Generator
                </button>
              </div>
            </div>

            {/* Generated Content Preview */}
            {generatedControls && generatedControls.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Generated Control Set Preview
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    {formData.name}
                  </h4>
                  <p className="text-sm text-green-600">
                    Generated {generatedControls.length} controls for{" "}
                    {formData.framework} framework
                  </p>

                  {/* Show first 3 controls as preview */}
                  <div className="mt-3 space-y-2">
                    {generatedControls
                      .slice(0, 3)
                      .map((control: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded border border-green-200"
                        >
                          <h5 className="font-medium text-green-900">
                            {control.control_code}: {control.title}
                          </h5>
                          <p className="text-sm text-green-700 mt-1">
                            {control.description?.substring(0, 150)}...
                          </p>
                          <div className="text-xs text-green-600 mt-2">
                            <span className="bg-green-100 px-2 py-1 rounded">
                              {control.control_type}
                            </span>
                            <span className="bg-green-100 px-2 py-1 rounded ml-2">
                              {control.frequency}
                            </span>
                          </div>
                        </div>
                      ))}
                    {generatedControls.length > 3 && (
                      <p className="text-sm text-green-600 text-center">
                        ... and {generatedControls.length - 3} more controls
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter a detailed description, or generate one with AI first..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Audit Information */}
            {audit && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Associated Audit
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">
                        {audit.title}
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {audit.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create AI Control Set
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Enhanced AI Control Generator Modal */}
      <EnhancedAIControlGenerator
        auditType={audit?.audit_type || ""}
        businessUnit={audit?.title || ""}
        onGenerated={handleGeneratedControls}
        onClose={() => setShowEnhancedGenerator(false)}
        isOpen={showEnhancedGenerator}
        existingControls={existingControls}
      />
    </div>
  );
};

export default AIGenerateControlSetPage;
