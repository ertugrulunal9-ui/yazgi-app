import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '../../src/components/ui/LocaleText';
import { toUpperLocale } from '../../src/utils/localeText';
import { setRuntimeLocale } from '../../src/i18n/strings';

describe('toUpperLocale', () => {
  it('uses dotted capital İ for Turkish', () => {
    expect(toUpperLocale('gelişim', 'tr')).toBe('GELİŞİM');
    expect(toUpperLocale('geçmişten bir yankı', 'tr')).toBe('GEÇMİŞTEN BİR YANKI');
  });

  it('keeps plain uppercase for English', () => {
    expect(toUpperLocale('growth', 'en')).toBe('GROWTH');
  });
});

describe('LocaleText', () => {
  afterEach(() => setRuntimeLocale('tr'));

  it('uppercases the text itself in Turkish when the style asks for uppercase', () => {
    setRuntimeLocale('tr');
    const { getByText, UNSAFE_root } = render(
      <Text style={{ textTransform: 'uppercase', fontSize: 11 }}>Özellikler</Text>,
    );

    expect(getByText('ÖZELLİKLER')).toBeTruthy();
    const host = UNSAFE_root.findAll((node: { type: unknown }) => node.type === 'Text')[0];
    // Cihaz/sayfa diline bağlı ikinci bir dönüşüm olmasın diye CSS/Android dönüşümü kapatılır
    expect(host.props.style).toEqual([{ textTransform: 'uppercase', fontSize: 11 }, { textTransform: 'none' }]);
  });

  it('passes text through untouched when there is no uppercase style', () => {
    const { getByText } = render(<Text style={{ fontSize: 11 }}>Özellikler</Text>);

    expect(getByText('Özellikler')).toBeTruthy();
  });
});
