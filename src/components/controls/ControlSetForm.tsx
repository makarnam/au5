import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  X,
  Save,
  AlertCircle,
  Shield,
  FileText,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ControlSet, ControlSetFormData } from "../../types";
import LoadingSpinner from "../LoadingSpinner";

interface ControlSetFormProps {
  controlSet?: ControlSet;
  auditId?: string;
  onSubmit: (data: ControlSetFormData) => Promise<void>;
  onCancel: () => void;
}

const ControlSetForm: React.FC<ControlSetFormProps> = ({
  controlSet,
  auditId,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ControlSetFormData>({
    name: controlSet?.name || "",
    description: controlSet?.description || "",
    framework: controlSet?.framework || "",
    controls: [],
  });

  const frameworks = [
    "ISO 27001",
    "SOX",
    "COSO",
    "COBIT",
    "NIST",
    "PCI DSS",
    "GDPR",
    "HIPAA",
    "SOC 2",
    "Custom",
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Control set name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.framework.trim()) {
      newErrors.framework = "Framework is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save control set");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ControlSetFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {controlSet ? "Edit Control Set" : "Create Control Set"}
              </h2>
              <p className="text-sm text-gray-600">
                {controlSet
                  ? "Update control set information"
                  : "Create a new control set for organizing controls"
                }
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Control Set Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Control Set Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Access Controls, Financial Controls"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <div className="flex items-center mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the purpose and scope of this control set..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <div className="flex items-center mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </div>
            )}
          </div>

          {/* Framework */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Framework *
            </label>
            <select
              value={formData.framework}
              onChange={(e) => handleInputChange("framework", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.framework ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a framework...</option>
              {frameworks.map((framework) => (
                <option key={framework} value={framework}>
                  {framework}
                </option>
              ))}
            </select>
            {errors.framework && (
              <div className="flex items-center mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.framework}
              </div>
            )}
          </div>

          {/* Custom Framework Input */}
          {formData.framework === "Custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Framework Name
              </label>
              <input
                type="text"
                placeholder="Enter custom framework name..."
                onChange={(e) => {
                  const customFramework = e.target.value || "Custom";
                  setFormData(prev => ({
                    ...prev,
                    framework: customFramework,
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens next?</p>
                <p>
                  After creating this control set, you'll be able to add individual controls
                  to it. You can also use AI to generate controls automatically based on
                  your chosen framework and description.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {controlSet ? "Update Control Set" : "Create Control Set"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ControlSetForm;
