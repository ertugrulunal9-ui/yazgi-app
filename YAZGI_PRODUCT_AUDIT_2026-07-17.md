# Yazgı — Ürün, Ticari Başarı ve Teknik Gerçeklik Denetimi

**Tarih:** 17 Temmuz 2026  
**Kapsam:** `C:\Yazgi` deposundaki kod, ürün belgeleri, mağaza metni, testler, yayın ayarları ve güncel rakip/pazar verileri  
**Karar:** **Ürünü daraltarak devam et; genel yayına çıkma.**  
**Genel puan:** **48/100 — belirli koşullarda çalışabilir, temel sorunlar var.**  
**Güven:** Orta-düşük. Kod kanıtı güçlü; gerçek kullanıcı, trafik, gelir, mağaza dönüşümü ve retention verisi yok.

---

## 1. Yönetici özeti

Yazgı, oyuncunun doğumdan 18 yaşına kadar verdiği kararlarla kişiliğini, ilişkilerini, yeteneklerini ve oyun sonunu şekillendirdiği Türkçe, metin ağırlıklı bir mobil yaşam simülasyonudur. En güçlü tarafı, BitLife’ın geniş “doğumdan ölüme” formülünü kopyalamak yerine Türkiye’de çocukluk ve ergenlik dönemine, okul/aile baskısına ve kalıcı seçim izlerine odaklanabilecek olmasıdır. En zayıf tarafı ise bu vaadin üründe henüz yeterince gerçekleşmemesidir: çalışma zamanı denetimi 418 olay bulsa da 1.005 seçimin yalnızca 35’i (%3,48) ileriye dönük olay üretiyor; koşullu sonuç sayısı sıfır. Mağaza metnindeki “500+ olay” ve “47 son” iddiaları da kodla uyuşmuyor; kod 35 son üretir.

Teknik temel sıradan bir prototipten güçlüdür: 105 Jest paketi ve 1.231 test geçiyor, lint temiz, oyun simülasyon kapısı geçiyor. Buna karşın mevcut sürüm yayın adayı değildir: TypeScript üretim kontrolü `GameOverScreen` reklam ödülü tiplerinde kırılıyor, production güvenlik audit’i yüksek/kritik açıklar buluyor, Expo Doctor sekiz paket uyumsuzluğu bildiriyor ve web önizlemesi native AdMob importu nedeniyle beyaz ekranda kalıyor. Android QA belgelerindeki PNG kanıtları geçerli PNG biçiminde değil; görsel kalite bağımsız doğrulanamadı.

En büyük ticari risk dağıtım değilmiş gibi davranılmasıdır. Kamuya açık mağaza/traction kanıtı, gerçek ekran görüntüsü seti, kullanıcı görüşmesi, fiyat testi veya cohort retention verisi yok. Buna rağmen proje 98 bin satır TypeScript/TSX, 291 kaynak dosyası, iki monetizasyon yolu, 68 achievement, 35 ending, meta-progression ve geniş feature-flag yüzeyi taşıyor.

**Gerçekçi sonuç:** Genel yayına bu hâliyle çıkarsa düşük keşfedilme, zayıf ilk değer anı ve ikinci oynanışa geçememe nedeniyle birkaç yüz/az bin indirmede durma ihtimali yüksektir. Küçük sürdürülebilir iş olasılığı mevcut hâliyle yaklaşık %8–18’dir; bu tahmin veri yokluğu nedeniyle düşük güvenlidir.

**İlk üç iş:**

1. Derleme/audit/API-36/yayın kanıtı kapılarını düzelt; sahte “GO” durumunu kaldır.
2. İlk turu 60 saniye içinde başlat; karakter formunu opsiyonel yap ve ilk 10 dakikada en az bir seçimin 2–5 tur sonra görünür sonucunu göster.
3. 100–300 gerçek oyunculu kapalı testte `ilk anlamlı seçim → ilk gecikmeli sonuç → ilk run tamamlanması → 7 gün içinde ikinci run` hunisini ölç; yeni özellik ve aboneliği bu veriye kadar dondur.

---

## 2. Projeyi nasıl anladım?

### Tek cümlelik tanım

Bu ürün, **Türkçe mobil hikâye/simülasyon oyuncuları** için **“seçimlerim nasıl bir genç yetişkine dönüşeceğimi gerçekten değiştirsin”** ihtiyacını, **Türkiye’ye özgü çocukluk, okul, aile ve arkadaşlık olaylarına odaklanan kısa yaşam koşularıyla** çözmeyi amaçlayan bir **seçim tabanlı yaşam simülasyonudur**.

### Kullanıcının satın aldığı gerçek sonuç

Kullanıcı bir “stat sistemi” satın almaz. Şunları satın alır:

- Merak: “Bu seçimin ileride başıma ne açacağını görmek.”
- Kendini ifade: “Ben bu durumda ne yapardım?”
- Alternatif hayat fantezisi ve pişmanlık olmadan deneme.
- Paylaşılabilir kimlik sonucu: “Benim Yazgım böyle çıktı.”
- Tekrar oynanabilir ustalık: farklı sonları açma ve daha tutarlı bir karakter kurma.

### Ürün neyi değiştirmeye çalışıyor?

Pasif kısa video tüketimi yerine oyuncuyu 15–30 dakikalık aktif karar zincirine sokmaya çalışıyor. Ancak belgelerde hedeflenen 45–60 dakikalık run, mobil ilk oturum için fazla iddialıdır ve doğrulanmamıştır.

### Mevcut alternatifler

- Doğrudan: BitLife, AltLife, Another Life ve benzeri life-sim oyunları.
- Dolaylı: Choices/Episode türü interaktif hikâyeler, karakter testleri, visual novel oyunları.
- Manuel: arkadaşlarla “sen olsan ne yapardın?” sohbeti, kişilik testleri, rol yapma.
- Hiçbir şey yapmama: TikTok/Instagram/YouTube gibi daha düşük eforlu eğlence.

### Açıklama–ürün farkı

- Mağaza: 500+ olay. Denetim: **388 kaynak, 418 runtime olay**.
- Mağaza: 47 son. Kod: **6 hedef × 4 tier + 6 mismatch + 5 secret = 35 son**.
- Mağaza: “her karar iz bırakır.” Denetim: yalnızca **35/1.005 seçim** ileri olay üretiyor; runtime koşullu sonuç **0**.
- README/GDD: web opsiyonu/React Native web. Canlı web paketi AdMob native importunda kırılıyor.
- Belgeler: premium/IAP tamamlanmış. `monetization.ts`: “pure ad-only” ve genel purchase fonksiyonu daima hata döndürüyor; ayrı `subscriptionManager.ts` ise RevenueCat aboneliği açıyor. Ürün ve kod iki farklı gelir modeli anlatıyor.

---

## 3. Varsayımlar ve eksik bilgiler

### Bilinenler

- Android öncelikli Expo/React Native oyun.
- Türkçe ana dil, İngilizce lokalizasyon mevcut.
- 0–18 yaş aralığı ve seçim/event döngüsü.
- AdMob, Firebase, Crashlytics ve RevenueCat entegrasyon kodu var.
- 105 test paketi geçiyor; güncel üretim typecheck ve audit geçmiyor.

### Eksikler

- Ekip büyüklüğü, haftalık gerçek kapasite, bütçe ve hedef çıkış tarihi.
- Play Console durumu, kapalı test zorunluluğu, gerçek AAB ve cihaz matrisi.
- Install, onboarding completion, first-run completion, D1/D7/D30, DAU/MAU.
- Reklam fill/eCPM, paywall view, ödeme ve refund verisi.
- Kullanıcı görüşmeleri, store impression→install oranı, yorumlar.
- Geçerli ürün ekran görüntüleri ve erişilebilirlik cihaz testi.
- Rakip analizine dayalı Türkiye özel arama hacmi.

### Çalışma varsayımları

- Depo tek kişi veya küçük ekipçe yürütülüyor. Eski roadmap’in “2 dev + 0,5 QA” kabulü kanıt değil.
- Henüz anlamlı canlı trafik ve gelir yok; çünkü veri verilmedi ve kamuya açık Yazgı mağaza kaydı bulunamadı.
- İlk ticari hedef “masrafları karşılayan küçük yan gelir”; 100K DAU yatırım ölçeğinde hedef şimdilik güvenilir değil.
- Planlama için kişi başı haftalık net kapasite **3,5 gün** kabul edildi. Tek kişi için dört haftada yaklaşık **14 net geliştirme günü** vardır.

---

## 4. Problem ve kullanıcı ihtiyacı

| Ölçüt | Puan / 5 | Gerekçe |
|---|---:|---|
| Problem sıklığı | 3 | Eğlence ihtiyacı sık, fakat life-sim tercihi niş. |
| Problem şiddeti | 2 | Acı veren/kritik problem değil; dikkat için sert rekabet var. |
| Çözüm arama motivasyonu | 3 | BitLife/interactive story arayan kullanıcı kategoriyi biliyor. |
| Ödeme isteği | 2 | Ücretsiz güçlü alternatifler var; “Türkçe” tek başına ödeme sebebi değil. |
| Mevcut çözümlerden memnuniyetsizlik | 3 | Reklam yoğunluğu, pahalı IAP ve zayıf yerelleştirme fırsat yaratır; kanıtlanmadı. |
| Büyüyen pazar | 4 | Türkiye güçlü bir oyun ekosistemidir; 2025 raporu 747 aktif stüdyo ve İstanbul’u Avrupa’nın ikinci büyük oyun kümesi olarak veriyor. |
| Kullanıcıya ulaşılabilirlik | 3 | Genç kitle kısa videoda erişilebilir; fakat kreatif üretim ve test bütçesi gerekir. |
| Tekrar kullanım potansiyeli | 3 | Çoklu son/legacy uygundur; dallanma derinliği ve ikinci run motivasyonu zayıf. |

**Kategori:** “Belirli durumlarda faydalı/eğlenceli” ürün. “Düzenli ihtiyaç” veya “kritik problem” değildir.

### Değer önerisi testi

- **Açık mı?** Evet: seçimlerle 0–18 yaş hayatı.
- **Önemli mi?** Eğlence bağlamında orta.
- **Acil mi?** Hayır.
- **Sık probleme mi dayanıyor?** Eğlenme sık; bu çözüm biçimi niş.
- **Mevcut davranışla uyumlu mu?** Kısa seçim kartları uyumlu; 45–60 dakika ve uzun başlangıç formu uyumsuz.
- **Ürün olmadan ne yapıyor?** BitLife/AltLife oynuyor veya kısa video izliyor.
- **Hâlihazırda para harcıyor mu?** Kategori reklam+IAP ile kanıtlı; bu ürün için kanıt yok.
- **Sonucu hızlı gösteriyor mu?** Anlık stat feedback var, fakat vaat edilen gecikmeli hayat sonucu yeterince hızlı/görünür değil.

---

## 5. Hedef kitle ve segmentler

| Segment | Problem/an | Mevcut çözüm | Deneme tetikleyicisi | Bırakma nedeni | Ödeme | Ulaşım |
|---|---|---|---|---|---|---|
| **A. 16–24 yaş, Türkçe mobil hikâye oyuncusu** | Kısa, kişisel, paylaşılabilir hikâye arar; okul/aile olaylarını tanır | BitLife, Episode, TikTok testleri | “Türkiye’de büyümek seni nasıl şekillendirirdi?” videosu | Metin kalitesizliği, seçimlerin sahte görünmesi, yavaş başlangıç | Düşük-orta; reklamsız/ending pack olabilir | Orta maliyet; TikTok/Reels ve öğrenci toplulukları |
| **B. 20–35 yaş, nostalji ve alternatif hayat meraklısı** | “Farklı seçim yapsaydım?” merakı | BitLife, Football Manager tipi simülasyonlar, kişilik testleri | 90’lar/2000’ler okul-aile nostaljisi | Oyun 18’de bitince yüzeysel kalması, tekrarın aynılaşması | Orta; tek seferlik premium daha uygun | İçerik/podcast/mikro-influencer ile orta |
| **C. BitLife/AltLife kullanıcısı, Türkçe ve yerel içerik arayan** | Global oyunların kültürel olarak yabancı gelmesi | BitLife/AltLife | ASO’da “Türkçe BitLife benzeri” araması | Ürün kapsamının rakipten çok küçük olması | Düşük-orta; içerik derinliği kanıtlanırsa | ASO ucuz ama hacim sınırlı |
| **D. 13–15 yaş oyuncu** | Kimlik keşfi ve okul olayları | Roblox, kısa video, casual oyun | Arkadaş paylaşımı | Ebeveyn güveni, ağır temalar, reklamlar | Çok düşük; reklam modeli hassas | Erişim kolay, yasal/etik maliyet yüksek |

**Beachhead:** A segmenti; ama 16–24 ile sınırlanmalı. 13–15 yaş grubu reklam/çocuk mahremiyeti ve içerik riskleri nedeniyle ilk odak olmamalı. B segmenti ikinci dalga olabilir.

---

## 6. Ürün ve özellik analizi

Puanlar görecelidir: kullanıcı/iş değeri 1–5, maliyet S/M/L/XL.

| Özellik | Kullanıcı değeri | İş değeri | Maliyet | Sıklık | Stratejik rol | Karar |
|---|---:|---:|---|---|---|---|
| Yaş 0–18 çekirdek run | 5 | 5 | L | Her run | Temel değer/farklılaşma | **Koru** |
| Event + seçim + anlık stat etkisi | 5 | 5 | L | Her tur | Temel değer | **Güçlendir** |
| Gecikmeli sonuç/future events | 5 | 5 | L | Her run | Retention/değer kanıtı | **Güçlendir** |
| Hedef, kişilik momentum, yara izi | 4 | 4 | XL | Her run | Kişiselleştirme | **Birleştir** |
| 35 ending + ending galerisi | 5 | 4 | L | Run sonu | Retention/paylaşım | **Güçlendir** |
| Game-over hikâye ve run card | 5 | 5 | M | Run sonu | Referral/aha | **Güçlendir** |
| Legacy/meta-progression | 4 | 4 | L | Run arası | Veri/ilerleme retention | **Basitleştir** |
| 68 achievement | 3 | 2 | L | Aralıklı | İlerleme retention | **Basitleştir** |
| Ayrıntılı karakter formu | 2 | 1 | M | İlk kullanım | Aktivasyon | **Basitleştir** |
| Quick Play’in yine form istemesi | 1 | 1 | S | İlk kullanım | Aktivasyon engeli | **Kaldır** |
| Okul ve sınav mini oyunları | 3 | 3 | L | Yaş 7+ | Yerel tema/destek | **Deneyle doğrula** |
| NPC/ilişki/questline sistemi | 4 | 4 | XL | Sık | Yerel hikâye/retention | **Basitleştir** |
| Social/skill tree ayrı sekmeleri | 3 | 2 | L | Sık | Destekleyici | **Birleştir** |
| Undo mechanic | 2 | 2 | M | Sık | Fayda/monetizasyon | **Basitleştir** |
| Günlük giriş ve streak ödülü | 2 | 2 | M | Günlük | Yapay retention | **Deneyle doğrula** |
| Contextual rewarded ads | 3 | 4 | M | Kriz/run sonu | Monetizasyon | **Koru** |
| Legacy puanı rewarded ad | 1 | 3 | S | Run sonu | Monetizasyon/denge | **Kaldır** |
| Interstitial reklam | 1 | 4 | M | Oturum | Monetizasyon | **Deneyle doğrula** |
| Aylık/yıllık premium | 2 | 3 | L | Nadir | Monetizasyon | **Ertele** |
| 3+ save slot/export/import | 2 | 2 | L | Nadir | Güven/destek | **Basitleştir** |
| Cloud sync istemcisi (backend yok) | 1 | 1 | L | Yok | Erken teknik yüzey | **Kaldır** |
| İngilizce tam içerik | 3 | 2 | XL | Tüm ürün | Pazar genişleme | **Ertele** |
| Ses/haptics/animasyon | 3 | 2 | M | Sık | Hissedilen kalite | **Koru** |
| Analytics/Crashlytics/Remote Config | 5 | 5 | M | Sürekli | Öğrenme/güven | **Güçlendir** |

### Olmazsa olmaz üç özellik

1. Seçim → görünür anlık etki → 2–5 tur sonra somut geri dönüş.
2. 60 saniyeden kısa başlangıç ve ilk anlamlı seçim.
3. Run sonucu, ending galerisi ve paylaşılabilir kişisel özet.

### En fazla karmaşıklık yaratan üç alan

1. Ad-only servis ile RevenueCat premium’un aynı anda iki ürün gerçeği oluşturması.
2. Backend’i olmayan cloud sync/save transfer yüzeyi.
3. Birbirine paralel hedef, momentum, trait, scar, memory, fate, achievement ve legacy sistemlerinin oyuncuya tek net model olarak anlatılmaması.

### Eksik üç kritik mekanizma

1. Seçimlerin gelecekte geri döndüğünü oyuncuya açıkça gösteren “echo/consequence” sistemi.
2. Ölçülebilir activation tanımı ve first-run hunisi.
3. Doğal referral: paylaşılan run kartından aynı seed/challenge ile tek dokunuşta yeni run.

---

## 7. Kullanıcı yolculuğu ve UX

| Aşama | Amaç | Şüphe/sürtünme | Verilecek mesaj | Metrik | Kaçış nedeni |
|---|---|---|---|---|---|
| 1. Duyma | İlginç mi? | “BitLife kopyası mı?” | “Türkiye’de büyü; kararların yıllar sonra geri gelsin.” | Kreatif CTR | Farkın yalnız Türkçe görünmesi |
| 2. Store | Güven/kalite | Geçerli screenshot/video yok; iddialar yanlış | Gerçek seçim→sonuç örneği | Store CVR | Görsel kanıt yok, 500+/47 tutarsızlığı |
| 3. İndirme/kayıt | Hızlı başlama | Onboarding + zorunlu ad/soyad/şehir | “60 saniyede ilk seçim” | Install→first choice | Form ve erken izin istemi |
| 4. İlk kullanım | Sistemi anlama | 3 onboarding ekranı + form + tooltips | “Bir seçim yap, etkisini gör” | First choice rate | Bilişsel yük |
| 5. İlk değer | Kararın anlamlı olduğunu hissetme | Anlık stat değişimi sıradan | “Bu karar 3 tur sonra geri döndü” | Echo seen rate | Sahte seçim hissi |
| 6. İkinci kullanım | Hikâyeye dönme | Doğal cliffhanger az | “Dün bıraktığın mesele bugün sonuçlanıyor” | 24/72h return | Hatırlanacak açık döngü yok |
| 7. Alışkanlık | Yeni yollar açma | Run uzun; tekrarlar benzer | Ending seti/challenge | 2nd run/7d | Aynı içerik, yavaş tekrar |
| 8. Ücretli ihtiyaç | Rahatlık/değer | Abonelik değeri kanıtsız | “Reklamsız + ek hikâye paketi” | Paywall after value | Değer görmeden paywall |
| 9. Satın alma | Güvenli ödeme | İki monetizasyon mimarisi, sandbox kanıtı yok | Net haklar/iptal | Purchase success | Store unavailable, fiyat |
| 10. Tavsiye | Kimliğini gösterme | Kartta `yazgi.app` fakat çalışan landing yok | “Benim sonumu geçebilir misin?” | Share→click→install | Paylaşım alıcıya değer vermiyor |

### Somut tanımlar

- **Time to Value:** kurulumdan ilk seçimin görünür sonucuna kadar; hedef <90 saniye.
- **Aha Moment:** oyuncunun önceki seçiminin beklenmedik ama adil biçimde 2–5 tur sonra geri döndüğünü görmesi.
- **Activation Event:** ilk oturumda 3 anlamlı seçim + en az 1 gecikmeli sonuç + yaş 3/ilk bölüm sonu.
- **Retention Loop:** açık cliffhanger → dönüş → sonuç → ending/galeri ilerlemesi → yeni run/challenge.
- **Habit Trigger:** günlük ödül değil; çözülmemiş hikâye ve arkadaş challenge’ı.
- **Paywall Moment:** ilk run tamamlandıktan ve ikinci run isteği doğduktan sonra.
- **Referral Trigger:** güçlü/komik/pişmanlık içeren ending kartı ve aynı seed’e meydan okuma.

### UX sorunları

| Önem | Sorun | Çözüm | Etki |
|---|---|---|---|
| Kritik | Geçerli ürün screenshot kanıtı yok; mevcut QA PNG’leri bozuk biçimde | 360×800, 412×915 ve font scale 1.0/1.3 cihaz matrisi; gerçek kanıt paketini CI/QA artefact olarak sakla | Yayın güveni ve store CVR |
| Yüksek | Onboarding + zorunlu karakter formu ilk değeri geciktiriyor | “Rastgele başla”yı birincil CTA; detayları ilk run sonrası düzenle | Activation |
| Yüksek | Notification izni uygulama açılışında isteniyor | İlk cliffhanger oluştuğunda bağlamsal izin iste | Güven/izin dönüşümü |
| Yüksek | Seçim sistemleri çok, zihinsel model dağınık | Oyuncuya tek “Yazgı İzi” zaman çizelgesi göster; alt sistemleri arka planda tut | Anlama/retention |
| Yüksek | Web önizlemesi AdMob importunda kırılıyor | `consentService.native.ts` / `.web.ts` ayrımı veya lazy native require | Test/landing/demo |
| Orta | Beş ana tab ve yoğun modallar | İlk 10 dakikada yalnız Hayat + Karakter; diğer sekmeleri kademeli aç | Bilişsel yük |
| Orta | Quick Play formu atlamıyor | Tam rastgele karakterle tek dokunuş | Activation |
| Orta | Premium ayarlara gömülü ve ürün değeri karışık | Soft launch boyunca kapat; daha sonra run sonu bağlamlı teklif | Monetizasyon |
| Orta | Erişilebilirlik otomasyona dayanıyor | TalkBack, font scaling, contrast, touch target cihaz testi | Erişilebilirlik |

Görsel hiyerarşi/profesyonel görünüm hakkında güven düşüktür; kodda tema/kontrast/touch target özeni var, fakat geçerli ekran görüntüsü veya canlı mobil cihaz incelemesi yoktur.

---

## 8. Aktivasyon ve retention

| Retention türü | Mevcut güç | Karar |
|---|---|---|
| İçerik | Orta: 418 runtime olay | Hacim değil, sonuç zinciri kalitesi artırılmalı. |
| Fayda | Düşük: eğlence ürünü | Zorla günlük fayda yaratma. |
| Veri birikimi | Orta: ending/legacy/save | Galeri ve seçim izi görünür yapılmalı. |
| Sosyal | Düşük | Async seed challenge eklenebilir; leaderboard şimdilik yok. |
| İlerleme | Orta: achievement/legacy | 68 achievement yerine anlamlı 12–20 koleksiyon. |
| Kişiselleştirme | Orta-yüksek | Sistemler sade bir profil/epilogda birleşmeli. |
| Alışkanlık | Düşük | Günlük ödül yerine doğal açık hikâye döngüsü. |
| Bildirim | Düşük/erken | Yalnız bekleyen sonuç veya haftalık challenge. |

**Doğal ritim:** günlük zorunluluk değil, haftada 1–3 run veya arkadaş challenge’ı. İlk run 15–25 dakika hedeflenmeli; 45–60 dakika ancak kullanıcı verisi doğrularsa korunmalı.

### Retention eşikleri

- İlk anlamlı seçime ulaşma: ≥%75.
- Activation: ≥%50 (3 seçim + 1 echo + ilk bölüm).
- İlk run tamamlama: ≥%35.
- 7 gün içinde ikinci run: ≥%20.
- D1: soft launch karar eşiği ≥%25; D7 ≥%10. Bunlar kesin endüstri standardı değil, bu ürün için başlangıç kapısıdır.
- Activated cohort D7, tüm cohort’tan en az 1,5× yüksek olmalı; değilse activation tanımı yanlış.

---

## 9. Monetizasyon

### Mevcut gerçek

- `monetization.ts` ad-only olduğunu söylüyor; purchase fonksiyonu bilerek başarısız.
- `subscriptionManager.ts` aylık $2,99 ve yıllık $19,99 RevenueCat aboneliği tanımlıyor.
- `PREMIUM_SUBSCRIPTION=true`; Android anahtarları/AdMob kimlikleri var, iOS placeholder.
- Contextual rewarded placements: exam prep, energy depleted, crisis recovery, ending alternative, undo choice.
- `GameOverScreen` yeni `legacy_bonus` yerleşimini çağırıyor; tür union’ında yok ve typecheck’i kırıyor.
- Günlük rewarded limit 8, interstitial oturum limiti 2 ve cooldown 3 dakika.

### Kullanıcı neye para öder?

Reklam izlememeye, daha fazla meaningful storyline/ending erişimine ve run’larını daha rahat karşılaştırmaya ödeyebilir. Stat avantajı veya “iyi kader satın alma” oyunun temel adaletini bozar. Abonelik için her ay yeni değer gerekir; tek geliştirici için bu live-ops yükü tehlikelidir.

### Üç model

| Model | Teklif | Avantaj | Risk | Uygunluk |
|---|---|---|---|---|
| **Güvenli** | Ücretsiz + yalnız bağlamsal rewarded; interstitial yok/çok seyrek | En düşük operasyon, retention ölçümü temiz | Gelir düşük | İlk 300–1.000 kullanıcı |
| **Dengeli (önerilen sonra)** | Ücretsiz + rewarded + tek seferlik “Reklamsız & Destekçi” + ücretli hikâye paketi | Abonelik baskısı yok, somut değer | İçerik paketi üretimi | D7 ve ikinci run doğrulandıktan sonra |
| **Agresif** | Aylık/yıllık premium + interstitial + düzenli exclusive event | LTV potansiyeli | Churn, içerik/live-ops yükü, güven kaybı | Ancak MAU, D30 ve aylık içerik kapasitesi kanıtlanırsa |

**Karar:** Soft launch’ta güvenli model. Aboneliği kapat. İlk fiyat testi tek seferlik reklamsız ürün için üç lokal fiyat noktasıyla yapılmalı; gerçek fiyatlar Play Console yerel fiyatlandırması ve kullanıcı araştırmasıyla belirlenmeli.

Ücretsiz/ücretli sınırı: temel olaylar, sonlar ve adil seçim sonuçları ücretsiz; ücretli olan rahatlık, reklamsız deneyim, kozmetik sunum ve genişletme paketi olmalı.

---

## 10. Pazar ve rekabet

Google Play, Temmuz 2026’da BitLife için 50M+ indirme ve 1,3M yorum; AltLife için 1M+ indirme ve 81,7K yorum; Another Life için 500K+ indirme ve 5K yorum gösteriyor. Üçü de reklam ve IAP kullanıyor. Bu, kategorinin varlığını kanıtlar; aynı zamanda “Türkçe BitLife” konumunun tek başına zayıf olduğunu gösterir.

| Alternatif | Değer | Güçlü | Zayıf | Yazgı neden kazanır? | Geçme ihtimali |
|---|---|---|---|---|---|
| BitLife | Doğumdan ölüme dev sandbox | 50M+, içerik/marka/live-ops | Ağır monetizasyon, yerel derinlik sınırlı | Türkiye ergenliği ve kısa dramatik run | Genel ölçekte çok düşük; nişte orta |
| AltLife | Derin life-sim, ilişkiler/yatırım/nesiller | 1M+, 4,5 puan, geniş sistem | Karmaşıklık, reklam/IAP | Daha odaklı, kültürel ve kısa | Düşük-orta |
| Another Life | Basit, erişilebilir life-sim | 500K+, ücretsiz | 3,3 puan, kalite algısı | Daha tutarlı hikâye ve polish | Orta |
| Choices/Episode | Yüksek üretim değerli interaktif hikâye | Sanat, romantik içerik, güçlü UA | Önceden yazılı, daha az sistemik | Sistemik kişilik/sonuç | Düşük-orta |
| Kişilik testleri/TikTok | Anında kimlik sonucu | Sıfır efor, viral | Sığ, kalıcılık yok | Daha derin ve tekrar oynanır | Orta |
| Hiçbir şey yapmama | Zaman/depoma alanı harcamamak | Sürtünmesiz | Deneyim yok | İlk 60 saniyede merak | En büyük rakip |

### Farklılaşma haritası

- **Kolay kopyalanır:** Türkçe dil, koyu tema, stat barları, achievement, share card.
- **Zor kopyalanabilir:** iyi yazılmış Türkiye çocukluk/ergenlik veri seti; seçim→sonuç grafiği; gerçek oyuncu davranışından öğrenen dengeli içerik; yerel yaratıcı topluluk.
- **Teknik avantaj:** EventBuilder/validation, test ve simülasyon altyapısı; fakat kullanıcıya görünmez.
- **Veri avantajı:** Şu an yok; analytics varsayılan kapalı ve canlı veri yok.
- **Dağıtım avantajı:** Yok.
- **Marka/topluluk:** Yok veya kanıtlanmadı.
- **Alışkanlık:** Ending/legacy potansiyeli var; kanıtlanmadı.
- **Avantaj olmayan ifade:** “500+ olay”, “47 son”, “Türkçe”, “her karar önemlidir” — kod/kanıtla desteklenmedikçe pazarlama sözüdür.

**Neden bu ürün?** Bugünkü cevap: “Türkçe BitLife, yalnız 18’e kadar.” Yeterli değil. Hedef cevap: **“Türkiye’de büyümenin seçimlerini 20 dakikalık bir hayat hikâyesine dönüştüren ve kararlarını yıllar sonra yüzüne vuran oyun.”**

Kaynaklar: [BitLife Google Play](https://play.google.com/store/apps/details?id=com.candywriter.bitlife), [AltLife Google Play](https://play.google.com/store/apps/details?id=com.QmzApps.LifeStory), [Another Life Google Play](https://play.google.com/store/apps/details?id=com.anotherlife.lifesimulator), [Türkiye Gaming Ecosystem 2025](https://www.invest.gov.tr/en/library/publications/lists/investpublications/the-state-of-turkish-gaming-ecosystem-2025.pdf?download=).

---

## 11. Dağıtım ve büyüme

Puan: 1 zayıf/zor/pahalı, 5 güçlü/kolay/ucuz. “Maliyet” ve “operasyon” sütununda 5 daha avantajlıdır.

| Kanal | Uyum | Maliyet | Operasyon | Organik | Ölçek | Hız | Tek kişi |
|---|---:|---:|---:|---:|---:|---:|---:|
| ASO | 4 | 5 | 4 | 3 | 3 | 3 | 5 |
| TikTok | 5 | 4 | 2 | 5 | 5 | 4 | 3 |
| Instagram Reels | 4 | 4 | 2 | 4 | 4 | 3 | 3 |
| YouTube Shorts | 4 | 4 | 3 | 4 | 4 | 3 | 3 |
| Reddit | 2 | 5 | 3 | 2 | 2 | 3 | 4 |
| Discord | 3 | 5 | 2 | 3 | 2 | 2 | 3 |
| X | 2 | 5 | 3 | 2 | 2 | 2 | 4 |
| LinkedIn | 1 | 5 | 4 | 1 | 1 | 2 | 5 |
| Influencer | 5 | 2 | 3 | 4 | 4 | 4 | 3 |
| Affiliate | 2 | 3 | 2 | 2 | 3 | 2 | 2 |
| Topluluklar | 4 | 5 | 3 | 3 | 2 | 3 | 4 |
| Ürün içi paylaşım | 5 | 5 | 4 | 5 | 5 | 3 | 5 |
| Referral ödülü | 2 | 4 | 3 | 2 | 3 | 2 | 4 |
| UGC | 5 | 5 | 2 | 5 | 5 | 3 | 3 |
| Ücretli reklam | 4 | 1 | 4 | 1 | 5 | 5 | 3 |
| Ortaklık | 3 | 4 | 2 | 3 | 3 | 2 | 2 |
| App Store/Play vitrini | 3 | 5 | 4 | 4 | 4 | 1 | 4 |
| İçerik pazarlaması | 3 | 4 | 2 | 4 | 3 | 1 | 3 |
| Programatik SEO | 1 | 2 | 1 | 3 | 4 | 1 | 1 |
| Entegrasyon pazarı/B2B satış | 1 | 2 | 1 | 1 | 1 | 1 | 1 |

### İlk üç kanal ve 30 günlük deney

1. **Kısa video kreatifleri (TikTok/Reels/Shorts)**
   - 12 video: 4 okul/aile ikilemi, 4 “seçimin 5 yıl sonra döndü” sonucu, 4 ending karşılaştırması.
   - Haftada 3; CTA: “Kapalı teste katıl / aynı seçimi sen yapar mıydın?”
   - Başarı: organik video başına ≥5.000 görüntüleme veya profile CTR ≥%1,5; waitlist dönüşümü ≥%15.
   - Başarısızlık: 12 videoda toplam <10.000 nitelikli görüntüleme ve <50 waitlist; mesajı/segmenti değiştir.

2. **ASO + mağaza sayfası testi**
   - Gerçek 5 screenshot, 15 saniyelik video, iki kısa açıklama varyantı: “Türkçe life sim” vs “seçimlerin yıllar sonra döner.”
   - CTA install/closed test.
   - Başarı: nitelikli store listing visitor→install ≥%25; uninstall/ilk 10 dk dengesi ayrıca izlenir.
   - Başarısızlık: < %15; ürün görseli/mesajı veya kategori niyeti yanlış.

3. **Ürün içi run card + seed challenge**
   - Kart: ending, bir kritik seçim, QR/deep link, “Aynı kaderi geç.”
   - Başarı: bitirenlerin ≥%8’i paylaşır; paylaşılan link CTR ≥%10; click→first choice ≥%30.
   - Başarısızlık: share < %3; ödül değil kartın kimlik/eğlence değerini değiştir.

Ücretli UA, activation ve D7 kanıtlanmadan ölçeklenmemeli.

### Viral döngüler

**Döngü A — “Aynı Yazgı” challenge**

1. Oyuncu run’ı bitirir.
2. Ending + dönüm noktası + seed/deep link kartı üretir.
3. Sonucu komik, şaşırtıcı veya kimlik göstergesi olduğu için paylaşır.
4. Arkadaş “aynı koşullarda daha iyi son yapabilir miyim?” diye tıklar.
5. Yeni kişi kayıt olmadan aynı başlangıç koşullarında ilk seçimi yapar.
6. Kendi kartını üretip yeniden paylaşır.
7. Risk: seed manipülasyonu/spam; günlük challenge limiti, kişisel veri içermeyen kart ve raporlama gerekir.

**Döngü B — İkilem oylaması**

1. Oyuncu zor bir seçim ekranında sonucu açıklamadan ikilemi paylaşır.
2. Kart iki seçeneği ve anonim oy bağlantısını üretir.
3. Sosyal doğrulama/merak için paylaşılır.
4. Alıcı oy verir ve topluluk dağılımını görür.
5. Sonucu görmek için mini web demo veya uygulamada ilgili kısa sahneyi oynar.
6. Haftalık yerel ikilemler döngüyü yeniler.
7. Risk: hassas çocukluk temaları ve kullanıcı adları; moderasyonsuz serbest metin olmamalı.

“Arkadaş davet et, puan kazan” tek başına önerilmez; mevcut legacy puanı reklamla/davetle şişirmek oyun bütünlüğünü zedeler.

---

## 12. Teknik analiz

### Mimari özeti

- 291 TS/TSX dosyası, yaklaşık 98.148 satır; 83 component, 49 util, 32 data, 22 hook.
- Game/UI/Meta context’leri, event builder/registry, save manager, analytics, monetizasyon ve feature flag katmanları ayrılmış.
- Güçlü test yüzeyi: 105 suite, 1.231 pass, 1 skip; statement %75,48, branch %66,08.
- Olumlu: strict TypeScript, zod doğrulama, save checksum/migration, Remote Config kill switch, contextual ad limiti, event ve Monte Carlo testleri.
- Olumsuz: ürün yüzeyi tek geliştirici için geniş; `GameScreen` 800+ satır, `endingResolver` 1.800+ satır, SaveManager 1.500+ satır; iki monetizasyon gerçeği ve ölü cloud sync yüzeyi var.

| Sorun | Etki | Olasılık | Önem | Önerilen çözüm | Efor |
|---|---|---:|---|---|---|
| `GameOverScreen` typecheck kırık (`currency`, `legacy_bonus`) | Release/build güveni | Kesin | Kritik | Ya placement’i union/config’e güvenli ekle ya legacy reklamını kaldır; öneri kaldırmak | S |
| Production audit: `protobufjs`, `shell-quote`, `websocket-driver` kritik; çok sayıda high | Güvenlik/release gate | Kesin | Kritik | Bağımlılık ağacını çıkar, düzeltilebilir yama; yalnız erişilemeyen transitive riskleri süreli allowlist | M–L |
| 31 Ağustos 2026’dan itibaren yeni/update uygulama API 36 istemi; proje 35 | Store gönderimi bloke olabilir | Çok yüksek | Kritik | Expo/RN uyumluluğuyla targetSdk 36 migration ve cihaz regresyonu | M |
| Expo Doctor 8 patch mismatch | Build/runtime belirsizliği | Yüksek | Yüksek | `expo install --check/fix`, lockfile, tam test | S–M |
| Web bundling native AdMob importunda kırık | Demo/test/README iddiası | Kesin | Orta | Platform dosyaları veya lazy require | S |
| QA PNG dosyaları PNG magic header değil (UTF-16 benzeri bozuk veri) | Release kanıtı yok | Kesin | Yüksek | Gerçek binary artefact ve checksum’lı CI upload | S |
| Ad-only + RevenueCat iki paralel akış | Hata, destek, ürün belirsizliği | Yüksek | Yüksek | Soft launch için tek monetizasyon mimarisi | M |
| Analytics opt-in varsayılan kapalı, görünür ilk-run talebi yok | Ürün karar veremez | Yüksek | Kritik ticari | İlk-run şeffaf analitik onayı; reddeden için cihaz içi aggregate diagnostics | M |
| Cloud sync kodu var, backend klasörü yok; script bozuk hedefe bakıyor | Bakım/yanlış güven | Yüksek | Orta | P0 dışıysa kodu ve scripti kaldır/izole et | S–M |
| Jest `.claude/worktrees` package collision uyarısı | Test determinismi | Orta | Orta | `modulePathIgnorePatterns`/worktree exclude | S |
| Conditional outcome runtime 0, future choices %3,48 | Ürün vaadi gerçekleşmiyor | Kesin | Kritik ürün | Seçilmiş 20 olayda elle tasarlanmış sonuç grafiği; metrikle doğrula | L |
| 98K satır/çoklu sistemler | Tek kişi bakım ve yorgunluk | Yüksek | Yüksek | Feature freeze, P0 kesme çizgisi, dead-code removal | M |

### Yayından önce

1. Typecheck, test, lint, production audit ve Expo Doctor yeşil.
2. Target API 36 migration (31 Ağustos 2026 öncesinde planlanmalı).
3. Gerçek Android AAB: düşük/orta sınıf iki cihazda fresh install, offline, background, save/load, reklam no-fill, consent, purchase kapalı akış.
4. Bozuk QA kanıtlarını gerçek screenshot/video ile değiştir.
5. Store metnini 418 olay/35 son veya yayın build’inin gerçek sayılarıyla eşitle.
6. Gizlilik/Data Safety/Terms’i gerçek SDK ve veri akışlarıyla eşleştir.

### İlk 1.000 kullanıcıdan önce

- Remote kill-switch test, crash-free sessions dashboard, event schema versioning.
- Activation/echo/run completion/second run cohort’ları.
- Ad frequency ve no-fill telemetry; paywall ancak sonra.
- Save corruption rate ve otomatik recovery görünürlüğü.

### Büyüme görülmeden yapılmaması gerekenler

- Backend/cloud sync, leaderboard, gerçek zamanlı sosyal sistem.
- Daha fazla generic event; önce mevcut 20 kritik zincirin kalitesi.
- Büyük state management/mimari rewrite.
- iOS/global İngilizce lansman.
- Sezonluk iki haftada bir içerik ve battle pass.

### Kurucu ve uygulama gerçekliği

Ekip, bütçe ve haftalık zaman verilmedi. Eski roadmap’in 2 geliştirici + 0,5 QA kabulü doğrulanmış kapasite değildir; bu nedenle plan tek kişi/küçük ekip stresine göre değerlendirildi.

- **Tek kişi için fazla büyük alanlar:** iki platform + web, iki dilde yüzlerce olay, abonelik/live-ops, cloud backend, düzenli sosyal içerik ve kullanıcı desteğini aynı anda yürütmek.
- **Otomatikleştirilecek işler:** release gate, event graph/tutarlılık denetimi, screenshot boyut/PNG imza kontrolü, store claim sayacı, localization parity, crash/save dashboard.
- **Dış destek gerektiren işler:** 16 yaş altı/reklam/KVKK-GDPR hukuk incelemesi; Play Store görsel kreatifleri; en az bir gerçek Android cihaz matrisi ve erişilebilirlik QA’sı.
- **Şimdilik kaldırılacak operasyon:** iki haftalık içerik takvimi, iOS release, abonelik müşteri desteği, cloud sync operasyonu, leaderboard moderasyonu.
- **Kurucunun en yüksek kaldıraçlı işi:** kullanıcı görüşmesi ve oynanış gözlemi; consequence-chain yazımı; kreatif mesaj testleri; cohort kararları. Yeni altyapı yazmak değil.
- **Yorgunluk sinyali:** üç hafta üst üste P0 dışı feature commit’i, tester görüşmesi yapılmaması veya içerik başına sürenin artması. Bu durumda otomatik scope freeze uygulanmalı.

---

## 13. Güven, etik ve yasal riskler

Bu bölüm hukuk görüşü değildir; Play Console ve KVKK/GDPR uzmanı ile doğrulanmalıdır.

| Risk kaynağı | Muhtemel sonuç | Öncelik | Azaltma |
|---|---|---|---|
| 13+ kitle, reklam kimliği ve davranış analitiği | Çocuk/genç verisi ve hedefleme riski | Kritik | Beachhead 16+, yaş kapısı/içerik derecelendirme, çocuklara kişiselleştirilmiş reklam kapalı, uzman incelemesi |
| UMP yalnız EEA/UK/İsviçre mantığı; EEA dışı form yoksa personalized=true | Türkiye/KVKK için yetersiz açık rıza ihtimali | Yüksek | Bölgeye göre yasal dayanak; varsayılan non-personalized; açık ve geri alınabilir tercih |
| Analytics ve Crashlytics “anonim” deniyor | Firebase installation/ad ID kişisel veri sayılabilir; 10 karaktere kırpmak anonimleştirme değildir | Yüksek | “Anonim” ifadesini kaldır; pseudonymous de; veri envanteri ve retention süresi |
| Privacy: oyun verisi yalnız cihazda; ancak analytics, crash, ad ve RevenueCat akışı var | Yanıltıcı aydınlatma | Yüksek | Yerel save ile üçüncü taraf telemetriyi net ayır |
| Terms: “dijital içerik teslim edilince iade edilemez” | Google Play politika/yerel tüketici hukuku ile fazla kesin çelişki | Yüksek | “Google Play ve uygulanabilir hukuk uyarınca” diye düzelt; 48 saat/sonrası sürecine link |
| Data Safety formu yok/kanıt yok | Store reddi veya yanlış beyan | Kritik | SDK bazlı veri türleri: device ID, app activity, crash log, purchase, advertising; Play formuyla eşleştir |
| Hassas ergenlik/travma/aile olayları | Psikolojik zarar, içerik derecelendirme | Orta-yüksek | Content warnings, kriz kaynakları, romantik/şiddet/bağımlılık tema matrisi |
| Rewarded ad ile undo/zeka/enerji | Manipülatif/pay-to-win algısı | Orta | Yalnız optional recovery; temel seçim sonucu/ending satılmamalı |
| Kullanıcının gerçek ad/soyad/şehir girmesi | Cihaz/save/screenshot üzerinden kişisel veri | Yüksek | Varsayılan takma ad/rastgele şehir; gerçek veri isteme |
| Share card | Gerçek isim/kişisel hikâye istemeden paylaşılabilir | Yüksek | Önizleme, varsayılan takma ad, tek tık PII kaldırma |
| API/SDK ve telif | icons, ses, metin ve mağaza politikası riski | Orta | Asset lisans envanteri ve provenance |

Google Play tüm geliştiricilerden Data Safety beyanı ister; Firebase installation ID, reklam kimliği, app activity ve crash log gibi kalemler ayrı beyan edilmelidir. Google’ın EEA/UK/İsviçre reklam politikasında gerekli açıklama ve onay açıkça istenir. 31 Ağustos 2026 itibarıyla yeni uygulama ve güncellemeler API 36 hedeflemelidir. Kaynaklar: [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469), [AdMob consent](https://support.google.com/admob/answer/7666519), [Target API](https://support.google.com/googleplay/android-developer/answer/11926878?hl=tr), [Google Play refund](https://support.google.com/googleplay/answer/15574908), [KVKK mobil uygulama rehberi](https://www.kvkk.gov.tr/SharedFolderServer/CMSFiles/8ba209bb-fa93-4479-84f0-dd55aac97a0f.pdf).

---

## 14. Başarı puan kartı

| Kategori | Puan | Gerekçe | En büyük risk | Puanı artıran tek aksiyon |
|---|---:|---|---|---|
| Problem gücü (10) | **6** | Kanıtlı eğlence kategorisi; acil problem değil | Dikkat rekabeti | Yerel ergenlik “echo” vaadini 20 görüşmede doğrula |
| Hedef kullanıcı netliği (7) | **5** | 16–35 tanımlı ama geniş | 13–35 tek ürün | 16–24 beachhead |
| Değer önerisi (10) | **6** | Yerel 0–18 odağı ayırt edebilir | Yalnız “Türkçe BitLife” kalması | Seçimlerin gecikmeli geri dönüşü |
| Ürün kalitesi/kullanım (8) | **5** | Güçlü test/code; görsel kanıt yok, form yoğun | İlk dakika sürtünmesi | Tek dokunuş rastgele başlangıç |
| İlk değer/aktivasyon (7) | **4** | Onboarding demosu var | Gerçek aha geç | <90 sn ilk echo prototipi |
| Retention (10) | **5** | Ending/legacy potansiyeli | Dallanma zayıf, run uzun | İkinci run challenge loop |
| Monetizasyon (10) | **3** | Reklam altyapısı var | İki çelişkili model, veri yok | Ad-only soft launch + fiyat testi |
| Pazar/rekabet (8) | **3** | Kategori büyük | Dev incumbent, moat yok | Türkiye adolescence data/narrative moat |
| Dağıtım (12) | **2** | Plan/asset/traction yok | Kimse ürünü görmez | 12 kreatif + ASO closed-test deneyi |
| Viral/organik (5) | **2** | Run card var | Alıcı için neden yok | Seed challenge deep link |
| Teknik sağlamlık (5) | **3** | Testler güçlü | Typecheck/audit/API36 | Release kapılarını tam yeşil yap |
| Küçük ekip uygulanabilirlik (5) | **3** | Local-first mimari | 98K satır/live-ops | Feature freeze + scope cut |
| Savunulabilirlik (3) | **1** | Lokalizasyon kopyalanır | Veri/topluluk yok | Yerel consequence graph + topluluk |
| **Toplam** | **48/100** | **Belirli koşullarda çalışabilir; temel sorunlar var** |  |  |

---

## 15. Başarı olasılığı ve senaryolar

“Başarı” tanımları aşağıda ayrıdır; aralıklar istatistiksel model değil, ürün/teknik kanıta dayalı karar aralıklarıdır.

| Seviye | Olasılık | Aralık | Varsayım/koşul | Başarısızlık | Güven |
|---|---|---:|---|---|---|
| 1. Kullanılabilir ürün tamamlanır | Orta-yüksek | **%70–85** | Release gate, API36, cihaz QA çözülür | Scope büyümesi, audit/build gecikmesi | Orta |
| 2. İlk 100 gerçek kullanıcı | Orta | **%45–65** | Kapalı test topluluğu ve 12 kreatif | Dağıtım yapılmaması | Düşük-orta |
| 3. Erken traction | Düşük | **%15–30** | D1≥25, D7≥10, ikinci run≥20 | Sahte seçim hissi, düşük store CVR | Düşük |
| 4. Küçük sürdürülebilir iş | Düşük | **%8–18** | Organik pay ≥%50, düşük destek/live-ops, ARPDAU gideri karşılar | Türkiye eCPM/LTV ve içerik maliyeti | Düşük |
| 5. Büyük ticari başarı | Çok düşük | **%1–5** | Globalleşebilir motif, güçlü viral loop, ekip/sermaye | BitLife ölçeği, UA maliyeti, zayıf moat | Çok düşük |

### Kötümser

Ürün teknik kapıları düzeltmeden çıkar; mağaza vaatleri kullanıcıda güvensizlik yaratır. İlk kullanıcılar form/onboarding’de kaçar, kalanlar seçimlerin çoğunun yalnız stat değiştirdiğini fark eder. D1 <%15, ikinci run <%8 olur. Reklamlar erken eklenir, yorumlar düşer; proje içerik üretim yükü altında 3–6 ayda donar.

### Gerçekçi

Android kapalı testte 100–300 kullanıcıya ulaşır. İlk run’ı seven küçük bir niş oluşur; organik videolardan bazıları çalışır. D1 %20–30, D7 %7–12, ikinci run %12–22 bandında kalır. Ürün 0–18 Türkiye ergenlik simülasyonuna daralır, 20 güçlü consequence chain ve tek seferlik reklamsız ürünle küçük ama henüz sürdürülebilir olmayan bir indie oyun olur.

### İyimser

“Seçimin yıllar sonra geri döndü” videoları format olarak tutar; run card challenge gerçek bir acquisition loop’una dönüşür. D1 >%35, D7 >%15, ikinci run >%30; share→install zinciri ölçülebilir olur. Türkiye içeriği veri avantajına, sonra farklı ülke “growing up” paketlerine dönüşür. Bu durumda 10K–100K MAU ve küçük ekip için anlamlı gelir mümkün olur; büyük başarı için yine yayıncılık/UA ve içerik ekibi gerekir.

---

## 16. En kritik 10 risk

| # | Risk | Olasılık | Etki | Erken sinyal | Önleme |
|---:|---|---|---|---|---|
| 1 | Seçimlerin gerçek sonuç üretmemesi | Yüksek | Kritik | Echo seen düşük; yorumlarda “seçimler önemsiz” | 20 elle tasarlanmış zincir, echo metriği |
| 2 | Dağıtım planı/asset yokluğu | Yüksek | Kritik | Store impression ve waitlist yok | 30 günlük kreatif+ASO testi |
| 3 | Hedef kitlenin genişliği | Yüksek | Yüksek | Kreatif mesajları dağınık | 16–24 beachhead |
| 4 | Düşük retention | Yüksek | Kritik | D1<20, 2nd run<15 | Run süresi/echo/cliffhanger |
| 5 | Kimsenin ödeme yapmaması / eCPM yetersizliği | Yüksek | Yüksek | ARPDAU giderden düşük | İlk önce ad-only ekonomi testi |
| 6 | Feature creep ve kurucu yorgunluğu | Yüksek | Yüksek | P0 dışı commit, artan açık sistem | 6 haftalık freeze, Won’t listesi |
| 7 | Release gate/API36/store riski | Yüksek | Kritik | Typecheck/audit/Doctor kırık | P0 teknik sprint |
| 8 | Rakiplerin yerelleştirmeyi kopyalaması | Orta | Yüksek | Rakipte Türkçe/yerel içerik | Derin yerel consequence dataset |
| 9 | Reklam/çocuk/gizlilik yanlış beyanı | Orta-yüksek | Kritik | Policy warning, consent düşüşü | 16+, privacy/Data Safety audit |
| 10 | Yanlış metrik: event sayısı/test sayısı | Yüksek | Yüksek | 418 olaya rağmen echo/retention yok | North Star ve cohort karar kapıları |

---

## 17. Geliştirme önerileri

### Ürün — “Yazgı İzi” consequence timeline

- **Mevcut problem:** Seçimlerin çoğu yalnız stat değiştiriyor.
- **Değişiklik:** Seçilmiş 20 olay için 2–5 tur ve bölüm sonunda geri dönen sonuç; UI’da “8 yaşındaki seçimin geri döndü” etiketi.
- **Kullanıcı/iş etkisi:** Aha, retention, farklılaşma ve paylaşım; yüksek.
- **Uygulama:** `futureEvents/reqEventIds` grafiği, deterministic test, `echo_seen` analytics.
- **Efor:** Yüksek. **Risk:** içerik tutarlılığı.
- **Başarı:** activated cohort D7 ve ikinci run’da ≥%25 göreli artış.
- **Öncelik:** P0. **Yapılmazsa:** ürün BitLife’ın küçük kopyası kalır.

### Ürün — 60 saniyede ilk seçim

- **Problem:** 3 onboarding ekranı + zorunlu ad/soyad/şehir + tooltips.
- **Değişiklik:** Birincil “Rastgele Hayata Başla”; karakter düzenleme opsiyonel; onboarding ilk seçim içine gömülü.
- **Etki:** Activation yüksek; iş etkisi yüksek.
- **Efor:** Orta. **Risk:** kişiselleştirme hissi azalır.
- **Başarı:** install→first choice ≥%75, median TTV <90 sn.
- **Öncelik:** P0.

### Ürün — Meta sistemleri tek profile indir

- **Problem:** trait/momentum/scar/memory/fate/goal/legacy zihinsel yükü.
- **Değişiklik:** Oyuncuya “Karakterin” ve “Yazgı İzleri” olmak üzere iki yüz; motorlar arka planda.
- **Etki:** Anlama/retention orta-yüksek.
- **Efor:** Orta. **Başarı:** tutorial/help açma düşer, activation artar.
- **Öncelik:** P1.

### Büyüme — Seed challenge deep link

- **Problem:** Share card yalnız görsel; alıcı için eylem yok.
- **Değişiklik:** Aynı başlangıç seed’i ve mini landing/demo.
- **Etki:** Referral yüksek.
- **Efor:** Orta-yüksek. **Risk:** web build/deep link.
- **Başarı:** share→click ≥%10, click→first choice ≥%30.
- **Öncelik:** P1, activation sonrası.

### Büyüme — 12 kreatif mesaj testi

- **Problem:** Dağıtım kanıtı yok.
- **Değişiklik:** 3 hook × 4 video; waitlist/store CTA.
- **Etki:** Hedef/mesaj öğrenimi yüksek.
- **Efor:** Orta. **Başarı:** ≥50 nitelikli tester veya hook başına CTR farkı.
- **Öncelik:** P0; koddan önce/yanında.

### Gelir — Tek monetizasyon gerçeği

- **Problem:** Ad-only servis ve premium subscription çatışıyor.
- **Değişiklik:** Soft launch’ta subscription/purchase kapalı; yalnız contextual rewarded. D7 sonrası tek seferlik reklamsız fiyat testi.
- **Etki:** Güven/ölçüm yüksek.
- **Efor:** Düşük-orta. **Başarı:** reklam izleme, churn ve ARPDAU dengesi.
- **Öncelik:** P0.

### Teknik — Release truth gate

- **Problem:** Belgeler GO derken typecheck/audit/Doctor kırık ve QA görselleri bozuk.
- **Değişiklik:** Tek `release:gate` komutu: typecheck, lint, tests, audit, doctor, design audit, AAB metadata; gerçek artefact.
- **Etki:** Teknik/yayın yüksek.
- **Efor:** Orta. **Başarı:** main branch her committe yeşil; bozuk kanıt yok.
- **Öncelik:** P0.

### Teknik/yasal — Consent ve telemetry sözleşmesi

- **Problem:** Analytics varsayılan kapalı; kişiselleştirilmiş reklam durumu startup’ta yeniden yazılıyor; privacy ifadeleri kesin değil.
- **Değişiklik:** İlk-run şeffaf tercih, non-personalized default, reset/delete, event schema ve Data Safety matrisi.
- **Etki:** Öğrenme/güven kritik.
- **Efor:** Orta. **Başarı:** geçerli consent state, ölçülebilir opt-in, sıfır politika uyarısı.
- **Öncelik:** P0.

---

## 18. Önceliklendirilmiş yol haritası

Formül görecelidir: `Etki × Güven ÷ Efor`; 1–5 ölçeğinde, yüksek skor kesin getiri değildir.

| Öneri | Etki | Efor | Güven | Skor | Zamanlama |
|---|---:|---:|---:|---:|---|
| Typecheck `legacy_bonus` düzelt/kaldır | 5 | 1 | 5 | 25,0 | Hemen |
| Store iddialarını gerçek sayıya çek | 4 | 1 | 5 | 20,0 | Hemen |
| 60 saniyede ilk seçim | 5 | 2 | 4 | 10,0 | Yayından önce |
| Release truth gate + gerçek QA artefact | 5 | 2 | 4 | 10,0 | Yayından önce |
| 12 kreatif/waitlist testi | 5 | 2 | 4 | 10,0 | Hemen |
| Tek monetizasyon gerçeği | 5 | 2 | 4 | 10,0 | Yayından önce |
| API 36 + Expo patch migration | 5 | 3 | 5 | 8,3 | 31 Ağustos öncesi |
| Audit açıklarını kapat | 5 | 3 | 4 | 6,7 | Yayından önce |
| Consent/telemetry/Data Safety | 5 | 3 | 4 | 6,7 | Yayından önce |
| 20 consequence chain | 5 | 4 | 4 | 5,0 | P0 ürün |
| Meta sistemlerini sadeleştir | 4 | 3 | 3 | 4,0 | İlk kullanıcı verisi sonrası |
| Seed challenge | 4 | 4 | 3 | 3,0 | Retention görülürse |
| İngilizce/global genişleme | 3 | 5 | 1 | 0,6 | Şimdilik yapma |
| Cloud sync/backend | 2 | 5 | 1 | 0,4 | Şimdilik yapma |
| Sezon pass/iki haftalık içerik | 2 | 5 | 1 | 0,4 | Tamamen kaldır/ertelemek |

### MoSCoW ve cut-line

- **P0 / Must:** release gate, API36, doğru store metni, hızlı başlangıç, 20 consequence chain, consent/telemetry, 100–300 tester dağıtımı.
- **P1 / Should:** meta sistem sadeleştirme, ending gallery polish, tek seferlik reklamsız fiyat testi, run card.
- **P2 / Could:** seed challenge, sınırlı yeni içerik, iOS hazırlığı.
- **Won’t (90 gün):** cloud sync/backend, leaderboard, battle/season pass, geniş İngilizce lansman, yeni generic event hacmi.

**Scope cut:** Premium subscription ve cloud sync’i 90 gün çıkar.  
**Scope swap:** 50 yeni olay yerine 20 mevcut olaya gerçek gecikmeli sonuç ve analytics ekle.  
**Gecikmede ilk çıkarılacak:** seed challenge web landing; statik share card kalır.

---

## 19. 30–60–90 günlük plan

### İlk 30 gün — doğrulanabilir kapalı test

| Hafta | Hedef/kapsam | Çıktı | Metrik/karar eşiği | Efor/bağımlılık |
|---|---|---|---|---|
| 1 | Release gate: typecheck, audit triage, Expo patch, API36 spike, bozuk QA kanıtı | Tek gate + Android RC0 | Tüm statik kapılar yeşil | 3,5 gün; Expo/Android |
| 2 | Hızlı başlangıç + analytics consent + funnel | RC1, TTV eventleri | Lokal test median TTV <90 sn | 3,5 gün; UX copy |
| 3 | İlk 10 consequence chain + echo UI | RC2 içerik slice | 10/10 zincir deterministic test | 3,5 gün; narrative QA |
| 4 | 12 kreatif, store A/B, 20 görüşme/30 usability session | Waitlist + kapalı test kararı | ≥50 nitelikli tester, ≥%15 waitlist | 3,5 gün; içerik üretimi |

**Sahiplik:** Hafta 1 kurucu/geliştirici + dış cihaz QA; Hafta 2 geliştirici + UX metin rolü; Hafta 3 narrative tasarım + geliştirici; Hafta 4 kurucu/growth + tester topluluğu. Tek kişi bu rolleri üstleniyorsa aynı hafta içinde paralel teslim varsayılmamalıdır.

**Tek kişi bitiş tahmini:** En iyi 4 hafta; olası 5–6 hafta; audit/API36 veya cihaz QA sorunluysa 7–8 hafta. Dört hafta ancak premium/cloud sync/yeni event scope cut ile mümkündür.

### 31–60 gün — activation ve retention

- 100–300 testerı cohort’lara al; 2–3 build iterasyonu.
- Kalan 10 consequence chain’i en çok kaçılan yaşlara uygula.
- A/B: random quick start vs form; 15–25 vs 30–45 dakikalık run pacing.
- Ad-only frekans testini yalnız activated cohort’ta yap.
- Çıktı: D1/D7, first-run completion, second-run, echo seen raporu.
- Karar: D1 < %20 ve activation < %40 ise monetizasyonu değil core loop’u değiştir; ikinci run < %15 ise yeni içerik yerine run sonucu/yeniden başlama döngüsünü değiştir.

### 61–90 gün — devam/pivot/bırak

- Kazanan kreatif ve ASO mesajını ölçekle.
- D7 ≥%10 ve second run ≥%20 ise tek seferlik reklamsız fiyat testi.
- Referral share→click ölçülüyorsa seed challenge P1.
- 500–1.000 kullanıcıda crash-free session ≥%99,5 ve save failure < %0,5 hedefi.
- Gün 90 kararı: devam/pivot/dondur. Eşikler aşağıdaki 21. bölümde.

---

## 20. Deney, doğrulama ve metrik planı

### En kritik 10 varsayım

| Varsayım | Risk | Test | Örneklem | Başarı | Başarısızsa |
|---|---|---|---:|---|---|
| Türkiye 0–18 teması ilgi çekiyor | Yüksek | 3 hook landing/video | 5K impression/hook | CTR farkı ve ≥%15 waitlist | Mesaj/segment pivot |
| İlk dakika formu gereksiz | Yüksek | Random vs form prototip | 100/kol | First choice +%20 | Formu koru/sadeleştir |
| Gecikmeli sonuç aha yaratıyor | Kritik | 10 kullanıcı think-aloud + A/B | 50/kol | Value rating +1/5, D1 uplift | Consequence sunumunu değiştir |
| 20 dakikalık run daha iyi | Yüksek | Pacing A/B | 100/kol | Completion artar, memnuniyet düşmez | 30–40 dk test |
| İnsanlar ikinci run ister | Kritik | Concierge ending challenge | 100 | 7 günde ≥%20 | Meta loop pivot |
| Yerel olay kalitesi fark yaratır | Yüksek | Kör içerik testi: generic vs local | 40 | Local tercih ≥%65 | Lokalizasyonu moat sayma |
| Share card gerçek paylaşılır | Yüksek | Sahte kapı/share preview | 100 finisher | Share intent ≥%10, actual ≥%5 | Kart/değer önerisi değişir |
| Rewarded ad kabul edilir | Orta | 2 placement A/B | 200 activated | Opt-in ≥%20, churn artmaz | Placement’i kaldır |
| Reklamsız ürüne ödeme var | Yüksek | Fake-door + fiyat testi | 300 paywall view | Intent ≥%3 | Abonelik/IAP ertele |
| Tek kişi içerik sürdürebilir | Kritik | 4 haftalık üretim timesheet | 20 chain | Chain başına ≤4 saat + QA | Procedural değil kapsam daralt |

Yazılım dışı yöntemler: 20 problem görüşmesi, 10 think-aloud prototip testi, concierge “seçimin geri döndü” demosu, waitlist, demo videosu, mağaza sayfası testi ve fake paywall.

### North Star Metric

**Haftalık Anlamlı Yazgı Koşusu (WAYK):** Bir haftada en az 3 anlamlı seçim yapan, 1 gecikmeli sonucu gören ve run’ı bitiren benzersiz oyuncu sayısı.

Bu metrik salt DAU’yu değil ürünün vaat ettiği gerçek değeri ölçer. Manipüle edilmemesi için her seçim değil tamamlanmış nitelikli run sayılır.

| Metrik | Anlam/neden | Ölçüm | Yanıltıcı durum |
|---|---|---|---|
| Acquisition | Nitelikli giriş | source→store→install | Bot/yanlış kreatif |
| Activation | 3 seçim+1 echo+ilk bölüm | Event sequence | Çok kolay yapay activation |
| Time to Value | Install→ilk echo | Timestamp median/P75 | Offline clock |
| D1/D7/D30 | Geri dönüş | Install cohort exact day + rolling | Düşük örneklem, bildirim kampanyası |
| Kullanım sıklığı | Haftalık run/player | Completed run/WAU | Uzun tek run |
| Temel özellik | Echo seen / meaningful choice | Event property | Event’in otomatik tetiklenmesi |
| First-run completion | İlk run’ı bitiren | game_end / first_start | Crash/uninstall ayrımı |
| Second-run 7d | Gerçek replay | 2nd game_start / new players | Reset/QA kullanıcıları |
| Paywall view | Teklif maruziyeti | Context+cohort | Erken zorunlu paywall |
| Free→paid/trial | Ödeme | Receipt-validated purchaser | Sandbox/refund |
| Churn | Abonelik/aktif kayıp | Store status + cohort | Doğal haftalık ritim |
| ARPU/ARPDAU | Gelir verimi | Net revenue/MAU veya DAU | Vergi/platform/eCPM brütü |
| LTV | Yaşam boyu net katkı | Retention×ARPDAU cohort | Erken extrapolation |
| CAC | Nitelikli kullanıcı maliyeti | Spend/activated users | Install CAC’ın ucuz görünmesi |
| Referral | Paylaşım kaynaklı activation | Deep link attribution | Last-click kaybı |
| Organik oran | Ücretsiz edinim | Store/attribution | Dark social |
| Crash-free session | Güven | Crashlytics sessions | Analytics opt-out bias |
| Save failure | İlerleme güveni | Save/load error/session | Sessiz veri kaybı |

Günlük retention tek başına zorlanmamalı; ana karar metriği ikinci run’ın 7 gün içinde başlaması ve WAYK olmalıdır.

---

## 21. Devam, pivot veya bırakma kararı

### Önerilen karar

**2. Ürünü daraltarak devam et.** Genel lansmanı ertele; “genel yaşam simülasyonu” değil, **Türkiye’de çocukluk ve ergenlik seçimlerinin yıllar sonra geri döndüğü 15–25 dakikalık run oyunu** olarak konumlandır.

### Temel neden

Kod ve içerik yatırımı bir prototipi aşmış, bu yüzden bugün bırakmak rasyonel değil. Fakat ticari kanıt sıfıra yakın ve ürün vaadinin çekirdeği (kalıcı/görünür sonuçlar) kodda zayıf. Yeni özellik eklemek riski büyütür; daraltma mevcut varlıkları doğrulanabilir bir ürün hipotezine çevirir.

### Devam koşulları

- 100–300 gerçek tester.
- First choice ≥%75, activation ≥%50, first-run completion ≥%35.
- D1 ≥%25, D7 ≥%10, 7 günde ikinci run ≥%20.
- En az 10 görüşmede “seçimin geri dönmesi” kendiliğinden ana değer olarak ifade edilir.
- Crash-free ≥%99,5 ve release gate tam yeşil.

### Pivot/dondurma/bırakma sinyalleri

- İki farklı onboarding/core-loop iterasyonundan sonra D1 <%20 ve ikinci run <%12.
- 12 kreatif + 3 hook sonunda 50 nitelikli tester bulunamaması.
- Kullanıcıların çoğunun yerel içeriği değil yalnız “BitLife benzeri” olmayı istemesi.
- 20 consequence chain’in tek kişi için sürdürülemez üretim maliyeti yaratması.
- ARPDAU’nun support/content maliyetini karşılamaması ve reklamların retention’ı bozması.

### Sonraki karar tarihi

**En geç 15 Ekim 2026** veya **300 gerçek tester + 200 activated user + en az 100 D7 gözlemi** hangisi önce gelirse.

### En mantıklı pivot

Tam yaşam simülasyonu yerine **haftalık, paylaşılabilir “Türkiye’de büyümek” interaktif ikilem serisi**: 5–10 dakikalık bölüm, güçlü sonuç kartı, daha düşük içerik/teknik operasyon. Eğer uzun run retention üretmez ama ikilem kreatifleri ilgi görürse bu yön daha mantıklıdır.

---

## 22. Sonuç

- **Bu projenin başarılı olmasının en güçlü nedeni:** Türkiye’ye özgü çocukluk/ergenlik kararlarını, seçimlerin yıllar sonra geri döndüğü kısa ve paylaşılabilir bir formata dönüştürebilmesi.
- **Bu projenin başarısız olmasının en muhtemel nedeni:** Özellik ve içerik sayısını ürün değeri sanıp gerçek kullanıcı edinimi, gecikmeli sonuç ve ikinci run retention’ını doğrulamaması.
- **Proje sahibinin şu anda yapmaması gereken şey:** Yeni generic olay, cloud sync, leaderboard, sezon pass veya global İngilizce lansman eklemek.
- **Proje sahibinin önümüzdeki yedi gün içinde yapması gereken şey:** Typecheck/audit/API36 kapı planını kapatmak, mağaza iddialarını düzeltmek ve “rastgele başla + bir seçim 3 tur sonra geri döner” uçtan uca slice’ını 10 kullanıcıyla test etmek.
- **Proje için tek bir özelliği koruyabilseydim bu:** Seçimlerin kişisel run sonucuna bağlandığı event→consequence→ending zinciri.
- **Proje için tek bir şeyi kaldırabilseydim bu:** Retention kanıtı olmadan kurulmuş paralel premium subscription/live-ops yüzeyi.
- **Projenin gerçekçi başarı yolu:** 16–24 Türkçe mobil hikâye oyuncusunda dar beachhead → 20 güçlü consequence chain → 100–300 kişilik soft launch → ikinci run ve paylaşım kanıtı → yalnız çalışan kanala/içeriğe yatırım.
- **Nihai kararım:** **Ürünü daraltarak devam et; bugünkü hâliyle genel lansman yapma.**

---

## Denetim komutları ve kanıt notu

17 Temmuz 2026’da çalıştırılanlar:

- `npm.cmd run lint` → PASS.
- `npm.cmd run test:ci -- --watchAll=false` → 105/105 suite, 1.231 pass, 1 skip; PASS; worktree package collision uyarısı.
- `npm.cmd run typecheck:all` → FAIL; `GameOverScreen.tsx` satır 303/307/312/326.
- `npm.cmd run audit:prod` → FAIL; high/critical non-allowlisted advisory’ler.
- `npm.cmd run doctor` → 16/17; 8 Expo patch mismatch.
- `npm.cmd run release:monetization:check` → Android PASS; bu tek başına ürün release gate değildir.
- `npm.cmd run design:audit:ci` → PASS; 388/418 event, 35/1.005 future choices, 0 conditional outcomes.
- `npm.cmd run simulate:ci` → PASS; yalnız 50 koşu/bot dengesi, gerçek kullanıcı kanıtı değil.
- Expo web preview → FAIL; `consentService.ts` üzerinden `react-native-google-mobile-ads` native import.
- QA evidence PNG’leri → dosya boyutu var ancak geçerli PNG imzası yok; görsel inceleme yapılamadı.

Bu rapor, kod kalitesini ticari başarı yerine koymaz. En önemli eksik veri gerçek kullanıcı davranışıdır.
