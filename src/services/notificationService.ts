import AsyncStorage from '@react-native-async-storage/async-storage';
import { devLog } from '../utils/devLogger';

// React Native de `window` ve `navigator` tanımlar (navigator.product === 'ReactNative');
// yalnızca bu iki kontrol Android'i de web sanıp bildirimleri tamamen kapatıyordu.
const isWeb = typeof window !== 'undefined'
  && typeof navigator !== 'undefined'
  && navigator.product !== 'ReactNative';

type ExpireNotifications = {
  getPermissionsAsync?: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  scheduleNotificationAsync: (request: {
    content: { title: string; body: string; data?: Record<string, unknown> };
    // expo-notifications 0.32: `type` olmayan tetikleyici TypeError fırlatır.
    trigger: { type: 'timeInterval'; seconds: number; repeats?: boolean } | null;
  }) => Promise<string>;
  cancelAllScheduledNotificationsAsync: () => Promise<void>;
  cancelScheduledNotificationAsync: (id: string) => Promise<void>;
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
};

type NotificationsModule = ExpireNotifications;

let _module: NotificationsModule | null = null;
let _loadAttempted = false;

function getModule(): NotificationsModule | null {
  if (isWeb) return null;
  if (_module) return _module;
  if (_loadAttempted) return null;
  _loadAttempted = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as NotificationsModule;
    if (typeof mod?.requestPermissionsAsync !== 'function') return null;
    _module = mod;
    return _module;
  } catch {
    devLog.warn('[NOTIFICATIONS] expo-notifications not available');
    return null;
  }
}

// Notification ID constants for deterministic cancel/replace
const NOTIF_IDS = {
  REENGAGEMENT: 'yazgi_reengagement',
  NPC_REMINDER: 'yazgi_npc_reminder',
  EXAM_SEASON: 'yazgi_exam_season',
} as const;

// Oyuncu oyun sonundaki "Hatırlat" ile hatırlatmaları açtı mı. Android 12 ve altında bildirim
// izni varsayılan "granted" gelir; işletim sistemi izni tek başına oyuncunun seçimi sayılmaz.
const REMINDER_OPT_IN_KEY = '@yazgi/reminders_opt_in/v1';
// Bebeklik bölüm penceresindeki tek seferlik hatırlatma teklifi görüldü mü (kurulum başına bir kez).
const REMINDER_OFFER_SHOWN_KEY = '@yazgi/reminder_offer_shown/v1';

let permissionsGranted = false;
let permissionsChecked = false;

function installForegroundHandler(mod: NotificationsModule): void {
  // Set a handler so foreground notifications show as alerts
  try {
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Non-fatal
  }
}

/**
 * Request notification permissions on first call.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function requestPermissions(): Promise<boolean> {
  if (isWeb) return false;
  if (permissionsChecked) return permissionsGranted;

  const mod = getModule();
  if (!mod) return false;

  installForegroundHandler(mod);

  try {
    const { status } = await mod.requestPermissionsAsync();
    permissionsGranted = status === 'granted';
    permissionsChecked = true;
    devLog.log(`[NOTIFICATIONS] Permission: ${status}`);
    if (permissionsGranted) {
      try {
        await AsyncStorage.setItem(REMINDER_OPT_IN_KEY, 'true');
      } catch {
        // Yazılamazsa soğuk açılışta hatırlatma geri kurulmaz; oyuncu yeniden açabilir.
      }
    }
    return permissionsGranted;
  } catch (error) {
    devLog.warn('[NOTIFICATIONS] requestPermissions failed', error);
    permissionsChecked = true;
    return false;
  }
}

/**
 * Soğuk açılışta, oyuncu hatırlatmaları daha önce oyun sonunda açtıysa mevcut
 * izni SORMADAN okur; izin hâlâ verilmişse geri çağırma hatırlatmasını yeniden
 * kurar ve sonraki turlar da hatırlatmaları güncelleyebilir. Oyuncu hiç açmadıysa
 * ya da izin yoksa hiçbir şeyi değiştirmez (oyun sonundaki "Hatırlat" düğmesi
 * yine izin isteyebilir).
 */
export async function restoreNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  if (permissionsGranted) return true;

  let optedIn = false;
  try {
    optedIn = (await AsyncStorage.getItem(REMINDER_OPT_IN_KEY)) === 'true';
  } catch {
    optedIn = false;
  }
  if (!optedIn) return false;

  const mod = getModule();
  if (!mod || typeof mod.getPermissionsAsync !== 'function') return false;

  try {
    const { status } = await mod.getPermissionsAsync();
    if (status !== 'granted') return false;

    installForegroundHandler(mod);
    permissionsGranted = true;
    permissionsChecked = true;
    await scheduleReengagement(24);
    return true;
  } catch (error) {
    devLog.warn('[NOTIFICATIONS] restoreNotificationPermission failed', error);
    return false;
  }
}

/**
 * Erken hatırlatma teklifi gösterilebilir mi: oyuncu hatırlatmaları henüz açmadı ve teklifi
 * daha önce görmedi. Depo okunamazsa teklif gösterilmez (oyuncuyu tekrar tekrar rahatsız etmesin).
 */
export async function isReminderOfferEligible(): Promise<boolean> {
  try {
    const [optedIn, offerShown] = await Promise.all([
      AsyncStorage.getItem(REMINDER_OPT_IN_KEY),
      AsyncStorage.getItem(REMINDER_OFFER_SHOWN_KEY),
    ]);
    return optedIn !== 'true' && offerShown !== 'true';
  } catch {
    return false;
  }
}

/** Teklif oyuncuya gösterildi; bir daha çıkmaz (oyun sonundaki "Hatırlat" düğmesi kalır). */
export async function markReminderOfferShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDER_OFFER_SHOWN_KEY, 'true');
  } catch {
    // Yazılamazsa teklif sonraki koşunun Bebeklik penceresinde yeniden çıkabilir.
  }
}

/**
 * Cancel all previously scheduled Yazgi notifications.
 */
export async function cancelAll(): Promise<void> {
  const mod = getModule();
  if (!mod) return;

  try {
    await mod.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    devLog.warn('[NOTIFICATIONS] cancelAll failed', error);
  }
}

async function scheduleOne(
  id: string,
  title: string,
  body: string,
  delaySeconds: number,
  data?: Record<string, unknown>,
): Promise<void> {
  const mod = getModule();
  if (!mod || !permissionsGranted) return;

  try {
    // Cancel existing notification with same logical ID via data tag
    // expo-notifications doesn't support named IDs natively — we cancel all and re-schedule
    await mod.scheduleNotificationAsync({
      content: { title, body, data: { notifId: id, ...data } },
      trigger: { type: 'timeInterval', seconds: Math.max(1, Math.round(delaySeconds)) },
    });
    devLog.log(`[NOTIFICATIONS] Scheduled "${id}" in ${Math.round(delaySeconds / 3600)}h`);
  } catch (error) {
    devLog.warn(`[NOTIFICATIONS] Failed to schedule "${id}"`, error);
  }
}

/**
 * Schedule a re-engagement notification.
 * Fires after `hours` of inactivity (default 24h).
 * Call this after every turn to keep resetting the countdown.
 */
export async function scheduleReengagement(hours = 24): Promise<void> {
  const mod = getModule();
  if (!mod || !permissionsGranted) return;

  // Cancel all first so we don't stack duplicates
  await cancelAll();

  await scheduleOne(
    NOTIF_IDS.REENGAGEMENT,
    'Yazgı',
    'Hayatın seni bekliyor... 🌟',
    hours * 3600,
    { type: 'reengagement' },
  );
}

/**
 * Schedule an NPC-based reminder if the player has an active relationship.
 * Fires after `hours` (default 48h), stacked on top of the reengagement notification.
 */
export async function scheduleNPCReminder(npcName: string, hours = 48): Promise<void> {
  await scheduleOne(
    NOTIF_IDS.NPC_REMINDER,
    npcName,
    `${npcName} seni merak ediyor...`,
    hours * 3600,
    { type: 'npc_reminder', npcName },
  );
}

/**
 * Schedule an exam-season reminder.
 * Call when a scheduled exam event is approaching.
 */
export async function scheduleExamSeason(hours = 36): Promise<void> {
  await scheduleOne(
    NOTIF_IDS.EXAM_SEASON,
    'Yazgı',
    'Sınav dönemi yaklaşıyor! 📚',
    hours * 3600,
    { type: 'exam_season' },
  );
}
