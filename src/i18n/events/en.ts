import type { EventTranslationCatalog } from './types';
import { enEventTranslationsGenerated } from './en.generated';
import { enEventTranslationsOverrides } from './en.overrides';
import { enOutcomeFeedbackTranslations } from './en.outcomes';

const baseEnEventTranslations: EventTranslationCatalog = {
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

// Şansa bağlı sonuç metinlerini olayın mevcut çevirisini ezmeden ekler
const withOutcomeFeedback = (
  catalog: EventTranslationCatalog,
  outcomes: typeof enOutcomeFeedbackTranslations,
): EventTranslationCatalog => {
  const result: EventTranslationCatalog = { ...catalog };
  for (const [eventId, choices] of Object.entries(outcomes)) {
    const event = result[eventId] ?? {};
    const eventChoices = { ...(event.choices ?? {}) };
    for (const [choiceId, outcomeFeedback] of Object.entries(choices)) {
      const choice = eventChoices[choiceId] ?? {};
      const mergedOutcomes = { ...(choice.outcomes ?? {}) };
      for (const [outcomeId, feedback] of Object.entries(outcomeFeedback)) {
        mergedOutcomes[outcomeId] = { ...(mergedOutcomes[outcomeId] ?? {}), feedback };
      }
      eventChoices[choiceId] = { ...choice, outcomes: mergedOutcomes };
    }
    result[eventId] = { ...event, choices: eventChoices };
  }
  return result;
};

export const enEventTranslations: EventTranslationCatalog = withOutcomeFeedback(
  baseEnEventTranslations,
  enOutcomeFeedbackTranslations,
);
