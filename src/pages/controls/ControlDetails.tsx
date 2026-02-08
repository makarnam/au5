import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bot,
  Clock,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { ControlSet, Control } from "../../types";
import { controlService } from "../../services/controlService";
import LoadingSpinner from "../../components/LoadingSpinner";
import WorkflowCenter from "../workflows/WorkflowCenter";
import { formatDate, cn } from "../../utils";

// Safe number utilities to prevent NaN errors
const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const safePercentage = (numerator: any, denominator: any): number => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (den === 0) return 0;
  const result = (num / den) * 100;
  return isNaN(result) ? 0 : Math.round(result);
};

const ControlDetails: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { checkPermission } = useAuthStore();

  const [controlSet, setControlSet] = useState<ControlSet | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("controls");
  const [selectedControls, setSelectedControls] = useState<string[]>([]);

  // Utility function to validate UUID
  const isValidUUID = (uuid: string): boolean => {
    if (!uuid || typeof uuid !== "string") return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  useEffect(() => {
    if (id && isValidUUID(id)) {
      loadControlSetData();
    } else if (id && !isValidUUID(id)) {
      // Invalid UUID - redirect to controls list
      toast.error("Invalid control set ID");
      navigate("/controls");
    }
  }, [id, navigate]);

  const loadControlSetData = async () => {
    if (!id || !isValidUUID(id)) return;

    try {
      setLoading(true);
      const [controlSetData, controlsData] = await Promise.all([
        controlService.getControlSet(id),
        controlService.getControlsBySet(id),
      ]);

      setControlSet(controlSetData);
      setControls(controlsData);
    } catch (error) {
      console.error("Error loading control set data:", error);
      toast.error("Failed to load control set details");
      navigate("/controls");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteControl = async (controlId: string) => {
    if (!window.confirm("Are you sure you want to delete this control?")) {
      return;
    }

    try {
      await controlService.deleteControl(controlId);
      toast.success("Control deleted successfully");
      setControls((prev) => prev.filter((c) => c.id !== controlId));
      setSelectedControls((prev) => prev.filter((id) => id !== controlId));
    } catch (error) {
      console.error("Error deleting control:", error);
      toast.error("Failed to delete control");
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case "effective":
        return "text-green-600 bg-green-100";
      case "partially_effective":
        return "text-yellow-600 bg-yellow-100";
      case "ineffective":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getEffectivenessIcon = (effectiveness: string) => {
    switch (effectiveness) {
      case "effective":
        return <CheckCircle className="w-4 h-4" />;
      case "partially_effective":
        return <AlertTriangle className="w-4 h-4" />;
      case "ineffective":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getControlTypeColor = (type: string) => {
    switch (type) {
      case "preventive":
        return "text-blue-600 bg-blue-100";
      case "detective":
        return "text-purple-600 bg-purple-100";
      case "corrective":
        return "text-orange-600 bg-orange-100";
      case "directive":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const tabs = [
    { id: "controls", label: "Controls", icon: Shield },
    { id: "overview", label: "Overview", icon: FileText },
    { id: "analytics", label: "Analytics", icon: Settings },
  ];

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
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Control Set Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested control set could not be found.
          </p>
          <button
            onClick={() => navigate("/controls")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/controls")}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Controls
          </button>
        </div>

        {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/controls/${id}/create`)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Control
            </button>
            <button
              onClick={() => navigate(`/controls/${id}/edit`)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Set
            </button>
          </div>
        )}
      </div>

      {/* Control Set Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">
                {controlSet.name}
              </h1>
            </div>
            <p className="text-gray-600 mb-4">{controlSet.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <User className="w-4 h-4 mr-2" />
                Process Area: {controlSet.process_area}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Created: {formatDate(controlSet.created_at)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-2" />
                {safeNumber(controlSet.total_controls)} controls
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Controls
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {safeNumber(controlSet.total_controls)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tested</p>
              <p className="text-2xl font-semibold text-gray-900">
                {safeNumber(controlSet.tested_controls)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Effective</p>
              <p className="text-2xl font-semibold text-gray-900">
                {safeNumber(controlSet.effective_controls)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Effectiveness</p>
              <p className="text-2xl font-semibold text-gray-900">
                {safePercentage(
                  controlSet.effective_controls,
                  controlSet.total_controls,
                )}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "controls" && (
            <div className="space-y-4">
              {controls.length > 0 ? (
                <div className="grid gap-4">
                  {controls.map((control, index) => (
                    <motion.div
                      key={control.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded mr-3">
                              {control.control_code}
                            </span>
                            <h3 className="font-medium text-gray-900">
                              {control.title}
                            </h3>
                            {control.ai_generated && (
                              <Bot className="w-4 h-4 text-purple-500 ml-2" />
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {control.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                getControlTypeColor(control.control_type),
                              )}
                            >
                              {control.control_type.charAt(0).toUpperCase() +
                                control.control_type.slice(1)}
                            </span>

                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                              {control.frequency.replace("_", " ")}
                            </span>

                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                getEffectivenessColor(control.effectiveness),
                              )}
                            >
                              {getEffectivenessIcon(control.effectiveness)}
                              <span className="ml-1">
                                {control.effectiveness.replace("_", " ")}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {control.last_tested_date
                              ? `Last tested: ${formatDate(control.last_tested_date)}`
                              : "Not tested"}
                            {control.next_test_date && (
                              <span className="ml-4">
                                Next test: {formatDate(control.next_test_date)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() =>
                              navigate(`/controls/control/${control.id}`)
                            }
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {checkPermission([
                            "auditor",
                            "supervisor_auditor",
                            "admin",
                          ]) && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/controls/control/${control.id}/edit`,
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteControl(control.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No controls found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This control set doesn't have any controls yet.
                  </p>
                  {checkPermission([
                    "auditor",
                    "supervisor_auditor",
                    "admin",
                  ]) && (
                    <button
                      onClick={() => navigate(`/controls/${id}/create`)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Control
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Control Set Details
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Name
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {controlSet.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Description
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {controlSet.description}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Process Area
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {controlSet.process_area}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Created
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(controlSet.created_at)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Last Updated
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(controlSet.updated_at)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Control Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Total Controls:
                      </span>
                      <span className="text-sm font-medium">
                        {safeNumber(controlSet.total_controls)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Tested Controls:
                      </span>
                      <span className="text-sm font-medium">
                        {safeNumber(controlSet.tested_controls)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Effective Controls:
                      </span>
                      <span className="text-sm font-medium">
                        {safeNumber(controlSet.effective_controls)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Effectiveness Rate:
                      </span>
                      <span className="text-sm font-medium">
                        {safePercentage(
                          controlSet.effective_controls,
                          controlSet.total_controls,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analytics Coming Soon
              </h3>
              <p className="text-gray-600">
                Detailed analytics and reporting features will be available
                soon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Workflow & Approval */}
      <div className="px-6 pb-10">
        {controlSet?.id ? <WorkflowCenter entityType="control" entityId={controlSet.id} /> : null}
      </div>
    </div>
  );
};

export default ControlDetails;
