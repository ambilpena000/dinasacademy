import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, Plus, Trash2, Edit3, BookOpen,
  Save, ChevronDown, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import AdminLayout from './AdminLayout';

// ── Types ──────────────────────────────────────────────────────────
interface Question {
  id: string;
  subject: string;
  tryOutId?: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  tips?: string;
}

const EMPTY_QUESTION: Question = {
  id: '', subject: '', tryOutId: '', questionText: '',
  options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
  correctAnswer: '', explanation: '', tips: '',
};

const DEMO_QUESTIONS: Question[] = [
  {
    id: 'dq-1', subject: 'TWK', tryOutId: 'TO SKD #1',
    questionText: 'Pancasila sebagai dasar negara tercantum dalam...',
    options: [{ id: 'a', text: 'Pembukaan UUD 1945' }, { id: 'b', text: 'Batang tubuh UUD 1945' }, { id: 'c', text: 'Penjelasan UUD 1945' }, { id: 'd', text: 'Tap MPR' }],
    correctAnswer: 'a', explanation: 'Pancasila tercantum dalam Pembukaan UUD 1945 alinea keempat.', tips: 'Hafal struktur UUD 1945',
  },
  {
    id: 'dq-2', subject: 'TIU', tryOutId: 'TO SKD #1',
    questionText: 'Jika semua A adalah B, dan sebagian B adalah C, maka...',
    options: [{ id: 'a', text: 'Semua A adalah C' }, { id: 'b', text: 'Sebagian A mungkin C' }, { id: 'c', text: 'Tidak ada A yang C' }, { id: 'd', text: 'Semua C adalah A' }],
    correctAnswer: 'b', explanation: 'Karena hanya sebagian B yang adalah C, maka tidak semua A pasti C.', tips: 'Gunakan diagram Venn',
  },
  {
    id: 'dq-3', subject: 'Matematika', tryOutId: 'TO SNBT #1',
    questionText: 'Jika f(x) = 2x² + 3x - 5, maka f(2) = ...',
    options: [{ id: 'a', text: '8' }, { id: 'b', text: '9' }, { id: 'c', text: '11' }, { id: 'd', text: '13' }],
    correctAnswer: 'b', explanation: 'f(2) = 2(4) + 3(2) - 5 = 8 + 6 - 5 = 9', tips: 'Substitusi nilai x = 2',
  },
  {
    id: 'dq-4', subject: 'TKP', tryOutId: 'TO SKD #1',
    questionText: 'Saat rekan kerja melakukan kesalahan yang merugikan tim, sikap terbaik Anda adalah...',
    options: [{ id: 'a', text: 'Melaporkan langsung ke atasan' }, { id: 'b', text: 'Mengabaikannya' }, { id: 'c', text: 'Mendiskusikan secara pribadi dan membantu mencari solusi' }, { id: 'd', text: 'Menegur di depan seluruh tim' }],
    correctAnswer: 'c', explanation: 'Sikap profesional adalah mendiskusikan masalah secara konstruktif.', tips: 'Pilih jawaban yang menunjukkan kerjasama dan empati',
  },
  {
    id: 'dq-5', subject: 'Penalaran Umum', tryOutId: 'TO SNBT #1',
    questionText: 'Semua siswa yang rajin belajar mendapat nilai bagus. Budi mendapat nilai bagus. Kesimpulan yang tepat adalah...',
    options: [{ id: 'a', text: 'Budi rajin belajar' }, { id: 'b', text: 'Budi mungkin rajin belajar' }, { id: 'c', text: 'Budi tidak rajin belajar' }, { id: 'd', text: 'Tidak bisa disimpulkan' }],
    correctAnswer: 'd', explanation: 'Premis hanya menyatakan siswa rajin PASTI dapat nilai bagus, bukan sebaliknya.', tips: 'Hati-hati dengan arah implikasi',
  },
];

// ── Delete Confirm Modal ───────────────────────────────────────────
function DeleteModal({ question, onConfirm, onClose }: { question: Question; onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-2">Hapus Soal?</h3>
        <p className="text-sm text-gray-500 text-center mb-5 line-clamp-2">{question.questionText}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">Ya, Hapus</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const raw = localStorage.getItem('question_bank');
    return raw ? JSON.parse(raw) : DEMO_QUESTIONS;
  });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tryOutFilter, setTryOutFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [form, setForm] = useState<Question>(EMPTY_QUESTION);
  const [deleteModal, setDeleteModal] = useState<Question | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const saveQuestions = (qs: Question[]) => {
    setQuestions(qs);
    localStorage.setItem('question_bank', JSON.stringify(qs));
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    if (!form.questionText.trim()) { showToast('Teks soal wajib diisi!', 'error'); return; }
    if (!form.subject.trim()) { showToast('Mata pelajaran wajib diisi!', 'error'); return; }
    if (!form.correctAnswer) { showToast('Tandai jawaban yang benar!', 'error'); return; }
    if (form.options.some(o => !o.text.trim())) { showToast('Semua pilihan jawaban harus diisi!', 'error'); return; }

    if (editingQ) {
      saveQuestions(questions.map(q => q.id === editingQ.id ? { ...form, id: editingQ.id } : q));
      showToast('Soal berhasil diperbarui!');
    } else {
      saveQuestions([{ ...form, id: `q-${Date.now()}` }, ...questions]);
      showToast('Soal berhasil ditambahkan!');
    }
    setShowForm(false);
    setEditingQ(null);
    setForm(EMPTY_QUESTION);
  };

  const handleEdit = (q: Question) => { setEditingQ(q); setForm(q); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDelete = (q: Question) => setDeleteModal(q);
  const confirmDelete = () => {
    if (!deleteModal) return;
    saveQuestions(questions.filter(q => q.id !== deleteModal.id));
    showToast('Soal dihapus.');
    setDeleteModal(null);
  };
  const cancelForm = () => { setShowForm(false); setEditingQ(null); setForm(EMPTY_QUESTION); };

  const subjects  = ['all', ...Array.from(new Set(questions.map(q => q.subject)))];
  const tryOuts   = ['all', ...Array.from(new Set(questions.map(q => q.tryOutId).filter(Boolean)))];

  const filtered = questions.filter(q => {
    const matchSearch  = q.questionText.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = categoryFilter === 'all' || q.subject === categoryFilter;
    const matchTryOut  = tryOutFilter === 'all' || q.tryOutId === tryOutFilter;
    return matchSearch && matchSubject && matchTryOut;
  });

  const subjectColors: Record<string, string> = {
    TWK: 'bg-blue-100 text-blue-700', TIU: 'bg-purple-100 text-purple-700',
    TKP: 'bg-green-100 text-green-700', Matematika: 'bg-orange-100 text-orange-700',
    'Penalaran Umum': 'bg-sky-100 text-sky-700', 'Bahasa Indonesia': 'bg-pink-100 text-pink-700',
    'Bahasa Inggris': 'bg-indigo-100 text-indigo-700',
  };
  const getSubjectColor = (s: string) => subjectColors[s] || 'bg-gray-100 text-gray-600';

  return (
    <AdminLayout title="📝 Bank Soal" subtitle="Tambah, edit, dan kelola soal Try Out"
      actions={
        <button onClick={() => { cancelForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Tambah Soal
        </button>
      }>

      <AnimatePresence>
        {deleteModal && <DeleteModal question={deleteModal} onConfirm={confirmDelete} onClose={() => setDeleteModal(null)} />}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">

        {/* Form Add/Edit */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border-2 border-[#2563EB] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50">
                <h3 className="text-sm font-bold text-[#2563EB]">{editingQ ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}</h3>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-5">

                {/* Row 1: Subject + TryOut */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mata Pelajaran / Subtes *</label>
                    <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="TWK / TIU / TKP / Matematika / dll"
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Try Out (opsional)</label>
                    <input type="text" value={form.tryOutId || ''} onChange={e => setForm({ ...form, tryOutId: e.target.value })}
                      placeholder="Contoh: TO SNBT #1 / TO SKD #2"
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Teks Soal *</label>
                  <textarea rows={3} value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })}
                    placeholder="Tulis teks soal di sini..."
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none resize-none" />
                </div>

                {/* Options */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">
                    Pilihan Jawaban * <span className="text-gray-400 font-normal">(klik huruf untuk tandai jawaban benar)</span>
                  </label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${form.correctAnswer === opt.id ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <button type="button" onClick={() => setForm({ ...form, correctAnswer: opt.id })}
                          className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${form.correctAnswer === opt.id ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-500 hover:border-green-400'}`}>
                          {opt.id.toUpperCase()}
                        </button>
                        <input type="text" value={opt.text} onChange={e => {
                          const newOpts = [...form.options];
                          newOpts[i] = { ...opt, text: e.target.value };
                          setForm({ ...form, options: newOpts });
                        }} placeholder={`Pilihan ${opt.id.toUpperCase()}`}
                          className="flex-1 text-sm bg-transparent outline-none text-gray-900" />
                        {form.correctAnswer === opt.id && (
                          <span className="text-xs text-green-600 font-semibold flex-shrink-0 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Benar
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row: Explanation + Tips */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pembahasan</label>
                    <textarea rows={3} value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })}
                      placeholder="Jelaskan mengapa jawaban tersebut benar..."
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tips (opsional)</label>
                    <textarea rows={3} value={form.tips || ''} onChange={e => setForm({ ...form, tips: e.target.value })}
                      placeholder="Tips singkat untuk mengingat atau mengerjakan soal ini..."
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none resize-none" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button onClick={cancelForm} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                    Batal
                  </button>
                  <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> {editingQ ? 'Simpan Perubahan' : 'Tambah Soal'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Soal',       value: questions.length,                                             color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Mata Pelajaran',   value: new Set(questions.map(q => q.subject)).size,                  color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Try Out Tercakup', value: new Set(questions.map(q => q.tryOutId).filter(Boolean)).size, color: 'text-green-600',  bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-white`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari soal..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
          </div>
          <div className="relative">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700">
              {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'Semua Mapel' : s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={tryOutFilter} onChange={e => setTryOutFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700">
              {tryOuts.map(t => <option key={t} value={t}>{t === 'all' ? 'Semua Try Out' : t}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Tidak ada soal ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  {/* Question row */}
                  <div className="p-5 hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSubjectColor(q.subject)}`}>
                            {q.subject}
                          </span>
                          {q.tryOutId && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              📋 {q.tryOutId}
                            </span>
                          )}
                        </div>
                        {/* Question text */}
                        <p className="text-sm font-medium text-gray-900 mb-2">{q.questionText}</p>
                        {/* Options preview */}
                        <div className="flex gap-2 flex-wrap">
                          {q.options.map(opt => (
                            <span key={opt.id} className={`text-xs px-2.5 py-1 rounded-lg ${q.correctAnswer === opt.id ? 'bg-green-100 text-green-700 font-semibold' : 'bg-gray-100 text-gray-500'}`}>
                              {opt.id.toUpperCase()}. {opt.text.length > 30 ? opt.text.slice(0, 30) + '…' : opt.text}
                            </span>
                          ))}
                        </div>
                        {/* Expand/collapse */}
                        {(q.explanation || q.tips) && (
                          <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                            className="mt-2 text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                            {expandedId === q.id ? '▲ Sembunyikan' : '▼ Lihat pembahasan'}
                          </button>
                        )}
                        {expandedId === q.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2">
                            {q.explanation && (
                              <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xs font-semibold text-blue-700 mb-1">💡 Pembahasan</p>
                                <p className="text-xs text-blue-600">{q.explanation}</p>
                              </div>
                            )}
                            {q.tips && (
                              <div className="bg-yellow-50 rounded-xl p-3">
                                <p className="text-xs font-semibold text-yellow-700 mb-1">⚡ Tips</p>
                                <p className="text-xs text-yellow-600">{q.tips}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleEdit(q)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 text-right">Menampilkan {filtered.length} dari {questions.length} soal</p>
      </div>
    </AdminLayout>
  );
}