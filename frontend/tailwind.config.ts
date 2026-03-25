import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
        },
        accent: {
          cyan: '#06B6D4',
          blue: '#3B82F6',
        },
        dark: {
          DEFAULT: '#0B0F1A',
          card: 'rgba(255,255,255,0.05)',
        },
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #0B0F1A 0%, #0E1330 50%, #1A0B2E 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
        'gradient-button': 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
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
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(139,92,246,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(139,92,246,0.7)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
