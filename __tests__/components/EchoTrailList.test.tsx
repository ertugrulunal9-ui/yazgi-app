import React from 'react';
import { render } from '@testing-library/react-native';
import { EchoTrailList } from '../../src/components/EchoTrailList';
import { setRuntimeLocale } from '../../src/i18n/strings';

const theme = {
  textPrimary: '#f9fafb',
  textSecondary: '#94a3b8',
  surfaceBase: '#111827',
  border: '#334155',
};

const ECHO = {
  sourceEventId: 'tr_oyuncak_paylasim',
  sourceChoiceId: 'oyuncak_paylas',
  sourceAge: 3,
  eventId: 'early_toy_share_cooperation_echo',
  age: 9,
};

describe('EchoTrailList', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('lists each echo as choice → what came back, with the ages', () => {
    const { getByText } = render(<EchoTrailList echoLog={[ECHO]} pendingCount={2} theme={theme} />);

    expect(getByText('3 yaşında → 9 yaşında')).toBeTruthy();
    expect(getByText('“Paylaş”')).toBeTruthy();
    expect(getByText('Sınıf projesinde tek bir malzeme kutusunu paylaşmanız gerekiyor.')).toBeTruthy();
    expect(getByText('Henüz geri dönmemiş 2 seçimin var.')).toBeTruthy();
  });

  it('explains the trail before anything has come back and hides the pending line at zero', () => {
    const { getByText, queryByText } = render(<EchoTrailList echoLog={[]} pendingCount={0} theme={theme} />);

    expect(getByText('Seçimlerin ileride geri dönecek. Döndüklerinde burada görünecekler.')).toBeTruthy();
    expect(queryByText(/Henüz geri dönmemiş/)).toBeNull();
  });
});
