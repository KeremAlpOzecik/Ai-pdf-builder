import type { PdfCanvasElement } from "./canvas-types";

/** Convert display-space bounds to the underlying page before applying its rotation. */
export function elementInPdfCoordinates(
  element: PdfCanvasElement,
  width: number,
  height: number,
  rotation: number,
): PdfCanvasElement {
  const angle = ((rotation % 360) + 360) % 360;
  if (!angle) return element;
  const sideways = angle === 90 || angle === 270;
  const displayWidth = sideways ? height : width,
    displayHeight = sideways ? width : height;
  const boxWidth = element.width * displayWidth,
    boxHeight = element.height * displayHeight;
  const cx = (element.x + element.width / 2) * displayWidth;
  const cy = (1 - element.y - element.height / 2) * displayHeight;
  const [x, y] =
    angle === 90
      ? [width - cy, cx]
      : angle === 180
        ? [width - cx, height - cy]
        : [cy, height - cx];
  return {
    ...element,
    x: (x - boxWidth / 2) / width,
    y: (height - y - boxHeight / 2) / height,
    width: boxWidth / width,
    height: boxHeight / height,
    rotation: element.rotation - angle,
  };
}
