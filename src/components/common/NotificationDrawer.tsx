import React from 'react';
import { X, CheckCheck, Bell, Shield, Calendar, Users, FileText } from 'lucide-react';
import { appStore } from '../../services/store';
import { Notification } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const notifications = appStore.getState().notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'LEAD':
        return <Users className="w-4 h-4 text-[#00008F]" />;
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'COMPLIANCE':
        return <Shield className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-[#C91432] text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => appStore.markAllNotificationsRead()}
                className="text-xs text-[#00008F] hover:underline flex items-center gap-1 font-medium"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  appStore.markNotificationRead(n.id);
                  if (n.linkRoute) {
                    onNavigate(n.linkRoute);
                    onClose();
                  }
                }}
                className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-blue-50/60 border-blue-200 text-slate-900 font-medium hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-normal">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Simulated notification queue linked to active pipeline events
        </div>
      </div>
    </div>
  );
};
