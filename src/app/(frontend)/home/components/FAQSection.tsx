'use client';
import React, { useState } from 'react';
import { DEFAULT_FAQS, type FAQ } from './faq-data';

interface FAQProps {
  data?: {
    faqKicker?: string;
    faqTitle1?: string;
    faqTitle2?: string;
    faqSubtitle?: string;
    faqs?: FAQ[];
  };
}

export default function FAQSection({ data }: FAQProps = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const kicker = data?.faqKicker ?? 'SIKÇA SORULAN SORULAR';
  const title1 = data?.faqTitle1 ?? 'Aklınızdaki soruları';
  const title2 = data?.faqTitle2 ?? 'yanıtlıyoruz.';
  const subtitle = data?.faqSubtitle ?? 'Kurumsal İngilizce eğitimi hakkında en çok merak edilen konuları derledik.';
  const faqs: FAQ[] = (data?.faqs && data.faqs.length > 0) ? data.faqs : DEFAULT_FAQS;

  return (
    <section id="sss" className="py-12 lg:py-16 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-8 lg:mb-10">
          <span className="inline-block text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            {kicker}
          </span>
          <h2 className="text-[34px] lg:text-[46px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.12] mb-4">
            {title1}<br />
            <span className="text-[#0ea5e9]">{title2}</span>
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed max-w-md mx-auto">{subtitle}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-7 py-5 text-left gap-4 group"
                aria-expanded={openIndex === i}
              >
                <span className="text-[15px] font-bold text-[#1B365D] group-hover:text-[#0ea5e9] transition-colors duration-200">
                  {faq.question}
                </span>
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === i ? 'bg-[#0ea5e9] rotate-45' : 'bg-[#e8f0fe]'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={openIndex === i ? 'text-white' : 'text-[#1B365D]'}>
                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <p className="px-7 pb-6 text-[14px] text-gray-500 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-[14px] text-gray-400 mb-4">Başka sorularınız mı var?</p>
          <a
            href="/iletisim"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1B365D] text-white text-[14px] font-bold hover:bg-[#0ea5e9] transition-colors duration-200"
          >
            Bize Ulaşın
          </a>
        </div>
      </div>
    </section>
  );
}
