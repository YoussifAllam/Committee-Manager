// Placeholder data until the Django API exists. Dates are relative to today so countdowns stay realistic.
import type { Assignment } from '@/features/assignments/types';
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

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000);

const chair = 'أحمد محمد';

type AssignmentSeed = Omit<Assignment, 'history' | 'comments'> & Partial<Pick<Assignment, 'history' | 'comments'>>;

// Assignments across all of the member's committees; screens filter by the selected committee.
const assignmentSeeds: AssignmentSeed[] = [
  {
    id: '1',
    committee: adminCommittee,
    title: 'التواصل مع إدارة المسجد',
    description: 'التنسيق مع إدارة المسجد لحجز القاعة الرئيسية للفعالية، وتأكيد توفير أجهزة الصوت والتكييف.',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: daysFromNow(-14),
    updatedAt: hoursAgo(2),
    meetingTitle: 'الاجتماع الإداري الأسبوعي',
    history: [
      { id: '1-1', at: hoursAgo(24 * 21), text: 'تم إسناد التكليف وتحديد الموعد النهائي', by: chair },
      {
        id: '1-2',
        at: hoursAgo(24 * 20),
        text: 'بدء العمل على التكليف وإرسال الخطاب المبدئي للإدارة',
        by: currentUser.name,
      },
    ],
    comments: [
      {
        id: '1-c1',
        at: hoursAgo(24 * 20 - 1),
        author: chair,
        role: 'مدير الاجتماع',
        text: 'يرجى التأكد من الحصول على موافقة خطية قبل يوم الأربعاء القادم.',
      },
      {
        id: '1-c2',
        at: hoursAgo(24 * 19),
        author: currentUser.name,
        role: 'عضو',
        text: 'تم تسليم الخطاب وبانتظار رد مدير المسجد غدًا إن شاء الله.',
      },
    ],
  },
  {
    id: '2',
    committee: adminCommittee,
    title: 'إعداد تقرير الأنشطة الشهرية',
    description: 'جمع مخرجات أنشطة شهر أغسطس من اللجان، وصياغة التقرير النهائي لعرضه في الاجتماع القادم.',
    status: 'awaiting_review',
    priority: 'important',
    dueDate: daysFromNow(-12),
    updatedAt: hoursAgo(26),
    meetingTitle: 'الاجتماع الإداري الأسبوعي',
  },
  {
    id: '3',
    committee: adminCommittee,
    title: 'تحديث سجل العضوية',
    description: 'مراجعة بيانات الأعضاء الجدد وإضافتها إلى سجل العضوية.',
    status: 'not_started',
    priority: 'normal',
    dueDate: daysFromNow(5),
    updatedAt: hoursAgo(72),
    meetingTitle: 'الاجتماع الإداري الأسبوعي',
  },
  {
    id: '4',
    committee: adminCommittee,
    title: 'إرسال محضر الاجتماع السابق',
    description: 'صياغة محضر الاجتماع الإداري وإرساله لجميع الأعضاء لاعتماده.',
    status: 'done',
    priority: 'normal',
    dueDate: daysFromNow(-3),
    updatedAt: hoursAgo(50),
    meetingTitle: 'الاجتماع الإداري الأسبوعي',
  },
  {
    id: '5',
    committee: activitiesCommittee,
    title: 'حجز الحافلات لرحلة الشباب',
    description: 'التواصل مع شركة النقل وحجز حافلتين لرحلة نهاية الشهر، وتأكيد مواعيد الانطلاق.',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: daysFromNow(2),
    updatedAt: hoursAgo(5),
    meetingTitle: 'تقييم أنشطة الصيف',
  },
  {
    id: '6',
    committee: activitiesCommittee,
    title: 'تصميم إعلان المسابقة الثقافية',
    description: 'تصميم إعلان المسابقة ونشره على مجموعات الأعضاء.',
    status: 'done',
    priority: 'important',
    dueDate: daysFromNow(-6),
    updatedAt: hoursAgo(150),
    meetingTitle: 'تقييم أنشطة الصيف',
  },
  {
    id: '7',
    committee: mosqueCommittee,
    title: 'متابعة عقد صيانة التكييف',
    description: 'مراجعة عرض شركة الصيانة، والتأكد من جدول الزيارات الدورية قبل توقيع العقد.',
    status: 'in_progress',
    priority: 'important',
    dueDate: daysFromNow(-1),
    updatedAt: hoursAgo(20),
    meetingTitle: 'خطة صيانة المسجد',
  },
  {
    id: '8',
    committee: mosqueCommittee,
    title: 'حصر احتياجات المصلى النسائي',
    description: 'زيارة المصلى وحصر الاحتياجات من فرش وإضاءة وتجهيزات.',
    status: 'not_started',
    priority: 'normal',
    dueDate: daysFromNow(8),
    updatedAt: hoursAgo(96),
    meetingTitle: 'خطة صيانة المسجد',
  },
];

// Every assignment starts with its assignment in the timeline.
export const assignments: Assignment[] = assignmentSeeds.map(({ history, comments, ...assignment }) => ({
  ...assignment,
  history: history ?? [
    {
      id: `${assignment.id}-1`,
      at: new Date(assignment.updatedAt.getTime() - 24 * 3_600_000),
      text: 'تم إسناد التكليف وتحديد الموعد النهائي',
      by: chair,
    },
  ],
  comments: comments ?? [],
}));
