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
  activatedAt?: string;
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
  photoUrl?: string;  // FIX #5: URL foto dari server, bukan base64
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

function mapOrder(o: any): Order {
  return {
    id:            String(o.id),
    userId:        String(o.userId),
    userName:      o.user?.name   || o.userName  || '',
    userEmail:     o.user?.email  || o.userEmail || '',
    packageType:   o.packageType,
    packageName:   o.packageName,
    amount:        Number(o.amount),
    uniqueCode:    Number(o.uniqueCode),
    totalAmount:   Number(o.totalAmount),
    paymentMethod: o.paymentMethod,
    status:        o.status,
    createdAt:     o.createdAt,
    activatedAt:   o.activatedAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) { try { return JSON.parse(stored); } catch { return null; } }
    return null;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ── FIX #4: auto-refresh user setelah login (ambil hasPurchasedPackage terbaru)
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const fresh = await api.getMe();
      if (fresh) {
        const updated: User = {
          ...fresh,
          id:   String(fresh.id),
          role: fresh.role === 'admin' ? 'admin' : 'user',
        };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch { /* token expired → api.ts handle401 sudah redirect */ }
  }, []);

  const refreshOrders = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setOrdersLoading(true);
    try {
      const data: any[] = await api.getAllOrders();
      if (Array.isArray(data)) setOrders(data.map(mapOrder));
    } catch {
      // biarkan orders kosong
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      refreshOrders();
      // FIX #4: selalu ambil data terbaru dari server saat app dibuka
      refreshUser();
    } else {
      setOrders([]);
    }
  }, [user?.id]);

  // ── FIX #6: validasi token saat app dimuat — jika expired langsung logout
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Decode JWT (tidak perlu library — hanya baca payload)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs    = payload.exp * 1000;
      const nowMs    = Date.now();

      if (nowMs >= expMs) {
        // Token sudah expired
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        return;
      }

      // Pasang timer untuk auto-logout tepat saat token expired
      const msUntilExpiry = expMs - nowMs;
      const timer = setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        // Redirect ke login kalau bukan di halaman publik
        const publicPaths = ['/', '/login', '/register', '/paket-info'];
        if (!publicPaths.some(p => window.location.pathname.startsWith(p))) {
          window.location.href = '/login';
        }
      }, msUntilExpiry);

      return () => clearTimeout(timer);
    } catch {
      // Token malformed — bersihkan
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [user?.id]);

  // ── LOGIN ─────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('access_token', data.access_token);
    localStorage.removeItem('orders');
    const u: User = { ...data.user, id: String(data.user.id) };
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  // ── REGISTER ──────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('access_token', data.access_token);
    const u: User = { ...data.user, id: String(data.user.id) };
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
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
    if (!user) return;
    const updated: User = { ...user, ...data };
    updated.profileCompleted = !!(
      updated.phone && updated.school &&
      updated.targetUniversity && updated.targetType && updated.goals
    );
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    api.updateProfile({ ...data, profileCompleted: updated.profileCompleted }).catch(() => {});
  };

  const purchasePackage = (packageType: 'PTN Premium' | 'SKD' | 'STIS') => {
    if (!user) return;
    const updated = { ...user, hasPurchasedPackage: true, packageType };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    await api.changePassword(oldPassword, newPassword);
    return true;
  };

  // ── ADD ORDER ─────────────────────────────────────────────────────
  const addOrder = async (
    order: Omit<Order, 'id' | 'createdAt' | 'status' | 'uniqueCode' | 'totalAmount'>
  ): Promise<Order> => {
    const saved = await api.createOrder({
      packageName:   order.packageName,
      packageType:   order.packageType,
      amount:        order.amount,
      paymentMethod: order.paymentMethod,
    });
    const newOrder = mapOrder({ ...saved, userName: user?.name || '', userEmail: user?.email || '' });
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // ── ACTIVATE ORDER — FIX #1: setelah aktivasi, refresh user ──────
  const activatePackage = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'active' as const } : o));
    try {
      await api.activateOrder(orderId);
      await refreshOrders();
      // FIX #4: refresh user agar hasPurchasedPackage langsung terupdate di semua tempat
      await refreshUser();
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'pending' as const } : o));
      throw e;
    }
  };

  const rejectOrder = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' as const } : o));
    try {
      await api.rejectOrder(orderId);
      await refreshOrders();
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'pending' as const } : o));
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
