import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import findingsService, { Finding, FindingInput, RiskRating } from '../../services/findingsService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

export default function EditFindingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audits, setAudits] = useState<{ id: string; title: string; audit_number?: string | null }[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [finding, setFinding] = useState<Finding | null>(null);

  useEffect(() => {
    const loadAudits = async () => {
      const { data } = await supabase
        .from('audits')
        .select('id,title,audit_number')
        .order('created_at', { ascending: false })
        .limit(100);
      setAudits(data || []);
    };
    const loadFinding = async () => {
      if (!id) return;
      const f = await findingsService.get(id);
      setFinding(f);
    };
    loadAudits();
    loadFinding();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !finding) return;
    setSaving(true);
    setErrors([]);
    try {
      const patch: Partial<FindingInput> & Partial<Finding> = {
        audit_id: finding.audit_id,
        title: finding.title.trim(),
        risk_rating: finding.risk_rating as RiskRating,
        description: finding.description?.trim() || undefined,
        root_cause: finding.root_cause?.trim() || undefined,
        control_failure: !!finding.control_failure,
        audit_reference: finding.audit_reference?.trim() || undefined,
        tags: finding.tags || [],
        attachments: finding.attachments || [],
        internal_owner_id: finding.internal_owner_id || undefined,
        remediation_owner_id: finding.remediation_owner_id || undefined,
        remediation_due_date: finding.remediation_due_date || undefined,
      };
      await findingsService.update(id, patch);
      navigate(`/findings/${id}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update finding';
      setErrors(msg.split('; '));
    } finally {
      setSaving(false);
    }
  };

  const autofillFromAudit = (auditId: string) => {
    const a = audits.find(x => x.id === auditId);
    if (!a) return;
    const ref = a.audit_number || a.title;
    setFinding(prev => prev ? ({ ...prev, audit_reference: ref || '' }) : prev);
  };

  if (!finding) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Finding</h1>
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
            value={finding.audit_id}
            onChange={(e) => {
              setFinding({ ...finding, audit_id: e.target.value });
              autofillFromAudit(e.target.value);
            }}
            required
          >
            {audits.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-gray-500">Audit Reference</label>
          <Input
            placeholder="e.g., AUD-2025-001"
            value={finding.audit_reference || ''}
            onChange={(e) => setFinding({ ...finding, audit_reference: e.target.value })}
            maxLength={120}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Title</label>
          <Input
            placeholder="Finding title"
            value={finding.title}
            onChange={(e) => setFinding({ ...finding, title: e.target.value })}
            required
            maxLength={200}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="w-full border rounded p-2 min-h-[100px]"
            placeholder="Describe the finding"
            value={finding.description || ''}
            onChange={(e) => setFinding({ ...finding, description: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Risk Rating</label>
          <select
            className="w-full border rounded h-10 px-2"
            value={finding.risk_rating}
            onChange={(e) => setFinding({ ...finding, risk_rating: e.target.value as RiskRating })}
          >
            {(['low','medium','high','critical'] as RiskRating[]).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500">Control Failure</label>
          <select
            className="w-full border rounded h-10 px-2"
            value={finding.control_failure ? 'yes' : 'no'}
            onChange={(e) => setFinding({ ...finding, control_failure: e.target.value === 'yes' })}
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
            value={finding.root_cause || ''}
            onChange={(e) => setFinding({ ...finding, root_cause: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Internal Owner (UUID)</label>
          <Input
            placeholder="User UUID"
            value={finding.internal_owner_id || ''}
            onChange={(e) => setFinding({ ...finding, internal_owner_id: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Remediation Owner (UUID)</label>
          <Input
            placeholder="User UUID"
            value={finding.remediation_owner_id || ''}
            onChange={(e) => setFinding({ ...finding, remediation_owner_id: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Remediation Due Date</label>
          <Input
            type="date"
            value={finding.remediation_due_date || ''}
            onChange={(e) => setFinding({ ...finding, remediation_due_date: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Tags (comma separated)</label>
          <Input
            placeholder="e.g., policy, access, user-provisioning"
            value={(finding.tags || []).join(',')}
            onChange={(e) => setFinding({ ...finding, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/findings/${id}`)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}