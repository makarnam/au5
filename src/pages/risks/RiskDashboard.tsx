/* eslint-disable react-hooks/exhaustive-deps */
import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, AlertTriangle, Grid, ListChecks, RefreshCw, TrendingUp, PieChart, Info, Calendar, User, Tag, ExternalLink } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import riskService, { Risk, RiskFilter } from "../../services/riskService";
import { supabase } from "../../lib/supabase";
import RiskSearchFilters, { SavedFilter as SavedRiskFilter } from "../../components/risks/RiskSearchFilters";
import LoadingSpinner from "../../components/LoadingSpinner";
import { cn, getChartColors } from "../../utils";

/**
 * Risk Dashboard
 * - 5x5 risk matrix with drag & drop and keyboard drop support
 * - Backlog with reorder and persisted priority_order
 * - KPI cards + distributions + monthly trend sparkline (SVG)
 * - Selected risk details panel under matrix
 * - Enhanced hover tooltips with instant risk information
 */

type MatrixSize = 5;
type CellCoord = { p: number; i: number };
type DragItem = { type: "risk"; risk: Risk; from?: CellCoord | "backlog" };

// Visual helpers
const appetiteColorByScore = (score: number) => {
  if (score >= 20) return "bg-red-100 text-red-800 ring-1 ring-red-200";
  if (score >= 12) return "bg-orange-100 text-orange-800 ring-1 ring-orange-200";
  if (score >= 9) return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  if (score >= 6) return "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200";
  return "bg-green-100 text-green-800 ring-1 ring-green-200";
};

const levelBg: Record<string, string> = {
  low: "bg-green-50",
  medium: "bg-yellow-50",
  high: "bg-orange-50",
  critical: "bg-red-50",
};

const COLORS = getChartColors(10);

// Risk Detail Component
const RiskDetailPanel: React.FC<{ risk: Risk | null }> = ({ risk }) => {
  if (!risk) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Select a risk from the matrix to view details</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const getTrendIcon = (trend: string | null | undefined) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "decreasing": return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
      case "stable": return <div className="w-4 h-4 text-blue-500">—</div>;
      default: return <div className="w-4 h-4 text-gray-400">?</div>;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{risk.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelBg[risk.risk_level] || "bg-gray-50"}`}>
              {risk.risk_level}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {risk.status}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
              {risk.category}
            </span>
          </div>
        </div>
        <button
          onClick={() => window.open(`/risks/${risk.id}`, '_blank')}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Open risk details"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {risk.description && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{risk.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Assessment</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Probability:</span>
              <span className="font-medium">{risk.probability || "Not set"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Impact:</span>
              <span className="font-medium">{risk.impact || "Not set"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Inherent Score:</span>
              <span className="font-medium">{risk.inherent_risk_score || "Not set"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Residual Score:</span>
              <span className="font-medium">{risk.residual_risk_score || "Not set"}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Trends</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Likelihood:</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(risk.likelihood_trend)}
                <span className="capitalize">{risk.likelihood_trend || "Unknown"}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Impact:</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(risk.impact_trend)}
                <span className="capitalize">{risk.impact_trend || "Unknown"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {risk.mitigation_strategy && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Mitigation Strategy</h4>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{risk.mitigation_strategy}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Review Dates
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Last Review:</span>
              <span>{formatDate(risk.last_review_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Review:</span>
              <span>{formatDate(risk.next_review_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target Date:</span>
              <span>{formatDate(risk.target_date)}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
            <User className="w-4 h-4" />
            Risk Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Source:</span>
              <span>{risk.risk_source || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Review Frequency:</span>
              <span className="capitalize">{risk.review_frequency?.replace('_', ' ') || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span>{formatDate(risk.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {risk.tags && risk.tags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {risk.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {risk.external_reference && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">External Reference</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg break-all">{risk.external_reference}</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Risk Tooltip Component
const RiskTooltip: React.FC<{ risk: Risk; children: React.ReactNode }> = ({ risk, children }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const getTrendIcon = (trend: string | null | undefined) => {
    switch (trend) {
      case "increasing": return "↗";
      case "decreasing": return "↘";
      case "stable": return "→";
      default: return "?";
    }
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-50"
            sideOffset={5}
          >
            <div className="space-y-2">
              <div className="font-medium">{risk.title}</div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="capitalize">{risk.risk_level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">{risk.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span>{risk.category}</span>
                </div>
                {risk.probability && risk.impact && (
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span>P{risk.probability}×I{risk.impact} = {risk.probability * risk.impact}</span>
                  </div>
                )}
                {(risk.likelihood_trend || risk.impact_trend) && (
                  <div className="flex justify-between">
                    <span>Trends:</span>
                    <span>
                      L:{getTrendIcon(risk.likelihood_trend)} I:{getTrendIcon(risk.impact_trend)}
                    </span>
                  </div>
                )}
                {risk.mitigation_strategy && (
                  <div className="pt-1 border-t border-gray-700">
                    <div className="text-gray-300 font-medium mb-1">Mitigation:</div>
                    <div className="line-clamp-2 text-gray-300 text-[10px]">{risk.mitigation_strategy}</div>
                  </div>
                )}
                {risk.description && (
                  <div className="pt-1 border-t border-gray-700">
                    <div className="text-gray-300 font-medium mb-1">Description:</div>
                    <div className="line-clamp-2 text-gray-300 text-[10px]">{risk.description}</div>
                  </div>
                )}
                <div className="pt-1 border-t border-gray-700 text-gray-400 text-[10px]">
                  <div>Created: {formatDate(risk.created_at)}</div>
                  <div>Updated: {formatDate(risk.updated_at)}</div>
                  {risk.next_review_date && (
                    <div>Next Review: {formatDate(risk.next_review_date)}</div>
                  )}
                </div>
              </div>
            </div>
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

const RiskDashboard: React.FC = () => {
  const navigate = useNavigate();

  // data state
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  // filters
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("risk.dash.search") ?? "");
  const [statusFilter, setStatusFilter] = useState<RiskFilter["status"] | "all">(() => (localStorage.getItem("risk.dash.status") as any) || "all");
  const [levelFilter, setLevelFilter] = useState<RiskFilter["level"] | "all">(() => (localStorage.getItem("risk.dash.level") as any) || "all");
  const [categoryFilter, setCategoryFilter] = useState(() => localStorage.getItem("risk.dash.category") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedRiskFilter[]>(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("risk.dash.saved."));
    return keys
      .map((k) => {
        const name = k.replace("risk.dash.saved.", "");
        try {
          const payload = JSON.parse(localStorage.getItem(k) || "{}");
          return { name, payload } as SavedRiskFilter;
        } catch {
          return null;
        }
      })
      .filter((x): x is SavedRiskFilter => !!x);
  });

  useEffect(() => {
    localStorage.setItem("risk.dash.search", searchTerm);
    localStorage.setItem("risk.dash.status", statusFilter as string);
    localStorage.setItem("risk.dash.level", levelFilter as string);
    localStorage.setItem("risk.dash.category", categoryFilter);
  }, [searchTerm, statusFilter, levelFilter, categoryFilter]);

  const filterObj: RiskFilter = useMemo(
    () => ({
      search: searchTerm || undefined,
      status: statusFilter || "all",
      level: levelFilter || "all",
      category: categoryFilter || undefined,
    }),
    [searchTerm, statusFilter, levelFilter, categoryFilter],
  );

  // data load
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await riskService.getRisks({
        ...filterObj,
        search: searchTerm || undefined,
      });
      setRisks(list);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to load risks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
     
  }, [searchTerm, statusFilter, levelFilter, categoryFilter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRisk) {
        setSelectedRisk(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRisk]);

  // derived matrix buckets
  const matrixSize: MatrixSize = 5;
  const matrixBuckets = useMemo(() => {
    const buckets = new Map<string, Risk[]>();
    for (let p = 1; p <= matrixSize; p++) {
      for (let i = 1; i <= matrixSize; i++) {
        buckets.set(`${p}-${i}`, []);
      }
    }
    for (const r of risks) {
      const p = Number((r as any).probability ?? 0);
      const i = Number((r as any).impact ?? 0);
      if (p >= 1 && p <= matrixSize && i >= 1 && i <= matrixSize) {
        buckets.get(`${p}-${i}`)!.push(r);
      }
    }
    return buckets;
  }, [risks]);

  // backlog = not placed on matrix
  const backlog = useMemo(() => {
    const list = risks.filter((r) => {
      const p = (r as any).probability;
      const i = (r as any).impact;
      return !(p >= 1 && p <= matrixSize && i >= 1 && i <= matrixSize);
    });
    return list.sort((a, b) => {
      const ao = (a as any).priority_order ?? 999999;
      const bo = (b as any).priority_order ?? 999999;
      if (ao !== bo) return ao - bo;
      const ad = (a as any).created_at ?? "";
      const bd = (b as any).created_at ?? "";
      return ad > bd ? -1 : 1;
    });
  }, [risks]);

  // DnD + keyboard
  const [drag, setDrag] = useState<DragItem | null>(null);
  const keyboardDragRef = useRef<Risk | null>(null);

  const startDrag = (risk: Risk, from: DragItem["from"]) => (e: React.DragEvent) => {
    setDrag({ type: "risk", risk, from });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropToCell = (p: number, i: number) => async (e: React.DragEvent | { preventDefault: () => void }) => {
    e.preventDefault();
    const r = drag?.risk ?? keyboardDragRef.current;
    if (!r) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("risks").update({ probability: p, impact: i }).eq("id", r.id);
      if (error) throw error;
      setRisks((prev) => prev.map((x) => (x.id === r.id ? ({ ...x, probability: p, impact: i } as any) : x)));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to move risk");
    } finally {
      setSaving(false);
      setDrag(null);
      keyboardDragRef.current = null;
    }
  };

  const onDropToBacklog = async (e: React.DragEvent) => {
    e.preventDefault();
    const r = drag?.risk ?? keyboardDragRef.current;
    if (!r) return;
    try {
      setSaving(true);
      const { data: maxRow, error: maxErr } = await supabase
        .from("risks")
        .select("priority_order")
        .order("priority_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (maxErr) throw maxErr;
      const nextOrder = ((maxRow as any)?.priority_order ?? 0) + 1;
      const { error } = await supabase
        .from("risks")
        .update({ probability: null, impact: null, priority_order: nextOrder })
        .eq("id", r.id);
      if (error) throw error;
      setRisks((prev) =>
        prev.map((x) => (x.id === r.id ? ({ ...x, probability: null, impact: null, priority_order: nextOrder } as any) : x)),
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to move to backlog");
    } finally {
      setSaving(false);
      setDrag(null);
      keyboardDragRef.current = null;
    }
  };

  const handleCellKey = (p: number, i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && keyboardDragRef.current) {
      void onDropToCell(p, i)({ preventDefault() {} } as any);
    }
    if (e.key === "Escape") {
      keyboardDragRef.current = null;
    }
  };

  // Backlog bulk reorder helper (RPC optional; fallback sequential updates)
  const persistBacklogOrder = async (updates: Array<{ id: string; priority_order: number }>) => {
    // Try RPC if exists; otherwise, loop updates
    try {
      // Example RPC name: rpc_update_backlog_order (not guaranteed to exist)
      const { error: rpcErr } = await supabase.rpc("rpc_update_backlog_order", {
        p_updates: updates,
      } as any);
      if (rpcErr) {
        // fallback: sequential updates
        for (const u of updates) {
          const { error } = await supabase.from("risks").update({ priority_order: u.priority_order }).eq("id", u.id);
          if (error) throw error;
        }
      }
    } catch {
      // if RPC missing or fails, fallback already ran or will throw; swallow to let caller display error if needed
    }
  };

  const moveBacklogItem = async (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return;
    const items = [...backlog];
    const moved = items[dragIndex];
    items.splice(dragIndex, 1);
    items.splice(hoverIndex, 0, moved);
    const updates = items.map((r, idx) => ({ id: r.id, priority_order: idx + 1 }));
    setRisks((prev) => {
      const map = new Map(updates.map((u) => [u.id, u.priority_order]));
      return prev.map((r) => (map.has(r.id) ? ({ ...r, priority_order: map.get(r.id) } as any) : r));
    });
    try {
      setSaving(true);
      await persistBacklogOrder(updates);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to reorder backlog");
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  // KPIs
  const total = risks.length;
  const openCount = risks.filter((r) => (r as any).status !== "closed").length;
  const highCrit = risks.filter((r) => ["high", "critical"].includes((r as any).risk_level)).length;

  // Distributions
  const distByLevel = useMemo(() => {
    const acc: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const r of risks) acc[(r as any).risk_level] = (acc[(r as any).risk_level] ?? 0) + 1;
    return acc;
  }, [risks]);

  const distByStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const r of risks) {
      const s = (r as any).status || "unknown";
      acc[s] = (acc[s] ?? 0) + 1;
    }
    return acc;
  }, [risks]);

  // Monthly trend (created_at)
  const trendByMonth = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const r of risks) {
      const d = ((r as any).created_at || "").slice(0, 7);
      if (!d) continue;
      acc[d] = (acc[d] ?? 0) + 1;
    }
    const entries = Object.entries(acc).sort(([a], [b]) => (a > b ? 1 : -1));
    return entries;
  }, [risks]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading risk dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Drag risks on the matrix to update likelihood and impact. Reorder backlog to prioritize work.
            {selectedRisk && (
              <span className="ml-2 text-blue-600 font-medium">
                • Selected: {selectedRisk.title}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedRisk && (
            <button
              onClick={() => setSelectedRisk(null)}
              className="inline-flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50 text-gray-600"
              title="Clear selection"
            >
              <Info className="w-4 h-4 mr-2" />
              Clear Selection
            </button>
          )}
          <button
            onClick={() => void loadData()}
            className="inline-flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => navigate("/risks")}
            className="inline-flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Filters */}
      <RiskSearchFilters
        search={searchTerm}
        status={statusFilter as any}
        level={levelFilter as any}
        category={categoryFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={(v) => setStatusFilter(v)}
        onLevelChange={(v) => setLevelFilter(v)}
        onCategoryChange={setCategoryFilter}
        onApply={() => void loadData()}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setLevelFilter("all");
          setCategoryFilter("");
          void loadData();
        }}
        onSave={(name) => {
          const payload = {
            search: searchTerm || undefined,
            status: statusFilter,
            level: levelFilter,
            category: categoryFilter || undefined,
          } as RiskFilter & { status: any; level: any; category?: string; search?: string };
          localStorage.setItem(`risk.dash.saved.${name}`, JSON.stringify(payload));
          setSavedFilters((prev) => {
            const next = prev.filter((x) => x.name !== name).concat([{ name, payload }]);
            return next.sort((a, b) => a.name.localeCompare(b.name));
          });
        }}
        onLoadByName={(name) => {
          const raw = localStorage.getItem(`risk.dash.saved.${name}`);
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as RiskFilter & { status: any; level: any; category?: string; search?: string };
            setSearchTerm(parsed.search ?? "");
            setStatusFilter(parsed.status ?? "all");
            setLevelFilter(parsed.level ?? "all");
            setCategoryFilter(parsed.category ?? "");
            void loadData();
          } catch {
            // ignore
          }
        }}
        savedFilters={savedFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Risks</p>
              <p className="text-2xl font-semibold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-2xl font-semibold text-gray-900">{openCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">High/Critical</p>
              <p className="text-2xl font-semibold text-gray-900">{highCrit}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center">
            <PieChart className="w-6 h-6 text-violet-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Low/Med</p>
              <p className="text-2xl font-semibold text-gray-900">{(distByLevel.low ?? 0) + (distByLevel.medium ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix + Backlog */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Matrix */}
        <div className="xl:col-span-2 bg-white border rounded-lg">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center text-gray-900 font-medium">
              <Grid className="w-5 h-5 text-blue-600 mr-2" />
              5x5 Risk Matrix
            </div>
            {saving && <span className="text-xs text-gray-500">Saving…</span>}
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="grid grid-cols-6 gap-2">
              <div />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={`impact-${i}`} className="text-center text-xs text-gray-500">
                  Impact {i}
                </div>
              ))}
              {[1, 2, 3, 4, 5].map((p) => (
                <React.Fragment key={`prob-${p}`}>
                  <div className="text-xs text-gray-500 self-center">P{p}</div>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const key = `${p}-${i}`;
                    const bucket = matrixBuckets.get(key) || [];
                    const score = p * i;
                    const cellColor = appetiteColorByScore(score);
                    return (
                      <div
                        key={key}
                        className={cn(
                          "min-h-[96px] rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all",
                          cellColor,
                          bucket.some(r => selectedRisk?.id === r.id) && "ring-2 ring-blue-500 ring-opacity-50"
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDropToCell(p, i)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Drop here P${p} I${i}`}
                        onKeyDown={handleCellKey(p, i)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-700">
                            P{p}×I{i} = {score}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] capitalize">
                              {score >= 20 ? "critical" : score >= 12 ? "high" : score >= 6 ? "medium" : "low"}
                            </span>
                            {bucket.length > 0 && (
                              <span className="text-[10px] bg-white/80 px-1.5 py-0.5 rounded-full text-gray-600">
                                {bucket.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-col gap-1">
                          {bucket.map((r) => (
                            <RiskTooltip key={r.id} risk={r}>
                              <div
                                draggable
                                onDragStart={startDrag(r, { p, i })}
                                onFocus={() => {
                                  keyboardDragRef.current = r;
                                }}
                                onClick={() => setSelectedRisk(r)}
                                className={cn(
                                  "text-xs bg-white/80 hover:bg-white rounded border px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all relative",
                                  selectedRisk?.id === r.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-blue-50"
                                )}
                                tabIndex={0}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate">{r.title}</span>
                                  <div className="flex items-center gap-1">
                                    {selectedRisk?.id === r.id && (
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    )}
                                    <span
                                      className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] capitalize",
                                        levelBg[(r as any).risk_level] || "bg-gray-50",
                                      )}
                                    >
                                      {(r as any).risk_level}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </RiskTooltip>
                          ))}
                          {bucket.length === 0 && (
                            <div className="h-6 text-[10px] text-gray-500 flex items-center">Drop here</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Backlog */}
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center text-gray-900 font-medium">
              <ListChecks className="w-5 h-5 text-gray-700 mr-2" />
              Prioritized Backlog
            </div>
            {saving && <span className="text-xs text-gray-500">Saving…</span>}
          </div>
          <div className="p-4 min-h-[200px]" onDragOver={(e) => e.preventDefault()} onDrop={onDropToBacklog}>
            {backlog.length === 0 ? (
              <div className="text-sm text-gray-500">No backlog items</div>
            ) : (
              <ul className="space-y-2">
                {backlog.map((r, idx) => (
                  <RiskTooltip key={r.id} risk={r}>
                    <li 
                      className={cn(
                        "border rounded p-2 bg-white cursor-pointer transition-all",
                        selectedRisk?.id === r.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      )}
                      onClick={() => setSelectedRisk(r)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium truncate">{r.title}</div>
                            {selectedRisk?.id === r.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">{(r as any).category || "-"}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              idx > 0 && void moveBacklogItem(idx, idx - 1);
                            }}
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              idx < backlog.length - 1 && void moveBacklogItem(idx, idx + 1);
                            }}
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                          <button
                            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/risks/${r.id}`);
                            }}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </li>
                  </RiskTooltip>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Risk Detail Panel */}
      <RiskDetailPanel risk={selectedRisk} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level distribution */}
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Risk Level Distribution</div>
          <div className="space-y-2">
            {Object.entries(distByLevel).map(([lvl, val], idx) => {
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={lvl} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <div className="text-xs capitalize w-20">{lvl}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded">
                    <div className="h-2 rounded" style={{ width: `${total ? (val / total) * 100 : 0}%`, backgroundColor: color }} />
                  </div>
                  <div className="text-xs text-gray-600 w-10 text-right">{val}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status distribution */}
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Status Distribution</div>
          <div className="space-y-2">
            {Object.entries(distByStatus).map(([st, val], idx) => {
              const color = COLORS[(idx + 3) % COLORS.length];
              const label = typeof st === "string" ? st.replace(/_/g, " ") : String(st);
              return (
                <div key={st} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <div className="text-xs capitalize w-28">{label}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded">
                    <div className="h-2 rounded" style={{ width: `${total ? (val / total) * 100 : 0}%`, backgroundColor: color }} />
                  </div>
                  <div className="text-xs text-gray-600 w-10 text-right">{val}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend sparkline */}
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">New Risks per Month</div>
          <svg className="w-full h-24">
            {(() => {
              const PAD = 8;
              const W = 320,
                H = 80;
              const max = Math.max(1, ...trendByMonth.map(([, v]) => v));
              const n = Math.max(1, trendByMonth.length);
              const step = (W - PAD * 2) / (n - 1 || 1);
              const points = trendByMonth.map(([, v], idx) => {
                const x = PAD + idx * step;
                const y = H - PAD - (v / max) * (H - PAD * 2);
                return `${x},${y}`;
              });
              return (
                <>
                  <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
                  {points.length > 1 && <polyline fill="none" stroke="#3B82F6" strokeWidth="2" points={points.join(" ")} />}
                  {trendByMonth.map(([, v], idx) => {
                    const x = PAD + idx * step;
                    const y = H - PAD - (v / max) * (H - PAD * 2);
                    return <circle key={idx} cx={x} cy={y} r="2.5" fill="#3B82F6" />;
                  })}
                </>
              );
            })()}
          </svg>
          <div className="mt-2 flex flex-wrap gap-2">
            {trendByMonth.slice(-6).map(([m, v]) => (
              <span key={m} className="text-[11px] text-gray-600 bg-gray-50 border px-1.5 py-0.5 rounded">
                {m}: {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">{error}</div>}
    </div>
  );
};

export default RiskDashboard;