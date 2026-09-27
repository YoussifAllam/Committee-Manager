// Placeholder data until the Django API exists. Dates are relative to today so countdowns stay realistic.
import type { Assignment, AssignmentStats } from '@/features/assignments/types';
import type { Committee } from '@/features/committees/types';
import type { Meeting } from '@/features/meetings/types';

function daysFromNow(days: number, hours = 9, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export const currentUser = { name: 'يوسف علام' };

// A member can belong to more than one committee, with a different role in each.
export const committees: Committee[] = [
  { id: '1', name: 'اللجنة الإدارية', role: 'عضو' },
  { id: '2', name: 'لجنة الأنشطة', role: 'منسق' },
  { id: '3', name: 'لجنة المسجد', role: 'عضو' },
];

export const unreadNotifications = 2;

export const nextMeeting: Meeting = {
  id: '1',
  title: 'الاجتماع الإداري الأسبوعي',
  startsAt: daysFromNow(3, 21, 30),
  location: 'قاعة الاجتماعات الرئيسية',
  videoLink: 'https://meet.google.com/',
  agendaCount: 4,
};

export const assignmentStats: AssignmentStats = { pending: 2, overdue: 2, completed: 1 };

export const urgentAssignments: Assignment[] = [
  {
    id: '1',
    title: 'التواصل مع إدارة المسجد',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: daysFromNow(-14),
    meetingTitle: 'الاجتماع الإداري الأسبوعي',
  },
  {
    id: '2',
    title: 'إعداد تقرير الأنشطة الشهرية',
    status: 'awaiting_review',
    priority: 'important',
    dueDate: daysFromNow(-12),
    meetingTitle: 'الاجتماع الإداري الأسبوعي',
  },
];
