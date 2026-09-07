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
    slug: "ucretsiz-pdf-birlestirme",
    eyebrow: "PDF rehberi",
    title: "Ücretsiz PDF birleştirme nasıl yapılır?",
    description:
      "Birden fazla PDF dosyasını tek belgede birleştirmek için tarayıcıda çalışan ücretsiz yöntem. Hesap yok, dosya cihazında kalır.",
    keywords: ["ücretsiz PDF birleştirme", "PDF birleştir", "online PDF merger"],
    intro:
      "İş başvurusunda diploma, sertifika ve CV’yi ayrı ayrı göndermek yerine tek PDF’te toplamak hem senin hem de işverenin işini kolaylaştırır. AI CV Builder’daki birleştirme aracı dosyaları tarayıcıda sıralar ve tek belge üretir; dosyaların bir sunucuya yüklenmesi gerekmez.",
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
      "PDF içindeki cümleyi değiştirmek istediğinde belgeyi Word’e almak çoğu zaman en hızlı yoldur. AI CV Builder, PDF’teki metni düzenlenebilir bir DOCX dosyasına aktarır. Karmaşık çok kolonlu tasarımlar sadeleşebilir; asıl kazanç, metni kopyalayıp yeniden yazmak zorunda kalmamandır.",
    sections: [
      {
        title: "Ne zaman PDF’i Word’e çevirmelisin?",
        body: "Tarih, unvan veya tek bir cümle değişecekse ve elinde kaynak DOCX yoksa dönüştürmek işe yarar. Uzun dilekçe, transkript açıklaması veya eski bir CV metnini güncellemek için de kullanılır. Hedefin yalnızca bir yazım hatasını düzeltmekse PDF düzenleyici daha az bozar: metne tıklayıp yerinde değiştirirsin, sayfa düzeni korunur.",
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
        body: "Özgeçmişi baştan düzenlemek istiyorsan stüdyoya geç. PDF veya LinkedIn çıktısını içe aktar, alanları canlı önizlemede düzelt ve ATS için ifade önerisi al. Bu yol, dönüştürülmüş Word dosyasındaki bozulmuş düzenle uğraşmaktan genellikle daha kısa sürer. Word çıktısını yalnızca metni başka bir şablona yapıştıracağın zaman tercih et.",
      },
      {
        title: "Dönüştürme sonrası başvuru kontrol listesi",
        body: "DOCX’i Word veya Google Docs’ta aç, yazım denetimini çalıştır, tarih formatlarını MM-YYYY veya açık ay-yıl olarak hizala. Gereksiz boş satırları sil. İşverene Word değil PDF isteniyorsa düzeni bitirip Word → PDF aracıyla tekrar PDF al. Göndermeden önce dosya adını `Ad-Soyad-CV.pdf` gibi sade tut.",
      },
    ],
    related: [
      { label: "PDF → Word aracını aç", href: "/tools/pdf-to-word" },
      { label: "AI CV stüdyosunu aç", href: "/studio" },
    ],
  },
  {
    slug: "ats-uyumlu-cv-olusturma",
    eyebrow: "CV rehberi",
    title: "ATS uyumlu CV nasıl oluşturulur?",
    description:
      "İş başvurularında CV’nin ATS tarafından okunması için sade düzen, doğru başlıklar ve ölçülü anahtar kelime kullanımı.",
    keywords: ["ATS uyumlu CV", "ATS özgeçmiş", "yapay zekâ CV oluşturucu"],
    intro:
      "ATS (Applicant Tracking System), iş başvurularındaki özgeçmişleri alanlara ve kelimelere göre tarar. Sade bir düzen, açık bölüm başlıkları ve ilandaki gerçek beceriler CV’nin elenmeden geçme ihtimalini artırır. Amaç robotu kandırmak değil; insan kaynaklarının dosyayı açmadan önce doğru aday olarak görmesini sağlamaktır.",
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
        body: "İlandaki zorunlu becerileri CV’nde görünür kıl ama cümleyi kelime salatasına çevirme. Aynı cümleyi üç kez tekrarlamak hem ATS hem insan için kötüdür. Türkçe ilanlarda Türkçe başlık, İngilizce ilanlarda İngilizce fiil kullan. Stüdyodaki ATS düzenleme, ifadeleri güçlendirmek için öneri üretir; her satırı kabul etmek zorunda değilsin.",
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
      { label: "AI CV stüdyosunu aç", href: "/studio" },
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
      "CV’ni sıfırdan yazmak yerine mevcut PDF’teki bir tarihi veya yazım hatasını düzeltmek çoğu zaman yeter. Dijital, seçilebilir metin içeren dosyalarda satıra tıklayıp değiştirebilirsin. AI CV Builder düzenleyici bunu tarayıcıda, hesap açmadan yapar.",
    sections: [
      {
        title: "Dijital PDF ile taranmış PDF farkı",
        body: "Word’den veya LinkedIn’den dışa aktarılmış PDF’te tıklanabilir metin vardır. Telefonda fotoğrafı çekilmiş veya tarayıcıdan «görüntü olarak kaydet» yapılmış dosyada yoktur. Tıklayınca satır seçilmiyorsa bu bir tarama PDF’sidir. O durumda stüdyoya ekran görüntüsü yükleyip alanları yeniden kurmak daha temiz sonuç verir.",
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
        body: "Birden fazla bölüm değişecekse, dili TR’den EN’e çevireceksen veya ATS için maddeleri yeniden yazacaksan PDF tıklama düzenleyicisi yetmez. Stüdyoda içe aktar, canlı önizlemede çalış, PDF veya Word indir. Büyük revizyonu satır tıklayarak yapmak hem yavaş hem hata üretme ihtimali yüksek.",
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
      "LinkedIn’den indirdiğin özgeçmiş PDF’ini tarayıcıda düzelt, yazım hatasını gider, ATS uyumlu dosya indir. Hesap yok.",
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
        body: "Tek bir tarih, telefon veya yazım hatası varsa PDF düzenleyiciyi aç, satıra tıkla, değiştir, indir. LinkedIn PDF’i dijital olduğu için metin genellikle tıklanır. Taşma olursa cümleyi kısalt. Bu yol, «LinkedIn CV PDF düzenle ücretsiz» aramasındaki asıl ihtiyacı karşılar: hesap açmadan, dosyayı baştan yazmadan düzeltmek.",
      },
      {
        title: "Büyük düzeltme: stüdyoya aktar",
        body: "Özet zayıfsa, maddeler kopyala-yapıştır gibi duruyorsa veya dili çevireceksen stüdyoda PDF’i içe aktar. Alanlar forma dolar; canlı önizlemede ATS için düzenle’ye basıp önerileri tek tek kabul et. Gerçek olmayan ölçü ekletme. Bitince PDF veya Word indir. Bu, LinkedIn şablonunun görünümünden bağımsız, sade bir başvuru dosyası üretir.",
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
      "Özgeçmiş PDF’indeki yazım hatasını tarayıcıda tıklayıp düzelt. Yeni CV yazmadan güncel dosya indir.",
    keywords: ["cv pdf yazım hatası düzelt", "pdf yazım hatası", "özgeçmiş yanlış yazım"],
    intro:
      "Başvuruyu göndermeden bir dakika kala fark edilen «yonetici», eksik harf veya yanlış e-posta, tüm dosyayı yeniden tasarlamanı gerektirmez. Seçilebilir metinli CV PDF’sinde satıra tıklayıp hatayı yerinde düzeltebilirsin.",
    sections: [
      {
        title: "Önce hatanın türünü ayır",
        body: "Tek kelime / e-posta / telefon ise PDF düzenleyici yeter. Paragrafın anlamı bozuksa, fiil zamanı tutmuyorsa veya bölüm eksikse stüdyoya geç. Yazım denetimi Word’de kalmış eski bir dosyayı PDF yaptıysan hata PDF’e gömülüdür; kaynak DOCX varsa orada düzeltip yeniden PDF almak daha temiz olabilir.",
      },
      {
        title: "Satıra tıkla, kısa tut, taşırma",
        body: "Düzenleyicide hatalı satırı seç, doğrusunu yaz. Uzun kelime aynı puntoda sığmazsa punto büyütmeye çalışma; kelimeyi veya cümleyi kısalt. Türkçe i/İ ayrımına dikkat et. Şirket ve üniversite adlarını resmi yazımdan kopyala. Değişen satırın altındaki tarih veya madde kaydıysa bir sonraki satırı da kontrol et.",
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
        title: "Tarama PDF’sinde yazım düzelmez",
        body: "Tıklanınca imleç çıkmıyorsa metin yoktur. Fotoğraf CV’sini düzenlemeye çalışma. Stüdyoya ekran görüntüsü yükle, alanları oluştur, doğru metinle yeni PDF al. Bu, «üzerine yazı yazılmış tarama»den hem daha okunaklı hem ATS için daha güvenlidir.",
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
    title: "ATS uyumlu CV Türkçe ve ücretsiz nasıl hazırlanır?",
    description:
      "Türkiye kariyer siteleri için Türkçe, ATS uyumlu, ücretsiz özgeçmiş. Hesap yok; PDF’i tarayıcıda oluştur veya düzelt.",
    keywords: ["ATS uyumlu CV Türkçe ücretsiz", "ücretsiz Türkçe özgeçmiş", "kariyer.net cv"],
    intro:
      "Türkiye’deki ilanların çoğu Türkçe form ve ATS kullanır. İngilizce şablonla başvurmak, bölüm adlarını ve tarihleri şaşırtabilir. Bu rehber, ücretsiz araçlarla Türkçe, sade ve taranabilir bir CV çıkarmanı anlatır.",
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
        body: "Mevcut PDF veya LinkedIn çıktısını stüdyoya yükle. Hesap açmadan alanları düzelt. ATS için düzenle önerilerini oku; abartılı fiilleri reddet. Türkçe karakterlerin PDF’te bozulmadığını önizlemede gör. Word isteyen kurum için DOCX indir. Bu zincir, ücretli CV sitelerindeki «indirmeden önce öde» duvarı olmadan çalışır.",
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
