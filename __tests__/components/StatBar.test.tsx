import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import StatBar from '../../src/components/StatBar';

const theme = {
  textSecondary: '#94a3b8',
  surfaceBase: '#111827',
  border: '#334155',
  accentStat: '#38bdf8',
};

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

describe('StatBar', () => {
  it('renders capped stat values with value/cap text', () => {
    const { getByText } = render(
      <StatBar label="Saglik" value={75} statKey="health" cap={100} theme={theme} />
    );

    expect(getByText(/Saglik/)).toBeTruthy();
    expect(getByText('75/100')).toBeTruthy();
  });

  it('uses percentage width based on cap for regular stats', () => {
    const { UNSAFE_getAllByType } = render(
      <StatBar label="Zeka" value={75} statKey="intelligence" cap={100} theme={theme} />
    );

    const fill = UNSAFE_getAllByType(View as any).find((node) => (
      flattenStyle(node.props.style).width === '75%'
    ));
    expect(fill).toBeTruthy();
  });

  it('uses money-specific scaling and omits /cap text for money', () => {
    const { UNSAFE_getAllByType, queryByText } = render(
      <StatBar label="Para" value={1000} statKey="money" cap={100} theme={theme} />
    );

    const fill = UNSAFE_getAllByType(View as any).find((node) => (
      flattenStyle(node.props.style).width === '50%'
    ));
    expect(fill).toBeTruthy();
    expect(queryByText('/100')).toBeNull();
  });

  it('highlights mastered state and renders class cap indicator when cap < 100', () => {
    const { getByText, UNSAFE_getAllByType } = render(
      <StatBar label="Disiplin" value={100} statKey="discipline" cap={80} theme={theme} />
    );

    const label = getByText(/Disiplin/);
    expect(flattenStyle(label.props.style).color).toBe('#fbbf24');

    const capIndicator = UNSAFE_getAllByType(View as any).find((node) => (
      flattenStyle(node.props.style).left === '80%'
    ));
    expect(capIndicator).toBeTruthy();
  });
});
