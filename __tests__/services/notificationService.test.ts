type NotificationServiceModule = typeof import('../../src/services/notificationService');

const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockCancelAllScheduledNotificationsAsync = jest.fn();
const mockSetNotificationHandler = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  cancelAllScheduledNotificationsAsync: (...args: unknown[]) =>
    mockCancelAllScheduledNotificationsAsync(...args),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: (...args: unknown[]) => mockSetNotificationHandler(...args),
}));

// Soğuk açılışlar arasında kalıcı depo (isolateModules modül kayıtlarını sıfırlar, bu Map kalır).
const mockStorage = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: (key: string) => Promise.resolve(mockStorage.get(key) ?? null),
    setItem: (key: string, value: string) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    },
  },
}));

const REMINDER_OPT_IN_KEY = '@yazgi/reminders_opt_in/v1';
const markReminderOptIn = () => mockStorage.set(REMINDER_OPT_IN_KEY, 'true');

// Servis izin durumunu modül düzeyinde tutar; her test soğuk açılış gibi taze yükler.
const loadFreshService = (): NotificationServiceModule => {
  let service!: NotificationServiceModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    service = require('../../src/services/notificationService');
  });
  return service;
};

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

const setBrowserLikeGlobals = (product: string) => {
  (globalThis as { window?: unknown }).window = globalThis;
  Object.defineProperty(globalThis, 'navigator', {
    value: { product },
    configurable: true,
    writable: true,
  });
};

const restoreGlobals = () => {
  delete (globalThis as { window?: unknown }).window;
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator);
  } else {
    delete (globalThis as { navigator?: unknown }).navigator;
  }
};

describe('notificationService cold start', () => {
  beforeEach(() => {
    mockGetPermissionsAsync.mockReset();
    mockRequestPermissionsAsync.mockReset();
    mockScheduleNotificationAsync.mockReset().mockResolvedValue('id');
    mockCancelAllScheduledNotificationsAsync.mockReset().mockResolvedValue(undefined);
    mockSetNotificationHandler.mockReset();
    mockStorage.clear();
  });

  afterEach(() => {
    restoreGlobals();
  });

  it('does not schedule anything on a fresh install even if the OS reports granted (Android 12 and earlier)', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    await service.scheduleReengagement(24);

    expect(mockGetPermissionsAsync).not.toHaveBeenCalled();
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('remembers the game-end opt-in and restores reminders on the next cold start', async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const firstRun = loadFreshService();
    await expect(firstRun.requestPermissions()).resolves.toBe(true);
    expect(mockStorage.get(REMINDER_OPT_IN_KEY)).toBe('true');

    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const nextRun = loadFreshService();
    await expect(nextRun.restoreNotificationPermission()).resolves.toBe(true);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('does not record an opt-in when the player denies the prompt', async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const service = loadFreshService();

    await expect(service.requestPermissions()).resolves.toBe(false);
    expect(mockStorage.has(REMINDER_OPT_IN_KEY)).toBe(false);
  });

  it('reads an earlier grant without prompting and reschedules the reminder', async () => {
    markReminderOptIn();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(true);

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockScheduleNotificationAsync.mock.calls[0][0]).toMatchObject({
      content: { data: { notifId: 'yazgi_reengagement' } },
      trigger: { type: 'timeInterval', seconds: 24 * 3600 },
    });

    // Sonraki turlar da artık hatırlatma kurabilir (önceden soğuk açılıştan sonra sessizce atlanıyordu).
    await service.scheduleNPCReminder('Ayşe', 48);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(2);
    expect(mockScheduleNotificationAsync.mock.calls[1][0].trigger).toEqual({
      type: 'timeInterval',
      seconds: 48 * 3600,
    });
  });

  it('does nothing when permission was not granted, and the game-end prompt still works', async () => {
    markReminderOptIn();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    await service.scheduleReengagement(24);

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();

    // İzin durumu "kontrol edildi" sayılmadığı için oyun sonundaki düğme yine sorabilir.
    await expect(service.requestPermissions()).resolves.toBe(true);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('does nothing when permission was denied', async () => {
    markReminderOptIn();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('survives a failing permission read', async () => {
    markReminderOptIn();
    mockGetPermissionsAsync.mockRejectedValue(new Error('native module missing'));
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('treats React Native (which defines window and navigator) as native, not web', async () => {
    markReminderOptIn();
    setBrowserLikeGlobals('ReactNative');
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(true);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('is a safe no-op on web', async () => {
    markReminderOptIn();
    setBrowserLikeGlobals('Gecko');
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    await expect(service.requestPermissions()).resolves.toBe(false);
    expect(mockGetPermissionsAsync).not.toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('notificationService early reminder offer', () => {
  beforeEach(() => {
    mockRequestPermissionsAsync.mockReset();
    mockStorage.clear();
  });

  it('offers the reminder once on a fresh install', async () => {
    const service = loadFreshService();
    await expect(service.isReminderOfferEligible()).resolves.toBe(true);

    await service.markReminderOfferShown();

    // Sonraki soğuk açılışta ve koşuda da bir daha çıkmaz
    await expect(loadFreshService().isReminderOfferEligible()).resolves.toBe(false);
  });

  it('does not offer the reminder once the player has opted in (e.g. at game end)', async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();
    await service.requestPermissions();

    await expect(service.isReminderOfferEligible()).resolves.toBe(false);
  });
});

describe('notificationService permission retry', () => {
  beforeEach(() => {
    mockRequestPermissionsAsync.mockReset();
    mockStorage.clear();
  });

  it('asks the OS again at game end after the player denied the Bebeklik offer in the same session', async () => {
    mockRequestPermissionsAsync
      .mockResolvedValueOnce({ status: 'denied' })
      .mockResolvedValueOnce({ status: 'granted' });
    const service = loadFreshService();

    // Bebeklik teklifinde ret; ret önceden oturum boyunca saklanıyor, oyun sonu düğmesi sormadan false alıyordu
    await expect(service.requestPermissions()).resolves.toBe(false);
    await expect(service.requestPermissions()).resolves.toBe(true);

    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(2);
    expect(mockStorage.get(REMINDER_OPT_IN_KEY)).toBe('true');
  });

  it('does not ask again once permission was granted', async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await service.requestPermissions();
    await expect(service.requestPermissions()).resolves.toBe(true);

    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});
