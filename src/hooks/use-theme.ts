"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "jsonova-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string) : null;
    if (parsed === "dark" || parsed === "light") return parsed;
  } catch {}
  return "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {}
  }, [theme]);

  const toggle = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  const setTheme = (value: Theme | ((current: Theme) => Theme)) =>
    setThemeState((t) => (typeof value === "function" ? value(t) : value));

  return {
    theme,
    setTheme,
    toggle,
    isDark: theme === "dark",
    monacoTheme: theme === "dark" ? "vs-dark" : "vs",
  };
}
