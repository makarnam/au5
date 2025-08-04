import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

type Framework = { id: string; code: string; name: string };
type Profile = { id: string; name: string; framework_id: string };
type Requirement = { id: string; requirement_code: string; title: string; text: string };
type Control = { id: string; control_code: string; title: string; process_area?: string | null };
type Mapping = { id: string; requirement_id: string; control_id: string; mapping_strength?: string | null; notes?: string | null };

export default function RequirementControlMapping() {
  // Filters
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<string>('');

  // Data
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>('');

  // Load frameworks on mount
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase
        .from('compliance_frameworks')
        .select('id, code, name')
        .order('name');
      if (!error) {
        const list = (data ?? []) as Framework[];
        setFrameworks(list);
        if (!frameworkId && list.length > 0) setFrameworkId(list[0].id);
      }
    };
    init();
  }, []);

  // Load profiles when framework changes
  useEffect(() => {
    const run = async () => {
      if (!frameworkId) {
        setProfiles([]);
        setProfileId('');
        return;
      }
      const { data, error } = await supabase
        .from('compliance_profiles')
        .select('id, name, framework_id')
        .eq('framework_id', frameworkId)
        .order('name');
      if (!error) {
        const list = (data ?? []) as Profile[];
        setProfiles(list);
        if (list.length > 0) setProfileId(list[0].id);
        else setProfileId('');
      }
    };
    run();
  }, [frameworkId]);

  // Load requirements, controls, and mappings for selected framework
  const loadData = async () => {
    if (!frameworkId) return;
    setLoading(true);
    const [reqRes, ctrlRes, mapRes] = await Promise.all([
      supabase
        .from('compliance_requirements')
        .select('id, requirement_code, title, text')
        .eq('framework_id', frameworkId)
        .order('requirement_code', { ascending: true }),
      supabase
        .from('controls')
        .select('id, control_code, title, process_area')
        .order('control_code', { ascending: true }),
      supabase
        .from('requirement_controls_map')
        .select('id, requirement_id, control_id, mapping_strength, notes'),
    ]);

    if (!reqRes.error) setRequirements((reqRes.data ?? []) as Requirement[]);
    if (!ctrlRes.error) setControls((ctrlRes.data ?? []) as Control[]);
    if (!mapRes.error) setMappings((mapRes.data ?? []) as Mapping[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [frameworkId]);

  // Coverage calculations
  const coverageSummary = useMemo(() => {
    const total = requirements.length;
    const mappedReqIds = new Set(mappings.map(m => m.requirement_id));
    const covered = [...mappedReqIds].filter(id => requirements.some(r => r.id === id)).length;
    const percent = total > 0 ? Math.round((covered / total) * 100) : 0;
    return { total, covered, percent };
  }, [requirements, mappings]);

  // Helpers
  const requirementMappings = useMemo(() => {
    const byReq: Record<string, Mapping[]> = {};
    for (const m of mappings) {
      if (!byReq[m.requirement_id]) byReq[m.requirement_id] = [];
      byReq[m.requirement_id].push(m);
    }
    return byReq;
  }, [mappings]);

  const linkControl = async (requirement_id: string, control_id: string) => {
    const { data, error } = await supabase
      .from('requirement_controls_map')
      .insert({
        requirement_id,
        control_id,
        mapping_strength: 'direct',
        notes: null,
      })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setMappings(prev => [...prev, data as Mapping]);
  };

  const unlinkControl = async (mapId: string) => {
    const { error } = await supabase.from('requirement_controls_map').delete().eq('id', mapId);
    if (error) {
      alert(error.message);
      return;
    }
    setMappings(prev => prev.filter(m => m.id !== mapId));
  };

  const selectedRequirement = useMemo(
    () => requirements.find(r => r.id === selectedRequirementId) || null,
    [requirements, selectedRequirementId],
  );

  const availableControls = useMemo(() => {
    if (!selectedRequirement) return controls;
    const linked = new Set((requirementMappings[selectedRequirement.id] ?? []).map(m => m.control_id));
    return controls.filter(c => !linked.has(c.id));
  }, [controls, requirementMappings, selectedRequirement]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Requirement ↔ Control Mapping</h1>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          {loading ? 'Loading...' : 'Reload'}
        </Button>
      </div>

      {/* Filters */}
      <div className="border rounded p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm font-medium mb-1">Framework</div>
            <select
              className="border p-2 rounded w-full"
              value={frameworkId}
              onChange={(e) => setFrameworkId(e.target.value)}
            >
              {frameworks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
              {frameworks.length === 0 && <option value="">No frameworks found</option>}
            </select>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Profile (Optional)</div>
            <select
              className="border p-2 rounded w-full"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              {profiles.length === 0 && <option value="">No profiles found</option>}
            </select>
            <div className="text-xs opacity-60 mt-1">
              Currently showing all requirements for selected framework. Profile scope affects assessments and applicability.
            </div>
          </div>

          <div className="flex items-end">
            <div className="w-full">
              <div className="text-sm font-medium mb-1">Coverage</div>
              <div className="text-sm">
                {coverageSummary.covered}/{coverageSummary.total} covered — {coverageSummary.percent}%
              </div>
              <div className="w-full h-2 bg-gray-200 rounded mt-1">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: `${coverageSummary.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Requirements */}
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2">Requirements</div>
          <ul className="space-y-2 max-h-[70vh] overflow-auto">
            {requirements.map((r) => {
              const linked = requirementMappings[r.id] ?? [];
              return (
                <li
                  key={r.id}
                  className={`border rounded p-3 cursor-pointer ${selectedRequirementId === r.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  onClick={() => setSelectedRequirementId(r.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">
                        {r.requirement_code} — {r.title}
                      </div>
                      <div className="text-xs opacity-70 mt-1 line-clamp-2">{r.text}</div>
                    </div>
                    <div className="text-xs opacity-70">
                      {linked.length} control{linked.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </li>
              );
            })}
            {requirements.length === 0 && <li className="text-sm opacity-70">No requirements found.</li>}
          </ul>
        </div>

        {/* Right: Mapping panel */}
        <div className="border rounded p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="font-medium">Mapping Panel</div>
            {selectedRequirement ? (
              <div className="text-xs opacity-70">
                Selected: {selectedRequirement.requirement_code} — {selectedRequirement.title}
              </div>
            ) : null}
          </div>

          {!selectedRequirement ? (
            <div className="text-sm opacity-70 mt-3">Select a requirement to manage its control mappings.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {/* Linked controls */}
              <div>
                <div className="text-sm font-medium mb-2">Linked Controls</div>
                <ul className="space-y-2 max-h-[50vh] overflow-auto">
                  {(requirementMappings[selectedRequirement.id] ?? []).map((m) => {
                    const c = controls.find(x => x.id === m.control_id);
                    if (!c) return null;
                    return (
                      <li key={m.id} className="border rounded p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{c.control_code} — {c.title}</div>
                            {c.process_area ? <div className="text-xs opacity-60">{c.process_area}</div> : null}
                          </div>
                          <Button variant="destructive" onClick={() => unlinkControl(m.id)}>Unlink</Button>
                        </div>
                      </li>
                    );
                  })}
                  {(requirementMappings[selectedRequirement.id] ?? []).length === 0 && (
                    <li className="text-sm opacity-70">No controls linked.</li>
                  )}
                </ul>
              </div>

              {/* Available controls */}
              <div>
                <div className="text-sm font-medium mb-2">Available Controls</div>
                <ul className="space-y-2 max-h-[50vh] overflow-auto">
                  {availableControls.map((c) => (
                    <li key={c.id} className="border rounded p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{c.control_code} — {c.title}</div>
                          {c.process_area ? <div className="text-xs opacity-60">{c.process_area}</div> : null}
                        </div>
                        <Button onClick={() => linkControl(selectedRequirement.id, c.id)}>Link</Button>
                      </div>
                    </li>
                  ))}
                  {availableControls.length === 0 && (
                    <li className="text-sm opacity-70">No available controls to link.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}