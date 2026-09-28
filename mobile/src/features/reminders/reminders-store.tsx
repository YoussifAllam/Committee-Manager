import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import * as scheduler from '@/features/reminders/scheduler';
import type { Permission, ReminderNotificationEvent } from '@/features/reminders/scheduler';
import * as service from '@/features/reminders/service';
import type { Delivery } from '@/features/reminders/service';
import type { ReminderDraft, Reminder } from '@/features/reminders/types';

type RemindersStore = {
  reminders: Reminder[];
  /** True until the local database has been read once. */
  loading: boolean;
  permission: Permission;
  /** The member chose "ليس الآن" on the permission explanation during this session. */
  permissionPromptDismissed: boolean;
  dismissPermissionPrompt: () => void;
  /** Shows the OS permission dialog; on success, schedules every reminder that was waiting for it. */
  requestPermission: () => Promise<Permission>;
  /** Creates a reminder, or replaces the one with `id`. Throws ReminderStorageError when nothing could be saved. */
  save: (draft: ReminderDraft, id?: string) => Promise<{ reminder: Reminder; delivery: Delivery }>;
  remove: (id: string) => Promise<void>;
  setEnabled: (id: string, enabled: boolean) => Promise<Delivery>;
  completeMissed: (id: string) => Promise<void>;
  snoozeMissed: (id: string) => Promise<{ delivery: Delivery; at: Date }>;
  dismissMissed: (id: string) => Promise<void>;
};

const RemindersContext = createContext<RemindersStore | null>(null);

/**
 * The member's private reminders, read from the local database. Syncs them with the OS scheduler when
 * the app starts and whenever it returns to the foreground, and reacts to taps on reminder alerts.
 */
export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<Permission>({ status: 'undetermined', canAskAgain: true });
  const [permissionPromptDismissed, setPermissionPromptDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      try {
        const result = await service.syncAll();
        if (!mounted) return;
        setReminders(result.reminders);
        setPermission(result.permission);
      } catch {
        // The list keeps what it shows; the next resume tries again.
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const onNotification = async (event: ReminderNotificationEvent) => {
      try {
        const { open } = await service.handleNotificationEvent(event);
        if (open) router.push(`/reminders/${event.reminderId}`);
        const latest = await service.listReminders();
        if (mounted) setReminders(latest);
      } catch {
        // A failed update is retried by the next sync.
      }
    };

    sync();
    const launch = scheduler.takeLaunchEvent();
    if (launch) onNotification(launch);
    const unsubscribe = scheduler.subscribe(onNotification);
    // Back from the background: pick up button presses handled while closed, a new timezone, a changed permission.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => {
      mounted = false;
      unsubscribe();
      appState.remove();
    };
  }, []);

  const reload = async () => setReminders(await service.listReminders());

  const store: RemindersStore = {
    reminders,
    loading,
    permission,
    permissionPromptDismissed,
    dismissPermissionPrompt: () => setPermissionPromptDismissed(true),
    requestPermission: async () => {
      const result = await scheduler.requestPermission();
      setPermission(result);
      if (result.status === 'granted') {
        const synced = await service.syncAll();
        setReminders(synced.reminders);
      }
      return result;
    },
    save: async (draft, id) => {
      const result = await service.saveReminder(draft, id);
      await reload();
      return result;
    },
    remove: async (id) => {
      await service.deleteReminder(id);
      await reload();
    },
    setEnabled: async (id, enabled) => {
      const delivery = await service.setReminderEnabled(id, enabled);
      await reload();
      return delivery;
    },
    completeMissed: async (id) => {
      await service.completeMissed(id);
      await reload();
    },
    snoozeMissed: async (id) => {
      const result = await service.snoozeMissed(id);
      await reload();
      return result;
    },
    dismissMissed: async (id) => {
      await service.dismissMissed(id);
      await reload();
    },
  };

  return <RemindersContext value={store}>{children}</RemindersContext>;
}

export function useReminders() {
  const store = useContext(RemindersContext);
  if (!store) throw new Error('useReminders must be used inside RemindersProvider');
  return store;
}

/** Whether saving should first show the "فعّل التنبيهات" explanation before the OS dialog. */
export function shouldExplainPermission({ permission, permissionPromptDismissed }: RemindersStore) {
  return permission.status !== 'granted' && permission.status !== 'unsupported' && permission.canAskAgain && !permissionPromptDismissed;
}
