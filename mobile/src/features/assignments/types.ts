import type { Committee } from '@/features/committees/types';

export type AssignmentStatus = 'not_started' | 'in_progress' | 'awaiting_review' | 'blocked' | 'done';
export type AssignmentPriority = 'normal' | 'important' | 'urgent';

/** One line of the assignment's timeline: an assignment, a status change, a request. */
export type AssignmentEvent = {
  id: string;
  at: Date;
  text: string;
  by: string;
};

export type AssignmentComment = {
  id: string;
  at: Date;
  author: string;
  role: string;
  text: string;
};

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
  /** Oldest first. */
  history: AssignmentEvent[];
  /** Oldest first. */
  comments: AssignmentComment[];
};

export type AssignmentStats = {
  pending: number;
  overdue: number;
  completed: number;
};
