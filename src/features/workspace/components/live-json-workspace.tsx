"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { stringify as toYaml } from "yaml";
import { XMLBuilder } from "fast-xml-parser";
import {
  AlertTriangle,
  Braces,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Code2,
  Command,
  Copy,
  Database,
  Download,
  EyeOff,
  FileCode2,
  FileJson2,
  Globe,
  GraduationCap,
  HardDriveUpload,
  Info,
  ListTree,
  MoreHorizontal,
  PanelsTopLeft,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  TableProperties,
  WandSparkles,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFriendlyJsonError, getJsonStats, parseJsonSafe } from "@/lib/json";
import { cn } from "@/lib/utils";
import type { JsonStats, JsonValue } from "@/types/json";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const SAMPLE_USER_JSON = `{
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

const ROLE_MODES = [
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
] as const;

const CONVERTER_TABS = [
  "typescript",
  "zod",
  "csv",
  "yaml",
  "xml",
  "schema",
  "prisma",
  "mongoose",
] as const;

const MOBILE_SECTIONS = ["input", "tree", "output", "errors"] as const;

type OutputTab = "tree" | "formatted" | "stats" | "types" | "schema" | "diff" | "errors";
type ConverterTab = (typeof CONVERTER_TABS)[number];
type MobileSection = (typeof MOBILE_SECTIONS)[number];
type RoleModeId = (typeof ROLE_MODES)[number]["id"];
type RoleMode = (typeof ROLE_MODES)[number];
type SearchMatch = {
  path: string;
  preview: string;
  value: JsonValue;
};
type SelectedNode = {
  path: string;
  value: JsonValue;
};
type EditorInstance = {
  revealPositionInCenter(position: { lineNumber: number; column: number }): void;
  setPosition(position: { lineNumber: number; column: number }): void;
  focus(): void;
  onDidChangeCursorPosition(
    listener: (event: { position: { lineNumber: number; column: number } }) => void,
  ): void;
};
type CommandAction = {
  id: string;
  label: string;
  hint?: string;
};
type DiffSummary = {
  added: string[];
  removed: string[];
  changed: string[];
  typeChanges: string[];
};

export function LiveJsonWorkspace() {
  const editorRef = useRef<EditorInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  const [source, setSource] = useState(SAMPLE_USER_JSON);
  const [roleModeId, setRoleModeId] = useState<RoleModeId>("general");
  const [activeTab, setActiveTab] = useState<OutputTab>("tree");
  const [converterTab, setConverterTab] = useState<ConverterTab>("typescript");
  const [mobileSection, setMobileSection] = useState<MobileSection>("input");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [ignoreSensitiveWarning, setIgnoreSensitiveWarning] = useState(false);
  const [linePosition, setLinePosition] = useState({ line: 1, column: 1 });
  const [panelRatio, setPanelRatio] = useState(50);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [diffOld, setDiffOld] = useState(SAMPLE_DIFF_OLD);
  const [diffNew, setDiffNew] = useState(SAMPLE_DIFF_NEW);

  const roleMode = ROLE_MODES.find((mode) => mode.id === roleModeId) ?? ROLE_MODES[0];

  const parseResult = useMemo(() => {
    if (!source.trim()) {
      return null;
    }

    return parseJsonSafe(source);
  }, [source]);

  const parsedValue = parseResult?.valid ? parseResult.data : null;
  const stats = useMemo(
    () => (parsedValue ? getJsonStats(parsedValue, source) : null),
    [parsedValue, source],
  );
  const sizeInBytes = useMemo(() => new TextEncoder().encode(source).length, [source]);
  const lineCount = source ? source.split(/\r?\n/).length : 0;
  const typeScriptOutput = useMemo(
    () => (parsedValue ? generateTypeScript("RootPayload", parsedValue) : ""),
    [parsedValue],
  );
  const zodOutput = useMemo(
    () => (parsedValue ? generateZodSchema("rootPayloadSchema", parsedValue) : ""),
    [parsedValue],
  );
  const schemaOutput = useMemo(
    () => (parsedValue ? JSON.stringify(generateJsonSchema(parsedValue), null, 2) : ""),
    [parsedValue],
  );
  const csvOutput = useMemo(
    () => (parsedValue ? generateCsvOutput(parsedValue) : ""),
    [parsedValue],
  );
  const yamlOutput = useMemo(() => (parsedValue ? toYaml(parsedValue) : ""), [parsedValue]);
  const xmlOutput = useMemo(
    () => (parsedValue ? generateXmlOutput(parsedValue) : ""),
    [parsedValue],
  );
  const prismaOutput = useMemo(
    () => (parsedValue ? generatePrismaModel("JsonLensRecord", parsedValue) : ""),
    [parsedValue],
  );
  const mongooseOutput = useMemo(
    () => (parsedValue ? generateMongooseSchema("JsonLensRecord", parsedValue) : ""),
    [parsedValue],
  );
  const axiosSnippet = useMemo(() => generateAxiosSnippet(), []);
  const reactQuerySnippet = useMemo(() => generateReactQuerySnippet(), []);
  const openApiSnippet = useMemo(
    () => (parsedValue ? generateOpenApiSnippet(parsedValue) : ""),
    [parsedValue],
  );
  const suspiciousWarnings = useMemo(
    () => (parsedValue ? collectWarnings(parsedValue) : []),
    [parsedValue],
  );
  const sensitiveFields = useMemo(
    () => (parsedValue ? collectSensitiveFields(parsedValue) : []),
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
  const diffSummary = useMemo(() => buildDiffSummary(diffOld, diffNew), [diffOld, diffNew]);
  const converterOutput = useMemo(
    () =>
      getConverterOutput({
        converterTab,
        typeScriptOutput,
        zodOutput,
        csvOutput,
        yamlOutput,
        xmlOutput,
        schemaOutput,
        prismaOutput,
        mongooseOutput,
      }),
    [
      converterTab,
      csvOutput,
      mongooseOutput,
      prismaOutput,
      schemaOutput,
      typeScriptOutput,
      xmlOutput,
      yamlOutput,
      zodOutput,
    ],
  );

  useEffect(() => {
    const root = document.documentElement;
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const desktopQuery = window.matchMedia("(min-width: 1280px)");

    const updateLayoutState = () => {
      setIsDarkMode(root.classList.contains("dark") || darkQuery.matches);
      setIsDesktop(desktopQuery.matches);
    };

    updateLayoutState();

    const observer = new MutationObserver(updateLayoutState);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    darkQuery.addEventListener("change", updateLayoutState);
    desktopQuery.addEventListener("change", updateLayoutState);

    return () => {
      observer.disconnect();
      darkQuery.removeEventListener("change", updateLayoutState);
      desktopQuery.removeEventListener("change", updateLayoutState);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandIndex(0);
        setCommandQuery("");
        setIsCommandOpen(true);
        return;
      }

      if (!isCommandOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsCommandOpen(false);
        setCommandQuery("");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandOpen]);

  useEffect(() => {
    if (isCommandOpen) {
      window.setTimeout(() => commandInputRef.current?.focus(), 30);
    }
  }, [isCommandOpen]);

  const runTask = async (message: string, action: () => Promise<void> | void) => {
    setLoadingMessage(message);

    try {
      await action();
    } finally {
      window.setTimeout(() => setLoadingMessage(null), 380);
    }
  };

  const handleCopy = async (value: string, successMessage = "Copied") => {
    if (!value) {
      toast.error("Nothing to copy yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Clipboard access is blocked in this browser");
    }
  };

  const handleDownload = (content: string, filename: string, contentType: string) => {
    if (!content) {
      toast.error("There is no output to download yet");
      return;
    }

    const blob = new Blob([content], { type: contentType });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
    toast.success("Downloaded output");
  };

  const handlePasteFromClipboard = async () => {
    await runTask("Pasting from clipboard...", async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
          setSource(clipboardText);
          toast.success("Pasted JSON from clipboard");
        } else {
          toast.error("Clipboard is empty");
        }
      } catch {
        toast.error("Clipboard permission was blocked");
      }
    });
  };

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const loadingText =
      file.size > 1024 * 1024
        ? "Large file detected. Preparing optimized view..."
        : "Uploading file...";

    await runTask(loadingText, async () => {
      const text = await file.text();
      setSource(text);
      event.target.value = "";
      toast.success("File uploaded");
    });
  };

  const handleFormat = async () => {
    await runTask("Formatting JSON...", () => {
      if (!parsedValue) {
        toast.error("Cannot format invalid JSON");
        return;
      }

      setSource(JSON.stringify(parsedValue, null, 2));
      toast.success("Formatted successfully");
    });
  };

  const handleMinify = async () => {
    await runTask("Minifying JSON...", () => {
      if (!parsedValue) {
        toast.error("Cannot minify invalid JSON");
        return;
      }

      setSource(JSON.stringify(parsedValue));
      toast.success("Minified successfully");
    });
  };

  const handleValidate = async () => {
    await runTask("Validating structure...", () => {
      setActiveTab("errors");
      if (!parseResult) {
        toast.error("Paste JSON to validate");
        return;
      }

      if (parseResult.valid) {
        toast.success("JSON is valid");
      } else {
        toast.error("Invalid JSON found");
      }
    });
  };

  const handleRepair = async () => {
    await runTask("Repairing common syntax issues...", () => {
      if (parseResult?.valid) {
        toast.success("JSON is already valid");
        return;
      }

      setSource(repairJsonInput(source));
      toast.success("Applied a safe repair pass");
    });
  };

  const handleFetchUrl = async () => {
    if (!urlValue.trim()) {
      toast.error("Enter a JSON URL first");
      return;
    }

    await runTask("Loading remote JSON...", async () => {
      try {
        const response = await fetch(urlValue);
        const json = await response.json();
        setSource(JSON.stringify(json, null, 2));
        setShowUrlInput(false);
        toast.success("Fetched JSON response");
      } catch {
        setActiveTab("errors");
        toast.error("Could not fetch JSON from that URL");
      }
    });
  };

  const handleClear = () => {
    setSource("");
    setSearchTerm("");
    setSelectedPath(null);
    setIgnoreSensitiveWarning(false);
    setActiveTab("tree");
    toast.success("Editor cleared");
  };

  const handleSelectNode = (path: string) => {
    setSelectedPath(path);
    if (!isDesktop) {
      setMobileSection("output");
    }
  };

  const handleHighlightInEditor = () => {
    if (!parseResult || parseResult.valid || !editorRef.current) {
      return;
    }

    const line = parseResult.line ?? 1;
    const column = parseResult.column ?? 1;
    editorRef.current.revealPositionInCenter({ lineNumber: line, column });
    editorRef.current.setPosition({ lineNumber: line, column });
    editorRef.current.focus();
    toast.success("Moved editor to the problem line");
  };

  const handleMaskSensitiveValues = async () => {
    await runTask("Scanning sensitive fields...", () => {
      if (!parsedValue) {
        toast.error("Add valid JSON before masking fields");
        return;
      }

      setSource(JSON.stringify(maskSensitiveValues(parsedValue), null, 2));
      setIgnoreSensitiveWarning(true);
      toast.success("Sensitive fields masked");
    });
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setIsDarkMode(root.classList.contains("dark"));
    toast.success(root.classList.contains("dark") ? "Dark mode enabled" : "Light mode enabled");
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const startDividerDrag = () => {
    const onPointerMove = (event: PointerEvent) => {
      const nextRatio = (event.clientX / window.innerWidth) * 100;
      setPanelRatio(Math.min(66, Math.max(34, nextRatio)));
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const commandActions = useMemo<CommandAction[]>(
    () => [
      { id: "format", label: "Format JSON", hint: "Beautify the current input" },
      { id: "minify", label: "Minify JSON", hint: "Compress the current input" },
      { id: "validate", label: "Validate JSON", hint: "Open the errors panel" },
      { id: "typescript", label: "Generate TypeScript", hint: "Open converter output" },
      { id: "zod", label: "Generate Zod", hint: "Open converter output" },
      { id: "diff", label: "Open Diff Tool", hint: "Expected vs actual comparison" },
      { id: "jsonpath", label: "Run JSONPath", hint: "Jump to tree search" },
      { id: "scan", label: "Scan Sensitive Data", hint: "Mask detected secrets" },
      { id: "upload", label: "Upload File", hint: "Import .json file" },
      { id: "download", label: "Download JSON", hint: "Save editor contents" },
      { id: "theme", label: "Toggle Theme", hint: "Switch light and dark mode" },
      { id: "clear", label: "Clear Editor", hint: "Reset the workspace" },
    ],
    [],
  );

  const filteredCommands = useMemo(() => {
    if (!commandQuery.trim()) {
      return commandActions;
    }

    const query = commandQuery.toLowerCase();
    return commandActions.filter(
      (command) =>
        command.label.toLowerCase().includes(query) || command.hint?.toLowerCase().includes(query),
    );
  }, [commandActions, commandQuery]);

  const runCommand = async (command: CommandAction | undefined) => {
    if (!command) {
      return;
    }

    setIsCommandOpen(false);
    setCommandQuery("");

    switch (command.id) {
      case "format":
        await handleFormat();
        break;
      case "minify":
        await handleMinify();
        break;
      case "validate":
        await handleValidate();
        break;
      case "typescript":
        setActiveTab("types");
        setConverterTab("typescript");
        break;
      case "zod":
        setActiveTab("schema");
        setConverterTab("zod");
        break;
      case "diff":
        setActiveTab("diff");
        break;
      case "jsonpath":
        setActiveTab("tree");
        setSearchTerm("$.users");
        break;
      case "scan":
        await handleMaskSensitiveValues();
        break;
      case "upload":
        openFilePicker();
        break;
      case "download":
        handleDownload(source, "jsonlens-output.json", "application/json");
        break;
      case "theme":
        toggleTheme();
        break;
      case "clear":
        handleClear();
        break;
      default:
        break;
    }
  };

  const resolvedActiveTab = roleMode.tabs.includes(activeTab) ? activeTab : roleMode.tabs[0];

  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-workspace)]">
      <div className="border-b border-border px-6 py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-[13px] uppercase tracking-[0.16em] text-muted-foreground">
                Live JSON tool
              </p>
              <h2 className="text-[30px] font-semibold tracking-tight text-foreground">
                The homepage now behaves like the actual product
              </h2>
              <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">
                JSONLens is designed as a workflow, not a single formatter. Switch modes by role,
                work with converters inside the same panel, compare payloads, and trigger actions
                from the keyboard without leaving the page.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[13px] font-medium text-foreground"
                title="Formatting, validation, tree view, diff, and conversion run locally in your browser. Your JSON is not uploaded unless you choose sharing or future AI features."
              >
                <ShieldCheck className="size-3.5 text-primary" />
                Local-only
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[image:var(--primary-gradient)] px-3 py-1.5 text-[13px] font-medium text-white">
                <Command className="size-3.5" />
                Ctrl + K command palette
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {ROLE_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = mode.id === roleModeId;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setRoleModeId(mode.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-[var(--radius-input)] border px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "border-transparent bg-[image:var(--primary-gradient)] text-white"
                          : "border-border bg-secondary text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-[15px] leading-6 text-muted-foreground">{roleMode.description}</p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-border bg-secondary/60 p-4">
              <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                Focus tools in {roleMode.label} mode
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roleMode.focus.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 lg:p-6">
        {loadingMessage ? <LoadingState message={loadingMessage} /> : null}

        <div className="rounded-[var(--radius-lg)] border border-border bg-[var(--editor-background)] p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 border-b border-border pb-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handlePasteFromClipboard}>
                    <ClipboardPaste className="size-3.5" />
                    Paste
                  </Button>
                  <Button variant="outline" size="sm" onClick={openFilePicker}>
                    <HardDriveUpload className="size-3.5" />
                    Upload File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUrlInput((value) => !value)}
                  >
                    <Globe className="size-3.5" />
                    Load URL
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSource(SAMPLE_USER_JSON)}>
                    <Braces className="size-3.5" />
                    Try Sample
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleUploadFile}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleFormat}>
                    Format
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleMinify}>
                    Minify
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleValidate}>
                    Validate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRepair}>
                    Repair
                  </Button>
                </div>
              </div>

              {showUrlInput ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={urlValue}
                    onChange={(event) => setUrlValue(event.target.value)}
                    placeholder="https://api.example.com/users"
                    aria-label="Load JSON from URL"
                  />
                  <Button size="sm" onClick={handleFetchUrl}>
                    Fetch JSON
                  </Button>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(source, "Copied JSON input")}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownload(source, "jsonlens-output.json", "application/json")
                    }
                  >
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMoreMenu((value) => !value)}
                    aria-expanded={showMoreMenu}
                  >
                    <MoreHorizontal className="size-3.5" />
                    More
                  </Button>

                  {showMoreMenu ? (
                    <div className="absolute right-0 z-10 mt-2 w-72 rounded-[var(--radius-card)] border border-border bg-card p-2 shadow-[var(--shadow-floating)]">
                      {[
                        {
                          label: "Convert to TypeScript",
                          run: () => {
                            setActiveTab("types");
                            setConverterTab("typescript");
                          },
                        },
                        {
                          label: "Convert to Zod",
                          run: () => {
                            setActiveTab("schema");
                            setConverterTab("zod");
                          },
                        },
                        {
                          label: "Convert to CSV",
                          run: () => {
                            setActiveTab("types");
                            setConverterTab("csv");
                          },
                        },
                        {
                          label: "Convert to YAML",
                          run: () => {
                            setActiveTab("types");
                            setConverterTab("yaml");
                          },
                        },
                        {
                          label: "Convert to XML",
                          run: () => {
                            setActiveTab("types");
                            setConverterTab("xml");
                          },
                        },
                        { label: "Compare JSON", run: () => setActiveTab("diff") },
                        { label: "Run JSONPath", run: () => setActiveTab("tree") },
                        { label: "Scan Sensitive Data", run: handleMaskSensitiveValues },
                        { label: "Toggle Theme", run: toggleTheme },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={async () => {
                            setShowMoreMenu(false);
                            await item.run();
                          }}
                          className="flex w-full items-center justify-between rounded-[var(--radius)] px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="size-3.5" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="xl:hidden">
                <div className="grid grid-cols-4 gap-2">
                  {MOBILE_SECTIONS.map((section) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => setMobileSection(section)}
                      className={cn(
                        "rounded-[var(--radius)] border px-3 py-2 text-sm font-medium capitalize transition-colors",
                        mobileSection === section
                          ? "border-transparent bg-[image:var(--primary-gradient)] text-white"
                          : "border-border bg-background text-foreground",
                      )}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sensitiveFields.length > 0 && !ignoreSensitiveWarning ? (
              <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-4 text-amber-600 dark:text-amber-300" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Sensitive fields detected
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {sensitiveFields
                        .slice(0, 3)
                        .map((field) => field.key)
                        .join(", ")}
                      {sensitiveFields.length > 3 ? ` and ${sensitiveFields.length - 3} more` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={handleMaskSensitiveValues}>
                    <EyeOff className="size-3.5" />
                    Mask Values
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIgnoreSensitiveWarning(true)}>
                    Ignore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      toast.message("Local-only processing keeps this inside your browser")
                    }
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ) : null}

            <div
              className="grid gap-4 xl:gap-0"
              style={
                isDesktop
                  ? {
                      gridTemplateColumns: `minmax(0, ${panelRatio}fr) 10px minmax(0, ${
                        100 - panelRatio
                      }fr)`,
                    }
                  : undefined
              }
            >
              {(isDesktop || mobileSection === "input") && (
                <EditorPanel
                  editorRef={editorRef}
                  isDarkMode={isDarkMode}
                  lineCount={lineCount}
                  linePosition={linePosition}
                  parseResult={parseResult}
                  sizeInBytes={sizeInBytes}
                  source={source}
                  onChangeSource={setSource}
                  onPasteFromClipboard={handlePasteFromClipboard}
                  onPickFile={openFilePicker}
                  onLinePositionChange={setLinePosition}
                  onUseSample={() => setSource(SAMPLE_USER_JSON)}
                />
              )}

              {isDesktop ? (
                <div
                  className="hidden cursor-col-resize items-center justify-center xl:flex"
                  onPointerDown={startDividerDrag}
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize panels"
                >
                  <div className="h-full w-px bg-border" />
                </div>
              ) : null}

              {(isDesktop || mobileSection !== "input") && (
                <OutputPanel
                  activeTab={resolvedActiveTab}
                  converterOutput={converterOutput}
                  converterTab={converterTab}
                  diffSummary={diffSummary}
                  diffNew={diffNew}
                  diffOld={diffOld}
                  onChangeDiffNew={setDiffNew}
                  onChangeDiffOld={setDiffOld}
                  errorDetails={
                    parseResult && !parseResult.valid
                      ? getErrorDetails(source, parseResult.error)
                      : null
                  }
                  mobileSection={mobileSection}
                  onActiveTabChange={setActiveTab}
                  onConverterTabChange={setConverterTab}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  onHighlightInEditor={handleHighlightInEditor}
                  onSearchTermChange={setSearchTerm}
                  onSelectNode={handleSelectNode}
                  onSetExpandedNodes={setExpandedNodes}
                  onSetMobileSection={setMobileSection}
                  openApiSnippet={openApiSnippet}
                  parsedValue={parsedValue}
                  parseResult={parseResult}
                  reactQuerySnippet={reactQuerySnippet}
                  roleMode={roleMode}
                  searchMatches={searchMatches}
                  searchTerm={searchTerm}
                  selectedNode={selectedNode}
                  suspiciousWarnings={suspiciousWarnings}
                  stats={stats}
                  axiosSnippet={axiosSnippet}
                  expandedNodes={expandedNodes}
                />
              )}
            </div>

            {selectedNode ? (
              <SelectedPathBar selectedNode={selectedNode} onCopy={handleCopy} />
            ) : null}
          </div>
        </div>
      </div>

      {isCommandOpen ? (
        <CommandPalette
          actions={filteredCommands}
          activeIndex={commandIndex}
          inputRef={commandInputRef}
          query={commandQuery}
          onClose={() => {
            setIsCommandOpen(false);
            setCommandQuery("");
          }}
          onEnter={async () => runCommand(filteredCommands[commandIndex])}
          onMoveDown={() =>
            setCommandIndex((current) =>
              Math.min(current + 1, Math.max(filteredCommands.length - 1, 0)),
            )
          }
          onMoveUp={() => setCommandIndex((current) => Math.max(current - 1, 0))}
          onQueryChange={setCommandQuery}
          onSelect={async (index) => runCommand(filteredCommands[index])}
        />
      ) : null}
    </section>
  );
}

function EditorPanel({
  editorRef,
  isDarkMode,
  lineCount,
  linePosition,
  parseResult,
  sizeInBytes,
  source,
  onChangeSource,
  onLinePositionChange,
  onPasteFromClipboard,
  onPickFile,
  onUseSample,
}: {
  editorRef: React.MutableRefObject<EditorInstance | null>;
  isDarkMode: boolean;
  lineCount: number;
  linePosition: { line: number; column: number };
  parseResult: ReturnType<typeof parseJsonSafe> | null;
  sizeInBytes: number;
  source: string;
  onChangeSource: (value: string) => void;
  onLinePositionChange: React.Dispatch<React.SetStateAction<{ line: number; column: number }>>;
  onPasteFromClipboard: () => Promise<void>;
  onPickFile: () => void;
  onUseSample: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Input JSON</p>
            {parseResult ? (
              parseResult.valid ? (
                <StatusBadge tone="success" icon={CheckCircle2} label="Valid JSON" />
              ) : (
                <StatusBadge tone="error" icon={XCircle} label="Invalid JSON" />
              )
            ) : (
              <StatusBadge tone="neutral" icon={Info} label="Ready for input" />
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">
            Size: {formatBytes(sizeInBytes)} • Lines: {lineCount}
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-foreground"
          title="Formatting, validation, diffing, and conversions stay inside your browser by default."
        >
          <ShieldCheck className="size-3.5 text-primary" />
          Your JSON stays in your browser
        </div>
      </div>

      <div className="relative h-[440px]">
        {!source ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/92 p-6 backdrop-blur-sm">
            <EmptyState
              icon={FileJson2}
              title="Paste JSON to get started."
              description="You can also upload a file, load a URL, or try a sample."
              actions={[
                {
                  label: "Paste from Clipboard",
                  onClick: onPasteFromClipboard,
                },
                {
                  label: "Upload JSON File",
                  onClick: onPickFile,
                  variant: "outline",
                },
                {
                  label: "Try User API Sample",
                  onClick: onUseSample,
                  variant: "outline",
                },
              ]}
            />
          </div>
        ) : null}

        <MonacoEditor
          height="100%"
          language="json"
          theme={isDarkMode ? "vs-dark" : "light"}
          value={source}
          onChange={(value) => onChangeSource(value ?? "")}
          onMount={(instance) => {
            editorRef.current = instance as EditorInstance;
            instance.onDidChangeCursorPosition(
              (event: { position: { lineNumber: number; column: number } }) => {
                onLinePositionChange({
                  line: event.position.lineNumber,
                  column: event.position.column,
                });
              },
            );
          }}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 22,
            tabSize: 2,
            wordWrap: "on",
            fontFamily: "var(--font-geist-mono)",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-2 text-[12px] text-muted-foreground">
        <span>UTF-8</span>
        <span>JSON</span>
        <span>2 spaces</span>
        <span>
          Line {linePosition.line}, Column {linePosition.column}
        </span>
      </div>
    </div>
  );
}

function OutputPanel({
  activeTab,
  converterOutput,
  converterTab,
  diffSummary,
  diffNew,
  diffOld,
  onActiveTabChange,
  onChangeDiffNew,
  onChangeDiffOld,
  onConverterTabChange,
  onCopy,
  onDownload,
  onHighlightInEditor,
  onSearchTermChange,
  onSelectNode,
  onSetExpandedNodes,
  onSetMobileSection,
  errorDetails,
  mobileSection,
  openApiSnippet,
  parsedValue,
  parseResult,
  reactQuerySnippet,
  roleMode,
  searchMatches,
  searchTerm,
  selectedNode,
  suspiciousWarnings,
  stats,
  axiosSnippet,
  expandedNodes,
}: {
  activeTab: OutputTab;
  converterOutput: string;
  converterTab: ConverterTab;
  diffSummary: DiffSummary | null;
  diffNew: string;
  diffOld: string;
  onActiveTabChange: (value: OutputTab) => void;
  onChangeDiffNew: (value: string) => void;
  onChangeDiffOld: (value: string) => void;
  onConverterTabChange: (value: ConverterTab) => void;
  onCopy: (value: string, successMessage?: string) => Promise<void>;
  onDownload: (content: string, filename: string, contentType: string) => void;
  onHighlightInEditor: () => void;
  onSearchTermChange: (value: string) => void;
  onSelectNode: (path: string) => void;
  onSetExpandedNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSetMobileSection: (value: MobileSection) => void;
  errorDetails: { problem: string; why: string; fix: string } | null;
  mobileSection: MobileSection;
  openApiSnippet: string;
  parsedValue: JsonValue | null;
  parseResult: ReturnType<typeof parseJsonSafe> | null;
  reactQuerySnippet: string;
  roleMode: RoleMode;
  searchMatches: SearchMatch[];
  searchTerm: string;
  selectedNode: SelectedNode | null;
  suspiciousWarnings: Array<{ path: string }>;
  stats: JsonStats | null;
  axiosSnippet: string;
  expandedNodes: Record<string, boolean>;
}) {
  const showOutputShell =
    mobileSection === "output" || mobileSection === "tree" || mobileSection === "errors";

  if (!showOutputShell) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-background">
      <div className="space-y-4 border-b border-border px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ListTree className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Output panel</p>
            </div>
            <p className="text-[13px] text-muted-foreground">
              Tabs stay contextual to the selected role mode so the workspace feels less crowded.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <Input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search key, value, or path..."
              aria-label="Search JSON"
            />
          </div>
        </div>

        {searchMatches.length > 0 ? (
          <SearchResultsPanel
            matches={searchMatches}
            onPick={(match) => {
              onSelectNode(match.path);
              onActiveTabChange("tree");
              onSetMobileSection("output");
              expandPath(match.path, onSetExpandedNodes);
            }}
            onReset={() => onSearchTermChange("")}
          />
        ) : null}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => onActiveTabChange(value as OutputTab)}
        className="min-h-[440px]"
      >
        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto border-b border-border px-4 py-2"
        >
          {roleMode.tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === "formatted" ? "Formatted" : capitalize(tab)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="p-4">
          <TabsContent value="tree" className="space-y-4">
            {parsedValue ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                    <span className="rounded-full border border-border bg-secondary px-2.5 py-1">
                      Objects {stats?.objects ?? 0}
                    </span>
                    <span className="rounded-full border border-border bg-secondary px-2.5 py-1">
                      Arrays {stats?.arrays ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="xs" onClick={() => onSetExpandedNodes({})}>
                      Expand default
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => collapseAllNodes(parsedValue, onSetExpandedNodes)}
                    >
                      Collapse all
                    </Button>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-auto rounded-[var(--radius-card)] border border-border bg-secondary/40 p-3">
                  <TreeNode
                    label="root"
                    path="$"
                    value={parsedValue}
                    depth={0}
                    selectedPath={selectedNode?.path ?? null}
                    expandedNodes={expandedNodes}
                    onToggle={(path, open) =>
                      onSetExpandedNodes((current) => ({
                        ...current,
                        [path]: open,
                      }))
                    }
                    onSelect={onSelectNode}
                    onCopy={onCopy}
                  />
                </div>
              </>
            ) : (
              <EmptyState
                icon={ListTree}
                title="Valid JSON will appear as an interactive tree here."
                description="Fix the editor input first, then expand nodes and inspect exact JSONPath values."
              />
            )}
          </TabsContent>

          <TabsContent value="formatted" className="space-y-4">
            {parsedValue ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      onCopy(JSON.stringify(parsedValue, null, 2), "Copied formatted JSON")
                    }
                  >
                    <Copy className="size-3.5" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onDownload(
                        JSON.stringify(parsedValue, null, 2),
                        "formatted.json",
                        "application/json",
                      )
                    }
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </div>
                <CodeBlock content={JSON.stringify(parsedValue, null, 2)} />
              </>
            ) : (
              <EmptyState
                icon={FileCode2}
                title="Formatted JSON shows up here."
                description="Use valid JSON in the editor to generate a clean formatted output."
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {stats ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {buildStatsCards(stats, parseResult?.valid ?? false).map((item) => (
                    <JsonStatsCard key={item.label} label={item.label} value={String(item.value)} />
                  ))}
                </div>

                {suspiciousWarnings.length > 0 ? (
                  <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Possible issue
                    </p>
                    <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                      {suspiciousWarnings[0]?.path} is a string but looks like a number.
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState
                icon={TableProperties}
                title="Stats appear after successful parsing."
                description="You will see structure depth, primitive counts, and sensitive-field signals here."
              />
            )}
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            {parsedValue ? (
              <>
                <ConverterTabs activeTab={converterTab} onChange={onConverterTabChange} />
                <ConverterOutput
                  content={converterOutput}
                  converterTab={converterTab}
                  onCopy={onCopy}
                  onDownload={onDownload}
                />

                {roleMode.id === "frontend" ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <SnippetCard
                      title="Axios snippet"
                      description="Starter fetch flow for a REST endpoint."
                      code={axiosSnippet}
                      onCopy={onCopy}
                    />
                    <SnippetCard
                      title="React Query snippet"
                      description="Quick hook pattern for typed caching."
                      code={reactQuerySnippet}
                      onCopy={onCopy}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState
                icon={Code2}
                title="Generate TypeScript types from your JSON response."
                description="Add valid JSON to generate converter output like TypeScript, Zod, CSV, YAML, and XML."
              />
            )}
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            {parsedValue ? (
              <>
                <ConverterTabs activeTab={converterTab} onChange={onConverterTabChange} />
                <ConverterOutput
                  content={converterOutput}
                  converterTab={converterTab}
                  onCopy={onCopy}
                  onDownload={onDownload}
                />

                {(roleMode.id === "backend" || roleMode.id === "general") && openApiSnippet ? (
                  <SnippetCard
                    title="OpenAPI starter"
                    description="A lightweight schema-to-contract preview."
                    code={openApiSnippet}
                    onCopy={onCopy}
                  />
                ) : null}
              </>
            ) : (
              <EmptyState
                icon={Database}
                title="Schema output will appear here."
                description="Fix JSON first, then generate JSON Schema, Zod, Prisma, or Mongoose output."
              />
            )}
          </TabsContent>

          <TabsContent value="diff" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Old JSON</p>
                <textarea
                  value={diffOld}
                  onChange={(event) => onChangeDiffOld(event.target.value)}
                  className="h-44 w-full rounded-[var(--radius-input)] border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">New JSON</p>
                <textarea
                  value={diffNew}
                  onChange={(event) => onChangeDiffNew(event.target.value)}
                  className="h-44 w-full rounded-[var(--radius-input)] border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>

            {diffSummary ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <JsonStatsCard label="Added fields" value={String(diffSummary.added.length)} />
                  <JsonStatsCard
                    label="Removed fields"
                    value={String(diffSummary.removed.length)}
                  />
                  <JsonStatsCard
                    label="Changed values"
                    value={String(diffSummary.changed.length)}
                  />
                  <JsonStatsCard
                    label="Type changes"
                    value={String(diffSummary.typeChanges.length)}
                  />
                </div>

                <div className="rounded-[var(--radius-card)] border border-border bg-secondary/40 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {diffSummary.changed.length} changed • {diffSummary.added.length} added •{" "}
                    {diffSummary.removed.length} removed • {diffSummary.typeChanges.length} type
                    mismatch
                  </p>
                  <div className="mt-4 grid gap-3">
                    {[
                      ...diffSummary.changed.slice(0, 2).map((item) => `Changed: ${item}`),
                      ...diffSummary.typeChanges.slice(0, 2).map((item) => `Type changed: ${item}`),
                      ...diffSummary.removed.slice(0, 2).map((item) => `Removed: ${item}`),
                    ].map((line) => (
                      <div
                        key={line}
                        className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Bug}
                title="Paste old and new JSON to compare changes."
                description="The diff tool highlights changed values, type mismatches, added keys, and removed fields."
              />
            )}
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            {parseResult && !parseResult.valid && errorDetails ? (
              <ErrorPanel
                error={parseResult}
                details={errorDetails}
                onCopy={onCopy}
                onHighlight={onHighlightInEditor}
              />
            ) : (
              <div className="space-y-4">
                <div className="rounded-[var(--radius-card)] border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-300" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        JSON syntax is valid
                      </p>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        Every future error will include the problem, why it is wrong, and a
                        suggested fix.
                      </p>
                    </div>
                  </div>
                </div>

                {roleMode.id === "student" ? (
                  <div className="grid gap-4 lg:grid-cols-3">
                    <RuleCard
                      title="No trailing commas"
                      body='JSON does not allow a comma after the last field like `"name": "Ali",`'
                    />
                    <RuleCard
                      title="Double quotes only"
                      body="Keys and strings must use double quotes, not single quotes."
                    />
                    <RuleCard
                      title="Comments are invalid"
                      body="JSON is data only, so inline comments are not allowed."
                    />
                  </div>
                ) : null}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ConverterTabs({
  activeTab,
  onChange,
}: {
  activeTab: ConverterTab;
  onChange: (value: ConverterTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONVERTER_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "rounded-[var(--radius)] border px-3 py-1.5 text-[13px] font-medium transition-colors",
            activeTab === tab
              ? "border-transparent bg-[image:var(--primary-gradient)] text-white"
              : "border-border bg-secondary text-foreground",
          )}
        >
          {tab === "typescript" ? "TypeScript" : tab === "yaml" ? "YAML" : capitalize(tab)}
        </button>
      ))}
    </div>
  );
}

function ConverterOutput({
  content,
  converterTab,
  onCopy,
  onDownload,
}: {
  content: string;
  converterTab: ConverterTab;
  onCopy: (value: string, successMessage?: string) => Promise<void>;
  onDownload: (content: string, filename: string, contentType: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onCopy(content, `Copied ${converterTab} output`)}>
          <Copy className="size-3.5" />
          Copy
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDownload(content, `jsonlens-${converterTab}.txt`, "text/plain")}
        >
          <Download className="size-3.5" />
          Download
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Regenerated output")}>
          Regenerate
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.success("Output is already formatted")}
        >
          Format Output
        </Button>
      </div>

      {content ? (
        <CodeBlock content={content} />
      ) : (
        <EmptyState
          icon={WandSparkles}
          title={`Cannot generate ${capitalize(converterTab)} because JSON is invalid.`}
          description="Fix JSON first."
        />
      )}
    </div>
  );
}

function SearchResultsPanel({
  matches,
  onPick,
  onReset,
}: {
  matches: SearchMatch[];
  onPick: (match: SearchMatch) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-secondary p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-foreground">{matches.length} matches found</p>
        <Button variant="ghost" size="xs" onClick={onReset}>
          Clear
        </Button>
      </div>
      <div className="grid gap-2">
        {matches.slice(0, 8).map((match) => (
          <button
            key={match.path}
            type="button"
            onClick={() => onPick(match)}
            className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-card"
          >
            <div>
              <p className="font-mono text-[12px] text-foreground">{match.path}</p>
              <p className="text-[12px] text-muted-foreground">{match.preview}</p>
            </div>
            <Search className="size-4 text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectedPathBar({
  selectedNode,
  onCopy,
}: {
  selectedNode: SelectedNode;
  onCopy: (value: string, successMessage?: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-secondary px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">Selected</p>
        <p className="mt-1 font-mono text-[13px] text-foreground">{selectedNode.path}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopy(selectedNode.path, "Copied JSONPath")}
        >
          Copy Path
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopy(renderJsonValue(selectedNode.value), "Copied selected value")}
        >
          Copy Value
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onCopy(JSON.stringify(selectedNode.value, null, 2), "Copied selected object")
          }
        >
          Copy Object
        </Button>
      </div>
    </div>
  );
}

function ErrorPanel({
  error,
  details,
  onCopy,
  onHighlight,
}: {
  error: Exclude<ReturnType<typeof parseJsonSafe>, null | { valid: true }>;
  details: { problem: string; why: string; fix: string };
  onCopy: (value: string, successMessage?: string) => Promise<void>;
  onHighlight: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-5 dark:border-red-500/20 dark:bg-red-500/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-red-900 dark:text-red-100">Invalid JSON</p>
          <p className="text-sm text-red-700 dark:text-red-200">
            Line {error.line ?? 1}, Column {error.column ?? 1}
          </p>
        </div>
        <StatusBadge tone="error" icon={AlertTriangle} label="Syntax issue" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <RuleCard title="Problem" body={details.problem} tone="error" />
        <RuleCard title="Why this is wrong" body={details.why} tone="error" />
        <RuleCard title="Suggested fix" body={details.fix} tone="error" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={onHighlight}>
          Highlight in Editor
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopy(error.error, "Copied error message")}
        >
          Copy Error
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            toast.message("JSON rules: no comments, no trailing commas, and double quotes only")
          }
        >
          Learn JSON Rules
        </Button>
      </div>
    </div>
  );
}

function CommandPalette({
  actions,
  activeIndex,
  inputRef,
  query,
  onClose,
  onEnter,
  onMoveDown,
  onMoveUp,
  onQueryChange,
  onSelect,
}: {
  actions: CommandAction[];
  activeIndex: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  query: string;
  onClose: () => void;
  onEnter: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onQueryChange: (value: string) => void;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-[12vh] w-full max-w-2xl rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-floating)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Command className="size-4 text-primary" />
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
                  onEnter();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  onClose();
                }
              }}
              placeholder="Search commands..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Command palette search"
            />
          </div>
        </div>

        <div className="max-h-[420px] overflow-auto p-2">
          {actions.length > 0 ? (
            actions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[var(--radius)] px-3 py-3 text-left transition-colors",
                  activeIndex === index ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  {action.hint ? (
                    <p className="text-[13px] text-muted-foreground">{action.hint}</p>
                  ) : null}
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))
          ) : (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  actions,
  description,
  icon: Icon,
  title,
}: {
  actions?: Array<{
    label: string;
    onClick: () => void | Promise<void>;
    variant?: "default" | "outline";
  }>;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-[var(--radius-card)] bg-[image:var(--primary-gradient)] text-white">
        <Icon className="size-5" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions?.length ? (
        <div className="flex flex-wrap justify-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant ?? "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground">
      <div className="flex items-center gap-3">
        <RefreshCw className="size-4 animate-spin text-primary" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function StatusBadge({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "success" | "error" | "neutral";
}) {
  const toneClasses =
    tone === "success"
      ? "bg-[#DCFCE7] text-[#166534] dark:bg-[#052e24] dark:text-[#6ee7b7]"
      : tone === "error"
      ? "bg-[#FEE2E2] text-[#991B1B] dark:bg-[#450a0a] dark:text-[#fca5a5]"
      : "border border-border bg-secondary text-muted-foreground";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium",
        toneClasses,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </div>
  );
}

function JsonStatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-secondary/60 p-4">
      <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function RuleCard({
  title,
  body,
  tone = "default",
}: {
  title: string;
  body: string;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border p-4",
        tone === "error"
          ? "border-red-200 bg-white/80 dark:border-red-500/20 dark:bg-red-950/30"
          : "border-border bg-secondary/50",
      )}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function SnippetCard({
  title,
  description,
  code,
  onCopy,
}: {
  title: string;
  description: string;
  code: string;
  onCopy: (value: string, successMessage?: string) => Promise<void>;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-secondary/40 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-[13px] text-muted-foreground">{description}</p>
        </div>
        <Button size="xs" variant="outline" onClick={() => onCopy(code, `Copied ${title}`)}>
          Copy
        </Button>
      </div>
      <CodeBlock content={code} />
    </div>
  );
}

function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="overflow-auto rounded-[var(--radius-card)] border border-border bg-secondary/40 p-4 font-mono text-[13px] leading-6 text-foreground">
      {content}
    </pre>
  );
}

function TreeNode({
  label,
  path,
  value,
  depth,
  selectedPath,
  expandedNodes,
  onToggle,
  onSelect,
  onCopy,
}: {
  label: string;
  path: string;
  value: JsonValue;
  depth: number;
  selectedPath: string | null;
  expandedNodes: Record<string, boolean>;
  onToggle: (path: string, open: boolean) => void;
  onSelect: (path: string) => void;
  onCopy: (value: string, successMessage?: string) => Promise<void>;
}) {
  const isContainer = Array.isArray(value) || (value !== null && typeof value === "object");
  const isExpanded = expandedNodes[path] ?? depth < 1;
  const preview = getNodePreview(value);
  const isSelected = selectedPath === path;
  const entries = Array.isArray(value)
    ? value.map((child, index) => [String(index), child] as const)
    : value !== null && typeof value === "object"
    ? Object.entries(value)
    : [];

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "group flex items-start gap-2 rounded-[var(--radius)] px-2 py-1.5 transition-colors",
          isSelected ? "bg-primary/10" : "hover:bg-background",
        )}
      >
        {isContainer ? (
          <button
            type="button"
            onClick={() => onToggle(path, !isExpanded)}
            className="mt-0.5 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="mt-0.5 inline-flex w-3.5" />
        )}

        <button
          type="button"
          onClick={() => onSelect(path)}
          className="flex-1 text-left font-mono text-[13px] leading-6"
        >
          <span className="text-primary">{label}</span>
          <span className="text-muted-foreground">: </span>
          <span className="text-foreground">{preview}</span>
        </button>

        <div className="hidden gap-1 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onCopy(path, "Copied JSONPath")}
            title="Copy path"
          >
            <Copy className="size-3" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onCopy(renderJsonValue(value), "Copied selected value")}
            title="Copy value"
          >
            <ClipboardPaste className="size-3" />
          </Button>
        </div>
      </div>

      {isContainer && isExpanded ? (
        <div className="ml-4 border-l border-border pl-3">
          {entries.map(([entryKey, childValue]) => (
            <TreeNode
              key={`${path}-${entryKey}`}
              label={Array.isArray(value) ? `[${entryKey}]` : entryKey}
              path={appendPath(path, Array.isArray(value) ? Number(entryKey) : entryKey)}
              value={childValue}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onSelect={onSelect}
              onCopy={onCopy}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildStatsCards(stats: JsonStats, isValid: boolean) {
  return [
    { label: "Valid JSON", value: isValid ? "Yes" : "No" },
    { label: "Size", value: formatBytes(stats.bytes) },
    { label: "Objects", value: stats.objects },
    { label: "Arrays", value: stats.arrays },
    { label: "Keys", value: stats.keys },
    { label: "Max Depth", value: stats.maxDepth },
    { label: "Strings", value: stats.strings },
    { label: "Numbers", value: stats.numbers },
    { label: "Booleans", value: stats.booleans },
    { label: "Nulls", value: stats.nulls },
    { label: "Sensitive Fields", value: stats.sensitiveFields },
  ];
}

function getConverterOutput(outputs: {
  converterTab: ConverterTab;
  typeScriptOutput: string;
  zodOutput: string;
  csvOutput: string;
  yamlOutput: string;
  xmlOutput: string;
  schemaOutput: string;
  prismaOutput: string;
  mongooseOutput: string;
}) {
  switch (outputs.converterTab) {
    case "typescript":
      return outputs.typeScriptOutput;
    case "zod":
      return outputs.zodOutput;
    case "csv":
      return outputs.csvOutput;
    case "yaml":
      return outputs.yamlOutput;
    case "xml":
      return outputs.xmlOutput;
    case "schema":
      return outputs.schemaOutput;
    case "prisma":
      return outputs.prismaOutput;
    case "mongoose":
      return outputs.mongooseOutput;
    default:
      return "";
  }
}

function getErrorDetails(source: string, message: string) {
  const friendly = getFriendlyJsonError(message);
  const lines = source.split(/\r?\n/);
  const trailingCommaLine = lines.find((line) => /,\s*[}\]]/.test(line));

  if (trailingCommaLine) {
    return {
      problem: "You added a comma after the last property.",
      why: "JSON does not allow trailing commas.",
      fix: `Remove the comma after ${extractLastKey(trailingCommaLine)}.`,
    };
  }

  if (/expected property name/i.test(message)) {
    return {
      problem: "A property name is not wrapped in double quotes.",
      why: "JSON requires every object key to use double quotes.",
      fix: 'Wrap the property name in double quotes, for example "email".',
    };
  }

  return {
    problem: message,
    why: friendly,
    fix: "Review the highlighted line for missing quotes, commas, or brackets, then validate again.",
  };
}

function extractLastKey(line: string) {
  const keyMatch = line.match(/"([^"]+)"/g);
  const lastKey = keyMatch?.at(-1)?.replaceAll('"', "");
  return lastKey ? `"${lastKey}"` : "the last field";
}

function repairJsonInput(source: string) {
  return source.replace(/,\s*([}\]])/g, "$1");
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

function appendPath(parent: string, segment: string | number) {
  if (typeof segment === "number") {
    return `${parent}[${segment}]`;
  }

  if (/^[A-Za-z_$][\w$]*$/.test(segment)) {
    return `${parent}.${segment}`;
  }

  return `${parent}[${JSON.stringify(segment)}]`;
}

function renderJsonValue(value: JsonValue) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function getNodePreview(value: JsonValue) {
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

function getFirstSelectableNode(value: JsonValue): SelectedNode | null {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { path: "$", value };
    }

    return {
      path: appendPath("$", 0),
      value: value[0],
    };
  }

  if (value !== null && typeof value === "object") {
    const firstEntry = Object.entries(value)[0];
    if (!firstEntry) {
      return { path: "$", value };
    }

    return {
      path: appendPath("$", firstEntry[0]),
      value: firstEntry[1],
    };
  }

  return { path: "$", value };
}

function findSearchMatches(value: JsonValue, term: string) {
  const normalizedTerm = term.toLowerCase();
  const matches: SearchMatch[] = [];

  const visit = (current: JsonValue, path: string, keyLabel: string) => {
    const preview = getNodePreview(current);
    const haystacks = [path.toLowerCase(), keyLabel.toLowerCase(), preview.toLowerCase()];

    if (haystacks.some((entry) => entry.includes(normalizedTerm))) {
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

function getTableData(value: JsonValue | null) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const rows = value.filter(
    (item): item is Record<string, JsonValue> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );

  if (rows.length !== value.length) {
    return null;
  }

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return { columns, rows };
}

function collectWarnings(value: JsonValue) {
  const warnings: Array<{ path: string }> = [];

  const visit = (current: JsonValue, path: string) => {
    if (typeof current === "string" && /^\d+(\.\d+)?$/.test(current)) {
      warnings.push({ path });
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, appendPath(path, index)));
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => visit(child, appendPath(path, key)));
    }
  };

  visit(value, "$");
  return warnings;
}

function collectSensitiveFields(value: JsonValue) {
  const fields: Array<{ key: string; path: string }> = [];

  const visit = (current: JsonValue, path: string) => {
    if (current !== null && typeof current === "object" && !Array.isArray(current)) {
      Object.entries(current).forEach(([key, child]) => {
        const nextPath = appendPath(path, key);

        if (/(password|token|secret|api[_-]?key|authorization|client_secret)/i.test(key)) {
          fields.push({ key, path: nextPath });
        }

        visit(child, nextPath);
      });
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((child, index) => visit(child, appendPath(path, index)));
    }
  };

  visit(value, "$");
  return fields;
}

function maskSensitiveValues(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(maskSensitiveValues);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        /(password|token|secret|api[_-]?key|authorization|client_secret)/i.test(key)
          ? "[masked]"
          : maskSensitiveValues(child),
      ]),
    );
  }

  return value;
}

function getValueAtPath(value: JsonValue, path: string) {
  if (path === "$") {
    return value;
  }

  const segments = Array.from(
    path.matchAll(/(?:\.([A-Za-z_$][\w$]*))|\[(\d+|"(?:[^"\\]|\\.)*")\]/g),
  );
  let current: JsonValue = value;

  for (const match of segments) {
    const property = match[1];
    const bracket = match[2];
    const segment = property ?? (bracket?.startsWith('"') ? JSON.parse(bracket) : Number(bracket));

    if (Array.isArray(current) && typeof segment === "number") {
      current = current[segment];
      continue;
    }

    if (current !== null && typeof current === "object" && typeof segment === "string") {
      current = (current as Record<string, JsonValue>)[segment];
      continue;
    }

    return undefined;
  }

  return current;
}

function expandPath(
  path: string,
  setExpandedNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
) {
  const segments = path
    .replace(/^\$\./, "")
    .replace(/^\$/, "")
    .split(/(?=\.)|(?=\[)/)
    .filter(Boolean);

  let current = "$";
  setExpandedNodes((existing) => {
    const next: Record<string, boolean> = { ...existing, $: true };

    segments.forEach((segment) => {
      if (segment.startsWith(".")) {
        current = appendPath(current, segment.slice(1));
      } else if (segment.startsWith("[")) {
        current = appendPath(current, Number(segment.slice(1, -1)));
      }

      next[current] = true;
    });

    return next;
  });
}

function collapseAllNodes(
  value: JsonValue,
  setExpandedNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
) {
  const next: Record<string, boolean> = { $: false };

  const visit = (current: JsonValue, path: string) => {
    if (Array.isArray(current)) {
      current.forEach((child, index) => {
        const nextPath = appendPath(path, index);
        next[nextPath] = false;
        visit(child, nextPath);
      });
      return;
    }

    if (current !== null && typeof current === "object") {
      Object.entries(current).forEach(([key, child]) => {
        const nextPath = appendPath(path, key);
        next[nextPath] = false;
        visit(child, nextPath);
      });
    }
  };

  visit(value, "$");
  setExpandedNodes(next);
}

function generateTypeScript(name: string, value: JsonValue) {
  return `export interface ${name} ${toTypeScriptShape(value, 0)}\n`;
}

function toTypeScriptShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) {
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
        .map(
          ([key, child]) =>
            `${nextIndent}${quoteKeyIfNeeded(key)}: ${toTypeScriptShape(child, depth + 1)};`,
        )
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
    const child = value.length > 0 ? value[0] : null;
    return `z.array(${toZodShape(child, depth)})`;
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
        .map(
          ([key, child]) =>
            `${nextIndent}${quoteKeyIfNeeded(key)}: ${toZodShape(child, depth + 1)},`,
        )
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
  const tableData = getTableData(value);
  if (!tableData) {
    return "";
  }

  return Papa.unparse(tableData.rows);
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

function toMongooseShape(value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    const first = value[0] ?? null;
    return `[${toMongooseShape(first, depth)}]`;
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
        .map(
          ([key, child]) =>
            `${nextIndent}${quoteKeyIfNeeded(key)}: ${toMongooseShape(child, depth + 1)},`,
        )
        .join("\n")}\n${indent}}`;
    default:
      return "Schema.Types.Mixed";
  }
}

function generateAxiosSnippet() {
  return `import axios from "axios";\n\nexport async function fetchUsers() {\n  const response = await axios.get<RootPayload>("/api/users");\n  return response.data;\n}`;
}

function generateReactQuerySnippet() {
  return `import { useQuery } from "@tanstack/react-query";\n\nexport function useUsers() {\n  return useQuery({\n    queryKey: ["users"],\n    queryFn: fetchUsers,\n  });\n}`;
}

function generateOpenApiSnippet(value: JsonValue) {
  const schema = JSON.stringify(generateJsonSchema(value), null, 2);
  return `components:\n  schemas:\n    RootPayload: ${schema.replace(/\n/g, "\n      ")}`;
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

function sanitizeFieldName(key: string) {
  return key.replace(/[^A-Za-z0-9_]/g, "_");
}

function quoteKeyIfNeeded(key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function buildDiffSummary(oldSource: string, newSource: string) {
  const oldParsed = parseJsonSafe(oldSource);
  const newParsed = parseJsonSafe(newSource);

  if (!oldParsed.valid || !newParsed.valid) {
    return null;
  }

  const summary: DiffSummary = {
    added: [],
    removed: [],
    changed: [],
    typeChanges: [],
  };

  compareValues("$", oldParsed.data, newParsed.data, summary);
  return summary;
}

function compareValues(
  path: string,
  oldValue: JsonValue,
  newValue: JsonValue,
  summary: DiffSummary,
) {
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const maxLength = Math.max(oldValue.length, newValue.length);
    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = appendPath(path, index);
      if (index >= oldValue.length) {
        summary.added.push(`${nextPath}`);
      } else if (index >= newValue.length) {
        summary.removed.push(`${nextPath}`);
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
