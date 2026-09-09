import type { PdfCanvasElement } from "./canvas-types";

type GeometryKeys = "x" | "y" | "width" | "height" | "rotation" | "flipX" | "flipY";
type ScenePayload = PdfCanvasElement extends infer Element ? Element extends PdfCanvasElement ? Omit<Element, GeometryKeys> : never : never;

export type ScenePageV2 = { index: number; width: number; height: number; rotation: number };
export type SceneElementV2 = {
  payload: ScenePayload;
  bounds: { width: number; height: number };
  transform: { centerX: number; centerY: number; rotation: number; scaleX: 1 | -1; scaleY: 1 | -1 };
};

export type SceneDocumentV2 = {
  version: 2;
  coordinateSpace: "pdf-points-top-left";
  pages: ScenePageV2[];
  elements: SceneElementV2[];
};

export function toSceneDocument(elements: PdfCanvasElement[], pages: ScenePageV2[]): SceneDocumentV2 {
  const byIndex = new Map(pages.map((page) => [page.index, page]));
  return {
    version: 2,
    coordinateSpace: "pdf-points-top-left",
    pages,
    elements: elements.map((element) => {
      const page = byIndex.get(element.pageIndex);
      if (!page) throw new Error(`Missing page geometry for page ${element.pageIndex + 1}`);
      const { x, y, width, height, rotation, flipX, flipY, ...payload } = element;
      const pointWidth = width * page.width;
      const pointHeight = height * page.height;
      return {
        payload: payload as ScenePayload,
        bounds: { width: pointWidth, height: pointHeight },
        transform: { centerX: x * page.width + pointWidth / 2, centerY: y * page.height + pointHeight / 2, rotation, scaleX: flipX ? -1 : 1, scaleY: flipY ? -1 : 1 },
      };
    }),
  };
}

export function fromSceneDocument(scene: SceneDocumentV2): PdfCanvasElement[] {
  const byIndex = new Map(scene.pages.map((page) => [page.index, page]));
  return scene.elements.map(({ payload, bounds, transform }) => {
    const page = byIndex.get(payload.pageIndex);
    if (!page) throw new Error(`Missing page geometry for page ${payload.pageIndex + 1}`);
    return {
      ...payload,
      x: (transform.centerX - bounds.width / 2) / page.width,
      y: (transform.centerY - bounds.height / 2) / page.height,
      width: bounds.width / page.width,
      height: bounds.height / page.height,
      rotation: transform.rotation,
      flipX: transform.scaleX === -1 || undefined,
      flipY: transform.scaleY === -1 || undefined,
    } as PdfCanvasElement;
  });
}

export function validateSceneDocument(value: unknown): asserts value is SceneDocumentV2 {
  if (!value || typeof value !== "object") throw new Error("Invalid scene");
  const scene = value as Partial<SceneDocumentV2>;
  if (scene.version !== 2 || scene.coordinateSpace !== "pdf-points-top-left" || !Array.isArray(scene.pages) || !Array.isArray(scene.elements)) throw new Error("Invalid scene");
  for (const page of scene.pages) if (!Number.isInteger(page.index) || page.index < 0 || !Number.isFinite(page.width) || !Number.isFinite(page.height) || page.width <= 0 || page.height <= 0 || !Number.isFinite(page.rotation)) throw new Error("Invalid scene page");
  for (const element of scene.elements) {
    if (!element?.payload || typeof element.payload.id !== "string" || !["text", "image", "shape"].includes(element.payload.type)) throw new Error("Invalid scene element");
    for (const value of [element.bounds?.width, element.bounds?.height, element.transform?.centerX, element.transform?.centerY, element.transform?.rotation]) if (!Number.isFinite(value)) throw new Error("Invalid scene geometry");
    if (element.bounds.width <= 0 || element.bounds.height <= 0 || ![1, -1].includes(element.transform.scaleX) || ![1, -1].includes(element.transform.scaleY)) throw new Error("Invalid scene transform");
  }
}
