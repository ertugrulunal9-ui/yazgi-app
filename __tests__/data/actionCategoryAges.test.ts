import { ACTION_CATEGORIES, filterActionCategoriesForContext } from '../../src/data/actions';

// Bebeğe "Spor/Sanat" gibi içindeki her eylemi kilitli kategoriler gösteriliyordu
describe('action categories by age', () => {
  const earliestAge = (categoryId: string): number => {
    const category = ACTION_CATEGORIES.find(item => item.id === categoryId);
    return Math.min(...(category?.subActions ?? []).map(action => Math.min(
      action.minAge ?? 0,
      action.earlyUnlockByItem?.minAge ?? Infinity
    )));
  };

  it.each(Array.from({ length: 19 }, (_, age) => age))(
    'shows only categories with at least one age-eligible action at age %i',
    age => {
      const visible = filterActionCategoriesForContext(ACTION_CATEGORIES, age, null);
      for (const category of visible) {
        expect({ id: category.id, earliest: earliestAge(category.id) <= age }).toEqual({
          id: category.id,
          earliest: true,
        });
      }
    }
  );

  it('offers only the baby category before age 3', () => {
    for (const age of [0, 1, 2]) {
      expect(filterActionCategoriesForContext(ACTION_CATEGORIES, age, null).map(category => category.id))
        .toEqual(['baby']);
    }
  });
});
