import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

type Framework = { id: string; code: string; name: string };
type Profile = { id: string; name: string; framework_id: string };
type User = { id: string; first_name?: string | null; last_name?: string | null; email?: string | null };

type TrainingModule = {
  id: string;
  title: string;
  description?: string | null;
  framework_id?: string | null;
  url?: string | null;
  estimated_minutes?: number | null;
  is_active?: boolean | null;
  created_at?: string;
};

type TrainingAssignment = {
  id: string;
  module_id: string;
  assigned_to: string;
  profile_id?: string | null;
  due_date?: string | null;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  completed_at?: string | null;
  created_at?: string;
};

export default function GovernanceTraining() {
  // Filters and lookups
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<string>('');

  const [users, setUsers] = useState<User[]>([]);

  // Modules CRUD
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [newModule, setNewModule] = useState<Partial<TrainingModule>>({
    title: '',
    description: '',
    url: '',
    estimated_minutes: 30,
    is_active: true,
  });
  const [savingModule, setSavingModule] = useState(false);

  // Assignments
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // New assignment form
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

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

  // Load profiles for framework
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

  // Load users for assignment
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from('users').select('id,first_name,last_name,email').eq('is_active', true).order('first_name');
      setUsers((data ?? []) as User[]);
    };
    loadUsers();
  }, []);

  const loadModules = async () => {
    setLoadingModules(true);
    let q = supabase
      .from('training_modules')
      .select('*')
      .order('created_at', { ascending: false });
    if (frameworkId) q = q.eq('framework_id', frameworkId);
    const { data } = await q;
    setModules((data ?? []) as TrainingModule[]);
    setLoadingModules(false);
  };

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    let q = supabase
      .from('training_assignments')
      .select('*')
      .order('created_at', { ascending: false });
    if (frameworkId) q = q.eq('framework_id', frameworkId as any); // if column exists in view; otherwise filter via module join on client
    if (profileId) q = q.eq('profile_id', profileId);
    const { data } = await q;
    setAssignments((data ?? []) as TrainingAssignment[]);
    setLoadingAssignments(false);
  };

  useEffect(() => {
    loadModules();
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameworkId, profileId]);

  const createModule = async () => {
    if (!newModule.title) return;
    setSavingModule(true);
    const { data, error } = await supabase
      .from('training_modules')
      .insert({
        title: newModule.title,
        description: newModule.description ?? '',
        url: newModule.url ?? '',
        estimated_minutes: newModule.estimated_minutes ?? 30,
        is_active: newModule.is_active ?? true,
        framework_id: frameworkId || null,
      })
      .select()
      .single();
    setSavingModule(false);
    if (error) {
      alert(error.message); return;
    }
    setNewModule({ title: '', description: '', url: '', estimated_minutes: 30, is_active: true });
    setModules(prev => [data as TrainingModule, ...prev]);
  };

  const assignModule = async () => {
    if (!selectedModuleId || !assigneeId) return;
    setAssigning(true);
    const { data, error } = await supabase
      .from('training_assignments')
      .insert({
        module_id: selectedModuleId,
        assigned_to: assigneeId,
        profile_id: profileId || null,
        due_date: dueDate || null,
        status: 'assigned',
      })
      .select()
      .single();
    setAssigning(false);
    if (error) { alert(error.message); return; }
    setAssignments(prev => [data as TrainingAssignment, ...prev]);
    setAssigneeId(''); setSelectedModuleId(''); setDueDate('');
  };

  const updateAssignmentStatus = async (id: string, status: TrainingAssignment['status']) => {
    const { data, error } = await supabase
      .from('training_assignments')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single();
    if (error) { alert(error.message); return; }
    setAssignments(prev => prev.map(a => a.id === id ? (data as TrainingAssignment) : a));
  };

  const modulesForFramework = useMemo(
    () => (frameworkId ? modules.filter(m => !m.framework_id || m.framework_id === frameworkId) : modules),
    [modules, frameworkId]
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Compliance Training</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { loadModules(); loadAssignments(); }}>
            Reload
          </Button>
        </div>
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
        </div>
      </div>

      {/* Create Module */}
      <div className="border rounded p-4 bg-white space-y-3">
        <div className="font-medium">Create Training Module</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border p-2 rounded" placeholder="Title" value={newModule.title ?? ''} onChange={(e) => setNewModule({ ...newModule, title: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Link (URL)" value={newModule.url ?? ''} onChange={(e) => setNewModule({ ...newModule, url: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Estimated Minutes" type="number" value={newModule.estimated_minutes ?? 30} onChange={(e) => setNewModule({ ...newModule, estimated_minutes: parseInt(e.target.value || '0', 10) })} />
          <textarea className="border p-2 rounded md:col-span-3" placeholder="Description" value={newModule.description ?? ''} onChange={(e) => setNewModule({ ...newModule, description: e.target.value })} />
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={newModule.is_active ?? true} onChange={(e) => setNewModule({ ...newModule, is_active: e.target.checked })} />
            Active
          </label>
        </div>
        <Button onClick={createModule} disabled={savingModule || !newModule.title}>{savingModule ? 'Saving...' : 'Create Module'}</Button>
      </div>

      {/* Assign Module */}
      <div className="border rounded p-4 bg-white space-y-3">
        <div className="font-medium">Assign Training</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select className="border p-2 rounded" value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)}>
            <option value="">Select module</option>
            {modulesForFramework.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <select className="border p-2 rounded" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Select user</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.first_name ?? ''} {u.last_name ?? ''} {u.email ? `(${u.email})` : ''}</option>)}
          </select>
          <input className="border p-2 rounded" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Button onClick={assignModule} disabled={assigning || !selectedModuleId || !assigneeId}>{assigning ? 'Assigning...' : 'Assign'}</Button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="border rounded p-4 bg-white">
        <div className="font-medium mb-2">Assignments</div>
        {loadingAssignments ? <div>Loading...</div> : null}
        <ul className="space-y-2">
          {assignments.map(a => (
            <li key={a.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{modules.find(m => m.id === a.module_id)?.title ?? a.module_id}</div>
                <div className="text-sm opacity-80">User: {users.find(u => u.id === a.assigned_to)?.email ?? a.assigned_to}</div>
                <div className="text-xs opacity-70">Due: {a.due_date ?? '-'}</div>
                <div className="text-xs opacity-70">Status: {a.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => updateAssignmentStatus(a.id, a.status === 'completed' ? 'assigned' : 'completed')}>
                  {a.status === 'completed' ? 'Mark Assigned' : 'Mark Completed'}
                </Button>
                <Button variant="outline" onClick={() => updateAssignmentStatus(a.id, 'cancelled')}>Cancel</Button>
              </div>
            </li>
          ))}
          {assignments.length === 0 && !loadingAssignments ? <li className="text-sm opacity-70">No assignments found.</li> : null}
        </ul>
      </div>
    </div>
  );
}