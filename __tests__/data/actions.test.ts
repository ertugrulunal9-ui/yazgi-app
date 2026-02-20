import { ACTION_CATEGORIES } from '../../src/data/actions';

describe('ACTION_CATEGORIES childhood additions', () => {
  it('includes Keşif category with four early childhood actions', () => {
    const explore = ACTION_CATEGORIES.find(category => category.id === 'explore');

    expect(explore).toBeDefined();
    expect((explore?.title || '').length).toBeGreaterThan(0);
    expect(explore?.minAge).toBe(3);
    expect(explore?.maxAge).toBe(6);
    expect(explore?.subActions).toHaveLength(4);
    expect(explore?.subActions.map(action => action.id)).toEqual(
      expect.arrayContaining([
        'explore_playground',
        'explore_nature',
        'explore_imagination',
        'explore_home_adventure',
      ])
    );
  });

  it('includes Aile category with three early childhood actions', () => {
    const family = ACTION_CATEGORIES.find(category => category.id === 'family');

    expect(family).toBeDefined();
    expect((family?.title || '').length).toBeGreaterThan(0);
    expect(family?.minAge).toBe(3);
    expect(family?.maxAge).toBe(6);
    expect(family?.subActions).toHaveLength(3);
    expect(family?.subActions.map(action => action.id)).toEqual(
      expect.arrayContaining([
        'family_time',
        'family_story',
        'family_help_housework',
      ])
    );
  });

  it('applies personality effects to core explore/family actions', () => {
    const trackedActionIds = [
      'explore_playground',
      'explore_nature',
      'explore_imagination',
      'explore_home_adventure',
      'family_time',
      'family_story',
    ];
    const trackedActions = ACTION_CATEGORIES
      .flatMap(category => category.subActions)
      .filter(action => trackedActionIds.includes(action.id));

    expect(trackedActions).toHaveLength(6);
    trackedActions.forEach(action => {
      expect(action.personalityEffects).toBeDefined();
      expect(action.personalityEffects?.length).toBeGreaterThan(0);
    });
  });

  it('defines wealth-based pricing for seven core shopping products', () => {
    const shopping = ACTION_CATEGORIES.find(category => category.id === 'shopping');
    const trackedActionIds = [
      'shopping_art_set',
      'shopping_story_book',
      'shopping_football',
      'shopping_bicycle',
      'shopping_computer',
      'shopping_instrument',
      'shopping_sports_gear',
    ];
    const trackedActions = (shopping?.subActions || []).filter(action => trackedActionIds.includes(action.id));

    expect(trackedActions).toHaveLength(7);
    trackedActions.forEach(action => {
      expect(action.priceByWealth).toBeDefined();
      expect(action.priceByWealth?.POOR).toBeGreaterThan(action.priceByWealth?.MIDDLE ?? 0);
      expect(action.priceByWealth?.MIDDLE).toBeGreaterThan(action.priceByWealth?.RICH ?? 0);
    });
  });
});
