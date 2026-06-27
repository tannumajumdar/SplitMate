import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoCheckmarkCircle, IoPersonAddOutline } from 'react-icons/io5';
import Input, { Select, TextArea } from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import { useApp } from '../context/AppContext';
import { expenseApi } from '../services/api';
import { CATEGORY_META } from '../data/dummyData';
import type { ExpenseCategory, SplitMethod } from '../types';
import { cn } from '../utils/helpers';

const CATEGORIES = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value,
  label: `${meta.icon} ${meta.label}`,
}));

function nameToColor(name: string): string {
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function AddExpense() {
  const navigate = useNavigate();
  const { addExpense, activeRoomId, activeRoomMembers, membersLoading } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paidBy, setPaidBy] = useState('');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // When members load, default paidBy to first member (creator) and select all
  useEffect(() => {
    if (activeRoomMembers.length === 0) return;
    const defaultPaidBy = activeRoomMembers[0].id;
    setPaidBy((p) => p || defaultPaidBy);
    setSelectedMembers(activeRoomMembers.map((m) => m.id));
  }, [activeRoomMembers]);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const calcSplits = () => {
    const total = parseFloat(amount) || 0;
    const members = selectedMembers.length > 0 ? selectedMembers : [paidBy];

    if (splitMethod === 'equal') {
      const share = Math.floor((total / members.length) * 100) / 100;
      return members.map((id, i) => {
        const member = activeRoomMembers.find((m) => m.id === id);
        return {
          memberId: id,
          memberName: member?.name ?? '',
          amount: i === members.length - 1 ? total - share * (members.length - 1) : share,
          isPaid: id === paidBy,
        };
      });
    }
    if (splitMethod === 'percentage') {
      return members.map((id) => {
        const member = activeRoomMembers.find((m) => m.id === id);
        const pct = parseFloat(percentages[id] ?? '0') / 100;
        return {
          memberId: id,
          memberName: member?.name ?? '',
          amount: Math.round(total * pct * 100) / 100,
          percentage: pct * 100,
          isPaid: id === paidBy,
        };
      });
    }
    return members.map((id) => {
      const member = activeRoomMembers.find((m) => m.id === id);
      return {
        memberId: id,
        memberName: member?.name ?? '',
        amount: parseFloat(customAmounts[id] ?? '0'),
        isPaid: id === paidBy,
      };
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Enter an expense title';
    if (!amount || parseFloat(amount) <= 0) e.amount = 'Enter a valid amount';
    if (selectedMembers.length === 0) e.members = 'Select at least one member';
    if (splitMethod === 'percentage') {
      const total = Object.values(percentages).reduce((a, v) => a + parseFloat(v || '0'), 0);
      if (Math.abs(total - 100) > 0.5) e.split = `Percentages must sum to 100% (currently ${total.toFixed(0)}%)`;
    }
    if (splitMethod === 'custom') {
      const total = Object.values(customAmounts).reduce((a, v) => a + parseFloat(v || '0'), 0);
      if (Math.abs(total - parseFloat(amount)) > 0.5) e.split = `Custom amounts must sum to â‚¹${amount}`;
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      const splits = calcSplits();
      const paidByMember = activeRoomMembers.find((m) => m.id === paidBy);

      const created = await expenseApi.create(activeRoomId, {
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        paidBy,
        splitMethod,
        splits,
        date,
        notes: notes.trim() || undefined,
      });

      // Ensure paidByName is set for display
      if (!created.paidByName && paidByMember) {
        created.paidByName = paidByMember.name;
      }

      addExpense(created);
      setSuccess(true);
      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err: unknown) {
      setErrors({ submit: (err as Error).message ?? 'Failed to save expense' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <IoCheckmarkCircle size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Expense Added!</h2>
        <p className="text-sm text-slate-400">Redirecting to expense history¦</p>
      </div>
    );
  }

  if (!activeRoomId || (!membersLoading && activeRoomMembers.length === 0)) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="text-center py-14">
          <div className="text-5xl mb-3"></div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">No members found</p>
          <p className="text-sm text-slate-400 mb-6">
            {!activeRoomId
              ? 'Create a room first, then add your roommates.'
              : 'Add members to this room before splitting an expense.'}
          </p>
          <Link to="/room">
            <Button icon={<IoPersonAddOutline size={16} />}>
              {!activeRoomId ? 'Create a Room' : 'Add Members'}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Basics */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Expense Details</h3>
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Monthly Rent, Pizza Night"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            prefix=""
            error={errors.amount}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              options={CATEGORIES}
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Paid by */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Paid By</h3>
        {membersLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeRoomMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => setPaidBy(m.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                  paidBy === m.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                )}
              >
                <Avatar name={m.name} color={nameToColor(m.name)} size="xs" />
                {m.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Split method */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Split Method</h3>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-4">
          {(['equal', 'percentage', 'custom'] as SplitMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setSplitMethod(m)}
              className={cn(
                'flex-1 py-2 text-sm font-medium capitalize transition-colors',
                splitMethod === m
                  ? 'bg-gradient-brand text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Split Between</p>
          {errors.members && <p className="text-xs text-rose-500">{errors.members}</p>}
          {membersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            activeRoomMembers.map((m) => {
              const selected = selectedMembers.includes(m.id);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMember(m.id)}
                    className={cn(
                      'flex items-center gap-2 flex-1 p-2.5 rounded-xl border text-sm transition-all',
                      selected
                        ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className={cn('w-4 h-4 rounded flex items-center justify-center border-2 transition-colors shrink-0', selected ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-slate-600')}>
                      {selected && <IoCheckmarkCircle size={10} className="text-white" />}
                    </div>
                    <Avatar name={m.name} color={nameToColor(m.name)} size="xs" />
                    <span className="text-slate-700 dark:text-slate-300">{m.name.split(' ')[0]}</span>
                  </button>

                  {selected && splitMethod === 'percentage' && (
                    <Input
                      placeholder="0"
                      type="number"
                      value={percentages[m.id] ?? ''}
                      onChange={(e) => setPercentages((p) => ({ ...p, [m.id]: e.target.value }))}
                      suffix="%"
                      fullWidth={false}
                      className="w-24"
                    />
                  )}
                  {selected && splitMethod === 'custom' && (
                    <Input
                      placeholder="0"
                      type="number"
                      value={customAmounts[m.id] ?? ''}
                      onChange={(e) => setCustomAmounts((p) => ({ ...p, [m.id]: e.target.value }))}
                      prefix=""
                      fullWidth={false}
                      className="w-24"
                    />
                  )}
                  {selected && splitMethod === 'equal' && amount && (
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-20 text-right shrink-0">
                      â‚¹{(parseFloat(amount) / (selectedMembers.length || 1)).toFixed(0)}
                    </span>
                  )}
                </div>
              );
            })
          )}
          {errors.split && <p className="text-xs text-rose-500 mt-1">{errors.split}</p>}
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <TextArea
          label="Notes (optional)"
          placeholder=" about this expenses"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Card>

      {errors.submit && (
        <p className="text-sm text-rose-500 text-center bg-rose-50 dark:bg-rose-900/20 rounded-xl px-4 py-3">
          {errors.submit}
        </p>
      )}

      <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
        Save Expense
      </Button>
    </div>
  );
}

