import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * İletişim formu — Sphere backend'e lead kaydı + Meta CAPI Lead eventi.
 *
 * Akış:
 *   1) Sphere API (/api/marketing/contact) — contact_leads tablosuna yaz +
 *      admin notify sistemi tetiklenir (Resend ile info@ + admin mail).
 *   2) Meta Conversions API — Lead event (opsiyonel, token varsa).
 *
 * Not: Brevo entegrasyonu kaldırıldı — Sphere admin notify (Resend) tek
 * mail sistemi. Karmaşıklık azaldı, tek yerden yönetim.
 */

const SPHERE_API_URL = 'https://app.sphereenglish.com/api/marketing/contact';
const META_PIXEL_ID  = '2156406151837976';
const META_API_VER   = 'v19.0';

async function sendMetaLead(opts: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}): Promise<void> {
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!token) return;

  const sha256 = (v: string) =>
    crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex');

  const userData: Record<string, string> = {};
  if (opts.email)           userData.em = sha256(opts.email);
  if (opts.firstName)       userData.fn = sha256(opts.firstName);
  if (opts.lastName)        userData.ln = sha256(opts.lastName);
  if (opts.phone)           userData.ph = sha256(opts.phone.replace(/\D/g, ''));
  if (opts.clientIp)        userData.client_ip_address = opts.clientIp;
  if (opts.clientUserAgent) userData.client_user_agent = opts.clientUserAgent;
  if (opts.fbc) userData.fbc = opts.fbc;
  if (opts.fbp) userData.fbp = opts.fbp;

  const body = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: 'https://www.sphereenglish.com/iletisim',
      action_source: 'website',
      user_data: userData,
    }],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_API_VER}/${META_PIXEL_ID}/events?access_token=${token}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!res.ok) console.error('[Meta CAPI] Hata:', await res.text());
    else console.log('[Meta CAPI] Lead eventi gönderildi:', opts.email ? sha256(opts.email).slice(0, 8) + '...' : '?');
  } catch (e) {
    console.error('[Meta CAPI] Bağlantı hatası:', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, sector, teamSize, message } = body;

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 });
    }

    // ── 1. Sphere API'ye lead kaydet (contact_leads tablosuna yaz + admin mail) ──
    // Await ediyoruz — fail olursa kullanıcıya doğru mesaj gösterelim.
    try {
      const sphereRes = await fetch(SPHERE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: '',
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

    // ── 2. Meta Conversions API — Lead event (opsiyonel, background) ──
    const nameParts   = name.trim().split(' ');
    const firstName   = nameParts[0] || undefined;
    const lastName    = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;
    const forwardedIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const clientIp    = forwardedIp || req.headers.get('x-real-ip') || undefined;

    void sendMetaLead({
      email,
      firstName,
      lastName,
      clientIp,
      clientUserAgent: req.headers.get('user-agent') || undefined,
      fbc: req.cookies.get('_fbc')?.value,
      fbp: req.cookies.get('_fbp')?.value,
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
