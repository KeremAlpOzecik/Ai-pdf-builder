"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { MAX_FILE_BYTES } from "@/lib/tools";
import { useDisplayLanguage, useLabels } from "@/components/providers";
import { toast } from "sonner";

export function FileDrop({
  accept,
  multiple,
  onFiles,
  children,
  disabled = false,
  selectedFiles,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
  disabled?: boolean;
  selectedFiles?: readonly File[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labels = useLabels();
  const tr = useDisplayLanguage() === "TR";
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [recentFiles, setRecentFiles] = useState<File[]>([]);
  const selected = selectedFiles ?? recentFiles;
  const hasFiles = selected.length > 0;
  const id = useId();

  function take(list: FileList | File[]) {
    if (disabled) return;
    const files = [...list];
    const types = accept.toLowerCase().split(",");
    const invalid = files.some(file => !types.some(type => type.startsWith(".") ? file.name.toLowerCase().endsWith(type) : type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : file.type === type));
    const message = invalid ? (tr ? "Bu dosya türü desteklenmiyor. Aşağıdaki dosya türlerinden birini seçin." : "Unsupported file type. Choose one of the accepted types below.") : files.some(file => file.size > MAX_FILE_BYTES) ? labels.fileTooLarge : files.some(file => file.size === 0) ? (tr ? "Dosya boş. Başka bir dosya seçin." : "This file is empty. Choose another file.") : "";
    setError(message);
    if (message) { toast.error(message); return; }
    if (files.length) {
      const accepted = multiple ? files : files.slice(0, 1);
      setRecentFiles(accepted);
      onFiles(accepted);
    }
  }

  return (
    <div>
    <button
      type="button"
      disabled={disabled}
      data-has-files={hasFiles}
      aria-describedby={error ? `${id} ${id}-error` : id}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); take(event.dataTransfer.files); }}
      className={`flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 px-6 py-10 text-center transition disabled:cursor-wait disabled:opacity-50 ${error ? "border-dashed border-destructive" : dragging ? "border-dashed border-primary bg-primary/10" : hasFiles ? "border-solid border-primary bg-primary/5 hover:bg-primary/10" : "border-dashed border-border bg-card hover:border-primary hover:bg-primary/5"}`}
    >
      {hasFiles ? <CheckCircle2 className="mb-4 size-9 text-primary" aria-hidden="true" /> : <UploadCloud className="mb-4 size-9 text-primary" aria-hidden="true" />}
      <span className="text-base font-semibold">
        {hasFiles ? (tr ? `${selected.length} dosya seçildi` : `${selected.length} file${selected.length === 1 ? "" : "s"} selected`) : multiple ? labels.dropFiles : labels.dropFile}
      </span>
      {hasFiles && <span className="mt-2 max-w-full space-y-1 text-sm">
        {selected.slice(0, 3).map((file, index) => <span key={index} className="block break-all">{file.name} <span className="text-muted-foreground">· {(file.size / 1000).toFixed(1)} KB</span></span>)}
        {selected.length > 3 && <span className="block text-muted-foreground">{tr ? `ve ${selected.length - 3} dosya daha` : `and ${selected.length - 3} more files`}</span>}
      </span>}
      {children}
      <span className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{hasFiles ? (multiple ? (tr ? "Yeni dosyalar ekle" : "Add more files") : (tr ? "Dosyayı değiştir" : "Replace file")) : (tr ? "Dosya seç" : "Choose file")}</span>
    </button>
      <p role="status" aria-live="polite" className="sr-only">{hasFiles ? (tr ? `${selected.length} dosya seçildi: ${selected.map(file => file.name).join(", ")}` : `${selected.length} files selected: ${selected.map(file => file.name).join(", ")}`) : ""}</p>
      <p id={id} className="mt-3 text-center text-sm text-muted-foreground">{accept.split(",").filter(type => type.startsWith(".")).join(" · ")} · {tr ? "Dosya başına en fazla 25 MB" : "Up to 25 MB per file"}</p>
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        aria-label={multiple ? labels.dropFiles : labels.dropFile}
        aria-describedby={id}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.length) take(event.target.files);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
