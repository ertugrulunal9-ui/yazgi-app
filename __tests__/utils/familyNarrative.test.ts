import {
  DEFAULT_FAMILY_EVOLUTION_STATE,
  getFamilyAtmosphereLabel,
  getFamilyThought,
  isFamilyThoughtTurn,
  updateFamilyEvolutionOnAgeUp,
} from '../../src/utils/familyNarrative';

describe('familyNarrative', () => {
  it('triggers strict softening event after 5 high-relation years', () => {
    const result = updateFamilyEvolutionOnAgeUp({
      previousState: {
        ...DEFAULT_FAMILY_EVOLUTION_STATE,
        yearsAtHighRelation: 4,
      },
      family: { wealth: 'MIDDLE', dynamic: 'STRICT', allowance: 25 },
      familyRelation: 85,
      age: 14,
      now: () => 1700,
      randomFn: () => 0.12345,
    });

    expect(result.nextState.strictWarmthTriggered).toBe(true);
    expect(result.nextState.yearsAtHighRelation).toBe(5);
    expect(result.scheduledEvents).toHaveLength(1);
    expect(result.scheduledEvents[0].eventId).toBe('fam_evo_strict_softening');
    expect(result.scheduledEvents[0].priority).toBe('HIGH');
  });

  it('triggers family crisis event after 3 low-relation years', () => {
    const result = updateFamilyEvolutionOnAgeUp({
      previousState: {
        ...DEFAULT_FAMILY_EVOLUTION_STATE,
        yearsAtLowRelation: 2,
      },
      family: { wealth: 'POOR', dynamic: 'CHAOTIC', allowance: 10 },
      familyRelation: 18,
      age: 12,
      now: () => 1800,
      randomFn: () => 0.55,
    });

    expect(result.nextState.familyCrisisTriggered).toBe(true);
    expect(result.nextState.yearsAtLowRelation).toBe(3);
    expect(result.scheduledEvents).toHaveLength(1);
    expect(result.scheduledEvents[0].eventId).toBe('fam_evo_family_silence');
  });

  it('resets relation streaks when thresholds are broken', () => {
    const result = updateFamilyEvolutionOnAgeUp({
      previousState: {
        ...DEFAULT_FAMILY_EVOLUTION_STATE,
        yearsAtHighRelation: 3,
        yearsAtLowRelation: 2,
      },
      family: { wealth: 'RICH', dynamic: 'SUPPORTIVE', allowance: 60 },
      familyRelation: 55,
      age: 10,
    });

    expect(result.nextState.yearsAtHighRelation).toBe(0);
    expect(result.nextState.yearsAtLowRelation).toBe(0);
    expect(result.scheduledEvents).toHaveLength(0);
  });

  it('emits family thought only on cadence turns', () => {
    expect(isFamilyThoughtTurn(7)).toBe(true);
    expect(isFamilyThoughtTurn(8)).toBe(false);
  });

  it('builds strict low-relation thought on valid turns', () => {
    const thought = getFamilyThought({
      family: { wealth: 'MIDDLE', dynamic: 'STRICT', allowance: 30 },
      familyRelation: 32,
      age: 13,
      turn: 7,
      evolution: DEFAULT_FAMILY_EVOLUTION_STATE,
    });

    expect(thought).toContain('Babam yine kizacak');
  });

  it('returns atmosphere labels for evolved families', () => {
    const label = getFamilyAtmosphereLabel(
      { wealth: 'MIDDLE', dynamic: 'STRICT', allowance: 30 },
      70,
      {
        ...DEFAULT_FAMILY_EVOLUTION_STATE,
        strictWarmthTriggered: true,
      }
    );

    expect(label).toBe('Yumusayan Otorite');
  });
});
