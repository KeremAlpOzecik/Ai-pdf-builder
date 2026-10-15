# ekoPDF Studio

Türkçe, tarayıcıda çalışan PDF düzenleyici. Dosya verileri uygulama sunucusuna gönderilmez. MuPDF işlemleri ayrı bir Web Worker içinde yürür. Yerel otomatik kayıt IndexedDB kullanır.

## Çalıştırma

Node.js 22 veya üzeri ile `npm ci`, ardından `npm run dev`. Üretim çıktısı için `npm run build`; `dist/` klasörünü statik olarak sunun. WASM için `application/wasm` MIME türü kullanın. İnternet üzerinden açıldığında uygulama ve fontları ilk kez indirmek gerekir.

## İşlevler

- PDF ve görsel açma; çoklu PDF birleştirme.
- Desteklenen mevcut PDF metnini seçme, kaldırma ve özgün gömülü font / boyutla yeniden yazma. Kısmi fontların Unicode tablosu eksik olduğunda PDF’deki karakter–glif eşlemesi kullanılır. Metin seçilebilir olarak korunur.
- Mevcut fontta eksik karakter varsa açık uyarı ve indirmeyi durdurma; özgün TTF/OTF dosyası yükleme veya kullanıcının açık seçimiyle Noto Sans’a geçme. Karışık font ve boyut içeren satırlar ayrı düzenlenebilir parçalara ayrılır.
- Metin ekleme, kalın/italik, hizalama, renk, konum, boyut ve opaklık.
- Görsel ekleme, yerleşik görsel kaldırma/değiştirme, kırpma ve yeniden boyutlandırma.
- Dikdörtgen, elips, çizgi, ok, serbest çizim, vurgu, görünür not ve çizilmiş görsel imza.
- Sayfa ekleme, silme, çoğaltma, sürükleyerek sıralama ve 90 derece döndürme.
- MuPDF ile içerik kaldıran alan karartması. Paylaşılacak çıktıyı her zaman gözden geçirin; proje dosyası özgün içeriği içerir.
- Geri alma/yineleme, kopyalama/yapıştırma ve klavye kısayolları.
- PDF, PNG/JPG sayfalarını ZIP olarak indirme, sayfa aralığı ve sayfa numarası.
- `.ekopdf` düzenlenebilir proje kaydı ve tarayıcıda son çalışmayı geri yükleme.
- İşlemler panelinden tümüne veya seçilen sayfalara metin/logo filigranı; açı, opaklık, renk ve konum ayarları. Tek adımla geri alınır.
- PDF’yi her sayfa ayrı, sabit büyüklükte veya özel gruplara bölüp ZIP indirme.
- Boyut karşılaştırmalı kayıpsız optimizasyon; isteğe bağlı 144/96 DPI görüntü tabanlı sıkıştırma. Daha büyük sonuç oluşursa özgün düzenlenmiş çıktı korunur. Görüntü tabanlı seçeneklerde metin seçimi ve etkileşim kaybolur.
- Türkçe isim, renk ve stil seçimiyle yazılı imza.
- Parolası bilinen PDF’yi açma. Proje yedeği açma parolasını içerebilir; dışa aktarılan PDF yeni bir parolayla korunmaz.

## Canva incelemesi: kanıt sınırı

2026-10-15 tarihinde bağlı REA MCP `capture_browser_scenario` aracıyla Microsoft Edge üzerinden `https://www.canva.com/pdf-editor/` açıldı ve sayfa yerleşmesi beklendi. REA kanıt kimliği: `ev_200f9f50f393b9c6402af52cda15c5d80625cc9469999de8f2b37278854d660b`.

**Doğrudan gözlem:** Canva “We’ll have you designing again soon” güvenlik ekranını gösterdi; yardım bağlantısı Cloudflare sorun giderme sayfasına yöneldi. Editör açılmadı. Canva kodu, özel API’leri, dönüşüm servisi veya oturum içi düzenleme davranışı çözümlendiği iddia edilmiyor.

**Resmî belgeyle doğrulanan referans akış:** PDF yükleme → desteklenen metin/görsel/yerleşim düzenleme → sayfa ekleme → PDF veya PNG/JPG dışa aktarma. Kaynak: https://www.canva.com/help/import-and-edit-pdfs-canva/ (2026-10-15). Uygulama bu akışı bağımsız kodla gerçekleştirir; Canva varlıkları veya markası kopyalanmamıştır.

**Tasarım kararları:** Hesapsız yerel işleme, yeşil ekoPDF tasarımı, proje biçimi, MuPDF içerik kaldırma ve pdf-lib vektör dışa aktarımı bu uygulamaya aittir.

## WordPDF incelemesi ve eklenen özellikler

2026-10-15 tarihinde REA ile `https://wordpdf.com/pdf-to-edit` sayfası açıldı. Kanıt: `ev_77cd805b76a00db409db949d99090b3d1c02d0b7cf181b3adc008eaf6d901375`. Görünen araç listesinde bölme, sıkıştırma, filigran ve yazma/çizme/yükleme yoluyla imza oluşturma yer aldı. Filigran sayfasının ayrı REA kaydı: `ev_4d3741fa077be304a9c33aeab8f366c84ece86148fcee252e097f2d0d49de306`. Bunlar görünen ürün özellikleri; tüm sonuçların çalıştığı varsayılmadı.

Üretilmiş, kişisel veri içermeyen tek sayfalık örnek PDF, araştırma tarayıcısıyla yüklendi. Sayfa `/document/create?tool=add-text` editörüne geçti. REA pasif CDP incelemesi `ev_f77742f7ad5e299c338db5e09e63f14cc50cfc68a306e83e2f65fd4274d2f420` ekle/düzenle metin, imza, çizim, vurgu, görüntü, damga, bağlantı, not, sayfa yönetimi, yazdırma ve arama kontrollerini gözledi. Yakalama geçmiş ağ trafiğini içermez; `about:blank` alt çerçevesi ve başka kökenlerdeki kaynaklar kapsam dışıdır. Ücretli indirme veya dönüştürme sonuçları sınanmadı.

REA `analyze_web_bundle` kanıtı `ev_d76a30595fa33f09b64eee4356ef073004444de9808b1faf2329317c589b0ca4` gözlenen 72 JavaScript kaynağını statik olarak inceledi. Next.js/React işaretleri ve `/apryse/core/webviewer-core.min.js`, `/apryse/core/pdf/PDFNet.js`, `/apryse/core/pdf/PDFNetLean.js` kaynakları bulundu. Ayrıştırıcı kurtarma gerektiren bir kaynak nedeniyle analiz kısmi; sunucu tarafı davranış ve tüm çağrı yolları bilinmiyor. Apryse veya WordPDF kodu ekoPDF’ye kopyalanmadı.

Bu incelemede ekoPDF’nin mevcut düzenleme/birleştirme/görsel/çizim yeteneklerine ek olarak **filigran, ayrı PDF’lere bölme, sıkıştırma ve yazarak imza** seçildi. Uygulamalar bağımsızdır; WordPDF’nin aboneliğini veya indirme kısıtlamasını devralmaz. Filigran gerçek erişim kontrolü değildir. Word/Excel/PowerPoint dönüşümü, OCR ve interaktif form şablonları bu güncellemenin kapsamı dışındadır.

## Bilinen kapsam sınırları

Canva ile eksiksiz özellik eşitliği doğrulanmış değildir. OCR, yapay zekâ, bulut projeleri, canlı ortak çalışma, stok içerik kütüphanesi, animasyon/video dışa aktarımı, sertifikalı e-imza ve PDF/CMYK baskı öncesi kontrolleri bulunmaz. Form alanlarının etkileşimli biçimde yeniden kurulması desteklenmez; görünen alanlara metin eklenebilir. Gömülü TrueType/OpenType ve desteklenen PDF standart fontları yeniden kullanılabilir; Type 3 fontlar, gömülü olmayan özel fontlar ve kısmi fontta bulunmayan harfler özgün font dosyası gerektirir. İleri ligatür, sağdan sola şekillendirme, özel karakter aralığı ve eğik/skew metin dönüşümleri birebir yeniden kurulmaz; karmaşık tipografide yerleşim kontrol edilmelidir. Font yüklemesi kullanıcının seçtiği dosyayı kullanır, aynı aileyi seçtiğini otomatik doğrulamaz. Karmaşık form, bağlantı, katman ve sayfa dışı içerikler kontrol edilmelidir. 300 MB/500 sayfa üst sınırı, bu büyüklükte her dosya için performans garantisi değildir. Sayfa önizlemeleri ilk 30 yerleşik sayfa için üretilir.

## Doğrulama

`npm test`: Edge/Playwright ile Türkçe seçilebilir metin, yerleşik metnin içerikten kaldırılması, döndürülmüş sayfa, PDF birleştirme/sıralama/silme/geri alma, proje tekrar açma, PNG ZIP, kalıcı karartma, çizim, görsel imza/kırpma, mobil araç panelleri ve bozuk proje reddi sınanır. Test ortamı Windows Edge yolunu kullanır; başka sistemlerde `playwright.config.js` içindeki `executablePath` alanını uygun tarayıcıya uyarlayın.

## Lisanslar

ekoPDF: AGPL-3.0-or-later, tam metin `public/LICENSE.txt`. Çalışan sitede kaynak kodu `source.zip` ile sunulur. MuPDF 1.28.1 AGPL-3.0-or-later: https://github.com/ArtifexSoftware/mupdf.js ve https://git.ghostscript.com/?p=mupdf.git. MuPDF dağıtımı `public/mupdf/` altında değiştirilmeden bulunur. pdf-lib MIT; fontkit MIT; JSZip MIT/GPL-3.0; idb-keyval Apache-2.0; Lucide ISC; Noto Sans SIL OFL (`public/fonts/OFL.txt`).
