import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Phone, Globe, Mail, Building2,
  CheckCircle, Eye, EyeOff, AlertCircle, Trash2, RefreshCw
} from 'lucide-react';
import AdminLayout from './AdminLayout';

interface SiteSettings {
  siteName: string;
  whatsappNumber: string;
  adminEmail: string;
  address: string;
  maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Dinas Academy',
  whatsappNumber: '6281234567890',
  adminEmail: 'admin@dinasacademy.id',
  address: 'Indonesia',
  maintenanceMode: false,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const raw = localStorage.getItem('site_settings');
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  });

  const [adminPassword, setAdminPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('site_settings', JSON.stringify(settings));
    showToast('Pengaturan berhasil disimpan!');
  };

  const handleChangePassword = () => {
    if (!adminPassword.current || !adminPassword.newPass || !adminPassword.confirm) {
      showToast('Semua field password harus diisi!', 'error'); return;
    }
    if (adminPassword.newPass.length < 8) {
      showToast('Password baru minimal 8 karakter!', 'error'); return;
    }
    if (adminPassword.newPass !== adminPassword.confirm) {
      showToast('Konfirmasi password tidak cocok!', 'error'); return;
    }
    // In real app: call API. For now just validate old password
    if (adminPassword.current !== 'Admin123!') {
      showToast('Password lama tidak sesuai!', 'error'); return;
    }
    showToast('Password admin berhasil diubah!');
    setAdminPassword({ current: '', newPass: '', confirm: '' });
  };

  const handleResetData = (key: string, label: string) => {
    if (window.confirm(`Yakin hapus semua data ${label}? Tindakan ini tidak bisa dibatalkan.`)) {
      localStorage.removeItem(key);
      showToast(`Data ${label} berhasil direset.`);
    }
  };

  return (
    <AdminLayout title="⚙️ Pengaturan" subtitle="Konfigurasi website dan akun admin">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 max-w-2xl">

        {/* Site Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2563EB]" /> Pengaturan Website
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nama Website</label>
              <input type="text" value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Nomor WhatsApp Admin
              </label>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2.5 rounded-xl border border-gray-200 font-mono">+</span>
                <input type="text" value={settings.whatsappNumber} onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="628123456789"
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none font-mono" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Format internasional tanpa tanda +. Contoh: 628123456789</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Admin
              </label>
              <input type="email" value={settings.adminEmail} onChange={e => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Alamat / Lokasi
              </label>
              <input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">Mode Maintenance</p>
                <p className="text-xs text-gray-500 mt-0.5">Nonaktifkan akses pengguna sementara</p>
              </div>
              <button onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative w-12 h-6 rounded-full transition-all ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.maintenanceMode ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            <button onClick={handleSaveSettings}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan Pengaturan
            </button>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
            🔐 Ganti Password Admin
          </h2>
          <div className="space-y-4">
            {[
              { key: 'current', label: 'Password Lama', placeholder: 'Masukkan password lama' },
              { key: 'newPass', label: 'Password Baru', placeholder: 'Minimal 8 karakter' },
              { key: 'confirm', label: 'Konfirmasi Password Baru', placeholder: 'Ulangi password baru' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPass[field.key as keyof typeof showPass] ? 'text' : 'password'}
                    value={adminPassword[field.key as keyof typeof adminPassword]}
                    onChange={e => setAdminPassword({ ...adminPassword, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                  <button type="button" onClick={() => setShowPass({ ...showPass, [field.key]: !showPass[field.key as keyof typeof showPass] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass[field.key as keyof typeof showPass] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleChangePassword}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Ganti Password
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-red-600 mb-1 flex items-center gap-2">
            ⚠️ Manajemen Data
          </h2>
          <p className="text-xs text-gray-500 mb-5">Reset data localStorage untuk keperluan testing. Tindakan ini tidak dapat dibatalkan.</p>
          <div className="space-y-3">
            {[
              { key: 'exam_results',     label: 'Hasil Try Out',   desc: 'Hapus semua riwayat pengerjaan soal' },
              { key: 'completed_tryouts',label: 'Try Out Selesai', desc: 'Reset status pengerjaan Try Out' },
              { key: 'question_bank',    label: 'Bank Soal',       desc: 'Hapus semua soal (akan kembali ke demo)' },
              { key: 'orders',           label: 'Pesanan',         desc: 'Reset semua data pesanan' },
              { key: 'all_users',        label: 'Data Pengguna',   desc: 'Hapus semua akun pengguna terdaftar' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl border border-red-100 bg-red-50/50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button onClick={() => handleResetData(item.key, item.label)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 rounded-lg transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}