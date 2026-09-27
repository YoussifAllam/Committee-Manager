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

// Upcoming meetings across all of the member's committees.
export const meetings: Meeting[] = [
  {
    id: '1',
    committeeId: '1',
    title: 'الاجتماع الإداري الأسبوعي',
    startsAt: daysFromNow(3, 21, 30),
    location: 'قاعة الاجتماعات الرئيسية',
    agendaCount: 4,
  },
  {
    id: '2',
    committeeId: '2',
    title: 'اجتماع تخطيط أنشطة الشهر',
    startsAt: daysFromNow(1, 19, 0),
    location: 'قاعة الأنشطة',
    agendaCount: 3,
  },
  {
    id: '3',
    committeeId: '3',
    title: 'اجتماع لجنة المسجد الشهري',
    startsAt: daysFromNow(6, 20, 0),
    location: 'مكتب إدارة المسجد',
    agendaCount: 5,
  },
  {
    id: '4',
    committeeId: '1',
    title: 'مراجعة الميزانية الربع سنوية',
    startsAt: daysFromNow(10, 18, 0),
    location: 'قاعة الاجتماعات الرئيسية',
    agendaCount: 2,
  },
];

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
