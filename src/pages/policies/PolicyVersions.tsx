import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { policyService } from '../../services/policyService';
import type { Policy, PolicyVersion } from '../../types/policies';
import { Button } from '../../components/ui/button';

export default function PolicyVersions() {
  const { policyId } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [items, setItems] = useState<PolicyVersion[]>([]);
  const [loading, setLoading] = useState(false);

  const [previewItem, setPreviewItem] = useState<PolicyVersion | null>(null);
  const [editingItem, setEditingItem] = useState<PolicyVersion | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!policyId) return;
    setLoading(true);
    const [pRes, vRes] = await Promise.all([
      policyService.getPolicy(policyId),
      policyService.listVersions(policyId),
    ]);
    if (!pRes.error) setPolicy(pRes.data as Policy);
    if (!vRes.error) setItems((vRes.data ?? []) as PolicyVersion[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [policyId]);

  const saveEdit = async () => {
    if (!editingItem) return;
    setSaving(true);
    const { error } = await policyService.updateVersion(editingItem.id, {
      title: editingItem.title,
      content: editingItem.content,
      status: editingItem.status,
      ai_generated: editingItem.ai_generated,
    });
    setSaving(false);
    if (!error) {
      setEditingItem(null);
      await load();
    } else {
      alert(error.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this version? This action cannot be undone.')) return;
    const { error } = await policyService.deleteVersion(id);
    if (!error) {
      await load();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Policy Versions</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/policies')}>Back</Button>
          <Button variant="outline" onClick={() => navigate(`/policies/${policyId}`)}>Edit Policy</Button>
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            {loading ? 'Loading...' : 'Reload'}
          </Button>
        </div>
      </div>

      {policy ? (
        <div className="text-sm opacity-80">
          <span className="font-medium">{policy.name}</span> — {policy.description || '-'}
        </div>
      ) : null}

      {/* Versions list */}
      <ul className="space-y-2">
        {items.map((v) => (
          <li key={v.id} className="border rounded p-3 bg-white">
            {editingItem?.id === v.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="border p-2 rounded col-span-2"
                    placeholder="Title"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="border p-2 rounded"
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!editingItem.ai_generated}
                      onChange={(e) => setEditingItem({ ...editingItem, ai_generated: e.target.checked })}
                    />
                    AI generated
                  </label>
                </div>

                <textarea
                  className="border p-2 rounded w-full h-48"
                  placeholder="Markdown Content..."
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                />

                <div className="flex items-center gap-2">
                  <Button onClick={saveEdit} disabled={saving || !editingItem.title || !editingItem.content}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">
                    v{v.version_number} — {v.title} <span className="opacity-60">[{v.status}]</span>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {v.ai_generated ? 'AI-generated' : 'Manual'} · {v.created_at}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setPreviewItem(v)}>Preview</Button>
                  <Button variant="outline" onClick={() => setEditingItem(v)}>Edit</Button>
                  <Button variant="destructive" onClick={() => remove(v.id)}>Delete</Button>
                  <div className="text-[10px] opacity-60 select-all">{v.id}</div>
                </div>
              </div>
            )}
          </li>
        ))}
        {!loading && items.length === 0 ? (
          <li className="text-sm opacity-70">No versions yet. Create one from the Policy editor.</li>
        ) : null}
      </ul>

      {/* Preview modal (simple) */}
      {previewItem ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Preview — v{previewItem.version_number}: {previewItem.title}</div>
              <Button variant="outline" onClick={() => setPreviewItem(null)}>Close</Button>
            </div>
            <div className="text-xs opacity-60">
              Status: {previewItem.status} · {previewItem.ai_generated ? 'AI-generated' : 'Manual'} · {previewItem.created_at}
            </div>
            <div className="border rounded p-3 bg-gray-50 whitespace-pre-wrap text-sm">
              {previewItem.content}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}