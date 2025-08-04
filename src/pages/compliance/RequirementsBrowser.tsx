import { useEffect, useMemo, useState } from 'react';
import { ComplianceService } from '../../services/compliance';
import type { ComplianceRequirement, ComplianceFramework } from '../../types/compliance';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

type RequirementForm = Partial<ComplianceRequirement> & { framework_id: string };

export default function RequirementsBrowser() {
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<RequirementForm | null>(null);
  const [search, setSearch] = useState('');

  // Control sets and controls for linking UI
  const [controlSets, setControlSets] = useState<{ id: string; name: string; controls_count?: number }[]>([]);
  const [selectedControlSetId, setSelectedControlSetId] = useState<string>('');
  const [controls, setControls] = useState<{ id: string; control_code: string; title: string }[]>([]);
  const [loadingControls, setLoadingControls] = useState(false);

  // Auto-load available Framework UUIDs and default-select first
  useEffect(() => {
    const init = async () => {
      const { data, error } = await ComplianceService.listFrameworks();
      if (!error) {
        const list = (data ?? []) as ComplianceFramework[];
        setFrameworks(list);
        if (!frameworkId && list.length > 0) {
          setFrameworkId(list[0].id);
        }
      }
    };
    init();
  }, []); // run once

  const load = async () => {
    if (!frameworkId) return;
    setLoading(true);
    const { data, error } = await ComplianceService.listRequirements(frameworkId);
    if (!error) setRequirements((data ?? []) as ComplianceRequirement[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [frameworkId]);

  // Load available control sets on mount (all non-deleted)
  useEffect(() => {
    const loadSets = async () => {
      const { data, error } = await supabase
        .from('control_sets')
        .select('id,name,controls_count')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (!error) {
        setControlSets(data || []);
        if (!selectedControlSetId && (data || []).length > 0) {
          setSelectedControlSetId((data as any[])[0].id);
        }
      }
    };
    loadSets();
  }, []);

  // Load controls for selected control set
  useEffect(() => {
    const loadControls = async () => {
      if (!selectedControlSetId) {
        setControls([]);
        return;
      }
      setLoadingControls(true);
      const { data, error } = await supabase
        .from('controls')
        .select('id,control_code,title')
        .eq('control_set_id', selectedControlSetId)
        .eq('is_deleted', false)
        .order('control_code', { ascending: true });
      if (!error) setControls((data as any[]) || []);
      setLoadingControls(false);
    };
    loadControls();
  }, [selectedControlSetId]);

  const filtered = useMemo(() => {
    if (!search) return requirements;
    const q = search.toLowerCase();
    return requirements.filter(r =>
      r.requirement_code.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      (r.text || '').toLowerCase().includes(q)
    );
  }, [requirements, search]);

  const startCreate = () => {
    if (!frameworkId) return;
    setEditing({
      framework_id: frameworkId,
      requirement_code: '',
      title: '',
      text: '',
      guidance: '',
      is_active: true,
    } as RequirementForm);
  };

  const startEdit = (r: ComplianceRequirement) => {
    setEditing({
      ...r,
      framework_id: r.framework_id,
    });
  };

  const cancelEdit = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    if (!editing.framework_id || !editing.requirement_code || !editing.title || !editing.text) return;

    setSaving(true);
    const payload: Partial<ComplianceRequirement> = {
      id: editing.id,
      framework_id: editing.framework_id,
      section_id: editing.section_id || null,
      requirement_code: editing.requirement_code,
      title: editing.title,
      text: editing.text,
      guidance: editing.guidance || null,
      priority: editing.priority || null,
      is_active: editing.is_active ?? true,
    };
    const { data, error } = await ComplianceService.upsertRequirement(payload);
    setSaving(false);
    if (!error) {
      setEditing(null);
      await load();
    } else {
      alert(error.message);
    }
  };

  // Relations: Requirement ↔ Control (existing table requirement_controls_map)
  const [controlLinkingFor, setControlLinkingFor] = useState<string | null>(null);
  const [controlIdToLink, setControlIdToLink] = useState<string>('');

  const linkControl = async (requirementId: string) => {
    if (!controlIdToLink) return;
    const { error } = await ComplianceService.mapControl(requirementId, controlIdToLink);
    if (error) {
      alert(error.message);
      return;
    }
    setControlIdToLink('');
    setControlLinkingFor(null);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Requirements</h1>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Auto-populated Framework selector */}
        <select
          className="border p-2 rounded w-[360px]"
          value={frameworkId}
          onChange={(e) => setFrameworkId(e.target.value)}
        >
          {frameworks.map(f => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.code}) — {f.id}
            </option>
          ))}
          {frameworks.length === 0 && <option value="">No frameworks found</option>}
        </select>

        <input
          className="border p-2 rounded w-[280px]"
          placeholder="Search requirements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={startCreate} disabled={!frameworkId}>Add Requirement</Button>
        <Button variant="outline" onClick={load} disabled={!frameworkId || loading}>
          {loading ? 'Loading...' : 'Reload'}
        </Button>
      </div>

      {editing ? (
        <div className="border rounded p-4 space-y-3 bg-white">
          <div className="font-medium">{editing.id ? 'Edit Requirement' : 'Create Requirement'}</div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Requirement Code (e.g., A.5.1)"
              value={editing.requirement_code ?? ''}
              onChange={(e) => setEditing({ ...editing, requirement_code: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Title"
              value={editing.title ?? ''}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <textarea
              className="border p-2 rounded col-span-2"
              placeholder="Requirement Text"
              rows={3}
              value={editing.text ?? ''}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
            />
            <textarea
              className="border p-2 rounded col-span-2"
              placeholder="Guidance (optional)"
              rows={2}
              value={editing.guidance ?? ''}
              onChange={(e) => setEditing({ ...editing, guidance: e.target.value })}
            />
            <select
              className="border p-2 rounded"
              value={editing.priority ?? 'medium'}
              onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
            >
              <option value="low">Priority: low</option>
              <option value="medium">Priority: medium</option>
              <option value="high">Priority: high</option>
              <option value="critical">Priority: critical</option>
            </select>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.is_active ?? true}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      ) : null}

      {loading ? <div>Loading...</div> : null}

      <ul className="space-y-2">
        {filtered.map((r) => (
          <li key={r.id} className="border rounded p-3 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">
                  {r.requirement_code} - {r.title}
                </div>
                <div className="text-sm opacity-80">{r.text}</div>
                {r.guidance ? <div className="text-xs opacity-70 mt-1">Guidance: {r.guidance}</div> : null}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startEdit(r)}>Edit</Button>
                <Button
                  variant="outline"
                  onClick={() => setControlLinkingFor(controlLinkingFor === r.id ? null : r.id)}
                >
                  Link Control
                </Button>
              </div>
            </div>

            {controlLinkingFor === r.id ? (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Select a Control Set */}
                  <select
                    className="border p-2 rounded w-[320px]"
                    value={selectedControlSetId}
                    onChange={(e) => {
                      setSelectedControlSetId(e.target.value);
                      setControlIdToLink('');
                    }}
                  >
                    {controlSets.length === 0 && <option value="">No control sets</option>}
                    {controlSets.map(cs => (
                      <option key={cs.id} value={cs.id}>
                        {cs.name}{typeof cs.controls_count === 'number' ? ` (${cs.controls_count})` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Then pick a Control from that set */}
                  <select
                    className="border p-2 rounded w-[360px]"
                    value={controlIdToLink}
                    onChange={(e) => setControlIdToLink(e.target.value)}
                    disabled={!selectedControlSetId || loadingControls}
                  >
                    <option value="">{loadingControls ? 'Loading controls...' : 'Select a control'}</option>
                    {controls.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.control_code} — {c.title}
                      </option>
                    ))}
                  </select>

                  <Button onClick={() => linkControl(r.id)} disabled={!controlIdToLink}>
                    Add Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setControlLinkingFor(null);
                      setControlIdToLink('');
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {!loading && filtered.length === 0 ? (
        <div className="text-sm opacity-70">No requirements found.</div>
      ) : null}
    </div>
  );
}