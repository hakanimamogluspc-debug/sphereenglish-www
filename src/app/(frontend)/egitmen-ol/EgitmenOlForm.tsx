'use client';

import { useState, useRef } from 'react';
import { trackMetaEvent } from '@/lib/analytics/meta-pixel';

const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Tecrübem Yok' },
  { value: '1-2', label: '1-2 Yıl' },
  { value: '3-4', label: '3-4 Yıl' },
  { value: '5+', label: '+5 Yıl' },
];

const EDUCATION_OPTIONS = [
  { value: 'univ', label: 'Üniversite' },
  { value: 'ms', label: 'Yüksek Lisans' },
  { value: 'phd', label: 'Doktora' },
  { value: 'student', label: 'Öğrenci' },
];

const ENGLISH_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const CERTIFICATION_OPTIONS = ['HİÇBİRİ', 'IELTS', 'TOEFL', 'TESOL', 'TEFL', 'CELTA'];

const MAX_CV_SIZE = 5 * 1024 * 1024; // 5 MB

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  nationality: string;
  location: string;
  experience: string;
  education: string;
  englishLevel: string;
  certifications: string[];
  references: string;
  kvkkAccepted: boolean;
}

export default function EgitmenOlForm() {
  const [f, setF] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    nationality: '',
    location: '',
    experience: '',
    education: '',
    englishLevel: '',
    certifications: [],
    references: '',
    kvkkAccepted: false,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setF((p) => ({ ...p, [key]: value }));
  }

  function toggleCertification(cert: string) {
    setF((p) => {
      // "HİÇBİRİ" seçilirse diğerleri temizlenir; diğeri seçilirse HİÇBİRİ kalkar
      if (cert === 'HİÇBİRİ') {
        return { ...p, certifications: p.certifications.includes(cert) ? [] : ['HİÇBİRİ'] };
      }
      const filtered = p.certifications.filter((c) => c !== 'HİÇBİRİ');
      const isOn = filtered.includes(cert);
      return {
        ...p,
        certifications: isOn ? filtered.filter((c) => c !== cert) : [...filtered, cert],
      };
    });
  }

  function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return setCvFile(null);
    if (file.type !== 'application/pdf') {
      setError('CV sadece PDF formatında olabilir.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_CV_SIZE) {
      setError('CV maksimum 5MB olabilir.');
      e.target.value = '';
      return;
    }
    setError(null);
    setCvFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!f.kvkkAccepted) {
      setError('KVKK aydınlatma metnini okuyup onaylamanız gerekiyor.');
      return;
    }
    if (!cvFile) {
      setError('Lütfen CV dosyanızı (PDF) yükleyin.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', f.fullName.trim());
      fd.append('phone', f.phone.trim());
      fd.append('email', f.email.trim().toLowerCase());
      fd.append('birthDate', f.birthDate);
      fd.append('nationality', f.nationality.trim());
      fd.append('location', f.location.trim());
      fd.append('experience', f.experience);
      fd.append('education', f.education);
      fd.append('englishLevel', f.englishLevel);
      fd.append('certifications', JSON.stringify(f.certifications));
      fd.append('references', f.references.trim());
      fd.append('kvkkAccepted', String(f.kvkkAccepted));
      fd.append('cv', cvFile);

      const r = await fetch('/api/teacher-applications', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error || 'Başvuru gönderilemedi.');
        setSubmitting(false);
        return;
      }
      setDone(true);
      // Meta Pixel — Eğitmen başvurusu = SubmitApplication + Lead
      trackMetaEvent('SubmitApplication', {
        content_category: 'teacher_application',
      });
      trackMetaEvent('Lead', {
        content_category: 'teacher_application',
        value: 0,
        currency: 'TRY',
      });
    } catch (err: any) {
      setError(err?.message || 'Beklenmeyen hata.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-[24px] font-extrabold text-[#1B365D] mb-2">Başvurunuz Alındı 🎉</h2>
        <p className="text-[15px] text-gray-700 max-w-md mx-auto">
          CV&apos;niz ve bilgileriniz ekibimize iletildi. Uygun bulunan başvurular için en geç 5 iş günü
          içinde <strong>{f.email}</strong> adresinden dönüş yapacağız.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* İsim + Telefon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldText label="İsim / Soyisim" required value={f.fullName} onChange={(v) => update('fullName', v)} />
        <FieldText label="Telefon" required type="tel" placeholder="05XX" value={f.phone} onChange={(v) => update('phone', v)} />
      </div>

      {/* Email + Doğum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldText label="E-mail" required type="email" value={f.email} onChange={(v) => update('email', v)} />
        <FieldText label="Doğum Tarihi" required type="date" value={f.birthDate} onChange={(v) => update('birthDate', v)} />
      </div>

      {/* Milliyet + Lokasyon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldText label="Milliyet" required placeholder="Türkiye" value={f.nationality} onChange={(v) => update('nationality', v)} />
        <FieldText label="Nerede Yaşıyorsunuz" required placeholder="İstanbul" value={f.location} onChange={(v) => update('location', v)} />
      </div>

      {/* Radio gruplar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RadioGroup
          label="Tecrübeniz"
          required
          name="experience"
          value={f.experience}
          options={EXPERIENCE_OPTIONS}
          onChange={(v) => update('experience', v)}
        />
        <RadioGroup
          label="Eğitim Seviyeniz"
          required
          name="education"
          value={f.education}
          options={EDUCATION_OPTIONS}
          onChange={(v) => update('education', v)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RadioGroup
          label="İngilizce Seviyeniz"
          required
          name="englishLevel"
          value={f.englishLevel}
          options={ENGLISH_LEVEL_OPTIONS}
          onChange={(v) => update('englishLevel', v)}
        />
        <div>
          <label className="block text-[13px] font-semibold text-[#1B365D] mb-2">Sertifikalar</label>
          <div className="space-y-1.5">
            {CERTIFICATION_OPTIONS.map((c) => (
              <label key={c} className="flex items-center gap-2.5 text-[14px] text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={f.certifications.includes(c)}
                  onChange={() => toggleCertification(c)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0ea5e9] focus:ring-[#0ea5e9]"
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Referans */}
      <div>
        <label className="block text-[13px] font-semibold text-[#1B365D] mb-1.5">Referans</label>
        <textarea
          value={f.references}
          onChange={(e) => update('references', e.target.value)}
          rows={3}
          placeholder="Önceki kurumlarınız, referans kişiler vs. (opsiyonel)"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
        />
      </div>

      {/* CV */}
      <div>
        <label className="block text-[13px] font-semibold text-[#1B365D] mb-1.5">
          CV&apos;nizi Yükleyin (Sadece PDF, max 5MB) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[13px] font-semibold text-[#1B365D] transition-colors"
          >
            Dosya Seç
          </button>
          <span className="text-[13px] text-gray-500 flex-1 truncate">
            {cvFile ? cvFile.name : 'Dosya seçilmedi'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleCvChange}
            className="hidden"
          />
        </div>
      </div>

      {/* KVKK onayı */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={f.kvkkAccepted}
          onChange={(e) => update('kvkkAccepted', e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0ea5e9] focus:ring-[#0ea5e9]"
        />
        <span className="text-[13px] text-gray-700 leading-relaxed">
          <a href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-[#0ea5e9] underline">
            KVKK aydınlatma metnini
          </a>{' '}
          okudum ve onaylıyorum. Yukarıdaki bilgilerimin doğru ve eksiksiz olduğunu beyan ederim.
        </span>
      </label>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-900">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full md:w-auto md:min-w-[240px] px-8 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Gönderiliyor…' : 'Başvuruyu Gönder'}
      </button>
    </form>
  );
}

// ─── Yardımcı bileşenler ─────────────────────────────────────────────────
function FieldText({
  label,
  required,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#1B365D] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
      />
    </div>
  );
}

function RadioGroup({
  label,
  required,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#1B365D] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 text-[14px] text-gray-700 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              className="w-4 h-4 border-gray-300 text-[#0ea5e9] focus:ring-[#0ea5e9]"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
