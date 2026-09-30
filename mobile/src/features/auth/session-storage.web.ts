// Web preview: the browser's own storage (expo-sqlite isn't set up for the web build).
const KEY = 'auth-session';

export const readSession = async () => localStorage.getItem(KEY);
export const writeSession = async (value: string) => localStorage.setItem(KEY, value);
export const clearSession = async () => localStorage.removeItem(KEY);
