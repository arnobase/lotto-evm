/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'slot-machine': {
          '0%': { transform: 'translateY(-50%)', filter: 'blur(8px)' },
          '100%': { transform: 'translateY(50%)', filter: 'blur(8px)' }
        }
      },
      animation: {
        'slot-machine': 'slot-machine 0.5s linear infinite'
      }
    }
  },
  plugins: [],
} 