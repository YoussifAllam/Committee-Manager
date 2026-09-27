import type { Committee } from '@/features/committees/types';

export type AssignmentStatus = 'not_started' | 'in_progress' | 'awaiting_review' | 'done';
export type AssignmentPriority = 'normal' | 'important' | 'urgent';

export type Assignment = {
  id: string;
  committee: Pick<Committee, 'id' | 'name'>;
  title: string;
  description: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  dueDate: Date;
  updatedAt: Date;
  meetingTitle: string;
};

export type AssignmentStats = {
  pending: number;
  overdue: number;
  completed: number;
};
