import type { Reminder } from '@/features/reminders/types';

/**
 * Web preview only: the same API as repository.ts, backed by IndexedDB so reminders survive a reload.
 * The phone app stores them in SQLite.
 */

let connection: Promise<IDBDatabase> | undefined;

function database() {
  connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('himma-reminders', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('reminders', { keyPath: 'id' });
      request.result.createObjectStore('meta');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      connection = undefined;
      reject(request.error);
    };
  });
  return connection;
}

async function run<T>(store: 'reminders' | 'meta', mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest) {
  const db = await database();
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(store, mode).objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllReminders() {
  const reminders = await run<Reminder[]>('reminders', 'readonly', (store) => store.getAll());
  return reminders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getReminder(id: string) {
  return (await run<Reminder | undefined>('reminders', 'readonly', (store) => store.get(id))) ?? null;
}

export async function saveReminder(reminder: Reminder) {
  await run('reminders', 'readwrite', (store) => store.put(reminder));
}

export async function deleteReminder(id: string) {
  await run('reminders', 'readwrite', (store) => store.delete(id));
}

export async function getMeta(key: string) {
  return (await run<string | undefined>('meta', 'readonly', (store) => store.get(key))) ?? null;
}

export async function setMeta(key: string, value: string) {
  await run('meta', 'readwrite', (store) => store.put(value, key));
}
