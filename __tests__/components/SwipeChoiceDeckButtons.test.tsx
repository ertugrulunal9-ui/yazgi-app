import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SwipeChoiceDeck } from '../../src/components/SwipeChoiceDeck';
import { setRuntimeLocale } from '../../src/i18n/strings';
import type { Choice } from '../../src/types';

jest.mock('react-native', () => ({
  ...jest.requireActual('../mocks/ReactNative.mock'),
  Dimensions: { get: () => ({ width: 400, height: 800 }) },
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: { View } };
});

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'View',
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: { Pan: () => ({}) },
}));

jest.mock('../../src/animations', () => ({
  StaggeredFadeIn: ({ children }: { children: React.ReactNode }) => children,
  selectionHaptic: jest.fn(),
}));

jest.mock('../../src/animations/ButtonAnimations', () => {
  const ReactLib = require('react');
  return {
    AnimatedButton: ({ children, onPress, accessibilityLabel }: {
      children: React.ReactNode;
      onPress: () => void;
      accessibilityLabel: string;
    }) => ReactLib.createElement('Pressable', { onPress, accessibilityLabel }, children),
  };
});

jest.mock('../../src/context/UIContext', () => ({
  useUI: () => ({
    theme: {
      surfaceBase: '#111827',
      surfaceRaised: '#1f2937',
      border: '#334155',
      textPrimary: '#f9fafb',
      textSecondary: '#94a3b8',
      accentEvent: '#22c55e',
    },
    metrics: { pad: 12, font: 15 },
  }),
}));

const safe: Choice = { id: 'safe', text: 'Annene sarıl', effect: { familyRelation: 5, health: 2 }, feedback: '', choiceType: 'PASSIVE' } as Choice;
const risky: Choice = {
  id: 'risky',
  text: 'Merdivenleri tek başına çık',
  effect: { energy: -5 },
  feedback: '',
  conditionalOutcomes: [{ condition: () => true, weight: 1, statChanges: { health: -3 }, feedback: '' }],
} as unknown as Choice;

const renderDeck = (onChoiceSelected = jest.fn()) => render(
  <SwipeChoiceDeck
    choices={[safe, risky]}
    resolveChoice={choice => choice as Choice}
    onChoiceSelected={onChoiceSelected}
    isBreakdownEvent={false}
    originalChoices={[safe, risky]}
    eventId="test_event"
  />,
);

describe('SwipeChoiceDeck button cards', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('labels each option with a letter, its type and the stats it touches', () => {
    const { getByText, UNSAFE_root } = renderDeck();

    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('Güvenli')).toBeTruthy();
    expect(getByText('Şansa bağlı')).toBeTruthy();
    // Aile + sağlık (A) ve enerji (B): yalnızca ikon, sayı yok
    const statIcons = UNSAFE_root.findAll((node: { type: unknown; props: { name?: string } }) => (
      typeof node.type !== 'string' && ['home', 'heart', 'zap'].includes(node.props.name ?? '')
    ));
    expect(statIcons.map(node => node.props.name).sort()).toEqual(['heart', 'home', 'zap']);
  });

  it('still selects the tapped option with its original index', () => {
    const onChoiceSelected = jest.fn();
    const { getByLabelText } = renderDeck(onChoiceSelected);

    fireEvent.press(getByLabelText('Merdivenleri tek başına çık'));

    expect(onChoiceSelected).toHaveBeenCalledWith(risky, 1);
  });
});
