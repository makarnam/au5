import React, { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    unreadCount,
    fetch,
    subscribeRealtime,
    unsubscribeRealtime,
    items,
    markAllAsRead,
  } = useNotificationStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch({ reset: true });
    subscribeRealtime(user.id);
    return () => unsubscribeRealtime();
  }, [user, fetch, subscribeRealtime, unsubscribeRealtime]);

  const top5 = items.slice(0, 5);

  return (
    <div className="relative">
      <button
        type="button"
        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 relative"
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <span className="text-sm font-medium">Notifications</span>
            <button
              onClick={async () => {
                await markAllAsRead();
              }}
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
              title="Mark all as read"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {top5.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">No notifications</div>
            ) : (
              <ul className="divide-y">
                {top5.map((n) => (
                  <li key={n.id} className={`px-4 py-3 ${n.status === 'unread' ? 'bg-blue-50' : ''}`}>
                    <div className="text-sm font-medium text-gray-900">{n.title}</div>
                    {n.body && <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.body}</div>}
                    <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-2">
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                      {n.type && <span className="px-1.5 py-0.5 rounded bg-gray-100">{n.type}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2 border-t">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="w-full text-sm text-blue-600 hover:underline py-1.5"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}