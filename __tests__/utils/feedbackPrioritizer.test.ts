import {
  buildPrimaryFeedbackMessage,
  EventOutcomeSummary,
  fateContradictsOutcome,
  getOutcomeDirection,
} from '../../src/utils/feedbackPrioritizer';
import { setRuntimeLocale, t } from '../../src/i18n/strings';
import type { FateOutcome, Stats } from '../../src/types';

const stats: Stats = {
  health: 60,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 100,
  energy: 60,
  familyRelation: 50,
};

const summary = (
  fateOutcome: FateOutcome,
  statChanges: Partial<Stats>
): EventOutcomeSummary => ({
  statChanges,
  newStats: stats,
  fateOutcome,
});

const secondaryOf = (fateOutcome: FateOutcome, statChanges: Partial<Stats>): string | null => (
  buildPrimaryFeedbackMessage(summary(fateOutcome, statChanges), 'Seçim sonucu.').secondary
);

describe('feedbackPrioritizer luck message vs. outcome direction', () => {
  beforeEach(() => {
    setRuntimeLocale('tr');
  });

  describe('getOutcomeDirection', () => {
    it('treats stat gains as GAIN and ignores energy cost', () => {
      expect(getOutcomeDirection({ charisma: 3, energy: -5 })).toBe('GAIN');
    });

    it('treats stat losses as LOSS', () => {
      expect(getOutcomeDirection({ health: -4, familyRelation: -2 })).toBe('LOSS');
    });

    it('uses the majority when gains and losses are mixed, MIXED on a tie', () => {
      expect(getOutcomeDirection({ charisma: 3, discipline: 2, health: -1 })).toBe('GAIN');
      expect(getOutcomeDirection({ charisma: 3, health: -1 })).toBe('MIXED');
    });

    it('returns NONE when nothing but energy moved or changes are missing', () => {
      expect(getOutcomeDirection({ energy: -5 })).toBe('NONE');
      expect(getOutcomeDirection({})).toBe('NONE');
      expect(getOutcomeDirection(undefined)).toBe('NONE');
    });
  });

  describe('fateContradictsOutcome', () => {
    it('flags bad luck on a good outcome and good luck on a bad outcome', () => {
      expect(fateContradictsOutcome('CURSED', 'GAIN')).toBe(true);
      expect(fateContradictsOutcome('UNLUCKY', 'GAIN')).toBe(true);
      expect(fateContradictsOutcome('BLESSED', 'LOSS')).toBe(true);
      expect(fateContradictsOutcome('FORTUNATE', 'LOSS')).toBe(true);
    });

    it('does not flag matching or neutral combinations', () => {
      expect(fateContradictsOutcome('CURSED', 'LOSS')).toBe(false);
      expect(fateContradictsOutcome('BLESSED', 'GAIN')).toBe(false);
      expect(fateContradictsOutcome('CURSED', 'MIXED')).toBe(false);
      expect(fateContradictsOutcome('NEUTRAL', 'GAIN')).toBe(false);
      expect(fateContradictsOutcome(undefined, 'GAIN')).toBe(false);
    });
  });

  describe('secondary feedback line', () => {
    it('does not say everything went wrong when a CURSED roll still produced gains', () => {
      const message = secondaryOf('CURSED', { charisma: 2, intelligence: 1 });
      expect(message).toBe(t('tr', 'feedback.prioritizer.fateCursedGain'));
      expect(message).not.toBe(t('tr', 'feedback.prioritizer.fateCursed'));
      expect(message).not.toMatch(/ters gitti/);
    });

    it('does not say everything went smoothly when a BLESSED roll still produced losses', () => {
      const message = secondaryOf('BLESSED', { health: -3, discipline: -2 });
      expect(message).toBe(t('tr', 'feedback.prioritizer.fateBlessedLoss'));
      expect(message).not.toBe(t('tr', 'feedback.prioritizer.fateBlessed'));
      expect(message).not.toMatch(/yolunda gitti/);
    });

    it('keeps the original wording when luck and outcome agree', () => {
      expect(secondaryOf('CURSED', { health: -3 })).toBe(t('tr', 'feedback.prioritizer.fateCursed'));
      expect(secondaryOf('BLESSED', { charisma: 3 })).toBe(t('tr', 'feedback.prioritizer.fateBlessed'));
    });

    it('keeps the original wording for mixed or neutral outcomes', () => {
      expect(secondaryOf('CURSED', { charisma: 3, health: -3 })).toBe(t('tr', 'feedback.prioritizer.fateCursed'));
      expect(secondaryOf('CURSED', { energy: -5 })).toBe(t('tr', 'feedback.prioritizer.fateCursed'));
    });

    it('has English wording for the contradiction messages', () => {
      setRuntimeLocale('en');
      expect(secondaryOf('CURSED', { charisma: 2 })).toBe(t('en', 'feedback.prioritizer.fateCursedGain'));
      expect(secondaryOf('BLESSED', { health: -2 })).toBe(t('en', 'feedback.prioritizer.fateBlessedLoss'));
      expect(t('en', 'feedback.prioritizer.fateCursedGain')).not.toBe('feedback.prioritizer.fateCursedGain');
      expect(t('en', 'feedback.prioritizer.fateBlessedLoss')).not.toBe('feedback.prioritizer.fateBlessedLoss');
    });
  });
});
