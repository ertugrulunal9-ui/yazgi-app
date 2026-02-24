import { DomainStrings } from './types';

export const eventsDomainStrings: DomainStrings = {
  tr: {
    events: {
      fallback: {
        continueChoice: 'Devam Et',
        continueFeedback: 'Bir hata olustu ama devam ediyorsun.',
      },
      swipe: {
        choiceHint: 'Bu secim karakterini etkiler',
        selectHint: 'Bu secimi onayla',
        select: 'Sec',
        waitToDecide: 'Karar vermek icin {seconds} bekle',
        selectAria: 'Sec: {text}',
        swipeHint: 'kaydir',
      },
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
      },
    },
  },
};
