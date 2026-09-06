import { Dashboard } from "@/components/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV studio",
  description: "CV oluşturun, düzenleyin ve PDF veya Word olarak indirin.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return <Dashboard />;
}
