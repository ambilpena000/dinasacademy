import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Mail, Lock, ArrowLeft, Eye, EyeOff, XCircle, CheckCircle, AlertCircle, X, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { useAuth } from '../context/AuthContext';

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

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...value]; next[i] = val.slice(-1); onChange(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...value];
    digits.forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs.current[Math.min(digits.length, 5)]?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {value.map((digit, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)} onPaste={handlePaste}
          className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all ${digit ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-200 text-gray-900'} focus:border-[#2563EB] focus:bg-blue-50`}
        />
      ))}
    </div>
  );
}

function validateEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePassword(password: string) {
  return { minLength: password.length >= 8, hasUpper: /[A-Z]/.test(password), hasNumber: /[0-9]/.test(password) };
}

type Step = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-newpass';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ← tambah loading state

  const [step, setStep] = useState<Step>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mockOtp] = useState('123456');
  const [popup, setPopup] = useState<{ type: PopupType; title: string; message: string } | null>(null);

  const newPassRules = validatePassword(newPassword);
  const newPassStrong = Object.values(newPassRules).every(Boolean);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── LOGIN: sekarang async ─────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setPopup({ type: 'error', title: 'Email tidak valid', message: 'Masukkan format email yang benar.' });
      return;
    }
    if (password.length < 8) {
      setPopup({ type: 'error', title: 'Password terlalu pendek', message: 'Password minimal 8 karakter.' });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Redirect berdasarkan role
      if (email === 'admin@dinasacademy.id') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setPopup({
        type: 'error',
        title: 'Login Gagal',
        message: error.message || 'Email atau password salah.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      setPopup({ type: 'error', title: 'Email tidak valid', message: 'Masukkan format email yang benar.' });
      return;
    }
    setCountdown(60);
    setStep('forgot-otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) { setPopup({ type: 'error', title: 'Kode tidak lengkap', message: 'Masukkan 6 digit kode verifikasi.' }); return; }
    if (entered !== mockOtp) { setPopup({ type: 'error', title: 'Kode salah', message: 'Kode verifikasi tidak sesuai.' }); return; }
    setStep('forgot-newpass');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassStrong) { setPopup({ type: 'error', title: 'Password terlalu lemah', message: 'Password minimal 8 karakter, huruf besar dan angka.' }); return; }
    if (newPassword !== confirmNewPassword) { setPopup({ type: 'error', title: 'Password tidak cocok', message: 'Pastikan konfirmasi password sama.' }); return; }
    setPopup({ type: 'success', title: 'Password berhasil diubah!', message: 'Silakan masuk dengan password baru.' });
    setTimeout(() => { setStep('login'); setPopup(null); }, 2000);
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <>
      <AnimatePresence>{popup && <Popup {...popup} onClose={() => setPopup(null)} />}</AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">

          {step === 'login' ? (
            <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3">
              <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Kembali ke Beranda</span>
            </Link>
          ) : (
            <button onClick={() => setStep(step === 'forgot-otp' ? 'forgot-email' : step === 'forgot-newpass' ? 'forgot-otp' : 'login')}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3">
              <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Kembali</span>
            </button>
          )}

          <AnimatePresence mode="wait">
            {step === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col items-center mb-5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center mb-2">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h1 className="text-xl font-bold text-gray-900 mb-0.5">Masuk ke Akun</h1>
                      <p className="text-sm text-gray-500">Lanjutkan perjalanan belajarmu</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
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
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all outline-none"
                            required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <button type="button" onClick={() => setStep('forgot-email')} className="text-xs text-[#2563EB] font-medium">
                          Lupa Password?
                        </button>
                      </div>

                      {/* Tombol login dengan loading state */}
                      <button type="submit" disabled={isLoading}
                        className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        {isLoading ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Memproses...</>
                        ) : 'Masuk'}
                      </button>
                    </form>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                      <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">atau</span></div>
                    </div>
                    <div className="text-center text-sm">
                      <span className="text-gray-500">Belum punya akun? </span>
                      <Link to="/register" className="text-[#2563EB] font-semibold">Daftar Sekarang</Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'forgot-email' && (
              <motion.div key="forgot-email" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card><CardContent className="pt-5 pb-5">
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center mb-2"><KeyRound className="w-6 h-6 text-white" /></div>
                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">Lupa Password?</h1>
                    <p className="text-sm text-gray-500 text-center">Masukkan email untuk menerima kode verifikasi</p>
                  </div>
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="nama@email.com"
                          className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all outline-none ${forgotEmail && !validateEmail(forgotEmail) ? 'border-red-400' : 'border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'}`}
                          required />
                      </div>
                    </div>
                    <Button type="submit" variant="primary" size="md" className="w-full">Kirim Kode Verifikasi</Button>
                  </form>
                  <div className="mt-4 text-center text-sm">
                    <span className="text-gray-500">Ingat password? </span>
                    <button onClick={() => setStep('login')} className="text-[#2563EB] font-semibold">Masuk</button>
                  </div>
                </CardContent></Card>
              </motion.div>
            )}

            {step === 'forgot-otp' && (
              <motion.div key="forgot-otp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card><CardContent className="pt-5 pb-5">
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center mb-2"><ShieldCheck className="w-6 h-6 text-white" /></div>
                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">Kode Verifikasi</h1>
                    <p className="text-sm font-semibold text-[#2563EB]">{forgotEmail}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-4 text-center">
                    <p className="text-xs text-blue-600 font-medium">Mode demo — gunakan kode: <span className="font-bold">123456</span></p>
                  </div>
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <OtpInput value={otp} onChange={setOtp} />
                    <Button type="submit" variant="primary" size="md" className="w-full">Verifikasi Kode</Button>
                  </form>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Tidak menerima kode?</p>
                    <button onClick={handleResendOtp} disabled={countdown > 0}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#2563EB]'}`}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      {countdown > 0 ? `Kirim ulang dalam ${countdown}s` : 'Kirim Ulang Kode'}
                    </button>
                  </div>
                </CardContent></Card>
              </motion.div>
            )}

            {step === 'forgot-newpass' && (
              <motion.div key="forgot-newpass" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card><CardContent className="pt-5 pb-5">
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2"><CheckCircle className="w-6 h-6 text-white" /></div>
                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">Password Baru</h1>
                    <p className="text-sm text-gray-500">Buat password baru yang kuat</p>
                  </div>
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                          required minLength={8} />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Ulangi password baru"
                          className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none ${confirmNewPassword && confirmNewPassword !== newPassword ? 'border-red-400' : 'border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent'}`}
                          required />
                        <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" variant="primary" size="md" className="w-full">Simpan Password Baru</Button>
                  </form>
                </CardContent></Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}