import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern':
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },

        // ── PRIMARY: Deep Indigo-Teal "Bridge" palette ──────────────────────
        // The "Setu" (bridge) identity: trustworthy indigo meets refreshing teal
        setu: {
          50:  'hsl(192 60% 97%)',
          100: 'hsl(191 65% 92%)',
          200: 'hsl(190 62% 82%)',
          300: 'hsl(189 60% 68%)',
          400: 'hsl(188 58% 54%)',
          500: 'hsl(187 72% 38%)',    // primary mid (#1B6B7A range)
          600: 'hsl(193 80% 28%)',    // primary CTA (#0F4C5C range)
          700: 'hsl(196 84% 22%)',
          800: 'hsl(199 86% 17%)',
          900: 'hsl(202 88% 13%)',
          950: 'hsl(206 90% 8%)',
        },

        // ── ACCENT: Warm Saffron / Amber ────────────────────────────────────
        // Evokes warmth and action — used for CTAs, highlights
        saffron: {
          50:  'hsl(38 100% 96%)',
          100: 'hsl(37 96% 89%)',
          200: 'hsl(35 94% 78%)',
          300: 'hsl(33 92% 66%)',
          400: 'hsl(30 91% 57%)',
          500: 'hsl(27 92% 50%)',    // #F2994A range
          600: 'hsl(24 88% 44%)',    // #E8871E range
          700: 'hsl(22 84% 37%)',
          800: 'hsl(20 78% 31%)',
          900: 'hsl(18 70% 26%)',
        },

        // ── NEUTRAL: Warm off-white / off-black scale ────────────────────────
        neutral: {
          50:  'hsl(220 14% 97%)',   // warm off-white (never pure #FFF)
          100: 'hsl(220 12% 93%)',
          200: 'hsl(220 10% 85%)',
          300: 'hsl(220 8% 74%)',
          400: 'hsl(220 6% 58%)',
          500: 'hsl(220 5% 44%)',
          600: 'hsl(220 7% 33%)',
          700: 'hsl(220 10% 24%)',
          800: 'hsl(222 14% 16%)',
          900: 'hsl(224 18% 10%)',   // warm off-black (never pure #000)
          950: 'hsl(226 22% 6%)',
        },

        // ── LEGACY alias: keep "trust" pointing to setu so old classnames don't break ──
        trust: {
          50:  'hsl(192 60% 97%)',
          100: 'hsl(191 65% 92%)',
          200: 'hsl(190 62% 82%)',
          300: 'hsl(189 60% 68%)',
          400: 'hsl(188 58% 54%)',
          500: 'hsl(187 72% 38%)',
          600: 'hsl(193 80% 28%)',
          700: 'hsl(196 84% 22%)',
          800: 'hsl(199 86% 17%)',
          900: 'hsl(202 88% 13%)',
          950: 'hsl(206 90% 8%)',
        },

        // ── SEMANTIC STATUS colors ───────────────────────────────────────────
        approved: {
          DEFAULT: 'hsl(142 72% 38%)',
          light:   'hsl(142 70% 94%)',
          dark:    'hsl(142 72% 25%)',
        },
        pending: {
          DEFAULT: 'hsl(38 90% 50%)',
          light:   'hsl(38 90% 94%)',
          dark:    'hsl(38 90% 34%)',
        },
        rejected: {
          DEFAULT: 'hsl(0 72% 54%)',
          light:   'hsl(0 72% 95%)',
          dark:    'hsl(0 72% 36%)',
        },
        disbursed: {
          DEFAULT: 'hsl(263 60% 52%)',
          light:   'hsl(263 60% 95%)',
          dark:    'hsl(263 60% 35%)',
        },

        // ── KEEP emerald for health/education category tags ──────────────────
        emerald: {
          50:  'hsl(152 76% 95%)',
          100: 'hsl(149 76% 90%)',
          200: 'hsl(147 75% 82%)',
          300: 'hsl(144 76% 72%)',
          400: 'hsl(143 72% 60%)',
          500: 'hsl(142 71% 50%)',
          600: 'hsl(142 72% 43%)',
          700: 'hsl(142 73% 36%)',
          800: 'hsl(142 75% 30%)',
          900: 'hsl(143 75% 24%)',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px hsl(187 72% 38% / 0.3)' },
          '50%': { boxShadow: '0 0 20px hsl(187 72% 38% / 0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ring-fill': {
          from: { strokeDashoffset: 'var(--ring-dash-total)' },
          to:   { strokeDashoffset: 'var(--ring-dash-offset)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s linear forwards',
        'ticker': 'ticker 30s linear infinite',
        'ring-fill': 'ring-fill 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
        'count-up': 'count-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
