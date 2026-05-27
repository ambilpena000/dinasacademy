import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Mail, ArrowLeft, AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';
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

function validateEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [popup, setPopup] = useState<{ type: PopupType; title: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setPopup({ type: 'error', title: 'Email tidak valid', message: 'Masukkan format email yang benar.' });
      return;
    }

    setIsLoading(true);
    try {
      await api.forgotPassword(email);
      setIsSent(true);
    } catch (error: any) {
      setPopup({
        type: 'error',
        title: 'Gagal Mengirim',
        message: error.message || 'Terjadi kesalahan saat mengirim link reset.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>{popup && <Popup {...popup} onClose={() => setPopup(null)} />}</AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">

          <Link to="/login" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Kembali ke Login</span>
          </Link>

          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col items-center mb-5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center mb-2">
                        <KeyRound className="w-6 h-6 text-white" />
                      </div>
                      <h1 className="text-xl font-bold text-gray-900 mb-0.5">Lupa Password?</h1>
                      <p className="text-sm text-gray-500 text-center">Masukkan email untuk menerima link reset password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
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

                      <button type="submit" disabled={isLoading}
                        className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        {isLoading ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Mengirim...</>
                        ) : 'Kirim Link Reset'}
                      </button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                      <span className="text-gray-500">Ingat password? </span>
                      <Link to="/login" className="text-[#2563EB] font-semibold">Masuk</Link>
                    </div>
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
                      <h1 className="text-xl font-bold text-gray-900 mb-1">Email Terkirim!</h1>
                      <p className="text-sm text-gray-500 text-center leading-relaxed">
                        Cek email kamu untuk link reset password. Link berlaku selama 1 jam.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs text-blue-600 font-medium text-center">
                        Dikirim ke <span className="font-bold">{email}</span>
                      </p>
                    </div>

                    <Link to="/login"
                      className="block w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all text-center">
                      Kembali ke Login
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
