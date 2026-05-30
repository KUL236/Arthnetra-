'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/lib/supabase';
import '@/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, setUser } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme, mounted]);

  // Sync Supabase auth session → Zustand store
  useEffect(() => {
    // Hydrate from existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name,
        });
      } else {
        setUser(null);
      }
    });

    // Listen to auth state changes (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (!mounted) {
    return (
      <div className="dark" style={{ display: 'contents' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
