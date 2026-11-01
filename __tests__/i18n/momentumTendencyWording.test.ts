import { getRuntimeStringArray, setRuntimeLocale, t } from '../../src/i18n/strings';
import { MOMENTUM_TENDENCY_LABELS } from '../../src/systems/PersonalityMomentumEngine';
import { MOMENTUM_STREAK_LEVEL_HINTS } from '../../src/utils/momentumVisibility';
import { createInitialPersonalityState } from '../../src/systems/PersonalityMomentumEngine';
import { getMomentumDialogueTag } from '../../src/utils/momentumDialogue';

// AGGRESSIVE kayıtlı kayıtlarda saklanan iç anahtar; oyuncuya "Cesur" / "Bold" olarak görünür.
// Cesaret ve sağlık artışı bu eğilimi besler, bu yüzden yumuşak (bebek) seçimlerde "agresif" demek yanlış okunuyordu.
const AGGRESSION_WORDS = /agresif|aggressive|aggression|\bsert\b/i;

const playerFacingTexts = (locale: 'tr' | 'en'): string[] => {
  setRuntimeLocale(locale);
  return [
    t(locale, 'feedback.momentum.tendencies.AGGRESSIVE'),
    t(locale, 'feedback.momentum.flavor.AGGRESSIVE'),
    t(locale, 'feedback.momentum.dialogueSubtitles.AGGRESSIVE'),
    t(locale, 'narrative.monologue.identity.tendency.AGGRESSIVE'),
    t(locale, 'narrative.memory.tendency.aggressive'),
    ...getRuntimeStringArray('narrative.monologue.banks.momentum.AGGRESSIVE'),
  ];
};

describe('AGGRESSIVE momentum tendency wording', () => {
  afterEach(() => setRuntimeLocale('tr'));

  it('is called Cesur in Turkish player-facing strings', () => {
    expect(t('tr', 'feedback.momentum.tendencies.AGGRESSIVE')).toBe('Cesur');
    expect(t('tr', 'feedback.momentum.flavor.AGGRESSIVE')).toBe('Cesur ruhun güçleniyor!');
    expect(MOMENTUM_TENDENCY_LABELS.AGGRESSIVE).toBe('Cesur');
    playerFacingTexts('tr').forEach(text => {
      expect(text).not.toMatch(AGGRESSION_WORDS);
    });
  });

  it('is called Bold in English player-facing strings', () => {
    expect(t('en', 'feedback.momentum.tendencies.AGGRESSIVE')).toBe('Bold');
    expect(t('en', 'feedback.momentum.flavor.AGGRESSIVE')).toBe('Your bold spirit is growing stronger!');
    playerFacingTexts('en').forEach(text => {
      expect(text).not.toMatch(AGGRESSION_WORDS);
    });
  });

  it('keeps streak hints and the dialogue tag free of aggression wording', () => {
    Object.values(MOMENTUM_STREAK_LEVEL_HINTS.AGGRESSIVE).forEach(hint => {
      expect(hint).not.toMatch(AGGRESSION_WORDS);
      expect(hint).toMatch(/cesur/i);
    });

    const state = createInitialPersonalityState();
    state.AGGRESSIVE = { count: 8, streak: 6, multiplier: 1.5 };
    const tag = getMomentumDialogueTag(
      { id: 'ch_bold', text: 'Atla', effect: {}, momentumTag: 'AGGRESSIVE' } as any,
      state,
    );
    expect(tag?.label).toBe('Cesur');
    expect(tag?.tagText).toBe('[Cesur]');
    expect(tag?.subtitle).not.toMatch(AGGRESSION_WORDS);
  });
});
