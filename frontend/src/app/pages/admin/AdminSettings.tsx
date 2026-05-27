import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Phone, Globe, Mail, Building2,
  CheckCircle, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { api } from '../../lib/api';

interface SiteSettings {
  siteName: string;
  whatsappNumber: string;
  adminEmail: string;
  address: string;
  maintenanceMode: boolean;
}

const SETTINGS_KEY = 'site_settings';
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Dinas Academy',
  whatsappNumber: '6281234567890',
  adminEmail: 'admin@dinasacademy.id',
  address: 'Indonesia',
  maintenanceMode: false,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  });

  const [adminPassword, setAdminPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    showToast('Pengaturan berhasil disimpan!');
  };

  const handleChangePassword = async () => {
    if (!adminPassword.current || !adminPassword.newPass || !adminPassword.confirm) {
      showToast('Semua field password harus diisi!', 'error'); return;
    }
    if (adminPassword.newPass.length < 8) {
      showToast('Password baru minimal 8 karakter!', 'error'); return;
    }
    if (adminPassword.newPass !== adminPassword.confirm) {
      showToast('Konfirmasi password tidak cocok!', 'error'); return;
    }
    setPasswordLoading(true);
    try {
      await api.changePassword(adminPassword.current, adminPassword.newPass);
      showToast('Password admin berhasil diubah!');
      setAdminPassword({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      showToast(err?.message || 'Password lama tidak sesuai!', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePass = (key: keyof typeof showPass) =>
    setShowPass(prev => ({ ...prev, [key]: !prev[key] }));

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

        {/* ── Site Settings ── */}
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

        {/* ── Change Admin Password (real API) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            🔐 Ganti Password Admin
          </h2>
          <p className="text-xs text-gray-400 mb-5">Password akan langsung diperbarui di server</p>
          <div className="space-y-4">
            {([
              { key: 'current', label: 'Password Lama',              placeholder: 'Masukkan password lama' },
              { key: 'newPass', label: 'Password Baru',              placeholder: 'Minimal 8 karakter' },
              { key: 'confirm', label: 'Konfirmasi Password Baru',   placeholder: 'Ulangi password baru' },
            ] as const).map(field => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPass[field.key] ? 'text' : 'password'}
                    value={adminPassword[field.key]}
                    onChange={e => setAdminPassword({ ...adminPassword, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                  <button type="button" onClick={() => togglePass(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={passwordLoading}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-70 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              {passwordLoading
                ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Menyimpan...</>
                : <><Save className="w-4 h-4" /> Ganti Password</>}
            </button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
          <h2 className="text-sm font-bold text-blue-800 mb-2">ℹ️ Informasi Sistem</h2>
          <div className="space-y-1.5 text-xs text-blue-700">
            <p>• Data soal, pesanan, dan pengguna disimpan di database PostgreSQL via backend NestJS</p>
            <p>• Pengaturan website disimpan di localStorage browser (tidak sync antar perangkat)</p>
            <p>• Untuk reset/manage data server, gunakan pgAdmin atau psql</p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
