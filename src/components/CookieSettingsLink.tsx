'use client';

/**
 * Footer'da veya başka yerde "Çerez Ayarları" linki.
 * Tıklandığında CookieConsent modalını açar (custom event dispatch).
 */
export default function CookieSettingsLink({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
      className={className}
    >
      {children || 'Çerez Ayarları'}
    </button>
  );
}
