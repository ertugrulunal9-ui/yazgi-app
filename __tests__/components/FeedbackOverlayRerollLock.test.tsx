// @ts-nocheck
// Sonuç metni değişince (ör. Kaderi Yeniden Çevir) reklam düğmeleri yeni metin yazılana kadar kilitli kalır.
// Gerçek TypewriterText ile: metin değiştiği render'da eski sayaç yeni metni "bitmiş" saymamalı.
import React from 'react';
import { act, render } from '@testing-library/react-native';

jest.mock('../../src/animations', () => ({
  FadeInUpView: ({ children }) => children,
}));
jest.mock('../../src/animations/ButtonAnimations', () => {
  const { Pressable } = require('react-native');
  return {
    AnimatedButton: ({ children, onPress, disabled, style, ...rest }) => (
      <Pressable onPress={disabled ? undefined : onPress} disabled={disabled} accessibilityState={{ disabled: !!disabled }} style={style} {...rest}>
        {children}
      </Pressable>
    ),
  };
});
jest.mock('../../src/context/UIContext', () => ({
  useUI: () => ({ uiPrefs: { reduceMotion: false }, t: (k, p, f) => f ?? k }),
}));
jest.mock('../../src/components/ui', () => {
  const { View } = require('react-native');
  const actual = jest.requireActual('../../src/components/ui/TypewriterText');
  return {
    Card: ({ children }) => <View>{children}</View>,
    StatChange: () => null,
    TypewriterText: actual.TypewriterText,
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

const { FeedbackOverlay } = require('../../src/components/FeedbackOverlay');
const { t: translate } = require('../../src/i18n/strings');

const theme = { appBg: '#000', surfaceBase: '#111', surfaceRaised: '#222', border: '#333', textPrimary: '#fff', textSecondary: '#aaa', accentBrand: '#0af', accentStat: '#fa0', accentSkill: '#0f0' };
const stats = { health: 80, energy: 75, intelligence: 70, charisma: 55, discipline: 65, money: 450, familyRelation: 40 };
const t = (key, params, fallback) => translate('tr', key, params, fallback);
const UNDO = 'Reklam izle: Seçimi geri al';
const CRISIS = 'Kriz toparlanma reklamını izle';

const baseProps = (feedback) => ({
  theme, metrics: { pad: 12, font: 16 }, insets: { top: 0, bottom: 0 }, t,
  lastResult: { feedback, changes: { health: -6 } },
  currentEvent: null, selectedChoice: null, stats, personality: {}, skills: {},
  fate: undefined, canReroll: true, buttonEnabled: true, hasCrisisRecoveryOption: true,
  crisisRecoveryLoading: false, undoLoading: false, canUndo: true,
  onUndo: jest.fn(), onContinue: jest.fn(), onRecoverWithAd: jest.fn(), onReroll: jest.fn(),
});

const typeAll = (n) => {
  for (let i = 0; i < n + 5; i += 1) {
    act(() => { jest.advanceTimersByTime(26); });
  }
};

describe('FeedbackOverlay: sonuç metni değişince reklam düğmesi kilidi', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('yeni metin eskisinden kısa olsa da yeni metin yazılana kadar Geri Al ve kriz düğmesi kilitli kalır', () => {
    const A = 'Uzun bir sonuç metni burada yazılıyor ve devam ediyor.';
    const B = 'Kısa sonuç.';
    const view = render(<FeedbackOverlay {...baseProps(A)} />);
    expect(view.getByLabelText(UNDO)).toBeDisabled();
    typeAll(A.length);
    expect(view.getByLabelText(UNDO)).toBeEnabled();

    view.rerender(<FeedbackOverlay {...baseProps(B)} />);
    act(() => {});
    expect(view.getByLabelText(UNDO)).toBeDisabled();
    expect(view.getByLabelText(CRISIS)).toBeDisabled();

    typeAll(B.length);
    expect(view.getByLabelText(UNDO)).toBeEnabled();
    expect(view.getByLabelText(CRISIS)).toBeEnabled();
  });

  it('metne cümle eklenince kilit yeniden kapanır ve yazım bitince açılır', () => {
    const A = 'Kriz anı yaşadın.';
    const A2 = `${A} Krizin etkilerinin bir kısmını toparladın.`;
    const view = render(<FeedbackOverlay {...baseProps(A)} />);
    typeAll(A.length);
    expect(view.getByLabelText(UNDO)).toBeEnabled();
    view.rerender(<FeedbackOverlay {...{ ...baseProps(A2), hasCrisisRecoveryOption: false }} />);
    act(() => {});
    expect(view.getByLabelText(UNDO)).toBeDisabled();
    typeAll(A2.length);
    expect(view.getByLabelText(UNDO)).toBeEnabled();
  });
});
