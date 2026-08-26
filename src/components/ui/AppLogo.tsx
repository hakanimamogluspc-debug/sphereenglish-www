'use client';

import React from 'react';
import AppIcon from './AppIcon';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string; // Image source (optional)
  text?: string; // Logo text (optional)
  iconName?: string; // Icon name when no image
  size?: number; // Size for icon/image
  className?: string; // Additional classes
  onClick?: () => void; // Click handler
  /** Marka / kurum adı — SEO ve a11y için anlamlı alt text üretir. */
  brandName?: string;
}

function AppLogo({
  src = '/assets/images/app_logo.png',
  text,
  iconName = 'SparklesIcon',
  size = 64,
  className = '',
  onClick,
  brandName = 'Sphere English',
}: AppLogoProps) {
  return (
    <div
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Show image if src provided, otherwise show icon */}
      {src ? (
        <AppImage src={src} alt={`${brandName} logo`} width={size} height={size} className="flex-shrink-0" />
      ) : (
        <AppIcon name={iconName} size={size} className="flex-shrink-0" />
      )}

      {/* Show text if provided */}
      {text && <span className="text-xl font-bold">{text}</span>}
    </div>
  );
}

export default AppLogo;
