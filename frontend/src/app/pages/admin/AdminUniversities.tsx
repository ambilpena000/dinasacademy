import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Pencil, Trash2, X, Upload, Download, GraduationCap, School,
  CheckCircle, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { ptnAdminApi } from '../../lib/api';
import { keketatan } from '../../lib/ptn';
import type { University, Major } from '../../lib/ptn';

const inputCls =
  'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white';
const PAGE_SIZE = 50;

type Notice = { type: 'success' | 'error'; text: string } | null;

// ── Modal generik ──────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

// ── Form PTN ───────────────────────────────────────────────────────
function UniversityForm({ initial, onSave, onCancel }: {
  initial?: University; onSave: (data: any) => Promise<void>; onCancel: () => void;
}) {
  const [f, setF] = useState({
    id: initial?.id?.toString() ?? '',
    name: initial?.name ?? '',
    shortName: initial?.shortName ?? '',
    province: initial?.province ?? '',
    kategori: initial?.kategori ?? 'Akademik',
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!f.name.trim() || (!initial && !/^\d+$/.test(f.id))) { setErr('Kode PTN (angka) dan nama wajib diisi'); return; }
    setSaving(true);
    try {
      await onSave({
        ...(initial ? {} : { id: parseInt(f.id, 10) }),
        name: f.name.trim(),
        shortName: f.shortName.trim() || null,
        province: f.province.trim() || null,
        kategori: f.kategori,
        isActive: f.isActive,
      });
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="ID PTN" hint="ID resmi SNPMB, contoh 321 untuk UI. Tidak bisa diubah setelah dibuat.">
        <input className={inputCls} value={f.id} disabled={!!initial} onChange={e => setF({ ...f, id: e.target.value })} />
      </Field>
      <Field label="Nama Universitas">
        <input className={inputCls} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Singkatan"><input className={inputCls} value={f.shortName} onChange={e => setF({ ...f, shortName: e.target.value })} /></Field>
        <Field label="Provinsi"><input className={inputCls} value={f.province} onChange={e => setF({ ...f, province: e.target.value })} /></Field>
      </div>
      <Field label="Kategori">
        <select className={inputCls} value={f.kategori} onChange={e => setF({ ...f, kategori: e.target.value })}>
          <option value="Akademik">Akademik</option>
          <option value="Vokasi">Vokasi (Politeknik)</option>
          <option value="PTKIN">PTKIN (UIN/IAIN)</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={f.isActive} onChange={e => setF({ ...f, isActive: e.target.checked })} />
        Aktif (tampil di pilihan user)
      </label>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Batal</button>
        <button disabled={saving} className="px-4 py-2 text-sm rounded-xl bg-[#2563EB] text-white font-semibold disabled:opacity-60">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

// ── Form Prodi ─────────────────────────────────────────────────────
function MajorForm({ initial, universities, defaultUniversityId, onSave, onCancel }: {
  initial?: Major; universities: University[]; defaultUniversityId?: number;
  onSave: (data: any) => Promise<void>; onCancel: () => void;
}) {
  const [f, setF] = useState({
    id: initial?.id?.toString() ?? '',
    universityId: (initial?.universityId ?? defaultUniversityId ?? '').toString(),
    name: initial?.name ?? '',
    jenjang: initial?.jenjang ?? 'S1',
    peminatan: initial?.peminatan ?? '',
    passingGrade: initial?.passingGrade?.toString() ?? '',
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!f.name.trim()) { setErr('Nama program studi wajib diisi'); return; }
    if (!initial && (!/^\d+$/.test(f.id) || !f.universityId)) { setErr('Kode prodi (angka) dan universitas wajib diisi'); return; }
    const pg = f.passingGrade.trim() === '' ? null : Number(f.passingGrade);
    if (pg !== null && (!Number.isInteger(pg) || pg < 0 || pg > 1000)) { setErr('Passing grade harus bilangan bulat 0–1000'); return; }
    setSaving(true);
    try {
      await onSave({
        ...(initial ? {} : { id: parseInt(f.id, 10), universityId: parseInt(f.universityId, 10) }),
        name: f.name.trim(),
        jenjang: f.jenjang,
        peminatan: f.peminatan || null,
        passingGrade: pg,
        isActive: f.isActive,
      });
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="ID Prodi" hint="ID resmi SNPMB, contoh 321001">
          <input className={inputCls} value={f.id} disabled={!!initial} onChange={e => setF({ ...f, id: e.target.value })} />
        </Field>
        <Field label="Universitas">
          <select className={inputCls} value={f.universityId} disabled={!!initial} onChange={e => setF({ ...f, universityId: e.target.value })}>
            <option value="">-- Pilih --</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.shortName || u.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Nama Program Studi">
        <input className={inputCls} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Jenjang">
          <select className={inputCls} value={f.jenjang} onChange={e => setF({ ...f, jenjang: e.target.value })}>
            {['S1', 'D3', 'D4'].map(j => <option key={j}>{j}</option>)}
          </select>
        </Field>
        <Field label="Peminatan">
          <select className={inputCls} value={f.peminatan} onChange={e => setF({ ...f, peminatan: e.target.value })}>
            <option value="">—</option>
            <option value="SAINTEK">Saintek</option>
            <option value="SOSHUM">Soshum</option>
          </select>
        </Field>
        <Field label="Passing Grade" hint="Diisi = manual (tidak ditimpa sinkronisasi)">
          <input className={inputCls} inputMode="numeric" placeholder="0–1000" value={f.passingGrade}
            onChange={e => setF({ ...f, passingGrade: e.target.value })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={f.isActive} onChange={e => setF({ ...f, isActive: e.target.checked })} />
        Aktif (tampil di pilihan user)
      </label>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Batal</button>
        <button disabled={saving} className="px-4 py-2 text-sm rounded-xl bg-[#2563EB] text-white font-semibold disabled:opacity-60">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

// ── Import CSV passing grade ───────────────────────────────────────
// Format: kode_prodi;passing_grade  (pemisah ; , atau tab — header opsional)
// Kolom lain (mis. hasil export) diabaikan selama kolom "kode_prodi" & "passing_grade" ada.
function parsePassingGradeCsv(text: string) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], errors: ['File kosong'] };
  const sep = [';', '\t', ','].find(s => lines[0].includes(s)) ?? ',';
  const split = (l: string) => l.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
  let idCol = 0, pgCol = 1, start = 0;
  const header = split(lines[0]).map(h => h.toLowerCase());
  if (header.some(h => /[a-z]/.test(h))) {
    idCol = header.findIndex(h => h.includes('kode') && (h.includes('prodi') || h.includes('jurusan')));
    pgCol = header.findIndex(h => h.includes('passing'));
    if (idCol < 0 || pgCol < 0) return { rows: [], errors: ['Header harus memuat kolom "kode_prodi" dan "passing_grade"'] };
    start = 1;
  }
  const rows: { id: number; passingGrade: number | null }[] = [];
  const errors: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const c = split(lines[i]);
    const id = parseInt(c[idCol], 10);
    const raw = (c[pgCol] ?? '').replace(',', '.');
    if (!id) { errors.push(`Baris ${i + 1}: kode prodi tidak valid`); continue; }
    if (raw === '') { continue; } // kosong = tidak diubah
    if (raw === '-') { rows.push({ id, passingGrade: null }); continue; } // "-" = hapus nilai
    const pg = Math.round(Number(raw));
    if (!Number.isFinite(pg) || pg < 0 || pg > 1000) { errors.push(`Baris ${i + 1}: passing grade "${c[pgCol]}" tidak valid`); continue; }
    rows.push({ id, passingGrade: pg });
  }
  return { rows, errors };
}

function ImportModal({ onClose, onDone }: { onClose: () => void; onDone: (msg: string) => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ updated: number; notFound: number[] } | null>(null);
  const [err, setErr] = useState('');
  const parsed = useMemo(() => (text ? parsePassingGradeCsv(text) : null), [text]);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) { setErr('Simpan file Excel sebagai CSV terlebih dahulu (File → Save As → CSV)'); return; }
    setErr(''); setResult(null);
    setText(await file.text());
  };

  const submit = async () => {
    if (!parsed?.rows.length) return;
    setBusy(true); setErr('');
    try {
      const r = await ptnAdminApi.importPassingGrades(parsed.rows);
      setResult(r);
      onDone(`${r.updated} passing grade diperbarui`);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Modal title="Import Passing Grade (CSV)" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 space-y-1">
          <p>Kolom wajib: <b>kode_prodi</b> dan <b>passing_grade</b> (skala 0–1000). Pemisah <code>;</code> atau <code>,</code>.</p>
          <p>Cara termudah: klik <b>Export CSV</b>, isi kolom passing_grade di Excel, simpan sebagai CSV, lalu upload di sini.</p>
          <p>Sel kosong = tidak diubah · isi <code>-</code> untuk menghapus nilai.</p>
        </div>
        <input type="file" accept=".csv,.txt" onChange={e => onFile(e.target.files?.[0])}
          className="block w-full text-xs file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700" />
        <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); }} rows={6}
          placeholder={'kode_prodi;passing_grade\n3211031;715\n3321212;720'}
          className={`${inputCls} font-mono text-xs`} />
        {parsed && (
          <p className="text-xs text-gray-600">
            {parsed.rows.length} baris siap diimport
            {parsed.errors.length > 0 && <span className="text-red-600"> · {parsed.errors.length} baris dilewati</span>}
          </p>
        )}
        {parsed?.errors.length ? (
          <ul className="text-[11px] text-red-600 max-h-20 overflow-y-auto list-disc pl-4">
            {parsed.errors.slice(0, 20).map(e => <li key={e}>{e}</li>)}
          </ul>
        ) : null}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
            {result.updated} prodi diperbarui.
            {result.notFound.length > 0 && <> Kode tidak ditemukan ({result.notFound.length}): {result.notFound.slice(0, 15).join(', ')}{result.notFound.length > 15 ? '…' : ''}</>}
          </div>
        )}
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Tutup</button>
          <button onClick={submit} disabled={busy || !parsed?.rows.length}
            className="px-4 py-2 text-sm rounded-xl bg-[#2563EB] text-white font-semibold disabled:opacity-50">
            {busy ? 'Mengimport...' : 'Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Sel passing grade (edit langsung) ──────────────────────────────
function PassingGradeCell({ major, onSaved }: { major: Major; onSaved: (m: Major) => void }) {
  const [val, setVal] = useState(major.passingGrade?.toString() ?? '');
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  useEffect(() => { setVal(major.passingGrade?.toString() ?? ''); }, [major.passingGrade]);

  const commit = async () => {
    const pg = val.trim() === '' ? null : Number(val);
    if (pg === major.passingGrade) return;
    if (pg !== null && (!Number.isInteger(pg) || pg < 0 || pg > 1000)) { setState('error'); return; }
    setState('saving');
    try {
      const updated = await ptnAdminApi.updateMajor(major.id, { passingGrade: pg });
      onSaved({ ...major, passingGrade: updated.passingGrade, passingGradeSource: updated.passingGradeSource });
      setState('idle');
    } catch { setState('error'); }
  };

  return (
    <input value={val} inputMode="numeric" placeholder="—"
      onChange={e => { setVal(e.target.value); setState('idle'); }}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      title={state === 'error' ? 'Harus bilangan bulat 0–1000' : 'Ketik lalu Enter untuk menyimpan'}
      className={`w-20 px-2 py-1 text-sm text-right rounded-lg border outline-none focus:ring-2 focus:ring-[#2563EB] ${
        state === 'error' ? 'border-red-400 bg-red-50' : state === 'saving' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
      }`} />
  );
}

// ── Halaman ────────────────────────────────────────────────────────
export default function AdminUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [uniLoading, setUniLoading] = useState(true);
  const [uniSearch, setUniSearch] = useState('');
  const [selectedUni, setSelectedUni] = useState<number | null>(null);

  const [majors, setMajors] = useState<Major[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [majorLoading, setMajorLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [peminatan, setPeminatan] = useState('');
  const [missingPg, setMissingPg] = useState(false);

  const [uniModal, setUniModal] = useState<{ open: boolean; item?: University }>({ open: false });
  const [majorModal, setMajorModal] = useState<{ open: boolean; item?: Major }>({ open: false });
  const [importOpen, setImportOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ text: string; action: () => Promise<void> } | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [exporting, setExporting] = useState(false);

  const flash = (n: Notice) => { setNotice(n); setTimeout(() => setNotice(null), 4000); };

  const loadUniversities = useCallback(async () => {
    setUniLoading(true);
    try { setUniversities(await ptnAdminApi.getUniversities()); }
    catch (e: any) { flash({ type: 'error', text: e.message }); }
    finally { setUniLoading(false); }
  }, []);

  const loadMajors = useCallback(async () => {
    setMajorLoading(true);
    try {
      const r = await ptnAdminApi.getMajors({
        universityId: selectedUni ?? undefined, search: debouncedSearch, jenjang, peminatan,
        missingPassingGrade: missingPg || undefined, page, limit: PAGE_SIZE,
      });
      setMajors(r.data); setTotal(r.total);
    } catch (e: any) { flash({ type: 'error', text: e.message }); }
    finally { setMajorLoading(false); }
  }, [selectedUni, debouncedSearch, jenjang, peminatan, missingPg, page]);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);
  useEffect(() => { loadMajors(); }, [loadMajors]);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t); }, [search]);
  useEffect(() => { setPage(1); }, [selectedUni, debouncedSearch, jenjang, peminatan, missingPg]);

  const stats = useMemo(() => {
    const prodi = universities.reduce((a, u) => a + (u.majorCount ?? 0), 0);
    const pg = universities.reduce((a, u) => a + (u.passingGradeCount ?? 0), 0);
    return { ptn: universities.length, prodi, pg, missing: Math.max(0, prodi - pg) };
  }, [universities]);

  const filteredUnis = useMemo(() => {
    const k = uniSearch.trim().toLowerCase();
    return k ? universities.filter(u =>
      u.name.toLowerCase().includes(k) || u.shortName?.toLowerCase().includes(k) || String(u.id).includes(k)) : universities;
  }, [universities, uniSearch]);

  const uniById = useMemo(() => new Map(universities.map(u => [u.id, u])), [universities]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Export seluruh prodi (sesuai filter PTN terpilih) ke CSV — bisa diedit di Excel lalu diimport kembali
  const exportCsv = async () => {
    setExporting(true);
    try {
      const all: Major[] = [];
      for (let p = 1; ; p++) {
        const r = await ptnAdminApi.getMajors({ universityId: selectedUni ?? undefined, page: p, limit: 500 });
        all.push(...r.data);
        if (all.length >= r.total || r.data.length === 0) break;
      }
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const lines = ['kode_ptn;ptn;kode_prodi;program_studi;jenjang;peminatan;daya_tampung;peminat;sumber_pg;passing_grade'];
      all.forEach(m => lines.push([
        m.universityId, m.university?.name, m.id, m.name, m.jenjang, m.peminatan ?? '',
        m.dayaTampung ?? '', m.peminat ?? '', m.passingGradeSource ?? '', m.passingGrade ?? '',
      ].map(esc).join(';')));
      const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const uni = selectedUni ? uniById.get(selectedUni) : null;
      a.download = `passing-grade-${uni ? (uni.shortName || uni.id) : 'semua-ptn'}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) { flash({ type: 'error', text: e.message }); }
    finally { setExporting(false); }
  };

  const saveUniversity = async (data: any) => {
    if (uniModal.item) await ptnAdminApi.updateUniversity(uniModal.item.id, data);
    else await ptnAdminApi.createUniversity(data);
    setUniModal({ open: false });
    flash({ type: 'success', text: 'Data universitas disimpan' });
    loadUniversities();
  };

  const saveMajor = async (data: any) => {
    if (majorModal.item) await ptnAdminApi.updateMajor(majorModal.item.id, data);
    else await ptnAdminApi.createMajor(data);
    setMajorModal({ open: false });
    flash({ type: 'success', text: 'Program studi disimpan' });
    loadMajors(); loadUniversities();
  };

  return (
    <AdminLayout title="PTN & Jurusan" subtitle="Data resmi SNPMB (SNBT) · estimasi passing grade dari keketatan, bisa ditimpa manual"
      actions={
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60">
            <Download className="w-3.5 h-3.5" /> {exporting ? 'Mengekspor...' : 'Export CSV'}
          </button>
          <button onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
            <Upload className="w-3.5 h-3.5" /> Import Passing Grade
          </button>
        </div>
      }>
      <div className="space-y-6">
        {/* Notifikasi */}
        <AnimatePresence>
          {notice && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                notice.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {notice.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistik */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Perguruan Tinggi', value: stats.ptn, bg: 'bg-blue-50', text: 'text-blue-600', icon: <School className="w-5 h-5" /> },
            { label: 'Program Studi', value: stats.prodi, bg: 'bg-purple-50', text: 'text-purple-600', icon: <GraduationCap className="w-5 h-5" /> },
            { label: 'Ada Passing Grade', value: stats.pg, bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle className="w-5 h-5" /> },
            { label: 'Belum Ada Passing Grade', value: stats.missing, bg: 'bg-yellow-50', text: 'text-yellow-600', icon: <AlertCircle className="w-5 h-5" /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.text} mb-3`}>{s.icon}</div>
              {uniLoading
                ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg mb-1" />
                : <p className={`text-2xl font-black ${s.text}`}>{s.value.toLocaleString('id-ID')}</p>}
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Daftar PTN */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Perguruan Tinggi</h2>
                <button onClick={() => setUniModal({ open: true })}
                  className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 px-2 py-1 rounded-lg">
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={uniSearch} onChange={e => setUniSearch(e.target.value)} placeholder="Cari PTN..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
              <button onClick={() => setSelectedUni(null)}
                className={`w-full text-left px-4 py-3 text-sm ${selectedUni === null ? 'bg-blue-50 text-[#2563EB] font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}>
                Semua PTN
              </button>
              {filteredUnis.map(u => (
                <div key={u.id}
                  className={`group flex items-center gap-2 px-4 py-2.5 cursor-pointer ${selectedUni === u.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedUni(u.id)}>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${selectedUni === u.id ? 'text-[#2563EB] font-semibold' : 'text-gray-800 font-medium'}`}>
                      {u.shortName ? `${u.shortName} · ` : ''}{u.name}
                      {!u.isActive && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">nonaktif</span>}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {u.kategori && u.kategori !== 'Akademik' ? `${u.kategori} · ` : ''}ID {u.id} · {u.majorCount ?? 0} prodi
                    </p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Edit" onClick={e => { e.stopPropagation(); setUniModal({ open: true, item: u }); }}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-500"><Pencil className="w-3.5 h-3.5" /></button>
                    <button title="Hapus" onClick={e => {
                      e.stopPropagation();
                      setConfirm({
                        text: `Hapus ${u.name} beserta ${u.majorCount ?? 0} program studinya? Tindakan ini tidak bisa dibatalkan.`,
                        action: async () => {
                          await ptnAdminApi.deleteUniversity(u.id);
                          if (selectedUni === u.id) setSelectedUni(null);
                          flash({ type: 'success', text: `${u.name} dihapus` });
                          loadUniversities(); loadMajors();
                        },
                      });
                    }} className="p-1.5 rounded-lg hover:bg-white text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daftar Prodi */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari prodi atau kode..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2563EB] outline-none" />
              </div>
              <select value={jenjang} onChange={e => setJenjang(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white">
                <option value="">Semua jenjang</option>
                {['S1', 'D3', 'D4'].map(j => <option key={j}>{j}</option>)}
              </select>
              <select value={peminatan} onChange={e => setPeminatan(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white">
                <option value="">Semua peminatan</option>
                <option value="SAINTEK">Saintek</option>
                <option value="SOSHUM">Soshum</option>
                <option value="NONE">Belum dikategorikan</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 px-2">
                <input type="checkbox" checked={missingPg} onChange={e => setMissingPg(e.target.checked)} />
                PG kosong
              </label>
              <button onClick={() => setMajorModal({ open: true })}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] text-white">
                <Plus className="w-3.5 h-3.5" /> Prodi
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Kode</th>
                    <th className="text-left px-4 py-3">Program Studi</th>
                    {selectedUni === null && <th className="text-left px-4 py-3">PTN</th>}
                    <th className="text-left px-4 py-3">Jenjang</th>
                    <th className="text-left px-4 py-3">Peminatan</th>
                    <th className="text-right px-4 py-3" title="Daya tampung SNBT / peminat tahun terakhir">Tampung / Peminat</th>
                    <th className="text-right px-4 py-3">Passing Grade</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {majorLoading ? (
                    <tr><td colSpan={8} className="py-12 text-center text-gray-400">Memuat program studi...</td></tr>
                  ) : majors.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-gray-400">Tidak ada program studi</td></tr>
                  ) : majors.map(m => (
                    <tr key={m.id} className={`hover:bg-gray-50/50 ${!m.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">{m.id}</td>
                      <td className="px-4 py-2.5 text-gray-900 font-medium">{m.name}</td>
                      {selectedUni === null && (
                        <td className="px-4 py-2.5 text-xs text-gray-500">{m.university?.shortName || m.university?.name}</td>
                      )}
                      <td className="px-4 py-2.5 text-xs">{m.jenjang}</td>
                      <td className="px-4 py-2.5 text-xs">
                        {m.peminatan ? (
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${m.peminatan === 'SAINTEK' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {m.peminatan === 'SAINTEK' ? 'Saintek' : 'Soshum'}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-600 whitespace-nowrap">
                        {m.dayaTampung ?? '—'} / {m.peminat?.toLocaleString('id-ID') ?? '—'}
                        {keketatan(m) != null && (
                          <span className="block text-[10px] text-gray-400">
                            {keketatan(m)!.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        {m.passingGradeSource && (
                          <span className={`mr-1.5 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            m.passingGradeSource === 'manual' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                          }`} title={m.passingGradeSource === 'manual' ? 'Diisi admin' : 'Estimasi dari keketatan SNPMB'}>
                            {m.passingGradeSource === 'manual' ? 'manual' : 'est.'}
                          </span>
                        )}
                        <PassingGradeCell major={m} onSaved={u => {
                          setMajors(list => list.map(x => (x.id === u.id ? u : x)));
                          loadUniversities();
                        }} />
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <button title="Edit" onClick={() => setMajorModal({ open: true, item: m })}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Pencil className="w-3.5 h-3.5" /></button>
                        <button title="Hapus" onClick={() => setConfirm({
                          text: `Hapus program studi "${m.name}" (${m.id})?`,
                          action: async () => {
                            await ptnAdminApi.deleteMajor(m.id);
                            flash({ type: 'success', text: 'Program studi dihapus' });
                            loadMajors(); loadUniversities();
                          },
                        })} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              <span>{total.toLocaleString('id-ID')} program studi</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span>Hal {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {uniModal.open && (
        <Modal title={uniModal.item ? 'Edit Perguruan Tinggi' : 'Tambah Perguruan Tinggi'} onClose={() => setUniModal({ open: false })}>
          <UniversityForm initial={uniModal.item} onSave={saveUniversity} onCancel={() => setUniModal({ open: false })} />
        </Modal>
      )}
      {majorModal.open && (
        <Modal title={majorModal.item ? 'Edit Program Studi' : 'Tambah Program Studi'} onClose={() => setMajorModal({ open: false })}>
          <MajorForm initial={majorModal.item} universities={universities} defaultUniversityId={selectedUni ?? undefined}
            onSave={saveMajor} onCancel={() => setMajorModal({ open: false })} />
        </Modal>
      )}
      {importOpen && (
        <ImportModal onClose={() => setImportOpen(false)}
          onDone={msg => { flash({ type: 'success', text: msg }); loadMajors(); loadUniversities(); }} />
      )}
      {confirm && (
        <Modal title="Konfirmasi" onClose={() => setConfirm(null)}>
          <p className="text-sm text-gray-600 mb-5">{confirm.text}</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Batal</button>
            <button onClick={async () => {
              const c = confirm; setConfirm(null);
              try { await c.action(); } catch (e: any) { flash({ type: 'error', text: e.message }); }
            }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white font-semibold">Hapus</button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
