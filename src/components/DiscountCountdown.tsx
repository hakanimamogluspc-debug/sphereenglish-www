"use client";

import { useEffect, useState } from "react";

/**
 * İndirim geri sayımı — client component.
 * endsAt ISO string. Süre dolmuşsa render etmez.
 */
export default function DiscountCountdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const end = new Date(endsAt).getTime();
  if (isNaN(end) || end <= now) return null;

  const diff = end - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const urgent = diff < 24 * 60 * 60 * 1000; // 24 saatten az

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border ${urgent ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"} ${className ?? ""}`}>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${urgent ? "text-red-700" : "text-amber-800"}`}>
        {urgent ? "⏱ Son gün" : "⏱ İndirim biter"}
      </span>
      <span className={`font-mono text-[13px] font-semibold ${urgent ? "text-red-900" : "text-amber-900"}`}>
        {days > 0 && <>{days}g </>}
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
