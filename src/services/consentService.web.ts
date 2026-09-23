/**
 * Web preview does not load the native Google Mobile Ads SDK.
 * Returning false keeps the privacy-safe, non-personalized default while
 * allowing Expo web to be used for product and layout QA.
 */
export async function requestAndResolveConsent(): Promise<boolean> {
  return false;
}
