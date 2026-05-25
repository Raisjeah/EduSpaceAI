/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      backdropBlur: {
        'xs': '2px',
        'mobile': '8px',
      },
      colors: {
        brand: {
          primary: '#0066FF',
          surface: '#FFFFFC',
          background: '#F0F3FA',
          text: '#0D0D11',
          border: '#E4EAEB',
          success: '#2E7D32',
          'success-bg': '#E2F7E3',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
          border: 'rgba(255, 255, 255, 0.15)',
        },
      },
      boxShadow: {
        'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 4px 12px rgba(0, 102, 255, 0.15)',
        'elevation-3': '0 8px 24px rgba(0, 102, 255, 0.25)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'liquid-flow': 'liquid-flow 12s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'liquid-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'wave': {
          '0%, 100%': { transform: 'translateY(0) scaleY(1)' },
          '50%': { transform: 'translateY(-20px) scaleY(1.1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
