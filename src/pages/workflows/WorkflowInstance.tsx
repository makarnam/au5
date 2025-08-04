import React, { useEffect, useState } from 'react';
import { getInstance, approveStep, rejectStep, requestRevision, skipStep } from '../../services/workflows';
import type { ApprovalRequest, ApprovalRequestStep, ApprovalActionLog, UUID } from '../../types/workflows';
import { useParams, useNavigate } from 'react-router-dom';
import ApprovalTimeline from '../../components/workflows/ApprovalTimeline';
import ApproveRejectDialog from '../../components/workflows/ApproveRejectDialog';

export default function WorkflowInstance() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [req, setReq] = useState<ApprovalRequest | null>(null);
  const [steps, setSteps] = useState<ApprovalRequestStep[]>([]);
  const [actions, setActions] = useState<ApprovalActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function refresh() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await getInstance(id as UUID);
    if (error) {
      console.error(error);
      alert(error.message || 'Failed to load instance');
      setLoading(false);
      return;
    }
    if (data) {
      setReq(data);
      setSteps(data.steps);
      setActions(data.actions);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id) return <div className="p-6">Invalid instance id</div>;
  if (loading) return <div className="p-6">Loading instance…</div>;
  if (!req) return <div className="p-6">Instance not found</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Approval Request</h1>
          <div className="text-xs text-gray-500 mt-1">
            ID: <span className="font-mono">{req.id}</span> • Entity: {req.entity_type} • Status: {req.status}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDialogOpen(true)}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
            disabled={req.status === 'approved' || req.status === 'rejected' || req.status === 'cancelled'}
          >
            Take Action
          </button>
          <button onClick={() => navigate('/workflows/home')} className="px-3 py-2 rounded border text-sm hover:bg-gray-50">
            Back
          </button>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-2">Timeline</h2>
        <ApprovalTimeline steps={steps as any} currentStep={req.current_step} />
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-2">Action Log</h2>
        {actions.length === 0 ? (
          <div className="text-sm text-gray-600">No actions yet.</div>
        ) : (
          <ul className="text-sm space-y-2">
            {actions.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{a.action}</span>
                  {a.comments ? <span className="text-gray-600"> — {a.comments}</span> : null}
                </div>
                <div className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ApproveRejectDialog
        requestId={req.id}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onDone={() => refresh()}
      />
    </div>
  );
}
