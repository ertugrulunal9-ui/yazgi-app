import { devLog } from '../utils/devLogger';

const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

type ExpireNotifications = {
  requestPermissionsAsync: () => Promise<{ status: string }>;
  scheduleNotificationAsync: (request: {
    content: { title: string; body: string; data?: Record<string, unknown> };
    trigger: { seconds: number } | null;
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

let permissionsGranted = false;
let permissionsChecked = false;

/**
 * Request notification permissions on first call.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function requestPermissions(): Promise<boolean> {
  if (isWeb) return false;
  if (permissionsChecked) return permissionsGranted;

  const mod = getModule();
  if (!mod) return false;

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

  try {
    const { status } = await mod.requestPermissionsAsync();
    permissionsGranted = status === 'granted';
    permissionsChecked = true;
    devLog.log(`[NOTIFICATIONS] Permission: ${status}`);
    return permissionsGranted;
  } catch (error) {
    devLog.warn('[NOTIFICATIONS] requestPermissions failed', error);
    permissionsChecked = true;
    return false;
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
      trigger: { seconds: Math.max(1, Math.round(delaySeconds)) },
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
