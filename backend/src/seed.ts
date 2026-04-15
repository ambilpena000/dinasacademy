import { DataSource } from 'typeorm';
import { Tryout } from './tryouts/tryout.entity';
import { Question } from './questions/question.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Maslangg06',
  database: 'dinasacademy',   // ← pastikan ini 'dinasacademy', bukan 'postgres'
  entities: [Tryout, Question],
  synchronize: true,
});

type TryoutSeed = Omit<Tryout, 'id' | 'createdAt' | 'updatedAt'> & {
  subjects: {
    code: string;
    name: string;
    totalQ: number;
  }[];
};

const TRYOUTS: TryoutSeed[] = [
  {
    title: 'Try Out SNBT 2026 #1',
    description:
      'Simulasi lengkap SNBT 2026 — TPS, Literasi, dan Penalaran Matematika',
    category: 'PTN',
    difficulty: 'Sedang',
    duration: 195,
    totalQuestions: 160,
    isActive: true,
    isLocked: false,
    subjects: [
      { code: 'PU', name: 'Penalaran Umum', totalQ: 30 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', totalQ: 20 },
      { code: 'KMBM', name: 'Kemampuan Memahami Bacaan & Menulis', totalQ: 20 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', totalQ: 20 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', totalQ: 30 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', totalQ: 20 },
      { code: 'PM', name: 'Penalaran Matematika', totalQ: 20 },
    ],
  },
  {
    title: 'Try Out SNBT 2026 #2',
    description: 'Simulasi SNBT level advance dengan soal prediktif 2026',
    category: 'PTN',
    difficulty: 'Sulit',
    duration: 195,
    totalQuestions: 160,
    isActive: true,
    isLocked: false,
    subjects: [
      { code: 'PU', name: 'Penalaran Umum', totalQ: 30 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', totalQ: 20 },
      { code: 'KMBM', name: 'Kemampuan Memahami Bacaan & Menulis', totalQ: 20 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', totalQ: 20 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', totalQ: 30 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', totalQ: 20 },
      { code: 'PM', name: 'Penalaran Matematika', totalQ: 20 },
    ],
  },
  {
    title: 'Try Out SNBT 2026 #3',
    description: 'Latihan ringan untuk membangun fondasi SNBT 2026',
    category: 'PTN',
    difficulty: 'Mudah',
    duration: 195,
    totalQuestions: 160,
    isActive: true,
    isLocked: false,
    subjects: [
      { code: 'PU', name: 'Penalaran Umum', totalQ: 30 },
      { code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', totalQ: 20 },
      { code: 'KMBM', name: 'Kemampuan Memahami Bacaan & Menulis', totalQ: 20 },
      { code: 'PK', name: 'Pengetahuan Kuantitatif', totalQ: 20 },
      { code: 'LBI', name: 'Literasi Bahasa Indonesia', totalQ: 30 },
      { code: 'LBE', name: 'Literasi Bahasa Inggris', totalQ: 20 },
      { code: 'PM', name: 'Penalaran Matematika', totalQ: 20 },
    ],
  },
  {
    title: 'Try Out SKD Sekdin 2026 #1',
    description: 'Simulasi CAT SKD sesuai kisi-kisi Sekdin 2026',
    category: 'SKD',
    difficulty: 'Sedang',
    duration: 100,
    totalQuestions: 110,
    isActive: true,
    isLocked: false,
    subjects: [
      { code: 'TWK', name: 'Tes Wawasan Kebangsaan', totalQ: 30 },
      { code: 'TIU', name: 'Tes Intelegensia Umum', totalQ: 35 },
      { code: 'TKP', name: 'Tes Karakteristik Pribadi', totalQ: 45 },
    ],
  },
  {
    title: 'Try Out SKD Sekdin 2026 #2',
    description: 'Simulasi CAT SKD level advance',
    category: 'SKD',
    difficulty: 'Sulit',
    duration: 100,
    totalQuestions: 110,
    isActive: true,
    isLocked: false,
    subjects: [
      { code: 'TWK', name: 'Tes Wawasan Kebangsaan', totalQ: 30 },
      { code: 'TIU', name: 'Tes Intelegensia Umum', totalQ: 35 },
      { code: 'TKP', name: 'Tes Karakteristik Pribadi', totalQ: 45 },
    ],
  },
  {
    title: 'Try Out STIS 2026 #1',
    description: 'Simulasi ujian masuk STIS 2026',
    category: 'STIS',
    difficulty: 'Sulit',
    duration: 120,
    totalQuestions: 100,
    isActive: true,
    isLocked: false,
    subjects: [
      { code: 'MTK', name: 'Matematika', totalQ: 50 },
      { code: 'ENG', name: 'Bahasa Inggris', totalQ: 30 },
      { code: 'PU', name: 'Pengetahuan Umum', totalQ: 20 },
    ],
  },
];

const QUESTION_BANK: Record<string, any[]> = {
  PU: [
    {
      text: 'Semua A adalah B. Sebagian B adalah C. Maka...',
      options: [
        'Semua A adalah C',
        'Sebagian A mungkin C',
        'Tidak ada A yang C',
        'Semua C adalah A',
      ],
      answer: 'b',
      explanation:
        'Dari premis tersebut hanya dapat disimpulkan sebagian A mungkin C.',
    },
    {
      text: 'Jika P maka Q. Jika Q maka R. Jika P, maka...',
      options: ['Q saja', 'R saja', 'Q dan R', 'Tidak ada kesimpulan'],
      answer: 'c',
      explanation: 'Rantai silogisme: P→Q dan Q→R, maka P→Q dan R.',
    },
    {
      text: 'Deret: 2, 4, 8, 16, ... Selanjutnya?',
      options: ['24', '32', '30', '28'],
      answer: 'b',
      explanation: 'Pola geometri dengan rasio 2. 16×2=32.',
    },
    {
      text: 'Jika 2x + 4 = 12, maka x adalah...',
      options: ['3', '4', '5', '6'],
      answer: 'b',
      explanation: '2x = 12 - 4 = 8, x = 4.',
    },
    {
      text: 'Tidak ada A yang B. Semua C adalah A. Maka...',
      options: [
        'Tidak ada C yang B',
        'Semua C adalah B',
        'Sebagian C adalah B',
        'Semua A adalah C',
      ],
      answer: 'a',
      explanation:
        'Karena semua C adalah A, dan tidak ada A yang B, maka tidak ada C yang B.',
    },
  ],
  PPU: [
    {
      text: 'Ibu kota baru Indonesia adalah...',
      options: ['Jakarta', 'Surabaya', 'Nusantara', 'Balikpapan'],
      answer: 'c',
      explanation:
        'Ibu kota baru Indonesia adalah Nusantara di Kalimantan Timur.',
    },
    {
      text: 'Presiden pertama Indonesia adalah...',
      options: ['Soeharto', 'Soekarno', 'Habibie', 'Wahid'],
      answer: 'b',
      explanation: 'Ir. Soekarno adalah presiden pertama Indonesia.',
    },
    {
      text: 'Bahasa kerja resmi ASEAN adalah...',
      options: [
        'Bahasa Indonesia',
        'Bahasa Inggris',
        'Bahasa Melayu',
        'Bahasa Mandarin',
      ],
      answer: 'b',
      explanation: 'Bahasa Inggris adalah bahasa kerja resmi ASEAN.',
    },
    {
      text: 'Proklamasi kemerdekaan Indonesia dibacakan pada...',
      options: [
        '17 Agustus 1944',
        '17 Agustus 1945',
        '18 Agustus 1945',
        '17 Agustus 1946',
      ],
      answer: 'b',
      explanation:
        'Proklamasi kemerdekaan Indonesia dibacakan pada 17 Agustus 1945.',
    },
    {
      text: 'Organisasi perdagangan dunia dikenal dengan singkatan...',
      options: ['WHO', 'IMF', 'WTO', 'UNESCO'],
      answer: 'c',
      explanation:
        'WTO (World Trade Organization) adalah organisasi perdagangan dunia.',
    },
  ],
  KMBM: [
    {
      text: 'Kata "proliferasi" berarti...',
      options: ['Pengurangan', 'Penyebaran cepat', 'Peningkatan', 'Pembatasan'],
      answer: 'b',
      explanation:
        'Proliferasi berarti penyebaran atau perkembangbiakan yang cepat.',
    },
    {
      text: 'Penulisan yang benar adalah...',
      options: ['di rumah', 'Dirumah', 'Di-rumah', 'di-Rumah'],
      answer: 'a',
      explanation: '"di" sebagai kata depan ditulis terpisah.',
    },
    {
      text: 'Antonim dari "eksplisit" adalah...',
      options: ['Jelas', 'Nyata', 'Implisit', 'Gamblang'],
      answer: 'c',
      explanation:
        'Antonim eksplisit adalah implisit (tersirat, tidak langsung).',
    },
    {
      text: 'Kalimat efektif yang benar adalah...',
      options: [
        'Para hadirin semuanya',
        'Para hadirin',
        'Semua hadirin semuanya',
        'Seluruh para hadirin',
      ],
      answer: 'b',
      explanation: '"Para" sudah bermakna jamak, tidak perlu ditambah "semua".',
    },
    {
      text: 'Makna konotasi positif dari kata "pejuang" adalah...',
      options: [
        'Orang yang suka berkelahi',
        'Orang yang berjuang keras',
        'Orang yang keras kepala',
        'Orang yang agresif',
      ],
      answer: 'b',
      explanation:
        'Konotasi positif "pejuang" adalah seseorang yang gigih berjuang.',
    },
  ],
  PK: [
    {
      text: 'Jika 3x + 5 = 20, maka nilai x adalah...',
      options: ['3', '4', '5', '6'],
      answer: 'c',
      explanation: '3x = 15, x = 5.',
    },
    {
      text: 'Luas lingkaran dengan jari-jari 7 cm adalah...',
      options: ['44 cm²', '154 cm²', '22 cm²', '308 cm²'],
      answer: 'b',
      explanation: 'L = π × r² = 22/7 × 49 = 154 cm².',
    },
    {
      text: 'Persentase 45 dari 180 adalah...',
      options: ['20%', '25%', '30%', '35%'],
      answer: 'b',
      explanation: '(45/180) × 100 = 25%.',
    },
    {
      text: 'FPB dari 24 dan 36 adalah...',
      options: ['6', '8', '12', '18'],
      answer: 'c',
      explanation:
        'Faktor 24: 1,2,3,4,6,8,12,24. Faktor 36: 1,2,3,4,6,9,12,18,36. FPB = 12.',
    },
    {
      text: 'Jika harga barang naik 20% menjadi Rp 120.000, harga awalnya adalah...',
      options: ['Rp 90.000', 'Rp 96.000', 'Rp 100.000', 'Rp 110.000'],
      answer: 'c',
      explanation: 'Harga awal = 120.000 / 1.2 = 100.000.',
    },
  ],
  LBI: [
    {
      text: 'Makna kata "signifikan" adalah...',
      options: ['Kecil', 'Penting/berarti', 'Biasa', 'Tidak jelas'],
      answer: 'b',
      explanation: 'Signifikan berarti penting atau bermakna.',
    },
    {
      text: 'Antonim dari kata "antagonis" adalah...',
      options: ['Musuh', 'Lawan', 'Protagonis', 'Villain'],
      answer: 'c',
      explanation: 'Antonim antagonis adalah protagonis.',
    },
    {
      text: 'Ide pokok paragraf terdapat pada...',
      options: [
        'Kalimat pertama saja',
        'Kalimat terakhir saja',
        'Kalimat utama',
        'Semua kalimat',
      ],
      answer: 'c',
      explanation:
        'Ide pokok terdapat pada kalimat utama yang bisa di awal atau akhir.',
    },
    {
      text: 'Kata baku dari "ijin" adalah...',
      options: ['ijin', 'izin', 'idzin', 'izen'],
      answer: 'b',
      explanation: 'Kata baku yang benar adalah "izin" sesuai KBBI.',
    },
    {
      text: 'Penggunaan tanda koma yang benar adalah...',
      options: [
        'Saya suka makan, nasi goreng',
        'Dia datang, kemudian pergi',
        'Tolong, ambilkan buku itu',
        'Hari ini, cerah sekali',
      ],
      answer: 'c',
      explanation: 'Tanda koma digunakan setelah kata seru atau seruan.',
    },
  ],
  LBE: [
    {
      text: 'The word "benevolent" most nearly means...',
      options: ['Kind', 'Cruel', 'Strict', 'Lazy'],
      answer: 'a',
      explanation: 'Benevolent means well-meaning and kindly.',
    },
    {
      text: 'Choose the correct sentence:',
      options: [
        "She don't like apples",
        "She doesn't likes apples",
        "She doesn't like apples",
        'She not like apples',
      ],
      answer: 'c',
      explanation: 'With she/he/it, use "doesn\'t" + base verb.',
    },
    {
      text: 'The antonym of "OBSOLETE" is...',
      options: ['Old', 'Modern', 'Ancient', 'Outdated'],
      answer: 'b',
      explanation: 'Obsolete means outdated; antonym is modern.',
    },
    {
      text: '"Despite" is most similar in meaning to...',
      options: ['Because of', 'In spite of', 'Due to', 'As a result of'],
      answer: 'b',
      explanation: 'Despite and in spite of both mean notwithstanding.',
    },
    {
      text: 'The passive form of "They built the house" is...',
      options: [
        'The house is building',
        'The house was built',
        'The house has built',
        'The house built',
      ],
      answer: 'b',
      explanation: 'Passive past: was/were + past participle.',
    },
  ],
  PM: [
    {
      text: 'Fungsi f(x) = 2x² - 3x + 1. Nilai f(2) adalah...',
      options: ['3', '4', '5', '6'],
      answer: 'a',
      explanation: 'f(2) = 2(4) - 3(2) + 1 = 8 - 6 + 1 = 3.',
    },
    {
      text: 'Limit x→2 dari (x²-4)/(x-2) adalah...',
      options: ['2', '4', '0', 'Tidak ada'],
      answer: 'b',
      explanation: '(x+2)(x-2)/(x-2) = x+2. Saat x=2: 4.',
    },
    {
      text: 'Turunan dari f(x) = x³ - 2x adalah...',
      options: ['3x² - 2', '3x²', 'x² - 2', '3x - 2'],
      answer: 'a',
      explanation: "f'(x) = 3x² - 2.",
    },
    {
      text: 'Nilai dari ∫₀² 2x dx adalah...',
      options: ['2', '4', '6', '8'],
      answer: 'b',
      explanation: '[x²]₀² = 4 - 0 = 4.',
    },
    {
      text: 'Persamaan garis melalui (1,2) dengan gradien 3 adalah...',
      options: ['y = 3x - 1', 'y = 3x + 1', 'y = 3x', 'y = x + 3'],
      answer: 'a',
      explanation: 'y - 2 = 3(x-1) → y = 3x - 1.',
    },
  ],
  TWK: [
    {
      text: 'Pancasila tercantum dalam...',
      options: [
        'Batang Tubuh UUD 1945',
        'Pembukaan UUD 1945',
        'Penjelasan UUD 1945',
        'TAP MPR',
      ],
      answer: 'b',
      explanation:
        'Pancasila tercantum dalam Pembukaan UUD 1945 alinea keempat.',
    },
    {
      text: 'Bhinneka Tunggal Ika dari kitab...',
      options: ['Ramayana', 'Mahabharata', 'Sutasoma', 'Negarakertagama'],
      answer: 'c',
      explanation: 'Dari Kitab Sutasoma karangan Mpu Tantular.',
    },
    {
      text: 'Sistem pemerintahan Indonesia adalah...',
      options: ['Parlementer', 'Presidensial', 'Monarki', 'Federal'],
      answer: 'b',
      explanation: 'Indonesia menganut sistem presidensial.',
    },
    {
      text: 'UUD 1945 disahkan pada...',
      options: [
        '17 Agustus 1945',
        '18 Agustus 1945',
        '1 Juni 1945',
        '22 Juni 1945',
      ],
      answer: 'b',
      explanation: 'UUD 1945 disahkan oleh PPKI pada 18 Agustus 1945.',
    },
    {
      text: 'Lambang negara Indonesia adalah...',
      options: ['Garuda Pancasila', 'Burung Cendrawasih', 'Komodo', 'Harimau'],
      answer: 'a',
      explanation: 'Garuda Pancasila adalah lambang negara Indonesia.',
    },
  ],
  TIU: [
    {
      text: 'Sinonim "KOMPETEN" adalah...',
      options: ['Mampu', 'Lemah', 'Pasif', 'Kaku'],
      answer: 'a',
      explanation: 'Kompeten = cakap/mampu.',
    },
    {
      text: 'BUKU : PERPUSTAKAAN = PESAWAT : ...',
      options: ['Bandara', 'Pilot', 'Terbang', 'Langit'],
      answer: 'a',
      explanation: 'Buku di perpustakaan, pesawat di bandara.',
    },
    {
      text: '5, 10, 20, 40, ... Lanjutannya?',
      options: ['60', '80', '70', '100'],
      answer: 'b',
      explanation: 'Geometri rasio 2. 40×2=80.',
    },
    {
      text: 'Jika MEJA = CHAIR, maka KURSI = ...',
      options: ['TABLE', 'DESK', 'BED', 'SOFA'],
      answer: 'a',
      explanation: 'MEJA artinya TABLE (bukan CHAIR), jadi KURSI = CHAIR.',
    },
    {
      text: 'Antonim GIGIH adalah...',
      options: ['Tekun', 'Malas', 'Rajin', 'Ulet'],
      answer: 'b',
      explanation: 'Antonim gigih (tekun/ulet) adalah malas.',
    },
  ],
  TKP: [
    {
      text: 'Rekan kerja berbuat kesalahan. Sikap Anda?',
      options: [
        'Lapor atasan tanpa diskusi',
        'Biarkan saja',
        'Bicarakan secara pribadi',
        'Permalukan di depan tim',
      ],
      answer: 'c',
      explanation:
        'Komunikasi langsung menjaga hubungan dan menyelesaikan masalah.',
    },
    {
      text: 'Mendapat tugas mendadak saat akan pulang. Sikap Anda?',
      options: [
        'Menolak',
        'Menerima dan selesaikan',
        'Mengerjakan terpaksa',
        'Minta orang lain',
      ],
      answer: 'b',
      explanation: 'ASN yang baik mengedepankan tanggung jawab.',
    },
    {
      text: 'Cara terbaik meningkatkan kualitas kerja?',
      options: [
        'Bekerja lebih lama',
        'Belajar dari kesalahan',
        'Meniru rekan',
        'Menunggu pelatihan',
      ],
      answer: 'b',
      explanation: 'Evaluasi dari kesalahan adalah kunci peningkatan.',
    },
    {
      text: 'Ada konflik dengan rekan kerja. Yang Anda lakukan?',
      options: [
        'Diam saja',
        'Diskusi mencari solusi',
        'Lapor HR',
        'Hindari rekan tersebut',
      ],
      answer: 'b',
      explanation:
        'Diskusi konstruktif adalah cara terbaik menyelesaikan konflik.',
    },
    {
      text: 'Target kerja tidak tercapai. Sikap Anda?',
      options: [
        'Menyalahkan kondisi',
        'Evaluasi dan perbaiki',
        'Mengabaikan',
        'Minta perpanjangan terus',
      ],
      answer: 'b',
      explanation: 'Evaluasi dan perbaikan diri adalah sikap profesional.',
    },
  ],
  MTK: [
    {
      text: 'Determinan [[2,1],[3,4]] adalah...',
      options: ['5', '8', '11', '-5'],
      answer: 'a',
      explanation: 'Det = (2×4)-(1×3) = 5.',
    },
    {
      text: 'Turunan f(x) = x³ - 2x adalah...',
      options: ['3x² - 2', '3x²', 'x² - 2', '3x - 2'],
      answer: 'a',
      explanation: "f'(x) = 3x² - 2.",
    },
    {
      text: 'log₂(64) adalah...',
      options: ['4', '5', '6', '7'],
      answer: 'c',
      explanation: '2⁶ = 64.',
    },
    {
      text: 'Nilai sin(30°) adalah...',
      options: ['0', '0.5', '√2/2', '1'],
      answer: 'b',
      explanation: 'sin(30°) = 1/2 = 0.5.',
    },
    {
      text: 'Integral ∫ 3x² dx adalah...',
      options: ['x³ + C', '6x + C', '3x + C', 'x² + C'],
      answer: 'a',
      explanation: '∫3x² dx = 3(x³/3) + C = x³ + C.',
    },
  ],
  ENG: [
    {
      text: 'Synonym of "ELOQUENT" is...',
      options: ['Silent', 'Articulate', 'Confused', 'Shy'],
      answer: 'b',
      explanation: 'Eloquent = well-spoken/articulate.',
    },
    {
      text: 'If I _____ rich, I would travel.',
      options: ['am', 'was', 'were', 'be'],
      answer: 'c',
      explanation: 'Conditional type 2: were for all subjects.',
    },
    {
      text: 'Antonym of "OBSOLETE" is...',
      options: ['Old', 'Modern', 'Ancient', 'Outdated'],
      answer: 'b',
      explanation: 'Obsolete = outdated, antonym = modern.',
    },
    {
      text: '"Despite" means...',
      options: ['Because of', 'In spite of', 'Due to', 'As a result'],
      answer: 'b',
      explanation: 'Despite = in spite of.',
    },
    {
      text: 'The passive of "They built the house" is...',
      options: [
        'The house is building',
        'The house was built',
        'The house has built',
        'The house built',
      ],
      answer: 'b',
      explanation: 'Passive past: was + past participle.',
    },
  ],
};

async function seed() {
  console.log('🌱 Mulai seeding database...');
  await AppDataSource.initialize();
  console.log('✅ Terhubung ke database');

  const tryoutRepo = AppDataSource.getRepository<Tryout>(Tryout);
  const questionRepo = AppDataSource.getRepository(Question);

  await questionRepo.clear();
  await tryoutRepo.clear();
  console.log('🗑️  Data lama dihapus');

  let totalQuestions = 0;

  for (const data of TRYOUTS) {
    const { subjects, ...tryoutData } = data;
    const tryout = tryoutRepo.create(tryoutData);
    const saved = await tryoutRepo.save(tryout);

console.log(`📝 ${saved.title}`);

    const questions: Partial<Question>[] = [];
    let orderIndex = 0;

    subjects.forEach((sub: any) => {
      const bank = QUESTION_BANK[sub.code] || QUESTION_BANK['PU'];
      for (let i = 0; i < sub.totalQ; i++) {
        const q = bank[i % bank.length];
        questions.push({
          tryoutId: saved.id,
          subtestCode: sub.code,
          subtestName: sub.name,
          questionText: `${q.text}`,
          optionA: q.options[0],
          optionB: q.options[1],
          optionC: q.options[2],
          optionD: q.options[3],
          optionE: '',
          correctAnswer: q.answer,
          explanation: q.explanation,
          orderIndex: orderIndex++,
        });
      }
    });

    await questionRepo.save(questions.map((q) => questionRepo.create(q)));
    totalQuestions += questions.length;
    console.log(`   └─ ${questions.length} soal`);
  }

  console.log(
    `\n✅ Selesai! ${TRYOUTS.length} try out, ${totalQuestions} soal`,
  );
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Gagal:', err.message);
  process.exit(1);
});
