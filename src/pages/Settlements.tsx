import { IoSwapHorizontal, IoAddCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

export default function Settlements() {
  const { user } = useAuth();
  const { expenses, activeRoomMembers } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  // Compute simple balances from expenses using member IDs
  const balances: Record<string, number> = {};

  for (const exp of expenses) {
    for (const split of exp.splits) {
      if (!split.isPaid && split.userId !== exp.paidBy) {
        // split.userId owes exp.paidBy this amount
        const key = `${split.userId}->${exp.paidBy}`;
        balances[key] = (balances[key] ?? 0) + split.amount;
      }
    }
  }

  const memberName = (memberId: string) =>
    activeRoomMembers.find((m) => m.id === memberId)?.name ?? memberId;

  const entries = Object.entries(balances).filter(([, amt]) => amt > 0.01);

  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-fade-in">
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settle Up</h2>
          <p className="text-sm text-slate-400 mt-0.5">Pending balances from room expenses</p>
        </div>
        <button
          onClick={() => navigate('/add-expense')}
          className="flex items-center gap-2 bg-gradient-brand text-white text-sm font-medium px-4 h-9 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
        >
          <IoAddCircleOutline size={16} /> Add
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4"></div>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">All settled up!</p>
          <p className="text-sm text-slate-400 mb-6">
            {expenses.length === 0
              ? 'Add expenses to track who owes what.'
              : 'No pending balances in this room.'}
          </p>
          {expenses.length === 0 && (
            <button
              onClick={() => navigate('/add-expense')}
              className="inline-flex items-center gap-2 bg-gradient-brand text-white text-sm font-medium px-5 h-10 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
            >
              <IoAddCircleOutline size={16} /> Add First Expense
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
            {entries.length} pending balance{entries.length !== 1 ? 's' : ''}
          </p>
          {entries.map(([key, amount]) => {
            const [fromId, toId] = key.split('->');
            return (
              <Card key={key} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                  <IoSwapHorizontal size={18} className="text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    <span className="text-primary-600 dark:text-primary-400">{memberName(fromId)}</span>
                    {' owes '}
                    <span className="text-primary-600 dark:text-primary-400">{memberName(toId)}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Based on expense splits</p>
                </div>
                <span className="text-base font-bold text-rose-500 shrink-0">{formatCurrency(amount)}</span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

