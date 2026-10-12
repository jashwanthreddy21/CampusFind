import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  X,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InAppNotification } from '../../types';
import { 
  subscribeToUserNotifications, 
  markNotificationAsRead, 
  deleteInAppNotification 
} from '../../firebase/services';

interface NotificationFeedDropdownProps {
  onSelectCollege?: (collegeId: string) => void;
}

export const NotificationFeedDropdown: React.FC<NotificationFeedDropdownProps> = ({ onSelectCollege }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRegistered = Boolean(user && !user.isAnonymous);

  useEffect(() => {
    if (!user || !isRegistered) {
      setNotifications([]);
      return;
    }

    const unsub = subscribeToUserNotifications(
      user.uid,
      (items) => {
        setNotifications(items);
      },
      (err) => {
        console.warn('Notifications subscription error:', err);
      }
    );

    return () => unsub();
  }, [user, isRegistered]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isRegistered) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markNotificationAsRead(user.uid, n.id)));
  };

  const handleItemClick = async (notif: InAppNotification) => {
    if (user && !notif.read) {
      await markNotificationAsRead(user.uid, notif.id);
    }
    if (onSelectCollege && notif.collegeId) {
      onSelectCollege(notif.collegeId);
      setIsOpen(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    if (!user) return;
    await deleteInAppNotification(user.uid, notifId);
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Cutoff Change & Counseling Alerts"
        className={`relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer ${
          isOpen ? 'bg-indigo-50 text-indigo-700' : ''
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Cutoff & Counseling Alerts</h4>
                <p className="text-[10px] text-slate-300">Upcoming 2026-27 Counseling Cycle</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-indigo-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No cutoff alerts yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Open any college detail modal and click the <strong className="text-indigo-600">Notify Me</strong> bell to track upcoming cutoff shifts.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3 transition-colors hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 relative ${
                    !n.read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  {/* Status Indicator Dot */}
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[11px] font-bold text-indigo-700 font-mono truncate">
                        {n.collegeCode}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(n.createdAt)}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {n.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>

                    {n.cutoffDetails && (
                      <div className="mt-1.5 p-1.5 bg-slate-100 rounded-lg text-[10px] flex items-center justify-between font-mono">
                        <span className="text-slate-600">
                          {n.cutoffDetails.category} Rank:
                        </span>
                        <div className="flex items-center gap-1 font-bold">
                          <span className="line-through text-slate-400">
                            {n.cutoffDetails.oldRank.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-700">→</span>
                          <span className="text-indigo-700">
                            {n.cutoffDetails.newRank.toLocaleString('en-IN')}
                          </span>
                          <span className={n.cutoffDetails.difference > 0 ? 'text-emerald-600' : 'text-amber-600'}>
                            ({n.cutoffDetails.difference > 0 ? `+${n.cutoffDetails.difference}` : n.cutoffDetails.difference})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n.id)}
                    title="Dismiss"
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors cursor-pointer shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-500">
              Official updates from TSCHE & APSCHE counseling portals
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
