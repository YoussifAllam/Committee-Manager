import type { Committee } from '@/features/committees/types';

export type Meeting = {
  id: string;
  committee: Pick<Committee, 'id' | 'name'>;
  title: string;
  startsAt: Date;
  location: string;
  agendaCount: number;
  /** Decisions taken and assignments created in the meeting; 0 until it has been held. */
  decisionCount: number;
  assignmentCount: number;
};
