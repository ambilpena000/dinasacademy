// category.ts — Kategori try out: SNBT, SKD, dan STIS.
//   SNBT : termasuk PTN / SBMPTN / UTBK
//   SKD  : TWK, TIU, TKP (CPNS / Sekolah Kedinasan)
//   STIS : tes khusus Matematika Polstat STIS — hanya untuk paket STIS
//          (paket STIS juga mendapat semua try out SKD)
export const TRYOUT_CATEGORIES = ['SNBT', 'SKD', 'STIS'] as const;
export type TryoutCategory = (typeof TRYOUT_CATEGORIES)[number];

export function normalizeCategory(category?: string | null): TryoutCategory | null {
  const c = (category || '').trim().toUpperCase();
  if (!c) return null;
  if (c === 'STIS' || c.includes('POLSTAT')) return 'STIS';
  if (c === 'SNBT' || c === 'PTN' || c.includes('SBMPTN') || c.includes('UTBK')) return 'SNBT';
  if (c === 'SKD' || c.includes('CPNS') || c.includes('SEKDIN') || c.includes('KEDINASAN')) return 'SKD';
  return null;
}
