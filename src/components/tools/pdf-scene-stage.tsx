"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Ellipse, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import Konva from "konva";
import type { PdfCanvasElement } from "@/lib/pdf/canvas-types";
import { ensureEditorFonts } from "@/lib/pdf/editor-fonts";
import { konvaFrame } from "@/lib/pdf/konva-geometry";
import { layoutTextLines } from "@/lib/pdf/text-layout";

type Props = {
  width: number;
  height: number;
  scale: number;
  elements: PdfCanvasElement[];
  selectedIds: string[];
  userGuides: { x: number[]; y: number[] };
  onSelect: (id: string | null, additive?: boolean) => void;
  onSelectMany: (ids: string[]) => void;
  onPatch: (id: string, patch: Partial<PdfCanvasElement>, commit?: boolean) => void;
  onPatchMany: (patches: Array<{ id: string; patch: Partial<PdfCanvasElement> }>) => void;
};

type SelectionBox = { x: number; y: number; width: number; height: number };

function snappedPosition(element: PdfCanvasElement, nodeX: number, nodeY: number, width: number, height: number, peers: PdfCanvasElement[], guides: { x: number[]; y: number[] }) {
  const toleranceX = 8 / width;
  const toleranceY = 8 / height;
  let x = (nodeX - element.width * width / 2) / width;
  let y = (nodeY - element.height * height / 2) / height;
  const snap = (value: number, targets: number[], tolerance: number) => targets.reduce((best, target) => Math.abs(value - target) < Math.abs(value - best) && Math.abs(value - target) <= tolerance ? target : best, value);
  const xTargets = [0, (1 - element.width) / 2, 1 - element.width];
  const yTargets = [0, (1 - element.height) / 2, 1 - element.height];
  for (const guide of guides.x) xTargets.push(guide, guide - element.width / 2, guide - element.width);
  for (const guide of guides.y) yTargets.push(guide, guide - element.height / 2, guide - element.height);
  for (const peer of peers) {
    xTargets.push(peer.x, peer.x + peer.width / 2 - element.width / 2, peer.x + peer.width - element.width);
    yTargets.push(peer.y, peer.y + peer.height / 2 - element.height / 2, peer.y + peer.height - element.height);
  }
  x = snap(x, xTargets, toleranceX);
  y = snap(y, yTargets, toleranceY);
  return element.allowOverflow ? { x, y } : { x: Math.max(0, Math.min(1 - element.width, x)), y: Math.max(0, Math.min(1 - element.height, y)) };
}

function LoadedImage({ element, common }: { element: Extract<PdfCanvasElement, { type: "image" }>; common: Record<string, unknown> }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<Konva.Image>(null);
  useEffect(() => {
    const next = new Image();
    next.onload = () => setImage(next);
    next.src = element.dataUrl;
    return () => { next.onload = null; };
  }, [element.dataUrl]);
  useEffect(() => {
    const node = imageRef.current;
    if (!node || !image || !element.filters) return;
    node.cache();
    node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]);
    node.brightness(element.filters.brightness);
    node.contrast(element.filters.contrast);
    node.saturation(element.filters.saturation);
    node.getLayer()?.batchDraw();
    return () => { node.clearCache(); };
  }, [image, element.filters]);
  const crop = image && element.crop ? { cropX: element.crop.x * image.naturalWidth, cropY: element.crop.y * image.naturalHeight, cropWidth: element.crop.width * image.naturalWidth, cropHeight: element.crop.height * image.naturalHeight } : {};
  return <KonvaImage {...common} {...crop} ref={imageRef} image={image ?? undefined} />;
}

function LoadedText({ element, common, scale }: { element: Extract<PdfCanvasElement, { type: "text" }>; common: Record<string, unknown>; scale: number }) {
  const [, setReady] = useState(0);
  useEffect(() => {
    if (!element.fontDataUrl || typeof FontFace === "undefined") return;
    let active = true;
    const font = new FontFace(element.fontFamily, `url(${element.fontDataUrl})`);
    void font.load().then((loaded) => { if (active) { document.fonts.add(loaded); setReady((value) => value + 1); } });
    return () => { active = false; };
  }, [element.fontDataUrl, element.fontFamily]);
  const fontSize = element.fontSize * scale;
  const width = Number(common.width) || 1;
  const height = Number(common.height) || 1;
  const measure = typeof document === "undefined" ? (value: string) => value.length * fontSize * 0.55 : (() => {
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return (value: string) => value.length * fontSize * 0.55;
    context.font = `${element.italic ? "italic " : ""}${element.bold ? "700 " : "400 "}${fontSize}px '${element.fontFamily}'`;
    return (value: string) => context.measureText(value).width + Math.max(0, value.length - 1) * (element.letterSpacing ?? 0) * scale;
  })();
  const text = layoutTextLines(element.text, width, height, fontSize, element.lineHeight ?? 1.25, measure).map((line) => line.text).join("\n");
  return <Text {...common} text={text} fontFamily={element.fontFamily} fontSize={fontSize} fontStyle={`${element.bold ? "bold" : ""} ${element.italic ? "italic" : ""}`.trim() || "normal"} fill={element.color} align={element.align} lineHeight={element.lineHeight ?? 1.25} letterSpacing={(element.letterSpacing ?? 0) * scale} wrap="none" />;
}

export default function PdfSceneStage({ width, height, scale, elements, selectedIds, userGuides, onSelect, onSelectMany, onPatch, onPatchMany }: Props) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodes = useRef(new Map<string, Konva.Node>());
  const transformCommit = useRef(false);
  const marqueeStart = useRef<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [guides, setGuides] = useState<{ vertical: boolean; horizontal: boolean }>({ vertical: false, horizontal: false });
  const visible = useMemo(() => elements.filter((element) => !element.hidden), [elements]);

  useEffect(() => { void ensureEditorFonts(); }, []);

  useEffect(() => {
    transformerRef.current?.nodes(selectedIds.map((id) => nodes.current.get(id)).filter((node): node is Konva.Node => Boolean(node)));
    transformerRef.current?.getLayer()?.batchDraw();
  }, [selectedIds, visible]);

  function common(element: PdfCanvasElement) {
    const frame = konvaFrame(element, width, height);
    return {
      ...frame,
      id: element.id,
      ref: (node: Konva.Node | null) => { if (node) nodes.current.set(element.id, node); else nodes.current.delete(element.id); },
      draggable: !element.locked,
      listening: true,
      onClick: (event: Konva.KonvaEventObject<MouseEvent>) => { event.cancelBubble = true; onSelect(element.id, event.evt.shiftKey || event.evt.ctrlKey || event.evt.metaKey); },
      onTap: (event: Konva.KonvaEventObject<TouchEvent>) => { event.cancelBubble = true; onSelect(element.id); },
      onDragMove: (event: Konva.KonvaEventObject<DragEvent>) => {
        const node = event.target;
        setGuides({ vertical: Math.abs(node.x() - width / 2) <= 8, horizontal: Math.abs(node.y() - height / 2) <= 8 });
      },
      onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => {
        setGuides({ vertical: false, horizontal: false });
        const node = event.target;
        const position = snappedPosition(element, node.x(), node.y(), width, height, visible.filter((peer) => peer.id !== element.id), userGuides);
        if (element.groupId) {
          const dx = position.x - element.x;
          const dy = position.y - element.y;
          onPatchMany(elements.filter((peer) => peer.groupId === element.groupId && !peer.locked).map((peer) => ({ id: peer.id, patch: { x: peer.allowOverflow ? peer.x + dx : Math.max(0, Math.min(1 - peer.width, peer.x + dx)), y: peer.allowOverflow ? peer.y + dy : Math.max(0, Math.min(1 - peer.height, peer.y + dy)), sourcePristine: false } })));
          return;
        }
        onPatch(element.id, {
          ...position,
          sourcePristine: false,
        }, true);
      },
      onTransformEnd: (event: Konva.KonvaEventObject<Event>) => {
        if (selectedIds.length > 1) {
          if (transformCommit.current) return;
          transformCommit.current = true;
          const patches = selectedIds.flatMap((selectedId) => {
            const selected = elements.find((candidate) => candidate.id === selectedId);
            const selectedNode = nodes.current.get(selectedId);
            if (!selected || !selectedNode || selected.locked) return [];
            const nextWidth = Math.max(0.02, Math.min(1, selected.width * Math.abs(selectedNode.scaleX())));
            const nextHeight = Math.max(0.02, Math.min(1, selected.height * Math.abs(selectedNode.scaleY())));
            const rawX = (selectedNode.x() - nextWidth * width / 2) / width;
            const rawY = (selectedNode.y() - nextHeight * height / 2) / height;
            const patch = { x: selected.allowOverflow ? rawX : Math.max(0, Math.min(1 - nextWidth, rawX)), y: selected.allowOverflow ? rawY : Math.max(0, Math.min(1 - nextHeight, rawY)), width: nextWidth, height: nextHeight, rotation: selectedNode.rotation(), sourcePristine: false };
            selectedNode.scaleX(selected.flipX ? -1 : 1); selectedNode.scaleY(selected.flipY ? -1 : 1);
            return [{ id: selectedId, patch }];
          });
          onPatchMany(patches);
          queueMicrotask(() => { transformCommit.current = false; });
          return;
        }
        const node = event.target;
        const nextWidth = Math.max(0.02, Math.min(1, element.width * Math.abs(node.scaleX())));
        const nextHeight = Math.max(0.02, Math.min(1, element.height * Math.abs(node.scaleY())));
        node.scaleX(element.flipX ? -1 : 1);
        node.scaleY(element.flipY ? -1 : 1);
        onPatch(element.id, {
          x: element.allowOverflow ? (node.x() - nextWidth * width / 2) / width : Math.max(0, Math.min(1 - nextWidth, (node.x() - nextWidth * width / 2) / width)),
          y: element.allowOverflow ? (node.y() - nextHeight * height / 2) / height : Math.max(0, Math.min(1 - nextHeight, (node.y() - nextHeight * height / 2) / height)),
          width: nextWidth,
          height: nextHeight,
          rotation: node.rotation(),
          sourcePristine: false,
        }, true);
      },
    };
  }

  return (
    <Stage width={width} height={height}
      onMouseDown={(event) => {
        if (event.target !== event.target.getStage()) return;
        const point = event.target.getStage()?.getPointerPosition();
        if (!point) return;
        marqueeStart.current = point;
        setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0 });
        onSelect(null);
      }}
      onMouseMove={(event) => {
        const start = marqueeStart.current;
        const point = event.target.getStage()?.getPointerPosition();
        if (!start || !point) return;
        setSelectionBox({ x: Math.min(start.x, point.x), y: Math.min(start.y, point.y), width: Math.abs(point.x - start.x), height: Math.abs(point.y - start.y) });
      }}
      onMouseUp={() => {
        if (selectionBox && selectionBox.width > 3 && selectionBox.height > 3) {
          const ids = visible.filter((element) => {
            const node = nodes.current.get(element.id);
            return node && Konva.Util.haveIntersection(selectionBox, node.getClientRect());
          }).map((element) => element.id);
          onSelectMany(ids);
        }
        marqueeStart.current = null;
        setSelectionBox(null);
      }}
      onTouchStart={(event) => { if (event.target === event.target.getStage()) onSelect(null); }}>
      <Layer>
        {userGuides.x.map((position, index) => <Line key={`user-x-${index}`} points={[position * width, 0, position * width, height]} stroke="#0ea5e9" strokeWidth={1} dash={[6, 4]} listening={false} />)}
        {userGuides.y.map((position, index) => <Line key={`user-y-${index}`} points={[0, position * height, width, position * height]} stroke="#0ea5e9" strokeWidth={1} dash={[6, 4]} listening={false} />)}
        {visible.map((element) => {
          const props = common(element);
          if (element.sourcePristine) return <Rect key={element.id} {...props} fill="transparent" />;
          if (element.type === "text") return <LoadedText key={element.id} element={element} common={props} scale={scale} />;
          if (element.type === "image") return <LoadedImage key={element.id} element={element} common={props} />;
          if (element.shape === "ellipse") return <Ellipse key={element.id} {...props} offsetX={0} offsetY={0} radiusX={element.width * width / 2} radiusY={element.height * height / 2} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth * scale} dash={element.dash} />;
          if (element.shape === "line") return <Line key={element.id} {...props} points={[0, element.height * height / 2, element.width * width, element.height * height / 2]} stroke={element.stroke} strokeWidth={element.strokeWidth * scale} dash={element.dash} />;
          return <Rect key={element.id} {...props} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth * scale} cornerRadius={(element.cornerRadius ?? 0) * scale} dash={element.dash} />;
        })}
      </Layer>
      <Layer>
        {selectionBox ? <Rect {...selectionBox} fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth={1} listening={false} /> : null}
        {guides.vertical ? <Line points={[width / 2, 0, width / 2, height]} stroke="#e11d48" strokeWidth={1} dash={[4, 4]} listening={false} /> : null}
        {guides.horizontal ? <Line points={[0, height / 2, width, height / 2]} stroke="#e11d48" strokeWidth={1} dash={[4, 4]} listening={false} /> : null}
        <Transformer ref={transformerRef} rotateEnabled resizeEnabled flipEnabled={false} keepRatio={false} boundBoxFunc={(oldBox, nextBox) => nextBox.width < 8 || nextBox.height < 8 ? oldBox : nextBox} />
      </Layer>
    </Stage>
  );
}
