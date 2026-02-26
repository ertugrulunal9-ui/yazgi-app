import {
  applyBuffSlotPolicy,
  applyTurnBuffEffects,
  calculateInvestmentEarlyExitPayout,
  createConsumableBuff,
  tickConsumableCooldowns,
} from '../../src/utils/gameUtils';
import type { GameState, Stats } from '../../src/types';

const makeStats = (overrides: Partial<Stats> = {}): Stats => ({
  health: 40,
  intelligence: 50,
  charisma: 45,
  discipline: 50,
  money: 500,
  energy: 40,
  familyRelation: 50,
  ...overrides,
});

describe('buff system', () => {
  it('applies buff effects, decrements duration and settles matured investments', () => {
    const stats = makeStats();
    const activeBuffs: GameState['activeBuffs'] = [
      {
        itemId: 'item_gym_pass',
        turnsRemaining: 3,
        effect: { health: 3 },
        appliedAt: 4,
      },
      {
        itemId: 'item_fashion_outfit',
        turnsRemaining: 1,
        effect: { charisma: 5 },
        appliedAt: 5,
      },
      {
        itemId: 'item_investment',
        turnsRemaining: 1,
        effect: {},
        appliedAt: 1,
      },
    ];

    const result = applyTurnBuffEffects(stats, activeBuffs);

    expect(result.nextStats.health).toBe(43);
    expect(result.nextStats.charisma).toBe(50);
    expect(result.nextActiveBuffs).toHaveLength(1);
    expect(result.nextActiveBuffs?.[0].itemId).toBe('item_gym_pass');
    expect(result.nextActiveBuffs?.[0].turnsRemaining).toBe(2);
    expect(result.maturedInvestmentCount).toBe(1);
  });

  it('ticks cooldowns and removes expired entries', () => {
    const next = tickConsumableCooldowns({
      item_energy_drink: 2,
      item_tutor_session: 1,
      invalid: 0,
    });

    expect(next).toEqual({ item_energy_drink: 1 });
  });

  it('calculates partial refund payout for early investment exit', () => {
    const payout = calculateInvestmentEarlyExitPayout([
      {
        itemId: 'item_investment',
        turnsRemaining: 4, // elapsed = 6/10 => 500 + 150*0.6 = 590
        effect: {},
        appliedAt: 3,
      },
    ]);

    expect(payout).toBe(590);
  });

  it('replaces same-type buff and blocks when max active buff count is reached', () => {
    const currentBuffs: GameState['activeBuffs'] = [
      { itemId: 'item_gym_pass', turnsRemaining: 2, effect: { health: 3 }, appliedAt: 1 },
      { itemId: 'item_fashion_outfit', turnsRemaining: 3, effect: { charisma: 5 }, appliedAt: 2 },
      { itemId: 'item_investment', turnsRemaining: 9, effect: {}, appliedAt: 3 },
    ];

    const gymRefresh = createConsumableBuff('item_gym_pass', 10);
    expect(gymRefresh).not.toBeNull();
    const replaceResult = applyBuffSlotPolicy(currentBuffs, gymRefresh!);
    expect(replaceResult.accepted).toBe(true);
    expect(replaceResult.nextActiveBuffs?.filter(buff => buff.itemId === 'item_gym_pass')).toHaveLength(1);
    expect(replaceResult.nextActiveBuffs?.find(buff => buff.itemId === 'item_gym_pass')?.turnsRemaining).toBe(3);

    const extraBuff = {
      itemId: 'item_custom_limit_test',
      turnsRemaining: 2,
      effect: { health: 1 },
      appliedAt: 4,
    };
    const cappedResult = applyBuffSlotPolicy(currentBuffs, extraBuff);
    expect(cappedResult.accepted).toBe(false);
    expect(cappedResult.reason).toBe('MAX_ACTIVE_BUFFS');
  });
});
