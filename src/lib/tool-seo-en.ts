import type { ToolSeo } from "./tool-seo";
import type { ToolSlug } from "./tools";

type EnglishContent = Omit<ToolSeo, "slug" | "keywords" | "related">;
type Pair = [string, string];
function content(title: string, summary: string, steps: Pair[], faqs: Pair[]): EnglishContent {
  return { title, h1: title, description: summary, summary,
    steps: steps.map(([title, body]) => ({ title, body })),
    faqs: faqs.map(([question, answer]) => ({ question, answer })),
  };
}
const batchFaqs: Pair[] = [
  ["Can I process multiple files?", "Yes. Select 15 or more files, append more files and reorder the list. Input limits are 25 MB per file and 500 MB per group. Processing is sequential by default; you can choose 1–3 concurrent files."],
  ["Can I download every result in one ZIP?", "Yes. After all tasks finish, download completed outputs as ZIP. Duplicate filenames receive numbered suffixes. Failed files are excluded and can be retried without losing completed results."],
];
function batchSteps(files: string, settings: string): Pair[] {
  return [[`Choose ${files}`, "Select one or more files. Input limits are 25 MB per file and 500 MB per group; reorder the list if needed."],
    ["Configure and process", `${settings} Choose 1–3 concurrent files and monitor each status. A failed file does not stop the others.`],
    ["Review and download", "Check completed outputs, then download them individually or as ZIP. Keep the originals."]];
}

export const englishToolSeo: Record<ToolSlug, EnglishContent> = {
  "compare-pdf": content("Compare PDF documents", "Compare the text layers of old and new PDFs side by side. Removed text is pink, added text is green and scrolling is synchronized. Images and formatting are not compared; reading order may vary in multi-column documents.",
    [["Choose two PDFs", "Select the old and new documents, up to 25 MB each."], ["Compare text", "Extract text layers and calculate word differences. Pages without text produce an OCR warning."], ["Inspect differences", "Review the highlighted text and summary. Changes count consecutive difference blocks; additions and deletions count words."]],
    [["Can I compare scanned PDFs?", "Pages without a text layer cannot be compared directly. Run OCR first."], ["What are the processing limits?", "Each document supports up to 300 pages and 300,000 extracted characters. Documents with too many differences can also exceed the processing limit."], ["Are files uploaded?", "No. Text extraction and comparison run in your browser."]]),
  "compress-image": content("Compress a photo to 100, 200 or 500 KB", "Reduce JPEG, PNG or WebP photos to a target size on your device. Preview the original immediately after choosing it, then review the JPEG or WebP result before downloading. Quality and dimensions may decrease; acceptance by an application form is not guaranteed.",
    [["Choose a photo", "Select JPEG, PNG or WebP up to 25 MB and 40 megapixels. The selected filename and original preview confirm the photo is ready."], ["Set a size limit", "Choose 100, 200 or 500 KB, or a custom limit from 10–25000 KB. One KB is 1000 bytes."], ["Compress and review", "Click Compress photo, review the output dimensions and preview, then download JPEG or WebP."]],
    [["Is the photo uploaded when I select it?", "No. Selection prepares a local photo and shows its preview. Click Compress photo to start processing; photo content is not sent to a server."], ["Is PNG output available?", "No. Outputs are JPEG or WebP. Transparent areas become white in JPEG and animations become a still frame."], ["Will quality change?", "Quality and pixel dimensions may be reduced to meet the size limit. Check the preview and the form's minimum dimensions."]]),
  "edit-pdf": content("Edit PDF text, images and pages", "Edit supported PDF text with its original embedded font and size. Add images, signatures and watermarks, manage pages and export in your browser. Missing glyphs require a full font file or an explicit Noto Sans fallback.",
    [["Open a PDF", "Choose a PDF or .ekopdf project. Password-protected PDFs require their opening password. Maximum 300 MB and 500 pages; performance depends on your device."], ["Edit text and elements", "Select the text editing tool and click existing text. Upload a matching TTF/OTF when glyphs are missing, or choose Noto Sans. Add text, images, shapes and signatures."], ["Download and review", "Export the PDF and inspect layout, links and forms. Save a project to continue editing later."]],
    [["Does this edit existing text?", "Yes, supported digital text is removed and replaced with selectable text. Embedded TrueType/OpenType fonts can be reused. Scanned or outlined text cannot be edited directly; complex typography needs review."], ["Are documents uploaded?", "No. File editing runs in your browser; a local draft may be stored on this device."]]),
  "word-to-pdf": content("Convert Word files to PDF", "Convert multiple DOCX files to separate PDFs in your browser and download completed results individually or as ZIP. Fonts and layout may be simplified; original design is not guaranteed to be preserved.", batchSteps("DOCX files", "Use .docx files; legacy .doc files are not supported."), batchFaqs),
  "pdf-to-word": content("Convert PDF text to Word", "Extract text from multiple PDFs into editable DOCX files, then download them individually or as ZIP. Complex layouts may be simplified. Scanned pages need an OCR text layer first.", batchSteps("PDF files", "Use PDFs with selectable text; run OCR first for image-only pages."),
    [...batchFaqs, ["Is the original layout preserved?", "No. This tool exports extracted text, rather than reproducing the original design, images and forms."]]),
  merge: content("Merge PDF files", "Combine PDFs into one document in the order shown in the list. Reorder and remove files before processing. Files are processed in your browser without an account.",
    [["Choose PDFs", "Select the PDFs and check that each file belongs in the final document."], ["Arrange and merge", "Reorder the files, remove duplicates and run the merge."], ["Review the result", "Download one PDF and check the first, last and middle pages."]],
    [["Is this the same as batch processing?", "No. Merge creates one PDF from several source documents. Batch compression and conversion create separate results."], ["Do I need an account?", "No. This tool is free and runs in your browser."]]),
  split: content("Split PDF files", "Apply the same page range to multiple PDFs or export each page as a separate PDF. Visual page selection is available for a single file. Ranges are validated per document; outputs can be downloaded individually or as ZIP.", batchSteps("PDF files", "Choose a shared page range or a separate file for each page. Visual selection is available for one file only."),
    [...batchFaqs, ["What if documents have different page counts?", "A range outside a document's page count fails for that file. It is not silently shortened; other valid documents continue processing."]]),
  compress: content("Compress PDF files", "Compress multiple PDFs with a selected quality setting and download completed results individually or as ZIP. Pages become images and selectable text is lost. File size can increase; a specific size reduction is not guaranteed.", batchSteps("PDF files", "Choose balanced, smaller file or high quality. Sequential processing uses less memory."),
    [...batchFaqs, ["Is selectable text preserved?", "No. Pages are rasterized. Keep the originals and verify readability and output size."]]),
  "jpg-pdf": content("Convert images to PDF or PDFs to JPG", "Combine JPEG, PNG or WebP images into one PDF. In PDF to JPG mode, convert multiple PDFs into page images and download them individually or as ZIP. JPEG images do not retain text layers or interactive forms.",
    [["Choose a direction", "Select Images to PDF or PDF to JPG."], ["Choose and arrange files", "Arrange images for a single PDF, or select multiple PDFs in PDF to JPG mode. PDF batch input limits are 25 MB per file and 500 MB per group."], ["Process and download", "Download one PDF from images, or download completed JPG pages individually or as ZIP."]],
    [["Can I convert multiple PDFs to JPG?", "Yes. Choose PDF to JPG, add the files, process them and download completed images as ZIP after all tasks finish. Failed files can be retried."], ["Should I make my CV an image?", "Use a PDF with selectable text when an application needs readable text; JPEG outputs are images."]]),
  ocr: content("Make scanned PDFs searchable with OCR", "Add an OCR text layer to scanned PDF pages in your browser. Turkish and English are recognized together. Only the first 20 pages are processed; review the recognition results.",
    [["Choose a scanned PDF", "Select a PDF up to 25 MB."], ["Run OCR", "The first 20 pages are recognized locally with Turkish and English."], ["Check the searchable output", "Download and search for a name or date. OCR may make mistakes."]],
    [["Is OCR always accurate?", "No. Review the extracted text, especially names, numbers and dates."], ["Is OCR free?", "Yes. No account is required; document content is processed on your device."]]),
  sign: content("Add a visual signature to a PDF", "Add a typed name or signature image to the last page of a PDF. This creates a visual mark, not a qualified electronic signature.",
    [["Choose a PDF", "Select the document to mark."], ["Add a name or image", "Type a name or choose a PNG/JPEG signature image and position it in the preview."], ["Download and inspect", "Check the placement on the last page."]],
    [["Is this a qualified electronic signature?", "No. This tool adds a visual mark and does not create a certificate-based electronic signature."]]),
  watermark: content("Add a watermark to a PDF", "Add a text watermark such as DRAFT or your name to every page of a PDF. Set the placement in the preview and process files in your browser.",
    [["Choose PDFs", "Select the PDF files."], ["Set the watermark", "Enter the text and use the preview to position it."], ["Download and inspect", "Check the watermark on the output pages."]],
    [["Does a watermark prevent copying?", "No. It is a visible text mark, not a security or access-control mechanism."]]),
  rotate: content("Rotate PDF pages", "Rotate PDF pages by 90, 180 or 270 degrees. For a single PDF, select specific pages; otherwise rotate all pages. Processing runs in your browser.",
    [["Choose PDFs", "Select one or more PDF files."], ["Choose the rotation", "Set the angle. For a single document you may select specific pages."], ["Download and inspect", "Check that the intended pages face the correct direction."]],
    [["Can I rotate only selected pages?", "Yes. For one PDF, enable selected-page rotation and choose the pages."]]),
  "page-numbers": content("Add page numbers to a PDF", "Add page numbers in 1 / N format to PDF pages. Choose a top or bottom position or place the numbers in the preview. Processing runs in your browser.",
    [["Choose PDFs", "Select documents to number."], ["Choose a position", "Use a preset or position the numbers in the preview."], ["Download and inspect", "Check the last page and the total count."]],
    [["Can I skip the cover page?", "This tool numbers all pages. Separate the cover page first if it should not be numbered."]]),
};
