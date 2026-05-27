import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { api } from '../lib/api';

type PopupType = 'error' | 'success';
interface PopupProps { type: PopupType; title: string; message: string; onClose: () => void; }

function Popup({ type, title, message, onClose }: PopupProps) {
  const isError = type === 'error';
  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isError ? 'bg-red-100' : 'bg-green-100'}`}>
          {isError ? <XCircle className="w-6 h-6 text-red-500" /> : <CheckCircle className="w-6 h-6 text-green-500" />}
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">{title}</h3>
        <p className="text-sm text-gray-500 text-center">{message}</p>
        <button onClick={onClose}
          className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${isError ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
          Oke, Mengerti
        </button>
      </motion.div>
    </motion.div>
  );
}

function validatePassword(password: string) {
  return { minLength: password.length >= 8, hasUpper: /[A-Z]/.test(password), hasNumber: /[0-9]/.test(password) };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [popup, setPopup] = useState<{ type: PopupType; title: string; message: string } | null>(null);

  const passRules = validatePassword(newPassword);
  const passStrong = Object.values(passRules).every(Boolean);

  // Auto-redirect countdown after success
  useEffect(() => {
    if (!isSuccess) return;
    if (countdown <= 0) {
      navigate('/login');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isSuccess, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passStrong) {
      setPopup({ type: 'error', title: 'Password terlalu lemah', message: 'Password minimal 8 karakter, huruf besar dan angka.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPopup({ type: 'error', title: 'Password tidak cocok', message: 'Pastikan konfirmasi password sama.' });
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token!, newPassword);
      setIsSuccess(true);
    } catch (error: any) {
      setPopup({
        type: 'error',
        title: 'Reset Gagal',
        message: error.message || 'Terjadi kesalahan saat mereset password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // No token state
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                    <AlertCircle className="w-7 h-7 text-red-500" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">Link Tidak Valid</h1>
                  <p className="text-sm text-gray-500 text-center leading-relaxed">
                    Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.
                  </p>
                </div>
                <Link to="/forgot-password"
                  className="block w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all text-center mb-2">
                  Minta Link Baru
                </Link>
                <Link to="/login"
                  className="block w-full py-2.5 text-gray-600 hover:text-gray-900 text-sm font-semibold rounded-xl transition-all text-center">
                  Kembali ke Login
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>{popup && <Popup {...popup} onClose={() => setPopup(null)} />}</AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">

          <Link to="/login" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Kembali ke Login</span>
          </Link>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col items-center mb-5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h1 className="text-xl font-bold text-gray-900 mb-0.5">Reset Password</h1>
                      <p className="text-sm text-gray-500">Buat password baru yang kuat</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                            required minLength={8} />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Password strength badges */}
                      {newPassword && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${passRules.minLength ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {passRules.minLength ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            Min 8 karakter
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${passRules.hasUpper ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {passRules.hasUpper ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            Huruf besar
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${passRules.hasNumber ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {passRules.hasNumber ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            Angka
                          </span>
                        </div>
                      )}

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : 'border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'}`}
                            required />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Password tidak cocok</p>
                        )}
                      </div>

                      <button type="submit" disabled={isLoading}
                        className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        {isLoading ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Memproses...</>
                        ) : 'Simpan Password Baru'}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <CheckCircle className="w-7 h-7 text-green-500" />
                      </div>
                      <h1 className="text-xl font-bold text-gray-900 mb-1">Password Berhasil Direset!</h1>
                      <p className="text-sm text-gray-500 text-center leading-relaxed">
                        Password kamu sudah diperbarui. Kamu akan diarahkan ke halaman login dalam {countdown} detik.
                      </p>
                    </div>

                    <Link to="/login"
                      className="block w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all text-center">
                      Masuk Sekarang
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
