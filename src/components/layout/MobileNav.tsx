import { NavLink } from 'react-router-dom';
import {
  IoHomeOutline, IoHome,
  IoPeopleOutline, IoPeople,
  IoAddCircle,
  IoSwapHorizontalOutline, IoSwapHorizontal,
  IoPersonOutline, IoPerson,
} from 'react-icons/io5';
import { cn } from '../../utils/helpers';

const navItems = [
  { label: 'Home', to: '/dashboard', icon: <IoHomeOutline size={22} />, activeIcon: <IoHome size={22} /> },
  { label: 'Room', to: '/room', icon: <IoPeopleOutline size={22} />, activeIcon: <IoPeople size={22} /> },
  { label: 'Add', to: '/add-expense', icon: <IoAddCircle size={28} />, activeIcon: <IoAddCircle size={28} />, center: true },
  { label: 'Settle', to: '/settlements', icon: <IoSwapHorizontalOutline size={22} />, activeIcon: <IoSwapHorizontal size={22} /> },
  { label: 'Profile', to: '/profile', icon: <IoPersonOutline size={22} />, activeIcon: <IoPerson size={22} /> },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 safe-bottom">
      <div className="flex items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors',
                item.center
                  ? 'relative'
                  : isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 dark:text-slate-500'
              )
            }
          >
            {({ isActive }) =>
              item.center ? (
                <span
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow -translate-y-3',
                    'bg-gradient-brand text-white'
                  )}
                >
                  {item.icon}
                </span>
              ) : (
                <>
                  {isActive ? item.activeIcon : item.icon}
                  <span>{item.label}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
