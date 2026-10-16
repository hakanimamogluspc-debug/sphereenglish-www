export const dynamic = 'force-dynamic';

import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { fetchPublishedCaseStudies } from '@/payload/api';

export const metadata: Metadata = {
  title: 'Referanslar ve Vaka Çalışmaları | Kurumsal İngilizce Eğitimi',
  description:
    'Sphere English ile çalışan şirketlerin gerçek sonuçları: katılımcı sayısı, tamamlanan dersler, seviye değişimi ve yöneticilerin gözlemleri. Uydurma rakam yok; her vaka müşteriyle doğrulanmıştır.',
  alternates: { canonical: 'https://www.sphereenglish.com/referanslar' },
  openGraph: {
    title: 'Referanslar ve Vaka Çalışmaları | Sphere English',
    description:
      'Kurumsal İngilizce eğitiminde ölçülebilir sonuçlar: gerçek şirketler, gerçek rakamlar.',
    url: 'https://www.sphereenglish.com/referanslar',
  },
};

function levelRange(levels: { level: string; count: number }[] | undefined) {
  if (!levels || levels.length === 0) return null;
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const sorted = [...levels].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
  const lo = sorted[0].level;
  const hi = sorted[sorted.length - 1].level;
  return lo === hi ? lo : `${lo}–${hi}`;
}

export default async function ReferanslarPage() {
  let cases: any[] = [];
  try {
    cases = await fetchPublishedCaseStudies();
  } catch (err) {
    console.warn('[referanslar] Payload erişilemedi:', err);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header forceWhite />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 sm:px-6 bg-gradient-to-br from-[#082567] to-[#1a3a8f] text-white text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-blue-200 uppercase mb-4">
            Referanslar
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
            Şirketler ne sonuç aldı?
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Burada gördüğünüz her rakam ilgili şirketle doğrulanmıştır. Anonim yayınlanan vakalarda
            şirket adı müşterinin tercihiyle gizlidir; sektör, ekip büyüklüğü ve sonuçlar gerçektir.
          </p>
        </section>

        {/* Liste */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {cases.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-[15px] mb-6">
                  Vaka çalışmaları yakında yayında. Referans görüşmesi için bizimle iletişime
                  geçebilirsiniz.
                </p>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center bg-[#082567] hover:bg-[#0a2d7a] text-white px-8 py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all"
                >
                  Referans Görüşmesi Talep Et
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cases.map((cs: any) => {
                  const name = cs.anonymous ? cs.displayName : cs.companyName || cs.displayName;
                  const before = levelRange(cs.levelsBefore);
                  const after = levelRange(cs.levelsAfter);
                  const metrics: { value: string; label: string }[] = (cs.metrics || []).slice(
                    0,
                    3
                  );
                  return (
                    <Link
                      key={cs.id}
                      href={`/referanslar/${cs.slug}`}
                      className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-7 hover:border-[#082567]/25 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#0e7da6]">
                          {cs.industry}
                        </span>
                        {cs.featured && (
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-[#e8eef8] text-[#082567] px-2.5 py-1 rounded-full">
                            Öne çıkan
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-[#082567] leading-snug mb-2 group-hover:text-[#0a2d7a]">
                        {cs.title}
                      </h2>
                      <p className="text-[13px] text-gray-500 mb-4">
                        {name} · {cs.companySize} · {cs.participants} katılımcı
                      </p>
                      <p className="text-[15px] text-gray-700 leading-relaxed mb-6 flex-1">
                        {cs.summary}
                      </p>

                      {metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                          {metrics.map((m, i) => (
                            <div key={i}>
                              <div className="text-xl font-extrabold text-[#082567] leading-none">
                                {m.value}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-1.5 leading-snug">
                                {m.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {before && after && (
                        <div className="mt-5 flex items-center gap-2 text-[13px] font-semibold">
                          <span className="text-gray-500">Seviye</span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                            {before}
                          </span>
                          <span className="text-[#13a9e0]">→</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#e8eef8] text-[#082567]">
                            {after}
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-[#082567] mb-4">
              Ekibiniz için benzer bir program
            </h3>
            <p className="text-gray-600 mb-8 text-[15px]">
              İhtiyacınızı 20 dakikalık bir görüşmede dinleyelim; seviye ölçümü, program planı ve
              teklifi aynı hafta içinde paylaşalım.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center bg-[#082567] hover:bg-[#0a2d7a] text-white px-8 py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all duration-200 hover:shadow-md"
              >
                Kurumsal Teklif Al
              </Link>
              <Link
                href="/cozumler"
                className="inline-flex items-center justify-center bg-white border border-gray-200 text-[#082567] px-8 py-4 rounded-2xl text-[15px] font-semibold tracking-wide transition-all duration-200 hover:border-[#082567]/30"
              >
                Çözümleri İncele
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
