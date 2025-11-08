/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        'panel-strong': 'var(--panel-strong)',
        border: 'var(--border)',
        brand: 'var(--brand)',
        'brand-600': 'var(--brand-600)',
        'brand-glow': 'var(--brand-glow)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
      },
      boxShadow: {
        'soft': 'var(--panel-shadow)',
        'ring': 'var(--ring)',
        'glow': 'var(--glow-soft)',
        'glow-strong': '0 0 32px rgba(57,223,255,.4)',
      },
      backdropBlur: {
        'lg': 'var(--blur-lg)',
        'xl': 'var(--blur-xl)',
      },
      borderRadius: {
        'md': '12px',
        'lg': '16px',
        'xl': '22px',
        '2xl': '30px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      screens: {
        'xs': '360px',
        'sm': '480px',
      },
    },
  },
  plugins: [],
}

