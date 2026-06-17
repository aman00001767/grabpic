/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f3f0ff',
          100: '#e9e3ff',
          200: '#d4c8ff',
          300: '#b49dff',
          400: '#9466ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0e7a',
          950: '#1e0a3e',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172032',
          900: '#0f172a',
          950: '#020617',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124, 58, 237, 0.25), transparent)',
        'card-shine': 'linear-gradient(115deg, transparent 30%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(124, 58, 237, 0.35)',
        'glow-lg': '0 0 40px -10px rgba(124, 58, 237, 0.4)',
        'glow-sm': '0 0 10px -3px rgba(124, 58, 237, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px -5px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 35px -5px rgba(124, 58, 237, 0.55)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(100%) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateX(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateX(100%) scale(0.95)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'toast-in': 'toast-in 0.35s ease-out forwards',
        'toast-out': 'toast-out 0.25s ease-in forwards',
      },
    },
  },
  plugins: [],
};
