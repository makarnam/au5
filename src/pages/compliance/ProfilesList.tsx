import { useEffect, useMemo, useState } from 'react';
import { ComplianceService } from '../../services/compliance';
import type { ComplianceFramework, ComplianceProfile } from '../../types/compliance';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

type ProfileForm = Partial<ComplianceProfile>;

export default function ProfilesList() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [items, setItems] = useState<ComplianceProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProfileForm>({});
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load frameworks once and default select first
  useEffect(() => {
    const init = async () => {
      const { data, error } = await ComplianceService.listFrameworks();
      if (!error) {
        const list = (data ?? []) as ComplianceFramework[];
        setFrameworks(list);
        if (!frameworkId && list.length > 0) setFrameworkId(list[0].id);
      }
    };
    init();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await ComplianceService.listProfiles(frameworkId || undefined);
    if (!error) setItems((data ?? []) as ComplianceProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, [frameworkId]);

  const create = async () => {
    if (!form.name || !frameworkId) return;
    setSaving(true);
    // Get current user id for created_by to satisfy RLS
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const payload: ProfileForm = {
      name: form.name,
      description: form.description ?? '',
      framework_id: frameworkId,
      is_active: form.is_active ?? true,
      created_by: userId as any,
    };
    const { error } = await ComplianceService.createProfile(payload);
    setSaving(false);
    if (!error) {
      setForm({ name: '', description: '', is_active: true });
      loadProfiles();
    } else {
      alert(error.message);
    }
  };

  const update = async () => {
    if (!editingId) return;
    if (!editForm.name) return;
    setUpdating(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const { error } = await supabase
      .from('compliance_profiles')
      .update({
        name: editForm.name,
        description: editForm.description ?? '',
        is_active: editForm.is_active ?? true,
        framework_id: frameworkId || editForm.framework_id,
        created_by: userId as any, // keep consistent with RLS-created rows if required
      })
      .eq('id', editingId)
      .select()
      .single();
    setUpdating(false);
    if (!error) {
      cancelEdit();
      loadProfiles();
    } else {
      alert(error.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this profile? This action cannot be undone.')) return;
    setDeletingId(id);
    const { error } = await supabase.from('compliance_profiles').delete().eq('id', id);
    setDeletingId(null);
    if (!error) {
      loadProfiles();
    } else {
      alert(error.message);
    }
  };

  const startEdit = (p: ComplianceProfile) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      description: p.description ?? '',
      is_active: p.is_active,
      framework_id: p.framework_id,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filtered = useMemo(() => {
    return items;
  }, [items]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Compliance Profiles</h1>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border p-2 rounded w-[360px]"
          value={frameworkId}
          onChange={(e) => setFrameworkId(e.target.value)}
        >
          {frameworks.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.code}) — {f.id}
            </option>
          ))}
          {frameworks.length === 0 && <option value="">No frameworks found</option>}
        </select>

        <Button variant="outline" onClick={loadProfiles} disabled={loading || !frameworkId}>
          {loading ? 'Loading...' : 'Reload'}
        </Button>
      </div>

      <div className="border rounded p-4 space-y-3 bg-white">
        <div className="font-medium">Create Profile</div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={form.name ?? ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
          <textarea
            className="border p-2 rounded col-span-2"
            placeholder="Description (optional)"
            rows={2}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <Button onClick={create} disabled={saving || !frameworkId}>
          {saving ? 'Saving...' : 'Create'}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="font-medium">Profiles</div>
        {loading ? <div>Loading...</div> : null}
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id} className="border rounded p-3 bg-white">
              {editingId === p.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="border p-2 rounded"
                      placeholder="Name"
                      value={editForm.name ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.is_active ?? true}
                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                    <textarea
                      className="border p-2 rounded col-span-2"
                      placeholder="Description"
                      rows={2}
                      value={editForm.description ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={update} disabled={updating}>
                      {updating ? 'Updating...' : 'Update'}
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm opacity-80">{p.description || '-'}</div>
                    <div className="text-xs mt-1 opacity-70">Active: {p.is_active ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => startEdit(p)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => remove(p.id)} disabled={deletingId === p.id}>
                      {deletingId === p.id ? 'Deleting...' : 'Delete'}
                    </Button>
                    <div className="text-[10px] opacity-60 select-all">{p.id}</div>
                  </div>
                </div>
              )}
            </li>
          ))}
          {!loading && filtered.length === 0 ? (
            <li className="text-sm opacity-70">No profiles found.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}