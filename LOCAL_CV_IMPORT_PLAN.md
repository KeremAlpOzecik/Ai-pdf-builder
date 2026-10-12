# Implementation brief

Replace cloud CV extraction with browser-only PDF text extraction and Turkish/English OCR. Never upload document bytes, text, or form data. Serve OCR worker, WASM and language resources from this site. Keep cloud endpoints disabled before body parsing and remove cloud actions from the UI.

Produce an editable draft without inventing facts or translating source content. Extract contact fields and explicit section headings; preserve all source text for manual review and correction, including unclassified content. Let users correct extracted text and rebuild the draft deliberately. Require confirmation before replacing existing content. Bound file size, page count and image dimensions, report real processing stages, release PDF/worker resources after success or failure, and leave the previous draft intact on failure.

Verify Turkish/English fixtures, multiple experience/education entries, ambiguous content, blank/corrupt files, selectable and scanned PDFs, PNG/JPEG/WebP, exports and absence of document network requests. Update product/privacy copy to the actual behavior, run regression tests and a production build, then push the tested commit and verify production.
