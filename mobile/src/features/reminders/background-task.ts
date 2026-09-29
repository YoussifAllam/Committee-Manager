import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { responseToEvent } from '@/features/reminders/os-scheduler';
import { handleNotificationEvent } from '@/features/reminders/service';

/**
 * Handles the "تم" and "ذكّرني لاحقًا" buttons on Android when the app is in the background or closed:
 * the OS starts the JS bundle headless and runs this task, without opening the app.
 * Defined at module scope and imported from index.ts, before the app renders, as expo-task-manager requires.
 */
const TASK = 'reminder-notification-actions';

TaskManager.defineTask<Notifications.NotificationTaskPayload>(TASK, async ({ data }) => {
  if (!data || !('actionIdentifier' in data)) return;
  const event = responseToEvent(data);
  if (event) await handleNotificationEvent(event);
});

Notifications.registerTaskAsync(TASK).catch(() => {
  // Not available (e.g. some Expo Go builds): button presses are then handled when the app next opens.
});
