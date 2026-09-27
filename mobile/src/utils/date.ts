// Hand-rolled instead of Intl so digits stay Latin (15, not ١٥) on every Android/Hermes version.
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const monthName = (date: Date) => MONTHS[date.getMonth()];
export const weekdayName = (date: Date) => WEEKDAYS[date.getDay()];
export const formatShortDate = (date: Date) => `${date.getDate()} ${monthName(date)}`;

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

/** Arabic count of days: يوم واحد، يومين، 3–10 أيام، 11+ يومًا. */
export function formatDays(count: number) {
  if (count === 1) return 'يوم واحد';
  if (count === 2) return 'يومين';
  return count <= 10 ? `${count} أيام` : `${count} يومًا`;
}

export function formatCountdown(date: Date) {
  const days = daysFromToday(date);
  if (days === 0) return 'اليوم';
  if (days === 1) return 'غدًا';
  return `بعد ${formatDays(days)}`;
}

export function greeting(now = new Date()) {
  return now.getHours() < 12 ? 'صباح الخير' : 'مساء الخير';
}
