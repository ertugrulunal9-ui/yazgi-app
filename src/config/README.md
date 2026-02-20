# Yazgı Game Balance Config - README

**Versiyon:** 2.0  
**Son Güncelleme:** Ocak 2026  
**Durum:** Production Ready

## 📋 Dosya Yapısı

```
src/config/
├── gameBalance.ts          # Tum sayisal degerlerin tanimi (Config)
├── MIGRATION_GUIDE.md      # Hard-coded degerlerden gecis rehberi
└── README.md               # Bu dosya
```

## 🚀 Hızlı Başlangıç

### 1. Import Edin

```typescript
import {
  INITIAL_STATS,
  STUDY_ACTIONS,
  JOBS,
  FAMILY_SYSTEM,
  calculateGradeFormula,
  calculateDiminishingReturns,
  calculateInheritance,
} from './config/gameBalance';
```

### 2. Değeri Kullanın

```typescript
// Başlangıç stats'ını oluştur
const stats: Stats = {
  health: INITIAL_STATS.health,           // 70
  intelligence: INITIAL_STATS.intelligence, // 0
  // ...
};

// Ders çalışma maliyeti
const cost = STUDY_ACTIONS.math.energyCost;  // 40

// Aile başlangıç parası
const money = FAMILY_SYSTEM.initialMoney['RICH'];  // 1500

// Not hesapla (formula)
const grade = calculateGradeFormula(
  75,           // intelligence
  60,           // energy
  5,            // luck
  ['GENIUS']    // traits
);
```

### 3. Bitti! 🎉

## 📚 Config Bölümleri

### Core Stats
- `INITIAL_STATS` - Oyunun başında verilen istatistikler
- `AGE_BASED_STAT_CAPS` - Yaşa göre stat üst sınırları

### Aktiviteler
- `STUDY_ACTIONS` - Ders çalışma (Math, Science, Language, Art)
- `SPORTS_ACTIONS` - Spor yapma
- `COMPUTER_ACTIONS` - Bilgisayar/Kodlama
- `ART_ACTIONS` - Sanat yapma
- `JOBS` - İş sistemleri (Çocukluk işleri, Garson, Özel ders, Yazılımcı)

### Sosyal Sistem
- `SOCIAL_INTERACTION` - NPC ilişkisi thresholdları
- `FAMILY_SYSTEM` - Aile serveti, allowance, miras
- `FAMILY_REACTION_EFFECTS` - Rapor kartına aile tepkisi

### Okul Sistemi
- `SCHOOL_SYSTEM` - Not hesaplama, rapor kartı
- `GRADE_THRESHOLDS` - A, B, C, D, F notları

### Mekanikler
- `ENERGY_SYSTEM` - Enerji üst sınırları
- `STAT_GAIN_FORMULA` - Diminishing returns (azalan getiri)
- `DISCIPLINE_MECHANICS` - Disiplin bonusu/cezası
- `STREAK_SYSTEM` - Seri bonusları
- `CLUMSINESS_MECHANICS` - Sakarlık penaltisi

### Özellikler
- `GENETIC_TRAITS` - Doğuştan gelen özellikler
- `ACQUIRED_TRAITS` - Kazanılan özellikler
- `TRAIT_FORMATION` - Özellik oluşum koşulları
- `INNATE_TALENTS` - Doğuştan yeteneği (Coding, Music, Sports)

### Diğer
- `AGE_PROGRESSION` - Yaş ilerleme periyodu
- `TURN_MECHANICS` - Tur sistemi
- `GAME_BALANCE_CONFIG` - Tüm config bir obje halinde

## 🔧 Değer Değiştirme

### Basit Değer Değiştirme

```typescript
// ❌ YANLIŞ - Doğrudan config objesi değiştirme
STUDY_ACTIONS.math.energyCost = 20;

// ✅ DOĞRU - Yeni obje oluştur
const customStudyActions = {
  ...STUDY_ACTIONS,
  math: {
    ...STUDY_ACTIONS.math,
    energyCost: 20,
  },
};
```

### Tüm Config'i Kopyala

```typescript
import { GAME_BALANCE_CONFIG } from './config/gameBalance';

const customConfig = { ...GAME_BALANCE_CONFIG };
```

## 📖 Formüller (Helper Functions)

Config dosyasında export edilen yardımcı fonksiyonlar:

### `calculateGradeFormula(intelligence, energy, luck, traits)`
Okul notunu hesapla.

```typescript
const grade = calculateGradeFormula(75, 60, 5, ['GENIUS']);
// Zeka(75) * 1.2 - Stress(40*0.15) + Luck(5) + Bonuses = ~95
```

### `calculateDiminishingReturns(currentValue, baseGain, cap)`
Azalan getiri (stat cap'e yaklaştıkça kazanım azalır).

```typescript
const gain = calculateDiminishingReturns(50, 10, 100);
// 50 < 70 → full gain = 10

const gain2 = calculateDiminishingReturns(75, 10, 100);
// 70-100 → half gain = 5

const gain3 = calculateDiminishingReturns(105, 10, 100);
// >100 → minimal gain = 2
```

### `calculateInheritance(wealth, dynamic, familyRelation)`
18 yaşında almacak miras hesapla.

```typescript
const inheritance = calculateInheritance('RICH', 'SUPPORTIVE', 80);
// Base: 50000 * (0.5 + 0.8) = 65000₺
```

### `calculateEnergyCost(baseCost, traits)`
Traits'in etkisi ile enerji maliyetini hesapla.

```typescript
const cost = calculateEnergyCost(40, ['ATHLETIC', 'DISCIPLINED']);
// 40 * (1 - 0.15 - 0.15) = 32
```

## 🎮 Oyun Dengesi (Balancing)

### Zorluk Seviyesi Değiştirme

**Daha Zor:**
```typescript
// energyCost yükselt
STUDY_ACTIONS.math.energyCost = 50;  // 40'dan

// moneyGain düşür
JOBS.tutor.moneyGain = 50;  // 100'den

// stat gain düşür
STAT_GAIN_FORMULA.midGameRatio = 0.3;  // 0.5'den
```

**Daha Kolay:**
```typescript
// energyCost düşür
STUDY_ACTIONS.math.energyCost = 30;  // 40'dan

// moneyGain yükselt
JOBS.tutor.moneyGain = 150;  // 100'den

// stat gain yükselt
STAT_GAIN_FORMULA.midGameRatio = 0.7;  // 0.5'den
```

### Aileyi Daha Önemli Yapma

```typescript
// Allowance yükselt
FAMILY_SYSTEM.allowance.MIDDLE = 100;  // 50'den

// İnheritance multiplier yükselt (familyRelation'ın etkisi)
// calculateInheritance fonksiyonunda relationMultiplier değiştir

// Aile rapor kartı bonusu yükselt
FAMILY_REACTION_EFFECTS.supportiveGoodGrades.familyRelation = 25;  // 15'den
```

## ⚠️ Dikkat Edilmesi Gerekenler

### 1. Stat Capping
Tüm stats (energy hariç) 0-100 arasında clamp'lanır. Config değeri bu aralığı aşarsa sorun olur.

```typescript
// ❌ YANLIŞ
INITIAL_STATS.health = 150;  // Max 100

// ✅ DOĞRU
INITIAL_STATS.health = 70;
```

### 2. Enum Values
Family wealth ve dynamic enum'lar sabittir.

```typescript
// ✅ DOĞRU
const wealth: FamilyWealth = 'POOR';

// ❌ YANLIŞ
const wealth: FamilyWealth = 'VERY_POOR';
```

### 3. Type-Safety
Config'deki türler TypeScript tarafından enforce edilir.

```typescript
// ❌ YANLIŞ - Type error!
const cost: number = STUDY_ACTIONS.invalid;

// ✅ DOĞRU
const cost: number = STUDY_ACTIONS.math.energyCost;
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Early game (0-7): Stats cap işliyor mu?
- [ ] Mid game (7-14): Diminishing returns işliyor mu?
- [ ] Late game (14-18): Para sistemi balanced mi?
- [ ] Family system: Aile dinamiği reward/ceza veriyor mu?
- [ ] School: Notlar intelligence'a bağlı mı?
- [ ] Traits: Bonuslar doğru hesaplanıyor mu?

### Debug Modunda Test

```typescript
// console.log ile değerleri kontrol et
console.log('Study math cost:', STUDY_ACTIONS.math.energyCost);
console.log('Inheritance (RICH, SUPPORTIVE, 80):', 
  calculateInheritance('RICH', 'SUPPORTIVE', 80));

// Runtime'da değerleri değiştir ve test et
const testGrade = calculateGradeFormula(90, 80, 5, ['GENIUS', 'BOOKWORM']);
console.log('Test grade:', testGrade);  // Beklenen: ~105-110
```

## 📊 Performance

Config dosyası:
- **Compile-time'da evaluated**: Runtime performans etkisi yok
- **Tree-shakeable**: Kullanılmayan values include edilmez
- **Zero runtime cost**: Sadece import ve read işlemleri

## 🔄 Version Control

Config değişiklikleri git history'de görülebilir:

```bash
git log --oneline src/config/gameBalance.ts
# Tüm değişiklikleri takip et

git diff src/config/gameBalance.ts
# Ne değiştiğini gör
```

## 📞 İletişim

- **Sorular?** Bu README ve MIGRATION_GUIDE.md dosyalarini kontrol edin
- **Migration?** MIGRATION_GUIDE.md'yi oku
- **Yeni sistem?** Bölüm ekle ve comment yaz

## 🎯 Best Practices

1. **Yorum Ekle**: Neden bu değer seçildiğini açıkla
2. **Type-Safe**: TypeScript errors'ı ignore etme
3. **Test Et**: Değişiklik yaptıktan sonra oyunu test et
4. **Git Commit**: Anlamlı commit message'ları yaz
5. **Dokumentasyon**: Yeni sistem eklersen burada dökümente et

## 📝 Config Template (Yeni Sistem Eklemek İçin)

```typescript
// src/config/gameBalance.ts

export const NEW_SYSTEM = {
  /** Parametresi 1 açıklaması */
  param1: 100,
  
  /** Parametresi 2 açıklaması */
  param2: {
    subParam: 50,
  },
} as const;

// Eğer formül gerekirse:
export const calculateNewSystemFormula = (
  input: number,
  modifier: number
): number => {
  return input * modifier;
};
```

## 🚀 Roadmap

- [ ] Admin panel (in-game config değiştirme)
- [ ] A/B testing support
- [ ] Dynamic balancing (player data'ya göre otomatik ayar)
- [ ] Config versioning (rollback support)

---

**Son Güncelleme:** January 2026  
**Durum:** Production Ready  
**Feedback:** Issues'ta rapor edin
