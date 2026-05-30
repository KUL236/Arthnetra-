import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  theme: 'dark' | 'light';
  language: 'en' | 'hi';
  user: { id: string; email: string; name?: string } | null;
  toggleTheme: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setUser: (user: AppState['user']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      user: null,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (lang) => set({ language: lang }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'arthnetra-store',
      // Use noop storage during SSR to prevent localStorage access on server
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
