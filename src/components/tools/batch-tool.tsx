"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, LoaderCircle, X } from "lucide-react";
import { FileDrop } from "./file-drop";
import { formatBytes } from "./file-list";
import { PagePicker } from "./page-picker";
import { Button } from "@/components/ui/button";
import { useDisplayLanguage } from "@/components/providers";
import { runBatchQueue, type BatchStatus } from "@/lib/batch-queue";
import { createBatchZip, type BatchOutput } from "@/lib/batch-zip";
import { downloadBlob, stem } from "@/lib/download";
import { compressPdf, pdfToJpegs, type CompressQuality } from "@/lib/pdf/ops";

export type BatchToolSlug = "compress" | "split" | "pdf-to-word" | "word-to-pdf" | "pdf-to-jpg";
type Item = { id: string; file: File; status: BatchStatus; progress: number; outputs: BatchOutput[]; error?: string };
const MAX_BATCH_BYTES = 500 * 1024 * 1024;

export function BatchTool({ slug }: { slug: BatchToolSlug }) {
  const tr = useDisplayLanguage() === "TR";
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [packing, setPacking] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [error, setError] = useState("");
  const [concurrency, setConcurrency] = useState(1);
  const [quality, setQuality] = useState<CompressQuality>("balanced");
  const [mode, setMode] = useState<"range" | "every" | "selected">("range");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [pages, setPages] = useState<number[]>([]);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const dragId = useRef<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  const disabled = busy || packing;
  const outputs = items.flatMap(item => item.outputs);
  const completed = items.filter(item => item.status === "completed").length;
  const failed = items.filter(item => item.status === "error").length;
  const settled = items.length > 0 && items.every(item => item.status === "completed" || item.status === "error");
  const statuses = tr ? { waiting: "Bekliyor", processing: "İşleniyor", completed: "Tamamlandı", error: "Hata" } : { waiting: "Waiting", processing: "Processing", completed: "Completed", error: "Error" };

  function resetResults() {
    setItems(current => current.map(item => ({ ...item, status: "waiting", progress: 0, outputs: [], error: undefined })));
    setError("");
  }
  function add(files: File[]) {
    if (lock.current) return;
    if (items.reduce((size, item) => size + item.file.size, 0) + files.reduce((size, file) => size + file.size, 0) > MAX_BATCH_BYTES) {
      setError(tr ? "Toplam dosya boyutu 500 MB sınırını aşıyor. Bu grubu işleyip yeni bir grup oluşturun." : "Total input size exceeds 500 MB. Process this group before adding a new group.");
      return;
    }
    if (mode === "selected") { setMode("range"); setPages([]); resetResults(); }
    setItems(current => [...current, ...files.map(file => ({ id: crypto.randomUUID(), file, status: "waiting" as const, progress: 0, outputs: [] }))]);
    setError("");
  }
  function move(id: string, target: number) {
    if (lock.current) return;
    setItems(current => {
      const from = current.findIndex(item => item.id === id);
      if (from < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      next.splice(target, 0, next.splice(from, 1)[0]);
      return next;
    });
  }
  async function process(item: Item, report: (percent: number) => void): Promise<BatchOutput[]> {
    const file = item.file;
    if (slug === "compress") {
      const bytes = await compressPdf(file, quality, report);
      return [{ name: `${stem(file.name)}-small.pdf`, blob: new Blob([bytes as BlobPart], { type: "application/pdf" }) }];
    }
    if (slug === "split") {
      const { splitPdfBatch } = await import("@/lib/pdf/batch-split");
      return splitPdfBatch(file, { mode, from, to, pages }, report);
    }
    if (slug === "pdf-to-jpg") return pdfToJpegs(file, 0.9, report);
    const { docxToPdf, pdfToDocx } = await import("@/lib/pdf/word");
    if (slug === "pdf-to-word") return [{ name: `${stem(file.name)}.docx`, blob: await pdfToDocx(file, report) }];
    report(10);
    const bytes = await docxToPdf(file);
    return [{ name: `${stem(file.name)}.pdf`, blob: new Blob([bytes as BlobPart], { type: "application/pdf" }) }];
  }
  async function run() {
    if (lock.current || !items.length) return;
    lock.current = true;
    const abort = new AbortController();
    controller.current = abort;
    // Completed results remain available; retry only failed/new tasks.
    const pending = items.filter(item => item.status !== "completed");
    setBusy(true);
    setError("");
    setItems(current => current.map(item => item.status === "completed" ? item : { ...item, status: "waiting", progress: 0, outputs: [], error: undefined }));
    try {
      await runBatchQueue(pending, process, { concurrency, signal: abort.signal, onUpdate: update => {
        const id = pending[update.index].id;
        setItems(current => current.map(item => item.id !== id ? item : {
          ...item, status: update.status, progress: update.progress ?? item.progress, outputs: update.result ?? [],
          error: update.status === "error" ? (update.error instanceof Error && update.error.message === "INVALID_PAGE_RANGE"
            ? (tr ? "Sayfa seçimi bu belgenin sayfa sayısına uygun değil." : "Page selection is outside this document's page count.")
            : (tr ? "Dosya işlenemedi. Parolayı, dosyayı ve ayarları kontrol edip tekrar deneyin." : "Unable to process file. Check password, file and settings, then retry.")) : undefined,
        }));
      } });
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function zip() {
    if (lock.current || !settled || !outputs.length) return;
    lock.current = true;
    setPacking(true); setZipProgress(0); setError("");
    try {
      const blob = await createBatchZip(outputs, percent => { if (mounted.current) setZipProgress(percent); });
      if (mounted.current) downloadBlob(blob, `ekopdf-${slug}.zip`);
    } catch {
      if (mounted.current) setError(tr ? "ZIP oluşturulamadı. Dosyaları ayrı indirin veya daha küçük bir grup deneyin." : "Unable to create ZIP. Download files individually or try a smaller group.");
    } finally { lock.current = false; if (mounted.current) setPacking(false); }
  }

  return <div className="space-y-5 rounded-2xl border bg-card p-4 sm:p-6" aria-busy={disabled}>
    <FileDrop multiple selectedFiles={items.map(item => item.file)} disabled={disabled} accept={slug === "word-to-pdf" ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : ".pdf,application/pdf"} onFiles={add}>
      <p className="mt-2 text-sm text-muted-foreground">{tr ? "15+ dosyayı birlikte seçin; listeye yeni dosyalar ekleyebilirsiniz." : "Select 15+ files at once; add more files to the list anytime."}</p>
    </FileDrop>
    {items.length > 0 && <>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium">{items.length} {tr ? "dosya" : "files"} · {formatBytes(items.reduce((size, item) => size + item.file.size, 0))}</p><Button variant="ghost" disabled={disabled} onClick={() => { setItems([]); setPages([]); setError(""); }}>{tr ? "Tümünü Temizle" : "Clear all"}</Button></div>
      <ul className="max-h-[32rem] space-y-2 overflow-y-auto" aria-label={tr ? "İşlem kuyruğu" : "Processing queue"}>
        {items.map((item, index) => <li key={item.id} draggable={!disabled} onDragStart={event => { dragId.current = item.id; event.dataTransfer.setData("text/plain", item.id); event.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { dragId.current = null; }} onDragOver={event => { if (dragId.current && !disabled) event.preventDefault(); }} onDrop={event => { event.preventDefault(); if (dragId.current) move(dragId.current, index); dragId.current = null; }} className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-3">
          <FileText aria-hidden="true" className="size-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold" title={item.file.name}>{item.file.name}</p><p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p></div>
          <div className="w-36 text-sm"><span className={item.status === "error" ? "text-destructive" : item.status === "completed" ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>{statuses[item.status]}{item.status === "processing" ? ` (%${item.progress})` : ""}</span>{item.status === "processing" && <progress className="mt-1 h-1 w-full accent-primary" value={item.progress} max={100} aria-label={`${item.file.name}: ${statuses.processing}`} />}</div>
          <div className="flex gap-1"><Button variant="ghost" size="icon" disabled={disabled || index === 0} onClick={() => move(item.id, index - 1)} aria-label={`${item.file.name}: ${tr ? "Yukarı taşı" : "Move up"}`}><ArrowUp /></Button><Button variant="ghost" size="icon" disabled={disabled || index === items.length - 1} onClick={() => move(item.id, index + 1)} aria-label={`${item.file.name}: ${tr ? "Aşağı taşı" : "Move down"}`}><ArrowDown /></Button><Button variant="ghost" size="icon" disabled={disabled} onClick={() => { setItems(current => current.filter(entry => entry.id !== item.id)); setPages([]); }} aria-label={`${item.file.name}: ${tr ? "Kaldır" : "Remove"}`}><X /></Button></div>
          {item.error && <p className="w-full text-sm text-destructive">{item.error}</p>}
          {!!item.outputs.length && <ul className="w-full space-y-1">{item.outputs.map((output, i) => <li key={i} className="flex items-center justify-between gap-3 text-xs"><span className="min-w-0 break-all">{output.name} · {formatBytes(output.blob.size)}</span><Button size="sm" variant="outline" disabled={packing} onClick={() => downloadBlob(output.blob, output.name)}>{tr ? "İndir" : "Download"}</Button></li>)}</ul>}
        </li>)}
      </ul>
    </>}
    <fieldset disabled={disabled} className="space-y-4">
      <label className="grid gap-2 text-sm font-semibold">{tr ? "Aynı anda işlenecek dosya sayısı" : "Concurrent files"}<select className="h-10 rounded-lg border bg-background px-3" value={concurrency} onChange={event => setConcurrency(Number(event.target.value))}>{[1, 2, 3].map(n => <option key={n} value={n}>{n}{n === 1 ? (tr ? " · Önerilen, düşük bellek kullanımı" : " · Recommended, lower memory usage") : ""}</option>)}</select></label>
      {slug === "compress" && <><label className="grid gap-2 text-sm font-semibold">{tr ? "Sıkıştırma kalitesi" : "Compression quality"}<select className="h-10 rounded-lg border bg-background px-3" value={quality} onChange={event => { setQuality(event.target.value as CompressQuality); resetResults(); }}><option value="balanced">{tr ? "Dengeli" : "Balanced"}</option><option value="strong">{tr ? "Daha küçük dosya" : "Smaller file"}</option><option value="keep">{tr ? "Yüksek kalite" : "High quality"}</option></select></label><p className="text-sm text-muted-foreground">{tr ? "Sayfalar görüntüye dönüşür; seçilebilir metin korunmaz. Dosya boyutu artabilir." : "Pages become images; selectable text is not retained. File size may increase."}</p></>}
      {slug === "split" && <>
        <label className="grid gap-2 text-sm font-semibold">{tr ? "Ayırma yöntemi" : "Split method"}<select className="h-10 rounded-lg border bg-background px-3" value={mode} onChange={event => { setMode(event.target.value as typeof mode); resetResults(); }}><option value="range">{tr ? "Her belgeye aynı sayfa aralığı" : "Same page range for every document"}</option><option value="every">{tr ? "Her sayfayı ayrı dosya yap" : "Separate file for every page"}</option>{items.length === 1 && <option value="selected">{tr ? "Sayfaları görsel olarak seç" : "Select pages visually"}</option>}</select></label>
        {mode === "range" && <div className="grid grid-cols-2 gap-3">{(["from", "to"] as const).map(which => <label key={which} className="grid gap-2 text-sm">{which === "from" ? (tr ? "Başlangıç sayfası" : "From page") : (tr ? "Bitiş sayfası" : "To page")}<input type="number" min={1} className="h-10 rounded-lg border bg-background px-3" value={which === "from" ? from : to} onChange={event => { (which === "from" ? setFrom : setTo)(Number(event.target.value)); resetResults(); }} /></label>)}</div>}
        {mode === "selected" && items.length === 1 && <PagePicker key={items[0].id} file={items[0].file} selected={pages} onChange={selected => { setPages(selected); resetResults(); }} />}
      </>}
    </fieldset>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <p role="status" className="text-sm text-muted-foreground">{tr ? `${completed} tamamlandı · ${failed} hata · ${items.length - completed - failed} kalan` : `${completed} completed · ${failed} errors · ${items.length - completed - failed} remaining`}</p>
    <div className="flex flex-wrap gap-3">
      <Button disabled={disabled || !items.length || items.every(item => item.status === "completed") || (slug === "split" && (mode === "selected" ? !pages.length : mode === "range" && (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from)))} onClick={() => void run()}>{busy && <LoaderCircle className="mr-2 size-4 animate-spin" />}{busy ? (tr ? "İşleniyor…" : "Processing…") : failed ? (tr ? "Hatalı ve bekleyen dosyaları işle" : "Process failed and waiting files") : (tr ? "Dosyaları işle" : "Process files")}</Button>
      {settled && outputs.length > 0 && <Button variant="outline" disabled={disabled} onClick={() => void zip()}>{packing ? (tr ? `ZIP hazırlanıyor (%${zipProgress})` : `Preparing ZIP (${zipProgress}%)`) : (tr ? "Tümünü ZIP Olarak İndir" : "Download all as ZIP")}</Button>}
    </div>
    {settled && failed > 0 && <p className="text-sm text-muted-foreground">{tr ? "ZIP yalnızca tamamlanan dosyaları içerir. Hatalı dosyaları yeniden deneyebilirsiniz." : "ZIP includes completed files only. You can retry failed files."}</p>}
  </div>;
}
