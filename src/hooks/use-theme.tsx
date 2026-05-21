"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "jsonova-theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (value: Theme | ((current: Theme) => Theme)) => void;
  toggle: () => void;
  isDark: boolean;
  monacoTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always default to "dark" during hydration to perfectly match server render
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string) : null;
      if (parsed === "dark" || parsed === "light") {
        setThemeState(parsed);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {}
  }, [theme, mounted]);

  const toggle = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  const setTheme = (value: Theme | ((current: Theme) => Theme)) => {
    setThemeState((t) => (typeof value === "function" ? value(t) : value));
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggle,
    isDark: theme === "dark",
    monacoTheme: theme === "dark" ? "vs-dark" : "vs",
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
