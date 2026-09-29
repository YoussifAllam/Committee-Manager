import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import type * as OsScheduler from '@/features/reminders/os-scheduler';

export type { Permission, PermissionStatus, ReminderNotificationEvent } from '@/features/reminders/os-scheduler';

/**
 * Expo Go on Android (SDK 53+) throws as soon as expo-notifications is imported, so there the app
 * uses the no-op scheduler: reminders are saved and listed, and alerts work only in the installed app.
 */
export const expoGoWithoutNotifications = Platform.OS === 'android' && isRunningInExpoGo();

/* eslint-disable @typescript-eslint/no-require-imports */
const scheduler: typeof OsScheduler = expoGoWithoutNotifications
  ? require('@/features/reminders/scheduler.web')
  : require('@/features/reminders/os-scheduler');
/* eslint-enable @typescript-eslint/no-require-imports */

export const {
  getPermission,
  requestPermission,
  getScheduledIds,
  replaceSchedule,
  scheduleSnooze,
  cancelSnooze,
  cancelAll,
  getPresentedReminderIds,
  dismiss,
  responseToEvent,
  subscribe,
  takeLaunchEvent,
} = scheduler;
