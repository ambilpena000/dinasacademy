// category.ts — Kategori try out: SNBT, SKD, STIS (sama dengan backend/src/tryouts/category.ts).
//   SNBT : termasuk PTN
//   SKD  : TWK, TIU, TKP
//   STIS : tes khusus Matematika — hanya paket STIS (paket STIS juga mendapat SKD)
export type TryoutCategory = 'SNBT' | 'SKD' | 'STIS';

export function normalizeCategory(category?: string | null): TryoutCategory | null {
  const c = (category || '').trim().toUpperCase();
  if (!c) return null;
  if (c === 'STIS' || c.includes('POLSTAT')) return 'STIS';
  if (c === 'SNBT' || c === 'PTN' || c.includes('SBMPTN') || c.includes('UTBK')) return 'SNBT';
  if (c === 'SKD' || c.includes('CPNS') || c.includes('SEKDIN') || c.includes('KEDINASAN')) return 'SKD';
  return null;
}

/** Kategori try out yang termasuk paket. Paket STIS = SKD + STIS; paket SKD = SKD saja. */
export function categoriesForPackage(packageType?: string | null): TryoutCategory[] {
  const pkg = (packageType || '').toLowerCase();
  if (!pkg) return [];
  if (pkg.includes('combo') || pkg.includes('lengkap')) return ['SNBT', 'SKD', 'STIS'];
  if (pkg.includes('stis') || pkg.includes('polstat')) return ['SKD', 'STIS'];
  if (pkg.includes('ptn') || pkg.includes('snbt')) return ['SNBT'];
  if (['skd', 'sekdin', 'cpns', 'ipdn', 'kedinasan'].some(k => pkg.includes(k))) return ['SKD'];
  return [];
}

export const categoryBadgeClass = (category?: string | null) => {
  const c = normalizeCategory(category);
  if (c === 'SKD') return 'bg-violet-50 text-violet-700';
  if (c === 'STIS') return 'bg-orange-50 text-orange-700';
  return 'bg-blue-50 text-blue-700';
};
