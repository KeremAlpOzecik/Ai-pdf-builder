"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLabels } from "@/components/providers";
import { useCvStore } from "@/store/cv-store";

export function ChangeSummary() {
  const labels = useLabels();
  const pendingReview = useCvStore((s) => s.pendingReview);
  const acceptChange = useCvStore((s) => s.acceptChange);
  const rejectChange = useCvStore((s) => s.rejectChange);
  const acceptAllChanges = useCvStore((s) => s.acceptAllChanges);
  const rejectAllChanges = useCvStore((s) => s.rejectAllChanges);
  const clearReview = useCvStore((s) => s.clearReview);

  if (!pendingReview) return null;

  const { kind, changes, statuses } = pendingReview;
  const title =
    kind === "ats" ? labels.changeTitleAts : labels.changeTitleTranslate;
  const pendingCount = changes.filter((c) => statuses[c.id] === "pending").length;

  return (
    <div className="mb-5 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {changes.length ? labels.changeSubtitle : labels.changeEmpty}
          </p>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={labels.changeDismiss}
          onClick={() => clearReview()}
        >
          <X />
        </Button>
      </div>
      {changes.length ? (
        <>
          {pendingCount > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => acceptAllChanges()}>
                {labels.changeAcceptAll}
              </Button>
              <Button size="sm" variant="outline" onClick={() => rejectAllChanges()}>
                {labels.changeRejectAll}
              </Button>
            </div>
          ) : null}
          <ul className="mt-3 max-h-96 space-y-3 overflow-y-auto pr-1">
            {changes.map((change) => {
              const status = statuses[change.id];
              return (
                <li
                  key={change.id}
                  className="rounded-lg bg-card p-3 text-xs ring-1 ring-border"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{change.section}</p>
                    {status === "accepted" ? (
                      <span className="text-[10px] font-medium text-emerald-700">
                        {labels.changeAccepted}
                      </span>
                    ) : null}
                    {status === "rejected" ? (
                      <span className="text-[10px] font-medium text-slate-500">
                        {labels.changeRejected}
                      </span>
                    ) : null}
                  </div>
                  <p className="mb-2 text-[11px] text-muted-foreground">
                    {labels.changePrompt}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-red-100 bg-red-50/70 p-2">
                      <p className="mb-1 text-[10px] tracking-wide text-red-700/80 uppercase">
                        {labels.changeBefore}
                      </p>
                      <p className="whitespace-pre-wrap text-slate-600">{change.before}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 p-2">
                      <p className="mb-1 text-[10px] tracking-wide text-emerald-800 uppercase">
                        {labels.changeAfter}
                      </p>
                      <p className="whitespace-pre-wrap text-slate-800">{change.after}</p>
                    </div>
                  </div>
                  {status === "pending" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => acceptChange(change.id)}>
                        <Check data-icon="inline-start" />
                        {labels.changeAccept}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectChange(change.id)}
                      >
                        {labels.changeReject}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
