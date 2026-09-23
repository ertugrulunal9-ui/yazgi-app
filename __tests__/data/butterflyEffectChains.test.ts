import { BUTTERFLY_EFFECT_EVENTS } from '../../src/data/butterflyEffectEvents';

const byId = new Map(BUTTERFLY_EFFECT_EVENTS.map(event => [event.id, event]));

describe('butterfly effect delayed consequence chains', () => {
  const sourceIds = [
    'butterfly_friend_moving_away',
    'butterfly_school_change',
  ];

  it.each(sourceIds)('%s schedules a branch-specific consequence years later', sourceId => {
    const source = byId.get(sourceId);

    expect(source).toBeDefined();
    expect(source?.choices.length).toBeGreaterThanOrEqual(2);

    const scheduledTargets = source?.choices.map(choice => {
      expect(typeof choice).toBe('object');
      if (typeof choice === 'function') return '';

      const scheduled = choice.futureEvents?.[0];
      expect(scheduled).toMatchObject({ trigger: 'AGE', priority: 'HIGH' });
      expect(scheduled?.age).toBeGreaterThan(source.maxAge);
      return scheduled?.eventId ?? '';
    }) ?? [];

    expect(new Set(scheduledTargets).size).toBe(scheduledTargets.length);
    scheduledTargets.forEach(targetId => {
      const target = byId.get(targetId);
      expect(target).toBeDefined();
      expect(target?.tags).toContain('scheduled_only');
      expect(target?.reqEventIds).toContain(sourceId);
      expect(target?.choices.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('offers a recovery branch when the old school-change fear returns', () => {
    const recoveryEvent = byId.get('butterfly_school_change_resisted_echo');
    const choices = recoveryEvent?.choices.filter(
      (choice): choice is Exclude<typeof choice, Function> => typeof choice !== 'function'
    ) ?? [];

    expect(choices.some(choice => (choice.stressEffect ?? 0) < 0)).toBe(true);
    expect(choices.some(choice => choice.setPermanentFlags?.overcame_school_change_fear)).toBe(true);
  });
});
