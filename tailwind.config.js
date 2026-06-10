/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      /* ── Brand colors ── */
      colors: {
        primary:     { DEFAULT: '#4F46E5', dark: '#3730A3', light: '#EEF2FF', mid: '#818CF8', xlight: '#F5F3FF' },
        surface:     { DEFAULT: '#FFFFFF', 2: '#F8F8F6', 3: '#F1F0ED', 4: '#E9E9E5' },
        text:        { 1: '#111110', 2: '#4B4B47', 3: '#8A8A85', 4: '#AEAEAD' },
        border:      { DEFAULT: '#E4E4E0', strong: '#CBCBC6' },
        green:       { DEFAULT: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
        amber:       { DEFAULT: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
        red:         { DEFAULT: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
        blue:        { DEFAULT: '#2563EB', bg: '#EFF6FF' },
      },

      /* ── Typography ── */
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        'xxs':  ['11px',  { lineHeight: '1.5' }],
        'xs':   ['12px',  { lineHeight: '1.5' }],
        'sm':   ['13px',  { lineHeight: '1.5' }],
        'base': ['15px',  { lineHeight: '1.5' }],
        'md':   ['15px',  { lineHeight: '1.5' }],
        'lg':   ['16px',  { lineHeight: '1.5' }],
        'xl':   ['18px',  { lineHeight: '1.25' }],
        '2xl':  ['22px',  { lineHeight: '1.25' }],
        '3xl':  ['26px',  { lineHeight: '1.15' }],
        '4xl':  ['32px',  { lineHeight: '1.15' }],
        '5xl':  ['40px',  { lineHeight: '1.15' }],
      },
      letterSpacing: {
        tight:  '-0.03em',
        snug:   '-0.02em',
        normal: '-0.01em',
        wide:   '0.04em',
        wider:  '0.08em',
      },

      /* ── Spacing (4px base) ── */
      spacing: {
        1:  '4px',  2:  '8px',  3:  '12px', 4:  '16px',
        5:  '20px', 6:  '24px', 7:  '28px', 8:  '32px',
        10: '40px', 12: '48px', 14: '56px',
      },

      /* ── Border Radius ── */
      borderRadius: {
        xs:   '4px',
        sm:   '6px',
        md:   '10px',
        lg:   '16px',
        xl:   '22px',
        '2xl':'28px',
        full: '9999px',
      },

      /* ── Shadows ── */
      boxShadow: {
        1:      '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        2:      '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        3:      '0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)',
        indigo: '0 4px 14px rgba(79,70,229,0.25)',
      },

      /* ── Breakpoints ── */
      screens: {
        sm:  '640px',
        md:  '900px',
        lg:  '1280px',
        xl:  '1600px',
      },

      /* ── Transitions ── */
      transitionTimingFunction: {
        modal:  'cubic-bezier(0.32,0.72,0,1)',
        bounce: 'cubic-bezier(0.34,1.56,0.64,1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        modal:'300ms',
      },
    },
  },
  plugins: [],
}
