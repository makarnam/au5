import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import findingsService, { FindingInput, RiskRating } from '../../services/findingsService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

export default function CreateFindingPage() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<{ id: string; title: string; audit_number?: string | null }[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState<FindingInput>({
    audit_id: '',
    title: '',
    risk_rating: 'medium',
    description: '',
    root_cause: '',
    control_failure: false,
    audit_reference: '',
    tags: [],
    attachments: [],
    internal_owner_id: '',
    remediation_owner_id: '',
    remediation_due_date: '',
  });

  useEffect(() => {
    const loadAudits = async () => {
      const { data } = await supabase
        .from('audits')
        .select('id,title,audit_number')
        .order('created_at', { ascending: false })
        .limit(100);
      setAudits(data || []);
    };
    loadAudits();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      const payload: FindingInput = {
        audit_id: form.audit_id,
        title: form.title.trim(),
        risk_rating: form.risk_rating as RiskRating,
        description: form.description?.trim() || undefined,
        root_cause: form.root_cause?.trim() || undefined,
        control_failure: !!form.control_failure,
        audit_reference: form.audit_reference?.trim() || undefined,
        tags: form.tags,
        attachments: form.attachments,
        internal_owner_id: form.internal_owner_id || undefined,
        remediation_owner_id: form.remediation_owner_id || undefined,
        remediation_due_date: form.remediation_due_date || undefined,
      };
      const created = await findingsService.create(payload);
      navigate(`/findings/${created.id}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create finding';
      setErrors(msg.split('; '));
    } finally {
      setSaving(false);
    }
  };

  const autofillFromAudit = (auditId: string) => {
    const a = audits.find(x => x.id === auditId);
    if (!a) return;
    // Smart auto-fill: audit_reference = audit_number or title as fallback
    const ref = a.audit_number || a.title;
    setForm(prev => ({ ...prev, audit_reference: ref || '' }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Finding</h1>
      </div>

      {errors.length > 0 && (
        <div className="p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          <ul className="list-disc list-inside">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-white">
        <div className="md:col-span-1">
          <label className="text-xs text-gray-500">Audit</label>
          <select
            className="w-full border rounded h-10 px-2"
            value={form.audit_id}
            onChange={(e) => {
              setForm({ ...form, audit_id: e.target.value });
              autofillFromAudit(e.target.value);
            }}
            required
          >
            <option value="" disabled>Select audit...</option>
            {audits.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-gray-500">Audit Reference</label>
          <Input
            placeholder="e.g., AUD-2025-001"
            value={form.audit_reference}
            onChange={(e) => setForm({ ...form, audit_reference: e.target.value })}
            maxLength={120}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Title</label>
          <Input
            placeholder="Finding title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            maxLength={200}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="w-full border rounded p-2 min-h-[100px]"
            placeholder="Describe the finding"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Risk Rating</label>
          <select
            className="w-full border rounded h-10 px-2"
            value={form.risk_rating}
            onChange={(e) => setForm({ ...form, risk_rating: e.target.value as RiskRating })}
          >
            {(['low','medium','high','critical'] as RiskRating[]).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500">Control Failure</label>
          <select
            className="w-full border rounded h-10 px-2"
            value={form.control_failure ? 'yes' : 'no'}
            onChange={(e) => setForm({ ...form, control_failure: e.target.value === 'yes' })}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Root Cause</label>
          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            placeholder="Explain the root cause"
            value={form.root_cause}
            onChange={(e) => setForm({ ...form, root_cause: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Internal Owner (UUID)</label>
          <Input
            placeholder="User UUID"
            value={form.internal_owner_id}
            onChange={(e) => setForm({ ...form, internal_owner_id: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Remediation Owner (UUID)</label>
          <Input
            placeholder="User UUID"
            value={form.remediation_owner_id}
            onChange={(e) => setForm({ ...form, remediation_owner_id: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Remediation Due Date</label>
          <Input
            type="date"
            value={form.remediation_due_date || ''}
            onChange={(e) => setForm({ ...form, remediation_due_date: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Tags (comma separated)</label>
          <Input
            placeholder="e.g., policy, access, user-provisioning"
            value={(form.tags || []).join(',')}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Finding'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/findings')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}