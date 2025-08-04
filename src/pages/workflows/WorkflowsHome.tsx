import React, { useEffect, useState } from 'react';
import { listWorkflows, getInstances, getMyTasks, startWorkflow } from '../../services/workflows';
import type { WorkflowTemplate, ApprovalRequest, PendingApprovalView, WorkflowEntityType, UUID } from '../../types/workflows';
import { Link, useNavigate } from 'react-router-dom';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    pending_approval: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800',
    revision_required: 'bg-amber-100 text-amber-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return <span className={`text-xs px-2 py-1 rounded ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
}

export default function WorkflowsHome() {
  const [tab, setTab] = useState<'templates' | 'instances' | 'tasks'>('templates');
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [instances, setInstances] = useState<ApprovalRequest[]>([]);
  const [tasks, setTasks] = useState<PendingApprovalView[]>([]);
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState<WorkflowEntityType | ''>('');
  const navigate = useNavigate();

  async function fetchTemplates() {
    setLoading(true);
    const { data } = await listWorkflows({ limit: 50, entity_type: entityType || undefined });
    setTemplates(data || []);
    setLoading(false);
  }

  async function fetchInstances() {
    setLoading(true);
    const { data } = await getInstances({ limit: 50, entity_type: entityType || undefined });
    setInstances(data || []);
    setLoading(false);
  }

  async function fetchTasks() {
    setLoading(true);
    const { data } = await getMyTasks();
    setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === 'templates') fetchTemplates();
    if (tab === 'instances') fetchInstances();
    if (tab === 'tasks') fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, entityType]);

  // Fetch minimal audits to select from when starting an audit workflow
  const [auditOptions, setAuditOptions] = useState<Array<{ id: string; title: string }>>([]);
  async function ensureAuditOptions() {
    // Lazy load once when needed to avoid unnecessary requests
    if (auditOptions.length > 0) return;
    try {
      // Use auditService.getAllAudits (service has this method)
      const mod = await import('../../services/auditService');
      const data = await mod.auditService.getAllAudits();
      if (data && Array.isArray(data)) {
        setAuditOptions(
          data.map((a: any) => ({ id: a.id, title: a.title || a.name || a.id }))
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleStartInstance(wf: WorkflowTemplate) {
    if (wf.entity_type === 'audit') {
      await ensureAuditOptions();
      // Always show dropdown modal for audits
      let entityId: string | null = null;

      // Build a simple modal with search + select
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40';
      const modal = document.createElement('div');
      modal.className = 'bg-white w-full max-w-lg rounded-lg shadow-lg p-4';
      const makeOptions = (items: Array<{id:string; title:string}>, term = '') =>
        items
          .filter((a) => (a.title || '').toLowerCase().includes(term.toLowerCase()))
          .map((a) => `<option value="${a.id}">${(a.title || '').replace(/&/g,'&').replace(/</g,'<')}</option>`)
          .join('');

      modal.innerHTML = `
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Select Audit</h3>
          <button id="auditModalClose" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div class="mt-3">
          <label class="block text-sm font-medium mb-1">Created audits</label>
          <input id="auditSearch" class="w-full border rounded p-2 mb-2" placeholder="Search by title..." />
          <select id="auditSelect" size="8" class="w-full border rounded p-2">
            ${makeOptions(auditOptions)}
          </select>
          ${auditOptions.length === 0 ? '<div class="text-sm text-gray-500 mt-2">No audits found. Create an audit first.</div>' : ''}
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button id="auditModalCancel" class="px-3 py-2 rounded border">Cancel</button>
          <button id="auditModalOk" class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">OK</button>
        </div>
      `;
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const selectEl = modal.querySelector('#auditSelect') as HTMLSelectElement;
      const searchEl = modal.querySelector('#auditSearch') as HTMLInputElement;
      const okBtn = modal.querySelector('#auditModalOk') as HTMLButtonElement;
      const cancelBtn = modal.querySelector('#auditModalCancel') as HTMLButtonElement;
      const closeBtn = modal.querySelector('#auditModalClose') as HTMLButtonElement;
      const remove = () => document.body.removeChild(overlay);

      searchEl?.addEventListener('input', () => {
        if (!selectEl) return;
        selectEl.innerHTML = makeOptions(auditOptions, searchEl.value);
      });

      entityId = await new Promise<string | null>((resolve) => {
        okBtn?.addEventListener('click', () => resolve(selectEl?.value || null), { once: true });
        cancelBtn?.addEventListener('click', () => resolve(null), { once: true });
        closeBtn?.addEventListener('click', () => resolve(null), { once: true });
      });

      remove();
      if (!entityId) return;

      const { data, error } = await startWorkflow({ entity_type: wf.entity_type, entity_id: entityId as UUID, workflow_id: wf.id });
      if (error) {
        alert(error.message || 'Failed to start workflow');
        return;
      }
      navigate(`/workflows/instances/${data?.request_id}`);
      return;
    }

    // Default behavior for other entity types
    const entityId = prompt(`Enter ${wf.entity_type} id to start approval for:`) || null;
    if (!entityId) return;
    const { data, error } = await startWorkflow({ entity_type: wf.entity_type, entity_id: entityId as UUID, workflow_id: wf.id });
    if (error) {
      alert(error.message || 'Failed to start workflow');
      return;
    }
    navigate(`/workflows/instances/${data?.request_id}`);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Workflow Center</h1>
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={entityType}
            onChange={(e) => setEntityType((e.target.value || '') as any)}
          >
            <option value="">All Entities</option>
            <option value="audit">Audit</option>
            <option value="finding">Finding</option>
          </select>
          <button
            onClick={() => navigate('/workflows/new')}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            New Workflow Template
          </button>
        </div>
      </div>

      <div className="mb-4 border-b">
        <nav className="-mb-px flex gap-4">
          {[
            { key: 'templates', label: 'Templates' },
            { key: 'instances', label: 'Instances' },
            { key: 'tasks', label: 'My Tasks' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-3 py-2 border-b-2 ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'templates' && (
        <div>
          {loading ? (
            <div>Loading templates…</div>
          ) : templates.length === 0 ? (
            <div className="text-sm text-gray-600">No templates found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {templates.map((wf) => (
                <div key={wf.id} className="border rounded p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{wf.name}</div>
                      <div className="text-xs text-gray-500">
                        Type: {wf.entity_type} • {wf.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartInstance(wf)}
                        className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                      >
                        Start Instance
                      </button>
                      <Link to={`/workflows/${wf.id}`} className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50">
                        Edit
                      </Link>
                    </div>
                  </div>
                  {wf.description ? <p className="text-sm mt-2 text-gray-700">{wf.description}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'instances' && (
        <div>
          {loading ? (
            <div>Loading instances…</div>
          ) : instances.length === 0 ? (
            <div className="text-sm text-gray-600">No instances found.</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm bg-white border">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-3 py-2 border-b">ID</th>
                    <th className="px-3 py-2 border-b">Entity</th>
                    <th className="px-3 py-2 border-b">Status</th>
                    <th className="px-3 py-2 border-b">Current Step</th>
                    <th className="px-3 py-2 border-b">Requested</th>
                    <th className="px-3 py-2 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border-b font-mono text-xs">{r.id}</td>
                      <td className="px-3 py-2 border-b">{r.entity_type}</td>
                      <td className="px-3 py-2 border-b"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-2 border-b">{r.current_step}</td>
                      <td className="px-3 py-2 border-b">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 border-b text-right">
                        <Link to={`/workflows/instances/${r.id}`} className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          {loading ? (
            <div>Loading tasks…</div>
          ) : tasks.length === 0 ? (
            <div className="text-sm text-gray-600">No pending tasks.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((t) => (
                <div key={t.step_id} className="border rounded p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {t.step_order}. {t.step_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Request: <span className="font-mono">{t.request_id}</span> • Entity: {t.entity_type} • Current: {t.current_step}
                      </div>
                    </div>
                    <Link to={`/workflows/instances/${t.request_id}`} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
