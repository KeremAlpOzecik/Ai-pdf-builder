"use client";

import { useRef, type DragEvent, type ReactNode } from "react";
import { MAX_FILE_BYTES } from "@/lib/tools";
import { useLabels } from "@/components/providers";
import { toast } from "sonner";

export function FileDrop({
  accept,
  multiple,
  onFiles,
  children,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labels = useLabels();

  function take(list: FileList | File[]) {
    const files = [...list];
    const valid = files.filter((file) => file.size <= MAX_FILE_BYTES);
    if (valid.length !== files.length) toast.error(labels.fileTooLarge);
    if (valid.length) onFiles(valid);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (event.dataTransfer.files.length) take(event.dataTransfer.files);
  }

  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center transition hover:border-foreground/25 hover:bg-muted/35"
    >
      <p className="text-sm font-medium">
        {multiple ? labels.dropFiles : labels.dropFile}
      </p>
      {children}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) take(event.target.files);
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}
