/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,css,scss}'],
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        primary: '#3060fe',
        'primary-light': '#d6e4ff',
        'cream-white': '#fffcf0',
        'light-yellow': '#fefce8',
        'pale-blue': '#ebf0ff',
        'sky-blue': '#8db5ff',
        'deep-blue': '#113b98',
        'light-blue': '#E5EFFF',
        'black-alpha': 'rgba(0, 0, 0, 0.1)',
        'success-alpha': 'rgba(25, 135, 84, 0.12)',
        'light-gray': '#e6eaef',
        'light-beige': '#f4f1ea',
        'light-grey-medium': '#c3c3c3',
        'charcoal-gray': '#3F434B',
        muted: '#7e7e7e',
        'amber-50': '#FFF9EB',
        'amber-200': '#FFE6B1',
        'amber-800': '#8F6734',
        'blue-soft': '#DFE8FF',
        'black-232': '#232322',
        'blue-46': '#4685F4',
        'black-22': '#222A3F',
      },
      fontFamily: {
        primary: ['var(--font-dm-sans)'],
        secondary: ['var(--font-instrument-sans)'],
        tertiary: ['var(--font-instrument-serif)'],
        poppins: ['var(--font-poppins)'],
        playfairDisplay: ['var(--font-playfair-display)'],
        lato: ['var(--font-lato)'],
        lumitype: ['var(--font-lumitype)'],
        inter: ['var(--font-inter)'],
      },

      // ✅ correct placement of animations
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',

        // ⭐ marquee animation
        marquee: 'marquee 20s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },

      boxShadow: {
        custom: '0 0 6px rgba(0, 0, 0, 0.1)',
        subtle: '0 1px 2px 0 rgba(16, 24, 40, 0.20)',
      },
      borderRadius: {
        base: '0.25rem',
      },
      spacing: {
        3.5: '14px',
      },
    },
  },
  plugins: [],
};
