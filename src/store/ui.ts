import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";
type LanguageMode = "english" | "tanglish";

interface UIStore {
  theme: Theme;
  languageMode: LanguageMode;
  setTheme: (theme: Theme) => void;
  setLanguageMode: (mode: LanguageMode) => void;
  // Bottom nav state
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "dark",
      languageMode: "english",
      setTheme: (theme) => set({ theme }),
      setLanguageMode: (languageMode) => set({ languageMode }),
      activeTab: "home",
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: "mira-ui-prefs",
      // Only persist UI prefs — no user data
      partialize: (state) => ({
        theme: state.theme,
        languageMode: state.languageMode,
      }),
    }
  )
);
