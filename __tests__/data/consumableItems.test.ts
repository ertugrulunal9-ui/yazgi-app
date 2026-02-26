import { ACTION_CATEGORIES } from '../../src/data/actions';
import { ITEMS } from '../../src/data/items';
import { CONSUMABLE_CONFIG } from '../../src/config/gameBalance';

describe('consumable item definitions', () => {
  it('registers all phase 4 consumable items with correct prices and type', () => {
    const energyDrink = ITEMS.find(item => item.id === 'item_energy_drink');
    const tutorSession = ITEMS.find(item => item.id === 'item_tutor_session');
    const gymPass = ITEMS.find(item => item.id === 'item_gym_pass');
    const fashionOutfit = ITEMS.find(item => item.id === 'item_fashion_outfit');
    const investment = ITEMS.find(item => item.id === 'item_investment');

    expect(energyDrink?.type).toBe('CONSUMABLE');
    expect(energyDrink?.price).toBe(CONSUMABLE_CONFIG.energyDrink.base);

    expect(tutorSession?.type).toBe('CONSUMABLE');
    expect(tutorSession?.price).toBe(CONSUMABLE_CONFIG.tutorSession.base);

    expect(gymPass?.type).toBe('CONSUMABLE');
    expect(gymPass?.price).toBe(CONSUMABLE_CONFIG.gymPass.base);

    expect(fashionOutfit?.type).toBe('CONSUMABLE');
    expect(fashionOutfit?.price).toBe(CONSUMABLE_CONFIG.fashionOutfit.base);

    expect(investment?.type).toBe('CONSUMABLE');
    expect(investment?.price).toBe(CONSUMABLE_CONFIG.investment.base);
  });

  it('adds consumable shopping actions with feature flag requirement', () => {
    const shopping = ACTION_CATEGORIES.find(category => category.id === 'shopping');
    const consumableActionIds = [
      'shopping_energy_drink',
      'shopping_tutor_session',
      'shopping_gym_pass',
      'shopping_fashion_outfit',
      'shopping_investment',
    ];

    const consumableActions = (shopping?.subActions || []).filter(action =>
      consumableActionIds.includes(action.id)
    );

    expect(consumableActions).toHaveLength(5);
    consumableActions.forEach(action => {
      expect(action.requiredFeatureFlag).toBe('CONSUMABLE_ITEMS');
      expect(typeof action.purchaseItemId).toBe('string');
      expect(action.priceByWealth?.POOR).toBeGreaterThan(action.priceByWealth?.MIDDLE ?? 0);
      expect(action.priceByWealth?.MIDDLE).toBeGreaterThan(action.priceByWealth?.RICH ?? 0);
    });
  });
});
