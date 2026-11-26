import {
  isStisCategory, usesWeightedScoring, calculateScore, computeQuestionWeights, firstAttempts, isSkdCategory, rankBestAttempts, subtestRanks,
} from './scoring';

// 2 subtes SNBT, masing-masing 2 soal
const qs = [
  { id: 1, correctAnswer: 'a', subtestCode: 'PU' },
  { id: 2, correctAnswer: 'b', subtestCode: 'PU' },
  { id: 3, correctAnswer: 'c', subtestCode: 'PK' },
  { id: 4, correctAnswer: 'd', subtestCode: 'PK' },
];

describe('computeQuestionWeights', () => {
  it('tanpa peserta: semua soal bobot sama (p = 0,5 → w = 2)', () => {
    const w = computeQuestionWeights(qs, []);
    expect([...w.values()].map((x) => x.weight)).toEqual([2, 2, 2, 2]);
  });

  it('soal yang dikosongkan dihitung tidak benar → bobot lebih tinggi', () => {
    const attempts: Record<string, string>[] = [
      { '1': 'a', '2': 'b' }, // soal 3 & 4 kosong
      { '1': 'a', '2': 'x' }, // soal 2 salah, 3 & 4 kosong
      { '1': 'a', '3': 'c' }, // soal 2 & 4 kosong
    ];
    const w = computeQuestionWeights(qs, attempts);
    // soal 1: 3/3 benar → p=(3+1)/5=0,8 → w=1,4
    expect(w.get(1)!.weight).toBeCloseTo(1.4);
    // soal 2: 1 benar → p=2/5=0,4 → w=2,2
    expect(w.get(2)!.weight).toBeCloseTo(2.2);
    // soal 3: 1 benar (2 kosong) → w=2,2
    expect(w.get(3)!.weight).toBeCloseTo(2.2);
    // soal 4: tidak ada yang mengisi → p=1/5=0,2 → w=2,6 (tertinggi)
    expect(w.get(4)!.weight).toBeCloseTo(2.6);
    expect(w.get(4)!.correct).toBe(0);
    expect(w.get(4)!.participants).toBe(3);
  });

  it('bobot selalu di rentang 1–3', () => {
    const many = Array.from({ length: 1000 }, () => ({ '1': 'a' }));
    const w = computeQuestionWeights(qs, many);
    for (const x of w.values()) {
      expect(x.weight).toBeGreaterThanOrEqual(1);
      expect(x.weight).toBeLessThanOrEqual(3);
    }
    expect(w.get(1)!.weight).toBeLessThan(1.01); // hampir semua benar → ~1
    expect(w.get(2)!.weight).toBeGreaterThan(2.99); // tidak ada yang benar → ~3
  });
});

describe('calculateScore SNBT berbobot', () => {
  it('tanpa bobot = persentase benar per subtes, lalu dirata-rata', () => {
    const r = calculateScore(qs, { '1': 'a' }, 'PTN');
    expect(r.subScores.find((s) => s.subtest === 'PU')!.scaledScore).toBe(500);
    expect(r.subScores.find((s) => s.subtest === 'PK')!.scaledScore).toBe(0);
    expect(r.totalScore).toBe(250);
    expect(r.maxScore).toBe(1000);
  });

  it('menjawab benar soal sulit bernilai lebih besar daripada soal mudah', () => {
    const attempts = [{ '1': 'a' }, { '1': 'a' }, { '1': 'a' }]; // soal 1 mudah, soal 2 sulit
    const w = computeQuestionWeights(qs, attempts);
    const easy = calculateScore(qs, { '1': 'a' }, 'PTN', w);
    const hard = calculateScore(qs, { '2': 'b' }, 'PTN', w);
    const pu = (r: typeof easy) => r.subScores.find((s) => s.subtest === 'PU')!.scaledScore;
    expect(pu(hard)).toBeGreaterThan(pu(easy));
    // bobot: soal1 = 1+2(1-0,8)=1,4 ; soal2 = 1+2(1-0,2)=2,6 → PU easy = 1,4/4 = 350, hard = 2,6/4 = 650
    expect(pu(easy)).toBe(350);
    expect(pu(hard)).toBe(650);
  });

  it('salah dan kosong tidak mengurangi skor', () => {
    const w = computeQuestionWeights(qs, []);
    const a = calculateScore(qs, { '1': 'a' }, 'PTN', w);
    const b = calculateScore(qs, { '1': 'a', '2': 'x', '3': 'x' }, 'PTN', w);
    expect(b.totalScore).toBe(a.totalScore);
    expect(b.wrong).toBe(2);
  });

  it('semua benar = 1000', () => {
    const w = computeQuestionWeights(qs, [{ '1': 'a' }]);
    expect(calculateScore(qs, { '1': 'a', '2': 'b', '3': 'c', '4': 'd' }, 'PTN', w).totalScore).toBe(1000);
  });
});

describe('calculateScore SKD tidak memakai bobot', () => {
  const skd = [
    { id: 10, correctAnswer: 'a', subtestCode: 'TWK' },
    { id: 11, correctAnswer: 'b', subtestCode: 'TIU' },
    { id: 12, correctAnswer: '', subtestCode: 'TKP', optionWeights: { a: 1, b: 5 } },
  ];
  it('TWK/TIU +5, TKP sesuai bobot opsi, total dijumlah', () => {
    const w = computeQuestionWeights(skd, [{ '10': 'x' }]); // diabaikan untuk SKD
    const r = calculateScore(skd, { '10': 'a', '11': 'b', '12': 'b' }, 'SKD', w);
    expect(r.totalScore).toBe(15);
    expect(r.maxScore).toBe(550);
    expect(isSkdCategory('SKD')).toBe(true);
    expect(isSkdCategory('PTN')).toBe(false);
  });
});

describe('calculateScore STIS (tes khusus Matematika)', () => {
  const mtk = Array.from({ length: 4 }, (_, i) => ({ id: 100 + i, correctAnswer: 'a', subtestCode: 'MTK' }));
  it('benar / jumlah soal × 100, tanpa bobot, salah tidak mengurangi', () => {
    const w = computeQuestionWeights(mtk, [{ '100': 'a' }]); // diabaikan untuk STIS
    const r = calculateScore(mtk, { '100': 'a', '101': 'a', '102': 'b' }, 'STIS', w);
    expect(r.totalScore).toBe(50);
    expect(r.maxScore).toBe(100);
    expect(r.wrong).toBe(1);
  });
  it('kategori: STIS bukan SKD dan tidak memakai bobot; SNBT/PTN memakai bobot', () => {
    expect(isStisCategory('STIS')).toBe(true);
    expect(isSkdCategory('STIS')).toBe(false);
    expect(usesWeightedScoring('STIS')).toBe(false);
    expect(usesWeightedScoring('SKD')).toBe(false);
    expect(usesWeightedScoring('SNBT')).toBe(true);
    expect(usesWeightedScoring('PTN')).toBe(true);
  });
});

describe('firstAttempts & peringkat', () => {
  it('memilih percobaan pertama tiap peserta', () => {
    const res = firstAttempts([
      { id: 1, userId: 7, completedAt: new Date('2026-01-02') },
      { id: 2, userId: 7, completedAt: new Date('2026-01-01') },
      { id: 3, userId: 8, completedAt: new Date('2026-01-03') },
    ]);
    expect(res.map((r) => r.id).sort()).toEqual([2, 3]);
  });

  const skd = (id: number, userId: number, total: number, twk: number, tiu: number, tkp: number) => ({
    id, userId, category: 'SKD', totalScore: total,
    subScores: [{ subtest: 'TWK', scaledScore: twk }, { subtest: 'TIU', scaledScore: tiu }, { subtest: 'TKP', scaledScore: tkp }],
  });

  it('SKD: satu baris per peserta memakai nilai terbaik, total tertinggi di atas', () => {
    const { leaderboard, participants } = rankBestAttempts([
      skd(1, 7, 300, 80, 100, 120),
      skd(2, 7, 400, 100, 130, 170), // percobaan terbaik user 7
      skd(3, 8, 350, 90, 110, 150),
    ], 'SKD');
    expect(participants).toBe(2);
    expect(leaderboard.map((x) => [x.item.id, x.rank])).toEqual([[2, 1], [3, 2]]);
  });

  it('SKD: total sama → TKP lebih tinggi menang, lalu TIU, lalu TWK', () => {
    const { leaderboard } = rankBestAttempts([
      skd(1, 1, 400, 120, 120, 160),
      skd(2, 2, 400, 100, 130, 170), // TKP tertinggi → #1
      skd(3, 3, 400, 110, 125, 165),
      skd(4, 4, 400, 115, 125, 160), // TKP sama dgn #1? (160) → TIU 125 > 120 → di atas user 1
    ], 'SKD');
    expect(leaderboard.map((x) => x.item.userId)).toEqual([2, 3, 4, 1]);
    expect(leaderboard.map((x) => x.rank)).toEqual([1, 2, 3, 4]);
  });

  it('nilai identik mendapat peringkat sama; rankOf untuk percobaan lain', () => {
    const rs = [skd(1, 1, 400, 100, 130, 170), skd(2, 2, 400, 100, 130, 170), skd(3, 3, 300, 90, 90, 120)];
    const { leaderboard, rankOf } = rankBestAttempts(rs, 'SKD');
    expect(leaderboard.map((x) => x.rank)).toEqual([1, 1, 3]);
    expect(rankOf(skd(9, 3, 300, 90, 90, 120))).toBe(3);
  });

  it('peringkat per subtes', () => {
    const best = [skd(1, 1, 400, 100, 130, 170), skd(2, 2, 380, 120, 100, 160), skd(3, 3, 300, 120, 90, 90)];
    const r = subtestRanks(best, ['TWK', 'TKP']);
    expect([r.TWK.get(1), r.TWK.get(2), r.TWK.get(3)]).toEqual([3, 1, 1]);
    expect([r.TKP.get(1), r.TKP.get(2), r.TKP.get(3)]).toEqual([1, 2, 3]);
  });
});
