import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import lossEventService, { LossEvent } from "../../services/lossEventService";

const emptyForm: Partial<LossEvent> = {
  occurred_at: new Date().toISOString().slice(0, 10),
  discovered_at: undefined,
  business_unit: "",
  category: "",
  subcategory: "",
  description: "",
  direct_loss: 0,
  indirect_loss: 0,
  currency: "USD",
  root_cause: "",
  control_failures: "",
  status: "open",
};

const LossEventManagement: React.FC = () => {
  const [items, setItems] = useState<LossEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<LossEvent>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await lossEventService.list();
      setItems(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await lossEventService.update(editingId, form);
    } else {
      await lossEventService.create(form);
    }
    await load();
    reset();
  };

  const edit = (row: LossEvent) => {
    setEditingId(row.id);
    setForm({ ...row });
  };

  const remove = async (id: string) => {
    await lossEventService.remove(id);
    await load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loss Event Management</h1>
          <p className="text-gray-600">Operational loss tracking and analysis</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={save} className="bg-white border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Occurred At</label>
          <input
            type="date"
            required
            value={form.occurred_at || ""}
            onChange={(e) => setForm((p) => ({ ...p, occurred_at: e.target.value }))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Discovered At</label>
          <input
            type="date"
            value={form.discovered_at || ""}
            onChange={(e) => setForm((p) => ({ ...p, discovered_at: e.target.value }))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Business Unit</label>
          <input
            type="text"
            value={form.business_unit || ""}
            onChange={(e) => setForm((p) => ({ ...p, business_unit: e.target.value }))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Category</label>
          <input
            type="text"
            value={form.category || ""}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Direct Loss</label>
          <input
            type="number"
            step="0.01"
            value={form.direct_loss ?? 0}
            onChange={(e) => setForm((p) => ({ ...p, direct_loss: parseFloat(e.target.value) }))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Indirect Loss</label>
          <input
            type="number"
            step="0.01"
            value={form.indirect_loss ?? 0}
            onChange={(e) => setForm((p) => ({ ...p, indirect_loss: parseFloat(e.target.value) }))}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-700">Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="mt-1 w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="px-4 py-2 border rounded">Cancel</button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="p-3">Occurred</th>
              <th className="p-3">Business Unit</th>
              <th className="p-3">Category</th>
              <th className="p-3">Direct</th>
              <th className="p-3">Indirect</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan={7}>Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>No events yet.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.occurred_at}</td>
                  <td className="p-3">{row.business_unit}</td>
                  <td className="p-3">{row.category}</td>
                  <td className="p-3">{row.direct_loss?.toFixed?.(2)}</td>
                  <td className="p-3">{row.indirect_loss?.toFixed?.(2)}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => edit(row)} className="px-2 py-1 border rounded flex items-center text-sm"><Pencil className="w-4 h-4 mr-1"/>Edit</button>
                    <button onClick={() => remove(row.id)} className="px-2 py-1 border rounded flex items-center text-sm text-red-600"><Trash2 className="w-4 h-4 mr-1"/>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LossEventManagement;


