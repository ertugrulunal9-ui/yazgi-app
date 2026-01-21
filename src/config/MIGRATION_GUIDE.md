/**
 * YAZGI GAME BALANCE CONFIG - MIGRATION GUIDE
 * ============================================
 * 
 * Eski hard-coded değerlerden yeni gameBalance.ts config'ine
 * nasıl geçiş yapacağınızı gösteren adım adım rehber.
 * 
 * @version 1.0
 * @lastUpdated January 2026
 */

# Migration Guide: Hard-Coded Değerlerden Config'e Geçiş

## Bölüm 1: Giriş

Bu rehber, oyun kodunuzda dağılmış olan sayısal değerleri (magic numbers)
merkezi bir `gameBalance.ts` dosyasından kullanmaya geçişi anlatır.

### Neden migrate etmeli?

✅ **Merkezileştirilmiş Yönetim**: Tüm dengeli değerleri tek yerden görebilir ve değiştirebilirsiniz  
✅ **Type-Safe**: TypeScript ile hataları erkenden yakalayabilirsiniz  
✅ **Kolay Testing**: Değerleri değiştirerek farklı senaryo testleri yapabilirsiniz  
✅ **Sürüm Kontrolü**: Config değişiklikleri git history'de görülür  
✅ **Performans**: Değerleri compile-time'da optimize edebilirsiniz

---

## Bölüm 2: Adım Adım Migration

### Adım 1: gameBalance.ts'yi İmport Edin

**Before (Eski):**
```typescript
// App.tsx
const INITIAL_HEALTH = 70;
const INITIAL_INTELLIGENCE = 0;
const INITIAL_CHARISMA = 10;
const INITIAL_DISCIPLINE = 0;
const INITIAL_MONEY = 0;
const INITIAL_ENERGY = 100;
const INITIAL_FAMILY_RELATION = 50;
```

**After (Yeni):**
```typescript
// App.tsx
import { INITIAL_STATS } from './config/gameBalance';

// Artık şu şekilde kullanabilirsiniz:
const initialHealth = INITIAL_STATS.health;  // 70
const initialIntelligence = INITIAL_STATS.intelligence;  // 0
```

---

### Adım 2: Study Actions'ı Migrate Edin

**Before (Eski - App.tsx içinde):**
```typescript
const processStudyAction = (subject: string) => {
  let cost = 0;
  let intelligenceGain = 0;
  let gradeUpdates: Partial<SchoolGrades> = {};
  
  switch (subject) {
    case 'math':
      cost = 40;
      intelligenceGain = 8;
      gradeUpdates = { math: 3, science: 3 };
      break;
    case 'science':
      cost = 40;
      intelligenceGain = 8;
      gradeUpdates = { science: 3, math: 1 };
      break;
    case 'language':
      cost = 35;
      intelligenceGain = 6;
      gradeUpdates = { language: 3 };
      break;
    case 'art':
      cost = 30;
      intelligenceGain = 4;
      charismaGain = 3;
      break;
  }
};
```

**After (Yeni - App.tsx içinde):**
```typescript
import { STUDY_ACTIONS } from './config/gameBalance';

const processStudyAction = (subject: string) => {
  const actionConfig = STUDY_ACTIONS[subject as keyof typeof STUDY_ACTIONS];
  
  if (!actionConfig) {
    console.error(`Unknown study subject: ${subject}`);
    return;
  }
  
  const cost = actionConfig.energyCost;
  const intelligenceGain = actionConfig.intelligence;
  const gradeUpdates = actionConfig.gradeBoost;
  
  // ... rest of the logic
};
```

---

### Adım 3: Jobs (İş) Sistemini Migrate Edin

**Before (Eski):**
```typescript
const processJob = (jobType: string, playerAge: number) => {
  let cost = 0;
  let moneyGain = 0;
  
  if (jobType === 'chores') {
    if (playerAge < 6) return; // Çok genç
    cost = 10;
    moneyGain = 10;
    disciplineGain = 3;
  } else if (jobType === 'waiter') {
    if (playerAge < 14) return; // Minimum age check
    cost = 40;
    moneyGain = 60;
    charismaGain = 5;
  } else if (jobType === 'tutor') {
    if (playerAge < 14 || stats.intelligence < 70) return;
    cost = 50;
    moneyGain = 100;
  }
  
  // ... process job
};
```

**After (Yeni):**
```typescript
import { JOBS } from './config/gameBalance';

const processJob = (jobType: string, playerAge: number, stats: Stats) => {
  const jobConfig = JOBS[jobType as keyof typeof JOBS];
  
  if (!jobConfig) {
    console.error(`Unknown job: ${jobType}`);
    return { error: "Geçersiz iş türü" };
  }
  
  // Age check
  if (jobConfig.minAge && playerAge < jobConfig.minAge) {
    return { error: `${jobType} için minimum yaş ${jobConfig.minAge}` };
  }
  
  // Stats requirement check
  if (jobConfig.reqStats) {
    const [statKey, minValue] = Object.entries(jobConfig.reqStats)[0];
    if (stats[statKey as StatKey] < minValue) {
      return { error: `Yeterli ${statKey} puanı yok` };
    }
  }
  
  // Job processing
  const energyCost = jobConfig.energyCost;
  const moneyGain = jobConfig.moneyGain;
  
  return {
    success: true,
    energyCost,
    moneyGain,
    effects: {
      charisma: jobConfig.charisma || 0,
      discipline: jobConfig.discipline || 0,
    },
  };
};
```

---

### Adım 4: Family System'i Migrate Edin

**Before (Eski):**
```typescript
const initializeFamily = (wealthLevel: FamilyWealth) => {
  let startingMoney = 0;
  let allowanceAmount = 0;
  
  if (wealthLevel === 'POOR') {
    startingMoney = 50;
    allowanceAmount = 5;
  } else if (wealthLevel === 'MIDDLE') {
    startingMoney = 300;
    allowanceAmount = 50;
  } else if (wealthLevel === 'RICH') {
    startingMoney = 1500;
    allowanceAmount = 250;
  }
  
  return { startingMoney, allowanceAmount };
};
```

**After (Yeni):**
```typescript
import { FAMILY_SYSTEM } from './config/gameBalance';

const initializeFamily = (wealthLevel: FamilyWealth) => {
  const startingMoney = FAMILY_SYSTEM.initialMoney[wealthLevel];
  const allowanceAmount = FAMILY_SYSTEM.allowance[wealthLevel];
  
  return { startingMoney, allowanceAmount };
};

// 18 yaşında miras hesapla
const calculateFinalInheritance = (
  wealth: FamilyWealth,
  dynamic: FamilyDynamic,
  relationScore: number
) => {
  return FAMILY_SYSTEM.inheritance[wealth][dynamic];
};
```

---

### Adım 5: School System'i Migrate Edin

**Before (Eski - schoolLogic.ts içinde):**
```typescript
const calculateGrade = (intelligence: number, energy: number) => {
  const baseScore = intelligence * 1.2;
  const stress = 100 - energy;
  const stressPenalty = stress * 0.15;
  const luck = Math.random() * 10;
  
  return baseScore - stressPenalty + luck;
};

const reportCardFrequency = 5;
const reportCardStartAge = 7;
```

**After (Yeni - schoolLogic.ts içinde):**
```typescript
import { SCHOOL_SYSTEM, calculateGradeFormula } from '../config/gameBalance';

const calculateGrade = (intelligence: number, energy: number, traits: string[]) => {
  const luck = Math.random() * 10;
  return calculateGradeFormula(intelligence, energy, luck, traits);
};

// Config'den değerleri al
const reportCardFrequency = SCHOOL_SYSTEM.reportCardFrequency;  // 5
const reportCardStartAge = SCHOOL_SYSTEM.reportCardStartAge;    // 7
```

---

### Adım 6: Stat Gain Formula'yı Migrate Edin

**Before (Eski - gameUtils.ts içinde):**
```typescript
export const calculateStatGain = (currentValue: number, baseGain: number, cap: number = 100): number => {
  if (baseGain <= 0) return baseGain;
  
  if (currentValue < cap * 0.7) {
    return baseGain;
  } else if (currentValue < cap) {
    return Math.ceil(baseGain * 0.5);
  } else {
    return Math.ceil(baseGain * 0.2);
  }
};
```

**After (Yeni - gameUtils.ts içinde):**
```typescript
import { calculateDiminishingReturns, STAT_GAIN_FORMULA } from '../config/gameBalance';

// Artık yardımcı function kullanılır:
export const calculateStatGain = (currentValue: number, baseGain: number, cap: number = 100): number => {
  return calculateDiminishingReturns(currentValue, baseGain, cap);
};

// Veya doğrudan kullan:
const gainedStats = calculateDiminishingReturns(
  currentIntelligence,  // 75
  baseGain,             // 8
  maxCap                // 100
);
```

---

### Adım 7: Trait Multipliers'ı Migrate Edin

**Before (Eski - gameUtils.ts içinde):**
```typescript
export const getTraitMultiplier = (traitIds: string[], statKey: string): number => {
  let multiplier = 1.0;
  
  traitIds.forEach(id => {
    switch (id) {
      case 'GENIUS':
        if (['intelligence', 'math', 'science', 'language', 'coding', 'design'].includes(statKey)) {
          multiplier += 0.3;
        }
        break;
      case 'ATHLETIC':
        if (['sports', 'health'].includes(statKey)) {
          multiplier += 0.3;
        }
        break;
      case 'CHARISMATIC':
        if (['charisma', 'familyRelation'].includes(statKey)) {
          multiplier += 0.3;
        }
        break;
      // ... more cases
    }
  });
  
  return multiplier;
};
```

**After (Yeni - gameUtils.ts içinde):**
```typescript
import { calculateTraitMultiplier } from '../config/gameBalance';

export const getTraitMultiplier = (traitIds: string[], statKey: string): number => {
  return calculateTraitMultiplier(traitIds, statKey);
};

// Config'den trait bonusları da kontrol etmek istersen:
import { GENETIC_TRAITS, ACQUIRED_TRAITS } from '../config/gameBalance';

// Örn: GENIUS statMultiplier'ı kontrol et
const geniusBonus = GENETIC_TRAITS.GENIUS.statMultiplier;  // 0.3
```

---

## Bölüm 3: Sık Yapılan Değişiklikler

### Örnek 1: Bir Aktivitenin Enerji Maliyetini Değiştir

**Config'de değiştir:**
```typescript
// src/config/gameBalance.ts
export const STUDY_ACTIONS = {
  math: {
    energyCost: 40,  // ← Buradan 35'e değiştir
    // ...
  },
};
```

**Otomatik olarak tüm app'te yansır:**
```typescript
// App.tsx
const energyCost = STUDY_ACTIONS.math.energyCost;  // Artık 35!
```

### Örnek 2: İş Kazancını Ayarla

```typescript
// src/config/gameBalance.ts
export const JOBS = {
  tutor: {
    energyCost: 50,
    moneyGain: 100,  // ← Buradan 120'ye değiştir
  },
};
```

### Örnek 3: Aile Miras Sistemi Değiştir

```typescript
// src/config/gameBalance.ts
export const FAMILY_SYSTEM = {
  inheritance: {
    POOR: { SUPPORTIVE: 1000, STRICT: 500, CHAOTIC: 200 },
    MIDDLE: { SUPPORTIVE: 5000, STRICT: 2500, CHAOTIC: 1000 },
    RICH: { SUPPORTIVE: 50000, STRICT: 25000, CHAOTIC: 10000 },  // ← Değiştir
  },
};
```

---

## Bölüm 4: TypeScript Type Safety

### Avantaj 1: Yanlış İmport Hatalarını Yakala

```typescript
// ❌ YANLIŞ - Compile error!
import { STUDAY_ACTIONS } from './config/gameBalance';  // Typo!

// ✅ DOĞRU
import { STUDY_ACTIONS } from './config/gameBalance';
```

### Avantaj 2: Geçersiz Değerleri Yakala

```typescript
// ❌ YANLIŞ - Type error!
const cost = STUDY_ACTIONS.invalid.energyCost;

// ✅ DOĞRU - TypeScript intellisense yardım eder
const cost = STUDY_ACTIONS.math.energyCost;  // 40
```

### Avantaj 3: İmport Otomatik Tamamla

VSCode'da yazarken:
```typescript
import { ST  // VSCode otomatik önerir:
// - STUDY_ACTIONS
// - SPORTS_ACTIONS
// - STREAK_SYSTEM
```

---

## Bölüm 5: Testing & Balancing

### Scenario 1: Oyunu Daha Zor Yap

```typescript
// gameBalance.ts
export const STUDY_ACTIONS = {
  math: {
    energyCost: 40,   // ← 50'ye yükselt
    intelligence: 8,  // ← 5'e düşür
  },
};

export const JOBS = {
  tutor: {
    moneyGain: 100,  // ← 50'ye düşür
  },
};
```

### Scenario 2: Oyunu Daha Kolay Yap

```typescript
// gameBalance.ts
export const STAT_GAIN_FORMULA = {
  earlyGameRatio: 1.0,  // Aynı kalsın
  midGameRatio: 0.75,   // ← 0.5'den yükselt (daha fazla gain)
  lateGameRatio: 0.35,  // ← 0.2'den yükselt
};
```

### Scenario 3: Aileyi Daha Önemli Yap

```typescript
export const FAMILY_SYSTEM = {
  allowance: {
    POOR: 10,     // ← 5'den yükselt
    MIDDLE: 75,   // ← 50'den yükselt
    RICH: 300,    // ← 250'den yükselt
  },
  
  inheritance: {
    POOR: { SUPPORTIVE: 2000, ... },     // ← Tüm değerleri 2x yap
    MIDDLE: { SUPPORTIVE: 10000, ... },
    RICH: { SUPPORTIVE: 100000, ... },
  },
};
```

---

## Bölüm 6: Hata Ayıklama (Debugging)

### Değerin Nerede Tanımlandığını Bul

```typescript
// 1. VS Code'da Ctrl+Shift+F (Find in Files)
// 2. Arayın: "energyCost: 40"
// 3. Sonuç: src/config/gameBalance.ts:102 STUDY_ACTIONS
```

### Bir Değeri Hızlı Test Et

```typescript
// temporary-test.ts
import { JOBS } from './config/gameBalance';

console.log('Tutor money:', JOBS.tutor.moneyGain);  // 100
console.log('Inheritance test:', calculateInheritance('RICH', 'SUPPORTIVE', 80));  // 65000

// Test ettikten sonra sil
```

### Git diff ile Değişiklikleri Izle

```bash
git diff src/config/gameBalance.ts

# Output:
# - energyCost: 40,
# + energyCost: 35,
```

---

## Bölüm 7: Checklist - Migration Tamamladıktan Sonra

- [ ] gameBalance.ts'yi src/config/ klasörüne koydunuz
- [ ] USAGE_EXAMPLES.ts'yi incelidiniz
- [ ] App.tsx'te tüm hard-coded değerleri değiştirdiniz
- [ ] gameUtils.ts'te stat formüllerini güncellediniz
- [ ] schoolLogic.ts'te okul sistemini güncellediniz
- [ ] Tüm TypeScript compile hataları çözdünüz
- [ ] Oyunu test ettiniz (özellikle early/mid/late game)
- [ ] Git commit yaptınız: "refactor: migrate hardcoded values to gameBalance config"

---

## Bölüm 8: Sık Sorulan Sorular (FAQ)

### S: Config'i değiştirdiğimde oyun reload olur mu?
**C:** Evet, development modda hot reload çalışır. Production'da yeni build yapmanız lazım.

### S: Eski bir yapıda geri dönmek istersen?
**C:** Git'te önceki versiyonu çekebilirsiniz:
```bash
git checkout HEAD~1 src/config/gameBalance.ts
```

### S: Runtime'da config değiştirebilir miyim?
**C:** Teknik olarak yapabilirsiniz ama type-safety'i kaybedersiniz. Tavsiye edilmez.

### S: Başka bir dosyada da config oluşturmalı mıyım?
**C:** Hayır. gameBalance.ts'yi extension yapabilirsiniz (örn: seasonalBalance.ts) ama tüm core değerler burada olmalı.

---

## Bölüm 9: Next Steps

1. **Config'i Genişlet**: Yeni sistem eklerken config'e ekleyin
2. **Admin Panel**: Değerleri in-game değiştirmek istersen admin panel yap
3. **A/B Testing**: Farklı values'lar test et ve analiz et
4. **Version Management**: gameBalance.ts versiyonlandır (v1, v2, etc.)

---

**Migration tamamlandı! 🎉**

Sorularınız varsa src/config/ klasöründeki README.md'yi kontrol edin.

