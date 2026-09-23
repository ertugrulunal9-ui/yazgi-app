/**
 * endingResolver — Edge Case Testleri
 *
 * Bu dosya şu sınır durumlarını test eder:
 * - Tüm statlar 0 iken ne olur?
 * - Gizli (secret) sonlar tetikleniyor mu?
 * - Para milyonlarda → normalizeMoneyScore
 * - Hedef seçilmemiş → otomatik rota
 * - Error debt override sistemi
 * - Stres eşiğinde ve üstünde
 * - Future vision her kombinasyon için çalışıyor mu?
 */

import {
  resolveEnding,
  calculateEndingErrorDebt,
  analyzeGoalMismatch,
  calculateSelectedGoalStatProgress,
  TOTAL_ENDING_COUNT,
  ENDING_ID_LIST,
  generateFutureVision,
} from '../../src/utils/endingResolver';
import { GameState, Stats } from '../../src/types';
import { setRuntimeLocale } from '../../src/i18n/strings';

// ============================================================
// YARDIMCI: Test boyunca kullanılan temel state
// Yeni test eklerken bu fonksiyonu kullan, override ile değiştir
// ============================================================
const baseStats: Stats = {
  health: 60,
  intelligence: 60,
  charisma: 60,
  discipline: 60,
  money: 500,
  energy: 80,
  familyRelation: 60,
};

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  age: 18,
  turn: 90,
  phase: 'GAME_OVER',
  currentEvent: null,
  pendingReportCard: false,
  characterInfo: null,
  lastResult: null,
  historyLog: [],
  family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 20 },
  maxEnergy: 100,
  schoolGrades: {
    math: 60, science: 60, language: 60, turkish: 60,
    history: 60, geography: 60, art: 60, music: 60,
  },
  skills: {
    coding: 20, music: 20, sports: 20, design: 20, athletics: 20,
    logic: 20, reading: 20, teamwork: 20, art: 20, writing: 20,
    work_ethic: 20, business: 20,
  },
  talent: 'NONE',
  selectedGoal: null,
  streak: { actionId: null, count: 0 },
  traits: [],
  traitProgress: {},
  actionCounts: {},
  actionHistory: [],
  eventChoiceHistory: [],
  inventory: [],
  npcs: [],
  selectedNpcId: null,
  innerThought: '',
  innerThoughtType: 'IDLE' as const,
  floatingTexts: [],
  totalTurns: 90,
  sessionCount: 1,
  adaptivePacingStreak: 0,
  lastInteracted: {
    math: 0, science: 0, language: 0, coding: 0, music: 0, sports: 0,
    design: 0, athletics: 0, logic: 0, reading: 0, teamwork: 0,
    art: 0, writing: 0, work_ethic: 0, business: 0,
  },
  recentEvents: [],
  memories: [],
  scheduledEvents: [],
  activeArcs: [],
  unlockedAchievements: [],
  achievementProgress: {},
  personality: {
    openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50,
  },
  stress: {
    current: 0, threshold: 70, turnsSinceBreakdown: 0, sources: [],
  },
  personalityHistory: [],
  personalityState: {
    HELPFUL: { count: 0, streak: 0, multiplier: 1 },
    PRAGMATIC: { count: 0, streak: 0, multiplier: 1 },
    AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
  },
  socialGroups: [],
  socialReputation: 50,
  examsTakenThisYear: [],
  isExamPeriod: false,
  childhood: { completed: true, sceneIndex: 0, memories: [], selectedMemoryId: null },
  ...overrides,
});

describe('endingResolver — Edge Cases', () => {
  beforeEach(() => {
    setRuntimeLocale('tr');
  });

  // ==========================================================
  // 1) TÜM STATLAR SIFIR
  // ==========================================================
  describe('Tüm statlar sıfır', () => {

    it('tüm statlar 0 iken FAILURE döner, çökmez', () => {
      const zeroStats: Stats = {
        health: 0, intelligence: 0, charisma: 0, discipline: 0,
        money: 0, energy: 0, familyRelation: 0,
      };

      const resolution = resolveEnding({
        gameState: createGameState(),
        stats: zeroStats,
      });

      expect(resolution.tier).toBe('FAILURE');
      expect(resolution.result).toBeDefined();
      expect(resolution.result.title).toBeTruthy();
    });

    it('error debt tüm statlar 0 iken yüksek olur', () => {
      const zeroStats: Stats = {
        health: 0, intelligence: 0, charisma: 0, discipline: 0,
        money: 0, energy: 0, familyRelation: 0,
      };

      const debt = calculateEndingErrorDebt(createGameState(), zeroStats);
      expect(debt.total).toBeGreaterThan(50);
      expect(debt.reasons.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================
  // 2) GİZLİ SONLAR (Secret Endings)
  // ==========================================================
  describe('Gizli sonlar', () => {

    it('tüm temel statlar 70+ → Gerçek Denge Ustası', () => {
      const balancedStats: Stats = {
        health: 85, intelligence: 85, charisma: 85, discipline: 85,
        money: 1000, energy: 80, familyRelation: 85,
      };

      const resolution = resolveEnding({
        gameState: createGameState(),
        stats: balancedStats,
      });

      expect(resolution.id).toBe('secret_true_balance');
      expect(resolution.tier).toBe('LEGENDARY');
      expect(resolution.result.title).toContain('Denge');
    });

    it('aile ilişkisi 90+ ve empati 70+ → Aile Mirası', () => {
      const familyStats: Stats = {
        ...baseStats,
        familyRelation: 98,
        health: 70,
      };

      const resolution = resolveEnding({
        gameState: createGameState({
          personality: { openness: 50, courage: 50, empathy: 80, patience: 50, conformity: 50 },
        }),
        stats: familyStats,
      });

      expect(resolution.id).toBe('secret_family_legacy');
      expect(resolution.tier).toBe('LEGENDARY');
    });

    it('10+ fate token → Kader Kırıcı', () => {
      const resolution = resolveEnding({
        gameState: createGameState({
          fate: {
            seed: 42, tokens: 12, totalRolls: 50,
            outcomeHistory: [], zodiacSign: 'KOC', consecutiveBadOutcomes: 0,
          },
        }),
        stats: baseStats,
      });

      expect(resolution.id).toBe('secret_fate_breaker');
      expect(resolution.result.title).toContain('Kader');
    });

    it('partner + yüksek charisma + intelligence → Aşk ve Zafer', () => {
      const resolution = resolveEnding({
        gameState: createGameState({
          npcs: [{
            id: 'npc1', name: 'Test', role: 'PARTNER', relationship: 90,
            romance: 80, gender: 'FEMALE', age: 18, personality: 'FRIENDLY',
            traits: ['LOYAL'], metAge: 10, metTurn: 1, lastInteraction: 80,
            sharedMemories: [], isInPlayerGroup: true,
          }],
        }),
        stats: { ...baseStats, charisma: 80, intelligence: 75 },
      });

      expect(resolution.id).toBe('secret_love_and_glory');
    });
  });

  // ==========================================================
  // 3) HEDEF SEÇİLMEMİŞ
  // ==========================================================
  describe('Hedef seçilmemiş (otomatik rota)', () => {

    it('selectedGoal null → otomatik dominant goal belirlenir', () => {
      const resolution = resolveEnding({
        gameState: createGameState({ selectedGoal: null }),
        stats: { ...baseStats, intelligence: 90, discipline: 85 },
      });

      // Otomatik rota belirlenmeli, çökmemeli
      expect(resolution.selectedGoal).toBeNull();
      expect(resolution.goal).toBeTruthy();
      expect(resolution.mismatchFailure).toBe(false);
    });

    it('calculateSelectedGoalStatProgress null goal → 0', () => {
      expect(calculateSelectedGoalStatProgress(null, baseStats)).toBe(0);
      expect(calculateSelectedGoalStatProgress(undefined, baseStats)).toBe(0);
    });
  });

  // ==========================================================
  // 4) ERROR DEBT OVERRIDE
  // ==========================================================
  describe('Error debt override sistemi', () => {

    it('total override direkt uygulanır', () => {
      const debt = calculateEndingErrorDebt(
        createGameState(),
        baseStats,
        { total: 42 }
      );

      expect(debt.total).toBe(42);
    });

    it('kısmi override (sadece health) toplam yeniden hesaplanır', () => {
      const noOverride = calculateEndingErrorDebt(createGameState(), baseStats);
      const withOverride = calculateEndingErrorDebt(
        createGameState(),
        baseStats,
        { health: 50 }
      );

      expect(withOverride.health).toBe(50);
      expect(withOverride.total).not.toBe(noOverride.total);
    });

    it('reasons override çalışır', () => {
      const debt = calculateEndingErrorDebt(
        createGameState(),
        baseStats,
        { reasons: ['Test nedeni'] }
      );

      expect(debt.reasons).toContain('Test nedeni');
    });
  });

  // ==========================================================
  // 5) STRES SİSTEMİ
  // ==========================================================
  describe('Stres edge case\'leri', () => {

    it('stres threshold üzerinde → error debt artar', () => {
      const normalDebt = calculateEndingErrorDebt(
        createGameState({ stress: { current: 0, threshold: 70, turnsSinceBreakdown: 0, sources: [] } }),
        baseStats
      );
      const stressDebt = calculateEndingErrorDebt(
        createGameState({ stress: { current: 80, threshold: 70, turnsSinceBreakdown: 0, sources: [] } }),
        baseStats
      );

      expect(stressDebt.stress).toBeGreaterThan(normalDebt.stress);
      expect(stressDebt.total).toBeGreaterThan(normalDebt.total);
    });

    it('sosyal etkileşimle düşen orta-yüksek stres runtime riskini azaltır', () => {
      const tenseDebt = calculateEndingErrorDebt(
        createGameState({
          stress: {
            current: 56,
            threshold: 70,
            turnsSinceBreakdown: 0,
            sources: [],
          },
        }),
        baseStats
      );
      const relievedDebt = calculateEndingErrorDebt(
        createGameState({
          stress: {
            current: 49,
            threshold: 70,
            turnsSinceBreakdown: 0,
            sources: [{ reason: 'Social: CHAT', amount: -7, turn: 90 }],
          },
        }),
        baseStats
      );

      expect(relievedDebt.stress).toBeLessThan(tenseDebt.stress);
      expect(relievedDebt.total).toBeLessThan(tenseDebt.total);
    });

    it('stres threshold 0 → bölmeye sıfır hatası olmaz', () => {
      const debt = calculateEndingErrorDebt(
        createGameState({ stress: { current: 50, threshold: 0, turnsSinceBreakdown: 0, sources: [] } }),
        baseStats
      );

      // Çökmemeli
      expect(typeof debt.total).toBe('number');
      expect(isNaN(debt.total)).toBe(false);
    });
  });

  // ==========================================================
  // 6) MISMATCH ANALİZİ
  // ==========================================================
  describe('analyzeGoalMismatch edge case\'leri', () => {

    it('hedef seçilmemiş → mismatch olamaz', () => {
      const analysis = analyzeGoalMismatch(
        createGameState({ selectedGoal: null }),
        baseStats
      );

      expect(analysis.isMismatch).toBe(false);
    });

    it('seçilen hedef dominant ile aynıysa mismatch yok', () => {
      // Yüksek intelligence → dominant muhtemelen ACADEMIC
      const gameState = createGameState({
        selectedGoal: 'ACADEMIC',
        schoolGrades: { math: 95, science: 90, language: 85, turkish: 80, history: 80, geography: 75, art: 50, music: 50 },
        skills: { ...createGameState().skills, logic: 80, reading: 75 },
      });
      const stats = { ...baseStats, intelligence: 90, discipline: 85 };

      const analysis = analyzeGoalMismatch(gameState, stats);
      expect(analysis.isMismatch).toBe(false);
    });
  });

  // ==========================================================
  // 7) ENDING KATALOĞU BÜTÜNLÜĞÜ
  // ==========================================================
  describe('Ending kataloğu bütünlüğü', () => {

    it('en az 30 farklı ending ID tanımlı', () => {
      expect(TOTAL_ENDING_COUNT).toBeGreaterThanOrEqual(30);
    });

    it('tüm ending ID\'ler benzersiz', () => {
      const unique = new Set(ENDING_ID_LIST);
      expect(unique.size).toBe(ENDING_ID_LIST.length);
    });

    it('secret ending ID\'leri katalogda var', () => {
      expect(ENDING_ID_LIST).toContain('secret_true_balance');
      expect(ENDING_ID_LIST).toContain('secret_fate_breaker');
      expect(ENDING_ID_LIST).toContain('secret_family_legacy');
      expect(ENDING_ID_LIST).toContain('secret_love_and_glory');
      expect(ENDING_ID_LIST).toContain('secret_silent_legend');
    });
  });

  // ==========================================================
  // 8) FUTURE VISION
  // ==========================================================
  describe('generateFutureVision edge case\'leri', () => {

    it('boş isim → fallback "Sen" kullanılır', () => {
      const vision = generateFutureVision(
        baseStats,
        { goal: 'ACADEMIC', tier: 'SUCCESS' } as any,
        ''
      );

      expect(vision.at30).toContain('Sen');
    });

    it('runtime locale en iken fallback isim "You" olur', () => {
      setRuntimeLocale('en');
      const vision = generateFutureVision(
        baseStats,
        { goal: 'ACADEMIC', tier: 'SUCCESS' } as any,
        ''
      );

      expect(vision.at30).toContain('You');
      expect(vision.at50).toContain('You');
    });

    it('sadece boşluk olan isim → fallback', () => {
      const vision = generateFutureVision(
        baseStats,
        { goal: 'BALANCED', tier: 'NORMAL' } as any,
        '   '
      );

      expect(vision.at30).toContain('Sen');
    });

    it('FAILURE tier → somber mood', () => {
      const vision = generateFutureVision(
        baseStats,
        { goal: 'CREATIVE', tier: 'FAILURE' } as any,
        'Ali'
      );

      expect(vision.mood).toBe('somber');
    });

    it('SUCCESS tier → optimistic mood', () => {
      const vision = generateFutureVision(
        baseStats,
        { goal: 'ENTERPRISE', tier: 'SUCCESS' } as any,
        'Zeynep'
      );

      expect(vision.mood).toBe('optimistic');
    });

    it('NORMAL tier → neutral mood', () => {
      const vision = generateFutureVision(
        baseStats,
        { goal: 'SOCIAL', tier: 'NORMAL' } as any,
        'Mert'
      );

      expect(vision.mood).toBe('neutral');
    });
  });

  // ==========================================================
  // 9) AŞIRI PARA DEĞERLERİ
  // ==========================================================
  describe('Aşırı para değerleri', () => {

    it('milyonlarca para → sonuç çökmez', () => {
      const resolution = resolveEnding({
        gameState: createGameState(),
        stats: { ...baseStats, money: 10_000_000 },
      });

      expect(resolution.result).toBeDefined();
      expect(resolution.tier).toBeTruthy();
    });

    it('para 0 iken → normal ending akışı devam eder', () => {
      const resolution = resolveEnding({
        gameState: createGameState(),
        stats: { ...baseStats, money: 0 },
      });

      expect(resolution.result).toBeDefined();
    });
  });
});

