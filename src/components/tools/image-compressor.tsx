"use client";

import { useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/tools/file-drop";
import { Button } from "@/components/ui/button";
import { useDisplayLanguage } from "@/components/providers";
import { compressImage, type CompressedImage } from "@/lib/image-compress";
import { downloadBlob, stem } from "@/lib/download";

function Preview({ blob, label }: { blob: Blob; label: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { const value = URL.createObjectURL(blob); if (ref.current) ref.current.src = value; return () => URL.revokeObjectURL(value); }, [blob]);
  // Blob previews must remain local instead of using an image optimizer.
  return <figure className="min-w-0 rounded-xl border p-3">
    <figcaption className="mb-2 text-sm font-medium">{label}</figcaption>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={ref} alt={label} className="h-64 w-full object-contain" />
  </figure>;
}

export function ImageCompressor() {
  const tr = useDisplayLanguage() === "TR";
  const [file, setFile] = useState<File>();
  const [target, setTarget] = useState("200");
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [result, setResult] = useState<CompressedImage>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function clear() { setResult(undefined); setError(""); }
  async function run() {
    if (!file || busy) return;
    clear(); setBusy(true);
    try { setResult(await compressImage(file, Number(target), format)); }
    catch { setError(tr ? "Görsel işlenemedi. Geçerli bir JPEG, PNG veya WebP (25 MB, en fazla 40 megapiksel) ve 10–25000 KB sınırı seç. Daha yüksek bir sınırla yeniden deneyebilirsin." : "Unable to process image. Choose a valid JPEG, PNG or WebP (25 MB, up to 40 megapixels) and a limit from 10–25000 KB. Try a higher limit."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <FileDrop selectedFiles={file ? [file] : []} accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" disabled={busy} onFiles={files => { clear(); setFile(files[0]); }}><span className="mt-2 text-sm text-muted-foreground">{file ? (tr ? "Fotoğraf hazır. Hedef boyutu seçip küçültme işlemini başlatın." : "Photo ready. Choose a target size and start compression.") : (tr ? "JPEG, PNG veya WebP fotoğraf seç" : "Choose a JPEG, PNG or WebP photo")}</span></FileDrop>
    {file && <div className="space-y-3"><div className="grid gap-4 sm:grid-cols-2"><Preview blob={file} label={tr ? "Orijinal" : "Original"} />{result && <Preview blob={result.blob} label={tr ? "Küçültülen" : "Compressed"} />}</div><Button variant="ghost" disabled={busy} onClick={() => { setFile(undefined); clear(); }}>{tr ? "Fotoğrafı kaldır" : "Remove photo"}</Button></div>}
    <div className="flex flex-wrap gap-2">{[100,200,500].map(kb=><Button key={kb} variant={target===String(kb)?"default":"outline"} disabled={busy} aria-pressed={target===String(kb)} onClick={()=>{clear();setTarget(String(kb));}}>{kb} KB</Button>)}</div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm">{tr ? "Hedef üst sınır (KB)" : "Target size limit (KB)"}<input type="number" min="10" max="25000" step="1" value={target} disabled={busy} onChange={e=>{clear();setTarget(e.target.value);}} className="rounded-lg border bg-background px-3 py-2" /></label>
      <label className="grid gap-2 text-sm">{tr ? "Çıktı biçimi" : "Output format"}<select value={format} disabled={busy} onChange={e=>{clear();setFormat(e.target.value as typeof format);}} className="rounded-lg border bg-background px-3 py-2"><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label>
    </div>
    <p className="text-sm leading-6 text-muted-foreground">{tr ? "1 KB = 1000 bayt. Gerekirse kalite ve piksel ölçüleri azaltılır; kalite kaybı olabilir. JPEG çıktısında saydam alanlar beyaz olur. Animasyonlar sabit kareye dönüşür. Dosya sunucuya yüklenmez. Başvuru formunun biçim ve ölçü koşullarını ayrıca kontrol et." : "1 KB = 1000 bytes. Quality and pixel dimensions may be reduced. Transparent areas become white in JPEG; animations become a still frame. Files are not uploaded. Check the application's format and dimension requirements."}</p>
    <Button onClick={()=>void run()} disabled={!file || busy || !Number.isFinite(Number(target)) || Number(target)<10 || Number(target)>25000}>{busy ? (tr ? "Küçültülüyor…" : "Compressing…") : (tr ? "Fotoğrafı küçült" : "Compress photo")}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {result && file && <>
      <div role="status" className="rounded-xl border bg-primary/5 p-4"><p>{tr ? "Sonuç" : "Result"}: {(result.blob.size/1000).toFixed(1)} KB · {result.width} × {result.height} px</p><p className="mt-1 text-sm">{tr ? "Hedef sınırın altında. İndirmeden önce önizlemeyi kontrol et." : "Below the size limit. Review the preview before downloading."}</p>{result.blob.size>=file.size && <p className="mt-2 text-sm">{tr ? "Orijinal dosya zaten küçük; bu çıktı orijinalden daha büyük olabilir." : "The original is already small; this output may be larger than the original."}</p>}</div>
      <Button onClick={()=>downloadBlob(result.blob,`${stem(file.name)}-${target}kb.${format==='image/jpeg'?'jpg':'webp'}`)}>{tr ? "Fotoğrafı indir" : "Download photo"}</Button>
    </>}
  </div>;
}
