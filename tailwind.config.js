/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef6ee',
          100: '#fdead7',
          200: '#fad2ae',
          300: '#f6b17a',
          400: '#f18744',
          500: '#ec6620',
          600: '#dd4d16',
          700: '#b73a14',
          800: '#922f18',
          900: '#762916',
          950: '#3f1209'
        },
        ink: {
          900: '#1b1c1e',
          800: '#26282b',
          700: '#34373b',
          600: '#4a4e54',
          500: '#686d75',
          400: '#8b9099',
          300: '#b4b8bf',
          200: '#dcdee2',
          100: '#eff0f2',
          50: '#f7f8f9'
        },
        leaf: {
          500: '#2f9e57',
          600: '#25823f'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,28,30,0.06), 0 1px 12px rgba(27,28,30,0.05)'
      }
    },
  },
  plugins: [],
}
