import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { FeedbackOverlay } from '../../src/components/FeedbackOverlay';
import { t as translate } from '../../src/i18n/strings';

let mockTextDone = true;

jest.mock('../../src/animations', () => ({
  FadeInUpView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../src/animations/ButtonAnimations', () => {
  const { Pressable } = require('react-native');
  return {
    AnimatedButton: ({ children, onPress, disabled, style, ...rest }: any) => (
      <Pressable onPress={disabled ? undefined : onPress} disabled={disabled} accessibilityState={{ disabled: !!disabled }} style={style} {...rest}>
        {children}
      </Pressable>
    ),
  };
});

jest.mock('../../src/components/ui', () => {
  const ReactLib = require('react');
  const { Text, View } = require('react-native');
  return {
    Card: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    StatChange: () => null,
    TypewriterText: ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
      ReactLib.useEffect(() => {
        if (mockTextDone) onComplete?.();
      }, [onComplete]);
      return <Text>{text}</Text>;
    },
  };
});

jest.mock('../../src/components/ui/LocaleText', () => {
  const { Text } = require('react-native');
  return { Text };
});

jest.mock('../../src/components/FateTokenDisplay', () => ({
  FateTokenDisplay: () => null,
  hasNegativeOutcome: () => false,
}));

jest.mock('../../src/components/TraitProgressChip', () => ({ TraitProgressChip: () => null }));

const theme = {
  appBg: '#0f172a', surfaceBase: '#111827', surfaceRaised: '#374151', border: '#334155',
  textPrimary: '#f9fafb', textSecondary: '#94a3b8', accentBrand: '#38bdf8',
  accentStat: '#f59e0b', accentSkill: '#22c55e',
};

const stats = { health: 80, energy: 75, intelligence: 70, charisma: 55, discipline: 65, money: 450, familyRelation: 40 };

const makeT = (locale: 'tr' | 'en') =>
  (key: string, params?: any, fallback?: string) => translate(locale, key, params, fallback);

const renderOverlay = (over: Record<string, any> = {}, locale: 'tr' | 'en' = 'tr') => {
  const props = {
    theme, metrics: { pad: 12, font: 16 }, insets: { top: 0, bottom: 0 },
    t: makeT(locale),
    lastResult: { feedback: 'Sonuç', changes: { health: -2 } } as any,
    currentEvent: null, selectedChoice: null, stats, personality: {} as any, skills: {} as any,
    fate: undefined, canReroll: false, buttonEnabled: true, hasCrisisRecoveryOption: true,
    crisisRecoveryLoading: false, undoLoading: false, canUndo: true,
    onUndo: jest.fn(), onContinue: jest.fn(), onRecoverWithAd: jest.fn(), onReroll: jest.fn(),
    ...over,
  };
  return { props, ...render(<FeedbackOverlay {...props} />) };
};

describe('FeedbackOverlay reklam düğmesi korumaları', () => {
  let alertSpy: jest.SpyInstance;
  beforeEach(() => {
    mockTextDone = true;
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });
  afterEach(() => alertSpy.mockRestore());

  it('düğme metni reklam olduğunu söyler (TR ve EN)', () => {
    const tr = renderOverlay();
    expect(tr.getByText('Reklam izle: Seçimi geri al')).toBeTruthy();
    tr.unmount();
    const en = renderOverlay({}, 'en');
    expect(en.getByText('Watch an ad: Undo choice')).toBeTruthy();
  });

  it('onay olmadan onUndo çağrılmaz, onayla çağrılır', () => {
    const { getByText, props } = renderOverlay();
    fireEvent.press(getByText('Reklam izle: Seçimi geri al'));
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0][1]).toBe('Reklam izleyip seçimini geri almak ister misin?');
    expect(props.onUndo).not.toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    buttons.find(b => b.text === 'İptal')?.onPress?.();
    expect(props.onUndo).not.toHaveBeenCalled();
    buttons.find(b => b.text === 'İzle')?.onPress?.();
    expect(props.onUndo).toHaveBeenCalledTimes(1);
  });

  it('Devam kilitliyken Geri Al ve kriz düğmesi basılamaz', () => {
    const { getByLabelText, props } = renderOverlay({ buttonEnabled: false });
    expect(getByLabelText('Reklam izle: Seçimi geri al')).toBeDisabled();
    expect(getByLabelText('Kriz toparlanma reklamını izle')).toBeDisabled();
    expect(props.onUndo).not.toHaveBeenCalled();
    expect(props.onRecoverWithAd).not.toHaveBeenCalled();
  });

  it('sonuç metni tamamlanana kadar basılamaz', () => {
    mockTextDone = false;
    const { getByLabelText, props } = renderOverlay();
    expect(getByLabelText('Reklam izle: Seçimi geri al')).toBeDisabled();
    expect(getByLabelText('Kriz toparlanma reklamını izle')).toBeDisabled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(props.onRecoverWithAd).not.toHaveBeenCalled();
  });

  it('kilit açıkken kriz düğmesi çalışır', () => {
    const { getByText, getByLabelText, props } = renderOverlay();
    expect(getByLabelText('Kriz toparlanma reklamını izle')).toBeEnabled();
    fireEvent.press(getByText(/Reklam İzle: Kaybın/));
    expect(props.onRecoverWithAd).toHaveBeenCalledTimes(1);
  });
});
