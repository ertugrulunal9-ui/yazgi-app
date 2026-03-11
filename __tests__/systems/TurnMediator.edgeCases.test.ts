/**
 * TurnMediator — Edge Case Testleri
 *
 * Oyunun bir turunu yöneten orkestratörün sınır durumlarını test eder:
 * - Boş choice effect ile tur işleme
 * - NPC ilişki sınırları (-100 / +100)
 * - Enerji sıfıra düştüğünde recovery flag
 * - Fate sistemi olmadan (undefined fate) tur işleme
 * - Envanter ve scheduled event birleşimi
 * - Trait kazanma/kaybetme akışı
 *
 * RNG mock'lanıyor ki testler her seferinde aynı sonucu versin.
 */

import { TurnMediator } from '../../src/systems/TurnMediator';
import { Choice, GameState, NPC, Stats } from '../../src/types';
import { createInitialPersonalityState } from '../../src/systems/PersonalityMomentumEngine';

// ============================================================
// YARDIMCI: Temel state oluşturucular
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

const createNPC = (overrides: Partial<NPC> = {}): NPC => ({
  id: 'npc_test_1',
  name: 'Test NPC',
  role: 'ACQUAINTANCE',
  relationship: 30,
  romance: 0,
  gender: 'MALE',
  age: 12,
  personality: 'FRIENDLY',
  traits: ['LOYAL'],
  metAge: 5,
  metTurn: 10,
  lastInteraction: 50,
  sharedMemories: [],
  isInPlayerGroup: false,
  ...overrides,
});

const createTestGameState = (overrides: Partial<GameState> = {}): GameState => ({
  age: 12,
  turn: 50,
  phase: 'EVENT',
  currentEvent: {
    id: 'test_event',
    text: 'Test olayı',
    choices: [],
    minAge: 0,
    maxAge: 18,
  },
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
  totalTurns: 50,
  sessionCount: 1,
  adaptivePacingStreak: 0,
  dailyDecisionCount: 0,
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
  personalityState: createInitialPersonalityState(),
  socialGroups: [],
  socialReputation: 50,
  examsTakenThisYear: [],
  isExamPeriod: false,
  childhood: { completed: true, sceneIndex: 0, memories: [], selectedMemoryId: null },
  lastBurdenRisk: 0,
  ...overrides,
});

const makeChoice = (overrides: Partial<Choice> = {}): Choice => ({
  id: 'test_choice',
  text: 'Test seçim',
  effect: { intelligence: 5 },
  feedback: 'Test geri bildirim',
  ...overrides,
});

describe('TurnMediator — Edge Cases', () => {
  const mediator = new TurnMediator();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================================
  // 1) BOŞ CHOICE EFFECT
  // ==========================================================
  describe('Boş choice effect', () => {

    it('effect boş obje → statlar değişmez', () => {
      const gameState = createTestGameState();
      const result = mediator.processEventChoice({
        choice: makeChoice({ effect: {} }),
        gameState,
        stats: baseStats,
      });

      // Stat değişikliği olmamalı (fırsat maliyeti hariç)
      expect(Object.keys(result.appliedChanges)).toHaveLength(0);
    });

    it('effect undefined → çökmez', () => {
      const gameState = createTestGameState();
      const result = mediator.processEventChoice({
        choice: makeChoice({ effect: undefined as any }),
        gameState,
        stats: baseStats,
      });

      expect(result).toBeDefined();
      expect(result.newStats).toBeDefined();
    });
  });

  // ==========================================================
  // 2) NPC İLİŞKİ SINIRLARI
  // ==========================================================
  describe('NPC ilişki sınırları', () => {

    it('ilişki +100 üzerine çıkmaz', () => {
      const npc = createNPC({ relationship: 95 });
      const gameState = createTestGameState({ npcs: [npc] });

      const result = mediator.processEventChoice({
        choice: makeChoice({ npcRelationChange: 50 }),
        gameState,
        stats: baseStats,
      });

      const updatedNpc = result.gameStateUpdates.npcs![0];
      expect(updatedNpc.relationship).toBeLessThanOrEqual(100);
    });

    it('ilişki -100 altına düşmez', () => {
      const npc = createNPC({ relationship: -80 });
      const gameState = createTestGameState({ npcs: [npc] });

      const result = mediator.processEventChoice({
        choice: makeChoice({ npcRelationChange: -50 }),
        gameState,
        stats: baseStats,
      });

      const updatedNpc = result.gameStateUpdates.npcs![0];
      expect(updatedNpc.relationship).toBeGreaterThanOrEqual(-100);
    });

    it('ilişki -50 altında ENEMY rolü atanır', () => {
      const npc = createNPC({ relationship: -40 });
      const gameState = createTestGameState({ npcs: [npc] });

      const result = mediator.processEventChoice({
        choice: makeChoice({ npcRelationChange: -20 }),
        gameState,
        stats: baseStats,
      });

      const updatedNpc = result.gameStateUpdates.npcs![0];
      expect(updatedNpc.role).toBe('ENEMY');
    });

    it('ilişki +75 üzerinde BEST_FRIEND rolü atanır', () => {
      const npc = createNPC({ relationship: 70 });
      const gameState = createTestGameState({ npcs: [npc] });

      const result = mediator.processEventChoice({
        choice: makeChoice({ npcRelationChange: 10 }),
        gameState,
        stats: baseStats,
      });

      const updatedNpc = result.gameStateUpdates.npcs![0];
      expect(updatedNpc.role).toBe('BEST_FRIEND');
    });

    it('romance 70+ ve pozitif ilişki → PARTNER rolü', () => {
      const npc = createNPC({ relationship: 50, romance: 75 });
      const gameState = createTestGameState({ npcs: [npc] });

      const result = mediator.processEventChoice({
        choice: makeChoice({ npcRelationChange: 5 }),
        gameState,
        stats: baseStats,
      });

      const updatedNpc = result.gameStateUpdates.npcs![0];
      expect(updatedNpc.role).toBe('PARTNER');
    });

    it('npcRelationChange undefined → NPC\'ler değişmez', () => {
      const npc = createNPC({ relationship: 30 });
      const gameState = createTestGameState({ npcs: [npc] });

      const result = mediator.processEventChoice({
        choice: makeChoice({ npcRelationChange: undefined }),
        gameState,
        stats: baseStats,
      });

      const updatedNpc = result.gameStateUpdates.npcs![0];
      expect(updatedNpc.relationship).toBe(30);
    });
  });

  // ==========================================================
  // 3) ENERJİ SIFIRA DÜŞME VE RECOVERY
  // ==========================================================
  describe('Enerji sıfıra düşme ve recovery flag', () => {

    it('enerji 0 ve dailyDecisionCount < 3 → shouldForceRecovery true', () => {
      const result = mediator.processEventChoice({
        choice: makeChoice({ effect: { energy: -100 } }),
        gameState: createTestGameState({ dailyDecisionCount: 1 }),
        stats: { ...baseStats, energy: 10 },
      });

      // Energy 0'a düştü ama henüz 3 karar almadı
      expect(result.shouldForceRecovery).toBe(true);
    });

    it('enerji 0 ve dailyDecisionCount >= 3 → shouldForceRecovery false', () => {
      const result = mediator.processEventChoice({
        choice: makeChoice({ effect: { energy: -100 } }),
        gameState: createTestGameState({ dailyDecisionCount: 3 }),
        stats: { ...baseStats, energy: 10 },
      });

      expect(result.shouldForceRecovery).toBe(false);
    });

    it('enerji hâlâ pozitif → shouldForceRecovery false', () => {
      const result = mediator.processEventChoice({
        choice: makeChoice({ effect: { energy: -5 } }),
        gameState: createTestGameState({ dailyDecisionCount: 0 }),
        stats: { ...baseStats, energy: 60 },
      });

      expect(result.shouldForceRecovery).toBe(false);
    });
  });

  // ==========================================================
  // 4) FATE SİSTEMİ OLMADAN TUR İŞLEME
  // ==========================================================
  describe('Fate sistemi olmadan (undefined fate)', () => {

    it('fate undefined iken tur çökmez', () => {
      const gameState = createTestGameState({ fate: undefined });
      const result = mediator.processEventChoice({
        choice: makeChoice(),
        gameState,
        stats: baseStats,
      });

      expect(result.fateRoll).toBeUndefined();
      expect(result.newStats).toBeDefined();
    });
  });

  // ==========================================================
  // 5) ENVANTER SİSTEMİ
  // ==========================================================
  describe('Envanter (inventory) edge case\'leri', () => {

    it('aynı item tekrar eklenmez (Set davranışı)', () => {
      const gameState = createTestGameState({
        inventory: ['item_sword'],
      });

      const result = mediator.processEventChoice({
        choice: makeChoice({ inventoryAdd: ['item_sword', 'item_shield'] }),
        gameState,
        stats: baseStats,
      });

      const inventory = result.gameStateUpdates.inventory;
      // Tekrarlanan item olmaz
      expect(new Set(inventory).size).toBe(inventory!.length);
      expect(inventory).toContain('item_sword');
      expect(inventory).toContain('item_shield');
    });

    it('boş inventoryAdd → mevcut envanter korunur', () => {
      const gameState = createTestGameState({
        inventory: ['item_sword'],
      });

      const result = mediator.processEventChoice({
        choice: makeChoice({ inventoryAdd: [] }),
        gameState,
        stats: baseStats,
      });

      expect(result.gameStateUpdates.inventory).toEqual(['item_sword']);
    });
  });

  // ==========================================================
  // 6) FORCE GOOD FATE
  // ==========================================================
  describe('forceGoodFate', () => {

    it('forceGoodFate true → en az FORTUNATE sonuç', () => {
      const gameState = createTestGameState({
        fate: {
          seed: 42, tokens: 1, totalRolls: 0,
          outcomeHistory: [], zodiacSign: 'KOC', consecutiveBadOutcomes: 0,
        },
      });

      const result = mediator.processEventChoice({
        choice: makeChoice(),
        gameState,
        stats: baseStats,
        forceGoodFate: true,
      });

      expect(['BLESSED', 'FORTUNATE']).toContain(result.fateRoll!.outcome);
    });

    it('token reroll geri bildirimi onceki ve yeni fate sonucunu yazar', () => {
      const gameState = createTestGameState({
        fate: {
          seed: 42, tokens: 1, totalRolls: 0,
          outcomeHistory: [], zodiacSign: 'KOC', consecutiveBadOutcomes: 0,
        },
      });

      const result = mediator.processEventChoice({
        choice: makeChoice(),
        gameState,
        stats: baseStats,
        forceGoodFate: true,
        previousFateOutcome: 'CURSED',
      });

      const feedbackLines = result.gameStateUpdates.lastResult?.statNarrativeFeedback || [];
      expect(feedbackLines.some(line => line.includes('sansin döndü'))).toBe(true);
      expect(feedbackLines.some(line => line.includes('Lanetli ->'))).toBe(true);
    });
  });

  // ==========================================================
  // 7) GAME STATE UPDATES BÜTÜNLÜĞÜ
  // ==========================================================
  describe('gameStateUpdates bütünlüğü', () => {

    it('phase her zaman RESULT olarak güncellenir', () => {
      const result = mediator.processEventChoice({
        choice: makeChoice(),
        gameState: createTestGameState(),
        stats: baseStats,
      });

      expect(result.gameStateUpdates.phase).toBe('RESULT');
    });

    it('historyLog büyür', () => {
      const gameState = createTestGameState({ historyLog: [] });
      const result = mediator.processEventChoice({
        choice: makeChoice(),
        gameState,
        stats: baseStats,
      });

      expect(result.gameStateUpdates.historyLog!.length).toBeGreaterThan(0);
    });

    it('eventChoiceHistory olay ID\'si eklenir', () => {
      const result = mediator.processEventChoice({
        choice: makeChoice(),
        gameState: createTestGameState(),
        stats: baseStats,
      });

      expect(result.gameStateUpdates.eventChoiceHistory).toContain('test_event');
    });

    it('lastResult feedback içerir', () => {
      const result = mediator.processEventChoice({
        choice: makeChoice({ feedback: 'Harika bir seçim!' }),
        gameState: createTestGameState(),
        stats: baseStats,
      });

      expect(result.gameStateUpdates.lastResult!.feedback).toBe('Harika bir seçim!');
    });
  });

  // ==========================================================
  // 8) SCHEDULED EVENTS
  // ==========================================================
  describe('Scheduled events', () => {

    it('futureEvents olan choice → scheduled event oluşturulur', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = mediator.processEventChoice({
        choice: makeChoice({
          futureEvents: [{
            trigger: 'TURNS',
            turnsLater: 3,
            eventId: 'future_event_1',
          }],
        }),
        gameState: createTestGameState({ scheduledEvents: [] }),
        stats: baseStats,
      });

      const scheduled = result.gameStateUpdates.scheduledEvents!;
      expect(scheduled.length).toBeGreaterThan(0);
      expect(scheduled[0].eventId).toBe('future_event_1');
      expect(scheduled[0].remainingTurns).toBe(3);
    });
  });
});
