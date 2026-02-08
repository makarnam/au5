import React, { useEffect, useMemo, useState } from 'react';
import { listWorkflows, getInstances, getInstance, startWorkflow } from '../../services/workflows';
import ApprovalTimeline from '../../components/workflows/ApprovalTimeline';

type Workflow = {
  id: string;
  name: string;
  description?: string | null;
  entity_type: 'audit' | 'finding' | 'control';
};

type ApprovalRequest = {
  id: string;
  entity_type: 'audit' | 'finding' | 'control';
  entity_id: string;
  workflow_id: string;
  current_step: number;
  status: 'pending_approval' | 'in_progress' | 'approved' | 'rejected' | 'revision_required' | 'cancelled';
  requested_at: string;
};

type Props = {
  entityType: 'audit' | 'finding' | 'control';
  entityId: string;
};

export default function WorkflowCenter({ entityType, entityId }: Props) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [steps, setSteps] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const wfResult = await listWorkflows({ entity_type: entityType });
      if (wfResult.error) throw wfResult.error;
      setWorkflows(wfResult.data || []);
      
      const reqResult = await getInstances({ entity_type: entityType });
      if (reqResult.error) throw reqResult.error;
      setRequests(reqResult.data || []);
    } catch (e) {
      console.error(e);
      setErr((e as any)?.message ?? 'Failed to load workflows');
    }
  }

  useEffect(() => {
    load();
  }, [entityType, entityId]);

  const selectedRequest = useMemo(() => requests.find((r) => r.id === selectedRequestId), [requests, selectedRequestId]);

  useEffect(() => {
    (async () => {
      if (!selectedRequestId) {
        setSteps([]);
        return;
      }
      try {
        const result = await getInstance(selectedRequestId);
        if (result.error) throw result.error;
        setSteps(result.data?.steps || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedRequestId]);

  async function handleStart() {
    if (!selectedWorkflowId) {
      alert('Select a workflow first');
      return;
    }
    try {
      setLoading(true);
      const result = await startWorkflow({ 
        entity_type: entityType, 
        entity_id: entityId, 
        workflow_id: selectedWorkflowId 
      });
      if (result.error) throw result.error;
      await load();
      setSelectedRequestId(result.data?.request_id || '');
    } catch (e) {
      console.error(e);
      alert((e as any)?.message ?? 'Start failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        Workflow & Approval
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">New</span>
      </h2>
      {err ? <div className="mt-2 text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded">{err}</div> : null}

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium mb-2">Start New Approval</h3>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded p-2 flex-1"
              value={selectedWorkflowId}
              onChange={(e) => setSelectedWorkflowId(e.target.value)}
            >
              <option value="">Select a workflow</option>
              {workflows.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.name} ({w.entity_type})
                </option>
              ))}
            </select>
            <button
              onClick={handleStart}
              disabled={loading || !selectedWorkflowId}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Starting…' : 'Start'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Entity: {entityType} • ID: {entityId}</p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Existing Requests</h3>
          <div className="border rounded divide-y max-h-64 overflow-auto">
            {requests.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">No approval requests yet</div>
            ) : (
              requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${selectedRequestId === r.id ? 'bg-gray-50' : ''}`}
                >
                  <div className="font-medium">Request {r.id.slice(0, 8)}…</div>
                  <div className="text-xs text-gray-600">
                    Status: {r.status} • Current step: {r.current_step} • {new Date(r.requested_at).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-medium mb-2">Approval Timeline</h3>
        {selectedRequest ? (
          <ApprovalTimeline steps={steps as any} currentStep={selectedRequest.current_step} />
        ) : (
          <div className="text-sm text-gray-500">Select an approval request to view the timeline</div>
        )}
      </div>
    </div>
  );
}