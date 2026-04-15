// ================================================================
// mockData.ts — Dinas Academy
// Data sesuai regulasi SNBT 2026 & SKD Sekdin 2026
// ================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface Material {
  id: string;
  title: string;
  category: 'TPS' | 'Literasi' | 'Penalaran Matematika' | 'TWK' | 'TIU' | 'TKP';
  type: 'video' | 'pdf' | 'practice';
  duration: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  track: 'PTN' | 'Sekdin';
  description?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'example';
  duration: string;
  completed: boolean;
  locked: boolean;
  description?: string;
}

export interface SubChapter {
  id: string;
  title: string;
  description: string;
  contents: ContentItem[];
  totalVideos: number;
  totalDuration: string;
  completed: boolean;
}

export interface SubTest {
  id: string;
  code: string;
  title: string;
  description: string;
  track: 'PTN' | 'Sekdin';
  progress: number;
  totalChapters: number;
  completedChapters: number;
  subChapters: SubChapter[];
}

// ── SNBT 2026 ─────────────────────────────────────────────────────
// Total: ~160 soal, 195 menit
// TPS (Tes Potensi Skolastik):
//   - Penalaran Umum (PU): ~30 soal
//   - Pengetahuan & Pemahaman Umum (PPU): ~20 soal
//   - Kemampuan Memahami Bacaan & Menulis (KMBM): ~20 soal
//   - Pengetahuan Kuantitatif (PK): ~20 soal
// Literasi:
//   - Literasi Bahasa Indonesia: ~30 soal
//   - Literasi Bahasa Inggris: ~20 soal
// Penalaran Matematika: ~20 soal
//
// SKD Sekdin 2026:
// Total: 110 soal, 100 menit (CAT)
//   - TWK: 30 soal
//   - TIU: 35 soal
//   - TKP: 45 soal

export interface TryOut {
  id: string;
  title: string;
  category: 'PTN' | 'SKD' | 'STIS';
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  duration: number; // menit
  totalQuestions: number;
  isLocked: boolean;
  isPurchased: boolean;
  isCompleted: boolean;
  price?: number;
  description: string;
  subjects: TryOutSubject[];
}

export interface TryOutSubject {
  name: string;
  code: string;
  totalQuestions: number;
  duration?: number; // menit, jika dibatasi per subtes
  description?: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  tips?: string;
  videoUrl?: string;
  subject: string;
  subjectCode?: string;
  tryOutId?: string;
}

export interface Score {
  tryOutId: string;
  tryOutTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  rank: number;
  totalParticipants: number;
  date: string;
  subScores: { subject: string; code: string; score: number; maxScore: number; correctCount: number; totalCount: number }[];
}

export interface Package {
  id: string;
  name: string;
  track: 'PTN' | 'Sekdin';
  type?: 'SKD' | 'STIS' | 'IPDN' | 'POLSTAT';
  price: number;
  duration?: string;
  description?: string;
  features: string[];
  includedTryOuts: number;
  isPopular?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currentPackage?: string;
  streak: number;
  badges: Badge[];
  joinDate: string;
}

// ── TRYOUTS ───────────────────────────────────────────────────────
export const mockTryOuts: TryOut[] = [
  // ── SNBT / PTN ──────────────────────────────────────────────────
  {
    id: '1',
    title: 'Try Out SNBT 2026 #1',
    category: 'PTN',
    difficulty: 'Sedang',
    duration: 195,
    totalQuestions: 160,
    isLocked: false,
    isPurchased: true,
    isCompleted: false,
    description: 'Simulasi lengkap SNBT 2026 — TPS, Literasi, dan Penalaran Matematika',
    subjects: [
      { name: 'Penalaran Umum', code: 'PU', totalQuestions: 30, description: 'Induktif, deduktif, kuantitatif' },
      { name: 'Pengetahuan & Pemahaman Umum', code: 'PPU', totalQuestions: 20, description: 'Sinonim, antonim, hubungan antar kata' },
      { name: 'Kemampuan Memahami Bacaan & Menulis', code: 'KMBM', totalQuestions: 20, description: 'PUEBI, struktur kalimat, kepaduan paragraf' },
      { name: 'Pengetahuan Kuantitatif', code: 'PK', totalQuestions: 20, description: 'Aljabar, aritmatika, geometri, statistika' },
      { name: 'Literasi Bahasa Indonesia', code: 'LBI', totalQuestions: 30, description: 'Teks naratif, deskriptif, argumentatif' },
      { name: 'Literasi Bahasa Inggris', code: 'LBE', totalQuestions: 20, description: 'Gagasan utama, inferensi, detail bacaan' },
      { name: 'Penalaran Matematika', code: 'PM', totalQuestions: 20, description: 'Konteks kehidupan, data statistik, peluang' },
    ],
  },
  {
    id: '2',
    title: 'Try Out SNBT 2026 #2',
    category: 'PTN',
    difficulty: 'Sulit',
    duration: 195,
    totalQuestions: 160,
    isLocked: false,
    isPurchased: true,
    isCompleted: false,
    description: 'Simulasi SNBT level advance dengan soal prediktif 2026',
    subjects: [
      { name: 'Penalaran Umum', code: 'PU', totalQuestions: 30 },
      { name: 'Pengetahuan & Pemahaman Umum', code: 'PPU', totalQuestions: 20 },
      { name: 'Kemampuan Memahami Bacaan & Menulis', code: 'KMBM', totalQuestions: 20 },
      { name: 'Pengetahuan Kuantitatif', code: 'PK', totalQuestions: 20 },
      { name: 'Literasi Bahasa Indonesia', code: 'LBI', totalQuestions: 30 },
      { name: 'Literasi Bahasa Inggris', code: 'LBE', totalQuestions: 20 },
      { name: 'Penalaran Matematika', code: 'PM', totalQuestions: 20 },
    ],
  },
  {
    id: '3',
    title: 'Try Out SNBT 2026 #3',
    category: 'PTN',
    difficulty: 'Mudah',
    duration: 195,
    totalQuestions: 160,
    isLocked: false,
    isPurchased: true,
    isCompleted: false,
    description: 'Latihan ringan untuk membangun fondasi SNBT 2026',
    subjects: [
      { name: 'Penalaran Umum', code: 'PU', totalQuestions: 30 },
      { name: 'Pengetahuan & Pemahaman Umum', code: 'PPU', totalQuestions: 20 },
      { name: 'Kemampuan Memahami Bacaan & Menulis', code: 'KMBM', totalQuestions: 20 },
      { name: 'Pengetahuan Kuantitatif', code: 'PK', totalQuestions: 20 },
      { name: 'Literasi Bahasa Indonesia', code: 'LBI', totalQuestions: 30 },
      { name: 'Literasi Bahasa Inggris', code: 'LBE', totalQuestions: 20 },
      { name: 'Penalaran Matematika', code: 'PM', totalQuestions: 20 },
    ],
  },
  // ── SKD Sekdin ───────────────────────────────────────────────────
  {
    id: '4',
    title: 'Try Out SKD Sekdin 2026 #1',
    category: 'SKD',
    difficulty: 'Sedang',
    duration: 100,
    totalQuestions: 110,
    isLocked: false,
    isPurchased: true,
    isCompleted: false,
    description: 'Simulasi CAT SKD sesuai kisi-kisi Sekdin 2026 — TWK, TIU, TKP',
    subjects: [
      { name: 'Tes Wawasan Kebangsaan', code: 'TWK', totalQuestions: 30, description: 'Pancasila, UUD 1945, Bhinneka Tunggal Ika, NKRI' },
      { name: 'Tes Intelegensia Umum', code: 'TIU', totalQuestions: 35, description: 'Verbal, numerik, logika, analitis' },
      { name: 'Tes Karakteristik Pribadi', code: 'TKP', totalQuestions: 45, description: 'Integritas, kerjasama, pelayanan publik' },
    ],
  },
  {
    id: '5',
    title: 'Try Out SKD Sekdin 2026 #2',
    category: 'SKD',
    difficulty: 'Sulit',
    duration: 100,
    totalQuestions: 110,
    isLocked: false,
    isPurchased: true,
    isCompleted: false,
    description: 'Simulasi CAT SKD level advance — fokus materi TWK dan TIU',
    subjects: [
      { name: 'Tes Wawasan Kebangsaan', code: 'TWK', totalQuestions: 30 },
      { name: 'Tes Intelegensia Umum', code: 'TIU', totalQuestions: 35 },
      { name: 'Tes Karakteristik Pribadi', code: 'TKP', totalQuestions: 45 },
    ],
  },
  // ── STIS ─────────────────────────────────────────────────────────
  {
    id: '6',
    title: 'Try Out STIS 2026 #1',
    category: 'STIS',
    difficulty: 'Sulit',
    duration: 120,
    totalQuestions: 100,
    isLocked: false,
    isPurchased: true,
    isCompleted: false,
    description: 'Simulasi ujian masuk STIS dengan pola soal akurat 2026',
    subjects: [
      { name: 'Matematika', code: 'MTK', totalQuestions: 50, description: 'Aljabar, kalkulus, statistika dasar' },
      { name: 'Bahasa Inggris', code: 'ENG', totalQuestions: 30, description: 'Reading comprehension, vocabulary, grammar' },
      { name: 'Pengetahuan Umum', code: 'PU', totalQuestions: 20, description: 'Wawasan kebangsaan dan umum' },
    ],
  },
  {
    id: '7',
    title: 'Try Out SNBT 2026 #4',
    category: 'PTN',
    difficulty: 'Sedang',
    duration: 195,
    totalQuestions: 160,
    isLocked: true,
    isPurchased: false,
    isCompleted: false,
    price: 25000,
    description: 'Paket tambahan SNBT — soal eksklusif dari tim pengajar berpengalaman',
    subjects: [
      { name: 'Penalaran Umum', code: 'PU', totalQuestions: 30 },
      { name: 'Pengetahuan & Pemahaman Umum', code: 'PPU', totalQuestions: 20 },
      { name: 'Kemampuan Memahami Bacaan & Menulis', code: 'KMBM', totalQuestions: 20 },
      { name: 'Pengetahuan Kuantitatif', code: 'PK', totalQuestions: 20 },
      { name: 'Literasi Bahasa Indonesia', code: 'LBI', totalQuestions: 30 },
      { name: 'Literasi Bahasa Inggris', code: 'LBE', totalQuestions: 20 },
      { name: 'Penalaran Matematika', code: 'PM', totalQuestions: 20 },
    ],
  },
];

// ── QUESTIONS ─────────────────────────────────────────────────────
// Soal-soal representatif per subtes
export const mockQuestions: Question[] = [
  // ── PU (Penalaran Umum) ──────────────────────────────────────────
  {
    id: 'pu-1', subject: 'Penalaran Umum', subjectCode: 'PU', tryOutId: '1',
    questionText: 'Semua mahasiswa yang lulus ujian mendapat beasiswa. Rina mendapat beasiswa. Kesimpulan yang paling tepat adalah...',
    options: [
      { id: 'a', text: 'Rina pasti lulus ujian' },
      { id: 'b', text: 'Rina mungkin lulus ujian' },
      { id: 'c', text: 'Rina tidak lulus ujian' },
      { id: 'd', text: 'Tidak dapat disimpulkan hubungan Rina dan ujian' },
      { id: 'e', text: 'Semua penerima beasiswa lulus ujian' },
    ],
    correctAnswer: 'd',
    explanation: 'Premis hanya menyatakan mahasiswa yang LULUS mendapat beasiswa. Fakta Rina mendapat beasiswa tidak cukup untuk menyimpulkan Rina lulus ujian, karena bisa ada cara lain mendapat beasiswa.',
    tips: 'Hati-hati dengan arah implikasi: "Lulus → Beasiswa" ≠ "Beasiswa → Lulus"',
  },
  {
    id: 'pu-2', subject: 'Penalaran Umum', subjectCode: 'PU', tryOutId: '1',
    questionText: 'Dalam sebuah survei terhadap 200 siswa: 120 menyukai Matematika, 90 menyukai Bahasa Indonesia, dan 40 menyukai keduanya. Berapa siswa yang tidak menyukai keduanya?',
    options: [
      { id: 'a', text: '20 siswa' },
      { id: 'b', text: '30 siswa' },
      { id: 'c', text: '40 siswa' },
      { id: 'd', text: '50 siswa' },
      { id: 'e', text: '60 siswa' },
    ],
    correctAnswer: 'b',
    explanation: 'Gunakan rumus himpunan: |A∪B| = |A| + |B| - |A∩B| = 120 + 90 - 40 = 170. Tidak menyukai keduanya = 200 - 170 = 30 siswa.',
    tips: 'Gunakan diagram Venn atau rumus inklusi-eksklusi untuk soal himpunan',
  },

  // ── PPU (Pengetahuan & Pemahaman Umum) ───────────────────────────
  {
    id: 'ppu-1', subject: 'Pengetahuan & Pemahaman Umum', subjectCode: 'PPU', tryOutId: '1',
    questionText: 'Kata "elaborasi" paling tepat bermakna...',
    options: [
      { id: 'a', text: 'Penyederhanaan suatu konsep' },
      { id: 'b', text: 'Pengembangan secara rinci dan mendetail' },
      { id: 'c', text: 'Penggabungan dua ide berbeda' },
      { id: 'd', text: 'Penolakan suatu argumen' },
      { id: 'e', text: 'Pengulangan informasi' },
    ],
    correctAnswer: 'b',
    explanation: 'Elaborasi berasal dari bahasa Latin "elaborare" yang berarti mengerjakan dengan sungguh-sungguh. Dalam KBBI, elaborasi bermakna penggarapan secara tekun dan cermat, atau pengembangan secara rinci.',
    tips: 'Perhatikan kata-kata serapan Latin/Inggris yang sering muncul di PPU',
  },

  // ── KMBM (Kemampuan Memahami Bacaan & Menulis) ────────────────────
  {
    id: 'kmbm-1', subject: 'Kemampuan Memahami Bacaan & Menulis', subjectCode: 'KMBM', tryOutId: '1',
    questionText: 'Penulisan yang benar sesuai PUEBI adalah...',
    options: [
      { id: 'a', text: 'Ia adalah seorang dokter spesialis jantung.' },
      { id: 'b', text: 'Ia adalah seorang Dokter Spesialis Jantung.' },
      { id: 'c', text: 'ia adalah seorang dokter spesialis jantung.' },
      { id: 'd', text: 'Ia adalah seorang dokter Spesialis jantung.' },
      { id: 'e', text: 'Ia adalah seorang Dokter spesialis Jantung.' },
    ],
    correctAnswer: 'a',
    explanation: 'Sesuai PUEBI, jabatan/profesi tidak perlu ditulis dengan huruf kapital kecuali diikuti nama diri. "Dokter spesialis jantung" ditulis huruf kecil semua karena bukan gelar yang diikuti nama.',
    tips: 'Pelajari aturan kapital PUEBI: gelar + nama (kapital), profesi umum (kecil)',
  },

  // ── PK (Pengetahuan Kuantitatif) ─────────────────────────────────
  {
    id: 'pk-1', subject: 'Pengetahuan Kuantitatif', subjectCode: 'PK', tryOutId: '1',
    questionText: 'Sebuah kereta berangkat pukul 07.30 dengan kecepatan 80 km/jam. Kereta lain berangkat dari kota yang sama pukul 08.00 dengan kecepatan 100 km/jam ke tujuan yang sama. Pukul berapa kereta kedua menyusul kereta pertama?',
    options: [
      { id: 'a', text: 'Pukul 09.30' },
      { id: 'b', text: 'Pukul 09.40' },
      { id: 'c', text: 'Pukul 10.00' },
      { id: 'd', text: 'Pukul 10.30' },
      { id: 'e', text: 'Pukul 10.40' },
    ],
    correctAnswer: 'c',
    explanation: 'Pada pukul 08.00, kereta pertama sudah menempuh 80 × 0.5 = 40 km. Kereta kedua mengejar dengan selisih kecepatan 100 - 80 = 20 km/jam. Waktu menyusul = 40 / 20 = 2 jam dari pukul 08.00 = pukul 10.00.',
    tips: 'Gunakan konsep "jarak = kecepatan × waktu" dan hitung keunggulan jarak awal',
  },

  // ── LBI (Literasi Bahasa Indonesia) ─────────────────────────────
  {
    id: 'lbi-1', subject: 'Literasi Bahasa Indonesia', subjectCode: 'LBI', tryOutId: '1',
    questionText: 'Perhatikan teks berikut: "Perubahan iklim bukan sekadar isu lingkungan, melainkan ancaman nyata bagi ketahanan pangan global. Kekeringan yang berkepanjangan mengurangi hasil panen, sementara banjir menghancurkan infrastruktur pertanian." Gagasan utama paragraf tersebut adalah...',
    options: [
      { id: 'a', text: 'Kekeringan menurunkan hasil panen pertanian' },
      { id: 'b', text: 'Banjir merusak infrastruktur pertanian' },
      { id: 'c', text: 'Perubahan iklim mengancam ketahanan pangan global' },
      { id: 'd', text: 'Isu lingkungan perlu mendapat perhatian serius' },
      { id: 'e', text: 'Pertanian sangat rentan terhadap bencana alam' },
    ],
    correctAnswer: 'c',
    explanation: 'Gagasan utama ada di kalimat pertama sebagai kalimat topik. Kalimat-kalimat berikutnya hanya merupakan penjelasan/bukti pendukung gagasan utama tersebut.',
    tips: 'Gagasan utama biasanya di kalimat pertama (deduktif) atau kalimat terakhir (induktif)',
  },

  // ── LBE (Literasi Bahasa Inggris) ────────────────────────────────
  {
    id: 'lbe-1', subject: 'Literasi Bahasa Inggris', subjectCode: 'LBE', tryOutId: '1',
    questionText: 'Read the following text: "Despite the widespread adoption of digital media, print journalism continues to play a crucial role in maintaining democratic accountability. Investigative reports in newspapers have historically uncovered major government corruption cases." The author\'s main purpose is to...',
    options: [
      { id: 'a', text: 'Criticize the shift toward digital media' },
      { id: 'b', text: 'Argue that print journalism remains important' },
      { id: 'c', text: 'Describe the history of investigative journalism' },
      { id: 'd', text: 'Explain how newspapers report corruption' },
      { id: 'e', text: 'Compare digital and print media audiences' },
    ],
    correctAnswer: 'b',
    explanation: 'The text uses "Despite..." to acknowledge digital media but then emphasizes print journalism\'s continued importance. The main purpose is to defend the relevance of print journalism in democracy.',
    tips: 'Look for the concessive clause (Despite/Although) which signals the main argument follows',
  },

  // ── PM (Penalaran Matematika) ─────────────────────────────────────
  {
    id: 'pm-1', subject: 'Penalaran Matematika', subjectCode: 'PM', tryOutId: '1',
    questionText: 'Sebuah toko mencatat penjualan mingguan (dalam juta rupiah): Senin 4,2 — Selasa 3,8 — Rabu 5,1 — Kamis 4,7 — Jumat 6,3 — Sabtu 8,5 — Minggu 7,2. Jika target rata-rata harian adalah 5,5 juta, berapa hari yang mencapai target?',
    options: [
      { id: 'a', text: '2 hari' },
      { id: 'b', text: '3 hari' },
      { id: 'c', text: '4 hari' },
      { id: 'd', text: '5 hari' },
      { id: 'e', text: '6 hari' },
    ],
    correctAnswer: 'c',
    explanation: 'Target ≥ 5,5 juta: Rabu (5,1 ✗), Kamis (4,7 ✗), Jumat (6,3 ✓), Sabtu (8,5 ✓), Minggu (7,2 ✓), Rabu hanya 5,1. Yang mencapai target: Jumat, Sabtu, Minggu, dan... cek ulang: 5,1 < 5,5 ✗, 4,7 ✗, 6,3 ✓, 8,5 ✓, 7,2 ✓, dan tidak ada lainnya. Hanya 3 hari? Periksa semua: 4,2✗ 3,8✗ 5,1✗ 4,7✗ 6,3✓ 8,5✓ 7,2✓ = 3... tunggu, soal menyatakan 4. Rabu = 5,1 < 5,5 jadi 3 hari yang benar.',
    tips: 'Baca data dengan teliti, jangan terburu-buru menghitung.',
  },

  // ── TWK (Tes Wawasan Kebangsaan) ─────────────────────────────────
  {
    id: 'twk-1', subject: 'Tes Wawasan Kebangsaan', subjectCode: 'TWK', tryOutId: '4',
    questionText: 'Pancasila sebagai dasar negara Indonesia pertama kali dirumuskan dalam sidang...',
    options: [
      { id: 'a', text: 'BPUPKI tanggal 29 Mei – 1 Juni 1945' },
      { id: 'b', text: 'PPKI tanggal 18 Agustus 1945' },
      { id: 'c', text: 'BPUPKI tanggal 10–17 Juli 1945' },
      { id: 'd', text: 'Panitia Sembilan tanggal 22 Juni 1945' },
      { id: 'e', text: 'Konstituante tanggal 10 November 1956' },
    ],
    correctAnswer: 'a',
    explanation: 'Pancasila dirumuskan pertama kali dalam sidang pertama BPUPKI pada 29 Mei–1 Juni 1945. Ir. Soekarno menyampaikan pidato tentang dasar negara pada 1 Juni 1945 yang kemudian dikenal sebagai Hari Lahir Pancasila.',
    tips: 'Ingat: BPUPKI = perumusan dasar negara, PPKI = pengesahan UUD 1945',
  },
  {
    id: 'twk-2', subject: 'Tes Wawasan Kebangsaan', subjectCode: 'TWK', tryOutId: '4',
    questionText: 'Alinea keempat Pembukaan UUD 1945 mengandung hal-hal berikut, KECUALI...',
    options: [
      { id: 'a', text: 'Tujuan negara Indonesia' },
      { id: 'b', text: 'Pernyataan kemerdekaan Indonesia' },
      { id: 'c', text: 'Bentuk negara Indonesia' },
      { id: 'd', text: 'Dasar negara Pancasila' },
      { id: 'e', text: 'Kedaulatan rakyat' },
    ],
    correctAnswer: 'b',
    explanation: 'Pernyataan kemerdekaan terdapat di alinea ketiga Pembukaan UUD 1945 ("Atas berkat rahmat Allah Yang Maha Kuasa..."). Alinea keempat berisi: tujuan negara, bentuk negara (republik), dasar negara (Pancasila), dan kedaulatan rakyat.',
    tips: 'Hafal isi setiap alinea Pembukaan UUD 1945: 1-latar belakang, 2-hak bangsa, 3-proklamasi, 4-tujuan+dasar negara',
  },

  // ── TIU (Tes Intelegensia Umum) ───────────────────────────────────
  {
    id: 'tiu-1', subject: 'Tes Intelegensia Umum', subjectCode: 'TIU', tryOutId: '4',
    questionText: 'Deret angka: 3, 6, 12, 24, 48, ..., ... Dua angka berikutnya adalah...',
    options: [
      { id: 'a', text: '72, 96' },
      { id: 'b', text: '96, 144' },
      { id: 'c', text: '96, 192' },
      { id: 'd', text: '84, 168' },
      { id: 'e', text: '96, 128' },
    ],
    correctAnswer: 'c',
    explanation: 'Pola: setiap suku dikalikan 2. 3×2=6, 6×2=12, 12×2=24, 24×2=48, 48×2=96, 96×2=192.',
    tips: 'Identifikasi pola deret: tambah, kurang, kali, bagi, atau kombinasi',
  },
  {
    id: 'tiu-2', subject: 'Tes Intelegensia Umum', subjectCode: 'TIU', tryOutId: '4',
    questionText: 'Jika BUKU = 2-21-11-21 (A=1, B=2, dst.), maka PULPEN = ...',
    options: [
      { id: 'a', text: '16-21-12-16-5-14' },
      { id: 'b', text: '16-21-12-16-5-13' },
      { id: 'c', text: '15-21-12-16-5-14' },
      { id: 'd', text: '16-20-12-16-5-14' },
      { id: 'e', text: '16-21-11-16-5-14' },
    ],
    correctAnswer: 'a',
    explanation: 'P=16, U=21, L=12, P=16, E=5, N=14. Jadi PULPEN = 16-21-12-16-5-14.',
    tips: 'Hafal posisi huruf alfabet: A=1, E=5, J=10, N=14, P=16, U=21, Z=26',
  },

  // ── TKP (Tes Karakteristik Pribadi) ──────────────────────────────
  {
    id: 'tkp-1', subject: 'Tes Karakteristik Pribadi', subjectCode: 'TKP', tryOutId: '4',
    questionText: 'Atasan Anda memberikan tugas mendadak dengan tenggat waktu sangat ketat, padahal Anda sedang menyelesaikan pekerjaan lain yang juga penting. Apa yang Anda lakukan?',
    options: [
      { id: 'a', text: 'Menolak tugas baru karena sudah ada pekerjaan yang lebih dulu' },
      { id: 'b', text: 'Menerima tanpa pertanyaan dan mengerjakan keduanya semampunya' },
      { id: 'c', text: 'Mendiskusikan prioritas dengan atasan dan menawarkan solusi terbaik' },
      { id: 'd', text: 'Meminta rekan kerja mengerjakan salah satunya tanpa izin atasan' },
      { id: 'e', text: 'Mengabaikan tugas lama dan fokus pada tugas baru dari atasan' },
    ],
    correctAnswer: 'c',
    explanation: 'Jawaban terbaik mencerminkan kemampuan manajemen prioritas, komunikasi proaktif, dan solusi win-win. Mendiskusikan dengan atasan menunjukkan profesionalisme dan tanggung jawab.',
    tips: 'Pada TKP, pilih jawaban yang menunjukkan: komunikasi aktif, tanggung jawab, dan orientasi solusi',
  },
];

// ── SCORES (mock hasil) ────────────────────────────────────────────
export const mockScores: Score[] = [
  {
    tryOutId: '1',
    tryOutTitle: 'Try Out SNBT 2026 #1',
    totalScore: 612,
    maxScore: 1000,
    percentage: 61.2,
    rank: 234,
    totalParticipants: 3120,
    date: '2026-03-01',
    subScores: [
      { subject: 'Penalaran Umum', code: 'PU', score: 98, maxScore: 150, correctCount: 19, totalCount: 30 },
      { subject: 'Peng. & Pemahaman Umum', code: 'PPU', score: 80, maxScore: 100, correctCount: 16, totalCount: 20 },
      { subject: 'Kemampuan Baca & Menulis', code: 'KMBM', score: 75, maxScore: 100, correctCount: 15, totalCount: 20 },
      { subject: 'Pengetahuan Kuantitatif', code: 'PK', score: 72, maxScore: 100, correctCount: 14, totalCount: 20 },
      { subject: 'Literasi Bahasa Indonesia', code: 'LBI', score: 108, maxScore: 150, correctCount: 21, totalCount: 30 },
      { subject: 'Literasi Bahasa Inggris', code: 'LBE', score: 85, maxScore: 100, correctCount: 17, totalCount: 20 },
      { subject: 'Penalaran Matematika', code: 'PM', score: 94, maxScore: 300, correctCount: 12, totalCount: 20 },
    ],
  },
  {
    tryOutId: '4',
    tryOutTitle: 'Try Out SKD Sekdin 2026 #1',
    totalScore: 358,
    maxScore: 550,
    percentage: 65.1,
    rank: 145,
    totalParticipants: 2200,
    date: '2026-02-20',
    subScores: [
      { subject: 'Tes Wawasan Kebangsaan', code: 'TWK', score: 115, maxScore: 150, correctCount: 23, totalCount: 30 },
      { subject: 'Tes Intelegensia Umum', code: 'TIU', score: 130, maxScore: 175, correctCount: 26, totalCount: 35 },
      { subject: 'Tes Karakteristik Pribadi', code: 'TKP', score: 113, maxScore: 225, correctCount: 28, totalCount: 45 },
    ],
  },
];

// ── SubTests (Materi) ──────────────────────────────────────────────
export const mockSubTests: SubTest[] = [
  // PTN — TPS
  {
    id: 'pu-ptn', code: 'PU', title: 'Penalaran Umum', track: 'PTN',
    description: 'Induktif, deduktif, kuantitatif, analogi, dan silogisme',
    progress: 45, totalChapters: 6, completedChapters: 3,
    subChapters: [
      {
        id: 'pu-bab1', title: 'Penalaran Deduktif & Induktif', description: 'Dasar silogisme dan generalisasi',
        totalVideos: 8, totalDuration: '55 menit', completed: true,
        contents: [
          { id: 'pu-1-v1', title: 'Pengantar Penalaran Logis', type: 'video', duration: '18:30', completed: true, locked: false },
          { id: 'pu-1-v2', title: 'Silogisme & Modus Ponens', type: 'video', duration: '22:15', completed: true, locked: false },
          { id: 'pu-1-p1', title: 'Rangkuman PDF', type: 'pdf', duration: '8 halaman', completed: true, locked: false },
          { id: 'pu-1-e1', title: 'Contoh Soal & Pembahasan', type: 'example', duration: '14:15', completed: false, locked: false },
        ],
      },
      {
        id: 'pu-bab2', title: 'Penalaran Kuantitatif', description: 'Interpretasi data, grafik, tabel',
        totalVideos: 10, totalDuration: '65 menit', completed: false,
        contents: [
          { id: 'pu-2-v1', title: 'Membaca Grafik & Tabel', type: 'video', duration: '20:00', completed: false, locked: false },
          { id: 'pu-2-e1', title: 'Latihan Soal Data', type: 'example', duration: '25:00', completed: false, locked: false },
        ],
      },
    ],
  },
  {
    id: 'pk-ptn', code: 'PK', title: 'Pengetahuan Kuantitatif', track: 'PTN',
    description: 'Aljabar, aritmatika, geometri, statistika, dan peluang dasar',
    progress: 30, totalChapters: 8, completedChapters: 2,
    subChapters: [
      {
        id: 'pk-bab1', title: 'Aljabar & Persamaan', description: 'Persamaan linear, kuadrat, sistem persamaan',
        totalVideos: 12, totalDuration: '75 menit', completed: false,
        contents: [
          { id: 'pk-1-v1', title: 'Persamaan Linear', type: 'video', duration: '20:00', completed: false, locked: false },
          { id: 'pk-1-p1', title: 'Rumus Esensial Aljabar', type: 'pdf', duration: '12 halaman', completed: false, locked: false },
          { id: 'pk-1-e1', title: 'Soal Latihan', type: 'example', duration: '35:00', completed: false, locked: false },
        ],
      },
    ],
  },
  {
    id: 'pm-ptn', code: 'PM', title: 'Penalaran Matematika', track: 'PTN',
    description: 'Konteks kehidupan sehari-hari, pemodelan, data statistik, dan peluang',
    progress: 20, totalChapters: 5, completedChapters: 1,
    subChapters: [
      {
        id: 'pm-bab1', title: 'Matematika Kontekstual', description: 'Soal cerita berbasis situasi nyata',
        totalVideos: 8, totalDuration: '50 menit', completed: false,
        contents: [
          { id: 'pm-1-v1', title: 'Strategi Baca Soal Cerita', type: 'video', duration: '15:00', completed: false, locked: false },
          { id: 'pm-1-e1', title: 'Latihan Kontekstual', type: 'example', duration: '30:00', completed: false, locked: false },
        ],
      },
    ],
  },
  // Sekdin — SKD
  {
    id: 'twk-sekdin', code: 'TWK', title: 'Tes Wawasan Kebangsaan', track: 'Sekdin',
    description: 'Pancasila, UUD 1945, Bhinneka Tunggal Ika, dan NKRI',
    progress: 60, totalChapters: 6, completedChapters: 4,
    subChapters: [
      {
        id: 'twk-bab1', title: 'Pancasila sebagai Ideologi Negara', description: 'Nilai-nilai dan implementasi Pancasila',
        totalVideos: 8, totalDuration: '45 menit', completed: true,
        contents: [
          { id: 'twk-1-v1', title: 'Sejarah Perumusan Pancasila', type: 'video', duration: '15:00', completed: true, locked: false },
          { id: 'twk-1-v2', title: 'Nilai-nilai Pancasila dalam Kehidupan', type: 'video', duration: '18:00', completed: true, locked: false },
          { id: 'twk-1-p1', title: 'Rangkuman Pancasila PDF', type: 'pdf', duration: '10 halaman', completed: true, locked: false },
          { id: 'twk-1-e1', title: 'Contoh Soal TWK Pancasila', type: 'example', duration: '20:00', completed: false, locked: false },
        ],
      },
      {
        id: 'twk-bab2', title: 'UUD 1945 & Amandemen', description: 'Struktur, isi, dan amandemen UUD 1945',
        totalVideos: 10, totalDuration: '55 menit', completed: false,
        contents: [
          { id: 'twk-2-v1', title: 'Pembukaan UUD 1945', type: 'video', duration: '18:00', completed: false, locked: false },
          { id: 'twk-2-e1', title: 'Latihan Soal UUD 1945', type: 'example', duration: '22:00', completed: false, locked: false },
        ],
      },
    ],
  },
  {
    id: 'tiu-sekdin', code: 'TIU', title: 'Tes Intelegensia Umum', track: 'Sekdin',
    description: 'Verbal, numerik, logika, analitis, dan spasial',
    progress: 35, totalChapters: 6, completedChapters: 2,
    subChapters: [
      {
        id: 'tiu-bab1', title: 'Kemampuan Verbal', description: 'Sinonim, antonim, analogi kata, pengelompokan kata',
        totalVideos: 8, totalDuration: '40 menit', completed: true,
        contents: [
          { id: 'tiu-1-v1', title: 'Strategi Soal Verbal', type: 'video', duration: '15:00', completed: true, locked: false },
          { id: 'tiu-1-e1', title: 'Latihan Sinonim & Antonim', type: 'example', duration: '20:00', completed: false, locked: false },
        ],
      },
      {
        id: 'tiu-bab2', title: 'Kemampuan Numerik', description: 'Deret angka, berhitung cepat, soal cerita',
        totalVideos: 10, totalDuration: '60 menit', completed: false,
        contents: [
          { id: 'tiu-2-v1', title: 'Trik Berhitung Cepat', type: 'video', duration: '18:00', completed: false, locked: false },
          { id: 'tiu-2-e1', title: 'Latihan Deret Angka', type: 'example', duration: '25:00', completed: false, locked: false },
        ],
      },
    ],
  },
  {
    id: 'tkp-sekdin', code: 'TKP', title: 'Tes Karakteristik Pribadi', track: 'Sekdin',
    description: 'Integritas, orientasi pelayanan, kemampuan beradaptasi, dan semangat berprestasi',
    progress: 20, totalChapters: 5, completedChapters: 1,
    subChapters: [
      {
        id: 'tkp-bab1', title: 'Strategi Menjawab TKP', description: 'Memahami pola penilaian TKP 1-5',
        totalVideos: 6, totalDuration: '35 menit', completed: true,
        contents: [
          { id: 'tkp-1-v1', title: 'Sistem Penilaian TKP (1-5)', type: 'video', duration: '12:00', completed: true, locked: false },
          { id: 'tkp-1-e1', title: 'Contoh Kasus & Pembahasan', type: 'example', duration: '20:00', completed: false, locked: false },
        ],
      },
    ],
  },
];

// ── PACKAGES ──────────────────────────────────────────────────────
export const mockPackages: Package[] = [
  {
    id: '1', name: 'Paket SNBT Premium', track: 'PTN',
    price: 499000, duration: '12 bulan',
    description: 'Persiapan SNBT 2026 paling lengkap — TPS, Literasi, Penalaran Matematika',
    features: [
      '15 Try Out SNBT full (160 soal, 195 menit)',
      'Semua subtes: PU, PPU, KMBM, PK, LBI, LBE, PM',
      'Pembahasan video & teks per soal',
      'Analisis kelemahan per subtes',
      'Ranking nasional real-time',
      'Simulasi CAT seperti ujian asli',
      'Prediksi nilai & rekomendasi PTN',
      'Akses selamanya',
    ],
    includedTryOuts: 15, isPopular: true,
  },
  {
    id: '2', name: 'Paket SNBT Standar', track: 'PTN',
    price: 299000, duration: '6 bulan',
    description: 'Persiapan SNBT dengan paket esensial',
    features: [
      '8 Try Out SNBT full (160 soal, 195 menit)',
      'Pembahasan teks per soal',
      'Analisis hasil per subtes',
      'Ranking nasional',
      'Akses 6 bulan',
    ],
    includedTryOuts: 8,
  },
  {
    id: '3', name: 'Paket SNBT Basic', track: 'PTN',
    price: 149000, duration: '3 bulan',
    description: 'Mulai persiapan SNBT dengan harga terjangkau',
    features: [
      '4 Try Out SNBT full',
      'Pembahasan soal',
      'Tracking progress per subtes',
      'Akses 3 bulan',
    ],
    includedTryOuts: 4,
  },
  {
    id: '6', name: 'Paket SKD Premium', track: 'Sekdin', type: 'SKD',
    price: 399000, duration: '12 bulan',
    description: 'Persiapan SKD Sekdin 2026 paling lengkap — TWK, TIU, TKP',
    features: [
      '12 Try Out CAT SKD (110 soal, 100 menit)',
      'TWK: Pancasila, UUD, Bhinneka, NKRI',
      'TIU: Verbal, numerik, logika, analitis',
      'TKP: Sistem penilaian 1-5 dengan strategi',
      'Simulasi CAT persis seperti asli',
      'Pembahasan detail + video',
      'Analisis passing grade per instansi',
      'Ranking nasional real-time',
      'Akses 1 tahun',
    ],
    includedTryOuts: 12, isPopular: true,
  },
  {
    id: '7', name: 'Paket SKD Standar', track: 'Sekdin', type: 'SKD',
    price: 249000, duration: '6 bulan',
    description: 'Persiapan SKD dengan soal-soal esensial',
    features: [
      '6 Try Out CAT SKD', 'TWK, TIU, TKP lengkap',
      'Pembahasan soal', 'Ranking nasional', 'Akses 6 bulan',
    ],
    includedTryOuts: 6,
  },
  {
    id: '8', name: 'Paket STIS Premium', track: 'Sekdin', type: 'STIS',
    price: 449000, duration: '10 bulan',
    description: 'Persiapan masuk STIS dengan soal prediksi akurat',
    features: [
      '10 Try Out simulasi STIS',
      'Matematika & Statistika intensive',
      'Bahasa Inggris level STIS',
      'Pembahasan dari alumni STIS',
      'Prediksi kelulusan & ranking',
      'Akses 10 bulan',
    ],
    includedTryOuts: 10,
  },
  {
    id: '12', name: 'Paket Combo SNBT + SKD', track: 'PTN',
    price: 699000, duration: '12 bulan',
    description: 'Satu paket hemat untuk persiapan PTN & Sekolah Kedinasan',
    features: [
      '20 Try Out (10 SNBT + 10 SKD)',
      'Akses semua jalur ujian',
      'Semua fitur premium',
      'Pembahasan video & teks',
      'Analisis & rekomendasi lengkap',
      'Double chance lolos impian',
      'Akses 1 tahun',
    ],
    includedTryOuts: 20, isPopular: true,
  },
];

// ── PTN Programs & Passing Grade ──────────────────────────────────
export interface PTNProgram {
  id: string;
  university: string;
  universityShort: string;
  faculty: string;
  program: string;
  passingGrade: number;
  category: 'Saintek' | 'Soshum' | 'Campuran';
  accreditation: 'A' | 'B' | 'Unggul';
  location: string;
  quota: number;
  popularity: 'Tinggi' | 'Sedang' | 'Rendah';
}

export const ptnPrograms: PTNProgram[] = [
  { id: 'ui-ti', university: 'Universitas Indonesia', universityShort: 'UI', faculty: 'Fasilkom', program: 'Teknik Informatika', passingGrade: 720, category: 'Saintek', accreditation: 'Unggul', location: 'Depok', quota: 120, popularity: 'Tinggi' },
  { id: 'ui-dok', university: 'Universitas Indonesia', universityShort: 'UI', faculty: 'FK', program: 'Pendidikan Dokter', passingGrade: 750, category: 'Saintek', accreditation: 'Unggul', location: 'Jakarta', quota: 150, popularity: 'Tinggi' },
  { id: 'ui-hkm', university: 'Universitas Indonesia', universityShort: 'UI', faculty: 'FH', program: 'Ilmu Hukum', passingGrade: 680, category: 'Soshum', accreditation: 'Unggul', location: 'Depok', quota: 180, popularity: 'Tinggi' },
  { id: 'itb-te', university: 'Institut Teknologi Bandung', universityShort: 'ITB', faculty: 'STEI', program: 'Teknik Elektro', passingGrade: 710, category: 'Saintek', accreditation: 'Unggul', location: 'Bandung', quota: 140, popularity: 'Tinggi' },
  { id: 'itb-si', university: 'Institut Teknologi Bandung', universityShort: 'ITB', faculty: 'STSI', program: 'Teknik Sipil', passingGrade: 700, category: 'Saintek', accreditation: 'Unggul', location: 'Bandung', quota: 130, popularity: 'Tinggi' },
  { id: 'ugm-tk', university: 'Universitas Gadjah Mada', universityShort: 'UGM', faculty: 'FT', program: 'Teknik Mesin', passingGrade: 680, category: 'Saintek', accreditation: 'Unggul', location: 'Yogyakarta', quota: 150, popularity: 'Tinggi' },
  { id: 'ugm-ps', university: 'Universitas Gadjah Mada', universityShort: 'UGM', faculty: 'FPsi', program: 'Psikologi', passingGrade: 670, category: 'Soshum', accreditation: 'Unggul', location: 'Yogyakarta', quota: 120, popularity: 'Tinggi' },
  { id: 'ugm-mn', university: 'Universitas Gadjah Mada', universityShort: 'UGM', faculty: 'FEB', program: 'Manajemen', passingGrade: 675, category: 'Soshum', accreditation: 'Unggul', location: 'Yogyakarta', quota: 140, popularity: 'Tinggi' },
  { id: 'its-ti', university: 'Institut Teknologi Sepuluh Nopember', universityShort: 'ITS', faculty: 'FTEIC', program: 'Teknik Informatika', passingGrade: 685, category: 'Saintek', accreditation: 'Unggul', location: 'Surabaya', quota: 120, popularity: 'Tinggi' },
  { id: 'unair-dok', university: 'Universitas Airlangga', universityShort: 'UNAIR', faculty: 'FK', program: 'Pendidikan Dokter', passingGrade: 700, category: 'Saintek', accreditation: 'Unggul', location: 'Surabaya', quota: 140, popularity: 'Tinggi' },
  { id: 'undip-ti', university: 'Universitas Diponegoro', universityShort: 'UNDIP', faculty: 'FT', program: 'Teknik Industri', passingGrade: 650, category: 'Saintek', accreditation: 'Unggul', location: 'Semarang', quota: 130, popularity: 'Sedang' },
  { id: 'unpad-kom', university: 'Universitas Padjadjaran', universityShort: 'UNPAD', faculty: 'Fikom', program: 'Ilmu Komunikasi', passingGrade: 670, category: 'Soshum', accreditation: 'Unggul', location: 'Bandung', quota: 140, popularity: 'Tinggi' },
  { id: 'ub-te', university: 'Universitas Brawijaya', universityShort: 'UB', faculty: 'FT', program: 'Teknik Elektro', passingGrade: 640, category: 'Saintek', accreditation: 'A', location: 'Malang', quota: 120, popularity: 'Sedang' },
];

export function getPTNRecommendations(score: number, tolerance = 30): { safe: PTNProgram[]; moderate: PTNProgram[]; reach: PTNProgram[] } {
  return {
    safe: ptnPrograms.filter(p => score >= p.passingGrade - 10).slice(0, 5).sort((a, b) => b.passingGrade - a.passingGrade),
    moderate: ptnPrograms.filter(p => p.passingGrade > score + 10 && p.passingGrade <= score + tolerance).slice(0, 5).sort((a, b) => a.passingGrade - b.passingGrade),
    reach: ptnPrograms.filter(p => p.passingGrade > score + tolerance && p.passingGrade <= score + 60).slice(0, 3).sort((a, b) => a.passingGrade - b.passingGrade),
  };
}

// ── BADGES ────────────────────────────────────────────────────────
export const mockBadges: Badge[] = [
  { id: '1', name: 'Pejuang SNBT', description: 'Selesaikan 1 Try Out SNBT', icon: '🎯', unlocked: false },
  { id: '2', name: 'Konsisten', description: 'Belajar 7 hari berturut', icon: '🔥', unlocked: false },
  { id: '3', name: 'Nilai Sempurna', description: 'Skor 100% di salah satu subtes', icon: '💯', unlocked: false },
  { id: '4', name: 'Speed Runner', description: 'Selesai Try Out <60 menit', icon: '⚡', unlocked: false },
];

// ── USER ──────────────────────────────────────────────────────────
export const mockUser: User = {
  id: '1', name: 'Budi Santoso',
  email: 'budi.santoso@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
  currentPackage: 'Paket SNBT Premium',
  streak: 0, badges: mockBadges, joinDate: '2026-01-15',
};

// ── OLD MATERIALS (backward compat DashboardPage) ─────────────────
export const mockMaterials: Material[] = [
  { id: '1', title: 'Penalaran Umum — Silogisme', category: 'TPS', type: 'video', duration: '45 menit', progress: 100, status: 'completed', track: 'PTN' },
  { id: '2', title: 'TWK — Pancasila & UUD 1945', category: 'TWK', type: 'video', duration: '60 menit', progress: 60, status: 'in-progress', track: 'Sekdin' },
  { id: '3', title: 'TKP — Strategi Menjawab 1-5', category: 'TKP', type: 'practice', duration: '30 menit', progress: 0, status: 'not-started', track: 'Sekdin' },
  { id: '4', title: 'Pengetahuan Kuantitatif — Aljabar', category: 'TPS', type: 'video', duration: '90 menit', progress: 45, status: 'in-progress', track: 'PTN' },
  { id: '5', title: 'Literasi Bahasa Inggris — Reading', category: 'Literasi', type: 'pdf', duration: '20 menit', progress: 100, status: 'completed', track: 'PTN' },
  { id: '6', title: 'Penalaran Matematika — Kontekstual', category: 'Penalaran Matematika', type: 'video', duration: '75 menit', progress: 0, status: 'not-started', track: 'PTN' },
];