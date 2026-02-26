import {
  ACHIEVEMENTS,
  getAchievement,
  getAchievementsByCategory,
  getAchievementsByRarity,
} from '../../src/systems/achievementDefinitions';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import type {
  Achievement,
  EventMemory,
  GameState,
  NPC,
  NPCRole,
  SchoolGrades,
  Skills,
  Stats,
  UnlockedAchievement,
} from '../../src/types';

const makeStats = (overrides: Partial<Stats> = {}): Stats => ({
  ...getInitialStats(),
  health: 50,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 0,
  energy: 50,
  familyRelation: 50,
  ...overrides,
});

const makeSkills = (overrides: Partial<Skills> = {}): Skills => ({
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

const makeGrades = (overrides: Partial<SchoolGrades> = {}): SchoolGrades => ({
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

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  ...getInitialGameState(),
  age: 10,
  totalTurns: 20,
  sessionCount: 1,
  maxEnergy: 100,
  actionCounts: {},
  actionHistory: [],
  eventChoiceHistory: [],
  recentEvents: [],
  memories: [],
  npcs: [],
  inventory: [],
  unlockedAchievements: [],
  achievementProgress: {},
  ...overrides,
});

const makeUnlocked = (achievementId: string): UnlockedAchievement => ({
  achievementId,
  unlockedAt: 10,
  timestamp: new Date('2026-01-01T00:00:00.000Z').toISOString(),
});

const makeNpc = (id: string, role: NPCRole): NPC => ({
  id,
  name: id,
  role,
  relationship: 50,
  romance: 0,
  gender: 'MALE',
  age: 14,
  personality: 'FRIENDLY',
  traits: ['LOYAL'],
  metAge: 10,
  metTurn: 2,
  lastInteraction: 1,
  sharedMemories: [],
  isInPlayerGroup: false,
});

const makeMemories = (count: number): EventMemory[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m_${index}`,
    eventId: `e_${index}`,
    choiceId: `c_${index}`,
    age: 10,
    emotion: 'NEUTRAL',
    weight: 'LOW',
    turnTimestamp: index,
  }));

const mustGetAchievement = (id: string): Achievement => {
  const achievement = getAchievement(id);
  if (!achievement) {
    throw new Error(`Missing achievement: ${id}`);
  }
  return achievement;
};

describe('achievementDefinitions targeted coverage', () => {
  it('applies reward scaling and caps money rewards', () => {
    expect(mustGetAchievement('first_income').reward?.money).toBe(40);
    expect(mustGetAchievement('onboarding_chain_routine_builder').reward?.money).toBe(800);
    expect(mustGetAchievement('millionaire').reward?.money).toBe(2000);
    expect(mustGetAchievement('lucky_seven').reward?.money).toBe(2000);
    expect(mustGetAchievement('survivor').reward?.money).toBeUndefined();
  });

  it('returns achievements via helper selectors', () => {
    expect(getAchievement('does_not_exist')).toBeUndefined();

    const social = getAchievementsByCategory('SOCIAL');
    expect(social.length).toBeGreaterThan(0);
    expect(social.every((achievement) => achievement.category === 'SOCIAL')).toBe(true);

    const legendary = getAchievementsByRarity('LEGENDARY');
    expect(legendary.length).toBeGreaterThan(0);
    expect(legendary.every((achievement) => achievement.rarity === 'LEGENDARY')).toBe(true);

    expect(ACHIEVEMENTS.length).toBeGreaterThan(40);
  });

  it('enforces onboarding chain requirements across false and true branches', () => {
    const step1 = mustGetAchievement('onboarding_chain_first_choice');
    const step2 = mustGetAchievement('onboarding_chain_cohort_path');
    const step3 = mustGetAchievement('onboarding_chain_routine_builder');
    const stats = makeStats();
    const skills = makeSkills();
    const grades = makeGrades();

    const outsideWindow = makeState({
      sessionCount: 4,
      eventChoiceHistory: ['evt_intro'],
    });
    expect(step1.check(stats, outsideWindow, skills, grades)).toBe(false);

    const step2WithoutStep1 = makeState({
      sessionCount: 2,
      actionHistory: [{ actionId: 'social_chat', age: 9, turn: 2 }],
      unlockedAchievements: [],
    });
    expect(step2.check(stats, step2WithoutStep1, skills, grades)).toBe(false);

    const step2WithStep1 = makeState({
      sessionCount: 2,
      actionHistory: [{ actionId: 'social_chat', age: 9, turn: 2 }],
      unlockedAchievements: [makeUnlocked('onboarding_chain_first_choice')],
    });
    expect(step2.check(stats, step2WithStep1, skills, grades)).toBe(true);

    const step3WithoutStep2 = makeState({
      sessionCount: 3,
      actionHistory: [
        { actionId: 'study_math', age: 9, turn: 10 },
        { actionId: 'social_chat', age: 9, turn: 11 },
        { actionId: 'work_shop', age: 9, turn: 12 },
      ],
      eventChoiceHistory: ['evt_1', 'evt_2'],
      unlockedAchievements: [],
    });
    expect(step3.check(stats, step3WithoutStep2, skills, grades)).toBe(false);

    const step3WithStep2 = makeState({
      sessionCount: 3,
      actionHistory: [
        { actionId: 'study_math', age: 9, turn: 10 },
        { actionId: 'social_chat', age: 9, turn: 11 },
        { actionId: 'work_shop', age: 9, turn: 12 },
      ],
      eventChoiceHistory: ['evt_1', 'evt_2'],
      unlockedAchievements: [makeUnlocked('onboarding_chain_cohort_path')],
    });
    expect(step3.check(stats, step3WithStep2, skills, grades)).toBe(true);
  });

  it('evaluates stats, money and skills based achievements', () => {
    const balanced = mustGetAchievement('balanced');
    const perfectionist = mustGetAchievement('perfectionist');
    const earlyBloomer = mustGetAchievement('early_bloomer');
    const brokeToRich = mustGetAchievement('broke_to_rich');
    const youngEntrepreneur = mustGetAchievement('young_entrepreneur');
    const renaissance = mustGetAchievement('renaissance');
    const skillMaster = mustGetAchievement('skill_master');

    expect(
      balanced.check(
        makeStats({ health: 70, intelligence: 70, charisma: 70, discipline: 69 }),
        makeState(),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(false);
    expect(
      balanced.check(
        makeStats({ health: 70, intelligence: 70, charisma: 70, discipline: 70 }),
        makeState(),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);

    expect(
      perfectionist.check(
        makeStats({ health: 90, intelligence: 90, charisma: 90, discipline: 90 }),
        makeState(),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);

    expect(
      earlyBloomer.check(
        makeStats({ intelligence: 80 }),
        makeState({ age: 9 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      earlyBloomer.check(
        makeStats({ intelligence: 95 }),
        makeState({ age: 10 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(false);

    expect(
      brokeToRich.check(
        makeStats({ money: 50000 }),
        makeState({ achievementProgress: { broke_to_rich: 1 } }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      brokeToRich.check(
        makeStats({ money: 50000 }),
        makeState({ achievementProgress: { broke_to_rich: 0 } }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(false);

    expect(
      youngEntrepreneur.check(
        makeStats({ money: 10000 }),
        makeState({ age: 13 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      youngEntrepreneur.check(
        makeStats({ money: 10000 }),
        makeState({ age: 14 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(false);

    expect(
      renaissance.check(
        makeStats(),
        makeState(),
        makeSkills({ coding: 60, music: 60, sports: 60, design: 60 }),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      renaissance.check(
        makeStats(),
        makeState(),
        makeSkills({ coding: 60, music: 60, sports: 60, design: 59 }),
        makeGrades(),
      ),
    ).toBe(false);

    expect(
      skillMaster.check(
        makeStats(),
        makeState(),
        makeSkills({ coding: 90 }),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      skillMaster.check(
        makeStats(),
        makeState(),
        makeSkills({ coding: 89, music: 89, sports: 89, design: 89 }),
        makeGrades(),
      ),
    ).toBe(false);
  });

  it('evaluates school, event, social and secret achievements', () => {
    const straightA = mustGetAchievement('straight_a');
    const perfectStudent = mustGetAchievement('perfect_student');
    const studious = mustGetAchievement('studious');
    const scholar = mustGetAchievement('scholar');
    const adventurer = mustGetAchievement('adventurer');
    const memoryKeeper = mustGetAchievement('memory_keeper');
    const nostalgia = mustGetAchievement('nostalgia');
    const friendly = mustGetAchievement('friendly');
    const popular = mustGetAchievement('popular');
    const lover = mustGetAchievement('lover');
    const luckySeven = mustGetAchievement('lucky_seven');
    const nightOwl = mustGetAchievement('night_owl');
    const rebel = mustGetAchievement('rebel');
    const minimalist = mustGetAchievement('minimalist');
    const speedRunner = mustGetAchievement('speed_runner');

    expect(
      straightA.check(
        makeStats(),
        makeState(),
        makeSkills(),
        makeGrades({ math: 90, science: 90, language: 90 }),
      ),
    ).toBe(true);
    expect(
      straightA.check(
        makeStats(),
        makeState(),
        makeSkills(),
        makeGrades({ math: 90, science: 90, language: 89 }),
      ),
    ).toBe(false);

    expect(
      perfectStudent.check(
        makeStats(),
        makeState(),
        makeSkills(),
        makeGrades({ math: 100, science: 100, language: 100 }),
      ),
    ).toBe(true);
    expect(
      perfectStudent.check(
        makeStats(),
        makeState(),
        makeSkills(),
        makeGrades({ math: 100, science: 100, language: 99 }),
      ),
    ).toBe(false);

    const studyCounts50 = makeState({
      actionCounts: { study_math: 20, study_science: 20, study_language: 10 },
    });
    const studyCounts100 = makeState({
      actionCounts: { study_math: 40, study_science: 40, study_language: 20 },
    });
    expect(studious.check(makeStats(), studyCounts50, makeSkills(), makeGrades())).toBe(true);
    expect(scholar.check(makeStats(), studyCounts100, makeSkills(), makeGrades())).toBe(true);

    const uniqueEvents = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10'];
    expect(
      adventurer.check(
        makeStats(),
        makeState({ recentEvents: uniqueEvents }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);

    expect(
      memoryKeeper.check(
        makeStats(),
        makeState({ memories: makeMemories(20) }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      nostalgia.check(
        makeStats(),
        makeState({ memories: makeMemories(49) }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(false);

    const friendlyState = makeState({
      npcs: [makeNpc('n1', 'FRIEND'), makeNpc('n2', 'FRIEND'), makeNpc('n3', 'BEST_FRIEND')],
    });
    expect(friendly.check(makeStats(), friendlyState, makeSkills(), makeGrades())).toBe(true);

    const popularState = makeState({
      npcs: [
        makeNpc('n1', 'FRIEND'),
        makeNpc('n2', 'FRIEND'),
        makeNpc('n3', 'BEST_FRIEND'),
        makeNpc('n4', 'FRIEND'),
        makeNpc('n5', 'BEST_FRIEND'),
      ],
    });
    expect(popular.check(makeStats(), popularState, makeSkills(), makeGrades())).toBe(true);
    expect(lover.check(makeStats(), makeState({ npcs: [makeNpc('p1', 'PARTNER')] }), makeSkills(), makeGrades())).toBe(true);

    expect(
      luckySeven.check(
        makeStats({ money: 777 }),
        makeState({ age: 7 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      luckySeven.check(
        makeStats({ money: 778 }),
        makeState({ age: 7 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(false);

    expect(
      nightOwl.check(
        makeStats({ energy: 9 }),
        makeState({ totalTurns: 20 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      rebel.check(
        makeStats({ familyRelation: 19, money: 20000 }),
        makeState(),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      minimalist.check(
        makeStats(),
        makeState({ age: 15, inventory: [] }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
    expect(
      speedRunner.check(
        makeStats(),
        makeState({ age: 18, totalTurns: 199 }),
        makeSkills(),
        makeGrades(),
      ),
    ).toBe(true);
  });
});
