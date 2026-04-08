'use client';
import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NAVY = '#1B365D';
const TURQUOISE = '#0ea5e9';

const AI_FEATURES = [
  {
    icon: '🎙️',
    title: 'Telaffuz Koçu',
    subtitle: 'PRONUNCIATION COACH',
    description:
      '11 farklı aksan ve uzmanlık alanına sahip yapay zeka koçuyla gerçek zamanlı konuşma pratiği yapın. Whisper AI ile söylediğiniz her kelime analiz edilir, anında geri bildirim alırsınız.',
    highlights: ['11 farklı koç & aksan', 'Gerçek zamanlı ses analizi', 'Kelime bazlı telaffuz skoru', 'GPT-4o konuşma motoru'],
    color: '#0ea5e9',
    bg: 'from-sky-50 to-cyan-50',
    link: 'https://app.sphereenglish.com/student/pronunciation-coach',
    tag: 'En Popüler',
    tagBg: '#0ea5e9',
  },
  {
    icon: '✍️',
    title: 'Yazma Koçu',
    subtitle: 'WRITING COACH',
    description:
      'İş e-postasından akademik makaleye, rapor yazmadan yaratıcı içeriğe kadar her türlü metni yapay zeka ile analiz ettirin. CEFR seviyenizi öğrenin, geliştirilmiş versiyon alın.',
    highlights: ['CEFR seviye tespiti (A1–C2)', 'Gramer, kelime, tutarlılık skoru', 'AI ile düzeltilmiş versiyon', '7 farklı metin türü'],
    color: '#7c3aed',
    bg: 'from-violet-50 to-purple-50',
    link: 'https://app.sphereenglish.com/student/writing-coach',
    tag: 'Yeni',
    tagBg: '#7c3aed',
  },
  {
    icon: '🧠',
    title: 'Dilbilgisi Koçu',
    subtitle: 'GRAMMAR COACH',
    description:
      "A1'den C1'e yapılandırılmış öğrenme yolları. Yanlış cevap verdiğinizde yapay zeka devreye girerek hatanın tam nedenini açıklar — ezber değil, anlayarak öğrenin.",
    highlights: ['A1–C1 yapılandırılmış müfredat', 'AI hata analizi', 'Kural özeti & örnekler', 'Kişiselleştirilmiş geri bildirim'],
    color: '#059669',
    bg: 'from-emerald-50 to-green-50',
    link: 'https://app.sphereenglish.com/student/grammar-coach',
    tag: null,
    tagBg: null,
  },
  {
    icon: '🎮',
    title: 'Kelime Oyunu',
    subtitle: 'VOCAB GAME',
    description:
      'Oyunlaştırılmış kelime öğrenme deneyimi. Liderlik tablosu, puan sistemi ve adaptif zorluk seviyeleriyle kelime haznenizi genişletirken eğlenin.',
    highlights: ['Adaptif zorluk sistemi', 'Liderlik tablosu & sıralama', 'Streak & rozet sistemi', '4000+ iş İngilizcesi kelimesi'],
    color: '#d97706',
    bg: 'from-amber-50 to-orange-50',
    link: 'https://app.sphereenglish.com/student/vocab-game',
    tag: null,
    tagBg: null,
  },
];

const COACHES = [
  { id: 'sterling', name: 'Mr. Sterling', flag: '🇬🇧', specialty: 'CEO & Stratejik Yönetim', accent: 'Üst Segment İngiliz (RP)', color: '#1E3A5F', image: 'coach-sterling.png', bio: '30 yılı küresel şirketlerin yönetim kurullarında geçirmiş emektar bir yönetici. Az ve öz konuşur; liderlik dili, stratejik sunum ve C-suite toplantı jargonu onun uzmanlık bölgesi.', idealFor: 'Yönetici adayları · Yabancı yatırımcı görüşmeleri · Kurumsal sunum' },
  { id: 'jake', name: 'Jake', flag: '🇺🇸', specialty: 'Pazarlama & Dijital Medya', accent: 'West Coast Amerikan', color: '#EA580C', image: 'coach-jake.png', bio: 'San Francisco enerjisiyle dijital çağın konuşma dilini öğretiyor. Güncel jargon, kısa ve etkili pitch yapısı, sosyal medya ve startup toplantı İngilizcesi onun alanı.', idealFor: 'Dijital pazarlama · Girişimciler · Akıcı Amerikan İngilizcesi' },
  { id: 'david', name: 'David', flag: '🇺🇸', specialty: 'Finans & Yatırım', accent: 'New York (Wall Street)', color: '#0369A1', image: 'coach-david.png', bio: "Wall Street'te yetişmiş, rakamlara hâkim ve zamanın kıymetini bilen biri. Yatırım sunumları, finansal raporlama dili ve CFO toplantıları onun uzmanlığı.", idealFor: 'Finans & bankacılık · Yabancı müşteri görüşmeleri · Analitik sunum' },
  { id: 'emma', name: 'Emma', flag: '🇬🇧', specialty: 'İnsan Kaynakları', accent: 'Standart İngiliz (London)', color: '#BE185D', image: 'coach-emma-hr.png', bio: 'Empatik ve insan odaklı. Mülakat İngilizcesi, cover letter dili, performans görüşmeleri ve ekip içi iletişim konusunda standart ama sıcak bir İngiliz aksanıyla rehberlik eder.', idealFor: 'İş başvurusu · İK profesyonelleri · Mülakat hazırlığı' },
  { id: 'raj', name: 'Raj', flag: '🇮🇳', specialty: 'BT & Yazılım Geliştirme', accent: 'Hint-İngiliz (Global Tech)', color: '#7C3AED', image: 'coach-raj.png', bio: "Hindistan'dan Silicon Valley'e uzanan kariyeriyle global teknoloji şirketlerinin dil kodunu çok iyi biliyor. Teknik sunum, proje yönetimi ve scrum toplantıları onun uzmanlığı.", idealFor: 'Yazılımcılar · IT yöneticileri · Teknik sunum dili' },
  { id: 'hans', name: 'Hans', flag: '🇩🇪', specialty: 'Lojistik & Operasyon', accent: 'Alman-İngiliz (Euro-English)', color: '#374151', image: 'coach-hans.png', bio: 'Düzenli, sistematik ve son derece pratik. Tedarik zinciri jargonu, lojistik koordinasyon dili ve Avrupa iş ortaklarıyla iletişim konusunda gerçekçi alıştırmalar sunar.', idealFor: 'Lojistik & tedarik zinciri · Avrupa iş iletişimi · Operasyon yöneticileri' },
  { id: 'elena', name: 'Elena', flag: '🇪🇺', specialty: 'Uluslararası Hukuk', accent: 'Diplomatik (Doğu Avrupa)', color: '#065F46', image: 'coach-elena.png', bio: 'Uluslararası tahkim, sözleşme müzakeresi ve Avrupa kurumlarında deneyimli. Hukuki metinleri anlık çözümleyen ve kesin bir diplomatik dil kullanan mükemmeliyetçi bir koç.', idealFor: 'Hukuk profesyonelleri · Uluslararası sözleşmeler · Diplomatik İngilizce' },
  { id: 'alistair', name: 'Alistair', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', specialty: 'Satış & Müzakere', accent: 'İskoç (Edinburg)', color: '#B91C1C', image: 'coach-alistair.png', bio: "Edinburg doğumlu, sahadan yetişmiş bir satış efsanesi. Müzakere teknikleri, ikna dili, itiraz yönetimi ve kapanış cümleleri konusunda rakipsiz bir pratikçi.", idealFor: 'Satış uzmanları · Müzakere becerileri · Kurumsal fiyatlama görüşmeleri' },
  { id: 'chloe', name: 'Chloe', flag: '🇦🇺', specialty: 'Müşteri İlişkileri', accent: 'Avusturalyalı (Friendly)', color: '#D97706', image: 'coach-chloe.png', bio: "Melbourne'dan dünyaya; sıcak, samimi ve rahatlatıcı. Müşteri destek İngilizcesi, şikâyet yönetimi, e-ticaret iletişimi ve günlük konuşma pratiği onun güçlü yanları.", idealFor: 'Müşteri hizmetleri · Çağrı merkezi · Samimi Avustralya İngilizcesi' },
  { id: 'james', name: 'James', flag: '🇺🇸', specialty: 'Üretim & Fabrika Yönetimi', accent: 'Amerikan (Midwest)', color: '#78350F', image: 'coach-james-mfg.png', bio: "Ohio'da yetişmiş, fabrika sahasından yönetim masasına çıkmış biri. Üretim süreçleri jargonu, iş güvenliği talimatları ve tedarikçi görüşmeleri konusunda direkt ve güvenilir.", idealFor: 'Üretim & imalat yöneticileri · Endüstriyel sektör · Teknik Amerikan İngilizcesi' },
  { id: 'claire', name: 'Dr. Claire', flag: '🇬🇧', specialty: 'Gramer & İleri Telaffuz', accent: 'Akademik İngiliz (Oxford)', color: '#0F766E', image: 'coach-claire-grammar.png', bio: "Oxford'da yetişmiş dil bilimci. Makale kullanımı, sesli harf seslenimleri, cümle vurgusu gibi Türk öğrencilerin zorlandığı noktalara odaklanır — sabırlı, titiz ve sistematik.", idealFor: 'IELTS · TOEFL · Akademik sunum · C1/C2 hedefleyenler' },
];

const STATS = [
  { value: '11', label: 'Yapay Zeka Koçu' },
  { value: '4', label: 'AI Özelliği' },
  { value: '4000+', label: 'Kelime & Kural' },
  { value: 'A1–C2', label: 'CEFR Seviyeleri' },
];

export default function AIStudioPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header forceWhite />
      <main>

        {/* HERO */}
        <section
          className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 pt-44 pb-28"
          style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a6e 50%, #1a4a8a 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }} />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }} />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-sm font-semibold"
              style={{ background: '#0ea5e922', color: '#0ea5e9', border: '1px solid #0ea5e944' }}>
              ✦ Yapay Zeka Destekli İngilizce Eğitim
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-2"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Sphere <span style={{ color: '#0ea5e9' }}>AI</span><br />Studio
            </h1>
            <p className="text-xl text-white/60 mt-6 mb-10 max-w-2xl mx-auto leading-relaxed">
              Gerçek zamanlı yapay zeka koçları, akıllı analiz araçları ve oyunlaştırılmış öğrenme deneyimiyle İngilizceyi hızla geliştirin.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="https://app.sphereenglish.com/student/pronunciation-coach"
                className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base transition-all hover:opacity-90 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 8px 32px #0ea5e944' }}>
                🎙️ Koçla Konuş
              </a>
              <a href="https://app.sphereenglish.com/register"
                className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold text-white/80 text-base border border-white/20 hover:border-white/40 transition-all hover:bg-white/10">
                Ücretsiz Başla →
              </a>
            </div>
          </div>

          <div className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-px w-full max-w-3xl rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-5 px-4">
                <span className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</span>
                <span className="text-xs text-white/50 text-center">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI FEATURES */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>— Yapay Zeka Araçları</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B365D' }}>
                4 Güçlü AI Özelliği
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Her biri farklı bir öğrenme ihtiyacına yönelik, birlikte eksiksiz bir İngilizce deneyimi.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AI_FEATURES.map((f) => (
                <a key={f.title} href={f.link}
                  className={"block rounded-3xl p-8 bg-gradient-to-br " + f.bg + " border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: f.color + '15' }}>
                      {f.icon}
                    </div>
                    {f.tag && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: f.tagBg || f.color }}>
                        {f.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B365D' }}>{f.title}</h3>
                  <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: f.color }}>{f.subtitle}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{f.description}</p>
                  <ul className="space-y-2">
                    {f.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px]"
                          style={{ background: f.color }}>✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: f.color }}>
                    Hemen Başla →
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* COACHES */}
        <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, white 0%, #f0f7ff 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>— Yapay Zeka Koçları</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B365D' }}>
                11 Uzman, 11 Farklı Dünya
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Her biri kendi sektörüne özgü dil ve aksanla; gerçek bir iş ortamına hazırlayan koçlar.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {COACHES.map((coach) => (
                <div key={coach.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="flex items-center gap-4 p-5 pb-4"
                    style={{ background: coach.color + '10' }}>
                    <div className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={"/assets/images/coaches/" + coach.image}
                        alt={coach.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-2xl object-cover shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-sm leading-none">
                        {coach.flag}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-lg leading-tight mb-0.5 truncate" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B365D' }}>
                        {coach.name}
                      </h4>
                      <p className="text-xs font-bold mb-1 truncate" style={{ color: coach.color }}>{coach.specialty}</p>
                      <p className="text-xs text-gray-400 truncate">🔊 {coach.accent}</p>
                    </div>
                  </div>
                  <div className="px-5 pt-3 pb-3 flex-1">
                    <p className="text-sm text-gray-600 leading-relaxed">{coach.bio}</p>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="rounded-xl px-3 py-2.5" style={{ background: coach.color + '0d', borderLeft: '3px solid ' + coach.color }}>
                      <p className="text-xs font-bold mb-0.5 uppercase tracking-wide" style={{ color: coach.color }}>Kimler için ideal?</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{coach.idealFor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6" style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a6e 60%, #1a4a8a 100%)' }}>
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-sm font-semibold"
                style={{ background: '#0ea5e922', color: '#0ea5e9', border: '1px solid #0ea5e944' }}>
                ★ Ücretsiz Dene
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4"
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                AI Koçunla Tanış,<br />Farklı Konuş.
              </h2>
              <p className="text-white/60 text-lg mb-10">Kayıt ol, koçunu seç ve ilk dersini hemen başlat.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="https://app.sphereenglish.com/register"
                  className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold text-white text-base hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 8px 32px #0ea5e944' }}>
                  ✦ Hemen Başla — Ücretsiz
                </a>
                <a href="https://app.sphereenglish.com/student/pronunciation-coach"
                  className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-bold text-white/70 text-base border border-white/20 hover:border-white/40 transition-all hover:bg-white/10">
                  🌐 Koçları Keşfet
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
