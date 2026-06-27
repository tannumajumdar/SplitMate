import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IoNotificationsOutline,
  IoNotifications,
  IoSunnyOutline,
  IoMoonOutline,
  IoChevronBackOutline,
} from 'react-icons/io5';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime } from '../../utils/helpers';
import { cn } from '../../utils/helpers';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/room': 'My Room',
  '/add-expense': 'Add Expense',
  '/expenses': 'Expense History',
  '/settlements': 'Settlements',
  '/reports': 'Reports & Analytics',
  '/profile': 'My Profile',
  '/privacy-policy': 'Privacy Policy',
};

export default function Header() {
  const { user } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const title = PAGE_TITLES[location.pathname] ?? 'SplitMate';

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const canGoBack = location.pathname !== '/dashboard';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile logo + back */}
        <div className="flex lg:hidden items-center gap-2">
          {canGoBack ? (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            >
              <IoChevronBackOutline size={18} />
            </button>
          ) : (
            <img src="/favicon.png" alt="SplitMate" className="w-10 h-10 object-contain mix-blend-multiply dark:mix-blend-screen" />
          )}
        </div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {isDark ? <IoSunnyOutline size={18} /> : <IoMoonOutline size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {notifOpen ? <IoNotifications size={18} /> : <IoNotificationsOutline size={18} />}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notifications {unreadCount > 0 && <span className="ml-1 text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        'px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors',
                        !n.read && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(n.timestamp)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        {user && (
          <button onClick={() => navigate('/profile')} className="ml-1">
            <Avatar name={user.name} color={user.avatarColor} size="sm" ring />
          </button>
        )}
      </div>
    </header>
  );
}
