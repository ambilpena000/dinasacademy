import { accessibleTryouts, allowedCategories, maxTryouts } from './tryout-access';

const tryouts = [
  { id: 1, category: 'PTN', isActive: true },
  { id: 2, category: 'PTN', isActive: true },
  { id: 3, category: 'SKD', isActive: true },
  { id: 4, category: 'PTN', isActive: false },
  { id: 5, category: 'STIS', isActive: true },
];

describe('tryout access', () => {
  it('tanpa paket: tidak ada try out', () => {
    expect(accessibleTryouts({ role: 'student', hasPurchasedPackage: false }, tryouts)).toEqual([]);
    expect(accessibleTryouts(undefined, tryouts)).toEqual([]);
  });

  it('admin: semua try out (termasuk nonaktif)', () => {
    expect(accessibleTryouts({ role: 'admin' }, tryouts)).toHaveLength(5);
  });

  it('paket PTN: hanya try out PTN yang aktif', () => {
    const ids = accessibleTryouts({ hasPurchasedPackage: true, packageType: 'PTN Premium' }, tryouts).map((t) => t.id);
    expect(ids).toEqual([1, 2]);
  });

  it('paket SKD: hanya try out SKD — tidak mendapat tes khusus STIS', () => {
    const ids = accessibleTryouts({ hasPurchasedPackage: true, packageType: 'SKD Sekdin Premium' }, tryouts).map((t) => t.id);
    expect(ids).toEqual([3]);
  });

  it('paket STIS: try out SKD + tes khusus STIS', () => {
    const ids = accessibleTryouts({ hasPurchasedPackage: true, packageType: 'STIS Premium' }, tryouts).map((t) => t.id);
    expect(ids).toEqual([3, 5]);
  });

  it('kuota paket membatasi jumlah try out', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, category: 'PTN', isActive: true }));
    expect(accessibleTryouts({ hasPurchasedPackage: true, packageType: 'Basic SNBT' }, many)).toHaveLength(4);
    expect(maxTryouts('Basic SNBT')).toBe(4);
  });

  it('paket combo mencakup semua kategori', () => {
    expect(allowedCategories('Combo Lengkap')).toEqual(['SNBT', 'SKD', 'STIS']);
  });

  it('paket PTN = SNBT; data lama berkategori PTN tetap terbaca sebagai SNBT', () => {
    expect(allowedCategories('PTN Premium')).toEqual(['SNBT']);
    const ids = accessibleTryouts({ hasPurchasedPackage: true, packageType: 'PTN Premium' }, tryouts).map((t) => t.id);
    expect(ids).toEqual([1, 2]);
  });
});
