import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { 
  CheckCircle, Star, Target, Trophy, ArrowLeft, CreditCard, 
  Smartphone, Building2, Copy, Clock, Play, Shield, Users,
  TrendingUp, BookOpen, Award, Sparkles, Gift,
  CheckCheck, Rocket, Crown, Heart, FileText, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { mockPackages } from '../data/mockData';
import { Footer } from '../components/Footer';
import Slider from 'react-slick';

export default function PaketPage() {
  const { user, purchasePackage, addOrder } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packageIdFromUrl = searchParams.get('package');
  
  const [selectedCategory, setSelectedCategory] = useState<'SNBT' | 'SEKDIN' | 'COMBO'>('SNBT');
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(mockPackages[0]);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'ewallet'>('transfer');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Handle package selection from URL parameter
  useEffect(() => {
    if (packageIdFromUrl) {
      const pkg = mockPackages.find(p => p.id === packageIdFromUrl);
      if (pkg) {
        // Determine category based on package
        if (pkg.name.includes('Combo')) {
          setSelectedCategory('COMBO');
        } else if (pkg.track === 'PTN') {
          setSelectedCategory('SNBT');
        } else {
          setSelectedCategory('SEKDIN');
        }
        setSelectedPackage(pkg);
        // Auto-scroll to the package
        setTimeout(() => {
          const element = document.getElementById(`package-${packageIdFromUrl}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [packageIdFromUrl]);

  // Filter packages based on category
  const getFilteredPackages = () => {
    if (selectedCategory === 'COMBO') {
      return mockPackages.filter(p => p.name.includes('Combo'));
    } else if (selectedCategory === 'SNBT') {
      return mockPackages.filter(p => p.track === 'PTN');
    } else {
      return mockPackages.filter(p => p.track === 'Sekdin');
    }
  };

  const filteredPackages = getFilteredPackages();
  const popularPackages = filteredPackages.filter(p => p.isPopular);
  const otherPackages = filteredPackages.filter(p => !p.isPopular);

  // Check if package is subscribed
  const isPackageSubscribed = (packageName: string) => {
    if (!user?.hasPurchasedPackage || !user?.packageType) return false;
    
    if (packageName.includes('PTN') && user.packageType === 'PTN Premium') return true;
    if (packageName.includes('SKD') && user.packageType === 'SKD') return true;
    if (packageName.includes('STIS') && user.packageType === 'STIS') return true;
    
    return false;
  };

  const handleSelectPackage = (pkg: typeof mockPackages[0]) => {
    if (isPackageSubscribed(pkg.name)) return;
    setSelectedPackage(pkg);
    setCheckoutMode(true);
  };



  const subtotal = selectedPackage.price;
  // Kode unik 3 digit dari user ID — untuk verifikasi transfer tanpa cek manual
  const uniqueCode = React.useMemo(() => {
    const uid = user?.id || '';
    const digits = uid.replace(/[^0-9]/g, '');
    return digits.length >= 3
      ? parseInt(digits.slice(-3))
      : Math.floor(Math.random() * 900) + 100;
  }, [user?.id]);
  const total = subtotal; // harga paket
  const totalTransfer = subtotal + uniqueCode; // nominal transfer sebenarnya

  const paymentMethods = [
    {
      id: 'transfer',
      name: 'Transfer Bank',
      icon: <Building2 className="w-5 h-5" />,
      description: 'BCA, BNI, Mandiri, BRI'
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'GoPay, OVO, DANA'
    }
  ];

  const handlePayment = () => {
    let packageType: 'PTN Premium' | 'SKD' | 'STIS' = 'PTN Premium';
    if (selectedPackage.name.includes('SKD')) {
      packageType = 'SKD';
    } else if (selectedPackage.name.includes('STIS')) {
      packageType = 'STIS';
    } else {
      packageType = 'PTN Premium';
    }
    
    purchasePackage(packageType);
    alert('Pembayaran berhasil! Akses paket sudah aktif.');
    setCheckoutMode(false);
    navigate('/dashboard');
  };

  // If in checkout mode, show checkout view
  if (checkoutMode) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <button 
            onClick={() => setCheckoutMode(false)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Paket</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembayaran</h1>
          <p className="text-gray-600">Selesaikan pembayaran untuk mengaktifkan paket</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Package */}
            <Card>
              <CardHeader>
                <CardTitle>Paket yang Dipilih</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl border-2 border-[#2563EB] bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-gray-900">{selectedPackage.name}</h4>
                        {selectedPackage.isPopular && <Badge variant="yellow">Popular</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedPackage.includedTryOuts} Try Out + Pembahasan Lengkap
                      </p>
                      <Badge variant={selectedPackage.track === 'PTN' ? 'blue' : 'purple'}>
                        {selectedPackage.type || selectedPackage.track}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#2563EB]">
                        Rp {(selectedPackage.price / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                        paymentMethod === method.id
                          ? 'border-[#2563EB] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        paymentMethod === method.id ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-[#2563EB]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Payment Instructions */}


                {paymentMethod === 'transfer' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Transfer ke:</h4>
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Bank</p>
                          <p className="font-semibold text-gray-900">BCA</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">No. Rekening</p>
                          <p className="font-semibold text-gray-900">1234567890</p>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText('1234567890')}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Copy className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Atas Nama</p>
                        <p className="font-semibold text-gray-900">PT Dinas Academy</p>
                      </div>
                      {/* Kode Unik - bagian terpenting */}
                      <div className="border-t border-gray-100 pt-3 bg-yellow-50 rounded-xl p-3 -mx-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-bold text-gray-800">⚡ Nominal Transfer (unik)</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(totalTransfer.toString())}
                            className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline"
                          >
                            <Copy className="w-3 h-3" /> Salin
                          </button>
                        </div>
                        <p className="text-2xl font-black text-[#2563EB]">
                          Rp {totalTransfer.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Harga paket <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span> + kode unik <span className="font-bold text-yellow-700">+{uniqueCode}</span>
                        </p>

                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'ewallet' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Kirim ke nomor E-Wallet:</h4>
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">GoPay / OVO / DANA</p>
                          <p className="text-xl font-bold text-[#2563EB]">0812-3456-7890</p>
                          <p className="text-xs text-gray-500 mt-0.5">GoPay / OVO / DANA</p>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText('081234567890')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all text-sm font-medium text-[#2563EB]"
                        >
                          <Copy className="w-4 h-4" />
                          Salin
                        </button>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-sm text-gray-600">Atas Nama</p>
                        <p className="font-semibold text-gray-900">PT Dinas Academy</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-1">
                        <p className="text-sm font-bold text-gray-800">⚡ Nominal Transfer (unik)</p>
                        <p className="text-xl font-black text-[#2563EB]">Rp {totalTransfer.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">
                          Harga paket Rp {subtotal.toLocaleString('id-ID')} + kode unik <span className="font-bold text-yellow-700">+{uniqueCode}</span>
                        </p>

                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harga Paket</span>
                    <span className="font-semibold text-gray-900">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kode Unik</span>
                    <span className="font-semibold text-yellow-600">+{uniqueCode}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-500">Harga Paket</span>
                      <span className="text-sm text-gray-700">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Transfer</span>
                      <span className="text-2xl font-bold text-[#2563EB]">
                        Rp {totalTransfer.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/6281234567890?text=Halo%20Dinas%20Academy,%20saya%20ingin%20konfirmasi%20pembayaran%20%F0%9F%8E%AF%0A%0APaket%3A%20*${encodeURIComponent(selectedPackage?.name || '')}*%0AMetode%3A%20${paymentMethod === 'transfer' ? 'Transfer%20Bank%20BCA' : 'E-Wallet'}%0ANominal%3A%20*Rp%20${totalTransfer.toLocaleString('id-ID')}*%0AKode%20Unik%3A%20*${uniqueCode}*%0A%0ANama%3A%20${encodeURIComponent(user?.name || '')}%0AEmail%3A%20${encodeURIComponent(user?.email || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Save order to admin panel
                    addOrder({
                      userId: user?.id || '',
                      userName: user?.name || '',
                      userEmail: user?.email || '',
                      packageType: (() => {
                        const n = selectedPackage.name.toLowerCase();
                        if (n.includes('stis')) return 'STIS';
                        if (n.includes('skd') || n.includes('sekdin') || selectedPackage.track === 'Sekdin') return 'SKD';
                        return 'PTN Premium';
                      })() as 'PTN Premium' | 'SKD' | 'STIS',
                      packageName: selectedPackage.name,
                      amount: total,
                      paymentMethod,
                    });
                    // uniqueCode dan totalAmount dihitung otomatis di addOrder
                    setOrderSubmitted(true);
                  }}
                >
                  <Button variant="primary" size="lg" className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54]">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Bayar & Konfirmasi via WA
                  </Button>
                </a>
                {orderSubmitted && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-green-700 font-semibold">✅ Pesanan tercatat! Selesaikan konfirmasi di WhatsApp.</p>
                    <p className="text-xs text-green-600 mt-0.5">Admin akan mengaktifkan paket kamu setelah pembayaran dikonfirmasi.</p>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Pembayaran aman & terenkripsi</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Akses langsung setelah pembayaran</span>
                  </div>

                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    );
  }

  // Default view - Package selection
  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#60A5FA] p-8 md:p-12 text-white"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FBBF24]/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-black mb-4 leading-tight"
          >
            Wujudkan Impianmu Masuk<br />PTN & Sekolah Kedinasan!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
          >
            Bergabung dengan <span className="font-bold text-[#FBBF24]">12.000+ siswa</span> yang sudah berhasil diterima di kampus impian mereka!
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Users, label: '12.000+', sublabel: 'Siswa Aktif' },
              { icon: Trophy, label: '95%', sublabel: 'Lulus PTN' },
              { icon: BookOpen, label: '1000+', sublabel: 'Bank Soal' },
              { icon: Award, label: '4.9/5', sublabel: 'Rating Siswa' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + (idx * 0.1) }}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stat.label}</p>
                <p className="text-sm text-white/80">{stat.sublabel}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Track Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Pilih Jalur Impianmu
          </h2>
          <p className="text-gray-600">
            Kami punya program khusus untuk setiap tujuanmu
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => setSelectedCategory('SNBT')}
            className={`group relative px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
              selectedCategory === 'SNBT'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white shadow-2xl scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#2563EB] hover:scale-105'
            }`}
          >
            {selectedCategory === 'SNBT' && (
              <motion.div
                layoutId="activeTrack"
                className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">SNBT/UTBK</span>
          </button>

          <button
            onClick={() => setSelectedCategory('SEKDIN')}
            className={`group relative px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
              selectedCategory === 'SEKDIN'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-2xl scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#2563EB] hover:scale-105'
            }`}
          >
            {selectedCategory === 'SEKDIN' && (
              <motion.div
                layoutId="activeTrack"
                className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">SEKDIN</span>
          </button>

          <button
            onClick={() => setSelectedCategory('COMBO')}
            className={`group relative px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
              selectedCategory === 'COMBO'
                ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-2xl scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#2563EB] hover:scale-105'
            }`}
          >
            {selectedCategory === 'COMBO' && (
              <motion.div
                layoutId="activeTrack"
                className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">COMBO</span>
          </button>
        </div>
      </motion.div>

      {/* Package Cards - Grid Layout 6 Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg, index) => {
          const isSubscribed = isPackageSubscribed(pkg.name);
          const isBest = pkg.isPopular;
          const isHighlighted = packageIdFromUrl === pkg.id;
          
          return (
            <motion.div
              key={pkg.id}
              id={`package-${pkg.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + (index * 0.1) }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <Card 
                className={`h-full relative overflow-hidden border-2 transition-all duration-300 ${
                  isHighlighted
                    ? 'border-[#2563EB] shadow-xl ring-2 ring-blue-200'
                    : isBest 
                    ? 'border-[#2563EB] shadow-lg bg-gradient-to-br from-blue-50/50 to-white' 
                    : isSubscribed
                    ? 'border-green-500 bg-gradient-to-br from-white to-green-50'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {/* Best Badge - Simple */}
                {isBest && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="blue" className="text-xs font-bold">
                      ⭐ TERBAIK
                    </Badge>
                  </div>
                )}

                {/* Subscribed Badge */}
                {isSubscribed && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="green" className="text-xs font-bold">
                      <CheckCheck className="w-3 h-3 mr-1 inline" />
                      AKTIF
                    </Badge>
                  </div>
                )}

                <CardContent className="pt-4 pb-5 flex flex-col h-full">
                  {/* Package Icon - Blue Gradient with Animation */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 mb-4 mx-auto rounded-xl flex items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-lg"
                  >
                    {isSubscribed ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <FileText className="w-6 h-6 text-white" />
                    )}
                  </motion.div>

                  {/* Package Name */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-600 text-xs leading-snug">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Pricing - Compact */}
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

                  {/* Features - Compact */}
                  <div className="space-y-2 mb-4">
                    {pkg.features.slice(0, 4).map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 leading-snug">
                          {feature}
                        </span>
                      </div>
                    ))}
                    {pkg.features.length > 4 && (
                      <p className="text-xs text-gray-500 text-center pt-1">
                        +{pkg.features.length - 4} fitur lainnya
                      </p>
                    )}
                  </div>

                  <div className="flex-1" />
                  {/* Try Out Count - Compact */}
                  <div className="mb-4 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between">
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
                  </div>

                  {/* CTA Button - Compact */}
                  <Button 
                    variant="primary"
                    size="md"
                    className={`w-full ${
                      isSubscribed
                        ? 'bg-green-600 hover:bg-green-600 border-none cursor-default'
                        : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-none'
                    }`}
                    onClick={() => !isSubscribed && handleSelectPackage(pkg)}
                    disabled={isSubscribed}
                  >
                    <span className="text-sm font-bold">
                      {isSubscribed ? '✓ Sudah Berlangganan' : 'Pilih Paket'}
                    </span>
                  </Button>

                  {/* Social Proof - Mini */}
                  {!isSubscribed && (
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
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: Play,
            title: 'Akses Instan',
            description: 'Langsung belajar setelah pembayaran berhasil',
            color: 'from-blue-500 to-indigo-500'
          },
          {
            icon: BookOpen,
            title: 'Bank Soal Lengkap',
            description: '1.000+ soal latihan sesuai kisi-kisi terbaru SNBT & SKD',
            color: 'from-[#2563EB] to-blue-400'
          },
          {
            icon: Users,
            title: 'Komunitas Aktif',
            description: 'Diskusi & sharing dengan 12.000+ siswa lainnya',
            color: 'from-blue-500 to-cyan-500'
          }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ / Still Doubt Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
                Masih Ragu? Konsultasi Gratis
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Tim mentor kami siap membantu kamu menemukan paket yang paling cocok dengan tujuan dan kebutuhanmu. 
                <span className="font-bold text-[#2563EB]"> 100% gratis, tanpa komitmen!</span>
              </p>
              <div className="flex items-center justify-center">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Dinas%20Academy,%20saya%20ingin%20konsultasi%20pilihan%20paket"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="lg" className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] border-none shadow-lg shadow-green-500/30">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat via WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <Footer />

    </div>
  );
}