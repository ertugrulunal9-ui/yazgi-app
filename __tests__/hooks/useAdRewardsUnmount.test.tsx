// @ts-nocheck
// Y-030 regresyon: GameScreen sökülürse (Ayarlar > Yeni Hayat) enerji reklamı açılmaz, hata tostu çıkmaz.
import { act, renderHook } from '@testing-library/react-native';

const mockGame = { gameState: { turn: 5, phase: 'HUB' } };
const mockPending = [];
jest.mock('../../src/context/GameContext', () => ({
  useGame: () => ({ gameState: mockGame.gameState }),
}));
jest.mock('../../src/services/monetization', () => ({
  REWARDED_AD_CANCELLED_ERROR: 'cancelled',
  showContextualRewardedAd: (p, o) => new Promise(resolve => { mockPending.push({ p, resolve, shouldShow: o?.shouldShow }); }),
  getRemainingRewardedAds: () => 8,
}));
jest.mock('../../src/utils/analyticsEvents', () => ({
  logRewardedAdRequested: jest.fn(), logRewardedAdResult: jest.fn(),
}));
jest.mock('../../src/utils/adErrorMessage', () => ({ getAdErrorMessage: () => 'tr-hata' }));

const { useAdRewards } = require('../../src/hooks/useAdRewards');

it('hook sökülünce shouldShow false; sessiz iptalde enerji ve tost yok', async () => {
  const updateStats = jest.fn();
  const enqueueToast = jest.fn();
  const hook = renderHook(() => useAdRewards({
    t: k => k, stats: { energy: 10, intelligence: 40 }, maxEnergy: 100, enqueueToast, updateStats,
  }));
  let done;
  act(() => { done = hook.result.current.claimEnergyRecoveryAd(); });
  // Yeni Hayat: resetGame + gameStarted false -> AppNavigator GameScreen yerine MainMenu cizer (GameScreen sokulur)
  hook.unmount();
  expect(mockPending[0].shouldShow()).toBe(false);
  await act(async () => { mockPending[0].resolve({ success: false, error: 'cancelled' }); await done; });
  expect(updateStats).not.toHaveBeenCalled();
  expect(enqueueToast).not.toHaveBeenCalled();
});

it('arka planda iptal (cancelled) aynı yerde de sessiz: hata tostu yok', async () => {
  mockPending.length = 0;
  const enqueueToast = jest.fn();
  const hook = renderHook(() => useAdRewards({
    t: k => k, stats: { energy: 10, intelligence: 40 }, maxEnergy: 100, enqueueToast, updateStats: jest.fn(),
  }));
  let done;
  act(() => { done = hook.result.current.claimEnergyRecoveryAd(); });
  await act(async () => { mockPending[0].resolve({ success: false, error: 'cancelled' }); await done; });
  expect(enqueueToast).not.toHaveBeenCalled();
});
