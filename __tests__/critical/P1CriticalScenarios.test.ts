import {
  getChoicesToRender,
} from '../../src/utils/eventChoiceFilter';
import { resolveEnding } from '../../src/utils/endingResolver';
import { StatEngine } from '../../src/systems/StatEngine';
import { monetizationService } from '../../src/services/monetization';
import {
  checkAllAchievements,
  unlockAchievement,
} from '../../src/systems/achievementSystem';
import { getAchievement } from '../../src/systems/achievementDefinitions';
import { analyticsService } from '../../src/services/analytics';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import type {
  Choice,
  EventContext,
  GameEvent,
  GameState,
  SchoolGrades,
  Skills,
  Stats,
  UnlockedAchievement,
} from '../../src/types';

const ACH_STORAGE_KEY = '@yazgi/achievements/v1';

const baseStats = (overrides: Partial<Stats> = {}): Stats => ({
  ...getInitialStats(),
  health: 60,
  intelligence: 60,
  charisma: 60,
  discipline: 60,
  money: 0,
  energy: 70,
  familyRelation: 60,
  ...overrides,
});

const baseSkills = (overrides: Partial<Skills> = {}): Skills => ({
  coding: 0,
  music: 0,
  sports: 0,
  design: 0,
  athletics: 0,
  logic: 0,
  reading: 0,
  teamwork: 0,
  art: 0,
  writing: 0,
  work_ethic: 0,
  business: 0,
  ...overrides,
});

const baseGrades = (overrides: Partial<SchoolGrades> = {}): SchoolGrades => ({
  math: 50,
  science: 50,
  language: 50,
  turkish: 50,
  history: 50,
  geography: 50,
  art: 50,
  music: 50,
  ...overrides,
});

const baseState = (overrides: Partial<GameState> = {}): GameState => ({
  ...getInitialGameState(),
  age: 14,
  turn: 44,
  phase: 'HUB',
  totalTurns: 100,
  sessionCount: 3,
  maxEnergy: 100,
  unlockedAchievements: [],
  achievementProgress: {},
  ...overrides,
});

const asUnlocked = (achievementId: string): UnlockedAchievement => ({
  achievementId,
  unlockedAt: 14,
  timestamp: new Date('2026-01-01T00:00:00.000Z').toISOString(),
});

const mustAchievement = (id: string) => {
  const achievement = getAchievement(id);
  if (!achievement) {
    throw new Error(`Missing achievement definition: ${id}`);
  }
  return achievement;
};

describe('Critical P1 Scenarios', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('P1-01 Given extreme deltas, When StatEngine applies changes, Then clamp/cap rules are preserved', () => {
    const moneyFloor = StatEngine.applyChanges(
      baseStats({ money: 30 }),
      { money: -999 },
      { age: 16, family: null, traits: [] }
    );
    expect(moneyFloor.newStats.money).toBe(0);

    const childCap = StatEngine.applyChanges(
      baseStats({ intelligence: 25 }),
      { intelligence: 80 },
      { age: 0, family: null, traits: [] }
    );
    expect(childCap.newStats.intelligence).toBeLessThanOrEqual(40);

    const withTrait = StatEngine.applyChanges(
      baseStats({ intelligence: 20 }),
      { intelligence: 10 },
      { age: 12, family: null, traits: ['GENIUS'] }
    );
    const withoutTrait = StatEngine.applyChanges(
      baseStats({ intelligence: 20 }),
      { intelligence: 10 },
      { age: 12, family: null, traits: [] }
    );
    expect(withTrait.newStats.intelligence).toBeGreaterThan(withoutTrait.newStats.intelligence);
  });

  it('P1-02 Given same achievement twice, When unlock/check pipeline runs, Then it remains idempotent', async () => {
    const achievement = mustAchievement('first_income');
    const stats = baseStats({ money: 5 });
    const state = baseState({ age: 13 });
    const skills = baseSkills();
    const grades = baseGrades();
    const floating = jest.fn();

    const first = await unlockAchievement(achievement, state, [], floating);
    const second = await unlockAchievement(achievement, state, [first!.unlocked], floating);
    expect(first).not.toBeNull();
    expect(second).toBeNull();

    const saved = JSON.parse(localStorage.getItem(ACH_STORAGE_KEY) || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].achievementId).toBe('first_income');
    expect((analyticsService.logCustomEvent as jest.Mock).mock.calls.length).toBe(1);

    const newlyUnlocked = await checkAllAchievements(
      stats,
      state,
      skills,
      grades,
      [asUnlocked('first_income')],
      floating
    );
    expect(newlyUnlocked.some((entry) => entry.achievementId === 'first_income')).toBe(false);
  });

  it('P1-03 Given identical input, When resolveEnding runs repeatedly, Then output is deterministic', () => {
    const gameState = baseState({
      selectedGoal: 'ACADEMIC',
      schoolGrades: baseGrades({ math: 92, science: 90, language: 88 }),
      skills: baseSkills({ logic: 84, reading: 80, writing: 75, coding: 78 }),
      actionHistory: [
        { actionId: 'study_math', age: 13, turn: 30 },
        { actionId: 'study_science', age: 13, turn: 31 },
      ],
      unlockedAchievements: [asUnlocked('first_income')],
    });
    const stats = baseStats({ intelligence: 88, discipline: 84, familyRelation: 65, money: 12000 });

    const first = resolveEnding({ gameState, stats });
    const second = resolveEnding({ gameState, stats });

    expect(second).toEqual(first);
    expect(first.id).toBeTruthy();
    expect(first.tier).toBeTruthy();
  });

  it('P1-04 Given rewarded/interstitial flows, When failure conditions occur, Then rewards and ad display are safely blocked', async () => {
    (monetizationService as any).__reset__();
    await monetizationService.initialize();

    const remainingBefore = monetizationService.getRemainingRewardedAds();
    const rewardedSuccess = await monetizationService.showRewardedAd('energy');
    const remainingAfterSuccess = monetizationService.getRemainingRewardedAds();

    expect(rewardedSuccess.success).toBe(true);
    expect(remainingAfterSuccess).toBe(remainingBefore - 1);

    // Ad-only model: disable ads manually to verify blocking behaviour
    monetizationService.setAdsEnabled(false);
    const remainingBeforeBlock = monetizationService.getRemainingRewardedAds();
    const rewardedBlocked = await monetizationService.showRewardedAd('money');
    const remainingAfterBlock = monetizationService.getRemainingRewardedAds();
    const interstitialBlocked = await monetizationService.showInterstitialAdDetailed();

    expect(rewardedBlocked.success).toBe(false);
    expect(remainingAfterBlock).toBe(remainingBeforeBlock);
    expect(interstitialBlocked.shown).toBe(false);
    expect(['premium', 'ads_disabled']).toContain(interstitialBlocked.reason);

    // Re-enable for other tests
    monetizationService.setAdsEnabled(true);
  });

  it('P1-05 Given filtered choices, When all are invalid, Then fail-safe returns original list instead of empty UI', () => {
    const context: EventContext = {
      age: 14,
      traits: [],
      stats: baseStats(),
      family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 20 },
      memories: [],
      personality: {
        openness: 50,
        courage: 50,
        empathy: 50,
        patience: 50,
        conformity: 50,
      },
      stress: { current: 10, threshold: 70, turnsSinceBreakdown: 3, sources: [] },
      skills: baseSkills(),
      npcs: [],
      inventory: [],
    };

    const resolveChoice = (choice: Choice | ((ctx: EventContext) => Choice)): Choice =>
      typeof choice === 'function' ? choice(context) : choice;

    const impossibleEvent: GameEvent = {
      id: 'evt_impossible',
      text: 'Impossible choices',
      minAge: 0,
      maxAge: 18,
      choices: [
        { text: 'Need coding 95', effect: {}, feedback: 'x', reqSkills: { coding: 95 } },
        { text: 'Need rich family', effect: {}, feedback: 'x', reqFamily: { wealth: ['RICH'] } },
      ],
      rarity: 'COMMON',
      difficulty: 1,
      isRepeatable: true,
    };

    const fallback = getChoicesToRender({
      currentEvent: impossibleEvent,
      resolveChoice,
      personality: context.personality,
      stats: context.stats,
      family: context.family,
      skills: context.skills!,
      npcRoles: [],
      eventChoiceSet: new Set(),
    });
    expect(fallback).toBe(impossibleEvent.choices);

    const mixedEvent: GameEvent = {
      ...impossibleEvent,
      id: 'evt_mixed',
      choices: [
        ...impossibleEvent.choices,
        { text: 'Always available', effect: {}, feedback: 'ok' },
      ],
    };

    const filtered = getChoicesToRender({
      currentEvent: mixedEvent,
      resolveChoice,
      personality: context.personality,
      stats: context.stats,
      family: context.family,
      skills: context.skills!,
      npcRoles: [],
      eventChoiceSet: new Set(),
    });
    expect(filtered?.map((choice) => resolveChoice(choice).text)).toEqual(['Always available']);
  });
});
