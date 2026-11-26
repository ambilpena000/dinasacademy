// scoring.ts — Formula skor try out (fungsi murni, dipakai ExamService & script rescore)
//
// SKD (CPNS/Sekdin) — aturan resmi:
//   TWK : benar +5, salah 0, kosong 0  — max 35 soal → max 175
//   TIU : benar +5, salah 0, kosong 0  — max 35 soal → max 175
//   TKP : skala opsi 1–5 per jawaban    — max 35 soal → max 175
//   Total max: 550  |  Passing grade: TWK≥65, TIU≥80, TKP≥166
//
// SNBT/PTN — skor berbobot per soal (pendekatan sederhana mirip IRT):
//   1. Tingkat benar soal  p = (peserta yang menjawab BENAR + 1) / (jumlah peserta + 2)
//      · peserta yang TIDAK MENGISI atau SALAH dihitung "tidak benar"
//      · hanya percobaan pertama tiap peserta yang dihitung
//      · +1/+2 (Laplace) agar bobot stabil saat peserta masih sedikit (0 peserta → p = 0,5)
//   2. Bobot soal          w = 1 + 2 × (1 − p)      → 1 (mudah) … 3 (sulit)
//   3. Skor subtes         = Σ w soal dijawab benar / Σ w semua soal subtes × 1000
//   4. Skor akhir          = rata-rata skor seluruh subtes (skala 0–1000)
//   Salah & kosong tidak mengurangi nilai. Bobot dihitung ulang setiap ada peserta baru,
//   sehingga skor semua peserta pada try out tsb ikut diperbarui.
//
// STIS — tes khusus Matematika (hanya paket STIS):
//   Skor subtes = jumlah benar / jumlah soal × 100 (skala 0–100), salah & kosong 0.
//   Skor akhir  = rata-rata skor subtes (umumnya hanya subtes MTK). Tanpa bobot soal.

export interface SubScore {
  subtest: string;
  correct: number;
  wrong: number;
  unanswered: number;
  rawScore: number;     // SKD: poin; SNBT: jumlah bobot soal yang benar
  maxRawScore?: number; // SNBT: jumlah bobot seluruh soal subtes
  scaledScore: number;  // skor dalam skala resmi (SKD poin, SNBT 0–1000)
  passingGrade?: number;
  passed?: boolean;
}

export interface ScoreResult {
  subScores: SubScore[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  correct: number;
  wrong: number;
  unanswered: number;
  totalQuestions: number;
  passingInfo?: {
    TWK?: { score: number; pass: boolean; required: number };
    TIU?: { score: number; pass: boolean; required: number };
    TKP?: { score: number; pass: boolean; required: number };
    allPassed: boolean;
  };
}

export interface QuestionLike {
  id: number;
  correctAnswer?: string | null;
  subtestCode?: string | null;
  subtestName?: string | null;
  optionWeights?: unknown;
}

export interface QuestionWeight {
  questionId: number;
  correct: number;       // peserta yang menjawab benar
  participants: number;  // jumlah peserta (percobaan pertama)
  correctRate: number;   // p (sudah dihaluskan)
  weight: number;        // w
}

// TKP — bobot default posisional bila soal tidak punya optionWeights
const TKP_OPTION_SCORES: Record<string, number> = { a: 5, b: 4, c: 3, d: 2, e: 1 };

export const WEIGHT_MIN = 1;
export const WEIGHT_RANGE = 2; // bobot maksimum = WEIGHT_MIN + WEIGHT_RANGE = 3

export function isSkdCategory(category?: string | null): boolean {
  const cat = (category || '').toUpperCase();
  return cat === 'SKD' || cat.includes('CPNS') || cat.includes('SEKDIN') || cat.includes('KEDINASAN');
}

export function isStisCategory(category?: string | null): boolean {
  const cat = (category || '').toUpperCase();
  return cat === 'STIS' || cat.includes('POLSTAT');
}

/** Bobot per soal hanya dipakai try out SNBT. */
export function usesWeightedScoring(category?: string | null): boolean {
  return !isSkdCategory(category) && !isStisCategory(category);
}

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();

function isCorrect(q: QuestionLike, answers: Record<string, string> | null | undefined): boolean {
  const ans = norm(answers?.[String(q.id)]);
  return !!ans && ans === norm(q.correctAnswer);
}

/**
 * Hitung bobot tiap soal SNBT dari jawaban para peserta.
 * @param attempts jawaban percobaan pertama tiap peserta (objek {questionId: opsi})
 */
export function computeQuestionWeights(
  questions: QuestionLike[],
  attempts: Record<string, string>[],
): Map<number, QuestionWeight> {
  const n = attempts.length;
  const map = new Map<number, QuestionWeight>();
  for (const q of questions) {
    let correct = 0;
    for (const a of attempts) if (isCorrect(q, a)) correct++;
    const p = (correct + 1) / (n + 2);
    map.set(q.id, {
      questionId: q.id,
      correct,
      participants: n,
      correctRate: p,
      weight: Math.round((WEIGHT_MIN + WEIGHT_RANGE * (1 - p)) * 1000) / 1000,
    });
  }
  return map;
}

export function calculateScore(
  questions: QuestionLike[],
  answers: Record<string, string>,
  category: string,
  weights?: Map<number, QuestionWeight>,
): ScoreResult {
  const isSKD = isSkdCategory(category);
  const isSTIS = isStisCategory(category);

  // Kelompokkan soal per subtes
  const bySubtest: Record<string, QuestionLike[]> = {};
  for (const q of questions) {
    const key = (q.subtestCode || q.subtestName || 'UMUM').toUpperCase();
    (bySubtest[key] ||= []).push(q);
  }

  const subScores: SubScore[] = [];
  let totalCorrect = 0, totalWrong = 0, totalUnanswered = 0;

  for (const [subtest, qs] of Object.entries(bySubtest)) {
    let rawScore = 0, maxRaw = 0, correct = 0, wrong = 0, unanswered = 0;

    for (const q of qs) {
      const userAns = norm(answers?.[String(q.id)]);
      const w = isSKD || isSTIS ? 1 : (weights?.get(q.id)?.weight ?? 1);
      maxRaw += w;

      if (!userAns) {
        unanswered++;
      } else if (isSKD && subtest === 'TKP') {
        // TKP: tidak ada benar/salah — setiap opsi punya bobot (optionWeights atau a=5…e=1)
        const ow = q.optionWeights
          ? (typeof q.optionWeights === 'string' ? JSON.parse(q.optionWeights) : q.optionWeights) as Record<string, number>
          : TKP_OPTION_SCORES;
        rawScore += ow[userAns] ?? TKP_OPTION_SCORES[userAns] ?? 3;
        correct++;
      } else if (userAns === norm(q.correctAnswer)) {
        correct++;
        rawScore += isSKD ? 5 : w; // TWK/TIU +5; SNBT + bobot soal
      } else {
        wrong++; // tidak ada pengurangan
      }
    }

    totalCorrect += correct;
    totalWrong += wrong;
    totalUnanswered += unanswered;

    let scaledScore: number;
    let passingGrade: number | undefined;
    if (isSKD) {
      scaledScore = rawScore;
      if (subtest === 'TWK') passingGrade = 65;
      if (subtest === 'TIU') passingGrade = 80;
      if (subtest === 'TKP') passingGrade = 166;
    } else if (isSTIS) {
      scaledScore = maxRaw > 0 ? Math.round((rawScore / maxRaw) * 100) : 0; // 0–100
    } else {
      scaledScore = maxRaw > 0 ? Math.round((rawScore / maxRaw) * 1000) : 0;
    }

    subScores.push({
      subtest, correct, wrong, unanswered,
      rawScore: Math.round(rawScore * 1000) / 1000,
      ...(isSKD || isSTIS ? {} : { maxRawScore: Math.round(maxRaw * 1000) / 1000 }),
      scaledScore,
      passingGrade,
      passed: passingGrade !== undefined ? scaledScore >= passingGrade : undefined,
    });
  }

  const totalQuestions = questions.length || Object.keys(answers || {}).length;
  let totalScore: number, maxScore: number;
  if (isSKD) {
    totalScore = subScores.reduce((s, ss) => s + ss.scaledScore, 0);
    maxScore = 550;
  } else {
    // SNBT: rata-rata skor subtes (max 1000) · STIS: rata-rata skor subtes (max 100)
    const sum = subScores.reduce((s, ss) => s + ss.scaledScore, 0);
    totalScore = subScores.length ? Math.round(sum / subScores.length) : 0;
    maxScore = isSTIS ? 100 : 1000;
  }

  const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  let passingInfo: ScoreResult['passingInfo'];
  if (isSKD) {
    const pick = (code: string, req: number) => {
      const s = subScores.find((x) => x.subtest === code);
      return s ? { score: s.scaledScore, pass: s.scaledScore >= req, required: req } : undefined;
    };
    const TWK = pick('TWK', 65), TIU = pick('TIU', 80), TKP = pick('TKP', 166);
    passingInfo = { TWK, TIU, TKP, allPassed: [TWK, TIU, TKP].every((x) => !x || x.pass) };
  }

  return {
    subScores, totalScore, maxScore, percentage,
    correct: totalCorrect, wrong: totalWrong, unanswered: totalUnanswered,
    totalQuestions, passingInfo,
  };
}

/** Pilih percobaan pertama tiap peserta (berdasarkan waktu selesai, lalu id). */
export function firstAttempts<T extends { id: number; userId: number; completedAt?: Date | null; createdAt?: Date }>(
  results: T[],
): T[] {
  const byUser = new Map<number, T>();
  const time = (r: T) => new Date(r.completedAt ?? r.createdAt ?? 0).getTime();
  for (const r of results) {
    const cur = byUser.get(r.userId);
    if (!cur || time(r) < time(cur) || (time(r) === time(cur) && r.id < cur.id)) byUser.set(r.userId, r);
  }
  return [...byUser.values()];
}

// ── Peringkat ────────────────────────────────────────────────────────────
// Satu peserta = satu baris, memakai percobaan TERBAIKNYA.
// SKD : total tertinggi; bila sama → TKP, lalu TIU, lalu TWK (aturan resmi BKN).
// SNBT: total tertinggi.

export const SKD_SUBTESTS = ['TWK', 'TIU', 'TKP'] as const;
export const SKD_PASSING_GRADE: Record<string, number> = { TWK: 65, TIU: 80, TKP: 166 };
const SKD_TIEBREAK = ['TKP', 'TIU', 'TWK'];

export interface RankableResult {
  id: number;
  userId: number;
  category: string;
  totalScore: number | string;
  subScores?: unknown;
  completedAt?: Date | null;
  createdAt?: Date;
}

/** Peta skor per subtes: { TWK: 80, TIU: 95, ... } */
export function subScoreMap(subScores: unknown): Record<string, number> {
  const map: Record<string, number> = {};
  if (Array.isArray(subScores)) {
    for (const s of subScores as SubScore[]) {
      if (s?.subtest) map[String(s.subtest).toUpperCase()] = Number(s.scaledScore) || 0;
    }
  }
  return map;
}

/** < 0 bila a lebih baik dari b, 0 bila setara. */
export function compareAttempts(a: RankableResult, b: RankableResult, category: string): number {
  const diff = Number(b.totalScore) - Number(a.totalScore);
  if (diff !== 0) return diff;
  if (isSkdCategory(category)) {
    const sa = subScoreMap(a.subScores), sb = subScoreMap(b.subScores);
    for (const code of SKD_TIEBREAK) {
      const d = (sb[code] ?? 0) - (sa[code] ?? 0);
      if (d !== 0) return d;
    }
  }
  return 0;
}

/** Peringkat berbasis percobaan terbaik tiap peserta. */
export function rankBestAttempts<T extends RankableResult>(results: T[], category: string) {
  const bestByUser = new Map<number, T>();
  for (const r of results) {
    const cur = bestByUser.get(r.userId);
    if (!cur || compareAttempts(r, cur, category) < 0) bestByUser.set(r.userId, r);
  }
  const sorted = [...bestByUser.values()].sort((a, b) => compareAttempts(a, b, category));
  const leaderboard: { item: T; rank: number }[] = [];
  sorted.forEach((item, i) => {
    const prev = leaderboard[i - 1];
    const rank = prev && compareAttempts(item, prev.item, category) === 0 ? prev.rank : i + 1;
    leaderboard.push({ item, rank });
  });

  /** Peringkat sebuah percobaan dibanding nilai terbaik peserta LAIN. */
  const rankOf = (r: T) =>
    1 + sorted.filter((b) => b.userId !== r.userId && compareAttempts(b, r, category) < 0).length;

  return { leaderboard, rankOf, participants: sorted.length };
}

/** Peringkat per subtes (skor sama → peringkat sama). Hasil: { TWK: { userId: rank } } */
export function subtestRanks<T extends RankableResult>(best: T[], subtests: string[]) {
  const out: Record<string, Map<number, number>> = {};
  for (const code of subtests) {
    const scored = best
      .map((r) => ({ userId: r.userId, score: subScoreMap(r.subScores)[code] ?? 0 }))
      .sort((a, b) => b.score - a.score);
    const m = new Map<number, number>();
    scored.forEach((s, i) => {
      const prev = scored[i - 1];
      m.set(s.userId, prev && prev.score === s.score ? m.get(prev.userId)! : i + 1);
    });
    out[code] = m;
  }
  return out;
}
