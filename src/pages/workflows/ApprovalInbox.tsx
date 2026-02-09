import React, { useEffect, useState } from 'react';
import { getMyTasks, approveStep, rejectStep, requestRevision, skipStep } from '../../services/workflows';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Shield,
  AlertCircle,
  ArrowRightCircle,
  MoreHorizontal
} from 'lucide-react';

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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const toggleExpanded = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'audit':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'finding':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Approval Inbox
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage pending approval requests
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Audits</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rows.filter(r => r.entity_type === 'audit').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Findings</p>
                <p className="text-2xl font-bold text-orange-600">
                  {rows.filter(r => r.entity_type === 'finding').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending approvals at this time</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((r) => (
              <motion.div
                key={r.step_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getEntityIcon(r.entity_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {r.entity_type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(r.step_status)}`}>
                          {r.step_status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step {r.step_order}: {r.step_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Request #{r.request_id.slice(0, 8)}...
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          {r.assignee_role}
                        </span>
                        {r.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(r.request_id, 'approve')}
                        disabled={loadingId === r.request_id}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.request_id, 'revise')}
                        disabled={loadingId === r.request_id}
                        className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        <ArrowRightCircle className="w-4 h-4 mr-1" />
                        Revise
                      </button>
                      <button
                        onClick={() => handleAction(r.request_id, 'reject')}
                        disabled={loadingId === r.request_id}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(r.request_id, 'skip')}
                        disabled={loadingId === r.request_id}
                        className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <MoreHorizontal className="w-4 h-4 mr-1" />
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}