export type Guide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  related: Array<{ label: string; href: string }>;
  keywords: string[];
};

export const guides: Guide[] = [
  {
    slug: "pdf-belge-karsilastirma", eyebrow: "PDF karşılaştırma rehberi",
    title: "İki PDF belgesi arasındaki metin farkları nasıl bulunur?",
    description: "Eski ve yeni PDF’nin metin farklarını yan yana karşılaştır. Eklenen ve silinen kelimeleri, OCR gereksinimini ve karşılaştırmanın sınırlarını öğren.",
    keywords: ["PDF karşılaştırma", "PDF diff", "iki belge arasındaki fark"],
    intro: "EkoPDF’nin belge karşılaştırma aracı iki PDF’nin metin katmanını cihazında çıkarır ve kelime farklarını gösterir. Sözleşme taslağı, dilekçe veya CV’nin eski ve yeni sürümünü inceleyebilirsin. Görselleri, imzaları, renkleri veya sayfa tasarımını karşılaştırmaz.",
    sections: [
      { title: "Eski ve yeni belgeyi ayrı seç", body: "Eski Belge ve Yeni Belge alanlarına birer PDF bırak. Her dosya en fazla 25 MB olmalı. Metin çıkarma için belge başına 300 sayfa ve 300.000 karakter sınırı vardır; çok fazla fark içeren belgeler işlem sınırına takılabilir." },
      { title: "Renkleri ve özeti doğru oku", body: "Belgeleri karşılaştır düğmesine bas. Eski taraftaki silinen veya değişen metin pembe, yeni taraftaki eklenen metin yeşil gösterilir. Özetin değişiklik sayısı bitişik fark bloklarını; ekleme ve silme sayıları boşlukla ayrılan kelimeleri sayar. Bir kelimenin değiştirilmesi hem silme hem ekleme olarak görünür." },
      { title: "İki metni birlikte kaydır", body: "İki görünümün kaydırması oransal olarak senkronizedir. Görünüm çıkarılan metni gösterir; orijinal PDF sayfasının görsel kopyası değildir. Çok sütunlu belgelerde metin okuma sırası değişebilir; kritik bir farkı kaynak PDF’de de kontrol et." },
      { title: "Taranmış veya metinsiz sayfaları kontrol et", body: "Metin katmanı olmayan sayfalar boş veya taranmış olabilir. Araç bu sayfaları uyarıda listeler; görüntü içeriğini karşılaştıramaz. Önce OCR aracında aranabilir bir kopya oluştur. OCR yalnızca ilk 20 sayfayı işler ve tanıma hataları üretebilir; uzun taramaları önce böl ve çıkan metni kontrol et." },
      { title: "Belgeler cihazında işlenir", body: "PDF metni karşılaştırma için bir sunucuya gönderilmez. Sonuç, insan incelemesini kolaylaştıran bir metin farkıdır; hukuki değerlendirme veya belgenin görsel olarak aynı olduğuna ilişkin doğrulama yerine geçmez." },
    ],
    related: [{ label: "PDF belgelerini karşılaştır", href: "/tools/compare-pdf" }, { label: "Taranmış PDF’ye OCR uygula", href: "/tools/ocr" }, { label: "Uzun PDF’yi böl", href: "/tools/split" }],
  },
  {
    slug: "toplu-pdf-isleme", eyebrow: "Toplu işlem rehberi",
    title: "Birden fazla PDF nasıl işlenir ve sonuçlar ZIP olarak indirilir?",
    description: "15+ dosyayla toplu PDF sıkıştırma, bölme ve dönüştürme. Kuyruk, dosya durumları, hata sonrası tekrar deneme ve ZIP indirme adımlarını öğren.",
    keywords: ["toplu PDF işleme", "batch PDF", "PDF ZIP indirme", "birden fazla PDF sıkıştırma"],
    intro: "EkoPDF’de PDF sıkıştırma, bölme, PDF → Word, Word → PDF ve PDF → JPG araçları ayrı ayrı dosyaları aynı işlem kuyruğunda işler. Dosyalar cihazında kalır. PDF birleştirme farklı bir işlemdir: birden fazla kaynağı tek PDF yapar; batch işlem ise her kaynak için ayrı çıktılar üretir.",
    sections: [
      { title: "Dosyaları ekle ve sırala", body: "15 veya daha fazla dosyayı birlikte seçebilir, sürükleyip bırakabilir ve listeye yeni dosyalar ekleyebilirsin. Dosya başına 25 MB ve grup toplamında 500 MB giriş sınırı vardır. Kartlar dosya adını ve boyutunu gösterir; sürükleme veya ok düğmeleriyle sırayı değiştir. İstenmeyen dosyaları kaldır veya Tümünü Temizle ile listeyi boşalt." },
      { title: "Belleğe uygun işlem sayısı seç", body: "Varsayılan kuyruk dosyaları sırayla işler. Aynı anda işlenecek dosya sayısını 1–3 arasında seçebilirsin. Mobil cihazlarda ve görüntü ağırlıklı belgelerde 1 daha az bellek kullanır. Giriş boyutu sınırı, çıktıların küçük kalacağını garanti etmez; çok sayıda yüksek çözünürlüklü sayfa için daha küçük gruplar kullan." },
      { title: "Her dosyanın durumunu izle", body: "Bekliyor, İşleniyor, Tamamlandı ve Hata durumları dosya kartında görünür. Sayfa bazlı işlemler ilerlemeyi günceller. Word → PDF dönüştürücüsü ayrıntılı ilerleme sunmadığı için başlangıç aşaması ve tamamlanma gösterilir. Bozuk veya parola korumalı bir dosya hata verse bile diğer dosyalar devam eder." },
      { title: "Bölme aralığını her belge için düşün", body: "Bölmede aynı sayfa aralığı bütün PDF’lere uygulanır. Örneğin 2–5 aralığı üç sayfalı bir PDF’de hata verir; araç aralığı sessizce daraltmaz. Her sayfayı ayrı dosya yapmak da mümkündür. Görsel sayfa seçimi yalnızca tek dosya seçildiğinde kullanılabilir." },
      { title: "Tamamlanan sonuçları ZIP indir", body: "Bütün dosyaların işlemi bittiğinde Tümünü ZIP Olarak İndir kullanılabilir. ZIP yalnızca tamamlanan çıktıları içerir; aynı adlı dosyalara numara eklenir. Hatalı dosyaları tamamlanan sonuçları kaybetmeden yeniden dene. İşlem ayarlarını değiştirirsen sonuçlar sıfırlanır ve yeni ayarlarla yeniden işlenir." },
      { title: "Sonuçların sınırlarını kontrol et", body: "PDF sıkıştırma sayfaları görüntüye dönüştürür ve seçilebilir metni kaybettirir; boyut bazen artabilir. PDF → Word çıkarılan metni aktarır, orijinal tasarımı birebir korumaz. Word → PDF’de biçim sadeleşebilir. PDF → JPG’nin çıktısı metin katmanı olmayan görüntüdür. Orijinalleri sakla ve göndermeden önce çıktıları açarak kontrol et." },
    ],
    related: [{ label: "Toplu PDF sıkıştır", href: "/tools/compress" }, { label: "Toplu PDF böl", href: "/tools/split" }, { label: "PDF’leri Word’e çevir", href: "/tools/pdf-to-word" }, { label: "Word dosyalarını PDF yap", href: "/tools/word-to-pdf" }, { label: "PDF’leri JPG yap", href: "/tools/jpg-pdf" }],
  },
  {
    slug: "fotograf-200-kb-kucultme", eyebrow: "Fotoğraf rehberi",
    title: "Fotoğrafı 100, 200 veya 500 KB altına nasıl küçültürsün?",
    description: "Başvuru formu için JPEG, PNG ve WebP görsellerini hedef dosya boyutuna cihazında küçült; kaliteyi ve piksel ölçülerini kontrol et.",
    keywords: ["fotoğraf 200 KB küçültme", "JPG 100 KB", "fotoğraf boyut küçültme"],
    intro: "Bir form fotoğrafın fazla büyük olduğunu söylüyorsa önce izin verilen dosya biçimini, boyut sınırını ve piksel ölçülerini oku. EkoPDF dosyayı cihazında JPEG veya WebP’ye dönüştürerek üst boyut sınırına indirmeyi dener. Kalite kaybı olabilir; sınırın altında olmak başvurunun kabulünü garanti etmez.",
    sections: [
      {title:"Fotoğrafı seç ve boyut sınırını belirle",body:"Fotoğraf boyutunu küçült aracında görselini seç. Seçildi göstergesi, dosya adı ve orijinal önizleme fotoğrafın hazır olduğunu gösterir; içerik sunucuya yüklenmez. 100, 200 veya 500 KB düğmelerini kullanabilir, 10–25000 KB arasında özel sınır girebilirsin. Burada 1 KB, 1000 bayttır. İşlemi Fotoğrafı küçült düğmesiyle başlat."},
      {title:"Dosya biçimini kontrol et",body:"Form JPG/JPEG istiyorsa JPEG seç. WebP’yi ancak form destekliyorsa kullan. PNG giriş olarak kabul edilir; PNG çıktısı sunulmaz. Saydam bölgeler JPEG’de beyaz olur ve animasyon sabit kareye dönüşür."},
      {title:"Ölçüleri ve okunabilirliği kontrol et",body:"Araç önce sıkıştırma kalitesini, gerekirse piksel ölçülerini azaltır. Sonuç boyutunu ve önizlemedeki ayrıntıları kontrol et. Formun minimum genişlik/yükseklik koşulunu karşılamıyorsa daha büyük boyut sınırı dene veya uygun başka bir fotoğraf seç."},
      {title:"Yeni dosyayı indir",body:"İndirilen kopyayı başvuru formunda kullan. Orijinalini sakla. Fotoğraf içeriği sunucuya gönderilmez; barındırma ve analitik teknik verileri ayrıca işleyebilir."},
    ],
    related: [{label:"Fotoğraf boyutunu küçült",href:"/tools/compress-image"},{label:"Görselleri PDF yap",href:"/tools/jpg-pdf"}],
  },
  {
    slug: "ucretsiz-pdf-birlestirme",
    eyebrow: "PDF rehberi",
    title: "Ücretsiz PDF birleştirme nasıl yapılır?",
    description:
      "Birden fazla PDF dosyasını tek belgede birleştirmek için tarayıcıda çalışan ücretsiz yöntem. Hesap yok, dosya cihazında kalır.",
    keywords: ["ücretsiz PDF birleştirme", "PDF birleştir", "online PDF merger"],
    intro:
      "İş başvurusunda diploma, sertifika ve CV’yi ayrı ayrı göndermek yerine tek PDF’te toplamak hem senin hem de işverenin işini kolaylaştırır. EkoPDF’deki birleştirme aracı dosyaları tarayıcıda sıralar ve tek belge üretir; dosyaların bir sunucuya yüklenmesi gerekmez.",
    sections: [
      {
        title: "Hangi dosyaları tek PDF yapmak mantıklı?",
        body: "Başvuru paketleri, evrak setleri ve tarama çıktıları en sık birleştirilen dosyalardır. CV + ön yazı + transkript, sözleşme ekleri veya telefonla çekilmiş birkaç sayfalık belge tek dosyada daha az kaybolur. Birleştirmeden önce her dosyanın doğru kişiye ait olduğunu ve gizli sayfa içermediğini kontrol et. Yanlış eklenen bir bordro veya kimlik sayfası, tek PDF halinde daha geniş yayılır.",
      },
      {
        title: "Dosyaları doğru sıraya koy",
        body: "PDF birleştirme aracını aç, dosyaları seç ve oluşacak belgenin sırasını ekleme sırasına göre düşün. Kapak veya CV her zaman en başta durmalı; sertifikalar ve ekler sonda kalabilir. Sıra yanlışsa belgeyi baştan üretmek, sonradan sayfa taşımaktan daha hızlıdır. Aynı dosyayı iki kez eklediysen indirmeden önce listeden çıkar.",
      },
      {
        title: "Birleştir ve sonucu kontrol et",
        body: "Dönüştür dediğinde sayfalar cihazında tek belgede toplanır. İndirdikten sonra dosyayı açıp ilk sayfa, son sayfa ve orta bir sayfayı kontrol et. Türkçe karakterler, imzalar ve yatay sayfalar yerinde mi bak. Kariyer portalına yüklemeden önce dosya boyutunun limitin altında olduğundan emin ol; büyükse sıkıştırma aracına geç.",
      },
      {
        title: "Dosyaların güvenliği",
        body: "Tarayıcıdaki temel PDF araçları seçtiğin dosyayı cihazında işler. Bu, özellikle özgeçmiş, kimlik eki veya maaş belgesi birleştirirken önemli bir farktır. İşin bitince tarayıcı sekmesini kapatabilir, orijinal dosyaları ayrı klasörde saklayabilirsin. Ortak bilgisayarda çalışıyorsan indirilen dosyayı işlemden sonra sil.",
      },
      {
        title: "Birleştirme sonrası sık yapılan hatalar",
        body: "Farklı sayfa boyutlarını (A4 ve Letter) aynı PDF’te bırakmak yazdırmada kenar boşluğu kayması yapar. Şifreli PDF’ler birleşmeyebilir; önce şifreyi kaldırılabilir bir kopya al. Taranmış görüntü sayfaları metin aramasını bozar; mümkünse dijital PDF kullan. Başvuru sistemleri bazen 5–10 MB üstünü reddeder; o zaman önce birleştir, sonra sıkıştır.",
      },
    ],
    related: [
      { label: "PDF birleştirme aracını aç", href: "/tools/merge" },
      { label: "PDF sıkıştırma rehberi", href: "/guides/pdf-sikistirma" },
    ],
  },
  {
    slug: "pdf-word-cevirme",
    eyebrow: "Dönüştürme rehberi",
    title: "PDF’i Word’e ücretsiz çevirme",
    description:
      "PDF metnini düzenlenebilir Word dosyasına aktarmanın ücretsiz yolu. CV ve dilekçe metnini DOCX olarak indir.",
    keywords: ["PDF Word çevirme", "PDF to Word ücretsiz", "PDF DOCX"],
    intro:
      "PDF içindeki cümleyi değiştirmek istediğinde belgeyi Word’e almak çoğu zaman en hızlı yoldur. EkoPDF, PDF’teki metni düzenlenebilir bir DOCX dosyasına aktarır. Karmaşık çok kolonlu tasarımlar sadeleşebilir; asıl kazanç, metni kopyalayıp yeniden yazmak zorunda kalmamandır.",
    sections: [
      {
        title: "Ne zaman PDF’i Word’e çevirmelisin?",
        body: "Tarih, unvan veya tek bir cümle değişecekse ve elinde kaynak DOCX yoksa dönüştürmek işe yarar. Uzun dilekçe, transkript açıklaması veya eski bir CV metnini güncellemek için de kullanılır. Küçük bir görsel düzeltme için PDF düzenleyicide hatalı alanı kapatıp üzerine yeni yazı ekleyebilirsin. Bu işlem eski metni doğrudan değiştirmez; kapatılan sayfa görüntüye dönüşür. Seçilebilir metin ve ATS uyumu gerekiyorsa kaynak DOCX’i düzenle veya CV stüdyosunda yeniden oluştur.",
      },
      {
        title: "PDF’i yükle ve metni çıkar",
        body: "PDF → Word aracında dosyanı seç. Araç, sayfalardaki metni çıkarıp Word belgesine yazar. Seçilebilir metni olan dijital PDF’ler daha iyi sonuç verir. Sadece tarama görüntüsü olan dosyalarda metin katmanı yoktur; o zaman önce stüdyoda ekran görüntüsüyle içe aktarmayı veya düzgün bir dijital kopya istemeyi dene.",
      },
      {
        title: "Sonucu satır satır kontrol et",
        body: "PDF ve Word farklı sayfa motorları kullanır. Başlıklar, tarihler, e-posta ve telefon numarası kaymış olabilir. Tablolar tek kolona inebilir. İndirmeden önce iletişim bilgilerini, şirket adlarını ve Türkçe karakterleri (ş, ğ, ı, İ, ö, ü, ç) kontrol et. CV ise iş ilanındaki unvanla senin başlığın hâlâ uyuşuyor mu bak.",
      },
      {
        title: "CV için daha temiz alternatif",
        body: "Özgeçmişi baştan düzenlemek istiyorsan stüdyoya geç. PDF veya LinkedIn çıktısını içe aktar, alanları canlı önizlemede düzelt ve çıkarılan taslağı kaynak metinle karşılaştır. Bu yol, dönüştürülmüş Word dosyasındaki bozulmuş düzenle uğraşmaktan genellikle daha kısa sürer. Word çıktısını yalnızca metni başka bir şablona yapıştıracağın zaman tercih et.",
      },
      {
        title: "Dönüştürme sonrası başvuru kontrol listesi",
        body: "DOCX’i Word veya Google Docs’ta aç, yazım denetimini çalıştır, tarih formatlarını MM-YYYY veya açık ay-yıl olarak hizala. Gereksiz boş satırları sil. İşverene Word değil PDF isteniyorsa düzeni bitirip Word → PDF aracıyla tekrar PDF al. Göndermeden önce dosya adını `Ad-Soyad-CV.pdf` gibi sade tut.",
      },
    ],
    related: [
      { label: "PDF → Word aracını aç", href: "/tools/pdf-to-word" },
      { label: "CV stüdyosunu aç", href: "/studio" },
    ],
  },
  {
    slug: "ats-uyumlu-cv-olusturma",
    eyebrow: "CV rehberi",
    title: "ATS başvuruları için sade CV nasıl hazırlanır?",
    description:
      "İş başvurularında CV’nin ATS tarafından okunması için sade düzen, doğru başlıklar ve ölçülü anahtar kelime kullanımı.",
    keywords: ["sade CV", "ATS özgeçmiş", "OCR CV içe aktarma"],
    intro:
      "ATS, aday takip sistemlerinin genel adıdır. CV okuma ve değerlendirme yöntemleri sisteme göre değişir. Bu rehber sade düzen ve açık bölüm başlıkları için öneriler sunar; belirli bir ATS’de doğru okunma, yüksek puan veya başvurunun kabulü garanti edilmez. EkoPDF ATS puanı hesaplamaz ve işe alım sistemlerinde uyumluluk sertifikası sunmaz.",
    sections: [
      {
        title: "Sade, tek kolonlu düzen kullan",
        body: "İki kolon, ikon şeritleri, metni görsel olarak saklayan kutular ve tablolar bazı ATS’lerde sırayı bozar. İsim, iletişim, özet, deneyim, eğitim, beceriler sırası yeter. Başlıkları «Deneyim», «Eğitim», «Beceriler» gibi standart tut; «Yolculuğum» gibi süslü isimler eşleşmeyi zorlaştırır. Grafik skill bar’ları yerine yazılı seviye kullan.",
      },
      {
        title: "Deneyimi sonuçlarla yaz",
        body: "«Sorumlu oldum» yerine ne yaptığını ve mümkünse ölçülebilir sonucu yaz. «Destek verdim» yerine «Haftalık 40+ talebi çözdüm» daha nettir. Rakam uydurma. İş ilanındaki araç adlarını gerçekten kullandıysan aynı haliyle ekle: Excel değilse «Excel» yazma, gerçekten Jira kullandıysan «Jira» yaz. Üç-beş güçlü madde, on zayıf maddeden iyidir.",
      },
      {
        title: "Anahtar kelimeyi ilandan al, doldurma",
        body: "İlandaki zorunlu becerileri CV’nde görünür kıl ama cümleyi kelime salatasına çevirme. Aynı cümleyi üç kez tekrarlamak hem ATS hem insan için kötüdür. Türkçe ilanlarda Türkçe başlık, İngilizce ilanlarda İngilizce fiil kullan. İfadeleri formdan kendin düzenle; otomatik öneri veya çeviri sunulmaz.",
      },
      {
        title: "Dosya formatı ve ad",
        body: "Çoğu kariyer sitesi PDF ister. Metin katmanı olan, seçilebilir PDF gönder; taranmış görüntü CV’si aranamaz. Dosya adı `Ali-Yilmaz-Urun-Yoneticisi-CV.pdf` gibi açıklayıcı olsun. 2 sayfayı aşma; 0-5 yıl deneyimde tek sayfa yeter. Başvuru formuna aynı bilgileri tekrar yazarken CV’deki tarihlerle çelişme.",
      },
      {
        title: "Göndermeden önceki son tur",
        body: "Telefon, e-posta, LinkedIn ve şehir satırını yüksek sesle oku. Askeri tarih formatı karışıklığı (05-2021 / 2021-05) bırakma. Fotoğraf çoğu TR ATS ve kurumsal ilan için zorunlu değildir; istenmedikçe ekleme. PDF’i indirip kendi aramanla «Python» veya «satış» diye taramayı dene. Metin seçilemiyorsa ATS de zorlanır.",
      },
    ],
    related: [
      { label: "CV stüdyosunu aç", href: "/studio" },
      { label: "Türkçe ATS CV rehberi", href: "/guides/ats-uyumlu-cv-turkce-ucretsiz" },
    ],
  },
  {
    slug: "cv-pdf-duzenleme",
    eyebrow: "CV rehberi",
    title: "CV PDF dosyası nasıl düzenlenir?",
    description:
      "Mevcut CV PDF’inde yazım hatasını düzeltmek, tarihi güncellemek ve yeni dosya indirmek için tarayıcıda PDF düzenleme.",
    keywords: ["CV PDF düzenle", "PDF yazı değiştir", "özgeçmiş PDF editör"],
    intro:
      "CV’ni sıfırdan yazmak yerine mevcut PDF’teki bir tarihi veya yazım hatasını düzeltmek çoğu zaman yeter. EkoPDF düzenleyicide hatalı alanı kapatıp üzerine doğru metni ekleyebilirsin. Araç mevcut yazıyı doğrudan değiştirmez; işlemler tarayıcıda, hesap açmadan yapılır.",
    sections: [
      {
        title: "Dijital PDF ile taranmış PDF farkı",
        body: "Dijital PDF’lerde seçilebilir metin bulunabilir; taranmış PDF’lerde sayfa bir görüntüdür. EkoPDF her iki türün üzerine yazı ve görsel ekleyebilir. Alan kapatılan sayfa indirilirken görüntüye dönüşür; o sayfanın metin seçimi, bağlantıları ve form alanları korunmaz. ATS için seçilebilir metin gerekiyorsa CV stüdyosunda yeniden oluştur.",
      },
      {
        title: "Yazım hatası ve iletişim satırı",
        body: "En sık düzeltme e-posta, telefon, şehir ve LinkedIn adresidir. Karakter taşmasın diye kısa tut; uzun bir cümleyi aynı puntoyla zorlama. Türkçe karakterleri kaybetmemek için kopyala-yapıştır yerine doğrudan yaz. Değişiklikten sonra o satırın altındaki satıra binip binmediğine bak.",
      },
      {
        title: "Tarih ve unvan güncelleme",
        body: "«Halen» yazman gereken rolde bitiş tarihi kaldıysa ATS seni işsiz gösterebilir. Unvanı ilandaki dile yaklaştırırken gerçeği bozma: stajyersen «müdür» yazma. Şirket adının resmi halini kullan. Tek satırlık değişiklik bittiyse yeni PDF indir; eski dosyanın üzerine kaydetmek yerine `CV-2026-03.pdf` gibi versiyonla.",
      },
      {
        title: "Temiz çıktı al",
        body: "Düzenleme bitince PDF’i yeni dosya olarak indir ve kendi tarayıcında aç. Zoom %100’de taşma, kesik harf ve kaymış çizgi var mı bak. Yazıcıya göndermeden önce kenar boşluklarını kontrol et. Başvuru portalı eski dosyayı önbelleğe aldıysa yeni adla yükle.",
      },
      {
        title: "Düzenlemek yetmeyince stüdyo",
        body: "Birden fazla bölüm değişecekse, dili TR’den EN’e çevireceksen veya ATS için maddeleri yeniden yazacaksan alan kapatma ve yazı ekleme yöntemi yetmez. Stüdyoda içe aktar, canlı önizlemede çalış, PDF veya Word indir. Büyük revizyonlarda kaynak belgeyi düzenlemek veya CV’yi yeniden oluşturmak daha uygundur.",
      },
    ],
    related: [
      { label: "PDF düzenleyiciyi aç", href: "/tools/edit-pdf" },
      { label: "Yazım hatası rehberi", href: "/guides/cv-pdf-yazim-hatasi-duzeltme" },
    ],
  },
  {
    slug: "pdf-sikistirma",
    eyebrow: "PDF rehberi",
    title: "PDF dosya boyutu nasıl küçültülür?",
    description:
      "E-posta ve kariyer portalları için büyük PDF dosyalarını küçültme. CV ve evrak paketini limitin altına indir.",
    keywords: ["PDF sıkıştırma", "PDF boyutu küçült", "compress PDF ücretsiz"],
    intro:
      "Kariyer.net, LinkedIn Easy Apply ve birçok kurumsal form 2–5 MB üstünü reddeder. Tarama görüntüleri ve yüksek çözünürlüklü logolar dosyayı şişirir. PDF sıkıştırma, sayfaları daha düşük görüntü kalitesiyle yeniden çizerek boyutu küçültür; metnin okunabilir kalması CV için en önemli ölçüttür.",
    sections: [
      {
        title: "Neden dosya büyür?",
        body: "Telefon fotoğrafı, 300 dpi tarama, tam sayfa arka plan görseli ve birleştirilmiş çoklu ekler boyutu katlar. Saf metin CV’si genellikle birkaç yüz kilobayttır. 15 MB’lık bir «CV» çoğu zaman taranmış sayfa demektir. Mümkünse kaynağı Word veya stüdyo çıktısı olan dijital PDF kullan; sıkıştırma o zaman daha az kalite kaybettirir.",
      },
      {
        title: "Sıkıştır, sonra okunabilirliği ölç",
        body: "Sıkıştırma aracına dosyayı yükle, işlemi çalıştır ve çıkan PDF’i aç. İsim, telefon ve şirket logosu hâlâ net mi? İmza leke olduysa kalite fazla düşmüş demektir; orijinali sakla ve yalnızca portal zorunlu kılıyorsa sıkıştırılmış kopyayı gönder. Metin seçilebiliyorsa ATS için hâlâ iyidir.",
      },
      {
        title: "Birleştir + sıkıştır sırası",
        body: "Birden fazla evrakı tek dosya yapacaksan önce birleştir, sonra sıkıştır. Tersi, her dosyayı ayrı küçültüp tekrar birleştirmekten daha az sürpriz çıkarır. Toplam hâlâ büyükse gereksiz yüksek çözünürlüklü kapak sayfasını çıkar. CV ile 20 sayfalık portfolyoyu aynı PDF’te göndermek çoğu ilanda istenmez; link ver.",
      },
      {
        title: "E-posta ve form limitleri",
        body: "Gmail ekleri pratikte onlarca MB alsa da insan kaynakları formları daha katıdır. Yükleme hata veriyorsa dosya adında Türkçe karakter veya boşluk da sorun olabilir; `cv-ali-yilmaz.pdf` dene. Sıkıştırılmış kopyayı «final» sanıp orijinali silme. İleride şirket başka format isteyebilir.",
      },
      {
        title: "Güvenlik notu",
        body: "Sıkıştırma tarayıcıda çalışır; yine de çıktıyı paylaşmadan önce yanlış kişiye ait sayfa kalmadığını kontrol et. Gizli ekleri CV ile aynı pakette unutmak, boyuttan bağımsız bir risktir. Ortak cihazda indirilen dosyayı işlem sonrası sil.",
      },
    ],
    related: [
      { label: "PDF sıkıştırma aracını aç", href: "/tools/compress" },
      { label: "PDF birleştirme rehberi", href: "/guides/ucretsiz-pdf-birlestirme" },
    ],
  },
  {
    slug: "linkedin-cv-pdf-duzenleme",
    eyebrow: "LinkedIn ve CV",
    title: "LinkedIn CV PDF’ini ücretsiz düzenleme",
    description:
      "LinkedIn’den indirdiğin özgeçmiş PDF’ini tarayıcıda düzelt, yazım hatasını gider, metni seçilebilir dosya indir. Hesap yok.",
    keywords: ["linkedin cv pdf düzenle ücretsiz", "linkedin özgeçmiş pdf", "linkedin cv indir düzenle"],
    intro:
      "LinkedIn profilini PDF olarak indirmek hızlı bir özgeçmiş üretir ama dosya genelde fazla geneldir: ilana göre unvan yok, maddeler zayıf, Türkçe karakter veya tarih formatı kaymış olabilir. Bu rehber, o PDF’i silmeden nasıl düzelteceğini anlatır.",
    sections: [
      {
        title: "LinkedIn PDF’i nereden alınır?",
        body: "Profilinde «Daha fazla» veya «Kaynaklar» altından PDF olarak kaydet. Dil ayarın profil diliyle aynı olsun; İngilizce ilan için EN, Türkiye ilanı için TR profilinden indir. Çıktı LinkedIn şablonudur: iletişim, özet, deneyim. Fotoğraf ve kenar süsü ATS’ye fayda sağlamaz; önemli olan metnin seçilebilir olmasıdır.",
      },
      {
        title: "Küçük düzeltme: PDF’te tıkla",
        body: "Tek bir tarih, telefon veya yazım hatası varsa PDF düzenleyiciyi aç, Alanı kapat ile eski yazının üstünü ört, Yazı ekle ile doğru metni yerleştir ve indir. Yeni yazının konumunu ve boyutunu kontrol et. Kapatılan sayfa görüntüye dönüşeceği için ATS başvurularında CV stüdyosunda yeniden oluşturmayı tercih et. Bu yol, «LinkedIn CV PDF düzenle ücretsiz» aramasındaki asıl ihtiyacı karşılar: hesap açmadan, dosyayı baştan yazmadan düzeltmek.",
      },
      {
        title: "Büyük düzeltme: stüdyoya aktar",
        body: "Özet veya maddeler değişecekse stüdyoda PDF’i cihazında içe aktar. Alanlar taslak olarak doldurulur; çıkarılan metni kaynakla karşılaştır ve yanlış eşleşmeleri formdan düzelt. İçerik otomatik çevrilmez. Bitince PDF veya Word indir. Bu, LinkedIn şablonundan bağımsız, sade bir başvuru dosyası üretir.",
      },
      {
        title: "LinkedIn metnini ilana göre kırp",
        body: "Profil herkese açıktır; CV tek ilan içindir. 12 yıllık her görevi bırakma. Son 10 yıl ve ilanla ilgili 3-5 rol yeter. Gönüllü iş, kurs ve sertifikayı ayrı bölümde tut. «Açık iş arıyorum» cümlesini CV’ye koyma. LinkedIn başlığın ile CV unvanın çelişmesin; işveren ikisini yan yana açar.",
      },
      {
        title: "Göndermeden önce üç kontrol",
        body: "PDF’te isim ve e-posta ilk bakışta görünüyor mu? LinkedIn URL’si kişiselleştirilmiş mi? İlandaki zorunlu araç adı (Salesforce, SAP, Figma) gerçekten kullandıysan metinde geçiyor mu? Son olarak dosyayı kendi aramanla tara. Seçilemeyen metin, LinkedIn’den bozuk dışa aktarım veya tarama demektir; stüdyodan yeni çıktı al.",
      },
    ],
    related: [
      { label: "LinkedIn PDF’ini stüdyoda aç", href: "/studio" },
      { label: "PDF’te satır düzelt", href: "/tools/edit-pdf" },
    ],
  },
  {
    slug: "cv-pdf-yazim-hatasi-duzeltme",
    eyebrow: "Hızlı düzeltme",
    title: "CV PDF yazım hatası nasıl düzeltilir?",
    description:
      "Özgeçmiş PDF’indeki hatalı alanı kapatıp üzerine doğru yazıyı ekle. Görsel düzeltme ve ATS için yeniden oluşturma seçeneklerini öğren.",
    keywords: ["cv pdf yazım hatası düzelt", "pdf yazım hatası", "özgeçmiş yanlış yazım"],
    intro:
      "Başvuruyu göndermeden bir dakika kala fark edilen «yonetici», eksik harf veya yanlış e-posta, tüm dosyayı yeniden tasarlamanı gerektirmez. PDF düzenleyicide eski yazının üstünü kapatıp üzerine doğru yazıyı ekleyebilirsin. Bu görsel bir düzeltmedir; eski metin doğrudan düzenlenmez.",
    sections: [
      {
        title: "Önce hatanın türünü ayır",
        body: "Tek kelime / e-posta / telefon ise PDF düzenleyici yeter. Paragrafın anlamı bozuksa, fiil zamanı tutmuyorsa veya bölüm eksikse stüdyoya geç. Yazım denetimi Word’de kalmış eski bir dosyayı PDF yaptıysan hata PDF’e gömülüdür; kaynak DOCX varsa orada düzeltip yeniden PDF almak daha temiz olabilir.",
      },
      {
        title: "Alanı kapat, doğru yazıyı ekle",
        body: "Alanı kapat aracını hatalı yazının üzerine yerleştir ve boyutlandır. Ardından Yazı ekle aracına doğru metni yazıp aynı bölgeye taşı. Uzun kelime aynı puntoda sığmazsa punto büyütmeye çalışma; kelimeyi veya cümleyi kısalt. Türkçe i/İ ayrımına dikkat et. Şirket ve üniversite adlarını resmi yazımdan kopyala. Değişen satırın altındaki tarih veya madde kaydıysa bir sonraki satırı da kontrol et.",
      },
      {
        title: "İletişim hataları öncelikli",
        body: "Yanlış e-posta, CV’deki en pahalı yazım hatasıdır. `gnail` / `gmal`, eksik nokta, eski iş telefonu. LinkedIn URL’sinde kullanıcı adı değiştiyse güncelle. Şehir adında ı/i hatası (Istanbul / İstanbul) TR başvuruda dikkatsizlik izlenimi verir. Bu satırları sesli oku.",
      },
      {
        title: "Kaydetme ve yeniden yükleme",
        body: "Yeni PDF indir, eski dosyayı «eski» klasörüne al. Kariyer portalı aynı ada izin verip önbellek tutuyorsa dosya adına tarih ekle. E-postayla gönderdiysen düzeltilmiş kopyayı kısa bir notla tekrar at; «güncel CV, yazım düzeltmesi» yeter. Aynı ilana üç dosya yağdırma.",
      },
      {
        title: "Taranmış PDF ve ATS uyumu",
        body: "Taranmış PDF’ye de alan kapatma ve yeni yazı ekleme uygulanabilir. Ancak görsel düzeltme, sayfayı seçilebilir metinli bir CV’ye dönüştürmez. ATS başvurusu için CV stüdyosuna PDF veya ekran görüntüsü aktar, alanları kontrol et ve doğru metinle yeni CV oluştur.",
      },
    ],
    related: [
      { label: "PDF yazımını düzelt", href: "/tools/edit-pdf" },
      { label: "CV PDF düzenleme rehberi", href: "/guides/cv-pdf-duzenleme" },
    ],
  },
  {
    slug: "ats-uyumlu-cv-turkce-ucretsiz",
    eyebrow: "Türkçe başvuru",
    title: "Sade Türkçe CV ücretsiz nasıl hazırlanır?",
    description:
      "Türkçe, sade ve metni seçilebilir CV hazırlama rehberi. Başvuru sistemlerinde uyumluluk veya kabul garantisi verilmez; ilan sahibinin dosya koşullarını kontrol et.",
    keywords: ["sade Türkçe CV şablonları", "ücretsiz Türkçe özgeçmiş", "kariyer.net cv"],
    intro:
      "CV dilini ve dosya biçimini ilan sahibinin talebine göre seç. Bu rehber ücretsiz araçlarla Türkçe, sade ve metni seçilebilir bir CV hazırlamayı anlatır. Metnin seçilebilir olması her başvuru sisteminde doğru okunacağı anlamına gelmez; otomatik çeviri ve ATS puanlama sunulmaz.",
    sections: [
      {
        title: "Türkçe ilan, Türkçe CV",
        body: "İlan Türkçe ise başlık, özet ve maddeler Türkçe olsun. «Experience» yerine «İş Deneyimi», «Education» yerine «Eğitim». Karma dil («sales konusunda responsible oldum») hem ATS eşleşmesini hem insan okumasını bozar. Şirket içi unvan İngilizceyse parantezle Türkçe karşılık verebilirsin ama cümleyi tek dilde kur.",
      },
      {
        title: "Kariyer sitelerinin beklediği sadelik",
        body: "Kariyer.net, LinkedIn, Eleman.net ve şirket kariyer sayfaları PDF veya form ister. Formdaki alanlarla CV çelişmesin. Askerlik, ehliyet, yaş gibi alanları yalnızca form istiyorsa yaz; süslü şablona fotoğraf ve ikon yığma. Tek kolon, siyah metin, standart bölümler ücretsiz stüdyo çıktısının da temelidir.",
      },
      {
        title: "Ücretsiz akış: içe aktar, düzelt, indir",
        body: "Mevcut PDF veya LinkedIn çıktısını cihazında içe aktar. Çıkarılan metni ve doldurulan taslağı kontrol edip alanları elle düzelt. Türkçe karakterleri önizlemede kontrol et. Word isteyen kurum için DOCX indir. Hesap veya ödeme gerekmez.",
      },
      {
        title: "Türkçe ATS’nin takıldığı yerler",
        body: "Sütunlu şablonlar, ikonla gizlenmiş e-posta, görüntü olarak basılmış yazı ve «beceri %90» bar’ları. Ayrıca `İ` harfinin büyük harfe yanlış çevrilmesi. PDF’i indirip kendi aramanla «Excel», «satış», «staj» diye dene. Çıkmıyorsa metin katmanı yoktur. Tarihleri `09.2022 - 06.2024` gibi tek formatta tut; «geçen yaz» yazma.",
      },
      {
        title: "İlana özel tek sayfa",
        body: "Aynı Türkçe CV’yi 40 ilana göndermek yerine, her başvuru için üst özeti ve ilk üç maddeyi ilana yaklaştır. Stüdyoda kopya tutmana gerek yok; gönderdiğin PDF’i tarihli kaydet. Zorunlu askerlik veya konum notunu formda zaten verdiysen CV’nin en altına tek satır yeter. Amaç: insan kaynakları 10 saniyede «bu dosya bu ilan» desin.",
      },
    ],
    related: [
      { label: "Ücretsiz CV stüdyosu", href: "/studio" },
      { label: "ATS CV nasıl oluşturulur?", href: "/guides/ats-uyumlu-cv-olusturma" },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
