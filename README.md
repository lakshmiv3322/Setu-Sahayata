# Setu Sahayata (सेतु सहायता)

A production-grade, AI-powered citizen empowerment portal built with Next.js 13 (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + RLS + Auth), and Google Gemini AI.

---

## 🛠️ Environment Setup

Copy `.env.example` to `.env` and populate the required API keys:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable | Description | Where to Get |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Supabase Dashboard → Project Settings → API |
| `GEMINI_API_KEY` | Google Gemini API Key | Google AI Studio (https://aistudio.google.com/apikey) |

---

## 🚀 Deployment

> [!IMPORTANT]
> **Environment Variables are NOT automatic on deploy targets.**
> Since `.env` is gitignored for security, environment variables will **not** be included automatically when pushing code to GitHub or deploying to hosting providers (Vercel, Netlify, Cloudflare Pages, etc.).

### Deploying to Vercel
1. Go to your project settings in the **Vercel Dashboard**.
2. Navigate to **Settings → Environment Variables**.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.
4. Redeploy your project.

### Deploying to Netlify
1. Go to your site settings in the **Netlify Dashboard**.
2. Navigate to **Site configuration → Environment variables**.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.
4. Trigger a fresh build.

---

## 🧪 Local Development

```bash
npm install
npm run dev
```

Run TypeScript typechecks:
```bash
npm run typecheck
```
