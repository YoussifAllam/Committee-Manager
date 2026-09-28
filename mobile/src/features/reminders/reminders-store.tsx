import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Reminder } from '@/features/reminders/types';
import { reminders as initialReminders } from '@/mocks/data';

/** A reminder without an id is new; the store assigns one. */
type ReminderInput = Omit<Reminder, 'id'> & { id?: string };

type RemindersStore = {
  reminders: Reminder[];
  /** Adds a new reminder, or replaces the one with the same id. */
  save: (reminder: ReminderInput) => void;
  remove: (id: string) => void;
  setEnabled: (id: string, enabled: boolean) => void;
};

const RemindersContext = createContext<RemindersStore | null>(null);

// Local ids until the API assigns real ones.
const newId = () => `local-${Date.now()}`;

/** In-memory until the API exists: reminders reset when the app restarts. */
export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState(initialReminders);

  const store: RemindersStore = {
    reminders,
    save: ({ id, ...fields }) =>
      setReminders((current) =>
        id ? current.map((r) => (r.id === id ? { ...fields, id } : r)) : [...current, { ...fields, id: newId() }],
      ),
    remove: (id) => setReminders((current) => current.filter((r) => r.id !== id)),
    setEnabled: (id, enabled) =>
      setReminders((current) => current.map((r) => (r.id === id ? { ...r, enabled } : r))),
  };

  return <RemindersContext value={store}>{children}</RemindersContext>;
}

export function useReminders() {
  const store = useContext(RemindersContext);
  if (!store) throw new Error('useReminders must be used inside RemindersProvider');
  return store;
}
