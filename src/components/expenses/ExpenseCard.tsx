import { useState } from 'react';
import { IoTrashOutline, IoChevronDownOutline, IoChevronUpOutline, IoPencilOutline } from 'react-icons/io5';
import type { Expense } from '../../types';
import { CATEGORY_META } from '../../data/dummyData';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { cn } from '../../utils/helpers';

function nameToColor(name: string): string {
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface ExpenseCardProps {
  expense: Expense;
  currentUserId: string;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  compact?: boolean;
}

export default function ExpenseCard({
  expense,
  currentUserId,
  onDelete,
  onEdit,
  compact = false,
}: ExpenseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[expense.category] ?? CATEGORY_META.other;
  const paidByName = expense.paidByName ?? expense.paidBy;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
      <div
        className={cn('flex items-center gap-3 p-4', !compact && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80')}
        onClick={() => !compact && setExpanded((v) => !v)}
      >
        {/* Category icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
          style={{ backgroundColor: meta.bg }}
        >
          {meta.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{expense.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Paid by {paidByName} · {formatDate(expense.date)}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex items-center gap-1 ml-1">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <IoPencilOutline size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <IoTrashOutline size={14} />
              </button>
            )}
            <span className="text-slate-300 dark:text-slate-600">
              {expanded ? <IoChevronUpOutline size={14} /> : <IoChevronDownOutline size={14} />}
            </span>
          </div>
        )}
      </div>

      {/* Expanded splits */}
      {expanded && !compact && (
        <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-700/50 pt-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Split — {expense.splitMethod}
            </span>
            {expense.notes && (
              <span className="text-xs text-slate-400 italic">"{expense.notes}"</span>
            )}
          </div>
          {expense.splits.map((split, i) => {
            const name = split.memberName ?? split.userId;
            return (
              <div key={split.userId + i} className="flex items-center gap-2">
                <Avatar name={name} color={nameToColor(name)} size="xs" />
                <span className="text-xs text-slate-700 dark:text-slate-300 flex-1">{name}</span>
                <span className="text-xs font-medium text-slate-900 dark:text-white">
                  {formatCurrency(split.amount)}
                </span>
                <Badge variant={split.isPaid ? 'success' : 'danger'} size="sm" dot>
                  {split.isPaid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
