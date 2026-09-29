import type { IconName } from '@/components/icon';
import type { Tone } from '@/constants/theme';
import type { AssignmentPriority, AssignmentStatus } from '@/features/assignments/types';

// Gray not started, blue in progress, amber waiting on someone else, red blocked, green done.
export const STATUS: Record<AssignmentStatus, { label: string; icon: IconName; tone: Tone }> = {
  not_started: { label: 'لم يبدأ', icon: 'radio_button_unchecked', tone: 'neutral' },
  in_progress: { label: 'جاري التنفيذ', icon: 'schedule', tone: 'info' },
  awaiting_review: { label: 'بانتظار المراجعة', icon: 'hourglass_top', tone: 'warning' },
  blocked: { label: 'يوجد عائق', icon: 'warning', tone: 'danger' },
  done: { label: 'مكتمل', icon: 'check_circle', tone: 'success' },
};

// Normal priority shows nothing, so only the exceptions are mentioned.
export const PRIORITY: Record<Exclude<AssignmentPriority, 'normal'>, string> = {
  important: 'مهم',
  urgent: 'عاجل',
};
