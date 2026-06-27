// CATEGORY_META is the only genuine constant here — icons, labels, and colors
// are presentation config, not fake data.

export const CATEGORY_META: Record<
  string,
  { label: string; icon: string; color: string; bg: string }
> = {
  food:          { label: 'Food & Drinks',  icon: '🍔', color: '#f59e0b', bg: '#fef3c7' },
  rent:          { label: 'Rent',           icon: '🏠', color: '#6366f1', bg: '#eef2ff' },
  utilities:     { label: 'Utilities',      icon: '💡', color: '#3b82f6', bg: '#dbeafe' },
  groceries:     { label: 'Groceries',      icon: '🛒', color: '#10b981', bg: '#d1fae5' },
  transport:     { label: 'Transport',      icon: '🚗', color: '#8b5cf6', bg: '#ede9fe' },
  entertainment: { label: 'Entertainment',  icon: '🎬', color: '#ec4899', bg: '#fce7f3' },
  health:        { label: 'Health',         icon: '💊', color: '#ef4444', bg: '#fee2e2' },
  shopping:      { label: 'Shopping',       icon: '🛍️', color: '#f97316', bg: '#ffedd5' },
  internet:      { label: 'Internet',       icon: '📡', color: '#06b6d4', bg: '#cffafe' },
  other:         { label: 'Other',          icon: '📦', color: '#6b7280', bg: '#f3f4f6' },
};
