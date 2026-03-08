Original prompt: oyunda achievmentleri açınca gelen para ödülleri oyunun ekonomisini çok bozuyor bunu kaldırmalıyız

- 2026-03-06: Achievement para ödüllerini veri katmanında normalize ederek kaldırma işi başlatıldı.
- 2026-03-06: Uygulama katmanında achievement reward uygulamasından para akışını da devre dışı bırakacak koruma eklenecek.
- 2026-03-06: `src/systems/achievementDefinitions.ts` içinde para ödülleri export aşamasında silindi; stat/item ödülleri korunuyor.
- 2026-03-06: `src/systems/achievementSystem.ts` içinde achievement reward uygulamasında para ekleme kapatıldı, `reward.stats.money` de yok sayılıyor.
- 2026-03-06: `__tests__/systems/achievementDefinitions.test.ts` ve `__tests__/systems/achievementSystem.test.ts` geçti.
- 2026-03-06: Genel `typecheck` bu işten bağımsız eski hatalar nedeniyle hâlâ kırık: `src/components/Avatar.tsx`, `src/hooks/useEvents.tsx`.
- 2026-03-06: `useGame must be used within GameProvider` başlangıç hatasına karşı `MainMenuScreen` context bağımlılığından çıkarıldı; `startNewGame` ve meta progression verisi üst kabuktan prop olarak geçiliyor.
- 2026-03-06: `__tests__/components/MainMenuScreen.test.tsx`, `__tests__/components/Phase7ScreenSmoke.test.tsx` ve `__tests__/app/AppShell.integration.test.tsx` geçti.
