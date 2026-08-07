'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trackLead } from '@/lib/analytics/meta-pixel';

// Sphere backend base URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://app.sphereenglish.com';

const DAY_LABELS = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];
const MONTH_LABELS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function fmtMonthKey(y: number, m: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}
function fmtDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function fmtDateTr(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

type DayStatus = 'available' | 'blocked' | 'full' | 'past' | 'closed';
type Slot = { start: string; end: string; available: boolean; reason?: string };

export default function DemoPage() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const [days, setDays] = useState<Record<string, DayStatus>>({});
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Load month availability
  useEffect(() => {
    setLoadingMonth(true);
    const key = fmtMonthKey(year, month);
    fetch(`${API_BASE}/api/demo/availability?month=${key}`)
      .then((r) => r.json())
      .then((d) => setDays(d.days ?? {}))
      .catch(() => setDays({}))
      .finally(() => setLoadingMonth(false));
  }, [year, month]);

  // Load slots for selected date
  useEffect(() => {
    if (!selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`${API_BASE}/api/demo/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  function prevMonth() {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth());
    setSelectedDate(null); setSlots([]);
  }
  function nextMonth() {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth());
    setSelectedDate(null); setSlots([]);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  // Pazartesi başlangıcı için offset
  const startOffset = (firstDayOfMonth + 6) % 7; // 0=Pzt

  const cells: Array<{ day: number | null; date?: string; status?: DayStatus }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = fmtDate(year, month, d);
    cells.push({ day: d, date: dateStr, status: days[dateStr] });
  }

  return (
    <>
      <Header forceWhite />
      <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #e8f0fe 100%)' }}>
        <section className="pt-32 pb-8 sm:pb-12 px-4 sm:px-6 text-center relative overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
          <div className="relative max-w-2xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase mb-4" style={{ color: '#0ea5e9' }}>DEMO RANDEVUSU</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: '#1B365D' }}>
              Bir tarih seç,<br /> beraber konuşalım
            </h1>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#4a5568' }}>
              30 dakikalık birebir görüşme. İhtiyaçlarınızı dinleyip size özel İngilizce programını beraber belirleyelim.
            </p>
          </div>
        </section>

        <section className="pb-16 sm:pb-24 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Calendar */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#e8f0fe] p-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Önceki ay">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: '#1B365D' }}>{MONTH_LABELS[month]} {year}</div>
                </div>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Sonraki ay">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[11px] font-semibold text-gray-500">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Pzr'].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 relative">
                {loadingMonth && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                    <div className="text-xs text-gray-500">Yükleniyor…</div>
                  </div>
                )}
                {cells.map((c, i) => {
                  if (c.day === null) return <div key={i} className="aspect-square" />;
                  const isSelected = selectedDate === c.date;
                  const status = c.status;
                  const clickable = status === 'available';

                  let cls = 'aspect-square rounded-lg flex items-center justify-center text-sm transition ';
                  if (isSelected) {
                    cls += 'bg-[#0ea5e9] text-white font-bold shadow-md';
                  } else if (status === 'available') {
                    cls += 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:scale-105 font-semibold cursor-pointer';
                  } else if (status === 'full') {
                    cls += 'bg-amber-50 text-amber-600 line-through cursor-not-allowed';
                  } else if (status === 'blocked' || status === 'closed') {
                    cls += 'bg-gray-50 text-gray-300 cursor-not-allowed';
                  } else if (status === 'past') {
                    cls += 'text-gray-300 cursor-not-allowed';
                  } else {
                    cls += 'text-gray-400';
                  }

                  return (
                    <button
                      key={i}
                      disabled={!clickable}
                      onClick={() => clickable && setSelectedDate(c.date!)}
                      className={cls}
                      title={status === 'full' ? 'Bu gün dolu' : status === 'closed' ? 'Kapalı' : status === 'blocked' ? 'Uygun değil' : ''}
                    >
                      {c.day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> Müsait</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span> Dolu</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></span> Kapalı</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0ea5e9]"></span> Seçili</div>
              </div>
            </div>

            {/* Slots / Form */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#e8f0fe] p-6">
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1B365D' }}>Bir tarih seçin</h3>
                  <p className="text-sm text-gray-500 max-w-sm">Sol taraftaki takvimden yeşil işaretli müsait bir gün seçin, saat seçenekleri burada görünecek.</p>
                </div>
              ) : selectedSlot ? (
                <BookingForm
                  date={selectedDate}
                  slot={selectedSlot}
                  onBack={() => setSelectedSlot(null)}
                />
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: '#0ea5e9' }}>SEÇİLİ TARİH</p>
                    <h3 className="text-lg font-bold" style={{ color: '#1B365D' }}>{fmtDateTr(selectedDate)}</h3>
                  </div>

                  {loadingSlots ? (
                    <div className="py-8 text-center text-sm text-gray-500">Yükleniyor…</div>
                  ) : slots.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">Bu gün için uygun saat yok. Farklı bir gün seçin.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {slots.map((slot) => {
                          const cls = slot.available
                            ? 'py-2.5 px-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100 font-semibold text-sm cursor-pointer transition'
                            : 'py-2.5 px-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed line-through';
                          return (
                            <button
                              key={slot.start}
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={cls}
                              title={slot.available ? '' : slot.reason === 'booked' ? 'Dolu' : slot.reason === 'too-soon' ? 'Çok yakın (24 saat öncesinden)' : 'Uygun değil'}
                            >
                              {slot.start}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Her randevu 30 dakika sürer. Bir saat seçin, sonraki ekranda bilgilerinizi doldurup onaylayın.
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ─── Booking Form (adım 2) ────────────────────────────────────────────
function BookingForm({ date, slot, onBack }: { date: string; slot: Slot; onBack: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/demo/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date, time: slot.start,
          name, email, phone: phone || undefined,
          company: company || undefined, message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bir hata oluştu.');
      setSuccess(true);
      trackLead({ source: 'demo_booking', value: 0 });
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: '#1B365D' }}>Randevunuz alındı! 🎉</h3>
        <p className="text-sm text-gray-600 mb-1">{fmtDateTr(date)}</p>
        <p className="text-lg font-bold text-[#0ea5e9] mb-4">{slot.start} – {slot.end}</p>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Onay maili {email} adresine gönderildi. Görüşme linki randevu gününde ayrıca iletilecek.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        Saati değiştir
      </button>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700 font-semibold mb-0.5">SEÇTİĞİNİZ RANDEVU</p>
        <p className="text-sm font-bold" style={{ color: '#1B365D' }}>{fmtDateTr(date)}</p>
        <p className="text-sm text-blue-700 font-mono">{slot.start} – {slot.end}</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
            Ad Soyad <span className="text-[#0ea5e9]">*</span>
          </label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0ea5e9]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
              E-posta <span className="text-[#0ea5e9]">*</span>
            </label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0ea5e9]" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">Telefon</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5XX..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0ea5e9]" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">Şirket (opsiyonel)</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0ea5e9]" />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">Mesaj (opsiyonel)</label>
          <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Görüşmede odaklanmak istediğiniz konu…" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#0ea5e9] resize-none" />
        </div>

        {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-sm transition disabled:opacity-50">
          {loading ? 'Kaydediliyor…' : 'Randevuyu Onayla'}
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          Onaylayarak Sphere English'in demo görüşmesi için sizinle iletişime geçmesine izin vermiş olursunuz.
        </p>
      </form>
    </div>
  );
}
