// @ts-nocheck
// Geri Al reklamı: eski (iptal olan) bir isteğin bitişi, yeni isteğin "yükleniyor" durumunu kapatmamalı;
// aksi hâlde aynı sonuç için ikinci bir reklam istenebilir.
import { act, renderHook } from '@testing-library/react-native';

const mockGame = { gameState: {} };
const mockContinue = jest.fn(() => {
  mockGame.gameState = { ...mockGame.gameState, phase: 'HUB', lastResult: null, currentEvent: null, undoSnapshot: null };
});
const mockUndo = jest.fn(() => true);
const mockPending = [];
const mockShowAd = jest.fn((placement, options) => new Promise(resolve => {
  mockPending.push({ placement, resolve, shouldShow: options?.shouldShow });
}));

jest.mock('react-native', () => {
  const base = require('../mocks/ReactNative.mock');
  const rn = base.default || base;
  return {
    ...rn,
    Dimensions: { get: () => ({ width: 400, height: 800 }) },
    AccessibilityInfo: { announceForAccessibility: jest.fn() },
  };
});
jest.mock('../../src/context/GameContext', () => ({
  useGame: () => ({ gameState: mockGame.gameState }),
}));
jest.mock('../../src/hooks/useEvents', () => ({
  useEvents: () => ({
    handleEventChoice: jest.fn(() => ({})),
    rerollChoice: jest.fn(),
    continueAfterResult: mockContinue,
    resolveEventText: () => 'olay',
    resolveChoice: c => c,
    getCrisisRecoveryPreview: () => ({}),
    applyCrisisRecovery: () => ({}),
    undoLastChoice: mockUndo,
  }),
}));
jest.mock('../../src/hooks/useGameSelectors', () => ({
  usePlayerStats: () => ({ stats: { health: 50, energy: 50, intelligence: 10, charisma: 10, discipline: 10, money: 0, familyRelation: 50 } }),
  useFloatingTexts: () => ({ showFloatingText: jest.fn() }),
}));
jest.mock('../../src/services/monetization', () => ({
  REWARDED_AD_CANCELLED_ERROR: 'cancelled',
  showContextualRewardedAd: (p, o) => mockShowAd(p, o),
  getRemainingRewardedAds: () => 8,
  isPremium: () => false,
}));
jest.mock('../../src/utils/analyticsEvents', () => ({
  logRewardedAdRequested: jest.fn(),
  logRewardedAdResult: jest.fn(),
}));
jest.mock('../../src/utils/gameStateAdapter', () => ({ getEventChoiceSet: () => undefined }));
jest.mock('../../src/utils/eventChoiceFilter', () => ({ getChoicesToRender: () => [], getLockedChoices: () => [] }));
jest.mock('../../src/hooks/useEvents/shared', () => ({ getEventById: () => undefined }));
jest.mock('../../src/animations', () => ({
  eventStart: jest.fn(), echoReveal: jest.fn(), choiceCommit: jest.fn(),
  badOutcomeHaptic: jest.fn(), goodOutcomeFeedback: jest.fn(), milestoneHaptic: jest.fn(),
}));

const { useEventScreenController } = require('../../src/hooks/useEventScreenController');

const resultState = (id) => ({
  phase: 'RESULT',
  undoSnapshot: { gameState: { phase: 'EVENT', id }, stats: {} },
  currentEvent: { id, difficulty: 1, choices: [] },
  lastResult: { feedback: id, changes: { health: -3 } },
  personality: {}, family: {}, skills: {}, npcs: [],
});

describe('useEventScreenController: eski reklam isteği yenisini bozmaz', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPending.length = 0;
    mockShowAd.mockClear();
    mockUndo.mockClear();
    mockGame.gameState = resultState('e1');
  });
  afterEach(() => jest.useRealTimers());

  it('eski istek iptal olunca yeni istek "yükleniyor" kalır; aynı sonuç için ikinci reklam istenmez', async () => {
    const { result, rerender } = renderHook(() => useEventScreenController());
    act(() => { void result.current.handleUndo(); }); // 1. istek (e1)
    act(() => { jest.advanceTimersByTime(1000); });
    act(() => { result.current.handleContinue(); }); // Devam
    rerender({});
    mockGame.gameState = { ...resultState('e2'), phase: 'EVENT', lastResult: null, undoSnapshot: null };
    rerender({});
    mockGame.gameState = resultState('e2');
    rerender({});
    expect(result.current.undoLoading).toBe(false);

    act(() => { void result.current.handleUndo(); }); // 2. istek (e2)
    expect(result.current.undoLoading).toBe(true);

    // 1. istek yüklenir: oyuncu o ekrandan çıktığı için iptal olur.
    expect(mockPending[0].shouldShow()).toBe(false);
    await act(async () => { mockPending[0].resolve({ success: false, error: 'cancelled' }); });
    expect(result.current.undoLoading).toBe(true);

    act(() => { void result.current.handleUndo(); }); // düğme hâlâ "yükleniyor": yok sayılır
    expect(mockShowAd).toHaveBeenCalledTimes(2);

    // 2. istek bitince "yükleniyor" kapanır.
    await act(async () => { mockPending[1].resolve({ success: false, error: 'cancelled' }); });
    expect(result.current.undoLoading).toBe(false);
  });
});
