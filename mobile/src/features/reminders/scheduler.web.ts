import type { PlannedNotification } from '@/features/reminders/recurrence';
import type { Permission, ReminderNotificationEvent } from '@/features/reminders/scheduler';
import type { Reminder } from '@/features/reminders/types';

/**
 * Web preview only. A browser can't schedule an alert that fires after the tab is closed, so this
 * scheduler reports itself unsupported and schedules nothing; the screens say so in development.
 * The API matches scheduler.ts so the native module can be swapped in unchanged.
 */

export type { Permission, PermissionStatus, ReminderNotificationEvent } from '@/features/reminders/scheduler';

const unsupported: Permission = { status: 'unsupported', canAskAgain: false };

export async function getPermission() {
  return unsupported;
}

export async function requestPermission() {
  return unsupported;
}

export async function getScheduledIds(): Promise<string[]> {
  return [];
}

export async function replaceSchedule(
  _reminder: Reminder,
  _plan: PlannedNotification[],
  _options?: { force?: boolean; includeSnooze?: boolean; scheduled?: string[] },
): Promise<string[]> {
  return [];
}

export async function scheduleSnooze(_reminder: Reminder, _at: Date, _occurrence: Date) {}

export async function cancelSnooze(_reminderId: string) {}

export async function cancelAll(_reminderId: string) {}

export async function getPresentedReminderIds() {
  return new Set<string>();
}

export async function dismiss(_notificationId: string) {}

export function responseToEvent(_response: unknown): ReminderNotificationEvent | null {
  return null;
}

export function subscribe(_onEvent: (event: ReminderNotificationEvent) => void) {
  return () => {};
}

export function takeLaunchEvent(): ReminderNotificationEvent | null {
  return null;
}
