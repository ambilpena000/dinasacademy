import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Package, LogOut, Target,
  CheckCircle, XCircle, Clock, Search, X, Eye,
  MessageCircle, TrendingUp, ShieldCheck, ChevronDown,
  Check, Ban, RefreshCw
} from 'lucide-react';
import { useAuth, Order } from '../context/AuthContext';

// ── Helpers ────────────────────────────────────────────────────────
function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── Status Badge ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: Order['status'] }) {
  const map = {
    pending:  { label: 'Menunggu',  cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    active:   { label: 'Aktif',     cls: 'bg-green-100 text-green-700',   icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { label: 'Ditolak',   cls: 'bg-red-100 text-red-700',       icon: <XCircle className="w-3 h-3" /> },
  };
  const { label, cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {icon}{label}
    </span>
  );
}

// ── Confirm Modal ──────────────────────────────────────────────────
interface ConfirmModalProps {
  type: 'activate' | 'reject';
  order: Order;
  onConfirm: () => void;
  onClose: () => void;
}
function ConfirmModal({ type, order, onConfirm, onClose }: ConfirmModalProps) {
  const isActivate = type === 'activate';
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isActivate ? 'bg-green-100' : 'bg-red-100'}`}>
          {isActivate ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Ban className="w-6 h-6 text-red-500" />}
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">
          {isActivate ? 'Aktifkan Paket?' : 'Tolak Pesanan?'}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-1">
          {isActivate ? 'Paket akan langsung aktif untuk:' : 'Pesanan dari:'}
        </p>
        <p className="text-sm font-semibold text-center text-gray-800 mb-1">{order.userName}</p>
        <p className="text-xs text-center text-[#2563EB] mb-5">{order.packageName} — {formatRupiah(order.amount)}</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
            Batal
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${isActivate ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {isActivate ? 'Ya, Aktifkan' : 'Ya, Tolak'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────
function DetailModal({ order, onClose, onActivate, onReject }: {
  order: Order; onClose: () => void;
  onActivate: () => void; onReject: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold text-gray-900 mb-4">Detail Pesanan</h3>

        <div className="space-y-3 mb-5">
          {[
            ['ID Pesanan', order.id],
            ['Nama', order.userName],
            ['Email', order.userEmail],
            ['Paket', order.packageName],
            ['Jumlah', formatRupiah(order.amount)],
            ['Metode', order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'E-Wallet'],
            ['Tanggal', formatDate(order.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {order.status === 'pending' && (
          <div className="flex gap-3">
            <button onClick={onReject}
              className="flex-1 py-2.5 rounded-xl border-2 border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
              <Ban className="w-4 h-4" /> Tolak
            </button>
            <button onClick={onActivate}
              className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Aktifkan
            </button>
          </div>
        )}

        {/* WhatsApp konfirmasi ke user */}
        <a
          href={`https://wa.me/?text=Halo%20${encodeURIComponent(order.userName)},%20pembayaran%20paket%20*${encodeURIComponent(order.packageName)}*%20kamu%20sudah%20${order.status === 'active' ? 'dikonfirmasi%20✅.%20Selamat%20belajar!' : 'ditolak%20❌.%20Silakan%20hubungi%20kami.'}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
        >
          <MessageCircle className="w-4 h-4" /> Kirim Notif WA ke User
        </a>
      </motion.div>
    </motion.div>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────
type Tab = 'dashboard' | 'orders';
type FilterStatus = 'all' | 'pending' | 'active' | 'rejected';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout, orders, activatePackage, rejectOrder } = useAuth();

  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [confirmModal, setConfirmModal] = useState<{ type: 'activate' | 'reject'; order: Order } | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Guard: only admin can access
  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleLogout = () => { logout(); navigate('/'); };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleActivate = (order: Order) => {
    setConfirmModal({ type: 'activate', order });
    setDetailOrder(null);
  };
  const handleReject = (order: Order) => {
    setConfirmModal({ type: 'reject', order });
    setDetailOrder(null);
  };
  const handleConfirm = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'activate') {
      activatePackage(confirmModal.order.id);
      showToast(`Paket ${confirmModal.order.userName} berhasil diaktifkan!`);
    } else {
      rejectOrder(confirmModal.order.id);
      showToast(`Pesanan ${confirmModal.order.userName} ditolak.`, 'error');
    }
    setConfirmModal(null);
  };

  // Stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeOrders = orders.filter(o => o.status === 'active').length;
  const totalRevenue = orders.filter(o => o.status === 'active').reduce((s, o) => s + o.amount, 0);

  // Filtered orders
  const filtered = orders.filter(o => {
    const matchSearch = o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: 'Total Pesanan', value: totalOrders, icon: <Package className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Menunggu Konfirmasi', value: pendingOrders, icon: <Clock className="w-5 h-5" />, color: 'from-yellow-400 to-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { label: 'Paket Aktif', value: activeOrders, icon: <CheckCircle className="w-5 h-5" />, color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: <TrendingUp className="w-5 h-5" />, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
  ];

  return (
    <>
      {/* Modals */}
      <AnimatePresence>
        {confirmModal && (
          <ConfirmModal
            type={confirmModal.type}
            order={confirmModal.order}
            onConfirm={handleConfirm}
            onClose={() => setConfirmModal(null)}
          />
        )}
        {detailOrder && (
          <DetailModal
            order={detailOrder}
            onClose={() => setDetailOrder(null)}
            onActivate={() => handleActivate(detailOrder)}
            onReject={() => handleReject(detailOrder)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-base font-bold bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent block leading-tight">
                  DINAS ACADEMY
                </span>
                <span className="text-xs text-gray-400 font-medium">Admin Panel</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {[
              { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders' as Tab, label: 'Manajemen Pesanan', icon: Package },
            ].map(item => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-left ${
                    isActive ? 'bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.id === 'orders' && pendingOrders > 0 && (
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                      {pendingOrders}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin info */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white text-sm font-bold">A</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Super Admin</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all">
              <LogOut className="w-4 h-4" />
              <span className="font-medium text-sm">Keluar</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col ml-64 overflow-hidden">

          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {tab === 'dashboard' ? '📊 Dashboard Admin' : '📦 Manajemen Pesanan'}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {tab === 'dashboard' ? 'Ringkasan performa Dinas Academy' : 'Kelola aktivasi paket pengguna'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {pendingOrders > 0 && (
                  <motion.button
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    onClick={() => setTab('orders')}
                    className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs font-semibold px-3 py-2 rounded-xl"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {pendingOrders} pesanan menunggu
                  </motion.button>
                )}
                <button onClick={() => window.location.reload()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">

            {/* ── TAB: DASHBOARD ── */}
            {tab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                {/* Stats grid */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.text} mb-3`}>
                          {stat.icon}
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent pending orders */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">Pesanan Menunggu Konfirmasi</h2>
                    <button onClick={() => setTab('orders')} className="text-xs text-[#2563EB] font-semibold hover:underline">Lihat semua →</button>
                  </div>
                  {orders.filter(o => o.status === 'pending').length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <p className="text-sm font-medium">Semua pesanan sudah dikonfirmasi!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {orders.filter(o => o.status === 'pending').slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                              {order.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{order.userName}</p>
                              <p className="text-xs text-gray-500">{order.packageName} • {formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900">{formatRupiah(order.amount)}</span>
                            <button onClick={() => handleReject(order)}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Tolak">
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleActivate(order)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1">
                              <Check className="w-3 h-3" /> Aktifkan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* All orders summary table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">Riwayat Semua Pesanan</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-bold">
                            {order.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{order.userName}</p>
                            <p className="text-xs text-gray-400">{order.userEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 hidden md:block">{order.packageName}</span>
                          <StatusBadge status={order.status} />
                          <button onClick={() => setDetailOrder(order)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TAB: ORDERS ── */}
            {tab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" placeholder="Cari nama, email, atau ID pesanan..."
                      value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                      className="appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700"
                    >
                      <option value="all">Semua Status</option>
                      <option value="pending">Menunggu</option>
                      <option value="active">Aktif</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Orders table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3">Pengguna</div>
                    <div className="col-span-2">Paket</div>
                    <div className="col-span-2">Jumlah</div>
                    <div className="col-span-1">Metode</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Tidak ada pesanan ditemukan</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {filtered.map((order, i) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="col-span-1">
                            <span className="text-xs font-mono text-gray-400">{order.id}</span>
                          </div>
                          <div className="col-span-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {order.userName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{order.userName}</p>
                              <p className="text-xs text-gray-400 truncate">{order.userEmail}</p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-700 truncate">{order.packageName}</p>
                            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-bold text-gray-900">{formatRupiah(order.amount)}</p>
                          </div>
                          <div className="col-span-1">
                            <span className="text-xs text-gray-500 font-medium">
                              {order.paymentMethod === 'transfer' ? '🏦 Transfer' : '💳 E-Wallet'}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            <button onClick={() => setDetailOrder(order)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="Detail">
                              <Eye className="w-4 h-4" />
                            </button>
                            {order.status === 'pending' && (
                              <>
                                <button onClick={() => handleReject(order)}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Tolak">
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleActivate(order)}
                                  className="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Aktif
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 text-right">Menampilkan {filtered.length} dari {orders.length} pesanan</p>
              </motion.div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}