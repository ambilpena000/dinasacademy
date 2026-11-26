// rescore-tryouts.ts — Hitung ulang skor & peringkat hasil try out yang sudah tersimpan
// (mis. setelah formula skor berbobot SNBT diterapkan).
//
// Jalankan: npm run rescore               → semua try out yang punya hasil
//           npm run rescore -- 13 14      → hanya try out id 13 dan 14
import * as path from 'path';
import { DataSource } from 'typeorm';
import { ExamResult } from './results/exam-result.entity';
import { Question } from './questions/question.entity';
import { Tryout } from './tryouts/tryout.entity';
import {
  calculateScore, computeQuestionWeights, firstAttempts, rankBestAttempts, usesWeightedScoring,
} from './exam/scoring';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dinasacademy',
  entities: [ExamResult, Question, Tryout],
  synchronize: false,
});

async function main() {
  await AppDataSource.initialize();
  const resultRepo = AppDataSource.getRepository(ExamResult);
  const questionRepo = AppDataSource.getRepository(Question);

  const onlyIds = process.argv.slice(2).map(Number).filter(Boolean);
  const rows: { tryoutId: number }[] = await resultRepo
    .createQueryBuilder('r').select('DISTINCT r.tryoutId', 'tryoutId').getRawMany();
  const tryoutIds = rows.map((r) => Number(r.tryoutId)).filter((id) => !onlyIds.length || onlyIds.includes(id));

  for (const tryoutId of tryoutIds) {
    const [questions, results] = await Promise.all([
      questionRepo.find({ where: { tryoutId }, order: { orderIndex: 'ASC' } }),
      resultRepo.find({ where: { tryoutId } }),
    ]);
    if (!results.length) continue;
    const weighted = usesWeightedScoring(results[0].category);
    const weights = weighted
      ? computeQuestionWeights(questions, firstAttempts(results).map((r) => (r.answers || {}) as Record<string, string>))
      : undefined;

    const changes: string[] = [];
    for (const r of results) {
      const before = Number(r.totalScore);
      if (questions.length) {
        const s = calculateScore(questions, (r.answers || {}) as Record<string, string>, r.category, weights);
        Object.assign(r, {
          correct: s.correct, wrong: s.wrong, unanswered: s.unanswered, totalQuestions: s.totalQuestions,
          totalScore: s.totalScore, maxScore: s.maxScore, percentage: s.percentage, subScores: s.subScores,
        });
      }
      if (before !== Number(r.totalScore)) changes.push(`#${r.id}: ${before} → ${r.totalScore}`);
    }
    // Peringkat: percobaan terbaik tiap peserta (SKD: tie-break TKP > TIU > TWK)
    const ranking = rankBestAttempts(results, results[0].category);
    for (const r of results) {
      r.rank = ranking.rankOf(r);
      r.totalParticipants = ranking.participants;
    }
    await resultRepo.save(results, { chunk: 200 });
    console.log(`Try out ${tryoutId} (${results[0].tryoutTitle ?? '-'}): ${results.length} hasil, ` +
      `${weighted ? 'skor berbobot' : 'skor tetap (SKD/STIS)'}${changes.length ? ' · ' + changes.join(', ') : ''}`);
  }
  console.log(`Selesai: ${tryoutIds.length} try out dihitung ulang.`);
  await AppDataSource.destroy();
}

main().catch(async (e) => {
  console.error('Gagal menghitung ulang:', e);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exit(1);
});
