import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { EventNarrative } from '../../src/components/EventNarrative';
import { setRuntimeLocale } from '../../src/i18n/strings';
import type { GameEvent } from '../../src/types';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const chain: any = {};
  chain.duration = () => chain;
  chain.delay = () => chain;
  return { __esModule: true, default: { View }, FadeInDown: chain };
});

jest.mock('../../src/animations', () => ({
  FadeInUpView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../src/components/ui', () => {
  const { Text, View } = require('react-native');
  return {
    Card: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    TypewriterText: ({ text }: { text: string }) => <Text>{text}</Text>,
  };
});

const theme = {
  surfaceBase: '#111827',
  border: '#334155',
  textPrimary: '#f9fafb',
  textSecondary: '#94a3b8',
  accentEvent: '#22c55e',
  fontHeading: 'System',
};

const event: GameEvent = {
  id: 'early_toy_share_cooperation_echo',
  text: 'Sınıf projesinde tek bir malzeme kutusunu paylaşmanız gerekiyor.',
  minAge: 9,
  maxAge: 9,
  rarity: 'UNCOMMON',
  personalityCategory: 'SOCIAL',
  choices: [],
};

const renderNarrative = (props: Partial<React.ComponentProps<typeof EventNarrative>> = {}) => render(
  <EventNarrative
    event={event}
    eventText={String(event.text)}
    theme={theme}
    metrics={{ pad: 12 }}
    isDramaticEvent={false}
    isBreakdownEvent={false}
    breakdownShakeX={new Animated.Value(0)}
    {...props}
  />,
);

describe('EventNarrative echo card', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('shows the age and the original choice when the event is an echo', () => {
    const { getByText } = renderNarrative({ echo: { age: 3, choiceText: 'Paylaş' } });

    expect(getByText('Geçmişten bir yankı')).toBeTruthy();
    expect(getByText('3 yaşında seçtiğin: “Paylaş”')).toBeTruthy();
  });

  it('renders no echo card for ordinary events and hides an empty causal line', () => {
    const { queryByText } = renderNarrative({
      echo: null,
      causalLink: { narrativeLine: '', emotion: 'NEUTRAL' },
    });

    expect(queryByText('Geçmişten bir yankı')).toBeNull();
  });
});
