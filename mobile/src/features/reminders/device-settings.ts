import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';

/**
 * Shortcuts to the system screens a member may need when reminders don't arrive.
 * Each falls back to the app's own settings page when the phone doesn't offer the exact screen.
 */

async function openAndroidScreen(action: IntentLauncher.ActivityAction, params: IntentLauncher.IntentLauncherParams) {
  try {
    await IntentLauncher.startActivityAsync(action, params);
  } catch {
    await Linking.openSettings();
  }
}

export function openNotificationSettings() {
  if (Platform.OS !== 'android') return Linking.openSettings();
  return openAndroidScreen(IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS, {
    extra: { 'android.provider.extra.APP_PACKAGE': Application.applicationId },
  });
}

/** Android 12+: "المنبهات والتذكيرات", which lets alerts fire on the exact minute. */
export function openExactAlarmSettings() {
  return openAndroidScreen(IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM, {
    data: `package:${Application.applicationId}`,
  });
}

/** The battery-optimisation list, where the member can exempt the app so the OS doesn't delay its alerts. */
export function openBatterySettings() {
  return openAndroidScreen(IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS, {});
}
