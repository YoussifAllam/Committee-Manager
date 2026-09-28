import * as Crypto from 'expo-crypto';
import { getCalendars } from 'expo-localization';

import {
  isSchedulable,
  latestOccurrence,
  nextOccurrence,
  planNotifications,
  wasScheduled,
} from '@/features/reminders/recurrence';
import * as repository from '@/features/reminders/repository';
import * as scheduler from '@/features/reminders/scheduler';
import type { PermissionStatus, ReminderNotificationEvent } from '@/features/reminders/scheduler';
import type { Reminder, ReminderDraft } from '@/features/reminders/types';

/**
 * Everything that changes a reminder goes through here: it writes the local database, then brings the
 * OS schedule in line with it. Plain functions with no React, so the background task that handles
 * notification buttons (background-task.ts) can use them while the app is closed.
 */

/** How a reminder's alerts stand after a change. */
export type Delivery = 'scheduled' | 'off' | 'no-permission' | 'unsupported' | 'failed';

/** The database couldn't be written; the member's input was not saved. */
export class ReminderStorageError extends Error {}

let queue: Promise<unknown> = Promise.resolve();

/** Runs changes one after another, so a notification button and an app-resume sync can't overwrite each other. */
function serial<T>(task: () => Promise<T>) {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

export function currentTimezone() {
  return getCalendars()[0]?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
}

const later = (a: string | null, b: Date) => (a && new Date(a) >= b ? a : b.toISOString());

async function store(reminder: Reminder) {
  try {
    await repository.saveReminder(reminder);
  } catch (error) {
    throw new ReminderStorageError(String(error));
  }
}

async function load(id: string) {
  try {
    return await repository.getReminder(id);
  } catch (error) {
    throw new ReminderStorageError(String(error));
  }
}

type ScheduleContext = { now: Date; permission: PermissionStatus; scheduled?: string[] };

/** Recomputes the next occurrence and makes the OS schedule match the reminder. Doesn't write the database. */
async function applySchedule(reminder: Reminder, context: ScheduleContext, options: { force?: boolean } = {}) {
  const next = nextOccurrence(reminder, context.now);
  let updated: Reminder = { ...reminder, nextOccurrenceAt: next?.toISOString() ?? null };

  let delivery: Delivery = 'scheduled';
  if (!isSchedulable(updated) || !next) delivery = 'off';
  else if (context.permission === 'unsupported') delivery = 'unsupported';
  else if (context.permission !== 'granted') delivery = 'no-permission';

  const plan = delivery === 'scheduled' ? planNotifications(updated, context.now) : [];
  try {
    const ids = await scheduler.replaceSchedule(updated, plan, {
      force: options.force,
      includeSnooze: !isSchedulable(updated),
      scheduled: context.scheduled,
    });
    updated = { ...updated, notificationIds: ids };
  } catch {
    // Nothing reliable is scheduled; an empty list makes the next sync flag passed alerts as missed and retry.
    delivery = 'failed';
    updated = { ...updated, notificationIds: [] };
  }
  return { reminder: updated, delivery };
}

async function scheduleContext(now = new Date()): Promise<ScheduleContext> {
  const permission = await scheduler.getPermission();
  return { now, permission: permission.status };
}

/** Keeps only the fields that apply to the chosen repeat and end rule. */
function normalize(draft: ReminderDraft): ReminderDraft {
  const repeats = draft.repeatType !== 'none';
  const endType = repeats ? draft.endType : 'never';
  return {
    ...draft,
    title: draft.title.trim(),
    message: draft.message.trim(),
    selectedWeekdays: draft.repeatType === 'selected_weekdays' ? [...draft.selectedWeekdays].sort() : [],
    intervalDays: draft.repeatType === 'every_n_days' ? draft.intervalDays : null,
    endType,
    endDate: endType === 'on_date' ? draft.endDate : null,
    maxOccurrences: endType === 'after_occurrences' ? draft.maxOccurrences : null,
  };
}

export async function listReminders() {
  try {
    return await repository.getAllReminders();
  } catch (error) {
    throw new ReminderStorageError(String(error));
  }
}

/**
 * Creates a reminder, or replaces the one with `id`. The reminder is stored before anything is scheduled,
 * so a scheduling failure or a missing permission never loses what the member typed. Editing cancels
 * every alert of the old version before scheduling the new one.
 */
export function saveReminder(draft: ReminderDraft, id?: string) {
  return serial(async () => {
    const now = new Date();
    const existing = id ? await load(id) : null;
    const reminder: Reminder = {
      id: existing?.id ?? Crypto.randomUUID(),
      ...normalize(draft),
      timezone: currentTimezone(),
      isEnabled: existing?.isEnabled ?? true,
      status: 'active',
      nextOccurrenceAt: null,
      lastTriggeredAt: existing?.lastTriggeredAt ?? null,
      missedAt: null,
      notificationIds: existing?.notificationIds ?? [],
      createdAt: existing?.createdAt ?? now.toISOString(),
      updatedAt: now.toISOString(),
      completedAt: null,
    };
    await store(reminder);
    if (existing) await scheduler.cancelAll(existing.id).catch(() => undefined);
    const result = await applySchedule(reminder, await scheduleContext(now), { force: true });
    await store(result.reminder);
    return result;
  });
}

export function deleteReminder(id: string) {
  return serial(async () => {
    // Cancel first: a reminder left in the database can be deleted again, an orphaned alert can't.
    await scheduler.cancelAll(id).catch(() => undefined);
    try {
      await repository.deleteReminder(id);
    } catch (error) {
      throw new ReminderStorageError(String(error));
    }
  });
}

/** Off cancels every pending alert but keeps the reminder; on schedules from the next valid occurrence. */
export function setReminderEnabled(id: string, isEnabled: boolean) {
  return serial(async () => {
    const reminder = await load(id);
    if (!reminder) return 'off' as Delivery;
    const now = new Date();
    // Re-enabling starts fresh: occurrences that passed while it was off are not "missed".
    const toggled = { ...reminder, isEnabled, missedAt: null, updatedAt: now.toISOString() };
    const result = await applySchedule(toggled, await scheduleContext(now));
    await store(result.reminder);
    return result.delivery;
  });
}

/**
 * "تم": a one-time reminder is finished; a recurring one only closes this occurrence and keeps
 * its future alerts.
 */
async function complete(reminder: Reminder, occurrence: Date, context: ScheduleContext) {
  const now = context.now;
  let updated: Reminder = {
    ...reminder,
    lastTriggeredAt: later(reminder.lastTriggeredAt, occurrence),
    missedAt: null,
    updatedAt: now.toISOString(),
  };
  if (reminder.repeatType === 'none' || !nextOccurrence(reminder, now)) {
    updated = { ...updated, status: 'completed', completedAt: now.toISOString() };
  }
  // The member dealt with it, so a pending "ذكّرني لاحقًا" alert is no longer wanted.
  await scheduler.cancelSnooze(reminder.id).catch(() => undefined);
  return (await applySchedule(updated, context)).reminder;
}

/** "ذكّرني لاحقًا": one extra alert after the reminder's snooze delay; the regular schedule is untouched. */
async function snooze(reminder: Reminder, occurrence: Date, context: ScheduleContext) {
  const at = new Date(context.now.getTime() + reminder.snoozeMinutes * 60_000);
  let delivery: Delivery = 'scheduled';
  if (context.permission === 'unsupported') delivery = 'unsupported';
  else if (context.permission !== 'granted') delivery = 'no-permission';
  else {
    try {
      await scheduler.scheduleSnooze(reminder, at, occurrence);
    } catch {
      delivery = 'failed';
    }
  }
  const updated: Reminder = {
    ...reminder,
    lastTriggeredAt: later(reminder.lastTriggeredAt, occurrence),
    missedAt: null,
    updatedAt: context.now.toISOString(),
  };
  return { reminder: updated, delivery, at };
}

const occurrenceFor = (reminder: Reminder, at = new Date()) =>
  reminder.missedAt ? new Date(reminder.missedAt) : (latestOccurrence(reminder, at) ?? at);

/** "تم" on a missed reminder in the app. */
export function completeMissed(id: string) {
  return serial(async () => {
    const reminder = await load(id);
    if (!reminder) return;
    await store(await complete(reminder, occurrenceFor(reminder), await scheduleContext()));
  });
}

/** "ذكّرني لاحقًا" on a missed reminder in the app. */
export function snoozeMissed(id: string) {
  return serial(async () => {
    const reminder = await load(id);
    if (!reminder) return { delivery: 'off' as Delivery, at: new Date() };
    const result = await snooze(reminder, occurrenceFor(reminder), await scheduleContext());
    await store(result.reminder);
    return { delivery: result.delivery, at: result.at };
  });
}

/** "تجاهل": forget this missed occurrence without changing anything else. */
export function dismissMissed(id: string) {
  return serial(async () => {
    const reminder = await load(id);
    if (!reminder?.missedAt) return;
    await store({ ...reminder, lastTriggeredAt: later(reminder.lastTriggeredAt, new Date(reminder.missedAt)), missedAt: null });
  });
}

/**
 * Flags the latest passed occurrence as missed when no alert reached the member for it: the phone had
 * no permission, nothing was scheduled (scheduling failed or the rolling window ran out), or — for a
 * one-time reminder — the alert is neither in the tray nor answered, which is what Android leaves
 * behind when the phone was off at that moment. A flagged or handled occurrence is never flagged twice.
 */
function detectMissed(reminder: Reminder, now: Date, canNotify: boolean, inTray: boolean): Reminder {
  if (!isSchedulable(reminder)) return reminder;
  const latest = latestOccurrence(reminder, now);
  if (!latest) return reminder;

  const handledUntil = Math.max(
    ...[reminder.lastTriggeredAt, reminder.missedAt, reminder.updatedAt].map((value) => (value ? Date.parse(value) : 0)),
  );
  if (latest.getTime() <= handledUntil) return reminder;

  const reached = inTray || (canNotify && wasScheduled(reminder, latest) && reminder.repeatType !== 'none');
  return reached ? { ...reminder, lastTriggeredAt: latest.toISOString() } : { ...reminder, missedAt: latest.toISOString() };
}

/**
 * Runs when the app starts or comes back to the foreground: detects missed reminders, follows a
 * timezone change, tops up rolling windows, re-creates alerts cancelled outside the app, and removes
 * alerts whose reminder no longer exists. Safe to run any number of times; it never duplicates an alert.
 */
export function syncAll() {
  return serial(async () => {
    const now = new Date();
    const reminders = await listReminders();
    const permission = await scheduler.getPermission();
    const context: ScheduleContext = { now, permission: permission.status };
    const timezone = currentTimezone();
    let inTray = new Set<string>();

    try {
      context.scheduled = await scheduler.getScheduledIds();
      inTray = await scheduler.getPresentedReminderIds();
      const known = new Set(reminders.map((reminder) => reminder.id));
      const orphans = new Set(
        context.scheduled
          .map((id) => /^reminder-(.+)-(?:daily|weekly|at|snooze)/.exec(id)?.[1])
          .filter((id): id is string => !!id && !known.has(id)),
      );
      for (const id of orphans) await scheduler.cancelAll(id);
    } catch {
      // Still recompute and store below; alerts are retried on the next sync.
    }

    const synced: Reminder[] = [];
    for (const original of reminders) {
      let reminder = detectMissed(original, now, permission.status === 'granted', inTray.has(original.id));
      // Wall-clock times are kept, so moving timezone means every alert has to be rescheduled.
      const moved = reminder.timezone !== timezone;
      if (moved) reminder = { ...reminder, timezone };
      const result = await applySchedule(reminder, context, { force: moved });
      if (JSON.stringify(result.reminder) !== JSON.stringify(original)) await store(result.reminder);
      synced.push(result.reminder);
    }
    return { reminders: synced, permission };
  });
}

const HANDLED_KEY = 'handled-notification-events';

/**
 * Applies a tap or a button press on an alert. The same response can arrive twice (from the background
 * task and again when the app opens), so each one is remembered and handled only once.
 * Returns whether the app should open the reminder.
 */
export function handleNotificationEvent(event: ReminderNotificationEvent) {
  return serial(async () => {
    const handled: string[] = JSON.parse((await repository.getMeta(HANDLED_KEY)) ?? '[]');
    if (handled.includes(event.key)) return { open: false };

    const reminder = await load(event.reminderId);
    if (reminder) {
      const context = await scheduleContext();
      const occurrence = event.occurrence ?? latestOccurrence(reminder, event.deliveredAt) ?? event.deliveredAt;
      if (event.action === 'done') {
        await store(await complete(reminder, occurrence, context));
      } else if (event.action === 'snooze') {
        await store((await snooze(reminder, occurrence, context)).reminder);
      } else {
        // Seen: it reached the member, so it isn't missed.
        const missedAt = reminder.missedAt && new Date(reminder.missedAt) <= occurrence ? null : reminder.missedAt;
        await store({ ...reminder, lastTriggeredAt: later(reminder.lastTriggeredAt, occurrence), missedAt });
      }
    }
    // Android leaves the alert in the tray after a button press.
    if (event.action === 'done' || event.action === 'snooze') await scheduler.dismiss(event.notificationId).catch(() => undefined);

    await repository.setMeta(HANDLED_KEY, JSON.stringify([...handled, event.key].slice(-50)));
    return { open: event.action === 'open' };
  });
}
