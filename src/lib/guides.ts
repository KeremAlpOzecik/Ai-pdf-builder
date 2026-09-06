export type Guide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  related: Array<{ label: string; href: string }>;
};

export const guides: Guide[] = [
  {
    slug: "ucretsiz-pdf-birlestirme",
    eyebrow: "PDF rehberi",
    title: "Ücretsiz PDF birleştirme nasıl yapılır?",
    description: "Birden fazla PDF dosyasını tek belgede birleştirmek için hızlı ve ücretsiz yöntem.",
    intro: "PDF dosyalarını tek tek göndermek yerine birkaç belgeyi tek PDF’te toplamak, başvuru ve iş süreçlerini kolaylaştırır. AI CV Builder ile dosyalarını tarayıcıda birleştirip sonucu hemen indirebilirsin.",
    sections: [
      { title: "PDF dosyalarını seç", body: "PDF birleştirme aracını aç ve birleştirmek istediğin dosyaları seç. Dosyaları istediğin sırada eklemek, oluşacak belgenin sırasını belirler." },
      { title: "Birleştir ve indir", body: "Dönüştür butonuna bastığında belgeler cihazında işlenir. İşlem bittiğinde tek PDF dosyasını indirip paylaşabilirsin." },
      { title: "Dosyaların güvenliği", body: "Tarayıcıdaki temel PDF araçları dosyaları cihazında işler; dosyalarını bir sunucuya yüklemeden PDF birleştirme akışını kullanabilirsin." },
    ],
    related: [{ label: "PDF birleştirme aracını aç", href: "/tools/merge" }, { label: "PDF sıkıştırma rehberi", href: "/guides/pdf-sikistirma" }],
  },
  {
    slug: "pdf-word-cevirme",
    eyebrow: "Dönüştürme rehberi",
    title: "PDF’i Word’e ücretsiz çevirme",
    description: "PDF metnini düzenlenebilir Word dosyasına aktarmanın pratik yolu.",
    intro: "PDF içindeki metni değiştirmek veya belgeyi yeniden düzenlemek istediğinde PDF’i Word’e çevirmek işini hızlandırır. AI CV Builder, PDF metnini düzenlenebilir bir DOCX dosyasına aktarır.",
    sections: [
      { title: "PDF’i yükle", body: "PDF → Word aracında dosyanı seç. Araç, PDF’teki metni çıkarıp düzenlenebilir belge yapısına aktarır." },
      { title: "Sonucu kontrol et", body: "PDF ve Word farklı sayfa düzenlerine sahip olduğu için karmaşık tasarımlar sadeleşebilir. İndirmeden önce metin, tarih ve iletişim bilgilerini kontrol et." },
      { title: "CV düzenleme için alternatif", body: "CV’ni baştan düzenlemek istiyorsan CV stüdyosuna geçebilir, PDF veya ekran görüntüsünü içe aktarabilir ve canlı önizleme üzerinden güncelleyebilirsin." },
    ],
    related: [{ label: "PDF → Word aracını aç", href: "/tools/pdf-to-word" }, { label: "AI CV stüdyosunu aç", href: "/studio" }],
  },
  {
    slug: "ats-uyumlu-cv-olusturma",
    eyebrow: "CV rehberi",
    title: "ATS uyumlu CV nasıl oluşturulur?",
    description: "İş başvurularında CV’nin ATS sistemleri tarafından daha kolay okunması için temel öneriler.",
    intro: "ATS sistemleri, iş başvurularındaki CV’leri belirli alanlara ve anahtar kelimelere göre tarar. Sade bir düzen, açık bölüm başlıkları ve ölçülü anahtar kelime kullanımı CV’nin okunabilirliğini artırır.",
    sections: [
      { title: "Sade bir düzen kullan", body: "Karmaşık tablolar, çok sayıda kolon ve metni görsel olarak saklayan tasarımlar otomatik taramayı zorlaştırabilir. Tek kolonlu, açık bir CV yapısı tercih et." },
      { title: "Deneyimi sonuçlarla anlat", body: "Sadece görev listesini yazmak yerine ne yaptığını ve mümkünse sonucu kısa maddelerle anlat. Gerçek olmayan ölçü veya başarı ekleme." },
      { title: "CV’ni son kez kontrol et", body: "İletişim bilgilerini, tarihleri, iş unvanlarını ve hedef pozisyonun anahtar kelimelerini kontrol et. AI CV stüdyosu ifadeleri iyileştirmek için öneriler sunabilir; son kararı sen verirsin." },
    ],
    related: [{ label: "AI CV stüdyosunu aç", href: "/studio" }, { label: "CV PDF düzenle", href: "/tools/edit-pdf" }],
  },
  {
    slug: "cv-pdf-duzenleme",
    eyebrow: "CV rehberi",
    title: "CV PDF dosyası nasıl düzenlenir?",
    description: "Mevcut CV PDF’inde yazım hatalarını düzeltme ve güncel bir dosya indirme rehberi.",
    intro: "CV’ni tamamen yeniden yazmak yerine mevcut PDF’teki metinleri düzeltmek çoğu zaman daha hızlıdır. Dijital, seçilebilir metin içeren PDF dosyaları doğrudan düzenlenebilir.",
    sections: [
      { title: "Dijital PDF kullan", body: "Metin katmanı olan PDF’lerde düzenlemek istediğin satıra tıklayabilirsin. Sadece taranmış görüntüden oluşan PDF’lerde tıklanabilir metin bulunmayabilir." },
      { title: "Kişisel bilgileri kontrol et", body: "E-posta, telefon, LinkedIn adresi ve tarihleri güncelledikten sonra önizlemede taşma veya kesilme olup olmadığını kontrol et." },
      { title: "Temiz bir çıktı indir", body: "Düzenlemeler tamamlandığında PDF’i yeni dosya olarak indir. Başvuru göndermeden önce dosyayı tekrar açıp Türkçe karakterleri ve sayfa düzenini kontrol et." },
    ],
    related: [{ label: "PDF düzenleyiciyi aç", href: "/tools/edit-pdf" }, { label: "CV stüdyosunu aç", href: "/studio" }],
  },
  {
    slug: "pdf-sikistirma",
    eyebrow: "PDF rehberi",
    title: "PDF dosya boyutu nasıl küçültülür?",
    description: "E-posta ve başvuru sistemleri için büyük PDF dosyalarını küçültme önerileri.",
    intro: "Bazı kariyer portalları veya e-posta servisleri büyük dosyaları kabul etmez. PDF sıkıştırma, belgeyi daha kolay yüklemene ve paylaşmana yardımcı olur.",
    sections: [
      { title: "Sıkıştırma seviyesini düşün", body: "Görüntü içeren PDF’lerde dosya boyutu küçülürken görsel kalite de azalabilir. Başvuru CV’si için metnin okunabilir kalması en önemli ölçüttür." },
      { title: "Çıktıyı karşılaştır", body: "Sıkıştırılmış PDF’i açıp yazıların, logoların ve imzaların okunabilir olduğunu kontrol et. Gerekirse orijinal dosyayı sakla." },
      { title: "Paylaşmadan önce güvenliği kontrol et", body: "Dosyanın doğru kişisel bilgiler içerdiğinden emin ol ve yalnızca gerekli alıcılarla paylaş." },
    ],
    related: [{ label: "PDF sıkıştırma aracını aç", href: "/tools/compress" }, { label: "PDF birleştirme rehberi", href: "/guides/ucretsiz-pdf-birlestirme" }],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
