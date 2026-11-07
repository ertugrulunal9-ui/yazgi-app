# Google Play Veri Güvenliği (Data Safety) — taslak

> Durum: **taslak, 2026-11-07** (master 3a9339c). Koddan ve SDK sağlayıcılarının resmi açıklamalarından çıkarıldı.
> Play Console'a sen girersin; bu dosya mağazaya hiçbir şey göndermez.
> "**doğrula**" yazan maddeleri girmeden önce kontrol et. Formdan geliştirici sorumludur.

## Uygulamadaki SDK'lar ve gerçek durumları

| SDK | Sürüm (package.json / kilit) | Bu derlemede durumu | Kaynak |
|---|---|---|---|
| `react-native-google-mobile-ads` (AdMob + UMP) | 16.x, Android GMA SDK 25.0.0, UMP 4.0.0 | **Her zaman açık** (geçiş + ödüllü reklam). Kişiselleştirme yalnızca oyuncu açarsa ve AEA'da UMP izin verirse (`src/services/adConsentPolicy.ts`) | `src/services/monetization.ts`, `consentService.ts` |
| `@react-native-firebase/analytics` | 23.x | **Varsayılan kapalı.** `firebase.json` ile yerel otomatik toplama kapalı; oyuncu "Kullanım istatistikleri"ni açarsa `setAnalyticsCollectionEnabled(true)`. Reklam kimliği ve SSAID toplama `firebase.json` ile kapalı. GA reklam izin sinyalleri (`ad_storage`, `ad_user_data`, `ad_personalization`) `firebase.json` ile varsayılan reddedildi ve kodda `setConsent` çağrısı yok: oyuncu kişiselleştirilmiş reklamı açsa da kapalı kalır, istatistik verisi reklam amacıyla kullanılmaz. `analytics_storage` açık (istatistik zaten oyuncu açmadan toplanmıyor). Veri kuruluma özgü kimlikle takma adlı, "anonim" değil | `src/services/analytics.ts`, `firebase.json` |
| `@react-native-firebase/crashlytics` | 23.x | **Varsayılan açık** (native çökme raporları; `firebase.json`'da `crashlytics_auto_collection_enabled` yok, varsayılan true). Uygulama içinde kapatma anahtarı yok. JS tarafı (`crashReporting.ts`) `ErrorBoundary`'nin yakaladığı hataları da gönderir (aşağıdaki not) | `android/app/build.gradle` (crashlytics eklentisi), `src/services/crashReporting.ts` |
| `@react-native-firebase/remote-config` | 23.x | **Her zaman açık** (açılışta ve uygulamaya dönüşte, en sık 5 dk'da bir). Ülke/dil/saat dilimi/OS sürümü/uygulama kimliği + Firebase kurulum kimliği gönderir; FID zaten "Cihaz veya diğer kimlikler"de. Konsolda 2026-11-01 itibarıyla parametre yok | `src/config/featureFlags.ts` |
| `expo-notifications` | 0.32.x | Yalnızca **yerel** bildirim, sunucuya veri gitmiyor. Kod push token istemiyor (`getExpoPushTokenAsync`/`getDevicePushTokenAsync` çağrısı yok). FCM kütüphanesi expo-notifications ile derlemeye giriyor ama `firebase_messaging_auto_init_enabled=false` (ana manifest): FCM jetonu kendiliğinden üretilmez. İzin yalnızca oyuncu Bebeklik bölüm penceresindeki "Yarın hatırlat"a ya da oyun sonundaki "Yarın yeni bir hayat için hatırlat"a dokununca isteniyor. **doğrula:** Firebase belgesi otomatik kaydı tam önlemek için Analytics'in de kapalı olmasını istiyor; istatistiği açan oyuncuda jeton üretilip üretilmediği cihazda denenmedi | `src/services/notificationService.ts`, `src/components/ReminderOffer.tsx`, `src/screens/GameOverScreen.tsx`, `android/app/src/main/AndroidManifest.xml` |
| `expo-audio` | 1.1.x | Yalnızca müzik/efekt çalma. `RECORD_AUDIO`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` ve iki expo-audio hizmeti ana manifestte `tools:node="remove"` ile çıkarıldı: mikrofon izni yok, ses kaydı yok, ön plan hizmeti türü yok → Data Safety'de "Ses dosyaları" Hayır ve ön plan hizmeti beyanı gerekmez. Genel `FOREGROUND_SERVICE` izni (work-runtime / AdMob) kalıyor; tür izni değil | `android/app/src/main/AndroidManifest.xml`, `src/audio/` |
| `react-native-purchases` (RevenueCat) | 9.11.x | Paket derlemede var ama **başlatılmıyor**: `initializeSubscriptions()` yalnızca `PREMIUM_SUBSCRIPTION` bayrağı açıkken çağrılır, varsayılanı `false`. `Purchases.configure` çağrılmadığı için veri toplamaz → forma eklenmez. Abonelik açılırsa form güncellenmeli (Satın alma geçmişi, Kullanıcı kimlikleri vb.) | `src/config/featureFlags.ts`, `src/services/subscriptionManager.ts` |
| AsyncStorage / SecureStore | — | Kayıtlar ve ayarlar cihazda; uygulama bunları sunucuya göndermez. `android:allowBackup="true"` ve yedek kuralı (`fullBackupContent`/`dataExtractionRules`) yok: kullanıcının Android yedeklemesi açıksa Android tüm uygulama verisini kullanıcının Google hesabına yedekler (Android 9+ ekran kilidiyle uçtan uca şifreli). Aktarımı uygulama değil işletim sistemi yapar; Play tanımına göre "toplanan" veri sayılmaz — **doğrula** | `src/save/*`, `android/app/src/main/AndroidManifest.xml` |

## Formun genel soruları

| Soru | Cevap |
|---|---|
| Uygulama gerekli kullanıcı veri türlerinden herhangi birini topluyor veya paylaşıyor mu? | **Evet** |
| Toplanan tüm kullanıcı verileri aktarım sırasında şifreleniyor mu? | **Evet** (Google Mobile Ads ve Firebase: TLS/HTTPS) |
| Hesap oluşturma yöntemi | **Uygulama hesap oluşturmayı desteklemiyor** (silme URL'si gerekmez) |
| Kullanıcılar verilerinin silinmesini isteyebilir mi? | **Evet** — e-posta: yazgi.app.contact@gmail.com (gizlilik politikası 7. bölüm). Cihazdaki veriler uygulama silinince silinir. **doğrula:** Analytics silme talebi için Google Analytics "Kullanıcı silme" akışını (app instance ID ile) nasıl yürüteceğini belirle |
| Bağımsız güvenlik incelemesi | Hayır |
| Gizlilik politikası URL'si | https://ertugrulunal9-ui.github.io/yazgi-app/privacy.html (yayında güncel sürüm olduğundan emin ol) |

## Veri türleri

Kısaltmalar: **T** = toplanıyor, **P** = paylaşılıyor (üçüncü tarafa aktarım). Firebase, Google'ın bizim adımıza işlediği hizmet sağlayıcı olduğundan Play tanımında "paylaşım" sayılmaz; AdMob verisi Google'ın kendi reklam amaçlarıyla da kullanıldığından **paylaşılıyor** işaretlenir (Google'ın AdMob açıklaması "collects and shares" diyor).

### Konum

| Veri türü | T | P | Kaynak | Amaç | İsteğe bağlı mı? |
|---|---|---|---|---|---|
| Yaklaşık konum | Evet | Evet | AdMob (IP adresinden genel konum); Firebase Analytics (IP'den kaba konum, yalnızca açıksa) | Reklam veya pazarlama, Analiz, Dolandırıcılığı önleme/güvenlik | **Gerekli** (AdMob her zaman) — **doğrula:** Google'ın güncel AdMob sayfası "IP adresi" diyor; Play'de "Yaklaşık konum" olarak eşlemek yaygın uygulama |
| Kesin konum | Hayır | — | — | — | — |

### Uygulama etkinliği

| Veri türü | T | P | Kaynak | Amaç | İsteğe bağlı mı? |
|---|---|---|---|---|---|
| Uygulama etkileşimleri | Evet | Evet | AdMob (uygulama açılışı, dokunma, video izleme); Firebase Analytics (oyun içi olaylar, ekran/oturum — yalnızca açıksa) | Reklam veya pazarlama, Analiz, Dolandırıcılığı önleme/güvenlik | **Gerekli** (AdMob kısmı her zaman; Analytics kısmı isteğe bağlı ama aynı veri türü olduğu için tür bazında "gerekli") — **doğrula** |
| Uygulama içi arama geçmişi, yüklü uygulamalar, kullanıcı içeriği, diğer işlemler | Hayır | — | — | — | — |

### Uygulama bilgileri ve performans

| Veri türü | T | P | Kaynak | Amaç | İsteğe bağlı mı? |
|---|---|---|---|---|---|
| Kilitlenme günlükleri (Crash logs) | Evet | Hayır | Firebase Crashlytics (stack trace, çökme anındaki uygulama durumu) | Analiz (uygulama işlevselliği/hata ayıklama) | **Gerekli** (uygulama içinde kapatılamıyor) |
| Teşhis (Diagnostics) | Evet | Evet | AdMob (uygulama açılış süresi, takılma oranı, enerji kullanımı); Crashlytics (çökme anındaki cihaz meta verisi — paylaşılmaz) | Reklam veya pazarlama, Analiz, Dolandırıcılığı önleme | **Gerekli** |
| Diğer performans verileri | Hayır | — | — | — | — |

### Cihaz veya diğer kimlikler

| Veri türü | T | P | Kaynak | Amaç | İsteğe bağlı mı? |
|---|---|---|---|---|---|
| Cihaz veya diğer kimlikler | Evet | Evet | AdMob: Android reklam kimliği (AAID), app set ID. Firebase: Firebase kurulum kimliği (FID), Crashlytics kurulum UUID'si, Analytics app instance ID (yalnızca açıksa). Analytics'te AAID ve SSAID `firebase.json` ile kapalı | Reklam veya pazarlama, Analiz, Dolandırıcılığı önleme/güvenlik | **Gerekli** (AdMob ve Crashlytics her zaman) |

FCM / Firebase Installations notu: FID bu satırda kalır (Crashlytics her zaman kullanır, Analytics açıksa o da). FCM kayıt jetonu için ayrı bir beyan ya da "Uygulama işlevselliği" amacı **gerekmez**: uygulama jeton istemez, otomatik kayıt kapalı, uzak bildirim gönderilmez. Analytics açıkken jeton üretilirse bile aynı veri türüne girer ve bu satır zaten "Evet".

### Toplanmayan türler (hepsi "Hayır")

Kişisel bilgiler (ad, e-posta, kullanıcı kimliği, adres, telefon, ırk, din, cinsel yönelim, diğer), Finansal bilgiler (satın alma geçmişi dahil — bu sürümde satın alma yok), Sağlık ve fitness, Mesajlar, Fotoğraf ve videolar, Ses dosyaları, Dosyalar ve dokümanlar, Takvim, Kişiler, Web'de gezinme geçmişi.

Not: Oyuncunun yazdığı karakter adı cihazda kalır; analitiğe yalnızca **uzunluğu** gider (`analytics.ts` `character_name_length`), adın kendisi gitmez.

## Uygulama içeriği bölümündeki ilgili beyanlar

| Bölüm | Cevap |
|---|---|
| Reklamlar | **Evet, uygulamada reklam var** (AdMob geçiş + ödüllü) |
| Reklam kimliği beyanı | **Evet, reklam kimliği kullanılıyor** — amaç: Reklam veya pazarlama, Analiz (AdMob); Dolandırıcılığı önleme. `com.google.android.gms.permission.AD_ID` izni Google Mobile Ads kütüphanesinden birleşik manifeste gelir. 2026-11-01 yerel debug APK'nın birleşik manifestinde görüldü (`AD_ID` ve `ACCESS_ADSERVICES_AD_ID`); izinler kütüphanelerden geldiği için release AAB'de de olması beklenir |
| Hedef kitle | 13-15, 16-17, 18+ (13 yaş altı yok). Çocuklara yönelik değil (`store/listing.md`) |
| Ön plan hizmeti izinleri | Beyan beklenmiyor: birleşik manifestte `FOREGROUND_SERVICE_*` tür izni ve `foregroundServiceType` yok (PR #36). Play Console bölümü yine de açarsa "ön plan hizmeti kullanılmıyor" de — **doğrula** (AAB yükledikten sonra) |
| Uygulama içi satın alma | Yok. RevenueCat/Play Billing kütüphanesi derlemede olduğu için birleşik manifestte `com.android.vending.BILLING` izni var (2026-11-01 yerel debug APK'da görüldü); Play bunu sorarsa "bu sürümde satın alma yok" de. Soft launch'ta abonelik planlanmıyorsa paketi çıkarmak ayrı bir karar (bağımlılık değişikliği) |

## Kodda bilinen, formu etkileyebilecek notlar

1. **`isWeb` tespiti native'de yanlıştı.** React Native `window` ve `navigator` tanımladığı için `typeof window !== 'undefined' && typeof navigator !== 'undefined'` kontrolü Android'de de `true` dönüyordu. `analytics.ts` ve `notificationService.ts` PR #23'te, `crashReporting.ts` ve `featureFlags.ts` sonra düzeltildi (`navigator.product !== 'ReactNative'`). Artık JS hata kayıtları (stack + `phase`/`action` breadcrumb) Crashlytics'e, Remote Config isteği Firebase'e gidiyor; gizlilik politikasına Remote Config eklendi. Yeni veri türü yok (FID zaten beyanlı). **Doğrula:** Firebase'in Play veri açıklamasında Remote Config için yazan amaç(lar)ı "Cihaz veya diğer kimlikler" satırının amaçlarına ekle (ör. Uygulama işlevselliği).
2. Crashlytics için uygulama içi kapatma anahtarı yok. KVKK açısından meşru menfaat dayanağıyla gerekli tutuldu — **doğrula** (istersen Ayarlar'a ayrı bir anahtar eklenebilir).
3. Firebase Analytics veri saklama süresi Firebase/GA4 konsolunda ayarlanır (varsayılan 2 ay, en fazla 14 ay). Gizlilik politikası "en fazla 14 ay" diyor — **doğrula:** konsoldaki ayarı kontrol et.
4. Gizlilik politikası "istatistikler reklam amacıyla kullanılmaz" diyor. Bu, uygulamadaki GA reklam sinyallerinin kapalı olmasına dayanır; GA4 konsolunda Google Signals ya da Google Ads/AdMob bağlantısıyla kitle paylaşımı açılırsa cümle yanlış olur — **doğrula:** konsolda ikisinin de kapalı olduğunu kontrol et.
5. Yedekleme: gizlilik politikası Android yedeklemesini anlatıyor. `allowBackup` kapatılırsa ya da yedek kuralı eklenirse politika ve yukarıdaki AsyncStorage/SecureStore satırı güncellenmeli.

## Kaynaklar

- Google Mobile Ads SDK — Play veri açıklaması: https://developers.google.com/admob/android/privacy/play-data-disclosure
- Firebase — Play veri açıklaması (Crashlytics, Remote Config, Installations): https://firebase.google.com/docs/android/play-data-disclosure
- Google Analytics for Firebase — veri açıklaması: https://support.google.com/analytics/answer/11582702
- Firebase gizlilik ve saklama: https://firebase.google.com/support/privacy
- FCM otomatik kaydı önleme ("disable Analytics collection and FCM auto initialization"): https://firebase.google.com/docs/cloud-messaging/android/client (erişim 2026-11-07)
- Google izin modu türleri (`ad_storage`, `ad_user_data`, `ad_personalization`): https://developers.google.com/tag-platform/security/concepts/consent-mode (erişim 2026-11-07)
- Android Otomatik Yedekleme (Google Drive, 25 MB, Android 9+ uçtan uca şifreleme): https://developer.android.com/identity/data/autobackup (erişim 2026-11-07)
- Play Data Safety "toplama" tanımı: https://support.google.com/googleplay/android-developer/answer/10787469 (erişim 2026-11-07)
- Play ön plan hizmeti beyanı: https://support.google.com/googleplay/android-developer/answer/13392821 (erişim 2026-11-07)
