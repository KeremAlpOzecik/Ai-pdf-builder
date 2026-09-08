export type CanvasElementBase = {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};

export type CanvasTextElement = CanvasElementBase & {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
};

export type CanvasImageElement = CanvasElementBase & {
  type: "image";
  dataUrl: string;
  name: string;
};

export type CanvasShapeElement = CanvasElementBase & {
  type: "shape";
  shape: "rectangle" | "ellipse" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
};

export type PdfCanvasElement = CanvasTextElement | CanvasImageElement | CanvasShapeElement;

export type EditorSnapshot = {
  edits: Record<string, string>;
  elements: PdfCanvasElement[];
};
