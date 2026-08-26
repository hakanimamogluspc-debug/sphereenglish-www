import Link from 'next/link';
import { PROGRAMMES } from '@/lib/courses-catalog';
import { COHORTS } from '@/lib/cohort-config';
import { GROUP_SIZE } from '@/lib/business-config';
import { ArrowRight, Users, Calendar, Video } from 'lucide-react';

/**
 * Homepage — "Kurslar" bölümü.
 * Hero'dan hemen sonra gelen ilk güçlü ticari alan.
 * §9 doküman kuralı: 2 program kartı, kısa özet, "Programı İncele" CTA.
 */
export default function CoursesSection() {
  return (
    <section className="py-16 lg:py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
            İŞ İNGİLİZCESİ KURSLARI
          </p>
          <h2 className="text-[28px] lg:text-[42px] font-extrabold text-[#1B365D] tracking-tight leading-tight">
            Seviyene Uygun Programı Seç
          </h2>
          <p className="text-[15px] text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
            4 haftalık, canlı grup programları. Maksimum {GROUP_SIZE.max} kişi. Türk profesyoneller için tasarlandı.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {PROGRAMMES.map((p) => {
            const cohort = COHORTS.find((c) => c.programmeSlug === p.levelSlug);
            const isWaitlist = cohort?.status === 'waitlist';
            return (
              <article
                key={p.levelSlug}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-[#0ea5e9]/40 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative border-b border-gray-100 px-7 pt-6 pb-5">
                  <div className="absolute top-6 left-0 w-1 h-12 bg-[#0ea5e9]" />
                  <div className="pl-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B365D] text-white text-[11px] font-bold uppercase tracking-[0.14em]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
                        {p.levelBadge}
                      </span>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-[13px] font-extrabold tracking-wide">
                        {p.levelCefr}
                      </span>
                      {isWaitlist && (
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                          Eylül Ön Kayıt
                        </span>
                      )}
                    </div>
                    <h3 className="text-[24px] lg:text-[28px] font-extrabold text-[#1B365D] leading-[1.15] tracking-tight">
                      {p.titleTr}
                    </h3>
                    <p className="text-[12px] text-gray-400 italic mt-1.5">{p.titleEn}</p>
                  </div>
                </div>

                <div className="px-7 py-6 flex-1 flex flex-col">
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-6">{p.tagline}</p>

                  <div className="flex flex-wrap gap-4 mb-6 text-[12px] text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0ea5e9]" strokeWidth={1.8} />
                      4 hafta
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#0ea5e9]" strokeWidth={1.8} />
                      Maks {GROUP_SIZE.max} kişi
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#0ea5e9]" strokeWidth={1.8} />
                      %100 canlı
                    </span>
                  </div>

                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                        4 HAFTA
                      </div>
                      <div className="text-[24px] font-extrabold text-[#1B365D] leading-none mt-1">
                        {p.price}
                      </div>
                    </div>
                    <Link
                      href={`/is-ingilizcesi-kursu/${p.levelSlug}`}
                      className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-[13px] transition-colors whitespace-nowrap"
                    >
                      Programı İncele
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/is-ingilizcesi-kursu"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#1B365D] hover:text-[#0ea5e9] transition-colors"
          >
            Tüm program detaylarını gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
