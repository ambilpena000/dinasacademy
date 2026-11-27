import React from 'react';

/**
 * Menampilkan teks bacaan (passage) + teks soal.
 * Baris berisi " | " dianggap baris tabel (hasil impor tabel dari Word).
 */
export function PassageText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n');
        if (lines.length && lines.every((l) => l.includes(' | '))) {
          const rows = lines.map((l) => l.split(' | '));
          return (
            <div key={i} className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm border border-gray-200 bg-white">
                <tbody>
                  {rows.map((r, ri) => (
                    <tr key={ri} className={ri === 0 ? 'bg-blue-50 font-semibold' : ''}>
                      {r.map((c, ci) => <td key={ci} className="border border-gray-200 px-2 py-1 text-center">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={i} className="whitespace-pre-line text-justify">{para}</p>;
      })}
    </div>
  );
}

export function QuestionContent({ passage, questionText, className = '' }: {
  passage?: string | null; questionText: string; className?: string;
}) {
  return (
    <div className={className}>
      {passage ? (
        <div className="mb-4 max-h-[45vh] overflow-y-auto rounded-xl border-l-4 border-[#2563EB] bg-slate-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
          <PassageText text={passage} />
        </div>
      ) : null}
      <p className="whitespace-pre-line leading-relaxed">{questionText}</p>
    </div>
  );
}
