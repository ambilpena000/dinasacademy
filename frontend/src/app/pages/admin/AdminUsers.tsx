import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, CheckCircle, XCircle, Users,
  Package, ShieldCheck, User, X, Eye, RefreshCw
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { api } from '../../lib/api';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  hasPurchasedPackage: boolean;
  packageType?: string;
  joinDate?: string;
  profileCompleted?: boolean;
  phone?: string;
  school?: string;
  targetUniversity?: string;
  targetMajor?: string;
  targetType?: string;
}

function DetailModal({ user, onClose }: { user: StoredUser; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="space-y-2.5">
          {[
            ['ID', `#${user.id}`],
            ['Telepon', user.phone || '-'],
            ['Sekolah', user.school || '-'],
            ['Target', user.targetUniversity ? `${user.targetUniversity}${user.targetMajor ? ' – ' + user.targetMajor : ''}` : '-'],
            ['Jalur', user.targetType || '-'],
            ['Bergabung', user.joinDate ? new Date(user.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'],
            ['Paket', user.hasPurchasedPackage ? (user.packageType || 'Aktif') : 'Belum Berlangganan'],
            ['Profil', user.profileCompleted ? 'Lengkap' : 'Belum Lengkap'],
            ['Role', user.role || 'user'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0 gap-3">
              <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
              <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <span className={`flex-1 py-2 rounded-xl text-xs font-semibold text-center ${user.hasPurchasedPackage ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {user.hasPurchasedPackage ? '✅ Paket Aktif' : '⏳ Belum Berlangganan'}
          </span>
          <span className={`flex-1 py-2 rounded-xl text-xs font-semibold text-center ${user.profileCompleted ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {user.profileCompleted ? '✅ Profil Lengkap' : '⚠️ Profil Belum Lengkap'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

type FilterPkg = 'all' | 'active' | 'none';

function mapUser(u: any): StoredUser {
  return {
    id: String(u.id),
    name: u.name || '',
    email: u.email || '',
    role: u.role || 'user',
    hasPurchasedPackage: u.hasPurchasedPackage || false,
    packageType: u.packageType || undefined,
    joinDate: u.joinDate || u.createdAt || undefined,
    profileCompleted: u.profileCompleted || false,
    phone: u.phone || undefined,
    school: u.school || undefined,
    targetUniversity: u.targetUniversity || undefined,
    targetMajor: u.targetMajor || undefined,
    targetType: u.targetType || undefined,
  };
}

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [filterPkg, setFilterPkg] = useState<FilterPkg>('all');
  const [detailUser, setDetailUser] = useState<StoredUser | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = React.useCallback(() => {
    setLoading(true);
    api.getAllUsers()
      .then((data: any[]) => {
        const mapped = data
          .filter((u: any) => u.role !== 'admin')
          .map(mapUser);
        setUsers(mapped);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u => {
    const matchSearch = [u.name, u.email].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchPkg = filterPkg === 'all' || (filterPkg === 'active' ? u.hasPurchasedPackage : !u.hasPurchasedPackage);
    return matchSearch && matchPkg;
  });

  const activeCount = users.filter(u => u.hasPurchasedPackage).length;
  const freeCount = users.filter(u => !u.hasPurchasedPackage).length;
  const completedProfile = users.filter(u => u.profileCompleted).length;

  return (
    <AdminLayout title="👥 Manajemen Pengguna" subtitle="Lihat dan pantau semua pengguna terdaftar"
      actions={
        <button onClick={fetchUsers} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      }>
      <AnimatePresence>
        {detailUser && <DetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
      </AnimatePresence>

      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Pengguna',     value: users.length,      icon: <Users className="w-5 h-5" />,       bg: 'bg-blue-50',   text: 'text-blue-600' },
            { label: 'Berlangganan',       value: activeCount,       icon: <Package className="w-5 h-5" />,     bg: 'bg-green-50',  text: 'text-green-600' },
            { label: 'Belum Berlangganan', value: freeCount,         icon: <User className="w-5 h-5" />,        bg: 'bg-yellow-50', text: 'text-yellow-600' },
            { label: 'Profil Lengkap',     value: completedProfile,  icon: <ShieldCheck className="w-5 h-5" />, bg: 'bg-purple-50', text: 'text-purple-600' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.text} mb-3`}>{s.icon}</div>
                {loading
                  ? <div className="h-8 w-12 bg-gray-100 animate-pulse rounded-lg mb-1" />
                  : <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>}
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {[
              { label: 'Semua', value: 'all' as FilterPkg },
              { label: 'Berlangganan', value: 'active' as FilterPkg },
              { label: 'Belum Berlangganan', value: 'none' as FilterPkg },
            ].map(tab => (
              <button key={tab.value} onClick={() => setFilterPkg(tab.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterPkg === tab.value ? 'bg-[#2563EB] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none w-64" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <svg className="animate-spin w-8 h-8 mx-auto mb-2 text-[#2563EB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-sm">Memuat pengguna...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Belum ada pengguna terdaftar</p>
              <p className="text-xs mt-1">Pengguna akan muncul di sini setelah melakukan registrasi</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm">Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-4">Pengguna</div>
                <div className="col-span-3">Paket</div>
                <div className="col-span-2">Bergabung</div>
                <div className="col-span-2">Profil</div>
                <div className="col-span-1 text-right">Aksi</div>
              </div>
              <div className="divide-y divide-gray-50">
                {filtered.map((u, i) => (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      {u.hasPurchasedPackage ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" /> {u.packageType || 'Aktif'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          Belum Berlangganan
                        </span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">
                        {u.joinDate ? new Date(u.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      {u.profileCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3" /> Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium">
                          <XCircle className="w-3 h-3" /> Belum
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => setDetailUser(u)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
        {!loading && users.length > 0 && (
          <p className="text-xs text-gray-400 text-right">Menampilkan {filtered.length} dari {users.length} pengguna</p>
        )}
      </div>
    </AdminLayout>
  );
}
