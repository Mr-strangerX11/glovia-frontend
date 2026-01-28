/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        primary: {
          50: '#fdf4f5',
          100: '#fce8eb',
          200: '#f9d5da',
          300: '#f4b3bc',
          400: '#ed8a98',
          500: '#e15b70',
          600: '#cc4460',
          700: '#ab2f4f',
          800: '#8f2a48',
          900: '#7a2742',
          950: '#441120',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dbe7',
          300: '#a7bcd2',
          400: '#7899b9',
          500: '#587ba1',
          600: '#446186',
          700: '#384f6d',
          800: '#31435b',
          900: '#2d3a4d',
          950: '#1e2633',
        },
        accent: {
          50: '#fef5ee',
          100: '#fde9d7',
          200: '#fbcfae',
          300: '#f7ad7a',
          400: '#f28044',
          500: '#ee5f1f',
          600: '#df4515',
          700: '#b93214',
          800: '#932918',
          900: '#762416',
          950: '#400f09',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(225, 91, 112, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
