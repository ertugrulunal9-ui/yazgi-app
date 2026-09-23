import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import Dashboard from '../../src/components/Dashboard';

const theme = {
  surfaceBase: '#0f172a',
  surfaceRaised: '#1e293b',
  border: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  accentEvent: '#22c55e',
};

const baseStats = {
  health: 82,
  intelligence: 70,
  charisma: 60,
  discipline: 65,
  money: 250,
  energy: 75,
  familyRelation: 70,
};

const baseGrades = {
  math: 60,
  science: 60,
  language: 60,
  turkish: 60,
  history: 60,
  geography: 60,
  art: 60,
  music: 60,
};

const makeGameState = (overrides: Record<string, unknown> = {}) => ({
  age: 12,
  turn: 3,
  schoolGrades: baseGrades,
  innerThought: '',
  skills: { coding: 0, music: 0 },
  ...overrides,
}) as any;

const flattenStyle = (style: unknown): Record<string, unknown> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, item) => ({ ...acc, ...flattenStyle(item) }),
      {}
    );
  }
  if (typeof style === 'object') {
    return style as Record<string, unknown>;
  }
  return {};
};

describe('Dashboard', () => {
  it('renders custom inner thought and player heading', () => {
    const { getByText } = render(
      <Dashboard
        stats={baseStats as any}
        gameState={makeGameState({ innerThought: 'Custom thought' })}
        playerName="Mina"
        theme={theme}
      />
    );

    expect(getByText(/Mina/)).toBeTruthy();
    expect(getByText(/Custom thought/)).toBeTruthy();
  });

  it('shows critical advice when energy is very low', () => {
    const { getByText } = render(
      <Dashboard
        stats={{ ...baseStats, energy: 10 } as any}
        gameState={makeGameState()}
        playerName="Mina"
        theme={theme}
      />
    );

    expect(getByText(/Enerjin/)).toBeTruthy();
  });

  it('shows family warning when relation is low and no higher-priority warning exists', () => {
    const { getByText } = render(
      <Dashboard
        stats={{ ...baseStats, familyRelation: 20, energy: 65 } as any}
        gameState={makeGameState()}
        playerName="Mina"
        theme={theme}
      />
    );

    expect(getByText(/Ailenle/)).toBeTruthy();
  });

  it('uses happy mood border color for healthy and energetic state', () => {
    const { UNSAFE_getAllByType } = render(
      <Dashboard
        stats={{ ...baseStats, health: 90, energy: 70 } as any}
        gameState={makeGameState()}
        playerName="Mina"
        theme={theme}
      />
    );

    const avatar = UNSAFE_getAllByType(View as any).find((node) => {
      const style = flattenStyle(node.props.style);
      return style.borderWidth === 4 && style.borderRadius === 64;
    });

    expect(avatar).toBeTruthy();
    expect(flattenStyle(avatar?.props.style).borderColor).toBe('#eab308');
  });
});
