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
  });

  afterEach(() => {
    restoreGlobals();
  });

  it('reads an earlier grant without prompting and reschedules the reminder', async () => {
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
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('survives a failing permission read', async () => {
    mockGetPermissionsAsync.mockRejectedValue(new Error('native module missing'));
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('treats React Native (which defines window and navigator) as native, not web', async () => {
    setBrowserLikeGlobals('ReactNative');
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(true);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('is a safe no-op on web', async () => {
    setBrowserLikeGlobals('Gecko');
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const service = loadFreshService();

    await expect(service.restoreNotificationPermission()).resolves.toBe(false);
    await expect(service.requestPermissions()).resolves.toBe(false);
    expect(mockGetPermissionsAsync).not.toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
