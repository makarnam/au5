import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Bot,
  AlarmClock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { Audit, AuditStatus, AuditType } from "../../types";
import { formatDate, getStatusColor, cn } from "../../utils";
import { formatUserName } from "../../utils/displayUtils";
import LoadingSpinner from "../../components/LoadingSpinner";
import { auditService } from "../../services/auditService";

const AuditsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AuditType | "all">("all");
  const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading audits...");

      const auditsData = await auditService.getAllAudits();
      console.log("Audits loaded:", auditsData);

      setAudits(auditsData);
    } catch (error) {
      console.error("Error loading audits:", error);
      setError("Failed to load audits. Please try again.");

      if (error instanceof Error) {
        if (error.message.includes("User not authenticated")) {
          toast.error("Please log in to view audits.");
        } else {
          toast.error("Failed to load audits. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudit = async (auditId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this audit? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await auditService.deleteAudit(auditId);
      toast.success("Audit deleted successfully");

      // Remove from local state
      setAudits((prev) => prev.filter((audit) => audit.id !== auditId));
      setSelectedAudits((prev) => prev.filter((id) => id !== auditId));
    } catch (error) {
      console.error("Error deleting audit:", error);
      toast.error("Failed to delete audit. Please try again.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedAudits.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedAudits.length} selected audits? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      // Delete all selected audits
      await Promise.all(
        selectedAudits.map((id) => auditService.deleteAudit(id)),
      );

      toast.success(`${selectedAudits.length} audits deleted successfully`);

      // Remove from local state
      setAudits((prev) =>
        prev.filter((audit) => !selectedAudits.includes(audit.id)),
      );
      setSelectedAudits([]);
    } catch (error) {
      console.error("Error deleting audits:", error);
      toast.error("Failed to delete some audits. Please try again.");
      // Reload audits to get current state
      loadAudits();
    }
  };

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || audit.status === statusFilter;
    const matchesType = typeFilter === "all" || audit.audit_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAudit = (auditId: string) => {
    setSelectedAudits((prev) =>
      prev.includes(auditId)
        ? prev.filter((id) => id !== auditId)
        : [...prev, auditId],
    );
  };

  const handleSelectAll = () => {
    if (selectedAudits.length === filteredAudits.length) {
      setSelectedAudits([]);
    } else {
      setSelectedAudits(filteredAudits.map((audit) => audit.id));
    }
  };

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case "planning":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "draft":
        return <Edit className="w-4 h-4 text-gray-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "on_hold":
        return <PauseCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAuditTypeLabel = (type: AuditType) => {
    switch (type) {
      case "financial":
        return "Financial";
      case "operational":
        return "Operational";
      case "compliance":
        return "Compliance";
      case "it":
        return "IT";
      case "internal":
        return "Internal";
      case "external":
        return "External";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: AuditStatus) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "planning":
        return "Planning";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "on_hold":
        return "On Hold";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Error Loading Audits
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadAudits}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("pages.audits.title")}
            </h1>
            <p className="text-gray-600 mt-2">{t("pages.audits.subtitle")}</p>
          </div>
          {checkPermission([
            "auditor",
            "supervisor_auditor",
            "admin",
            "super_admin",
          ]) && (
            <button
              onClick={() => navigate("/audits/create")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('audits:createNewAudit')}
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">{t('audits.totalAudits')}</p>
                <p className="text-xl font-bold text-gray-900">
                  {audits.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <PlayCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">{t('audits.inProgress')}</p>
                <p className="text-xl font-bold text-gray-900">
                  {audits.filter((a) => a.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">{t('audits.completed')}</p>
                <p className="text-xl font-bold text-gray-900">
                  {audits.filter((a) => a.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">{t('audits.planning')}</p>
                <p className="text-xl font-bold text-gray-900">
                  {audits.filter((a) => a.status === "planning").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('audits.searchAudits')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as AuditStatus | "all")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('audits.allStatus')}</option>
                <option value="draft">{t('audits.draft')}</option>
                <option value="planning">{t('audits.planning')}</option>
                <option value="in_progress">{t('audits.inProgress')}</option>
                <option value="completed">{t('audits.completed')}</option>
                <option value="on_hold">{t('audits.onHold')}</option>
                <option value="cancelled">{t('audits.cancelled')}</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as AuditType | "all")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('audits.allTypes')}</option>
                <option value="financial">{t('audits.financial')}</option>
                <option value="operational">{t('audits.operational')}</option>
                <option value="compliance">{t('audits.compliance')}</option>
                <option value="it">{t('audits.it')}</option>
                <option value="internal">{t('audits.internal')}</option>
                <option value="external">{t('audits.external')}</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAudits.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedAudits.length} audit(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteSelected}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audits List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredAudits.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audits found
            </h3>
            <p className="text-gray-600 mb-6">
              {audits.length === 0
                ? "Get started by creating your first audit."
                : "Try adjusting your search or filter criteria."}
            </p>
            {checkPermission([
              "auditor",
              "supervisor_auditor",
              "admin",
              "super_admin",
            ]) &&
              audits.length === 0 && (
                <button
                  onClick={() => navigate("/audits/create")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Audit
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedAudits.length === filteredAudits.length &&
                        filteredAudits.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAudits.map((audit) => (
                  <motion.tr
                    key={audit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAudits.includes(audit.id)}
                        onChange={() => handleSelectAudit(audit.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {audit.ai_generated ? (
                              <Bot className="w-5 h-5 text-blue-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => navigate(`/audits/${audit.id}`)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                          >
                            {audit.title}
                          </button>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {audit.description}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            Created {formatDate(audit.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getAuditTypeLabel(audit.audit_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(audit.status)}
                        <span
                          className={cn(
                            "ml-2 text-sm font-medium",
                            getStatusColor(audit.status),
                          )}
                        >
                          {getStatusLabel(audit.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatUserName(audit.lead_auditor)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                          {formatDate(audit.start_date)} -{" "}
                          {formatDate(audit.end_date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/audits/${audit.id}`)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {checkPermission([
                          "auditor",
                          "supervisor_auditor",
                          "admin",
                          "super_admin",
                        ]) && (
                          <>
                            <button
                              onClick={() => navigate(`/audits/${audit.id}/edit`)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/audits/${audit.id}/schedule`)}
                              className="text-gray-400 hover:text-amber-600 transition-colors"
                              title="Schedule"
                            >
                              <AlarmClock className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {checkPermission(["admin", "super_admin"]) && (
                          <button
                            onClick={() => handleDeleteAudit(audit.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditsList;
