import { requireOptionalNativeModule } from 'expo';

const ExactAlarm = requireOptionalNativeModule<{ canScheduleExactAlarms(): boolean }>('ExactAlarm');

/**
 * Whether Android allows this app to fire alerts on the exact minute ("المنبهات والتذكيرات").
 * True where the question doesn't apply or can't be answered: iOS, the web, and Expo Go (no custom native code).
 */
export function canScheduleExactAlarms() {
  return ExactAlarm?.canScheduleExactAlarms() ?? true;
}
