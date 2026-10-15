"use client";

export function EditPdfEditor() {
  return (
    <section aria-label="ekoPDF Studio" className="ekopdf-studio overflow-hidden rounded-2xl border bg-background">
      <iframe
        title="ekoPDF PDF düzenleyici"
        src="/pdf-studio/index.html"
        className="block h-[calc(100dvh-5rem)] min-h-[680px] w-full border-0"
        allow="fullscreen"
      />
    </section>
  );
}
