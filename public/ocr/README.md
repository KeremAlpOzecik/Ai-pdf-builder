# Local OCR resources

Tesseract.js worker and tesseract.js-core WASM are copied from lockfile-pinned npm packages by `scripts/prepare-ocr.cjs` before building. English and Turkish traineddata are bundled from the Tesseract.js project's https://tessdata.projectnaptha.com/4.0.0/ distribution. Runtime requests use this site's `/ocr/` paths; no CV content is transmitted. Tesseract and traineddata use the Apache 2.0 license. Runtime and language resources are only loaded when image recognition is needed.
