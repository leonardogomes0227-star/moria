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
        display: ['Anton', 'Impact', 'sans-serif'],
        script: ['"Permanent Marker"', 'cursive'],
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
        shimmer: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to: { opacity: '1', transform: 'none' },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(40px,-30px,0) scale(1.15)' },
        },
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '80%,100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        kenburns: {
          '0%': { transform: 'scale(1) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.07) translate3d(-1.5%,-1%,0)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(320%) skewX(-18deg)' },
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
        kenburns: 'kenburns 16s ease-in-out infinite alternate',
        sweep: 'sweep 5s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both',
        drift: 'drift 14s ease-in-out infinite',
        ping2: 'ping2 2s cubic-bezier(0,0,0.2,1) infinite',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
