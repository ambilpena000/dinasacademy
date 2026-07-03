import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, Plus, Trash2, Edit3, BookOpen,
  Save, ChevronDown, CheckCircle, AlertCircle, Filter, Upload
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { api, adminApi } from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────
interface Question {
  id: string;
  paket: 'SKD' | 'SNBT' | '';
  subject: string;
  tryOutId: string;
  tryOutNumericId?: string; // actual backend id
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  tips?: string;
}

interface BackendTryout {
  id: number | string;
  title: string;
  category: string; // 'SKD' | 'SNBT' | etc
}

const EMPTY_QUESTION: Question = {
  id: '', paket: '', subject: '', tryOutId: '', tryOutNumericId: '',
  questionText: '',
  options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
  correctAnswer: '', explanation: '', tips: '',
};

// Map category string dari backend ke paket label
function mapCategory(cat: string): 'SKD' | 'SNBT' | '' {
  const c = (cat || '').toUpperCase();
  if (c.includes('SKD') || c.includes('CPNS') || c.includes('SEKDIN') || c.includes('STIS')) return 'SKD';
  if (c.includes('SNBT') || c.includes('PTN') || c.includes('SBMPTN')) return 'SNBT';
  return '';
}

// Subject colors
const SUBJECT_COLORS: Record<string, string> = {
  TWK: 'bg-blue-100 text-blue-700',
  TIU: 'bg-purple-100 text-purple-700',
  TKP: 'bg-green-100 text-green-700',
  Matematika: 'bg-orange-100 text-orange-700',
  'Penalaran Umum': 'bg-sky-100 text-sky-700',
  'Bahasa Indonesia': 'bg-pink-100 text-pink-700',
  'Bahasa Inggris': 'bg-indigo-100 text-indigo-700',
  'Literasi': 'bg-rose-100 text-rose-700',
  'Kuantitatif': 'bg-amber-100 text-amber-700',
};
const getSubjectColor = (s: string) => SUBJECT_COLORS[s] || 'bg-gray-100 text-gray-600';

const PAKET_COLOR: Record<string, string> = {
  SKD: 'bg-blue-600 text-white',
  SNBT: 'bg-green-600 text-white',
};

// ── Delete Confirm Modal ───────────────────────────────────────────
function DeleteModal({ question, onConfirm, onClose, loading }: {
  question: Question; onConfirm: () => void; onClose: () => void; loading?: boolean;
}) {
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
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Batal</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2">
            {loading && <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qLoading, setQLoading] = useState(true);
  const [backendTryouts, setBackendTryouts] = useState<BackendTryout[]>([]);

  // Filter states
  const [search, setSearch] = useState('');
  const [paketFilter, setPaketFilter] = useState<'all' | 'SKD' | 'SNBT'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [tryOutFilter, setTryOutFilter] = useState('all');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [form, setForm] = useState<Question>(EMPTY_QUESTION);
  const [formLoading, setFormLoading] = useState(false);

  // Delete states
  const [deleteModal, setDeleteModal] = useState<Question | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // UI states
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadQuestions(file);
      showToast(`Berhasil mengimpor ${res.imported || 0} soal!`);
      if (res.errors?.length > 0) {
        console.warn('Import warnings:', res.errors);
      }
      fetchQuestions();
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengimpor file', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Fetch data ────────────────────────────────────────────────────
  const fetchQuestions = React.useCallback(() => {
    setQLoading(true);
    api.getAllQuestions()
      .then((data: any[]) => {
        const mapped: Question[] = data.map((q: any) => ({
          id: String(q.id),
          paket: mapCategory(q.tryout?.category || q.category || ''),
          subject: q.subtestName || q.subtestCode || '',
          tryOutId: q.tryout?.title || (q.tryoutId ? String(q.tryoutId) : ''),
          tryOutNumericId: q.tryoutId ? String(q.tryoutId) : '',
          questionText: q.questionText,
          options: [
            { id: 'a', text: q.optionA || '' },
            { id: 'b', text: q.optionB || '' },
            { id: 'c', text: q.optionC || '' },
            { id: 'd', text: q.optionD || '' },
            ...(q.optionE ? [{ id: 'e', text: q.optionE }] : []),
          ],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          tips: q.tips || '',
        }));
        setQuestions(mapped);
      })
      .catch(() => setQuestions([]))
      .finally(() => setQLoading(false));
  }, []);

  React.useEffect(() => {
    fetchQuestions();
    api.getTryouts()
      .then((data: any[]) => {
        setBackendTryouts(data.map((t: any) => ({
          id: t.id,
          title: t.title,
          category: t.category || '',
        })));
      })
      .catch(() => {});
  }, [fetchQuestions]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Tryouts filtered by selected paket in form ────────────────────
  const filteredTryoutsForForm = React.useMemo(() => {
    if (!form.paket) return backendTryouts;
    return backendTryouts.filter(t => mapCategory(t.category) === form.paket);
  }, [backendTryouts, form.paket]);

  // ── Save (create/update) ──────────────────────────────────────────
  const handleSave = async () => {
    if (!form.questionText.trim()) { showToast('Teks soal wajib diisi!', 'error'); return; }
    if (!form.subject.trim()) { showToast('Mata pelajaran wajib diisi!', 'error'); return; }
    if (!form.correctAnswer) { showToast('Tandai jawaban yang benar!', 'error'); return; }
    if (form.options.some(o => !o.text.trim())) { showToast('Semua pilihan jawaban harus diisi!', 'error'); return; }
    if (!form.tryOutNumericId) { showToast('Pilih Try Out terlebih dahulu!', 'error'); return; }

    const payload = {
      tryoutId: Number(form.tryOutNumericId),
      subtestCode: form.subject,
      subtestName: form.subject,
      questionText: form.questionText,
      optionA: form.options[0]?.text || '',
      optionB: form.options[1]?.text || '',
      optionC: form.options[2]?.text || '',
      optionD: form.options[3]?.text || '',
      optionE: form.options[4]?.text || '',
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
      orderIndex: 0,
    };

    setFormLoading(true);
    try {
      if (editingQ) {
        await api.updateQuestion(editingQ.id, payload);
        showToast('Soal berhasil diperbarui!');
      } else {
        await api.createQuestion(payload);
        showToast('Soal berhasil ditambahkan!');
      }
      fetchQuestions();
      cancelForm();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyimpan soal', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (q: Question) => {
    setEditingQ(q);
    setForm(q);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await api.deleteQuestion(deleteModal.id);
      showToast('Soal dihapus.');
      fetchQuestions();
      setDeleteModal(null);
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus soal', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelForm = () => { setShowForm(false); setEditingQ(null); setForm(EMPTY_QUESTION); };

  // ── Filter logic ──────────────────────────────────────────────────
  const subjects = ['all', ...Array.from(new Set(questions.map(q => q.subject).filter(Boolean)))];
  const tryOutsForFilter = ['all', ...Array.from(new Set(
    questions
      .filter(q => paketFilter === 'all' || q.paket === paketFilter)
      .map(q => q.tryOutId)
      .filter(Boolean)
  ))];

  const filtered = questions.filter(q => {
    const matchSearch = q.questionText.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase());
    const matchPaket = paketFilter === 'all' || q.paket === paketFilter;
    const matchSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchTryOut = tryOutFilter === 'all' || q.tryOutId === tryOutFilter;
    return matchSearch && matchPaket && matchSubject && matchTryOut;
  });

  // Stats
  const skdCount = questions.filter(q => q.paket === 'SKD').length;
  const snbtCount = questions.filter(q => q.paket === 'SNBT').length;
  const tryOutCount = new Set(questions.map(q => q.tryOutId).filter(Boolean)).size;

  return (
    <AdminLayout title="📝 Bank Soal" subtitle="Tambah, edit, dan kelola soal Try Out"
      actions={
        <div className="flex items-center gap-2.5">
          <label className={`flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-[#2563EB] hover:bg-blue-50 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? (
              <svg className="animate-spin w-4 h-4 text-[#2563EB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? 'Mengimpor...' : 'Import PDF / JSON'}
            <input type="file" accept=".pdf,.json" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
          <button onClick={() => { cancelForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Tambah Soal
          </button>
        </div>
      }>

      <AnimatePresence>
        {deleteModal && (
          <DeleteModal
            question={deleteModal}
            onConfirm={confirmDelete}
            onClose={() => !deleteLoading && setDeleteModal(null)}
            loading={deleteLoading}
          />
        )}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">

        {/* ── Form Add/Edit ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border-2 border-[#2563EB] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50">
                <h3 className="text-sm font-bold text-[#2563EB]">{editingQ ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}</h3>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-5">

                {/* Row 1: Paket + TryOut */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Paket *</label>
                    <div className="relative">
                      <select value={form.paket} onChange={e => setForm({ ...form, paket: e.target.value as any, tryOutId: '', tryOutNumericId: '' })}
                        className="w-full appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700">
                        <option value="">-- Pilih Paket --</option>
                        <option value="SKD">SKD (CPNS/Sekdin/STIS)</option>
                        <option value="SNBT">SNBT (PTN/Universitas)</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Try Out *</label>
                    <div className="relative">
                      <select value={form.tryOutNumericId || ''}
                        onChange={e => {
                          const selected = backendTryouts.find(t => String(t.id) === e.target.value);
                          setForm({ ...form, tryOutNumericId: e.target.value, tryOutId: selected?.title || e.target.value });
                        }}
                        className="w-full appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700"
                        disabled={!form.paket && filteredTryoutsForForm.length === 0}>
                        <option value="">{form.paket ? `-- Pilih Try Out ${form.paket} --` : '-- Pilih Paket dulu --'}</option>
                        {filteredTryoutsForForm.map(t => (
                          <option key={t.id} value={String(t.id)}>{t.title}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mata Pelajaran / Subtes *</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder={form.paket === 'SKD' ? 'TWK / TIU / TKP' : form.paket === 'SNBT' ? 'Matematika / Penalaran Umum / Bahasa Indonesia / dll' : 'Mata pelajaran...'}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                  {/* Quick pick subject */}
                  {form.paket && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(form.paket === 'SKD' ? ['TWK', 'TIU', 'TKP'] : ['Matematika', 'Penalaran Umum', 'Bahasa Indonesia', 'Bahasa Inggris', 'Literasi', 'Kuantitatif']).map(s => (
                        <button key={s} type="button"
                          onClick={() => setForm({ ...form, subject: s })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${form.subject === s ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
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

                {/* Explanation + Tips */}
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
                  <button onClick={cancelForm} disabled={formLoading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    Batal
                  </button>
                  <button onClick={handleSave} disabled={formLoading} className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {formLoading
                      ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Menyimpan...</>
                      : <><Save className="w-4 h-4" /> {editingQ ? 'Simpan Perubahan' : 'Tambah Soal'}</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Soal',    value: questions.length,  color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Soal SKD',      value: skdCount,          color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Soal SNBT',     value: snbtCount,         color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Try Out',       value: tryOutCount,       color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-white`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" /> Filter Soal
          </div>

          {/* Paket filter - pill tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Semua Paket' },
              { value: 'SKD', label: '🏛️ SKD' },
              { value: 'SNBT', label: '🎓 SNBT' },
            ].map(tab => (
              <button key={tab.value} onClick={() => { setPaketFilter(tab.value as any); setTryOutFilter('all'); setSubjectFilter('all'); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${paketFilter === tab.value ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Second row: mapel + tryout + search */}
          <div className="flex flex-wrap gap-3">
            {/* Mapel filter */}
            <div className="relative">
              <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700 min-w-[150px]">
                {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'Semua Mapel' : s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Try Out filter */}
            <div className="relative">
              <select value={tryOutFilter} onChange={e => setTryOutFilter(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700 min-w-[160px]">
                {tryOutsForFilter.map(t => <option key={t} value={t}>{t === 'all' ? 'Semua Try Out' : t}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cari soal atau mapel..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            </div>
          </div>
        </div>

        {/* ── Questions List ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {qLoading ? (
            <div className="py-16 text-center text-gray-400">
              <svg className="animate-spin w-8 h-8 mx-auto mb-2 text-[#2563EB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-sm">Memuat soal...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Tidak ada soal ditemukan</p>
              {(paketFilter !== 'all' || subjectFilter !== 'all' || tryOutFilter !== 'all' || search) && (
                <button onClick={() => { setPaketFilter('all'); setSubjectFilter('all'); setTryOutFilter('all'); setSearch(''); }}
                  className="mt-2 text-xs text-[#2563EB] hover:underline">Reset filter</button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <div className="p-5 hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {q.paket && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${PAKET_COLOR[q.paket] || 'bg-gray-200 text-gray-700'}`}>
                              {q.paket}
                            </span>
                          )}
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
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
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
                        <button onClick={() => setDeleteModal(q)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
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

        <p className="text-xs text-gray-400 text-right">
          Menampilkan {filtered.length} dari {questions.length} soal
          {paketFilter !== 'all' && ` · Paket: ${paketFilter}`}
          {subjectFilter !== 'all' && ` · Mapel: ${subjectFilter}`}
          {tryOutFilter !== 'all' && ` · TO: ${tryOutFilter}`}
        </p>
      </div>
    </AdminLayout>
  );
}
