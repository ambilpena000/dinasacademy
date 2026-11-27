// word-import.ts — Membaca soal dari file Word (.docx) per subtes.
//
// Format yang dikenali (sama dengan file di folder BANK SOAL):
//   • Judul kelompok   : "Teks berikut digunakan untuk menjawab soal nomor 1–4.", "Soal nomor 5–8",
//                        "Stimulus 1 ...", "Text 1 is for questions 1–6." → mengawali teks bacaan baru
//   • Teks bacaan      : paragraf/tabel setelah judul kelompok, sebelum soal pertama kelompok itu
//   • Soal             : "1.<spasi/tab>Teks soal" (baris lanjutan ikut menjadi teks soal)
//   • Opsi             : "A.<spasi/tab>teks" … "E.<spasi/tab>teks"
//   • Kunci (opsional) : baris "Jawaban: B" / "Kunci: B" dan "Pembahasan: ..." langsung di bawah soal
//   • Bagian kunci     : judul "Kunci Jawaban" → tabel No./Kunci, lalu "Pembahasan" berisi
//                        "1. Jawaban: B (...)" diikuti paragraf pembahasan
// Penomoran soal & opsi harus diketik (bukan penomoran otomatis Word).

export interface ParsedQuestion {
  number: number;
  passage: string;
  questionText: string;
  options: string[]; // 4–5 opsi, urut A–E
  correctAnswer: string; // 'a'..'e' atau '' bila tidak ditemukan
  explanation: string;
}

export interface ParseResult {
  questions: ParsedQuestion[];
  warnings: string[];
}

type Block = { type: 'p'; text: string; heading: boolean } | { type: 'table'; rows: string[][] };

const LETTERS = ['a', 'b', 'c', 'd', 'e'];
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', n: 'ⁿ', '(': '⁽', ')': '⁾' };
const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '(': '₍', ')': '₎' };

function mapChars(s: string, table: Record<string, string>, fallback: string) {
  const chars = [...s];
  return chars.every((c) => table[c]) ? chars.map((c) => table[c]).join('') : `${fallback}(${s})`;
}

function decode(s: string) {
  return s
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

/** HTML inline → teks polos (superscript/subscript dipertahankan sebisanya). */
function inlineText(html: string) {
  const t = html
    .replace(/<sup>([\s\S]*?)<\/sup>/g, (_, x) => mapChars(decode(x.replace(/<[^>]+>/g, '')), SUP, '^'))
    .replace(/<sub>([\s\S]*?)<\/sub>/g, (_, x) => mapChars(decode(x.replace(/<[^>]+>/g, '')), SUB, '_'))
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '');
  return decode(t).replace(/\t/g, ' ').replace(/[  ]+/g, ' ').replace(/ *\n */g, '\n').trim();
}

/** HTML dari mammoth → urutan blok paragraf & tabel. */
export function htmlToBlocks(html: string): Block[] {
  const blocks: Block[] = [];
  const re = /<(p|h[1-6]|table|ol|ul)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const [, tag, inner] = m;
    if (tag === 'table') {
      const rows = [...inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((r) =>
        [...r[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => inlineText(c[1].replace(/<\/p>\s*<p[^>]*>/g, ' '))),
      );
      if (rows.length) blocks.push({ type: 'table', rows });
    } else if (tag === 'ol' || tag === 'ul') {
      for (const li of inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
        const text = inlineText(li[1]);
        if (text) blocks.push({ type: 'p', text, heading: false });
      }
    } else {
      const text = inlineText(inner);
      if (text) blocks.push({ type: 'p', text, heading: tag.startsWith('h') });
    }
  }
  return blocks;
}

const RE_QUESTION = /^(\d{1,3})\s*[.)](?:\s+|$)([\s\S]*)$/;
const RE_OPTION = /^([A-Ea-e])\s*[.)](?:\s+|$)([\s\S]*)$/;
const RE_INLINE_KEY = /^(?:jawaban|kunci(?:\s+jawaban)?)\s*[:：]\s*([A-Ea-e])\b/i;
const RE_INLINE_EXPL = /^pembahasan\s*[:：]\s*([\s\S]*)$/i;
const RE_GROUP = /(soal\s+nomor\s*\d|nomor\s+\d+\s*[–—-]\s*\d|for\s+questions?\s+\d|questions?\s+\d+\s*[–—-]\s*\d)/i;
const RE_KEY_SECTION = /^kunci\s+jawaban\b/i;
const RE_EXPL_HEADING = /^pembahasan\s*$/i;
const RE_EXPL_ENTRY = /^(\d{1,3})\s*[.)]?\s+jawaban\s*[:：]\s*([A-Ea-e])\b/i;

function tableToText(rows: string[][]) {
  return rows.map((r) => r.join(' | ')).join('\n');
}

export function parseBlocks(blocks: Block[]): ParseResult {
  const warnings: string[] = [];
  const questions: ParsedQuestion[] = [];

  // ── 1. Bagian soal ───────────────────────────────────────────────
  let i = 0;
  let started = false;      // sudah melewati sampul (judul, tabel identitas, petunjuk)
  let passage = '';         // teks bacaan aktif
  let pending: string[] = [];
  let current: ParsedQuestion | null = null;
  let inOptions = false;

  const finish = () => {
    if (current) questions.push(current);
    current = null;
    inOptions = false;
  };

  for (; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'p' && RE_KEY_SECTION.test(b.text)) break;

    if (b.type === 'table') {
      if (!started) continue; // tabel identitas di sampul
      if (current && !inOptions) current.questionText += '\n' + tableToText(b.rows);
      else { finish(); pending.push(tableToText(b.rows)); }
      continue;
    }

    const text = b.text;
    if (RE_GROUP.test(text) && !RE_QUESTION.test(text) && text.length < 200) {
      finish();
      started = true;
      passage = '';
      pending = [];
      continue;
    }

    const q = text.match(RE_QUESTION);
    if (q) {
      finish();
      started = true;
      if (pending.length) { passage = pending.join('\n\n'); pending = []; }
      current = { number: Number(q[1]), passage, questionText: q[2].trim(), options: [], correctAnswer: '', explanation: '' };
      continue;
    }

    if (!started) continue; // sampul

    if (current) {
      const opt = text.match(RE_OPTION);
      if (opt && (inOptions || current.questionText)) {
        const idx = LETTERS.indexOf(opt[1].toLowerCase());
        if (idx === current.options.length) {
          current.options.push(opt[2].trim());
          inOptions = true;
          continue;
        }
      }
      const key = text.match(RE_INLINE_KEY);
      if (key) { current.correctAnswer = key[1].toLowerCase(); continue; }
      const expl = text.match(RE_INLINE_EXPL);
      if (expl) { current.explanation = expl[1].trim(); continue; }
      if (!inOptions) { current.questionText += '\n' + text; continue; }
      if (current.explanation) { current.explanation += '\n' + text; continue; }
      // Paragraf setelah opsi tanpa judul kelompok → teks bacaan untuk soal berikutnya
      finish();
    }
    pending.push(text);
  }
  finish();

  // ── 2. Bagian kunci jawaban & pembahasan ─────────────────────────
  const keys = new Map<number, string>();
  const expls = new Map<number, string>();
  let inExpl = false;
  let lastNo = 0;
  for (; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'table') {
      for (const row of b.rows) {
        for (let c = 0; c + 1 < row.length; c += 2) {
          const no = Number(row[c]);
          const letter = (row[c + 1] || '').trim().toLowerCase();
          if (Number.isInteger(no) && no > 0 && LETTERS.includes(letter)) keys.set(no, letter);
        }
      }
      continue;
    }
    if (RE_EXPL_HEADING.test(b.text)) { inExpl = true; continue; }
    const e = b.text.match(RE_EXPL_ENTRY);
    if (e) {
      lastNo = Number(e[1]);
      inExpl = true;
      if (!keys.has(lastNo)) keys.set(lastNo, e[2].toLowerCase());
      expls.set(lastNo, '');
      continue;
    }
    if (inExpl && lastNo) expls.set(lastNo, [expls.get(lastNo), b.text].filter(Boolean).join('\n'));
  }

  for (const q of questions) {
    if (!q.correctAnswer && keys.has(q.number)) q.correctAnswer = keys.get(q.number)!;
    if (!q.explanation && expls.get(q.number)) q.explanation = expls.get(q.number)!;
  }

  // ── 3. Validasi ──────────────────────────────────────────────────
  if (!questions.length) {
    warnings.push('Tidak ada soal yang terbaca. Pastikan nomor soal diketik seperti "1. Teks soal" dan opsi "A. teks".');
  }
  questions.forEach((q, idx) => {
    if (q.number !== idx + 1) warnings.push(`Urutan nomor soal tidak berurutan di sekitar nomor ${q.number}.`);
    if (q.options.length < 4) warnings.push(`Soal ${q.number}: hanya ${q.options.length} opsi terbaca (minimal A–D).`);
    if (!q.correctAnswer) warnings.push(`Soal ${q.number}: kunci jawaban tidak ditemukan.`);
    else if (LETTERS.indexOf(q.correctAnswer) >= q.options.length) warnings.push(`Soal ${q.number}: kunci ${q.correctAnswer.toUpperCase()} tidak ada di opsi.`);
  });
  return { questions, warnings };
}

/** Baca file .docx → daftar soal. */
export async function parseWordQuestions(buffer: Buffer): Promise<ParseResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require('mammoth');
  const { value } = await mammoth.convertToHtml({ buffer });
  return parseBlocks(htmlToBlocks(value));
}

/** Soal yang siap disimpan (lolos validasi minimal). */
export function isValidQuestion(q: ParsedQuestion) {
  return !!q.questionText && q.options.length >= 4 && !!q.correctAnswer && LETTERS.indexOf(q.correctAnswer) < q.options.length;
}
