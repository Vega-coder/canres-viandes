/** @type {import('tailwindcss').Config} */
export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta oficial de CANRES Viandes (Boucherie artisanale & Charcuterie)
      colors: {
        ink: {
          DEFAULT: '#141414', // Negro carbón
          soft: '#201E1E',
          muted: '#2E2B2A',
        },
        brand: {
          red: '#8B0000',     // Rojo Toro CANRES
          wine: '#660F12',    // Borgoña / Tinto profundo
          dark: '#450A0B',    // Oxblood oscuro
          light: '#A51D24',   // Carmesí brillante
        },
        gold: {
          light: '#F59E0B',
          DEFAULT: '#D97706', // Ámbar asador
          dark: '#B45309',
        },
        cream: {
          DEFAULT: '#F5EFEB', // Hueso / Papel carnicero
          light: '#FAF6EB',
          paper: '#FBF8EE',
        },
        taupe: {
          DEFAULT: '#786F6A',
          light: '#A89F9A',
        },
      },
      fontFamily: {
        display: ['Oswald', 'Montserrat', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.22em',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #450A0B 0%, #660F12 50%, #8B0000 100%)',
        'gold-gradient': 'linear-gradient(135deg, #B45309 0%, #F59E0B 50%, #D97706 100%)',
      },
      boxShadow: {
        luxe: '0 20px 50px -20px rgba(20, 20, 20, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        float: 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}
