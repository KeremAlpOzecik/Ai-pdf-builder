"use client";

import { useState } from "react";
import { useCvStore } from "@/store/cv-store";
import { useDisplayLanguage } from "@/components/providers";
import { parseLocalCvText } from "@/lib/local-cv-parser";
import { Button } from "@/components/ui/button";

export function ImportReview() {
  const text = useCvStore(s => s.importText);
  const setText = useCvStore(s => s.setImportText);
  const setCv = useCvStore(s => s.setCv);
  const language = useCvStore(s => s.cv.targetLanguage);
  const busy = useCvStore(s => s.aiJob !== null);
  const tr = useDisplayLanguage() === "TR";
  const [message, setMessage] = useState("");
  function rebuild() {
    if (!window.confirm(tr ? "Formdaki düzenlemeler çıkarılan metinden yeni taslakla değiştirilsin mi?" : "Replace your form edits with a new draft from this text?")) return;
    setCv(parseLocalCvText(text, language));
    setMessage(tr ? "Taslak yenilendi. Alanları kontrol et." : "Draft rebuilt. Review the fields.");
  }
  return <div className="space-y-4">
    <h2 className="text-lg font-semibold">{tr ? "İçe aktarma kontrolü" : "Import review"}</h2>
    <p className="text-sm leading-6 text-muted-foreground">{tr ? "OCR ve bölüm eşleştirme hata yapabilir. Adını, iletişim bilgilerini, iş/okul sırasını ve tarihleri kaynakla karşılaştır. Eşleşmeyen bilgiler aşağıdaki metinde korunur; formdan elle ekleyebilirsin." : "OCR and section matching may make mistakes. Compare your name, contact details, jobs, schools and dates with the source. Unmatched details remain in the text below and can be added manually."}</p>
    {text ? <>
      <label htmlFor="import-source" className="block text-sm font-medium">{tr ? "Çıkarılan metin" : "Extracted text"}</label>
      <textarea id="import-source" value={text} onChange={e => setText(e.target.value)} disabled={busy} className="min-h-64 w-full rounded-lg border bg-background p-3 text-sm" />
      <p className="text-xs text-muted-foreground">{tr ? "Bölüm başlıklarını düzelt; farklı iş ve okullar arasına boş satır ekle. Metin bu oturumda cihazında tutulur." : "Correct section headings; separate jobs and schools with a blank line. This text stays on your device for this session."}</p>
      <Button onClick={rebuild} disabled={busy || text.trim().length < 30}>{tr ? "Metinden taslağı yeniden doldur" : "Rebuild draft from text"}</Button>
      <p role="status" className="text-sm">{message}</p>
    </> : <p className="text-sm text-muted-foreground">{tr ? "Dosya içe aktardıktan sonra kaynak metin burada görünür. Mevcut CV’ni formdan düzenleyebilirsin." : "Source text appears here after importing a file. You can edit your existing CV in the form."}</p>}
  </div>;
}
