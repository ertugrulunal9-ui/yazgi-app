// UMP "gizlilik seçenekleri" girişi (Y-028, U7): AEA/İngiltere'de oyuncu reklam iznini Ayarlar'dan
// sonradan değiştirebilmeli. Durum açılıştaki UMP akışından gelir; form kapanınca yeniden okunur.
import { INITIAL_UMP_CONSENT_SNAPSHOT, resolveEffectivePersonalizedAds } from '../../src/services/adConsentPolicy';
import type { UmpConsentSnapshot } from '../../src/services/adConsentPolicy';
import type * as ConsentService from '../../src/services/consentService';

const mockRequestInfoUpdate = jest.fn();
const mockShowForm = jest.fn();
const mockShowPrivacyOptionsForm = jest.fn();
const mockGetConsentInfo = jest.fn();

jest.mock('react-native-google-mobile-ads', () => ({
  AdsConsent: {
    requestInfoUpdate: (...args: unknown[]) => mockRequestInfoUpdate(...args),
    showForm: (...args: unknown[]) => mockShowForm(...args),
    showPrivacyOptionsForm: (...args: unknown[]) => mockShowPrivacyOptionsForm(...args),
    getConsentInfo: (...args: unknown[]) => mockGetConsentInfo(...args),
  },
  AdsConsentStatus: {
    UNKNOWN: 'UNKNOWN',
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED',
    OBTAINED: 'OBTAINED',
  },
  AdsConsentPrivacyOptionsRequirementStatus: {
    UNKNOWN: 'UNKNOWN',
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED',
  },
}));

type ConsentServiceModule = typeof ConsentService;

const loadService = (): ConsentServiceModule => {
  let mod!: ConsentServiceModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('../../src/services/consentService');
  });
  return mod;
};

const info = (status: string, privacyOptionsRequirementStatus: string) => ({
  status,
  privacyOptionsRequirementStatus,
  canRequestAds: status !== 'REQUIRED',
  isConsentFormAvailable: true,
});

describe('UMP privacy options state from the startup consent flow', () => {
  beforeEach(() => {
    mockRequestInfoUpdate.mockReset();
    mockShowForm.mockReset();
    mockShowPrivacyOptionsForm.mockReset();
    mockGetConsentInfo.mockReset();
  });

  it('starts with no UMP result and no privacy options entry', () => {
    const service = loadService();
    expect(service.getUmpConsentSnapshot()).toEqual(INITIAL_UMP_CONSENT_SNAPSHOT);
  });

  it('marks the entry required in the EEA after the consent form', async () => {
    const service = loadService();
    const listener = jest.fn();
    service.subscribeUmpConsent(listener);
    mockRequestInfoUpdate
      .mockResolvedValueOnce(info('REQUIRED', 'UNKNOWN'))
      .mockResolvedValueOnce(info('OBTAINED', 'REQUIRED'));
    mockShowForm.mockResolvedValue(info('OBTAINED', 'REQUIRED'));

    await expect(service.requestAndResolveConsent()).resolves.toBe('obtained');

    const expected: UmpConsentSnapshot = { outcome: 'obtained', privacyOptionsRequired: true, canRequestAds: true, source: 'startup' };
    expect(service.getUmpConsentSnapshot()).toEqual(expected);
    expect(listener).toHaveBeenCalledWith(expected);
  });

  it('keeps the entry hidden outside the EEA (Türkiye)', async () => {
    const service = loadService();
    mockRequestInfoUpdate.mockResolvedValue(info('NOT_REQUIRED', 'NOT_REQUIRED'));

    await expect(service.requestAndResolveConsent()).resolves.toBe('not_required');

    expect(service.getUmpConsentSnapshot().privacyOptionsRequired).toBe(false);
    await expect(service.showAdPrivacyOptions()).resolves.toBe('unavailable');
    expect(mockShowPrivacyOptionsForm).not.toHaveBeenCalled();
  });

  it('treats an UNKNOWN requirement as not required', async () => {
    const service = loadService();
    mockRequestInfoUpdate.mockResolvedValue(info('UNKNOWN', 'UNKNOWN'));

    await service.requestAndResolveConsent();

    expect(service.getUmpConsentSnapshot().privacyOptionsRequired).toBe(false);
  });

  it('on a startup error still offers the entry if UMP last knew it was required (no network call)', async () => {
    const service = loadService();
    mockRequestInfoUpdate.mockResolvedValue(info('REQUIRED', 'REQUIRED'));
    mockShowForm.mockRejectedValue(new Error('null-activity'));
    mockGetConsentInfo.mockResolvedValue(info('REQUIRED', 'REQUIRED'));

    await expect(service.requestAndResolveConsent()).resolves.toBe('error');

    expect(service.getUmpConsentSnapshot()).toEqual({
      outcome: 'error',
      privacyOptionsRequired: true,
      canRequestAds: false,
      source: 'startup',
    });
  });

  it('canRequestAds comes from the final UMP info; false when the EEA form was not completed', async () => {
    const service = loadService();
    mockRequestInfoUpdate.mockResolvedValue({ ...info('REQUIRED', 'REQUIRED'), canRequestAds: false });
    mockShowForm.mockResolvedValue(info('REQUIRED', 'REQUIRED'));

    await expect(service.requestAndResolveConsent()).resolves.toBe('required');

    expect(service.getUmpConsentSnapshot().canRequestAds).toBe(false);
  });

  it('on a startup error offline, a previous session consent in the cache still allows ads (canRequestAds true)', async () => {
    const service = loadService();
    mockRequestInfoUpdate.mockRejectedValue(new Error('network'));
    mockGetConsentInfo.mockResolvedValue(info('OBTAINED', 'REQUIRED'));

    await expect(service.requestAndResolveConsent()).resolves.toBe('error');

    expect(service.getUmpConsentSnapshot().canRequestAds).toBe(true);
  });

  it('a missing canRequestAds field never counts as true', async () => {
    const service = loadService();
    mockRequestInfoUpdate.mockResolvedValue({ status: 'NOT_REQUIRED', privacyOptionsRequirementStatus: 'NOT_REQUIRED' });

    await service.requestAndResolveConsent();

    expect(service.getUmpConsentSnapshot().canRequestAds).toBe(false);
  });

  it('on a startup error with no cached info hides the entry', async () => {
    const service = loadService();
    mockRequestInfoUpdate.mockRejectedValue(new Error('network'));
    mockGetConsentInfo.mockRejectedValue(new Error('no info'));

    await expect(service.requestAndResolveConsent()).resolves.toBe('error');

    expect(service.getUmpConsentSnapshot()).toEqual({
      outcome: 'error',
      privacyOptionsRequired: false,
      canRequestAds: false,
      source: 'startup',
    });
  });
});

describe('showAdPrivacyOptions', () => {
  const startInEea = async (service: ConsentServiceModule) => {
    mockRequestInfoUpdate.mockResolvedValue(info('OBTAINED', 'REQUIRED'));
    await service.requestAndResolveConsent();
    mockRequestInfoUpdate.mockClear();
  };

  beforeEach(() => {
    mockRequestInfoUpdate.mockReset();
    mockShowForm.mockReset();
    mockShowPrivacyOptionsForm.mockReset();
    mockGetConsentInfo.mockReset();
  });

  it('opens the form and publishes the re-read UMP state when it closes', async () => {
    const service = loadService();
    await startInEea(service);
    const listener = jest.fn();
    service.subscribeUmpConsent(listener);
    mockShowPrivacyOptionsForm.mockResolvedValue(info('OBTAINED', 'REQUIRED'));

    await expect(service.showAdPrivacyOptions()).resolves.toBe('closed');

    expect(mockShowPrivacyOptionsForm).toHaveBeenCalledTimes(1);
    // Form kapanınca SDK'nın döndürdüğü durum kullanılır; yeni bir ağ isteği yapılmaz.
    expect(mockRequestInfoUpdate).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith({
      outcome: 'obtained',
      privacyOptionsRequired: true,
      canRequestAds: true,
      source: 'privacy_options',
    });
  });

  it('a player who keeps personalized ads off stays off after the form', async () => {
    const service = loadService();
    await startInEea(service);
    mockShowPrivacyOptionsForm.mockResolvedValue(info('OBTAINED', 'REQUIRED'));

    await service.showAdPrivacyOptions();

    const snapshot = service.getUmpConsentSnapshot();
    expect(resolveEffectivePersonalizedAds(snapshot.outcome, false)).toBe(false);
    expect(resolveEffectivePersonalizedAds(snapshot.outcome, true)).toBe(true);
  });

  it('reads the cached UMP state if the form resolves without info', async () => {
    const service = loadService();
    await startInEea(service);
    mockShowPrivacyOptionsForm.mockResolvedValue(undefined);
    mockGetConsentInfo.mockResolvedValue(info('REQUIRED', 'REQUIRED'));

    await expect(service.showAdPrivacyOptions()).resolves.toBe('closed');

    expect(mockGetConsentInfo).toHaveBeenCalledTimes(1);
    expect(service.getUmpConsentSnapshot().outcome).toBe('required');
  });

  it('returns error without throwing and keeps the previous state when the form fails', async () => {
    const service = loadService();
    await startInEea(service);
    const before = service.getUmpConsentSnapshot();
    const listener = jest.fn();
    service.subscribeUmpConsent(listener);
    mockShowPrivacyOptionsForm.mockRejectedValue(new Error('privacy-options-form-error'));

    await expect(service.showAdPrivacyOptions()).resolves.toBe('error');

    expect(service.getUmpConsentSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not open a second form on a double tap', async () => {
    const service = loadService();
    await startInEea(service);
    let closeForm!: (value: unknown) => void;
    mockShowPrivacyOptionsForm.mockReturnValue(new Promise((resolve) => { closeForm = resolve; }));

    const first = service.showAdPrivacyOptions();
    const second = service.showAdPrivacyOptions();
    expect(mockShowPrivacyOptionsForm).toHaveBeenCalledTimes(1);

    closeForm(info('OBTAINED', 'REQUIRED'));
    await expect(first).resolves.toBe('closed');
    await expect(second).resolves.toBe('closed');

    // Form kapandıktan sonra yeniden açılabilir.
    mockShowPrivacyOptionsForm.mockResolvedValue(info('OBTAINED', 'REQUIRED'));
    await expect(service.showAdPrivacyOptions()).resolves.toBe('closed');
    expect(mockShowPrivacyOptionsForm).toHaveBeenCalledTimes(2);
  });

  it('a synchronous SDK throw does not leave the button locked', async () => {
    const service = loadService();
    await startInEea(service);
    mockShowPrivacyOptionsForm.mockImplementationOnce(() => {
      throw new Error('sync');
    });

    await expect(service.showAdPrivacyOptions()).resolves.toBe('error');

    mockShowPrivacyOptionsForm.mockResolvedValue(info('OBTAINED', 'REQUIRED'));
    await expect(service.showAdPrivacyOptions()).resolves.toBe('closed');
  });

  it('stops notifying a listener after unsubscribe', async () => {
    const service = loadService();
    await startInEea(service);
    const listener = jest.fn();
    const unsubscribe = service.subscribeUmpConsent(listener);
    unsubscribe();
    mockShowPrivacyOptionsForm.mockResolvedValue(info('OBTAINED', 'REQUIRED'));

    await service.showAdPrivacyOptions();

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('web consent service', () => {
  it('never offers the privacy options entry and never opens a form', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const web = require('../../src/services/consentService.web') as ConsentServiceModule;

    await expect(web.requestAndResolveConsent()).resolves.toBe('unknown');
    expect(web.getUmpConsentSnapshot().privacyOptionsRequired).toBe(false);
    await expect(web.showAdPrivacyOptions()).resolves.toBe('unavailable');
    const unsubscribe = web.subscribeUmpConsent(jest.fn());
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
    expect(mockShowPrivacyOptionsForm).not.toHaveBeenCalled();
  });
});
