import * as SQLite from 'expo-sqlite';

import type { Reminder } from '@/features/reminders/types';

/**
 * Reminders live in a SQLite database on the phone and never leave it.
 * The web preview uses IndexedDB instead (repository.web.ts).
 */

// Each entry upgrades the schema by one version (tracked in PRAGMA user_version). Append; never edit a shipped one.
const MIGRATIONS = [
  `CREATE TABLE reminders (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    start_date TEXT NOT NULL,
    time TEXT NOT NULL,
    timezone TEXT NOT NULL,
    repeat_type TEXT NOT NULL,
    selected_weekdays TEXT NOT NULL DEFAULT '[]',
    interval_days INTEGER,
    end_type TEXT NOT NULL,
    end_date TEXT,
    max_occurrences INTEGER,
    exact_timing INTEGER NOT NULL DEFAULT 0,
    snooze_minutes INTEGER NOT NULL DEFAULT 60,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    next_occurrence_at TEXT,
    last_triggered_at TEXT,
    missed_at TEXT,
    notification_ids TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT
  );
  CREATE TABLE meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );`,
];

let connection: Promise<SQLite.SQLiteDatabase> | undefined;

function database() {
  connection ??= (async () => {
    const db = await SQLite.openDatabaseAsync('himma.db');
    await db.execAsync('PRAGMA journal_mode = WAL;');
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    for (let version = row?.user_version ?? 0; version < MIGRATIONS.length; version++) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(MIGRATIONS[version]);
        await db.execAsync(`PRAGMA user_version = ${version + 1}`);
      });
    }
    return db;
  })().catch((error) => {
    // Let the next call try again instead of caching the failure.
    connection = undefined;
    throw error;
  });
  return connection;
}

type Row = {
  id: string;
  title: string;
  message: string;
  start_date: string;
  time: string;
  timezone: string;
  repeat_type: Reminder['repeatType'];
  selected_weekdays: string;
  interval_days: number | null;
  end_type: Reminder['endType'];
  end_date: string | null;
  max_occurrences: number | null;
  exact_timing: number;
  snooze_minutes: number;
  is_enabled: number;
  status: Reminder['status'];
  next_occurrence_at: string | null;
  last_triggered_at: string | null;
  missed_at: string | null;
  notification_ids: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const fromRow = (row: Row): Reminder => ({
  id: row.id,
  title: row.title,
  message: row.message,
  startDate: row.start_date,
  time: row.time,
  timezone: row.timezone,
  repeatType: row.repeat_type,
  selectedWeekdays: JSON.parse(row.selected_weekdays),
  intervalDays: row.interval_days,
  endType: row.end_type,
  endDate: row.end_date,
  maxOccurrences: row.max_occurrences,
  exactTiming: row.exact_timing === 1,
  snoozeMinutes: row.snooze_minutes,
  isEnabled: row.is_enabled === 1,
  status: row.status,
  nextOccurrenceAt: row.next_occurrence_at,
  lastTriggeredAt: row.last_triggered_at,
  missedAt: row.missed_at,
  notificationIds: JSON.parse(row.notification_ids),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  completedAt: row.completed_at,
});

const toRow = (reminder: Reminder): Row => ({
  id: reminder.id,
  title: reminder.title,
  message: reminder.message,
  start_date: reminder.startDate,
  time: reminder.time,
  timezone: reminder.timezone,
  repeat_type: reminder.repeatType,
  selected_weekdays: JSON.stringify(reminder.selectedWeekdays),
  interval_days: reminder.intervalDays,
  end_type: reminder.endType,
  end_date: reminder.endDate,
  max_occurrences: reminder.maxOccurrences,
  exact_timing: reminder.exactTiming ? 1 : 0,
  snooze_minutes: reminder.snoozeMinutes,
  is_enabled: reminder.isEnabled ? 1 : 0,
  status: reminder.status,
  next_occurrence_at: reminder.nextOccurrenceAt,
  last_triggered_at: reminder.lastTriggeredAt,
  missed_at: reminder.missedAt,
  notification_ids: JSON.stringify(reminder.notificationIds),
  created_at: reminder.createdAt,
  updated_at: reminder.updatedAt,
  completed_at: reminder.completedAt,
});

export async function getAllReminders() {
  const db = await database();
  const rows = await db.getAllAsync<Row>('SELECT * FROM reminders ORDER BY created_at');
  return rows.map(fromRow);
}

export async function getReminder(id: string) {
  const db = await database();
  const row = await db.getFirstAsync<Row>('SELECT * FROM reminders WHERE id = ?', id);
  return row ? fromRow(row) : null;
}

/** Inserts the reminder, or replaces the stored one with the same id. */
export async function saveReminder(reminder: Reminder) {
  const db = await database();
  const row = toRow(reminder);
  const columns = Object.keys(row);
  await db.runAsync(
    `INSERT OR REPLACE INTO reminders (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    Object.values(row),
  );
}

export async function deleteReminder(id: string) {
  const db = await database();
  await db.runAsync('DELETE FROM reminders WHERE id = ?', id);
}

export async function getMeta(key: string) {
  const db = await database();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string) {
  const db = await database();
  await db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', key, value);
}
