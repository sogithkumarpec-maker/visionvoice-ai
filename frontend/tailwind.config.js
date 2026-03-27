/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#818CF8'
        },
        secondary: {
          DEFAULT: '#10B981',
          dark: '#059669'
        },
        accent: {
          DEFAULT: '#F59E0B'
        }
      },
      fontSize: {
        'caption': '28px',
        'large': '36px'
      },
      minHeight: {
        'touch': '48px'
      },
      minWidth: {
        'touch': '48px'
      }
    },
  },
  plugins: [],
}
