import { useEffect, useMemo, useState } from 'react';
import { ComplianceService } from '../../services/compliance';
import type { ComplianceProfile, ComplianceRequirement } from '../../types/compliance';
import { Button } from '../../components/ui/button';

type Props = {
  frameworkId?: string;
};

export default function ProfileEditor({ frameworkId }: Props) {
  const [profiles, setProfiles] = useState<ComplianceProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [applicable, setApplicable] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        ComplianceService.listProfiles(frameworkId),
        frameworkId ? ComplianceService.listRequirements(frameworkId) : Promise.resolve({ data: [], error: null }),
      ]);
      setProfiles((pRes.data ?? []) as ComplianceProfile[]);
      const reqs = (rRes.data ?? []) as ComplianceRequirement[];
      setRequirements(reqs);
      setApplicable(Object.fromEntries(reqs.map(r => [r.id, true])));
      setLoading(false);
    };
    load();
  }, [frameworkId]);

  const selectedProfile = useMemo(() => profiles.find(p => p.id === selectedProfileId), [profiles, selectedProfileId]);

  const toggle = (rid: string) => {
    setApplicable(prev => ({ ...prev, [rid]: !prev[rid] }));
  };

  const saveApplicability = async () => {
    if (!selectedProfile) return;
    // Upsert applicability via compliance_profile_requirements
    // Using RPC or multiple upserts would be ideal; for demo keep it simple:
    for (const r of requirements) {
      await ComplianceService.upsertProfileRequirement({
        profile_id: selectedProfile.id,
        requirement_id: r.id,
        applicable: !!applicable[r.id],
      });
    }
    alert('Applicability saved');
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Profile Editor</h1>
      {loading ? <div>Loading...</div> : null}

      <div className="flex gap-2 items-center">
        <select
          className="border p-2 rounded"
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
        >
          <option value="">Select Profile</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Button onClick={saveApplicability} disabled={!selectedProfileId}>Save Applicability</Button>
      </div>

      {!selectedProfileId ? <div className="text-sm opacity-70">Select a profile to configure applicability.</div> : null}

      <ul className="space-y-2">
        {requirements.map(r => (
          <li key={r.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.requirement_code} - {r.title}</div>
              <div className="text-sm opacity-80">{r.text}</div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!applicable[r.id]} onChange={() => toggle(r.id)} />
              Applicable
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}