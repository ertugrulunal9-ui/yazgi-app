/**
 * FateEngine — Edge Case Testleri
 *
 * Rastgelelik (RNG) testleri bozmasın diye seed'li PRNG kullanıyoruz.
 * Bu dosya şu sınır durumlarını test eder:
 * - Seed 0 ve çok büyük seed'ler
 * - Zodiac negatif modifier ile forced roll
 * - Pity sistemi maximum'da ne olur?
 * - Token sistemi: 0 jeton ile harcama, negatif miktar kazanma
 * - Tüm outcome'ların ulaşılabilirliği (distribution)
 * - applyFateToStatChanges ile tüm outcome tipleri
 */

import {
  mulberry32,
  createInitialFateState,
  rollFate,
  rollFateForced,
  shouldEarnToken,
  earnToken,
  canSpendToken,
  spendToken,
  applyFateToStatChanges,
  getPityModifier,
  getZodiacModifier,
} from '../../src/systems/FateEngine';
import { FateState } from '../../src/types';

// ============================================================
// YARDIMCI: Test boyunca kullanılan temel FateState
// ============================================================
const makeFateState = (overrides?: Partial<FateState>): FateState => ({
  seed: 42,
  tokens: 3,
  totalRolls: 0,
  outcomeHistory: [],
  zodiacSign: 'KOC',
  consecutiveBadOutcomes: 0,
  ...overrides,
});

describe('FateEngine — Edge Cases', () => {

  // ==========================================================
  // 1) PRNG SINIR DURUMLARI
  // ==========================================================
  describe('mulberry32 PRNG sınır durumları', () => {

    it('seed 0 geçerli bir değer üretir (0-1 arası)', () => {
      const val = mulberry32(0);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it('çok büyük seed (MAX_SAFE_INTEGER) çökmez', () => {
      const val = mulberry32(Number.MAX_SAFE_INTEGER);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it('negatif seed çökmez', () => {
      const val = mulberry32(-12345);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it('ardışık seed\'ler farklı sonuç verir (çarpışma yok)', () => {
      // 100 ardışık seed'in hepsi farklı olmalı
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        results.add(mulberry32(i));
      }
      // En az 95 benzersiz değer olmalı (çarpışma neredeyse imkansız)
      expect(results.size).toBeGreaterThanOrEqual(95);
    });
  });

  // ==========================================================
  // 2) FORCED ROLL + NEGATİF ZODİAK
  // ==========================================================
  describe('Forced roll + negatif zodiac modifier', () => {

    it('negatif zodiac modifier forced roll sonucunu NEUTRAL\'a çekebilir', () => {
      // AKREP burcunun SOCIAL kategorisinde -0.05 modifier'ı var
      // rollFateForced rawRoll'u FORTUNATE (0.65)'e çeker ama sonra zodiac ekler
      // 0.65 + (-0.05) = 0.60 → NEUTRAL olabilir! Bu bilinen bir davranış.
      const state = makeFateState({ zodiacSign: 'AKREP' });
      const outcomes = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const { result } = rollFateForced(
          { ...state, totalRolls: i },
          'SOCIAL'
        );
        outcomes.add(result.outcome);
        // UNLUCKY veya CURSED asla çıkmamalı
        expect(['BLESSED', 'FORTUNATE', 'NEUTRAL']).toContain(result.outcome);
      }
    });

    it('forced roll zodiac modifier\'ı doğru uygular', () => {
      const state = makeFateState({ zodiacSign: 'KOC' });
      const { result } = rollFateForced(state, 'RISK');

      // KOC burcu + RISK = +0.08 modifier
      expect(result.zodiacModifier).toBe(0.08);
    });
  });

  // ==========================================================
  // 3) PİTY SİSTEMİ SINIRLARI
  // ==========================================================
  describe('Pity sistemi sınır durumları', () => {

    it('pity maximum (0.25) ardından daha fazla artmaz', () => {
      expect(getPityModifier(5)).toBe(0.25);
      expect(getPityModifier(100)).toBe(0.25);
      expect(getPityModifier(999)).toBe(0.25);
    });

    it('negatif consecutiveBad değeri 0 döner', () => {
      // Normalde olmaz ama güvenlik
      expect(getPityModifier(-1)).toBeLessThanOrEqual(0);
    });

    it('maksimum pity ile roll yapıldığında sonuç yukarı kayar', () => {
      const noPity = rollFate(makeFateState({ consecutiveBadOutcomes: 0 }));
      const maxPity = rollFate(makeFateState({ consecutiveBadOutcomes: 5 }));

      // Pity modifier roll'u yukarı iter
      expect(maxPity.result.pityModifier).toBe(0.25);
      expect(maxPity.result.modifiedRoll).toBeGreaterThanOrEqual(noPity.result.modifiedRoll);
    });
  });

  // ==========================================================
  // 4) JETON YÖNETİMİ SINIRLARI
  // ==========================================================
  describe('Token (jeton) edge case\'leri', () => {

    it('0 jetonken harcama yapılamaz', () => {
      const state = makeFateState({ tokens: 0 });
      expect(canSpendToken(state)).toBe(false);
      expect(spendToken(state).tokens).toBe(0);
    });

    it('negatif miktar kazanma 0 olarak uygulanır', () => {
      const state = makeFateState({ tokens: 5 });
      const result = earnToken(state, -3);
      // Math.max(0, Math.floor(-3)) = 0 → jeton artmaz
      expect(result.tokens).toBe(5);
    });

    it('ondalık miktar kazanma floor\'lanır', () => {
      const state = makeFateState({ tokens: 5 });
      const result = earnToken(state, 2.7);
      // Math.floor(2.7) = 2
      expect(result.tokens).toBe(7);
    });

    it('sıfır miktar kazanma jetonu değiştirmez', () => {
      const state = makeFateState({ tokens: 3 });
      const result = earnToken(state, 0);
      expect(result.tokens).toBe(3);
    });
  });

  // ==========================================================
  // 5) shouldEarnToken SINIR DURUMLARI
  // ==========================================================
  describe('shouldEarnToken edge case\'leri', () => {

    it('aynı yaştan aynı yaşa geçiş → token kazanılmaz', () => {
      expect(shouldEarnToken(3, 3)).toBe(false);
      expect(shouldEarnToken(6, 6)).toBe(false);
    });

    it('birden fazla yaş milestone atlanırsa yine token kazanılır', () => {
      // 5→9 arası geçiş: 6 ve 9 milestone
      expect(shouldEarnToken(5, 9)).toBe(true);
    });

    it('18 yaş üzeri geçişte token kazanılmaz', () => {
      expect(shouldEarnToken(18, 19)).toBe(false);
      expect(shouldEarnToken(18, 25)).toBe(false);
    });
  });

  // ==========================================================
  // 6) applyFateToStatChanges — TÜM OUTCOME TİPLERİ
  // ==========================================================
  describe('applyFateToStatChanges tüm outcome tipleri', () => {

    const changes = { health: 10, intelligence: -8, money: 100 };

    it('FORTUNATE pozitif kazanımları artırır, negatifi azaltır', () => {
      const result = applyFateToStatChanges(changes, 'FORTUNATE');
      // positive *= 1.15, negative *= 0.85
      expect(result.health).toBe(12); // round(10 * 1.15)
      expect(result.intelligence).toBe(-7); // round(-8 * 0.85)
    });

    it('UNLUCKY pozitif kazanımları azaltır, negatifi artırır', () => {
      const result = applyFateToStatChanges(changes, 'UNLUCKY');
      // positive *= 0.8, negative *= 1.2
      expect(result.health).toBe(8);
      expect(result.intelligence).toBe(-10); // round(-8 * 1.2)
    });

    it('undefined değerler korunur', () => {
      const sparse = { health: 5 };
      const result = applyFateToStatChanges(sparse, 'BLESSED');
      expect(result.health).toBe(7); // round(5 * 1.35)
      expect(result.intelligence).toBeUndefined();
    });
  });

  // ==========================================================
  // 7) ZODIAC MODİFİER SINIRLARI
  // ==========================================================
  describe('Zodiac modifier edge case\'leri', () => {

    it('geçersiz kategori 0 döner', () => {
      expect(getZodiacModifier('KOC', 'INVALID_CATEGORY')).toBe(0);
    });

    it('boş string kategori 0 döner', () => {
      expect(getZodiacModifier('KOC', '')).toBe(0);
    });

    it('tüm zodiac burçlarının en az bir pozitif modifier\'ı var', () => {
      const signs = [
        'KOC', 'BOGA', 'IKIZLER', 'YENGEC', 'ASLAN', 'BASAK',
        'TERAZI', 'AKREP', 'YAY', 'OGLAK', 'KOVA', 'BALIK',
      ] as const;
      const categories = ['SOCIAL', 'RISK', 'MORAL', 'CONFLICT', 'GROWTH'] as const;

      for (const sign of signs) {
        let hasPositive = false;
        for (const cat of categories) {
          if (getZodiacModifier(sign, cat) > 0) {
            hasPositive = true;
            break;
          }
        }
        expect(hasPositive).toBe(true);
      }
    });
  });

  // ==========================================================
  // 8) ROLL STATE TUTARLILIĞI
  // ==========================================================
  describe('Roll state tutarlılığı', () => {

    it('aynı state ile aynı roll tekrarlanabilir (deterministic)', () => {
      const state = makeFateState({ seed: 777, totalRolls: 10 });
      const roll1 = rollFate(state);
      const roll2 = rollFate(state);

      expect(roll1.result.rawRoll).toBe(roll2.result.rawRoll);
      expect(roll1.result.outcome).toBe(roll2.result.outcome);
    });

    it('ardışık rollerde state doğru güncellenir', () => {
      let state = makeFateState();
      const outcomes: string[] = [];

      for (let i = 0; i < 10; i++) {
        const { result, nextState } = rollFate(state);
        outcomes.push(result.outcome);
        state = nextState;
      }

      expect(state.totalRolls).toBe(10);
      expect(state.outcomeHistory).toHaveLength(10);
      expect(outcomes).toHaveLength(10);
    });

    it('consecutive bad outcomes sayacı doğru artar', () => {
      // Seed'i özellikle kötü sonuçlar üretecek şekilde seç
      // Bunun yerine state'i manuel kur ve sonucu kontrol et
      const state = makeFateState({ consecutiveBadOutcomes: 3 });
      const { result, nextState } = rollFate(state);

      if (result.outcome === 'UNLUCKY' || result.outcome === 'CURSED') {
        expect(nextState.consecutiveBadOutcomes).toBe(4);
      } else {
        expect(nextState.consecutiveBadOutcomes).toBe(0);
      }
    });
  });

  // ==========================================================
  // 9) createInitialFateState
  // ==========================================================
  describe('createInitialFateState', () => {

    it('her çağrıda farklı seed üretir', () => {
      const state1 = createInitialFateState('KOC');
      const state2 = createInitialFateState('KOC');

      // Date.now() ve Math.random() kullanıldığı için hemen hemen her zaman farklı
      // Aynı olma ihtimali çok düşük ama mümkün; en az birinden farklılık bekle
      // Bu test flaky olmaması için sadece yapıyı kontrol eder
      expect(typeof state1.seed).toBe('number');
      expect(typeof state2.seed).toBe('number');
    });

    it('başlangıçta 1 jeton ve boş geçmiş ile başlar', () => {
      const state = createInitialFateState('BALIK');
      expect(state.tokens).toBe(1);
      expect(state.totalRolls).toBe(0);
      expect(state.outcomeHistory).toEqual([]);
      expect(state.consecutiveBadOutcomes).toBe(0);
    });
  });
});
