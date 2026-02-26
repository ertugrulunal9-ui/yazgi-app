import { logGoalActionUsed, logTraitChanges } from '../../src/utils/analyticsEvents';
import { analyticsService } from '../../src/services/analytics';

describe('analyticsEvents', () => {
  it('logs trait_change events with source metadata', async () => {
    await logTraitChanges([
      {
        traitId: 'LAZY',
        changeType: 'GAINED',
        summary: '+ Lazy kazanildi.',
        guidance: 'Disiplini yuksek tut.',
      },
      {
        traitId: 'DISCIPLINED',
        changeType: 'REMOVED',
        summary: '- Disiplinli kaldirildi (cakisma: Lazy).',
      },
    ], {
      source: 'hub_action',
      sourceId: 'study_math',
      age: 12,
      turn: 45,
    });

    expect(analyticsService.logCustomEvent).toHaveBeenCalledTimes(2);
    expect(analyticsService.logCustomEvent).toHaveBeenNthCalledWith(
      1,
      'trait_change',
      expect.objectContaining({
        trait_id: 'LAZY',
        change_type: 'gained',
        source: 'hub_action',
        source_id: 'study_math',
        age: 12,
        turn: 45,
        guidance_shown: true,
        conflict_resolved: false,
      })
    );
    expect(analyticsService.logCustomEvent).toHaveBeenNthCalledWith(
      2,
      'trait_change',
      expect.objectContaining({
        trait_id: 'DISCIPLINED',
        change_type: 'removed',
        source: 'hub_action',
        source_id: 'study_math',
        age: 12,
        turn: 45,
        guidance_shown: false,
        conflict_resolved: true,
      })
    );
  });

  it('does nothing when change list is empty', async () => {
    await logTraitChanges([], {
      source: 'event_choice',
      sourceId: 'evt_x',
      age: 10,
      turn: 20,
    });

    expect(analyticsService.logCustomEvent).not.toHaveBeenCalled();
  });

  it('logs goal_action_used with selected goal metadata', async () => {
    await logGoalActionUsed({
      actionId: 'goal_academic_research_project',
      categoryId: 'goal_academic',
      selectedGoal: 'ACADEMIC',
      age: 13,
      turn: 41,
    });

    expect(analyticsService.logCustomEvent).toHaveBeenCalledWith(
      'goal_action_used',
      expect.objectContaining({
        action_id: 'goal_academic_research_project',
        category_id: 'goal_academic',
        selected_goal: 'ACADEMIC',
        age: 13,
        turn: 41,
      })
    );
  });
});
