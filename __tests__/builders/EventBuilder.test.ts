import { EventBuilder } from '../../src/builders/EventBuilder';

describe('EventBuilder', () => {
  it('builds an event with fluent API', () => {
    const event = new EventBuilder('evt_builder_ok')
      .text('Test event')
      .ageRange(10, 18)
      .rarity('UNCOMMON')
      .difficulty(2)
      .challengesAxis('patience')
      .addChoice(choice => choice
        .id('choice_1')
        .text('Planli calis')
        .effect({ intelligence: 5, discipline: 3 })
        .stressEffect(-4)
        .feedback('Planli calistigin icin ilerledin.')
        .choiceType('CHALLENGE')
      )
      .build();

    expect(event.id).toBe('evt_builder_ok');
    expect(event.minAge).toBe(10);
    expect(event.maxAge).toBe(18);
    expect(event.rarity).toBe('UNCOMMON');
    expect(event.difficulty).toBe(2);
    expect(event.challengesAxis).toBe('patience');
    expect(event.choices).toHaveLength(1);
    expect(typeof event.choices[0]).toBe('object');
  });

  it('throws when required event fields are missing', () => {
    expect(() => {
      new EventBuilder('evt_missing')
        .text('Missing choices')
        .ageRange(0, 5)
        .build();
    }).toThrow('at least one choice is required');
  });

  it('throws when choice is missing required fields', () => {
    expect(() => {
      new EventBuilder('evt_bad_choice')
        .text('Bad choice')
        .ageRange(0, 5)
        .addChoice(choice => choice.text('Eksik alanlar'))
        .build();
    }).toThrow('effect is required');
  });
});
