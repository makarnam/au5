import React, { useEffect, useMemo, useState } from 'react';
import { X, Send, Search, Users, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

type Role =
  | 'super_admin'
  | 'admin'
  | 'cro'
  | 'supervisor_auditor'
  | 'auditor'
  | 'reviewer'
  | 'business_unit_manager'
  | 'business_unit_user'
  | 'viewer';

type OrgUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  department: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSent?: (count: number) => void;
};

export default function ComposeNotificationModal({ open, onClose, onSent }: Props) {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Load users list
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, role, department')
          .order('first_name', { ascending: true });

        if (error) throw error;
        if (!active) return;

        // Keep all users including self; allow self-messaging
        setUsers((data || []) as unknown as OrgUser[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load users');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      // Reset transient state when closing
      setSelected({});
      setSelectAll(false);
      setTitle('');
      setMessage('');
      setError(null);
      setInfo(null);
      setSentCount(0);
    };
  }, [open]);

  const roles: (Role | 'all')[] = useMemo(
    () => [
      'all',
      'super_admin',
      'admin',
      'cro',
      'supervisor_auditor',
      'auditor',
      'reviewer',
      'business_unit_manager',
      'business_unit_user',
      'viewer',
    ],
    []
  );

  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
      const hay = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase();
      const matchesText = term.length === 0 || hay.includes(term);
      return matchesRole && matchesText;
    });
  }, [users, filter, roleFilter]);

  const toggleAllVisible = () => {
    const next = !selectAll;
    setSelectAll(next);
    const map: Record<string, boolean> = { ...selected };
    filteredUsers.forEach((u) => {
      map[u.id] = next;
    });
    setSelected(map);
  };

  const toggleOne = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const canSend = title.trim().length > 0 && selectedIds.length > 0 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    setInfo(null);
    try {
      // Prefer batch RPC for performance; fall back to per-recipient if not available
      const { error: batchErr, data: batchCount } = await supabase.rpc('send_notifications', {
        p_recipient_ids: selectedIds,
        p_title: title,
        p_message: message || null,
      });
      if (!batchErr) {
        const count = typeof batchCount === 'number' ? batchCount : selectedIds.length;
        setSentCount(count);
        setInfo(`Sent ${count} message${count === 1 ? '' : 's'} successfully.`);
        onSent?.(count);
        // keep modal open shortly to show info
        setTimeout(() => {
          onClose();
        }, 900);
        return;
      }

      // Fallback to single RPC loop if batch failed (e.g., function missing)
      let count = 0;
      for (const uid of selectedIds) {
        const { error } = await supabase.rpc('send_notification', {
          p_recipient_id: uid,
          p_title: title,
          p_message: message || null,
        });
        if (error) throw error;
        count += 1;
      }
      setSentCount(count);
      setInfo(`Sent ${count} message${count === 1 ? '' : 's'} successfully.`);
      onSent?.(count);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (e: any) {
      setError(e?.message || 'Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Send Notification / Message</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="Search users by name or email"
                  className="w-full pl-9 pr-3 py-2 border rounded-md"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="border rounded-md px-3 py-2"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r === 'all' ? 'All roles' : r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={toggleAllVisible}
                  className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {selectAll ? 'Unselect visible' : 'Select visible'}
                </button>
              </div>
            </div>

            {/* Users table */}
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-72 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left">
                      <th className="px-3 py-2 w-10">Sel</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = u.id === currentUser?.id;
                        const checked = !!selected[u.id];
                        return (
                          <tr key={u.id} className="border-t">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleOne(u.id)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              {u.first_name} {u.last_name} {isSelf && <span className="text-xs text-gray-500">(you)</span>}
                            </td>
                            <td className="px-3 py-2">{u.email}</td>
                            <td className="px-3 py-2">{u.role}</td>
                            <td className="px-3 py-2">{u.department || '-'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Composer */}
            <div className="grid grid-cols-1 gap-3">
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Title (required)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <textarea
                className="border rounded-md px-3 py-2 min-h-[100px]"
                placeholder="Message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded">
                {error}
              </div>
            )}
            {!error && info && (
              <div className="text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2 rounded flex items-center gap-2">
                <Info className="w-4 h-4" />
                {info}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedIds.length} recipient{selectedIds.length === 1 ? '' : 's'} selected
            </div>
            <div className="flex items-center gap-2">
              <button className="border rounded-md px-3 py-2 hover:bg-gray-50" onClick={onClose}>
                Cancel
              </button>
              <button
                className={`rounded-md px-3 py-2 text-white inline-flex items-center gap-2 ${
                  canSend ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
                }`}
                disabled={!canSend}
                onClick={handleSend}
                title={canSend ? 'Send notifications' : 'Add a title and select at least one user'}
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send'}
              </button>
              {sentCount > 0 && !sending && (
                <span className="text-sm text-gray-600">
                  {sentCount} message{sentCount === 1 ? '' : 's'} sent
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}