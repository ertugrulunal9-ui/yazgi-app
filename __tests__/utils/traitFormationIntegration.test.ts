import { checkTraitFormation, getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import { GameEvent } from '../../src/types';

describe('Trait Formation - Event Choice Trigger', () => {
  it('should add progress for an event choice trigger', () => {
    const baseState = getInitialGameState();
    const stats = getInitialStats();

    const event: GameEvent = {
      id: 'pers_grup_zorbaligi',
      text: 'Test event',
      minAge: 6,
      maxAge: 18,
      choices: [],
    };

    const state = {
      ...baseState,
      age: 10,
      traits: [],
      traitProgress: {},
      currentEvent: event,
    };

    const result = checkTraitFormation(null, 'zorbalik_mudahale', state, stats);

    expect(result.updatedProgress['EMPATHETIC']?.points ?? 0).toBeGreaterThan(0);
  });
});
