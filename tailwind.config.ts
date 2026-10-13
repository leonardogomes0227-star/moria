import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0F14',
        surface: '#121821',
        'surface-2': '#1A2230',
        brand: { DEFAULT: '#D61F1F', dark: '#A31515', light: '#FF4B4B' },
        ember: '#FF6A1A',
        muted: '#9AA4B2',
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '1.25rem', pill: '999px' },
      boxShadow: {
        glow: '0 0 32px -4px rgba(214,31,31,0.55)',
        'glow-ember': '0 0 40px -6px rgba(255,106,26,0.5)',
        card: '0 10px 30px -12px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #D61F1F 0%, #FF6A1A 100%)',
        'smoke-gradient': 'linear-gradient(180deg, #2A0A0A 0%, #0B0F14 70%)',
      },
      spacing: { section: '5rem' },
      keyframes: {
        rise: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '15%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-110vh) scale(0.4)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px -4px rgba(214,31,31,0.4)' },
          '50%': { boxShadow: '0 0 36px 0 rgba(255,106,26,0.55)' },
        },
      },
      animation: {
        rise: 'rise 9s linear infinite',
        'pulse-glow': 'pulseGlow 2.8s ease-in-out infinite',
        'spin-slow': 'spin 22s linear infinite',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
