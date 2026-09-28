import { Chip } from '@/components/chip';
import type { IconName } from '@/components/icon';
import type { Tone } from '@/constants/theme';
import { displayStatus } from '@/features/reminders/recurrence';
import type { Permission } from '@/features/reminders/scheduler';
import type { Reminder } from '@/features/reminders/types';
import { daysFromToday, formatLongDate } from '@/utils/date';

const STATUS: Record<ReturnType<typeof displayStatus>, { label: string; icon: IconName; tone: Tone }> = {
  active: { label: 'نشط', icon: 'check_circle', tone: 'success' },
  paused: { label: 'متوقف', icon: 'pause_circle', tone: 'warning' },
  ended: { label: 'انتهى', icon: 'flag', tone: 'neutral' },
};

/** نشط / متوقف / انتهى — spelled out, so the state never depends on color alone. */
export function ReminderStatusChip({ reminder }: { reminder: Reminder }) {
  const status = STATUS[displayStatus(reminder)];
  return <Chip label={status.label} icon={status.icon} tone={status.tone} />;
}

/** Why an active reminder's alerts won't arrive, or null when they will. */
export function alertProblem(reminder: Reminder, permission: Permission) {
  if (displayStatus(reminder) !== 'active' || permission.status === 'unsupported') return null;
  if (permission.status !== 'granted') return 'لن يصلك إشعار حتى تسمح بالتنبيهات.';
  if (reminder.notificationIds.length === 0) return 'تعذر جدولة التنبيه. سنحاول مجددًا عند فتح التطبيق.';
  return null;
}

/** "اليوم"، "غدًا"، "أمس"، or the full date. */
export function formatAlertDay(date: Date) {
  const days = daysFromToday(date);
  if (days === 0) return 'اليوم';
  if (days === 1) return 'غدًا';
  if (days === -1) return 'أمس';
  return formatLongDate(date);
}
