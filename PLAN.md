# Yazgi - Kalan Lokalizasyon Fazlari Implementasyon Plani

Tarih: 26 Subat 2026  
Kapsam: Yalnizca kalan fazlar (Phase 4, 5, 6, 7)

## Durum Ozeti

- [x] Phase 1.1 - High-traffic component migration
- [x] Phase 1.2 - NPC & Social components
- [x] Phase 1.3 - Save/Load system components
- [x] Phase 1.4 - Exam system components
- [x] Phase 1.5 - Misc components
- [x] Phase 2 - Data file localization
- [x] Phase 3 - Event localization infrastructure
- [x] Phase 4 - Event translation / dogal dil polish
- [x] Phase 5 - NPC names locale-aware
- [x] Phase 6 - Exam content adaptation
- [x] Phase 7 - Validation & testing

## Kalan Is Yuku (Net)

### Phase 4

- Mevcut: `400/400` event manuel polish tamam
- Kalan: `0` event
- Kalan prefix gruplari:

| Prefix | Kalan |
|---|---:|
| `tr_*` | 0 |
| `npc_*` | 0 |
| `pers_*` | 0 |
| `npcq_*` | 0 |
| `mem_*` | 0 |
| `econ_*` | 0 |
| `goal_*` | 0 |

### Phase 5

- Mevcut: Locale-aware NPC isim üretimi aktif (TR/EN havuz + runtime locale baglanti)
- Kalan: Phase 5 kapsaminda kritik eksik yok

### Phase 6

- Mevcut: `EnglishExamGame` icin locale-aware soru kaynagi aktif, EN havuzu EN-native icerige tasindi
- Kalan: Phase 6 kapsaminda kritik eksik yok

### Phase 7

- Mevcut: Missing key/fallback/smoke/overflow validasyonlari tamamlandi
- Kalan: Phase 7 kapsaminda kritik eksik yok

## Uygulama Plani (Phase 4-7)

### Phase 4 - Event Translation ve Dogal Dil Polish

Amaç: Event translation ve dogal dil polish isini `400/400` seviyesinde kapatmak.

TODO:

- [x] `scripts/localization/event-source-catalog.json` uzerinden kalan prefix backlog'unu net listele
- [x] Prefix bazli 3 dalga tamamlama:
  - [x] Dalga A: `tr_*` + `econ_*` + `goal_*` (58 event)
  - [x] Dalga B: `npc_*` + `npcq_*` (72 event)
  - [x] Dalga C: `pers_*` + `mem_*` (58 event)
- [x] Her event icin style QA checklist uygula:
  - 2nd person voice tutarliligi
  - secenek uzunluk dengesi
  - feedback tonunun outcome ile uyumu
  - placeholder bozulmama (`{playerName}` vb.)
  - effect/mekanik degismeme
- [x] Manuel duzeltmeleri `src/i18n/events/en.overrides.ts` icinde topla
- [x] `src/i18n/events/en.generated.ts` ile override birlesimi dogrula
- [x] Event callback regression testlerini calistir

Beklenen cikti:

- `400/400` manuel polish
- Kalan prefix sayaci `0`
- Dil dogalligi ve mekanik parity checklist raporu

### Phase 5 - NPC Names Locale-Aware

Amaç: Yeni uretilen NPC isimlerinin locale'e gore dogru havuzdan gelmesi.

TODO:

- [x] Isim havuzlarini locale bazli ayir:
  - TR havuzu
  - EN havuzu
- [x] `createRandomNPC` akisinda locale secimini bagla (`src/utils/gameUtils.ts`)
- [x] Deterministic isim secimi ekle (save/load tutarliligi icin seed bazli secim)
- [x] Mevcut save uyumlulugu:
  - mevcut NPC isimleri migration'siz korunur
  - sadece yeni NPC olusturmada locale-aware havuz kullanilir
- [x] Sosyal ekran ve NPC kartlarinda gorunum regresyonu test et (smoke checklist + component smoke test)

Beklenen cikti:

- EN locale'de yeni NPC isimlerinin EN havuzdan gelmesi
- TR locale'de mevcut davranisin korunmasi
- Save geri yuklemede isim sapmasi olmamasi

### Phase 6 - Exam Content Adaptation (EN)

Amaç: EN locale'de sinavlarin "ceviri gibi degil, dogal EN egitim dili" ile oynanmasi.

TODO:

- [x] Exam icerigini locale ayri kaynaklara tasima (ozellikle English exam)
- [x] `src/components/exams/EnglishExamGame.tsx` soru bankasini EN-native hale getir:
  - soru kokleri
  - secenekler
  - soru turu etiketleri
  - loading/feedback UI metinleri
- [x] Yas + zorluk kademesinde dogal ilerlemeyi koru (YOUNG/MIDDLE/ADVANCED)
- [x] TR locale davranisini bozmadan EN icerigi ayir
- [x] English exam icin hedefli unit test/snapshot ekle

Beklenen cikti:

- EN locale'de EnglishExamGame ekraninda Turkce string kalmaması
- Soru zorluk dengesi bozulmadan dogal EN metin akisi

### Phase 7 - Validation ve Testing

Amaç: Uctan uca i18n kalite kapisi ve rapor.

TODO:

- [x] Missing key taramasi:
  - static key parity kontrolu
  - runtime missing-key warning toplama
- [x] Fallback denetimi:
  - EN key yoksa TR fallback calisiyor mu
  - fallback zinciri beklenen yerde tetikleniyor mu
- [x] Ekran bazli smoke test:
  - MainMenu, GameScreen, SocialScreen, ReportCardScreen, SaveSlotPicker
- [x] Text overflow denetimi:
  - uzun EN string senaryolari
  - buton/etiket/tooltip kirpma kontrolu
- [x] CI raporu:
  - test sonuclari
  - kalan riskler
  - ship/no-ship karari

Beklenen cikti:

- Tek rapor dosyasi (i18n validation summary)
- "kritik seviye issue yok" kapanis karari

## Takvim (Hedef)

| Tarih Araligi | Hedef |
|---|---|
| 26 Subat 2026 - 02 Mart 2026 | Phase 4 Dalga A+B |
| 03 Mart 2026 - 05 Mart 2026 | Phase 4 Dalga C + final polish |
| 06 Mart 2026 - 08 Mart 2026 | Phase 5 implementasyonu |
| 09 Mart 2026 - 12 Mart 2026 | Phase 6 EN exam adaptasyonu |
| 13 Mart 2026 - 16 Mart 2026 | Phase 7 validation, rapor, release gate |

## Cikis Kriterleri (Done)

- [x] Phase 4: `400/400` event polish ve prefix backlog sifir
- [x] Phase 5: Locale-aware NPC isim üretimi prod akışında aktif
- [x] Phase 6: EN exam içerikleri dogal ve testlerle dogrulanmis
- [x] Phase 7: Missing key/fallback/smoke/overflow raporu tamam ve blocker yok
