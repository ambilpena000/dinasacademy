import React, { useMemo, useState } from 'react';
import {
  useUniversities, useMajors, findUniversity, filterUniversities, majorLabel, matchMajor, findMajor, Major,
} from '../lib/ptn';

const inputCls =
  'w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none';

// ── Pilih universitas (combobox dengan pencarian) ──────────────────
export function UniversityPicker({
  value, onChange, zClass = 'z-20',
}: {
  value: string;
  onChange: (name: string) => void;
  zClass?: string;
}) {
  const { universities, loading, error } = useUniversities();
  const [query, setQuery] = useState<string | null>(null); // null = tidak sedang mengetik
  const [open, setOpen] = useState(false);

  const keyword = query ?? '';
  const results = useMemo(() => filterUniversities(universities, keyword), [universities, keyword]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={loading ? 'Memuat daftar PTN...' : value || 'Cari universitas (nama, singkatan, provinsi)...'}
        value={query ?? value}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onBlur={() => setTimeout(() => { setOpen(false); setQuery(null); }, 150)}
        className={inputCls}
      />
      {open && (
        <div className={`absolute ${zClass} w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto`}>
          {error && <p className="px-4 py-3 text-sm text-red-500">{error}</p>}
          {!error && results.slice(0, 60).map(u => (
            <button
              key={u.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange(u.name); setQuery(null); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
            >
              {u.shortName && <span className="font-semibold text-gray-900">{u.shortName}</span>}
              <span className={`text-gray-500 text-xs ${u.shortName ? 'ml-2' : ''}`}>{u.name}</span>
              <span className="block text-[11px] text-gray-400">
                {[u.kategori && u.kategori !== 'Akademik' ? u.kategori : null, u.city || u.province].filter(Boolean).join(' · ')}
              </span>
            </button>
          ))}
          {!error && !loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">Universitas tidak ditemukan</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pilih program studi dari universitas terpilih ──────────────────
const GROUPS: { key: Major['peminatan'] | 'LAINNYA'; label: string }[] = [
  { key: 'SAINTEK', label: 'Saintek' },
  { key: 'SOSHUM', label: 'Soshum' },
  { key: 'LAINNYA', label: 'Lainnya' },
];

export function MajorPicker({
  universityName, value, onChange,
}: {
  universityName: string;
  value: string;
  onChange: (label: string) => void;
}) {
  const { universities } = useUniversities();
  const uni = findUniversity(universities, universityName);
  const { majors, loading } = useMajors(uni?.id);
  const [filter, setFilter] = useState('');

  if (!uni) {
    return (
      <input type="text" placeholder="Pilih universitas terlebih dahulu / ketik program studi"
        value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
    );
  }
  if (loading) {
    return <div className={`${inputCls} text-gray-400 bg-gray-50`}>Memuat program studi...</div>;
  }

  const visible = filter.trim() ? majors.filter(m => matchMajor(m, filter)) : majors;
  const groupOf = (m: Major) => m.peminatan ?? 'LAINNYA';

  return (
    <div className="space-y-2">
      {majors.length > 15 && (
        <input type="text" placeholder={`Saring ${majors.length} program studi...`}
          value={filter} onChange={e => setFilter(e.target.value)}
          className={`${inputCls} py-2 text-xs`} />
      )}
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`${inputCls} bg-white`}>
        <option value="">-- Pilih Program Studi --</option>
        {/* tetap tampilkan pilihan saat ini walau tersaring */}
        {value && !visible.some(m => majorLabel(m) === value) && <option value={value}>{value}</option>}
        {GROUPS.map(g => {
          const items = visible.filter(m => groupOf(m) === g.key);
          return items.length ? (
            <optgroup key={g.key} label={g.label}>
              {items.map(m => (
                <option key={m.id} value={majorLabel(m)}>{majorLabel(m)}</option>
              ))}
            </optgroup>
          ) : null;
        })}
      </select>
      {(() => {
        const sel = findMajor(majors, value);
        if (!sel || (sel.passingGrade == null && !sel.dayaTampung)) return null;
        return (
          <p className="text-[11px] text-gray-500 px-1">
            {sel.passingGrade != null && <>Estimasi passing grade <b className="text-gray-800">~{sel.passingGrade}</b></>}
            {sel.dayaTampung ? <> · daya tampung {sel.dayaTampung.toLocaleString('id-ID')}</> : null}
            {sel.peminat ? <> · peminat {sel.peminatTahun ?? ''} {sel.peminat.toLocaleString('id-ID')}</> : null}
          </p>
        );
      })()}
    </div>
  );
}
