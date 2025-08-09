import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { regulationService } from '../../services/regulationService';
import type { Regulation, Amendment, RegulationImpact, ImpactLevel, ImpactTargetType, ImpactStatus } from '../../types/regulation';
import { supabase } from '../../lib/supabase';

export default function RegulationDetail() {
  const { id } = useParams();
  const regulationId = id as string;

  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [impacts, setImpacts] = useState<RegulationImpact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // Create amendment form
  const [newAmendment, setNewAmendment] = useState({ title: '', summary: '', effective_date: '' });

  // Add impact form
  const [impact, setImpact] = useState<{ target_type: ImpactTargetType; target_id: string; impact_level: ImpactLevel; notes: string }>({ target_type: 'control', target_id: '', impact_level: 'medium', notes: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; label: string }>>([]);

  const reload = async () => {
    setLoading(true);
    try {
      const [r, a, i] = await Promise.all([
        regulationService.getRegulation(regulationId),
        regulationService.listAmendments(regulationId),
        regulationService.listImpacts(regulationId),
      ]);
      setRegulation(r);
      setAmendments(a);
      setImpacts(i);
      setError(undefined);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [regulationId]);

  const onCreateAmendment = async () => {
    if (!newAmendment.title.trim()) return;
    await regulationService.createAmendment(regulationId, {
      title: newAmendment.title.trim(),
      summary: newAmendment.summary || null,
      effective_date: newAmendment.effective_date || null,
      status: 'published',
    });
    setNewAmendment({ title: '', summary: '', effective_date: '' });
    await reload();
  };

  const searchTargets = async (type: ImpactTargetType, q: string) => {
    if (!q || q.length < 2) { setSearchResults([]); return; }
    if (type === 'framework') {
      const { data } = await supabase.from('compliance_frameworks').select('id,name,code').ilike('name', `%${q}%`).limit(20);
      setSearchResults((data || []).map((x: any) => ({ id: x.id, label: `${x.code} · ${x.name}` })));
    } else if (type === 'control') {
      const { data } = await supabase.from('controls').select('id,title,control_code').ilike('title', `%${q}%`).eq('is_deleted', false).limit(20);
      setSearchResults((data || []).map((x: any) => ({ id: x.id, label: `${x.control_code ? x.control_code + ' · ' : ''}${x.title}` })));
    } else if (type === 'policy') {
      const { data } = await supabase.from('policies').select('id,title').ilike('title', `%${q}%`).limit(20);
      setSearchResults((data || []).map((x: any) => ({ id: x.id, label: x.title })));
    } else {
      const { data } = await supabase.from('risks').select('id,title').ilike('title', `%${q}%`).limit(20);
      setSearchResults((data || []).map((x: any) => ({ id: x.id, label: x.title })));
    }
  };

  const addImpact = async () => {
    if (!impact.target_id) return;
    await regulationService.upsertImpact({
      regulation_id: regulationId,
      target_type: impact.target_type,
      target_id: impact.target_id,
      impact_level: impact.impact_level,
      status: 'pending',
      notes: impact.notes || null,
    } as any);
    setImpact({ target_type: 'control', target_id: '', impact_level: 'medium', notes: '' });
    setSearchQuery(''); setSearchResults([]);
    await reload();
  };

  const groupedImpacts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byLevel: Record<string, number> = {};
    for (const i of impacts) {
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      byLevel[i.impact_level] = (byLevel[i.impact_level] || 0) + 1;
    }
    return { byStatus, byLevel };
  }, [impacts]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!regulation) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{regulation.title}</h1>
        <Link to="/regulations/impact-dashboard" className="text-sm text-blue-600 hover:underline">Impact Dashboard</Link>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-2">
        <div className="text-sm text-gray-500">Code: {regulation.code}</div>
        <div className="text-sm text-gray-500">Status: {regulation.status}</div>
        <div className="text-sm text-gray-500">Effective: {regulation.effective_date ? new Date(regulation.effective_date).toLocaleDateString() : '-'}</div>
        {regulation.description ? <div className="text-sm text-gray-700 whitespace-pre-wrap">{regulation.description}</div> : null}
        {regulation.source_url ? <a className="text-sm text-blue-600 hover:underline" href={regulation.source_url} target="_blank" rel="noreferrer">Source</a> : null}
      </div>

      {/* Amendments */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="font-medium">Amendments</div>
        <div className="flex items-center gap-2 flex-wrap">
          <input className="border p-2 rounded w-72" placeholder="Title" value={newAmendment.title} onChange={(e) => setNewAmendment({ ...newAmendment, title: e.target.value })} />
          <input className="border p-2 rounded w-80" placeholder="Summary" value={newAmendment.summary} onChange={(e) => setNewAmendment({ ...newAmendment, summary: e.target.value })} />
          <input className="border p-2 rounded w-44" placeholder="Effective date (YYYY-MM-DD)" value={newAmendment.effective_date} onChange={(e) => setNewAmendment({ ...newAmendment, effective_date: e.target.value })} />
          <Button onClick={onCreateAmendment} disabled={!newAmendment.title}>Add Amendment</Button>
        </div>
        <ul className="divide-y border rounded">
          {amendments.map((a) => (
            <li key={a.id} className="p-3">
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-gray-500">Effective: {a.effective_date ? new Date(a.effective_date).toLocaleDateString() : '-'}</div>
              {a.summary ? <div className="text-sm text-gray-700">{a.summary}</div> : null}
            </li>
          ))}
        </ul>
      </div>

      {/* Impacts */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="font-medium">Impacts</div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="border p-2 rounded" value={impact.target_type} onChange={(e) => { setImpact({ ...impact, target_type: e.target.value as ImpactTargetType, target_id: '' }); setSearchQuery(''); setSearchResults([]); }}>
            <option value="framework">Framework</option>
            <option value="control">Control</option>
            <option value="policy">Policy</option>
            <option value="risk">Risk</option>
          </select>
          <input className="border p-2 rounded w-72" placeholder={`Search ${impact.target_type}s…`} value={searchQuery} onChange={async (e) => { setSearchQuery(e.target.value); await searchTargets(impact.target_type, e.target.value); }} />
          <select className="border p-2 rounded w-80" value={impact.target_id} onChange={(e) => setImpact({ ...impact, target_id: e.target.value })}>
            <option value="">— choose —</option>
            {searchResults.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <select className="border p-2 rounded" value={impact.impact_level} onChange={(e) => setImpact({ ...impact, impact_level: e.target.value as ImpactLevel })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <input className="border p-2 rounded w-80" placeholder="Notes (optional)" value={impact.notes} onChange={(e) => setImpact({ ...impact, notes: e.target.value })} />
          <Button onClick={addImpact} disabled={!impact.target_id}>Add Impact</Button>
        </div>

        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Target</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Level</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {impacts.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2 pr-3">{i.target_id}</td>
                <td className="py-2 pr-3">{i.target_type}</td>
                <td className="py-2 pr-3">{i.impact_level}</td>
                <td className="py-2 pr-3">{i.status}</td>
                <td className="py-2 pr-3">{i.updated_at ? new Date(i.updated_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


