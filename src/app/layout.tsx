import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/seo/site-footer";
import { SITE_NAME } from "@/lib/seo";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur | AI CV Builder",
    template: "%s | AI CV Builder",
  },
  description:
    "LinkedIn CV PDF’ini tarayıcıda düzenle, yazım hatasını düzelt, Word ve PDF dönüştür. ATS uyumlu Türkçe özgeçmiş indir. Hesap yok.",
  keywords: [
    "ücretsiz PDF düzenle",
    "linkedin cv pdf düzenle ücretsiz",
    "ATS uyumlu CV Türkçe ücretsiz",
    "cv pdf yazım hatası düzelt",
    "yapay zekâ CV oluşturucu",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  category: "productivity",
  verification: {
    google: "OSus5UTi3QuVh6gDZtcqMmoxSfLKMIOQEkbAus0L59c",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur",
    description: "LinkedIn özgeçmişini tarayıcıda düzelt. Hesap yok, dosya sende kalır.",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ücretsiz PDF düzenle ve ATS uyumlu CV oluştur",
    description: "CV PDF yazım hatasını düzelt, ATS uyumlu özgeçmiş indir.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: "tr-TR",
    description: "Ücretsiz PDF araçları ve yapay zekâ destekli CV oluşturucu.",
  };
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    description: "Tarayıcıda PDF düzenleme ve ATS uyumlu CV oluşturma.",
    featureList: [
      "Ücretsiz PDF düzenleme",
      "LinkedIn CV PDF içe aktarma",
      "ATS uyumlu özgeçmiş",
      "Word-PDF dönüştürme",
    ],
  };

  return (
    <html
      lang="tr"
      className={`${sourceSans.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
          <SiteFooter />
        </Providers>
        <JsonLd data={websiteSchema} />
        <JsonLd data={appSchema} />
        <Analytics />
      </body>
    </html>
  );
}
