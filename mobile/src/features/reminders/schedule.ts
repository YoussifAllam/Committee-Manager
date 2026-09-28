import type { Reminder, Repeat } from '@/features/reminders/types';
import { addDays, formatDays, formatLongDate, formatShortDate, formatTime, startOfDay, WEEKDAYS } from '@/utils/date';

/** The next time the reminder fires at or after `now`, or undefined when it never will again. */
export function nextOccurrence({ startsAt, repeat, endsOn }: Reminder, now = new Date()) {
  let next: Date | undefined;

  if (repeat.kind === 'none') {
    next = startsAt >= now ? startsAt : undefined;
  } else if (repeat.kind === 'interval') {
    // Step in calendar days (not milliseconds) so the time of day survives daylight-saving changes.
    next = startsAt;
    while (next < now) next = addDays(next, repeat.days);
  } else {
    const from = startsAt > now ? startsAt : now;
    for (let offset = 0; offset <= 7 && !next; offset++) {
      const day = addDays(startOfDay(from), offset);
      const candidate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startsAt.getHours(), startsAt.getMinutes());
      if (candidate >= from && repeat.weekdays.includes(candidate.getDay())) next = candidate;
    }
  }

  const lastMoment = endsOn && addDays(startOfDay(endsOn), 1);
  return next && (!lastMoment || next < lastMoment) ? next : undefined;
}

/** "مرة واحدة"، "يوميًا"، "أسبوعيًا يوم الخميس"، "أسبوعيًا أيام الاثنين والخميس"، "كل 14 يومًا". */
export function describeRepeat(repeat: Repeat) {
  if (repeat.kind === 'none') return 'مرة واحدة';
  if (repeat.kind === 'interval') return repeat.days === 1 ? 'يوميًا' : `كل ${formatDays(repeat.days)}`;
  if (repeat.weekdays.length === 7) return 'يوميًا';

  const names = [...repeat.weekdays].sort((a, b) => a - b).map((day) => WEEKDAYS[day]);
  return names.length === 1 ? `أسبوعيًا يوم ${names[0]}` : `أسبوعيًا أيام ${names.join(' و')}`;
}

/** The sentence under the form that says exactly when the reminder will fire. */
export function scheduleSummary({ startsAt, repeat, endsOn }: Pick<Reminder, 'startsAt' | 'repeat' | 'endsOn'>) {
  if (repeat.kind === 'none') {
    return `سيصلك هذا التذكير مرة واحدة يوم ${formatLongDate(startsAt)} الساعة ${formatTime(startsAt)}.`;
  }
  const until = endsOn ? ` حتى ${formatShortDate(endsOn)}` : '';
  return `سيصلك هذا التذكير ${describeRepeat(repeat)} الساعة ${formatTime(startsAt)}، بدءًا من ${formatShortDate(startsAt)}${until}.`;
}

/** Active reminders first, soonest alert first; stopped and finished ones go last. */
export function sortByNextAlert(reminders: Reminder[], now = new Date()) {
  const key = (reminder: Reminder) =>
    (reminder.enabled && nextOccurrence(reminder, now)?.getTime()) || Number.MAX_SAFE_INTEGER;
  return [...reminders].sort((a, b) => key(a) - key(b));
}
