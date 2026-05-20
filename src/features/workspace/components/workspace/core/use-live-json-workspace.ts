"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getJsonStats, parseJsonSafe } from "@/lib/json";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { JsonParseResult, JsonValue } from "@/types/json";
import type { JsonWorkerResponse } from "@/workers/json-worker";

import {
  ROLE_MODE_INFO,
  SAMPLE_DIFF_NEW,
  SAMPLE_DIFF_OLD,
  SAMPLE_JSON,
  SAMPLE_JWT,
} from "./constants";
import type {
  ConverterTab,
  EditorInstance,
  HistoryItem,
  InspectorView,
  RoleMode,
  RoleModeAction,
  WorkspaceView,
} from "./types";
import {
  buildDiffSummary,
  buildIntelligentIssues,
  decodeJwtInput,
  emptyStats,
  findSearchMatches,
  getConverterOutput,
  getFirstSelectableNode,
  getValueAtPath,
  maskSensitiveValues,
  repairJsonInput,
} from "../shared/utils";

export function useLiveJsonWorkspace() {
  const editorRef = useRef<EditorInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("editor");
  const [previousWorkspaceView, setPreviousWorkspaceView] = useState<WorkspaceView>("editor");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [roleMode, setRoleMode] = useState<RoleMode>("General");
  const [inspectorView, setInspectorView] = useState<InspectorView>("status");
  const [source, setSource] = useState(SAMPLE_JSON);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlLoadingState, setUrlLoadingState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [linePosition, setLinePosition] = useState({ line: 1, column: 1 });
  const [historyItems, setHistoryItems] = useLocalStorage<HistoryItem[]>("jsonova-history", [
    { id: "1", label: "Workspace opened", detail: "General mode • Editor" },
    { id: "2", label: "Sample JSON loaded", detail: "input.json" },
  ]);
  const [diffOld, setDiffOld] = useState(SAMPLE_DIFF_OLD);
  const [diffNew, setDiffNew] = useState(SAMPLE_DIFF_NEW);
  const [converterTab, setConverterTab] = useState<ConverterTab>("TypeScript");
  const [jwtInput, setJwtInput] = useState(SAMPLE_JWT);

  const [parseResult, setParseResult] = useState<JsonParseResult | null>(() => {
    return parseJsonSafe(SAMPLE_JSON);
  });
  const [isParsing, setIsParsing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("../../../../../workers/json-worker.ts", import.meta.url)
    );

    worker.onmessage = (event: MessageEvent<JsonWorkerResponse>) => {
      const { id, valid, data, error, line, column } = event.data;
      if (id === activeRequestIdRef.current) {
        if (valid) {
          setParseResult({ valid: true, data: data as JsonValue });
        } else {
          setParseResult({
            valid: false,
            error: error || "Unable to parse JSON input.",
            line,
            column,
          });
        }
        setIsParsing(false);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (!source.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParseResult(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsParsing(false);
      return;
    }

    if (source.length >= 100_000) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsParsing(true);
      const id = `${Date.now()}-${Math.random()}`;
      activeRequestIdRef.current = id;
      workerRef.current?.postMessage({ id, source });
    } else {
      activeRequestIdRef.current = null;
      const res = parseJsonSafe(source);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParseResult(res);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsParsing(false);
    }
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
  const decodedJwt = useMemo(() => decodeJwtInput(jwtInput), [jwtInput]);

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
        setShowShortcutsModal(false);
        setShowShareModal(false);
        setShowCommandPalette(true);
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "?") {
        event.preventDefault();
        setShowCommandPalette(false);
        setShowShortcutsModal(true);
        return;
      }

      if (event.key === "Escape" && showShortcutsModal) {
        event.preventDefault();
        setShowShortcutsModal(false);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setShowCommandPalette(false);
        setShowShortcutsModal(false);
        setShowShareModal(true);
        return;
      }

      if (event.key === "Escape" && showShareModal) {
        event.preventDefault();
        setShowShareModal(false);
        return;
      }

      if (!showCommandPalette) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setShowCommandPalette(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCommandPalette, showShareModal, showShortcutsModal]);

  useEffect(() => {
    if (showCommandPalette) {
      window.setTimeout(() => commandInputRef.current?.focus(), 30);
    }
  }, [showCommandPalette]);

  const addHistory = (label: string, detail: string) => {
    setHistoryItems((current) => {
      const next = [
        {
          id: `${Date.now()}-${Math.random()}`,
          label,
          detail,
        },
        ...current,
      ];
      return next.slice(0, 50);
    });
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

  const handleRoleAction = (action: RoleModeAction) => {
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
      toast.error("There is nothing to copy yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(message);
      addHistory("Copied content", message);
    } catch {
      toast.error("Clipboard access is blocked right now");
    }
  };

  const handleDownload = (content: string, filename: string) => {
    if (!content) {
      toast.error("There is no content ready to download yet");
      return;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully");
    addHistory("Downloaded file", filename);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error("Your clipboard is empty");
        return;
      }

      setSource(text);
      toast.success("Pasted from clipboard");
      addHistory("Pasted clipboard", "Editor input updated");
    } catch {
      toast.error("Clipboard access is blocked right now");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // BUG-008: guard against huge files before reading into memory
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`);
      event.target.value = "";
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
      toast.error("Please fix the JSON before formatting it");
      return;
    }

    setSource(JSON.stringify(parsedValue, null, 2));
    toast.success("Formatted successfully");
    addHistory("Formatted JSON", roleMode);
  };

  const handleMinify = () => {
    if (!parsedValue) {
      toast.error("Please fix the JSON before minifying it");
      return;
    }

    setSource(JSON.stringify(parsedValue));
    toast.success("Minified successfully");
    addHistory("Minified JSON", roleMode);
  };

  const handleRepair = () => {
    if (parseResult?.valid) {
      toast.success("JSON already looks good");
      return;
    }

    setSource(repairJsonInput(source));
    toast.success("Applied a safe repair pass");
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

    // BUG-002 Fix A: enforce HTTPS only
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlValue);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    if (parsedUrl.protocol !== "https:") {
      toast.error("Only HTTPS URLs are supported for security reasons");
      return;
    }

    // BUG-002 Fix C: abort after 10 seconds
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

    setUrlLoadingState("loading");
    try {
      const response = await fetch(urlValue, { signal: controller.signal });
      clearTimeout(timeoutId);

      // BUG-002 Fix B: check HTTP status before parsing
      if (!response.ok) {
        toast.error(`Server returned ${response.status} — ${response.statusText}`);
        setUrlLoadingState("error");
        return;
      }

      const json = (await response.json()) as unknown;
      setSource(JSON.stringify(json, null, 2));
      setShowUrlInput(false);
      setUrlLoadingState("success");
      toast.success("JSON loaded from URL");
      addHistory("Loaded URL", urlValue);
    } catch (err) {
      clearTimeout(timeoutId);
      setUrlLoadingState("error");
      if (err instanceof Error && err.name === "AbortError") {
        toast.error("Request timed out — the server took too long to respond");
      } else {
        toast.error("Unable to load JSON from that URL — check CORS settings or the URL");
      }
    }
  };;

  const handleRunCommand = (commandId: string) => {
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

  const clearEditor = () => {
    setSource("");
    toast.success("Editor cleared");
    addHistory("Cleared editor", "input.json");
  };

  const loadSampleJson = () => {
    setSource(SAMPLE_JSON);
    toast.success("Sample JSON loaded");
  };

  const activateSearch = () => {
    if (workspaceView === "editor") {
      setInspectorView("search");
    }
  };

  const activateTreeInspector = () => {
    openWorkspace("editor");
    setInspectorView("tree");
  };

  const handleNewDocument = () => {
    setWorkspaceView("editor");
    setPreviousWorkspaceView("editor");
    setRoleMode("General");
    setInspectorView("status");
    setSource("");
    setSelectedPath(null);
    setSearchTerm("");
    setUrlValue("");
    setShowUrlInput(false);
    setLinePosition({ line: 1, column: 1 });
    toast.success("Started a new document");
    addHistory("Started a new document", "Editor reset");
  };

  return {
    refs: {
      editorRef,
      fileInputRef,
      commandInputRef,
    },
    state: {
      workspaceView,
      previousWorkspaceView,
      isSidebarCollapsed,
      roleMode,
      inspectorView,
      source,
      selectedPath,
      searchTerm,
      urlValue,
      showUrlInput,
      urlLoadingState,
      showCommandPalette,
      showShortcutsModal,
      showShareModal,
      commandQuery,
      commandIndex,
      linePosition,
      historyItems,
      diffOld,
      diffNew,
      converterTab,
      jwtInput,
      isParsing,
    },
    derived: {
      parseResult,
      parsedValue,
      stats,
      formattedOutput,
      searchMatches,
      selectedNode,
      intelligentIssues,
      converterOutput,
      diffSummary,
      decodedJwt,
      commandItems,
      filteredCommands,
      roleModeInfo,
    },
    actions: {
      setWorkspaceView,
      setPreviousWorkspaceView,
      setIsSidebarCollapsed,
      setRoleMode,
      setInspectorView,
      setSource,
      setSelectedPath,
      setSearchTerm,
      setUrlValue,
      setShowUrlInput,
      setShowCommandPalette,
      setShowShortcutsModal,
      setShowShareModal,
      setCommandQuery,
      setCommandIndex,
      setLinePosition,
      setHistoryItems,
      setDiffOld,
      setDiffNew,
      setConverterTab,
      setJwtInput,
      addHistory,
      openWorkspace,
      openConverterWorkspace,
      handleRoleAction,
      handleCopy,
      handleDownload,
      handlePaste,
      handleUpload,
      handleFormat,
      handleMinify,
      handleRepair,
      handleMaskSensitive,
      handleLoadUrl,
      handleRunCommand,
      clearEditor,
      loadSampleJson,
      activateSearch,
      activateTreeInspector,
      handleNewDocument,
    },
  };
}
