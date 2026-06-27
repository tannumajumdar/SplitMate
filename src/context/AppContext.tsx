import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Expense, Notification, RoomData, RoomMemberData } from '../types';
import { roomApi, expenseApi, tokenStore } from '../services/api';

interface AppContextType {
  // Expenses (real API-backed)
  expenses: Expense[];
  expensesLoading: boolean;
  loadExpenses: (roomId: string) => Promise<void>;
  addExpense: (e: Expense) => void;
  updateExpenseInList: (e: Expense) => void;
  deleteExpense: (id: string) => void;

  // Notifications (in-memory only â€” no backend yet)
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Real API-backed rooms
  apiRooms: RoomData[];
  apiRoomsLoading: boolean;
  loadRooms: () => Promise<void>;
  setApiRooms: React.Dispatch<React.SetStateAction<RoomData[]>>;

  // Active room + members
  activeRoomId: string;
  setActiveRoomId: (id: string) => void;
  activeRoomMembers: RoomMemberData[];
  membersLoading: boolean;
  reloadMembers: () => Promise<void>;
  setActiveRoomMembers: React.Dispatch<React.SetStateAction<RoomMemberData[]>>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // â”€â”€â”€ Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // â”€â”€â”€ Notifications (in-memory) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // â”€â”€â”€ Real API rooms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [apiRooms, setApiRooms] = useState<RoomData[]>([]);
  const [apiRoomsLoading, setApiRoomsLoading] = useState(false);

  // â”€â”€â”€ Active room & members â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [activeRoomId, setActiveRoomIdState] = useState<string>(
    () => localStorage.getItem('sm_active_room') ?? ''
  );
  const [activeRoomMembers, setActiveRoomMembers] = useState<RoomMemberData[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const setActiveRoomId = useCallback((id: string) => {
    setActiveRoomIdState(id);
    localStorage.setItem('sm_active_room', id);
  }, []);

  const loadRooms = useCallback(async () => {
    if (!tokenStore.get()) return;
    setApiRoomsLoading(true);
    try {
      const data = await roomApi.getAll();
      setApiRooms(data);
      if (!localStorage.getItem('sm_active_room') && data.length > 0) {
        setActiveRoomId(data[0].id);
      }
    } catch {
      // Silently fail â€” user may not be logged in yet
    } finally {
      setApiRoomsLoading(false);
    }
  }, [setActiveRoomId]);

  const reloadMembers = useCallback(async () => {
    if (!activeRoomId) return;
    setMembersLoading(true);
    try {
      const members = await roomApi.getMembers(activeRoomId);
      setActiveRoomMembers(members);
    } catch {
      setActiveRoomMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [activeRoomId]);

  const loadExpenses = useCallback(async (roomId: string) => {
    if (!roomId || !tokenStore.get()) return;
    setExpensesLoading(true);
    try {
      const data = await expenseApi.getByRoom(roomId);
      setExpenses(data);
    } catch {
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  // Fetch rooms once on mount
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Re-fetch members and expenses when active room changes
  useEffect(() => {
    if (activeRoomId) {
      reloadMembers();
      loadExpenses(activeRoomId);
    } else {
      setActiveRoomMembers([]);
      setExpenses([]);
    }
  }, [activeRoomId, reloadMembers, loadExpenses]);

  // â”€â”€â”€ Expense helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addExpense = useCallback((e: Expense) => setExpenses((p) => [e, ...p]), []);
  const updateExpenseInList = useCallback(
    (e: Expense) => setExpenses((p) => p.map((x) => (x.id === e.id ? e : x))),
    []
  );
  const deleteExpense = useCallback((id: string) => setExpenses((p) => p.filter((e) => e.id !== id)), []);

  // â”€â”€â”€ Notification helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const unreadCount = notifications.filter((n) => !n.read).length;
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider
      value={{
        expenses, expensesLoading, loadExpenses,
        addExpense, updateExpenseInList, deleteExpense,
        notifications, unreadCount, markNotificationRead, markAllNotificationsRead,
        apiRooms, apiRoomsLoading, loadRooms, setApiRooms,
        activeRoomId, setActiveRoomId,
        activeRoomMembers, membersLoading, reloadMembers, setActiveRoomMembers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

