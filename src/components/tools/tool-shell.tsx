"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { useLabels } from "@/components/providers";

export function ToolShell({
  title,
  hint,
  wide,
  children,
}: {
  title: string;
  hint: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const labels = useLabels();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppHeader />
      <div
        className={`mx-auto flex w-full flex-1 flex-col px-6 py-10 ${wide ? "max-w-[1200px]" : "max-w-3xl"}`}
      >
        <Link
          href="/"
          className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          ← {labels.toolsHome}
        </Link>
        <h1 className="font-heading mt-4 text-3xl tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hint}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
