import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Linking } from 'react-native';
import { PrivacyChoicesCard } from '../../src/components/PrivacyChoicesCard';
import { PRIVACY_POLICY_URL } from '../../src/config/legal';
import { getThemeTokens } from '../../src/utils/themeUtils';

jest.mock('react-native', () => ({
  ...jest.requireActual('../mocks/ReactNative.mock'),
  Switch: 'Switch',
  Linking: { openURL: jest.fn(() => Promise.resolve()) },
}));

const theme = getThemeTokens('dark');
const metrics = { font: 15, pad: 14, icon: 22 };

const render = (props: Partial<React.ComponentProps<typeof PrivacyChoicesCard>> = {}) => {
  const onSubmit = jest.fn();
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <PrivacyChoicesCard
        theme={theme}
        metrics={metrics}
        locale="tr"
        initialPersonalizedAds={false}
        initialAnalytics={false}
        onSubmit={onSubmit}
        {...props}
      />
    );
  });
  const adsSwitch = () => tree.root.findByProps({ testID: 'privacy-choice-personalized-ads' });
  const analyticsSwitch = () => tree.root.findByProps({ testID: 'privacy-choice-analytics' });
  const continueButton = () =>
    tree.root.findByProps({ accessibilityLabel: 'Gizlilik tercihlerini kaydet ve devam et' });
  return { tree, onSubmit, adsSwitch, analyticsSwitch, continueButton };
};

describe('PrivacyChoicesCard', () => {
  it('starts with both opt-ins off and saves that choice', () => {
    const { tree, onSubmit, adsSwitch, analyticsSwitch, continueButton } = render();

    expect(adsSwitch().props.value).toBe(false);
    expect(analyticsSwitch().props.value).toBe(false);
    expect(adsSwitch().props.accessibilityLabel).toBe('Kişiselleştirilmiş reklamlar');
    expect(analyticsSwitch().props.accessibilityLabel).toBe('Anonim kullanım istatistikleri');

    act(() => {
      continueButton().props.onPress();
    });

    expect(onSubmit).toHaveBeenCalledWith({ personalizedAds: false, analytics: false });
    tree.unmount();
  });

  it('keeps the two choices separate', () => {
    const { tree, onSubmit, adsSwitch, analyticsSwitch, continueButton } = render();

    act(() => {
      analyticsSwitch().props.onValueChange(true);
    });
    expect(adsSwitch().props.value).toBe(false);
    expect(analyticsSwitch().props.value).toBe(true);

    act(() => {
      adsSwitch().props.onValueChange(true);
    });
    act(() => {
      analyticsSwitch().props.onValueChange(false);
    });
    act(() => {
      continueButton().props.onPress();
    });

    expect(onSubmit).toHaveBeenCalledWith({ personalizedAds: true, analytics: false });
    tree.unmount();
  });

  it('uses the given initial values (existing players)', () => {
    const { tree, adsSwitch, analyticsSwitch } = render({ initialAnalytics: true });

    expect(adsSwitch().props.value).toBe(false);
    expect(analyticsSwitch().props.value).toBe(true);
    tree.unmount();
  });

  it('opens the privacy policy used in Settings', () => {
    const { tree } = render();
    const link = tree.root.findByProps({ accessibilityLabel: 'Gizlilik Politikasını tarayıcıda aç' });

    act(() => {
      link.props.onPress();
    });

    expect(link.props.accessibilityRole).toBe('link');
    expect(Linking.openURL).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
    tree.unmount();
  });

  it('renders English copy', () => {
    const { tree } = render({ locale: 'en' });

    expect(tree.root.findByProps({ accessibilityLabel: 'Save privacy choices and continue' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'privacy-choice-analytics' }).props.accessibilityLabel)
      .toBe('Anonymous usage statistics');
    tree.unmount();
  });
});
