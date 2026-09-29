import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Assignment, AssignmentStatus } from '@/features/assignments/types';
import { assignments as sampleAssignments, committees, currentUser } from '@/mocks/data';

type AssignmentsStore = {
  assignments: Assignment[];
  /** Adds a line to the timeline and, when given, changes the status. */
  update: (id: string, change: { event: string; status?: AssignmentStatus }) => void;
  addComment: (id: string, text: string) => void;
};

const AssignmentsContext = createContext<AssignmentsStore | null>(null);

let nextId = 0;
const newId = () => `local-${Date.now()}-${nextId++}`;

/**
 * The member's assignments, shared so an update shows on every screen at once.
 * Kept in memory over the sample data until the backend exists; changes reset when the app restarts.
 */
export function AssignmentsProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState(sampleAssignments);

  const change = (id: string, apply: (assignment: Assignment, at: Date) => Assignment) =>
    setAssignments((current) =>
      current.map((assignment) => (assignment.id === id ? apply(assignment, new Date()) : assignment)),
    );

  const store: AssignmentsStore = {
    assignments,
    update: (id, { event, status }) =>
      change(id, (assignment, at) => ({
        ...assignment,
        status: status ?? assignment.status,
        updatedAt: at,
        history: [...assignment.history, { id: newId(), at, text: event, by: currentUser.name }],
      })),
    addComment: (id, text) =>
      change(id, (assignment, at) => ({
        ...assignment,
        updatedAt: at,
        comments: [
          ...assignment.comments,
          {
            id: newId(),
            at,
            author: currentUser.name,
            role: committees.find((c) => c.id === assignment.committee.id)?.role ?? '',
            text,
          },
        ],
      })),
  };

  return <AssignmentsContext value={store}>{children}</AssignmentsContext>;
}

export function useAssignments() {
  const store = useContext(AssignmentsContext);
  if (!store) throw new Error('useAssignments must be used inside AssignmentsProvider');
  return store;
}
