import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, LogOut, Target,
  ShieldCheck, FileQuestion, Users, Settings,
  Bell, RefreshCw, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/admin',           label: 'Dashboard',         icon: LayoutDashboard, exact: true },
  { path: '/admin/orders',    label: 'Pesanan',            icon: Package },
  { path: '/admin/questions', label: 'Bank Soal',          icon: FileQuestion },
  { path: '/admin/users',     label: 'Pengguna',           icon: Users },
  { path: '/admin/settings',  label: 'Pengaturan',         icon: Settings },
];

export default function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, orders } = useAuth();

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <Link to="/admin" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center shadow-md shadow-blue-200">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent block leading-tight">
                DINAS ACADEMY
              </span>
              <span className="text-xs text-gray-400 font-medium">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                  active
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white shadow-md shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <div className="flex items-center space-x-3">
                  <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.path === '/admin/orders' && pendingOrders > 0 && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                      {pendingOrders}
                    </span>
                  )}
                  {!active && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" /> Super Admin
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 w-full transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">

        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              {/* Pending badge */}
              {pendingOrders > 0 && location.pathname !== '/admin/orders' && (
                <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Link to="/admin/orders"
                    className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-yellow-100 transition-all">
                    <Package className="w-3.5 h-3.5" />
                    {pendingOrders} pesanan menunggu
                  </Link>
                </motion.div>
              )}
              {actions}
              <button onClick={() => window.location.reload()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link to="/" target="_blank"
                className="text-xs text-gray-400 hover:text-[#2563EB] font-medium px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                Lihat Website →
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}