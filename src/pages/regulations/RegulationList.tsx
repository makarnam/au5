import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegulationCard from '../../components/regulations/RegulationCard';
import { useRegulationStore } from '../../store/regulationStore';
import { regulationService } from '../../services/regulationService';
import { Button } from '../../components/ui/button';

export default function RegulationList() {
  const navigate = useNavigate();
  const { regulations, loading, error, search, setSearch, refresh } = useRegulationStore();
  const [creating, setCreating] = useState(false);
  const [newReg, setNewReg] = useState({ code: '', title: '', jurisdiction: '', category: '' });

  useEffect(() => { refresh(); }, [search]);

  const onCreate = async () => {
    if (!newReg.code.trim() || !newReg.title.trim()) return;
    setCreating(true);
    try {
      const id = await regulationService.createRegulation({
        code: newReg.code.trim(),
        title: newReg.title.trim(),
        jurisdiction: newReg.jurisdiction || null,
        category: newReg.category || null,
        status: 'draft',
      });
      setNewReg({ code: '', title: '', jurisdiction: '', category: '' });
      await refresh();
      navigate(`/regulations/${id}`);
    } catch (e) {
      // noop basic
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Regulatory Change Management</h1>
      </div>

      <div className="bg-white border rounded-lg p-4 flex flex-wrap items-center gap-3">
        <input
          className="border p-2 rounded min-w-72 flex-1"
          placeholder="Search regulations by code/title/description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input className="border p-2 rounded w-36" placeholder="Code" value={newReg.code} onChange={(e) => setNewReg({ ...newReg, code: e.target.value })} />
          <input className="border p-2 rounded w-72" placeholder="Title" value={newReg.title} onChange={(e) => setNewReg({ ...newReg, title: e.target.value })} />
          <input className="border p-2 rounded w-40" placeholder="Jurisdiction" value={newReg.jurisdiction} onChange={(e) => setNewReg({ ...newReg, jurisdiction: e.target.value })} />
          <input className="border p-2 rounded w-40" placeholder="Category" value={newReg.category} onChange={(e) => setNewReg({ ...newReg, category: e.target.value })} />
          <Button onClick={onCreate} disabled={!newReg.code || !newReg.title || creating}>{creating ? 'Creating…' : 'Create'}</Button>
        </div>
      </div>

      {loading ? <div className="p-4">Loading…</div> : null}
      {error ? <div className="p-4 text-red-600">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regulations.map((r) => (
          <RegulationCard key={r.id} item={r} onClick={() => navigate(`/regulations/${r.id}`)} />
        ))}
      </div>
    </div>
  );
}


