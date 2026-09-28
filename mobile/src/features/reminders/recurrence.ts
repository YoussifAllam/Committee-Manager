import type { RecurrenceRule, Reminder } from '@/features/reminders/types';
import { formatDays, formatShortDate, formatTime, startOfDay, weekdayName, WEEKDAYS } from '@/utils/date';
import { pluralize } from '@/utils/plural';

const pad = (value: number) => String(value).padStart(2, '0');

/** "2026-09-30" → local midnight of that day. */
export function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function parseTimeKey(key: string) {
  const [hour, minute] = key.split(':').map(Number);
  return { hour, minute };
}

export const toTimeKey = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** The local moment of `time` on `day`, built from calendar parts so daylight-saving changes keep the wall-clock time. */
export function atTime(day: Date, time: string) {
  const { hour, minute } = parseTimeKey(time);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
}

/** Weekday numbers (0 = Sunday) in the order Arabic calendars show them: Saturday first. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

// Stops a malformed rule (say, an interval of 0) from looping forever.
const MAX_SPAN_DAYS = 366 * 30;

/** Every occurrence of the rule, in order, up to its end. */
export function* occurrences(rule: RecurrenceRule): Generator<Date> {
  const start = parseDateKey(rule.startDate);
  if (rule.repeatType === 'none') {
    yield atTime(start, rule.time);
    return;
  }

  const step = rule.repeatType === 'weekly' ? 7 : rule.repeatType === 'every_n_days' ? (rule.intervalDays ?? 0) : 1;
  if (step < 1 || (rule.repeatType === 'selected_weekdays' && rule.selectedWeekdays.length === 0)) return;
  const lastDay = rule.endType === 'on_date' && rule.endDate ? parseDateKey(rule.endDate) : undefined;
  const limit = rule.endType === 'after_occurrences' ? (rule.maxOccurrences ?? 0) : Infinity;

  let count = 0;
  for (let offset = 0; offset <= MAX_SPAN_DAYS && count < limit; offset += step) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    if (lastDay && day > lastDay) return;
    if (rule.repeatType === 'selected_weekdays' && !rule.selectedWeekdays.includes(day.getDay())) continue;
    count++;
    yield atTime(day, rule.time);
  }
}

/** The first occurrence strictly after `after`, or undefined when the rule has run out. */
export function nextOccurrence(rule: RecurrenceRule, after = new Date()) {
  for (const date of occurrences(rule)) {
    if (date > after) return date;
  }
}

export function upcomingOccurrences(rule: RecurrenceRule, after: Date, limit: number) {
  const result: Date[] = [];
  for (const date of occurrences(rule)) {
    if (result.length >= limit) break;
    if (date > after) result.push(date);
  }
  return result;
}

/** The latest occurrence at or before `before`. */
export function latestOccurrence(rule: RecurrenceRule, before = new Date()) {
  let latest: Date | undefined;
  for (const date of occurrences(rule)) {
    if (date > before) break;
    latest = date;
  }
  return latest;
}

/** Active and switched on: the only state in which the phone should alert. */
export const isSchedulable = (reminder: Reminder) => reminder.status === 'active' && reminder.isEnabled;

export type DisplayStatus = 'active' | 'paused' | 'ended';

export function displayStatus(reminder: Reminder, now = new Date()): DisplayStatus {
  if (reminder.status !== 'active' || !nextOccurrence(reminder, now)) return 'ended';
  return reminder.isEnabled ? 'active' : 'paused';
}

// ——— Arabic descriptions ———

// "الاثنين" → "اثنين", to read "كل يوم اثنين وخميس".
const WEEKDAY_NOUNS = WEEKDAYS.map((name) => name.replace(/^ال/, ''));

export const formatTimes = (count: number) =>
  pluralize(count, { one: 'مرة واحدة', two: 'مرتين', few: 'مرات', many: 'مرة' });

/** "1 أكتوبر", with the year only when it isn't this year. */
export function formatDay(date: Date) {
  const year = date.getFullYear() === new Date().getFullYear() ? '' : ` ${date.getFullYear()}`;
  return `${formatShortDate(date)}${year}`;
}

/** "مرة واحدة"، "يوميًا"، "كل يوم سبت وثلاثاء"، "أسبوعيًا يوم الأحد"، "كل 14 يومًا". */
export function describeRepeat(rule: RecurrenceRule) {
  switch (rule.repeatType) {
    case 'none':
      return 'مرة واحدة';
    case 'daily':
      return 'يوميًا';
    case 'weekly':
      return `أسبوعيًا يوم ${weekdayName(parseDateKey(rule.startDate))}`;
    case 'selected_weekdays': {
      if (rule.selectedWeekdays.length === 7) return 'يوميًا';
      const names = WEEK_ORDER.filter((day) => rule.selectedWeekdays.includes(day)).map((day) => WEEKDAY_NOUNS[day]);
      return `كل يوم ${names.join(' و')}`;
    }
    case 'every_n_days':
      return rule.intervalDays === 1 ? 'يوميًا' : `كل ${formatDays(rule.intervalDays ?? 0)}`;
  }
}

/** "بدون تاريخ انتهاء"، "حتى 30 أكتوبر"، "بعد 5 مرات". */
export function describeEnd(rule: RecurrenceRule) {
  if (rule.endType === 'on_date' && rule.endDate) return `حتى ${formatDay(parseDateKey(rule.endDate))}`;
  if (rule.endType === 'after_occurrences' && rule.maxOccurrences) return `بعد ${formatTimes(rule.maxOccurrences)}`;
  return 'بدون تاريخ انتهاء';
}

/** The card line: "كل 5 أيام حتى 30 أكتوبر"، "يوميًا، 10 مرات فقط". */
export function describeSchedule(rule: RecurrenceRule) {
  const repeat = describeRepeat(rule);
  if (rule.repeatType === 'none') return repeat;
  if (rule.endType === 'on_date') return `${repeat} ${describeEnd(rule)}`;
  if (rule.endType === 'after_occurrences' && rule.maxOccurrences) return `${repeat}، ${formatTimes(rule.maxOccurrences)} فقط`;
  return repeat;
}

/** The live sentence above the save button, e.g. "سيصلك هذا التذكير كل 14 يومًا الساعة 10:00 صباحًا، بدءًا من 1 أكتوبر." */
export function scheduleSummary(rule: RecurrenceRule, now = new Date()) {
  const first = nextOccurrence(rule, now);
  if (!first) {
    return rule.repeatType === 'none'
      ? 'هذا الموعد مضى. اختر وقتًا قادمًا ليصلك التذكير.'
      : 'كل مواعيد هذا التذكير مضت. غيّر تاريخ البدء أو نهاية التكرار.';
  }

  const time = formatTime(first);
  if (rule.repeatType === 'none') return `سيصلك هذا التذكير يوم ${weekdayName(first)} ${formatDay(first)} الساعة ${time}.`;

  const startsToday = startOfDay(first).getTime() === startOfDay(now).getTime();
  let text = `سيصلك هذا التذكير ${describeRepeat(rule)} الساعة ${time}`;
  if (!startsToday) text += `، بدءًا من ${formatDay(first)}`;
  if (rule.endType === 'on_date' && rule.endDate) text += `${startsToday ? '،' : ''} ${describeEnd(rule)}`;
  if (rule.endType === 'after_occurrences' && rule.maxOccurrences) text += `، وينتهي ${describeEnd(rule)}`;
  return `${text}.`;
}

// ——— Notification plan ———

/** Weekday: 0 = Sunday. */
export type PlannedTrigger =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }
  | { type: 'date'; date: Date };

export type PlannedNotification = { identifier: string; trigger: PlannedTrigger; occurrence?: Date };

/**
 * How many one-off alerts to keep scheduled ahead for rules the OS can't repeat by itself.
 * The window is topped up every time the app opens; it stays well under the OS limits
 * (iOS keeps 64 pending notifications per app, Android 500 alarms).
 */
export const ROLLING_WINDOW = 8;

/** Every notification identifier of a reminder starts with this, which is how its alerts are found and cancelled. */
export const notificationPrefix = (reminderId: string) => `reminder-${reminderId}-`;
export const snoozeIdentifier = (reminderId: string) => `${notificationPrefix(reminderId)}snooze`;

const stamp = (date: Date) => `${toDateKey(date)}T${toTimeKey(date)}`.replace(/[-:]/g, '');

/**
 * The OS notifications a reminder needs right now. Identifiers are stable (derived from the rule and the
 * occurrence), so scheduling the same plan twice replaces alerts instead of duplicating them.
 */
export function planNotifications(reminder: Reminder, now = new Date()): PlannedNotification[] {
  if (!isSchedulable(reminder)) return [];

  const prefix = notificationPrefix(reminder.id);
  const { hour, minute } = parseTimeKey(reminder.time);
  const clock = reminder.time.replace(':', '');
  const start = parseDateKey(reminder.startDate);

  // A native repeating trigger fires forever from today, so it only fits an open-ended rule that has already started.
  if (reminder.endType === 'never' && start <= startOfDay(now)) {
    if (reminder.repeatType === 'daily' || (reminder.repeatType === 'every_n_days' && reminder.intervalDays === 1)) {
      return [{ identifier: `${prefix}daily-${clock}`, trigger: { type: 'daily', hour, minute } }];
    }
    const weekdays =
      reminder.repeatType === 'weekly'
        ? [start.getDay()]
        : reminder.repeatType === 'selected_weekdays'
          ? reminder.selectedWeekdays
          : [];
    if (weekdays.length > 0) {
      return weekdays.map((weekday) => ({
        identifier: `${prefix}weekly-${weekday}-${clock}`,
        trigger: { type: 'weekly', weekday, hour, minute },
      }));
    }
  }

  return upcomingOccurrences(reminder, now, ROLLING_WINDOW).map((date) => ({
    identifier: `${prefix}at-${stamp(date)}`,
    trigger: { type: 'date', date },
    occurrence: date,
  }));
}

/** Whether the reminder's last saved plan covered `occurrence`, i.e. the OS was due to show it. */
export function wasScheduled(reminder: Reminder, occurrence: Date) {
  const prefix = notificationPrefix(reminder.id);
  const clock = toTimeKey(occurrence).replace(':', '');
  return reminder.notificationIds.some(
    (id) =>
      id === `${prefix}at-${stamp(occurrence)}` ||
      id === `${prefix}daily-${clock}` ||
      id === `${prefix}weekly-${occurrence.getDay()}-${clock}`,
  );
}
