import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface WorkflowAction {
  id: string;
  request_id: string;
  step_id: string;
  action: 'approve' | 'reject' | 'request_revision' | 'skip';
  action_by: string;
  action_at: string;
  comments?: string;
  user?: {
    full_name?: string;
    email: string;
  };
  step?: {
    step_name: string;
    step_order: number;
  };
}

interface WorkflowHistoryProps {
  requestId: string;
  className?: string;
}

export default function WorkflowHistory({ requestId, className = "" }: WorkflowHistoryProps) {
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      loadWorkflowHistory();
    }
  }, [requestId]);

  async function loadWorkflowHistory() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('approval_actions')
        .select(`
          *,
          user:users!approval_actions_action_by_fkey (
            full_name,
            email
          ),
          step:approval_request_steps!approval_actions_step_id_fkey (
            step_name,
            step_order
          )
        `)
        .eq('request_id', requestId)
        .order('action_at', { ascending: true });

      if (error) throw error;

      setActions(data || []);
    } catch (err) {
      console.error('Error loading workflow history:', err);
      setError('Failed to load workflow history');
    } finally {
      setLoading(false);
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return '✅';
      case 'reject':
        return '❌';
      case 'request_revision':
        return '🔄';
      case 'skip':
        return '⏭️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'reject':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'request_revision':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'skip':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <p className="text-gray-500">No workflow history available</p>
          <p className="text-sm text-gray-400">Actions will appear here as the workflow progresses</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflow History</h3>
        <button
          onClick={loadWorkflowHistory}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`p-4 border rounded-lg ${getActionColor(action.action)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {getActionIcon(action.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium capitalize">
                      {action.action.replace('_', ' ')}
                    </span>
                    {action.step && (
                      <span className="text-sm opacity-75">
                        • Step {action.step.step_order}: {action.step.step_name}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">By:</span>{' '}
                      {action.user?.full_name || action.user?.email || 'Unknown User'}
                    </div>
                    <div>
                      <span className="font-medium">When:</span>{' '}
                      {new Date(action.action_at).toLocaleString()}
                    </div>
                    {action.comments && (
                      <div>
                        <span className="font-medium">Comments:</span>{' '}
                        <span className="italic">{action.comments}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center pt-2 border-t">
        Showing {actions.length} action{actions.length !== 1 ? 's' : ''} in chronological order
      </div>
    </div>
  );
}
