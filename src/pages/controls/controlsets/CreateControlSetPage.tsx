import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Bot,
  Loader2,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Audit,
  ControlFormData,
  ControlType,
  ControlFrequency,
} from "../../../types";
import { controlService } from "../../../services/controlService";
import { auditService } from "../../../services/auditService";
import { aiService } from "../../../services/aiService";
import LoadingSpinner from "../../../components/LoadingSpinner";

interface CreateControlSetFormData {
  name: string;
  description: string;
  framework: string;
  controls: ControlFormData[];
}

const CreateControlSetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get("audit_id");

  const [formData, setFormData] = useState<CreateControlSetFormData>({
    name: "",
    description: "",
    framework: "",
    controls: [],
  });
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingControls, setIsGeneratingControls] = useState(false);
  const [editingControlIndex, setEditingControlIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (auditId) {
      loadAuditData();
    }
  }, [auditId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const auditData = await auditService.getAudit(auditId!);
      setAudit(auditData);
    } catch (error) {
      console.error("Error loading audit:", error);
      toast.error("Failed to load audit data");
    } finally {
      setLoading(false);
    }
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

      const createdControlSet =
        await controlService.createControlSet(controlSetData);

      // Create individual controls if any
      if (formData.controls.length > 0) {
        try {
          for (const control of formData.controls) {
            await controlService.createControl(createdControlSet.id, control);
          }
          toast.success(
            `Control set created successfully with ${formData.controls.length} controls`,
          );
        } catch (controlError) {
          console.error("Error creating controls:", controlError);

          // Check if it's an RLS error
          if (
            controlError instanceof Error &&
            controlError.message.includes("RLS Policy Error")
          ) {
            toast.error(
              `Control set created, but some controls couldn't be saved due to permissions. ${controlError.message}`,
              { duration: 8000 },
            );
          } else {
            toast.error(
              `Control set created, but failed to create controls: ${controlError instanceof Error ? controlError.message : "Unknown error"}`,
              { duration: 6000 },
            );
          }
        }
      } else {
        toast.success("Control set created successfully");
      }

      // Navigate back to controls list with audit filter if applicable
      const returnPath = auditId
        ? `/controls?audit_id=${auditId}`
        : "/controls";
      navigate(returnPath);
    } catch (error) {
      console.error("Error creating control set:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("RLS Policy Error") ||
          error.message.includes("row-level security")
        ) {
          toast.error(
            "Permission error: Unable to create control set. Please check your permissions or contact your system administrator.",
            { duration: 8000 },
          );
        } else if (error.message.includes("User not authenticated")) {
          toast.error("You must be logged in to create a control set.");
        } else {
          toast.error(`Failed to create control set: ${error.message}`);
        }
      } else {
        toast.error("Failed to create control set. Please try again.");
      }
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

  const generateDescription = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a control set name first");
      return;
    }

    if (!formData.framework.trim()) {
      toast.error("Please enter a framework first");
      return;
    }

    setIsGeneratingDescription(true);
    try {
      // Get AI configurations
      const configurations = await aiService.getConfigurations();
      if (configurations.length === 0) {
        toast.error(
          "No AI configuration found. Please configure AI settings first.",
        );
        return;
      }

      const selectedConfig = configurations[0];

      // Prepare control set data for AI generation
      const controlSetData = {
        name: formData.name.trim(),
        framework: formData.framework.trim(),
        audit_title: audit?.title,
        audit_type: audit?.audit_type,
      };

      // Generate description using AI service
      const response = await aiService.generateContent({
        provider: selectedConfig.provider,
        model: selectedConfig.model_name,
        prompt: "",
        context: `Generate a comprehensive and professional description for the "${formData.name}" control set within the ${formData.framework} framework.`,
        fieldType: "control_set_description",
        auditData: {
          title: audit?.title,
          audit_type: audit?.audit_type,
          business_unit: "General",
        },
        controlSetData,
        temperature: selectedConfig.temperature,
        maxTokens: selectedConfig.max_tokens,
        apiKey: selectedConfig.api_key,
        baseUrl: selectedConfig.api_endpoint,
      });

      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          description: response.content as string,
        }));
        toast.success("AI-generated description added successfully!");
      } else {
        throw new Error(response.error || "AI generation failed");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Provide fallback content for better user experience
      const fallbackDescription = `This control set encompasses ${formData.framework} controls designed to ensure comprehensive governance, risk management, and compliance within the organization. The controls in this set are specifically tailored to address key risk areas and regulatory requirements associated with ${formData.framework} standards.`;

      setFormData((prev) => ({
        ...prev,
        description: fallbackDescription,
      }));

      toast.error(
        `AI generation failed: ${errorMessage}. Using fallback description.`,
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateControls = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a control set name first");
      return;
    }

    if (!formData.framework.trim()) {
      toast.error("Please enter a framework first");
      return;
    }

    setIsGeneratingControls(true);
    try {
      // Get AI configurations
      const configurations = await aiService.getConfigurations();
      if (configurations.length === 0) {
        toast.error(
          "No AI configuration found. Please configure AI settings first.",
        );
        return;
      }

      const selectedConfig = configurations[0];

      // Prepare control set data for AI generation
      const controlSetData = {
        name: formData.name.trim(),
        framework: formData.framework.trim(),
        audit_title: audit?.title,
        audit_type: audit?.audit_type,
      };

      // Generate controls using AI service
      const response = await aiService.generateContent({
        provider: selectedConfig.provider,
        model: selectedConfig.model_name,
        prompt: "",
        context: `Generate 5-6 professional controls for the "${formData.name}" control set in the ${formData.framework} framework.`,
        fieldType: "control_generation",
        auditData: {
          title: audit?.title,
          audit_type: audit?.audit_type,
          business_unit: "General",
        },
        controlSetData,
        temperature: selectedConfig.temperature,
        maxTokens: selectedConfig.max_tokens,
        apiKey: selectedConfig.api_key,
        baseUrl: selectedConfig.api_endpoint,
      });

      if (response.success) {
        try {
          const generatedControls = JSON.parse(response.content as string);

          if (Array.isArray(generatedControls)) {
            const formattedControls: ControlFormData[] = generatedControls.map(
              (control, index) => ({
                control_code:
                  control.control_code ||
                  `${formData.framework}-${String(index + 1).padStart(3, "0")}`,
                title: control.title || `Control ${index + 1}`,
                description: control.description || "Control description",
                control_type:
                  (control.control_type as ControlType) || "preventive",
                frequency: (control.frequency as ControlFrequency) || "monthly",
                process_area: control.process_area || formData.framework,
                testing_procedure:
                  control.testing_procedure ||
                  "Review and validate control implementation",
                evidence_requirements:
                  control.evidence_requirements ||
                  "Documentation and evidence of control execution",
                effectiveness: "not_tested",
                is_automated: false,
              }),
            );

            setFormData((prev) => ({
              ...prev,
              controls: [...prev.controls, ...formattedControls],
            }));

            toast.success(
              `Generated ${formattedControls.length} controls successfully!`,
            );
          } else {
            throw new Error("Invalid response format");
          }
        } catch (parseError) {
          throw new Error("Failed to parse AI response");
        }
      } else {
        throw new Error(response.error || "AI generation failed");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Show appropriate error message
      if (errorMessage.includes("No AI configuration")) {
        toast.error("Please configure AI settings first to generate controls.");
        return;
      }

      // Provide fallback controls
      const fallbackControls: ControlFormData[] = [
        {
          control_code: `${formData.framework}-001`,
          title: "Access Control Management",
          description:
            "Implement and maintain access control procedures to ensure only authorized personnel have access to systems and data.",
          control_type: "preventive",
          frequency: "monthly",
          process_area: formData.framework,
          testing_procedure:
            "Review access lists and verify authorization procedures",
          evidence_requirements:
            "Access control logs, authorization forms, and review documentation",
          effectiveness: "not_tested",
          is_automated: false,
        },
        {
          control_code: `${formData.framework}-002`,
          title: "Risk Assessment and Management",
          description:
            "Conduct regular risk assessments to identify, evaluate, and mitigate potential risks to the organization.",
          control_type: "detective",
          frequency: "quarterly",
          process_area: formData.framework,
          testing_procedure:
            "Review risk assessment reports and mitigation plans",
          evidence_requirements:
            "Risk assessment documentation, mitigation strategies, and monitoring reports",
          effectiveness: "not_tested",
          is_automated: false,
        },
        {
          control_code: `${formData.framework}-003`,
          title: "Documentation and Record Keeping",
          description:
            "Maintain comprehensive documentation of all processes, procedures, and compliance activities.",
          control_type: "preventive",
          frequency: "continuous",
          process_area: formData.framework,
          testing_procedure:
            "Verify completeness and accuracy of documentation",
          evidence_requirements:
            "Process documentation, procedure manuals, and record keeping logs",
          effectiveness: "not_tested",
          is_automated: false,
        },
      ];

      setFormData((prev) => ({
        ...prev,
        controls: [...prev.controls, ...fallbackControls],
      }));

      toast.error(
        `AI generation failed: ${errorMessage}. Using fallback controls.`,
      );
    } finally {
      setIsGeneratingControls(false);
    }
  };

  const addNewControl = () => {
    const newControl: ControlFormData = {
      control_code: `${formData.framework || "CTRL"}-${String(formData.controls.length + 1).padStart(3, "0")}`,
      title: "",
      description: "",
      control_type: "preventive",
      frequency: "monthly",
      process_area: formData.framework || "General",
      testing_procedure: "",
      evidence_requirements: "",
      effectiveness: "not_tested",
      is_automated: false,
    };

    setFormData((prev) => ({
      ...prev,
      controls: [...prev.controls, newControl],
    }));
    setEditingControlIndex(formData.controls.length);
  };

  const removeControl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      controls: prev.controls.filter((_, i) => i !== index),
    }));
    if (editingControlIndex === index) {
      setEditingControlIndex(null);
    }
  };

  const updateControl = (
    index: number,
    updatedControl: Partial<ControlFormData>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      controls: prev.controls.map((control, i) =>
        i === index ? { ...control, ...updatedControl } : control,
      ),
    }));
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
            <h1 className="text-3xl font-bold text-gray-900">
              Create Control Set
            </h1>
            <p className="text-gray-600 mt-2">
              {audit
                ? `Create a new control set for ${audit.title}`
                : "Create a new control set"}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework *
                  </label>
                  <input
                    type="text"
                    value={formData.framework}
                    onChange={(e) =>
                      handleInputChange("framework", e.target.value)
                    }
                    placeholder="e.g., ISO 27001, SOX, GDPR, NIST"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    {formData.name && formData.framework && (
                      <button
                        type="button"
                        onClick={generateDescription}
                        disabled={isGeneratingDescription}
                        className="flex items-center space-x-1 px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generate description with AI"
                      >
                        {isGeneratingDescription ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Bot className="w-3 h-3" />
                        )}
                        <span>
                          {isGeneratingDescription
                            ? "Generating..."
                            : "AI Generate"}
                        </span>
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter a detailed description of this control set"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.name &&
                    formData.framework &&
                    !formData.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        💡 Try the AI Generate button to create a professional
                        description based on your control set name and
                        framework.
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Controls ({formData.controls.length})
                </h3>
                <div className="flex space-x-2">
                  {formData.name && formData.framework && (
                    <button
                      type="button"
                      onClick={generateControls}
                      disabled={isGeneratingControls}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate 5-6 controls with AI"
                    >
                      {isGeneratingControls ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span>
                        {isGeneratingControls
                          ? "Generating..."
                          : "AI Generate Controls"}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addNewControl}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Control</span>
                  </button>
                </div>
              </div>

              {formData.controls.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    No controls added yet
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Use AI Generate to create 5-6 professional controls
                    automatically, or add them manually.
                  </p>
                  {formData.name && formData.framework && (
                    <button
                      type="button"
                      onClick={generateControls}
                      disabled={isGeneratingControls}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      {isGeneratingControls ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span>Generate Controls with AI</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.controls.map((control, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      {editingControlIndex === index ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Control Code
                              </label>
                              <input
                                type="text"
                                value={control.control_code}
                                onChange={(e) =>
                                  updateControl(index, {
                                    control_code: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Control Type
                              </label>
                              <select
                                value={control.control_type}
                                onChange={(e) =>
                                  updateControl(index, {
                                    control_type: e.target.value as ControlType,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                <option value="preventive">Preventive</option>
                                <option value="detective">Detective</option>
                                <option value="corrective">Corrective</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={control.title}
                              onChange={(e) =>
                                updateControl(index, { title: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={control.description}
                              onChange={(e) =>
                                updateControl(index, {
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Frequency
                              </label>
                              <select
                                value={control.frequency}
                                onChange={(e) =>
                                  updateControl(index, {
                                    frequency: e.target
                                      .value as ControlFrequency,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Process Area
                              </label>
                              <input
                                type="text"
                                value={control.process_area}
                                onChange={(e) =>
                                  updateControl(index, {
                                    process_area: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Testing Procedure
                            </label>
                            <textarea
                              value={control.testing_procedure}
                              onChange={(e) =>
                                updateControl(index, {
                                  testing_procedure: e.target.value,
                                })
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Evidence Requirements
                            </label>
                            <textarea
                              value={control.evidence_requirements}
                              onChange={(e) =>
                                updateControl(index, {
                                  evidence_requirements: e.target.value,
                                })
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingControlIndex(null)}
                              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Done Editing
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {control.control_code}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                                {control.control_type}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                                {control.frequency}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {control.title || "Untitled Control"}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {control.description || "No description"}
                            </p>
                            {control.process_area && (
                              <p className="text-xs text-gray-500">
                                Process Area: {control.process_area}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              type="button"
                              onClick={() => setEditingControlIndex(index)}
                              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeControl(index)}
                              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                  disabled={
                    isSubmitting ||
                    !formData.name ||
                    !formData.description ||
                    !formData.framework
                  }
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={
                    !formData.name ||
                    !formData.description ||
                    !formData.framework
                      ? "Please fill in all required fields"
                      : ""
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Control Set
                      {formData.controls.length > 0 && (
                        <span className="ml-1">
                          ({formData.controls.length} controls)
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateControlSetPage;
