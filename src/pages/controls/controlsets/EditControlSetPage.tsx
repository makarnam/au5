import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore";
import { ControlSet } from "../../../types";

interface EditControlSetFormData {
  name: string;
  description: string;
  framework: string;
}

import { controlService } from "../../../services/controlService";
import LoadingSpinner from "../../../components/LoadingSpinner";

const EditControlSetPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { checkPermission } = useAuthStore();

  const [formData, setFormData] = useState<EditControlSetFormData>({
    name: "",
    description: "",
    framework: "",
  });
  const [controlSet, setControlSet] = useState<ControlSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadControlSetData();
    }
  }, [id]);

  const loadControlSetData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const controlSetData = await controlService.getControlSet(id);

      if (!controlSetData) {
        toast.error("Control set not found");
        navigate("/controls");
        return;
      }

      setControlSet(controlSetData);
      setFormData({
        name: controlSetData.name,
        description: controlSetData.description,
        framework: controlSetData.framework,
      });
    } catch (error) {
      console.error("Error loading control set:", error);
      toast.error("Failed to load control set");
      navigate("/controls");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

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

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        framework: formData.framework.trim(),
      };

      await controlService.updateControlSet(id, updateData);

      toast.success("Control set updated successfully");

      // Navigate back to control set details
      navigate(`/controls/${id}`);
    } catch (error) {
      console.error("Error updating control set:", error);
      toast.error("Failed to update control set");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !controlSet) return;

    const confirmMessage = `Are you sure you want to delete the control set "${controlSet.name}"? This will also delete all controls within it. This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);

      await controlService.deleteControlSet(id);

      toast.success("Control set deleted successfully");

      // Navigate back to controls list
      const returnPath = controlSet.audit_id
        ? `/controls?audit_id=${controlSet.audit_id}`
        : "/controls";
      navigate(returnPath);
    } catch (error) {
      console.error("Error deleting control set:", error);
      toast.error("Failed to delete control set");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (
    field: keyof EditControlSetFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    navigate(`/controls/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading control set..." />
      </div>
    );
  }

  if (!controlSet) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Control Set Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The requested control set could not be found.
          </p>
          <button
            onClick={() => navigate("/controls")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Controls
          </button>
        </div>
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
              Edit Control Set
            </h1>
            <p className="text-gray-600 mt-2">
              Modify the details of this control set
            </p>
          </div>
        </div>

        {/* Delete Button */}
        {checkPermission(["admin", "supervisor_auditor"]) && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Control Set
              </>
            )}
          </button>
        )}
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
                    Description *
                  </label>
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
              </div>
            </div>

            {/* Control Set Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Control Set Information
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Controls
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {controlSet.total_controls || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Tested Controls
                    </p>
                    <p className="text-2xl font-semibold text-yellow-600">
                      {controlSet.tested_controls || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Effective Controls
                    </p>
                    <p className="text-2xl font-semibold text-green-600">
                      {controlSet.effective_controls || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Metadata
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(controlSet.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">
                      Last Updated:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {new Date(controlSet.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">ID:</span>
                    <span className="ml-2 text-gray-900 font-mono text-xs">
                      {controlSet.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Control Set
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

export default EditControlSetPage;
