import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import findingsService, { Finding, FindingStatus, FindingVersion, RiskRating } from '../../services/findingsService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { supabase } from '../../lib/supabase';

export default function FindingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [versions, setVersions] = useState<FindingVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [owners, setOwners] = useState<{ internal_owner_id: string | null; remediation_owner_id: string | null; remediation_due_date: string | null; }>({
    internal_owner_id: null, remediation_owner_id: null, remediation_due_date: null
  });
  const [statusChange, setStatusChange] = useState<{ to: FindingStatus; reason?: string }>({ to: 'open' });
  const [diff, setDiff] = useState<Record<string, any> | null>(null);
  const [diffSel, setDiffSel] = useState<{ from?: number; to?: number }>({});

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const f = await findingsService.get(id);
        setFinding(f);
        if (f) {
          setOwners({
            internal_owner_id: f.internal_owner_id ?? null,
            remediation_owner_id: f.remediation_owner_id ?? null,
            remediation_due_date: f.remediation_due_date ?? null,
          });
        }
        const vs = await findingsService.listVersions(id);
        setVersions(vs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const statusOptions: FindingStatus[] = ['draft','under_review','open','remediated','closed'];

  const statusBadge = (s: FindingStatus) => {
    const map: Record<FindingStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      under_review: 'bg-blue-100 text-blue-700',
      open: 'bg-purple-100 text-purple-700',
      remediated: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-zinc-200 text-zinc-800',
    };
    return <span className={`px-2 py-1 text-xs rounded ${map[s]}`}>{s.replace('_',' ')}</span>;
  };

  const riskBadge = (r: RiskRating) => {
    const map: Record<RiskRating, string> = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 text-xs rounded ${map[r]}`}>{r}</span>;
  };

  const doAssign = async () => {
    if (!finding) return;
    setAssigning(true);
    try {
      const updated = await findingsService.assignOwners(finding.id, owners);
      setFinding(updated);
    } catch (e) {
      console.error(e);
      alert('Failed to assign owners');
    } finally {
      setAssigning(false);
    }
  };

  const doChangeStatus = async () => {
    if (!finding) return;
    try {
      const updated = await findingsService.setStatus(finding.id, statusChange.to, statusChange.reason);
      setFinding(updated);
    } catch (e) {
      console.error(e);
      alert('Failed to change status');
    }
  };

  const computeDiff = async () => {
    if (!id || !diffSel.from || !diffSel.to) return;
    try {
      const d = await findingsService.diffVersions(id, diffSel.from, diffSel.to);
      setDiff(d);
    } catch (e) {
      console.error(e);
      setDiff(null);
    }
  };

  const commentsLink = useMemo(() => `/comments?entity_type=finding&entity_id=${id}`, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!finding) return <div className="p-6">Finding not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{finding.title}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/findings/${finding.id}/edit`)}>Edit</Button>
          <Button variant="outline" onClick={() => navigate('/findings')}>Back to List</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 border rounded bg-white space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {statusBadge(finding.workflow_status)}
              {riskBadge(finding.risk_rating)}
              <span className="text-xs text-gray-500">Audit Ref: {finding.audit_reference || '-'}</span>
              <span className="text-xs text-gray-500">Due: {finding.remediation_due_date || '-'}</span>
            </div>
            <div className="text-sm whitespace-pre-wrap">{finding.description || '-'}</div>
            <div>
              <div className="text-xs font-semibold text-gray-600">Root Cause</div>
              <div className="text-sm whitespace-pre-wrap">{finding.root_cause || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600">Recommendation</div>
              <div className="text-sm whitespace-pre-wrap">{finding.recommendation || '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600">Management Response</div>
              <div className="text-sm whitespace-pre-wrap">{finding.management_response || '-'}</div>
            </div>
            <div className="text-xs text-gray-500">
              <div>Opened: {finding.opened_at || '-'}</div>
              <div>Submitted: {finding.submitted_at || '-'}</div>
              <div>Reviewed: {finding.reviewed_at || '-'}</div>
              <div>Remediated: {finding.remediated_at || '-'}</div>
              <div>Closed: {finding.closed_at || '-'}</div>
            </div>
          </div>

          <div className="p-4 border rounded bg-white space-y-3">
            <div className="font-medium">Version History</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Version</th>
                    <th className="text-left p-2">Changed By</th>
                    <th className="text-left p-2">Changed At</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.length === 0 ? (
                    <tr><td className="p-3" colSpan={3}>No versions</td></tr>
                  ) : versions.map(v => (
                    <tr key={v.id} className="border-t">
                      <td className="p-2">{v.version}</td>
                      <td className="p-2">{v.changed_by?.slice(0,8) || '-'}</td>
                      <td className="p-2">{new Date(v.changed_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-end gap-2">
              <div>
                <label className="block text-xs text-gray-500">From</label>
                <select className="border rounded px-2 py-1" onChange={(e) => setDiffSel(s => ({ ...s, from: Number(e.target.value) }))} defaultValue="">
                  <option value="" disabled>Select</option>
                  {versions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500">To</label>
                <select className="border rounded px-2 py-1" onChange={(e) => setDiffSel(s => ({ ...s, to: Number(e.target.value) }))} defaultValue="">
                  <option value="" disabled>Select</option>
                  {versions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
                </select>
              </div>
              <Button onClick={computeDiff}>Compute Diff</Button>
            </div>

            {diff && (
              <div className="p-3 bg-gray-50 rounded border text-xs overflow-auto">
                <pre>{JSON.stringify(diff, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="p-4 border rounded bg-white space-y-3">
            <div className="font-medium">Comments & Evidence</div>
            <div className="text-sm">
              <Link to={commentsLink} className="text-blue-600 hover:underline">Open comments thread</Link>
            </div>
            <div className="text-xs text-gray-500">Upload/view evidence via the Evidence module (entity_type='finding').</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded bg-white space-y-2">
            <div className="font-medium">Assignment</div>
            <label className="text-xs text-gray-500">Internal Owner (UUID)</label>
            <Input value={owners.internal_owner_id || ''} onChange={(e) => setOwners(o => ({ ...o, internal_owner_id: e.target.value }))} />
            <label className="text-xs text-gray-500">Remediation Owner (UUID)</label>
            <Input value={owners.remediation_owner_id || ''} onChange={(e) => setOwners(o => ({ ...o, remediation_owner_id: e.target.value }))} />
            <label className="text-xs text-gray-500">Remediation Due Date</label>
            <Input type="date" value={owners.remediation_due_date || ''} onChange={(e) => setOwners(o => ({ ...o, remediation_due_date: e.target.value }))} />
            <Button onClick={doAssign} disabled={assigning}>{assigning ? 'Assigning...' : 'Assign'}</Button>
          </div>

          <div className="p-4 border rounded bg-white space-y-2">
            <div className="font-medium">Workflow</div>
            <label className="text-xs text-gray-500">Change Status</label>
            <select className="border rounded px-2 py-1" value={statusChange.to} onChange={(e) => setStatusChange(s => ({ ...s, to: e.target.value as FindingStatus }))}>
              {statusOptions.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
            <label className="text-xs text-gray-500">Reason (optional)</label>
            <textarea className="w-full border rounded p-2 min-h-[60px]" value={statusChange.reason || ''} onChange={(e) => setStatusChange(s => ({ ...s, reason: e.target.value }))} />
            <Button onClick={doChangeStatus}>Update Status</Button>
          </div>

          <div className="p-4 border rounded bg-white space-y-2">
            <div className="font-medium">Metadata</div>
            <div className="text-xs text-gray-600">Created: {finding.created_at}</div>
            <div className="text-xs text-gray-600">Updated: {finding.updated_at}</div>
            <div className="text-xs text-gray-600">Control Failure: {finding.control_failure ? 'Yes' : 'No'}</div>
            <div className="text-xs text-gray-600">Tags: {(finding.tags || []).join(', ') || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
