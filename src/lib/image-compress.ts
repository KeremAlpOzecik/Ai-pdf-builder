export interface CompressedImage { blob: Blob; width: number; height: number; quality: number; }

// Testable search: only return an actual encoded blob below the limit.
export async function findImageUnderLimit(width: number, height: number, limit: number, encode: (width: number, height: number, quality: number) => Promise<Blob>): Promise<CompressedImage> {
  for (let size = 0; size < 24; size++) {
    const smallest = await encode(width, height, 0.35);
    if (smallest.size <= limit) {
      let best = { blob: smallest, width, height, quality: 0.35 };
      let low = 0.35, high = 0.95;
      for (let step = 0; step < 8; step++) {
        const quality = (low + high) / 2;
        const blob = await encode(width, height, quality);
        if (blob.size <= limit) { best = { blob, width, height, quality }; low = quality; }
        else high = quality;
      }
      return best;
    }
    if (width === 1 && height === 1) break;
    const ratio = Math.min(0.85, Math.max(0.45, Math.sqrt(limit / smallest.size) * 0.9));
    width = Math.max(1, Math.floor(width * ratio));
    height = Math.max(1, Math.floor(height * ratio));
  }
  throw new Error("TARGET_NOT_REACHED");
}

export async function compressImage(file: File, targetKb: number, format: "image/jpeg" | "image/webp"): Promise<CompressedImage> {
  if (!Number.isFinite(targetKb) || targetKb < 10 || targetKb > 25000) throw new Error("INVALID_TARGET");
  if (file.size === 0 || file.size > 25 * 1024 * 1024) throw new Error("INVALID_FILE_SIZE");
  if (!/\.(jpe?g|png|webp)$/iu.test(file.name)) throw new Error("INVALID_IMAGE");
  const url = URL.createObjectURL(file);
  const image = new Image();
  const canvas = document.createElement("canvas");
  try {
    image.src = url;
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error("IMAGE_TOO_LARGE");
    const scale = Math.min(1, 4096 / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    return await findImageUnderLimit(width, height, Math.floor(targetKb * 1000), async (w, h, quality) => {
      canvas.width = w; canvas.height = h;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("CANVAS_UNAVAILABLE");
      // Explicit white background avoids black transparent pixels in JPEG.
      context.fillStyle = "white"; context.fillRect(0, 0, w, h);
      context.drawImage(image, 0, 0, w, h);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("ENCODE_FAILED")), format, quality));
      if (blob.type !== format) throw new Error("FORMAT_UNSUPPORTED");
      return blob;
    });
  } finally { URL.revokeObjectURL(url); canvas.width = canvas.height = 0; }
}
