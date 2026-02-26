import type { EventTranslationCatalog } from './types';
import { enEventTranslationsGenerated } from './en.generated';
import { enEventTranslationsOverrides } from './en.overrides';

export const enEventTranslations: EventTranslationCatalog = {
  ...enEventTranslationsGenerated,
  ...enEventTranslationsOverrides,
  fallback_generic: {
    ...(enEventTranslationsGenerated.fallback_generic ?? {}),
    text: 'Not much happened today. You felt a little bored, but tomorrow is a new day.',
    choices: {
      ...(enEventTranslationsGenerated.fallback_generic?.choices ?? {}),
      fallback_continue: {
        ...(enEventTranslationsGenerated.fallback_generic?.choices?.fallback_continue ?? {}),
        text: 'End the day',
        feedback: 'Sometimes the best days are the quiet ones.',
      },
    },
  },
  evt_hastane: {
    ...(enEventTranslationsGenerated.evt_hastane ?? {}),
    text: 'You woke up in a hospital room. Doctors say you collapsed from severe fatigue and health issues.',
    choices: {
      ...(enEventTranslationsGenerated.evt_hastane?.choices ?? {}),
      hospital_rest: {
        ...(enEventTranslationsGenerated.evt_hastane?.choices?.hospital_rest ?? {}),
        text: 'Rest and recover',
        feedback: 'You stayed in the hospital for a few days. You are slowly recovering. Maybe it is time to be more careful.',
      },
    },
  },
  forced_recovery_event: {
    ...(enEventTranslationsGenerated.forced_recovery_event ?? {}),
    text: 'You are short of breath. A short break can help you recover.',
    choices: {
      ...(enEventTranslationsGenerated.forced_recovery_event?.choices ?? {}),
      forced_recovery_breath: {
        ...(enEventTranslationsGenerated.forced_recovery_event?.choices?.forced_recovery_breath ?? {}),
        text: 'Take a short break',
        feedback: 'You rested a bit. Your breathing and energy are recovering.',
      },
    },
  },
};
