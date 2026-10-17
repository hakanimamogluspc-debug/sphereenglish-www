'use client';

import { useState } from 'react';

/* Faydalı oldu mu? — oy, www'den api-server'a tarayıcı üzerinden gider (public endpoint) */
const PUBLIC_API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://app.sphereenglish.com'
).replace(/\/$/, '');

export default function HelpFeedback({
  slug,
  initialYes,
  initialNo,
}: {
  slug: string;
  initialYes: number;
  initialNo: number;
}) {
  const [vote, setVote] = useState<boolean | null>(null);
  const [counts, setCounts] = useState({ yes: initialYes, no: initialNo });
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async (helpful: boolean, withComment?: string) => {
    setBusy(true);
    try {
      const r = await fetch(
        `${PUBLIC_API}/api/help/articles/${encodeURIComponent(slug)}/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ helpful, comment: withComment || undefined }),
        }
      );
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setCounts({ yes: d.helpfulYes ?? counts.yes, no: d.helpfulNo ?? counts.no });
        setVote(helpful);
        if (withComment) setSent(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const btn = (active: boolean, activeCls: string) =>
    `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${active ? activeCls : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'}`;

  return (
    <div className="mt-10 rounded-2xl bg-gray-50 border border-gray-200 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-gray-800">Bu makale faydalı oldu mu?</span>
        <button
          disabled={busy}
          onClick={() => send(true)}
          className={btn(vote === true, 'bg-emerald-600 text-white border-emerald-600')}
        >
          👍 Evet <span className="opacity-60">{counts.yes}</span>
        </button>
        <button
          disabled={busy}
          onClick={() => send(false)}
          className={btn(vote === false, 'bg-gray-700 text-white border-gray-700')}
        >
          👎 Hayır <span className="opacity-60">{counts.no}</span>
        </button>
      </div>
      {vote === false && !sent && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Neyi bulamadınız? (isteğe bağlı)"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
            maxLength={500}
          />
          <button
            disabled={busy || !comment.trim()}
            onClick={() => send(false, comment.trim())}
            className="px-4 py-2 rounded-xl bg-[#082567] text-white text-sm font-semibold disabled:opacity-50"
          >
            Gönder
          </button>
        </div>
      )}
      {(sent || vote === true) && <p className="mt-2 text-sm text-emerald-700">Teşekkürler!</p>}
    </div>
  );
}
