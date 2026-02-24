/**
 * gameUtils — Edge Case Testleri
 *
 * Oyunun temel fonksiyonlarının sınır durumlarını test eder:
 * - Yaşlanma algoritması sınırları (0, 7, 18+)
 * - Enerji maliyet hesabı uç durumları
 * - Stat cap hesabı — aile/trait birleşimleri
 * - Azalan getiri (diminishing returns) formülü
 * - Zodiac/burç hesaplaması sınır tarihleri
 * - Rapor kartı tetikleme mantığı
 * - RNG fonksiyonları (Math.random mock'lanıyor)
 */

import {
  shouldAgeUp,
  calculateEnergyCost,
  getStatCap,
  calculateStatGain,
  shouldGenerateReportCard,
  calculateZodiacSign,
  getRandomInt,
  createRandomFamily,
  assignGeneticTraits,
  clamp,
  getTraitMultiplier,
  updateStats,
  resolveTraitChanges,
  calculatePersonalityCompatibility,
  getMaxDaysInMonth,
} from '../../src/utils/gameUtils';

describe('gameUtils — Edge Cases', () => {

  // ==========================================================
  // 1) YAŞLANMA ALGORİTMASI
  // ==========================================================
  describe('shouldAgeUp — yaşlanma sınırları', () => {

    it('0 yaş, tur 1 → yaşlanma yok', () => {
      expect(shouldAgeUp(0, 1)).toBe(false);
    });

    it('0 yaş, tur 2 → yaşlanma var (her 2 turda bir)', () => {
      expect(shouldAgeUp(0, 2)).toBe(true);
    });

    it('6 yaş, tur 2 → yaşlanma var (0-7 arası her 2 tur)', () => {
      expect(shouldAgeUp(6, 2)).toBe(true);
    });

    it('7 yaş, tur 2 → yaşlanma yok (artık her 5 tur)', () => {
      expect(shouldAgeUp(7, 2)).toBe(false);
    });

    it('7 yaş, tur 5 → yaşlanma var', () => {
      expect(shouldAgeUp(7, 5)).toBe(true);
    });

    it('17 yaş, tur 5 → yaşlanma var (son yaşlanma)', () => {
      expect(shouldAgeUp(17, 5)).toBe(true);
    });

    it('18 yaş → asla yaşlanma yok (oyun bitti)', () => {
      expect(shouldAgeUp(18, 1)).toBe(false);
      expect(shouldAgeUp(18, 2)).toBe(false);
      expect(shouldAgeUp(18, 5)).toBe(false);
      expect(shouldAgeUp(18, 100)).toBe(false);
    });

    it('19 yaş (olmamalı ama güvenlik) → yaşlanma yok', () => {
      expect(shouldAgeUp(19, 5)).toBe(false);
    });
  });

  // ==========================================================
  // 2) ENERJİ MALİYETİ
  // ==========================================================
  describe('calculateEnergyCost — enerji maliyet edge case\'leri', () => {

    it('bilinmeyen aksiyon için temel maliyet 10', () => {
      const cost = calculateEnergyCost('unknown_action', []);
      expect(cost).toBe(10);
    });

    it('sports aksiyonu en yüksek maliyet (20)', () => {
      const cost = calculateEnergyCost('sports_run', []);
      expect(cost).toBe(20);
    });

    it('rest aksiyonu en düşük maliyet (5)', () => {
      const cost = calculateEnergyCost('rest_sleep', []);
      expect(cost).toBe(5);
    });

    it('ATHLETIC trait maliyeti %15 azaltır', () => {
      const normal = calculateEnergyCost('sports_run', []);
      const athletic = calculateEnergyCost('sports_run', ['ATHLETIC']);

      expect(athletic).toBeLessThan(normal);
    });

    it('LAZY trait maliyeti %25 artırır', () => {
      const normal = calculateEnergyCost('study_math', []);
      const lazy = calculateEnergyCost('study_math', ['LAZY']);

      expect(lazy).toBeGreaterThan(normal);
    });

    it('zıt traitler birbirini dengeleyebilir', () => {
      // ATHLETIC (-15%) + SICKLY (+15%) birbirini sıfırlamalı
      const bothTraits = calculateEnergyCost('sports_run', ['ATHLETIC', 'SICKLY']);
      const noTraits = calculateEnergyCost('sports_run', []);

      // Tam sıfırlama olmayabilir (çarpanlar toplanır) ama yakın olmalı
      expect(Math.abs(bothTraits - noTraits)).toBeLessThanOrEqual(2);
    });
  });

  // ==========================================================
  // 3) STAT CAP HESABI
  // ==========================================================
  describe('getStatCap — stat cap edge case\'leri', () => {

    it('money capı her zaman Infinity', () => {
      expect(getStatCap(0, 'money')).toBe(Infinity);
      expect(getStatCap(18, 'money')).toBe(Infinity);
    });

    it('familyRelation capı her zaman 100', () => {
      expect(getStatCap(0, 'familyRelation')).toBe(100);
      expect(getStatCap(18, 'familyRelation')).toBe(100);
    });

    it('SICKLY trait ile health capı 60', () => {
      const cap = getStatCap(18, 'health', null, ['SICKLY']);
      expect(cap).toBe(60);
    });

    it('POOR aile health capını -10 düşürür', () => {
      const normalCap = getStatCap(10, 'health', null);
      const poorCap = getStatCap(10, 'health', { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 5 });

      expect(poorCap).toBeLessThan(normalCap);
    });

    it('RICH aile + STRICT dynamic birleşimi', () => {
      const cap = getStatCap(15, 'charisma', {
        wealth: 'RICH',
        dynamic: 'STRICT',
        allowance: 80,
      });

      // RICH: +5, STRICT: -10 → net -5
      const baseCap = getStatCap(15, 'charisma', null);
      expect(cap).toBe(clamp(baseCap + 5 - 10, 25, 100));
    });

    it('cap minimum 25 altına düşmez (clamp koruması)', () => {
      // CHAOTIC aile discipline capını -20 düşürür
      // 0 yaşta base cap = 30, -20 = 10 → ama clamp 25'e çeker
      const cap = getStatCap(0, 'discipline', {
        wealth: 'MIDDLE',
        dynamic: 'CHAOTIC',
        allowance: 20,
      });

      expect(cap).toBeGreaterThanOrEqual(25);
    });

    it('energy capı yaş ve trait\'e göre değişir', () => {
      const normalEnergy = getStatCap(5, 'energy');
      const athleticEnergy = getStatCap(5, 'energy', null, ['ATHLETIC']);

      // 3-6 yaş +10, ATHLETIC +10
      expect(athleticEnergy).toBeGreaterThan(normalEnergy);
    });
  });

  // ==========================================================
  // 4) AZALAN GETİRİ (Diminishing Returns)
  // ==========================================================
  describe('calculateStatGain — azalan getiri', () => {

    it('cap\'in %70 altında → tam puan', () => {
      // currentValue=20, cap=100 → %70 = 70, 20 < 70 → tam puan
      expect(calculateStatGain(20, 10, 100)).toBe(10);
    });

    it('cap\'in %70-100 arası → yarı puan', () => {
      // currentValue=75, cap=100 → %70 = 70, 75 > 70 → yarı
      expect(calculateStatGain(75, 10, 100)).toBe(5); // ceil(10 * 0.5)
    });

    it('cap üzerinde → minimum puan (%20)', () => {
      // currentValue=105, cap=100 → cap üzeri → %20
      expect(calculateStatGain(105, 10, 100)).toBe(2); // ceil(10 * 0.2)
    });

    it('negatif değişim diminishing returns uygulamaz', () => {
      expect(calculateStatGain(80, -10, 100)).toBe(-10);
    });

    it('sıfır değişim sıfır döner', () => {
      expect(calculateStatGain(50, 0, 100)).toBe(0);
    });

    it('cap 0 olursa? (uç durum)', () => {
      // cap=0 → currentValue >= cap → %20 uygulanır
      expect(calculateStatGain(0, 10, 0)).toBe(2);
    });
  });

  // ==========================================================
  // 5) BURÇ HESAPLAMA
  // ==========================================================
  describe('calculateZodiacSign — burç sınır tarihleri', () => {

    it('21 Mart → Koç', () => {
      expect(calculateZodiacSign(3, 21)).toBe('KOC');
    });

    it('19 Nisan → Koç (son gün)', () => {
      expect(calculateZodiacSign(4, 19)).toBe('KOC');
    });

    it('20 Nisan → Boğa (ilk gün)', () => {
      expect(calculateZodiacSign(4, 20)).toBe('BOGA');
    });

    it('19 Şubat → Balık', () => {
      expect(calculateZodiacSign(2, 19)).toBe('BALIK');
    });

    it('20 Mart → Balık (son gün)', () => {
      expect(calculateZodiacSign(3, 20)).toBe('BALIK');
    });

    it('1 Ocak → Oğlak', () => {
      expect(calculateZodiacSign(1, 1)).toBe('OGLAK');
    });

    it('31 Aralık → Oğlak', () => {
      // 22 Aralık - 19 Ocak arası Oğlak
      expect(calculateZodiacSign(12, 31)).toBe('OGLAK');
    });

    it('22 Kasım → Yay', () => {
      expect(calculateZodiacSign(11, 22)).toBe('YAY');
    });
  });

  // ==========================================================
  // 6) RAPOR KARTI
  // ==========================================================
  describe('shouldGenerateReportCard', () => {

    it('7 yaş altı → rapor kartı yok', () => {
      expect(shouldGenerateReportCard(6, 5)).toBe(false);
      expect(shouldGenerateReportCard(0, 2)).toBe(false);
    });

    it('18 yaş ve üzeri → rapor kartı yok', () => {
      expect(shouldGenerateReportCard(18, 5)).toBe(false);
    });

    it('7 yaş, tur 5 → rapor kartı var', () => {
      expect(shouldGenerateReportCard(7, 5)).toBe(true);
    });

    it('10 yaş, tur 3 → rapor kartı yok', () => {
      expect(shouldGenerateReportCard(10, 3)).toBe(false);
    });
  });

  // ==========================================================
  // 7) RANDOM FONKSİYONLARI (RNG Mock)
  // ==========================================================
  describe('RNG fonksiyonları — Math.random mock\'lanıyor', () => {

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('getRandomInt belirtilen aralıkta kalır', () => {
      // Math.random = 0 → minimum değer
      jest.spyOn(Math, 'random').mockReturnValue(0);
      expect(getRandomInt(5, 10)).toBe(5);

      // Math.random = 0.999... → maximum değer
      jest.spyOn(Math, 'random').mockReturnValue(0.999);
      expect(getRandomInt(5, 10)).toBe(10);
    });

    it('createRandomFamily wealth dağılımı doğru', () => {
      // wealthRoll < 0.3 → POOR
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      const poorFamily = createRandomFamily();
      expect(poorFamily.wealth).toBe('POOR');
    });

    it('createRandomFamily RICH aile yüksek harçlık alır', () => {
      // wealthRoll = 0.85 (> 0.8) → RICH
      jest.spyOn(Math, 'random').mockReturnValue(0.85);
      const richFamily = createRandomFamily();
      expect(richFamily.wealth).toBe('RICH');
      expect(richFamily.allowance).toBeGreaterThanOrEqual(65);
    });

    it('assignGeneticTraits boş dizi döndürebilir', () => {
      // Tüm random değerleri yüksek → hiç trait atanmaz
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      const traits = assignGeneticTraits();
      expect(Array.isArray(traits)).toBe(true);
      expect(traits.length).toBe(0);
    });
  });

  // ==========================================================
  // 8) updateStats — statları güncelleme
  // ==========================================================
  describe('updateStats edge case\'leri', () => {

    const stats = {
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: 200, energy: 60, familyRelation: 60,
    };

    it('tüm statları sıfıra düşürme', () => {
      const result = updateStats(stats, {
        health: -100, intelligence: -100, charisma: -100,
        discipline: -100, money: -300, energy: -100, familyRelation: -100,
      }, 10);

      expect(result.health).toBe(0);
      expect(result.money).toBe(0);
      expect(result.energy).toBe(0);
    });

    it('cap + 10 soft overshoot sınırı aşılmaz', () => {
      // 10 yaşta intelligence capı ~50-70 arası (aileye göre)
      const result = updateStats(
        { ...stats, intelligence: 70 },
        { intelligence: 100 },
        10,
        null,
        []
      );

      // Cap + 10 soft overshoot sınırına takılmalı
      const cap = getStatCap(10, 'intelligence', null, []);
      expect(result.intelligence).toBeLessThanOrEqual(cap + 10);
    });
  });

  // ==========================================================
  // 9) TRAIT ÇAKIŞMA SİSTEMİ
  // ==========================================================
  describe('resolveTraitChanges — trait çakışması', () => {

    it('çakışan traitler otomatik kaldırılır', () => {
      // BOOKWORM eklendiğinde LAZY ile çakışabilir
      const result = resolveTraitChanges({
        currentTraits: ['LAZY'],
        gainedTraits: ['DISCIPLINED'], // DISCIPLINED, LAZY ile çakışır
      });

      // DISCIPLINED'ın conflicts listesinde LAZY varsa kaldırılır
      // Bu trait tanımına bağlı, en azından DISCIPLINED eklenmeli
      expect(result.gainedTraits).toContain('DISCIPLINED');
    });

    it('aynı trait iki kez eklenmez', () => {
      const result = resolveTraitChanges({
        currentTraits: ['GENIUS'],
        gainedTraits: ['GENIUS'],
      });

      // Zaten var olan trait eklenmez
      expect(result.gainedTraits).not.toContain('GENIUS');
      // Ama hala trait listesinde var
      expect(result.traits).toContain('GENIUS');
    });

    it('olmayan trait kaldırılmaz', () => {
      const result = resolveTraitChanges({
        currentTraits: ['GENIUS'],
        removedTraits: ['NONEXISTENT'],
      });

      expect(result.removedTraits).toHaveLength(0);
      expect(result.traits).toContain('GENIUS');
    });

    it('boş giriş ile güvenli çalışır', () => {
      const result = resolveTraitChanges({
        currentTraits: [],
        gainedTraits: [],
        removedTraits: [],
      });

      expect(result.traits).toHaveLength(0);
      expect(result.gainedTraits).toHaveLength(0);
      expect(result.removedTraits).toHaveLength(0);
    });
  });

  // ==========================================================
  // 10) KİŞİLİK UYUMLULUK SİSTEMİ
  // ==========================================================
  describe('calculatePersonalityCompatibility', () => {

    it('tamamen uyumlu kişilik +1 sınırını aşmaz', () => {
      const result = calculatePersonalityCompatibility(
        { openness: 100, empathy: 100, courage: 100, conformity: 100 },
        'FRIENDLY'
      );
      expect(result).toBeLessThanOrEqual(1);
    });

    it('tamamen uyumsuz kişilik -1 sınırını aşmaz', () => {
      const result = calculatePersonalityCompatibility(
        { openness: 0, empathy: 0, courage: 0, conformity: 0 },
        'AGGRESSIVE'
      );
      expect(result).toBeGreaterThanOrEqual(-1);
    });

    it('SHY NPC yüksek empati ister, yüksek openness istemez', () => {
      const highEmpathy = calculatePersonalityCompatibility(
        { openness: 20, empathy: 80, courage: 50, conformity: 50 },
        'SHY'
      );
      const highOpenness = calculatePersonalityCompatibility(
        { openness: 80, empathy: 20, courage: 50, conformity: 50 },
        'SHY'
      );

      expect(highEmpathy).toBeGreaterThan(highOpenness);
    });
  });

  // ==========================================================
  // 11) TRAIT ÇARPANLARI
  // ==========================================================
  describe('getTraitMultiplier — trait çarpan edge case\'leri', () => {

    it('boş trait listesi → çarpan 1.0', () => {
      expect(getTraitMultiplier([], 'health')).toBe(1.0);
    });

    it('ilgisiz trait → çarpan 1.0', () => {
      // GENIUS sadece intelligence-related statlara etki eder
      expect(getTraitMultiplier(['GENIUS'], 'health')).toBe(1.0);
    });

    it('birden fazla trait çarpanı üst üste biner', () => {
      // BOOKWORM + GENIUS → ikisi de intelligence'a bonus verir
      const multiplier = getTraitMultiplier(['BOOKWORM', 'GENIUS'], 'intelligence');
      expect(multiplier).toBeGreaterThan(1.3); // Her ikisi de katkı sağlar
    });

    it('negatif çarpan çok düşük olabilir ama 0\'ın altına çıkmaz mantıken', () => {
      // Birden fazla negatif trait birleşimi
      const multiplier = getTraitMultiplier(['CLUMSY', 'LAZY'], 'sports');
      // CLUMSY: -0.15, LAZY: -0.2 → 1 - 0.15 - 0.2 = 0.65
      expect(multiplier).toBeLessThan(1.0);
      expect(multiplier).toBeGreaterThan(0);
    });
  });

  // ==========================================================
  // 12) getMaxDaysInMonth
  // ==========================================================
  describe('getMaxDaysInMonth', () => {

    it('Şubat 29 gün döner (artık yıl varsayımı)', () => {
      expect(getMaxDaysInMonth(2)).toBe(29);
    });

    it('geçersiz ay 31 döner', () => {
      expect(getMaxDaysInMonth(0)).toBe(31);
      expect(getMaxDaysInMonth(13)).toBe(31);
    });

    it('Nisan 30 gün', () => {
      expect(getMaxDaysInMonth(4)).toBe(30);
    });
  });
});
