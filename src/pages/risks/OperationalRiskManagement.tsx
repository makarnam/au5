import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import operationalRiskService, { OperationalRisk } from "../../services/operationalRiskService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart as RLineChart,
  Line,
} from "recharts";

const emptyRisk: Partial<OperationalRisk> = {
  title: "",
  description: "",
  category: "",
  probability: 3,
  impact: 3,
  status: "identified",
  mitigation: "",
  review_frequency: "quarterly",
};

const OperationalRiskManagement: React.FC = () => {
  const [items, setItems] = useState<OperationalRisk[]>([]);
  const [form, setForm] = useState<Partial<OperationalRisk>>(emptyRisk);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const rows = await operationalRiskService.list();
    setItems(rows);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyRisk);
    setEditingId(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await operationalRiskService.update(editingId, form);
    } else {
      await operationalRiskService.create(form);
    }
    await load();
    reset();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operational Risk Management</h1>
          <p className="text-gray-600">Day-to-day operational risk register</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {(() => {
        const total = items.length;
        const byStatus = items.reduce<Record<string, number>>((acc, r) => { acc[r.status] = (acc[r.status]||0)+1; return acc; }, {});
        const high = items.filter(r => (r.probability ?? 0) * (r.impact ?? 0) >= 16).length;
        const medium = items.filter(r => (r.probability ?? 0) * (r.impact ?? 0) >= 9 && (r.probability ?? 0) * (r.impact ?? 0) < 16).length;
        const low = total - high - medium;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4"><div className="text-sm text-gray-600">Total</div><div className="text-2xl font-semibold">{total}</div></div>
            <div className="bg-white border rounded-lg p-4"><div className="text-sm text-gray-600">High Exposure</div><div className="text-2xl font-semibold text-red-600">{high}</div></div>
            <div className="bg-white border rounded-lg p-4"><div className="text-sm text-gray-600">Medium Exposure</div><div className="text-2xl font-semibold text-amber-600">{medium}</div></div>
            <div className="bg-white border rounded-lg p-4"><div className="text-sm text-gray-600">Low Exposure</div><div className="text-2xl font-semibold text-green-600">{low}</div></div>
          </div>
        );
      })()}

      <form onSubmit={save} className="bg-white border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-sm text-gray-700">Title</label>
          <input required className="mt-1 w-full border rounded px-3 py-2" value={form.title || ""} onChange={(e)=>setForm(p=>({...p, title: e.target.value}))} />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm text-gray-700">Category</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={form.category || ""} onChange={(e)=>setForm(p=>({...p, category: e.target.value}))} />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm text-gray-700">Status</label>
          <select className="mt-1 w-full border rounded px-3 py-2" value={form.status || "identified"} onChange={(e)=>setForm(p=>({...p, status: e.target.value as any}))}>
            <option>identified</option>
            <option>assessed</option>
            <option>treating</option>
            <option>monitoring</option>
            <option>accepted</option>
            <option>closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Probability (1-5)</label>
          <input type="number" min={1} max={5} className="mt-1 w-full border rounded px-3 py-2" value={form.probability ?? 3} onChange={(e)=>setForm(p=>({...p, probability: Number(e.target.value)}))} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Impact (1-5)</label>
          <input type="number" min={1} max={5} className="mt-1 w-full border rounded px-3 py-2" value={form.impact ?? 3} onChange={(e)=>setForm(p=>({...p, impact: Number(e.target.value)}))} />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm text-gray-700">Description</label>
          <textarea rows={3} className="mt-1 w-full border rounded px-3 py-2" value={form.description || ""} onChange={(e)=>setForm(p=>({...p, description: e.target.value}))} />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm text-gray-700">Mitigation</label>
          <textarea rows={2} className="mt-1 w-full border rounded px-3 py-2" value={form.mitigation || ""} onChange={(e)=>setForm(p=>({...p, mitigation: e.target.value}))} />
        </div>
        <div className="sm:col-span-3 flex gap-3">
          <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingId ? <Pencil className="w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2"/>}
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && <button type="button" onClick={reset} className="px-4 py-2 border rounded">Cancel</button>}
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">P x I</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="p-4" colSpan={5}>No operational risks yet.</td></tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">{r.category}</td>
                  <td className="p-3">{(r.probability ?? 0)} x {(r.impact ?? 0)}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => { setEditingId(r.id); setForm(r); }} className="px-2 py-1 border rounded flex items-center text-sm"><Pencil className="w-4 h-4 mr-1"/>Edit</button>
                    <button onClick={() => operationalRiskService.remove(r.id).then(load)} className="px-2 py-1 border rounded flex items-center text-sm text-red-600"><Trash2 className="w-4 h-4 mr-1"/>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>

        {/* Charts */}
        <div className="grid grid-rows-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">By Status</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(items.reduce<Record<string, number>>((acc, r) => { acc[r.status]=(acc[r.status]||0)+1; return acc; }, {})).map(([name, value])=>({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Exposure Trend (Mock)</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={[...Array(12)].map((_,i)=>({month: i+1, value: items.filter(r=>((r.probability??0)*(r.impact??0))>=12).length + Math.max(0, 5 - i)}))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalRiskManagement;


