Original prompt: oyunda achievmentleri acinca gelen para odulleri oyunun ekonomisini cok bozuyor bunu kaldirmaliyiz

- 2026-03-06: Achievement para odullerini veri katmaninda normalize ederek kaldirma isi baslatildi.
- 2026-03-06: Uygulama katmaninda achievement reward uygulamasindan para akisina da koruma eklenecek.
- 2026-03-06: `src/systems/achievementDefinitions.ts` icinde para odulleri export asamasinda silindi; stat/item odulleri korundu.
- 2026-03-06: `src/systems/achievementSystem.ts` icinde achievement reward uygulamasinda para ekleme kapatildi, `reward.stats.money` yok sayiliyor.
- 2026-03-06: `__tests__/systems/achievementDefinitions.test.ts` ve `__tests__/systems/achievementSystem.test.ts` gecti.
- 2026-03-06: O donemde genel `typecheck` bu isten bagimsiz eski hatalar nedeniyle kirikti: `src/components/Avatar.tsx`, `src/hooks/useEvents.tsx`.
- 2026-03-06: `useGame must be used within GameProvider` baslangic hatasina karsi `MainMenuScreen` context bagimliligindan cikarildi; `startNewGame` ve meta progression verisi ust kabuktan prop olarak gecirildi.
- 2026-03-06: `__tests__/components/MainMenuScreen.test.tsx`, `__tests__/components/Phase7ScreenSmoke.test.tsx` ve `__tests__/app/AppShell.integration.test.tsx` gecti.
- 2026-03-09: Sosyal sekme etkilesimlerinin risk alarmina etkisi yeniden kalibre edildi; runtime `endingResolver` artik orta-yuksek stres bandinda da dususe tepki veriyor, boylece sosyal etkilesimle azalan stres risk alarmina yansiyor.
- 2026-03-09: `__tests__/hooks/useSocialInteractions.test.ts` icine sosyal etkilesim basarili oldugunda `updateGameState` ile stresin azaldigini dogrulayan test eklendi.
- 2026-03-09: `__tests__/utils/endingResolver.edgeCases.test.ts` icine sosyal etkilesim kaynakli stres dususunun runtime risk toplamini azalttigini dogrulayan test eklendi.
- 2026-03-09: Dogrulama: `npm test -- --runInBand __tests__/hooks/useSocialInteractions.test.ts __tests__/utils/endingResolver.edgeCases.test.ts` ve `npm run typecheck` gecti.
