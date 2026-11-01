import type { UmpConsentOutcome } from './adConsentPolicy';

/**
 * Web preview does not load the native Google Mobile Ads SDK.
 * 'unknown' never allows personalized ads, which keeps the privacy-safe,
 * non-personalized default while allowing Expo web to be used for product
 * and layout QA.
 */
export async function requestAndResolveConsent(): Promise<UmpConsentOutcome> {
  return 'unknown';
}
