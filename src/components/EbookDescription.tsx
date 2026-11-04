'use client';

import { useState, type ReactNode } from 'react';
import { parseBlocks } from '@/lib/markdown-lite';

/**
 * E-kitap açıklaması — admin'de yazılan basit Markdown'ı (## başlık, 1. / - liste, **kalın**)
 * düzgün biçimlendirir ve uzun metni "Devamını oku" ile katlar.
 * Harici kütüphane yok; HTML çalıştırılmaz (yalnızca metin + bilinen biçimler).
 */

/** **kalın** → <strong> */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part)
      ? <strong key={i} className="font-semibold text-[#1B365D]">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>,
  );
}

const COLLAPSE_CHARS = 600;

export default function EbookDescription({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  const long = text.length > COLLAPSE_CHARS || blocks.length > 4;
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-7">
      <div className={`relative text-[15.5px] text-gray-700 leading-relaxed ${long && !open ? 'max-h-[260px] overflow-hidden' : ''}`}>
        <div className="space-y-4">
          {blocks.map((b, i) => {
            if (b.kind === 'h') {
              return <h2 key={i} className="text-[18px] font-extrabold text-[#1B365D] leading-snug pt-1">{inline(b.text)}</h2>;
            }
            if (b.kind === 'ol') {
              return (
                <ol key={i} className="space-y-2.5">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e8eef8] text-[#1e3a6e] text-[12px] font-bold grid place-items-center mt-0.5">{j + 1}</span>
                      <span>{inline(it)}</span>
                    </li>
                  ))}
                </ol>
              );
            }
            if (b.kind === 'ul') {
              return (
                <ul key={i} className="space-y-2">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-2.5">
                      <span aria-hidden="true" className="flex-shrink-0 mt-[9px] w-1.5 h-1.5 rounded-full bg-[#13a9e0]" />
                      <span>{inline(it)}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{inline(b.text)}</p>;
          })}
        </div>
        {long && !open && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold text-[#0e7da6] hover:underline"
        >
          {open ? 'Daha az göster ↑' : 'Devamını oku ↓'}
        </button>
      )}
    </div>
  );
}
