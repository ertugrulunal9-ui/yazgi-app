import { DomainStrings } from './types';
import { getEventContentStrings } from '../events';

const trEventContent = getEventContentStrings('tr');
const enEventContent = getEventContentStrings('en');

export const eventsDomainStrings: DomainStrings = {
  tr: {
    events: {
      fallback: {
        continueChoice: 'Devam Et',
        continueFeedback: 'Bir hata oluştu ama devam ediyorsun.',
      },
      swipe: {
        choiceHint: 'Bu seçim karakterini etkiler',
        selectHint: 'Bu seçimi onayla',
        select: 'Seç',
        waitToDecide: 'Karar vermek için {seconds} bekle',
        selectAria: 'Seç: {text}',
        swipeHint: 'kaydır',
        affectedStats: 'Etkilenir: {stats}',
        uncertain: 'Şansa bağlı',
      },
      content: trEventContent,
    },
  },
  en: {
    events: {
      fallback: {
        continueChoice: 'Continue',
        continueFeedback: 'An error occurred, but you keep moving forward.',
      },
      swipe: {
        choiceHint: 'This choice affects your character',
        selectHint: 'Confirm this choice',
        select: 'Select',
        waitToDecide: 'Wait {seconds} before deciding',
        selectAria: 'Select: {text}',
        swipeHint: 'swipe',
        affectedStats: 'Affects: {stats}',
        uncertain: 'Up to chance',
      },
      content: enEventContent,
    },
  },
};
