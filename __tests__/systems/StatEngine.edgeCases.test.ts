/**
 * StatEngine — Edge Case Testleri
 *
 * Bu dosya "normal yolda" yakalanmayan sınır durumlarını test eder:
 * - Para eksiye düşer mi?
 * - Stat cap sıfır yaşta doğru mu?
 * - Fırsat maliyeti (opportunity cost) doğru çalışıyor mu?
 * - Birden fazla trait çarpanı üst üste biner mi?
 * - Burden %100'e yaklaşınca ne olur?
 */

import { StatEngine } from '../../src/systems/StatEngine';
import { Stats } from '../../src/types';
import { createInitialPersonalityState } from '../../src/systems/PersonalityMomentumEngine';

// ============================================================
// YARDIMCI: Her testte kullanılan temel stat seti
// Kopyala-yapıştır ile yeni testler eklerken bunu değiştir
// ============================================================
const baseStats: Stats = {
  health: 50,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 200,
  energy: 60,
  familyRelation: 60,
};

// Basit config — yaş ve aileyi burada ayarla
const config = (age: number, traits: string[] = []) => ({
  age,
  family: null,
  traits,
});

describe('StatEngine — Edge Cases', () => {

  // ==========================================================
  // 1) PARA SİSTEMİ SINIRLARI
  // ==========================================================
  describe('Para (money) sınır durumları', () => {

    it('para sıfırın altına düşmez (clamp koruması)', () => {
      // Oyuncunun 50 parası var ama -200 kayıp geldi
      const poorStats: Stats = { ...baseStats, money: 50 };
      const result = StatEngine.applyChanges(
        poorStats,
        { money: -200 },
        config(10)
      );

      // Para 0'da kalmalı, negatife gitmemeli
      expect(result.newStats.money).toBe(0);
      expect(result.newStats.money).toBeGreaterThanOrEqual(0);
    });

    it('sıfır paradan çıkış yapılamaz (0 - 100 = 0)', () => {
      const zeroMoney: Stats = { ...baseStats, money: 0 };
      const result = StatEngine.applyChanges(
        zeroMoney,
        { money: -100 },
        config(15)
      );

      expect(result.newStats.money).toBe(0);
    });

    it('para kazanımına diminishing returns uygulanmaz', () => {
      // Para özel: ne kadar çok kazanırsan kazan, azalan getiri yok
      const richStats: Stats = { ...baseStats, money: 9999 };
      const result = StatEngine.applyChanges(
        richStats,
        { money: 500 },
        config(18)
      );

      // Para tam olarak 500 artmalı (diminishing return yok)
      expect(result.newStats.money).toBe(10499);
    });

    it('para Infinity capine takılmaz', () => {
      // Money'nin capı Infinity olmalı
      const result = StatEngine.applyChanges(
        baseStats,
        { money: 1_000_000 },
        config(18)
      );

      expect(result.newStats.money).toBe(1_000_200);
      expect(result.newStats.money).toBeGreaterThan(100);
    });
  });

  // ==========================================================
  // 2) FIRSAT MALİYETİ (Opportunity Cost)
  // ==========================================================
  describe('Fırsat maliyeti — para kazanınca aile ilişkisi düşer', () => {

    it('para kazandığında familyRelation düşer', () => {
      const result = StatEngine.applyChanges(
        baseStats,
        { money: 160 },
        config(14)
      );

      // Her 80 para için -1 aile ilişkisi → 160 / 80 = -2
      expect(result.newStats.familyRelation).toBeLessThan(baseStats.familyRelation);
    });

    it('aile ilişkisi zaten düşükse (<=5) fırsat maliyeti uygulanmaz', () => {
      const lowFamily: Stats = { ...baseStats, familyRelation: 4 };
      const result = StatEngine.applyChanges(
        lowFamily,
        { money: 500 },
        config(16)
      );

      // familyRelation <= 5 iken koruma devreye girer
      expect(result.newStats.familyRelation).toBe(4);
    });

    it('para kaybederken fırsat maliyeti uygulanmaz', () => {
      const result = StatEngine.applyChanges(
        baseStats,
        { money: -100 },
        config(12)
      );

      // Para kaybı → aile ilişkisi değişmemeli
      expect(result.newStats.familyRelation).toBe(baseStats.familyRelation);
    });

    it('familyRelation aynı turn\'de hem effect\'te varsa fırsat maliyeti uygulanmaz', () => {
      // Hem para hem aile ilişkisi aynı anda değişiyorsa, fırsat maliyeti atlanır
      const result = StatEngine.applyChanges(
        baseStats,
        { money: 200, familyRelation: 5 },
        config(14)
      );

      // familyRelation sadece +5 olmalı, ek fırsat maliyeti yok
      expect(result.newStats.familyRelation).toBeGreaterThan(baseStats.familyRelation);
    });
  });

  // ==========================================================
  // 3) YAŞ BAZLI STAT CAP'LERİ
  // ==========================================================
  describe('Yaşa göre stat cap sınırları', () => {

    it('0 yaşında intelligence capı 30 → 30 üzeri çıkılmaz', () => {
      const babyStats: Stats = { ...baseStats, intelligence: 25 };
      const result = StatEngine.applyChanges(
        babyStats,
        { intelligence: 50 },
        config(0)
      );

      // Cap 30 + 10 (soft overshoot) = 40 max
      expect(result.newStats.intelligence).toBeLessThanOrEqual(40);
    });

    it('18 yaşında intelligence capı 100 → tam puan alınabilir', () => {
      const teenStats: Stats = { ...baseStats, intelligence: 90 };
      const result = StatEngine.applyChanges(
        teenStats,
        { intelligence: 20 },
        config(18)
      );

      // 18 yaşında cap 100, 90 + diminished gain ≤ 110
      expect(result.newStats.intelligence).toBeGreaterThan(90);
      expect(result.newStats.intelligence).toBeLessThanOrEqual(110);
    });

    it('tüm istatistikler 0\'a düşebilir', () => {
      const lowStats: Stats = {
        health: 5,
        intelligence: 5,
        charisma: 5,
        discipline: 5,
        money: 5,
        energy: 5,
        familyRelation: 5,
      };

      const result = StatEngine.applyChanges(
        lowStats,
        { health: -100, intelligence: -100, charisma: -100 },
        config(10)
      );

      expect(result.newStats.health).toBe(0);
      expect(result.newStats.intelligence).toBeGreaterThanOrEqual(0);
      expect(result.newStats.charisma).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================
  // 4) BURDEN (Stres Yükü) SINIRLARI
  // ==========================================================
  describe('Burden (stres yükü) edge case\'leri', () => {

    it('burden 100 olduğunda üretkenlik statları %35 ceza alır', () => {
      const result = StatEngine.applyChanges(
        { ...baseStats, intelligence: 20 },
        { intelligence: 10 },
        { age: 15, family: null, traits: [], burdenRisk: 100 }
      );

      // burdenRisk=100 → severity=1.0 → multiplier = 0.65
      // Yani kazanım ciddi şekilde düşmeli
      const noBurden = StatEngine.applyChanges(
        { ...baseStats, intelligence: 20 },
        { intelligence: 10 },
        { age: 15, family: null, traits: [], burdenRisk: 0 }
      );

      expect(result.newStats.intelligence).toBeLessThan(noBurden.newStats.intelligence);
    });

    it('burden 40 ve altında ceza uygulanmaz', () => {
      const resultNoBurden = StatEngine.applyChanges(
        { ...baseStats, intelligence: 20 },
        { intelligence: 10 },
        { age: 15, family: null, traits: [], burdenRisk: 0 }
      );
      const resultBurden40 = StatEngine.applyChanges(
        { ...baseStats, intelligence: 20 },
        { intelligence: 10 },
        { age: 15, family: null, traits: [], burdenRisk: 40 }
      );

      // 40 ve altı → ceza yok, sonuçlar aynı olmalı
      expect(resultBurden40.newStats.intelligence).toBe(resultNoBurden.newStats.intelligence);
    });

    it('burden sadece üretkenlik statlarını etkiler (health etkilenmez)', () => {
      const resultHealth = StatEngine.applyChanges(
        { ...baseStats, health: 20 },
        { health: 10 },
        { age: 15, family: null, traits: [], burdenRisk: 90 }
      );
      const resultNoBurden = StatEngine.applyChanges(
        { ...baseStats, health: 20 },
        { health: 10 },
        { age: 15, family: null, traits: [], burdenRisk: 0 }
      );

      // Health üretkenlik statı DEĞİL → burden etkisi olmamalı
      expect(resultHealth.newStats.health).toBe(resultNoBurden.newStats.health);
    });

    it('burden negatif değişimlere uygulanmaz', () => {
      const result = StatEngine.applyChanges(
        baseStats,
        { intelligence: -10 },
        { age: 15, family: null, traits: [], burdenRisk: 100 }
      );

      // Negatif değişimlerde burden çarpanı çalışmaz
      expect(result.details[0].burdenMultiplier).toBe(1);
    });
  });

  // ==========================================================
  // 5) TRAIT ÇARPANI BİRLEŞİMLERİ
  // ==========================================================
  describe('Trait çarpan birleşimleri', () => {

    it('GENIUS trait\'i intelligence kazanımını artırır', () => {
      const withGenius = StatEngine.applyChanges(
        { ...baseStats, intelligence: 20 },
        { intelligence: 10 },
        config(12, ['GENIUS'])
      );
      const withoutGenius = StatEngine.applyChanges(
        { ...baseStats, intelligence: 20 },
        { intelligence: 10 },
        config(12, [])
      );

      expect(withGenius.newStats.intelligence).toBeGreaterThan(withoutGenius.newStats.intelligence);
    });

    it('SICKLY trait\'i health kazanımını azaltır', () => {
      const withSickly = StatEngine.applyChanges(
        { ...baseStats, health: 20 },
        { health: 10 },
        config(12, ['SICKLY'])
      );
      const withoutSickly = StatEngine.applyChanges(
        { ...baseStats, health: 20 },
        { health: 10 },
        config(12, [])
      );

      expect(withSickly.newStats.health).toBeLessThan(withoutSickly.newStats.health);
    });
  });

  // ==========================================================
  // 6) SIFIR VE BOŞ DEĞİŞİMLER
  // ==========================================================
  describe('Sıfır ve boş değişimler', () => {

    it('boş changes objesiyle statlar değişmez', () => {
      const result = StatEngine.applyChanges(baseStats, {}, config(10));

      expect(result.newStats).toEqual(baseStats);
      expect(result.appliedChanges).toEqual({});
    });

    it('sıfır değerli değişimler atlanır', () => {
      const result = StatEngine.applyChanges(
        baseStats,
        { health: 0, intelligence: 0 },
        config(10)
      );

      expect(result.newStats).toEqual(baseStats);
      expect(result.details).toHaveLength(0);
    });
  });

  // ==========================================================
  // 7) normalizeMoneyToScore
  // ==========================================================
  describe('normalizeMoneyToScore', () => {

    it('negatif para 0 puan verir', () => {
      // Para negatif olamaz ama güvenlik için test
      expect(StatEngine.normalizeMoneyToScore(0, 5)).toBe(0);
    });

    it('7 yaş altı cap 500 → 500 para = 100 puan', () => {
      expect(StatEngine.normalizeMoneyToScore(500, 5)).toBe(100);
    });

    it('7-12 yaş cap 2000 → 1000 para = 50 puan', () => {
      expect(StatEngine.normalizeMoneyToScore(1000, 10)).toBe(50);
    });

    it('büyük para miktarı 100 puanı aşamaz', () => {
      expect(StatEngine.normalizeMoneyToScore(99999, 15)).toBe(100);
    });
  });

  // ==========================================================
  // 8) applyRaw
  // ==========================================================
  describe('applyRaw — ham stat uygulama', () => {

    it('cap 100 olarak uygulanır (diminishing returns olmadan)', () => {
      const result = StatEngine.applyRaw(
        { ...baseStats, health: 95 },
        { health: 20 }
      );

      // applyRaw cap'i 100 olarak hard-code'lar
      expect(result.health).toBe(100);
    });

    it('statlar sıfırın altına düşmez', () => {
      const result = StatEngine.applyRaw(
        { ...baseStats, health: 5 },
        { health: -50 }
      );

      expect(result.health).toBe(0);
    });

    it('para limitinin capı Infinity', () => {
      const result = StatEngine.applyRaw(
        { ...baseStats, money: 50000 },
        { money: 100000 }
      );

      expect(result.money).toBe(150000);
    });
  });

  // ==========================================================
  // 9) getStatChangeNarrativeFeedback
  // ==========================================================
  describe('getStatChangeNarrativeFeedback — anlatı geri bildirimi', () => {

    it('burden cezası yüksekken yorgunluk mesajı döner', () => {
      const result = StatEngine.applyChanges(
        { ...baseStats, intelligence: 20 },
        { intelligence: 10 },
        { age: 15, family: null, traits: [], burdenRisk: 95 }
      );

      const feedback = StatEngine.getStatChangeNarrativeFeedback(result.details);
      expect(feedback).toContain('Çok yorgunsun, kazancın azaldı.');
    });

    it('momentum bonusu aktifken mesaj döner', () => {
      const personalityState = createInitialPersonalityState();
      personalityState.HELPFUL.streak = 5;
      personalityState.HELPFUL.multiplier = 1.25;

      const result = StatEngine.applyChanges(
        { ...baseStats, charisma: 20 },
        { charisma: 5 },
        { age: 15, family: null, traits: [], personalityState }
      );

      const feedback = StatEngine.getStatChangeNarrativeFeedback(result.details);
      expect(feedback).toContain('İvme bonusu aldın!');
    });
  });
});
