
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { User, Expense, Settlement } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM');
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function getUserById(users: User[], id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function calcNetBalance(
  userId: string,
  expenses: Expense[],
  settlements: Settlement[]
): { youOwe: number; youAreOwed: number; net: number } {
  let youOwe = 0;
  let youAreOwed = 0;

  for (const exp of expenses) {
    if (exp.paidBy === userId) {
      for (const split of exp.splits) {
        if (split.userId !== userId && !split.isPaid) {
          youAreOwed += split.amount;
        }
      }
    } else {
      const mySplit = exp.splits.find((s) => s.userId === userId);
      if (mySplit && !mySplit.isPaid) {
        youOwe += mySplit.amount;
      }
    }
  }

  for (const s of settlements) {
    if (s.status === 'paid') continue;
    if (s.toUserId === userId) youAreOwed += s.amount;
    if (s.fromUserId === userId) youOwe += s.amount;
  }

  return { youOwe, youAreOwed, net: youAreOwed - youOwe };
}

export function getMonthlyTotal(expenses: Expense[], month: string): number {
  return expenses
    .filter((e) => e.date.startsWith(month))
    .reduce((acc, e) => acc + e.amount, 0);
}

export function groupExpensesByCategory(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const exp of expenses) {
    map[exp.category] = (map[exp.category] ?? 0) + exp.amount;
  }
  return map;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
