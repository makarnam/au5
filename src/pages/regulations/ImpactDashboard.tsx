import { useEffect, useState } from 'react';
import ImpactChart from '../../components/regulations/ImpactChart';
import type { RegulationImpact } from '../../types/regulation';
import { supabase } from '../../lib/supabase';

export default function ImpactDashboard() {
  const [impacts, setImpacts] = useState<RegulationImpact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('regulation_impact')
          .select('*')
          .order('updated_at', { ascending: false });
        if (error) throw error;
        setImpacts((data as any) || []);
        setError(undefined);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const byStatusMap: Record<string, number> = {};
  const byLevelMap: Record<string, number> = {};
  for (const i of impacts) {
    byStatusMap[i.status] = (byStatusMap[i.status] || 0) + 1;
    byLevelMap[i.impact_level] = (byLevelMap[i.impact_level] || 0) + 1;
  }
  const byStatus = Object.entries(byStatusMap).map(([name, value]) => ({ name, value }));
  const byLevel = Object.entries(byLevelMap).map(([name, value]) => ({ name, value }));

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Regulatory Impact Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ImpactChart title="Impacts by Status" data={byStatus.length ? byStatus : [{ name: 'none', value: 0 }]} />
        <ImpactChart title="Impacts by Level" data={byLevel.length ? byLevel : [{ name: 'none', value: 0 }]} />
      </div>
    </div>
  );
}


