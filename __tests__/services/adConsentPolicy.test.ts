import {
  isPersonalizedAdsAllowedByUmp,
  resolveEffectivePersonalizedAds,
  UmpConsentOutcome,
} from '../../src/services/adConsentPolicy';
import { requestAndResolveConsent } from '../../src/services/consentService';

const mockRequestInfoUpdate = jest.fn();
const mockShowForm = jest.fn();

jest.mock('react-native-google-mobile-ads', () => ({
  AdsConsent: {
    requestInfoUpdate: (...args: unknown[]) => mockRequestInfoUpdate(...args),
    showForm: (...args: unknown[]) => mockShowForm(...args),
  },
  AdsConsentStatus: {
    UNKNOWN: 'UNKNOWN',
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED',
    OBTAINED: 'OBTAINED',
  },
}));

describe('resolveEffectivePersonalizedAds', () => {
  const matrix: Array<[UmpConsentOutcome | null, boolean, boolean]> = [
    ['obtained', true, true],
    ['obtained', false, false],
    ['not_required', true, true],
    ['not_required', false, false],
    ['required', true, false],
    ['required', false, false],
    ['unknown', true, false],
    ['unknown', false, false],
    ['error', true, false],
    ['error', false, false],
    // UMP sonucu henüz gelmedi: oyuncu açmış olsa bile kapalı.
    [null, true, false],
    [null, false, false],
  ];

  it.each(matrix)('UMP=%s, player opt-in=%s -> %s', (outcome, optedIn, expected) => {
    expect(resolveEffectivePersonalizedAds(outcome, optedIn)).toBe(expected);
  });

  it('only obtained / not_required let UMP allow personalized ads', () => {
    expect(isPersonalizedAdsAllowedByUmp('obtained')).toBe(true);
    expect(isPersonalizedAdsAllowedByUmp('not_required')).toBe(true);
    expect(isPersonalizedAdsAllowedByUmp('required')).toBe(false);
    expect(isPersonalizedAdsAllowedByUmp('unknown')).toBe(false);
    expect(isPersonalizedAdsAllowedByUmp('error')).toBe(false);
    expect(isPersonalizedAdsAllowedByUmp(null)).toBe(false);
  });
});

describe('requestAndResolveConsent', () => {
  beforeEach(() => {
    mockRequestInfoUpdate.mockReset();
    mockShowForm.mockReset();
  });

  it('outside the EEA reports not_required (it no longer means "personalized on")', async () => {
    mockRequestInfoUpdate.mockResolvedValue({ status: 'NOT_REQUIRED', isConsentFormAvailable: false });

    await expect(requestAndResolveConsent()).resolves.toBe('not_required');
    expect(mockShowForm).not.toHaveBeenCalled();
    // Oyuncu tercihi kapalıysa kişiselleştirilmiş reklam kapalı kalır.
    expect(resolveEffectivePersonalizedAds('not_required', false)).toBe(false);
  });

  it('shows the form in the EEA and reports obtained after the player answers', async () => {
    mockRequestInfoUpdate
      .mockResolvedValueOnce({ status: 'REQUIRED', isConsentFormAvailable: true })
      .mockResolvedValueOnce({ status: 'OBTAINED', isConsentFormAvailable: true });
    mockShowForm.mockResolvedValue({ status: 'OBTAINED' });

    await expect(requestAndResolveConsent()).resolves.toBe('obtained');
    expect(mockShowForm).toHaveBeenCalledTimes(1);
  });

  it('reports required when the EEA form was dismissed', async () => {
    mockRequestInfoUpdate.mockResolvedValue({ status: 'REQUIRED', isConsentFormAvailable: true });
    mockShowForm.mockResolvedValue({ status: 'REQUIRED' });

    await expect(requestAndResolveConsent()).resolves.toBe('required');
  });

  it('reports unknown when UMP cannot determine the status', async () => {
    mockRequestInfoUpdate.mockResolvedValue({ status: 'UNKNOWN', isConsentFormAvailable: false });

    await expect(requestAndResolveConsent()).resolves.toBe('unknown');
  });

  it('reports error (never allowed) when UMP throws', async () => {
    mockRequestInfoUpdate.mockRejectedValue(new Error('network'));

    const outcome = await requestAndResolveConsent();
    expect(outcome).toBe('error');
    expect(resolveEffectivePersonalizedAds(outcome, true)).toBe(false);
  });

  it('reports error when showing the form fails', async () => {
    mockRequestInfoUpdate.mockResolvedValue({ status: 'REQUIRED', isConsentFormAvailable: true });
    mockShowForm.mockRejectedValue(new Error('form'));

    await expect(requestAndResolveConsent()).resolves.toBe('error');
  });
});
