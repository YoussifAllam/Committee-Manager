import Storage from 'expo-sqlite/kv-store';

// Signed-in user, kept across launches. A real session token should move to expo-secure-store with the backend.
const KEY = 'auth-session';

export const readSession = () => Storage.getItemAsync(KEY);
export const writeSession = (value: string) => Storage.setItemAsync(KEY, value);
export const clearSession = () => Storage.removeItemAsync(KEY).then(() => undefined);
