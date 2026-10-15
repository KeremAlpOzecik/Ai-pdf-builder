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

## PDF editing studio

`/tools/edit-pdf` embeds the ekoPDF Studio from `vendor/pdf-studio` on the same origin, replacing the former overlay-only editor. Supported embedded fonts and original sizes are reused when editing existing text. Missing glyphs block export until a full TTF/OTF is uploaded or Noto Sans is explicitly selected. Image editing, page operations, redaction, signatures, watermarks, PDF/image export and `.ekopdf` projects are included. Documents remain in the browser.

`npm run build` generates `public/pdf-studio` before Next.js. Before `npm run dev`, run `node scripts/build-pdf-studio.mjs` once. Generated assets are ignored. MuPDF is copied from the root lockfile-pinned dependency. The studio's AGPL source and license are available at `/pdf-studio/source.zip` and `/pdf-studio/LICENSE.txt`; see its README for dependency licenses and font limitations. Scanned text requires OCR separately. The iframe isolates studio CSS and keyboard controls from the CV builder.

After building, `npx playwright test e2e/pdf-editor.spec.ts --project=chromium --project=mobile-chromium` tests native text/font/size preservation, missing-glyph export blocking, uploaded fonts across project save/reopen, local assets and mobile export. Set `E2E_BASE_URL=https://ekopdf.com` to run these checks against production with generated sample documents. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` optionally selects a system Chromium executable.

## Client-side batch PDF tools

Compression, splitting, PDF → Word, Word → PDF and PDF → JPG share `src/components/tools/batch-tool.tsx`. It accepts 15+ files, appends uploads, supports drag ordering and keyboard-accessible move buttons, and keeps status, progress, errors and output blobs associated with stable file IDs. Inputs are limited to 25 MB each and 500 MB per group.

`src/lib/batch-queue.ts` runs one task by default and allows up to three concurrent tasks. Task failures are isolated. Completed files are retained when retrying failed/waiting files; changing processing settings invalidates prior results. Navigation aborts pending tasks and suppresses late UI updates; already active library calls finish and release their resources.

`src/lib/pdf/batch-split.ts` loads each source once for all its output pages. Range selection is validated against each document individually, rather than clamped to another file's page count. Visual page selection remains available for a single file. Compression and PDF conversion report page progress and release PDF.js workers and canvases after use. DOCX conversion reports its initial processing stage and completion because the converter has no granular progress API.

`src/lib/batch-zip.ts` loads JSZip on demand, sanitizes filenames and resolves case-insensitive collisions with numbered suffixes. ZIP export becomes available after all tasks finish, includes successful outputs and preserves list order. STORE compression avoids recompressing PDF/JPEG/DOCX data. Input and output blobs and the generated ZIP still occupy browser memory; use smaller groups for documents producing large raster outputs.

Run `npm test` for queue, ZIP, split and existing regressions. After `npm run build`, run `npx playwright test e2e/batch-processing.spec.ts --project=chromium --project=mobile-chromium` for upload, reorder, error isolation, actual conversions and ZIP download checks.
