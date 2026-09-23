# Phase 5 Smoke Checklist

Date: 2026-02-26
Scope: Social UI smoke for locale-aware NPC names (`SocialScreen`, `NPCList`, `NPCCard`)

## Checklist

- [x] EN locale aktifken `NPCCard` ad/rol/yas etiketi dogru render oluyor.
- [x] Locale degistiginde mevcut NPC ismi oldugu gibi korunuyor (retroaktif ceviri yok).
- [x] EN locale aktifken `NPCList` ozet karti ve grup basliklari (`Friends`, `Rivals & Enemies`) dogru.
- [x] `NPCList` icinde NPC adlari stabil gorunuyor.
- [x] EN locale aktifken `SocialScreen` baslik, meet-new CTA ve empty-state metinleri dogru.
- [x] Phase 5 deterministic isim secimi testi mevcut (seed verildiginde tekrarlanabilir non-id alanlar ayni).

## Evidence (Command Output)

```bash
npx jest --runInBand __tests__/utils/gameUtilsExtended.test.ts
npx jest --runInBand __tests__/components/SocialLocaleSmoke.test.tsx
npm run typecheck -- --pretty false
```

Result: PASS
