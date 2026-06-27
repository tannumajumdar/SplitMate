import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { CategoryBreakdown } from '../../types';
import { CATEGORY_META } from '../../data/dummyData';
import { formatCurrency } from '../../utils/helpers';

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const meta = CATEGORY_META[item.name];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span>{meta?.icon}</span>
        <span className="font-semibold text-slate-900 dark:text-white">{meta?.label ?? item.name}</span>
      </div>
      <p className="text-slate-600 dark:text-slate-400">
        {formatCurrency(item.value)} ({item.payload.percentage.toFixed(1)}%)
      </p>
    </div>
  );
};

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={110}
          innerRadius={55}
          paddingAngle={2}
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => {
            const meta = CATEGORY_META[value];
            return (
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {meta?.icon} {meta?.label ?? value}
              </span>
            );
          }}
          iconSize={8}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
