import { PanelsTopLeft, Code2, Server, Bug, GraduationCap } from "lucide-react";
import { RoleMode, OutputTab, MobileSection, ConverterTab } from "@/types/workspace";

export const SAMPLE_USER_JSON = `{
  "users": [
    {
      "id": 1,
      "name": "Aisha Khan",
      "email": "aisha@jsonlens.dev",
      "profile": {
        "email": "aisha@jsonlens.dev",
        "age": "29",
        "role": "editor",
        "isAdmin": false
      }
    },
    {
      "id": 2,
      "name": "Bilal Ahmed",
      "email": "bilal@jsonlens.dev",
      "profile": {
        "email": "bilal@jsonlens.dev",
        "age": 34,
        "role": "owner",
        "isAdmin": true
      }
    }
  ],
  "meta": {
    "count": 2,
    "status": "ok",
    "access_token": "sk_live_123456",
    "generatedAt": "2026-05-14T08:00:00Z"
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

export const ROLE_MODES: RoleMode[] = [
  {
    id: "general",
    label: "General",
    icon: PanelsTopLeft,
    description:
      "Balanced everyday workspace for formatting, validating, tree exploration, and export.",
    tabs: ["tree", "formatted", "stats", "errors"] as OutputTab[],
    focus: ["Format", "Validate", "Tree", "Search", "Download"],
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: Code2,
    description: "Optimized for TypeScript, Zod, React data fetching, and API response wiring.",
    tabs: ["tree", "types", "schema", "formatted"] as OutputTab[],
    focus: ["TypeScript", "Zod", "Axios", "React Query"],
  },
  {
    id: "backend",
    label: "Backend",
    icon: Server,
    description: "Prioritizes schema generation, database modeling, and contract design.",
    tabs: ["tree", "schema", "stats", "formatted"] as OutputTab[],
    focus: ["JSON Schema", "Mongoose", "Prisma", "OpenAPI"],
  },
  {
    id: "qa",
    label: "QA",
    icon: Bug,
    description:
      "Brings expected-vs-actual comparison, diff summaries, and path-based inspection forward.",
    tabs: ["tree", "diff", "errors", "stats"] as OutputTab[],
    focus: ["Diff", "Expected vs actual", "JSONPath", "Test summary"],
  },
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    description: "Keeps the UI calmer and adds friendlier explanations, examples, and JSON rules.",
    tabs: ["tree", "errors", "formatted", "stats"] as OutputTab[],
    focus: ["Friendly errors", "Examples", "JSON rules", "Simple explanations"],
  },
];

export const CONVERTER_TABS: ConverterTab[] = [
  "typescript",
  "zod",
  "csv",
  "yaml",
  "xml",
  "schema",
  "prisma",
  "mongoose",
];

export const MOBILE_SECTIONS: MobileSection[] = ["input", "tree", "output", "errors"];
