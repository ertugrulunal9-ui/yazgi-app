import React from 'react';
import { render } from '@testing-library/react-native';
import { EventPlayerBar } from '../../src/components/EventPlayerBar';
import { setRuntimeLocale } from '../../src/i18n/strings';

const theme = {
  appBg: '#0b1220',
  surfaceBase: '#111827',
  border: '#334155',
  textPrimary: '#f9fafb',
  textSecondary: '#94a3b8',
};

describe('EventPlayerBar', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('shows the character face, name, age with school period and mood', () => {
    const { getByText, UNSAFE_root } = render(
      <EventPlayerBar
        avatar={{ hairStyle: 0, skinTone: 1, accessory: 0 }}
        gender="FEMALE"
        mood="STRESSED"
        age={12}
        name="Elif"
        theme={theme}
      />,
    );

    expect(getByText('Elif')).toBeTruthy();
    expect(getByText('12 yaşında · 🎒 Ortaokul')).toBeTruthy();
    expect(getByText('Stresli')).toBeTruthy();
    expect(UNSAFE_root.findAll((node: { type: unknown }) => node.type === 'Svg')).toHaveLength(1);
  });

  it('still shows age and mood for old saves without an avatar or name', () => {
    const { getByText, queryByText, UNSAFE_root } = render(
      <EventPlayerBar mood="HAPPY" age={2} theme={theme} />,
    );

    expect(getByText('2 yaşında · 🍼 Bebeklik')).toBeTruthy();
    expect(getByText('Keyfi yerinde')).toBeTruthy();
    expect(queryByText('Elif')).toBeNull();
    expect(UNSAFE_root.findAll((node: { type: unknown }) => node.type === 'Svg')).toHaveLength(0);
  });
});
