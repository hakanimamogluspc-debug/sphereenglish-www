'use client';

import { useEffect } from 'react';

/**
 * Reklamdan gelen kullanıcının fbclid parametresini yakalayıp _fbc cookie'si
 * olarak kalıcılaştırır.
 *
 * Neden: _fbc cookie'sini normalde Meta Pixel'in kendisi oluşturur. Adblock,
 * Safari ITP veya pixel'in geç yüklenmesi durumunda oluşmaz ve tıklama ID'si
 * tamamen kaybolur — o satış hiçbir reklama bağlanamaz.
 *
 * Meta'nın beklediği format: fb.1.<unix_ms>.<fbclid>
 * Referans: developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
 */
export default function FbclidCapture() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid');
      if (!fbclid) return;

      // Zaten bir _fbc varsa ve aynı fbclid'i taşıyorsa dokunma
      const existing = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('_fbc='))
        ?.slice('_fbc='.length);

      if (existing && existing.endsWith(`.${fbclid}`)) return;

      const value = `fb.1.${Date.now()}.${fbclid}`;
      const maxAge = 90 * 24 * 60 * 60; // Meta'nın tıklama attribution penceresiyle uyumlu

      document.cookie = [
        `_fbc=${value}`,
        'path=/',
        `max-age=${maxAge}`,
        'SameSite=Lax',
        window.location.protocol === 'https:' ? 'Secure' : '',
      ]
        .filter(Boolean)
        .join('; ');
    } catch {
      /* cookie yazılamadıysa sessizce geç — uygulama akışını bozma */
    }
  }, []);

  return null;
}
