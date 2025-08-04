import { useEffect, useState } from 'react';
import { ComplianceService } from '../../services/compliance';
import type { ComplianceFramework } from '../../types/compliance';
import { Button } from '../../components/ui/button';

export default function FrameworksList() {
  const [items, setItems] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [form, setForm] = useState<Partial<ComplianceFramework>>({
    code: '',
    name: '',
    version: '',
    authority: '',
    category: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ComplianceFramework>>({});
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await ComplianceService.listFrameworks();
    if (!error) setItems((data ?? []) as ComplianceFramework[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.code || !form.name) return;
    setSaving(true);
    const { data, error } = await ComplianceService.createFramework(form);
    setSaving(false);
    if (!error && data) {
      setForm({ code: '', name: '', version: '', authority: '', category: '', is_active: true });
      load();
    } else if (error) {
      alert(error.message);
    }
  };

  const startEdit = (fw: ComplianceFramework) => {
    setEditingId(fw.id);
    setEditForm({
      code: fw.code,
      name: fw.name,
      version: fw.version ?? '',
      authority: fw.authority ?? '',
      category: fw.category ?? '',
      is_active: fw.is_active,
      description: fw.description ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const update = async () => {
    if (!editingId) return;
    if (!editForm.code || !editForm.name) return;
    setUpdating(true);
    const { error } = await ComplianceService.updateFramework(editingId, editForm);
    setUpdating(false);
    if (!error) {
      cancelEdit();
      load();
    } else {
      alert(error.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this framework? This action cannot be undone.')) return;
    setDeletingId(id);
    const { error } = await ComplianceService.deleteFramework(id);
    setDeletingId(null);
    if (!error) {
      load();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Compliance Frameworks</h1>

      <div className="border rounded p-4 space-y-3 bg-white">
        <div className="font-medium">Create Framework</div>
        <div className="grid grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder="Code (e.g., ISO27001-2022)" value={form.code ?? ''} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Name" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Version" value={form.version ?? ''} onChange={(e) => setForm({ ...form, version: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Authority" value={form.authority ?? ''} onChange={(e) => setForm({ ...form, authority: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Category" value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <textarea className="border p-2 rounded col-span-2" placeholder="Description (optional)" value={(form as any).description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value as any })} />
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
        </div>
        <Button disabled={saving} onClick={create}>{saving ? 'Saving...' : 'Create'}</Button>
      </div>

      <div className="space-y-2">
        <div className="font-medium">Frameworks</div>
        {loading ? <div>Loading...</div> : null}
        <ul className="space-y-2">
          {items.map(fw => (
            <li key={fw.id} className="border rounded p-3 bg-white">
              {editingId === fw.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="border p-2 rounded" placeholder="Code" value={editForm.code ?? ''} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} />
                    <input className="border p-2 rounded" placeholder="Name" value={editForm.name ?? ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    <input className="border p-2 rounded" placeholder="Version" value={editForm.version ?? ''} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} />
                    <input className="border p-2 rounded" placeholder="Authority" value={editForm.authority ?? ''} onChange={(e) => setEditForm({ ...editForm, authority: e.target.value })} />
                    <input className="border p-2 rounded" placeholder="Category" value={editForm.category ?? ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                    <textarea className="border p-2 rounded col-span-2" placeholder="Description" rows={2} value={(editForm as any).description ?? ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value as any })} />
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={editForm.is_active ?? true} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} />
                      Active
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={update} disabled={updating}>{updating ? 'Updating...' : 'Update'}</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">
                      {fw.name} <span className="opacity-60">({fw.code})</span>
                    </div>
                    <div className="text-sm opacity-80">
                      {fw.version ?? '-'} · {fw.authority ?? '-'} · {fw.category ?? '-'}
                      {fw.description ? <span className="block opacity-70 mt-1">{fw.description}</span> : null}
                    </div>
                    <div className="text-xs mt-1 opacity-70">Active: {fw.is_active ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => startEdit(fw)}>Edit</Button>
                    <Button variant="destructive" onClick={() => remove(fw.id)} disabled={deletingId === fw.id}>
                      {deletingId === fw.id ? 'Deleting...' : 'Delete'}
                    </Button>
                    <div className="text-[10px] opacity-60 select-all">{fw.id}</div>
                  </div>
                </div>
              )}
            </li>
          ))}
          {!loading && items.length === 0 ? <li className="text-sm opacity-70">No frameworks yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}