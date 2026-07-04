import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { 
  BookOpen, Trophy, Target, Users, CheckCircle, 
  ArrowRight, Star, Play, TrendingUp, Award, 
  Zap, Clock, Brain, Sparkles,
  Shield, Rocket, Crown, Heart, Gift, MessageCircle,
  Check, Video, FileText, BarChart, GraduationCap,
  Quote, Flame, TrendingDown, ArrowDown, CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/Button';
import DraggableWA from '../components/DraggableWA';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { api } from '../lib/api';




export default function LandingPage() {
  const sliderRef = useRef<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    api.getPackages()
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setPackages(data.map((p: any, i: number) => ({
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
          })));
        }
      })
      .catch(() => {})
      .finally(() => setPackagesLoading(false));
  }, []);

  const testimonials = [
    {
      name: 'Andi Setiawan',
      university: 'Universitas Indonesia',
      major: 'Teknik Informatika',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      testimonial: 'Try out CAT-nya mirip banget sama ujian asli! Dari awalnya ragu, sekarang Alhamdulillah bisa lolos UI.',
      rating: 5,
      score: '687',
      maxScore: '800',
      improvement: '+287 poin',
      year: '2025'
    },
    {
      name: 'Siti Rahma',
      university: 'STAN',
      major: 'Akuntansi',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      testimonial: 'Pembahasannya detail banget! Try out-nya bikin saya terbiasa dengan sistem CAT dan timer ketat.',
      rating: 5,
      score: '445',
      maxScore: '550',
      improvement: '+152 poin',
      year: '2025'
    },
    {
      name: 'Budi Santoso',
      university: 'ITB',
      major: 'Teknik Elektro',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      testimonial: 'Dari nilai try out 300-an naik jadi 600-an dalam 3 bulan! Sistem latihan soal-nya super membantu.',
      rating: 5,
      score: '612',
      maxScore: '800',
      improvement: '+309 poin',
      year: '2025'
    },
    {
      name: 'Dewi Kusuma',
      university: 'UGM',
      major: 'Kedokteran',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      testimonial: 'Platform terbaik untuk persiapan UTBK! Try out-nya banyak, pembahasan soal sangat detail.',
      rating: 5,
      score: '723',
      maxScore: '800',
      improvement: '+245 poin',
      year: '2025'
    },
    {
      name: 'Farhan Ahmad',
      university: 'IPDN',
      major: 'Manajemen Pemerintahan',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      testimonial: 'Sistem CAT-nya realistis banget, pas ujian beneran jadi gak gugup. Try out rutin dan pembahasannya lengkap.',
      rating: 5,
      score: '534',
      maxScore: '600',
      improvement: '+189 poin',
      year: '2024'
    },
    {
      name: 'Ayu Lestari',
      university: 'STIS',
      major: 'Statistika',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
      testimonial: 'Dashboard analytics-nya keren banget! Langsung tahu di subtes mana harus fokus belajar. Try out-nya persis CAT asli.',
      rating: 5,
      score: '478',
      maxScore: '550',
      improvement: '+234 poin',
      year: '2024'
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 overflow-hidden">
      {/* WhatsApp Floating Button - Draggable */}
      <DraggableWA />

      {/* Navbar - Clean & Modern */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black">
                <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">DINAS</span>
                <span className="text-gray-900"> ACADEMY</span>
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="outline" className="font-semibold border-2 border-gray-200 hover:border-[#2563EB] text-gray-700 hover:text-[#2563EB] transition-all">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="font-bold bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-lg">
                    Daftar Gratis
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Clean without floating badges */}
      <section className="relative min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-white to-sky-100/50"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-sky-400/25 to-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-sky-400/15 rounded-full blur-3xl"></div>
        </div>
        
        {/* Minimal Dot Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle, rgba(124, 58, 237, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-5rem)]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Simple Badge */}

              
              {/* Clean Heading with Smooth Underline */}
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-2 leading-[1.1]">
                Lolos ke
              </h1>
              <div className="relative inline-block mb-8">
                <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
                  Perguruan Tinggi<br />Impianmu
                </h1>
                {/* Smooth Wave Underline */}
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 500 12"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
                >
                  <motion.path
                    d="M 0 6 Q 50 2, 100 6 T 200 6 T 300 6 T 400 6 T 500 6"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </div>
              
              {/* Description */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Platform <span className="font-bold text-gray-900">try out online</span> dengan{' '}
                <span className="font-bold text-blue-600">simulasi CAT real</span>,{' '}
                <span className="font-bold text-sky-600">pembahasan lengkap</span>, dan{' '}
                <span className="font-bold text-fuchsia-600">AI analytics</span> untuk mempersiapkanmu 
                lolos PTN & Sekolah Kedinasan!
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/register" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-lg shadow-blue-500/30 text-lg font-bold px-8 py-6"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Mulai Belajar Gratis
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => scrollToSection('program-persiapan')}
                    className="w-full sm:w-auto border-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white font-bold px-8 py-6"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Lihat Paket
                  </Button>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6">
                {[
                  { value: '12K+', label: 'Siswa Berhasil' },
                  { value: '95%', label: 'Tingkat Kelulusan' },
                  { value: '4.9/5', label: 'Rating Siswa' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Image - Clean without floating elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Students learning together"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Card Style like Image */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-sky-200/30 to-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-cyan-300/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600">
              Semua yang kamu butuhkan untuk lolos PTN & Sekdin 🚀
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: 'Try Out CAT Real',
                description: 'Simulasi ujian real-time dengan sistem CAT 100% mirip ujian asli SNBT & SKD',
                gradient: 'from-blue-500 to-cyan-600',
                bgColor: 'bg-blue-500'
              },
              {
                icon: Target,
                title: 'Pembahasan Lengkap',
                description: 'Pembahasan detail setiap soal dengan tips & trik dari mentor berpengalaman',
                gradient: 'from-pink-500 to-rose-600',
                bgColor: 'bg-pink-500'
              },
              {
                icon: GraduationCap,
                title: 'Rekomendasi PTN',
                description: 'Rekomendasi PTN & jurusan yang sesuai dengan skor try out kamu',
                gradient: 'from-blue-500 to-sky-600',
                bgColor: 'bg-blue-500'
              },
              {
                icon: BarChart,
                title: 'Analisis Performa',
                description: 'Dashboard analytics lengkap dengan prediksi skor dan analisis kelemahan',
                gradient: 'from-pink-500 to-rose-600',
                bgColor: 'bg-pink-500'
              },
              {
                icon: Trophy,
                title: 'Ranking Nasional',
                description: 'Lihat peringkatmu dibanding ribuan peserta lain secara real-time',
                gradient: 'from-blue-500 to-sky-600',
                bgColor: 'bg-blue-500'
              },
              {
                icon: Clock,
                title: 'Timer Otomatis',
                description: 'Sistem timer dan penilaian otomatis persis seperti ujian sesungguhnya',
                gradient: 'from-orange-500 to-red-600',
                bgColor: 'bg-orange-500'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all h-full border border-gray-100">
                  {/* Icon at top left */}
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Paket Section */}
      <section id="program-persiapan" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100/40 via-sky-50/30 to-blue-50/40 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-sky-300/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Pilih Program Persiapan
            </h2>
            <p className="text-xl text-gray-600">
              Raih impianmu masuk Perguruan Tinggi Negeri favorit dengan program terbaik!
            </p>
          </motion.div>

          {packagesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-5">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="relative"
                >
                  <div className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-full border-2 ${
                    pkg.isPopular ? 'border-[#2563EB] ring-2 ring-blue-200' : 'border-gray-100'
                  }`}>
                    {/* Popular Badge */}
                    {pkg.isPopular && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          ⭐ TERBAIK
                        </span>
                      </div>
                    )}

                    <div className="p-5 flex flex-col h-full">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 mb-4 mx-auto rounded-xl flex items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-lg"
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </motion.div>

                      {/* Name & Description */}
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
                          <span className="text-gray-500 text-sm font-medium">/{pkg.duration}</span>
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
                      <Link to="/paket">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] font-bold text-white shadow-lg">
                            Pilih Paket
                          </Button>
                        </motion.div>
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section - Clean & Professional */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
        {/* Enhanced background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-sky-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 via-sky-100/10 to-blue-100/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Mereka Berhasil, Kamu Juga Bisa! ✨
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ribuan siswa telah meraih mimpinya bersama DINAS ACADEMY
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
            {[
              { icon: Users, value: '12K+', label: 'Alumni Berhasil', color: 'from-blue-500 to-cyan-500' },
              { icon: Trophy, value: '95%', label: 'Tingkat Lulus', color: 'from-blue-500 to-sky-500' },
              { icon: Star, value: '4.9/5', label: 'Rating Siswa', color: 'from-amber-500 to-orange-500' },
              { icon: Rocket, value: '1000+', label: 'Bank Soal', color: 'from-pink-500 to-rose-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials Carousel */}
          <div className="relative max-w-6xl mx-auto">
            <Slider
              ref={sliderRef}
              dots={true}
              infinite={true}
              speed={1200}
              slidesToShow={3}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={4000}
              pauseOnHover={true}
              cssEase="ease-in-out"
              arrows={false}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  }
                }
              ]}
              dotsClass="slick-dots !bottom-[-50px]"
              customPaging={() => (
                <div className="w-3 h-3 rounded-full bg-gray-300 hover:bg-blue-500 transition-colors cursor-pointer mt-8"></div>
              )}
            >
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="px-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full"
                  >
                    {/* Header with Avatar */}
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-16 h-16 rounded-2xl ring-4 ring-blue-100 object-cover" 
                      />
                      <div className="flex-1">
                        <div className="text-lg font-black text-gray-900">{testimonial.name}</div>
                        <div className="text-sm font-bold text-blue-600">{testimonial.university}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{testimonial.major}</div>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                      ))}
                    </div>

                    {/* Testimonial */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-6 line-clamp-4">
                      "{testimonial.testimonial}"
                    </p>

                    {/* Score Badge */}
                    <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">Skor Akhir</span>
                        <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                          {testimonial.score}/{testimonial.maxScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{testimonial.year}</span>
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full">
                          <span className="text-xs font-black text-green-700">{testimonial.improvement}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>


          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-lg text-lg font-black px-10 py-6">
                  Bergabung dengan 12K+ Siswa Lainnya
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100/50 via-sky-50/40 to-blue-50/50 relative overflow-hidden">
        {/* Radial Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-sky-400/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">Siap Raih Impianmu? 🚀</h2>
            <p className="text-xl text-gray-600 mb-10">Daftar sekarang dan mulai perjalananmu menuju PTN & Sekdin impian!</p>
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-xl shadow-blue-500/30 text-xl font-black px-12 py-7">
                  Daftar Sekarang - GRATIS!
                </Button>
              </motion.div>
            </Link>
            <div className="mt-6 text-gray-600 text-sm font-medium flex items-center justify-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-600" />Tanpa kartu kredit</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-600" />Akses instan</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-600" />Garansi 7 hari</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black">DINAS ACADEMY</span>
              </div>
              <p className="text-gray-400 text-sm">Platform e-learning #1 di Indonesia untuk persiapan PTN & Sekolah Kedinasan.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['Tentang Kami', 'Fitur', 'Harga', 'Blog'].map(link => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Bantuan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['FAQ', 'Kontak', 'Syarat & Ketentuan', 'Privacy'].map(link => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            <p>© 2026 DINAS ACADEMY. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}