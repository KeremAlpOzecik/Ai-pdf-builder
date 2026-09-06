"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLabels } from "@/components/providers";
import { useCvStore } from "@/store/cv-store";

const TOTAL_STEPS = 5;

export function AiProgress() {
  const labels = useLabels();
  const aiJob = useCvStore((s) => s.aiJob);
  const aiStep = useCvStore((s) => s.aiStep);
  const setAiStep = useCvStore((s) => s.setAiStep);
  const active = aiJob !== null;
  const step = active ? Math.min(Math.max(aiStep, 1), TOTAL_STEPS) : 0;
  const percent = active ? (step / TOTAL_STEPS) * 100 : 0;

  useEffect(() => {
    if (!aiJob) return;
    const id = window.setInterval(() => {
      setAiStep(Math.min(useCvStore.getState().aiStep + 1, TOTAL_STEPS));
    }, 2800);
    return () => window.clearInterval(id);
  }, [aiJob, setAiStep]);

  const stepCopy = [
    labels.aiStep1,
    labels.aiStep2,
    labels.aiStep3,
    labels.aiStep4,
    labels.aiStep5,
  ];
  const title =
    aiJob === "translate" ? labels.translating : labels.aiProgressTitle;
  const stepLabel = labels.aiStepOf
    .replace("{step}", String(step || 1))
    .replace("{total}", String(TOTAL_STEPS));

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div className="flex items-start gap-4">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground ${active ? "" : ""}`}
        >
          <Loader2 className={`size-4 ${active ? "animate-spin" : ""}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {active ? title : labels.aiProgressIdle}
          </p>
          {active ? (
            <p className="mt-1 text-xs text-muted-foreground">{stepLabel}</p>
          ) : null}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {active ? (
              <>
                <span className="font-medium text-foreground/80">
                  {labels.aiCurrentTask}{" "}
                </span>
                {stepCopy[step - 1]}
              </>
            ) : (
              labels.tagline
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
