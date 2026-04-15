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
  changePassword: (oldPassword: string, newPassword: string) => boolean;
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

  // ── LOGIN: pakai backend API ──────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      // Simpan token JWT
      localStorage.setItem('access_token', data.access_token);
      // Simpan data user
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

  // ── REGISTER: pakai backend API ───────────────────────────────
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
    localStorage.removeItem('password');
  };

  // ── UPDATE PROFILE ────────────────────────────────────────────
  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      const isCompleted = !!(
        updatedUser.targetUniversity &&
        updatedUser.targetType &&
        updatedUser.goals
      );
      updatedUser.profileCompleted = isCompleted;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Sinkron ke backend juga
      api.updateProfile(data).catch(() => {});
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

  // ── CHANGE PASSWORD ───────────────────────────────────────────
  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    // Tetap pakai localStorage untuk sementara
    const storedPassword = localStorage.getItem('password');
    if (storedPassword === oldPassword) {
      localStorage.setItem('password', newPassword);
      return true;
    }
    return false;
  };

  // ── ADMIN: Aktivasi pesanan ───────────────────────────────────
  const activatePackage = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'active' as const } : o
    );
    saveOrders(newOrders);

    // Update all_users registry (localStorage)
    const allUsersRaw = localStorage.getItem('all_users');
    const allUsers: User[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    const updatedAllUsers = allUsers.map(u =>
      u.email === order.userEmail
        ? { ...u, hasPurchasedPackage: true, packageType: order.packageType }
        : u
    );
    if (!updatedAllUsers.find(u => u.email === order.userEmail)) {
      updatedAllUsers.push({
        id: order.userId, name: order.userName, email: order.userEmail,
        hasPurchasedPackage: true, packageType: order.packageType, role: 'user',
      });
    }
    localStorage.setItem('all_users', JSON.stringify(updatedAllUsers));

    // Juga sinkron ke backend
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

    // Sinkron ke backend
    api.createOrder({
      packageName: order.packageName,
      packageType: order.packageType,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
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