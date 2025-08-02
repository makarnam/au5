import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  BarChart3,
  Building2,
  Users,
  Layers,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import riskService, {
  Risk,
  RiskLevel,
  RiskStatus,
  RiskFilter,
} from "../../services/riskService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { cn } from "../../utils";

type LevelOption = RiskLevel | "all";
type StatusOption = RiskStatus | "all";

const levelColors: Record<RiskLevel, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusOrder: RiskStatus[] = [
  "identified",
  "assessed",
  "treating",
  "monitoring",
  "accepted",
  "transferred",
  "avoided",
  "closed",
];

const RisksList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();

  // Data
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOption>("all");
  const [levelFilter, setLevelFilter] = useState<LevelOption>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  const [byStatus, setByStatus] = useState<Record<RiskStatus, number>>({
    identified: 0,
    assessed: 0,
    treating: 0,
    monitoring: 0,
    accepted: 0,
    transferred: 0,
    avoided: 0,
    closed: 0,
  });
  const [byLevel, setByLevel] = useState<Record<RiskLevel, number>>({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  });
  const [byCategory, setByCategory] = useState<Record<string, number>>({});

  const filterObj: RiskFilter = useMemo(
    () => ({
      search: searchTerm || undefined,
      status: statusFilter,
      level: levelFilter,
      category: categoryFilter || undefined,
    }),
    [searchTerm, statusFilter, levelFilter, categoryFilter],
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, levelFilter, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      setError(null);

      // Fetch risks and stats in parallel
      const [riskData, statsData] = await Promise.all([
        riskService.getRisks({
          ...filterObj,
          search: searchTerm || undefined,
        }),
        riskService.getStats({
          status: statusFilter,
          level: levelFilter,
          category: categoryFilter || undefined,
        }),
      ]);

      setRisks(riskData);
      setTotalCount(statsData.total);
      setByStatus(statsData.byStatus);
      setByLevel(statsData.byLevel);
      setByCategory(statsData.byCategory);
    } catch (err: any) {
      console.error("Error loading risks:", err);
      setError("Failed to load risks. Please try again.");
      toast.error("Failed to load risks");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const filteredRisks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return risks.filter((r) => {
      const matchesSearch =
        !term ||
        r.title.toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term) ||
        (r.category || "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesLevel = levelFilter === "all" || r.risk_level === levelFilter;
      const matchesCategory =
        !categoryFilter ||
        (r.category || "").toLowerCase().includes(categoryFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesLevel && matchesCategory;
    });
  }, [risks, searchTerm, statusFilter, levelFilter, categoryFilter]);

  const categoriesList = useMemo(() => {
    const keys = Object.keys(byCategory);
    return keys.sort((a, b) => (byCategory[b] || 0) - (byCategory[a] || 0));
  }, [byCategory]);

  const StatusPill: React.FC<{ status: RiskStatus }> = ({ status }) => {
    const color =
      status === "closed"
        ? "bg-gray-100 text-gray-800"
        : status === "identified"
        ? "bg-blue-100 text-blue-800"
        : status === "assessed"
        ? "bg-indigo-100 text-indigo-800"
        : status === "treating"
        ? "bg-yellow-100 text-yellow-800"
        : status === "monitoring"
        ? "bg-sky-100 text-sky-800"
        : status === "accepted"
        ? "bg-green-100 text-green-800"
        : status === "transferred"
        ? "bg-purple-100 text-purple-800"
        : status === "avoided"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-gray-100 text-gray-800";

    const label = status
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", color)}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading risks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Risks</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const total = totalCount;
  const totalOpen = total - byStatus.closed;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
          <p className="text-gray-600 mt-2">
            Discover, assess, treat, and monitor enterprise-wide risks.
          </p>
        </div>

        {checkPermission(["auditor", "supervisor_auditor", "admin", "super_admin"]) && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => navigate("/risks/create")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Risk
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Risks</p>
              <p className="text-2xl font-semibold text-gray-900">{statsLoading ? "…" : total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Open (not closed)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "…" : totalOpen}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Low/Medium</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "…" : (byLevel.low + byLevel.medium)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">High/Critical</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "…" : (byLevel.high + byLevel.critical)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search risks by title, description, category…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadData();
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Apply
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusOption)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusOrder.map((s) => (
                <option key={s} value={s}>
                  {s
                    .split("_")
                    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
                    .join(" ")}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LevelOption)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <input
              type="text"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Filter by Category"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Category quick chips */}
      {categoriesList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoriesList.slice(0, 12).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs border",
                categoryFilter === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
              )}
            >
              {cat} ({byCategory[cat]})
            </button>
          ))}
          {categoriesList.length > 12 && (
            <span className="text-xs text-gray-500 self-center">
              +{categoriesList.length - 12} more
            </span>
          )}
        </div>
      )}

      {/* Risks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No risks found</h3>
            <p className="text-gray-600 mb-6">
              {risks.length === 0
                ? "Get started by creating your first risk."
                : "Try adjusting your search or filter criteria."}
            </p>
            {checkPermission(["auditor", "supervisor_auditor", "admin", "super_admin"]) &&
              risks.length === 0 && (
                <button
                  onClick={() => navigate("/risks/create")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Risk
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRisks.map((risk, idx) => (
                  <motion.tr
                    key={risk.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                          <Layers className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => navigate(`/risks/${risk.id}`)}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {risk.title}
                          </button>
                          {risk.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {risk.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          levelColors[risk.risk_level],
                        )}
                      >
                        {risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={risk.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Layers className="w-4 h-4 text-gray-400 mr-2" />
                        {risk.category || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Inherent: {risk.inherent_risk_score ?? "-"}</div>
                        <div className="text-gray-500">
                          Residual: {risk.residual_risk_score ?? "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                          Next Review: {risk.next_review_date ?? "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Target Date: {risk.target_date ?? "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/risks/${risk.id}`)}
                          className="text-gray-500 hover:text-blue-600 text-sm"
                        >
                          View
                        </button>
                        {checkPermission(["auditor", "supervisor_auditor", "admin", "super_admin"]) && (
                          <button
                            onClick={() => navigate(`/risks/${risk.id}/edit`)}
                            className="text-gray-500 hover:text-blue-600 text-sm"
                          >
                            Edit
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

export default RisksList;
