import { expoGoWithoutNotifications } from '@/features/reminders/scheduler';

// Registers the notification-button task before the app renders; expo-task-manager needs it at startup.
// Skipped in Expo Go on Android, which can't load expo-notifications.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (!expoGoWithoutNotifications) require('@/features/reminders/background-task');

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('expo-router/entry');
