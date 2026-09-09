"use client";

import { useEffect, useRef, useState } from "react";
import { CvPreview } from "@/components/cv-preview";
import { useDisplayLanguage } from "@/components/providers";
import { Button } from "@/components/ui/button";
import type { CVData, ResumeTemplate } from "@/types/cv";

/** Keep the actual document proportions while fitting the available workspace. */
export function ScaledCvPreview({ cv, template, interactive = false }: { cv: CVData; template: ResumeTemplate; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const tr = useDisplayLanguage() === "TR";
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const observer = new ResizeObserver(() => setScale(Math.min(1, host.clientWidth / 794)));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  return <div className="w-full min-w-0">
    {interactive && <div className="mb-3 flex items-center justify-end gap-2 text-sm"><Button size="sm" variant="outline" aria-label={tr ? "Önizlemeyi küçült" : "Zoom preview out"} disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.5))}>−</Button><Button size="sm" variant="ghost" onClick={() => setZoom(1)}>{tr ? "Sığdır" : "Fit"}</Button><Button size="sm" variant="outline" aria-label={tr ? "Önizlemeyi büyüt" : "Zoom preview in"} disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + 0.5))}>+</Button></div>}
    <div ref={ref} className="w-full min-w-0 overflow-auto"><div className="mx-auto w-[794px]" style={{ zoom: scale * zoom }}><CvPreview cv={cv} template={template} /></div></div>
  </div>;
}
