import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message?: string | null;
  category?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  payload?: any;
  is_read?: boolean | null;
  is_archived?: boolean | null;
  created_at?: string;
};

const PAGE_SIZE = 20;

export default function NotificationsInbox() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (!error) {
      setItems((data ?? []) as Notification[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page]);

  const unreadCount = useMemo(() => items.filter(n => !n.is_read && !n.is_archived).length, [items]);

  const markRead = async (id: string, v: boolean) => {
    const { error } = await supabase.from('notifications').update({ is_read: v }).eq('id', id);
    if (!error) setItems(prev => prev.map(n => (n.id === id ? { ...n, is_read: v } : n)));
  };

  const archive = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_archived: true }).eq('id', id);
    if (!error) setItems(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    if (!confirm('Archive all notifications on current view?')) return;
    const ids = items.map(n => n.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from('notifications').update({ is_archived: true }).in('id', ids);
    if (!error) load();
  };

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
          <div className="text-sm opacity-70">Unread: {unreadCount} · Total: {total}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? 'Loading...' : 'Reload'}
          </Button>
          <Button variant="destructive" onClick={clearAll} disabled={items.length === 0}>Archive All In View</Button>
        </div>
      </div>

      <div className="border rounded p-4 bg-white grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="border p-2 rounded md:col-span-2"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(0);
              load();
            }
          }}
        />
        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All categories</option>
          <option value="compliance_change">Compliance changes</option>
          <option value="policy_publish">Policy published</option>
          <option value="assessment_due">Assessment due</option>
          <option value="attestation_window">Attestation window</option>
        </select>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setCategory(''); setSearch(''); setPage(0); load(); }}>
            Reset
          </Button>
          <Button onClick={() => { setPage(0); load(); }}>Apply</Button>
        </div>
      </div>

      <div className="border rounded bg-white divide-y">
        {items.length === 0 && !loading ? (
          <div className="p-6 text-sm opacity-70">No notifications.</div>
        ) : null}
        {items.map((n) => (
          <div key={n.id} className={`p-4 ${n.is_read ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <div className="text-sm uppercase tracking-wide opacity-60">{n.category || 'general'}</div>
                <div className="font-semibold">{n.title}</div>
                {n.message ? <div className="text-sm opacity-80 mt-1">{n.message}</div> : null}
                {n.payload ? (
                  <pre className="mt-2 text-xs bg-gray-50 border rounded p-2 overflow-auto max-h-40">
                    {JSON.stringify(n.payload, null, 2)}
                  </pre>
                ) : null}
                <div className="text-xs opacity-60 mt-1">{n.created_at}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => markRead(n.id, !n.is_read)}>
                  {n.is_read ? 'Mark Unread' : 'Mark Read'}
                </Button>
                <Button variant="destructive" onClick={() => archive(n.id)}>Archive</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
          <div className="text-sm opacity-70">Page {page + 1} / {pages}</div>
          <Button variant="outline" onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}>Next</Button>
        </div>
      )}
    </div>
  );
}