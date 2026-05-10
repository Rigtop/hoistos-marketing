/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="hoistos"]'],
  theme: {
    extend: {
      colors: {
        // HoistOS palette (default)
        hoistos: {
          ink: '#111827',
          signal: '#F25A00',
          'signal-2': '#FF8A3D',
          paper: '#FFFFFF',
          concrete: '#F2F4F7',
          steel: '#6B8090',
          obsidian: '#0B0F14',
          'obsidian-2': '#11161D',
          'obsidian-3': '#1A2029',
        },
        // Anthropic Claude Design palette (warm parchment, editorial)
        claude: {
          parchment: '#f5f4ed',
          ivory: '#faf9f5',
          'warm-sand': '#e8e6dc',
          terracotta: '#c96442',
          coral: '#d97757',
          'near-black': '#141413',
          'dark-surface': '#30302e',
          'olive-gray': '#5e5d59',
          'stone-gray': '#87867f',
          'warm-silver': '#b0aea5',
          'border-cream': '#f0eee6',
          'border-warm': '#e8e6dc',
          'focus-blue': '#3898ec',
          'error-crimson': '#b53333',
        },
        // Semantic tokens — auto-route to active theme via CSS vars
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
        'fg-subtle': 'rgb(var(--color-fg-subtle) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-2': 'rgb(var(--color-accent-2) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        // HoistOS theme fonts
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        brand: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        // Claude theme fonts (Anthropic Serif lookalike via Georgia / EB Garamond)
        'claude-serif': ['"EB Garamond"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // HoistOS: glow accents
        glow: '0 0 30px rgba(242, 90, 0, 0.35)',
        'glow-soft': '0 0 60px rgba(242, 90, 0, 0.18)',
        // Claude: ring-based shadows (no traditional drop shadows)
        ring: '0 0 0 1px rgb(var(--color-border) / 0.6)',
        'ring-warm': '0 0 0 1px #d1cfc5',
        'whisper': '0 4px 24px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-60px, 40px) scale(1.1)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 0 0 rgba(242, 90, 0, 0.5)' },
          '70%': { boxShadow: '0 0 0 16px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out forwards',
        drift: 'drift 18s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [],
}
