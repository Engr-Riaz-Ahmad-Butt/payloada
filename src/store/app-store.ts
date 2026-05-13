"use client";

import { create } from "zustand";

type ThemeMode = "system" | "light" | "dark";
type WorkspaceView = "editor" | "tree" | "tools";

type AppState = {
  theme: ThemeMode;
  activeView: WorkspaceView;
  setTheme: (theme: ThemeMode) => void;
  setActiveView: (view: WorkspaceView) => void;
};

export const useAppStore = create<AppState>((set) => ({
  theme: "system",
  activeView: "editor",
  setTheme: (theme) => set({ theme }),
  setActiveView: (activeView) => set({ activeView }),
}));
