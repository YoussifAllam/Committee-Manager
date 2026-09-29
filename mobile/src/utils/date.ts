import { pluralize } from '@/utils/plural';

// Hand-rolled instead of Intl so digits stay Latin (15, not ١٥) on every Android/Hermes version.
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
export const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const monthName = (date: Date) => MONTHS[date.getMonth()];
export const weekdayName = (date: Date) => WEEKDAYS[date.getDay()];
export const formatShortDate = (date: Date) => `${date.getDate()} ${monthName(date)}`;

/** "الثلاثاء، 30 سبتمبر", with the year only when it isn't the current one. */
export function formatLongDate(date: Date) {
  const year = date.getFullYear() === new Date().getFullYear() ? '' : ` ${date.getFullYear()}`;
  return `${weekdayName(date)}، ${formatShortDate(date)}${year}`;
}

/** "09:00 صباحًا"، "08:30 مساءً". */
export function formatTime(date: Date) {
  const hours = date.getHours();
  const clock = [hours % 12 || 12, date.getMinutes()].map((part) => String(part).padStart(2, '0')).join(':');
  return `${clock} ${hours < 12 ? 'صباحًا' : 'مساءً'}`;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Whole calendar days from today to `date`; negative when it's in the past. */
export function daysFromToday(date: Date) {
  return Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / 86_400_000);
}

export const formatDays = (count: number) =>
  pluralize(count, { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا' });

/** "10 دقائق"، "ساعة"، "ساعتين"، "ساعة و30 دقيقة". */
export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hoursText = hours ? pluralize(hours, { one: 'ساعة', two: 'ساعتين', few: 'ساعات', many: 'ساعة' }) : '';
  const restText = rest ? pluralize(rest, { one: 'دقيقة', two: 'دقيقتين', few: 'دقائق', many: 'دقيقة' }) : '';
  return hoursText && restText ? `${hoursText} و${restText}` : hoursText || restText;
}

/** Relative day: اليوم، غدًا، أمس، بعد 3 أيام، منذ 5 أيام. */
export function formatCountdown(date: Date) {
  const days = daysFromToday(date);
  if (days === 0) return 'اليوم';
  if (days === 1) return 'غدًا';
  if (days === -1) return 'أمس';
  return days > 0 ? `بعد ${formatDays(days)}` : `منذ ${formatDays(-days)}`;
}

/** "منذ 5 دقائق"، "منذ ساعتين"، then whole days: "أمس"، "منذ 3 أيام". */
export function formatTimeAgo(date: Date, now = new Date()) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${pluralize(minutes, { one: 'دقيقة', two: 'دقيقتين', few: 'دقائق', many: 'دقيقة' })}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${pluralize(hours, { one: 'ساعة', two: 'ساعتين', few: 'ساعات', many: 'ساعة' })}`;
  return formatCountdown(date);
}

export function greeting(now = new Date()) {
  return now.getHours() < 12 ? 'صباح الخير' : 'مساء الخير';
}
