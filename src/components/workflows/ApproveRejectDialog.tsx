import React, { useState } from 'react';
import { approveStep, rejectStep, requestRevision, skipStep } from '../../services/workflows';

type Props = {
  requestId: string;
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
};

export default function ApproveRejectDialog({ requestId, open, onClose, onDone }: Props) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState<'approve' | 'reject' | 'revise' | 'skip' | null>(null);
  if (!open) return null;

  async function handle(action: 'approve' | 'reject' | 'revise' | 'skip') {
    try {
      setLoading(action);
      if (action === 'approve') await approveStep({ request_id: requestId, comments });
      if (action === 'reject') await rejectStep({ request_id: requestId, comments });
      if (action === 'revise') await requestRevision({ request_id: requestId, comments });
      if (action === 'skip') await skipStep({ request_id: requestId, comments });
      onDone?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert((e as any)?.message ?? 'Action failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Approval Action</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">Comments (optional)</label>
          <textarea
            className="w-full border rounded p-2 min-h-[100px]"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add context for your decision"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => handle('approve')}
            disabled={loading !== null}
            className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === 'approve' ? 'Approving…' : 'Approve'}
          </button>
          <button
            onClick={() => handle('reject')}
            disabled={loading !== null}
            className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {loading === 'reject' ? 'Rejecting…' : 'Reject'}
          </button>
          <button
            onClick={() => handle('revise')}
            disabled={loading !== null}
            className="px-3 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading === 'revise' ? 'Requesting…' : 'Request Revision'}
          </button>
          <button
            onClick={() => handle('skip')}
            disabled={loading !== null}
            className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {loading === 'skip' ? 'Skipping…' : 'Skip Step'}
          </button>
        </div>
      </div>
    </div>
  );
}
