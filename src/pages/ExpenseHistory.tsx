import { useState, useMemo } from 'react';
import {
  IoSearchOutline, IoFilterOutline, IoCloseOutline, IoReceiptOutline,
  IoAddCircleOutline, IoCheckmarkOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import ExpenseCard from '../components/expenses/ExpenseCard';
import Input, { Select, TextArea } from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { TransactionListSkeleton } from '../components/common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { expenseApi } from '../services/api';
import { CATEGORY_META } from '../data/dummyData';
import type { Expense, ExpenseCategory } from '../types';
import { cn } from '../utils/helpers';

const PAGE_SIZE = 10;

const CATEGORY_FILTERS = [
  { value: '', label: 'All' },
  ...Object.entries(CATEGORY_META).map(([value, m]) => ({ value, label: `${m.icon} ${m.label}` })),
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value,
  label: `${meta.icon} ${meta.label}`,
}));

export default function ExpenseHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenses, expensesLoading, deleteExpense, updateExpenseInList, activeRoomId } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('other');
  const [editNotes, setEditNotes] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = !categoryFilter || e.category === categoryFilter;
      const matchFrom = !dateFrom || e.date >= dateFrom;
      const matchTo = !dateTo || e.date <= dateTo;
      return matchSearch && matchCat && matchFrom && matchTo;
    });
  }, [expenses, search, categoryFilter, dateFrom, dateTo]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const clearFilters = () => {
    setCategoryFilter('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
  };

  const activeFilterCount = [categoryFilter, dateFrom, dateTo].filter(Boolean).length;

  const handleDeleteConfirm = async () => {
    if (!deleteId || !activeRoomId) return;
    setDeleting(true);
    try {
      await expenseApi.delete(activeRoomId, deleteId);
      deleteExpense(deleteId);
      setDeleteId(null);
    } catch {
      // show nothing, keep modal open
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (expense: Expense) => {
    setEditExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditNotes(expense.notes ?? '');
    setEditDate(expense.date);
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editExpense || !activeRoomId) return;
    if (!editTitle.trim()) { setEditError('Title is required'); return; }
    const amt = parseFloat(editAmount);
    if (!amt || amt <= 0) { setEditError('Enter a valid amount'); return; }
    setEditError('');
    setEditSaving(true);
    try {
      const updated = await expenseApi.update(activeRoomId, editExpense.id, {
        title: editTitle.trim(),
        amount: amt,
        category: editCategory,
        notes: editNotes.trim() || null,
        date: editDate,
      });
      updateExpenseInList(updated);
      setEditExpense(null);
    } catch (err: unknown) {
      setEditError((err as Error).message ?? 'Failed to update');
    } finally {
      setEditSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4 max-w-2xl mx-auto animate-fade-in">
      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            prefix={<IoSearchOutline size={16} />}
            suffix={search ? (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <IoCloseOutline size={16} />
              </button>
            ) : undefined}
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 h-11 px-3 rounded-xl border text-sm font-medium transition-colors shrink-0',
            showFilters || activeFilterCount > 0
              ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50'
          )}
        >
          <IoFilterOutline size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card p-4 space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Filters</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline">Clear all</button>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.slice(0, 8).map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setCategoryFilter(f.value as ExpenseCategory | ''); setPage(1); }}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors',
                    categoryFilter === f.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="From" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            <Input label="To" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {expensesLoading ? 'Loading...' : `${filtered.length} expense${filtered.length !== 1 ? 's' : ''}`}
        </p>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500">
            <IoCloseOutline size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Expense list */}
      {expensesLoading ? (
        <TransactionListSkeleton />
      ) : paginated.length === 0 ? (
        <div className="text-center py-16">
          <IoReceiptOutline size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">No expenses found</p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1 mb-6">
            {search || activeFilterCount > 0 ? 'Try adjusting your filters' : 'Add your first expense to get started'}
          </p>
          {!search && activeFilterCount === 0 && (
            <button
              onClick={() => navigate('/add-expense')}
              className="inline-flex items-center gap-2 bg-gradient-brand text-white text-sm font-medium px-5 h-10 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
            >
              <IoAddCircleOutline size={16} /> Add Expense
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              currentUserId={user.id}
              onDelete={(id) => setDeleteId(id)}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          Load more ({filtered.length - paginated.length} remaining)
        </button>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Expense" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal open={!!editExpense} onClose={() => setEditExpense(null)} title="Edit Expense" size="sm">
        <div className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => { setEditTitle(e.target.value); setEditError(''); }}
            autoFocus
          />
          <Input
            label="Amount"
            type="number"
            value={editAmount}
            onChange={(e) => { setEditAmount(e.target.value); setEditError(''); }}
            prefix="&#8377;"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              options={CATEGORY_OPTIONS}
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as ExpenseCategory)}
            />
            <Input
              label="Date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
          <TextArea
            label="Notes (optional)"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={2}
          />
          {editError && <p className="text-xs text-rose-500">{editError}</p>}
          <Button fullWidth loading={editSaving} onClick={handleEditSave} icon={<IoCheckmarkOutline size={15} />}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}

