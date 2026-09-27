import { pluralize } from '@/utils/plural';

// Hand-rolled instead of Intl so digits stay Latin (15, not ١٥) on every Android/Hermes version.
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const monthName = (date: Date) => MONTHS[date.getMonth()];
export const weekdayName = (date: Date) => WEEKDAYS[date.getDay()];
export const formatShortDate = (date: Date) => `${date.getDate()} ${monthName(date)}`;

/** "الثلاثاء، 30 سبتمبر", with the year only when it isn't the current one. */
export function formatLongDate(date: Date) {
  const year = date.getFullYear() === new Date().getFullYear() ? '' : ` ${date.getFullYear()}`;
  return `${weekdayName(date)}، ${formatShortDate(date)}${year}`;
}

export function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'صباحًا' : 'مساءً'}`;
}

/** Whole calendar days from today to `date`; negative when it's in the past. */
export function daysFromToday(date: Date) {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(date) - startOfDay(new Date())) / 86_400_000);
}

export const formatDays = (count: number) =>
  pluralize(count, { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا' });

/** Relative day: اليوم، غدًا، أمس، بعد 3 أيام، منذ 5 أيام. */
export function formatCountdown(date: Date) {
  const days = daysFromToday(date);
  if (days === 0) return 'اليوم';
  if (days === 1) return 'غدًا';
  if (days === -1) return 'أمس';
  return days > 0 ? `بعد ${formatDays(days)}` : `منذ ${formatDays(-days)}`;
}

export function greeting(now = new Date()) {
  return now.getHours() < 12 ? 'صباح الخير' : 'مساء الخير';
}
