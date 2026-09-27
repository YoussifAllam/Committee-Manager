export type AssignmentStatus = 'not_started' | 'in_progress' | 'awaiting_review' | 'done';
export type AssignmentPriority = 'normal' | 'important' | 'urgent';

export type Assignment = {
  id: string;
  title: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  dueDate: Date;
  meetingTitle: string;
};

export type AssignmentStats = {
  pending: number;
  overdue: number;
  completed: number;
};
