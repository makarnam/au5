import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Bot,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Settings,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { ControlSet, Control } from "../../types";
import { controlService } from "../../services/controlService";
import { auditService } from "../../services/auditService";
import LoadingSpinner from "../LoadingSpinner";
import { formatDate, cn } from "../../utils";
import ControlSetForm from "./ControlSetForm";
import AIControlGenerator from "./AIControlGenerator";
import AIConfigModal from "./AIConfigModal";

interface ControlSetManagerProps {
  auditId?: string;
  onControlSetSelect?: (controlSetId: string) => void;
  embedded?: boolean;
}

const ControlSetManager: React.FC<ControlSetManagerProps> = ({
  auditId,
  onControlSetSelect,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();

  const [controlSets, setControlSets] = useState<ControlSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterFramework, setFilterFramework] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "controls_count">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [editingControlSet, setEditingControlSet] = useState<ControlSet | null>(null);

  useEffect(() => {
    loadControlSets();
  }, [auditId, sortBy, sortOrder]);

  const loadControlSets = async () => {
    try {
      setLoading(true);
      const data = await controlService.getControlSetsByAudit(auditId || "");

      // Sort the data
      const sortedData = [...data].sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];

        if (sortBy === "created_at") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setControlSets(sortedData);
    } catch (error) {
      console.error("Error loading control sets:", error);
      toast.error("Failed to load control sets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateControlSet = async (data: any) => {
    try {
      const newControlSet = await controlService.createControlSet({
        ...data,
        audit_id: auditId || "",
      });
      setControlSets(prev => [newControlSet, ...prev]);
      setShowCreateForm(false);
      toast.success("Control set created successfully");
    } catch (error) {
      console.error("Error creating control set:", error);
      toast.error("Failed to create control set");
    }
  };

  const handleUpdateControlSet = async (id: string, data: any) => {
    try {
      const updatedControlSet = await controlService.updateControlSet(id, data);
      setControlSets(prev =>
        prev.map(set => set.id === id ? updatedControlSet : set)
      );
      setEditingControlSet(null);
      toast.success("Control set updated successfully");
    } catch (error) {
      console.error("Error updating control set:", error);
      toast.error("Failed to update control set");
    }
  };

  const handleDeleteControlSet = async (setId: string) => {
    if (!window.confirm("Are you sure you want to delete this control set? This will also delete all controls within it.")) {
      return;
    }

    try {
      await controlService.deleteControlSet(setId);
      setControlSets(prev => prev.filter(set => set.id !== setId));
      setSelectedSets(prev => prev.filter(id => id !== setId));
      toast.success("Control set deleted successfully");
    } catch (error) {
      console.error("Error deleting control set:", error);
      toast.error("Failed to delete control set");
    }
  };

  const handleDuplicateControlSet = async (controlSet: ControlSet) => {
    try {
      const duplicateData = {
        name: `${controlSet.name} (Copy)`,
        description: controlSet.description,
        framework: controlSet.framework,
        audit_id: auditId || controlSet.audit_id,
      };

      const newControlSet = await controlService.createControlSet(duplicateData);

      // Get controls from original set and duplicate them
      const originalControls = await controlService.getControlsBySet(controlSet.id);
      if (originalControls.length > 0) {
        await controlService.createMultipleControls(
          newControlSet.id,
          originalControls.map(control => ({
            control_code: `${control.control_code}_COPY`,
            title: control.title,
            description: control.description,
            control_type: control.control_type,
            frequency: control.frequency,
            process_area: control.process_area,
            owner_id: control.owner_id,
            testing_procedure: control.testing_procedure,
            evidence_requirements: control.evidence_requirements,
            effectiveness: "not_tested" as const,
            is_automated: control.is_automated,
          }))
        );
      }

      setControlSets(prev => [newControlSet, ...prev]);
      toast.success("Control set duplicated successfully");
    } catch (error) {
      console.error("Error duplicating control set:", error);
      toast.error("Failed to duplicate control set");
    }
  };

  const getEffectivenessColor = (effective: number, total: number) => {
    if (total === 0) return "text-gray-500";
    const percentage = (effective / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getEffectivenessIcon = (effective: number, total: number) => {
    if (total === 0) return <AlertTriangle className="w-4 h-4" />;
    const percentage = (effective / total) * 100;
    if (percentage >= 80) return <CheckCircle className="w-4 h-4" />;
    if (percentage >= 60) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const filteredControlSets = controlSets.filter(set => {
    const matchesSearch =
      set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.framework.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFramework = !filterFramework || set.framework === filterFramework;

    return matchesSearch && matchesFramework;
  });

  const stats = {
    totalSets: controlSets.length,
    totalControls: controlSets.reduce((sum, set) => sum + set.controls_count, 0),
    avgEffectiveness: controlSets.length > 0
      ? Math.round(controlSets.reduce((sum, set) => {
          return sum + (set.controls_count > 0 ? (set.controls_count / set.controls_count) * 100 : 0);
        }, 0) / controlSets.length)
      : 0,
  };

  const frameworks = [...new Set(controlSets.map(set => set.framework))];

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading control sets..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Control Sets</h1>
            <p className="text-gray-600 mt-2">
              Manage control frameworks and individual controls
            </p>
          </div>

          {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button
                onClick={() => setShowAIConfig(true)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                AI Config
              </button>

              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Set
              </button>

              <button
                onClick={() => setShowAIGenerator(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Generate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500">Control Sets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Controls</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalControls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-yellow-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Effectiveness</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgEffectiveness}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search control sets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterFramework}
              onChange={(e) => setFilterFramework(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Frameworks</option>
              {frameworks.map(framework => (
                <option key={framework} value={framework}>{framework}</option>
              ))}
            </select>

            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="controls_count_desc">Most Controls</option>
              <option value="controls_count_asc">Least Controls</option>
            </select>
          </div>
        </div>
      </div>

      {/* Control Sets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredControlSets.map((controlSet, index) => (
          <motion.div
            key={controlSet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onControlSetSelect?.(controlSet.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {controlSet.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {controlSet.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Shield className="w-4 h-4 mr-1" />
                    {controlSet.framework}
                  </div>
                  {controlSet.ai_generated && (
                    <div className="flex items-center text-sm text-purple-600">
                      <Bot className="w-4 h-4 mr-1" />
                      AI Generated
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {controlSet.controls_count}
                  </p>
                  <p className="text-xs text-gray-500">Controls</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Created {formatDate(controlSet.created_at)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/controls/${controlSet.id}`);
                  }}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>

                <div className="flex items-center space-x-2">
                  {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateControlSet(controlSet);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingControlSet(controlSet);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteControlSet(controlSet.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredControlSets.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No control sets found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by creating your first control set"}
          </p>
          {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Control Set
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <ControlSetForm
          auditId={auditId}
          onSubmit={handleCreateControlSet}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingControlSet && (
        <ControlSetForm
          auditId={auditId}
          controlSet={editingControlSet}
          onSubmit={(data) => handleUpdateControlSet(editingControlSet.id, data)}
          onCancel={() => setEditingControlSet(null)}
        />
      )}

      {showAIGenerator && (
        <AIControlGenerator
          auditId={auditId}
          onSuccess={(controlSet) => {
            setControlSets(prev => [controlSet, ...prev]);
            setShowAIGenerator(false);
          }}
          onCancel={() => setShowAIGenerator(false)}
        />
      )}

      {showAIConfig && (
        <AIConfigModal
          onClose={() => setShowAIConfig(false)}
        />
      )}
    </div>
  );
};

export default ControlSetManager;
