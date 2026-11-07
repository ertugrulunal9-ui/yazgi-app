import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SaveSlotPicker } from '../../src/components/SaveSlotPicker';
import SaveManager from '../../src/save/SaveManager';
import { setRuntimeLocale } from '../../src/i18n/strings';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

jest.mock('react-native', () => ({
  ...jest.requireActual('../mocks/ReactNative.mock'),
  Platform: { OS: 'ios', select: (o: Record<string, unknown>) => o.ios ?? o.default },
  BackHandler: { addEventListener: jest.fn(() => ({ remove: jest.fn() })) },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/save/SaveManager', () => ({
  __esModule: true,
  default: {
    getAllSlotMetadata: jest.fn(),
    getAvailableSlots: jest.fn(() => 2),
    saveToSlot: jest.fn(async () => true),
    loadFromSlot: jest.fn(async () => null),
    deleteSlot: jest.fn(async () => {}),
  },
}));

const baseMeta = {
  playtime: 10,
  lastPlayed: Date.now(),
  version: 1,
  checksum: 'c',
  isPremium: false,
};

const theme = {
  appBg: '#000', surfaceBase: '#111', surfaceRaised: '#222',
  textPrimary: '#fff', textSecondary: '#aaa', border: '#333', accentEvent: '#0a0',
};

const mockedManager = SaveManager as unknown as {
  getAllSlotMetadata: jest.Mock;
  saveToSlot: jest.Mock;
};

const renderPicker = () => render(
  <SaveSlotPicker
    isOpen
    onClose={jest.fn()}
    currentPlayerName="Yeni"
    currentStats={getInitialStats()}
    currentGameState={getInitialGameState()}
    onLoadSlot={jest.fn()}
    theme={theme}
  />,
);

describe('SaveSlotPicker overwrite confirmation', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    setRuntimeLocale('tr');
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockedManager.getAllSlotMetadata.mockResolvedValue([
      { ...baseMeta, slotId: 'slot_1', characterName: 'Alex', age: 12, status: 'active' },
      { ...baseMeta, slotId: 'slot_2', characterName: '', age: 0, status: 'empty' },
    ]);
  });

  afterEach(() => alertSpy.mockRestore());

  it('asks before overwriting a filled slot and does not save on cancel', async () => {
    const { findByText, getAllByLabelText } = renderPicker();
    await findByText('Alex');

    fireEvent.press(getAllByLabelText('Kaydet')[0]);

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, body, buttons] = alertSpy.mock.calls[0];
    expect(title).toBe('Üzerine yazılsın mı?');
    expect(body).toContain('Alex');
    expect(body).toContain('12');
    expect(mockedManager.saveToSlot).not.toHaveBeenCalled();

    const cancel = buttons.find((b: { style?: string }) => b.style === 'cancel');
    cancel.onPress?.();
    expect(mockedManager.saveToSlot).not.toHaveBeenCalled();
  });

  it('saves after the player confirms the overwrite', async () => {
    const { findByText, getAllByLabelText } = renderPicker();
    await findByText('Alex');

    fireEvent.press(getAllByLabelText('Kaydet')[0]);
    const buttons = alertSpy.mock.calls[0][2];
    const confirm = buttons.find((b: { style?: string }) => b.style === 'destructive');
    confirm.onPress();

    await waitFor(() => expect(mockedManager.saveToSlot).toHaveBeenCalledTimes(1));
    expect(mockedManager.saveToSlot.mock.calls[0][0]).toBe('slot_1');
  });

  describe('on web (Alert.alert is a no-op in react-native-web)', () => {
    const rn = jest.requireMock('react-native') as { Platform: { OS: string } };
    const globals = globalThis as { confirm?: (text?: string) => boolean };
    let originalConfirm: typeof globals.confirm;

    beforeEach(() => {
      rn.Platform.OS = 'web';
      originalConfirm = globals.confirm;
    });

    afterEach(() => {
      rn.Platform.OS = 'ios';
      globals.confirm = originalConfirm;
    });

    it('uses the browser confirmation and saves when the player accepts', async () => {
      globals.confirm = jest.fn(() => true);
      const { findByText, getAllByLabelText } = renderPicker();
      await findByText('Alex');

      fireEvent.press(getAllByLabelText('Kaydet')[0]);

      expect(alertSpy).not.toHaveBeenCalled();
      expect(globals.confirm).toHaveBeenCalledWith(expect.stringContaining('Alex'));
      await waitFor(() => expect(mockedManager.saveToSlot).toHaveBeenCalledTimes(1));
    });

    it('does not save when the player cancels the browser confirmation', async () => {
      globals.confirm = jest.fn(() => false);
      const { findByText, getAllByLabelText } = renderPicker();
      await findByText('Alex');

      fireEvent.press(getAllByLabelText('Kaydet')[0]);

      expect(globals.confirm).toHaveBeenCalledTimes(1);
      expect(mockedManager.saveToSlot).not.toHaveBeenCalled();
    });
  });

  it('saves an empty slot without any confirmation', async () => {
    const { findByLabelText } = renderPicker();
    const empty = await findByLabelText(/slot_2|Boş|boş/i);

    fireEvent.press(empty);

    expect(alertSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(mockedManager.saveToSlot).toHaveBeenCalledTimes(1));
    expect(mockedManager.saveToSlot.mock.calls[0][0]).toBe('slot_2');
  });
});
