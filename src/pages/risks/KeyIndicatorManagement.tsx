import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, LineChart } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";
import indicatorService, { KeyIndicator, KeyIndicatorReading } from "../../services/indicatorService";

const emptyIndicator: Partial<KeyIndicator> = {
  name: "",
  description: "",
  unit: "",
  target: undefined,
  threshold_warning: undefined,
  threshold_critical: undefined,
  direction: "higher_is_better",
};

const KeyIndicatorManagement: React.FC = () => {
  const [indicators, setIndicators] = useState<KeyIndicator[]>([]);
  const [form, setForm] = useState<Partial<KeyIndicator>>(emptyIndicator);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [readings, setReadings] = useState<Record<string, KeyIndicatorReading[]>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const load = async () => {
    const list = await indicatorService.list();
    setIndicators(list);
    const all: Record<string, KeyIndicatorReading[]> = {};
    for (const ind of list) {
      all[ind.id] = await indicatorService.readings(ind.id);
    }
    setReadings(all);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyIndicator);
    setEditingId(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await indicatorService.update(editingId, form);
    } else {
      await indicatorService.create(form);
    }
    await load();
    reset();
  };

  const addReading = async (ind: KeyIndicator) => {
    const today = new Date().toISOString().slice(0, 10);
    const value = Number(prompt("Enter reading value:"));
    if (Number.isFinite(value)) {
      await indicatorService.addReading(ind.id, { reading_date: today, value });
      await load();
    }
  };

  const statusFor = (ind: KeyIndicator, val?: number) => {
    if (val == null) return "-";
    const warn = ind.threshold_warning ?? undefined;
    const crit = ind.threshold_critical ?? undefined;
    if (ind.direction === "higher_is_better") {
      if (crit != null && val < crit) return "critical";
      if (warn != null && val < warn) return "warning";
      return "ok";
    } else {
      if (crit != null && val > crit) return "critical";
      if (warn != null && val > warn) return "warning";
      return "ok";
    }
  };

  const summary = useMemo(() => {
    let ok = 0, warn = 0, crit = 0;
    for (const ind of indicators) {
      const latest = readings[ind.id]?.[0]?.value;
      const s = statusFor(ind, latest);
      if (s === "critical") crit++; else if (s === "warning") warn++; else if (s === "ok") ok++;
    }
    return { total: indicators.length, ok, warn, crit };
  }, [indicators, readings]);

  const selectedSeries = useMemo(() => {
    if (!selected) return [] as Array<{ date: string; value: number }>;
    const pts = (readings[selected] || []).slice().reverse();
    return pts.map((r) => ({ date: r.reading_date, value: r.value }));
  }, [selected, readings]);

  const Sparkline: React.FC<{ series: Array<{ date: string; value: number }> }> = ({ series }) => {
    const PAD = 3, W = 80, H = 24;
    if (!series || series.length === 0) return <svg width={W} height={H} />;
    const max = Math.max(1, ...series.map((p) => p.value));
    const step = (W - PAD * 2) / (series.length - 1 || 1);
    const points = series.map((p, i) => {
      const x = PAD + i * step;
      const y = H - PAD - (p.value / max) * (H - PAD * 2);
      return `${x},${y}`;
    });
    return (
      <svg width={W} height={H} className="text-blue-600">
        <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points.join(" ")} />
      </svg>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Key Indicator Management</h1>
          <p className="text-gray-600">KRI/KPI monitoring and alerting</p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Indicators</div>
          <div className="text-2xl font-semibold">{summary.total}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">OK</div>
          <div className="text-2xl font-semibold text-green-600">{summary.ok}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Warning</div>
          <div className="text-2xl font-semibold text-amber-600">{summary.warn}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Critical</div>
          <div className="text-2xl font-semibold text-red-600">{summary.crit}</div>
        </div>
      </div>

      {/* Indicator Form */}
      <form onSubmit={save} className="bg-white border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-sm text-gray-700">Name</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={form.name || ""} onChange={(e)=>setForm(p=>({...p, name: e.target.value}))} required />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm text-gray-700">Unit</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={form.unit || ""} onChange={(e)=>setForm(p=>({...p, unit: e.target.value}))} />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm text-gray-700">Direction</label>
          <select className="mt-1 w-full border rounded px-3 py-2" value={form.direction || "higher_is_better"} onChange={(e)=>setForm(p=>({...p, direction: e.target.value as any}))}>
            <option value="higher_is_better">Higher is better</option>
            <option value="lower_is_better">Lower is better</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm text-gray-700">Description</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={form.description || ""} onChange={(e)=>setForm(p=>({...p, description: e.target.value}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Target</label>
          <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.target ?? ""} onChange={(e)=>setForm(p=>({...p, target: e.target.value ? Number(e.target.value): undefined}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Warn Threshold</label>
          <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.threshold_warning ?? ""} onChange={(e)=>setForm(p=>({...p, threshold_warning: e.target.value ? Number(e.target.value): undefined}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Critical Threshold</label>
          <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={form.threshold_critical ?? ""} onChange={(e)=>setForm(p=>({...p, threshold_critical: e.target.value ? Number(e.target.value): undefined}))} />
        </div>
        <div className="sm:col-span-3 flex gap-3">
          <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingId ? <Pencil className="w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2"/>}
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && <button type="button" onClick={reset} className="px-4 py-2 border rounded">Cancel</button>}
        </div>
      </form>

      {/* Indicators + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Trend</th>
              <th className="p-3">Latest</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {indicators.length === 0 ? (
              <tr><td className="p-4" colSpan={5}>No indicators yet.</td></tr>
            ) : (
              indicators.map((ind) => {
                const latest = readings[ind.id]?.[0];
                const st = statusFor(ind, latest?.value);
                const series = (readings[ind.id] || []).slice(0, 12).reverse().map(r => ({ date: r.reading_date, value: r.value }));
                return (
                  <tr key={ind.id} className={`border-t ${selected===ind.id ? 'bg-blue-50/40' : ''}`} onClick={()=>setSelected(ind.id)}>
                    <td className="p-3 font-medium cursor-pointer">{ind.name}</td>
                    <td className="p-3">{ind.unit}</td>
                    <td className="p-3"><Sparkline series={series} /></td>
                    <td className="p-3">{latest ? `${latest.value} on ${latest.reading_date}` : '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${st==='ok' ? 'bg-green-100 text-green-700' : st==='warning' ? 'bg-yellow-100 text-yellow-800' : st==='critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{st}</span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => { setEditingId(ind.id); setForm(ind); }} className="px-2 py-1 border rounded flex items-center text-sm"><Pencil className="w-4 h-4 mr-1"/>Edit</button>
                      <button onClick={() => indicatorService.remove(ind.id).then(load)} className="px-2 py-1 border rounded flex items-center text-sm text-red-600"><Trash2 className="w-4 h-4 mr-1"/>Delete</button>
                      <button onClick={() => addReading(ind)} className="px-2 py-1 border rounded flex items-center text-sm"><LineChart className="w-4 h-4 mr-1"/>Add Reading</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Detail Panel with Chart */}
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Indicator Detail</div>
          {!selected ? (
            <div className="text-gray-500">Select an indicator to view its trend.</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={selectedSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" hide={selectedSeries.length > 20} />
                  <YAxis />
                  <Tooltip />
                  {/* Threshold guides if available */}
                  {(() => {
                    const ind = indicators.find(i => i.id === selected);
                    if (!ind) return null;
                    const comps = [] as any[];
                    if (ind.threshold_warning != null) comps.push(<ReferenceLine key="w" y={ind.threshold_warning} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Warn', position: 'insideTopRight', fill: '#92400e' }} />);
                    if (ind.threshold_critical != null) comps.push(<ReferenceLine key="c" y={ind.threshold_critical} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical', position: 'insideTopRight', fill: '#7f1d1d' }} />);
                    if (ind.target != null) comps.push(<ReferenceLine key="t" y={ind.target} stroke="#10b981" strokeDasharray="2 2" label={{ value: 'Target', position: 'insideTopLeft', fill: '#065f46' }} />);
                    return comps;
                  })()}
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white border rounded-lg p-4">
        <div className="text-sm font-medium text-gray-900 mb-2">Status Distribution</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'OK', value: summary.ok },
              { name: 'Warning', value: summary.warn },
              { name: 'Critical', value: summary.crit },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4,4,0,0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KeyIndicatorManagement;


