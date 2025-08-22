import React, { useEffect, useState } from 'react';
import { getInstance, approveStep, rejectStep, requestRevision, skipStep } from '../../services/workflows';
import type { ApprovalRequest, ApprovalRequestStep, ApprovalActionLog, UUID } from '../../types/workflows';
import { useParams, useNavigate } from 'react-router-dom';
import ApprovalTimeline from '../../components/workflows/ApprovalTimeline';
import ApproveRejectDialog from '../../components/workflows/ApproveRejectDialog';
import WorkflowHistory from '../../components/workflows/WorkflowHistory';

export default function WorkflowInstance() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [req, setReq] = useState<ApprovalRequest | null>(null);
  const [steps, setSteps] = useState<ApprovalRequestStep[]>([]);
  const [actions, setActions] = useState<ApprovalActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ApprovalRequestStep | null>(null);

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

  const handleAction = async (action: 'approve' | 'reject' | 'request_revision' | 'skip', comments?: string) => {
    if (!selectedStep || !id) return;

    try {
      let result;
      switch (action) {
        case 'approve':
          result = await approveStep(id as UUID, selectedStep.id, comments);
          break;
        case 'reject':
          result = await rejectStep(id as UUID, selectedStep.id, comments);
          break;
        case 'request_revision':
          result = await requestRevision(id as UUID, selectedStep.id, comments);
          break;
        case 'skip':
          result = await skipStep(id as UUID, selectedStep.id, comments);
          break;
      }

      if (result.error) {
        alert(result.error.message || 'Action failed');
        return;
      }

      setDialogOpen(false);
      setSelectedStep(null);
      await refresh();
    } catch (error) {
      console.error('Action error:', error);
      alert('Action failed');
    }
  };

  if (!id) return <div className="p-6">Invalid instance id</div>;
  if (loading) return <div className="p-6">Loading instance…</div>;
  if (!req) return <div className="p-6">Instance not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Workflow Instance</h1>
          <p className="text-gray-600">
            {req.entity_type} • ID: {req.entity_id} • Status: {req.status}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Approval Timeline</h2>
          <div className="bg-white p-4 rounded-lg border">
            <ApprovalTimeline 
              steps={steps} 
              currentStep={req.current_step}
              onStepClick={(step) => {
                if (step.status === 'pending') {
                  setSelectedStep(step);
                  setDialogOpen(true);
                }
              }}
            />
          </div>
        </div>

        {/* Workflow History */}
        <div className="space-y-4">
          <WorkflowHistory requestId={id} />
        </div>
      </div>

      {/* Action Dialog */}
      {dialogOpen && selectedStep && (
        <ApproveRejectDialog
          step={selectedStep}
          onApprove={(comments) => handleAction('approve', comments)}
          onReject={(comments) => handleAction('reject', comments)}
          onRequestRevision={(comments) => handleAction('request_revision', comments)}
          onSkip={(comments) => handleAction('skip', comments)}
          onClose={() => {
            setDialogOpen(false);
            setSelectedStep(null);
          }}
        />
      )}
    </div>
  );
}
