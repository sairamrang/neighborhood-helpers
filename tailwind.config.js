/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3ff',
          100: '#fde6ff',
          200: '#fccfff',
          300: '#fba4ff',
          400: '#f769ff',
          500: '#e933ff',
          600: '#c916e0',
          700: '#a50fb8',
          800: '#881096',
          900: '#6f1077',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        neon: {
          pink: '#ff006e',
          purple: '#8338ec',
          blue: '#3a86ff',
          green: '#06ffa5',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(233, 51, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(233, 51, 255, 0.4)',
        'neon': '0 0 15px rgba(255, 0, 110, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
