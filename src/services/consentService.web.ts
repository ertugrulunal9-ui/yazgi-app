import { INITIAL_UMP_CONSENT_SNAPSHOT } from './adConsentPolicy';
import type { AdPrivacyOptionsResult, UmpConsentOutcome, UmpConsentSnapshot } from './adConsentPolicy';

/**
 * Web preview does not load the native Google Mobile Ads SDK.
 * 'unknown' never allows personalized ads, which keeps the privacy-safe,
 * non-personalized default while allowing Expo web to be used for product
 * and layout QA.
 */
export async function requestAndResolveConsent(): Promise<UmpConsentOutcome> {
  return 'unknown';
}

/** Web'de UMP yok: gizlilik seçenekleri girişi hiç gerekmez, Ayarlar düğmeyi çizmez. */
export const getUmpConsentSnapshot = (): UmpConsentSnapshot => INITIAL_UMP_CONSENT_SNAPSHOT;

export const subscribeUmpConsent = (_listener: (snapshot: UmpConsentSnapshot) => void): (() => void) =>
  () => {};

export async function showAdPrivacyOptions(): Promise<AdPrivacyOptionsResult> {
  return 'unavailable';
}
