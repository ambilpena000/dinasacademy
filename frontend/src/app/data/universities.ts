// ================================================================
// universities.ts — Dinas Academy
// Helper status passing grade.
// Data PTN & Program Studi kini disimpan di database (tabel university & major)
// dan diambil lewat API — lihat src/app/lib/ptn.ts.
// ================================================================

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
  '⚠️ Estimasi passing grade bukan angka resmi. Angka dihitung dari keketatan ' +
  '(daya tampung ÷ peminat) data publik SNPMB dan hanya gambaran relatif antar prodi. ' +
  'Selalu cek informasi resmi di snpmb.id';