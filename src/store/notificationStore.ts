import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export type NotificationChannel = 'in_app' | 'email' | 'push';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationType =
  | 'reminder'
  | 'status_change'
  | 'incident'
  | 'workflow'
  | 'system';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  body: string | null;
  status: NotificationStatus;
  channel: NotificationChannel;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
  meta: Record<string, any> | null;
}

type InboxFilter = 'all' | 'unread' | 'reminders' | 'status' | 'incidents' | 'workflow' | 'system';

interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filter: InboxFilter;
  subscriptionReady: boolean;
}

interface NotificationActions {
  setFilter: (filter: InboxFilter) => void;
  fetch: (opts?: { reset?: boolean }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeRealtime: (userId: string) => void;
  unsubscribeRealtime: () => void;
  reset: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

let channelRef: ReturnType<typeof supabase.channel> | null = null;

function buildQuery(base = supabase.from('notifications').select('*', { count: 'exact' })) {
  // Existing schema uses boolean is_read instead of status, message instead of body, and may not have channel/meta.
  // We still select * and adapt client-side, but always order deterministically.
  return base.order('created_at', { ascending: false });
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  hasMore: true,
  filter: 'all',
  subscriptionReady: false,

  setFilter: (filter) => {
    set({ filter, page: 1, hasMore: true, items: [] });
  },

  fetch: async ({ reset } = { reset: false }) => {
    const { page, pageSize, filter } = get();
    const targetPage = reset ? 1 : page;
    set({ loading: true, error: null });
    try {
      // Base query: current authenticated user's notifications only (RLS should enforce)
      let q = buildQuery().range((targetPage - 1) * pageSize, targetPage * pageSize - 1);

      switch (filter) {
        case 'unread':
          // Schema uses is_read boolean instead of status enum
          q = q.eq('is_read', false);
          break;
        case 'reminders':
          q = q.eq('type', 'reminder' as NotificationType);
          break;
        case 'status':
          q = q.eq('type', 'status_change' as NotificationType);
          break;
        case 'incidents':
          q = q.eq('type', 'incident' as NotificationType);
          break;
        case 'workflow':
          q = q.eq('type', 'workflow' as NotificationType);
          break;
        case 'system':
          q = q.eq('type', 'system' as NotificationType);
          break;
        default:
          // all
          break;
      }

      const { data, error, count } = await q;

      if (error) throw error as PostgrestError;

      const newItems = (data || []) as AppNotification[];
      const merged = reset || targetPage === 1 ? newItems : [...get().items, ...newItems];
      const total = typeof count === 'number' ? count : merged.length;
      const hasMore = merged.length < total;

      // Fetch unread count separately for accuracy (schema uses is_read)
      const { count: unreadCount, error: unreadErr } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (unreadErr) throw unreadErr;

      set({
        items: merged,
        hasMore,
        page: reset ? 1 : targetPage,
        unreadCount: unreadCount || 0,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load notifications', loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Prefer RPC which honors RLS and auth.uid() guard
      const { error } = await supabase.rpc('mark_notification_read', { p_id: id });
      if (error) throw error;
      // Update local state
      set((state): Partial<NotificationStore> => {
        const items = state.items.map((n) => (n.id === id ? ({ ...n, status: 'read' as NotificationStatus } as AppNotification) : n));
        // when adapting legacy schema, reflect locally by treating is_read true as status 'read'
        const wasUnread = state.items.find((n) => n.id === id)?.status === 'unread';
        const unreadCount = Math.max(0, state.unreadCount - (wasUnread ? 1 : 0));
        return { items, unreadCount };
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to mark as read' });
    }
  },

  markAllAsRead: async () => {
    try {
      const { error } = await supabase.rpc('mark_all_notifications_read');
      if (error) throw error;
      set((state): Partial<NotificationStore> => ({
        items: state.items.map((n) => ({ ...n, status: 'read' as NotificationStatus })),
        unreadCount: 0,
      }));
    } catch (e: any) {
      set({ error: e?.message || 'Failed to mark all as read' });
    }
  },

  subscribeRealtime: (userId: string) => {
    if (channelRef) return; // already subscribed
    channelRef = supabase
      .channel(`notifications_user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        } as any,
        (payload: any) => {
          // Insert: add to top, Update: replace, Delete: remove
          set((state): Partial<NotificationStore> => {
            let items = [...state.items];
            if (payload.eventType === 'INSERT') {
              items = [payload.new as AppNotification, ...items];
            } else if (payload.eventType === 'UPDATE') {
              items = items.map((n) => (n.id === payload.new.id ? (payload.new as AppNotification) : n));
            } else if (payload.eventType === 'DELETE') {
              items = items.filter((n) => n.id !== payload.old.id);
            }
            // Schema uses is_read; if not available on payload.new, approximate using existing status
            const incUnread =
              payload.eventType === 'INSERT' &&
              ((payload.new && payload.new.is_read === false) ||
               (payload.new && (payload.new as any).status === 'unread'));
            const unreadCount = incUnread ? state.unreadCount + 1 : state.unreadCount;
            return { items, unreadCount };
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ subscriptionReady: true });
        }
      });
  },

  unsubscribeRealtime: () => {
    if (channelRef) {
      supabase.removeChannel(channelRef);
      channelRef = null;
      set({ subscriptionReady: false });
    }
  },

  reset: () => {
    if (channelRef) {
      supabase.removeChannel(channelRef);
      channelRef = null;
    }
    set({
      items: [],
      unreadCount: 0,
      loading: false,
      error: null,
      page: 1,
      pageSize: 20,
      hasMore: true,
      filter: 'all',
      subscriptionReady: false,
    });
  },
}));