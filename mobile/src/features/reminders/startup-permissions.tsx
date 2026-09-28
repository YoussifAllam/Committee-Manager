import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { openExactAlarmSettings } from '@/features/reminders/device-settings';
import { ExactAlarmPrompt } from '@/features/reminders/permission-prompt';
import { useReminders } from '@/features/reminders/reminders-store';
import { claimStartupPermissions } from '@/features/reminders/service';
import { canScheduleExactAlarms } from '@/modules/exact-alarm';

/**
 * First launch after install: shows the notification permission dialog straight away, then, on Android,
 * asks for "المنبهات والتذكيرات" when it isn't allowed yet. Runs once; later changes go through فكّرني settings.
 */
export function StartupPermissions() {
  const { requestPermission } = useReminders();
  const [askExactAlarms, setAskExactAlarms] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      if (!(await claimStartupPermissions())) return;
      await requestPermission();
      if (Platform.OS === 'android' && !canScheduleExactAlarms()) setAskExactAlarms(true);
    })().catch(() => {
      // The banner and فكّرني settings still offer both permissions.
    });
  }, [requestPermission]);

  return (
    <ExactAlarmPrompt
      visible={askExactAlarms}
      onAllow={() => {
        setAskExactAlarms(false);
        openExactAlarmSettings();
      }}
      onLater={() => setAskExactAlarms(false)}
    />
  );
}
