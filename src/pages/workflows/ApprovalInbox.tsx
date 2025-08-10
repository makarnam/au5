import React, { useEffect, useState } from 'react';
import { getMyTasks, approveStep, rejectStep, requestRevision, skipStep } from '../../services/workflows';

type PendingRow = {
  step_id: string;
  request_id: string;
  entity_type: 'audit' | 'finding';
  entity_id: string;
  request_status: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string | null;
  step_status: string;
  current_step: number;
  created_at?: string | null;
};

export default function ApprovalInbox() {
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const result = await getMyTasks();
      if (result.error) throw result.error;
      setRows(result.data || []);
    } catch (e) {
      console.error(e);
      setError((e as any)?.message ?? 'Failed to load approvals');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(requestId: string, action: 'approve' | 'reject' | 'revise' | 'skip') {
    try {
      setLoadingId(requestId);
      if (action === 'approve') {
        const result = await approveStep({ request_id: requestId, comments: 'Approved from inbox' });
        if (result.error) throw result.error;
      }
      if (action === 'reject') {
        const result = await rejectStep({ request_id: requestId, comments: 'Rejected from inbox' });
        if (result.error) throw result.error;
      }
      if (action === 'revise') {
        const result = await requestRevision({ request_id: requestId, comments: 'Revision requested from inbox' });
        if (result.error) throw result.error;
      }
      if (action === 'skip') {
        const result = await skipStep({ request_id: requestId, comments: 'Skipped from inbox' });
        if (result.error) throw result.error;
      }
      await load();
    } catch (e) {
      console.error(e);
      alert((e as any)?.message ?? 'Action failed');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Approval Inbox</h1>
        <button onClick={load} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">Refresh</button>
      </div>
      {error ? <div className="text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded mb-3">{error}</div> : null}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">Step</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No pending approvals</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.step_id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.entity_type}</div>
                    <div className="text-xs text-gray-500">{r.entity_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.step_order}. {r.step_name}</div>
                    <div className="text-xs text-gray-500">Request #{r.request_id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-3 py-2">{r.assignee_role}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {r.step_status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(r.request_id, 'approve')}
                        disabled={loadingId === r.request_id}
                        className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {loadingId === r.request_id ? '…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(r.request_id, 'reject')}
                        disabled={loadingId === r.request_id}
                        className="px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(r.request_id, 'revise')}
                        disabled={loadingId === r.request_id}
                        className="px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        Request Revision
                      </button>
                      <button
                        onClick={() => handleAction(r.request_id, 'skip')}
                        disabled={loadingId === r.request_id}
                        className="px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                      >
                        Skip
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}