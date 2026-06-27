import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { MonthlyData } from '../../types';
import { CATEGORY_META } from '../../data/dummyData';
import { useTheme } from '../../context/ThemeContext';

interface MonthlyChartProps {
  data: MonthlyData[];
  stacked?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-slate-500 dark:text-slate-400 capitalize">{p.dataKey}</span>
          </div>
          <span className="font-medium text-slate-900 dark:text-white">₹{p.value.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

export default function MonthlyChart({ data, stacked = false }: MonthlyChartProps) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#94a3b8';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={stacked ? 28 : 18} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', radius: 8 }} />
        {stacked ? (
          <>
            <Bar dataKey="rent" stackId="a" fill={CATEGORY_META.rent.color} radius={[0, 0, 0, 0]} />
            <Bar dataKey="utilities" stackId="a" fill={CATEGORY_META.utilities.color} radius={[0, 0, 0, 0]} />
            <Bar dataKey="food" stackId="a" fill={CATEGORY_META.food.color} radius={[0, 0, 0, 0]} />
            <Bar dataKey="groceries" stackId="a" fill={CATEGORY_META.groceries.color} radius={[0, 0, 0, 0]} />
            <Bar dataKey="other" stackId="a" fill={CATEGORY_META.other.color} radius={[4, 4, 0, 0]} />
          </>
        ) : (
          <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
