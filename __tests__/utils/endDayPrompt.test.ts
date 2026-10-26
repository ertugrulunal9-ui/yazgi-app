import {
  ActionCategory,
  SubAction,
  filterActionCategoriesForContext,
  getLocalizedActionCategories,
} from '../../src/data/actions';
import type { Skills } from '../../src/types';
import { hasSpendableEnergy } from '../../src/utils/endDayPrompt';

const NO_SKILLS: Skills = {
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
};

const action = (overrides: Partial<SubAction>): SubAction => ({
  id: 'test_action',
  text: '',
  icon: '',
  energyCost: 10,
  effect: { energy: -10 },
  feedback: '',
  ...overrides,
});

const category = (...subActions: SubAction[]): ActionCategory[] => [{
  id: 'test',
  title: '',
  icon: '',
  color: '',
  bgColor: '',
  subActions,
}];

const baseContext = {
  age: 10,
  turn: 5,
  energy: 50,
  money: 100,
  skills: NO_SKILLS,
  actionHistory: [],
  inventory: [],
  familyWealth: 'MIDDLE' as const,
};

describe('hasSpendableEnergy', () => {
  it('asks a baby only while a real (energy-costing) action is still affordable', () => {
    const babyCategories = filterActionCategoriesForContext(getLocalizedActionCategories('tr'), 1, null);

    // Ücretsiz yemek/uyku enerji harcamaz; en ucuz gerçek eylem 5 enerji.
    expect(hasSpendableEnergy({ ...baseContext, categories: babyCategories, age: 1, energy: 4 })).toBe(false);
    expect(hasSpendableEnergy({ ...baseContext, categories: babyCategories, age: 1, energy: 5 })).toBe(true);
  });

  it('skips the prompt when energy is gone', () => {
    expect(hasSpendableEnergy({ ...baseContext, categories: category(action({})), energy: 0 })).toBe(false);
  });

  it('ignores purchases, which spend money rather than energy', () => {
    const shop = action({ id: 'shop_test', energyCost: 2, purchaseItemId: 'item_energy_drink' });
    expect(hasSpendableEnergy({ ...baseContext, categories: category(shop) })).toBe(false);
  });

  it('ignores actions the player cannot do right now', () => {
    const tooYoung = action({ minAge: 12 });
    const needsItem = action({ requiredItemIds: ['item_laptop'] });
    const tooExpensive = action({ effect: { energy: -10, money: -500 } });

    expect(hasSpendableEnergy({ ...baseContext, categories: category(tooYoung) })).toBe(false);
    expect(hasSpendableEnergy({ ...baseContext, categories: category(needsItem) })).toBe(false);
    expect(hasSpendableEnergy({ ...baseContext, categories: category(tooExpensive) })).toBe(false);
  });

  it('treats a once-per-turn action as spent after it was used this turn', () => {
    const allowance = action({ id: 'ask_allowance', energyCost: 5 });
    const usedThisTurn = [{ actionId: 'ask_allowance', age: 10, turn: 5 }];
    const usedLastTurn = [{ actionId: 'ask_allowance', age: 10, turn: 4 }];

    expect(hasSpendableEnergy({ ...baseContext, categories: category(allowance), actionHistory: usedThisTurn })).toBe(false);
    expect(hasSpendableEnergy({ ...baseContext, categories: category(allowance), actionHistory: usedLastTurn })).toBe(true);
  });
});
