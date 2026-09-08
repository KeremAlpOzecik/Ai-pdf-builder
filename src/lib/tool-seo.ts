import type { ToolSlug } from "@/lib/tools";

export type ToolSeo = {
  slug: ToolSlug;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  summary: string;
  steps: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ label: string; href: string }>;
};

export const toolSeo: Record<ToolSlug, ToolSeo> = {
  "edit-pdf": {
    slug: "edit-pdf",
    title: "Ücretsiz PDF düzenleyici | Yazım hatasını tarayıcıda düzelt",
    h1: "Ücretsiz PDF düzenle: metne tıkla, değiştir, indir",
    description:
      "CV PDF yazım hatasını tarayıcıda düzelt. LinkedIn özgeçmişinde tarihi veya e-postayı değiştir, hesap açmadan yeni PDF indir.",
    keywords: [
      "ücretsiz PDF düzenleyici",
      "CV PDF düzenle",
      "pdf yazım hatası düzelt",
      "linkedin cv pdf düzenle ücretsiz",
    ],
    summary:
      "Dijital PDF’teki satıra tıklayıp metni yerinde değiştirirsin. CV, dilekçe ve kısa formlar için sıfırdan dosya üretmeden düzeltme yapar. Taranmış (yalnızca görüntü) PDF’lerde tıklanacak metin yoktur; o zaman CV stüdyosuna ekran görüntüsü yükle.",
    steps: [
      {
        title: "PDF’i seç",
        body: "Word’den veya LinkedIn’den alınmış, metni seçilebilir dosyayı yükle. Her dosya 25 MB altında olmalı.",
      },
      {
        title: "Satıra tıkla ve düzelt",
        body: "Yazım hatası, tarih, telefon veya unvan satırını değiştir. Uzun metin taşarsa cümleyi kısalt; puntoyu şişirme.",
      },
      {
        title: "Yeni PDF indir",
        body: "Çıktıyı kendi tarayıcında aç, Türkçe karakterleri ve hizayı kontrol et. Başvuru portalına yeni adla yükle.",
      },
    ],
    faqs: [
      {
        question: "CV PDF yazım hatasını ücretsiz düzeltebilir miyim?",
        answer:
          "Evet. Seçilebilir metinli özgeçmişte satıra tıklayıp düzeltir, hesap açmadan indirirsin. Dosya tarayıcıda işlenir.",
      },
      {
        question: "LinkedIn CV PDF’ini de düzenler mi?",
        answer:
          "Evet. LinkedIn’den indirdiğin dijital PDF’de metin genellikle tıklanır. Büyük revizyon için stüdyoya aktarmak daha temizdir.",
      },
    ],
    related: [
      { label: "CV PDF yazım hatası rehberi", href: "/guides/cv-pdf-yazim-hatasi-duzeltme" },
      { label: "LinkedIn CV PDF rehberi", href: "/guides/linkedin-cv-pdf-duzenleme" },
    ],
  },
  "word-to-pdf": {
    slug: "word-to-pdf",
    title: "Word’ü PDF’e ücretsiz çevir",
    h1: "Word’ü PDF’e çevir",
    description: "DOCX dosyasını tarayıcıda yazdırılabilir PDF’e dönüştür. Ücretsiz, hesapsız Word-PDF çevirici.",
    keywords: ["Word PDF çevirme", "DOCX PDF ücretsiz", "ücretsiz Word dönüştürücü"],
    summary:
      "Düzenlediğin özgeçmiş veya dilekçeyi kariyer sitelerinin istediği PDF formatına almak için DOCX yükle, dönüştür, indir. Kaynak dosyadaki yazı tipleri sadeleşebilir; gönderiden önce bir önizleme aç.",
    steps: [
      { title: "DOCX seç", body: ".docx dosyasını bırak veya dosya seç. Eski .doc formatı değil, Word’ün mevcut DOCX çıktısını kullan." },
      { title: "PDF’e dönüştür", body: "İşlem tarayıcıda çalışır. Bittiğinde dosyayı indir." },
      { title: "Başvuru öncesi bak", body: "Sayfa kırılması, logo ve Türkçe karakterleri kontrol et. Büyükse sıkıştırma aracına geç." },
    ],
    faqs: [
      {
        question: "Word CV’yi ücretsiz PDF yapabilir miyim?",
        answer: "Evet. DOCX yükle, PDF indir. Hesap açmazsın; dosya cihazında işlenir.",
      },
    ],
    related: [{ label: "PDF’i Word’e çevir", href: "/tools/pdf-to-word" }],
  },
  "pdf-to-word": {
    slug: "pdf-to-word",
    title: "PDF’i Word’e ücretsiz çevir",
    h1: "PDF’i Word’e çevir",
    description: "PDF metnini düzenlenebilir DOCX dosyasına ücretsiz aktar. CV ve dilekçe metnini Word’de aç.",
    keywords: ["PDF Word çevirme", "PDF to DOCX ücretsiz", "ücretsiz PDF dönüştürücü"],
    summary:
      "Kaynak Word yoksa ve metni başka şablona yapıştıracaksan PDF → Word işine yarar. Çok kolonlu tasarım sadeleşir. Yalnızca bir yazım hatası için PDF düzenleyici daha az bozar.",
    steps: [
      { title: "PDF yükle", body: "Metin katmanı olan dijital PDF kullan. Tarama görüntüsünde metin çıkmayabilir." },
      { title: "DOCX indir", body: "Tarih, e-posta ve başlıkların kayıp kaymadığına bak." },
      { title: "CV ise stüdyoyu dene", body: "Özgeçmişi baştan kurmak için stüdyoda içe aktarmak genelde daha temizdir." },
    ],
    faqs: [
      {
        question: "PDF CV’yi Word’e ücretsiz çevirebilir miyim?",
        answer: "Evet. Metin çıkarılır, DOCX indirilir. Düzen sadeleşebilir; iletişim bilgilerini kontrol et.",
      },
    ],
    related: [
      { label: "PDF-Word rehberi", href: "/guides/pdf-word-cevirme" },
      { label: "CV stüdyosu", href: "/studio" },
    ],
  },
  merge: {
    slug: "merge",
    title: "Ücretsiz PDF birleştir",
    h1: "PDF birleştir",
    description: "Birden fazla PDF’i tek belgede birleştir. CV, transkript ve sertifikayı ücretsiz tek dosya yap.",
    keywords: ["PDF birleştirme", "PDF birleştir ücretsiz", "online PDF merger"],
    summary:
      "Başvuru paketi veya evrak setini tek PDF’te topla. Sıra, ekleme sırandır. İşlem tarayıcıda olur; gizli sayfa eklemediğini indirmeden önce kontrol et.",
    steps: [
      { title: "Dosyaları seç", body: "CV’yi ilk sıraya koy, ekleri sona bırak. Aynı dosyayı iki kez ekleme." },
      { title: "Birleştir", body: "Tek PDF inene kadar bekle, ilk ve son sayfayı açıp bak." },
      { title: "Limit varsa sıkıştır", body: "Portal 2–5 MB diyorsa birleştirilmiş dosyayı sıkıştırma aracına at." },
    ],
    faqs: [
      {
        question: "CV ve belgeleri ücretsiz tek PDF yapabilir miyim?",
        answer: "Evet. Birden fazla PDF seç, birleştir, indir. Hesap gerekmez.",
      },
    ],
    related: [{ label: "Birleştirme rehberi", href: "/guides/ucretsiz-pdf-birlestirme" }],
  },
  split: {
    slug: "split",
    title: "PDF böl | Sayfa aralığını ayır",
    h1: "PDF böl",
    description: "PDF’ten istediğin sayfa aralığını yeni dosya olarak ayır. Ücretsiz, hesapsız PDF split.",
    keywords: ["PDF bölme", "PDF sayfa ayırma", "PDF split ücretsiz"],
    summary:
      "Uzun bir evrak setinden yalnızca CV sayfasını veya transkript aralığını çıkar. Başlangıç ve bitiş sayfasını seç, yeni PDF indir.",
    steps: [
      { title: "PDF yükle", body: "Sayfa sayısı okununca aralığı gir." },
      { title: "Aralığı ayır", body: "1. sayfa CV ise 1–1, ekler 2–5 gibi net tut." },
      { title: "İndir ve adlandır", body: "Dosya adını `transkript.pdf` gibi içeriğe göre koy." },
    ],
    faqs: [
      {
        question: "PDF’ten tek sayfa ücretsiz çıkarabilir miyim?",
        answer: "Evet. Sayfa aralığını seç, yeni PDF indir.",
      },
    ],
    related: [{ label: "PDF birleştir", href: "/tools/merge" }],
  },
  compress: {
    slug: "compress",
    title: "PDF sıkıştır | Dosya boyutunu küçült",
    h1: "PDF sıkıştır",
    description: "Büyük PDF’i kariyer sitesi limitinin altına küçült. Ücretsiz PDF sıkıştırma, tarayıcıda çalışır.",
    keywords: ["PDF sıkıştırma", "PDF boyutu küçültme", "compress PDF ücretsiz"],
    summary:
      "Tarama görüntüleri ve yüksek çözünürlüklü logolar dosyayı şişirir. Sıkıştırma sayfaları daha düşük görüntü kalitesiyle yeniden çizer. CV’de isim ve telefonun hâlâ okunduğunu kontrol et.",
    steps: [
      { title: "Büyük PDF’i yükle", body: "25 MB altındaki dosyalar kabul edilir." },
      { title: "Sıkıştır", body: "Çıktıyı aç, yazı ve imza leke mi bak." },
      { title: "Orijinali sakla", body: "Portal için küçük kopyayı gönder, kaynağı silme." },
    ],
    faqs: [
      {
        question: "CV PDF’im yüklenmiyor, küçültebilir miyim?",
        answer: "Evet. Sıkıştırma boyutu düşürür. Metin okunaklı kalmazsa dijital (taranmamış) CV üret.",
      },
    ],
    related: [{ label: "Sıkıştırma rehberi", href: "/guides/pdf-sikistirma" }],
  },
  "jpg-pdf": {
    slug: "jpg-pdf",
    title: "JPG’yi PDF’e çevir | PDF sayfasını JPG yap",
    h1: "JPG ↔ PDF dönüştür",
    description: "JPG, PNG veya WEBP görsellerini PDF yap; PDF sayfalarını JPG olarak indir. Ücretsiz, hesapsız.",
    keywords: ["JPG PDF çevirme", "görseli PDF yapma", "PDF JPG dönüştürme"],
    summary:
      "Telefonla çekilmiş belgeyi tek PDF’te toplamak veya PDF sayfasını görsel olarak paylaşmak için kullan. Özgeçmişi fotoğraftan başvuru PDF’si yapmak yerine stüdyoda metin katmanlı çıktı almak ATS için daha iyidir.",
    steps: [
      { title: "Yön seç", body: "Görseller → PDF veya PDF → JPG." },
      { title: "Dosyaları yükle", body: "Birden fazla görseli sırayla ekleyebilirsin." },
      { title: "İndir", body: "PDF olacaksa sayfa sırasını yüklemeden önce kontrol et." },
    ],
    faqs: [
      {
        question: "CV fotoğrafını PDF yapmalı mıyım?",
        answer:
          "Acil evrak için evet. İş başvurusu CV’si için metin seçilebilir PDF daha doğru; stüdyo veya Word çıktısı kullan.",
      },
    ],
    related: [{ label: "PDF düzenle", href: "/tools/edit-pdf" }],
  },
  ocr: {
    slug: "ocr",
    title: "Ücretsiz OCR PDF | Taramayı aranabilir yap",
    h1: "Taranmış PDF’i ücretsiz OCR ile aranabilir yap",
    description:
      "Tarama veya fotoğraf PDF’sine metin katmanı ekle. Smallpdf ve iLovePDF’de ücretli olan OCR burada ücretsiz, tarayıcıda çalışır.",
    keywords: ["ücretsiz OCR PDF", "tarama PDF metin", "OCR PDF ücretsiz"],
    summary:
      "Görüntü sayfalarını okuyup görünmez bir metin katmanı ekler. Belge görünümü aynı kalır; kopyala-yapıştır ve arama çalışır. Uzun dosyalarda ilk 20 sayfa işlenir.",
    steps: [
      { title: "Tarama PDF’ini seç", body: "Telefon fotoğrafı veya tarayıcı çıktısı yükle. Her dosya 25 MB altında olmalı." },
      { title: "OCR çalıştır", body: "Sayfalar tarayıcıda okunur. Türkçe ve İngilizce birlikte tanınır." },
      { title: "Aranabilir PDF indir", body: "İndirdiğin dosyada Ctrl+F ile isim veya tarih ara. ATS için mümkünse dijital CV tercih et." },
    ],
    faqs: [
      {
        question: "OCR ücretsiz mi?",
        answer: "Evet. Günlük işlem limiti yok. Dosya cihazında işlenir; hesap açmazsın.",
      },
    ],
    related: [
      { label: "PDF → Word", href: "/tools/pdf-to-word" },
      { label: "PDF düzenle", href: "/tools/edit-pdf" },
    ],
  },
  sign: {
    slug: "sign",
    title: "Ücretsiz PDF imzala",
    h1: "PDF’e ücretsiz imza ekle",
    description: "PDF’in son sayfasına yazı veya görsel imza ekle. E-imza damgası ücretsiz, hesapsız.",
    keywords: ["ücretsiz PDF imzala", "PDF imza ekle", "e-imza PDF ücretsiz"],
    summary:
      "İsim yaz veya şeffaf PNG imza yükle. Damga son sayfanın sağına konur. Bu görsel imzadır; nitelikli elektronik imza (e-imza / KEP) yerine geçmez.",
    steps: [
      { title: "PDF seç", body: "İmzalanacak belgeyi yükle." },
      { title: "İsim veya görsel ekle", body: "Adını yaz, istersen imza görseli de seç." },
      { title: "İndir", body: "Son sayfayı açıp damganın okunduğunu kontrol et." },
    ],
    faqs: [
      {
        question: "Bu yasal e-imza mı?",
        answer:
          "Hayır. Görsel damgadır. Resmi e-imza için nitelikli sertifika gerekir. Teklif, tutanak veya iç evrak için pratik bir damga olarak kullanılır.",
      },
    ],
    related: [{ label: "Filigran", href: "/tools/watermark" }],
  },
  watermark: {
    slug: "watermark",
    title: "Ücretsiz PDF filigran",
    h1: "PDF’e ücretsiz filigran ekle",
    description: "Her sayfaya TASLAK veya isim damgası bas. Ücretsiz PDF watermark, tarayıcıda.",
    keywords: ["PDF filigran ücretsiz", "PDF watermark", "taslak damgası PDF"],
    summary:
      "Metin çapraz ve yarı saydam basılır. CV taslağı, sözleşme kopyası veya ‘gizli’ işareti için kullan. Orijinal dosyayı sakla.",
    steps: [
      { title: "PDF yükle", body: "Damgalanacak dosyayı seç." },
      { title: "Metni yaz", body: "TASLAK, GİZLİ veya adın gibi kısa tut." },
      { title: "İndir", body: "Birkaç sayfayı açıp okunabilirliği kontrol et." },
    ],
    faqs: [
      {
        question: "Filigran ücretsiz mi?",
        answer: "Evet. Limit ve hesap yok. İşlem tarayıcıda olur.",
      },
    ],
    related: [{ label: "Sayfa numarası", href: "/tools/page-numbers" }],
  },
  rotate: {
    slug: "rotate",
    title: "Ücretsiz PDF döndür",
    h1: "PDF sayfalarını ücretsiz döndür",
    description: "Yatay taranmış sayfaları 90, 180 veya 270 derece çevir. Ücretsiz PDF rotate.",
    keywords: ["PDF döndürme ücretsiz", "PDF rotate", "sayfa çevirme PDF"],
    summary:
      "Telefonla çekilmiş evrak ters duruyorsa tüm sayfaları aynı açıyla çevir. Tek sayfa için önce böl, döndür, sonra birleştir.",
    steps: [
      { title: "PDF seç", body: "Yanlış yöndeki dosyayı yükle." },
      { title: "Açıyı seç", body: "90° çoğu yatay taramayı düzeltir." },
      { title: "Yeni PDF indir", body: "İlk sayfayı açıp yönün doğru olduğunu gör." },
    ],
    faqs: [
      {
        question: "Tek sayfayı döndürebilir miyim?",
        answer: "Önce sayfa aralığını ayır, döndür, gerekirse tekrar birleştir.",
      },
    ],
    related: [
      { label: "PDF böl", href: "/tools/split" },
      { label: "PDF birleştir", href: "/tools/merge" },
    ],
  },
  "page-numbers": {
    slug: "page-numbers",
    title: "Ücretsiz PDF sayfa numarası",
    h1: "PDF’e ücretsiz sayfa numarası ekle",
    description: "Her sayfanın altına 1 / N formatında numara bas. Ücretsiz, hesapsız.",
    keywords: ["PDF sayfa numarası ücretsiz", "PDF page numbers", "PDF numaralandır"],
    summary:
      "Başvuru paketi veya çok sayfalı evrakta sayfa kaybını azaltır. Numara alt ortada durur. Kapak sayfasını hariç tutmak için önce kapağı ayır.",
    steps: [
      { title: "PDF yükle", body: "Numaralanacak belgeyi seç." },
      { title: "Numaralandır", body: "İşlem tarayıcıda sayfa sayar ve basar." },
      { title: "İndir", body: "Son sayfadaki toplamın doğru olduğunu kontrol et." },
    ],
    faqs: [
      {
        question: "Sayfa numarası ücretsiz mi?",
        answer: "Evet. Günlük limit yok.",
      },
    ],
    related: [{ label: "PDF birleştir", href: "/tools/merge" }],
  },
};

export function getToolSeo(slug: string): ToolSeo | undefined {
  return toolSeo[slug as ToolSlug];
}
