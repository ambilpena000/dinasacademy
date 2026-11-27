import { Gift } from 'lucide-react';
import { PackageView, rupiah } from '../lib/packages';

/** Blok harga paket. Paket gratis tampil dengan harga coret + "GRATIS" (gimmick promo). */
export function PackagePrice({ pkg }: { pkg: Pick<PackageView, 'isFree' | 'price' | 'originalPrice' | 'duration'> }) {
  const original = pkg.originalPrice && pkg.originalPrice > pkg.price ? pkg.originalPrice : null;
  const discount = original ? Math.round((1 - pkg.price / original) * 100) : 0;

  if (pkg.isFree) {
    return (
      <div className="text-center mb-4 pb-4 border-b border-gray-200">
        {original && (
          <p className="text-sm text-gray-400 mb-0.5">
            <span className="line-through decoration-red-400 decoration-2">{rupiah(original)}</span>
            <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-black align-middle">HEMAT 100%</span>
          </p>
        )}
        <p className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-[#2563EB] bg-clip-text text-transparent leading-tight">
          GRATIS
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <Gift className="w-3 h-3" /> Promo awal rilis · akses {pkg.duration}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center mb-4 pb-4 border-b border-gray-200">
      <div className="flex items-baseline justify-center space-x-1 mb-0.5">
        <span className="text-3xl font-black bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
          {rupiah(pkg.price)}
        </span>
        <span className="text-gray-500 text-sm font-medium">/{pkg.duration}</span>
      </div>
      {original && (
        <p className="text-xs text-gray-500">
          <span className="line-through">{rupiah(original)}</span>
          <span className="ml-1 text-green-600 font-semibold">-{discount}%</span>
        </p>
      )}
    </div>
  );
}

/** Pita "PROMO" di pojok kartu paket gratis. */
export function PromoRibbon() {
  return (
    <div className="absolute top-3 left-3 z-10">
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-red-500 to-orange-400 text-white shadow">
        🎉 PROMO RILIS
      </span>
    </div>
  );
}
