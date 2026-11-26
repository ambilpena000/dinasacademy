import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, Plus, Trash2, Edit3, Save, ChevronDown,
  CheckCircle, AlertCircle, Filter, BookOpen, BarChart3,
  Clock, Hash, ToggleLeft, ToggleRight, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AdminLayout from './AdminLayout';
import { api, adminApi } from '../../lib/api';
import { normalizeCategory } from '../../lib/category';

// ── Types ──────────────────────────────────────────────────────────
interface Tryout {
  id: number | string;
  title: string;
  description: string;
  category: 'SKD' | 'SNBT' | 'STIS';
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  duration: number;
  totalQuestions: number;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  subjects?: string[];
}

interface TryoutForm {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
}

const EMPTY_FORM: TryoutForm = {
  title: '',
  description: '',
  category: '',
  difficulty: '',
  duration: 90,
  totalQuestions: 0,
};

// ── Colors ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  SKD:  'bg-blue-100 text-blue-700',
  SNBT: 'bg-green-100 text-green-700',
  STIS: 'bg-orange-100 text-orange-700',
};
const getCategoryColor = (c: string) => CATEGORY_COLORS[c] || 'bg-gray-100 text-gray-600';

const DIFFICULTY_COLORS: Record<string, string> = {
  Mudah:  'bg-green-100 text-green-700',
  Sedang: 'bg-yellow-100 text-yellow-700',
  Sulit:  'bg-red-100 text-red-700',
};
const getDifficultyColor = (d: string) => DIFFICULTY_COLORS[d] || 'bg-gray-100 text-gray-600';

// ── Fetch question stats helper ────────────────────────────────────
async function fetchQuestionStats(tryoutId: string) {
  const token = localStorage.getItem('access_token');
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${BASE_URL}/exam/${tryoutId}/question-stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Gagal memuat statistik');
  return res.json();
}

async function recalculateTryout(tryoutId: string) {
  const token = localStorage.getItem('access_token');
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${BASE_URL}/exam/${tryoutId}/recalculate`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Gagal menghitung ulang skor');
  return res.json();
}

// ── Spinner ────────────────────────────────────────────────────────
function Spinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────
function DeleteModal({ tryout, onConfirm, onClose, loading }: {
  tryout: Tryout; onConfirm: () => void; onClose: () => void; loading?: boolean;
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
        <h3 className="text-base font-bold text-gray-900 text-center mb-2">Hapus Try Out?</h3>
        <p className="text-sm text-gray-500 text-center mb-1 font-semibold">{tryout.title}</p>
        <p className="text-xs text-gray-400 text-center mb-5">Semua soal dan data terkait akan terhapus. Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Batal</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2">
            {loading && <Spinner className="w-3.5 h-3.5" />}
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Statistics Modal ───────────────────────────────────────────────
function StatsModal({ tryout, onClose }: { tryout: Tryout; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statsData, setStatsData] = useState<any[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [weighted, setWeighted] = useState(false);
  const [recalcState, setRecalcState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  const handleRecalculate = async () => {
    setRecalcState('busy');
    try {
      await recalculateTryout(String(tryout.id));
      setRecalcState('done');
      setReloadKey(k => k + 1);
    } catch {
      setRecalcState('error');
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, questionsRes] = await Promise.all([
          fetchQuestionStats(String(tryout.id)),
          api.getQuestions(String(tryout.id)),
        ]);

        // Format: { participants, weighted, questions: [{questionId, subtest, correct, answered, unanswered, weight}] }
        const stats: any[] = statsRes.questions || [];
        const questions: any[] = questionsRes.data || questionsRes || [];
        const total: number = statsRes.participants || 0;
        setTotalParticipants(total);
        setWeighted(!!statsRes.weighted);

        const rows = stats.map((st: any, idx: number) => {
          const q = questions.find((qq: any) => String(qq.id) === String(st.questionId));
          return {
            no: idx + 1,
            questionId: String(st.questionId),
            subtest: st.subtest as string,
            text: (q?.questionText as string) || `Soal #${idx + 1}`,
            correct: st.correct as number,
            wrong: Math.max(0, (st.answered || 0) - st.correct),
            unanswered: (st.unanswered || 0) as number,
            total,
            pctCorrect: total > 0 ? Math.round((st.correct / total) * 100) : 0,
            weight: st.weight as number | null,
          };
        });

        // Sort by % Benar ascending (hardest first)
        rows.sort((a, b) => a.pctCorrect - b.pctCorrect);
        // Re-number after sort
        rows.forEach((r, i) => r.no = i + 1);

        setStatsData(rows);
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [tryout.id, reloadKey]);

  // Top 10 hardest for chart
  const chartData = useMemo(() =>
    statsData.slice(0, 10).map(r => ({
      name: r.text.length > 25 ? r.text.slice(0, 25) + '…' : r.text,
      pctCorrect: r.pctCorrect,
    })),
    [statsData]
  );

  const BAR_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1'];

  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2563EB]" /> Statistik: {tryout.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Total Peserta (percobaan pertama): <span className="font-semibold text-gray-700">{totalParticipants}</span>
              {weighted && <> · Skor SNBT berbobot: soal yang jarang dijawab benar (termasuk tidak diisi) bernilai lebih tinggi (bobot 1–3)</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRecalculate} disabled={recalcState === 'busy'}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 text-[#2563EB] hover:bg-blue-50 disabled:opacity-50">
              {recalcState === 'busy' ? 'Menghitung...' : recalcState === 'done' ? 'Skor diperbarui' : recalcState === 'error' ? 'Gagal, coba lagi' : 'Hitung Ulang Skor'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Spinner className="w-8 h-8 mx-auto mb-2 text-[#2563EB]" />
              <p className="text-sm">Memuat statistik...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : statsData.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Belum ada data statistik</p>
            </div>
          ) : (
            <>
              {/* Chart: Top 10 hardest */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">📊 Top 10 Soal Tersulit (% Benar Terendah)</h4>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, '% Benar']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                      />
                      <Bar dataKey="pctCorrect" radius={[0, 6, 6, 0]} barSize={18}>
                        {chartData.map((_entry, idx) => (
                          <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">📋 Detail Per Soal</h4>
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="px-4 py-3 text-left font-semibold w-12">No</th>
                        <th className="px-4 py-3 text-left font-semibold">Soal</th>
                        <th className="px-4 py-3 text-center font-semibold w-20">Benar</th>
                        <th className="px-4 py-3 text-center font-semibold w-20">Salah</th>
                        <th className="px-4 py-3 text-center font-semibold w-24">Tidak Dijawab</th>
                        <th className="px-4 py-3 text-center font-semibold w-24">% Benar</th>
                        {weighted && <th className="px-4 py-3 text-center font-semibold w-20">Bobot</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {statsData.map((row) => (
                        <tr key={row.questionId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-gray-500 font-medium">{row.no}</td>
                          <td className="px-4 py-3 text-gray-800 font-medium">
                            <span className="text-[10px] font-bold text-gray-400 mr-1.5">{row.subtest}</span>
                            {row.text.length > 60 ? row.text.slice(0, 60) + '…' : row.text}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-green-600 font-semibold">{row.correct}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-red-500 font-semibold">{row.wrong}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-gray-400 font-semibold">{row.unanswered}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              row.pctCorrect >= 70 ? 'bg-green-100 text-green-700'
                              : row.pctCorrect >= 40 ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}>
                              {row.pctCorrect}%
                            </span>
                          </td>
                          {weighted && (
                            <td className="px-4 py-3 text-center font-semibold text-gray-700">
                              {row.weight != null ? row.weight.toFixed(2) : '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Create/Edit Modal ──────────────────────────────────────────────
function FormModal({ editing, initial, onSave, onClose, loading }: {
  editing: boolean;
  initial: TryoutForm;
  onSave: (data: TryoutForm) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<TryoutForm>(initial);

  useEffect(() => { setForm(initial); }, [initial]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (!form.category) return;
    if (!form.difficulty) return;
    onSave(form);
  };

  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-blue-50">
          <h3 className="text-sm font-bold text-[#2563EB]">{editing ? '✏️ Edit Try Out' : '➕ Tambah Try Out Baru'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Judul Try Out *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Try Out SKD CPNS 2024 Batch 1"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat tentang try out ini..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none resize-none" />
          </div>

          {/* Category + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Kategori *</label>
              <div className="relative">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700">
                  <option value="">-- Pilih Kategori --</option>
                  <option value="SKD">SKD (TWK, TIU, TKP)</option>
                  <option value="SNBT">SNBT (termasuk PTN)</option>
                  <option value="STIS">STIS (tes khusus Matematika — hanya paket STIS)</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Kesulitan *</label>
              <div className="relative">
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700">
                  <option value="">-- Pilih Kesulitan --</option>
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sulit">Sulit</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Duration + Total Questions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Durasi (menit) *</label>
              <input type="number" min={1} value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                placeholder="90"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Total Soal</label>
              <input type="number" min={0} value={form.totalQuestions} onChange={e => setForm({ ...form, totalQuestions: Number(e.target.value) })}
                placeholder="100"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              Batal
            </button>
            <button onClick={handleSubmit} disabled={loading || !form.title.trim() || !form.category || !form.difficulty}
              className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {loading
                ? <><Spinner className="w-4 h-4" /> Menyimpan...</>
                : <><Save className="w-4 h-4" /> {editing ? 'Simpan Perubahan' : 'Tambah Try Out'}</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function AdminTryouts() {
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingTryout, setEditingTryout] = useState<Tryout | null>(null);
  const [formInitial, setFormInitial] = useState<TryoutForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState<Tryout | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [statsModal, setStatsModal] = useState<Tryout | null>(null);

  // Toggle loading per-id
  const [togglingIds, setTogglingIds] = useState<Set<string | number>>(new Set());

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchTryouts = useCallback(() => {
    setLoading(true);
    api.getTryouts()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data.data || [];
        setTryouts(list.map((t: any) => ({
          id: t.id,
          title: t.title || '',
          description: t.description || '',
          category: normalizeCategory(t.category) || 'SKD',
          difficulty: t.difficulty || 'Sedang',
          duration: t.duration || 0,
          totalQuestions: t.totalQuestions || 0,
          isActive: !!t.isActive,
          isLocked: !!t.isLocked,
          createdAt: t.createdAt || '',
          // Backend mengirim subtes sebagai objek { code, name, totalQuestions } — ubah ke label teks
          subjects: (t.subjects || [])
            .map((s: any) => (typeof s === 'string' ? s : s?.code || s?.name || ''))
            .filter(Boolean),
        })));
      })
      .catch(() => setTryouts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTryouts(); }, [fetchTryouts]);

  // ── Filter logic ───────────────────────────────────────────────────
  const filtered = useMemo(() => tryouts.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchStatus = statusFilter === 'all' ||
                        (statusFilter === 'active' && t.isActive) ||
                        (statusFilter === 'inactive' && !t.isActive);
    return matchSearch && matchCategory && matchStatus;
  }), [tryouts, search, categoryFilter, statusFilter]);

  // ── Stats ──────────────────────────────────────────────────────────
  const totalActive = tryouts.filter(t => t.isActive).length;
  const totalInactive = tryouts.filter(t => !t.isActive).length;
  const categoriesCount = new Set(tryouts.map(t => t.category)).size;

  // ── Handlers ───────────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingTryout(null);
    setFormInitial(EMPTY_FORM);
    setShowForm(true);
  };

  const handleEdit = (t: Tryout) => {
    setEditingTryout(t);
    setFormInitial({
      title: t.title,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      duration: t.duration,
      totalQuestions: t.totalQuestions,
    });
    setShowForm(true);
  };

  const handleSave = async (data: TryoutForm) => {
    setFormLoading(true);
    try {
      if (editingTryout) {
        await adminApi.updateTryout(editingTryout.id, data);
        showToast('Try Out berhasil diperbarui!');
      } else {
        await adminApi.createTryout(data);
        showToast('Try Out berhasil ditambahkan!');
      }
      fetchTryouts();
      setShowForm(false);
      setEditingTryout(null);
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyimpan try out', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteTryout(deleteModal.id);
      showToast('Try Out dihapus.');
      fetchTryouts();
      setDeleteModal(null);
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus try out', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (t: Tryout) => {
    setTogglingIds(prev => new Set(prev).add(t.id));
    try {
      await adminApi.toggleTryoutActive(t.id);
      showToast(`Try Out ${t.isActive ? 'dinonaktifkan' : 'diaktifkan'}.`);
      fetchTryouts();
    } catch (err: any) {
      showToast(err?.message || 'Gagal toggle status', 'error');
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(t.id);
        return next;
      });
    }
  };

  return (
    <AdminLayout title="📋 Kelola Try Out" subtitle="Buat, edit, dan kelola paket Try Out"
      actions={
        <button onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Tambah Try Out
        </button>
      }>

      {/* Modals */}
      <AnimatePresence>
        {deleteModal && (
          <DeleteModal
            tryout={deleteModal}
            onConfirm={confirmDelete}
            onClose={() => !deleteLoading && setDeleteModal(null)}
            loading={deleteLoading}
          />
        )}
        {showForm && (
          <FormModal
            editing={!!editingTryout}
            initial={formInitial}
            onSave={handleSave}
            onClose={() => { if (!formLoading) { setShowForm(false); setEditingTryout(null); } }}
            loading={formLoading}
          />
        )}
        {statsModal && (
          <StatsModal tryout={statsModal} onClose={() => setStatsModal(null)} />
        )}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-[60] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Try Out', value: tryouts.length,  color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Aktif',         value: totalActive,      color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Nonaktif',      value: totalInactive,    color: 'text-red-600',    bg: 'bg-red-50' },
            { label: 'Kategori',      value: categoriesCount,  color: 'text-purple-600', bg: 'bg-purple-50' },
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
            <Filter className="w-3.5 h-3.5" /> Filter Try Out
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all',  label: 'Semua' },
              { value: 'SKD',  label: '🏛️ SKD' },
              { value: 'SNBT', label: '🎓 SNBT' },
              { value: 'STIS', label: '📐 STIS' },
            ].map(tab => (
              <button key={tab.value} onClick={() => setCategoryFilter(tab.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${categoryFilter === tab.value ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status + Search */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white font-medium text-gray-700 min-w-[150px]">
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cari try out..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
            </div>
          </div>
        </div>

        {/* ── Tryout List ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Spinner className="w-8 h-8 mx-auto mb-2 text-[#2563EB]" />
              <p className="text-sm">Memuat try out...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Tidak ada try out ditemukan</p>
              {(categoryFilter !== 'all' || statusFilter !== 'all' || search) && (
                <button onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setSearch(''); }}
                  className="mt-2 text-xs text-[#2563EB] hover:underline">Reset filter</button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <div className="p-5 hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-start gap-4">

                      {/* Number */}
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-900">{t.title}</h4>
                          {!t.isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-200 text-gray-500">
                              Nonaktif
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(t.category)}`}>
                            {t.category}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(t.difficulty)}`}>
                            {t.difficulty}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Clock className="w-3 h-3" /> {t.duration} menit
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Hash className="w-3 h-3" /> {t.totalQuestions} soal
                          </span>
                        </div>

                        {/* Description */}
                        {t.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{t.description}</p>
                        )}

                        {/* Subjects tags */}
                        {t.subjects && t.subjects.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {t.subjects.map(sub => (
                              <span key={sub} className="px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600">
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggleActive(t)}
                          disabled={togglingIds.has(t.id)}
                          className={`p-2 rounded-lg transition-all ${t.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={t.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {togglingIds.has(t.id) ? (
                            <Spinner className="w-4 h-4" />
                          ) : t.isActive ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        {/* Stats */}
                        <button onClick={() => setStatsModal(t)}
                          className="p-2 text-purple-400 hover:bg-purple-50 rounded-lg transition-all" title="Statistik">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        {/* Edit */}
                        <button onClick={() => handleEdit(t)}
                          className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button onClick={() => setDeleteModal(t)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
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
          Menampilkan {filtered.length} dari {tryouts.length} try out
          {categoryFilter !== 'all' && ` · Kategori: ${categoryFilter}`}
          {statusFilter !== 'all' && ` · Status: ${statusFilter}`}
        </p>
      </div>
    </AdminLayout>
  );
}
