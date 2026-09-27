import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Committee } from '@/features/committees/types';
import { committees } from '@/mocks/data';

type SelectedCommittee = {
  committees: Committee[];
  committee: Committee;
  select: (committee: Committee) => void;
};

const SelectedCommitteeContext = createContext<SelectedCommittee | null>(null);

/**
 * The committee chosen in the committee picker. It's app-wide, so switching it on one screen
 * also switches every other screen that filters by committee (home, assignments).
 */
export function SelectedCommitteeProvider({ children }: { children: ReactNode }) {
  const [committee, select] = useState(committees[0]);

  return <SelectedCommitteeContext value={{ committees, committee, select }}>{children}</SelectedCommitteeContext>;
}

export function useSelectedCommittee() {
  const value = useContext(SelectedCommitteeContext);
  if (!value) throw new Error('useSelectedCommittee must be used inside SelectedCommitteeProvider');
  return value;
}
