import { monetizationService } from '../../src/services/monetization';

describe('Rewarded ad placements registry', () => {
  beforeEach(async () => {
    localStorage.clear();
    (monetizationService as any).__reset__();
    await monetizationService.initialize();
  });

  it('registers reduced rewarded placements', async () => {
    const examPrep = await monetizationService.showContextualRewardedAd('exam_prep');
    const energyRecovery = await monetizationService.showContextualRewardedAd('energy_depleted');
    const crisisRecovery = await monetizationService.showContextualRewardedAd('crisis_recovery');
    const endingAlternative = await monetizationService.showContextualRewardedAd('ending_alternative');
    const undoChoice = await monetizationService.showContextualRewardedAd('undo_choice');

    expect(examPrep.success).toBe(true);
    expect(examPrep.rewardType).toBe('intelligence');
    expect(examPrep.amount).toBe(15);

    expect(energyRecovery.success).toBe(true);
    expect(energyRecovery.rewardType).toBe('energy');
    expect(energyRecovery.amount).toBe(25);

    expect(crisisRecovery.success).toBe(true);
    expect(crisisRecovery.rewardType).toBe('utility');
    expect(crisisRecovery.amount).toBe(0);

    expect(endingAlternative.success).toBe(true);
    expect(endingAlternative.rewardType).toBe('utility');
    expect(endingAlternative.amount).toBe(0);

    expect(undoChoice.success).toBe(true);
    expect(undoChoice.rewardType).toBe('utility');
    expect(undoChoice.amount).toBe(0);
  });
});
