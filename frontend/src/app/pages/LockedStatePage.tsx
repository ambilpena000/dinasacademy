import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Lock, ShoppingBag, CheckCircle, FileText, Star } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../lib/api';

interface LockedStatePageProps {
  feature: string;
}

export default function LockedStatePage({ feature }: LockedStatePageProps) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPackages()
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const mapped = data.map((p: any, i: number) => ({
            id: String(p.id),
            name: p.name,
            description: p.description,
            price: Number(p.price),
            duration: typeof p.duration === 'number'
              ? (p.duration >= 360 ? '12 bulan' : p.duration >= 170 ? '6 bulan' : `${p.duration} hari`)
              : (typeof p.duration === 'string' ? p.duration : '12 bulan'),
            features: Array.isArray(p.features) ? p.features : [],
            includedTryOuts: Array.isArray(p.includedTryouts)
              ? p.includedTryouts.length
              : (typeof p.includedTryOuts === 'number' ? p.includedTryOuts : 0),
            isPopular: i === 0,
          }));
          setPackages(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Lock Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {feature} Terkunci
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Untuk mengakses {feature.toLowerCase()}, kamu perlu membeli paket terlebih dahulu. 
                Pilih paket yang sesuai dengan tujuan belajarmu!
              </p>
              <div className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-50 rounded-full">
                <ShoppingBag className="w-5 h-5 text-[#2563EB]" />
                <span className="font-semibold text-gray-900">Pilih paket di bawah untuk memulai</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Package Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Pilih Paket Belajar</h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-5">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <Card
                  className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${
                    pkg.isPopular
                      ? 'border-[#2563EB] shadow-lg bg-gradient-to-br from-blue-50/50 to-white'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        ⭐ TERBAIK
                      </span>
                    </div>
                  )}

                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Package Icon */}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 mb-4 mx-auto rounded-xl flex items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-lg"
                    >
                      <FileText className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Package Name */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                      <p className="text-gray-600 text-xs leading-snug">{pkg.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-baseline justify-center space-x-1 mb-0.5">
                        <span className="text-3xl font-black bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
                          {(pkg.price / 1000).toFixed(0)}K
                        </span>
                        <span className="text-gray-500 text-sm font-medium">
                          /{pkg.duration}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        <span className="line-through">Rp {((pkg.price * 1.3) / 1000).toFixed(0)}K</span>
                        <span className="ml-1 text-green-600 font-semibold">-30%</span>
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {pkg.features.slice(0, 4).map((f: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-700 leading-snug">{f}</span>
                        </div>
                      ))}
                      {pkg.features.length > 4 && (
                        <p className="text-xs text-gray-500 text-center pt-1">
                          +{pkg.features.length - 4} fitur lainnya
                        </p>
                      )}
                    </div>

                    <div className="flex-1" />

                    {/* Try Out Count */}
                    <div className="mb-4 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium leading-none mb-0.5">Try Out</p>
                          <p className="text-sm font-black text-[#2563EB] leading-none">
                            {pkg.includedTryOuts} Paket
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link to={`/paket?package=${pkg.id}`}>
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] border-none"
                      >
                        <span className="text-sm font-bold">Pilih Paket</span>
                      </Button>
                    </Link>

                    {/* Social Proof */}
                    <div className="mt-3 text-center">
                      <div className="flex items-center justify-center space-x-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        <span className="font-bold text-gray-900">{2000 + (index * 300)}+</span> siswa
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-100">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kenapa Harus Membeli Paket?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Akses unlimited ke semua materi pembelajaran',
                'Try Out CAT dengan sistem scoring otomatis',
                'Pembahasan detail dengan tips & trik',
                'Tracking progress dan analisis mendalam',
                'Akses grup mentoring dengan alumni PTN/Sekdin',
                'Update materi dan soal terbaru',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}