import { withEventLocalizationKeys } from '../../src/i18n/events/keyMapper';

describe('event key mapper', () => {
  it('assigns text keys to both static and dynamic event text', () => {
    const staticEvent = withEventLocalizationKeys({
      id: 'static_event',
      text: 'Static event text',
      minAge: 0,
      maxAge: 99,
      choices: [{ id: 'ok', text: 'OK', effect: {}, feedback: 'done' }],
      rarity: 'COMMON',
    } as any);

    const dynamicEvent = withEventLocalizationKeys({
      id: 'dynamic_event',
      text: () => 'Dynamic event text',
      minAge: 0,
      maxAge: 99,
      choices: [{ id: 'ok', text: 'OK', effect: {}, feedback: 'done' }],
      rarity: 'COMMON',
    } as any);

    expect(staticEvent.textKey).toBe('events.content.static_event.text');
    expect(dynamicEvent.textKey).toBe('events.content.dynamic_event.text');
  });
});
