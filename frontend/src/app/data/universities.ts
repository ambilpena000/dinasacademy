// ================================================================
// universities.ts — Dinas Academy
// Data PTN & Program Studi Indonesia
// Sumber: Pengetahuan umum + struktur PDDikti
// Catatan: Passing grade adalah estimasi kasar, BUKAN data resmi
// Update data dari: pddikti.kemdiktisaintek.go.id
// ================================================================

export interface Program {
  id: string;
  name: string;
  faculty: string;
  category: 'Saintek' | 'Soshum' | 'Campuran';
  // Estimasi kasar passing grade SNBT (dari 1000)
  // ⚠️ BUKAN angka resmi — hanya untuk gambaran relatif
  estimatedPassingGrade?: number;
}

export interface University {
  id: string;
  name: string;
  short: string;
  location: string;
  province: string;
  accreditation: 'Unggul' | 'A' | 'B';
  type: 'PTN' | 'PTN-BH' | 'PTN-BLU';
  programs: Program[];
}

export const universities: University[] = [
  // ── Universitas Indonesia ────────────────────────────────────────
  {
    id: 'UI', name: 'Universitas Indonesia', short: 'UI',
    location: 'Depok, Jawa Barat', province: 'Jawa Barat',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UI-TI',  name: 'Teknik Informatika',       faculty: 'Fasilkom',  category: 'Saintek', estimatedPassingGrade: 715 },
      { id: 'UI-SI',  name: 'Sistem Informasi',          faculty: 'Fasilkom',  category: 'Saintek', estimatedPassingGrade: 700 },
      { id: 'UI-DK',  name: 'Pendidikan Dokter',         faculty: 'FK',        category: 'Saintek', estimatedPassingGrade: 745 },
      { id: 'UI-FRM', name: 'Farmasi',                   faculty: 'FF',        category: 'Saintek', estimatedPassingGrade: 685 },
      { id: 'UI-TK',  name: 'Teknik Kimia',              faculty: 'FT',        category: 'Saintek', estimatedPassingGrade: 670 },
      { id: 'UI-TS',  name: 'Teknik Sipil',              faculty: 'FT',        category: 'Saintek', estimatedPassingGrade: 665 },
      { id: 'UI-TM',  name: 'Teknik Mesin',              faculty: 'FT',        category: 'Saintek', estimatedPassingGrade: 660 },
      { id: 'UI-TE',  name: 'Teknik Elektro',            faculty: 'FT',        category: 'Saintek', estimatedPassingGrade: 690 },
      { id: 'UI-MA',  name: 'Matematika',                faculty: 'FMIPA',     category: 'Saintek', estimatedPassingGrade: 640 },
      { id: 'UI-FIS', name: 'Fisika',                    faculty: 'FMIPA',     category: 'Saintek', estimatedPassingGrade: 630 },
      { id: 'UI-HK',  name: 'Ilmu Hukum',               faculty: 'FH',        category: 'Soshum',  estimatedPassingGrade: 675 },
      { id: 'UI-AK',  name: 'Akuntansi',                faculty: 'FEB',       category: 'Soshum',  estimatedPassingGrade: 685 },
      { id: 'UI-MN',  name: 'Manajemen',                faculty: 'FEB',       category: 'Soshum',  estimatedPassingGrade: 680 },
      { id: 'UI-IE',  name: 'Ilmu Ekonomi',             faculty: 'FEB',       category: 'Soshum',  estimatedPassingGrade: 670 },
      { id: 'UI-PS',  name: 'Psikologi',                faculty: 'FPsi',      category: 'Soshum',  estimatedPassingGrade: 660 },
      { id: 'UI-HI',  name: 'Hubungan Internasional',   faculty: 'FISIP',     category: 'Soshum',  estimatedPassingGrade: 665 },
      { id: 'UI-KOM', name: 'Ilmu Komunikasi',          faculty: 'FISIP',     category: 'Soshum',  estimatedPassingGrade: 655 },
      { id: 'UI-IAN', name: 'Ilmu Administrasi Negara', faculty: 'FISIP',     category: 'Soshum',  estimatedPassingGrade: 640 },
    ],
  },

  // ── Institut Teknologi Bandung ───────────────────────────────────
  {
    id: 'ITB', name: 'Institut Teknologi Bandung', short: 'ITB',
    location: 'Bandung, Jawa Barat', province: 'Jawa Barat',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'ITB-TI',  name: 'Teknik Informatika',      faculty: 'STEI',   category: 'Saintek', estimatedPassingGrade: 725 },
      { id: 'ITB-TE',  name: 'Teknik Elektro',          faculty: 'STEI',   category: 'Saintek', estimatedPassingGrade: 710 },
      { id: 'ITB-TS',  name: 'Teknik Sipil',            faculty: 'FTSL',   category: 'Saintek', estimatedPassingGrade: 698 },
      { id: 'ITB-TM',  name: 'Teknik Mesin',            faculty: 'FTMD',   category: 'Saintek', estimatedPassingGrade: 695 },
      { id: 'ITB-TK',  name: 'Teknik Kimia',            faculty: 'FTI',    category: 'Saintek', estimatedPassingGrade: 693 },
      { id: 'ITB-TI2', name: 'Teknik Industri',         faculty: 'FTI',    category: 'Saintek', estimatedPassingGrade: 700 },
      { id: 'ITB-AR',  name: 'Arsitektur',              faculty: 'SAPPK',  category: 'Saintek', estimatedPassingGrade: 692 },
      { id: 'ITB-PL',  name: 'Perencanaan Wilayah Kota',faculty: 'SAPPK',  category: 'Saintek', estimatedPassingGrade: 682 },
      { id: 'ITB-MA',  name: 'Matematika',              faculty: 'FMIPA',  category: 'Saintek', estimatedPassingGrade: 678 },
      { id: 'ITB-FIS', name: 'Fisika',                  faculty: 'FMIPA',  category: 'Saintek', estimatedPassingGrade: 670 },
      { id: 'ITB-KI',  name: 'Kimia',                   faculty: 'FMIPA',  category: 'Saintek', estimatedPassingGrade: 665 },
      { id: 'ITB-MB',  name: 'Manajemen (MBA)',          faculty: 'SBM',    category: 'Campuran',estimatedPassingGrade: 705 },
    ],
  },

  // ── Universitas Gadjah Mada ──────────────────────────────────────
  {
    id: 'UGM', name: 'Universitas Gadjah Mada', short: 'UGM',
    location: 'Yogyakarta', province: 'DI Yogyakarta',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UGM-TI',  name: 'Teknik Informatika',      faculty: 'DTETI',  category: 'Saintek', estimatedPassingGrade: 705 },
      { id: 'UGM-TE',  name: 'Teknik Elektro',          faculty: 'DTETI',  category: 'Saintek', estimatedPassingGrade: 693 },
      { id: 'UGM-TM',  name: 'Teknik Mesin',            faculty: 'FT',     category: 'Saintek', estimatedPassingGrade: 685 },
      { id: 'UGM-TS',  name: 'Teknik Sipil',            faculty: 'FT',     category: 'Saintek', estimatedPassingGrade: 682 },
      { id: 'UGM-DK',  name: 'Pendidikan Dokter',       faculty: 'FK-KMK', category: 'Saintek', estimatedPassingGrade: 735 },
      { id: 'UGM-FRM', name: 'Farmasi',                 faculty: 'FF',     category: 'Saintek', estimatedPassingGrade: 685 },
      { id: 'UGM-DRG', name: 'Pendidikan Dokter Gigi',  faculty: 'FKG',    category: 'Saintek', estimatedPassingGrade: 695 },
      { id: 'UGM-AK',  name: 'Akuntansi',               faculty: 'FEB',    category: 'Soshum',  estimatedPassingGrade: 680 },
      { id: 'UGM-MN',  name: 'Manajemen',               faculty: 'FEB',    category: 'Soshum',  estimatedPassingGrade: 675 },
      { id: 'UGM-IE',  name: 'Ilmu Ekonomi',            faculty: 'FEB',    category: 'Soshum',  estimatedPassingGrade: 668 },
      { id: 'UGM-HK',  name: 'Ilmu Hukum',              faculty: 'FH',     category: 'Soshum',  estimatedPassingGrade: 665 },
      { id: 'UGM-PS',  name: 'Psikologi',               faculty: 'FPsi',   category: 'Soshum',  estimatedPassingGrade: 662 },
      { id: 'UGM-HI',  name: 'Hubungan Internasional',  faculty: 'FISIPOL',category: 'Soshum',  estimatedPassingGrade: 658 },
      { id: 'UGM-KOM', name: 'Ilmu Komunikasi',         faculty: 'FISIPOL',category: 'Soshum',  estimatedPassingGrade: 650 },
    ],
  },

  // ── Institut Teknologi Sepuluh Nopember ─────────────────────────
  {
    id: 'ITS', name: 'Institut Teknologi Sepuluh Nopember', short: 'ITS',
    location: 'Surabaya, Jawa Timur', province: 'Jawa Timur',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'ITS-TI',  name: 'Teknik Informatika',      faculty: 'FTEIC',  category: 'Saintek', estimatedPassingGrade: 688 },
      { id: 'ITS-SI',  name: 'Sistem Informasi',         faculty: 'FTEIC',  category: 'Saintek', estimatedPassingGrade: 678 },
      { id: 'ITS-TE',  name: 'Teknik Elektro',          faculty: 'FTEIC',  category: 'Saintek', estimatedPassingGrade: 680 },
      { id: 'ITS-TM',  name: 'Teknik Mesin',            faculty: 'FTI',    category: 'Saintek', estimatedPassingGrade: 672 },
      { id: 'ITS-TK',  name: 'Teknik Kimia',            faculty: 'FTI',    category: 'Saintek', estimatedPassingGrade: 668 },
      { id: 'ITS-TS',  name: 'Teknik Sipil',            faculty: 'FTSPK',  category: 'Saintek', estimatedPassingGrade: 665 },
      { id: 'ITS-AR',  name: 'Arsitektur',              faculty: 'FTSPK',  category: 'Saintek', estimatedPassingGrade: 660 },
      { id: 'ITS-MA',  name: 'Matematika',              faculty: 'FSAD',   category: 'Saintek', estimatedPassingGrade: 648 },
      { id: 'ITS-PK',  name: 'Teknik Perkapalan',       faculty: 'FTK',    category: 'Saintek', estimatedPassingGrade: 655 },
      { id: 'ITS-DS',  name: 'Desain Produk Industri',  faculty: 'FDK',    category: 'Saintek', estimatedPassingGrade: 645 },
    ],
  },

  // ── Universitas Airlangga ────────────────────────────────────────
  {
    id: 'UNAIR', name: 'Universitas Airlangga', short: 'UNAIR',
    location: 'Surabaya, Jawa Timur', province: 'Jawa Timur',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UNAIR-DK',  name: 'Pendidikan Dokter',     faculty: 'FK',     category: 'Saintek', estimatedPassingGrade: 703 },
      { id: 'UNAIR-FRM', name: 'Farmasi',               faculty: 'FF',     category: 'Saintek', estimatedPassingGrade: 668 },
      { id: 'UNAIR-KS',  name: 'Kesehatan Masyarakat',  faculty: 'FKM',    category: 'Saintek', estimatedPassingGrade: 648 },
      { id: 'UNAIR-TI',  name: 'Teknik Informatika',    faculty: 'FST',    category: 'Saintek', estimatedPassingGrade: 658 },
      { id: 'UNAIR-AK',  name: 'Akuntansi',             faculty: 'FEB',    category: 'Soshum',  estimatedPassingGrade: 662 },
      { id: 'UNAIR-MN',  name: 'Manajemen',             faculty: 'FEB',    category: 'Soshum',  estimatedPassingGrade: 658 },
      { id: 'UNAIR-HK',  name: 'Ilmu Hukum',            faculty: 'FH',     category: 'Soshum',  estimatedPassingGrade: 645 },
      { id: 'UNAIR-HI',  name: 'Hubungan Internasional',faculty: 'FISIP',  category: 'Soshum',  estimatedPassingGrade: 648 },
      { id: 'UNAIR-PS',  name: 'Psikologi',             faculty: 'FPsi',   category: 'Soshum',  estimatedPassingGrade: 645 },
    ],
  },

  // ── Universitas Padjadjaran ──────────────────────────────────────
  {
    id: 'UNPAD', name: 'Universitas Padjadjaran', short: 'UNPAD',
    location: 'Bandung, Jawa Barat', province: 'Jawa Barat',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UNPAD-DK',  name: 'Pendidikan Dokter',     faculty: 'FK',    category: 'Saintek', estimatedPassingGrade: 695 },
      { id: 'UNPAD-FRM', name: 'Farmasi',               faculty: 'FF',    category: 'Saintek', estimatedPassingGrade: 660 },
      { id: 'UNPAD-TI',  name: 'Teknik Informatika',    faculty: 'FMIPA', category: 'Saintek', estimatedPassingGrade: 658 },
      { id: 'UNPAD-MA',  name: 'Matematika',            faculty: 'FMIPA', category: 'Saintek', estimatedPassingGrade: 635 },
      { id: 'UNPAD-AK',  name: 'Akuntansi',             faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 658 },
      { id: 'UNPAD-MN',  name: 'Manajemen',             faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 652 },
      { id: 'UNPAD-KOM', name: 'Ilmu Komunikasi',       faculty: 'Fikom', category: 'Soshum',  estimatedPassingGrade: 668 },
      { id: 'UNPAD-HK',  name: 'Ilmu Hukum',           faculty: 'FH',    category: 'Soshum',  estimatedPassingGrade: 648 },
      { id: 'UNPAD-HI',  name: 'Hubungan Internasional',faculty: 'FISIP', category: 'Soshum',  estimatedPassingGrade: 645 },
      { id: 'UNPAD-PS',  name: 'Psikologi',             faculty: 'FPsi',  category: 'Soshum',  estimatedPassingGrade: 642 },
    ],
  },

  // ── Universitas Diponegoro ───────────────────────────────────────
  {
    id: 'UNDIP', name: 'Universitas Diponegoro', short: 'UNDIP',
    location: 'Semarang, Jawa Tengah', province: 'Jawa Tengah',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UNDIP-DK',  name: 'Pendidikan Dokter',     faculty: 'FK',   category: 'Saintek', estimatedPassingGrade: 682 },
      { id: 'UNDIP-TI',  name: 'Teknik Informatika',    faculty: 'FSM',  category: 'Saintek', estimatedPassingGrade: 655 },
      { id: 'UNDIP-TE',  name: 'Teknik Elektro',        faculty: 'FT',   category: 'Saintek', estimatedPassingGrade: 648 },
      { id: 'UNDIP-TK',  name: 'Teknik Kimia',          faculty: 'FT',   category: 'Saintek', estimatedPassingGrade: 645 },
      { id: 'UNDIP-TS',  name: 'Teknik Sipil',          faculty: 'FT',   category: 'Saintek', estimatedPassingGrade: 642 },
      { id: 'UNDIP-AK',  name: 'Akuntansi',             faculty: 'FEB',  category: 'Soshum',  estimatedPassingGrade: 650 },
      { id: 'UNDIP-MN',  name: 'Manajemen',             faculty: 'FEB',  category: 'Soshum',  estimatedPassingGrade: 645 },
      { id: 'UNDIP-HK',  name: 'Ilmu Hukum',           faculty: 'FH',   category: 'Soshum',  estimatedPassingGrade: 642 },
      { id: 'UNDIP-HI',  name: 'Hubungan Internasional',faculty: 'FISIP',category: 'Soshum',  estimatedPassingGrade: 648 },
    ],
  },

  // ── Universitas Brawijaya ────────────────────────────────────────
  {
    id: 'UB', name: 'Universitas Brawijaya', short: 'UB',
    location: 'Malang, Jawa Timur', province: 'Jawa Timur',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UB-DK',  name: 'Pendidikan Dokter',        faculty: 'FK',    category: 'Saintek', estimatedPassingGrade: 672 },
      { id: 'UB-TI',  name: 'Teknik Informatika',       faculty: 'FILKOM',category: 'Saintek', estimatedPassingGrade: 648 },
      { id: 'UB-TE',  name: 'Teknik Elektro',           faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 638 },
      { id: 'UB-TM',  name: 'Teknik Mesin',             faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 635 },
      { id: 'UB-TS',  name: 'Teknik Sipil',             faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 632 },
      { id: 'UB-AK',  name: 'Akuntansi',                faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 642 },
      { id: 'UB-MN',  name: 'Manajemen',                faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 638 },
      { id: 'UB-HK',  name: 'Ilmu Hukum',              faculty: 'FH',    category: 'Soshum',  estimatedPassingGrade: 635 },
      { id: 'UB-PS',  name: 'Psikologi',                faculty: 'FPsi',  category: 'Soshum',  estimatedPassingGrade: 630 },
      { id: 'UB-AG',  name: 'Agribisnis',               faculty: 'FP',    category: 'Soshum',  estimatedPassingGrade: 620 },
    ],
  },

  // ── Institut Pertanian Bogor ─────────────────────────────────────
  {
    id: 'IPB', name: 'Institut Pertanian Bogor', short: 'IPB',
    location: 'Bogor, Jawa Barat', province: 'Jawa Barat',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'IPB-TI',  name: 'Teknik Informatika',      faculty: 'FASILKOM-MTI', category: 'Saintek', estimatedPassingGrade: 650 },
      { id: 'IPB-ST',  name: 'Statistika',              faculty: 'FMIPA',        category: 'Saintek', estimatedPassingGrade: 645 },
      { id: 'IPB-DKH', name: 'Kedokteran Hewan',        faculty: 'FKH',          category: 'Saintek', estimatedPassingGrade: 658 },
      { id: 'IPB-GZ',  name: 'Gizi',                    faculty: 'FEMA',         category: 'Saintek', estimatedPassingGrade: 648 },
      { id: 'IPB-AG',  name: 'Agribisnis',              faculty: 'FEM',          category: 'Soshum',  estimatedPassingGrade: 638 },
      { id: 'IPB-MN',  name: 'Manajemen',               faculty: 'FEM',          category: 'Soshum',  estimatedPassingGrade: 640 },
      { id: 'IPB-KOM', name: 'Komunikasi dan Pengembangan Masyarakat', faculty: 'FEMA', category: 'Soshum', estimatedPassingGrade: 622 },
    ],
  },

  // ── Universitas Hasanuddin ───────────────────────────────────────
  {
    id: 'UNHAS', name: 'Universitas Hasanuddin', short: 'UNHAS',
    location: 'Makassar, Sulawesi Selatan', province: 'Sulawesi Selatan',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UNHAS-DK',  name: 'Pendidikan Dokter',     faculty: 'FK',    category: 'Saintek', estimatedPassingGrade: 668 },
      { id: 'UNHAS-TI',  name: 'Teknik Informatika',    faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 638 },
      { id: 'UNHAS-TS',  name: 'Teknik Sipil',          faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 632 },
      { id: 'UNHAS-AK',  name: 'Akuntansi',             faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 638 },
      { id: 'UNHAS-MN',  name: 'Manajemen',             faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 632 },
      { id: 'UNHAS-HK',  name: 'Ilmu Hukum',           faculty: 'FH',    category: 'Soshum',  estimatedPassingGrade: 630 },
      { id: 'UNHAS-HI',  name: 'Hubungan Internasional',faculty: 'FISIP', category: 'Soshum',  estimatedPassingGrade: 635 },
    ],
  },

  // ── Universitas Sebelas Maret ────────────────────────────────────
  {
    id: 'UNS', name: 'Universitas Sebelas Maret', short: 'UNS',
    location: 'Surakarta, Jawa Tengah', province: 'Jawa Tengah',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UNS-DK',  name: 'Pendidikan Dokter',       faculty: 'FK',    category: 'Saintek', estimatedPassingGrade: 660 },
      { id: 'UNS-TI',  name: 'Teknik Informatika',      faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 638 },
      { id: 'UNS-TE',  name: 'Teknik Elektro',          faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 630 },
      { id: 'UNS-AK',  name: 'Akuntansi',               faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 638 },
      { id: 'UNS-MN',  name: 'Manajemen',               faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 632 },
      { id: 'UNS-HK',  name: 'Ilmu Hukum',             faculty: 'FH',    category: 'Soshum',  estimatedPassingGrade: 628 },
      { id: 'UNS-KOM', name: 'Ilmu Komunikasi',         faculty: 'FISIP', category: 'Soshum',  estimatedPassingGrade: 630 },
      { id: 'UNS-PS',  name: 'Psikologi',               faculty: 'FPsi',  category: 'Soshum',  estimatedPassingGrade: 625 },
    ],
  },

  // ── Universitas Pendidikan Indonesia ────────────────────────────
  {
    id: 'UPI', name: 'Universitas Pendidikan Indonesia', short: 'UPI',
    location: 'Bandung, Jawa Barat', province: 'Jawa Barat',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UPI-PTIK', name: 'Pend. Teknik Informatika & Komputer', faculty: 'FPTK', category: 'Saintek', estimatedPassingGrade: 620 },
      { id: 'UPI-MAT',  name: 'Pendidikan Matematika',  faculty: 'FPMIPA', category: 'Saintek', estimatedPassingGrade: 618 },
      { id: 'UPI-BI',   name: 'Pendidikan Bahasa Indonesia', faculty: 'FPBS', category: 'Soshum', estimatedPassingGrade: 615 },
      { id: 'UPI-BE',   name: 'Pendidikan Bahasa Inggris', faculty: 'FPBS', category: 'Soshum', estimatedPassingGrade: 620 },
      { id: 'UPI-MJ',   name: 'Manajemen',              faculty: 'FPEB',   category: 'Soshum',  estimatedPassingGrade: 622 },
      { id: 'UPI-AK',   name: 'Akuntansi',              faculty: 'FPEB',   category: 'Soshum',  estimatedPassingGrade: 620 },
    ],
  },

  // ── Universitas Negeri Yogyakarta ────────────────────────────────
  {
    id: 'UNY', name: 'Universitas Negeri Yogyakarta', short: 'UNY',
    location: 'Yogyakarta', province: 'DI Yogyakarta',
    accreditation: 'Unggul', type: 'PTN-BLU',
    programs: [
      { id: 'UNY-TI',  name: 'Pendidikan Teknik Informatika', faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 618 },
      { id: 'UNY-MAT', name: 'Pendidikan Matematika',  faculty: 'FMIPA',  category: 'Saintek', estimatedPassingGrade: 615 },
      { id: 'UNY-MN',  name: 'Manajemen',              faculty: 'FE',     category: 'Soshum',  estimatedPassingGrade: 618 },
      { id: 'UNY-AK',  name: 'Akuntansi',              faculty: 'FE',     category: 'Soshum',  estimatedPassingGrade: 616 },
      { id: 'UNY-BI',  name: 'Pendidikan Bahasa Inggris', faculty: 'FBS', category: 'Soshum',  estimatedPassingGrade: 615 },
      { id: 'UNY-BK',  name: 'Bimbingan dan Konseling', faculty: 'FIP',   category: 'Soshum',  estimatedPassingGrade: 610 },
    ],
  },

  // ── Universitas Negeri Semarang ──────────────────────────────────
  {
    id: 'UNNES', name: 'Universitas Negeri Semarang', short: 'UNNES',
    location: 'Semarang, Jawa Tengah', province: 'Jawa Tengah',
    accreditation: 'Unggul', type: 'PTN-BLU',
    programs: [
      { id: 'UNNES-TI',  name: 'Teknik Informatika',   faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 612 },
      { id: 'UNNES-MAT', name: 'Matematika',           faculty: 'FMIPA', category: 'Saintek', estimatedPassingGrade: 608 },
      { id: 'UNNES-AK',  name: 'Akuntansi',            faculty: 'FE',    category: 'Soshum',  estimatedPassingGrade: 612 },
      { id: 'UNNES-MN',  name: 'Manajemen',            faculty: 'FE',    category: 'Soshum',  estimatedPassingGrade: 610 },
      { id: 'UNNES-HK',  name: 'Ilmu Hukum',          faculty: 'FH',    category: 'Soshum',  estimatedPassingGrade: 608 },
    ],
  },

  // ── Universitas Sumatera Utara ───────────────────────────────────
  {
    id: 'USU', name: 'Universitas Sumatera Utara', short: 'USU',
    location: 'Medan, Sumatera Utara', province: 'Sumatera Utara',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'USU-DK',  name: 'Pendidikan Dokter',      faculty: 'FK',    category: 'Saintek', estimatedPassingGrade: 655 },
      { id: 'USU-TI',  name: 'Teknik Informatika',     faculty: 'FASILKOM', category: 'Saintek', estimatedPassingGrade: 630 },
      { id: 'USU-TE',  name: 'Teknik Elektro',         faculty: 'FT',    category: 'Saintek', estimatedPassingGrade: 622 },
      { id: 'USU-AK',  name: 'Akuntansi',              faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 628 },
      { id: 'USU-MN',  name: 'Manajemen',              faculty: 'FEB',   category: 'Soshum',  estimatedPassingGrade: 622 },
      { id: 'USU-HK',  name: 'Ilmu Hukum',            faculty: 'FH',    category: 'Soshum',  estimatedPassingGrade: 618 },
    ],
  },

  // ── Universitas Andalas ──────────────────────────────────────────
  {
    id: 'UNAND', name: 'Universitas Andalas', short: 'UNAND',
    location: 'Padang, Sumatera Barat', province: 'Sumatera Barat',
    accreditation: 'Unggul', type: 'PTN-BH',
    programs: [
      { id: 'UNAND-DK',  name: 'Pendidikan Dokter',    faculty: 'FK',   category: 'Saintek', estimatedPassingGrade: 648 },
      { id: 'UNAND-TI',  name: 'Sistem Informasi',     faculty: 'FTI',  category: 'Saintek', estimatedPassingGrade: 620 },
      { id: 'UNAND-TE',  name: 'Teknik Elektro',       faculty: 'FT',   category: 'Saintek', estimatedPassingGrade: 615 },
      { id: 'UNAND-AK',  name: 'Akuntansi',            faculty: 'FEB',  category: 'Soshum',  estimatedPassingGrade: 620 },
      { id: 'UNAND-MN',  name: 'Manajemen',            faculty: 'FEB',  category: 'Soshum',  estimatedPassingGrade: 615 },
      { id: 'UNAND-HK',  name: 'Ilmu Hukum',          faculty: 'FH',   category: 'Soshum',  estimatedPassingGrade: 612 },
    ],
  },
];

// ── Helper functions ──────────────────────────────────────────────

export function searchUniversities(keyword: string): University[] {
  const q = keyword.toLowerCase();
  return universities.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.short.toLowerCase().includes(q) ||
    u.location.toLowerCase().includes(q)
  );
}

export function getPrograms(universityId: string, category?: 'Saintek' | 'Soshum' | 'Campuran'): Program[] {
  const uni = universities.find(u => u.id === universityId);
  if (!uni) return [];
  if (!category) return uni.programs;
  return uni.programs.filter(p => p.category === category || p.category === 'Campuran');
}

export function getPassingGradeStatus(score: number, passingGrade: number): {
  status: 'aman' | 'tipis' | 'tidak_lulus';
  label: string;
  color: string;
  description: string;
} {
  const diff = score - passingGrade;
  if (diff >= 20) return {
    status: 'aman',
    label: 'Kemungkinan Lulus',
    color: 'text-green-600',
    description: `Skor kamu ${diff} poin di atas estimasi passing grade`
  };
  if (diff >= -20) return {
    status: 'tipis',
    label: 'Tipis / Borderline',
    color: 'text-yellow-600',
    description: `Skor kamu sangat dekat dengan estimasi passing grade (selisih ${Math.abs(diff)} poin)`
  };
  return {
    status: 'tidak_lulus',
    label: 'Perlu Ditingkatkan',
    color: 'text-red-600',
    description: `Skor kamu masih ${Math.abs(diff)} poin di bawah estimasi passing grade`
  };
}

// Disclaimer wajib ditampilkan ke user
export const PASSING_GRADE_DISCLAIMER =
  '⚠️ Estimasi passing grade bukan angka resmi dari SNPMB/Kemendikbud. ' +
  'Angka ini hanya gambaran relatif antar prodi. ' +
  'Selalu cek informasi resmi di snpmb.bppp.kemdikbud.go.id';