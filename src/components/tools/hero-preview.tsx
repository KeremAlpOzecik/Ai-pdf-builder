"use client";

import Link from "next/link";
import { useCvStore } from "@/store/cv-store";
import { ScaledCvPreview } from "@/components/scaled-cv-preview";
import { useDisplayLanguage } from "@/components/providers";
import { createEmptyCv } from "@/lib/empty-cv";

export function HeroPreview() {
  const openEditor = useCvStore(s => s.openEditor);
  const lang = useDisplayLanguage();
  const tr = lang === "TR";
  const cv = createEmptyCv(lang);
  cv.personalInfo.fullName = tr ? "Adınız Soyadınız" : "Your Name";
  cv.personalInfo.title = tr ? "Mesleki unvanınız" : "Your professional title";
  cv.personalInfo.summary = tr ? "Deneyiminizi, güçlü yönlerinizi ve kariyer hedefinizi kısa ve anlaşılır bir özetle anlatın." : "Describe your experience, strengths and career goals in a clear, concise summary.";
  cv.workExperience = [{ id: "preview", position: tr ? "Son pozisyonunuz" : "Your latest role", company: tr ? "Şirket adı" : "Company name", location: "", startDate: "", endDate: "", current: false, highlights: [tr ? "Sorumluluklarınızı ve katkılarınızı somut örneklerle paylaşın." : "Share your responsibilities and contributions with concrete examples."] }];
  cv.skills = [{ category: tr ? "Beceriler" : "Skills", items: [tr ? "Uzmanlık alanınız" : "Your expertise", tr ? "Kullandığınız araçlar" : "Your tools"] }];
  return <Link href="/studio" onClick={() => openEditor()} className="hidden min-w-0 rounded-3xl border bg-primary/5 p-6 transition hover:border-primary/40 lg:block"><p className="mb-4 text-sm font-semibold text-primary">{tr ? "Modern şablon · Örnek içerik" : "Modern template · Sample content"}</p><div className="max-h-[390px] overflow-hidden rounded-lg shadow-sm"><ScaledCvPreview cv={cv} template="modern" /></div><p className="mt-4 text-sm font-semibold">{tr ? "Kendi CV’nizi oluşturun →" : "Build your own CV →"}</p></Link>;
}
