import type { EventTranslationCatalog } from './types';
import { trEventTranslationsGenerated } from './tr.generated';

export const trEventTranslations: EventTranslationCatalog = {
  ...trEventTranslationsGenerated,
  fallback_generic: {
    ...(trEventTranslationsGenerated.fallback_generic ?? {}),
    text: 'Bugün pek bir şey olmadı. Sıkıldın biraz ama yarın yeni bir gün.',
    choices: {
      ...(trEventTranslationsGenerated.fallback_generic?.choices ?? {}),
      fallback_continue: {
        ...(trEventTranslationsGenerated.fallback_generic?.choices?.fallback_continue ?? {}),
        text: 'Günü bitir',
        feedback: 'Bazen olaysız günler en iyisidir.',
      },
    },
  },
  evt_hastane: {
    ...(trEventTranslationsGenerated.evt_hastane ?? {}),
    text: 'Gözlerini hastane odasında açtın. Doktorlar aşırı yorgunluk ve sağlık sorunları nedeniyle çöktüğünü söylüyor.',
    choices: {
      ...(trEventTranslationsGenerated.evt_hastane?.choices ?? {}),
      hospital_rest: {
        ...(trEventTranslationsGenerated.evt_hastane?.choices?.hospital_rest ?? {}),
        text: 'Dinlen ve iyileş',
        feedback: 'Birkaç gün hastanede kaldın. Yavaş yavaş toparlanıyorsun. Belki de daha dikkatli olmalısın.',
      },
    },
  },
  forced_recovery_event: {
    ...(trEventTranslationsGenerated.forced_recovery_event ?? {}),
    text: 'Nefesin daraldı. Kısa bir mola ile toparlanabilirsin.',
    choices: {
      ...(trEventTranslationsGenerated.forced_recovery_event?.choices ?? {}),
      forced_recovery_breath: {
        ...(trEventTranslationsGenerated.forced_recovery_event?.choices?.forced_recovery_breath ?? {}),
        text: 'Kısa bir mola ver',
        feedback: 'Biraz dinlendin. Nefesin ve enerjin toparlanıyor.',
      },
    },
  },
};
