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

const [adminCommittee, activitiesCommittee, mosqueCommittee] = committees;

// Meetings across all of the member's committees, past and upcoming.
export const meetings: Meeting[] = [
  {
    id: '1',
    committee: adminCommittee,
    title: 'الاجتماع الإداري الأسبوعي',
    startsAt: daysFromNow(3, 21, 30),
    location: 'قاعة الاجتماعات الرئيسية',
    agendaCount: 4,
    decisionCount: 0,
    assignmentCount: 0,
  },
  {
    id: '2',
    committee: activitiesCommittee,
    title: 'اجتماع تخطيط أنشطة الشهر',
    startsAt: daysFromNow(1, 19, 0),
    location: 'قاعة الأنشطة',
    agendaCount: 3,
    decisionCount: 0,
    assignmentCount: 0,
  },
  {
    id: '3',
    committee: mosqueCommittee,
    title: 'اجتماع لجنة المسجد الشهري',
    startsAt: daysFromNow(6, 20, 0),
    location: 'مكتب إدارة المسجد',
    agendaCount: 5,
    decisionCount: 0,
    assignmentCount: 0,
  },
  {
    id: '4',
    committee: adminCommittee,
    title: 'مراجعة الميزانية الربع سنوية',
    startsAt: daysFromNow(10, 18, 0),
    location: 'قاعة الاجتماعات الرئيسية',
    agendaCount: 2,
    decisionCount: 0,
    assignmentCount: 0,
  },
  {
    id: '5',
    committee: adminCommittee,
    title: 'الاجتماع الإداري الأسبوعي',
    startsAt: daysFromNow(-4, 21, 30),
    location: 'قاعة الاجتماعات الرئيسية',
    agendaCount: 5,
    decisionCount: 2,
    assignmentCount: 3,
  },
  {
    id: '6',
    committee: activitiesCommittee,
    title: 'تقييم أنشطة الصيف',
    startsAt: daysFromNow(-9, 19, 0),
    location: 'قاعة الأنشطة',
    agendaCount: 4,
    decisionCount: 3,
    assignmentCount: 5,
  },
  {
    id: '7',
    committee: adminCommittee,
    title: 'الاجتماع الإداري الأسبوعي',
    startsAt: daysFromNow(-11, 21, 30),
    location: 'قاعة الاجتماعات الرئيسية',
    agendaCount: 4,
    decisionCount: 1,
    assignmentCount: 1,
  },
  {
    id: '8',
    committee: mosqueCommittee,
    title: 'خطة صيانة المسجد',
    startsAt: daysFromNow(-20, 20, 0),
    location: 'مكتب إدارة المسجد',
    agendaCount: 3,
    decisionCount: 1,
    assignmentCount: 2,
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
