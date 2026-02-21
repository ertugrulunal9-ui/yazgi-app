import {
  mulberry32,
  createInitialFateState,
  rollFate,
  rollFateForced,
  shouldEarnToken,
  getEarnedTokenCount,
  earnToken,
  canSpendToken,
  spendToken,
  applyFateToStatChanges,
  getPityModifier,
  getZodiacModifier,
  previewFateOdds,
  ZODIAC_MODIFIERS,
} from '../../src/systems/FateEngine';
import { FateState, ZodiacSign } from '../../src/types';

describe('FateEngine', () => {
  const buildTokenGameState = (overrides: any = {}) => ({
    age: 10,
    personalityState: {
      HELPFUL: { count: 0, streak: 0, multiplier: 1 },
      PRAGMATIC: { count: 0, streak: 0, multiplier: 1 },
      AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
    },
    fate: {
      seed: 42,
      tokens: 1,
      totalRolls: 0,
      outcomeHistory: [],
      zodiacSign: 'KOC' as const,
      consecutiveBadOutcomes: 0,
    },
    ...overrides,
  });

  // ===== PRNG =====
  describe('mulberry32', () => {
    it('produces deterministic output for same seed', () => {
      const a = mulberry32(12345);
      const b = mulberry32(12345);
      expect(a).toBe(b);
    });

    it('produces different output for different seeds', () => {
      const a = mulberry32(12345);
      const b = mulberry32(12346);
      expect(a).not.toBe(b);
    });

    it('returns values between 0 and 1', () => {
      for (let seed = 0; seed < 100; seed++) {
        const val = mulberry32(seed);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  // ===== INITIAL STATE =====
  describe('createInitialFateState', () => {
    it('creates state with 1 token', () => {
      const state = createInitialFateState('KOC');
      expect(state.tokens).toBe(1);
      expect(state.totalRolls).toBe(0);
      expect(state.outcomeHistory).toEqual([]);
      expect(state.zodiacSign).toBe('KOC');
      expect(state.consecutiveBadOutcomes).toBe(0);
    });

    it('assigns a numeric seed', () => {
      const state = createInitialFateState('BALIK');
      expect(typeof state.seed).toBe('number');
      expect(state.seed).toBeGreaterThanOrEqual(0);
    });
  });

  // ===== ROLL FATE =====
  describe('rollFate', () => {
    const makeState = (overrides?: Partial<FateState>): FateState => ({
      seed: 42,
      tokens: 3,
      totalRolls: 0,
      outcomeHistory: [],
      zodiacSign: 'KOC',
      consecutiveBadOutcomes: 0,
      ...overrides,
    });

    it('returns a valid outcome', () => {
      const { result, nextState } = rollFate(makeState());
      expect(['BLESSED', 'FORTUNATE', 'NEUTRAL', 'UNLUCKY', 'CURSED']).toContain(result.outcome);
      expect(result.rawRoll).toBeGreaterThanOrEqual(0);
      expect(result.rawRoll).toBeLessThan(1);
      expect(nextState.totalRolls).toBe(1);
    });

    it('increments totalRolls each call', () => {
      let state = makeState();
      for (let i = 0; i < 5; i++) {
        const roll = rollFate(state);
        state = roll.nextState;
      }
      expect(state.totalRolls).toBe(5);
    });

    it('caps outcomeHistory at 50 entries', () => {
      let state = makeState({ totalRolls: 0 });
      for (let i = 0; i < 60; i++) {
        const roll = rollFate(state);
        state = roll.nextState;
      }
      expect(state.outcomeHistory.length).toBeLessThanOrEqual(50);
    });

    it('applies zodiac modifier for matching category', () => {
      const state = makeState({ zodiacSign: 'KOC' });
      const { result } = rollFate(state, 'RISK');
      // KOC has +0.08 for RISK
      expect(result.zodiacModifier).toBe(0.08);
    });

    it('returns zero zodiac modifier for unrelated category', () => {
      const state = makeState({ zodiacSign: 'KOC' });
      const { result } = rollFate(state, 'SOCIAL');
      expect(result.zodiacModifier).toBe(0);
    });

    it('applies pity modifier after consecutive bad outcomes', () => {
      const state = makeState({ consecutiveBadOutcomes: 3 });
      const { result } = rollFate(state);
      expect(result.pityModifier).toBeCloseTo(0.15); // 3 * 0.05
    });

    it('resets consecutiveBadOutcomes on good outcome', () => {
      // Force a high seed that produces a high roll
      let state = makeState({ consecutiveBadOutcomes: 4 });
      // With 4 bad outcomes, pity = 0.20 — should shift roll upward
      const { nextState } = rollFate(state);
      // If outcome is not bad, consecutive should reset
      if (nextState.outcomeHistory[0] !== 'UNLUCKY' && nextState.outcomeHistory[0] !== 'CURSED') {
        expect(nextState.consecutiveBadOutcomes).toBe(0);
      }
    });

    it('produces reasonable outcome distribution over many rolls', () => {
      let state = makeState({ seed: 1000 });
      const counts: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        const { result, nextState } = rollFate(state);
        counts[result.outcome] = (counts[result.outcome] || 0) + 1;
        state = nextState;
      }
      // NEUTRAL should be most common (~30%)
      expect(counts['NEUTRAL'] || 0).toBeGreaterThan(150);
      // BLESSED should be rare (~10%)
      expect(counts['BLESSED'] || 0).toBeLessThan(250);
      // All outcomes should appear
      expect(Object.keys(counts).length).toBeGreaterThanOrEqual(3);
    });
  });

  // ===== FORCED ROLL =====
  describe('rollFateForced', () => {
    it('always produces FORTUNATE or BLESSED', () => {
      for (let seed = 0; seed < 50; seed++) {
        const state: FateState = {
          seed,
          tokens: 1,
          totalRolls: seed,
          outcomeHistory: [],
          zodiacSign: 'TERAZI',
          consecutiveBadOutcomes: 0,
        };
        const { result } = rollFateForced(state);
        expect(['BLESSED', 'FORTUNATE']).toContain(result.outcome);
      }
    });

    it('resets consecutiveBadOutcomes', () => {
      const state: FateState = {
        seed: 42,
        tokens: 1,
        totalRolls: 0,
        outcomeHistory: [],
        zodiacSign: 'KOC',
        consecutiveBadOutcomes: 5,
      };
      const { nextState } = rollFateForced(state);
      expect(nextState.consecutiveBadOutcomes).toBe(0);
    });
  });

  // ===== TOKEN MANAGEMENT =====
  describe('shouldEarnToken', () => {
    it('returns true when crossing token age boundaries', () => {
      expect(shouldEarnToken(2, 3)).toBe(true);
      expect(shouldEarnToken(5, 6)).toBe(true);
      expect(shouldEarnToken(8, 9)).toBe(true);
      expect(shouldEarnToken(11, 12)).toBe(true);
      expect(shouldEarnToken(14, 15)).toBe(true);
      expect(shouldEarnToken(17, 18)).toBe(true);
    });

    it('returns false for non-token ages', () => {
      expect(shouldEarnToken(1, 2)).toBe(false);
      expect(shouldEarnToken(3, 4)).toBe(false);
      expect(shouldEarnToken(7, 8)).toBe(false);
      expect(shouldEarnToken(13, 14)).toBe(false);
    });

    it('handles age 0 (game start token)', () => {
      // age 0 is in the set, but shouldEarnToken checks prevAge+1 to newAge
      // So crossing from -1 to 0 would earn, but game always starts at 0
      // The initial token is given in createInitialFateState instead
      expect(shouldEarnToken(0, 1)).toBe(false);
    });
  });

  describe('getEarnedTokenCount', () => {
    it('earns from age milestones', () => {
      const state = buildTokenGameState();
      expect(getEarnedTokenCount(state as any, 8, 9)).toBe(1);
      expect(getEarnedTokenCount(state as any, 10, 11)).toBe(0);
    });

    it('earns from momentum streak threshold', () => {
      const state = buildTokenGameState({
        personalityState: {
          HELPFUL: { count: 7, streak: 5, multiplier: 1.25 },
          PRAGMATIC: { count: 1, streak: 0, multiplier: 1 },
          AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
        },
      });
      expect(getEarnedTokenCount(state as any, 10, 10)).toBe(1);
    });

    it('earns from consecutive bad fate rolls threshold', () => {
      const state = buildTokenGameState({
        fate: {
          seed: 42,
          tokens: 1,
          totalRolls: 0,
          outcomeHistory: [],
          zodiacSign: 'KOC' as const,
          consecutiveBadOutcomes: 4,
        },
      });
      expect(getEarnedTokenCount(state as any, 10, 10)).toBe(1);
    });

    it('stacks rewards when multiple conditions are met in same turn', () => {
      const state = buildTokenGameState({
        personalityState: {
          HELPFUL: { count: 7, streak: 5, multiplier: 1.25 },
          PRAGMATIC: { count: 1, streak: 0, multiplier: 1 },
          AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
        },
        fate: {
          seed: 42,
          tokens: 1,
          totalRolls: 0,
          outcomeHistory: [],
          zodiacSign: 'KOC' as const,
          consecutiveBadOutcomes: 4,
        },
      });
      expect(getEarnedTokenCount(state as any, 11, 12)).toBe(3);
    });
  });

  describe('token operations', () => {
    const state: FateState = {
      seed: 42,
      tokens: 3,
      totalRolls: 0,
      outcomeHistory: [],
      zodiacSign: 'KOC',
      consecutiveBadOutcomes: 0,
    };

    it('earnToken increments tokens', () => {
      expect(earnToken(state).tokens).toBe(4);
    });

    it('earnToken supports batched rewards', () => {
      expect(earnToken(state, 3).tokens).toBe(6);
    });

    it('canSpendToken returns true when tokens > 0', () => {
      expect(canSpendToken(state)).toBe(true);
    });

    it('canSpendToken returns false when tokens = 0', () => {
      expect(canSpendToken({ ...state, tokens: 0 })).toBe(false);
    });

    it('spendToken decrements tokens', () => {
      expect(spendToken(state).tokens).toBe(2);
    });

    it('spendToken does not go below 0', () => {
      expect(spendToken({ ...state, tokens: 0 }).tokens).toBe(0);
    });
  });

  // ===== STAT MODIFICATION =====
  describe('applyFateToStatChanges', () => {
    it('multiplies positive changes for BLESSED', () => {
      const result = applyFateToStatChanges({ health: 10, intelligence: 8 }, 'BLESSED');
      expect(result.health).toBe(15);   // 10 * 1.5
      expect(result.intelligence).toBe(12); // 8 * 1.5
    });

    it('reduces positive changes for CURSED', () => {
      const result = applyFateToStatChanges({ health: 10 }, 'CURSED');
      expect(result.health).toBe(6); // 10 * 0.6
    });

    it('amplifies negative changes for CURSED', () => {
      const result = applyFateToStatChanges({ health: -10 }, 'CURSED');
      expect(result.health).toBe(-15); // -10 * 1.5
    });

    it('reduces negative changes for BLESSED', () => {
      const result = applyFateToStatChanges({ health: -10 }, 'BLESSED');
      expect(result.health).toBe(-5); // -10 * 0.5
    });

    it('does not modify NEUTRAL outcome', () => {
      const result = applyFateToStatChanges({ health: 10, charisma: -5 }, 'NEUTRAL');
      expect(result.health).toBe(10);
      expect(result.charisma).toBe(-5);
    });

    it('handles zero values', () => {
      const result = applyFateToStatChanges({ health: 0, money: 10 }, 'BLESSED');
      expect(result.health).toBe(0);
      expect(result.money).toBe(15);
    });

    it('handles empty changes', () => {
      const result = applyFateToStatChanges({}, 'BLESSED');
      expect(result).toEqual({});
    });
  });

  // ===== PITY =====
  describe('getPityModifier', () => {
    it('returns 0 for 0 consecutive bad', () => {
      expect(getPityModifier(0)).toBe(0);
    });

    it('scales linearly', () => {
      expect(getPityModifier(1)).toBeCloseTo(0.05);
      expect(getPityModifier(3)).toBeCloseTo(0.15);
    });

    it('caps at 0.25', () => {
      expect(getPityModifier(5)).toBe(0.25);
      expect(getPityModifier(10)).toBe(0.25);
    });
  });

  describe('previewFateOdds', () => {
    const baseState: FateState = {
      seed: 42,
      tokens: 1,
      totalRolls: 10,
      outcomeHistory: [],
      zodiacSign: 'KOC',
      consecutiveBadOutcomes: 0,
    };

    it('returns non-fabricated baseline distribution without modifiers', () => {
      const preview = previewFateOdds(baseState, { zodiacModifier: 0 });
      const pctMap = new Map(preview.withoutToken.map(entry => [entry.label, entry.pct]));

      expect(pctMap.get('Kutsanmis')).toBeCloseTo(10, 1);
      expect(pctMap.get('Sansli')).toBeCloseTo(25, 1);
      expect(pctMap.get('Notr')).toBeCloseTo(30, 1);
      expect(pctMap.get('Sanssiz')).toBeCloseTo(20, 1);
      expect(pctMap.get('Lanetli')).toBeCloseTo(15, 1);
    });

    it('guarantees fortunate-or-better bucket when token is used', () => {
      const preview = previewFateOdds(baseState, { zodiacModifier: 0 });
      const withTokenMap = new Map(preview.withToken.map(entry => [entry.label, entry.pct]));

      expect(withTokenMap.get('Sanssiz')).toBe(0);
      expect(withTokenMap.get('Lanetli')).toBe(0);
      expect((withTokenMap.get('Kutsanmis') || 0) + (withTokenMap.get('Sansli') || 0)).toBeCloseTo(100, 1);
    });

    it('applies pity to improve odds before token spend', () => {
      const lowPity = previewFateOdds({ ...baseState, consecutiveBadOutcomes: 0 }, { zodiacModifier: 0 });
      const highPity = previewFateOdds({ ...baseState, consecutiveBadOutcomes: 5 }, { zodiacModifier: 0 });

      const lowGood = lowPity.withoutToken
        .filter(entry => entry.label === 'Kutsanmis' || entry.label === 'Sansli')
        .reduce((sum, entry) => sum + entry.pct, 0);
      const highGood = highPity.withoutToken
        .filter(entry => entry.label === 'Kutsanmis' || entry.label === 'Sansli')
        .reduce((sum, entry) => sum + entry.pct, 0);

      expect(highGood).toBeGreaterThan(lowGood);
    });
  });

  // ===== ZODIAC =====
  describe('getZodiacModifier', () => {
    it('returns modifier for matching category', () => {
      expect(getZodiacModifier('KOC', 'RISK')).toBe(0.08);
      expect(getZodiacModifier('BALIK', 'MORAL')).toBe(0.08);
    });

    it('returns 0 for non-matching category', () => {
      expect(getZodiacModifier('KOC', 'SOCIAL')).toBe(0);
    });

    it('returns 0 when no category provided', () => {
      expect(getZodiacModifier('KOC', undefined)).toBe(0);
    });

    it('returns negative modifier for penalty categories', () => {
      expect(getZodiacModifier('KOC', 'CONFLICT')).toBe(-0.05);
    });

    it('all 12 zodiac signs have modifiers', () => {
      const signs: ZodiacSign[] = [
        'KOC', 'BOGA', 'IKIZLER', 'YENGEC', 'ASLAN', 'BASAK',
        'TERAZI', 'AKREP', 'YAY', 'OGLAK', 'KOVA', 'BALIK',
      ];
      for (const sign of signs) {
        expect(ZODIAC_MODIFIERS[sign]).toBeDefined();
        expect(Object.keys(ZODIAC_MODIFIERS[sign]).length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
