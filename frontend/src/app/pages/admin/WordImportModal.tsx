import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { normalizeCategory } from '../../lib/category';
import { PassageText } from '../../components/QuestionContent';

// Subtes per kategori try out (kode sama dengan yang dipakai halaman ujian)
const SUBTESTS: Record<string, { code: string; name: string; hint?: string }[]> = {
  SNBT: [
    { code: 'PU', name: 'Penalaran Umum' },
    { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum' },
    { code: 'KMBM', name: 'Kemampuan Memahami Bacaan & Menulis', hint: 'file PBM' },
    { code: 'PK', name: 'Pengetahuan Kuantitatif' },
    { code: 'LBI', name: 'Literasi Bahasa Indonesia' },
    { code: 'LBE', name: 'Literasi Bahasa Inggris' },
    { code: 'PM', name: 'Penalaran Matematika' },
  ],
  SKD: [
    { code: 'TWK', name: 'Tes Wawasan Kebangsaan' },
    { code: 'TIU', name: 'Tes Intelegensia Umum' },
    { code: 'TKP', name: 'Tes Karakteristik Pribadi' },
  ],
  STIS: [{ code: 'MTK', name: 'Tes Matematika STIS' }],
};

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

interface Tryout { id: number | string; title: string; category: string }

interface Preview {
  tryout: { id: number; title: string; category: string };
  subtestCode: string;
  existingCount: number;
  resultCount: number;
  questions: { number: number; passage: string; questionText: string; options: string[]; correctAnswer: string; explanation: string }[];
  warnings: string[];
}

const isValid = (q: Preview['questions'][number]) =>
  !!q.questionText && q.options.length >= 4 && !!q.correctAnswer && 'abcde'.indexOf(q.correctAnswer) < q.options.length;

export default function WordImportModal({ tryouts, onClose, onImported }: {
  tryouts: Tryout[];
  onClose: () => void;
  onImported: (msg: string) => void;
}) {
  const [tryoutId, setTryoutId] = useState('');
  const [subtestCode, setSubtestCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState<'preview' | 'save' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openNo, setOpenNo] = useState<number | null>(null);

  const tryout = tryouts.find((t) => String(t.id) === tryoutId);
  const category = normalizeCategory(tryout?.category) || '';
  const subtests = SUBTESTS[category] || [];
  const subtest = subtests.find((s) => s.code === subtestCode);

  const validCount = useMemo(() => preview?.questions.filter(isValid).length ?? 0, [preview]);

  const resetPreview = () => { setPreview(null); setError(null); setForce(false); };

  const doPreview = async () => {
    if (!tryoutId || !subtestCode || !file) return;
    setBusy('preview'); setError(null); setPreview(null);
    try {
      const res: Preview = await adminApi.previewWordImport(file, tryoutId, subtestCode);
      setPreview(res);
      setMode(res.existingCount > 0 ? 'replace' : 'append');
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca file');
    } finally {
      setBusy(null);
    }
  };

  const doSave = async () => {
    if (!preview || !subtest) return;
    setBusy('save'); setError(null);
    try {
      const res = await adminApi.saveWordImport({
        tryoutId: Number(tryoutId), subtestCode, subtestName: subtest.name, mode, force,
        questions: preview.questions,
      });
      const parts = [`${res.imported} soal ${subtest.code} tersimpan ke "${tryout?.title}"`];
      if (res.replaced) parts.push(`${res.replaced} soal lama diganti`);
      if (res.skipped?.length) parts.push(`${res.skipped.length} soal dilewati (belum lengkap)`);
      onImported(parts.join(' · '));
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan soal');
    } finally {
      setBusy(null);
    }
  };

  const needsForce = !!preview && mode === 'replace' && preview.resultCount > 0 && preview.existingCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Upload Soal dari Word</h3>
            <p className="text-xs text-gray-500">Satu file = satu subtes. Pilih try out, pilih subtes, lalu upload .docx</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* Langkah 1–3 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-gray-600">1. Try Out</span>
              <select value={tryoutId} onChange={(e) => { setTryoutId(e.target.value); setSubtestCode(''); resetPreview(); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none">
                <option value="">— Pilih try out —</option>
                {tryouts.map((t) => (
                  <option key={t.id} value={String(t.id)}>{t.title} ({normalizeCategory(t.category) || t.category})</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-gray-600">2. Subtes</span>
              <select value={subtestCode} disabled={!tryout} onChange={(e) => { setSubtestCode(e.target.value); resetPreview(); }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none disabled:bg-gray-50">
                <option value="">{tryout ? '— Pilih subtes —' : 'Pilih try out dulu'}</option>
                {subtests.map((s) => (
                  <option key={s.code} value={s.code}>{s.code} — {s.name}{s.hint ? ` (${s.hint})` : ''}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="mb-1 block text-xs font-bold text-gray-600">3. File Word (.docx)</span>
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition-all ${file ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <FileText className="h-8 w-8 flex-shrink-0 text-[#2563EB]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{file ? file.name : 'Klik untuk memilih file .docx'}</p>
                <p className="text-xs text-gray-500">Format seperti file di folder BANK SOAL: nomor "1." dan opsi "A." diketik manual; kunci di tabel "Kunci Jawaban" atau baris "Jawaban: B".</p>
              </div>
              <input type="file" accept=".docx" className="hidden"
                onChange={(e) => { setFile(e.target.files?.[0] || null); resetPreview(); e.target.value = ''; }} />
            </label>
          </div>

          {!preview && (
            <button onClick={doPreview} disabled={!tryoutId || !subtestCode || !file || busy !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white transition-all hover:bg-[#1d4ed8] disabled:opacity-40">
              {busy === 'preview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {busy === 'preview' ? 'Membaca file...' : 'Baca & Pratinjau Soal'}
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Pratinjau */}
          {preview && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-blue-50 p-3"><p className="text-2xl font-black text-[#2563EB]">{preview.questions.length}</p><p className="text-xs text-gray-600">soal terbaca</p></div>
                <div className="rounded-xl bg-green-50 p-3"><p className="text-2xl font-black text-green-600">{validCount}</p><p className="text-xs text-gray-600">siap disimpan</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-2xl font-black text-gray-700">{preview.existingCount}</p><p className="text-xs text-gray-600">soal {subtestCode} sudah ada</p></div>
              </div>

              {preview.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  <p className="mb-1 flex items-center gap-1.5 font-bold"><AlertTriangle className="h-4 w-4" /> Perlu dicek ({preview.warnings.length})</p>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {preview.warnings.slice(0, 12).map((w, i) => <li key={i}>{w}</li>)}
                    {preview.warnings.length > 12 && <li>… dan {preview.warnings.length - 12} lainnya</li>}
                  </ul>
                </div>
              )}

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {preview.questions.map((q) => {
                  const ok = isValid(q);
                  const open = openNo === q.number;
                  return (
                    <div key={q.number} className="px-3 py-2">
                      <button className="flex w-full items-start gap-3 text-left" onClick={() => setOpenNo(open ? null : q.number)}>
                        <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{q.number}</span>
                        <span className="line-clamp-2 flex-1 text-sm text-gray-800">{q.questionText}</span>
                        <span className={`flex-shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold ${ok ? 'bg-blue-50 text-[#2563EB]' : 'bg-red-50 text-red-600'}`}>
                          {q.correctAnswer ? q.correctAnswer.toUpperCase() : '?'}
                        </span>
                        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </button>
                      {open && (
                        <div className="mt-2 space-y-2 pl-9 text-sm">
                          {q.passage && (
                            <div className="max-h-48 overflow-y-auto rounded-lg border-l-4 border-[#2563EB] bg-slate-50 px-3 py-2 text-xs text-gray-700">
                              <PassageText text={q.passage} />
                            </div>
                          )}
                          <p className="whitespace-pre-line text-gray-900">{q.questionText}</p>
                          <ul className="space-y-0.5">
                            {q.options.map((o, i) => (
                              <li key={i} className={q.correctAnswer === 'abcde'[i] ? 'font-semibold text-green-700' : 'text-gray-700'}>
                                {LETTERS[i]}. {o}
                              </li>
                            ))}
                          </ul>
                          {q.explanation && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800"><b>Pembahasan:</b> {q.explanation}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 rounded-xl border border-gray-100 p-3">
                <p className="text-xs font-bold text-gray-600">4. Cara menyimpan</p>
                <label className="flex items-start gap-2 text-sm">
                  <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} className="mt-1" />
                  <span><b>Ganti</b> semua soal {subtestCode} di try out ini{preview.existingCount ? ` (${preview.existingCount} soal lama dihapus)` : ''}</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="radio" checked={mode === 'append'} onChange={() => setMode('append')} className="mt-1" />
                  <span><b>Tambahkan</b> di belakang soal {subtestCode} yang sudah ada</span>
                </label>
                {needsForce && (
                  <label className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="mt-0.5" />
                    <span>Try out ini sudah dikerjakan {preview.resultCount} kali. Mengganti soal membuat hasil &amp; pembahasan lama tidak cocok. Saya tetap ingin mengganti.</span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {preview && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
            <button onClick={resetPreview} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Pilih file lain</button>
            <button onClick={doSave} disabled={!validCount || busy !== null || (needsForce && !force)}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-40">
              {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {busy === 'save' ? 'Menyimpan...' : `Simpan ${validCount} Soal ${subtestCode}`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
