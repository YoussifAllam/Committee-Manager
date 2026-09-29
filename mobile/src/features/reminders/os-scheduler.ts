import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import {
  notificationPrefix,
  snoozeIdentifier,
  type PlannedNotification,
  type PlannedTrigger,
} from '@/features/reminders/recurrence';
import type { Reminder } from '@/features/reminders/types';
import { formatMinutes } from '@/utils/date';

/**
 * Local notifications through the OS scheduler (AlarmManager on Android, UNUserNotificationCenter on iOS).
 * The OS shows them at their time even when the app is closed, the phone is offline or asleep, and
 * expo-notifications re-registers them after a reboot or an app update. No JS timer is involved.
 * The web preview has no scheduler (scheduler.web.ts).
 */

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';
export type Permission = { status: PermissionStatus; canAskAgain: boolean };

export type ReminderNotificationEvent = {
  /** Same for repeated deliveries of one response, so it can be handled once. */
  key: string;
  action: 'received' | 'open' | 'done' | 'snooze';
  reminderId: string;
  /** The occurrence this alert belongs to; null for native repeating alerts, which carry no date. */
  occurrence: Date | null;
  /** When the OS delivered it. */
  deliveredAt: Date;
  notificationId: string;
};

const CHANNEL_ID = 'reminders';
const ACTION_DONE = 'reminder-done';
const ACTION_SNOOZE = 'reminder-snooze';

// Reminders show as banners with sound even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channel: Promise<unknown> | undefined;

/** Android needs the channel before it can show the permission dialog (13+) or any notification. */
function ensureChannel() {
  if (Platform.OS !== 'android') return Promise.resolve();
  channel ??= Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'تذكيرات فكّرني',
    description: 'تذكيراتك الشخصية في موعدها.',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: Colors.primary,
  }).catch((error) => {
    channel = undefined;
    throw error;
  });
  return channel;
}

const categories = new Map<number, Promise<string>>();

/** "تم" and "ذكّرني بعد …" buttons. The snooze label depends on the reminder, so there's one category per duration. */
function ensureCategory(snoozeMinutes: number) {
  let category = categories.get(snoozeMinutes);
  if (!category) {
    const identifier = `reminder-actions-${snoozeMinutes}`;
    // Handled without opening the app: by the background task on Android, by the OS waking the app on iOS.
    category = Notifications.setNotificationCategoryAsync(identifier, [
      { identifier: ACTION_DONE, buttonTitle: 'تم', options: { opensAppToForeground: false } },
      {
        identifier: ACTION_SNOOZE,
        buttonTitle: `ذكّرني بعد ${formatMinutes(snoozeMinutes)}`,
        options: { opensAppToForeground: false },
      },
    ]).then(() => identifier);
    categories.set(snoozeMinutes, category);
  }
  return category;
}

function toPermission(response: Notifications.NotificationPermissionsStatus): Permission {
  const granted = response.granted || response.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  const status = granted ? 'granted' : response.status === 'denied' ? 'denied' : 'undetermined';
  return { status, canAskAgain: response.canAskAgain };
}

export async function getPermission() {
  return toPermission(await Notifications.getPermissionsAsync());
}

/** Shows the OS permission dialog (only when the OS still allows asking). */
export async function requestPermission() {
  await ensureChannel();
  return toPermission(
    await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } }),
  );
}

function toTrigger(trigger: PlannedTrigger): Notifications.NotificationTriggerInput {
  switch (trigger.type) {
    case 'daily':
      return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: trigger.hour, minute: trigger.minute, channelId: CHANNEL_ID };
    case 'weekly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        // expo-notifications counts weekdays from 1 = Sunday.
        weekday: trigger.weekday + 1,
        hour: trigger.hour,
        minute: trigger.minute,
        channelId: CHANNEL_ID,
      };
    case 'date':
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger.date, channelId: CHANNEL_ID };
  }
}

/** Title "تذكير: …", the member's message, and the ids needed to act on it and open the reminder. */
async function contentFor(reminder: Reminder, occurrence?: Date): Promise<Notifications.NotificationContentInput> {
  return {
    title: `تذكير: ${reminder.title}`,
    body: reminder.message || 'حان موعد تذكيرك.',
    data: { reminderId: reminder.id, occurrenceAt: occurrence?.toISOString() ?? null, url: `/reminders/${reminder.id}` },
    categoryIdentifier: await ensureCategory(reminder.snoozeMinutes),
    sound: 'default',
    priority: Notifications.AndroidNotificationPriority.HIGH,
  };
}

export async function getScheduledIds() {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  return requests.map((request) => request.identifier);
}

type ReplaceOptions = {
  /** Reschedule every alert, e.g. after an edit changed the text or the timezone moved. */
  force?: boolean;
  /** Cancel a pending "ذكّرني لاحقًا" alert too. */
  includeSnooze?: boolean;
  /** Identifiers already fetched with getScheduledIds, to save a round trip per reminder. */
  scheduled?: string[];
};

/**
 * Makes the OS schedule for a reminder match `plan`: cancels alerts that are no longer planned and
 * schedules the missing ones, including any cancelled outside the app. Returns the planned identifiers.
 */
export async function replaceSchedule(
  reminder: Reminder,
  plan: PlannedNotification[],
  { force = false, includeSnooze = false, scheduled }: ReplaceOptions = {},
) {
  await ensureChannel();
  const prefix = notificationPrefix(reminder.id);
  const ownedBy = (id: string) => id.startsWith(prefix) && (includeSnooze || id !== snoozeIdentifier(reminder.id));
  const pending = new Set((scheduled ?? (await getScheduledIds())).filter(ownedBy));
  const planned = new Set(plan.map((item) => item.identifier));

  for (const id of new Set([...pending, ...reminder.notificationIds.filter(ownedBy)])) {
    if (force || !planned.has(id)) await Notifications.cancelScheduledNotificationAsync(id);
  }
  for (const item of plan) {
    if (!force && pending.has(item.identifier)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: item.identifier,
      content: await contentFor(reminder, item.occurrence),
      trigger: toTrigger(item.trigger),
    });
  }
  return [...planned];
}

/** One extra alert after the snooze delay. Its fixed identifier replaces any earlier snooze instead of adding one. */
export async function scheduleSnooze(reminder: Reminder, at: Date, occurrence: Date) {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: snoozeIdentifier(reminder.id),
    content: await contentFor(reminder, occurrence),
    trigger: toTrigger({ type: 'date', date: at }),
  });
}

export async function cancelSnooze(reminderId: string) {
  await Notifications.cancelScheduledNotificationAsync(snoozeIdentifier(reminderId));
}

/** Cancels everything scheduled for the reminder, including a snooze, and clears its alerts from the tray. */
export async function cancelAll(reminderId: string) {
  const prefix = notificationPrefix(reminderId);
  for (const id of await getScheduledIds()) {
    if (id.startsWith(prefix)) await Notifications.cancelScheduledNotificationAsync(id);
  }
  for (const notification of await Notifications.getPresentedNotificationsAsync()) {
    if (notification.request.identifier.startsWith(prefix)) {
      await Notifications.dismissNotificationAsync(notification.request.identifier);
    }
  }
}

/** Ids of reminders that have a delivered alert still sitting in the notification tray. */
export async function getPresentedReminderIds() {
  const presented = await Notifications.getPresentedNotificationsAsync();
  return new Set(
    presented
      .map((notification) => readData(notification.request.content)?.reminderId)
      .filter((id): id is string => !!id),
  );
}

export async function dismiss(notificationId: string) {
  await Notifications.dismissNotificationAsync(notificationId);
}

type ReminderData = { reminderId: string; occurrenceAt: string | null };

// A notification that went through the background task may carry its data as a JSON string.
function readData(content: object): ReminderData | null {
  const raw = 'data' in content && content.data ? content.data : 'dataString' in content ? content.dataString : null;
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return data && typeof data.reminderId === 'string' ? data : null;
  } catch {
    return null;
  }
}

function toEvent(notification: Notifications.Notification, action: ReminderNotificationEvent['action']) {
  const data = readData(notification.request.content);
  if (!data) return null;
  return {
    key: `${notification.request.identifier}@${notification.date}:${action}`,
    action,
    reminderId: data.reminderId,
    occurrence: data.occurrenceAt ? new Date(data.occurrenceAt) : null,
    deliveredAt: new Date(notification.date),
    notificationId: notification.request.identifier,
  } satisfies ReminderNotificationEvent;
}

export function responseToEvent(response: Notifications.NotificationResponse) {
  const action =
    response.actionIdentifier === ACTION_DONE ? 'done' : response.actionIdentifier === ACTION_SNOOZE ? 'snooze' : 'open';
  return toEvent(response.notification, action);
}

/** Alerts arriving while the app is open, and taps or button presses on any alert. */
export function subscribe(onEvent: (event: ReminderNotificationEvent) => void) {
  const received = Notifications.addNotificationReceivedListener((notification) => {
    const event = toEvent(notification, 'received');
    if (event) onEvent(event);
  });
  const responded = Notifications.addNotificationResponseReceivedListener((response) => {
    const event = responseToEvent(response);
    if (event) onEvent(event);
  });
  return () => {
    received.remove();
    responded.remove();
  };
}

/** The tap that launched the app from a closed state, handed out once. */
export function takeLaunchEvent() {
  const response = Notifications.getLastNotificationResponse();
  if (!response) return null;
  Notifications.clearLastNotificationResponse();
  return responseToEvent(response);
}
