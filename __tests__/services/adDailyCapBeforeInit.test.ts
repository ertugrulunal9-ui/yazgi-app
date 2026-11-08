// Y-037 (#4): servis başlamadan (günlük sayaç diskten okunmadan) çağrılan getRemainingRewardedAds()
// diskteki günlük sayacı sıfırlayıp yazmamalı; UMP yavaşken günlük 8 sınırı silinmesin.
import { monetizationService } from '../../src/services/monetization';

jest.mock('../../src/services/adMobModule', () => ({
  loadAdMobModule: () => null,
}));

const svc = monetizationService as unknown as { __reset__: () => void };

describe('daily rewarded cap read before initialize', () => {
  beforeEach(() => {
    localStorage.clear();
    svc.__reset__();
    localStorage.clear();
  });

  it('a render-time getRemainingRewardedAds() before init does not overwrite the stored count', async () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('@yazgi/ad_count', JSON.stringify({ count: 8, date: today }));

    // EventScreen canUndo useMemo (useEventScreenController.ts:269) başlatmadan önce çağırır.
    monetizationService.getRemainingRewardedAds();
    monetizationService.getRemainingRewardedAds();
    expect(JSON.parse(localStorage.getItem('@yazgi/ad_count') as string)).toEqual({ count: 8, date: today });

    await monetizationService.initialize();
    // Günün 8 hakkı kullanılmıştı; başlatmadan sonra da kalan hak 0.
    expect(monetizationService.getRemainingRewardedAds()).toBe(0);
  });

  it('control: when init runs first the stored count is respected', async () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('@yazgi/ad_count', JSON.stringify({ count: 8, date: today }));
    await monetizationService.initialize();
    expect(monetizationService.getRemainingRewardedAds()).toBe(0);
  });
});
