import React from 'react';
import { render } from '@testing-library/react-native';
import { RunCard } from '../../src/components/RunCard';
import { setRuntimeLocale } from '../../src/i18n/strings';
import { getThemeTokens } from '../../src/utils/themeUtils';
import { getInitialStats } from '../../src/utils/gameUtils';

jest.mock('react-native-view-shot', () => {
  const ReactLib = require('react');
  return {
    __esModule: true,
    default: ReactLib.forwardRef(({ children }: { children: React.ReactNode }, _ref: unknown) => children),
  };
});

const renderCard = (echoLine?: string) => render(
  <RunCard
    theme={getThemeTokens('dark')}
    endingTier="SUCCESS"
    endingTitle="Tıp Fakültesi"
    summary="Hayatım inişli çıkışlı bir yoldu."
    topMemories={[]}
    finalStats={getInitialStats()}
    echoLine={echoLine}
  />,
);

describe('RunCard', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('puts the most defining echo on the shared card', () => {
    const { getByText } = renderCard('3 yaşındaki “Paylaş” seçimim 9 yaşımda geri döndü.');

    expect(getByText('3 yaşındaki “Paylaş” seçimim 9 yaşımda geri döndü.')).toBeTruthy();
  });

  it('leaves the echo line out when the life had no echoes', () => {
    const { queryByText } = renderCard();

    expect(queryByText(/yaşımda geri döndü/)).toBeNull();
    expect(queryByText('Tıp Fakültesi')).toBeTruthy();
  });
});
