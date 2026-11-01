import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import type { UmpConsentOutcome } from './adConsentPolicy';

/**
 * UMP (User Messaging Platform) consent flow.
 * EEA kullanıcıları için Google'ın standart onay formunu gösterir.
 *
 * Yalnızca UMP durumunu döndürür; oyuncunun Ayarlar'daki tercihine dokunmaz.
 * Kişiselleştirilmiş reklam kararı `resolveEffectivePersonalizedAds` ile
 * (UMP izin veriyor VE oyuncu açtı) verilir.
 */
export async function requestAndResolveConsent(): Promise<UmpConsentOutcome> {
  try {
    const info = await AdsConsent.requestInfoUpdate();

    // Consent gerekiyorsa formu göster (EEA kullanıcıları)
    if (info.status === AdsConsentStatus.REQUIRED) {
      await AdsConsent.showForm();
    }

    // Güncel durumu al
    const finalInfo = await AdsConsent.requestInfoUpdate();

    switch (finalInfo.status) {
      case AdsConsentStatus.OBTAINED:
        return 'obtained';
      case AdsConsentStatus.NOT_REQUIRED:
        return 'not_required';
      case AdsConsentStatus.REQUIRED:
        return 'required';
      default:
        return 'unknown';
    }
  } catch {
    // Herhangi bir hata durumunda güvenli fallback: kişiselleştirilmemiş reklam
    return 'error';
  }
}
