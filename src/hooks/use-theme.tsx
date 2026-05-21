"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "payloada-theme";
const THEME_EVENT = "payloada-theme-change";

interface ThemeContextType {
  theme: Theme;
  setTheme: (value: Theme | ((current: Theme) => Theme)) => void;
  toggle: () => void;
  isDark: boolean;
  monacoTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Theme;
      if (parsed === "dark" || parsed === "light") {
        return parsed;
      }
    }
  } catch {
    // Ignore invalid localStorage data.
  }

  return "dark";
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = () => onStoreChange();
  const handleThemeEvent = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_EVENT, handleThemeEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_EVENT, handleThemeEvent);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    readStoredTheme,
    () => "dark" as Theme,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {
      // Ignore write failures.
    }
  }, [theme]);

  const setTheme = useCallback((value: Theme | ((current: Theme) => Theme)) => {
    const current = readStoredTheme();
    const next = typeof value === "function" ? value(current) : value;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore write failures.
    }

    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      toggle,
      isDark: theme === "dark",
      monacoTheme: theme === "dark" ? "vs-dark" : "vs",
    }),
    [setTheme, theme, toggle],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
