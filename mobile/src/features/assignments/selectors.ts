import type { Assignment, AssignmentStats } from '@/features/assignments/types';
import { daysFromToday } from '@/utils/date';

export const isDone = (assignment: Assignment) => assignment.status === 'done';

export const isOverdue = (assignment: Assignment) => !isDone(assignment) && daysFromToday(assignment.dueDate) < 0;

export function summarize(assignments: Assignment[]): AssignmentStats {
  return {
    pending: assignments.filter((assignment) => !isDone(assignment)).length,
    overdue: assignments.filter(isOverdue).length,
    completed: assignments.filter(isDone).length,
  };
}

/** Open assignments, nearest deadline first (so overdue ones lead). */
export function openAssignments(assignments: Assignment[]) {
  return assignments
    .filter((assignment) => !isDone(assignment))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

/** Finished assignments, most recently updated first. */
export function completedAssignments(assignments: Assignment[]) {
  return assignments.filter(isDone).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/** What the home screen flags: open assignments that are overdue or not normal priority. */
export function needingAttention(assignments: Assignment[]) {
  return openAssignments(assignments).filter(
    (assignment) => isOverdue(assignment) || assignment.priority !== 'normal',
  );
}
