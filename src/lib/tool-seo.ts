import type { ToolSlug } from "@/lib/tools";
import { englishToolSeo } from "@/lib/tool-seo-en";

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

const batchFaqs = [
  { question: "Birden fazla dosyayı aynı anda işleyebilir miyim?", answer: "Evet. 15 veya daha fazla dosya seçebilir, listeye yeni dosyalar ekleyebilir ve sıralarını değiştirebilirsin. Dosya başına 25 MB, grubun toplamı için 500 MB giriş sınırı vardır. Varsayılan olarak dosyalar sırayla işlenir; aynı anda 1–3 dosya seçilebilir." },
  { question: "Tüm sonuçları tek ZIP olarak indirebilir miyim?", answer: "Evet. İşlemler bittikten sonra Tümünü ZIP Olarak İndir düğmesi tamamlanan çıktıları paketler. Aynı adlı dosyalar numaralandırılır. Hatalı dosyalar ZIP’e dahil edilmez; diğer sonuçları kaybetmeden yeniden deneyebilirsin." },
];

export const toolSeo: Record<ToolSlug, ToolSeo> = {
  "compare-pdf": {
    slug: "compare-pdf", title: "PDF belge karşılaştırma | Metin farklarını gör", h1: "PDF belgelerini karşılaştır",
    description: "Eski ve yeni PDF belgesinin metin farklarını yan yana incele. Eklemeler ve silmeler renklerle vurgulanır; işlem tarayıcında yapılır.",
    keywords: ["PDF karşılaştırma", "PDF diff", "belge karşılaştırma"],
    summary: "İki PDF’nin metin katmanını karşılaştır, eklenen ve silinen kelimeleri senkronize kaydırma ile incele. Görsel ve biçim farkları karşılaştırılmaz.",
    steps: [{ title: "İki PDF seç", body: "Eski ve yeni belgeyi ayrı alanlara bırak. Dosya başına en fazla 25 MB desteklenir." }, { title: "Karşılaştır", body: "Metin farkları hesaplanır. Metinsiz sayfalar için OCR uyarısı gösterilir." }, { title: "Farkları incele", body: "Silinen metinler pembe, eklenen metinler yeşil gösterilir. Özet kelime sayılarını belirtir." }],
    faqs: [{ question: "Taranmış PDF karşılaştırılabilir mi?", answer: "Metin katmanı bulunmayan sayfalar doğrudan karşılaştırılamaz. Önce OCR ile metin katmanı oluşturun ve tanıma sonucunu kontrol edin." }, { question: "Karşılaştırma sınırları nelerdir?", answer: "Her PDF için 25 MB, 300 sayfa ve 300.000 çıkarılan karakter sınırı vardır. Çok fazla fark içeren belgeler de işlem sınırına takılabilir." }, { question: "Özetteki değişiklik sayıları ne anlama gelir?", answer: "Değişiklik sayısı bitişik fark bloklarını, ekleme ve silme sayıları kelimeleri sayar. Bir kelimenin değiştirilmesi eski tarafta silme, yeni tarafta ekleme olarak görünür." }, { question: "Dosyalar sunucuya gönderilir mi?", answer: "Hayır. Karşılaştırma tarayıcıda çalışır." }],
    related: [{ label: "PDF karşılaştırma rehberi", href: "/guides/pdf-belge-karsilastirma" }, { label: "PDF OCR", href: "/tools/ocr" }, { label: "PDF düzenle", href: "/tools/edit-pdf" }],
  },
  "compress-image": {
    slug: "compress-image", title: "Fotoğrafı 100, 200 veya 500 KB altına küçült", h1: "Fotoğraf boyutunu hedef KB sınırına küçült",
    description: "JPEG, PNG ve WebP fotoğrafları 100 KB, 200 KB, 500 KB veya özel sınıra küçült. Cihazda işlem, ücretsiz önizleme ve JPEG/WebP indirme.",
    keywords: ["fotoğraf 200 KB küçültme", "fotoğraf 100 KB", "JPG boyut küçültme", "fotoğraf sıkıştırma"],
    summary: "Başvuru formunun dosya boyutu sınırı için görselini seç, üst sınırı belirle ve sonucu kontrol et. Kalite veya piksel ölçüleri azalabilir; kayıpsız dönüşüm ya da başvurunun kabulü garanti edilmez. Belge içeriği sunucuya gönderilmez.",
    steps: [{title:"Görsel seç",body:"25 MB altında JPEG, PNG veya WebP seç. En fazla 40 megapiksel desteklenir."},{title:"Üst sınırı seç",body:"100, 200, 500 KB veya 10–25000 KB arasında özel sınır seç. 1 KB, 1000 bayt olarak hesaplanır."},{title:"Önizle ve indir",body:"JPEG veya WebP çıktısını orijinalle karşılaştır. Dosya boyutunu ve piksel ölçülerini kontrol edip indir."}],
    faqs: [{question:"Fotoğrafı seçtim; yükleme tamamlandı mı?",answer:"Dosya adı, seçildi göstergesi ve orijinal önizleme fotoğrafın hazır olduğunu gösterir. Fotoğrafı küçült düğmesine basınca işlem başlar. Görsel içeriği sunucuya yüklenmez."},{question:"Kalite kaybı olur mu?",answer:"Olabilir. Hedef boyuta ulaşmak için kalite ve gerekirse piksel ölçüleri azaltılır. İndirmeden önce önizlemeyi kontrol et."},{question:"PNG çıktısı var mı?",answer:"Hayır. JPEG veya WebP çıktısı sunulur. JPEG’de saydam alanlar beyaz olur; animasyonlar sabit kareye dönüşür."},{question:"Fotoğrafım yükleniyor mu?",answer:"Görsel içeriği sunucuya yüklenmez; işlem cihazındaki tarayıcıda yapılır. Barındırma ve analitik teknik verileri ayrıca işleyebilir."}],
    related: [{label:"Fotoğraf küçültme rehberi",href:"/guides/fotograf-200-kb-kucultme"},{label:"Görselleri PDF yap",href:"/tools/jpg-pdf"}],
  },
  "edit-pdf": {
    slug: "edit-pdf",
    title: "Ücretsiz PDF düzenleyici | Özgün fontla metin düzenle",
    h1: "PDF metnini, görsellerini ve sayfalarını düzenle",
    description: "Desteklenen PDF metinlerini özgün font ve boyutuyla düzenle. Görsel, imza ve filigran ekle; sayfaları yönet ve PDF indir. İşlemler tarayıcıda yapılır.",
    keywords: ["ücretsiz PDF düzenleyici", "PDF yazı ekleme", "PDF görsel ekleme"],
    summary: "PDF’ni aç, metin düzenleme aracını seç ve değiştirmek istediğin yazıya tıkla. Desteklenen gömülü fontlar ve puntolar korunur; eksik harfler için tam font dosyanı yükleyebilir veya Noto Sans seçebilirsin. Görsel ve imza ekle, sayfaları sırala ve sonucu indir.",
    steps: [
      { title: "PDF’ni aç", body: "PDF veya .ekopdf proje dosyanı seç. Parolalı PDF’lerde açma parolası gerekir. 300 MB ve 500 sayfa üst sınırdır; büyük belgelerde performans cihazına bağlıdır." },
      { title: "Metni ve öğeleri düzenle", body: "Metin düzenleme aracını seçip mevcut yazıya tıkla. Font uyarısı varsa özgün TTF/OTF dosyasını yükle veya Noto Sans seç. Yeni metin, görsel, şekil ve imza da ekleyebilirsin." },
      { title: "PDF’ni indir", body: "PDF indir düğmesine bas. İndirdiğin dosyayı açarak yerleşimi kontrol et." },
    ],
    faqs: [
      { question: "PDF’nin içindeki eski yazıyı doğrudan değiştirir mi?", answer: "Evet, desteklenen dijital metinler içerikten kaldırılıp yeni metin seçilebilir olarak yazılır. Gömülü TrueType/OpenType fontları kullanılabilir; eksik harfler tam font dosyası gerektirebilir. Taranmış veya vektör çizimi olan yazılar doğrudan düzenlenemez. Karmaşık tipografi, bağlantılar ve formlar çıktıda kontrol edilmelidir." },
      { question: "Dosyalarım bir sunucuya yükleniyor mu?", answer: "Hayır. Bu editördeki dosya işlemleri tarayıcında yapılır. Yarım kalan düzenleme aynı tarayıcıda yerel taslak olarak tutulur." },
    ],
    related: [{ label: "PDF birleştir", href: "/tools/merge" }, { label: "PDF’e imza ekle", href: "/tools/sign" }],
  },
  "word-to-pdf": {
    slug: "word-to-pdf",
    title: "Word’ü PDF’e ücretsiz çevir",
    h1: "Word’ü PDF’e çevir",
    description: "Birden fazla DOCX dosyasını tarayıcıda PDF’e dönüştür. Dosya başına durum takibi, toplu ZIP indirme; ücretsiz ve hesapsız Word-PDF çevirici.",
    keywords: ["Word PDF çevirme", "DOCX PDF ücretsiz", "ücretsiz Word dönüştürücü"],
    summary:
      "Bir veya birden fazla DOCX dosyasını PDF’e dönüştür, sonuçları ayrı ayrı veya ZIP olarak indir. Dosyalar tarayıcıda işlenir. Kaynak belgedeki yazı tipleri ve sayfa düzeni sadeleşebilir; orijinal tasarımın birebir korunması garanti edilmez.",
    steps: [
      { title: "DOCX dosyalarını seç", body: "Bir veya birden fazla .docx seç. Eski .doc desteklenmez. Dosya başına en fazla 25 MB, grup toplamında 500 MB giriş kabul edilir." },
      { title: "Dönüştür ve durumları izle", body: "Dosyaları sırala, aynı anda işlenecek dosya sayısını 1–3 arasında seç ve işlemi başlat. Hata veren dosyalar diğerlerini durdurmaz." },
      { title: "Kontrol et ve indir", body: "Sonuçları ayrı ayrı veya ZIP olarak indir. Başvuru öncesinde sayfa kırılmalarını, metni ve Türkçe karakterleri kontrol et." },
    ],
    faqs: [
      ...batchFaqs,
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
    description: "Birden fazla PDF’nin metnini düzenlenebilir DOCX dosyalarına aktar. Tarayıcıda toplu PDF-Word dönüşümü ve ZIP indirme; ücretsiz ve hesapsız.",
    keywords: ["PDF Word çevirme", "PDF to DOCX ücretsiz", "ücretsiz PDF dönüştürücü"],
    summary:
      "Birden fazla PDF’den metin çıkarıp ayrı DOCX dosyaları oluştur. Sonuçları tek tek veya ZIP olarak indir. Çok kolonlu tasarım ve biçim sadeleşebilir; bu araç PDF’nin görünümünü birebir kopyalamaz. Taranmış sayfalar için önce OCR ile metin katmanı oluştur.",
    steps: [
      { title: "PDF dosyalarını seç", body: "Metin katmanı olan bir veya birden fazla PDF seç. Dosya başına 25 MB, grubun toplamı için 500 MB giriş sınırı vardır." },
      { title: "Metinleri dönüştür", body: "Listeyi sırala, aynı anda 1–3 dosya işle ve dosya durumlarını izle. Metinsiz taramaları önce OCR aracından geçir." },
      { title: "DOCX veya ZIP indir", body: "Tamamlanan Word dosyalarını ayrı ayrı veya ZIP olarak indir. Tarih, e-posta ve başlıkların doğru aktarıldığını kontrol et." },
    ],
    faqs: [
      ...batchFaqs,
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
    description: "Birden fazla PDF’yi sayfa aralığına göre böl veya her sayfayı ayrı dosya yap. Tarayıcıda toplu PDF bölme, durum takibi ve ZIP indirme.",
    keywords: ["PDF bölme", "PDF sayfa ayırma", "PDF split ücretsiz"],
    summary:
      "Bir veya birden fazla PDF’ye aynı sayfa aralığını uygula ya da her sayfayı ayrı PDF yap. Tek dosyada görsel sayfa seçimi de kullanılabilir. Aralık her belge için ayrı doğrulanır; kısa bir belge hata verse bile diğer dosyalar işlenir. Sonuçlar ayrı ayrı veya ZIP olarak indirilebilir.",
    steps: [
      { title: "PDF dosyalarını seç", body: "Bir veya birden fazla PDF ekle ve listeyi sırala. Dosya başına en fazla 25 MB, grubun toplamında 500 MB giriş desteklenir." },
      { title: "Ayırma yöntemini belirle", body: "Aynı sayfa aralığını bütün dosyalara uygula veya her sayfayı ayrı dosya yap. Görsel sayfa seçimi yalnızca tek dosyada sunulur." },
      { title: "İşle ve indir", body: "Dosya durumlarını izle. Tamamlanan PDF’leri ayrı ayrı veya tek ZIP olarak indir; hatalı dosyaları yeniden deneyebilirsin." },
    ],
    faqs: [
      ...batchFaqs,
      { question: "Belgelerin sayfa sayıları farklıysa ne olur?", answer: "Seçtiğin aralık her belge için kontrol edilir. Örneğin 2–5 aralığı üç sayfalı bir belgede hata verir; aralık otomatik değiştirilmez ve diğer uygun belgeler işlenmeye devam eder." },
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
    description: "Birden fazla PDF’yi tarayıcıda sıkıştır; kalite seç, dosya durumlarını izle ve sonuçları ZIP indir. Ücretsiz, hesapsız toplu PDF sıkıştırma.",
    keywords: ["PDF sıkıştırma", "PDF boyutu küçültme", "compress PDF ücretsiz"],
    summary:
      "Bir veya birden fazla PDF’yi seç, kaliteyi belirle ve sonuçları tek tek veya ZIP olarak indir. Sıkıştırma sayfaları görüntüye dönüştürür; seçilebilir metin korunmaz. Boyut azalması veya belirli bir MB sınırına ulaşılması garanti edilmez; bazı belgelerin boyutu artabilir. Orijinalini sakla ve çıktının okunabilirliğini kontrol et.",
    steps: [
      { title: "PDF dosyalarını seç", body: "15 veya daha fazla dosya birlikte seçilebilir. Dosya başına en fazla 25 MB, grup toplamında 500 MB giriş sınırı vardır." },
      { title: "Kaliteyi seç ve sıkıştır", body: "Dengeli, daha küçük dosya veya yüksek kalite seç. Düşük bellek kullanımı için varsayılan sırayla işlemeyi kullan; istersen aynı anda 1–3 dosya işle." },
      { title: "Sonuçları kontrol et ve indir", body: "Yazı ve imzaların okunabilirliğini kontrol et. Tamamlanan çıktıları ayrı ayrı veya ZIP olarak indir; orijinal PDF’leri sakla." },
    ],
    faqs: [
      ...batchFaqs,
      { question: "PDF mutlaka küçülür mü; metin katmanı korunur mu?", answer: "Hayır. Sayfalar görüntüye dönüştürüldüğü için seçilebilir metin korunmaz ve dosya boyutu bazen artabilir. Belirli bir dosya boyutu veya başvuru formunun kabulü garanti edilmez." },
      {
        question: "CV PDF’im yüklenmiyor, küçültebilir miyim?",
        answer: "Küçültmeyi deneyebilirsin; sonuç belgeye göre değişir. Boyutu ve okunabilirliği kontrol et. Seçilebilir metin gerekiyorsa kaynak Word’den veya CV stüdyosundan dijital bir PDF oluştur.",
      },
    ],
    related: [{ label: "Toplu işlem rehberi", href: "/guides/toplu-pdf-isleme" }, { label: "Sıkıştırma rehberi", href: "/guides/pdf-sikistirma" }],
  },
  "jpg-pdf": {
    slug: "jpg-pdf",
    title: "JPG’yi PDF’e çevir | PDF sayfasını JPG yap",
    h1: "JPG ↔ PDF dönüştür",
    description: "JPG, PNG veya WebP görsellerini PDF yap; birden fazla PDF’nin sayfalarını JPG’ye çevir ve ZIP indir. Tarayıcıda ücretsiz dönüştürme.",
    keywords: ["JPG PDF çevirme", "görseli PDF yapma", "PDF JPG dönüştürme"],
    summary:
      "Görseller → PDF modunda fotoğrafları tek PDF’te topla. PDF → JPG modunda birden fazla PDF’nin sayfalarını ayrı JPEG dosyalarına dönüştür; sonuçları tek tek veya ZIP olarak indir. JPEG çıktıları görüntüdür; PDF’nin metin katmanını ve etkileşimli formlarını içermez.",
    steps: [
      { title: "Yön seç", body: "Görseller → PDF veya PDF → JPG." },
      { title: "Dosyaları yükle", body: "Fotoğrafları tek PDF için sırala veya PDF → JPG modunda birden fazla PDF seç. PDF → JPG batch grubunda giriş sınırı dosya başına 25 MB, toplam 500 MB’dır." },
      { title: "İşle ve indir", body: "Görsellerden tek PDF indir. PDF → JPG modunda dosya durumlarını izle, tamamlanan görüntüleri ayrı ayrı veya ZIP olarak indir." },
    ],
    faqs: [
      { question: "Birden fazla PDF’yi JPG’ye çevirip ZIP indirebilir miyim?", answer: "Evet. PDF → JPG moduna geç, PDF’leri seç ve işle. Bütün dosyaların işlemi bitince tamamlanan görüntüleri ZIP olarak indirebilirsin. Hatalı dosyalar diğerlerini durdurmaz; aynı adlı çıktılar numaralandırılır." },
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
      "Tarama veya fotoğraf PDF’sine Türkçe ve İngilizce OCR ile metin katmanı ekle. İlk 20 sayfa tarayıcıda işlenir; ücretsiz ve hesapsız.",
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
    description: "PDF’in son sayfasına yazı veya görsel imza ekle. Ücretsiz, hesapsız; bu araç nitelikli elektronik imza oluşturmaz.",
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
    description: "Her sayfaya seçtiğin konumda 1 / N formatında numara bas. Ücretsiz, hesapsız.",
    keywords: ["PDF sayfa numarası ücretsiz", "PDF page numbers", "PDF numaralandır"],
    summary:
      "Başvuru paketi veya çok sayfalı evrakta sayfa kaybını azaltır. Numarayı üstte veya altta; sol, orta ya da sağ konuma yerleştirebilirsin. Kapak sayfasını hariç tutmak için önce kapağı ayır.",
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

export function getToolSeo(slug: string, language: "TR" | "EN" = "TR"): ToolSeo | undefined {
  if (!Object.hasOwn(toolSeo, slug)) return undefined;
  const seo = toolSeo[slug as ToolSlug];
  return language === "EN" ? { ...seo, ...englishToolSeo[seo.slug] } : seo;
}
