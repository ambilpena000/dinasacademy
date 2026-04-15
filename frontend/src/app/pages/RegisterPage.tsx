import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Mail, Lock, User, ArrowLeft, CheckCircle, XCircle, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { useAuth } from '../context/AuthContext';

type PopupType = 'error' | 'success';
interface PopupProps { type: PopupType; title: string; message: string; onClose: () => void; }

function Popup({ type, title, message, onClose }: PopupProps) {
  const isError = type === 'error';
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isError ? 'bg-red-100' : 'bg-green-100'}`}>
            {isError ? <XCircle className="w-6 h-6 text-red-500" /> : <CheckCircle className="w-6 h-6 text-green-500" />}
          </div>
          <h3 className="text-base font-bold text-gray-900 text-center mb-1">{title}</h3>
          <p className="text-sm text-gray-500 text-center">{message}</p>
          <button onClick={onClose}
            className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white ${isError ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
            Oke, Mengerti
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function validateEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePassword(password: string) {
  return { minLength: password.length >= 8, hasUpper: /[A-Z]/.test(password), hasNumber: /[0-9]/.test(password) };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ← loading state
  const [popup, setPopup] = useState<{ type: PopupType; title: string; message: string } | null>(null);

  const passwordRules = validatePassword(password);
  const passwordStrong = Object.values(passwordRules).every(Boolean);

  // ── REGISTER: sekarang async ──────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setPopup({ type: 'error', title: 'Nama tidak valid', message: 'Nama lengkap minimal 2 karakter.' }); return; }
    if (!validateEmail(email)) { setPopup({ type: 'error', title: 'Email tidak valid', message: 'Masukkan format email yang benar.' }); return; }
    if (!passwordStrong) { setPopup({ type: 'error', title: 'Password terlalu lemah', message: 'Password minimal 8 karakter, huruf besar dan angka.' }); return; }
    if (password !== confirmPassword) { setPopup({ type: 'error', title: 'Password tidak cocok', message: 'Pastikan konfirmasi password sama.' }); return; }

    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setPopup({
        type: 'error',
        title: 'Pendaftaran Gagal',
        message: error.message || 'Email mungkin sudah terdaftar. Coba gunakan email lain.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Kembali ke Beranda</span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center mb-2">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-0.5">Buat Akun Baru</h1>
                  <p className="text-sm text-gray-500">Mulai perjalanan belajarmu sekarang</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap kamu"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all outline-none ${email && !validateEmail(email) ? 'border-red-400' : 'border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'}`}
                        required />
                    </div>
                    {email && !validateEmail(email) && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Format email tidak valid</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                        required minLength={8} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-1.5 flex gap-3">
                        {[{ label: '8+ karakter', ok: passwordRules.minLength }, { label: 'Huruf besar', ok: passwordRules.hasUpper }, { label: 'Angka', ok: passwordRules.hasNumber }].map(({ label, ok }) => (
                          <span key={label} className={`text-xs flex items-center gap-0.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                            {ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-all outline-none ${confirmPassword && confirmPassword !== password ? 'border-red-400' : 'border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'}`}
                        required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Password tidak cocok</p>
                    )}
                  </div>

                  {/* Tombol daftar dengan loading state */}
                  <button type="submit" disabled={isLoading}
                    className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                    {isLoading ? (
                      <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Mendaftarkan...</>
                    ) : 'Daftar Sekarang'}
                  </button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">atau</span></div>
                </div>
                <div className="text-center text-sm">
                  <span className="text-gray-500">Sudah punya akun? </span>
                  <Link to="/login" className="text-[#2563EB] font-semibold">Masuk</Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}