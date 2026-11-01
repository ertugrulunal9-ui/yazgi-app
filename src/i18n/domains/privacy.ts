import { DomainStrings } from './types';

/**
 * İlk açılış gizlilik tercihleri kartı (PrivacyChoicesCard).
 * Ayarlar > Gizlilik bölümündeki adlarla tutarlı tutulmalı.
 */
export const privacyStrings: DomainStrings = {
  tr: {
    privacyChoices: {
      title: 'Gizlilik tercihlerin',
      intro: 'İkisi de isteğe bağlı ve kapalı başlar; açmasan da oyun aynı şekilde çalışır.',
      personalizedAdsTitle: 'Kişiselleştirilmiş reklamlar',
      personalizedAdsBody:
        'Açarsan Google, reklam kimliğini kullanarak ilgi alanına göre reklam gösterebilir; kapalıyken reklamlar kişiselleştirilmez.',
      analyticsTitle: 'Anonim kullanım istatistikleri',
      analyticsBody:
        'Oyunu geliştirmemize yardım eder: hangi bölümlerin oynandığı ve oturum süresi gibi bilgiler adın ve reklam kimliğin olmadan gönderilir.',
      note: 'İkisini de daha sonra Ayarlar > Gizlilik bölümünden değiştirebilirsin.',
      privacyPolicy: 'Gizlilik Politikası',
      privacyPolicyAria: 'Gizlilik Politikasını tarayıcıda aç',
      continue: 'Devam',
      continueAria: 'Gizlilik tercihlerini kaydet ve devam et',
    },
  },
  en: {
    privacyChoices: {
      title: 'Your privacy choices',
      intro: 'Both are optional and start off; the game works the same either way.',
      personalizedAdsTitle: 'Personalized ads',
      personalizedAdsBody:
        'If on, Google may use your advertising ID to show ads based on your interests; when off, ads are not personalized.',
      analyticsTitle: 'Anonymous usage statistics',
      analyticsBody:
        'Helps us improve the game: things like which chapters are played and session length are sent without your name or advertising ID.',
      note: 'You can change both later in Settings > Privacy.',
      privacyPolicy: 'Privacy Policy',
      privacyPolicyAria: 'Open the Privacy Policy in your browser',
      continue: 'Continue',
      continueAria: 'Save privacy choices and continue',
    },
  },
};
