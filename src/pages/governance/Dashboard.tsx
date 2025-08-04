import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

type Framework = { id: string; code: string; name: string };
type Profile = { id: string; name: string; framework_id: string };
type Posture = { status: string; count: number };
type Snapshot = { snapshot_date: string; overall_score: number | null };

export default function GovernanceDashboard() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [posture, setPosture] = useState<Posture[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const [exceptionsCount, setExceptionsCount] = useState<number>(0);
  const [attestationsCount, setAttestationsCount] = useState<number>(0);
  const [tasksCounts, setTasksCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.from('compliance_frameworks').select('id,code,name').order('name');
      if (!error) {
        const list = (data ?? []) as Framework[];
        setFrameworks(list);
        if (!frameworkId && list.length > 0) setFrameworkId(list[0].id);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!frameworkId) {
        setProfiles([]); setProfileId('');
        return;
      }
      const { data, error } = await supabase
        .from('compliance_profiles')
        .select('id,name,framework_id')
        .eq('framework_id', frameworkId)
        .order('name');
      if (!error) {
        const list = (data ?? []) as Profile[];
        setProfiles(list);
        if (list.length > 0) setProfileId(list[0].id); else setProfileId('');
      }
    };
    run();
  }, [frameworkId]);

  const load = async () => {
    if (!frameworkId) return;
    setLoading(true);

    // v_requirement_posture summary
    const postureQuery = supabase
      .from('v_requirement_posture')
      .select('status', { count: 'exact', head: false })
      .eq('framework_id', frameworkId);

    const { data: postureRows, error: postureErr } = await supabase
      .from('v_requirement_posture')
      .select('status')
      .eq('framework_id', frameworkId);

    if (!postureErr) {
      const counts: Record<string, number> = {};
      (postureRows ?? []).forEach((r: any) => {
        counts[r.status] = (counts[r.status] || 0) + 1;
      });
      const entries: Posture[] = Object.entries(counts).map(([status, count]) => ({ status, count }));
      setPosture(entries);
    }

    // snapshots trend (limit recent 30)
    const { data: snapRows } = await supabase
      .from('compliance_posture_snapshots')
      .select('snapshot_date,overall_score')
      .eq('framework_id', frameworkId)
      .order('snapshot_date', { ascending: true })
      .limit(30);
    setSnapshots((snapRows ?? []) as Snapshot[]);

    // exceptions count (in_effect or approved)
    const { count: excCount } = await supabase
      .from('compliance_exceptions')
      .select('*', { count: 'exact', head: true })
      .eq('framework_id', frameworkId)
      .in('status', ['approved','in_effect']);
    setExceptionsCount(excCount ?? 0);

    // attestations (in progress/draft this quarter)
    const { count: attCount } = await supabase
      .from('compliance_attestations')
      .select('*', { count: 'exact', head: true })
      .eq('framework_id', frameworkId)
      .in('status', ['draft','in_progress']);
    setAttestationsCount(attCount ?? 0);

    // open tasks by status
    const { data: taskRows } = await supabase
      .from('compliance_tasks')
      .select('status')
      .eq('framework_id', frameworkId)
      .in('status', ['open','in_progress','blocked']);
    const tCounts: Record<string, number> = {};
    (taskRows ?? []).forEach((r: any) => { tCounts[r.status] = (tCounts[r.status] || 0) + 1; });
    setTasksCounts(tCounts);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameworkId, profileId]);

  const totalReqs = useMemo(() => posture.reduce((a, b) => a + b.count, 0), [posture]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Governance Dashboard</h1>
        <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Reload'}</Button>
      </div>

      {/* Filters */}
      <div className="border rounded p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="text-sm font-medium mb-1">Framework</div>
          <select className="border p-2 rounded w-full" value={frameworkId} onChange={(e) => setFrameworkId(e.target.value)}>
            {frameworks.map(f => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
            {frameworks.length === 0 && <option value="">No frameworks</option>}
          </select>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">Profile (optional)</div>
          <select className="border p-2 rounded w-full" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            {profiles.length === 0 && <option value="">No profiles</option>}
          </select>
          <div className="text-xs opacity-60 mt-1">Profile affects applicability/assessments; posture view is framework-wide.</div>
        </div>
      </div>

      {/* Posture summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['compliant','partially_compliant','non_compliant','not_applicable','unknown'].map(key => {
          const item = posture.find(p => p.status === key);
          const count = item?.count ?? 0;
          return (
            <div key={key} className="bg-white border rounded p-4">
              <div className="text-sm uppercase opacity-60">{key.replace('_',' ')}</div>
              <div className="text-2xl font-semibold">{count}</div>
            </div>
          );
        })}
        <div className="bg-white border rounded p-4">
          <div className="text-sm uppercase opacity-60">Total</div>
          <div className="text-2xl font-semibold">{totalReqs}</div>
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Posture Trend (overall score)</div>
        <div className="w-full overflow-x-auto">
          <div className="flex items-end gap-2 h-40">
            {snapshots.map((s, idx) => {
              const score = (s.overall_score ?? 0);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="bg-blue-600 w-4" style={{ height: `${Math.max(0, Math.min(100, score)) * 1.2}px` }} />
                  <div className="text-[10px] mt-1 opacity-60">{s.snapshot_date}</div>
                </div>
              );
            })}
            {snapshots.length === 0 && <div className="text-sm opacity-70">No snapshot data.</div>}
          </div>
        </div>
      </div>

      {/* Exceptions / Attestations / Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded p-4">
          <div className="font-medium">Active Exceptions</div>
          <div className="text-3xl font-semibold mt-2">{exceptionsCount}</div>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="font-medium">Attestations (Draft/In Progress)</div>
          <div className="text-3xl font-semibold mt-2">{attestationsCount}</div>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="font-medium">Open Compliance Tasks</div>
          <ul className="mt-2 space-y-1 text-sm">
            {['open','in_progress','blocked'].map(s => (
              <li key={s} className="flex justify-between">
                <span className="capitalize">{s.replace('_',' ')}</span>
                <span className="font-semibold">{tasksCounts[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}