// tryout-access.ts — Aturan akses try out berdasarkan paket user (satu sumber kebenaran).
// Dipakai oleh: daftar & detail try out, soal ujian, pembahasan, draft & submit ujian.
import { normalizeCategory } from './category';

/** Hak akses dari satu paket aktif milik user (hasil pesanan berstatus "active"). */
export interface Entitlement {
  packageType?: string | null;
  /** Try out yang dipilih admin untuk paket ini. Kosong = semua try out sesuai kategori paket. */
  tryoutIds?: number[];
}

export interface AccessUser {
  id?: number;
  role?: string;
  hasPurchasedPackage?: boolean;
  packageType?: string | null;
  /** Paket-paket aktif user. Bila diisi, akses = gabungan semua paket ini. */
  entitlements?: Entitlement[];
}

export interface AccessTryout {
  id: number;
  category: string;
  isActive?: boolean;
}

/**
 * Kategori try out yang termasuk dalam paket.
 *   Paket STIS        → SKD + STIS (tes khusus Matematika)
 *   Paket SKD/Sekdin  → SKD saja (tanpa tes khusus STIS)
 *   Paket SNBT/PTN    → SNBT
 */
export function allowedCategories(packageType?: string | null): string[] {
  const pkg = (packageType || '').toLowerCase();
  if (pkg.includes('combo') || pkg.includes('lengkap')) return ['SNBT', 'SKD', 'STIS'];
  if (pkg.includes('stis') || pkg.includes('polstat')) return ['SKD', 'STIS'];
  if (pkg.includes('ptn') || pkg.includes('snbt')) return ['SNBT'];
  if (['skd', 'sekdin', 'cpns', 'ipdn', 'kedinasan'].some((k) => pkg.includes(k))) return ['SKD'];
  return [];
}

/** Jumlah maksimum try out dalam paket. */
export function maxTryouts(packageType?: string | null): number {
  const pkg = (packageType || '').toLowerCase();
  if (pkg.includes('premium') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 15;
  if (pkg.includes('standar') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 8;
  if (pkg.includes('basic') && (pkg.includes('snbt') || pkg.includes('ptn'))) return 4;
  if (pkg.includes('premium') && pkg.includes('skd')) return 12;
  if (pkg.includes('standar') && pkg.includes('skd')) return 6;
  if (pkg.includes('premium') && pkg.includes('stis')) return 10;
  if (pkg.includes('combo')) return 20;
  return 999;
}

/**
 * Try out yang boleh dikerjakan user (urutan sama dengan daftar try out).
 * Admin: semua. User tanpa paket: kosong.
 */
export function accessibleTryouts<T extends AccessTryout>(user: AccessUser | undefined, all: T[]): T[] {
  if (user?.role === 'admin') return all;
  if (user?.entitlements?.length) {
    const allowed = new Set<number>();
    for (const e of user.entitlements) {
      for (const t of fromEntitlement(e, all)) allowed.add(t.id);
    }
    return all.filter((t) => allowed.has(t.id));
  }
  if (!user?.hasPurchasedPackage || !user?.packageType) return [];
  return fromEntitlement({ packageType: user.packageType }, all);
}

function fromEntitlement<T extends AccessTryout>(e: Entitlement, all: T[]): T[] {
  const active = all.filter((t) => t.isActive !== false);
  if (e.tryoutIds?.length) {
    const ids = new Set(e.tryoutIds.map(Number));
    return active.filter((t) => ids.has(t.id));
  }
  const cats = allowedCategories(e.packageType);
  return active
    .filter((t) => cats.includes(normalizeCategory(t.category) ?? ''))
    .slice(0, maxTryouts(e.packageType));
}
