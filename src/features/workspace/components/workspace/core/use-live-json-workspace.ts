"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getJsonStats, parseJsonSafe } from "@/lib/json";

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
        setShowCommandPalette(true);
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

  return {
    refs: {
      editorRef,
      fileInputRef,
      commandInputRef,
    },
    state: {
      workspaceView,
      previousWorkspaceView,
      roleMode,
      inspectorView,
      source,
      selectedPath,
      searchTerm,
      urlValue,
      showUrlInput,
      showCommandPalette,
      commandQuery,
      commandIndex,
      linePosition,
      historyItems,
      diffOld,
      diffNew,
      converterTab,
      jwtInput,
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
      setRoleMode,
      setInspectorView,
      setSource,
      setSelectedPath,
      setSearchTerm,
      setUrlValue,
      setShowUrlInput,
      setShowCommandPalette,
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
    },
  };
}
