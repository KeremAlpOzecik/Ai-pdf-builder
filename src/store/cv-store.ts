"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEmptyCv } from "@/lib/empty-cv";
import type { ChangeStatus, CvChange } from "@/lib/cv-diff";
import type { CVData, TargetLanguage } from "@/types/cv";

type MobileView = "edit" | "preview";
export type Screen = "home" | "editor";
export type FormTab =
  | "import"
  | "personal"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certs"
  | "other";
export type AiJobKind = "parse" | "ats" | "translate";
export type ChangeKind = "ats" | "translate";

export type PendingReview = {
  kind: ChangeKind;
  proposed: CVData;
  changes: CvChange[];
  statuses: Record<string, ChangeStatus>;
};

interface CVStore {
  cv: CVData;
  uiLanguage: TargetLanguage;
  mobileView: MobileView;
  screen: Screen;
  formTab: FormTab;
  sourceFileName: string | null;
  aiJob: AiJobKind | null;
  aiStep: number;
  pendingReview: PendingReview | null;
  setCv: (cv: CVData) => void;
  patchCv: (partial: Partial<CVData>) => void;
  setUiLanguage: (lang: TargetLanguage) => void;
  setMobileView: (view: MobileView) => void;
  setScreen: (screen: Screen) => void;
  setFormTab: (tab: FormTab) => void;
  setSourceFileName: (name: string | null) => void;
  startAiJob: (kind: AiJobKind) => void;
  setAiStep: (step: number) => void;
  stopAiJob: () => void;
  startReview: (kind: ChangeKind, proposed: CVData, changes: CvChange[]) => void;
  acceptChange: (id: string) => void;
  rejectChange: (id: string) => void;
  acceptAllChanges: () => void;
  rejectAllChanges: () => void;
  clearReview: () => void;
  openEditor: (tab?: FormTab) => void;
  reset: () => void;
}

function finishTranslateIfDone(
  kind: ChangeKind,
  proposed: CVData,
  statuses: Record<string, ChangeStatus>,
  setUi: boolean
) {
  if (!setUi || kind !== "translate") return {};
  const remaining = Object.values(statuses).some((s) => s === "pending");
  if (remaining) return {};
  const accepted = Object.values(statuses).some((s) => s === "accepted");
  if (!accepted) return {};
  return { uiLanguage: proposed.targetLanguage as TargetLanguage };
}

export const useCvStore = create<CVStore>()(
  persist(
    (set) => ({
      cv: createEmptyCv("TR"),
      uiLanguage: "TR",
      mobileView: "edit",
      screen: "home",
      formTab: "import",
      sourceFileName: null,
      aiJob: null,
      aiStep: 0,
      pendingReview: null,
      setCv: (cv) => set({ cv }),
      patchCv: (partial) =>
        set((state) => ({ cv: { ...state.cv, ...partial } })),
      setUiLanguage: (uiLanguage) =>
        set((state) => ({
          uiLanguage,
          cv: { ...state.cv, targetLanguage: uiLanguage },
        })),
      setMobileView: (mobileView) => set({ mobileView }),
      setScreen: (screen) => set({ screen }),
      setFormTab: (formTab) => set({ formTab }),
      setSourceFileName: (sourceFileName) => set({ sourceFileName }),
      startAiJob: (aiJob) => set({ aiJob, aiStep: 1 }),
      setAiStep: (aiStep) => set({ aiStep }),
      stopAiJob: () => set({ aiJob: null, aiStep: 0 }),
      startReview: (kind, proposed, changes) =>
        set({
          pendingReview: {
            kind,
            proposed,
            changes,
            statuses: Object.fromEntries(changes.map((c) => [c.id, "pending"])),
          },
        }),
      acceptChange: (id) =>
        set((state) => {
          const review = state.pendingReview;
          if (!review || review.statuses[id] !== "pending") return state;
          const change = review.changes.find((c) => c.id === id);
          if (!change) return state;
          const statuses = { ...review.statuses, [id]: "accepted" as const };
          return {
            cv: change.applyTo(state.cv),
            pendingReview: { ...review, statuses },
            ...finishTranslateIfDone(review.kind, review.proposed, statuses, true),
          };
        }),
      rejectChange: (id) =>
        set((state) => {
          const review = state.pendingReview;
          if (!review || review.statuses[id] !== "pending") return state;
          const statuses = { ...review.statuses, [id]: "rejected" as const };
          return {
            pendingReview: { ...review, statuses },
            ...finishTranslateIfDone(review.kind, review.proposed, statuses, true),
          };
        }),
      acceptAllChanges: () =>
        set((state) => {
          const review = state.pendingReview;
          if (!review) return state;
          let cv = state.cv;
          const statuses = { ...review.statuses };
          for (const change of review.changes) {
            if (statuses[change.id] === "pending") {
              cv = change.applyTo(cv);
              statuses[change.id] = "accepted";
            }
          }
          return {
            cv,
            pendingReview: { ...review, statuses },
            ...finishTranslateIfDone(review.kind, review.proposed, statuses, true),
          };
        }),
      rejectAllChanges: () => set({ pendingReview: null }),
      clearReview: () => set({ pendingReview: null }),
      openEditor: (tab) =>
        set({
          screen: "editor",
          formTab: tab ?? "personal",
          mobileView: "edit",
        }),
      reset: () =>
        set((state) => ({
          cv: createEmptyCv(state.uiLanguage),
          uiLanguage: state.uiLanguage,
          screen: "home",
          formTab: "import",
          sourceFileName: null,
          pendingReview: null,
        })),
    }),
    {
      name: "ai-cv-builder",
      skipHydration: true,
      partialize: (state) => ({
        cv: state.cv,
        uiLanguage: state.uiLanguage,
        screen: state.screen,
        formTab: state.formTab,
        sourceFileName: state.sourceFileName,
      }),
    }
  )
);
