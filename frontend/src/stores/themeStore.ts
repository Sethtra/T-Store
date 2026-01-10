import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        updateDocumentTheme(theme);
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        updateDocumentTheme(newTheme);
      },
    }),
    {
      name: 't-store-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDocumentTheme(state.theme);
        }
      },
    }
  )
);

function updateDocumentTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('t-store-theme');
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      updateDocumentTheme(parsed.state?.theme || 'dark');
    } catch {
      updateDocumentTheme('dark');
    }
  }
}
