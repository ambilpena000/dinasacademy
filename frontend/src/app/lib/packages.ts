// packages.ts — bentuk data paket untuk tampilan (Landing, Paket, halaman terkunci, admin).

export interface PackageView {
  id: string;
  rawId: number;
  name: string;
  description: string;
  track: string;
  type: string;
  price: number;
  originalPrice: number | null;
  isFree: boolean;
  isActive: boolean;
  durationDays: number;
  duration: string;
  features: string[];
  tryoutIds: number[];
  includedTryouts: string[];
  /** Label jumlah try out, mis. "1 Try Out" atau "Semua Try Out SNBT". */
  tryoutLabel: string;
  isPopular: boolean;
}

export function durationLabel(days: number) {
  if (days >= 360) return '12 bulan';
  if (days >= 170) return '6 bulan';
  if (days >= 80) return '3 bulan';
  return `${days} hari`;
}

export function isSnbtPackage(p: { track?: string; type?: string; name?: string }) {
  return /ptn|snbt/i.test(`${p.track} ${p.type} ${p.name}`);
}

export function mapPackage(p: any): PackageView {
  const tryoutIds: number[] = Array.isArray(p.tryoutIds) ? p.tryoutIds.map(Number) : [];
  const durationDays = typeof p.duration === 'number' ? p.duration : parseInt(p.duration, 10) || 365;
  const original = p.originalPrice === null || p.originalPrice === undefined || p.originalPrice === '' ? null : Number(p.originalPrice);
  const kind = isSnbtPackage(p) ? 'SNBT' : /sekdin|skd|stis/i.test(`${p.track} ${p.type}`) ? 'SKD' : '';
  return {
    id: String(p.id),
    rawId: Number(p.id),
    name: p.name,
    description: p.description || '',
    track: p.track || '',
    type: p.type || p.track || '',
    price: Number(p.price) || 0,
    originalPrice: original,
    isFree: !!p.isFree,
    isActive: p.isActive !== false,
    durationDays,
    duration: durationLabel(durationDays),
    features: Array.isArray(p.features) ? p.features : [],
    tryoutIds,
    includedTryouts: Array.isArray(p.includedTryouts) ? p.includedTryouts : [],
    tryoutLabel: tryoutIds.length ? `${tryoutIds.length} Try Out` : `Semua Try Out${kind ? ' ' + kind : ''}`,
    isPopular: false,
  };
}

export const rupiah = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
