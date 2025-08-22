import React from 'react';

type Step = {
  id: string;
  step_order: number;
  step_name: string;
  assignee_role: string;
  assignee_id?: string | null;
  status: 'pending' | 'completed' | 'skipped' | 'rejected' | 'revision_required';
  action_by?: string | null;
  action_at?: string | null;
  action?: 'approve' | 'reject' | 'request_revision' | 'skip' | null;
  comments?: string | null;
};

type Props = {
  steps: Step[];
  currentStep?: number;
  onStepClick?: (step: Step) => void;
};

export default function ApprovalTimeline({ steps, currentStep, onStepClick }: Props) {
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <ol className="relative border-s border-gray-200 dark:border-gray-700">
      {sorted.map((s) => {
        const isCurrent = currentStep === s.step_order && s.status === 'pending';
        const isClickable = s.status === 'pending' && onStepClick;
        
        const statusColor =
          s.status === 'completed'
            ? 'bg-emerald-600'
            : s.status === 'rejected'
            ? 'bg-rose-600'
            : s.status === 'revision_required'
            ? 'bg-amber-600'
            : s.status === 'skipped'
            ? 'bg-gray-500'
            : isCurrent
            ? 'bg-blue-600'
            : 'bg-gray-300';

        const stepClasses = `mb-10 ms-6 ${
          isClickable 
            ? 'cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors' 
            : ''
        }`;

        return (
          <li key={s.id} className={stepClasses} onClick={() => isClickable && onStepClick(s)}>
            <span className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white ${statusColor}`} />
            <h3 className="mb-1 text-lg font-semibold">
              {s.step_order}. {s.step_name}
            </h3>
            <time className="block mb-2 text-sm text-gray-500">
              Role: {s.assignee_role}
              {isCurrent ? ' • Current step' : ''}
              {s.action_at ? ` • ${new Date(s.action_at).toLocaleString()}` : ''}
            </time>
            <p className="mb-2 text-sm">
              Status: <span className="font-medium">{s.status}</span>
              {s.action ? ` • Action: ${s.action}` : ''}
            </p>
            {s.comments ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">Comments: {s.comments}</p>
            ) : null}
            {isClickable && (
              <p className="text-xs text-blue-600 mt-1">Click to take action</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}