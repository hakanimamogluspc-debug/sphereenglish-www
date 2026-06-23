'use client';

import { useState, useMemo } from 'react';

interface Props {
  cover: string | null;
  gallery: string[];
  title: string;
  author: string;
  publisher: string;
}

export default function EbookGallery({ cover, gallery, title, author, publisher }: Props) {
  // Tüm görseller: cover + gallery (cover varsa başta)
  const images = useMemo(() => {
    const arr: string[] = [];
    if (cover) arr.push(cover);
    for (const g of gallery) {
      if (g && g !== cover) arr.push(g);
    }
    return arr;
  }, [cover, gallery]);

  const [activeIdx, setActiveIdx] = useState(0);
  const active = images[activeIdx] ?? cover;

  if (images.length === 0) {
    // Fallback: gradient placeholder
    return (
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] shadow-2xl" />
    );
  }

  return (
    <div>
      {/* Ana görsel */}
      <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-50 to-white relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active!}
          alt={`${title} — ${author}, ${publisher}`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Thumbnail satırı (en az 2 görsel varsa) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActiveIdx(i)}
              className={`aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-white transition-all border-2 ${
                i === activeIdx
                  ? 'border-[#0ea5e9] ring-2 ring-[#0ea5e9]/30'
                  : 'border-gray-200 hover:border-[#0ea5e9]/50'
              }`}
              aria-label={`Görsel ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${title} görsel ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
