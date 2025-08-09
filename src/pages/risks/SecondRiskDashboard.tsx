import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Grid, TrendingUp, Gauge, FileDown, DollarSign, Percent } from "lucide-react";
import riskService, { Risk, RiskFilter } from "../../services/riskService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { cn, getChartColors } from "../../utils";

type ExecMetric = {
  label: string;
  value: number;
  format?: "number" | "percent" | "currency";
  trend?: "up" | "down" | "flat";
  changePct?: number;
  status?: "green" | "amber" | "red";
  subLabel?: string;
  target?: number;
};

const COLORS = getChartColors(12);

// Helpers reused from first dashboard for consistency
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

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div className="bg-white border rounded-lg">
    <div className="px-4 py-3 border-b flex items-center justify-between">
      <div className="text-sm font-medium text-gray-900">{title}</div>
      <div>{right}</div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const ExecutiveSummaryCard: React.FC<{ metrics: ExecMetric[] }> = ({ metrics }) => {
  const fmt = (m: ExecMetric) => {
    if (m.format === "percent") return `${m.value.toFixed(1)}%`;
    if (m.format === "currency") return Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(m.value);
    return Intl.NumberFormat().format(m.value);
  };
  const TrendIcon = ({ t }: { t?: ExecMetric["trend"] }) =>
    t === "up" ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : t === "down" ? <ArrowDownRight className="w-4 h-4 text-red-600" /> : <Minus className="w-4 h-4 text-gray-400" />;
  const statusRing = (s?: ExecMetric["status"]) => (s === "green" ? "ring-emerald-200" : s === "amber" ? "ring-amber-200" : s === "red" ? "ring-red-200" : "ring-gray-200");
  const iconByFormat = (fmt: ExecMetric["format"]) =>
    fmt === "currency" ? <DollarSign className="w-4 h-4 text-emerald-600" /> : fmt === "percent" ? <Percent className="w-4 h-4 text-blue-600" /> : <TrendingUp className="w-4 h-4 text-gray-500" />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className={cn("p-4 rounded-lg border ring-1", statusRing(m.status))}>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div>{iconByFormat(m.format)}</div>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-900">{fmt(m)}</div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <TrendIcon t={m.trend} />
              {m.changePct !== undefined && <span>{m.changePct > 0 ? "+" : ""}{m.changePct.toFixed(1)}%</span>}
            </div>
          </div>
          {m.target !== undefined && (
            <div className="mt-1 text-[11px] text-gray-600">Target: {m.format === "percent" ? `${m.target.toFixed(0)}%` : m.format === "currency" ? Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(m.target) : m.target}</div>
          )}
          <div className="mt-1 text-[11px] text-gray-500">{m.subLabel ?? "YTD"}</div>
        </div>
      ))}
    </div>
  );
};

const RiskHeatMap: React.FC<{ risks: Risk[]; size?: 3 | 4 | 5 }> = ({ risks, size = 5 }) => {
  const buckets = useMemo(() => {
    const map = new Map<string, Risk[]>();
    for (let p = 1; p <= size; p++) for (let i = 1; i <= size; i++) map.set(`${p}-${i}`, []);
    for (const r of risks) {
      const p = Number((r as any).probability ?? 0);
      const i = Number((r as any).impact ?? 0);
      if (p >= 1 && p <= size && i >= 1 && i <= size) map.get(`${p}-${i}`)!.push(r);
    }
    return map;
  }, [risks, size]);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-6 gap-2 min-w-[560px]">
        <div />
        {Array.from({ length: size }, (_, i) => i + 1).map((i) => (
          <div key={`impact-${i}`} className="text-center text-xs text-gray-500">Impact {i}</div>
        ))}
        {Array.from({ length: size }, (_, p) => p + 1).map((p) => (
          <React.Fragment key={`row-${p}`}>
            <div className="text-xs text-gray-500 self-center">P{p}</div>
            {Array.from({ length: size }, (_, i) => i + 1).map((i) => {
              const key = `${p}-${i}`;
              const list = buckets.get(key) || [];
              const score = p * i;
              const cellColor = appetiteColorByScore(score);
              return (
                <div key={key} className={cn("min-h-[80px] rounded border p-2", cellColor)}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">P{p}×I{i}={score}</span>
                    <span className="text-[11px] capitalize">{score >= 20 ? "critical" : score >= 12 ? "high" : score >= 6 ? "medium" : "low"}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {list.slice(0, 3).map((r) => (
                      <div key={r.id} className="text-xs bg-white/80 rounded border px-2 py-1" title={r.title}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{r.title}</span>
                          <span className={cn("px-1.5 py-0.5 rounded text-[10px] capitalize", levelBg[(r as any).risk_level] || "bg-gray-50")}>
                            {(r as any).risk_level}
                          </span>
                        </div>
                      </div>
                    ))}
                    {list.length > 3 && <div className="text-[10px] text-gray-600">+{list.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const RiskDistributionChart: React.FC<{ by: Record<string, number>; title: string }> = ({ by, title }) => {
  const total = Object.values(by).reduce((a, b) => a + b, 0);
  return (
    <SectionCard title={title}>
      <div className="space-y-2">
        {Object.entries(by).map(([k, v], idx) => {
          const color = COLORS[idx % COLORS.length];
          const label = k.replace(/_/g, " ");
          return (
            <div key={k} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <div className="text-xs capitalize w-36 truncate">{label}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded">
                <div className="h-2 rounded" style={{ width: `${total ? (v / total) * 100 : 0}%`, backgroundColor: color }} />
              </div>
              <div className="text-xs text-gray-600 w-10 text-right">{v}</div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

const TrendAnalysisChart: React.FC<{ series: Array<{ label: string; points: Array<[string, number]> }> }> = ({ series }) => {
  const PAD = 8;
  const W = 360;
  const H = 120;
  const allPoints = series.flatMap((s) => s.points);
  const max = Math.max(1, ...allPoints.map(([, v]) => v));
  const n = Math.max(1, ...series.map((s) => s.points.length));
  const step = (W - PAD * 2) / (n - 1 || 1);

  return (
    <SectionCard title="Trend Analysis">
      <svg className="w-full h-36" viewBox={`0 0 ${W} ${H}`}>
        <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
        {series.map((s, sidx) => {
          const color = COLORS[sidx % COLORS.length];
          const pts = s.points.map(([, v], idx) => {
            const x = PAD + idx * step;
            const y = H - PAD - (v / max) * (H - PAD * 2);
            return `${x},${y}`;
          });
          return (
            <g key={s.label}>
              {pts.length > 1 && <polyline fill="none" stroke={color} strokeWidth="2" points={pts.join(" ")} />}
              {s.points.map(([, v], idx) => {
                const x = PAD + idx * step;
                const y = H - PAD - (v / max) * (H - PAD * 2);
                return <circle key={idx} cx={x} cy={y} r="2.5" fill={color} />;
              })}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        {series.map((s, idx) => (
          <span key={s.label} className="text-[11px] text-gray-700 bg-gray-50 border px-1.5 py-0.5 rounded">
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            {s.label}
          </span>
        ))}
      </div>
    </SectionCard>
  );
};

const GaugeWidget: React.FC<{ label: string; value: number; min?: number; max?: number; zones?: { green: number; amber: number; red: number } }> = ({
  label,
  value,
  min = 0,
  max = 100,
}) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  let bar = "bg-emerald-500";
  if (pct >= 66) bar = "bg-red-500";
  else if (pct >= 33) bar = "bg-amber-500";
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Gauge className="w-4 h-4 text-gray-500" />
        {label}
      </div>
      <div className="mt-2 h-2 bg-gray-100 rounded">
        <div className={cn("h-2 rounded", bar)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-gray-600">{value}/{max}</div>
    </div>
  );
};

const RiskRegisterSummary: React.FC<{ risks: Risk[] }> = ({ risks }) => {
  return (
    <SectionCard
      title="Risk Register Summary"
      right={
        <button className="inline-flex items-center px-2 py-1 border rounded text-xs hover:bg-gray-50">
          <FileDown className="w-4 h-4 mr-1" /> Export CSV
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Level</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {risks.slice(0, 10).map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 pr-4 max-w-xs truncate">{r.title}</td>
                <td className="py-2 pr-4">{r.category || "-"}</td>
                <td className="py-2 pr-4">
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] capitalize", levelBg[(r as any).risk_level] || "bg-gray-50")}>
                    {(r as any).risk_level}
                  </span>
                </td>
                <td className="py-2 pr-4 capitalize">{(r as any).status}</td>
                <td className="py-2 pr-4">{(r as any).created_at?.slice(0, 10) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {risks.length > 10 && (
          <div className="mt-2 text-[11px] text-gray-600">+{risks.length - 10} more…</div>
        )}
      </div>
    </SectionCard>
  );
};

const ControlEffectivenessPanel: React.FC<{ byStatus: Record<string, number> }> = ({ byStatus }) => {
  const order = ["highly effective", "effective", "partially effective", "ineffective"];
  const normalized: Record<string, number> = {};
  for (const k of Object.keys(byStatus)) normalized[k.toLowerCase()] = byStatus[k] ?? 0;

  return (
    <SectionCard title="Control Effectiveness">
      <div className="space-y-2">
        {order.map((k, idx) => {
          const v = normalized[k] ?? 0;
          const color = COLORS[(idx + 4) % COLORS.length];
          return (
            <div key={k} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <div className="text-xs capitalize w-40">{k}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded">
                <div className="h-2 rounded" style={{ width: `${v}%`, backgroundColor: color }} />
              </div>
              <div className="text-xs text-gray-600 w-8 text-right">{v}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-gray-500">Sample placeholders; connect to real control test data when available.</div>
    </SectionCard>
  );
};

const ComplianceStatusPanel: React.FC<{ frameworks: Array<{ name: string; score: number }> }> = ({ frameworks }) => {
  return (
    <SectionCard title="Compliance Status">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {frameworks.map((f, idx) => {
          const color = f.score >= 85 ? "text-emerald-600" : f.score >= 70 ? "text-amber-600" : "text-red-600";
          return (
            <div key={f.name} className="p-3 border rounded-lg">
              <div className="text-sm text-gray-700">{f.name}</div>
              <div className={cn("text-2xl font-semibold", color)}>{f.score.toFixed(0)}%</div>
              <div className="text-[11px] text-gray-500">Score trend placeholder</div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

const SecondRiskDashboard: React.FC = () => {
  const navigate = useNavigate();

  // state
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<RiskFilter>({
    status: (localStorage.getItem("risk.dash2.status") as any) || "all",
    level: (localStorage.getItem("risk.dash2.level") as any) || "all",
    category: localStorage.getItem("risk.dash2.category") || undefined,
    search: localStorage.getItem("risk.dash2.search") || undefined,
  });

  useEffect(() => {
    localStorage.setItem("risk.dash2.status", (filter.status as any) ?? "all");
    localStorage.setItem("risk.dash2.level", (filter.level as any) ?? "all");
    localStorage.setItem("risk.dash2.category", filter.category ?? "");
    localStorage.setItem("risk.dash2.search", filter.search ?? "");
  }, [filter]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await riskService.getRisks(filter);
      setRisks(data);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to load risks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.status, filter.level, filter.category, filter.search]);

  // derived data
  const total = risks.length;
  const byLevel = useMemo(() => {
    const acc: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const r of risks) acc[(r as any).risk_level] = (acc[(r as any).risk_level] ?? 0) + 1;
    return acc;
  }, [risks]);

  const byCategory = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const r of risks) {
      const c = r.category || "Uncategorized";
      acc[c] = (acc[c] ?? 0) + 1;
    }
    return acc;
  }, [risks]);

  const byStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const r of risks) {
      const s = (r as any).status || "unknown";
      acc[s] = (acc[s] ?? 0) + 1;
    }
    return acc;
  }, [risks]);

  const trendSeries = useMemo(() => {
    const byMonth: Record<string, number> = {};
    for (const r of risks) {
      const m = (r.created_at || "").slice(0, 7);
      if (!m) continue;
      byMonth[m] = (byMonth[m] ?? 0) + 1;
    }
    const entries = Object.entries(byMonth).sort(([a], [b]) => (a > b ? 1 : -1));
    return [{ label: "New Risks", points: entries as Array<[string, number]> }];
  }, [risks]);

  const execMetrics: ExecMetric[] = useMemo(() => {
    const openCount = risks.filter((r) => (r as any).status !== "closed").length;
    const highCrit = risks.filter((r) => ["high", "critical"].includes((r as any).risk_level)).length;
    const lowMed = (byLevel.low ?? 0) + (byLevel.medium ?? 0);
    return [
      { label: "Total Risks", value: total, format: "number", trend: "flat", changePct: 0, status: "amber" },
      { label: "Open", value: openCount, format: "number", trend: "up", changePct: 2.1, status: openCount > 0 ? "amber" : "green" },
      { label: "High/Critical", value: highCrit, format: "number", trend: highCrit > 0 ? "up" : "flat", changePct: highCrit ? 1.2 : 0, status: highCrit >= 5 ? "red" : highCrit > 0 ? "amber" : "green" },
      { label: "Low/Medium", value: lowMed, format: "number", trend: "down", changePct: -0.8, status: "green" },
    ];
  }, [total, risks, byLevel]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading second risk dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Second Risk Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Executive KPIs, configurable heat map, distributions, trends, KRI gauges, register summary, control effectiveness, and compliance status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void load()} className="inline-flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50" title="Refresh">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </button>
          <button onClick={() => navigate("/risks")} className="inline-flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50">
            Back to List
          </button>
        </div>
      </div>

      {/* Filters (simple for now) */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Search</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={filter.search || ""} onChange={(e) => setFilter({ ...filter, search: e.target.value || undefined })} placeholder="Title, description, category" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Status</label>
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={(filter.status as any) || "all"} onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}>
              {["all","identified","assessed","treating","monitoring","accepted","transferred","avoided","closed"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Level</label>
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={(filter.level as any) || "all"} onChange={(e) => setFilter({ ...filter, level: e.target.value as any })}>
              {["all","low","medium","high","critical"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Category</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={filter.category || ""} onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })} placeholder="e.g., Operations" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setFilter({ status: "all", level: "all" })}>Clear</button>
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={() => void load()}>Apply</button>
        </div>
      </div>

      {/* Executive Summary */}
      <SectionCard title="Executive Summary" right={<AlertTriangle className="w-4 h-4 text-orange-600" />}>
        <ExecutiveSummaryCard metrics={execMetrics} />
        <div className="mt-3 text-[11px] text-gray-500">
          Supports: number, percent, currency; arrows; traffic light status; alert thresholds (placeholder logic).
        </div>
      </SectionCard>

      {/* Heat Map + Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Risk Heat Map" right={<div className="flex items-center gap-2 text-xs text-gray-600"><Grid className="w-4 h-4" /><span>5x5</span></div>}>
            <RiskHeatMap risks={risks} size={5} />
            <div className="mt-2 text-[11px] text-gray-500">Hover tooltips and zoom placeholders. Click-through to details can be added.</div>
          </SectionCard>
        </div>
        <div className="space-y-6">
          <RiskDistributionChart by={byLevel} title="Distribution by Level" />
          <RiskDistributionChart by={byStatus} title="Distribution by Status" />
        </div>
      </div>

      {/* Trend Analysis */}
      <TrendAnalysisChart series={trendSeries} />

      {/* KRI Widgets */}
      <SectionCard title="Key Risk Indicators (KRIs)" right={<TrendingUp className="w-4 h-4 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <GaugeWidget label="Residual Risk (avg)" value={Math.min(100, total ? (Object.entries(byLevel).reduce((acc, [k, v]) => {
            const weight = k === "critical" ? 25 : k === "high" ? 20 : k === "medium" ? 10 : 5;
            return acc + weight * (v / total);
          }, 0) * 4) : 0)} />
          <GaugeWidget label="Open Risks %" value={total ? (risks.filter((r) => (r as any).status !== "closed").length / total) * 100 : 0} />
          <GaugeWidget label="On Target vs. Target Date" value={42} />
        </div>
        <div className="mt-3 text-[11px] text-gray-500">Threshold zones: green/yellow/red by bar color. Hook to alerts when thresholds exceeded.</div>
      </SectionCard>

      {/* Register Summary */}
      <RiskRegisterSummary risks={risks} />

      {/* Control Effectiveness */}
      <ControlEffectivenessPanel byStatus={{ "Highly Effective": 55, Effective: 25, "Partially Effective": 15, Ineffective: 5 }} />

      {/* Compliance Status */}
      <ComplianceStatusPanel frameworks={[{ name: "SOX", score: 82 }, { name: "GDPR", score: 74 }, { name: "HIPAA", score: 68 }]} />

      {/* Errors */}
      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">{error}</div>}
    </div>
  );
};

export default SecondRiskDashboard;