import { act, renderHook } from '@testing-library/react-native';
import { useEventScreenController } from '../../src/hooks/useEventScreenController';

// "Seçimi Geri Al" ve kriz toparlanma ödüllü reklamları yüklenirken oyuncu sonuç ekranından
// çıkarsa (Devam, yeni sonuç ekranı, ekran kapandı) reklam hiç açılmamalı; açıldıktan sonra
// çıktıysa ödül geldiğinde oyun geri sarılmamalı / stat eklenmemeli (Y-001 #1e).
// Devam reklam yüklenirken kilitlenmez (yükleme takılırsa oyuncu sıkışmasın).

type MockState = Record<string, any>;
type PendingAd = {
  placement: string;
  resolve: (value: unknown) => void;
  shouldShow?: () => boolean;
};

const mockGame: { gameState: MockState } = { gameState: {} };
const mockContinue = jest.fn(() => {
  mockGame.gameState = {
    ...mockGame.gameState,
    phase: 'HUB',
    lastResult: null,
    currentEvent: null,
    undoSnapshot: null,
  };
});
const mockUndo = jest.fn(() => true);
const mockCrisisPreview: { value: Record<string, number> } = { value: {} };
const mockApplyCrisis = jest.fn(() => ({ health: 6 }));
const mockShowFloatingText = jest.fn();
const mockLogRewardedAdResult = jest.fn();
const mockAdShown = jest.fn();
let mockPendingAd: PendingAd | null = null;
const mockShowAd = jest.fn((placement: string, options?: { shouldShow?: () => boolean }) => (
  new Promise(resolve => {
    mockPendingAd = { placement, resolve, shouldShow: options?.shouldShow };
  })
));

jest.mock('react-native', () => {
  const base = jest.requireActual('../mocks/ReactNative.mock');
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
    resolveChoice: (choice: unknown) => choice,
    getCrisisRecoveryPreview: () => mockCrisisPreview.value,
    applyCrisisRecovery: mockApplyCrisis,
    undoLastChoice: mockUndo,
  }),
}));

jest.mock('../../src/hooks/useGameSelectors', () => ({
  usePlayerStats: () => ({
    stats: { health: 50, energy: 50, intelligence: 10, charisma: 10, discipline: 10, money: 0, familyRelation: 50 },
  }),
  useFloatingTexts: () => ({ showFloatingText: mockShowFloatingText }),
}));

jest.mock('../../src/services/monetization', () => ({
  REWARDED_AD_CANCELLED_ERROR: 'cancelled',
  showContextualRewardedAd: (placement: string, options?: { shouldShow?: () => boolean }) => (
    mockShowAd(placement, options)
  ),
  getRemainingRewardedAds: () => 8,
  isPremium: () => false,
}));

jest.mock('../../src/utils/analyticsEvents', () => ({
  logRewardedAdRequested: jest.fn(),
  logRewardedAdResult: (data: unknown) => mockLogRewardedAdResult(data),
}));

jest.mock('../../src/utils/gameStateAdapter', () => ({ getEventChoiceSet: () => undefined }));
jest.mock('../../src/utils/eventChoiceFilter', () => ({ getChoicesToRender: () => [], getLockedChoices: () => [] }));
jest.mock('../../src/hooks/useEvents/shared', () => ({ getEventById: () => undefined }));
jest.mock('../../src/animations', () => ({
  eventStart: jest.fn(),
  echoReveal: jest.fn(),
  choiceCommit: jest.fn(),
  badOutcomeHaptic: jest.fn(),
  goodOutcomeFeedback: jest.fn(),
  milestoneHaptic: jest.fn(),
}));

const SKIP_MESSAGE = 'Sonuç ekranından çıktığın için seçim geri alınmadı.';

const resultState = (eventId: string): MockState => ({
  phase: 'RESULT',
  undoSnapshot: { gameState: { phase: 'EVENT' }, stats: {} },
  currentEvent: { id: eventId, difficulty: 1, choices: [] },
  lastResult: { feedback: 'sonuç', changes: { health: -12 } },
  personality: {},
  family: {},
  skills: {},
  npcs: [],
});

const pendingAd = (): PendingAd => {
  if (!mockPendingAd) throw new Error('Reklam istenmedi');
  return mockPendingAd;
};

/** AdMob LOADED anı: monetization shouldShow'u sorar; false ise reklam açılmaz, iptal döner. */
const adLoaded = async (): Promise<boolean> => {
  const ad = pendingAd();
  if (ad.shouldShow && !ad.shouldShow()) {
    await act(async () => {
      ad.resolve({ success: false, placement: ad.placement, rewardType: 'utility', amount: 0, error: 'cancelled' });
    });
    return false;
  }
  mockAdShown(ad.placement);
  return true;
};

const earnReward = async () => {
  const ad = pendingAd();
  await act(async () => {
    ad.resolve({ success: true, placement: ad.placement, rewardType: 'utility', amount: 0 });
  });
};

const pressContinue = (
  result: { current: ReturnType<typeof useEventScreenController> },
  rerender: (props: unknown) => void,
) => {
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  act(() => {
    result.current.handleContinue();
  });
  rerender({});
};

describe('Sonuç ekranı reklamları ve sonuç ekranından çıkış', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockContinue.mockClear();
    mockUndo.mockClear();
    mockApplyCrisis.mockClear();
    mockShowAd.mockClear();
    mockAdShown.mockClear();
    mockShowFloatingText.mockClear();
    mockLogRewardedAdResult.mockClear();
    mockPendingAd = null;
    mockCrisisPreview.value = {};
    mockGame.gameState = resultState('e1');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Geri Al', () => {
    it('aynı sonuç ekranında reklam açılır ve seçim bir kez geri alınır', async () => {
      const { result } = renderHook(() => useEventScreenController());
      expect(result.current.canUndo).toBe(true);

      act(() => {
        void result.current.handleUndo();
      });
      expect(mockShowAd).toHaveBeenCalledWith('undo_choice', expect.objectContaining({ shouldShow: expect.any(Function) }));
      expect(result.current.undoLoading).toBe(true);

      expect(await adLoaded()).toBe(true);
      await earnReward();

      expect(mockUndo).toHaveBeenCalledTimes(1);
      expect(result.current.undoLoading).toBe(false);
    });

    it('reklam yüklenirken Devam kilitlenmez; Devam sonrası reklam açılmaz, geri alma olmaz', async () => {
      const { result, rerender } = renderHook(() => useEventScreenController());

      act(() => {
        void result.current.handleUndo();
      });
      expect(result.current.undoLoading).toBe(true);

      // Reklam yüklemesi takılırsa oyuncu sonuç ekranında sıkışmasın: Devam açık kalır.
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.buttonEnabled).toBe(true);
      pressContinue(result, rerender);
      expect(mockContinue).toHaveBeenCalledTimes(1);
      expect(mockGame.gameState.phase).toBe('HUB');

      expect(await adLoaded()).toBe(false);

      expect(mockAdShown).not.toHaveBeenCalled();
      expect(mockUndo).not.toHaveBeenCalled();
      expect(mockShowFloatingText).toHaveBeenCalledWith(
        SKIP_MESSAGE,
        expect.any(Number),
        expect.any(Number),
        expect.any(String),
        expect.any(Object),
      );
      expect(mockShowFloatingText).not.toHaveBeenCalledWith('cancelled', expect.anything(), expect.anything(), expect.anything(), expect.anything());
      expect(mockLogRewardedAdResult).toHaveBeenCalledWith(expect.objectContaining({
        placement: 'undo_choice',
        success: false,
        errorMessage: 'Undo ad cancelled: result screen closed',
      }));
    });

    it('yeni bir sonuç ekranı açıldıysa eski istek reklam açmaz, yeni seçimi geri almaz', async () => {
      const { result, rerender } = renderHook(() => useEventScreenController());

      act(() => {
        void result.current.handleUndo();
      });

      mockGame.gameState = { ...mockGame.gameState, phase: 'HUB', lastResult: null, currentEvent: null, undoSnapshot: null };
      rerender({});
      mockGame.gameState = { ...resultState('e2'), phase: 'EVENT', lastResult: null, undoSnapshot: null };
      rerender({});
      mockGame.gameState = resultState('e2');
      rerender({});
      expect(result.current.canUndo).toBe(true);

      expect(await adLoaded()).toBe(false);
      expect(mockAdShown).not.toHaveBeenCalled();
      expect(mockUndo).not.toHaveBeenCalled();
    });

    it('olay ekranı kaldırıldıysa reklam açılmaz ve mesaj gösterilmez', async () => {
      const { result, unmount } = renderHook(() => useEventScreenController());

      act(() => {
        void result.current.handleUndo();
      });
      unmount();

      expect(await adLoaded()).toBe(false);
      expect(mockAdShown).not.toHaveBeenCalled();
      expect(mockUndo).not.toHaveBeenCalled();
      expect(mockShowFloatingText).not.toHaveBeenCalled();
    });

    it('reklam açıldıktan sonra sonuç ekranından çıkılırsa ödül oyunu geri sarmaz', async () => {
      const { result, rerender } = renderHook(() => useEventScreenController());

      act(() => {
        void result.current.handleUndo();
      });
      expect(await adLoaded()).toBe(true);

      pressContinue(result, rerender);
      await earnReward();

      expect(mockUndo).not.toHaveBeenCalled();
      expect(mockLogRewardedAdResult).toHaveBeenCalledWith(expect.objectContaining({
        placement: 'undo_choice',
        success: false,
        errorMessage: 'Undo skipped: result screen closed',
      }));
    });
  });

  describe('Kriz toparlanma', () => {
    beforeEach(() => {
      mockCrisisPreview.value = { health: 6 };
    });

    it('aynı sonuç ekranında reklam açılır ve toparlanma uygulanır', async () => {
      const { result } = renderHook(() => useEventScreenController());
      expect(result.current.hasCrisisRecoveryOption).toBe(true);

      act(() => {
        void result.current.handleCrisisRecoveryAd();
      });
      expect(mockShowAd).toHaveBeenCalledWith('crisis_recovery', expect.objectContaining({ shouldShow: expect.any(Function) }));

      expect(await adLoaded()).toBe(true);
      await earnReward();

      expect(mockApplyCrisis).toHaveBeenCalledTimes(1);
    });

    it('Devam sonrası reklam açılmaz ve stat eklenmez', async () => {
      const { result, rerender } = renderHook(() => useEventScreenController());

      act(() => {
        void result.current.handleCrisisRecoveryAd();
      });
      pressContinue(result, rerender);

      expect(await adLoaded()).toBe(false);
      expect(mockAdShown).not.toHaveBeenCalled();
      expect(mockApplyCrisis).not.toHaveBeenCalled();
    });

    it('reklam açıldıktan sonra sonuç ekranından çıkılırsa ödül stat eklemez', async () => {
      const { result, rerender } = renderHook(() => useEventScreenController());

      act(() => {
        void result.current.handleCrisisRecoveryAd();
      });
      expect(await adLoaded()).toBe(true);

      pressContinue(result, rerender);
      await earnReward();

      expect(mockApplyCrisis).not.toHaveBeenCalled();
      expect(mockLogRewardedAdResult).toHaveBeenCalledWith(expect.objectContaining({
        placement: 'crisis_recovery',
        success: false,
        errorMessage: 'Crisis recovery skipped: result screen closed',
      }));
    });
  });
});
