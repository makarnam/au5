import { useEffect, useState } from 'react';
import { ComplianceService } from '../../services/compliance';
import { Button } from '../../components/ui/button';

export default function RequirementsBrowser() {
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!frameworkId) return;
      setLoading(true);
      const { data, error } = await ComplianceService.listRequirements(frameworkId);
      if (!error) setRequirements(data ?? []);
      setLoading(false);
    };
    load();
  }, [frameworkId]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Requirements Browser</h1>
      <div className="flex gap-2 items-center">
        <input
          className="border p-2 rounded w-[420px]"
          placeholder="Framework UUID"
          value={frameworkId}
          onChange={(e) => setFrameworkId(e.target.value)}
        />
        <Button onClick={() => { /* open add requirement dialog */ }}>Add Requirement</Button>
      </div>
      {loading ? <div>Loading...</div> : null}
      <ul className="space-y-2">
        {requirements.map((r) => (
          <li key={r.id} className="border rounded p-3">
            <div className="font-semibold">
              {r.requirement_code} - {r.title}
            </div>
            <div className="text-sm opacity-80">{r.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}