/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./admin/**/*.html",
    "./*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bgDark: '#0a0010',
          bgGradientStart: '#0d0015',
          bgGradientEnd: '#12002a',
          card: 'rgba(15, 8, 30, 0.65)',
          cardBorder: 'rgba(167, 139, 250, 0.15)',
          cardBorderHover: 'rgba(167, 139, 250, 0.45)',
          purple: '#7c3aed',
          purpleGlow: '#a855f7',
          purpleLight: '#c084fc',
          purpleMuted: '#a78bfa',
          purpleDark: '#4c1d95',
          accentGreen: '#10b981',
          textWhite: '#ffffff',
          textMuted: 'rgba(255, 255, 255, 0.72)',
          textDim: 'rgba(167, 139, 250, 0.75)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        'card': '18px',
        '2xl': '20px',
      },
      boxShadow: {
        'purple-glow': '0 0 30px rgba(124, 58, 237, 0.35)',
        'purple-glow-lg': '0 0 50px rgba(168, 85, 247, 0.45)',
        'card-lift': '0 16px 40px rgba(124, 58, 237, 0.18)',
        'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'main-dark-gradient': 'linear-gradient(135deg, #0d0015 0%, #0a0010 40%, #12002a 100%)',
        'purple-btn-gradient': 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        'purple-accent-gradient': 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        'glass-card-gradient': 'linear-gradient(135deg, rgba(20, 10, 40, 0.7) 0%, rgba(10, 0, 20, 0.8) 100%)',
      }
    },
  },
  plugins: [],
}
