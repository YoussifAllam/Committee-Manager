import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { clearSession, readSession, writeSession } from '@/features/auth/session-storage';
import { currentUser } from '@/mocks/data';

export type User = { name: string; email: string };

type AuthStore = {
  user: User | null;
  /** True until the saved session has been read once. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthStore | null>(null);

/**
 * Who is signed in. There's no backend yet, so any well-formed email and password sign in as the sample
 * member; the session is saved on the phone so the app opens signed in next time.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readSession()
      .then((saved) => setUser(saved ? JSON.parse(saved) : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const store: AuthStore = {
    user,
    loading,
    signIn: async (email) => {
      const signedIn = { name: currentUser.name, email: email.trim().toLowerCase() };
      await writeSession(JSON.stringify(signedIn));
      setUser(signedIn);
    },
    signOut: async () => {
      await clearSession();
      setUser(null);
    },
  };

  return <AuthContext value={store}>{children}</AuthContext>;
}

export function useAuth() {
  const store = useContext(AuthContext);
  if (!store) throw new Error('useAuth must be used inside AuthProvider');
  return store;
}
