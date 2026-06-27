import { useMemo } from 'react';
import { IoDownloadOutline, IoReceiptOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../data/dummyData';
import { formatCurrency } from '../utils/helpers';
import { cn } from '../utils/helpers';
import type { MonthlyData, CategoryBreakdown } from '../types';

const CHART_COLORS: Record<string, string> = {
  food: '#f59e0b',
  rent: '#6366f1',
  utilities: '#3b82f6',
  groceries: '#10b981',
  transport: '#8b5cf6',
  entertainment: '#ec4899',
  health: '#ef4444',
  shopping: '#f97316',
  internet: '#06b6d4',
  other: '#6b7280',
};

export default function Reports() {
  const { expenses, expensesLoading } = useApp();
  const navigate = useNavigate();

  // Compute monthly data from real expenses
  const monthlyData = useMemo((): MonthlyData[] => {
    if (expenses.length === 0) return [];
    const map = new Map<string, MonthlyData>();
    for (const exp of expenses) {
      const [year, monthStr] = exp.date.split('-');
      const monthNum = parseInt(monthStr, 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const key = `${year}-${monthStr}`;
      if (!map.has(key)) {
        map.set(key, {
          month: monthNames[monthNum - 1] ?? monthStr,
          total: 0,
          rent: 0,
          food: 0,
          utilities: 0,
          groceries: 0,
          other: 0,
        });
      }
      const m = map.get(key)!;
      m.total += exp.amount;
      if (exp.category === 'rent') m.rent += exp.amount;
      else if (exp.category === 'food') m.food += exp.amount;
      else if (exp.category === 'utilities') m.utilities += exp.amount;
      else if (exp.category === 'groceries') m.groceries += exp.amount;
      else m.other += exp.amount;
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [expenses]);

  // Compute category breakdown from real expenses
  const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
    if (expenses.length === 0) return [];
    const map: Record<string, number> = {};
    const total = expenses.reduce((a, e) => a + e.amount, 0);
    for (const exp of expenses) {
      map[exp.category] = (map[exp.category] ?? 0) + exp.amount;
    }
    return Object.entries(map)
      .map(([category, amount]) => ({
        category: category as CategoryBreakdown['category'],
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CHART_COLORS[category] ?? '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const change = currentMonth && prevMonth ? currentMonth.total - prevMonth.total : 0;
  const changePct = prevMonth && prevMonth.total > 0 ? ((change / prevMonth.total) * 100).toFixed(1) : null;
  const avgMonthly = monthlyData.length > 0
    ? Math.round(monthlyData.reduce((a, m) => a + m.total, 0) / monthlyData.length)
    : 0;

  const topCategory = categoryBreakdown[0];
  const topCategoryMeta = topCategory ? CATEGORY_META[topCategory.category] : null;

  const handleExport = () => {
    if (expenses.length === 0) return;
    const csv = [
      ['Date', 'Title', 'Category', 'Amount', 'Paid By', 'Split Method'],
      ...expenses.map((e) => [
        e.date, e.title, e.category, e.amount, e.paidByName ?? e.paidBy, e.splitMethod,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'splitmate-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (expensesLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <IoReceiptOutline size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-base font-semibold text-slate-400 mb-2">No data yet</p>
        <p className="text-sm text-slate-300 dark:text-slate-600 mb-6">
          Add expenses to see your spending reports and charts.
        </p>
        <button
          onClick={() => navigate('/add-expense')}
          className="inline-flex items-center gap-2 bg-gradient-brand text-white text-sm font-medium px-5 h-10 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
        >
          Add First Expense
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-sm text-slate-400">{expenses.length} expenses total</p>
        </div>
        <Button variant="outline" size="sm" icon={<IoDownloadOutline size={15} />} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'This Month',
            value: currentMonth ? formatCurrency(currentMonth.total) : 'â‚¹0',
            badge: changePct ? `${change > 0 ? '+' : ''}${changePct}%` : null,
            color: change > 0 ? 'danger' : 'success',
          },
          { label: 'Monthly Avg', value: formatCurrency(avgMonthly), badge: null, color: 'default' },
          {
            label: 'Top Category',
            value: topCategoryMeta?.label ?? 'â€”',
            badge: topCategoryMeta?.icon ?? null,
            color: 'info',
          },
          { label: 'Total Expenses', value: String(expenses.length), badge: 'all time', color: 'default' },
        ].map((m) => (
          <Card key={m.label} padding="md">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{m.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{m.value}</p>
            {m.badge && (
              <Badge variant={m.color as 'danger' | 'success' | 'info' | 'default'} size="sm" className="mt-1.5">
                {m.badge}
              </Badge>
            )}
          </Card>
        ))}
      </div>

      {/* Monthly spending bar chart (custom, no recharts) */}
      {monthlyData.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Monthly Spending</p>
          <div className="flex items-end gap-2 h-32">
            {monthlyData.map((m) => {
              const maxTotal = Math.max(...monthlyData.map((x) => x.total), 1);
              const heightPct = (m.total / maxTotal) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[9px] text-slate-400 font-medium leading-none">
                    {formatCurrency(m.total).replace('â‚¹', '').replace(',', '')}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '80px' }}>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-400 transition-all"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie visual (horizontal bars) */}
        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Category Breakdown</p>
          <div className="space-y-3">
            {categoryBreakdown.map((item) => {
              const meta = CATEGORY_META[item.category];
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                      <span className="text-[11px] text-slate-400 w-10 text-right">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Month-over-month */}
        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Month-over-Month</p>
          {monthlyData.length < 2 ? (
            <p className="text-xs text-slate-400 text-center py-8">Add expenses in multiple months to see comparison</p>
          ) : (
            <div className="space-y-2">
              {monthlyData.slice(-4).reverse().map((m, i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? m.total - prev.total : 0;
                const pct = prev && prev.total > 0 ? ((diff / prev.total) * 100).toFixed(0) : null;
                return (
                  <div key={m.month} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.month}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(m.total)}</span>
                      {pct && (
                        <Badge variant={diff > 0 ? 'danger' : 'success'} size="sm">
                          {diff > 0 ? 'â†‘' : 'â†“'} {Math.abs(Number(pct))}%
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent category totals */}
      <Card>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">All-Time Summary</p>
        <div className="grid grid-cols-2 gap-3">
          {categoryBreakdown.slice(0, 6).map((item) => {
            const meta = CATEGORY_META[item.category];
            return (
              <div key={item.category} className={cn('flex items-center gap-3 p-3 rounded-xl')} style={{ backgroundColor: meta.bg + '80' }}>
                <span className="text-2xl">{meta.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{meta.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

