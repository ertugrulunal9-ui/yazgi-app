import React from 'react';
import { render } from '@testing-library/react-native';
import { TraitProgressPanel } from '../../src/components/TraitProgressPanel';

const theme = {
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  surfaceOverlay: '#1e293b',
  border: '#334155',
  surfaceBase: '#0f172a',
  accentEvent: '#22c55e',
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

describe('TraitProgressPanel', () => {
  it('renders empty state when there is no trait progress', () => {
    const { getByText } = render(
      <TraitProgressPanel traitProgress={{}} theme={theme} />
    );

    expect(getByText('Henüz takip edilen bir özellik formasyonu yok.')).toBeTruthy();
  });

  it('renders progress values and status labels', () => {
    const { getByText } = render(
      <TraitProgressPanel
        theme={theme}
        traitProgress={{
          DISCIPLINED: {
            points: 4,
            required: 5,
            isLocked: false,
            firstTriggeredAge: 9,
          },
          LAZY: {
            points: 2,
            required: 4,
            isLocked: true,
            firstTriggeredAge: 8,
          },
        }}
      />
    );

    expect(getByText('4/5')).toBeTruthy();
    expect(getByText('2/4')).toBeTruthy();
    expect(getByText('Tamamlanmaya yakin')).toBeTruthy();
    expect(getByText('Kilitli')).toBeTruthy();
  });

  it('applies different bar colors for positive and negative traits', () => {
    const { getByTestId } = render(
      <TraitProgressPanel
        theme={theme}
        traitProgress={{
          DISCIPLINED: {
            points: 3,
            required: 5,
            isLocked: false,
            firstTriggeredAge: 9,
          },
          LAZY: {
            points: 3,
            required: 5,
            isLocked: false,
            firstTriggeredAge: 8,
          },
        }}
      />
    );

    const positiveFill = flattenStyle(getByTestId('trait-progress-fill-DISCIPLINED').props.style);
    const negativeFill = flattenStyle(getByTestId('trait-progress-fill-LAZY').props.style);

    expect(positiveFill.backgroundColor).toBeTruthy();
    expect(negativeFill.backgroundColor).toBeTruthy();
    expect(positiveFill.backgroundColor).not.toBe(negativeFill.backgroundColor);
  });
});
