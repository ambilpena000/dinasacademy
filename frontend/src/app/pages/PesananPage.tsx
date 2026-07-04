import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, ArrowRight, ShoppingBag,
  CreditCard, Smartphone
} from 'lucide-react';
import { api } from '../lib/api';

interface MyOrder {
  id: string;
  packageName: string;
  packageType: string;
  amount: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: 'transfer' | 'ewallet';
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
  activatedAt?: string;
}

function formatRupiah(n: number) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: MyOrder['status'] }) {
  const cfg = {
    pending:  { label: 'Menunggu Konfirmasi', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="w-3.5 h-3.5" /> },
    active:   { label: 'Aktif',               cls: 'bg-green-100 text-green-700 border-green-200',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
    rejected: { label: 'Ditolak',             cls: 'bg-red-100 text-red-700 border-red-200',         icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  const { label, cls, icon } = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {icon} {label}
    </span>
  );
}

function OrderCard({ order }: { order: MyOrder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-gray-100 ${order.status === 'active' ? 'bg-gradient-to-r from-green-50 to-emerald-50' : order.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              order.status === 'active' ? 'bg-green-100' : order.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-200'
            }`}>
              <Package className={`w-5 h-5 ${order.status === 'active' ? 'text-green-600' : order.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{order.packageName}</p>
              <p className="text-xs text-gray-500">#{order.id} · {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Transfer</p>
            <p className="text-xl font-black text-gray-900">{formatRupiah(order.totalAmount)}</p>
            {order.uniqueCode > 0 && (
              <p className="text-xs text-yellow-600 font-medium mt-0.5">
                Harga paket {formatRupiah(order.amount)} + kode unik +{order.uniqueCode}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Metode</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              {order.paymentMethod === 'transfer'
                ? <><CreditCard className="w-4 h-4 text-blue-500" /> Transfer Bank</>
                : <><Smartphone className="w-4 h-4 text-purple-500" /> E-Wallet</>
              }
            </div>
          </div>
        </div>

        {/* Active package info */}
        {order.status === 'active' && (
          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-700">Paket berhasil diaktifkan!</p>
              {order.activatedAt && (
                <p className="text-xs text-green-600 mt-0.5">Diaktifkan pada {formatDate(order.activatedAt)}</p>
              )}
            </div>
          </div>
        )}

        {/* Pending info */}
        {order.status === 'pending' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700 mb-1">⏳ Menunggu konfirmasi admin</p>
            <p className="text-xs text-yellow-600">
              Pastikan kamu sudah melakukan transfer sebesar <strong>{formatRupiah(order.totalAmount)}</strong> ke rekening yang tertera.
              Konfirmasi biasanya dilakukan dalam 1×24 jam.
            </p>
          </div>
        )}

        {/* Rejected info */}
        {order.status === 'rejected' && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-1">❌ Pesanan ditolak</p>
            <p className="text-xs text-red-600">
              Pesanan ini ditolak oleh admin. Hubungi kami via WhatsApp jika ini adalah kesalahan.
            </p>
          </div>
        )}

        {/* Detail toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan detail</> : <><ChevronDown className="w-3.5 h-3.5" /> Lihat detail</>}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 text-xs border-t border-gray-100 pt-3">
              {[
                ['ID Pesanan', `#${order.id}`],
                ['Paket', order.packageName],
                ['Harga Paket', formatRupiah(order.amount)],
                ['Kode Unik', `+${order.uniqueCode}`],
                ['Total Transfer', formatRupiah(order.totalAmount)],
                ['Metode Pembayaran', order.paymentMethod === 'transfer' ? 'Transfer Bank BCA' : 'E-Wallet'],
                ['Tanggal Pesan', formatDate(order.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function PesananPage() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');

  useEffect(() => {
    setLoading(true);
    api.getMyOrders()
      .then((data: any[]) => {
        const mapped: MyOrder[] = (Array.isArray(data) ? data : []).map((o: any) => ({
          id: String(o.id),
          packageName: o.packageName || '',
          packageType: o.packageType || '',
          amount: Number(o.amount),
          uniqueCode: Number(o.uniqueCode),
          totalAmount: Number(o.totalAmount),
          paymentMethod: o.paymentMethod || 'transfer',
          status: o.status || 'pending',
          createdAt: o.createdAt || new Date().toISOString(),
          activatedAt: o.activatedAt || undefined,
        }));
        // Urutkan: terbaru di atas
        mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(mapped);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const activeCount  = orders.filter(o => o.status === 'active').length;

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Pesanan Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Riwayat dan status semua pesanan paketmu</p>
      </div>

      {/* Summary cards */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',    value: orders.length,  bg: 'bg-gray-50',    text: 'text-gray-700' },
            { label: 'Menunggu', value: pendingCount,   bg: 'bg-yellow-50',  text: 'text-yellow-700' },
            { label: 'Aktif',    value: activeCount,    bg: 'bg-green-50',   text: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && orders.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all',      label: 'Semua' },
            { value: 'pending',  label: '⏳ Menunggu' },
            { value: 'active',   label: '✅ Aktif' },
            { value: 'rejected', label: '❌ Ditolak' },
          ].map(tab => (
            <button key={tab.value}
              onClick={() => setFilterStatus(tab.value as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filterStatus === tab.value
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded-lg w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded-lg w-1/2 mb-2" />
              <div className="h-6 bg-gray-100 rounded-lg w-1/4" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Belum ada pesanan</h3>
          <p className="text-sm text-gray-500 mb-6">
            Kamu belum pernah memesan paket. Mulai belajar dengan membeli paket Try Out sekarang!
          </p>
          <Link to="/paket"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-all">
            Lihat Paket <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Tidak ada pesanan dengan status ini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* CTA beli paket baru */}
      {!loading && orders.length > 0 && (
        <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] rounded-2xl p-5 text-white text-center shadow-md shadow-blue-200">
          <p className="font-bold text-sm mb-1">Ingin upgrade atau beli paket baru?</p>
          <p className="text-xs text-blue-100 mb-4">Tersedia paket SKD dan SNBT untuk semua kebutuhan belajarmu</p>
          <Link to="/paket"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#2563EB] text-sm font-bold rounded-xl hover:bg-blue-50 transition-all">
            Lihat Paket <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
