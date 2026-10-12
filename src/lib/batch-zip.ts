export type BatchOutput = { name: string; blob: Blob };

export function uniqueArchiveNames(names: readonly string[]): string[] {
  const used = new Set<string>();
  return names.map(raw => {
    const clean = raw.normalize("NFC").replace(/[\\/<>:"|?*\u0000-\u001f]/g, "_").replace(/^\.+/, "_").trim() || "file";
    const dot = clean.lastIndexOf(".");
    const base = dot > 0 ? clean.slice(0, dot) : clean;
    const extension = dot > 0 ? clean.slice(dot) : "";
    let name = clean;
    let suffix = 2;
    while (used.has(name.toLowerCase())) name = `${base} (${suffix++})${extension}`;
    used.add(name.toLowerCase());
    return name;
  });
}

export async function createBatchZip(outputs: readonly BatchOutput[], report?: (percent: number) => void): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const names = uniqueArchiveNames(outputs.map(output => output.name));
  // Read one Blob at a time; do not start all arrayBuffer conversions together.
  for (let index = 0; index < outputs.length; index++) {
    zip.file(names[index], await outputs[index].blob.arrayBuffer());
  }
  // PDF/JPEG/DOCX are already compressed; STORE avoids redundant CPU-heavy deflate.
  return zip.generateAsync({ type: "blob", compression: "STORE", streamFiles: true }, metadata => report?.(Math.round(metadata.percent)));
}
