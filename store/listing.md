# Yazgı — Play Store Listing

## Uygulama Adı
```
Yazgı
```

## Kısa Açıklama (max 80 karakter)
```
Kaderini sen yaz. 0'dan 18'e her kararın geleceğini şekillendirir.
```
→ 67 karakter ✓

## Uzun Açıklama (TR) — max 4000 karakter
```
Yazgı, 0'dan 18 yaşına kadar bir hayatı yaşadığın Türkçe yaşam simülasyonu oyunudur. Her karar önemlidir. Her seçim bir iz bırakır.

Ders mi çalışırsın, arkadaşlarınla mı takılırsın? Ailenle mi vakit geçirirsin, kendi yolunu mu çizersin? Zorlu anlarda doğruyu mu söylersin, yoksa kolay yolu mu seçersin?

🎭 500'den fazla benzersiz olay
Her yaş döneminde seni bekleyen farklı olaylar — aile tartışmaları, okul sınavları, arkadaşlık krizleri, beklenmedik fırsatlar.

🏁 47 farklı son
Sıradan bir hayat mı yaşarsın, yoksa efsane olur musun? Her oyun farklı — ending galerisini doldur.

🧠 Gelişen kişilik sistemi
5 kişilik boyutu karakterinin nasıl büyüdüğünü belirler. Kararların zamanla seni şekillendirir.

💔 Kalıcı izler
Bazı kararların sonuçları silinmez. Travmalar ve hayat dersleri oyun sonuna kadar seninle kalır.

🏆 Legacy sistemi
Her oyun bir sonrakini etkiler. Önceki hayatlardan kazandığın avantajlar yeni bir hayata taşınır.

— Oyna. Seç. Pişman ol. Tekrar dene. —
```
→ ~950 karakter ✓

---

## Uzun Açıklama (EN) — max 4000 karakter
```
Yazgi is a Turkish life simulation game where you live a life from age 0 to 18. Every decision matters. Every choice leaves a mark.

Study or hang out with friends? Spend time with family or carve your own path? Tell the truth when it's hard, or take the easy way out?

🎭 500+ unique events
Different events await you at every age — family conflicts, school exams, friendship crises, unexpected opportunities.

🏁 47 different endings
Will you live an ordinary life, or become a legend? Every run is different — fill your ending gallery.

🧠 Evolving personality system
5 personality axes determine how your character grows. Your choices gradually shape who you become.

💔 Permanent scars
Some decisions leave marks that don't fade. Traumas and life lessons stay with you until the very end.

🏆 Legacy system
Every run affects the next. Advantages earned from previous lives carry over into a new one.

— Play. Choose. Regret. Try again. —
```

---

## Kategori
```
Rol Yapma Oyunları (Role Playing) veya Simülasyon (Simulation)
```
→ **Tavsiye: Simulation** — RPG kitlesi beklenenden farklı oyun çıkabilir.

## İçerik Derecelendirmesi
- Yaş sınırı: **12+** (şiddet yok, ama stresli hayat olayları var)
- IARC anketi doldurunca otomatik belirlenir

---

## Görsel Assetler Rehberi

### 1. App Icon — 512×512 PNG
Mevcut icon: `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp` (192×192)

**En hızlı yol:**
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) — icon'u yükle, 512px export et
- Veya Canva'da 512×512 canvas aç, mevcut icon'u yerleştir, PNG indir

### 2. Feature Graphic — 1024×500 PNG
Canva şablonu önerisi:
- Koyu arka plan (#0f0f0f veya koyu mor)
- Ortada büyük "Yazgı" yazısı
- Altında "Kaderini sen yaz."
- Sağda karakter avatar görseli (varsa)

### 3. Screenshots — 1080×1920 PNG (min 2, tavsiye 5-8)

**Çekmen gereken sıra:**
1. Ana menü — karakter oluşturma formu
2. Event ekranı — seçim kartları görünür halde
3. Karakter stat ekranı — stat barları dolu
4. Game Over — "Özet" tab, LEGENDARY tier
5. Game Over — "Hikaye" tab, life story görünür

**Nasıl çekersin:**
```bash
# Emulator başlat
npx expo start --android

# Emulator'da oyna, her ekranda:
# Windows: Android emulator → ... → Screenshot
# veya adb komutla:
adb exec-out screencap -p > screenshot_01.png
```

---

## Play Store'a Girilecek Linkler
- Privacy Policy: `https://ertugrulunal9-ui.github.io/yazgi-app/privacy.html`
- Website: `https://github.com/ertugrulunal9-ui/yazgi-app` (opsiyonel)
- Email: `yazgi.app.contact@gmail.com`
