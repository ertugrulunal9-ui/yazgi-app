# Yazgi (Expo React Native)

Yazgi, Expo tabanlı bir mobil yaşam simülasyonu oyunudur.

## Gereksinimler

- Node.js 18+ (LTS önerilir)
- npm
- Expo Go (fiziksel cihazda test için)
- Android Studio (Android emulator için, opsiyonel)
- Xcode (iOS simulator için, sadece macOS)

## Kurulum

```bash
npm install
```

Notlar:

- Bu proje için `GEMINI_API_KEY` gerekmiyor.
- Geliştirme için `npm run dev` yerine Expo komutları kullanılır.

## Geliştirme (Expo)

Metro/Expo sunucusunu başlat:

```bash
npm start
```

Kısayollar:

- `a`: Android emulator aç
- `i`: iOS simulator aç (macOS)
- `w`: Web preview (opsiyonel)

Native build ile cihaz/emulator çalıştır:

```bash
npm run android
npm run ios
```

## Cihazda Test Adımları

1. `npm start` çalıştır.
2. Telefonda Expo Go aç.
3. Terminaldeki QR kodu tara.
4. Oyun akışlarını cihaz üzerinde doğrula:
   - Yeni oyun başlangıcı
   - Event seçimleri ve stat değişimleri
   - Save/load
   - Sınav mini-game’leri

## Test ve Kalite

```bash
npm test
npm run test:coverage
npm run lint
```

## Build / Prod (EAS)

EAS ile build:

```bash
npx eas login
npx eas build --platform android --profile development
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

EAS profilleri `eas.json` içinde tanımlıdır. Şu an Android tarafında `apk` üretiliyor.

Store gönderimi gerekiyorsa:

```bash
npx eas submit --platform android --profile production
```

## Single Source of Truth

Gameplay balansı ve başlangıç state’i için referans **kod**dur, GDD değil.

Yetkili kaynaklar:

- `src/utils/gameUtils.ts`
  - `getInitialStats`
  - `getInitialGameState`
  - `getStatCap`
  - `calculateEnergyCost`
  - `updateStats`
- `src/constants/gameConstants.ts` (oyun sabitleri)

Kural:

- GDD/dokümanlar açıklayıcıdır.
- Test beklentileri dokümandan değil, runtime kod davranışından türetilmelidir.
