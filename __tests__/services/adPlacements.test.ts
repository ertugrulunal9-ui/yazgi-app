import { monetizationService } from '../../src/services/monetization';

describe('Rewarded ad placements registry', () => {
  beforeEach(async () => {
    localStorage.clear();
    (monetizationService as any).__reset__();
    await monetizationService.initialize();
  });

  it('registers phase 3 rewarded placements', async () => {
    const relationship = await monetizationService.showContextualRewardedAd('relationship_boost');
    const trait = await monetizationService.showContextualRewardedAd('trait_boost');
    const shopping = await monetizationService.showContextualRewardedAd('shopping_discount');
    const report = await monetizationService.showContextualRewardedAd('report_preview');

    expect(relationship.success).toBe(true);
    expect(relationship.rewardType).toBe('utility');
    expect(relationship.amount).toBe(5);

    expect(trait.success).toBe(true);
    expect(trait.rewardType).toBe('utility');
    expect(trait.amount).toBe(1);

    expect(shopping.success).toBe(true);
    expect(shopping.rewardType).toBe('utility');
    expect(shopping.amount).toBe(20);

    expect(report.success).toBe(true);
    expect(report.rewardType).toBe('utility');
    expect(report.amount).toBe(0);
  });
});
