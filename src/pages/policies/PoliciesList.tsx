import { useEffect, useState } from 'react';
import { policyService } from '../../services/policyService';
import type { Policy } from '../../types/policies';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import PolicyAIGenerator from '../../components/ai/PolicyAIGenerator';

export default function PoliciesList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [form, setForm] = useState<Partial<Policy>>({
    name: '',
    description: '',
    is_active: true,
    tags: [],
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await policyService.listPolicies();
    if (!error) setItems((data ?? []) as Policy[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.name) return;
    setSaving(true);
    const { data, error } = await policyService.createPolicy(form as any);
    setSaving(false);
    if (!error && data) {
      setForm({ name: '', description: '', is_active: true, tags: [] });
      load();
    } else if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Policies</h1>
        <Button onClick={() => load()} variant="outline" disabled={loading}>
          {loading ? 'Loading...' : 'Reload'}
        </Button>
      </div>

      <div className="border rounded p-4 space-y-3 bg-white">
        <div className="font-medium">Create Policy</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex items-center gap-2">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Policy Name"
              value={form.name ?? ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <PolicyAIGenerator
              fieldType="policy_title"
              policyData={{
                name: form.name,
                description: form.description,
                industry: "Technology",
                framework: "ISO 27001",
              }}
              onGenerated={(content) => setForm({ ...form, name: content as string })}
              className="flex-shrink-0"
            />
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
          <div className="col-span-2">
            <div className="flex items-start gap-2">
              <textarea
                className="border p-2 rounded flex-1"
                placeholder="Description (optional)"
                rows={2}
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <PolicyAIGenerator
                fieldType="policy_description"
                policyData={{
                  name: form.name,
                  description: form.description,
                  industry: "Technology",
                  framework: "ISO 27001",
                }}
                onGenerated={(content) => setForm({ ...form, description: content as string })}
                className="flex-shrink-0"
              />
            </div>
          </div>
        </div>
        <Button disabled={saving || !form.name} onClick={create}>
          {saving ? 'Saving...' : 'Create'}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="font-medium">All Policies</div>
        {loading ? <div>Loading...</div> : null}
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id} className="border rounded p-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm opacity-80">{p.description || '-'}</div>
                  <div className="text-xs mt-1 opacity-70">Active: {p.is_active ? 'Yes' : 'No'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => navigate(`/policies/${p.id}`)}>Edit</Button>
                  <Button variant="outline" onClick={() => navigate(`/policies/${p.id}/versions`)}>Versions</Button>
                  <div className="text-[10px] opacity-60 select-all">{p.id}</div>
                </div>
              </div>
            </li>
          ))}
          {!loading && items.length === 0 ? <li className="text-sm opacity-70">No policies yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}