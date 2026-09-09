export type CanvasElementBase = {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  name?: string;
  locked?: boolean;
  hidden?: boolean;
  sourceOp?: number;
  sourceBoxId?: string;
  /** Source objects are only selections until their first real mutation. */
  sourcePristine?: boolean;
  groupId?: string;
  flipX?: boolean;
  flipY?: boolean;
  allowOverflow?: boolean;
  isPageBackground?: boolean;
};

export type CanvasTextElement = CanvasElementBase & {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontDataUrl?: string;
  color: string;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  autoFit?: boolean;
  autoHeight?: boolean;
  autoFitMaxSize?: number;
};

export type CanvasImageElement = CanvasElementBase & {
  type: "image";
  dataUrl: string;
  name: string;
  crop?: { x: number; y: number; width: number; height: number };
  filters?: { brightness: number; contrast: number; saturation: number };
};

export type CanvasShapeElement = CanvasElementBase & {
  type: "shape";
  shape: "rectangle" | "ellipse" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  dash?: number[];
};

export type PdfCanvasElement = CanvasTextElement | CanvasImageElement | CanvasShapeElement;

export type EditorSnapshot = {
  edits: Record<string, string>;
  elements: PdfCanvasElement[];
};
