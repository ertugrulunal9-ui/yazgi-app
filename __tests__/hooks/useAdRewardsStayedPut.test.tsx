// @ts-nocheck
// Enerji ve sınav hazırlığı reklamı: reklam yüklenirken oyuncu ilerlerse reklam açılmaz, hak düşmez,
// hata tostu çıkmaz ve sınav sonradan açılmaz. Aynı yerde kalan oyuncuda davranış değişmez.
import { act, renderHook } from '@testing-library/react-native';

const mockGame = { gameState: { turn: 5, phase: 'HUB' } };
const mockPending = [];
const mockShowAd = jest.fn((placement, options) => new Promise(resolve => {
  mockPending.push({ placement, resolve, shouldShow: options?.shouldShow });
}));

jest.mock('../../src/context/GameContext', () => ({
  useGame: () => ({ gameState: mockGame.gameState }),
}));
jest.mock('../../src/services/monetization', () => ({
  REWARDED_AD_CANCELLED_ERROR: 'cancelled',
  showContextualRewardedAd: (p, o) => mockShowAd(p, o),
  getRemainingRewardedAds: () => 8,
}));
jest.mock('../../src/utils/analyticsEvents', () => ({
  logRewardedAdRequested: jest.fn(),
  logRewardedAdResult: jest.fn(),
}));
jest.mock('../../src/utils/adErrorMessage', () => ({
  getAdErrorMessage: () => 'tr-hata',
}));

const { useAdRewards } = require('../../src/hooks/useAdRewards');

const setup = () => {
  const enqueueToast = jest.fn();
  const updateStats = jest.fn();
  const hook = renderHook(() => useAdRewards({
    t: key => key,
    stats: { energy: 10, intelligence: 40 },
    maxEnergy: 100,
    enqueueToast,
    updateStats,
  }));
  return { hook, enqueueToast, updateStats };
};

describe('useAdRewards: oyuncu ilerlediyse reklam açılmaz', () => {
  beforeEach(() => {
    mockPending.length = 0;
    mockShowAd.mockClear();
    mockGame.gameState = { turn: 5, phase: 'HUB' };
  });

  it('enerji: tur ilerleyince shouldShow false, hata tostu ve enerji yok', async () => {
    const { hook, enqueueToast, updateStats } = setup();
    let promise;
    act(() => { promise = hook.result.current.claimEnergyRecoveryAd(); });
    const pending = mockPending[0];
    expect(pending.placement).toBe('energy_depleted');
    expect(pending.shouldShow()).toBe(true);

    mockGame.gameState = { turn: 6, phase: 'HUB' };
    hook.rerender({});
    expect(pending.shouldShow()).toBe(false);

    await act(async () => {
      pending.resolve({ success: false, error: 'cancelled' });
      await promise;
    });
    expect(enqueueToast).not.toHaveBeenCalled();
    expect(updateStats).not.toHaveBeenCalled();
  });

  it.each(['EVENT', 'RESULT', 'GAME_OVER'])('enerji: faz %s olunca shouldShow false', phase => {
    const { hook } = setup();
    act(() => { void hook.result.current.claimEnergyRecoveryAd(); });
    const pending = mockPending[0];
    mockGame.gameState = { turn: 5, phase };
    hook.rerender({});
    expect(pending.shouldShow()).toBe(false);
  });

  it('enerji: aynı yerde başarı enerji ekler', async () => {
    const { hook, enqueueToast, updateStats } = setup();
    let promise;
    act(() => { promise = hook.result.current.claimEnergyRecoveryAd(); });
    await act(async () => {
      mockPending[0].resolve({ success: true, amount: 25 });
      await promise;
    });
    expect(updateStats).toHaveBeenCalledWith({ energy: 25 });
    expect(enqueueToast).toHaveBeenCalledWith('messages.energyGained', 'success');
  });

  it('enerji: aynı yerde gerçek hata Türkçe hata tostu gösterir', async () => {
    const { hook, enqueueToast, updateStats } = setup();
    let promise;
    act(() => { promise = hook.result.current.claimEnergyRecoveryAd(); });
    await act(async () => {
      mockPending[0].resolve({ success: false, error: 'Ad failed to load' });
      await promise;
    });
    expect(enqueueToast).toHaveBeenCalledWith('tr-hata', 'error');
    expect(updateStats).not.toHaveBeenCalled();
  });

  it('sınav: tur ilerleyince shouldShow false, hata tostu yok', async () => {
    const { hook, enqueueToast } = setup();
    let promise;
    let result;
    act(() => { promise = hook.result.current.claimExamPrepBoostAd().then(r => { result = r; }); });
    const pending = mockPending[0];
    expect(pending.placement).toBe('exam_prep');
    expect(pending.shouldShow()).toBe(true);
    mockGame.gameState = { turn: 6, phase: 'HUB' };
    hook.rerender({});
    expect(pending.shouldShow()).toBe(false);
    await act(async () => {
      pending.resolve({ success: false, error: 'cancelled' });
      await promise;
    });
    expect(result).toBe(-1);
    expect(enqueueToast).not.toHaveBeenCalled();
  });

  it('sınav: çağıranın shouldShow koşulu da uygulanır', () => {
    const { hook } = setup();
    let open = false;
    act(() => { void hook.result.current.claimExamPrepBoostAd({ shouldShow: () => !open }); });
    expect(mockPending[0].shouldShow()).toBe(true);
    open = true;
    expect(mockPending[0].shouldShow()).toBe(false);
  });

  it('sınav: aynı yerde gerçek hata Türkçe tost verir, başarı takviye uygular', async () => {
    const { hook, enqueueToast, updateStats } = setup();
    let promise;
    act(() => { promise = hook.result.current.claimExamPrepBoostAd(); });
    await act(async () => {
      mockPending[0].resolve({ success: false, error: 'Ad failed to load' });
      await promise;
    });
    expect(enqueueToast).toHaveBeenCalledWith('tr-hata', 'error');

    act(() => { promise = hook.result.current.claimExamPrepBoostAd(); });
    await act(async () => {
      mockPending[1].resolve({ success: true, amount: 15 });
      await promise;
    });
    expect(updateStats).toHaveBeenCalledWith({ intelligence: 15 });
  });
});
