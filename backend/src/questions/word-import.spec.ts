import { htmlToBlocks, parseBlocks, isValidQuestion } from './word-import';

const parse = (html: string) => parseBlocks(htmlToBlocks(html));

describe('impor soal dari Word', () => {
  it('format BANK SOAL: sampul diabaikan, bacaan dipakai bersama, kunci & pembahasan dari bagian akhir', () => {
    const html = [
      '<p>TRY OUT UTBK-SNBT 2026</p><table><tr><td><p>Jumlah soal</p></td><td><p>2</p></td></tr></table>',
      '<p><strong>Petunjuk: </strong>Pilih satu jawaban.</p>',
      '<p><em>Teks berikut digunakan untuk menjawab soal nomor 1–2.</em></p>',
      '<p>Penjualan naik 6 unit per bulan.</p>',
      '<table><tr><td><p>Bulan</p></td><td><p>Jan</p></td></tr><tr><td><p>Unit</p></td><td><p>40</p></td></tr></table>',
      '<p><strong>1.</strong>\tBerapa penjualan Februari?</p><p>A.\t44</p><p>B.\t46</p><p>C.\t48</p><p>D.\t50</p><p>E.\t52</p>',
      '<p><strong>2.</strong>\tNilai x<sup>2</sup> untuk x = 3 adalah ....</p><p>A.\t6</p><p>B.\t9</p><p>C.\t12</p><p>D.\t3</p>',
      '<p><em>Soal nomor 3</em></p>',
      '<p><strong>3.</strong>\tJika 2 &lt; x, maka ....</p><p>A.\tx = 1</p><p>B.\tx = 2</p><p>C.\tx = 3</p><p>D.\tx = 0</p><p>E.\tx = −1</p>',
      '<h1>Kunci Jawaban — Contoh</h1>',
      '<table><tr><td><p>No.</p></td><td><p>Kunci</p></td><td><p>No.</p></td><td><p>Kunci</p></td></tr>',
      '<tr><td><p>1</p></td><td><p>B</p></td><td><p>3</p></td><td><p>C</p></td></tr><tr><td><p>2</p></td><td><p>B</p></td></tr></table>',
      '<h1>Pembahasan</h1><p>1.  Jawaban: B  (46)</p><p>40 + 6 = 46.</p><p>2.  Jawaban: B</p><p>3² = 9.</p>',
    ].join('');
    const { questions, warnings } = parse(html);
    expect(warnings).toEqual([]);
    expect(questions).toHaveLength(3);
    expect(questions[0].passage).toContain('Penjualan naik 6 unit');
    expect(questions[0].passage).toContain('Bulan | Jan');
    expect(questions[1].passage).toBe(questions[0].passage);
    expect(questions[2].passage).toBe('');
    expect(questions[1].questionText).toBe('Nilai x² untuk x = 3 adalah ....');
    expect(questions[1].options).toHaveLength(4);
    expect(questions[2].questionText).toBe('Jika 2 < x, maka ....');
    expect(questions.map((q) => q.correctAnswer)).toEqual(['b', 'b', 'c']);
    expect(questions[0].explanation).toBe('40 + 6 = 46.');
    expect(questions.every(isValidQuestion)).toBe(true);
  });

  it('format sederhana: kunci & pembahasan langsung di bawah soal', () => {
    const { questions, warnings } = parse(
      '<p>1. Ibu kota Indonesia adalah ....</p><p>A. Bandung</p><p>B. Jakarta</p><p>C. Medan</p><p>D. Surabaya</p>' +
      '<p>Jawaban: B</p><p>Pembahasan: Jakarta adalah ibu kota.</p>' +
      '<p>2. Soal tanpa kunci</p><p>A. a</p><p>B. b</p><p>C. c</p>',
    );
    expect(questions[0].correctAnswer).toBe('b');
    expect(questions[0].explanation).toBe('Jakarta adalah ibu kota.');
    expect(isValidQuestion(questions[1])).toBe(false);
    expect(warnings).toEqual([
      'Soal 2: hanya 3 opsi terbaca (minimal A–D).',
      'Soal 2: kunci jawaban tidak ditemukan.',
    ]);
  });

  it('angka di awal paragraf bacaan (mis. "1.200 pelajar") bukan nomor soal', () => {
    const { questions } = parse('<p>Soal nomor 1</p><p>1.200 pelajar disurvei.</p><p>1. Berapa?</p><p>A. 1</p><p>B. 2</p><p>C. 3</p><p>D. 4</p><p>Kunci: A</p>');
    expect(questions).toHaveLength(1);
    expect(questions[0].passage).toBe('1.200 pelajar disurvei.');
  });
});
