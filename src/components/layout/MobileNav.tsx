import { NavLink } from 'react-router-dom';
import {
  IoHomeOutline, IoHome,
  IoPeopleOutline, IoPeople,
  IoReceiptOutline, IoReceipt,
  IoSwapHorizontalOutline, IoSwapHorizontal,
  IoPersonOutline, IoPerson,
} from 'react-icons/io5';
import { cn } from '../../utils/helpers';

const NAV_ITEMS = [
  { label: 'Home',     to: '/dashboard',   icon: IoHomeOutline,            activeIcon: IoHome            },
  { label: 'Rooms',    to: '/room',        icon: IoPeopleOutline,          activeIcon: IoPeople          },
  { label: 'Expenses', to: '/expenses',    icon: IoReceiptOutline,         activeIcon: IoReceipt         },
  { label: 'Settle',   to: '/settlements', icon: IoSwapHorizontalOutline,  activeIcon: IoSwapHorizontal  },
  { label: 'Profile',  to: '/profile',     icon: IoPersonOutline,          activeIcon: IoPerson          },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
      <div className="flex items-stretch h-[62px] px-1">
        {NAV_ITEMS.map(({ label, to, icon: Icon, activeIcon: ActiveIcon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 gap-1 text-[10px] font-semibold transition-colors pt-1',
                isActive ? 'text-primary-400' : 'text-slate-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <ActiveIcon size={22} /> : <Icon size={22} />}
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
