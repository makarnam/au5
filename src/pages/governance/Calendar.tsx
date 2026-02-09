import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

type Framework = { id: string; code: string; name: string };
type Profile = { id: string; name: string; framework_id: string };
type AssessmentDue = { id: string; requirement_id: string; target_remediation_date: string | null; title?: string | null; requirement_code?: string | null };
type AttestationWindow = { id: string; profile_id: string | null; period_start: string; period_end: string; status: string };

type CalendarItem = {
  id: string;
  type: 'assessment' | 'attestation';
  date: string;
  label: string;
  details?: string;
};

export default function GovernanceCalendar() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [assessments, setAssessments] = useState<AssessmentDue[]>([]);
  const [attestations, setAttestations] = useState<AttestationWindow[]>([]);

  // Load frameworks
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

  // Load profiles for selected framework
  useEffect(() => {
    const run = async () => {
      if (!frameworkId) { setProfiles([]); setProfileId(''); return; }
      const { data } = await supabase.from('compliance_profiles').select('id,name,framework_id').eq('framework_id', frameworkId).order('name');
      const list = (data ?? []) as Profile[];
      setProfiles(list);
      if (list.length > 0) setProfileId(list[0].id); else setProfileId('');
    };
    run();
  }, [frameworkId]);

  const load = async () => {
    if (!frameworkId) return;
    setLoading(true);

    // Assessments due (with optional profile filter)
    const aQuery = supabase
      .from('compliance_assessments')
      .select('id,requirement_id,target_remediation_date, requirement_id:requirement_id, framework_id')
      .eq('framework_id', frameworkId)
      .not('target_remediation_date', 'is', null);

    const { data: rawAssess } = await aQuery;
    // Enrich with requirement code/title
    let enriched: AssessmentDue[] = [];
    if (rawAssess && rawAssess.length > 0) {
      const reqIds = Array.from(new Set(rawAssess.map((r: any) => r.requirement_id))).filter(Boolean);
      const reqMap: Record<string, { title: string; code: string }> = {};
      if (reqIds.length > 0) {
        const { data: reqs } = await supabase
          .from('compliance_requirements')
          .select('id, requirement_code, title')
          .in('id', reqIds);
        (reqs ?? []).forEach((x: any) => { reqMap[x.id] = { title: x.title, code: x.requirement_code }; });
      }
      enriched = (rawAssess as any[]).map(a => ({
        id: a.id,
        requirement_id: a.requirement_id,
        target_remediation_date: a.target_remediation_date,
        title: reqMap[a.requirement_id]?.title ?? null,
        requirement_code: reqMap[a.requirement_id]?.code ?? null,
      }));
    }
    setAssessments(enriched);

    // Attestations windows (draft/in_progress in next 90 days)
    const { data: attRows } = await supabase
      .from('compliance_attestations')
      .select('id, profile_id, period_start, period_end, status, framework_id')
      .eq('framework_id', frameworkId)
      .in('status', ['draft','in_progress'])
      .order('period_start', { ascending: true });
    setAttestations((attRows ?? []) as AttestationWindow[]);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameworkId, profileId]);

  // Flatten to calendar items (month view by default)
  const items = useMemo<CalendarItem[]>(() => {
    const list: CalendarItem[] = [];
    assessments.forEach(a => {
      if (!a.target_remediation_date) return;
      list.push({
        id: `assess-${a.id}`,
        type: 'assessment',
        date: a.target_remediation_date,
        label: `${a.requirement_code ?? 'REQ'} due`,
        details: a.title ?? undefined,
      });
    });
    attestations.forEach(at => {
      list.push({
        id: `att-start-${at.id}`,
        type: 'attestation',
        date: at.period_start,
        label: `Attestation starts`,
        details: `${at.status} until ${at.period_end}`,
      });
      list.push({
        id: `att-end-${at.id}`,
        type: 'attestation',
        date: at.period_end,
        label: `Attestation ends`,
        details: at.status,
      });
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [assessments, attestations]);

  // Group by month
  const grouped = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {};
    items.forEach(i => {
      const ym = i.date.slice(0, 7);
      if (!map[ym]) map[ym] = [];
      map[ym].push(i);
    });
    return map;
  }, [items]);

  const months = Object.keys(grouped).sort();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Governance Calendar</h1>
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
          <div className="text-xs opacity-60 mt-1">Use profile to scope downstream views; calendar items currently framework-based.</div>
        </div>
      </div>

      {/* Month groups */}
      {months.length === 0 && <div className="text-sm opacity-70">No upcoming items.</div>}
      <div className="space-y-6">
        {months.map(ym => (
          <div key={ym} className="bg-white border rounded p-4">
            <div className="font-medium mb-3">{ym}</div>
            <ul className="space-y-2">
              {grouped[ym].map(it => (
                <li key={it.id} className="flex items-start justify-between border rounded p-2">
                  <div className="pr-3">
                    <div className="text-sm opacity-70">{it.date}</div>
                    <div className="font-semibold">{it.label}</div>
                    {it.details ? <div className="text-sm opacity-80">{it.details}</div> : null}
                  </div>
                  <div className="text-xs uppercase px-2 py-1 rounded-full"
                       style={{ background: it.type === 'assessment' ? '#FEE2E2' : '#DBEAFE', color: '#111827' }}>
                    {it.type}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}