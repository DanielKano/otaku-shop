/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        // Colores Neon para efectos modernos
        neon: {
          purple: {
            light: '#c67fff',
            DEFAULT: '#b55cff',
            dark: '#9a3fe6',
          },
          pink: {
            light: '#ff5bb8',
            DEFAULT: '#ff3ea5',
            dark: '#e62a8f',
          },
          cyan: {
            light: '#5ee8f7',
            DEFAULT: '#42e2f4',
            dark: '#2bc9db',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgb(181 92 255 / 0.5), 0 0 10px rgb(181 92 255 / 0.5)',
          },
          '50%': {
            boxShadow: '0 0 10px rgb(255 62 165 / 0.7), 0 0 20px rgb(255 62 165 / 0.7)',
          },
        },
      },
      // Blur para glass effect
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
