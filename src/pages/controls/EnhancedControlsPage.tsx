import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Settings,
  BarChart3,
  FileText,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { ControlSet } from "../../types";
import { controlService } from "../../services/controlService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ControlSetManager from "../../components/controls/ControlSetManager";
import ControlEditor from "../../components/controls/ControlEditor";

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  requiredPermissions?: string[];
}

const EnhancedControlsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { checkPermission } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [selectedControlSetId, setSelectedControlSetId] = useState<string | null>(
    searchParams.get("control_set_id")
  );
  const [auditId, setAuditId] = useState<string | null>(
    searchParams.get("audit_id")
  );
  const [activeTab, setActiveTab] = useState<string>(
    selectedControlSetId ? "controls" : "sets"
  );
  const [controlSet, setControlSet] = useState<ControlSet | null>(null);

  useEffect(() => {
    if (selectedControlSetId) {
      loadControlSet();
    } else {
      setLoading(false);
    }
  }, [selectedControlSetId]);

  const loadControlSet = async () => {
    if (!selectedControlSetId) return;

    try {
      setLoading(true);
      const data = await controlService.getControlSet(selectedControlSetId);
      setControlSet(data);
    } catch (error) {
      console.error("Error loading control set:", error);
      setControlSet(null);
    } finally {
      setLoading(false);
    }
  };

  const handleControlSetSelect = (controlSetId: string) => {
    setSelectedControlSetId(controlSetId);
    setActiveTab("controls");

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set("control_set_id", controlSetId);
    setSearchParams(newParams);
  };

  const handleBackToSets = () => {
    setSelectedControlSetId(null);
    setControlSet(null);
    setActiveTab("sets");

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("control_set_id");
    setSearchParams(newParams);
  };

  const tabs: TabConfig[] = [
    {
      id: "sets",
      label: "Control Sets",
      icon: Shield,
      component: () => (
        <ControlSetManager
          auditId={auditId || undefined}
          onControlSetSelect={handleControlSetSelect}
          embedded={false}
        />
      ),
    },
    {
      id: "controls",
      label: "Controls",
      icon: FileText,
      component: () =>
        selectedControlSetId ? (
          <ControlEditor
            controlSetId={selectedControlSetId}
            embedded={false}
          />
        ) : (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Control Set Selected
            </h3>
            <p className="text-gray-600">
              Please select a control set to view its controls
            </p>
          </div>
        ),
    },
  ];

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading controls..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {selectedControlSetId && (
                  <button
                    onClick={handleBackToSets}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedControlSetId && controlSet
                      ? `${controlSet.name} - Controls`
                      : "Controls Management"}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {selectedControlSetId && controlSet
                      ? `Manage controls for ${controlSet.framework} framework`
                      : "Manage control sets and individual controls"}
                  </p>
                </div>
              </div>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Controls</span>
                {auditId && (
                  <>
                    <span>/</span>
                    <span>Audit</span>
                  </>
                )}
                {selectedControlSetId && controlSet && (
                  <>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">
                      {controlSet.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                const isDisabled =
                  tab.id === "controls" && !selectedControlSetId;

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        isActive
                          ? "border-blue-500 text-blue-600"
                          : isDisabled
                          ? "border-transparent text-gray-400 cursor-not-allowed"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeTabConfig && <activeTabConfig.component />}
        </motion.div>

        {/* Quick Stats Footer */}
        {selectedControlSetId && controlSet && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Framework</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {controlSet.framework}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Controls
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {controlSet.controls_count}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    AI Generated
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {controlSet.ai_generated ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Settings className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Controls Management Tips
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  • <strong>Control Sets:</strong> Organize related controls by
                  framework, process area, or business unit
                </p>
                <p>
                  • <strong>AI Generation:</strong> Use AI to automatically
                  generate controls based on frameworks and requirements
                </p>
                <p>
                  • <strong>Testing:</strong> Regular testing helps maintain
                  control effectiveness and compliance
                </p>
                <p>
                  • <strong>Ownership:</strong> Assign clear ownership to ensure
                  accountability and proper maintenance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedControlsPage;
