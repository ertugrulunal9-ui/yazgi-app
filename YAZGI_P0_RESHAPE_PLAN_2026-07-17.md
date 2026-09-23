# Yazgı P0 Yeniden Şekillendirme Planı

Tarih: 17 Temmuz 2026  
Kapasite varsayımı: 1 geliştirici, haftada 3,5 net geliştirme günü  
Hedef: 4 hafta sonunda ölçülebilir, reklam-temelli ve kapalı teste hazır bir sürüm adayı

## Ürün tezi

Yazgı'nın vaadi “çok sayıda olay” değil, **erken yaşta verilen bir kararın yıllar sonra tanınabilir ve açıklanabilir biçimde geri dönmesi**dir. İlk oturumda oyuncu 90 saniyeden kısa sürede anlamlı bir seçim görmeli; oyun, bu seçimin neden-sonuç bağını daha sonraki bir yaşta açıkça hatırlatmalıdır.

Ana metrikler:

- Aktivasyon: yeni kullanıcının ilk anlamlı seçime ulaşması
- İlk değer süresi: uygulama açılışından ilk seçime kadar geçen süre; hedef `< 90 sn`
- Neden-sonuç kanıtı: ilk gecikmeli sonuç olayını gören koşuların oranı
- D1 / D7 geri dönüş ve tamamlanan koşu oranı
- Reklam yorgunluğu: oturum başına gösterim, reddetme ve oturum terk oranı

## Kapsam kesme çizgisi

### Must — P0

- Formsuz, tek dokunuşlu rastgele hızlı başlangıç
- Soft-launch boyunca tek gelir modeli: ödüllü/geçiş reklamları
- Oyun dengesini veya meta ilerlemeyi doğrudan satan reklamların kaldırılması
- Mağaza iddialarının gerçek çalışma zamanı sayılarına eşitlenmesi
- En az 20 erken karar kaynağının yaşa bağlı, dal-özel takip olayına bağlanması
- Aktivasyon ve neden-sonuç hunisinin ölçülmesi — **olay üretimi tamamlandı; dashboard doğrulaması bekliyor**
- Bildirim izninin bağlamlı bir değerden sonra istenmesi
- Android API 36 ve gerçek cihaz AAB doğrulaması — **API 36 manifest/config tamamlandı; imzalı AAB ve fiziksel cihaz testi bekliyor**
- Kapalı test için çalışan ekran görüntüleri, gizlilik ve mağaza metni

### Should — P1

- Onboarding'i tek değer önerisi + “hemen başla” düzeyine indirmek
- İlk koşuda gecikmeli sonucun nedenini görsel bir “Bu seçim şuradan geldi” kartıyla göstermek
- Oyun sonu özetinde üç belirleyici karar ve bunların sonuçlarını sunmak
- İlk oturumda reklam baskısını azaltan sunucu kontrollü frekans deneyi

### Could — P2

- İlave son varyantları
- Yeni avatar ve kozmetik seçenekleri
- Genişletilmiş yaşam hedefleri
- Sosyal paylaşım kartı varyantları

### Won't — bu 4 haftada yok

- Premium abonelik ve RevenueCat ürünleştirmesi
- Bulut senkronizasyonu
- iOS genel lansmanı
- 100+ yeni bağımsız olay
- Yeni oyun modu veya yetişkinlik dönemi

## Öncelik puanları

Formül: `(2 × Kullanıcı Etkisi) + (2 × İş Etkisi) + Zaman Kritikliği - Efor - Bağımlılık - Belirsizlik`. Her girdi 0–5 aralığındadır.

| İş | Kullanıcı | İş | Zaman | Efor | Bağımlılık | Belirsizlik | Puan | Kesim |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Tek dokunuşlu hızlı başlangıç | 5 | 5 | 5 | 1 | 1 | 1 | 22 | P0 — tamamlandı |
| Onboarding ve izin zamanlaması | 5 | 4 | 4 | 2 | 1 | 1 | 18 | P0 |
| Aktivasyon / sonuç telemetrisi | 4 | 5 | 5 | 3 | 2 | 2 | 16 | P0 |
| Mağaza ve QA varlık doğruluğu | 3 | 5 | 5 | 2 | 2 | 1 | 16 | P0 — metin tamamlandı |
| 20 gecikmeli sonuç kaynağı | 5 | 4 | 4 | 4 | 2 | 2 | 14 | P0 — tamamlandı |
| API 36 + gerçek cihaz AAB | 3 | 5 | 5 | 4 | 3 | 3 | 11 | P0 |
| Oyun sonu karar özeti | 4 | 3 | 2 | 3 | 2 | 2 | 9 | P1 |
| Premium abonelik | 2 | 3 | 1 | 5 | 4 | 4 | -2 | Won't |
| Bulut senkronizasyonu | 1 | 2 | 1 | 5 | 5 | 5 | -8 | Won't |

## Dört haftalık uygulama planı

### Hafta 1 — Aktivasyon ve yayın doğruluğu

Sahip: ürün/geliştirme  
Kapasite: 3,5 gün

- Tek dokunuşlu hızlı başlangıç — **tamamlandı**
- Ad-only soft-launch bayrakları ve oyun-sonu ödül temizliği — **tamamlandı**
- Web-safe reklam/izin adaptörü — **tamamlandı**
- Mağaza sayıları 400+ olay / 35 son olarak düzeltme — **tamamlandı**
- `app_open`, `quick_start`, `first_choice` ve `delayed_consequence_seen` ölçümleri — **tamamlandı**; gerçek dashboard sıralama doğrulaması kaldı
- Bildirim iznini başlangıçtan kaldırıp oyun sonundaki açık kullanıcı eylemine taşıma — **tamamlandı**

Bağımlılık: mevcut analitik opt-in ve izin politikası.  
Çıkış ölçütü: form doldurmadan oyun başlar; telemetri test ortamında tekil ve sıralı görünür.

### Hafta 2 — Neden-sonuç çekirdeği

Sahip: anlatı tasarımı/geliştirme  
Kapasite: 3,5 gün

- 20 karar kaynağı / 52 dal-özel takip olayı — **tamamlandı**
- Her kaynak için dal-özel takip olayı ve toparlanma seçeneği — **tamamlandı**
- Her zincirde erişilebilir tetik, açık kaynak cümlesi, toparlanma seçeneği ve tekrar etmeme kuralı
- `delayed_consequence_seen` olayında source/target/age/turn alanları — **tamamlandı**
- Deterministik olay grafiği ve simülasyon testleri

Bağımlılık: olay zamanlayıcı ve geçmiş kayıtları.  
Mevcut ölçüm: 470 çalışma zamanı olayı; 87/1109 future-choice (`%7,84`).  
Çıkış ölçütü: toplam 20 kaynak — **tamamlandı**; otomatik simülasyonda yetim hedef veya zaman çizgisi ihlali yok.

### Hafta 3 — İçerik tamamlanması ve Android sürüm hattı

Sahip: geliştirme/QA  
Kapasite: 3,5 gün

- 20 karar kaynağı ve dal-özel takipleri — **tamamlandı**
- Future-choice oranını en az `%7` seviyesine çıkarma — **tamamlandı** (`%7,84`)
- Android API 36 geçişi — **konfigürasyon ve release manifest doğrulandı**; imzalı AAB üretimi CI/ASCII Gradle ortamına devredildi
- Fiziksel cihazda ilk açılış, hızlı başlangıç, reklam reddi/kabulü, kayıt yükleme ve oyun-sonu smoke testi
- Geçerli 1080×1920 ekran görüntüleri ve mağaza paketi

Bağımlılık: Expo/Gradle uyumu, imzalama anahtarları ve Play kapalı test erişimi.  
Çıkış ölçütü: 20 kaynak tamam; release manifest API 36 hedefliyor. İmzalı AAB, bu makinede Gradle artifact indirme süresi nedeniyle henüz üretilemedi.

### Hafta 4 — Yalnızca stabilizasyon

Sahip: QA/ürün  
Kapasite: 3,5 gün

- Yeni özellik veya yeni olay zinciri eklenmez
- Tam test, typecheck, lint, tasarım denetimi, denge simülasyonu ve kayıt uyumluluğu
- Düşük/orta segment gerçek cihaz performansı
- Çökme, ANR, reklam doluluk/frekans ve aktivasyon hunisi incelemesi
- Yalnızca P0 hata düzeltmeleri; go/no-go kararı ve rollback paketi

Çıkış ölçütü: kritik/açık P0 hata yok; ölçüm çalışıyor; mağaza iddiası, uygulama davranışı ve gelir modeli aynı gerçeği anlatıyor.

## Açık kapsam takası

**Kesilen:** 100+ yeni bağımsız olay, premium abonelik ve bulut senkronu.  
**Yerine alınan:** 20 erken kararın dal-özel, yıllar sonra dönen sonuç zinciri ve bunu ölçen aktivasyon hunisi.

Bu takas, içerik sayısını büyütmek yerine Yazgı'nın ayırt edici vaadini kanıtlar.

## Tahmin

- P0 özellik tamamlanması: 3 hafta / yaklaşık 10,5 net geliştirme günü
- Stabil sürüm adayı: 4 hafta / yaklaşık 14 net geliştirme günü
- API 36 veya imzalı AAB hattında dış bağımlılık sorunu çıkarsa: 5. haftaya sarkma riski

Tahmin; tek geliştirici, mevcut test altyapısı ve haftada 3,5 net gün varsayımına dayanır. Yeni bir P0 iş eklenirse aynı büyüklükte bir P0/P1 işi plandan çıkarılmalıdır.
