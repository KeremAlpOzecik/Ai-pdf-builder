import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Source_Sans_3 } from "next/font/google";
import { Providers } from "@/components/providers";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "AI CV Builder | PDF araçları ve CV oluşturucu",
    template: "%s | AI CV Builder",
  },
  description:
    "Tarayıcıda CV oluşturun, PDF düzenleyin, Word ve PDF dönüştürün, dosyaları birleştirin veya sıkıştırın.",
  keywords: ["CV oluşturucu", "özgeçmiş hazırlama", "PDF düzenleme", "Word PDF dönüştürme", "CV builder"],
  applicationName: "AI CV Builder",
  authors: [{ name: "AI CV Builder" }],
  verification: {
    google: "OSus5UTi3QuVh6gDZtcqMmoxSfLKMIOQEkbAus0L59c",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "AI CV Builder",
    title: "AI CV Builder | PDF araçları ve CV oluşturucu",
    description: "CV'nizi hazırlayın ve PDF dosyalarınızı tarayıcıda kolayca dönüştürün.",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary",
    title: "AI CV Builder | PDF araçları ve CV oluşturucu",
    description: "CV hazırlama ve PDF işlemleri tek bir sade çalışma alanında.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${sourceSans.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
