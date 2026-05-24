import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Package, CheckCircle, Clock, TrendingUp,
  XCircle, Eye, Check, Ban, Users, FileQuestion
} from 'lucide-react';
import { useAuth, Order } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
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

export default function AdminDashboard() {
  const { orders, ordersLoading, activatePackage, rejectOrder } = useAuth();
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const handleActivate = async (orderId: string) => {
    setActionLoading(orderId + '_activate');
    try { await activatePackage(orderId); } catch {} finally { setActionLoading(null); }
  };
  const handleReject = async (orderId: string) => {
    setActionLoading(orderId + '_reject');
    try { await rejectOrder(orderId); } catch {} finally { setActionLoading(null); }
  };

  const totalOrders   = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeOrders  = orders.filter(o => o.status === 'active').length;
  const totalRevenue  = orders.filter(o => o.status === 'active').reduce((s, o) => s + o.amount, 0);

  const totalUsers = React.useMemo(() => {
    const raw = localStorage.getItem('all_users');
    return raw ? JSON.parse(raw).filter((u: any) => u.role !== 'admin').length : 0;
  }, []);

  const totalQuestions = React.useMemo(() => {
    const raw = localStorage.getItem('question_bank');
    return raw ? JSON.parse(raw).length : 5;
  }, []);

  const stats = [
    { label: 'Total Pesanan',          value: totalOrders,            icon: <Package className="w-5 h-5" />,     bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    { label: 'Menunggu Konfirmasi',    value: pendingOrders,          icon: <Clock className="w-5 h-5" />,       bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    { label: 'Paket Aktif',            value: activeOrders,           icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
    { label: 'Total Pendapatan',       value: formatRupiah(totalRevenue), icon: <TrendingUp className="w-5 h-5" />, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    { label: 'Pengguna Terdaftar',     value: totalUsers,             icon: <Users className="w-5 h-5" />,       bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-100' },
    { label: 'Total Soal',             value: totalQuestions,         icon: <FileQuestion className="w-5 h-5" />,bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  ];

  const pending = orders.filter(o => o.status === 'pending');

  return (
    <AdminLayout title="📊 Dashboard Admin" subtitle="Ringkasan performa Dinas Academy">
      <div className="space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.text} mb-3`}>
                  {s.icon}
                </div>
                <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pending orders - quick action */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Pesanan Menunggu Konfirmasi</h2>
              {pendingOrders > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingOrders}</span>
              )}
            </div>
            <Link to="/admin/orders" className="text-xs text-[#2563EB] font-semibold hover:underline">
              Lihat semua →
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm font-medium">Semua pesanan sudah dikonfirmasi!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {order.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.userName}</p>
                      <p className="text-xs text-gray-500">{order.packageName} • {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatRupiah(order.totalAmount || order.amount)}</p>
                      <p className="text-xs text-yellow-600 font-bold">kode: +{order.uniqueCode || '-'}</p>
                    </div>
                    <button onClick={() => handleReject(order.id)}
                      disabled={!!actionLoading}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" title="Tolak">
                      <Ban className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleActivate(order.id)}
                      disabled={!!actionLoading}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 disabled:opacity-50">
                      {actionLoading === order.id + '_activate' ? (
                        <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      ) : <Check className="w-3 h-3" />} Aktifkan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent all orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Riwayat Pesanan Terbaru</h2>
            <Link to="/admin/orders" className="text-xs text-[#2563EB] font-semibold hover:underline">Lihat semua →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-bold flex-shrink-0">
                    {order.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.userName}</p>
                    <p className="text-xs text-gray-400">{order.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 hidden md:block">{order.packageName}</span>
                  <span className="text-sm font-bold text-gray-700">{formatRupiah(order.amount)}</span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}