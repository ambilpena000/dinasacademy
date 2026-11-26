// ptn.ts — Data PTN & Program Studi dari backend (/api/universities)
import { useEffect, useState } from 'react';
import { api } from './api';

export interface University {
  id: number;            // Kode PTN SNPMB
  name: string;
  shortName: string | null;
  province: string | null;
  city?: string | null;
  kategori?: 'Akademik' | 'Vokasi' | 'PTKIN' | string;
  isPtnBh?: boolean;
  website?: string | null;
  isActive: boolean;
  majorCount?: number;
  passingGradeCount?: number;
}

export interface Major {
  id: number;            // Kode Prodi SNPMB
  universityId: number;
  name: string;
  jenjang: 'S1' | 'D3' | 'D4' | string;
  peminatan: 'SAINTEK' | 'SOSHUM' | null;
  passingGrade: number | null;
  passingGradeSource?: 'estimasi' | 'manual' | null;
  dayaTampung?: number | null;
  peminat?: number | null;
  peminatTahun?: number | null;
  portofolio?: string | null;
  isActive: boolean;
  university?: University;
}

// Keketatan = daya tampung / peminat (persentase peluang diterima)
export function keketatan(m: Pick<Major, 'dayaTampung' | 'peminat'>): number | null {
  if (!m.dayaTampung || !m.peminat) return null;
  return (m.dayaTampung / m.peminat) * 100;
}

// ── Pencarian prodi dengan sinonim ────────────────────────────────
// Nama resmi SNPMB berbeda antar kampus, mis. UI "Pendidikan Dokter" vs UGM "Kedokteran".
const MAJOR_SYNONYMS: [RegExp, string][] = [
  [/kedokteran/g, 'dokter'],          // "kedokteran gigi" → "dokter gigi" (cocok dgn "Pendidikan Dokter Gigi")
  [/ilmu komputer/g, 'informatika'],
  [/teknik informatika/g, 'informatika'],
  [/\bti\b/g, 'informatika'],
  [/\bdkv\b/g, 'desain komunikasi visual'],
  [/\bhi\b/g, 'hubungan internasional'],
];

function canonical(s: string): string {
  let t = s.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const [re, rep] of MAJOR_SYNONYMS) t = t.replace(re, rep);
  return t;
}

// true jika kata kunci cocok dengan label prodi (memperhitungkan sinonim)
export function matchMajor(m: Pick<Major, 'name' | 'jenjang'>, keyword: string): boolean {
  const k = keyword.trim().toLowerCase();
  if (!k) return true;
  const label = majorLabel(m).toLowerCase();
  return label.includes(k) || canonical(label).includes(canonical(k));
}

// Label prodi yang disimpan sebagai targetMajor user.
// Jenjang ditambahkan untuk non-S1 agar "Akuntansi" (S1) ≠ "Akuntansi (D3)".
export function majorLabel(m: Pick<Major, 'name' | 'jenjang'>): string {
  return m.jenjang && m.jenjang !== 'S1' ? `${m.name} (${m.jenjang})` : m.name;
}

export function universityLabel(u: Pick<University, 'name' | 'shortName'>): string {
  return u.shortName ? `${u.shortName} — ${u.name}` : u.name;
}

const norm = (s: string) => s.trim().toLowerCase();

export function findUniversity(list: University[], nameOrShort?: string | null): University | undefined {
  if (!nameOrShort) return undefined;
  const k = norm(nameOrShort);
  return list.find(u => norm(u.name) === k || (u.shortName && norm(u.shortName) === k));
}

export function findMajor(list: Major[], label?: string | null): Major | undefined {
  if (!label) return undefined;
  const k = norm(label);
  return list.find(m => norm(majorLabel(m)) === k) ?? list.find(m => norm(m.name) === k);
}

export function filterUniversities(list: University[], keyword: string): University[] {
  const k = norm(keyword);
  if (!k) return list;
  return list.filter(u =>
    norm(u.name).includes(k) ||
    (u.shortName && norm(u.shortName).includes(k)) ||
    (u.province && norm(u.province).includes(k)),
  );
}

// ── Cache sederhana per sesi halaman ──────────────────────────────
let uniCache: Promise<University[]> | null = null;
const majorCache = new Map<number, Promise<Major[]>>();

export function loadUniversities(): Promise<University[]> {
  if (!uniCache) {
    uniCache = api.getUniversities().catch((e: unknown) => { uniCache = null; throw e; });
  }
  return uniCache;
}

export function loadMajors(universityId: number): Promise<Major[]> {
  let p = majorCache.get(universityId);
  if (!p) {
    p = api.getUniversityMajors(universityId).catch((e: unknown) => {
      majorCache.delete(universityId); throw e;
    });
    majorCache.set(universityId, p!);
  }
  return p!;
}

export function useUniversities() {
  const [data, setData] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadUniversities()
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) setError(e?.message || 'Gagal memuat data PTN'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return { universities: data, loading, error };
}

export function useMajors(universityId?: number | null) {
  const [data, setData] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!universityId) { setData([]); return; }
    let alive = true;
    setLoading(true);
    loadMajors(universityId)
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setData([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [universityId]);
  return { majors: data, loading };
}
