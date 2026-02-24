# Yazgı — İngilizce Lokalizasyon Implementation Planı

## Mevcut Durum

- **i18n altyapısı var:** `src/i18n/strings.ts` — custom `t()` fonksiyonu, dot-notation, interpolation, fallback desteği
- **Kapsam:** Sadece ~90 string lokalize (UI ayarları, tab isimleri, onboarding)
- **Lokalize edilmemiş:** ~5000+ string — event text/choice/feedback, system labels, ending narratives, achievement descriptions, NPC isimleri
- **Event text tipi:** `string | ((context: EventContext) => string)` — hem statik hem dinamik
- **Choice/feedback:** Sadece `string` — her zaman statik

## Mimari Karar: Event İçeriği İçin Strateji

Event'ler **key-based çeviri yerine dosya bazlı ayrım** ile lokalize edilecek.

**Neden key-based değil:**
- 1.187 event × (1 text + ort. 2.5 choice + 2.5 feedback) = ~6.000+ key. Tek bir JSON'da yönetilemez.
- Dinamik text callback'leri (`(ctx) => string`) key-based sisteme sığmaz — context-dependent string üretimi var.
- Event dosyaları zaten tematik ayrılmış (turkishEvents, moralDilemmaEvents, vb.)

**Yaklaşım: Locale-aware event registry**
- Her event dosyasının İngilizce karşılığı oluşturulacak
- Runtime'da aktif locale'e göre doğru event havuzu yüklenecek

## İki Katmanlı Lokalizasyon

### Katman 1 — Evrensel Event'ler (~%60-70, direkt çeviri)
Kültürden bağımsız, olduğu gibi çevrilebilir:
- `moralDilemmaEvents.ts` — ahlaki ikilemler evrensel
- `personalityEvents.ts` — kişilik event'leri evrensel
- `npcEvents.ts` — NPC ilişkileri evrensel
- `npcCheckInEvents.ts` — NPC check-in evrensel
- `relationshipMilestoneEvents.ts` — ilişki milestone'ları evrensel
- `lateTeenEvents.ts` — ergen event'leri büyük ölçüde evrensel
- `memoryGatedEvents.ts` — hafıza event'leri evrensel
- `goalChainEvents.ts` — hedef zincirleri evrensel
- `cliffhangerEvents.ts` — cliffhanger'lar evrensel
- `economicRecoveryEvents.ts` — ekonomi recovery evrensel
- `momentumEvents.ts` — momentum event'leri evrensel

### Katman 2 — Kültürel Adaptasyon (~%30-40)
Türk kültürüne özgü, İngilizce karşılığı farklı olacak:
- `turkishEvents.ts` → `westernEvents.ts` (bayram→holidays, komşu→neighbor, esnaf→small business)
- `ageSpecificEvents.ts` — yaşa özgü event'lerin bir kısmı kültürel (okul sistemi, askerlik vb.)
- `familyArcEvents.ts` — aile dinamikleri kısmen kültürel (baba otoritesi, el öpme vb.)
- `npcQuestlineEvents.ts` — NPC questline'larının bir kısmı kültürel referans içeriyor

## Implementation Adımları

### Adım 1: i18n Altyapısını Genişlet (`src/i18n/`)

**1a. `strings.ts`'e eksik UI/system string'lerini ekle:**

Şu kategoriler lokalize edilecek:
- `labels.stats.*` — Sağlık, Zeka, Karizma, vb. (7 stat)
- `labels.skills.*` — Yazılım, Müzik, Spor, vb. (12 skill)
- `labels.grades.*` — Matematik, Türkçe, vb. (8 ders)
- `labels.personality.*` — Açıklık, Cesaret, vb. (5 eksen)
- `labels.fateOutcomes.*` — Lanetli, Şanssız, Nötr, Şanslı, Kutsanmış
- `labels.choiceTypes.*` — Pasif, Meydan Okuma, Çöküş, Nötr
- `feedback.momentum.*` — Momentum feedback string'leri
- `feedback.stress.*` — Stres uyarı mesajları
- `feedback.recovery.*` — Recovery mesajları
- `ending.*` — Ending başlıkları, açıklamaları, tier isimleri
- `achievement.*` — 67 başarım isim + açıklama

**1b. `strings.ts`'deki shop namespace'ini kaldır** (IAP temizlendi)

**1c. Locale detection:** `expo-localization` ekle, cihaz dilini otomatik algıla

### Adım 2: UI Hardcode String'leri Migrate Et

Tüm hardcoded Türkçe string'leri `t()` çağrısına çevir:

| Dosya | Tahmini String Sayısı |
|-------|----------------------|
| `FeedbackOverlay.tsx` | ~60 (STAT_LABELS, SKILL_LABELS, GRADE_LABELS, vb.) |
| `StatusHeader.tsx` | ~15 (stres uyarıları, risk seviyeleri) |
| `GameScreen.tsx` | ~20 (toast mesajları, hata mesajları) |
| `GameOverScreen.tsx` | ~15 (ending UI, reklam mesajları) |
| `CharacterScreen.tsx` | ~25 (stat/skill/grade etiketleri) |
| `TurnMediator.ts` | ~10 (fate outcome labels, momentum feedback) |
| `endingResolver.ts` | ~40 (ending titles, descriptions, analysis labels) |
| `gameUtils.ts` | ~20 (hata mesajları, hayat yolu açıklamaları) |
| `achievementDefinitions.ts` | ~134 (67 × isim + açıklama) |

**Toplam: ~340 string** → `strings.ts`'e taşınacak

### Adım 3: Event Lokalizasyon Altyapısı

**3a. Locale-aware event loader oluştur:**

```
src/data/
  events.ts              ← Mevcut (orchestrator)
  locales/
    tr/
      turkishEvents.ts       ← Mevcut dosya taşınır
      moralDilemmaEvents.ts  ← Mevcut dosya taşınır
      personalityEvents.ts   ← ...
      ageSpecificEvents.ts
      familyArcEvents.ts
      npcQuestlineEvents.ts
      (+ diğer dosyalar)
    en/
      westernEvents.ts       ← turkishEvents'in kültürel adaptasyonu
      moralDilemmaEvents.ts  ← Direkt çeviri
      personalityEvents.ts   ← Direkt çeviri
      ageSpecificEvents.ts   ← Kısmen adaptasyon
      familyArcEvents.ts     ← Kısmen adaptasyon
      npcQuestlineEvents.ts  ← Kısmen adaptasyon
      (+ diğer dosyalar)
```

**3b. `events.ts` orchestrator'ını güncelle:**

```typescript
import { getLocale } from '../i18n/strings';

const loadEventsByLocale = (locale: AppLocale): GameEvent[] => {
  // Locale-specific event files lazily imported
  // Evrensel event'ler (moralDilemma, personality, npc, vb.) locale'e göre çevrilmiş versiyondan yüklenir
  // Kültüre özgü event'ler (turkish → western) locale'e göre farklı dosyadan yüklenir
};
```

**3c. EventBuilder'a locale desteği ekle (opsiyonel):**
EventBuilder değişmez — her locale kendi event dosyasında aynı builder'ı kullanır.
Event ID'leri aynı kalır, sadece text/choice/feedback içeriği değişir.

### Adım 4: Katman 1 — Evrensel Event Çevirisi

~700 event'in direkt çevirisi:
- Event text (statik string'ler)
- Choice text
- Feedback text
- Dynamic text callback'leri: İçerideki string'ler çevrilir, mantık aynı kalır
- dynamicFeedback varyantları

Çeviri yöntemi: AI-destekli ilk çeviri + manuel review

### Adım 5: Katman 2 — Kültürel Adaptasyon

~400 event'in kültürel karşılığının yazılması:

**turkishEvents.ts → westernEvents.ts örnekleri:**
- `tr_bayram_sabahi` → `en_holiday_morning` (Christmas/Thanksgiving sabahı)
- `tr_ramazan_iftar` → `en_family_dinner_tradition` (aile yemeği geleneği)
- `tr_kurban_bayrami` → `en_thanksgiving_feast` (Şükran Günü)
- `tr_komsu_ziyaret` → `en_neighborhood_visit` (komşu BBQ/block party)
- `tr_esnaf_baba` → `en_small_business_dad` (aile işletmesi)

**Adaptasyon kuralları:**
- Mekanik (effect, stat, age range, personality req) aynen kalır
- Sadece narrative içerik (text, choice text, feedback) değişir
- Event ID'si farklı olabilir ama aynı slot'a map'lenir

### Adım 6: NPC İsimleri ve Kültürel Veriler

- `gameUtils.ts`'deki 150+ Türkçe NPC ismi → locale-aware isim havuzu
- `tr`: Ayşe, Mehmet, Fatma, Ali...
- `en`: Emma, James, Sarah, Michael...
- İsim havuzu locale'e göre seçilir

### Adım 7: Achievement Lokalizasyonu

67 achievement'ın isim + açıklaması:
- `strings.ts`'e `achievement.{id}.name` ve `achievement.{id}.description` olarak ekle
- `achievementDefinitions.ts`'de hardcoded string yerine `t()` çağrısı kullan

### Adım 8: Test ve Doğrulama

- Tüm event dosyalarının İngilizce karşılığının mevcut olduğunu doğrulayan CI testi
- Missing translation key tespiti (dev mode'da console.warn)
- Event ID eşleştirme testi: TR ve EN havuzlarında aynı ID'ler olmalı (Katman 1)
- Kültürel adaptasyon event'lerinin mekanik eşdeğerlilik testi

## Dosya Değişiklik Özeti

| Dosya | Değişiklik Türü |
|-------|----------------|
| `src/i18n/strings.ts` | ~340 yeni string (tr+en) |
| `src/i18n/eventStrings.ts` | Yeni — event-specific string registry (opsiyonel) |
| `src/data/events.ts` | Locale-aware loading |
| `src/data/locales/en/*.ts` | Yeni — 13+ İngilizce event dosyası |
| `src/data/locales/tr/*.ts` | Mevcut dosyalar taşınır |
| `src/components/FeedbackOverlay.tsx` | Hardcode → t() (~60 string) |
| `src/components/StatusHeader.tsx` | Hardcode → t() (~15 string) |
| `src/screens/GameScreen.tsx` | Hardcode → t() (~20 string) |
| `src/screens/GameOverScreen.tsx` | Hardcode → t() (~15 string) |
| `src/systems/TurnMediator.ts` | Hardcode → t() (~10 string) |
| `src/utils/endingResolver.ts` | Hardcode → t() (~40 string) |
| `src/utils/gameUtils.ts` | NPC isimleri locale-aware + hata mesajları t() |
| `src/systems/achievementDefinitions.ts` | Hardcode → t() (~134 string) |
| `src/builders/EventBuilder.ts` | Değişiklik yok |
| `src/types/events.ts` | Değişiklik yok |
| `package.json` | `expo-localization` eklenir |

## Uygulama Sırası

1. **Adım 1** (1-2 gün): i18n altyapısı genişletme + expo-localization
2. **Adım 2** (2-3 gün): UI hardcode string migration (~340 string)
3. **Adım 3** (1-2 gün): Event lokalizasyon altyapısı (loader + folder structure)
4. **Adım 4** (5-7 gün): Katman 1 evrensel event çevirisi (~700 event)
5. **Adım 5** (5-7 gün): Katman 2 kültürel adaptasyon (~400 event)
6. **Adım 6** (1 gün): NPC isimleri locale-aware
7. **Adım 7** (1-2 gün): Achievement lokalizasyonu
8. **Adım 8** (1-2 gün): Test ve doğrulama

**Toplam: ~18-26 gün**

## Riskler ve Dikkat Noktaları

1. **Dinamik text callback'ler:** `(ctx) => string` fonksiyonlarının İngilizce karşılığı aynı mantıkla ama farklı string'lerle yazılmalı
2. **Event ID tutarlılığı:** Katman 1'de TR ve EN event ID'leri aynı kalmalı (save uyumluluğu)
3. **Katman 2'de mekanik eşdeğerlik:** westernEvents'teki effect/stat değerleri turkishEvents ile aynı olmalı
4. **Bundle size:** İki locale'in tüm event dosyaları bundle'a girer — lazy loading düşünülebilir
5. **Mevcut save'ler:** Dil değiştirildiğinde mevcut save'lerin event history'si (event ID) geçerli kalmalı
