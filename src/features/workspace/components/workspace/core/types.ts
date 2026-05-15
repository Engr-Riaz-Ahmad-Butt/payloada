"use client";

import type React from "react";

export type WorkspaceView = "editor" | "jwt" | "diff" | "converters" | "history";
export type InspectorView = "none" | "status" | "formatted" | "tree" | "search" | "graph";
export type ConverterTab =
  | "TypeScript"
  | "Zod"
  | "CSV"
  | "YAML"
  | "XML"
  | "Schema"
  | "Prisma"
  | "Mongoose";
export type RoleMode = "General" | "Frontend" | "Backend" | "QA" | "Student";

export type HistoryItem = {
  id: string;
  label: string;
  detail: string;
};

export type SearchMatch = {
  path: string;
  preview: string;
  value: JsonValue;
};

export type SelectedNode = {
  path: string;
  value: JsonValue;
};

export type DecodedJwtData = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  tokenParts: [string, string, string];
} | null;

export type GraphNodeData = {
  title: string;
  subtitle: string;
  tone: "root" | "container" | "leaf";
};

export type EditorInstance = {
  revealPositionInCenter(position: { lineNumber: number; column: number }): void;
  setPosition(position: { lineNumber: number; column: number }): void;
  focus(): void;
  onDidChangeCursorPosition(
    listener: (event: { position: { lineNumber: number; column: number } }) => void,
  ): void;
};

export type DiffPaneEditor = {
  getScrollTop(): number;
  setScrollTop(top: number): void;
  onDidScrollChange(listener: (event: { scrollTopChanged: boolean }) => void): { dispose(): void };
  deltaDecorations(
    oldDecorations: string[],
    newDecorations: Array<{
      range: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
      };
      options: {
        isWholeLine?: boolean;
        className?: string;
        linesDecorationsClassName?: string;
      };
    }>,
  ): string[];
};

export type DiffEditorHandle = {
  getOriginalEditor(): DiffPaneEditor;
  getModifiedEditor(): DiffPaneEditor;
};

export type RoleModeAction = {
  label: string;
  view: WorkspaceView;
  inspector?: InspectorView;
  converterTab?: ConverterTab;
};

export type RoleModeInfo = Record<
  RoleMode,
  {
    description: string;
    actions: RoleModeAction[];
  }
>;

export type NavItem = {
  id: WorkspaceView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
