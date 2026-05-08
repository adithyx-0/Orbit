/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dbe7ff',
          200: '#bfd3ff',
          300: '#93b4ff',
          400: '#608aff',
          500: '#3b63ff',
          600: '#2845f5',
          700: '#2136d1',
          800: '#1f31a8',
          900: '#1f3085',
        },
        // Dark surface depth scale — 0 is deepest, 5 is most elevated
        surface: {
          0: '#08080f',
          1: '#0e0e1a',
          2: '#141421',
          3: '#1b1b28',
          4: '#232333',
          5: '#2c2c3f',
        },
      },
      // Extra opacity stops so bg-white/4, bg-white/8, etc. compile cleanly
      opacity: {
        3:  '0.03',
        4:  '0.04',
        6:  '0.06',
        7:  '0.07',
        8:  '0.08',
        12: '0.12',
        14: '0.14',
        15: '0.15',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #2845f5 0%, #608aff 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0e0e1a 0%, #08080f 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'shimmer':          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 16px rgba(59,99,255,0.2)',
        'glow':    '0 0 32px rgba(59,99,255,0.25)',
        'glow-lg': '0 0 64px rgba(59,99,255,0.3)',
        'card':       '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        'card-lg':    '0 16px 56px rgba(0,0,0,0.6)',
        'modal':      '0 24px 80px rgba(0,0,0,0.7)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'scale-in':   'scaleIn 0.25s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.25, 0.4, 0.25, 1)',
      },
    },
  },
  plugins: [],
}
