import type { JsonStats, JsonValue } from "./json";
import type { LucideIcon } from "lucide-react";

export type OutputTab = "tree" | "formatted" | "stats" | "types" | "schema" | "diff" | "errors";

export type ConverterTab =
  | "typescript"
  | "zod"
  | "csv"
  | "yaml"
  | "xml"
  | "schema"
  | "prisma"
  | "mongoose";

export type MobileSection = "input" | "tree" | "output" | "errors";

export interface SearchMatch {
  path: string;
  preview: string;
  value: JsonValue;
}

export interface SelectedNode {
  path: string;
  value: JsonValue;
}

export interface EditorInstance {
  revealPositionInCenter(position: { lineNumber: number; column: number }): void;
  setPosition(position: { lineNumber: number; column: number }): void;
  focus(): void;
  onDidChangeCursorPosition(
    listener: (event: { position: { lineNumber: number; column: number } }) => void,
  ): void;
}

export interface CommandAction {
  id: string;
  label: string;
  hint?: string;
}

export interface DiffSummary {
  added: string[];
  removed: string[];
  changed: string[];
  typeChanges: string[];
}

export type RoleModeId = "general" | "frontend" | "backend" | "qa" | "student";

export interface RoleMode {
  id: RoleModeId;
  label: string;
  icon: LucideIcon;
  description: string;
  tabs: OutputTab[];
  focus: string[];
}

export interface EditorStats extends JsonStats {
  lineCount: number;
  wordCount: number;
}
