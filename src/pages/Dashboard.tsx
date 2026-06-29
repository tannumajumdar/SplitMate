import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoWalletOutline,
  IoReceiptOutline,
  IoAddCircleOutline,
  IoSwapHorizontalOutline,
  IoArrowForwardOutline,
  IoPeopleOutline,
} from 'react-icons/io5';
import Card from '../components/common/Card';
import { PageSkeleton } from '../components/common/LoadingSkeleton';
import ExpenseCard from '../components/expenses/ExpenseCard';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { cn } from '../utils/helpers';

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function QuickAction({ icon, label, to, color }: { icon: React.ReactNode; label: string; to: string; color: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
    >
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow', color)}>
        {icon}
      </div>
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { expenses, expensesLoading, activeRoomMembers } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthTotal = expenses
      .filter((e) => e.date.startsWith(thisMonthPrefix))
      .reduce((a, e) => a + e.amount, 0);

    const lastMonthTotal = expenses
      .filter((e) => e.date.startsWith(lastMonthPrefix))
      .reduce((a, e) => a + e.amount, 0);

    const totalAmount = expenses.reduce((a, e) => a + e.amount, 0);

    const monthChange = lastMonthTotal > 0
      ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(0)
      : null;

    return {
      thisMonthTotal,
      lastMonthTotal,
      totalAmount,
      totalCount: expenses.length,
      monthChange,
      monthChangeUp: thisMonthTotal >= lastMonthTotal,
    };
  }, [expenses]);

  const recentExpenses = expenses.slice(0, 5);

  if (!user) return null;
  if (expensesLoading) return <PageSkeleton />;

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Hey, {user.name.split(' ')[0]}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Here's your financial overview</p>
        </div>
        <button
          onClick={() => navigate('/add-expense')}
          className="flex items-center gap-2 bg-gradient-brand text-white text-sm font-medium px-4 h-9 rounded-xl shadow-sm hover:shadow-glow hover:opacity-90 transition-all"
        >
          <IoAddCircleOutline size={16} /> Add
        </button>
      </div>

      {/* This month hero */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-10 w-24 h-24 rounded-full bg-white/10" />
        <p className="text-sm font-medium opacity-80">This Month</p>
        <p className="text-4xl font-bold tracking-tight mt-1">{formatCurrency(stats.thisMonthTotal)}</p>
        {stats.monthChange !== null && (
          <p className="text-sm opacity-80 mt-1">
            {stats.monthChangeUp ? '↑' : '↓'} {Math.abs(Number(stats.monthChange))}% vs last month
          </p>
        )}
        {stats.monthChange === null && (
          <p className="text-sm opacity-80 mt-1">No previous month data</p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Spent"
          value={formatCurrency(stats.totalAmount)}
          sub="all time"
          icon={<IoWalletOutline size={18} className="text-primary-600" />}
          color="bg-primary-50 dark:bg-primary-900/20"
        />
        <StatCard
          label="Expenses"
          value={String(stats.totalCount)}
          sub="all time"
          icon={<IoReceiptOutline size={18} className="text-violet-600" />}
          color="bg-violet-50 dark:bg-violet-900/20"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(stats.thisMonthTotal)}
          icon={<IoTrendingUpOutline size={18} className="text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          label="Members"
          value={String(activeRoomMembers.length)}
          sub="in room"
          icon={<IoPeopleOutline size={18} className="text-amber-600" />}
          color="bg-amber-50 dark:bg-amber-900/20"
        />
      </div>

      {/* Quick actions */}
      <Card padding="sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1 mb-1">Quick Actions</p>
        <div className="flex justify-around">
          <QuickAction icon={<IoAddCircleOutline size={22} />} label="Add Expense" to="/add-expense" color="bg-gradient-brand" />
          <QuickAction icon={<IoSwapHorizontalOutline size={22} />} label="Settle Up" to="/settlements" color="bg-gradient-success" />
          <QuickAction icon={<IoReceiptOutline size={22} />} label="History" to="/expenses" color="bg-violet-500" />
          <QuickAction icon={<IoTrendingUpOutline size={22} />} label="Reports" to="/reports" color="bg-amber-500" />
        </div>
      </Card>

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent Expenses</p>
            <button onClick={() => navigate('/expenses')} className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-0.5 hover:underline">
              See all <IoArrowForwardOutline size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentExpenses.map((exp) => (
              <ExpenseCard key={exp.id} expense={exp} currentUserId={user.id} compact />
            ))}
          </div>
        </div>
      )}

      {recentExpenses.length === 0 && !expensesLoading && (
        <Card className="text-center py-10">
          <IoReceiptOutline size={36} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400 mb-1">No expenses yet</p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mb-5">Start tracking your room expenses</p>
          <button
            onClick={() => navigate('/add-expense')}
            className="inline-flex items-center gap-2 bg-gradient-brand text-white text-sm font-medium px-5 h-10 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
          >
            <IoAddCircleOutline size={16} /> Add First Expense
          </button>
        </Card>
      )}
    </div>
  );
}

