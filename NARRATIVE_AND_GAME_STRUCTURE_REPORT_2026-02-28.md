# Yazgi Genel Yapi ve Narrative Audit Raporu

Tarih: 28 Subat 2026  
Kapsam: Oyun akisi, event secimi, narrative katmani, i18n, tip guvenligi, maintainability

## 1. Kisa Ozet

Kod tabani ozellikle event tabanli oyun dongusu ve anlati varyasyonu konusunda guclu bir temel kurmus:
- Event seciminde adaptif pacing + arc + scheduled + burden/cisis katmanlari var.
- Narrative tarafinda memory-aware text, causal chain ve strategic monologue gibi ileri mekanikler uygulanmis.
- i18n altyapisi ve Phase-7 testi calisiyor.

Ancak su anda product-risk olusturan 3 kritik konu var:
1. `typecheck` kirmizi (build guvenligi dusuk).
2. Choice gating filtreleri bazi eventlerde fiilen delinmis durumda.
3. Narrative metinlerin bir bolumu locale-disinda hardcoded oldugu icin EN deneyimi karisik dil uretebiliyor.

## 2. Metod

Asagidaki kaynaklar tarandi:
- Oyun cekirdegi: `GameContext`, `useEvents`, `TurnMediator`, event secim/validasyon dosyalari
- Narrative dosyalari: `memoryLogic`, `internalMonologue`, `causalChain`, `npcPersonalityReaction`
- UI akislari: `EventScreen`, `GameScreen`, `EventNarrative`, swipe secim bilesenleri
- i18n ve dogrulama: `strings`, `i18n/events/*`, `npm run i18n:check`
- Statik kalite: `npm run typecheck`

## 3. Kritik Bulgular (Oncelik Sirali)

### P0-1: Typecheck bozuk (derleme guvenligi kirik)
- Kanit:
  - [eventMixGuardrails.ts:30](C:/Yazgi/src/systems/eventMixGuardrails.ts:30) `event.reqGoal` kullaniliyor ama `GameEvent` tipinde yok.
  - [experimentBucketing.ts:11](C:/Yazgi/src/utils/experimentBucketing.ts:11) kullanilmayan importlar (`FeatureFlagState`, `FEATURE_FLAGS`) strict ayarda error veriyor.
- Etki:
  - `npm run typecheck` fail oldugu icin CI/kalite kapisi zayif.
  - Refactorlarda sessiz regression riski artiyor.

### P0-2: Choice filtrelemesi bosa dusuyor (kural ihlali riski)
- Kanit:
  - [eventChoiceFilter.ts:93](C:/Yazgi/src/utils/eventChoiceFilter.ts:93) filtre sonucu bos ise tum `currentEvent.choices` geri donuyor.
  - Secenekler [eventChoiceFilter.ts:85](C:/Yazgi/src/utils/eventChoiceFilter.ts:85), [eventChoiceFilter.ts:87](C:/Yazgi/src/utils/eventChoiceFilter.ts:87), [eventChoiceFilter.ts:89](C:/Yazgi/src/utils/eventChoiceFilter.ts:89) ile filtreleniyor; ama hicbiri gecmezse fallback tum secenekleri aciyor.
- Etki:
  - Oyuncu, `reqStats/reqSkills/reqEventIds` kosulunu aslinda saglamadigi secenekleri gorebilir/secebilir.
  - Narrative tutarlilik ve progression dengesi bozulur.

### P0-3: Narrative locale tutarliligi kiriliyor (TR/EN karisimi)
- Kanit:
  - Event metnine memory satiri ekleme [useEvents.tsx:212](C:/Yazgi/src/hooks/useEvents.tsx:212), ama eklenen satirlar [memoryLogic.ts:89](C:/Yazgi/src/utils/memoryLogic.ts:89) ve devaminda hardcoded.
  - Ic monolog bankalari [internalMonologue.ts:13](C:/Yazgi/src/utils/internalMonologue.ts:13), [internalMonologue.ts:33](C:/Yazgi/src/utils/internalMonologue.ts:33) hardcoded.
  - NPC yansima diyaloglari [npcPersonalityReaction.ts:27](C:/Yazgi/src/utils/npcPersonalityReaction.ts:27) hardcoded.
  - Nedensel bag cizgileri [causalChain.ts:15](C:/Yazgi/src/utils/causalChain.ts:15) hardcoded.
- Etki:
  - EN locale'de event govdesi EN iken ek anlati satirlari TR kalabiliyor.
  - i18n testleri gectigi halde runtime anlati kalitesi dusuyor.

## 4. Yuksek Oncelikli Bulgular (P1)

### P1-1: Scheduled event `condition` alani tanimli ama islenmiyor
- Kanit:
  - `condition` tipi var: [events.ts:67](C:/Yazgi/src/types/events.ts:67), [events.ts:272](C:/Yazgi/src/types/events.ts:272).
  - Schedule edilirken yaziliyor: [TurnMediator.ts:433](C:/Yazgi/src/systems/TurnMediator.ts:433).
  - Due/tick seciminde kontrol edilmiyor: [scheduledEvents.ts:11](C:/Yazgi/src/utils/scheduledEvents.ts:11), [scheduledEvents.ts:19](C:/Yazgi/src/utils/scheduledEvents.ts:19), [scheduledEvents.ts:49](C:/Yazgi/src/utils/scheduledEvents.ts:49).
- Etki:
  - Gelecekte kosullu PCG eventleri tanimlandiginda kurallar fiilen yok sayilir.

### P1-2: Event secim mantigi iki farkli yerde tekrar edilmis
- Kanit:
  - [useEvents.tsx:258](C:/Yazgi/src/hooks/useEvents.tsx:258) `selectNewEvent`
  - [useEvents.tsx:591](C:/Yazgi/src/hooks/useEvents.tsx:591) `advanceTurn`
  - Her ikisinde de scheduled -> burden/crisis -> goal -> momentum gate -> arc/random zinciri var.
- Etki:
  - Kural degisikliklerinde iki yeri birden guncelleme zorunlulugu.
  - Davranis drifti ve zor testlenen edge-case artisi.

### P1-3: Event validasyonu fail-fast degil, ana zod validator kullanim disi
- Kanit:
  - Runtime’da sadece log var: [events.ts:61](C:/Yazgi/src/data/events.ts:61), [events.ts:63](C:/Yazgi/src/data/events.ts:63), [events.ts:67](C:/Yazgi/src/data/events.ts:67).
  - `validateEventPool` fonksiyonu tanimli ama cagrilmiyor: [eventRegistry.ts:115](C:/Yazgi/src/data/eventRegistry.ts:115).
  - Ayrica schema yas araligi 0-18 ile sinirli: [eventRegistry.ts:63](C:/Yazgi/src/data/eventRegistry.ts:63), [eventRegistry.ts:64](C:/Yazgi/src/data/eventRegistry.ts:64); buna karsin runtime event builder’da 0-100 kullanim var: [events.ts:93](C:/Yazgi/src/data/events.ts:93), [events.ts:113](C:/Yazgi/src/data/events.ts:113).
- Etki:
  - Hata erken fail etmedigi icin canli akista kirik eventlerin tespiti gecikebilir.

### P1-4: `GameScreen` tek dosyada asiri sorumluluk birikimi
- Kanit:
  - Dosya oyun hub + reklam akislari + sosyal etkilesim + mini-game orchestration + modal yönetimi + toasts + analytics bagliyor.
  - Ornek bolgeler: [GameScreen.tsx:207](C:/Yazgi/src/screens/GameScreen.tsx:207), [GameScreen.tsx:256](C:/Yazgi/src/screens/GameScreen.tsx:256), [GameScreen.tsx:308](C:/Yazgi/src/screens/GameScreen.tsx:308), [GameScreen.tsx:390](C:/Yazgi/src/screens/GameScreen.tsx:390), [GameScreen.tsx:468](C:/Yazgi/src/screens/GameScreen.tsx:468), [GameScreen.tsx:1345](C:/Yazgi/src/screens/GameScreen.tsx:1345), [GameScreen.tsx:1464](C:/Yazgi/src/screens/GameScreen.tsx:1464).
- Etki:
  - Yeni feature eklemek zorlasir, regression test maliyeti artar.

## 5. Pozitif Durumlar (Korunmasi Gerekenler)

- Event secim mimarisi katmanli ve zengin (goal, arc, scheduled, burden, momentum gate).
- Narrative derinligi icin memory + causal + monologue entegrasyonu yapilmis.
- i18n key/fallback/overflow kontrolu su anda testte geciyor (`npm run i18n:check` PASS).
- Event metin key mapping otomasyonu (`keyMapper`) dogru bir temel.

## 6. Gelistirme Yollari (Oncelikli Yol Haritasi)

### Faz 1 (1 sprint) - Stabilizasyon
1. `typecheck`i yesile cek.
2. Choice filter fallbackini guvenli davranisa cevir.
3. Narrative runtime metinleri locale-aware hale getir (`tRuntime` veya key-tabani map).
4. Scheduled `condition` evaluator ekle (en azindan whitelist expression veya predicate map).

Beklenen sonuc:
- Build guvenligi + kural tutarliligi + EN narrative kalitesi hizli sekilde toparlanir.

### Faz 2 (1-2 sprint) - Mimari sadeleştirme
1. `useEvents` icindeki event secim akisini tek bir pure selector pipeline’a indir.
2. `GameScreen`i use-case bazli alt hooklara bol:
   - `useAdRewards`
   - `useExamFlow`
   - `useHubActions`
   - `useSocialInteractions`
3. `eventRegistry`i runtime gercekle uyumlu hale getirip CI’da fail-fast calistir.

Beklenen sonuc:
- Degisiklik hizi artar, regression azalir, testlenebilirlik yukselir.

### Faz 3 (2+ sprint) - Narrative kalite atagi
1. Monologue/NPC/Causal/Memory metinlerini locale kataloguna tasi.
2. Persona-tier (novice/trained/expert/master) ses farklilastirmasini event feedback katmanina ekle.
3. PCG event authoring icin standart JSON contract + validator + simulation hooks ekle.

Beklenen sonuc:
- Anlati tutarliligi artar, tekrar oynanabilirlikte kalite farki hissedilir.

## 7. Hemen Uygulanabilir Backlog (Kisa)

1. `P0` fix PR: typecheck + choice fallback + narrative localization shell.
2. `P1` refactor PR: event selection pipeline consolidation.
3. `P1` infra PR: event validation CI gate.
4. Narrative content PR: hardcoded banklerin i18n domain’e tasinmasi.

## 8. Calistirilan Kontroller

- `npm run typecheck` -> FAIL
- Hata dagilimi: `reqGoal` kaynakli 2 hata + kullanilmayan import kaynakli 2 hata (toplam 4)
- `npm run i18n:check` -> PASS (4/4 test)
