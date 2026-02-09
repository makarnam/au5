import React, { useEffect, useMemo, useState } from 'react';
import findingsService, { Finding, FindingStatus, RiskRating } from '../../services/findingsService';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

type Filters = {
  query: string;
  status: FindingStatus | 'all';
  risk: RiskRating | 'all';
  auditId: string | 'all';
  dueBefore: string;
  tags: string[];
};

const defaultFilters: Filters = {
  query: '',
  status: 'all',
  risk: 'all',
  auditId: 'all',
  dueBefore: '',
  tags: [],
};

export default function FindingsList() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [items, setItems] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<{ id: string; title: string }[]>([]);
  const [views, setViews] = useState<{ id: string; name: string; is_default?: boolean; filters: any }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAudits = async () => {
      const { data, error } = await supabase.from('audits').select('id,title').order('created_at', { ascending: false }).limit(100);
      if (!error) setAudits(data || []);
    };
    const loadViews = async () => {
      try {
        const v = await findingsService.getSavedViews();
        setViews(v);
        const def = v.find(x => x.is_default);
        if (def) {
          const f = def.filters || {};
          setFilters((prev) => ({
            ...prev,
            query: f.query ?? '',
            status: (f.status ?? 'all') as any,
            risk: (f.risk ?? 'all') as any,
            auditId: f.auditId ?? 'all',
            dueBefore: f.dueBefore ?? '',
            tags: f.tags ?? [],
          }));
        }
      } catch { /* noop */ }
    };
    loadAudits();
    loadViews();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await findingsService.list({
        query: filters.query || undefined,
        status: filters.status === 'all' ? undefined : [filters.status],
        risk: filters.risk === 'all' ? undefined : [filters.risk],
        auditId: filters.auditId === 'all' ? undefined : filters.auditId,
        dueBefore: filters.dueBefore || undefined,
        tags: filters.tags.length ? filters.tags : undefined,
        orderBy: 'created_at' as any,
        orderDir: 'desc',
      });
      setItems(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();   }, []);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setTimeout(load, 0);
  };

  const saveCurrentView = async () => {
    const name = prompt('Save view as (name):');
    if (!name) return;
    const payload = {
      query: filters.query || '',
      status: filters.status,
      risk: filters.risk,
      auditId: filters.auditId,
      dueBefore: filters.dueBefore || '',
      tags: filters.tags || [],
    };
    try {
      const created = await findingsService.createSavedView(name, payload, false);
      setViews((v) => [...v, created]);
    } catch (e) {
      console.error(e);
      alert('Failed to save view');
    }
  };

  const applyView = (id: string) => {
    const v = views.find(x => x.id === id);
    if (!v) return;
    const f = v.filters || {};
    setFilters({
      query: f.query ?? '',
      status: (f.status ?? 'all') as any,
      risk: (f.risk ?? 'all') as any,
      auditId: f.auditId ?? 'all',
      dueBefore: f.dueBefore ?? '',
      tags: f.tags ?? [],
    });
    setTimeout(load, 0);
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

  const auditsOptions = useMemo(() => [{ id: 'all', title: 'All Audits' }, ...audits], [audits]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Findings</h1>
        <Button onClick={() => navigate('/findings/create')}>New Finding</Button>
      </div>

      <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-md bg-white">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Search</label>
          <Input placeholder="Title or description..." value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Status</label>
          <select className="w-full border rounded h-10 px-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}>
            {['all','draft','under_review','open','remediated','closed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Risk</label>
          <select className="w-full border rounded h-10 px-2" value={filters.risk} onChange={(e) => setFilters({ ...filters, risk: e.target.value as any })}>
            {['all','low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Audit</label>
          <select className="w-full border rounded h-10 px-2" value={filters.auditId} onChange={(e) => setFilters({ ...filters, auditId: e.target.value })}>
            {auditsOptions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Due before</label>
          <Input type="date" value={filters.dueBefore} onChange={(e) => setFilters({ ...filters, dueBefore: e.target.value })} />
        </div>
        <div className="md:col-span-6 flex gap-2">
          <Button type="submit" variant="default">Apply</Button>
          <Button type="button" variant="secondary" onClick={clearFilters}>Clear</Button>
          <Button type="button" variant="outline" onClick={saveCurrentView}>Save View</Button>
          {views.length > 0 && (
            <select className="border rounded px-2" onChange={(e) => e.target.value && applyView(e.target.value)} defaultValue="">
              <option value="" disabled>Apply saved view...</option>
              {views.map(v => <option key={v.id} value={v.id}>{v.name}{v.is_default ? ' (default)' : ''}</option>)}
            </select>
          )}
        </div>
      </form>

      <div className="overflow-x-auto border rounded-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Audit</th>
              <th className="text-left p-3">Risk</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Due</th>
              <th className="text-left p-3">Owners</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan={7}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-4" colSpan={7}>No findings</td></tr>
            ) : items.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium"><Link to={`/findings/${f.id}`} className="hover:underline">{f.title}</Link></div>
                  <div className="text-xs text-gray-500 truncate max-w-[520px]">{f.description || ''}</div>
                </td>
                <td className="p-3">{f.audit_reference || '-'}</td>
                <td className="p-3">{riskBadge(f.risk_rating)}</td>
                <td className="p-3">{statusBadge(f.workflow_status)}</td>
                <td className="p-3">{f.remediation_due_date || '-'}</td>
                <td className="p-3 text-xs">
                  <div>Internal: {f.internal_owner_id ? f.internal_owner_id.slice(0,8) : '-'}</div>
                  <div>Remediation: {f.remediation_owner_id ? f.remediation_owner_id.slice(0,8) : '-'}</div>
                </td>
                <td className="p-3 text-right">
                  <Link to={`/findings/${f.id}`} className="text-blue-600 hover:underline mr-3">View</Link>
                  <Link to={`/findings/${f.id}/edit`} className="text-gray-700 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
