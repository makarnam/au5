import React, { useEffect, useMemo, useState } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import type { AppNotification } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { Check, Filter, RefreshCw, SendHorizonal } from 'lucide-react';

// Derive the filter union from store state by sampling type
type InboxFilter = ReturnType<typeof useNotificationStore> extends infer T
  ? T extends { filter: infer F }
    ? F
    : 'all'
  : 'all';

const tabs: { key: InboxFilter; label: string }[] = [
  { key: 'all' as InboxFilter, label: 'All' },
  { key: 'unread' as InboxFilter, label: 'Unread' },
  { key: 'reminders' as InboxFilter, label: 'Reminders' },
  { key: 'status' as InboxFilter, label: 'Status' },
  { key: 'incidents' as InboxFilter, label: 'Incidents' },
  { key: 'workflow' as InboxFilter, label: 'Workflow' },
  { key: 'system' as InboxFilter, label: 'System' },
];

async function fetchSent(): Promise<any[]> {
  // Fetch sent with recipient names by joining to users on user_id
  const { supabase } = await import('../../lib/supabase');
  // 1) Pull basic sent rows
  const { data: sent, error } = await supabase.rpc('list_sent_notifications');
  if (error) throw error;
  const rows = (sent || []) as any[];

  if (rows.length === 0) return rows;

  // 2) Collect unique recipient IDs
  const recipientIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));

  // 3) Fetch recipient user profiles (id, first_name, last_name, email)
  const recipientsById: Record<string, { first_name: string; last_name: string; email: string }> = {};
  if (recipientIds.length > 0) {
    const { data: usersData, error: usersErr } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', recipientIds as string[]);
    if (usersErr) throw usersErr;
    (usersData || []).forEach((u: any) => {
      recipientsById[u.id] = { first_name: u.first_name, last_name: u.last_name, email: u.email };
    });
  }

  // 4) Enrich rows with recipient display name
  const enriched = rows.map((r) => {
    const rec = recipientsById[r.user_id] || null;
    return {
      ...r,
      recipient_name: rec ? `${rec.first_name || ''} ${rec.last_name || ''}`.trim() : null,
      recipient_email: rec ? rec.email : null,
    };
  });

  return enriched;
}

export default function NotificationsInbox() {
  const { user } = useAuthStore();
  const {
    items,
    unreadCount,
    loading,
    error,
    hasMore,
    filter,
    setFilter,
    fetch,
    markAsRead,
    markAllAsRead,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);

  // Sent messages state
  const [showSent, setShowSent] = useState(false);
  const [sentItems, setSentItems] = useState<any[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [sentError, setSentError] = useState<string | null>(null);

  const loadSent = async () => {
    setSentLoading(true);
    setSentError(null);
    try {
      const rows = await fetchSent();
      setSentItems(rows);
    } catch (e: any) {
      setSentError(e?.message || 'Failed to load sent messages');
    } finally {
      setSentLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetch({ reset: true });
    subscribeRealtime(user.id);
    return () => unsubscribeRealtime();
  }, [user, fetch, subscribeRealtime, unsubscribeRealtime]);

  useEffect(() => {
    if (showSent) {
      loadSent();
    }
  }, [showSent]);

  useEffect(() => {
    // When filter changes, reload from page 1
    fetch({ reset: true });
  }, [filter, fetch]);

  const filteredLabel = useMemo(
    () => tabs.find((t) => t.key === filter)?.label || 'All',
    [filter]
  );

  const loadMore = async () => {
    if (loading || !hasMore) return;
    // Increment page and fetch next slice
    // We can't directly mutate page here since store manages it; call fetch with current page+1 by setting state via set()
    // For simplicity, call fetch() to get next page by temporarily updating page locally:
    // We'll implement a light workaround: increase internal page using fetch without reset and by reading existing page length
    await fetch({ reset: false });
  };

  const doRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch({ reset: true });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          {!showSent ? (
            <p className="text-sm text-gray-500">
              {filteredLabel} • {items.length} shown • {unreadCount} unread
            </p>
          ) : (
            <p className="text-sm text-gray-500">Sent • {sentItems.length} messages</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!showSent && (
            <>
              <button
                onClick={doRefresh}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => markAllAsRead()}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
            </>
          )}
          <button
            onClick={() => setShowSent((s) => !s)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
            title={showSent ? 'Show Inbox' : 'Show Sent'}
          >
            <SendHorizonal className="w-4 h-4" />
            {showSent ? 'Inbox' : 'Sent'}
          </button>
        </div>
      </div>

      {!showSent && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  filter === t.key ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showSent && error && (
        <div className="mb-4 px-4 py-2 rounded bg-red-50 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}
      {showSent && sentError && (
        <div className="mb-4 px-4 py-2 rounded bg-red-50 text-sm text-red-700 border border-red-200">
          {sentError}
        </div>
      )}

      <div className="bg-white rounded-md border">
        {!showSent ? (
          loading && items.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No notifications</div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n.id} className={`p-4 ${n.status === 'unread' ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{n.title}</div>
                      {(n as any).body && <div className="text-sm text-gray-700 mt-1">{(n as any).body}</div>}
                      {(n as any).message && <div className="text-sm text-gray-700 mt-1">{(n as any).message}</div>}
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                        <span>{new Date(n.created_at).toLocaleString()}</span>
                        {n.type && <span className="px-1.5 py-0.5 rounded bg-gray-100">{n.type}</span>}
                        {n.entity_type && n.entity_id && (
                          <span className="px-1.5 py-0.5 rounded bg-gray-100">
                            {n.entity_type} #{n.entity_id}
                          </span>
                        )}
                      </div>
                    </div>
                    {n.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs hover:bg-gray-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : sentLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading sent...</div>
        ) : sentItems.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No sent messages</div>
        ) : (
          <ul className="divide-y">
            {sentItems.map((s) => (
              <li key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{s.title}</div>
                    {s.message && <div className="text-sm text-gray-700 mt-1">{s.message}</div>}
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                      <span>{new Date(s.created_at).toLocaleString()}</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100">
                        recipient: {s.recipient_name || s.recipient_email || s.user_id}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          s.is_read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {s.is_read ? 'read' : 'unread'}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!showSent && (
        <div className="flex justify-center">
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="mt-4 px-4 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}