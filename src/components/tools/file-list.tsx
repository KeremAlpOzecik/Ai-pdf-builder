"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDisplayLanguage } from "@/components/providers";
import { openPdf, renderPageToCanvas } from "@/lib/pdf/pdfjs-client";

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function FileInfo({ file }: { file: File }) {
  const tr = useDisplayLanguage() === "TR";
  const [info, setInfo] = useState<{ pages?: number; image?: string }>({});
  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    async function inspect() {
      if (file.type.startsWith("image/")) {
        url = URL.createObjectURL(file);
        if (!cancelled) setInfo({ image: url });
      } else if (file.name.toLowerCase().endsWith(".pdf")) {
        const doc = await openPdf(await file.arrayBuffer());
        try {
          const page = await doc.getPage(1);
          const canvas = await renderPageToCanvas(page, 0.15);
          if (!cancelled) setInfo({ pages: doc.numPages, image: canvas.toDataURL() });
        } finally { await doc.loadingTask.destroy(); }
      }
    }
    void inspect().catch(() => { /* Processing reports corrupt PDFs with recovery actions. */ });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [file]);
  return <><span className="grid h-14 w-10 shrink-0 place-items-center overflow-hidden rounded border bg-white text-primary">{info.image ? <span role="img" aria-label={tr ? "Dosya önizlemesi" : "File preview"} className="size-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${info.image})` }} /> : <FileText className="size-5" />}</span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{file.name}</p><p className="text-sm text-muted-foreground">{formatBytes(file.size)}{info.pages ? ` · ${info.pages} ${tr ? "sayfa" : "pages"}` : ""}</p></div></>;
}

export function FileList({ files, onChange, disabled }: { files: File[]; onChange: (files: File[]) => void; disabled: boolean }) {
  const tr = useDisplayLanguage() === "TR";
  function move(from: number, to: number) {
    if (disabled || from < 0 || from >= files.length || to < 0 || to >= files.length) return;
    const next = [...files];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  }
  return <ul className="space-y-2" aria-label={tr ? "Seçilen dosyalar" : "Selected files"}>{files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} draggable={!disabled && files.length > 1} onDragStart={event => event.dataTransfer.setData("text/plain", String(index))} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const raw = event.dataTransfer.getData("text/plain"); if (/^\d+$/.test(raw)) move(Number(raw), index); }} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border bg-card p-3 text-sm">
    <FileInfo file={file} />
    <div className="flex gap-1">{files.length > 1 && <><Button size="icon" variant="ghost" disabled={disabled || index === 0} onClick={() => move(index, index - 1)} aria-label={`${file.name}: ${tr ? "Yukarı taşı" : "Move up"}`}><ArrowUp /></Button><Button size="icon" variant="ghost" disabled={disabled || index === files.length - 1} onClick={() => move(index, index + 1)} aria-label={`${file.name}: ${tr ? "Aşağı taşı" : "Move down"}`}><ArrowDown /></Button></>}<Button size="icon" variant="ghost" disabled={disabled} onClick={() => onChange(files.filter((_, i) => i !== index))} aria-label={`${file.name}: ${tr ? "Kaldır" : "Remove"}`}><X /></Button></div>
  </li>)}</ul>;
}
