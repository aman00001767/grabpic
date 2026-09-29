/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Stitch design system fonts
        display: ["'DM Serif Display'", 'serif'],
        space: ["'Space Grotesk'", 'sans-serif'],
        sans: ["'Inter'", 'sans-serif'],
      },
      colors: {
        // Stitch warm editorial palette
        espresso: '#120d0a',
        surface: {
          DEFAULT: '#1a130f',
          container: '#241a14',
          'container-low': '#18110d',
          'container-lowest': '#0d0907',
          'container-high': '#31231b',
          'container-highest': '#3f2e24',
        },
        outline: '#6d5242',
        'outline-variant': '#3d2b20',
        terracotta: {
          DEFAULT: '#e0533c',
          container: '#c4422c',
          fixed: '#ff8773',
          'fixed-dim': '#f87157',
          dark: '#8f3627',
        },
        ochre: {
          DEFAULT: '#f59e0b',
          container: '#633905',
          dim: '#d4860a',
        },
        sand: '#fdf8f0',
        bronze: '#3d2b20',
        // Muted text tones from the design
        'on-surface': '#fdf8f0',
        'on-surface-variant': '#d6c7bc',
        'muted': '#bfaea4',
        'muted-deep': '#b89e8f',
        'muted-darker': '#cbb8ad',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(224, 83, 60, 0.12), transparent)',
        'card-warm': 'linear-gradient(115deg, transparent 30%, rgba(224, 83, 60, 0.05) 50%, transparent 70%)',
        'gradient-down': 'linear-gradient(to bottom, #18110d, #120d0a)',
      },
      boxShadow: {
        'glow': '0 8px 30px rgba(224, 83, 60, 0.35)',
        'glow-lg': '0 12px 40px rgba(224, 83, 60, 0.45)',
        'glow-sm': '0 4px 20px rgba(224, 83, 60, 0.25)',
        'ochre-glow': '0 4px 20px rgba(245, 158, 11, 0.25)',
        'inner-warm': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
      },
      spacing: {
        'margin': '2.5rem',
        'gutter': '2rem',
        'space-xs': '0.35rem',
        'space-sm': '0.75rem',
        'space-md': '1.25rem',
        'space-lg': '2rem',
        'space-xl': '3.5rem',
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
          '0%, 100%': { boxShadow: '0 4px 20px rgba(224, 83, 60, 0.25)' },
          '50%': { boxShadow: '0 8px 35px rgba(224, 83, 60, 0.50)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
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
