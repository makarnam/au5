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
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { ControlSet, Control } from "../../types";
import { controlService } from "../../services/controlService";
import { auditService } from "../../services/auditService";
import LoadingSpinner from "../../components/LoadingSpinner";
import EnhancedAIControlGenerator from "../../components/controls/EnhancedAIControlGenerator";
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

const ControlsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get("audit_id");
  const { checkPermission } = useAuthStore();

  const [controlSets, setControlSets] = useState<ControlSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [auditTitle, setAuditTitle] = useState<string>("");
  const [showEnhancedGenerator, setShowEnhancedGenerator] = useState(false);
  const [audit, setAudit] = useState<any>(null);
  const [existingControls, setExistingControls] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [auditId]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (auditId) {
        const [controlSetsData, auditData] = await Promise.all([
          controlService.getControlSetsByAudit(auditId),
          auditService.getAudit(auditId),
        ]);
        setControlSets(controlSetsData);
        setAudit(auditData);
        setAuditTitle(auditData?.title || "");

        // Load existing controls for enhanced generator
        const allControls: any[] = [];
        for (const controlSet of controlSetsData) {
          const controls = await controlService.getControlsBySet(controlSet.id);
          allControls.push(...controls);
        }
        setExistingControls(allControls);
      } else {
        // Load all control sets
        const controlSetsData = await controlService.getControlSetsByAudit();
        setControlSets(controlSetsData);
      }
    } catch (error) {
      console.error("Error loading control sets:", error);
      toast.error("Failed to load control sets");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratedControls = async (controls: any[]) => {
    setShowEnhancedGenerator(false);

    // Create a new control set with the generated controls
    try {
      const controlSetData = {
        name: `Enhanced AI Control Set - ${new Date().toLocaleDateString()}`,
        description: `AI-generated control set with ${controls.length} controls`,
        framework: "AI Generated",
        audit_id: auditId || undefined,
      };

      const controlSet = await controlService.createControlSet(controlSetData);

      if (controls.length > 0) {
        await controlService.createMultipleControls(controlSet.id, controls);
      }

      toast.success(`Created control set with ${controls.length} controls!`);

      // Reload the data to show the new control set
      loadData();
    } catch (error) {
      console.error("Error creating control set:", error);
      toast.error("Failed to create control set");
    }
  };

  const handleDeleteControlSet = async (setId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this control set? This will also delete all controls within it.",
      )
    ) {
      return;
    }

    try {
      await controlService.deleteControlSet(setId);
      toast.success("Control set deleted successfully");
      setControlSets((prev) => prev.filter((set) => set.id !== setId));
      setSelectedSets((prev) => prev.filter((id) => id !== setId));
    } catch (error) {
      console.error("Error deleting control set:", error);
      toast.error("Failed to delete control set");
    }
  };

  const getEffectivenessColor = (effective: number, total: number) => {
    const safeEffective = safeNumber(effective);
    const safeTotal = safeNumber(total);
    if (safeTotal === 0) return "text-gray-500";
    const percentage = safePercentage(safeEffective, safeTotal);
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getEffectivenessIcon = (effective: number, total: number) => {
    const safeEffective = safeNumber(effective);
    const safeTotal = safeNumber(total);
    if (safeTotal === 0) return <AlertTriangle className="w-4 h-4" />;
    const percentage = safePercentage(safeEffective, safeTotal);
    if (percentage >= 80) return <CheckCircle className="w-4 h-4" />;
    if (percentage >= 60) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const filteredControlSets = controlSets.filter(
    (set) =>
      set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.process_area.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    totalSets: controlSets.length,
    totalControls: controlSets.reduce(
      (sum, set) => sum + safeNumber(set.controls_count || set.total_controls),
      0,
    ),
    testedControls: controlSets.reduce(
      (sum, set) => sum + safeNumber(set.tested_controls),
      0,
    ),
    effectiveControls: controlSets.reduce(
      (sum, set) => sum + safeNumber(set.effective_controls),
      0,
    ),
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {auditId ? `${auditTitle} - Controls` : t("pages.controls.title")}
          </h1>
          <p className="text-gray-600 mt-2">
            {auditId
              ? "Manage control sets and controls for this audit"
              : t("pages.controls.subtitle")}
          </p>
        </div>

        {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() =>
                navigate(
                  `/controls/create${auditId ? `?audit_id=${auditId}` : ""}`,
                )
              }
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Control Set
            </button>

            <button
              onClick={() =>
                navigate(
                  `/controls/generate${auditId ? `?audit_id=${auditId}` : ""}`,
                )
              }
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Generate
            </button>
            <button
              onClick={() => setShowEnhancedGenerator(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Bot className="w-4 h-4 mr-2" />
              Enhanced AI Generator
            </button>
            <button
              onClick={() => navigate("/controls/enhanced-ai-demo")}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try Demo
            </button>
          </div>
        )}
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Control Sets</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalSets}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Controls
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalControls}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Tested Controls
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.testedControls}
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
              <p className="text-sm font-medium text-gray-500">
                Effective Controls
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.effectiveControls}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced AI Control Generator Modal */}
        <EnhancedAIControlGenerator
          auditType={audit?.audit_type || ""}
          businessUnit={audit?.business_unit?.name || ""}
          onGenerated={handleGeneratedControls}
          onClose={() => setShowEnhancedGenerator(false)}
          isOpen={showEnhancedGenerator}
          existingControls={existingControls}
        />
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

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
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
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {controlSet.process_area}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {safeNumber(controlSet.total_controls)}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {safeNumber(controlSet.tested_controls)}
                  </p>
                  <p className="text-xs text-gray-500">Tested</p>
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      getEffectivenessColor(
                        safeNumber(controlSet.effective_controls),
                        safeNumber(controlSet.total_controls),
                      ),
                    )}
                  >
                    {safeNumber(controlSet.effective_controls)}
                  </p>
                  <p className="text-xs text-gray-500">Effective</p>
                </div>
              </div>

              {/* Effectiveness Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span
                    className={cn(
                      "mr-2",
                      getEffectivenessColor(
                        controlSet.effective_controls,
                        controlSet.total_controls,
                      ),
                    )}
                  >
                    {getEffectivenessIcon(
                      controlSet.effective_controls,
                      controlSet.total_controls,
                    )}
                  </span>
                  <span className="text-sm text-gray-600">
                    {safeNumber(controlSet.total_controls) > 0
                      ? `${safePercentage(controlSet.effective_controls, controlSet.total_controls)}% Effective`
                      : "No controls"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(controlSet.created_at)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/controls/${controlSet.id}`)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Controls
                </button>

                <div className="flex items-center space-x-2">
                  {checkPermission([
                    "auditor",
                    "supervisor_auditor",
                    "admin",
                  ]) && (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/controls/${controlSet.id}/edit`)
                        }
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteControlSet(controlSet.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
              onClick={() =>
                navigate(
                  `/controls/create${auditId ? `?audit_id=${auditId}` : ""}`,
                )
              }
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Control Set
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlsList;
