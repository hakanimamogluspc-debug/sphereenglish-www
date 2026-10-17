'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpSearch({ initialQuery }: { initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();
  return (
    <form
      className="max-w-xl mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        const t = q.trim();
        router.push(t ? `/yardim?q=${encodeURIComponent(t)}` : '/yardim');
      }}
      role="search"
    >
      <div className="flex rounded-2xl bg-white overflow-hidden ring-2 ring-transparent focus-within:ring-[#13a9e0]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Örn: şifremi unuttum, fatura, seviye sınavı"
          className="flex-1 px-5 py-4 text-gray-900 text-[15px] outline-none"
          aria-label="Yardım makalelerinde ara"
        />
        <button
          type="submit"
          className="px-6 font-bold text-white bg-[#13a9e0] hover:bg-[#0e7da6] transition-colors"
        >
          Ara
        </button>
      </div>
    </form>
  );
}
