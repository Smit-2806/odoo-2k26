/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.4s ease both',
        'fade-in':     'fadeIn 0.35s ease both',
        'scale-in':    'scaleIn 0.3s ease both',
        'slide-right': 'slideInRight 0.4s ease both',
        'count-up':    'countUp 0.6s ease both',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #9333ea, #3b82f6)',
        'card-gradient':  'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.4))',
      },
      boxShadow: {
        'brand': '0 0 30px rgba(168, 85, 247, 0.15)',
        'card':  '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-blue':   '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-emerald':'0 0 20px rgba(16, 185, 129, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
