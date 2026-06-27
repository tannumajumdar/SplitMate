import { NavLink } from 'react-router-dom';
import {
  IoHomeOutline, IoHome,
  IoPeopleOutline, IoPeople,
  IoAddCircleOutline, IoAddCircle,
  IoReceiptOutline, IoReceipt,
  IoSwapHorizontalOutline, IoSwapHorizontal,
  IoBarChartOutline, IoBarChart,
  IoPersonOutline, IoPerson,
} from 'react-icons/io5';
import { cn } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <IoHomeOutline size={20} />, activeIcon: <IoHome size={20} /> },
  { label: 'Room', to: '/room', icon: <IoPeopleOutline size={20} />, activeIcon: <IoPeople size={20} /> },
  { label: 'Add Expense', to: '/add-expense', icon: <IoAddCircleOutline size={20} />, activeIcon: <IoAddCircle size={20} /> },
  { label: 'Expenses', to: '/expenses', icon: <IoReceiptOutline size={20} />, activeIcon: <IoReceipt size={20} /> },
  { label: 'Settlements', to: '/settlements', icon: <IoSwapHorizontalOutline size={20} />, activeIcon: <IoSwapHorizontal size={20} /> },
  { label: 'Reports', to: '/reports', icon: <IoBarChartOutline size={20} />, activeIcon: <IoBarChart size={20} /> },
  { label: 'Profile', to: '/profile', icon: <IoPersonOutline size={20} />, activeIcon: <IoPerson size={20} /> },
];

export default function Sidebar() {
  const { unreadCount } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="SplitMate" className="w-12 h-12 object-contain mix-blend-multiply dark:mix-blend-screen" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">SplitMate</h1>
            <p className="text-xs text-slate-400 leading-none">Split Smarter</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="shrink-0">{isActive ? item.activeIcon : item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Settlements' && unreadCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom hint */}
      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center">
          SplitMate v1.0.0
        </p>
      </div>
    </aside>
  );
}
