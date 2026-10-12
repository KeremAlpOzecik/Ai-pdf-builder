"use client";

import { useEffect, useRef, useState, type UIEvent } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { FileDrop } from "./file-drop";
import { Button } from "@/components/ui/button";
import { useDisplayLanguage } from "@/components/providers";
import { comparePdfTexts, extractPdfText, type PdfComparison } from "@/lib/pdf/compare";

export function PdfCompare() {
  const tr = useDisplayLanguage() === "TR";
  const [files, setFiles] = useState<[File | null, File | null]>([null, null]);
  const [result, setResult] = useState<PdfComparison | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const programmatic = useRef<number | null>(null);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; }, []);
  const titles = tr ? ["Eski Belge", "Yeni Belge"] : ["Old document", "New document"];

  function select(index: number, file: File) {
    generation.current++;
    setFiles(previous => index === 0 ? [file, previous[1]] : [previous[0], file]);
    setResult(null);
    setError("");
    setWarning("");
    programmatic.current = null;
  }

  async function compare() {
    if (!files[0] || !files[1] || busy) return;
    const run = ++generation.current;
    setBusy(true);
    setResult(null);
    setError("");
    setWarning("");
    try {
      // Sequential extraction limits peak memory; each PDF worker is destroyed after use.
      const oldPdf = await extractPdfText(files[0]);
      const newPdf = await extractPdfText(files[1]);
      if (run !== generation.current) return;
      const empty = [oldPdf, newPdf].map((pdf, i) => pdf.emptyPages.length ? `${titles[i]}: ${pdf.emptyPages.join(", ")}` : "").filter(Boolean);
      if (empty.length) setWarning(tr
        ? `Metin katmanı bulunmayan sayfalar (${empty.join("; ")}). Bu sayfalar boş veya taranmış olabilir; OCR gerektirebilir ve karşılaştırmaya dahil edilemez.`
        : `Pages without a text layer (${empty.join("; ")}). These pages may be blank or scanned, may require OCR, and cannot be compared.`);
      if (!oldPdf.text.trim() || !newPdf.text.trim()) return;
      const comparison = await comparePdfTexts(oldPdf.text, newPdf.text);
      if (run === generation.current) setResult(comparison);
    } catch (cause) {
      if (run !== generation.current) return;
      setError(cause instanceof Error && cause.message === "PDF_COMPARE_LIMIT"
        ? (tr ? "Belge çok büyük veya fark sayısı işlem sınırını aşıyor. Daha kısa PDF’ler seçin (en fazla 300 sayfa ve 300.000 karakter)." : "Document size or differences exceed the processing limit. Choose shorter PDFs (up to 300 pages and 300,000 characters).")
        : (tr ? "PDF okunamadı. Dosya bozuk veya parola korumalı olabilir. Parolasız, geçerli bir PDF seçin." : "Unable to read PDF. It may be damaged or password protected. Choose a valid, unlocked PDF."));
    } finally {
      if (run === generation.current) setBusy(false);
    }
  }

  function sync(event: UIEvent<HTMLDivElement>, index: number) {
    if (programmatic.current === index) { programmatic.current = null; return; }
    programmatic.current = null;
    const source = event.currentTarget;
    const targetIndex = 1 - index;
    const target = panels.current[targetIndex];
    if (!target) return;
    const extent = source.scrollHeight - source.clientHeight;
    const top = extent > 0 ? source.scrollTop / extent * (target.scrollHeight - target.clientHeight) : 0;
    if (Math.abs(target.scrollTop - top) > 1) {
      programmatic.current = targetIndex;
      target.scrollTop = top;
    }
  }

  return <div className="space-y-6" aria-busy={busy}>
    <div className="grid gap-5 md:grid-cols-2">
      {titles.map((title, index) => <section key={title} aria-label={title}>
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        <FileDrop selectedFiles={files[index] ? [files[index]!] : []} accept=".pdf,application/pdf" disabled={busy} onFiles={selected => select(index, selected[0])}>
          <span className="mt-2 max-w-full break-all text-sm text-muted-foreground">{files[index]?.name ?? (tr ? "PDF dosyanızı buraya bırakın" : "Drop your PDF here")}</span>
        </FileDrop>
      </section>)}
    </div>
    <Button onClick={compare} disabled={busy || !files[0] || !files[1]}>{busy && <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />}{busy ? (tr ? "Karşılaştırılıyor…" : "Comparing…") : (tr ? "Belgeleri karşılaştır" : "Compare documents")}</Button>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
    {warning && <div role="alert" className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">{warning} <Link href="/tools/ocr" className="font-semibold underline">{tr ? "OCR aracını aç" : "Open OCR tool"}</Link></div>}
    {busy && <div role="status" className="space-y-4"><p className="text-sm text-muted-foreground">{tr ? "Metin katmanları çıkarılıyor ve farklar hesaplanıyor…" : "Extracting text layers and calculating differences…"}</p><div className="grid gap-4 md:grid-cols-2">{[0, 1].map(i => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}</div></div>}
    {result && <>
      <div role="status" className="rounded-xl border bg-card p-4">
        <p className="font-semibold">{tr ? `${result.groups} adet değişiklik, ${result.additions} ekleme, ${result.deletions} silme bulundu` : `${result.groups} changes, ${result.additions} additions, ${result.deletions} deletions found`}</p>
        <p className="mt-1 text-sm text-muted-foreground">{tr ? "Değişiklikler bitişik fark blokları, ekleme ve silmeler kelime bazında sayılır. Pembe: silinen/değişen; yeşil: eklenen. Kaydırma senkronizedir." : "Changes count consecutive difference blocks; additions and deletions count words. Pink: removed/changed; green: added. Scrolling is synchronized."}</p>
      </div>
      <p className="text-sm text-muted-foreground">{tr ? "Metin karşılaştırmasıdır; görseller ve biçim değişiklikleri karşılaştırılmaz. Çok sütunlu belgelerde okuma sırası değişebilir." : "Text comparison; images and formatting changes are not compared. Reading order may vary in multi-column documents."}</p>
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {titles.map((title, index) => <section key={title} className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <h2 className="border-b p-4 font-semibold">{title}<span className="mt-1 block truncate text-xs font-normal text-muted-foreground">{files[index]?.name}</span></h2>
          <div ref={node => { panels.current[index] = node; }} onScroll={event => sync(event, index)} tabIndex={0} aria-label={title} className="h-[55vh] overflow-y-auto overscroll-contain p-5 text-sm leading-7 whitespace-pre-wrap break-words md:h-[65vh]">
            {result.changes.map((change, key) => {
              if ((index === 0 && change.added) || (index === 1 && change.removed)) return null;
              return change.added || change.removed
                ? <mark key={key} className={change.removed ? "pdf-diff-removed" : "pdf-diff-added"} aria-label={change.removed ? (tr ? "Silinen" : "Removed") : (tr ? "Eklenen" : "Added")}>{change.value}</mark>
                : <span key={key}>{change.value}</span>;
            })}
          </div>
        </section>)}
      </div>
    </>}
  </div>;
}
