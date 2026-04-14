import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

/**
 * UMP (User Messaging Platform) consent flow.
 * EEA kullanıcıları için Google'ın standart onay formunu gösterir.
 * Returns true if personalized ads are allowed, false otherwise.
 */
export async function requestAndResolveConsent(): Promise<boolean> {
  try {
    const info = await AdsConsent.requestInfoUpdate();

    // Consent gerekiyorsa formu göster (EEA kullanıcıları)
    if (info.status === AdsConsentStatus.REQUIRED) {
      await AdsConsent.showForm();
    }

    // Güncel durumu al
    const finalInfo = await AdsConsent.requestInfoUpdate();

    if (!finalInfo.isConsentFormAvailable) {
      // Form gerekmiyorsa (EEA dışı kullanıcı) — kişiselleştirilmiş reklam varsayılan açık
      return true;
    }

    return finalInfo.status === AdsConsentStatus.OBTAINED;
  } catch {
    // Herhangi bir hata durumunda güvenli fallback: kişiselleştirilmemiş reklam
    return false;
  }
}
