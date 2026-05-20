import { Braces, FileDiff, FolderClock, LockKeyhole, WandSparkles, Cpu, Table2, Sparkles } from "lucide-react";

import type { ConverterTab, NavItem, RoleMode, RoleModeInfo } from "./types";

export const SAMPLE_JSON = `{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 10293,
        "username": "jdoe_99",
        "profile": {
          "age": "28",
          "email": "jdoe@example.com"
        }
      }
    ]
  }
}`;

export const SAMPLE_DIFF_OLD = `{
  "user": {
    "id": "42",
    "status": "pending",
    "oldEmail": "legacy@example.com"
  }
}`;

export const SAMPLE_DIFF_NEW = `{
  "user": {
    "id": 42,
    "status": "active",
    "email": "fresh@example.com"
  }
}`;

// Payload: {"sub":"1234567890","name":"JSONova Demo","role":"developer","iat":1516239022}
export const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpzb25vdmEgRGVtbyIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export const ROLE_MODES: RoleMode[] = ["General", "Frontend", "Backend", "QA", "Student"];

export const CONVERTER_TABS: ConverterTab[] = [
  "TypeScript",
  "Zod",
  "Go",
  "Python",
  "Rust",
  "C#",
  "Java",
  "CSV",
  "YAML",
  "XML",
  "Schema",
  "Prisma",
  "Mongoose",
];

export const ROLE_MODE_INFO: RoleModeInfo = {
  General: {
    description: "A balanced setup for formatting, validation, tree view, search, and downloads.",
    actions: [
      { label: "Validation status", view: "editor", inspector: "status" },
      { label: "Tree explorer", view: "editor", inspector: "tree" },
      { label: "Graph view", view: "editor", inspector: "graph" },
      { label: "Search results", view: "editor", inspector: "search" },
    ],
  },
  Frontend: {
    description:
      "Made for API responses, TypeScript, Zod, and frontend-friendly payload inspection.",
    actions: [
      { label: "TypeScript", view: "converters", converterTab: "TypeScript" },
      { label: "Zod", view: "converters", converterTab: "Zod" },
      { label: "Formatted JSON", view: "editor", inspector: "formatted" },
    ],
  },
  Backend: {
    description: "Made for contracts, schema generation, storage models, and integration output.",
    actions: [
      { label: "JSON Schema", view: "converters", converterTab: "Schema" },
      { label: "Prisma", view: "converters", converterTab: "Prisma" },
      { label: "Mongoose", view: "converters", converterTab: "Mongoose" },
      { label: "Graph view", view: "editor", inspector: "graph" },
    ],
  },
  QA: {
    description:
      "Made for expected-vs-actual comparisons, path lookup, and test-friendly inspection.",
    actions: [
      { label: "Diff tool", view: "diff" },
      { label: "JSONPath", view: "editor", inspector: "tree" },
      { label: "Search paths", view: "editor", inspector: "search" },
    ],
  },
  Student: {
    description: "Made for readable errors, examples, and guided exploration of JSON structure.",
    actions: [
      { label: "Validation status", view: "editor", inspector: "status" },
      { label: "Tree explorer", view: "editor", inspector: "tree" },
      { label: "Try sample", view: "editor", inspector: "formatted" },
    ],
  },
};

export const NAV_ITEMS: NavItem[] = [
  { id: "editor", label: "Editor", icon: Braces },
  { id: "jwt", label: "JWT Decoder", icon: LockKeyhole },
  { id: "ai", label: "AI", icon: Cpu },
  { id: "table", label: "Table View", icon: Table2 },
  { id: "mock", label: "Mock Generator", icon: Sparkles },
  { id: "diff", label: "JSON Diff", icon: FileDiff },
  { id: "converters", label: "Converters", icon: WandSparkles },
  { id: "history", label: "History", icon: FolderClock },
];
