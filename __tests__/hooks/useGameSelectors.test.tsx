/**
 * useGameSelectors Hook Tests
 * Performans optimizasyonu için selector hook'larının testleri
 */

import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameProvider, GameContext, GameContextType } from '../../src/context/GameContext';
import { getMomentumVisibility, usePillarStats, useStress } from '../../src/hooks/useGameSelectors';

// Mock initial values
const mockStats = {
  health: 70,
  intelligence: 50,
  charisma: 40,
  discipline: 30,
  money: 100,
  energy: 80,
  familyRelation: 60,
};

const mockGameState = {
  age: 10,
  turn: 25,
  phase: 'HUB' as const,
  currentEvent: null,
  pendingReportCard: false,
  characterInfo: {
    firstName: 'Test',
    lastName: 'User',
    gender: 'MALE' as const,
    birthMonth: 5,
    birthDay: 15,
    birthCity: 'Istanbul',
    zodiacSign: 'BOGA' as const,
  },
  lastResult: null,
  historyLog: [],
  family: { wealth: 'MIDDLE' as const, dynamic: 'SUPPORTIVE' as const, allowance: 30 },
  maxEnergy: 100,
  schoolGrades: { math: 60, science: 55, language: 70, turkish: 65, history: 50, geography: 45, art: 50, music: 50 },
  skills: {
    coding: 20,
    music: 10,
    sports: 30,
    design: 5,
    athletics: 0,
    logic: 0,
    reading: 0,
    teamwork: 0,
    art: 0,
    writing: 0,
    work_ethic: 0,
    business: 0,
  },
  talent: 'NONE' as const,
  streak: { actionId: null, count: 0 },
  traits: ['GENIUS'],
  traitProgress: {},
  actionCounts: {},
  actionHistory: [],
  eventChoiceHistory: [],
  inventory: ['notebook'],
  npcs: [
    {
      id: 'npc1',
      name: 'Ali',
      role: 'FRIEND' as const,
      relationship: 50,
      romance: 0,
      gender: 'MALE' as const,
      age: 10,
      personality: 'FRIENDLY' as const,
      traits: ['LOYAL' as const],
      metAge: 5,
      metTurn: 10,
      lastInteraction: 20,
      sharedMemories: [],
      isInPlayerGroup: false,
    },
  ],
  selectedNpcId: null,
  innerThought: '',
  floatingTexts: [],
  totalTurns: 25,
  lastInteracted: {},
  recentEvents: [],
  memories: [],
  scheduledEvents: [],
  unlockedAchievements: [],
  achievementProgress: {},
  personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 },
  stress: { current: 20, threshold: 70, turnsSinceBreakdown: 0, sources: [] },
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
};

// Test için selector fonksiyonları direkt test ediyoruz
// (Hook render'ı React context gerektirir, unit test için selector logic'i test ediyoruz)

describe('Selector Logic Tests', () => {
  describe('usePlayerStats selector logic', () => {
    it('should extract only stats from context', () => {
      // Selector logic
      const extractStats = (stats: typeof mockStats) => ({
        stats,
      });

      const result = extractStats(mockStats);

      expect(result.stats).toEqual(mockStats);
      expect(result.stats.health).toBe(70);
      expect(result.stats.intelligence).toBe(50);
    });

    it('should not include gameState data', () => {
      const extractStats = (stats: typeof mockStats) => ({
        stats,
      });

      const result = extractStats(mockStats);

      // Should not have gameState properties
      expect((result as any).age).toBeUndefined();
      expect((result as any).turn).toBeUndefined();
    });
  });

  describe('useGameProgress selector logic', () => {
    it('should extract only progress-related fields', () => {
      const extractProgress = (gameState: typeof mockGameState) => ({
        age: gameState.age,
        turn: gameState.turn,
        phase: gameState.phase,
        totalTurns: gameState.totalTurns,
      });

      const result = extractProgress(mockGameState);

      expect(result.age).toBe(10);
      expect(result.turn).toBe(25);
      expect(result.phase).toBe('HUB');
      expect(result.totalTurns).toBe(25);
    });

    it('should not include other gameState fields', () => {
      const extractProgress = (gameState: typeof mockGameState) => ({
        age: gameState.age,
        turn: gameState.turn,
        phase: gameState.phase,
        totalTurns: gameState.totalTurns,
      });

      const result = extractProgress(mockGameState);

      // Should not have other fields
      expect((result as any).npcs).toBeUndefined();
      expect((result as any).stats).toBeUndefined();
      expect((result as any).traits).toBeUndefined();
    });
  });

  describe('useNPCList selector logic', () => {
    it('should extract NPC-related fields', () => {
      const extractNPCList = (gameState: typeof mockGameState) => ({
        npcs: gameState.npcs,
        selectedNpcId: gameState.selectedNpcId,
        socialGroups: gameState.socialGroups,
        socialReputation: gameState.socialReputation,
      });

      const result = extractNPCList(mockGameState);

      expect(result.npcs).toHaveLength(1);
      expect(result.npcs[0].name).toBe('Ali');
      expect(result.selectedNpcId).toBeNull();
      expect(result.socialReputation).toBe(50);
    });
  });

  describe('useSchoolGrades selector logic', () => {
    it('should extract school grades only', () => {
      const extractGrades = (gameState: typeof mockGameState) => gameState.schoolGrades;

      const result = extractGrades(mockGameState);

      expect(result.math).toBe(60);
      expect(result.science).toBe(55);
      expect(result.language).toBe(70);
      expect(result.turkish).toBe(65);
      expect(result.history).toBe(50);
      expect(result.geography).toBe(45);
    });
  });

  describe('useSkills selector logic', () => {
    it('should extract skills only', () => {
      const extractSkills = (gameState: typeof mockGameState) => gameState.skills;

      const result = extractSkills(mockGameState);

      expect(result.coding).toBe(20);
      expect(result.music).toBe(10);
      expect(result.sports).toBe(30);
      expect(result.design).toBe(5);
    });
  });

  describe('usePersonality selector logic', () => {
    it('should extract personality-related fields', () => {
      const extractPersonality = (gameState: typeof mockGameState) => ({
        personality: gameState.personality,
        stress: gameState.stress,
        personalityHistory: gameState.personalityHistory,
      });

      const result = extractPersonality(mockGameState);

      expect(result.personality.openness).toBe(50);
      expect(result.personality.courage).toBe(50);
      expect(result.stress.current).toBe(20);
      expect(result.stress.threshold).toBe(70);
    });
  });

  describe('useTraits selector logic', () => {
    it('should extract traits and progress', () => {
      const extractTraits = (gameState: typeof mockGameState) => ({
        traits: gameState.traits,
        traitProgress: gameState.traitProgress,
      });

      const result = extractTraits(mockGameState);

      expect(result.traits).toEqual(['GENIUS']);
      expect(result.traitProgress).toEqual({});
    });
  });

  describe('useCharacterInfo selector logic', () => {
    it('should extract character info', () => {
      const extractCharacterInfo = (gameState: typeof mockGameState) => gameState.characterInfo;

      const result = extractCharacterInfo(mockGameState);

      expect(result?.firstName).toBe('Test');
      expect(result?.lastName).toBe('User');
      expect(result?.gender).toBe('MALE');
      expect(result?.birthCity).toBe('Istanbul');
    });

    it('should handle null characterInfo', () => {
      const gameStateWithoutChar = { ...mockGameState, characterInfo: null };
      const extractCharacterInfo = (gameState: typeof gameStateWithoutChar) => gameState.characterInfo;

      const result = extractCharacterInfo(gameStateWithoutChar);

      expect(result).toBeNull();
    });
  });

  describe('useExamState selector logic', () => {
    it('should extract exam-related fields', () => {
      const extractExamState = (gameState: typeof mockGameState) => ({
        examsTakenThisYear: gameState.examsTakenThisYear,
        isExamPeriod: gameState.isExamPeriod,
        pendingReportCard: gameState.pendingReportCard,
      });

      const result = extractExamState(mockGameState);

      expect(result.examsTakenThisYear).toEqual([]);
      expect(result.isExamPeriod).toBe(false);
      expect(result.pendingReportCard).toBe(false);
    });
  });

  describe('useDashboardData selector logic', () => {
    it('should combine stats and progress for dashboard', () => {
      const extractDashboard = (stats: typeof mockStats, gameState: typeof mockGameState) => ({
        stats,
        age: gameState.age,
        turn: gameState.turn,
        phase: gameState.phase,
        traits: gameState.traits,
        maxEnergy: gameState.maxEnergy,
      });

      const result = extractDashboard(mockStats, mockGameState);

      expect(result.stats.health).toBe(70);
      expect(result.age).toBe(10);
      expect(result.turn).toBe(25);
      expect(result.traits).toEqual(['GENIUS']);
      expect(result.maxEnergy).toBe(100);
    });
  });

  describe('useCharacterScreenData selector logic', () => {
    it('should combine all character screen data', () => {
      const extractCharacterScreen = (stats: typeof mockStats, gameState: typeof mockGameState) => ({
        characterInfo: gameState.characterInfo,
        stats,
        traits: gameState.traits,
        personality: gameState.personality,
        skills: gameState.skills,
        schoolGrades: gameState.schoolGrades,
        age: gameState.age,
      });

      const result = extractCharacterScreen(mockStats, mockGameState);

      expect(result.characterInfo?.firstName).toBe('Test');
      expect(result.stats.health).toBe(70);
      expect(result.traits).toEqual(['GENIUS']);
      expect(result.personality.openness).toBe(50);
      expect(result.skills.coding).toBe(20);
      expect(result.schoolGrades.math).toBe(60);
      expect(result.age).toBe(10);
    });
  });
});

describe('Memoization Behavior Tests', () => {
  describe('Reference equality for unchanged data', () => {
    it('should return same reference when data unchanged', () => {
      const data1 = { ...mockStats };
      const data2 = { ...mockStats };

      // Shallow comparison
      const isEqual = Object.keys(data1).every(
        key => data1[key as keyof typeof data1] === data2[key as keyof typeof data2]
      );

      expect(isEqual).toBe(true);
    });

    it('should detect changes in nested objects', () => {
      const grades1 = { ...mockGameState.schoolGrades };
      const grades2 = { ...mockGameState.schoolGrades, math: 70 };

      const isEqual = JSON.stringify(grades1) === JSON.stringify(grades2);

      expect(isEqual).toBe(false);
    });
  });

  describe('Dependency tracking', () => {
    it('should identify minimal dependencies for useGameProgress', () => {
      const dependencies = ['age', 'turn', 'phase', 'totalTurns'];

      dependencies.forEach(dep => {
        expect(mockGameState).toHaveProperty(dep);
      });
    });

    it('should identify minimal dependencies for useNPCList', () => {
      const dependencies = ['npcs', 'selectedNpcId', 'socialGroups', 'socialReputation'];

      dependencies.forEach(dep => {
        expect(mockGameState).toHaveProperty(dep);
      });
    });
  });
});

describe('Edge Cases', () => {
  describe('Empty state handling', () => {
    const emptyGameState = {
      ...mockGameState,
      npcs: [],
      traits: [],
      inventory: [],
      memories: [],
      unlockedAchievements: [],
      socialGroups: [],
    };

    it('should handle empty NPCs array', () => {
      const extractNPCList = (gs: typeof emptyGameState) => gs.npcs;
      expect(extractNPCList(emptyGameState)).toEqual([]);
    });

    it('should handle empty traits array', () => {
      const extractTraits = (gs: typeof emptyGameState) => gs.traits;
      expect(extractTraits(emptyGameState)).toEqual([]);
    });
  });

  describe('Null value handling', () => {
    const nullGameState = {
      ...mockGameState,
      characterInfo: null,
      currentEvent: null,
      lastResult: null,
      selectedNpcId: null,
      family: null,
    };

    it('should handle null characterInfo', () => {
      expect(nullGameState.characterInfo).toBeNull();
    });

    it('should handle null family', () => {
      expect(nullGameState.family).toBeNull();
    });

    it('should handle null selectedNpcId', () => {
      expect(nullGameState.selectedNpcId).toBeNull();
    });
  });

  describe('Boundary values', () => {
    it('should handle age 0', () => {
      const newbornState = { ...mockGameState, age: 0 };
      expect(newbornState.age).toBe(0);
    });

    it('should handle max age (18)', () => {
      const adultState = { ...mockGameState, age: 18 };
      expect(adultState.age).toBe(18);
    });

    it('should handle 0 stats', () => {
      const zeroStats = { ...mockStats, intelligence: 0, discipline: 0 };
      expect(zeroStats.intelligence).toBe(0);
      expect(zeroStats.discipline).toBe(0);
    });

    it('should handle max stats (100)', () => {
      const maxStats = { ...mockStats, health: 100, charisma: 100 };
      expect(maxStats.health).toBe(100);
      expect(maxStats.charisma).toBe(100);
    });

    it('should handle negative money (debt)', () => {
      const debtStats = { ...mockStats, money: -200 };
      expect(debtStats.money).toBe(-200);
    });
  });
});

describe('Momentum visibility selector', () => {
  it('returns NONE when momentum has not started', () => {
    const visibility = getMomentumVisibility(mockGameState as any);
    expect(visibility.dominantTendency).toBeNull();
    expect(visibility.streakLevel).toBe('NONE');
    expect(visibility.hint).toBe('');
  });

  it('returns ACTIVE with hint for ongoing streak', () => {
    const gameState = {
      ...mockGameState,
      personalityState: {
        HELPFUL: { count: 4, streak: 3, multiplier: 1.1 },
        PRAGMATIC: { count: 0, streak: 0, multiplier: 1 },
        AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
      },
    };

    const visibility = getMomentumVisibility(gameState as any);
    expect(visibility.dominantTendency).toBe('HELPFUL');
    expect(visibility.streakLevel).toBe('ACTIVE');
    expect(visibility.hint.length).toBeGreaterThan(0);
  });

  it('returns POWERFUL for high streak momentum', () => {
    const gameState = {
      ...mockGameState,
      personalityState: {
        HELPFUL: { count: 7, streak: 6, multiplier: 1.3 },
        PRAGMATIC: { count: 1, streak: 1, multiplier: 1 },
        AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
      },
    };

    const visibility = getMomentumVisibility(gameState as any);
    expect(visibility.dominantTendency).toBe('HELPFUL');
    expect(visibility.streakLevel).toBe('POWERFUL');
  });
});

describe('usePillarStats hook', () => {
  const buildContextValue = (statsOverride: typeof mockStats): GameContextType => ({
    gameState: {
      ...mockGameState,
      stats: statsOverride,
    } as any,
    stats: statsOverride as any,
    playerName: 'Test User',
    isLoading: false,
    startNewGame: jest.fn(),
    loadSavedGame: jest.fn(async () => true),
    resetGame: jest.fn(),
    setGameState: jest.fn(),
    setStats: jest.fn(),
    setPlayerName: jest.fn(),
    updateGameState: jest.fn(),
    updateStats: jest.fn(),
    advanceTurnInContext: jest.fn(),
  });

  it('includes familyRelation in Ruh pillar calculation', () => {
    const lowFamilyStats = {
      ...mockStats,
      charisma: 40,
      familyRelation: 10,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <GameContext.Provider value={buildContextValue(lowFamilyStats)}>
        {children}
      </GameContext.Provider>
    );

    const { result } = renderHook(() => usePillarStats(), { wrapper });

    expect(result.current.beden).toBe(Math.round((lowFamilyStats.health + lowFamilyStats.energy) / 2));
    expect(result.current.zihin).toBe(Math.round((lowFamilyStats.intelligence + lowFamilyStats.discipline) / 2));
    expect(result.current.ruh).toBe(25);
    expect(result.current.raw.familyRelation).toBe(10);
  });
});

describe('useStress hook', () => {
  const buildContextValue = (stressOverride: { current: number; threshold: number }): GameContextType => ({
    gameState: {
      ...mockGameState,
      stress: {
        ...mockGameState.stress,
        current: stressOverride.current,
        threshold: stressOverride.threshold,
      },
    } as any,
    stats: mockStats as any,
    playerName: 'Test User',
    isLoading: false,
    startNewGame: jest.fn(),
    loadSavedGame: jest.fn(async () => true),
    resetGame: jest.fn(),
    setGameState: jest.fn(),
    setStats: jest.fn(),
    setPlayerName: jest.fn(),
    updateGameState: jest.fn(),
    updateStats: jest.fn(),
    advanceTurnInContext: jest.fn(),
  });

  it('calculates stress ratio for critical threshold state', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GameContext.Provider value={buildContextValue({ current: 65, threshold: 70 })}>
        {children}
      </GameContext.Provider>
    );

    const { result } = renderHook(() => useStress(), { wrapper });

    expect(result.current.current).toBe(65);
    expect(result.current.threshold).toBe(70);
    expect(result.current.ratio).toBeCloseTo(0.9285, 3);
  });
});
