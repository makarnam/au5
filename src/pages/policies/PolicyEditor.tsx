import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { policyService } from '../../services/policyService';
import type { Policy, PolicyVersion } from '../../types/policies';
import { Button } from '../../components/ui/button';

export default function PolicyEditor() {
  const { policyId } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit form for policy metadata
  const [form, setForm] = useState<Partial<Policy>>({
    name: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // New version draft
  const [versionForm, setVersionForm] = useState<Partial<PolicyVersion> & { title?: string; content?: string }>({
    title: '',
    content: '',
    status: 'draft',
  });
  const [savingVersion, setSavingVersion] = useState(false);

  // Markdown preview toggle
  const [preview, setPreview] = useState(false);

  const load = async () => {
    if (!policyId) return;
    setLoading(true);
    const { data, error } = await policyService.getPolicy(policyId);
    setLoading(false);
    if (!error && data) {
      setPolicy(data as Policy);
      setForm({
        name: (data as Policy).name,
        description: (data as Policy).description ?? '',
        is_active: (data as Policy).is_active,
        owner_id: (data as Policy).owner_id ?? undefined,
      });
    }
  };

  useEffect(() => {
    load();
  }, [policyId]);

  const savePolicy = async () => {
    if (!policyId) return;
    if (!form.name) return;
    setSaving(true);
    const { error } = await policyService.updatePolicy(policyId, form);
    setSaving(false);
    if (!error) {
      await load();
      alert('Policy updated');
    } else {
      alert(error.message);
    }
  };

  const createVersion = async () => {
    if (!policyId) return;
    if (!versionForm.title || !versionForm.content) return;
    setSavingVersion(true);
    const { error } = await policyService.createVersion(policyId, {
      title: versionForm.title!,
      content: versionForm.content!,
      status: versionForm.status as any,
      ai_generated: !!versionForm.ai_generated,
    });
    setSavingVersion(false);
    if (!error) {
      setVersionForm({ title: '', content: '', status: 'draft' });
      navigate(`/policies/${policyId}/versions`);
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Policy</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/policies')}>Back</Button>
          <Button variant="outline" onClick={() => navigate(`/policies/${policyId}/versions`)}>Versions</Button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : null}
      {!loading && !policy ? <div className="text-sm opacity-70">Policy not found.</div> : null}

      {policy ? (
        <>
          {/* Policy metadata */}
          <div className="border rounded p-4 space-y-3 bg-white">
            <div className="font-medium">Policy Metadata</div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Policy Name"
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
            <Button onClick={savePolicy} disabled={saving || !form.name}>
              {saving ? 'Saving...' : 'Save Metadata'}
            </Button>
          </div>

          {/* New Version (Markdown) */}
          <div className="border rounded p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-medium">Create New Version</div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} />
                Preview
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="border p-2 rounded col-span-2"
                placeholder="Version Title"
                value={versionForm.title ?? ''}
                onChange={(e) => setVersionForm({ ...versionForm, title: e.target.value })}
              />
            </div>

            {!preview ? (
              <textarea
                className="border p-2 rounded w-full h-64"
                placeholder="Markdown Content..."
                value={versionForm.content ?? ''}
                onChange={(e) => setVersionForm({ ...versionForm, content: e.target.value })}
              />
            ) : (
              <div className="border p-3 rounded bg-gray-50 whitespace-pre-wrap text-sm min-h-[16rem]">
                {versionForm.content || 'Nothing to preview'}
              </div>
            )}

            <div className="flex items-center gap-3">
              <select
                className="border p-2 rounded"
                value={versionForm.status ?? 'draft'}
                onChange={(e) => setVersionForm({ ...versionForm, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!versionForm.ai_generated}
                  onChange={(e) => setVersionForm({ ...versionForm, ai_generated: e.target.checked })}
                />
                AI generated
              </label>

              <Button onClick={createVersion} disabled={savingVersion || !versionForm.title || !versionForm.content}>
                {savingVersion ? 'Creating...' : 'Create Version'}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}