import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, X, Save, Gift, CreditCard, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminApi } from '../../lib/api';
import { mapPackage, PackageView, rupiah } from '../../lib/packages';
import { normalizeCategory } from '../../lib/category';

// Jenis paket menentukan kategori try out yang boleh diakses (bila admin tidak memilih try out tertentu)
const TYPES = [
  { value: 'PTN Premium', label: 'SNBT / PTN', track: 'PTN', category: 'SNBT' },
  { value: 'SKD', label: 'SKD Sekdin', track: 'Sekdin', category: 'SKD' },
  { value: 'STIS', label: 'STIS (SKD + Matematika)', track: 'Sekdin', category: 'STIS' },
  { value: 'Combo', label: 'Combo (SNBT + SKD)', track: 'Combo', category: 'ALL' },
];

interface Tryout { id: number; title: string; category: string; isActive?: boolean }

interface Form {
  id?: number;
  name: string;
  description: string;
  type: string;
  isFree: boolean;
  price: string;
  originalPrice: string;
  duration: string;
  features: string;
  tryoutIds: number[];
  isActive: boolean;
}

const EMPTY: Form = {
  name: '', description: '', type: 'PTN Premium', isFree: false, price: '', originalPrice: '',
  duration: '365', features: '', tryoutIds: [], isActive: true,
};

function typeInfo(type: string) {
  return TYPES.find((t) => t.value === type) || { value: type, label: type, track: type, category: 'ALL' };
}

function tryoutMatchesType(t: Tryout, type: string) {
  const cat = typeInfo(type).category;
  const tc = normalizeCategory(t.category);
  if (cat === 'ALL') return true;
  if (cat === 'STIS') return tc === 'SKD' || tc === 'STIS';
  return tc === cat;
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<PackageView[]>([]);
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleting, setDeleting] = useState<PackageView | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getPackagesAdmin(), adminApi.getTryoutsAdmin()])
      .then(([pk, tr]: [any[], any[]]) => {
        setPackages((pk || []).map(mapPackage));
        setTryouts((tr || []).map((t: any) => ({ id: Number(t.id), title: t.title, category: t.category, isActive: t.isActive })));
      })
      .catch((e: any) => showToast(e?.message || 'Gagal memuat paket', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const tryoutTitle = useMemo(() => new Map(tryouts.map((t) => [t.id, t.title])), [tryouts]);

  const openEdit = (p?: PackageView) => {
    if (!p) { setForm({ ...EMPTY }); return; }
    setForm({
      id: p.rawId, name: p.name, description: p.description, type: p.type, isFree: p.isFree,
      price: p.isFree ? '' : String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      duration: String(p.durationDays), features: p.features.join('\n'), tryoutIds: p.tryoutIds, isActive: p.isActive,
    });
  };

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) { showToast('Nama paket wajib diisi', 'error'); return; }
    if (!form.isFree && !(Number(form.price) > 0)) { showToast('Isi harga paket berbayar', 'error'); return; }
    const t = typeInfo(form.type);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      track: t.track,
      isFree: form.isFree,
      price: form.isFree ? 0 : Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      duration: Number(form.duration) || 365,
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      tryoutIds: form.tryoutIds,
      includedTryouts: form.tryoutIds.map((id) => tryoutTitle.get(id) || `Try Out #${id}`),
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (form.id) await adminApi.updatePackage(form.id, payload);
      else await adminApi.createPackage(payload);
      showToast(form.id ? 'Paket diperbarui' : 'Paket ditambahkan');
      setForm(null);
      load();
    } catch (e: any) {
      showToast(e?.message || 'Gagal menyimpan paket', 'error');
    } finally {
      setSaving(false);
    }
  };

  const quickUpdate = async (p: PackageView, data: any, msg: string) => {
    try {
      await adminApi.updatePackage(p.rawId, data);
      showToast(msg);
      load();
    } catch (e: any) {
      showToast(e?.message || 'Gagal memperbarui paket', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.deletePackage(deleting.rawId);
      showToast('Paket dihapus');
      setDeleting(null);
      load();
    } catch (e: any) {
      showToast(e?.message || 'Gagal menghapus paket', 'error');
    }
  };

  const formTryouts = form ? tryouts.filter((t) => tryoutMatchesType(t, form.type)) : [];

  return (
    <AdminLayout title="🎁 Paket" subtitle="Atur paket gratis / berbayar dan try out yang didapat peserta"
      actions={
        <button onClick={() => openEdit()}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Paket
        </button>
      }>

      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' && <CheckCircle className="w-4 h-4" />} {toast.msg}
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <b>Cara kerja:</b> paket <b>Gratis</b> langsung aktif saat peserta menekan "Ambil Gratis" (tanpa pembayaran &amp; tanpa konfirmasi).
        Paket <b>Berbayar</b> masuk ke menu Pesanan dan aktif setelah Anda konfirmasi. Peserta mendapat try out yang dicentang
        pada paket; bila tidak ada yang dicentang, peserta mendapat semua try out sesuai jenis paket. Paket nonaktif tidak tampil ke peserta.
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div>
      ) : packages.length === 0 ? (
        <p className="text-center text-gray-500 py-16">Belum ada paket.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((p) => (
            <div key={p.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${p.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p.isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.isFree ? 'GRATIS' : 'BERBAYAR'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {p.isActive ? 'Tampil ke peserta' : 'Nonaktif'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">{typeInfo(p.type).label}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <p className="text-sm mt-1">
                    {p.originalPrice ? <span className="line-through text-gray-400 mr-2">{rupiah(p.originalPrice)}</span> : null}
                    <span className={`font-black ${p.isFree ? 'text-emerald-600' : 'text-[#2563EB]'}`}>{p.isFree ? 'GRATIS' : rupiah(p.price)}</span>
                    <span className="text-gray-500"> · {p.duration}</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} title="Edit" className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-[#2563EB]"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleting(p)} title="Hapus" className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-700 mb-1">Try out peserta:</p>
                {p.tryoutIds.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {p.tryoutIds.map((id) => (
                      <span key={id} className="px-2 py-0.5 rounded-lg bg-gray-100">{tryoutTitle.get(id) || `#${id} (terhapus)`}</span>
                    ))}
                  </div>
                ) : (
                  <p>{p.tryoutLabel} (otomatis sesuai jenis paket)</p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => quickUpdate(p, { isFree: !p.isFree }, p.isFree ? 'Paket dijadikan berbayar' : 'Paket dijadikan gratis')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-gray-50">
                  {p.isFree ? <><CreditCard className="w-3.5 h-3.5" /> Jadikan Berbayar</> : <><Gift className="w-3.5 h-3.5" /> Jadikan Gratis</>}
                </button>
                <button onClick={() => quickUpdate(p, { isActive: !p.isActive }, p.isActive ? 'Paket disembunyikan' : 'Paket ditampilkan')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-gray-50">
                  {p.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Sembunyikan</> : <><Eye className="w-3.5 h-3.5" /> Tampilkan</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form tambah / edit */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3" onClick={() => setForm(null)}>
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold">{form.id ? 'Edit Paket' : 'Tambah Paket'}</h3>
              <button onClick={() => setForm(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold text-gray-600">Nama paket *</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" placeholder="Paket SNBT 2026" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold text-gray-600">Deskripsi</span>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-600">Jenis paket *</span>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, tryoutIds: [] })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2">
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-600">Masa akses (hari)</span>
                  <input type="number" min={1} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
                </label>
              </div>

              <div className="rounded-xl border border-gray-100 p-3 space-y-3">
                <p className="text-xs font-bold text-gray-600">Harga</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...form, isFree: true })}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 font-bold ${form.isFree ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>
                    <Gift className="w-4 h-4" /> Gratis
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, isFree: false })}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 font-bold ${!form.isFree ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-200 text-gray-500'}`}>
                    <CreditCard className="w-4 h-4" /> Berbayar
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {!form.isFree && (
                    <label className="block">
                      <span className="text-xs font-bold text-gray-600">Harga jual (Rp) *</span>
                      <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" placeholder="49000" />
                    </label>
                  )}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-600">Harga coret / promo (Rp)</span>
                    <input type="number" min={0} value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" placeholder="49000" />
                    <span className="text-[11px] text-gray-500">Tampil dicoret, mis. <s>Rp49.000</s> → GRATIS</span>
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-xs font-bold text-gray-600 mb-1">Try out yang didapat peserta</p>
                <p className="text-[11px] text-gray-500 mb-2">Tidak dicentang sama sekali = semua try out {typeInfo(form.type).label} (termasuk yang ditambahkan nanti).</p>
                {formTryouts.length === 0 ? (
                  <p className="text-xs text-gray-400">Belum ada try out untuk jenis paket ini.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {formTryouts.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                        <input type="checkbox" checked={form.tryoutIds.includes(t.id)}
                          onChange={(e) => setForm({ ...form, tryoutIds: e.target.checked ? [...form.tryoutIds, t.id] : form.tryoutIds.filter((x) => x !== t.id) })} />
                        <span className="truncate">{t.title}</span>
                        {t.isActive === false && <span className="text-[10px] text-gray-400">(nonaktif)</span>}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <label className="block">
                <span className="text-xs font-bold text-gray-600">Fitur (satu per baris)</span>
                <textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span>Tampilkan paket ini ke peserta</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button onClick={() => setForm(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">Batal</button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-bold hover:bg-[#1d4ed8] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleting(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-2">Hapus paket "{deleting.name}"?</h3>
            <p className="text-sm text-gray-500 mb-5">Peserta yang sudah memiliki paket ini tetap bisa mengerjakan try out sesuai jenis paketnya. Untuk menyembunyikan saja, pakai "Sembunyikan".</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleting(null)} className="flex-1 py-2 rounded-xl border text-sm font-semibold">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
