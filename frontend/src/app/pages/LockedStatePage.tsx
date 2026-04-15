import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Lock, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';

interface LockedStatePageProps {
  feature: string;
}

export default function LockedStatePage({ feature }: LockedStatePageProps) {
  const packages = [
    {
      name: 'PTN Premium',
      packageId: '1',
      price: 'Rp 499.000',
      period: '12 bulan',
      color: 'from-[#2563EB] to-blue-700',
      popular: true,
      features: [
        'Akses semua materi UTBK-SNBT',
        '15 Try Out + pembahasan lengkap',
        'Video pembelajaran HD 500+',
        'Analisis hasil & rekomendasi PTN',
        'Bimbingan mentor alumni PTN top',
      ],
    },
    {
      name: 'SKD Premium',
      packageId: '6',
      price: 'Rp 399.000',
      period: '12 bulan',
      color: 'from-[#2563EB] to-blue-700',
      features: [
        'Materi lengkap TWK, TIU, TKP',
        '12 Try Out CAT gratis',
        'Pembahasan detail setiap soal',
        'Bank soal 3000+',
        'Simulasi CAT real-time',
      ],
    },
    {
      name: 'STIS Premium',
      packageId: '8',
      price: 'Rp 449.000',
      period: '10 bulan',
      color: 'from-[#FBBF24] to-yellow-700',
      features: [
        'Materi khusus pola STIS',
        '10 Try Out simulasi STIS',
        'Pembahasan dari alumni STIS',
        'Matematika & Statistika intensive',
        'Tips & trik lolos STIS',
      ],
    },
  ];

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
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={`relative h-full ${pkg.popular ? 'ring-2 ring-[#2563EB] shadow-xl' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-[#2563EB] text-white text-sm font-bold rounded-full">
                      PALING POPULER
                    </div>
                  </div>
                )}
                <CardContent className="pt-8 pb-6">
                  {/* Package Header */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-4`}>
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900">{pkg.price}</div>
                    <div className="text-sm text-gray-600">/ {pkg.period}</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link to={`/paket?package=${pkg.packageId}`}>
                    <Button 
                      variant={pkg.popular ? 'primary' : 'outline'} 
                      size="lg" 
                      className="w-full"
                    >
                      Pilih Paket
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
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