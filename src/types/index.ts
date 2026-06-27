export type ExpenseCategory =
  | 'food'
  | 'rent'
  | 'utilities'
  | 'groceries'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'internet'
  | 'other';

export type SplitMethod = 'equal' | 'percentage' | 'custom';
export type SettlementStatus = 'pending' | 'paid';
export type UPIApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  upiId?: string;
  notificationsEnabled: boolean;
  profilePhoto?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  // preferences
  currency?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  provider?: 'email' | 'google';
  googleId?: string;
}

export interface RoomMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  members: RoomMember[];
  createdAt: string;
  totalExpenses: number;
  icon: string;
}

export interface Split {
  userId: string;       // RoomMember _id
  memberName?: string;  // denormalized member name for display
  amount: number;
  percentage?: number;
  isPaid: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;          // RoomMember _id
  paidByName?: string;     // denormalized name for display
  splitMethod: SplitMethod;
  splits: Split[];
  date: string;
  notes?: string;
  roomId: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: SettlementStatus;
  date: string;
  note?: string;
  expenseIds?: string[];
}

export interface MonthlyData {
  month: string;
  total: number;
  rent: number;
  food: number;
  utilities: number;
  groceries: number;
  other: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
}

export interface BalanceSummary {
  userId: string;
  youOwe: number;
  youAreOwed: number;
  netBalance: number;
}

export interface Notification {
  id: string;
  type: 'expense_added' | 'settlement_request' | 'settlement_done' | 'room_invite';
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

// ─── Real room/member types (API-backed) ────────────────────────────────────
export interface RoomData {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  inviteCode: string;
  createdAt: string;
}

export interface RoomMemberData {
  id: string;
  roomId: string;
  name: string;
  email: string;
  phone: string;
  addedBy: string;
  joinedAt: string;
}
