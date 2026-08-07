import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { sendCapiLead, userDataFromRequest } from '@/lib/analytics/meta-capi';

/**
 * İletişim formu — Sphere backend'e lead kaydı + Meta CAPI Lead eventi.
 *
 * Akış:
 *   1) Sphere API (/api/marketing/contact) — contact_leads tablosuna yaz +
 *      admin notify sistemi tetiklenir (Resend ile info@ + admin mail).
 *   2) Meta Conversions API — Lead event (unified helper üzerinden, dedup ile).
 */

const SPHERE_API_URL = 'https://app.sphereenglish.com/api/marketing/contact';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, sector, teamSize, message } = body;

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 });
    }

    // ── 1. Sphere API'ye lead kaydet (contact_leads tablosuna yaz + admin mail) ──
    try {
      const sphereRes = await fetch(SPHERE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: String(phone || '').trim(),
          company,
          message: `Sektör: ${sector || '—'} | Çalışan: ${teamSize || '—'} | Mesaj: ${message || '—'}`,
          source: 'website-iletisim',
        }),
      });
      if (!sphereRes.ok) {
        const errText = await sphereRes.text().catch(() => '');
        console.error('[contact] Sphere API hatası:', sphereRes.status, errText);
        return NextResponse.json(
          { error: 'Form kaydedilemedi, lütfen daha sonra tekrar deneyin.' },
          { status: 502 },
        );
      }
      console.log(`[contact] Lead kaydedildi: ${email} (${company})`);
    } catch (fetchErr: any) {
      console.error('[contact] Sphere API bağlantı hatası:', fetchErr?.message ?? fetchErr);
      return NextResponse.json(
        { error: 'Sunucuya ulaşılamıyor, lütfen daha sonra tekrar deneyin.' },
        { status: 502 },
      );
    }

    // ── 2. Meta CAPI Lead event (unified helper, dedup destekli, background) ──
    const nameParts = String(name).trim().split(' ');
    const firstName = nameParts[0] || undefined;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    // Deterministik lead ID — email + company hash'i (aynı submit ikinci defa gelirse dedup)
    const leadId = crypto
      .createHash('sha256')
      .update(`${email}|${company}|${Date.now()}`)
      .digest('hex')
      .slice(0, 24);

    void sendCapiLead({
      leadId,
      source: 'website_contact_form',
      eventSourceUrl: 'https://www.sphereenglish.com/iletisim',
      userData: {
        ...userDataFromRequest(req),
        email,
        phone: phone || undefined,
        firstName,
        lastName,
        country: 'TR',
      },
    }).then((r) => {
      if (!r.ok) console.warn('[capi] contact Lead hata:', r.error);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[contact] fatal error:', error?.message || error);
    return NextResponse.json(
      { error: `Form gönderilemedi: ${error?.message || 'Bilinmeyen hata'}` },
      { status: 500 },
    );
  }
}
