import { ACTION_CATEGORIES, filterActionCategoriesForContext } from '../../src/data/actions';
import { LifeGoal } from '../../src/types';

const GOAL_CATEGORY_IDS = [
  'goal_academic',
  'goal_athletic',
  'goal_creative',
  'goal_wealth',
  'goal_social',
] as const;

describe('goal-specific action categories', () => {
  it('registers five goal categories with requiredGoal metadata', () => {
    const goalCategories = ACTION_CATEGORIES.filter(category => (
      GOAL_CATEGORY_IDS.includes(category.id as (typeof GOAL_CATEGORY_IDS)[number])
    ));

    expect(goalCategories).toHaveLength(5);
    goalCategories.forEach(category => {
      expect(category.requiredGoal).toBeDefined();
      expect(category.subActions.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('hides goal categories when CAREER_PATH_ACTIONS is disabled', () => {
    const filtered = filterActionCategoriesForContext(
      ACTION_CATEGORIES,
      14,
      'ACADEMIC',
      { careerPathActionsEnabled: false }
    );

    const filteredIds = filtered.map(category => category.id);
    GOAL_CATEGORY_IDS.forEach(goalCategoryId => {
      expect(filteredIds).not.toContain(goalCategoryId);
    });
  });

  it('shows only the selected goal category when flag is enabled', () => {
    const selectedGoal: LifeGoal = 'ACADEMIC';
    const filtered = filterActionCategoriesForContext(
      ACTION_CATEGORIES,
      14,
      selectedGoal,
      { careerPathActionsEnabled: true }
    );

    const visibleGoalCategories = filtered
      .filter(category => category.requiredGoal)
      .map(category => category.id);

    expect(visibleGoalCategories).toEqual(['goal_academic']);
  });

  it('enforces minAge gating for wealth path', () => {
    const underAge = filterActionCategoriesForContext(
      ACTION_CATEGORIES,
      12,
      'WEALTH',
      { careerPathActionsEnabled: true }
    );
    const eligibleAge = filterActionCategoriesForContext(
      ACTION_CATEGORIES,
      13,
      'WEALTH',
      { careerPathActionsEnabled: true }
    );

    expect(underAge.map(category => category.id)).not.toContain('goal_wealth');
    expect(eligibleAge.map(category => category.id)).toContain('goal_wealth');
  });
});
