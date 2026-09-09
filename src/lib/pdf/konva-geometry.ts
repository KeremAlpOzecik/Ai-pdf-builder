import type { PdfCanvasElement } from "./canvas-types";

export function konvaFrame(element: PdfCanvasElement, pageWidth: number, pageHeight: number) {
  const width = element.width * pageWidth;
  const height = element.height * pageHeight;
  return {
    x: element.x * pageWidth + width / 2,
    y: element.y * pageHeight + height / 2,
    width,
    height,
    offsetX: width / 2,
    offsetY: height / 2,
    rotation: element.rotation,
    opacity: element.sourcePristine ? 0.001 : element.opacity,
    scaleX: element.flipX ? -1 : 1,
    scaleY: element.flipY ? -1 : 1,
  };
}
