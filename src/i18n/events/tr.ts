import type { EventTranslationCatalog } from './types';

export const trEventTranslations: EventTranslationCatalog = {
  fallback_generic: {
    text: 'Bugun pek bir sey olmadi. Sikildin biraz ama yarin yeni bir gun.',
    choices: {
      fallback_continue: {
        text: 'Gunu bitir',
        feedback: 'Bazen olaysiz gunler en iyisidir.',
      },
    },
  },
  evt_hastane: {
    text: 'Gozlerini hastane odasinda actin. Doktorlar asiri yorgunluk ve saglik sorunlari nedeniyle coktugunu soyluyor.',
    choices: {
      hospital_rest: {
        text: 'Dinlen ve iyiles',
        feedback: 'Birkac gun hastanede kaldin. Yavas yavas toparlaniyorsun. Belki de daha dikkatli olmalisin.',
      },
    },
  },
  forced_recovery_event: {
    text: 'Nefesin daraldi. Kisa bir mola ile toparlanabilirsin.',
    choices: {
      forced_recovery_breath: {
        text: 'Kisa bir mola ver',
        feedback: 'Biraz dinlendin. Nefesin ve enerjin toparlaniyor.',
      },
    },
  },
};
