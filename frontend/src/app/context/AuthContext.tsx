import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  activatePackage: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'uniqueCode' | 'totalAmount'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-001', userId: 'u1', userName: 'Andi Setiawan',
    userEmail: 'andi@gmail.com', packageType: 'PTN Premium',
    packageName: 'Paket PTN SNBT', amount: 1999000, uniqueCode: 847,
    totalAmount: 1999847, paymentMethod: 'transfer', status: 'pending',
    createdAt: '2026-03-09T08:30:00',
  },
  {
    id: 'ORD-002', userId: 'u2', userName: 'Siti Rahma',
    userEmail: 'siti@gmail.com', packageType: 'SKD',
    packageName: 'Paket SKD Sekdin', amount: 1499000, uniqueCode: 312,
    totalAmount: 1499312, paymentMethod: 'ewallet', status: 'pending',
    createdAt: '2026-03-09T09:15:00',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) { try { return JSON.parse(stored); } catch { return null; } }
    return null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('orders');
    if (stored) { try { return JSON.parse(stored); } catch { return DEMO_ORDERS; } }
    return DEMO_ORDERS;
  });

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('orders', JSON.stringify(newOrders));
  };

  // Fetch orders dari backend saat pertama load (jika sudah login)
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    api.getAllOrders()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const mapped: Order[] = data.map((o: any) => ({
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
          }));
          setOrders(mapped);
          localStorage.setItem('orders', JSON.stringify(mapped));
        }
      })
      .catch(() => {}); // fallback ke localStorage jika backend belum siap
  }, [user]);

  // ── LOGIN ─────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: any) {
      // Fallback ke admin hardcode jika backend belum ada user admin
      if (email === 'admin@dinasacademy.id' && password === 'Admin123!') {
        const adminUser: User = {
          id: 'admin', name: 'Admin Dinas Academy',
          email, hasPurchasedPackage: true, role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return;
      }
      throw new Error(error.message || 'Email atau password salah');
    }
  };

  // ── REGISTER ──────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem('access_token', data.access_token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mendaftar, coba lagi');
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  // ── UPDATE PROFILE ────────────────────────────────────────────
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

      // FIX: kirim profileCompleted ke backend agar tersimpan di DB
      api.updateProfile({ ...data, profileCompleted: isCompleted }).catch(() => {});
    }
  };

  // ── PURCHASE PACKAGE ──────────────────────────────────────────
  const purchasePackage = (packageType: 'PTN Premium' | 'SKD' | 'STIS') => {
    if (user) {
      const updatedUser = { ...user, hasPurchasedPackage: true, packageType };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // ── CHANGE PASSWORD — memanggil backend API ───────────────────
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await api.changePassword(oldPassword, newPassword);
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Gagal mengubah password');
    }
  };

  // ── ADMIN: Aktivasi pesanan ───────────────────────────────────
  const activatePackage = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'active' as const } : o
    );
    saveOrders(newOrders);

    // Simpan ke backend PostgreSQL
    api.activateOrder(orderId).catch(() => {});
  };

  const rejectOrder = (orderId: string) => {
    const newOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'rejected' as const } : o
    );
    saveOrders(newOrders);
    api.rejectOrder(orderId).catch(() => {});
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'uniqueCode' | 'totalAmount'>) => {
    const userId = order.userId || '';
    const digits = userId.replace(/\D/g, '');
    const uniqueCode = digits.length >= 3
      ? parseInt(digits.slice(-3))
      : Math.floor(Math.random() * 900) + 100;

    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      uniqueCode,
      totalAmount: order.amount + uniqueCode,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    saveOrders([newOrder, ...orders]);

    // Simpan ke backend PostgreSQL
    api.createOrder({
      packageName: order.packageName,
      packageType: order.packageType,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
    }).then((saved: any) => {
      if (saved?.id) {
        setOrders(prev => prev.map(o =>
          o.id === newOrder.id ? { ...o, id: String(saved.id) } : o
        ));
      }
    }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, register, purchasePackage,
      updateProfile, changePassword,
      orders, activatePackage, rejectOrder, addOrder,
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