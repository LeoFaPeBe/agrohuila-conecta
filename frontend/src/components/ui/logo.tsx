/** Logo de AgroHuila Conecta: hoja de cafeto sobre un pin de ubicación (conexión productor–comprador). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="AgroHuila Conecta">
      <rect width="48" height="48" rx="12" fill="#2E7D32" />
      <path d="M24 9c-7.2 0-13 5.6-13 12.6C11 30.9 24 40 24 40s13-9.1 13-18.4C37 14.6 31.2 9 24 9z" fill="#E8F5E9" />
      <path d="M24.6 15.5c4.6 1 6.8 4.7 6 9.4-4.9.4-8.7-1.7-9.8-6.2 1.1-1.6 2.3-2.6 3.8-3.2z" fill="#2E7D32" />
      <path d="M21.4 30c.6-5.3 2.7-9.3 6.6-12.2" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="19" cy="23" r="2.4" fill="#6D4C41" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className="block text-lg font-semibold text-gray-900">AgroHuila</span>
        <span className="block text-xs font-medium tracking-wide text-brand-500 uppercase">Conecta</span>
      </span>
    </span>
  );
}
