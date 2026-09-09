# Redesign implementation and verification

Verified 2026-09-09 against the local production server at http://localhost:3001.

## Changed
- Product-first homepage with PDF and CV actions, real template preview, prioritized tools and compact secondary discovery.
- Global navigation with mobile menu, template destination, language and theme controls.
- Shared tool shell, keyboard-accessible FileDrop, FileList previews/removal/reordering, PagePicker, persistent result/download states and recoverable errors.
- PDF editor fits its viewport, exposes mobile properties, supports keyboard text selection, resizing fields, undo/redo, and persistent re-download. Text rendering uses the bundled Noto Sans font; italic is exported.
- CV Studio has a three-column desktop workspace, mobile edit/preview/AI tabs, stepper, scaled/zoomable preview, labeled fields and explicit suggestion apply/reject controls.
- Split supports range, individual-page outputs and visual selection. Rotation supports selected pages. Compression exposes three presets and computed size change. Numbering exposes six positions. OCR and signature notices explain actual limits.

## Preserved
- All 12 tool routes, Studio, guides and supporting routes.
- Browser PDF processing using pdf-lib/PDF.js, DOCX handling using docx/mammoth, local OCR using Tesseract, CV PDF/DOCX exports.
- Zustand CV persistence and review/diff logic; three existing CV templates.
- API routes, Gemini model configuration, Supabase/auth plumbing, localization and SEO metadata/canonicals/schema.
- PDF-to-JPG remains the existing mode at /tools/jpg-pdf; no invented separate route.

## Validation
- `npm run build`: passed, 37 pages generated.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 12 tests (7 existing plus 3 processing and 2 PDF-import regression tests).
- `git diff --check`: passed.
- Production HTTP smoke check: all 14 primary routes return 200 and include title, canonical and JSON-LD.

## Browser smoke tests
Chrome automation operated the actual UI; screenshots and downloaded PDFs were visually inspected.
- All simple operations: select file, configure, process, result and download passed, including OCR and both image-conversion modes.
- Editor: source-text keyboard editing, new text, Turkish characters, undo/redo, export and re-download passed.
- Studio: create/edit, PDF and Word export, persisted draft, preview zoom and keyboard template selection passed.
- File picker via keyboard, drag/drop, removal, accessible reorder, invalid extension, 26 MB rejection, corrupt PDF recovery, visual split and split-every-page passed.
- Required widths 360, 390, 768, 1024 and 1440 passed overflow checks. Loaded editor/tool states and mobile Studio tabs were checked; dark theme and mobile menu passed.
- No uncaught page runtime errors in the successful smoke runs.
- Downloaded PDFs reopened successfully. OCR retained extracted text; Turkish signature/editor content rendered correctly.

## Earlier external issue and verification limits (superseded by follow-up)
Live ATS requests returned HTTP 500 from the existing API. A direct request to the configured Gemini model returned HTTP 503 UNAVAILABLE: model experiencing high demand. A second live UI request also failed. The model list request succeeded, confirming access to the configured models. No model/API settings were changed.
AI apply/reject and no-silent-overwrite behavior passed with a controlled response intercepted only in the test browser. Live AI generation, translation and AI import success cannot be signed off while the upstream service is unavailable. The UI presents localized recoverable errors. Full acceptance remains pending live AI recovery.
Existing engine limits remain: OCR processes the first 20 pages; compression rasterizes text and can enlarge small PDFs; Word conversions simplify layout; signatures are visual and placed on the last page. These are described in the UI.

## Reproduction evidence
Temporary local QA scripts and outputs are under `tmp/qa*` (ignored by Git): responsive, workflow, interaction, editor/Studio, controlled AI review and final keyboard/theme checks. Tests committed as source changes are in `scripts/tool-processing.test.cjs`.
No deployment or commit was performed.

## Follow-up verification
- Live ATS enhancement and translation returned HTTP 200 with real CV results.
- Fixed a pre-existing PDF import issue: the legacy pdf-parse parser rejected a valid object-stream PDF. The route now validates with pdf-lib and uses the existing Gemini PDF input path when legacy extraction fails. Corrupt PDFs remain rejected before AI fallback.
- Real PDF import returned HTTP 200 after this fix.
- Added two regression tests for valid-PDF fallback and corrupt-PDF rejection; all 12 tests pass.
- Tool route changes now reset component state so files/settings do not carry into another operation.
- Production build, lint and TypeScript checks pass after the follow-up changes.
- Real image import also returned HTTP 200. All four live AI endpoints have now succeeded. Gemini availability remains intermittent: earlier requests returned 503; localized error/retry behavior remains necessary.

## Export and editor defect follow-up
- Fixed explicit name/title line heights and header sizing in PDF export; preserved top/bottom margins across modern continuation pages. Generated and visually inspected a long Turkish two-page modern CV; no name/title overlap.
- Original PDF text selection now creates a selectable editable text layer and opens the existing properties controls (text, font size, color, alignment, rotation and opacity). Text-layer mapping matches nonempty extracted strings rather than assuming identical array indices.
- Browser checks passed with the reported user PDF using keyboard selection, and with a newly exported PDF using pointer selection. Edited Turkish text was verified in the downloaded PDF. Desktop and 390px mobile checks passed without runtime errors or horizontal document overflow.
- Modern DOCX now uses a two-column table with green contact/skills/language sidebar. Verified DOCX XML contains both cells and the green fill. Visual Word parity remains unverified: LibreOffice/Word is unavailable in this environment; an alternative renderer was blocked by Windows application policy and was not bypassed.
- Existing malformed downloads are not automatically repaired; regenerate from the CV draft to obtain corrected layout.
- This is not a complete Canva-equivalent arbitrary-PDF object editor: flattened images and original vector artwork are not independently editable; replacement text uses covering layers, not secure source-content redaction.
- Final lint and 12 regression tests pass; production build passed. Latest production server restarted on port 3001.

## Canva-style editor follow-up
- Added an original-PDF object browser alongside the text browser. PDF.js operator inspection identifies independent vector/image draw operations and lets the user select them as layers.
- Selected original graphics can be moved, resized, rotated, hidden, recolored when they are uniform vector fills, or replaced with an image. Layer ordering, duplicate, lock/hide, keyboard movement and an explicit layer list are available.
- Added `.cvproject` save/open files containing the source PDF, edits and canvas layers, with size, PDF signature, geometry, color and data-URL validation on import.
- Export bakes pages with changed original graphics into a high-resolution canvas while preserving untouched pages as PDF pages. The existing text and added-object export then applies on top.
- Browser regression passed on a two-page modern PDF: vector layers were listed and selected, the green sidebar fill was recolored, export completed, project save completed, and 390px overflow remained false. TypeScript, lint, 12 tests and production build pass.
- This is now a substantially closer Canva-style PDF workspace, but PDF operator semantics vary: complex clipping/transparency/font outlines may be represented as a rasterized selectable layer rather than a natively editable vector object. That limitation is surfaced by the fallback object name and does not affect ordinary text or uniform shapes.

## PDF editor V2 safety and WYSIWYG implementation (supersedes the editor export notes above)
- Read-only source selection is a true no-op. It is excluded from history/project/change count, and standard no-op export returns the original byte array unchanged.
- Source text/vector mutations are no longer silently baked into a standard PDF. Per-object and per-page capability analysis blocks unsafe standard output and directs the user to the explicit 300 DPI flattened mode.
- Preview and flattened output share Konva geometry and a 300 DPI PDF.js background. Preview, vector export and flattened export use the same canonical line breaker, including long-word and box-height behavior.
- Real Noto regular/bold/italic/bold-italic font assets replace synthetic double drawing. User TTF/OTF/WOFF/WOFF2 upload is supported for flattened output and fails closed in standard mode.
- Added marquee and modifier-key multi-selection, group/ungroup, group transforms, snapping guides, align/distribute, flip, crop and image filters, dashed/rounded shapes, page-scoped draggable layers, clipboard shortcuts, lock/hide, overflow opt-in and transaction-based history.
- Added page add/duplicate/delete/reorder/resize. Page indices, source text box IDs, edits and overlay layers are remapped together and covered by undo/redo.
- Edited thumbnails are rebuilt from the background, source-text masks and object-only Konva layer; selection handles never leak into thumbnails or output. Page background, A4/Letter sizing, auto-height, auto-fit, overflow warning and persistent user guides are included.
- `.cvproject` is version 2 with PDF-point/top-left center transforms. V1 import migrates source mutations conservatively and project imports validate PDF bytes, geometry, images and embedded font data URLs.
- Validation on 2026-09-09: 17 unit/regression tests, ESLint and Next.js 16.3 production build pass. Chromium, WebKit and 390 px mobile Playwright flows pass (8 active assertions, 7 intentional device-scope skips). Standard output reopens with pdf-lib, pypdf and Poppler, preserves title/author/form/annotations, and contains bold test text once after whitespace normalization. Flattened output reopens as one image-only page with no form/annotations, as disclosed in the UI.
- The Firefox Playwright binary cannot start on this Windows host because Windows SideBySide cannot resolve the binary's private `mozglue` assembly. A forced 122 MiB browser reinstall produced the same OS-level launch failure before any application code ran. Chromium and WebKit provide the completed engine coverage available on this host.
- Native mutation of arbitrary PDF content streams remains intentionally unsupported. PDF.js operator numbers are not treated as durable object identities; complex paths, clipping, shared XObjects and transparency groups are `flatten-only`, preventing silent structural corruption.
