/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"ABC Social"', '-apple-system', 'BlinkMacSystemFont', '"avenir next"', 'avenir', '"segoe ui"', '"helvetica neue"', 'helvetica', 'Ubuntu', 'roboto', 'noto', 'arial', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'grid-gray-100': 'linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)',
        'grid-gray-900': 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '4rem 4rem',
      },
      keyframes: {
        spinCustom: {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "20%, 25%": { transform: "scale(1.3) rotate(90deg)" },
          "45%, 50%": { transform: "scale(1) rotate(180deg)" },
          "70%, 75%": { transform: "scale(1.3) rotate(270deg)" },
          "95%, 100%": { transform: "scale(1) rotate(360deg)" },
        },
      },
      animation: {
        "spin-custom": "spinCustom 2s linear infinite",
      },
    },
  },
  plugins: [],
};
