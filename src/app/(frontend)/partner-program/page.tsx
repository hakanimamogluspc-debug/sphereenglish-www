import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner Programı — Sphere English",
  description: "Sphere English'i tavsiye et, satışlardan komisyon kazan. %20 ilk ödeme + %10 yenileme (12 ay). 60 günlük tracking, 500 TL'den ödeme.",
  openGraph: {
    title: "Sphere English Partner Programı — %20+%10 Komisyon",
    description: "Influencer, eğitmen, koç ya da sadık müşterilerimiz için: tavsiye et, kazan.",
  },
};

const LMS_URL = "https://app.sphereenglish.com";

export default function PartnerProgramPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white">
      {/* Hero */}
      <section className="py-16 md:py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium mb-4">
          🤝 Sphere Partner Programı
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 text-slate-900">
          Tavsiye et, <span className="text-emerald-600">birlikte büyüyelim</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          Sphere English'i kitlene tanıt; her aboneliğin <strong>ilk ödemesinin %20'sini</strong>
          {" "}+ <strong>12 ay boyunca yenilemelerin %10'unu</strong> kazan.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href={`${LMS_URL}/partner/apply`}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-7 py-3 rounded-lg hover:bg-emerald-700 font-medium shadow-lg"
          >
            Hemen Başvur →
          </a>
          <a
            href="#hesapla"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 border border-emerald-300 px-7 py-3 rounded-lg hover:bg-emerald-50 font-medium"
          >
            Ne kadar kazanırım?
          </a>
        </div>
        <p className="text-xs text-slate-500 mt-6">
          Self-signup + 1-2 iş günü içinde onay · Türkiye'den herkes katılabilir
        </p>
      </section>

      {/* Komisyon yapısı */}
      <section id="hesapla" className="py-12 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Komisyon Yapısı</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Abonelikler" icon="💎">
            <div className="text-3xl font-bold text-emerald-600 mb-1">%20</div>
            <p className="text-sm text-slate-600 mb-3">İlk ödemeden komisyon</p>
            <div className="text-2xl font-bold text-blue-600 mb-1">+ %10</div>
            <p className="text-sm text-slate-600 mb-3">Sonraki 11 yenilemeden</p>
            <div className="text-xs bg-emerald-50 p-3 rounded-md text-emerald-900">
              <strong>Örnek:</strong> Pro yıllık (1099 TL/ay × 12 ay × %17 yıllık indirim = ~10.949 TL)
              <br />
              İlk yıl komisyonun: <strong>2.189 TL</strong>
            </div>
          </Card>
          <Card title="E-kitaplar" icon="📚">
            <div className="text-3xl font-bold text-emerald-600 mb-1">%20</div>
            <p className="text-sm text-slate-600 mb-3">Tek seferlik satış komisyonu</p>
            <div className="text-xs bg-emerald-50 p-3 rounded-md text-emerald-900 mt-12">
              <strong>Örnek:</strong> 199 TL'lik e-kitap satışından komisyonun: <strong>39,80 TL</strong>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <MiniStat label="Cookie süresi" value="60 gün" />
          <MiniStat label="Min ödeme" value="500 TL" />
          <MiniStat label="Ödeme periyodu" value="Her ayın 5'i" />
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">3 Adımda Başla</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Step n={1} title="Başvur" desc="Formu doldur, 1-2 iş günü içinde onaylayalım. Sana özel partner kodu vereceğiz." />
          <Step n={2} title="Paylaş" desc="Partner linkini blog, Instagram, YouTube, mailing — istediğin yerde kullan." />
          <Step n={3} title="Kazan" desc="Her satıştan komisyon panelinden takip et. Her ay otomatik ödeme." />
        </div>
      </section>

      {/* Kim katılabilir */}
      <section className="py-12 px-6 max-w-5xl mx-auto bg-slate-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8">Kimler Katılabilir?</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {[
            ["🎙", "İçerik üreticileri", "YouTube, Instagram, TikTok, Twitter, blog"],
            ["👨‍🏫", "İngilizce eğitmenleri", "Kendi öğrencilerine Sphere'i öner"],
            ["💼", "İK / Kariyer koçları", "Kurumsal müşterine pratik araç sun"],
            ["🌟", "Mevcut Sphere kullanıcıları", "Beğendiysen tavsiye et, sen de kazan"],
          ].map(([i, t, d]) => (
            <div key={t} className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-2xl mb-2">{i}</div>
              <div className="font-semibold text-slate-900 mb-1">{t}</div>
              <div className="text-sm text-slate-600">{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Sıkça Sorulanlar</h2>
        <div className="space-y-3">
          <Faq q="Ne zaman ödeme alırım?">
            14 gün refund penceresi geçtikten sonra komisyon "onaylı" olur. Onaylı bakiyen 500 TL'yi
            geçince her ayın 5'inde IBAN'ına ödeme geçer.
          </Faq>
          <Faq q="Cookie ne kadar saklanır?">
            Linkine tıklayan ziyaretçi için 60 gün boyunca tracking yapılır. Bu süre içinde abone olursa
            komisyon senin olur.
          </Faq>
          <Faq q="Kendi linkimi kullanıp komisyon alabilir miyim?">
            Hayır, self-referral engellenir. Sphere hesabınla bağlı affiliate kodunla yine kendin abone
            olursan komisyon yazılmaz.
          </Faq>
          <Faq q="Müşteri iade alırsa ne olur?">
            14 gün içinde iade ederse komisyon iptal edilir. Sonraki yenilemelere etkisi yok.
          </Faq>
          <Faq q="Vergisel durum?">
            Komisyon ödemelerinde Sphere KVKK gereği TC kimlik ve IBAN ister. Sen kendi vergisel
            yükümlülüklerinden sorumlusun. Yıl sonunda kazançlarının toplamını sana iletiriz.
          </Faq>
          <Faq q="Hangi ürünler kapsamda?">
            Bireysel abonelikler (Core/Pro/Premium, aylık ve yıllık) + tüm e-kitap satışları. Kurumsal
            anlaşmalar manuel olarak değerlendirilir (admin elle komisyon yazar).
          </Faq>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Hazırsan, başlayalım</h2>
        <p className="text-slate-600 mb-8">İlk satıştan komisyon kazanmak 5 dakikalık başvuru kadar yakın.</p>
        <a
          href={`${LMS_URL}/partner/apply`}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 font-medium text-lg shadow-xl"
        >
          Partner Başvurusunu Doldur →
        </a>
      </section>
    </main>
  );
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
      <div className="text-xs text-slate-500 uppercase">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-3">
        {n}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-white border border-slate-200 rounded-lg p-4 group">
      <summary className="font-semibold cursor-pointer text-slate-900 list-none flex justify-between items-center">
        {q}
        <span className="text-emerald-600 group-open:rotate-45 transition">+</span>
      </summary>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{children}</p>
    </details>
  );
}
