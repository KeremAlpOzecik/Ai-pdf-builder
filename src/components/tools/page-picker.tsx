"use client";

import { useEffect, useState } from "react";
import { openPdf, renderPageToCanvas } from "@/lib/pdf/pdfjs-client";
import { useDisplayLanguage } from "@/components/providers";

export function PagePicker({ file, selected, onChange }: { file: File; selected: number[]; onChange: (pages: number[]) => void }) {
  const tr = useDisplayLanguage() === "TR";
  const [pages, setPages] = useState<string[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function draw() {
      const doc = await openPdf(await file.arrayBuffer());
      try {
        const images: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          images.push((await renderPageToCanvas(page, 0.18)).toDataURL());
          if (!cancelled) setPages([...images]);
        }
      } finally { await doc.loadingTask.destroy(); }
    }
    void draw().catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [file]);
  if (error) return <p role="alert" className="text-sm text-destructive">{tr ? "Sayfalar önizlenemedi. PDF bozuk veya parola korumalı olabilir." : "Pages could not be previewed. The PDF may be damaged or password protected."}</p>;
  return <div className="grid max-h-80 grid-cols-3 gap-3 overflow-auto p-1 sm:grid-cols-5" aria-label={tr ? "Sayfa seçimi" : "Page selection"}>{pages.map((image, i) => <button type="button" key={i} aria-pressed={selected.includes(i + 1)} onClick={() => onChange(selected.includes(i + 1) ? selected.filter(page => page !== i + 1) : [...selected, i + 1].sort((a, b) => a - b))} className={`rounded-lg border-2 p-2 ${selected.includes(i + 1) ? "border-primary bg-primary/10" : "border-border bg-card"}`}><span className="block aspect-[0.707] bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${image})` }} /><span className="mt-1 block text-sm">{i + 1}{selected.includes(i + 1) ? " ✓" : ""}</span></button>)}</div>;
}
