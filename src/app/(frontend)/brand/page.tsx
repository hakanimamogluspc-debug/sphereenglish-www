'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NAVY = '#1e3a6e';
const TURQUOISE = '#13a9e0';

interface LogoVariant {
  name: string;
  description: string;
  src: string;
  bg: 'light' | 'dark';
  downloads: { label: string; href: string }[];
}

const logoVariants: LogoVariant[] = [
  {
    name: 'Birincil Logo',
    description:
      'S monogramı + "SPHERE ENGLISH" yazısı. Ana kullanım için — header, sunum, broşür.',
    src: '/brand-kit/logo/sphere-logo-primary.png',
    bg: 'light',
    downloads: [{ label: 'PNG 1563', href: '/brand-kit/logo/sphere-logo-primary.png' }],
  },
  {
    name: 'Birincil Logo · Koyu Zemin',
    description: 'Koyu (lacivert/siyah) arka plan üzerinde tercih edilir.',
    src: '/brand-kit/logo/sphere-logo-primary.png',
    bg: 'dark',
    downloads: [{ label: 'PNG 1563', href: '/brand-kit/logo/sphere-logo-primary.png' }],
  },
  {
    name: 'S Monogramı',
    description: 'Sadece ikon — favicon, uygulama ikonu, sosyal medya profil görseli (kare).',
    src: '/brand-kit/logo/sphere-icon.png',
    bg: 'light',
    downloads: [{ label: 'PNG 1563', href: '/brand-kit/logo/sphere-icon.png' }],
  },
  {
    name: 'Yatay Wordmark',
    description: 'Tek satır SPHERE ENGLISH yazısı — geniş alanlar, banner, e-posta başlığı.',
    src: '/brand-kit/logo/sphere-wordmark-wide.png',
    bg: 'light',
    downloads: [
      { label: 'PNG 6250', href: '/brand-kit/logo/sphere-wordmark-wide.png' },
      { label: 'PNG (Alt)', href: '/brand-kit/logo/sphere-wordmark-wide-alt.png' },
    ],
  },
  {
    name: 'Yatay Wordmark · Koyu Zemin',
    description: 'Koyu zeminde tek satır kullanım — sosyal medya kapağı, footer.',
    src: '/brand-kit/logo/sphere-wordmark-wide.png',
    bg: 'dark',
    downloads: [{ label: 'PNG 6250', href: '/brand-kit/logo/sphere-wordmark-wide.png' }],
  },
  {
    name: 'Yığılı Wordmark',
    description: 'İki satıra bölünmüş SPHERE / ENGLISH — kare ya da kompakt alanlar için.',
    src: '/brand-kit/logo/sphere-wordmark-stacked.png',
    bg: 'light',
    downloads: [{ label: 'PNG 1563', href: '/brand-kit/logo/sphere-wordmark-stacked.png' }],
  },
];

interface ColorChip {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
  textColor?: string;
}

const primaryColors: ColorChip[] = [
  {
    name: 'Primary Navy',
    hex: '#1e3a6e',
    rgb: '30, 58, 110',
    usage: 'Header, başlık, CTA arka planı',
    textColor: '#ffffff',
  },
  {
    name: 'Accent Turquoise',
    hex: '#13a9e0',
    rgb: '19, 169, 224',
    usage: 'Vurgu, buton, link, ikon',
    textColor: '#ffffff',
  },
];

const supportColors: ColorChip[] = [
  { name: 'Başarı', hex: '#22c55e', rgb: '34, 197, 94', usage: 'Doğru cevap, tamamlama', textColor: '#ffffff' },
  { name: 'Uyarı', hex: '#f59e0b', rgb: '245, 158, 11', usage: 'Önemli bilgi, hatırlatma', textColor: '#ffffff' },
  { name: 'Hata', hex: '#ef4444', rgb: '239, 68, 68', usage: 'Yanlış cevap, hata', textColor: '#ffffff' },
  { name: 'Nötr', hex: '#64748b', rgb: '100, 116, 139', usage: 'İkincil metin, kenarlık', textColor: '#ffffff' },
];

const navyScale: ColorChip[] = [
  { name: 'Navy 50', hex: '#e8eef8', rgb: '232, 238, 248', usage: 'Yumuşak arka plan' },
  { name: 'Navy 100', hex: '#c5d3ed', rgb: '197, 211, 237', usage: 'Hover, divider' },
  { name: 'Navy 200', hex: '#8ba7d9', rgb: '139, 167, 217', usage: 'İkonlar, pasif metin', textColor: '#ffffff' },
  { name: 'Navy 400', hex: '#4e77be', rgb: '78, 119, 190', usage: 'İkincil aksiyon', textColor: '#ffffff' },
  { name: 'Navy 700', hex: '#1e3a6e', rgb: '30, 58, 110', usage: 'Birincil marka rengi', textColor: '#ffffff' },
];

interface Trait {
  icon: string;
  title: string;
  description: string;
  good: string;
  bad: string;
}

const voiceTraits: Trait[] = [
  {
    icon: '🤝',
    title: 'Güvenilir',
    description: 'Bilgili, ama gösteriş yapmayan. Uzman ama ulaşılabilir.',
    good: '"Bu derste öğrendiklerinizi hemen kullanabilirsiniz."',
    bad: '"Paradigma değiştiren metodolojimiz..."',
  },
  {
    icon: '🚀',
    title: 'Teşvik Edici',
    description: 'Öğrenciyi cesaretlendiren, destekleyen, motive eden.',
    good: '"Harika ilerliyorsunuz! 3 gün üst üste ders tamamladınız."',
    bad: '"Eksik kalan 47 dersiniz var."',
  },
  {
    icon: '💎',
    title: 'Net & Sade',
    description: 'Açık, anlaşılır, jargon kullanmayan, doğrudan.',
    good: '"Bugünkü hedefiniz: 15 kelime öğrenmek."',
    bad: '"Optimal leksik edinim sürecini optimize edin."',
  },
];

function CopyableColor({ chip }: { chip: ColorChip }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(chip.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };
  const dark = chip.textColor === '#ffffff';
  return (
    <button
      onClick={onCopy}
      className="group text-left rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 bg-white"
      title="HEX değerini kopyala"
    >
      <div
        className="h-32 flex items-end p-4 relative"
        style={{ background: chip.hex, color: chip.textColor || '#1e3a6e' }}
      >
        <span
          className="text-sm font-semibold opacity-90"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {chip.name}
        </span>
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
            copied ? 'bg-white/95 text-emerald-700' : dark ? 'bg-white/15 text-white' : 'bg-black/10 text-gray-700'
          } transition-colors`}
        >
          {copied ? '✓ Kopyalandı' : 'Kopyala'}
        </span>
      </div>
      <div className="p-4 bg-white">
        <div className="font-mono text-base font-bold" style={{ color: NAVY }}>
          {chip.hex}
        </div>
        <div className="font-mono text-[11px] text-gray-500 mt-0.5">RGB {chip.rgb}</div>
        <div className="text-xs text-gray-600 mt-2 leading-relaxed">{chip.usage}</div>
      </div>
    </button>
  );
}

function LogoCard({ variant }: { variant: LogoVariant }) {
  const isDark = variant.bg === 'dark';
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white flex flex-col">
      <div
        className="h-64 flex items-center justify-center p-8"
        style={{
          background: isDark ? '#0d1f4e' : '#fafbfc',
          backgroundImage: isDark
            ? 'none'
            : 'linear-gradient(45deg, #f4f5f7 25%, transparent 25%), linear-gradient(-45deg, #f4f5f7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f4f5f7 75%), linear-gradient(-45deg, transparent 75%, #f4f5f7 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <Image
          src={variant.src}
          alt={variant.name}
          width={400}
          height={200}
          className="max-h-full w-auto object-contain"
          style={{
            filter: isDark ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'none',
          }}
          unoptimized
        />
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3
            className="text-lg font-bold mb-1"
            style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
          >
            {variant.name}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{variant.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-auto">
          {variant.downloads.map((d) => (
            <a
              key={d.href + d.label}
              href={d.href}
              download
              className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200 hover:border-[#13a9e0] hover:text-[#13a9e0] transition-colors"
              style={{ color: NAVY }}
            >
              ↓ {d.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <main className="bg-white">
      <Header forceWhite />

      {/* Hero */}
      <section
        className="pt-36 pb-20 px-6 lg:px-10"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e8eef8 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div
            className="inline-block text-xs font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: TURQUOISE }}
          >
            Sphere English Brand Kit
          </div>
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-5"
            style={{ color: NAVY, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}
          >
            Sphere English'i doğru kullanmak için her şey
          </h1>
          <p
            className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Logolar, renk paleti, tipografi ve marka rehberi — hepsi tek yerde, indirilebilir.
            Basın ve içerik talepleri için{' '}
            <a
              href="mailto:info@sphereenglish.com"
              className="font-semibold underline decoration-[#13a9e0] decoration-2 underline-offset-4 hover:text-[#13a9e0]"
              style={{ color: NAVY }}
            >
              info@sphereenglish.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* Logo */}
      <section className="py-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: TURQUOISE }}
            >
              Logo
            </div>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
            >
              Logo varyantları
            </h2>
            <p
              className="text-gray-600 mt-3 max-w-2xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Farklı zemin ve formatlar için altı varyant. Birincil kullanım — beyaz veya açık zemin
              üzerinde tam logo.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logoVariants.map((v) => (
              <LogoCard key={v.name + v.bg} variant={v} />
            ))}
          </div>
        </div>
      </section>

      {/* Renkler */}
      <section className="py-20 px-6 lg:px-10" style={{ background: '#fafbfc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: TURQUOISE }}
            >
              Renk Paleti
            </div>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
            >
              Marka renkleri
            </h2>
            <p
              className="text-gray-600 mt-3 max-w-2xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              HEX değerine tıklayarak panoya kopyalayın. Sphere English iki ana renk etrafında inşa
              edilmiştir.
            </p>
          </div>

          <h3
            className="text-base font-bold uppercase tracking-wider mb-4"
            style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
          >
            Ana renkler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {primaryColors.map((c) => (
              <CopyableColor key={c.hex} chip={c} />
            ))}
          </div>

          <h3
            className="text-base font-bold uppercase tracking-wider mb-4"
            style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
          >
            Tonal ölçek (Navy)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {navyScale.map((c) => (
              <CopyableColor key={c.hex} chip={c} />
            ))}
          </div>

          <h3
            className="text-base font-bold uppercase tracking-wider mb-4"
            style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
          >
            Destekleyici renkler
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {supportColors.map((c) => (
              <CopyableColor key={c.hex} chip={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Tipografi */}
      <section className="py-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: TURQUOISE }}
            >
              Tipografi
            </div>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
            >
              Yazı tipleri
            </h2>
            <p
              className="text-gray-600 mt-3 max-w-2xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              İki yazı tipi ailesi birlikte uyum içinde çalışır: başlıklar için güçlü, gövde metni için
              okunabilir.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heading */}
            <div className="rounded-2xl border border-gray-200 p-8 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Başlık fontu
              </div>
              <div
                className="text-7xl mb-4"
                style={{ fontFamily: "'Outfit', sans-serif", color: NAVY, fontWeight: 900 }}
              >
                Aa
              </div>
              <div className="font-bold text-2xl mb-1" style={{ color: NAVY }}>
                Outfit
              </div>
              <div className="text-sm text-gray-500 mb-6 font-mono">
                Black 900 · ExtraBold 800 · Bold 700 · SemiBold 600 · Regular 400
              </div>
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <div
                  className="text-3xl"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: NAVY }}
                >
                  Küresel Öğrenme
                </div>
                <div
                  className="text-2xl"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: NAVY }}
                >
                  İngilizce Becerilerinizi Geliştirin
                </div>
                <div
                  className="text-lg"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: NAVY }}
                >
                  Ders Programı ve Değerlendirme
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="rounded-2xl border border-gray-200 p-8 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Gövde fontu
              </div>
              <div
                className="text-7xl mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: NAVY, fontWeight: 600 }}
              >
                Aa
              </div>
              <div className="font-bold text-2xl mb-1" style={{ color: NAVY }}>
                Plus Jakarta Sans
              </div>
              <div className="text-sm text-gray-500 mb-6 font-mono">
                Bold 700 · SemiBold 600 · Medium 500 · Regular 400 · Light 300
              </div>
              <div className="space-y-4 border-t border-gray-100 pt-5">
                <div
                  className="text-base"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    color: '#1e3a6e',
                  }}
                >
                  Telaffuz Koçunuzla Çalışın
                </div>
                <div
                  className="text-sm leading-relaxed text-gray-700"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
                >
                  Yapay zeka destekli telaffuz koçumuz sayesinde İngilizce konuşma becerilerinizi
                  hızla geliştirin. Gerçek zamanlı geri bildirim ile her hatadan öğrenin.
                </div>
                <div
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300 }}
                >
                  Metaveri, açıklama ve yardımcı metin için kullanılır.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marka sesi */}
      <section className="py-20 px-6 lg:px-10" style={{ background: '#fafbfc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: TURQUOISE }}
            >
              Marka Sesi
            </div>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
            >
              Ses & ton
            </h2>
            <p
              className="text-gray-600 mt-3 max-w-2xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Sphere English her platformda aynı kişiliği yansıtır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {voiceTraits.map((t) => (
              <div key={t.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="text-4xl mb-4">{t.icon}</div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
                >
                  {t.title}
                </h3>
                <p
                  className="text-sm text-gray-600 leading-relaxed mb-4"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {t.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">{t.good}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold mt-0.5">✗</span>
                    <span className="text-gray-500 line-through">{t.bad}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marka Rehberi link + Basın */}
      <section className="py-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-2xl p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${NAVY} 0%, #0d1f4e 100%)`,
            }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 mb-3">
              Marka Rehberi
            </div>
            <h3
              className="text-2xl md:text-3xl font-black mb-3"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Detaylı kullanım kuralları
            </h3>
            <p className="opacity-80 mb-6 leading-relaxed">
              Logo varyantları, renkler, tipografi, ses-ton, doğru ve yanlış kullanımlar.
            </p>
            <a
              href="/brand-kit/brand-guide.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
            >
              brand-guide.md →
            </a>
          </div>

          <div className="rounded-2xl p-8 border border-gray-200 bg-white">
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: TURQUOISE }}
            >
              Basın & İletişim
            </div>
            <h3
              className="text-2xl md:text-3xl font-black mb-3"
              style={{ color: NAVY, fontFamily: "'Outfit', sans-serif" }}
            >
              İletişim
            </h3>
            <p
              className="text-gray-600 mb-6 leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Röportaj, basın bülteni, marka asset talebi veya işbirlikleri için bize yazın.
            </p>
            <a
              href="mailto:info@sphereenglish.com"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${TURQUOISE} 0%, #0892c7 100%)`,
                color: '#ffffff',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              info@sphereenglish.com →
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-[#13a9e0] transition-colors"
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
