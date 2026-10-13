/** Hambúrguer em SVG: fallback estático do hero 3D (e placeholder do Suspense). */
export function BurgerFallback({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="Hambúrguer artesanal defumado"
      className={className}
    >
      <defs>
        <radialGradient id="bf-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#D61F1F" stopOpacity=".55" />
          <stop offset="1" stopColor="#D61F1F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bf-bun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F39A3D" />
          <stop offset="1" stopColor="#B8661C" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="215" r="190" fill="url(#bf-glow)" />
      <ellipse cx="200" cy="350" rx="130" ry="16" fill="#000" opacity=".4" />
      <path d="M85 160c0-62 52-100 115-100s115 38 115 100z" fill="url(#bf-bun)" />
      <g fill="#FFE2B0" opacity=".9">
        <ellipse cx="150" cy="105" rx="7" ry="3.5" transform="rotate(-20 150 105)" />
        <ellipse cx="200" cy="90" rx="7" ry="3.5" />
        <ellipse cx="250" cy="105" rx="7" ry="3.5" transform="rotate(20 250 105)" />
        <ellipse cx="225" cy="130" rx="7" ry="3.5" transform="rotate(10 225 130)" />
        <ellipse cx="170" cy="132" rx="7" ry="3.5" transform="rotate(-10 170 132)" />
      </g>
      <path d="M80 172q24 20 48 0t48 0t48 0t48 0t48 0v22H80z" fill="#6DBE45" />
      <rect x="86" y="192" width="228" height="26" rx="8" fill="#E0301E" />
      <path d="M78 214h244l-14 18-30-12-30 16-30-16-30 16-30-16-30 12z" fill="#FFB400" />
      <rect x="82" y="224" width="236" height="44" rx="22" fill="#4A2412" />
      <path d="M90 270h220v8q0 38-34 38H124q-34 0-34-38z" fill="url(#bf-bun)" />
    </svg>
  )
}
