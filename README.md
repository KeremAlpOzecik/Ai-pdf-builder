# AI CV Builder

ATS-friendly CV builder with a live split-screen preview. Edit locally in Zustand, import LinkedIn PDFs or screenshots through Gemini, then export PDF / Word. Optional Supabase auth stores CVs in the cloud.

## Stack

- Next.js App Router, TypeScript, Tailwind, shadcn/ui
- Zustand persist for live preview
- Gemini 3.7 Flash (`@google/genai`, fallback 3.6 Flash) for parse / ATS / translate
- Supabase (auth, Postgres, `cv_assets` storage)
- `@react-pdf/renderer` and `docx` for export

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

- `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if you want login and cloud save

Run `supabase/schema.sql` in the Supabase SQL editor (tables, RLS, `cv_assets` bucket). Enable Email and Google providers. Set the Google redirect URL to `http://localhost:3000/auth/callback`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The form and preview work without Supabase; AI import/optimize/translate need `GEMINI_API_KEY`.

## Features

- Tabbed form: personal, experience, education, skills, projects, certifications
- LinkedIn PDF import (`pdf-parse` + Gemini JSON schema)
- Screenshot OCR (`png` / `jpg` / `webp`)
- ATS rewrite and EN ↔ TR translation (explicit buttons only)
- Language switcher for UI labels
- Mobile Edit / Preview tabs
- PDF and Word export (single-column ATS layout)
