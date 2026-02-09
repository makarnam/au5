import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

type Framework = { id: string; code: string; name: string };
type Profile = { id: string; name: string; framework_id: string };
type AssessmentRow = {
  requirement_id: string;
  requirement_code: string;
  requirement_title: string;
  profile_id: string | null;
  status: string;
  score: number | null;
  last_evaluated_at: string | null;
};
type SnapshotRow = {
  snapshot_date: string;
  overall_score: number | null;
  compliant_count: number;
  partial_count: number;
  non_compliant_count: number;
  not_applicable_count: number;
  unknown_count: number;
};

function exportCSV(filename: string, rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map(r =>
    columns.map(c => {
      const val = (r as any)[c.key];
      const str = val === null || val === undefined ? '' : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function GovernanceReporting() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworkId, setFrameworkId] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState('');

  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [status, setStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from('compliance_frameworks').select('id,code,name').order('name');
      const list = (data ?? []) as Framework[];
      setFrameworks(list);
      if (!frameworkId && list.length > 0) setFrameworkId(list[0].id);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!frameworkId) { setProfiles([]); setProfileId(''); return; }
      const { data } = await supabase
        .from('compliance_profiles')
        .select('id,name,framework_id')
        .eq('framework_id', frameworkId)
        .order('name');
      const list = (data ?? []) as Profile[];
      setProfiles(list);
      if (list.length > 0) setProfileId(list[0].id); else setProfileId('');
    };
    run();
  }, [frameworkId]);

  const load = async () => {
    if (!frameworkId) return;
    setLoading(true);

    // Assessments query with filters
    let aQuery = supabase
      .from('compliance_assessments')
      .select('requirement_id, profile_id, status, score, last_evaluated_at, requirement_id:requirement_id, framework_id')
      .eq('framework_id', frameworkId);

    if (profileId) aQuery = aQuery.eq('profile_id', profileId);
    if (status) aQuery = aQuery.eq('status', status);
    if (dateStart) aQuery = aQuery.gte('last_evaluated_at', dateStart);
    if (dateEnd) aQuery = aQuery.lte('last_evaluated_at', dateEnd);

    const { data: assessRows } = await aQuery;

    // Enrich with requirement metadata
    let finalAssess: AssessmentRow[] = [];
    if (assessRows && assessRows.length > 0) {
      const reqIds = Array.from(new Set(assessRows.map((r: any) => r.requirement_id))).filter(Boolean);
      const reqMap: Record<string, { code: string; title: string }> = {};
      if (reqIds.length > 0) {
        const { data: reqs } = await supabase
          .from('compliance_requirements')
          .select('id, requirement_code, title')
          .in('id', reqIds);
        (reqs ?? []).forEach((x: any) => { reqMap[x.id] = { code: x.requirement_code, title: x.title }; });
      }
      finalAssess = (assessRows as any[]).map(a => ({
        requirement_id: a.requirement_id,
        requirement_code: reqMap[a.requirement_id]?.code ?? '',
        requirement_title: reqMap[a.requirement_id]?.title ?? '',
        profile_id: a.profile_id ?? null,
        status: a.status,
        score: a.score,
        last_evaluated_at: a.last_evaluated_at,
      }));
    }
    setAssessments(finalAssess);

    // Snapshots query
    let sQuery = supabase
      .from('compliance_posture_snapshots')
      .select('snapshot_date, overall_score, compliant_count, partial_count, non_compliant_count, not_applicable_count, unknown_count')
      .eq('framework_id', frameworkId)
      .order('snapshot_date', { ascending: true });

    if (profileId) sQuery = sQuery.eq('profile_id', profileId);
    if (dateStart) sQuery = sQuery.gte('snapshot_date', dateStart);
    if (dateEnd) sQuery = sQuery.lte('snapshot_date', dateEnd);

    const { data: snaps } = await sQuery;
    setSnapshots((snaps ?? []) as SnapshotRow[]);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameworkId, profileId]);

  const assessCols = useMemo(() => ([
    { key: 'requirement_code', label: 'Requirement' },
    { key: 'requirement_title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'score', label: 'Score' },
    { key: 'last_evaluated_at', label: 'Last Evaluated' },
  ]), []);

  const snapshotCols = useMemo(() => ([
    { key: 'snapshot_date', label: 'Date' },
    { key: 'overall_score', label: 'Overall Score' },
    { key: 'compliant_count', label: 'Compliant' },
    { key: 'partial_count', label: 'Partial' },
    { key: 'non_compliant_count', label: 'Non-compliant' },
    { key: 'not_applicable_count', label: 'N/A' },
    { key: 'unknown_count', label: 'Unknown' },
  ]), []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Governance Reporting</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Reload'}</Button>
          <Button onClick={() => exportCSV('assessments.csv', assessments, assessCols)}>Export Assessments CSV</Button>
          <Button onClick={() => exportCSV('snapshots.csv', snapshots, snapshotCols)}>Export Snapshots CSV</Button>
          <Button variant="outline" onClick={() => window.print()}>Print / PDF</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border rounded p-4 bg-white grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-1">
          <div className="text-sm font-medium mb-1">Framework</div>
          <select className="border p-2 rounded w-full" value={frameworkId} onChange={(e) => setFrameworkId(e.target.value)}>
            {frameworks.map(f => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
            {frameworks.length === 0 && <option value="">No frameworks</option>}
          </select>
        </div>
        <div className="md:col-span-1">
          <div className="text-sm font-medium mb-1">Profile (optional)</div>
          <select className="border p-2 rounded w-full" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            {profiles.length === 0 && <option value="">No profiles</option>}
          </select>
        </div>
        <div className="md:col-span-1">
          <div className="text-sm font-medium mb-1">Status</div>
          <select className="border p-2 rounded w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="compliant">compliant</option>
            <option value="partially_compliant">partially_compliant</option>
            <option value="non_compliant">non_compliant</option>
            <option value="not_applicable">not_applicable</option>
            <option value="unknown">unknown</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <div className="text-sm font-medium mb-1">Date Start</div>
          <input className="border p-2 rounded w-full" type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
        </div>
        <div className="md:col-span-1">
          <div className="text-sm font-medium mb-1">Date End</div>
          <input className="border p-2 rounded w-full" type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white border rounded p-4 overflow-auto">
        <div className="font-medium mb-2">Assessments</div>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              {assessCols.map(c => <th key={c.key} className="px-3 py-2 text-left text-sm border-b">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {assessments.map((r, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {assessCols.map(c => <td key={c.key} className="px-3 py-2 text-sm">{(r as any)[c.key]}</td>)}
              </tr>
            ))}
            {assessments.length === 0 && <tr><td className="px-3 py-4 text-sm opacity-70" colSpan={assessCols.length}>No rows</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Snapshots Table */}
      <div className="bg-white border rounded p-4 overflow-auto">
        <div className="font-medium mb-2">Snapshots</div>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-50">
              {snapshotCols.map(c => <th key={c.key} className="px-3 py-2 text-left text-sm border-b">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {snapshots.map((r, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {snapshotCols.map(c => <td key={c.key} className="px-3 py-2 text-sm">{(r as any)[c.key]}</td>)}
              </tr>
            ))}
            {snapshots.length === 0 && <tr><td className="px-3 py-4 text-sm opacity-70" colSpan={snapshotCols.length}>No rows</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}