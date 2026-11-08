// Y-028 (U7): Ayarlar > Gizlilik'teki "Reklam gizlilik seçenekleri" düğmesi yalnızca UMP bu girişi
// istediğinde (AEA/İngiltere) ve native'de çizilir. Durum açılıştaki UMP akışından gelir.
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { SettingsPanel } from '../../src/appShell/SettingsPanel';
import { requestAndResolveConsent } from '../../src/services/consentService';
import { t as translate } from '../../src/i18n/strings';
import { DEFAULT_UI_PREFS, getThemeTokens } from '../../src/utils/themeUtils';

const mockRequestInfoUpdate = jest.fn();
const mockShowPrivacyOptionsForm = jest.fn();
const mockLocale = { current: 'tr' as 'tr' | 'en' };

jest.mock('react-native', () => ({
  ...jest.requireActual('../mocks/ReactNative.mock'),
  Platform: { OS: 'android', select: (o: Record<string, unknown>) => o.android ?? o.default },
  Switch: 'Switch',
  Linking: { openURL: jest.fn(() => Promise.resolve()) },
}));

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    Easing: { out: () => () => 0, cubic: () => 0 },
    useSharedValue: (value: number) => ({ value }),
    useAnimatedStyle: (factory: () => unknown) => factory(),
    withTiming: (value: number) => value,
  };
});

jest.mock('../../src/context/UIContext', () => ({
  useUI: () => ({
    t: (key: string, params?: Record<string, string | number | boolean>, fallback?: string) =>
      translate(mockLocale.current, key, params, fallback),
    locale: mockLocale.current,
    setLocale: jest.fn(),
  }),
}));

jest.mock('../../src/services/subscriptionManager', () => ({
  canOpenPremiumPaywall: () => false,
  isPremium: () => false,
}));

jest.mock('react-native-google-mobile-ads', () => ({
  AdsConsent: {
    requestInfoUpdate: (...args: unknown[]) => mockRequestInfoUpdate(...args),
    showForm: jest.fn(),
    showPrivacyOptionsForm: (...args: unknown[]) => mockShowPrivacyOptionsForm(...args),
    getConsentInfo: jest.fn(() => Promise.reject(new Error('none'))),
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

const theme = getThemeTokens('dark');
const BUTTON_ID = 'settings-ad-privacy-options';
const ERROR_ID = 'settings-ad-privacy-options-error';

const setStartupConsent = async (status: string, privacyOptionsRequirementStatus: string) => {
  mockRequestInfoUpdate.mockResolvedValue({
    status,
    privacyOptionsRequirementStatus,
    canRequestAds: true,
    isConsentFormAvailable: true,
  });
  await act(async () => {
    await requestAndResolveConsent();
  });
};

const renderPanel = (personalizedAdsEnabled = false) => {
  const onPersonalizedAdsEnabledChange = jest.fn();
  const utils = render(
    <SettingsPanel
      open
      theme={theme}
      uiPrefs={{ ...DEFAULT_UI_PREFS, personalizedAdsEnabled }}
      soundMuted={false}
      onClose={jest.fn()}
      onThemeChange={jest.fn()}
      onDensityChange={jest.fn()}
      onToggleMotion={jest.fn()}
      onToggleHaptics={jest.fn()}
      onAnalyticsEnabledChange={jest.fn()}
      onPersonalizedAdsEnabledChange={onPersonalizedAdsEnabledChange}
      onSoundMuteChange={jest.fn()}
      onOpenSavePicker={jest.fn()}
      onOpenPaywall={jest.fn()}
      onResetGame={jest.fn()}
    />,
  );
  return { ...utils, onPersonalizedAdsEnabledChange };
};

describe('SettingsPanel ad privacy options entry', () => {
  beforeEach(() => {
    mockLocale.current = 'tr';
    (Platform as { OS: string }).OS = 'android';
    mockRequestInfoUpdate.mockReset();
    mockShowPrivacyOptionsForm.mockReset();
  });

  it('shows the button when UMP requires privacy options (EEA/UK)', async () => {
    await setStartupConsent('OBTAINED', 'REQUIRED');
    mockRequestInfoUpdate.mockClear();
    const { getByTestId, getByText } = renderPanel();

    const button = getByTestId(BUTTON_ID);
    expect(button.props.accessibilityLabel).toBe('Reklam gizlilik seçenekleri');
    expect(button.props.accessibilityRole).toBe('button');
    expect(getByText("Reklam iznini Google'ın formunda değiştir")).toBeTruthy();
    // Ayarlar açılınca UMP'ye istek yapılmaz; durum açılış akışından okunur.
    expect(mockRequestInfoUpdate).not.toHaveBeenCalled();
    expect(mockShowPrivacyOptionsForm).not.toHaveBeenCalled();
  });

  it('uses the English label in English', async () => {
    mockLocale.current = 'en';
    await setStartupConsent('OBTAINED', 'REQUIRED');
    const { getByTestId } = renderPanel();

    expect(getByTestId(BUTTON_ID).props.accessibilityLabel).toBe('Ad privacy options');
  });

  it('does not draw the button when UMP does not require it (e.g. Türkiye)', async () => {
    await setStartupConsent('NOT_REQUIRED', 'NOT_REQUIRED');
    const { queryByTestId } = renderPanel();

    expect(queryByTestId(BUTTON_ID)).toBeNull();
  });

  it('does not draw the button on web even if the state says required', async () => {
    await setStartupConsent('OBTAINED', 'REQUIRED');
    (Platform as { OS: string }).OS = 'web';
    const { queryByTestId } = renderPanel();

    expect(queryByTestId(BUTTON_ID)).toBeNull();
  });

  it('appears once the startup UMP flow finishes while the panel is mounted', async () => {
    await setStartupConsent('NOT_REQUIRED', 'NOT_REQUIRED');
    const { queryByTestId } = renderPanel();
    expect(queryByTestId(BUTTON_ID)).toBeNull();

    await setStartupConsent('OBTAINED', 'REQUIRED');

    expect(queryByTestId(BUTTON_ID)).not.toBeNull();
  });

  it('opens the UMP privacy options form and leaves the player switch untouched', async () => {
    await setStartupConsent('OBTAINED', 'REQUIRED');
    mockShowPrivacyOptionsForm.mockResolvedValue({
      status: 'OBTAINED',
      privacyOptionsRequirementStatus: 'REQUIRED',
      canRequestAds: true,
      isConsentFormAvailable: true,
    });
    const { getByTestId, queryByTestId, getByLabelText, onPersonalizedAdsEnabledChange } = renderPanel(false);

    await act(async () => {
      fireEvent.press(getByTestId(BUTTON_ID));
    });

    expect(mockShowPrivacyOptionsForm).toHaveBeenCalledTimes(1);
    expect(onPersonalizedAdsEnabledChange).not.toHaveBeenCalled();
    expect(getByLabelText('Kişiselleştirilmiş Reklam').props.value).toBe(false);
    expect(queryByTestId(ERROR_ID)).toBeNull();
  });

  it('shows a short Turkish warning (no crash) when the form fails', async () => {
    await setStartupConsent('OBTAINED', 'REQUIRED');
    mockShowPrivacyOptionsForm.mockRejectedValue(new Error('privacy-options-form-error'));
    const { getByTestId } = renderPanel();

    await act(async () => {
      fireEvent.press(getByTestId(BUTTON_ID));
    });

    expect(getByTestId(ERROR_ID).props.children)
      .toBe('Reklam gizlilik seçenekleri şu an açılamadı. Biraz sonra yeniden dene.');
    expect(getByTestId(BUTTON_ID)).toBeTruthy();
  });
});
