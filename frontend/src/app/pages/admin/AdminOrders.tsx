import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, XCircle, Clock, Search, X, Eye,
  MessageCircle, ChevronDown, Check, Ban
} from 'lucide-react';
import { useAuth, Order } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';

function formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID'); }
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

// ── Confirm Modal ──────────────────────────────────────────────────
function ConfirmModal({ type, order, onConfirm, onClose }: {
  type: 'activate' | 'reject'; order: Order; onConfirm: () => void; onClose: () => void;
}) {
  const isActivate = type === 'activate';
  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isActivate ? 'bg-green-100' : 'bg-red-100'}`}>
          {isActivate ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Ban className="w-6 h-6 text-red-500" />}
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">{isActivate ? 'Aktifkan Paket?' : 'Tolak Pesanan?'}</h3>
        <p className="text-sm text-gray-500 text-center mb-1">{isActivate ? 'Paket akan langsung aktif untuk:' : 'Pesanan dari:'}</p>
        <p className="text-sm font-semibold text-center text-gray-800 mb-1">{order.userName}</p>
        <p className="text-xs text-center text-[#2563EB] mb-5">{order.packageName} — {formatRupiah(order.amount)}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Batal</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${isActivate ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {isActivate ? 'Ya, Aktifkan' : 'Ya, Tolak'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────
function DetailModal({ order, onClose, onActivate, onReject }: {
  order: Order; onClose: () => void; onActivate: () => void; onReject: () => void;
}) {
  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        <h3 className="text-base font-bold text-gray-900 mb-4">Detail Pesanan</h3>
        <div className="space-y-3 mb-5">
          {[
            ['ID Pesanan', order.id],
            ['Nama', order.userName],
            ['Email', order.userEmail],
            ['Paket', order.packageName],
            ['Harga Paket', formatRupiah(order.amount)],
            ['Kode Unik', `+${order.uniqueCode || '-'}`],
            ['Total Transfer ⚡', formatRupiah(order.totalAmount || order.amount)],
            ['Metode', order.paymentMethod === 'transfer' ? '🏦 Transfer Bank BCA 1234567890' : '💳 E-Wallet 0812-3456-7890'],
            ['Tanggal', formatDate(order.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className={`flex justify-between items-center py-2 border-b border-gray-100 last:border-0 ${label === 'Total Transfer ⚡' ? 'bg-yellow-50 rounded-xl px-2 -mx-2' : ''}`}>
              <span className={`text-sm ${label === 'Total Transfer ⚡' ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{label}</span>
              <span className={`text-sm font-semibold ${label === 'Total Transfer ⚡' ? 'text-[#2563EB] text-base font-black' : label === 'Kode Unik' ? 'text-yellow-600' : 'text-gray-900'}`}>{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge status={order.status} />
          </div>
        </div>
        {order.status === 'pending' && (
          <div className="flex gap-3 mb-3">
            <button onClick={onReject} className="flex-1 py-2.5 rounded-xl border-2 border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
              <Ban className="w-4 h-4" /> Tolak
            </button>
            <button onClick={onActivate} className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Aktifkan
            </button>
          </div>
        )}
        <a href={`https://wa.me/?text=Halo%20${encodeURIComponent(order.userName)},%20pembayaran%20paket%20*${encodeURIComponent(order.packageName)}*%20kamu%20sudah%20${order.status === 'active' ? 'dikonfirmasi%20✅.%20Selamat%20belajar!' : 'ditolak%20❌.%20Silakan%20hubungi%20kami.'}`}
          target="_blank" rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
          <MessageCircle className="w-4 h-4" /> Kirim Notif WA ke User
        </a>
      </motion.div>
    </motion.div>
  );
}

type FilterStatus = 'all' | 'pending' | 'active' | 'rejected';

export default function AdminOrders() {
  const { orders, activatePackage, rejectOrder } = useAuth();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [confirmModal, setConfirmModal] = useState<{ type: 'activate' | 'reject'; order: Order } | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleActivate = (order: Order) => { setConfirmModal({ type: 'activate', order }); setDetailOrder(null); };
  const handleReject   = (order: Order) => { setConfirmModal({ type: 'reject', order }); setDetailOrder(null); };

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

  const filtered = orders.filter(o => {
    const matchSearch = [o.userName, o.userEmail, o.id].some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filterTabs: { label: string; value: FilterStatus; count?: number }[] = [
    { label: 'Semua', value: 'all', count: orders.length },
    { label: 'Menunggu', value: 'pending', count: pendingCount },
    { label: 'Aktif', value: 'active', count: orders.filter(o => o.status === 'active').length },
    { label: 'Ditolak', value: 'rejected', count: orders.filter(o => o.status === 'rejected').length },
  ];

  return (
    <AdminLayout title="📦 Manajemen Pesanan" subtitle="Kelola dan konfirmasi aktivasi paket pengguna">
      <AnimatePresence>
        {confirmModal && <ConfirmModal type={confirmModal.type} order={confirmModal.order} onConfirm={handleConfirm} onClose={() => setConfirmModal(null)} />}
        {detailOrder && <DetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onActivate={() => handleActivate(detailOrder)} onReject={() => handleReject(detailOrder)} />}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {/* Info kode unik */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚡</span>
          <div>
            <p className="text-sm font-bold text-yellow-800">Cara Verifikasi Pembayaran</p>
            <p className="text-xs text-yellow-700 mt-0.5">Setiap pesanan memiliki <strong>Kode Unik</strong> (3 digit) yang ditambahkan ke nominal transfer. Buka mutasi rekening, cari nominal <strong>Total Transfer</strong> yang tertera di setiap baris — jika cocok, klik Aktifkan.</p>
            <p className="text-xs text-yellow-600 mt-1">Contoh: Paket Rp 399.000 + kode 291 = Transfer <strong>Rp 399.291</strong></p>
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map(tab => (
            <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filterStatus === tab.value ? 'bg-[#2563EB] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filterStatus === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari nama, email, ID..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none w-64" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Pengguna</div>
            <div className="col-span-2">Paket</div>
            <div className="col-span-2">Nominal Transfer</div>
            <div className="col-span-1 text-yellow-600">Kode Unik</div>
            <div className="col-span-1">Metode</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm">Tidak ada pesanan ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((order, i) => (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-1">
                    <span className="text-xs font-mono text-gray-400">{order.id}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2.5">
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
                    <p className="text-sm font-bold text-gray-900">{formatRupiah(order.totalAmount || order.amount)}</p>
                    <p className="text-xs text-gray-400">Paket: {formatRupiah(order.amount)}</p>
                  </div>
                  <div className="col-span-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-black">
                      +{order.uniqueCode || '-'}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-gray-500">{order.paymentMethod === 'transfer' ? '🏦 Transfer' : '💳 E-Wallet'}</span>
                  </div>
                  <div className="col-span-1">
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => setDetailOrder(order)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="Detail">
                      <Eye className="w-4 h-4" />
                    </button>
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => handleReject(order)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Tolak">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleActivate(order)} className="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1">
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
      </div>
    </AdminLayout>
  );
}