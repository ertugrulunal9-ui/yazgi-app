import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import { ActionButton } from '../../src/components/ActionButton';

jest.mock('../../src/animations/ButtonAnimations', () => {
  const ReactLib = require('react');
  const { Pressable: PressableNative } = require('react-native');
  return {
    AnimatedButton: ({ children, onPress, disabled, style }: any) =>
      ReactLib.createElement(
        PressableNative,
        { onPress: disabled ? undefined : onPress, disabled, style },
        children
      ),
  };
});

const theme = {
  surfaceOverlay: '#1f2937',
  surfaceBase: '#111827',
  border: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
};

const metrics = {
  pad: 12,
  font: 16,
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

describe('ActionButton', () => {
  it('renders title and subtitle text', () => {
    const { getByText } = render(
      <ActionButton
        title="Ders Calis"
        subtitle="Zeka +10"
        onPress={jest.fn()}
        theme={theme as any}
        metrics={metrics as any}
      />
    );

    expect(getByText('Ders Calis')).toBeTruthy();
    expect(getByText('Zeka +10')).toBeTruthy();
  });

  it('calls onPress when enabled', () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <ActionButton
        title="Sosyalles"
        onPress={onPress}
        theme={theme as any}
        metrics={metrics as any}
      />
    );

    fireEvent.press(UNSAFE_getByType(Pressable as any));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks button as disabled and applies disabled opacity', () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <ActionButton
        title="Calis"
        onPress={onPress}
        disabled
        theme={theme as any}
        metrics={metrics as any}
      />
    );

    const pressable = UNSAFE_getByType(Pressable as any);
    expect(pressable.props.disabled).toBe(true);
    expect(flattenStyle(pressable.props.style).opacity).toBe(0.6);
  });

  it('hides subtitle block when subtitle is not provided', () => {
    const { queryByText } = render(
      <ActionButton
        title="Calis"
        onPress={jest.fn()}
        theme={theme as any}
        metrics={metrics as any}
      />
    );

    expect(queryByText('Zeka +10')).toBeNull();
  });
});
