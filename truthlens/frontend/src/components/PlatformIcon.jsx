import React from 'react';

/* ================= Official Platform Brand SVGs ================= */
export const WhatsAppLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={{ flexShrink: 0 }}>
    <path fill="#25D366" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"/>
    <path fill="#ffffff" d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51 0 1.48 1.08 2.91 1.23 3.11.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35z"/>
  </svg>
);

export const TwitterXLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0, color: '#ffffff' }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const InstagramLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="ig-gradient-shared" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-gradient-shared)"/>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="#ffffff" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="#ffffff" strokeWidth="1.8"/>
    <circle cx="16.8" cy="7.2" r="1.1" fill="#ffffff"/>
  </svg>
);

export const FacebookLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#1877F2"/>
    <path fill="#ffffff" d="M15.12 12.78l.48-3.13h-3v-2.03c0-.86.42-1.7 1.77-1.7h1.37V3.25c-.24-.03-1.07-.1-2.04-.1-2.08 0-3.44 1.26-3.44 3.54v2.09H7.5v3.13h2.76V22h3.41v-9.22h1.45z"/>
  </svg>
);

export const TelegramLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#24A1DE"/>
    <path fill="#ffffff" d="M5.4 11.9l11.4-4.7c.5-.2 1 .1.8.7l-1.9 9.1c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.3-4.8c.2-.2 0-.3-.3-.1L8.9 13.5l-2.8-.9c-.6-.2-.6-.6.1-.9z"/>
  </svg>
);

export const YouTubeLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <path fill="#FF0000" d="M23.5 6.2c-.3-1-.9-1.8-1.9-2-1.7-.5-8.6-.5-8.6-.5s-6.9 0-8.6.5c-1 .3-1.6 1.1-1.9 2-.5 1.7-.5 5.3-.5 5.3s0 3.6.5 5.3c.3 1 .9 1.8 1.9 2 1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5c1-.3 1.6-1.1 1.9-2 .5-1.7.5-5.3.5-5.3s0-3.6-.5-5.3z"/>
    <polygon fill="#ffffff" points="9.6,15.6 15.6,11.5 9.6,7.4"/>
  </svg>
);

export const RedditLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#FF4500"/>
    <path fill="#ffffff" d="M19.5 12c0-.8-.7-1.5-1.5-1.5-.4 0-.7.2-.9.4-1.1-.8-2.6-1.3-4.3-1.4l.7-3.5 2.4.5c0 .6.5 1 1.1 1 .6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1c-.5 0-.9.3-1 .8l-2.7-.6c-.1 0-.3.1-.3.2l-.9 4.1c-1.8.1-3.3.6-4.4 1.4-.2-.2-.5-.4-.9-.4-.8 0-1.5.7-1.5 1.5 0 .6.3 1.1.8 1.3-.1.3-.1.6-.1.9 0 2.4 2.8 4.4 6.3 4.4s6.3-2 6.3-4.4c0-.3 0-.6-.1-.9.5-.2.8-.7.8-1.3zm-10.3.9c0-.6.5-1.1 1.1-1.1s1.1.5 1.1 1.1-.5 1.1-1.1 1.1-1.1-.5-1.1-1.1zm5.7 2.6c-.7.7-2 .7-2.9.7-.9 0-2.2 0-2.9-.7-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .5.5 1.6.5 2.5.5.9 0 2-.1 2.5-.5.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.2-1.5c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z"/>
  </svg>
);

export const OtherLogo = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

/**
 * Returns normalized platform brand metadata including official SVG icon
 */
export function getPlatformInfo(platformName, size = 16) {
  if (!platformName) {
    return { id: 'Other', label: 'Other', icon: <OtherLogo size={size} /> };
  }
  const clean = platformName.trim();
  const lower = clean.toLowerCase();

  if (lower === 'whatsapp') {
    return { id: 'WhatsApp', label: 'WhatsApp', icon: <WhatsAppLogo size={size} /> };
  }
  if (lower === 'x' || lower.includes('twitter')) {
    return { id: 'Twitter / X', label: 'Twitter / X', icon: <TwitterXLogo size={size} /> };
  }
  if (lower === 'instagram') {
    return { id: 'Instagram', label: 'Instagram', icon: <InstagramLogo size={size} /> };
  }
  if (lower === 'facebook') {
    return { id: 'Facebook', label: 'Facebook', icon: <FacebookLogo size={size} /> };
  }
  if (lower === 'telegram') {
    return { id: 'Telegram', label: 'Telegram', icon: <TelegramLogo size={size} /> };
  }
  if (lower === 'youtube') {
    return { id: 'YouTube', label: 'YouTube', icon: <YouTubeLogo size={size} /> };
  }
  if (lower === 'reddit') {
    return { id: 'Reddit', label: 'Reddit', icon: <RedditLogo size={size} /> };
  }

  return { id: 'Other', label: clean || 'Other', icon: <OtherLogo size={size} /> };
}

/**
 * PlatformBadge component for displaying brand logo alongside platform text
 */
export function PlatformBadge({ platform, size = 15, className = '' }) {
  const info = getPlatformInfo(platform, size);
  return (
    <span className={`platform-tag ${className}`} title={`Source: ${info.label}`}>
      <span className="platform-tag-icon">{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
}
