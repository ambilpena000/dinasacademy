import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageType: 'PTN Premium' | 'SKD' | 'STIS';
  packageName: string;
  amount: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: 'transfer' | 'ewallet';
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  school?: string;
  targetUniversity?: string;
  targetMajor?: string;
  targetType?: 'PTN' | 'Sekdin';
  goals?: string;
  hasPurchasedPackage: boolean;
  packageType?: 'PTN Premium' | 'SKD' | 'STIS';
  profileCompleted?: boolean;
  role?: 'user' | 'admin';
  joinDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  purchasePackage: (packageType: 'PTN Premium' | 'SKD' | 'STIS') => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  orders: Order[];
  ordersLoading: boolean;
  activatePackage: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'uniqueCode' | 'totalAmount'>) => Promise<Order>;
  refreshOrders: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helper: Map raw backend order ke Order interface ──────────────
function mapOrder(o: any): Order {
  return {
    id: String(o.id),
    userId: String(o.userId),
    userName: o.user?.name || o.userName || '',
    userEmail: o.user?.email || o.userEmail || '',
    packageType: o.packageType,
    packageName: o.packageName,
    amount: Number(o.amount),
    uniqueCode: Number(o.uniqueCode),
    totalAmount: Number(o.totalAmount),
    paymentMethod: o.paymentMethod,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) { try { return JSON.parse(stored); } catch { return null; } }
    return null;
  });

  // Orders: mulai dari array kosong — TIDAK ada dummy data
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ── Fetch orders dari backend ────────────────────────────────────
  const refreshOrders = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setOrdersLoading(true);
    try {
      const data: any[] = await api.getAllOrders();
      if (Array.isArray(data)) {
        setOrders(data.map(mapOrder));
      }
    } catch {
      // jika backend belum siap, biarkan orders kosong
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ── Fetch data user terbaru dari backend ─────────────────────────
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const fresh = await api.getMe();
      if (fresh) {
        const updated = {
          ...fresh,
          id: String(fresh.id),
          role: fresh.role === 'admin' ? 'admin' : 'user',
        };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch { /* gagal refresh — biarkan data lama */ }
  }, []);

  // Fetch orders dan user saat login (user berubah)
  React.useEffect(() => {
    if (user) {
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [user?.id]); // hanya saat id user berubah (login/logout)

  // ── LOGIN ─────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      // Bersihkan data lama agar tidak ada dummy orders tersisa
      localStorage.removeItem('orders');
      const u = { ...data.user, id: String(data.user.id) };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (error: any) {
      throw new Error(error.message || 'Email atau password salah');
    }
  };

  // ── REGISTER ──────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem('access_token', data.access_token);
      const u = { ...data.user, id: String(data.user.id) };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mendaftar, coba lagi');
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  // ── UPDATE PROFILE ────────────────────────────────────────────────
  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      const isCompleted = !!(
        updatedUser.phone &&
        updatedUser.school &&
        updatedUser.targetUniversity &&
        updatedUser.targetType &&
        updatedUser.goals
      );
      updatedUser.profileCompleted = isCompleted;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      api.updateProfile({ ...data, profileCompleted: isCompleted }).catch(() => {});
    }
  };

  // ── PURCHASE PACKAGE (local update sementara) ─────────────────────
  const purchasePackage = (packageType: 'PTN Premium' | 'SKD' | 'STIS') => {
    if (user) {
      const updatedUser = { ...user, hasPurchasedPackage: true, packageType };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // ── CHANGE PASSWORD ───────────────────────────────────────────────
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await api.changePassword(oldPassword, newPassword);
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengubah password');
    }
  };

  // ── ADD ORDER — simpan ke backend, tambahkan ke state ─────────────
  const addOrder = async (
    order: Omit<Order, 'id' | 'createdAt' | 'status' | 'uniqueCode' | 'totalAmount'>
  ): Promise<Order> => {
    // Simpan ke backend PostgreSQL
    const saved = await api.createOrder({
      packageName: order.packageName,
      packageType: order.packageType,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
    });

    const newOrder = mapOrder({
      ...saved,
      userName: user?.name || '',
      userEmail: user?.email || '',
    });

    // Tambahkan ke state orders (di bagian depan)
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // ── ADMIN: Aktivasi pesanan ───────────────────────────────────────
  const activatePackage = async (orderId: string) => {
    // Optimistic update UI
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'active' as const } : o)
    );
    try {
      await api.activateOrder(orderId);
      // Refresh semua orders dari backend untuk data terbaru
      await refreshOrders();
    } catch (e) {
      // Rollback jika gagal
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: 'pending' as const } : o)
      );
      throw e;
    }
  };

  // ── ADMIN: Tolak pesanan ──────────────────────────────────────────
  const rejectOrder = async (orderId: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'rejected' as const } : o)
    );
    try {
      await api.rejectOrder(orderId);
      await refreshOrders();
    } catch (e) {
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: 'pending' as const } : o)
      );
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, register, purchasePackage,
      updateProfile, changePassword,
      orders, ordersLoading,
      activatePackage, rejectOrder, addOrder,
      refreshOrders, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
