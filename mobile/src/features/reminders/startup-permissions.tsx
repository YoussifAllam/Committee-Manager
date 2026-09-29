import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { openExactAlarmSettings, openNotificationSettings } from '@/features/reminders/device-settings';
import { ExactAlarmPrompt, PermissionPrompt } from '@/features/reminders/permission-prompt';
import { useReminders } from '@/features/reminders/reminders-store';
import { claimStartupPermissions } from '@/features/reminders/service';
import { canScheduleExactAlarms } from '@/modules/exact-alarm';

const needsExactAlarms = () => Platform.OS === 'android' && !canScheduleExactAlarms();

/**
 * Checked on every launch. The first launch after install shows the OS notification dialog straight away;
 * later launches explain and offer to turn notifications on while they're off. Then, on Android, asks for
 * "المنبهات والتذكيرات" while it isn't allowed. Returning from the background doesn't ask again.
 */
export function StartupPermissions() {
  const { loading, permission, requestPermission } = useReminders();
  const [step, setStep] = useState<'notifications' | 'exact' | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // `permission` is only real once the first sync has finished.
    if (loading || started.current) return;
    started.current = true;
    (async () => {
      const firstLaunch = await claimStartupPermissions();
      if (firstLaunch && permission.status === 'undetermined') {
        await requestPermission();
      } else if (permission.status === 'denied' || permission.status === 'undetermined') {
        setStep('notifications');
        return;
      }
      if (needsExactAlarms()) setStep('exact');
    })().catch(() => {
      // The banner and فكّرني settings still offer both permissions.
    });
  }, [loading, permission, requestPermission]);

  const afterNotifications = () => setStep(needsExactAlarms() ? 'exact' : null);

  return (
    <>
      <PermissionPrompt
        visible={step === 'notifications'}
        settings={!permission.canAskAgain}
        onAllow={async () => {
          setStep(null);
          if (permission.canAskAgain) await requestPermission().catch(() => {});
          else openNotificationSettings();
          afterNotifications();
        }}
        onLater={afterNotifications}
      />
      <ExactAlarmPrompt
        visible={step === 'exact'}
        onAllow={() => {
          setStep(null);
          openExactAlarmSettings();
        }}
        onLater={() => setStep(null)}
      />
    </>
  );
}
