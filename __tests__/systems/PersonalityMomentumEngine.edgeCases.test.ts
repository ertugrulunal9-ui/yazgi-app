/**
 * PersonalityMomentumEngine — Edge Case Testleri
 *
 * Bu dosya şu sınır durumlarını test eder:
 * - Multiplier 2.5x capine ulaşma ve aşmama
 * - Tüm eğilimler aynı anda aktif olabilir mi?
 * - null/undefined state ile çökme kontrolü
 * - Streak 0'dan geri gelmesi
 * - inferMomentumSignal — farklı sinyal kaynakları
 * - Opposite sinyaller ve crisis soft-fall birleşimi
 */

import {
  createInitialPersonalityState,
  applyMomentumSignal,
  getMultiplierForStreak,
  getMomentumMultiplierForStat,
  normalizePersonalityState,
  getDominantTendency,
  isSpecialPathUnlocked,
  getSpecialPathProgress,
  getUnlockedTendencies,
  inferMomentumSignalFromPersonalityEffects,
  inferMomentumSignalFromStatEffect,
  resolveMomentumSignal,
} from '../../src/systems/PersonalityMomentumEngine';

describe('PersonalityMomentumEngine — Edge Cases', () => {

  // ==========================================================
  // 1) MULTİPLİER CAP TESTİ
  // ==========================================================
  describe('Multiplier 2.5x capını aşmaz', () => {

    it('çok uzun streak bile 2.5x üzerine çıkmaz', () => {
      let state = createInitialPersonalityState();

      // 50 ardışık HELPFUL sinyali gönder
      for (let i = 0; i < 50; i++) {
        state = applyMomentumSignal(state, 'HELPFUL').nextState;
      }

      expect(state.HELPFUL.multiplier).toBeLessThanOrEqual(2.5);
      expect(state.HELPFUL.streak).toBe(50);
      expect(state.HELPFUL.count).toBe(50);
    });

    it('getMultiplierForStreak 1000 streak → 2.5 cap', () => {
      expect(getMultiplierForStreak(1000)).toBe(2.5);
    });

    it('streak < 3 → multiplier her zaman 1.0', () => {
      expect(getMultiplierForStreak(0)).toBe(1);
      expect(getMultiplierForStreak(1)).toBe(1);
      expect(getMultiplierForStreak(2)).toBe(1);
    });

    it('streak tam 3 → multiplier artmaya başlar', () => {
      expect(getMultiplierForStreak(3)).toBeGreaterThan(1);
    });
  });

  // ==========================================================
  // 2) NULL/UNDEFINED STATE KORUNMASI
  // ==========================================================
  describe('null/undefined state güvenliği', () => {

    it('normalizePersonalityState undefined → default state döner', () => {
      const result = normalizePersonalityState(undefined);

      expect(result.HELPFUL.count).toBe(0);
      expect(result.HELPFUL.streak).toBe(0);
      expect(result.HELPFUL.multiplier).toBe(1);
      expect(result.PRAGMATIC.multiplier).toBe(1);
      expect(result.AGGRESSIVE.multiplier).toBe(1);
    });

    it('applyMomentumSignal undefined state ile çökmez', () => {
      const result = applyMomentumSignal(undefined, 'HELPFUL');

      expect(result.nextState.HELPFUL.count).toBe(1);
      expect(result.nextState.HELPFUL.streak).toBe(1);
    });

    it('applyMomentumSignal null sinyal ile state değişmez', () => {
      const state = createInitialPersonalityState();
      const result = applyMomentumSignal(state, null);

      expect(result.nextState).toEqual(state);
      expect(result.signal).toBeNull();
      expect(result.tendency).toBeNull();
    });

    it('getMomentumMultiplierForStat undefined state → 1.0', () => {
      const result = getMomentumMultiplierForStat('charisma', undefined);
      expect(result.multiplier).toBe(1);
      expect(result.tendency).toBeNull();
    });

    it('getDominantTendency undefined state → null değil', () => {
      const result = getDominantTendency(undefined);
      // Default state'te hepsi eşit, ilk sıradaki döner
      expect(result).not.toBeNull();
    });
  });

  // ==========================================================
  // 3) STREAK KIRILDIKTAN SONRA GERİ DÖNME
  // ==========================================================
  describe('Streak kırılma ve geri dönme', () => {

    it('streak kırıldıktan sonra yeniden başlar', () => {
      let state = createInitialPersonalityState();

      // 5 HELPFUL → streak 5
      for (let i = 0; i < 5; i++) {
        state = applyMomentumSignal(state, 'HELPFUL').nextState;
      }
      expect(state.HELPFUL.streak).toBe(5);

      // Farklı sinyal → streak kırılır
      state = applyMomentumSignal(state, 'PRAGMATIC').nextState;
      expect(state.HELPFUL.streak).toBe(0);
      expect(state.PRAGMATIC.streak).toBe(1);

      // Tekrar HELPFUL → yeniden başlar
      state = applyMomentumSignal(state, 'HELPFUL').nextState;
      expect(state.HELPFUL.streak).toBe(1);
      expect(state.HELPFUL.count).toBe(6); // Toplam sayı korunur
    });

    it('opposite sinyal + kriz bağlamı → %70 korunur', () => {
      let state = createInitialPersonalityState();

      // 10 HELPFUL streak kur
      for (let i = 0; i < 10; i++) {
        state = applyMomentumSignal(state, 'HELPFUL').nextState;
      }

      // Kriz bağlamında SELFISH → %70 korunur
      const crisisResult = applyMomentumSignal(state, 'SELFISH', { isCrisisContext: true });
      expect(crisisResult.nextState.HELPFUL.streak).toBe(7); // floor(10 * 0.7)

      // Normal bağlamda SELFISH → ağır darbe
      const normalResult = applyMomentumSignal(state, 'SELFISH');
      expect(normalResult.nextState.HELPFUL.streak).toBe(2); // floor(10 * 0.2)
    });
  });

  // ==========================================================
  // 4) TÜM EĞİLİMLER İÇİN STAT HARİTALAMASI
  // ==========================================================
  describe('Stat-eğilim haritalaması', () => {

    it('energy hiçbir eğilimle hizalı değil', () => {
      const state = {
        ...createInitialPersonalityState(),
        HELPFUL: { count: 10, streak: 8, multiplier: 1.5 },
      };

      const result = getMomentumMultiplierForStat('energy', state);
      expect(result.multiplier).toBe(1);
      expect(result.tendency).toBeNull();
    });

    it('discipline hem PRAGMATIC hem AGGRESSIVE ile hizalı → en yükseği alır', () => {
      const state = {
        ...createInitialPersonalityState(),
        PRAGMATIC: { count: 5, streak: 4, multiplier: 1.2 },
        AGGRESSIVE: { count: 8, streak: 7, multiplier: 1.4 },
      };

      const result = getMomentumMultiplierForStat('discipline', state);
      expect(result.multiplier).toBe(1.4);
      expect(result.tendency).toBe('AGGRESSIVE');
    });

    it('money PRAGMATIC ile hizalı', () => {
      const state = {
        ...createInitialPersonalityState(),
        PRAGMATIC: { count: 5, streak: 5, multiplier: 1.25 },
      };

      const result = getMomentumMultiplierForStat('money', state);
      expect(result.multiplier).toBe(1.25);
      expect(result.tendency).toBe('PRAGMATIC');
    });
  });

  // ==========================================================
  // 5) SPECIAL PATH UNLOCK
  // ==========================================================
  describe('Special path unlock edge case\'leri', () => {

    it('tam threshold\'da unlock olur', () => {
      const state = {
        ...createInitialPersonalityState(),
        HELPFUL: { count: 10, streak: 8, multiplier: 1.35 },
      };

      expect(isSpecialPathUnlocked(state, 'HELPFUL', 1.35)).toBe(true);
    });

    it('threshold\'un hemen altında unlock olmaz', () => {
      const state = {
        ...createInitialPersonalityState(),
        HELPFUL: { count: 10, streak: 8, multiplier: 1.34 },
      };

      expect(isSpecialPathUnlocked(state, 'HELPFUL', 1.35)).toBe(false);
    });

    it('getSpecialPathProgress 0-1 arası değer döner', () => {
      const state = {
        ...createInitialPersonalityState(),
        PRAGMATIC: { count: 5, streak: 4, multiplier: 1.15 },
      };

      const progress = getSpecialPathProgress(state, 'PRAGMATIC', 1.35);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('getUnlockedTendencies sadece eşiği aşanları döner', () => {
      const state = {
        HELPFUL: { count: 15, streak: 10, multiplier: 1.5 },
        PRAGMATIC: { count: 5, streak: 3, multiplier: 1.1 },
        AGGRESSIVE: { count: 20, streak: 12, multiplier: 2.0 },
      };

      const unlocked = getUnlockedTendencies(state, 1.35);
      expect(unlocked).toContain('HELPFUL');
      expect(unlocked).toContain('AGGRESSIVE');
      expect(unlocked).not.toContain('PRAGMATIC');
    });
  });

  // ==========================================================
  // 6) SİNYAL ÇIKARIMI (inference)
  // ==========================================================
  describe('inferMomentumSignal — sinyal çıkarımı', () => {

    it('boş personality effects → null', () => {
      expect(inferMomentumSignalFromPersonalityEffects([])).toBeNull();
      expect(inferMomentumSignalFromPersonalityEffects(undefined)).toBeNull();
    });

    it('yüksek empathy → HELPFUL', () => {
      const result = inferMomentumSignalFromPersonalityEffects([
        { axis: 'empathy', change: 3 },
      ]);
      expect(result).toBe('HELPFUL');
    });

    it('düşük empathy (negatif) → SELFISH', () => {
      const result = inferMomentumSignalFromPersonalityEffects([
        { axis: 'empathy', change: -3 },
      ]);
      expect(result).toBe('SELFISH');
    });

    it('yüksek courage → AGGRESSIVE', () => {
      const result = inferMomentumSignalFromPersonalityEffects([
        { axis: 'courage', change: 5 },
      ]);
      expect(result).toBe('AGGRESSIVE');
    });

    it('inferMomentumSignalFromStatEffect boş effect → null', () => {
      expect(inferMomentumSignalFromStatEffect(undefined)).toBeNull();
      expect(inferMomentumSignalFromStatEffect({})).toBeNull();
    });

    it('charisma kazanımı → HELPFUL', () => {
      const result = inferMomentumSignalFromStatEffect({ charisma: 10 });
      expect(result).toBe('HELPFUL');
    });

    it('intelligence kazanımı → PRAGMATIC', () => {
      const result = inferMomentumSignalFromStatEffect({ intelligence: 10 });
      expect(result).toBe('PRAGMATIC');
    });
  });

  // ==========================================================
  // 7) resolveMomentumSignal ÖNCELİK SIRASI
  // ==========================================================
  describe('resolveMomentumSignal — öncelik sırası', () => {

    it('momentumTag varsa diğerlerine bakmaz', () => {
      const result = resolveMomentumSignal({
        momentumTag: 'AGGRESSIVE',
        personalityEffects: [{ axis: 'empathy', change: 5 }], // HELPFUL çıkarır
        statEffect: { intelligence: 10 }, // PRAGMATIC çıkarır
      });

      // momentumTag en yüksek öncelikli
      expect(result).toBe('AGGRESSIVE');
    });

    it('momentumTag yoksa personalityEffects\'e bakar', () => {
      const result = resolveMomentumSignal({
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        statEffect: { intelligence: 10 },
      });

      expect(result).toBe('HELPFUL');
    });

    it('ikisi de yoksa statEffect\'e bakar', () => {
      const result = resolveMomentumSignal({
        statEffect: { intelligence: 10, discipline: 5 },
      });

      expect(result).toBe('PRAGMATIC');
    });

    it('hiçbiri yoksa null döner', () => {
      const result = resolveMomentumSignal({});
      expect(result).toBeNull();
    });
  });

  // ==========================================================
  // 8) OPPOSITE SİNYALLER
  // ==========================================================
  describe('Opposite sinyaller detaylı', () => {

    it('IMPULSIVE → PRAGMATIC streak\'ini kırar', () => {
      let state = createInitialPersonalityState();

      // 5 PRAGMATIC streak kur
      for (let i = 0; i < 5; i++) {
        state = applyMomentumSignal(state, 'PRAGMATIC').nextState;
      }
      expect(state.PRAGMATIC.streak).toBe(5);

      // IMPULSIVE → tüm streakler kırılır, PRAGMATIC ağır darbe
      const result = applyMomentumSignal(state, 'IMPULSIVE');
      expect(result.nextState.PRAGMATIC.streak).toBe(1); // floor(5 * 0.2)
    });

    it('PACIFIST → AGGRESSIVE streak\'ini kırar', () => {
      let state = createInitialPersonalityState();

      for (let i = 0; i < 5; i++) {
        state = applyMomentumSignal(state, 'AGGRESSIVE').nextState;
      }

      const result = applyMomentumSignal(state, 'PACIFIST');
      expect(result.nextState.AGGRESSIVE.streak).toBe(1); // floor(5 * 0.2)
    });
  });
});
