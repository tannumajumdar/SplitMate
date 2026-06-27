const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5000/api/v1';
const TOKEN_KEY = 'sm_access_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const json = await res.json().catch(() => ({ message: 'Server error' }));
  if (!res.ok) throw new Error((json as { message?: string }).message ?? 'Something went wrong');
  return json as T;
}

// ─── Shared types ────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  provider: 'email' | 'google';
  googleId?: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  // frontend compat fields
  avatarColor: string;
  notificationsEnabled: boolean;
}

interface ApiOk<D> {
  success: true;
  message: string;
  data: D;
}

function mapUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    email: raw.email as string,
    profilePhoto: raw.profilePhoto as string | undefined,
    provider: (raw.provider as 'email' | 'google') ?? 'email',
    googleId: raw.googleId as string | undefined,
    currency: (raw.currency as string) ?? 'INR',
    language: (raw.language as string) ?? 'en',
    theme: (raw.theme as 'light' | 'dark' | 'system') ?? 'system',
    emailNotifications: (raw.emailNotifications as boolean) ?? true,
    pushNotifications: (raw.pushNotifications as boolean) ?? true,
    isVerified: (raw.isVerified as boolean) ?? false,
    isActive: (raw.isActive as boolean) ?? true,
    createdAt: raw.createdAt as string,
    avatarColor: '#6366f1',
    notificationsEnabled: (raw.pushNotifications as boolean) ?? true,
  };
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  register: async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<{ user: AuthUser; accessToken: string; isNewUser: boolean }> => {
    const res = await request<ApiOk<{ user: Record<string, unknown>; accessToken: string; isNewUser: boolean }>>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password, confirmPassword }) }
    );
    return { user: mapUser(res.data.user), accessToken: res.data.accessToken, isNewUser: res.data.isNewUser };
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ user: AuthUser; accessToken: string }> => {
    const res = await request<ApiOk<{ user: Record<string, unknown>; accessToken: string }>>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    return { user: mapUser(res.data.user), accessToken: res.data.accessToken };
  },

  googleAuth: async (
    idToken: string
  ): Promise<{ user: AuthUser; accessToken: string; isNewUser: boolean }> => {
    const res = await request<ApiOk<{ user: Record<string, unknown>; accessToken: string; isNewUser: boolean }>>(
      '/auth/google',
      { method: 'POST', body: JSON.stringify({ idToken }) }
    );
    return { user: mapUser(res.data.user), accessToken: res.data.accessToken, isNewUser: res.data.isNewUser };
  },

  forgotPassword: async (email: string): Promise<void> => {
    await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },

  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<void> => {
    await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await request<ApiOk<{ user: Record<string, unknown> }>>('/auth/me');
    return mapUser(res.data.user);
  },

  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => {}),
};

// ─── User/profile API ────────────────────────────────────────────────────────
export const userApi = {
  updateProfile: async (data: {
    name?: string;
    currency?: string;
    language?: string;
    theme?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }): Promise<AuthUser> => {
    const res = await request<ApiOk<{ user: Record<string, unknown> }>>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return mapUser(res.data.user);
  },

  uploadAvatar: async (file: File): Promise<AuthUser> => {
    const token = tokenStore.get();
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${BASE_URL}/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const json = await res.json().catch(() => ({ message: 'Upload failed' }));
    if (!res.ok) throw new Error((json as { message?: string }).message ?? 'Upload failed');
    return mapUser((json as ApiOk<{ user: Record<string, unknown> }>).data.user);
  },

  deleteAccount: async (): Promise<void> => {
    await request('/users/me', { method: 'DELETE' });
  },
};

// ─── Room API ────────────────────────────────────────────────────────────────
import type { RoomData, RoomMemberData, Expense, Split } from '../types';

function mapRoom(raw: Record<string, unknown>): RoomData {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    description: raw.description as string | undefined,
    createdBy: raw.createdBy as string,
    inviteCode: raw.inviteCode as string,
    createdAt: raw.createdAt as string,
  };
}

function mapMember(raw: Record<string, unknown>): RoomMemberData {
  return {
    id: (raw._id ?? raw.id) as string,
    roomId: raw.roomId as string,
    name: raw.name as string,
    phone: (raw.phone as string) ?? '',
    addedBy: raw.addedBy as string,
    joinedAt: (raw.joinedAt ?? raw.createdAt) as string,
  };
}

export const roomApi = {
  create: async (name: string, description?: string): Promise<RoomData> => {
    const res = await request<ApiOk<{ room: Record<string, unknown> }>>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    return mapRoom(res.data.room);
  },

  getAll: async (): Promise<RoomData[]> => {
    const res = await request<ApiOk<{ rooms: Record<string, unknown>[] }>>('/rooms');
    return res.data.rooms.map(mapRoom);
  },

  getMembers: async (roomId: string): Promise<RoomMemberData[]> => {
    const res = await request<ApiOk<{ members: Record<string, unknown>[] }>>(`/rooms/${roomId}/members`);
    return res.data.members.map(mapMember);
  },

  addMember: async (roomId: string, name: string, phone: string): Promise<RoomMemberData> => {
    const res = await request<ApiOk<{ member: Record<string, unknown> }>>(`/rooms/${roomId}/members`, {
      method: 'POST',
      body: JSON.stringify({ name, phone }),
    });
    return mapMember(res.data.member);
  },

  updateMember: async (
    roomId: string,
    memberId: string,
    data: { name?: string; phone?: string }
  ): Promise<RoomMemberData> => {
    const res = await request<ApiOk<{ member: Record<string, unknown> }>>(`/rooms/${roomId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return mapMember(res.data.member);
  },

  deleteMember: async (roomId: string, memberId: string): Promise<void> => {
    await request(`/rooms/${roomId}/members/${memberId}`, { method: 'DELETE' });
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await request(`/rooms/${roomId}`, { method: 'DELETE' });
  },
};

// ─── Expense API (room-scoped) ────────────────────────────────────────────────
function mapExpense(raw: Record<string, unknown>): Expense {
  const splits = ((raw.splits as Record<string, unknown>[]) ?? []).map((s): Split => ({
    userId: (s.memberId ?? s.userId) as string,
    memberName: s.memberName as string | undefined,
    amount: s.amount as number,
    percentage: s.percentage as number | undefined,
    isPaid: (s.isPaid as boolean) ?? false,
  }));

  return {
    id: (raw._id ?? raw.id) as string,
    title: raw.title as string,
    amount: raw.amount as number,
    category: raw.category as Expense['category'],
    paidBy: raw.paidBy as string,
    paidByName: raw.paidByName as string | undefined,
    splitMethod: (raw.splitMethod ?? 'equal') as Expense['splitMethod'],
    splits,
    date: raw.date
      ? new Date(raw.date as string).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    notes: raw.notes as string | undefined,
    roomId: raw.roomId as string,
    createdAt: raw.createdAt as string,
  };
}

export const expenseApi = {
  getByRoom: async (roomId: string): Promise<Expense[]> => {
    const res = await request<ApiOk<{ expenses: Record<string, unknown>[] }>>(`/rooms/${roomId}/expenses`);
    return res.data.expenses.map(mapExpense);
  },

  create: async (
    roomId: string,
    data: {
      title: string;
      amount: number;
      category: string;
      paidBy: string;
      splitMethod: string;
      splits: Array<{ memberId: string; memberName: string; amount: number; percentage?: number; isPaid: boolean }>;
      notes?: string;
      date?: string;
    }
  ): Promise<Expense> => {
    const res = await request<ApiOk<{ expense: Record<string, unknown> }>>(`/rooms/${roomId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapExpense(res.data.expense);
  },

  update: async (
    roomId: string,
    expenseId: string,
    data: Partial<{
      title: string;
      amount: number;
      category: string;
      notes: string | null;
      date: string;
      splitMethod: string;
      splits: Array<{ memberId: string; memberName: string; amount: number; percentage?: number; isPaid: boolean }>;
    }>
  ): Promise<Expense> => {
    const res = await request<ApiOk<{ expense: Record<string, unknown> }>>(`/rooms/${roomId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return mapExpense(res.data.expense);
  },

  delete: async (roomId: string, expenseId: string): Promise<void> => {
    await request(`/rooms/${roomId}/expenses/${expenseId}`, { method: 'DELETE' });
  },
};

// ─── Rating API ───────────────────────────────────────────────────────────────
export const ratingApi = {
  submit: async (rating: number, review?: string): Promise<void> => {
    await request('/ratings', {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  },

  getMyRating: async (): Promise<{ rating: number; review?: string } | null> => {
    const res = await request<ApiOk<{ rating: { rating: number; review?: string } | null }>>('/ratings/me');
    return res.data.rating;
  },
};
