"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import { stringify as toYaml } from "yaml";
import { XMLBuilder } from "fast-xml-parser";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import {
  Bell,
  Braces,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Copy,
  Download,
  Eye,
  FileDiff,
  FileJson2,
  FolderClock,
  HelpCircle,
  Info,
  Link2,
  List,
  LockKeyhole,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Upload,
  WandSparkles,
  XCircle,
} from "lucide-react";

import { parseJsonSafe, getJsonStats } from "@/lib/json";
import { cn } from "@/lib/utils";
import type { JsonStats, JsonValue } from "@/types/json";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});
const MonacoDiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  {
    ssr: false,
  },
);

const SAMPLE_JSON = `{
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

const SAMPLE_DIFF_OLD = `{
  "user": {
    "id": "42",
    "status": "pending",
    "oldEmail": "legacy@example.com"
  }
}`;

const SAMPLE_DIFF_NEW = `{
  "user": {
    "id": 42,
    "status": "active",
    "email": "fresh@example.com"
  }
}`;

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpTT05MZW5zIERlbW8iLCJyb2xlIjoiZGV2ZWxvcGVyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const ROLE_MODES = ["General", "Frontend", "Backend", "QA", "Student"] as const;
const CONVERTER_TABS = [
  "TypeScript",
  "Zod",
  "CSV",
  "YAML",
  "XML",
  "Schema",
  "Prisma",
  "Mongoose",
] as const;

const ROLE_MODE_INFO: Record<
  RoleMode,
  {
    description: string;
    actions: Array<{
      label: string;
      view: WorkspaceView;
      inspector?: InspectorView;
      converterTab?: ConverterTab;
    }>;
  }
> = {
  General: {
    description: "Balanced workspace for formatting, validation, tree view, search, and downloads.",
    actions: [
      { label: "Validation status", view: "editor", inspector: "status" },
      { label: "Tree explorer", view: "editor", inspector: "tree" },
      { label: "Search results", view: "editor", inspector: "search" },
    ],
  },
  Frontend: {
    description:
      "Focus on API responses, TypeScript, Zod, and frontend-friendly payload inspection.",
    actions: [
      { label: "TypeScript", view: "converters", converterTab: "TypeScript" },
      { label: "Zod", view: "converters", converterTab: "Zod" },
      { label: "Formatted JSON", view: "editor", inspector: "formatted" },
    ],
  },
  Backend: {
    description: "Focus on contracts, schema generation, storage models, and integration output.",
    actions: [
      { label: "JSON Schema", view: "converters", converterTab: "Schema" },
      { label: "Prisma", view: "converters", converterTab: "Prisma" },
      { label: "Mongoose", view: "converters", converterTab: "Mongoose" },
    ],
  },
  QA: {
    description:
      "Focus on expected vs actual comparisons, path lookup, and test-friendly inspection.",
    actions: [
      { label: "Diff tool", view: "diff" },
      { label: "JSONPath", view: "editor", inspector: "tree" },
      { label: "Search paths", view: "editor", inspector: "search" },
    ],
  },
  Student: {
    description: "Focus on readable errors, examples, and guided exploration of JSON structure.",
    actions: [
      { label: "Validation status", view: "editor", inspector: "status" },
      { label: "Tree explorer", view: "editor", inspector: "tree" },
      { label: "Try sample", view: "editor", inspector: "formatted" },
    ],
  },
};

type WorkspaceView = "editor" | "jwt" | "diff" | "converters" | "history";
type InspectorView = "status" | "formatted" | "tree" | "search";
type ConverterTab = (typeof CONVERTER_TABS)[number];
type RoleMode = (typeof ROLE_MODES)[number];
type HistoryItem = {
  id: string;
  label: string;
  detail: string;
};
type SearchMatch = {
  path: string;
  preview: string;
  value: JsonValue;
};
type SelectedNode = {
  path: string;
  value: JsonValue;
};
type DecodedJwtData = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  tokenParts: [string, string, string];
} | null;
type EditorInstance = {
  revealPositionInCenter(position: { lineNumber: number; column: number }): void;
  setPosition(position: { lineNumber: number; column: number }): void;
  focus(): void;
  onDidChangeCursorPosition(
    listener: (event: { position: { lineNumber: number; column: number } }) => void,
  ): void;
};
type DiffPaneEditor = {
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
type DiffEditorHandle = {
  getOriginalEditor(): DiffPaneEditor;
  getModifiedEditor(): DiffPaneEditor;
};

const navItems: Array<{
  id: WorkspaceView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "editor", label: "Editor", icon: Braces },
  { id: "jwt", label: "JWT Decoder", icon: LockKeyhole },
  { id: "diff", label: "JSON Diff", icon: FileDiff },
  { id: "converters", label: "Converters", icon: WandSparkles },
  { id: "history", label: "History", icon: FolderClock },
];

export function LiveJsonWorkspace() {
  const editorRef = useRef<EditorInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("editor");
  const [previousWorkspaceView, setPreviousWorkspaceView] = useState<WorkspaceView>("editor");
  const [roleMode, setRoleMode] = useState<RoleMode>("General");
  const [inspectorView, setInspectorView] = useState<InspectorView>("status");
  const [source, setSource] = useState(SAMPLE_JSON);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [linePosition, setLinePosition] = useState({ line: 1, column: 1 });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: "1", label: "Workspace opened", detail: "General mode • Editor" },
    { id: "2", label: "Sample JSON loaded", detail: "input.json" },
  ]);
  const [diffOld, setDiffOld] = useState(SAMPLE_DIFF_OLD);
  const [diffNew, setDiffNew] = useState(SAMPLE_DIFF_NEW);
  const [converterTab, setConverterTab] = useState<ConverterTab>("TypeScript");
  const [jwtInput, setJwtInput] = useState(SAMPLE_JWT);

  const parseResult = useMemo(() => {
    if (!source.trim()) {
      return null;
    }

    return parseJsonSafe(source);
  }, [source]);

  const parsedValue = parseResult?.valid ? parseResult.data : null;
  const stats = useMemo(
    () => (parsedValue ? getJsonStats(parsedValue, source) : emptyStats(source)),
    [parsedValue, source],
  );
  const formattedOutput = useMemo(
    () => (parsedValue ? JSON.stringify(parsedValue, null, 2) : ""),
    [parsedValue],
  );
  const searchMatches = useMemo(
    () => (parsedValue && searchTerm.trim() ? findSearchMatches(parsedValue, searchTerm) : []),
    [parsedValue, searchTerm],
  );
  const selectedNode = useMemo(() => {
    if (!parsedValue) {
      return null;
    }

    if (selectedPath) {
      const value = getValueAtPath(parsedValue, selectedPath);
      if (value !== undefined) {
        return { path: selectedPath, value };
      }
    }

    return getFirstSelectableNode(parsedValue);
  }, [parsedValue, selectedPath]);
  const intelligentIssues = useMemo(() => buildIntelligentIssues(parsedValue), [parsedValue]);
  const converterOutput = useMemo(
    () => getConverterOutput(converterTab, parsedValue),
    [converterTab, parsedValue],
  );
  const diffSummary = useMemo(() => buildDiffSummary(diffOld, diffNew), [diffOld, diffNew]);
  const decodedJwt = useMemo<DecodedJwtData>(() => {
    try {
      const trimmed = jwtInput.trim();
      if (!trimmed) {
        return null;
      }

      const parts = trimmed.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const header = jwtDecode<Record<string, unknown>>(trimmed, { header: true });
      const payload = jwtDecode<Record<string, unknown>>(trimmed);

      return {
        header,
        payload,
        signature: parts[2],
        tokenParts: [parts[0], parts[1], parts[2]],
      };
    } catch {
      return null;
    }
  }, [jwtInput]);
  const commandItems = useMemo(
    () =>
      [
        { id: "format", label: "Format JSON", hint: "Beautify current editor" },
        { id: "minify", label: "Minify JSON", hint: "Compress current editor" },
        { id: "repair", label: "Repair JSON", hint: "Remove common syntax issues" },
        { id: "upload", label: "Upload File", hint: "Import a .json file" },
        { id: "convert", label: "Open Converters", hint: "Switch to converter workspace" },
        { id: "diff", label: "Open Diff Tool", hint: "Compare old and new payloads" },
        { id: "jwt", label: "Open JWT Decoder", hint: "Decode token payload" },
        { id: "search", label: "Search JSONPath", hint: "Open search inspector" },
        { id: "mask", label: "Mask Sensitive Fields", hint: "Replace secrets with [masked]" },
        { id: "download", label: "Download JSON", hint: "Save current output" },
      ] as const,
    [],
  );
  const filteredCommands = useMemo(() => {
    if (!commandQuery.trim()) {
      return commandItems;
    }

    const query = commandQuery.toLowerCase();
    return commandItems.filter(
      (item) => item.label.toLowerCase().includes(query) || item.hint.toLowerCase().includes(query),
    );
  }, [commandItems, commandQuery]);

  const roleModeInfo = ROLE_MODE_INFO[roleMode];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandIndex(0);
        setCommandQuery("");
        setShowCommandPalette(true);
        return;
      }

      if (!showCommandPalette) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setShowCommandPalette(false);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCommandPalette]);

  useEffect(() => {
    if (showCommandPalette) {
      window.setTimeout(() => commandInputRef.current?.focus(), 30);
    }
  }, [showCommandPalette]);

  const addHistory = (label: string, detail: string) => {
    setHistoryItems((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        label,
        detail,
      },
      ...current,
    ]);
  };

  const openWorkspace = (view: WorkspaceView) => {
    if (view === "converters") {
      setPreviousWorkspaceView(
        workspaceView === "converters" ? previousWorkspaceView : workspaceView,
      );
    }

    setWorkspaceView(view);
  };

  const openConverterWorkspace = (tab?: ConverterTab) => {
    if (tab) {
      setConverterTab(tab);
    }

    setPreviousWorkspaceView(
      workspaceView === "converters" ? previousWorkspaceView : workspaceView,
    );
    setWorkspaceView("converters");
  };

  const handleRoleAction = (action: {
    label: string;
    view: WorkspaceView;
    inspector?: InspectorView;
    converterTab?: ConverterTab;
  }) => {
    if (action.converterTab) {
      openConverterWorkspace(action.converterTab);
      return;
    }

    if (action.inspector) {
      setInspectorView(action.inspector);
    }

    openWorkspace(action.view);
  };

  const handleCopy = async (value: string, message = "Copied") => {
    if (!value) {
      toast.error("Nothing to copy yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(message);
      addHistory("Copied content", message);
    } catch {
      toast.error("Clipboard permission is blocked");
    }
  };

  const handleDownload = (content: string, filename: string) => {
    if (!content) {
      toast.error("There is no content to download yet");
      return;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded output");
    addHistory("Downloaded file", filename);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error("Clipboard is empty");
        return;
      }

      setSource(text);
      toast.success("Pasted from clipboard");
      addHistory("Pasted clipboard", "Editor input updated");
    } catch {
      toast.error("Clipboard permission is blocked");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setSource(text);
    event.target.value = "";
    toast.success("File uploaded");
    addHistory("Uploaded file", file.name);
  };

  const handleFormat = () => {
    if (!parsedValue) {
      toast.error("Cannot format invalid JSON");
      return;
    }

    setSource(JSON.stringify(parsedValue, null, 2));
    toast.success("Formatted successfully");
    addHistory("Formatted JSON", roleMode);
  };

  const handleMinify = () => {
    if (!parsedValue) {
      toast.error("Cannot minify invalid JSON");
      return;
    }

    setSource(JSON.stringify(parsedValue));
    toast.success("Minified successfully");
    addHistory("Minified JSON", roleMode);
  };

  const handleRepair = () => {
    if (parseResult?.valid) {
      toast.success("JSON is already valid");
      return;
    }

    setSource(repairJsonInput(source));
    toast.success("Applied safe repair pass");
    addHistory("Repaired JSON", "Trailing commas removed");
  };

  const handleMaskSensitive = () => {
    if (!parsedValue) {
      toast.error("Add valid JSON first");
      return;
    }

    setSource(JSON.stringify(maskSensitiveValues(parsedValue), null, 2));
    toast.success("Sensitive fields masked");
    addHistory("Masked sensitive values", "Secrets replaced");
  };

  const handleLoadUrl = async () => {
    if (!urlValue.trim()) {
      toast.error("Enter a JSON URL first");
      return;
    }

    try {
      const response = await fetch(urlValue);
      const json = await response.json();
      setSource(JSON.stringify(json, null, 2));
      setShowUrlInput(false);
      toast.success("Fetched JSON");
      addHistory("Loaded URL", urlValue);
    } catch {
      toast.error("Unable to fetch JSON from that URL");
    }
  };

  const handleRunCommand = async (commandId: string) => {
    setShowCommandPalette(false);
    setCommandQuery("");

    switch (commandId) {
      case "format":
        handleFormat();
        break;
      case "minify":
        handleMinify();
        break;
      case "repair":
        handleRepair();
        break;
      case "upload":
        fileInputRef.current?.click();
        break;
      case "convert":
        openConverterWorkspace();
        break;
      case "diff":
        openWorkspace("diff");
        break;
      case "jwt":
        openWorkspace("jwt");
        break;
      case "search":
        openWorkspace("editor");
        setInspectorView("search");
        break;
      case "mask":
        handleMaskSensitive();
        break;
      case "download":
        handleDownload(
          workspaceView === "converters" ? converterOutput : formattedOutput || source,
          "jsonlines-output.txt",
        );
        break;
      default:
        break;
    }
  };

  return (
    <section className="overflow-hidden border border-[#262626] bg-[#080808] text-[#f5f1ea] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="grid min-h-[920px] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex min-h-full flex-col border-r border-[#262626] bg-[#121212] px-5 py-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#1f1f1f]">
              <Braces className="size-5 text-[#c07040]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-[#d3884e]">jsonLines</h2>
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#d6c3b5]">
                Pro Workspace
              </p>
            </div>
          </div>

          <button className="mb-7 rounded-sm bg-[#c77742] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90">
            + New Document
          </button>

          <nav className="flex-1 space-y-1.5">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = workspaceView === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => openWorkspace(id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-sm px-4 py-3 text-left transition-colors",
                    active
                      ? "border-r-2 border-[#c07040] bg-[#2a2a2a] text-[#d69463]"
                      : "text-[#d6c3b5] hover:bg-[#1c1b1b] hover:text-[#f5f1ea]",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-[15px] font-medium">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 space-y-1.5 border-t border-[#262626] pt-6">
            {[
              { label: "Settings", icon: Settings },
              { label: "Support", icon: HelpCircle },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center gap-4 rounded-sm px-4 py-3 text-left text-[#d6c3b5] transition-colors hover:bg-[#1c1b1b] hover:text-[#f5f1ea]"
              >
                <Icon className="size-5" />
                <span className="text-[15px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-[#262626] bg-[#080808] px-5 sm:px-6 lg:px-10">
            <div className="flex min-w-[320px] items-center gap-4">
              <Search className="size-5 text-[#d6c3b5]" />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  if (workspaceView === "editor") {
                    setInspectorView("search");
                  }
                }}
                onFocus={() => {
                  if (workspaceView === "editor") {
                    setInspectorView("search");
                  }
                }}
                placeholder="Search files, actions, or data..."
                className="w-full bg-transparent text-[15px] text-[#f5f1ea] outline-none placeholder:text-[#5b5450]"
              />
            </div>

            <nav className="hidden items-center gap-10 text-[15px] font-semibold text-[#d6c3b5] lg:flex">
              {["Workspace", "Tools", "API", "Docs"].map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={cn(
                    "border-b-2 pb-1 transition-colors",
                    index === 0
                      ? "border-[#c07040] text-[#d69463]"
                      : "border-transparent hover:text-[#f5f1ea]",
                  )}
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <button className="rounded-sm border border-[#333] px-4 py-2 text-sm font-semibold text-[#d6c3b5]">
                Share
              </button>
              <button className="rounded-sm bg-[#c77742] px-6 py-2 text-sm font-semibold text-black">
                Deploy
              </button>
              <div className="hidden h-5 w-px bg-[#2c2c2c] lg:block" />
              <Bell className="hidden size-5 text-[#d6c3b5] lg:block" />
              <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#2c2c2c] bg-[#101010] text-xs font-bold text-[#d69463] lg:flex">
                JL
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col bg-[#131313]">
            <div className="border-b border-[#262626] px-5 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-6 text-[15px] font-semibold">
                  {ROLE_MODES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRoleMode(item)}
                      className={cn(
                        "border-b pb-1 transition-colors",
                        roleMode === item
                          ? "border-[#c07040] text-[#d69463]"
                          : "border-transparent text-[#d6c3b5] hover:text-[#f5f1ea]",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 rounded-sm border border-[#2b2b2b] bg-[#0f0f0f] p-1">
                  <IconButton
                    active={inspectorView === "formatted"}
                    icon={<List className="size-4" />}
                    onClick={() => setInspectorView("formatted")}
                    title="Formatted view"
                  />
                  <IconButton
                    active={inspectorView === "status"}
                    icon={<CheckCircle2 className="size-4" />}
                    onClick={() => setInspectorView("status")}
                    title="Validation status"
                  />
                  <IconButton
                    active={inspectorView === "tree"}
                    icon={<Braces className="size-4" />}
                    onClick={() => setInspectorView("tree")}
                    title="Tree explorer"
                  />
                  <div className="mx-1 h-4 w-px bg-[#2f2f2f]" />
                  <IconButton
                    active={inspectorView === "search"}
                    icon={<Search className="size-4" />}
                    onClick={() => setInspectorView("search")}
                    title="Search inspector"
                  />
                  <IconButton
                    active={false}
                    icon={<Download className="size-4" />}
                    onClick={() =>
                      handleDownload(
                        workspaceView === "converters"
                          ? converterOutput
                          : formattedOutput || source,
                        "jsonlines-output.txt",
                      )
                    }
                    title="Download"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#262626] bg-[#101010] px-4 py-3">
                <div>
                  <p className="text-[12px] font-semibold text-[#f5f1ea]">{roleMode} mode</p>
                  <p className="mt-1 text-[13px] leading-6 text-[#a89589]">
                    {roleModeInfo.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleModeInfo.actions.map((action) => (
                    <button
                      key={`${roleMode}-${action.label}`}
                      type="button"
                      onClick={() => handleRoleAction(action)}
                      className="rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#c07040]"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 overflow-x-auto border-b border-[#262626] bg-[#080808] px-5 py-3">
              <div className="flex shrink-0 gap-3">
                <ToolbarButton
                  icon={<ClipboardPaste className="size-4" />}
                  label="Paste"
                  onClick={handlePaste}
                />
                <ToolbarButton
                  icon={<Upload className="size-4" />}
                  label="Upload File"
                  onClick={() => fileInputRef.current?.click()}
                />
                <ToolbarButton
                  icon={<Link2 className="size-4" />}
                  label="Load URL"
                  onClick={() => setShowUrlInput((value) => !value)}
                />
                <ToolbarButton
                  icon={<Sparkles className="size-4" />}
                  label="Try Sample"
                  onClick={() => {
                    setSource(SAMPLE_JSON);
                    toast.success("Sample JSON loaded");
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>

              <div className="flex shrink-0 items-center gap-3 text-[14px] font-semibold">
                <span className="text-[#4f4743]">TRANSFORM:</span>
                <button
                  className="text-[#d69463] transition-colors hover:text-[#f5f1ea]"
                  onClick={handleFormat}
                >
                  Format
                </button>
                <span className="text-[#363636]">•</span>
                <button
                  className="text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
                  onClick={handleMinify}
                >
                  Minify
                </button>
                <span className="text-[#363636]">•</span>
                <button
                  className="text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
                  onClick={handleRepair}
                >
                  Repair
                </button>
                <span className="text-[#363636]">•</span>
                <button
                  className="inline-flex items-center gap-1 text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
                  onClick={() => openConverterWorkspace()}
                >
                  Convert to
                  <ChevronDown className="size-4" />
                </button>
                <span className="text-[#363636]">•</span>
                <button
                  className="text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
                  onClick={() => {
                    openWorkspace("editor");
                    setInspectorView("tree");
                  }}
                >
                  JSONPath
                </button>
              </div>
            </div>

            {showUrlInput ? (
              <div className="flex items-center gap-3 border-b border-[#262626] bg-[#111111] px-5 py-3">
                <input
                  value={urlValue}
                  onChange={(event) => setUrlValue(event.target.value)}
                  placeholder="https://api.example.com/users"
                  className="h-10 flex-1 rounded-sm border border-[#2a2a2a] bg-[#080808] px-3 text-sm text-[#f5f1ea] outline-none placeholder:text-[#5f5a56]"
                />
                <button
                  className="rounded-sm bg-[#c77742] px-4 py-2 text-sm font-semibold text-black"
                  onClick={handleLoadUrl}
                >
                  Fetch JSON
                </button>
              </div>
            ) : null}

            <div className="min-h-0 flex-1">
              {workspaceView === "editor" ? (
                <EditorWorkspace
                  source={source}
                  setSource={setSource}
                  parseResult={parseResult}
                  formattedOutput={formattedOutput}
                  stats={stats}
                  inspectorView={inspectorView}
                  setInspectorView={setInspectorView}
                  intelligentIssues={intelligentIssues}
                  searchTerm={searchTerm}
                  searchMatches={searchMatches}
                  selectedNode={selectedNode}
                  setSelectedPath={setSelectedPath}
                  onCopy={handleCopy}
                  editorRef={editorRef}
                  linePosition={linePosition}
                  setLinePosition={setLinePosition}
                  onClear={() => {
                    setSource("");
                    toast.success("Editor cleared");
                    addHistory("Cleared editor", "input.json");
                  }}
                />
              ) : null}

              {workspaceView === "converters" ? (
                <ConverterWorkspace
                  converterTab={converterTab}
                  setConverterTab={setConverterTab}
                  output={converterOutput}
                  parsedValue={parsedValue}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  source={source}
                  setSource={setSource}
                  onBack={() => openWorkspace(previousWorkspaceView)}
                  onClose={() => openWorkspace(previousWorkspaceView)}
                />
              ) : null}

              {workspaceView === "diff" ? (
                <DiffWorkspace
                  diffNew={diffNew}
                  diffOld={diffOld}
                  setDiffNew={setDiffNew}
                  setDiffOld={setDiffOld}
                  summary={diffSummary}
                />
              ) : null}

              {workspaceView === "jwt" ? (
                <JwtWorkspace
                  jwtInput={jwtInput}
                  setJwtInput={setJwtInput}
                  decodedJwt={decodedJwt}
                  onCopy={handleCopy}
                />
              ) : null}

              {workspaceView === "history" ? <HistoryWorkspace items={historyItems} /> : null}
            </div>
          </div>
        </div>
      </div>

      {showCommandPalette ? (
        <CommandPalette
          items={filteredCommands}
          activeIndex={commandIndex}
          query={commandQuery}
          inputRef={commandInputRef}
          onClose={() => setShowCommandPalette(false)}
          onMoveDown={() =>
            setCommandIndex((current) =>
              Math.min(current + 1, Math.max(filteredCommands.length - 1, 0)),
            )
          }
          onMoveUp={() => setCommandIndex((current) => Math.max(current - 1, 0))}
          onQueryChange={setCommandQuery}
          onRun={() => handleRunCommand(filteredCommands[commandIndex]?.id ?? "")}
          onSelect={(id) => handleRunCommand(id)}
        />
      ) : null}
    </section>
  );
}

function EditorWorkspace({
  source,
  setSource,
  parseResult,
  formattedOutput,
  stats,
  inspectorView,
  setInspectorView,
  intelligentIssues,
  searchTerm,
  searchMatches,
  selectedNode,
  setSelectedPath,
  onCopy,
  editorRef,
  linePosition,
  setLinePosition,
  onClear,
}: {
  source: string;
  setSource: React.Dispatch<React.SetStateAction<string>>;
  parseResult: ReturnType<typeof parseJsonSafe> | null;
  formattedOutput: string;
  stats: JsonStats;
  inspectorView: InspectorView;
  setInspectorView: React.Dispatch<React.SetStateAction<InspectorView>>;
  intelligentIssues: ReturnType<typeof buildIntelligentIssues>;
  searchTerm: string;
  searchMatches: SearchMatch[];
  selectedNode: SelectedNode | null;
  setSelectedPath: React.Dispatch<React.SetStateAction<string | null>>;
  onCopy: (value: string, message?: string) => Promise<void>;
  editorRef: React.MutableRefObject<EditorInstance | null>;
  linePosition: { line: number; column: number };
  setLinePosition: React.Dispatch<React.SetStateAction<{ line: number; column: number }>>;
  onClear: () => void;
}) {
  return (
    <div className="grid h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-h-0 flex-col border-r border-[#262626]">
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#171717] px-5 py-3">
          <span className="font-mono text-sm text-[#d6c3b5]">input.json</span>
          <div className="flex items-center gap-2 text-[#d6c3b5]">
            <button type="button" onClick={() => onCopy(source, "Copied editor content")}>
              <Copy className="size-4" />
            </button>
            <button type="button" onClick={onClear}>
              <XCircle className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#050505]">
          {!source.trim() ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050505]/90 p-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#1d1d1d]">
                  <FileJson2 className="size-5 text-[#d69463]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f5f1ea]">Paste your JSON here</h3>
                  <p className="mt-2 text-sm text-[#a89589]">
                    You can also upload a file, load a URL, or try a sample.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <MonacoEditor
            height="100%"
            language="json"
            theme="vs-dark"
            value={source}
            onChange={(value) => setSource(value ?? "")}
            onMount={(instance) => {
              editorRef.current = instance as EditorInstance;
              instance.onDidChangeCursorPosition(
                (event: { position: { lineNumber: number; column: number } }) => {
                  setLinePosition({
                    line: event.position.lineNumber,
                    column: event.position.column,
                  });
                },
              );
            }}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 22, bottom: 22 },
              fontSize: 15,
              lineHeight: 28,
              tabSize: 2,
              fontFamily: "var(--font-geist-mono)",
            }}
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#262626] bg-[#111111] px-5 py-3 text-xs text-[#7b7068]">
          <div className="flex items-center gap-5">
            <span>UTF-8</span>
            <span>JSON</span>
            <span>2 spaces</span>
          </div>
          <span>
            Line {linePosition.line}, Column {linePosition.column}
          </span>
        </div>

        {selectedNode ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#262626] bg-[#171717] px-5 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7b7068]">Selected</p>
              <p className="mt-1 font-mono text-sm text-[#f5f1ea]">{selectedNode.path}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SmallAction
                label="Copy Path"
                onClick={() => onCopy(selectedNode.path, "Copied JSONPath")}
              />
              <SmallAction
                label="Copy Value"
                onClick={() => onCopy(renderJsonValue(selectedNode.value), "Copied selected value")}
              />
              <SmallAction
                label="Copy Object"
                onClick={() =>
                  onCopy(JSON.stringify(selectedNode.value, null, 2), "Copied selected object")
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      <aside className="flex min-h-0 flex-col overflow-y-auto bg-[#121212]">
        {inspectorView === "status" ? (
          <>
            <SidebarSection title="Status">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-sm border px-4 py-4",
                  parseResult?.valid
                    ? "border-[#32593a] bg-[#0e130f] text-[#8ed08e]"
                    : "border-[#6b1e1e] bg-[#210b0b] text-[#e68f8f]",
                )}
              >
                {parseResult?.valid ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <XCircle className="size-5" />
                )}
                <span className="text-[15px] font-semibold">
                  {parseResult?.valid ? "Valid JSON" : "Invalid JSON"}
                </span>
              </div>
            </SidebarSection>

            <SidebarSection title="Intelligent Issues">
              <div className="space-y-3">
                {intelligentIssues.sensitive ? (
                  <IssueCard
                    tone="error"
                    icon={<ShieldAlert className="size-4" />}
                    title="Sensitive fields detected"
                    body={intelligentIssues.sensitive.path}
                  />
                ) : null}
                {intelligentIssues.warning ? (
                  <IssueCard
                    tone="warning"
                    icon={<Info className="size-4" />}
                    title="Type mismatch suggestion"
                    body={intelligentIssues.warning}
                  />
                ) : null}
                {!intelligentIssues.sensitive && !intelligentIssues.warning ? (
                  <IssueCard
                    tone="success"
                    icon={<CheckCircle2 className="size-4" />}
                    title="No blocking issues"
                    body="This payload is clean enough to keep exploring."
                  />
                ) : null}
              </div>
            </SidebarSection>

            <SidebarSection title="Document Stats">
              <StatsGrid stats={stats} />
            </SidebarSection>
          </>
        ) : null}

        {inspectorView === "formatted" ? (
          <SidebarSection title="Formatted Output">
            {formattedOutput ? (
              <CodePreview value={formattedOutput} />
            ) : (
              <SidebarEmpty text="Formatted output appears here when JSON is valid." />
            )}
          </SidebarSection>
        ) : null}

        {inspectorView === "tree" ? (
          <SidebarSection title="Tree Explorer">
            {parseResult?.valid ? (
              <div className="space-y-2">
                <p className="text-sm text-[#a89589]">
                  Click any node to reveal its JSONPath and copy its value.
                </p>
                <div className="overflow-x-auto rounded-sm border border-[#262626] bg-[#0a0a0a] p-3">
                  <div className="min-w-max">
                    <TreeNode
                      label="root"
                      path="$"
                      value={parseResult.data}
                      selectedPath={selectedNode?.path ?? null}
                      onSelect={setSelectedPath}
                      onCopy={onCopy}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <SidebarEmpty text="Valid JSON will appear as an interactive tree here." />
            )}
          </SidebarSection>
        ) : null}

        {inspectorView === "search" ? (
          <SidebarSection title="Search Results">
            {searchTerm.trim() ? (
              searchMatches.length ? (
                <div className="space-y-2">
                  <p className="text-sm text-[#a89589]">{searchMatches.length} matches found</p>
                  {searchMatches.slice(0, 8).map((match) => (
                    <button
                      key={match.path}
                      type="button"
                      onClick={() => {
                        setInspectorView("tree");
                        setSelectedPath(match.path);
                      }}
                      className="w-full rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-3 text-left transition-colors hover:border-[#c07040]"
                    >
                      <p className="font-mono text-xs text-[#f5f1ea]">{match.path}</p>
                      <p className="mt-1 text-xs text-[#a89589]">{match.preview}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <SidebarEmpty text="No matches found for the current search." />
              )
            ) : (
              <SidebarEmpty text="Search key, value, or path from the top bar." />
            )}
          </SidebarSection>
        ) : null}
      </aside>
    </div>
  );
}

function ConverterWorkspace({
  converterTab,
  setConverterTab,
  output,
  parsedValue,
  onCopy,
  onDownload,
  source,
  setSource,
  onBack,
  onClose,
}: {
  converterTab: ConverterTab;
  setConverterTab: React.Dispatch<React.SetStateAction<ConverterTab>>;
  output: string;
  parsedValue: JsonValue | null;
  onCopy: (value: string, message?: string) => Promise<void>;
  onDownload: (content: string, filename: string) => void;
  source: string;
  setSource: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="grid h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
      <div className="flex min-h-0 flex-col border-r border-[#262626]">
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#171717] px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-[#f5f1ea]">Converter workspace</p>
            <p className="mt-1 text-xs text-[#a89589]">
              Input JSON on the left, generated output on the right.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SmallAction label="Back" onClick={onBack} />
            <SmallAction label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-[#050505]">
          <MonacoEditor
            height="100%"
            language="json"
            theme="vs-dark"
            value={source}
            onChange={(value) => setSource(value ?? "")}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 22, bottom: 22 },
              fontSize: 15,
              lineHeight: 28,
              tabSize: 2,
              fontFamily: "var(--font-geist-mono)",
            }}
          />
        </div>
      </div>

      <aside className="flex min-h-0 flex-col bg-[#121212]">
        <div className="border-b border-[#262626] px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#d6c3b5]">Output</p>
            <span className="text-xs text-[#7b7068]">Choose a target format</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CONVERTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setConverterTab(tab)}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors",
                  converterTab === tab
                    ? "border-[#c07040] bg-[#2a1c13] text-[#d69463]"
                    : "border-[#2a2a2a] bg-[#0a0a0a] text-[#d6c3b5]",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[#262626] px-5 py-3">
          <SmallAction
            label="Copy"
            onClick={() => onCopy(output, `Copied ${converterTab} output`)}
          />
          <SmallAction
            label="Download"
            onClick={() => onDownload(output, `jsonlines-${converterTab}.txt`)}
          />
          <SmallAction label="Regenerate" onClick={() => toast.success("Regenerated output")} />
          <SmallAction
            label="Format Output"
            onClick={() => toast.success("Output is already formatted")}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {parsedValue ? (
            output ? (
              <CodePreview value={output} />
            ) : (
              <SidebarEmpty text={`Add valid JSON to generate ${converterTab} output.`} />
            )
          ) : (
            <SidebarEmpty
              text={`Cannot generate ${converterTab} because JSON is invalid. Fix JSON first.`}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function DiffWorkspace({
  diffOld,
  diffNew,
  setDiffOld,
  setDiffNew,
  summary,
}: {
  diffOld: string;
  diffNew: string;
  setDiffOld: React.Dispatch<React.SetStateAction<string>>;
  setDiffNew: React.Dispatch<React.SetStateAction<string>>;
  summary: ReturnType<typeof buildDiffSummary>;
}) {
  const [syncScrolling, setSyncScrolling] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const diffEditorRef = useRef<DiffEditorHandle | null>(null);
  const isSyncingScrollRef = useRef(false);
  const originalDecorationIdsRef = useRef<string[]>([]);
  const modifiedDecorationIdsRef = useRef<string[]>([]);

  const visualDiff = useMemo(
    () => buildLineDiff(diffOld, diffNew, ignoreWhitespace),
    [diffNew, diffOld, ignoreWhitespace],
  );
  const totalDifferences =
    (summary?.added.length ?? 0) +
    (summary?.removed.length ?? 0) +
    (summary?.changed.length ?? 0) +
    (summary?.typeChanges.length ?? 0);

  useEffect(() => {
    const diffEditor = diffEditorRef.current;
    if (!diffEditor) {
      return;
    }

    const originalEditor = diffEditor.getOriginalEditor();
    const modifiedEditor = diffEditor.getModifiedEditor();

    originalDecorationIdsRef.current = originalEditor.deltaDecorations(
      originalDecorationIdsRef.current,
      visualDiff.originalLines.map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "jsonlines-diff-line-removed",
          linesDecorationsClassName: "jsonlines-diff-gutter-removed",
        },
      })),
    );

    modifiedDecorationIdsRef.current = modifiedEditor.deltaDecorations(
      modifiedDecorationIdsRef.current,
      visualDiff.modifiedLines.map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "jsonlines-diff-line-added",
          linesDecorationsClassName: "jsonlines-diff-gutter-added",
        },
      })),
    );
  }, [visualDiff]);

  useEffect(() => {
    const diffEditor = diffEditorRef.current;
    if (!diffEditor) {
      return;
    }

    const originalEditor = diffEditor.getOriginalEditor();
    const modifiedEditor = diffEditor.getModifiedEditor();

    const syncTo = (target: DiffPaneEditor, source: DiffPaneEditor) =>
      source.onDidScrollChange((event) => {
        if (!syncScrolling || !event.scrollTopChanged || isSyncingScrollRef.current) {
          return;
        }

        isSyncingScrollRef.current = true;
        target.setScrollTop(source.getScrollTop());
        window.requestAnimationFrame(() => {
          isSyncingScrollRef.current = false;
        });
      });

    const disposableOriginal = syncTo(modifiedEditor, originalEditor);
    const disposableModified = syncTo(originalEditor, modifiedEditor);

    return () => {
      disposableOriginal.dispose();
      disposableModified.dispose();
    };
  }, [syncScrolling]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#080808]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] bg-[#111111] px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-[#f5f1ea]">
            <FileDiff className="size-4 text-[#c07040]" />
            JSON Diff Mode
          </div>
          <div className="hidden h-5 w-px bg-[#262626] lg:block" />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSyncScrolling((current) => !current)}
              className={cn(
                "rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors",
                syncScrolling
                  ? "border-[#c07040] bg-[#2a1c13] text-[#d69463]"
                  : "border-[#2a2a2a] bg-[#0a0a0a] text-[#d6c3b5]",
              )}
            >
              Sync Scrolling
            </button>
            <button
              type="button"
              onClick={() => setIgnoreWhitespace((current) => !current)}
              className={cn(
                "rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors",
                ignoreWhitespace
                  ? "border-[#c07040] bg-[#2a1c13] text-[#d69463]"
                  : "border-[#2a2a2a] bg-[#0a0a0a] text-[#d6c3b5]",
              )}
            >
              Ignore Whitespace
            </button>
            <button
              type="button"
              onClick={() => {
                setDiffOld(diffNew);
                setDiffNew(diffOld);
              }}
              className="rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#c07040]"
            >
              Swap Sides
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="font-mono text-[#d6c3b5]">{totalDifferences} differences found</span>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[#f1b0b0]">-{summary?.removed.length ?? 0}</span>
            <span className="text-[#8ed08e]">+{summary?.added.length ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-h-0 2xl:border-r 2xl:border-[#262626]">
          <div className="grid grid-cols-2 border-b border-[#262626] bg-[#111111] font-mono text-[12px] text-[#d6c3b5]">
            <div className="border-r border-[#262626] px-5 py-3">
              Original JSON (prod-config-v1.json)
            </div>
            <div className="px-5 py-3">Modified JSON (prod-config-v2.json)</div>
          </div>

          <div className="h-[420px] bg-[#050505] lg:h-[520px] xl:h-[620px] 2xl:h-[calc(100vh-240px)]">
            <MonacoDiffEditor
              height="100%"
              language="json"
              original={diffOld}
              modified={diffNew}
              theme="vs-dark"
              onMount={(editor) => {
                diffEditorRef.current = editor as unknown as DiffEditorHandle;
                const originalModel = editor.getModel()?.original;
                const modifiedModel = editor.getModel()?.modified;

                originalModel?.onDidChangeContent(() => {
                  const nextValue = originalModel.getValue();
                  setDiffOld((current) => (current === nextValue ? current : nextValue));
                });

                modifiedModel?.onDidChangeContent(() => {
                  const nextValue = modifiedModel.getValue();
                  setDiffNew((current) => (current === nextValue ? current : nextValue));
                });
              }}
              options={{
                automaticLayout: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                readOnly: false,
                originalEditable: true,
                renderIndicators: true,
                lineNumbers: "on",
                wordWrap: "off",
                padding: { top: 20, bottom: 20 },
                fontSize: 15,
                lineHeight: 28,
                fontFamily: "var(--font-mono)",
                ignoreTrimWhitespace: ignoreWhitespace,
                diffWordWrap: "off",
              }}
            />
          </div>
        </div>

        <aside className="min-h-0 border-t border-[#262626] bg-[#121212] 2xl:border-t-0">
          <SidebarSection title="Diff Summary">
            {summary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatTile label="Added fields" value={String(summary.added.length)} />
                  <StatTile label="Removed fields" value={String(summary.removed.length)} />
                  <StatTile label="Changed values" value={String(summary.changed.length)} />
                  <StatTile label="Type changes" value={String(summary.typeChanges.length)} />
                </div>

                <div className="space-y-2">
                  {summary.changed.slice(0, 2).map((item) => (
                    <IssueCard
                      key={item}
                      tone="warning"
                      icon={<Info className="size-4" />}
                      title="Changed"
                      body={item}
                    />
                  ))}
                  {summary.typeChanges.slice(0, 2).map((item) => (
                    <IssueCard
                      key={item}
                      tone="warning"
                      icon={<ShieldAlert className="size-4" />}
                      title="Type changed"
                      body={item}
                    />
                  ))}
                  {summary.removed.slice(0, 2).map((item) => (
                    <IssueCard
                      key={item}
                      tone="error"
                      icon={<XCircle className="size-4" />}
                      title="Removed"
                      body={item}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <SidebarEmpty text="Paste old and new JSON to compare changes." />
            )}
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

function JwtWorkspace({
  jwtInput,
  setJwtInput,
  decodedJwt,
  onCopy,
}: {
  jwtInput: string;
  setJwtInput: React.Dispatch<React.SetStateAction<string>>;
  decodedJwt: DecodedJwtData;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [verifyEnabled, setVerifyEnabled] = useState(true);
  const [jwtAlgorithm, setJwtAlgorithm] = useState("HS256");
  const [jwtSecret, setJwtSecret] = useState("your-256-bit-secret");
  const [signatureState, setSignatureState] = useState<
    "idle" | "verified" | "invalid" | "unsupported"
  >("idle");

  useEffect(() => {
    let cancelled = false;

    async function verifySignature() {
      if (!verifyEnabled || !decodedJwt) {
        if (!cancelled) {
          setSignatureState("idle");
        }
        return;
      }

      const tokenAlgorithm = String(decodedJwt.header.alg ?? "");
      if (tokenAlgorithm !== "HS256" || jwtAlgorithm !== "HS256" || !jwtSecret.trim()) {
        if (!cancelled) {
          setSignatureState("unsupported");
        }
        return;
      }

      const verified = await verifyHs256Token(decodedJwt.tokenParts, jwtSecret);
      if (!cancelled) {
        setSignatureState(verified ? "verified" : "invalid");
      }
    }

    void verifySignature();

    return () => {
      cancelled = true;
    };
  }, [decodedJwt, jwtAlgorithm, jwtSecret, verifyEnabled]);

  const payloadClaims = decodedJwt?.payload ? Object.entries(decodedJwt.payload).slice(0, 6) : [];
  const headerJson = decodedJwt ? JSON.stringify(decodedJwt.header, null, 2) : "";
  const payloadJson = decodedJwt ? JSON.stringify(decodedJwt.payload, null, 2) : "";
  const tokenAlgorithm = String(decodedJwt?.header.alg ?? jwtAlgorithm);

  return (
    <div className="grid h-full min-h-0 gap-px bg-[#262626] xl:grid-cols-2">
      <section className="flex min-h-0 flex-col bg-[#080808]">
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#171717]/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#f5f1ea]">
            <LockKeyhole className="size-4 text-[#c07040]" />
            Encoded Token
          </h2>
          <button
            type="button"
            onClick={() => setJwtInput("")}
            className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
          >
            Clear
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-[#080808] p-5">
          <textarea
            value={jwtInput}
            onChange={(event) => setJwtInput(event.target.value)}
            spellCheck={false}
            placeholder={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\neyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpTT05MZW5zIERlbW8iLCJpYXQiOjE1MTYyMzkwMjJ9.\nSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}
            className="h-full w-full resize-none border-0 bg-transparent px-0 py-0 font-mono text-[15px] leading-8 text-[#f5f1ea] outline-none placeholder:text-[#5b5450]"
          />
        </div>

        <div className="border-t border-[#262626] bg-[#121212] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-medium text-[#f5f1ea]">Verify Signature</h3>
            <button
              type="button"
              role="switch"
              aria-checked={verifyEnabled}
              onClick={() => setVerifyEnabled((current) => !current)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                verifyEnabled ? "bg-[#c77742]" : "bg-[#353534]",
              )}
            >
              <span
                className={cn(
                  "absolute top-[2px] h-4 w-4 rounded-full bg-[#f5f1ea] transition-transform",
                  verifyEnabled ? "left-[18px]" : "left-[2px]",
                )}
              />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)] md:items-center">
              <label className="font-mono text-xs text-[#a89589]">Algorithm</label>
              <div className="relative">
                <select
                  value={jwtAlgorithm}
                  onChange={(event) => setJwtAlgorithm(event.target.value)}
                  className="h-11 w-full appearance-none rounded-sm border border-[#262626] bg-[#080808] px-3 font-mono text-sm text-[#f5f1ea] outline-none"
                >
                  <option>HS256</option>
                  <option>RS256</option>
                  <option>ES256</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#a89589]" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)] md:items-start">
              <label className="pt-2 font-mono text-xs text-[#a89589]">Secret</label>
              <div className="space-y-2">
                <textarea
                  value={jwtSecret}
                  onChange={(event) => setJwtSecret(event.target.value)}
                  className="h-24 w-full resize-none rounded-sm border border-[#262626] bg-[#080808] px-3 py-2 font-mono text-sm text-[#f5f1ea] outline-none"
                  placeholder="your-256-bit-secret"
                />
                <div className="flex justify-end">
                  <SmallAction
                    label="Copy Secret"
                    onClick={() => onCopy(jwtSecret, "Copied JWT secret")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-col overflow-y-auto bg-[#080808]">
        <div className="sticky top-0 z-10 border-b border-[#262626] bg-[#171717]/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#f5f1ea]">
            <Eye className="size-4 text-[#ffb68e]" />
            Decoded Payload
          </h2>
        </div>

        <div className="space-y-5 p-6">
          {decodedJwt ? (
            <>
              <JwtCard
                title="Header"
                subtitle="Algorithm & Token Type"
                accent="copper"
                actions={
                  <SmallAction
                    label="Copy Header"
                    onClick={() => onCopy(headerJson, "Copied JWT header")}
                  />
                }
              >
                <CodePreview value={headerJson} className="border-0 bg-transparent p-0" />
              </JwtCard>

              <JwtCard
                title="Payload"
                subtitle="Data"
                accent="secondary"
                actions={
                  <SmallAction
                    label="Copy Payload"
                    onClick={() => onCopy(payloadJson, "Copied JWT payload")}
                  />
                }
              >
                <CodePreview value={payloadJson} className="border-0 bg-transparent p-0" />
              </JwtCard>

              <JwtCard
                title="Signature"
                subtitle="Verification"
                accent="primary"
                actions={
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-sm border px-2.5 py-1",
                      signatureState === "verified"
                        ? "border-[#32593a] bg-[#0d1510] text-[#8ed08e]"
                        : signatureState === "invalid"
                        ? "border-[#7a1e1e] bg-[#4a0c0c] text-[#f1b0b0]"
                        : "border-[#4b3c24] bg-[#14110b] text-[#d7c49d]",
                    )}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span className="font-mono text-xs">
                      {signatureState === "verified"
                        ? "Signature Verified"
                        : signatureState === "invalid"
                        ? "Signature Invalid"
                        : signatureState === "unsupported"
                        ? "Verification Limited"
                        : "Verification Idle"}
                    </span>
                  </div>
                }
              >
                <div className="space-y-2 font-mono text-xs leading-6 text-[#d6c3b5]">
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Algorithm:</span>
                    <span className="text-[#f5f1ea]">{tokenAlgorithm || "Unknown"}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Data:</span>
                    <span className="truncate text-[#f5f1ea]/75">
                      {decodedJwt.tokenParts[0]}.{decodedJwt.tokenParts[1]}
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Secret:</span>
                    <span className="truncate text-[#f5f1ea]/75">
                      {jwtSecret || "No secret provided"}
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Signature:</span>
                    <span className="truncate text-[#f5f1ea]/75">{decodedJwt.signature}</span>
                  </p>
                </div>
              </JwtCard>

              <JwtCard
                title="Claims"
                subtitle="Quick scan"
                accent="secondary"
                actions={
                  <SmallAction
                    label="Copy Full JWT"
                    onClick={() =>
                      onCopy(
                        JSON.stringify(
                          {
                            header: decodedJwt.header,
                            payload: decodedJwt.payload,
                            signature: decodedJwt.signature,
                          },
                          null,
                          2,
                        ),
                        "Copied full decoded JWT",
                      )
                    }
                  />
                }
              >
                <div className="grid gap-2">
                  {payloadClaims.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-sm border border-[#262626] bg-[#111111] px-3 py-2"
                    >
                      <span className="font-mono text-xs text-[#c07040]">{key}</span>
                      <span className="max-w-[70%] truncate font-mono text-xs text-[#f5f1ea]">
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </JwtCard>
            </>
          ) : (
            <div className="rounded-sm border border-[#262626] bg-[#121212] p-6">
              <p className="text-lg font-semibold text-[#f5f1ea]">Paste a valid JWT token</p>
              <p className="mt-2 text-sm leading-6 text-[#a89589]">
                Header, payload, and signature details will appear here once the token can be
                decoded.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function HistoryWorkspace({ items }: { items: HistoryItem[] }) {
  return (
    <div className="grid h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="border-r border-[#262626] p-5">
        <div className="rounded-sm border border-[#262626] bg-[#0a0a0a] p-5">
          <h3 className="text-lg font-semibold text-[#f5f1ea]">Workspace history</h3>
          <p className="mt-2 text-sm text-[#a89589]">
            Track recent actions like formatting, downloads, masking, and converter output
            generation.
          </p>
        </div>
      </div>

      <aside className="overflow-y-auto bg-[#121212] p-5">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-sm border border-[#262626] bg-[#0a0a0a] px-4 py-4"
            >
              <p className="text-sm font-semibold text-[#f5f1ea]">{item.label}</p>
              <p className="mt-1 text-sm text-[#a89589]">{item.detail}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function CommandPalette({
  items,
  activeIndex,
  query,
  inputRef,
  onClose,
  onMoveDown,
  onMoveUp,
  onQueryChange,
  onRun,
  onSelect,
}: {
  items: ReadonlyArray<{ id: string; label: string; hint: string }>;
  activeIndex: number;
  query: string;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onClose: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onQueryChange: (value: string) => void;
  onRun: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-[12vh] w-full max-w-2xl rounded-[20px] border border-[#2b2b2b] bg-[#101010] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[#262626] px-5 py-4">
          <div className="flex items-center gap-3">
            <Search className="size-4 text-[#d69463]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  onMoveDown();
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  onMoveUp();
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  onRun();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  onClose();
                }
              }}
              className="w-full bg-transparent text-sm text-[#f5f1ea] outline-none placeholder:text-[#5b5450]"
              placeholder="Search commands..."
            />
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {items.length ? (
            items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-4 py-3 text-left transition-colors",
                  activeIndex === index ? "bg-[#1d1d1d]" : "hover:bg-[#171717]",
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-[#f5f1ea]">{item.label}</p>
                  <p className="text-xs text-[#a89589]">{item.hint}</p>
                </div>
                <ChevronRight className="size-4 text-[#7b7068]" />
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-sm text-[#a89589]">No matching commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-sm border border-[#2a2a2a] bg-[#111111] px-4 py-2 text-sm font-medium text-[#f5f1ea] transition-colors hover:border-[#c07040]"
    >
      {icon}
      {label}
    </button>
  );
}

function IconButton({
  active,
  icon,
  onClick,
  title,
}: {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-sm p-2 transition-colors",
        active
          ? "bg-[#1f1f1f] text-[#d69463]"
          : "text-[#d6c3b5] hover:bg-[#1a1a1a] hover:text-[#f5f1ea]",
      )}
    >
      {icon}
    </button>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#262626] p-5">
      <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#b8a69a]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SidebarEmpty({ text }: { text: string }) {
  return <p className="text-sm leading-6 text-[#a89589]">{text}</p>;
}

function SmallAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-[#d6c3b5] transition-colors hover:border-[#c07040]"
    >
      {label}
    </button>
  );
}

function IssueCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: "success" | "warning" | "error";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const toneClasses =
    tone === "error"
      ? "border-[#7a1e1e] bg-[#4a0c0c] text-[#f1b0b0]"
      : tone === "warning"
      ? "border-[#6b5527] bg-[#14110b] text-[#d7c49d]"
      : "border-[#32593a] bg-[#0d1510] text-[#8ed08e]";

  return (
    <div className={cn("rounded-sm border px-4 py-4", toneClasses)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 font-mono text-xs opacity-90">{body}</p>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: JsonStats }) {
  const items: Array<{ label: string; value: string; tone: "default" | "gold" }> = [
    { label: "Size", value: formatBytes(stats.bytes), tone: "gold" },
    { label: "Max Depth", value: String(stats.maxDepth), tone: "gold" },
    { label: "Objects", value: String(stats.objects), tone: "default" },
    { label: "Arrays", value: String(stats.arrays), tone: "default" },
    { label: "Keys", value: String(stats.keys), tone: "default" },
    { label: "Strings", value: String(stats.strings), tone: "default" },
    { label: "Numbers", value: String(stats.numbers), tone: "default" },
    { label: "Booleans", value: String(stats.booleans), tone: "default" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <StatTile key={item.label} label={item.label} value={item.value} tone={item.tone} />
      ))}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold";
}) {
  return (
    <div className="rounded-sm border border-[#262626] bg-[#0a0a0a] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#6d655f]">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-[24px] leading-none",
          tone === "gold" ? "text-[#d4b483]" : "text-[#f5f1ea]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CodePreview({ value, className }: { value: string; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-auto rounded-sm border border-[#262626] bg-[#0a0a0a] p-4 font-mono text-xs leading-6 text-[#f5f1ea]",
        className,
      )}
    >
      {value}
    </pre>
  );
}

function JwtCard({
  title,
  subtitle,
  accent,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "copper" | "secondary" | "primary";
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const accentClasses =
    accent === "copper"
      ? "bg-[#c07040]/20 group-hover:bg-[#c07040] text-[#c07040]"
      : accent === "secondary"
      ? "bg-[#e3c290]/20 group-hover:bg-[#e3c290] text-[#e3c290]"
      : "bg-[#ffb68e]/20 group-hover:bg-[#ffb68e] text-[#ffb68e]";

  const headingClass =
    accent === "copper"
      ? "text-[#c07040]"
      : accent === "secondary"
      ? "text-[#e3c290]"
      : "text-[#ffb68e]";

  return (
    <div className="group overflow-hidden rounded-lg border border-[#262626] bg-[#121212]">
      <div className="flex items-center justify-between border-b border-[#262626] bg-[#0e0e0e] px-4 py-3">
        <div>
          <span
            className={cn("text-[12px] font-semibold uppercase tracking-[0.1em]", headingClass)}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#a89589]">{subtitle}</span>
          {actions}
        </div>
      </div>
      <div className="relative p-4">
        <div className={cn("absolute inset-y-0 left-0 w-1 transition-colors", accentClasses)} />
        <div className="pl-2">{children}</div>
      </div>
    </div>
  );
}

function TreeNode({
  label,
  path,
  value,
  selectedPath,
  onSelect,
  onCopy,
}: {
  label: string;
  path: string;
  value: JsonValue;
  selectedPath: string | null;
  onSelect: React.Dispatch<React.SetStateAction<string | null>>;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(path === "$");
  const isContainer = Array.isArray(value) || (value !== null && typeof value === "object");
  const isSelected = selectedPath === path;
  const children = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : value !== null && typeof value === "object"
    ? Object.entries(value)
    : [];

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "group flex min-w-0 items-start gap-2 rounded-sm px-2 py-1.5 transition-colors",
          isSelected ? "bg-[#1f1f1f]" : "hover:bg-[#111111]",
        )}
      >
        {isContainer ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="mt-0.5 shrink-0 text-[#a89589]"
          >
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : (
          <span className="inline-flex w-3.5 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(path)}
          className="min-w-0 flex-1 whitespace-nowrap text-left font-mono text-xs leading-6"
        >
          <span className="text-[#d69463]">{label}</span>
          <span className="text-[#6d655f]">: </span>
          <span className="text-[#f5f1ea]">{previewValue(value)}</span>
        </button>

        <button
          type="button"
          onClick={() => onCopy(path, "Copied JSONPath")}
          className="hidden shrink-0 text-[#7f766f] group-hover:block"
        >
          <Copy className="size-3.5" />
        </button>
      </div>

      {isContainer && open ? (
        <div className="ml-4 min-w-0 border-l border-[#262626] pl-3">
          {children.map(([key, child]) => (
            <TreeNode
              key={`${path}-${key}`}
              label={Array.isArray(value) ? `[${key}]` : key}
              path={appendPath(path, Array.isArray(value) ? Number(key) : key)}
              value={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onCopy={onCopy}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildIntelligentIssues(value: JsonValue | null) {
  if (!value) {
    return {
      sensitive: null as null | { path: string },
      warning: null as null | string,
    };
  }

  let sensitive: { path: string } | null = null;
  let warning: string | null = null;

  const visit = (current: JsonValue, path: string) => {
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => {
        const nextPath = path === "$" ? `$.${key}` : `${path}.${key}`;

        if (!sensitive && /(password|token|secret|email)/i.test(key)) {
          sensitive = { path: nextPath };
        }

        if (!warning && typeof child === "string" && /^\d+(\.\d+)?$/.test(child)) {
          warning = `${nextPath} is a string but looks like a number.`;
        }

        visit(child, nextPath);
      });
    }
  };

  visit(value, "$");
  return { sensitive, warning };
}

function findSearchMatches(value: JsonValue, query: string) {
  const term = query.toLowerCase();
  const matches: SearchMatch[] = [];

  const visit = (current: JsonValue, path: string, label: string) => {
    const preview = previewValue(current);
    if (
      path.toLowerCase().includes(term) ||
      label.toLowerCase().includes(term) ||
      preview.toLowerCase().includes(term)
    ) {
      matches.push({ path, preview, value: current });
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, appendPath(path, index), `[${index}]`));
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => visit(child, appendPath(path, key), key));
    }
  };

  visit(value, "$", "root");
  return matches;
}

function getFirstSelectableNode(value: JsonValue): SelectedNode | null {
  if (Array.isArray(value)) {
    return value.length ? { path: "$[0]", value: value[0] } : { path: "$", value };
  }

  if (value !== null && typeof value === "object") {
    const [key, child] = Object.entries(value)[0] ?? [];
    return key ? { path: `$.${key}`, value: child } : { path: "$", value };
  }

  return { path: "$", value };
}

function getValueAtPath(value: JsonValue, path: string): JsonValue | undefined {
  if (path === "$") {
    return value;
  }

  const segments = Array.from(path.matchAll(/(?:\.([A-Za-z_$][\w$]*))|\[(\d+)\]/g));
  let current: JsonValue = value;

  for (const segment of segments) {
    const key = segment[1];
    const index = segment[2];

    if (Array.isArray(current) && index !== undefined) {
      current = current[Number(index)];
      continue;
    }

    if (current !== null && typeof current === "object" && key !== undefined) {
      current = (current as Record<string, JsonValue>)[key];
      continue;
    }

    return undefined;
  }

  return current;
}

function appendPath(parent: string, segment: string | number) {
  if (typeof segment === "number") {
    return `${parent}[${segment}]`;
  }

  return parent === "$" ? `$.${segment}` : `${parent}.${segment}`;
}

function previewValue(value: JsonValue) {
  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (value !== null && typeof value === "object") {
    return `Object(${Object.keys(value).length})`;
  }

  if (typeof value === "string") {
    return `"${value}"`;
  }

  return String(value);
}

function renderJsonValue(value: JsonValue) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function maskSensitiveValues(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(maskSensitiveValues);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        /(password|token|secret|api[_-]?key|authorization|client_secret|email)/i.test(key)
          ? "[masked]"
          : maskSensitiveValues(child),
      ]),
    );
  }

  return value;
}

function repairJsonInput(input: string) {
  return input.replace(/,\s*([}\]])/g, "$1");
}

function getConverterOutput(tab: ConverterTab, value: JsonValue | null) {
  if (!value) {
    return "";
  }

  switch (tab) {
    case "TypeScript":
      return generateTypeScript("RootPayload", value);
    case "Zod":
      return generateZodSchema("rootPayloadSchema", value);
    case "CSV":
      return generateCsvOutput(value);
    case "YAML":
      return toYaml(value);
    case "XML":
      return generateXmlOutput(value);
    case "Schema":
      return JSON.stringify(generateJsonSchema(value), null, 2);
    case "Prisma":
      return generatePrismaModel("JsonLensRecord", value);
    case "Mongoose":
      return generateMongooseSchema("JsonLensRecord", value);
    default:
      return "";
  }
}

function generateTypeScript(name: string, value: JsonValue) {
  return `export interface ${name} ${toTypeScriptShape(value, 0)}\n`;
}

function toTypeScriptShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    if (!value.length) {
      return "unknown[]";
    }

    return `${toTypeScriptShape(value[0], depth)}[]`;
  }

  if (value === null) {
    return "null";
  }

  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return `{\n${Object.entries(value)
        .map(([key, child]) => `${nextIndent}${key}: ${toTypeScriptShape(child, depth + 1)};`)
        .join("\n")}\n${indent}}`;
    default:
      return "unknown";
  }
}

function generateZodSchema(name: string, value: JsonValue) {
  return `import { z } from "zod";\n\nexport const ${name} = ${toZodShape(value, 0)};\n`;
}

function toZodShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    return `z.array(${toZodShape(value[0] ?? null, depth)})`;
  }

  if (value === null) {
    return "z.null()";
  }

  switch (typeof value) {
    case "string":
      return "z.string()";
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    case "object":
      return `z.object({\n${Object.entries(value)
        .map(([key, child]) => `${nextIndent}${key}: ${toZodShape(child, depth + 1)},`)
        .join("\n")}\n${indent}})`;
    default:
      return "z.unknown()";
  }
}

function generateJsonSchema(value: JsonValue): Record<string, unknown> {
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: value[0] ? generateJsonSchema(value[0]) : {},
    };
  }

  if (value === null) {
    return { type: "null" };
  }

  if (typeof value === "object") {
    return {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, generateJsonSchema(child)]),
      ),
      required: Object.keys(value),
    };
  }

  return { type: typeof value };
}

function generateCsvOutput(value: JsonValue) {
  if (!Array.isArray(value)) {
    return "";
  }

  const rows = value.filter(
    (item): item is Record<string, JsonValue> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );

  return rows.length === value.length ? Papa.unparse(rows) : "";
}

function generateXmlOutput(value: JsonValue) {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
  });

  return builder.build({ root: value });
}

function generatePrismaModel(name: string, value: JsonValue) {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    return `model ${name} {\n  id String @id @default(cuid())\n  payload Json\n}`;
  }

  const fields = Object.entries(value)
    .map(([key, child]) => `  ${sanitizeFieldName(key)} ${toPrismaType(child)}`)
    .join("\n");

  return `model ${name} {\n  id String @id @default(cuid())\n${fields}\n}`;
}

function generateMongooseSchema(name: string, value: JsonValue) {
  return `import { Schema, model } from "mongoose";\n\nconst ${name}Schema = new Schema(${toMongooseShape(
    value,
    0,
  )});\n\nexport const ${name} = model("${name}", ${name}Schema);\n`;
}

function toPrismaType(value: JsonValue) {
  if (Array.isArray(value)) {
    return "Json";
  }

  if (value === null) {
    return "Json?";
  }

  switch (typeof value) {
    case "string":
      return "String";
    case "number":
      return Number.isInteger(value) ? "Int" : "Float";
    case "boolean":
      return "Boolean";
    case "object":
      return "Json";
    default:
      return "Json";
  }
}

function toMongooseShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    return `[${toMongooseShape(value[0] ?? null, depth)}]`;
  }

  if (value === null) {
    return "Schema.Types.Mixed";
  }

  switch (typeof value) {
    case "string":
      return "String";
    case "number":
      return "Number";
    case "boolean":
      return "Boolean";
    case "object":
      return `{\n${Object.entries(value)
        .map(([key, child]) => `${nextIndent}${key}: ${toMongooseShape(child, depth + 1)},`)
        .join("\n")}\n${indent}}`;
    default:
      return "Schema.Types.Mixed";
  }
}

function sanitizeFieldName(key: string) {
  return key.replace(/[^A-Za-z0-9_]/g, "_");
}

function buildDiffSummary(oldSource: string, newSource: string) {
  const oldParsed = parseJsonSafe(oldSource);
  const newParsed = parseJsonSafe(newSource);

  if (!oldParsed.valid || !newParsed.valid) {
    return null;
  }

  const summary = {
    added: [] as string[],
    removed: [] as string[],
    changed: [] as string[],
    typeChanges: [] as string[],
  };

  compareValues("$", oldParsed.data, newParsed.data, summary);
  return summary;
}

function compareValues(
  path: string,
  oldValue: JsonValue,
  newValue: JsonValue,
  summary: {
    added: string[];
    removed: string[];
    changed: string[];
    typeChanges: string[];
  },
) {
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const max = Math.max(oldValue.length, newValue.length);
    for (let index = 0; index < max; index += 1) {
      const nextPath = appendPath(path, index);
      if (index >= oldValue.length) {
        summary.added.push(nextPath);
      } else if (index >= newValue.length) {
        summary.removed.push(nextPath);
      } else {
        compareValues(nextPath, oldValue[index], newValue[index], summary);
      }
    }
    return;
  }

  if (
    oldValue !== null &&
    newValue !== null &&
    typeof oldValue === "object" &&
    typeof newValue === "object" &&
    !Array.isArray(oldValue) &&
    !Array.isArray(newValue)
  ) {
    const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    keys.forEach((key) => {
      const nextPath = appendPath(path, key);
      if (!(key in oldValue)) {
        summary.added.push(nextPath);
      } else if (!(key in newValue)) {
        summary.removed.push(nextPath);
      } else {
        compareValues(nextPath, oldValue[key], newValue[key], summary);
      }
    });
    return;
  }

  if (typeof oldValue !== typeof newValue) {
    summary.typeChanges.push(`${path}: ${typeof oldValue} → ${typeof newValue}`);
    return;
  }

  if (oldValue !== newValue) {
    summary.changed.push(`${path}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
  }
}

function emptyStats(source: string): JsonStats {
  return {
    bytes: new TextEncoder().encode(source).length,
    keys: 0,
    objects: 0,
    arrays: 0,
    primitives: 0,
    maxDepth: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    sensitiveFields: 0,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildLineDiff(original: string, modified: string, ignoreWhitespace: boolean) {
  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");
  const normalize = (line: string) => (ignoreWhitespace ? line.trim() : line);
  const oldValues = originalLines.map(normalize);
  const newValues = modifiedLines.map(normalize);
  const rows = oldValues.length + 1;
  const cols = newValues.length + 1;
  const lcs = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = oldValues.length - 1; row >= 0; row -= 1) {
    for (let col = newValues.length - 1; col >= 0; col -= 1) {
      lcs[row][col] =
        oldValues[row] === newValues[col]
          ? lcs[row + 1][col + 1] + 1
          : Math.max(lcs[row + 1][col], lcs[row][col + 1]);
    }
  }

  const removed = new Set<number>();
  const added = new Set<number>();
  let row = 0;
  let col = 0;

  while (row < oldValues.length && col < newValues.length) {
    if (oldValues[row] === newValues[col]) {
      row += 1;
      col += 1;
      continue;
    }

    if (lcs[row + 1][col] >= lcs[row][col + 1]) {
      removed.add(row + 1);
      row += 1;
    } else {
      added.add(col + 1);
      col += 1;
    }
  }

  while (row < oldValues.length) {
    removed.add(row + 1);
    row += 1;
  }

  while (col < newValues.length) {
    added.add(col + 1);
    col += 1;
  }

  return {
    originalLines: Array.from(removed),
    modifiedLines: Array.from(added),
  };
}

async function verifyHs256Token(tokenParts: [string, string, string], secret: string) {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const data = `${tokenParts[0]}.${tokenParts[1]}`;
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const computed = base64UrlEncode(new Uint8Array(signature));

    return computed === tokenParts[2];
  } catch {
    return false;
  }
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
