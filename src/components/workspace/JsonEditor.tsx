"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Editor, { OnChange } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { computeEditorStats, formatBytes } from "@/lib/json/compute-stats";
import { copyToClipboard } from "@/lib/clipboard";
import { downloadFile } from "@/lib/download";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { EditorStats } from "@/types/workspace";
import { SAMPLE_USER_JSON } from "@/constants/workspace";

const DEFAULT_JSON = SAMPLE_USER_JSON;

export default function JsonEditor() {
  const [value, setValue] = useState(DEFAULT_JSON);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);

  const debouncedValue = useDebouncedValue(value, 300);

  const stats = useMemo(() => {
    let parsed = undefined;
    try {
      parsed = JSON.parse(debouncedValue);
    } catch {}
    const baseStats = computeEditorStats(debouncedValue, parsed);
    return {
      ...baseStats,
      line: cursorPos.line,
      col: cursorPos.col,
      valid: parsed !== undefined,
    };
  }, [debouncedValue, cursorPos]);

  const handleChange: OnChange = useCallback((val) => {
    setValue(val ?? "");
  }, []);

  const handleFormat = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value), null, 2));
    } catch {}
  };

  const handleMinify = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value)));
    } catch {}
  };

  const handleCopy = async () => {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    downloadFile(
      value,
      `jsonkit-export-${new Date().toISOString().split("T")[0]}.json`,
      "application/json",
    );
  };

  return (
    <div className="flex flex-grow overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── Editor Pane ── */}
      <div
        className="flex flex-col flex-grow overflow-hidden"
        style={{ backgroundColor: "#080808" }}
      >
        {/* Toolbar */}
        <div
          className="flex justify-between items-center px-4 py-2 flex-shrink-0"
          style={{
            borderBottom: "1px solid #262626",
            backgroundColor: "rgba(18,18,18,0.5)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <div className="flex gap-5" style={{ color: "#d9c2b6" }}>
            <button
              onClick={handleFormat}
              className="flex items-center gap-1 transition-colors hover:text-[#F5F1EA]"
            >
              <span className="material-symbols-outlined text-[16px]">expand_all</span>
              Expand All
            </button>
            <button
              onClick={handleMinify}
              className="flex items-center gap-1 transition-colors hover:text-[#F5F1EA]"
            >
              <span className="material-symbols-outlined text-[16px]">collapse_all</span>
              Collapse All
            </button>
          </div>
          <div className="flex gap-5" style={{ color: "#d9c2b6" }}>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#7DB87D", opacity: 0.6 }}
              />
              String
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#D4B483", opacity: 0.6 }}
              />
              Number
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#C07040", opacity: 0.6 }}
              />
              Key
            </span>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-grow overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={value}
            onChange={handleChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "JetBrains Mono, monospace",
              lineHeight: 22,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: "all",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              tabSize: 2,
              formatOnPaste: true,
              formatOnType: true,
            }}
            onMount={(editor, monaco) => {
              // Custom JSON token colors
              monaco.editor.defineTheme("jsonkit-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  { token: "string.key.json", foreground: "C07040" },
                  { token: "string.value.json", foreground: "7DB87D" },
                  { token: "number.json", foreground: "D4B483" },
                  { token: "keyword.json", foreground: "C07040", fontStyle: "italic" },
                  { token: "delimiter.bracket.json", foreground: "d9c2b6" },
                  { token: "delimiter.array.json", foreground: "d9c2b6" },
                ],
                colors: {
                  "editor.background": "#080808",
                  "editor.foreground": "#F5F1EA",
                  "editor.lineHighlightBackground": "#121212",
                  "editor.lineHighlightBorder": "#262626",
                  "editorLineNumber.foreground": "#353534",
                  "editorLineNumber.activeForeground": "#C07040",
                  "editorCursor.foreground": "#C07040",
                  "editor.selectionBackground": "#C0704030",
                  "editorIndentGuide.background1": "#262626",
                },
              });
              monaco.editor.setTheme("jsonkit-dark");

              editor.onDidChangeCursorPosition((e: MonacoEditor.ICursorPositionChangedEvent) => {
                setCursorPos({
                  line: e.position.lineNumber,
                  col: e.position.column,
                });
              });
            }}
          />
        </div>

        {/* Status Bar */}
        <footer
          className="flex justify-between items-center px-4 flex-shrink-0 select-none"
          style={{
            height: "32px",
            borderTop: "1px solid #262626",
            backgroundColor: "#080808",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            color: "#d9c2b6",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              Ln {stats.line}, Col {stats.col}
            </span>
            <span
              style={{
                width: "1px",
                height: "12px",
                backgroundColor: "#262626",
                display: "inline-block",
              }}
            />
            <span>UTF-8</span>
            <span
              style={{
                width: "1px",
                height: "12px",
                backgroundColor: "#262626",
                display: "inline-block",
              }}
            />
            <span>2 Spaces</span>
          </div>
          <div className="flex items-center gap-2">
            {stats.valid ? (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded"
                style={{
                  color: "#7DB87D",
                  backgroundColor: "rgba(125,184,125,0.1)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                JSON Valid
              </span>
            ) : (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded"
                style={{
                  color: "#ffb4ab",
                  backgroundColor: "rgba(255,180,171,0.1)",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <span className="material-symbols-outlined text-[14px]">error</span>
                Invalid JSON
              </span>
            )}
            <span style={{ color: "#d9c2b6", marginLeft: "8px" }}>© 2024 JSONKit Terminal.</span>
          </div>
        </footer>
      </div>

      {/* ── Right Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-y-auto"
        style={{
          width: "300px",
          borderLeft: "1px solid #262626",
          backgroundColor: "#121212",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Quick Actions */}
        <div className="p-4" style={{ borderBottom: "1px solid #262626" }}>
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#d9c2b6",
              marginBottom: "8px",
            }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {[
              { icon: "format_align_left", label: "Format", action: handleFormat },
              { icon: "compress", label: "Minify", action: handleMinify },
              { icon: "content_copy", label: copied ? "Copied!" : "Copy", action: handleCopy },
              { icon: "download", label: "Export", action: handleExport },
            ].map(({ icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center justify-center gap-1 p-3 transition-all group"
                style={{
                  backgroundColor: "#131313",
                  border: "1px solid #262626",
                  borderRadius: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#C07040";
                  (e.currentTarget as HTMLButtonElement).style.color = "#C07040";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#262626";
                  (e.currentTarget as HTMLButtonElement).style.color = "#d9c2b6";
                }}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: "inherit" }}
                >
                  {icon}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "inherit",
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Document Stats */}
        <div className="p-4" style={{ borderBottom: "1px solid #262626" }}>
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#d9c2b6",
              marginBottom: "8px",
            }}
          >
            Document Stats
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { label: "Size", value: formatBytes(stats.bytes) },
              { label: "Depth", value: `${stats.maxDepth} Levels` },
              { label: "Keys", value: String(stats.keys) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center p-2 rounded"
                style={{
                  backgroundColor: "#131313",
                  border: "1px solid #262626",
                }}
              >
                <span style={{ fontSize: "14px", color: "#d9c2b6" }}>{label}</span>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#F5F1EA",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Edits */}
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-center mb-2">
            <h3
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#d9c2b6",
              }}
            >
              Recent Edits
            </h3>
            <span
              className="material-symbols-outlined cursor-pointer hover:text-[#F5F1EA] transition-colors text-[16px]"
              style={{ color: "#d9c2b6" }}
            >
              more_horiz
            </span>
          </div>

          <div className="relative flex flex-col gap-2">
            <div
              className="absolute"
              style={{
                left: "11px",
                top: "8px",
                bottom: "8px",
                width: "1px",
                backgroundColor: "#262626",
              }}
            />
            {[
              { key: '"port"', msg: "Updated", time: "2 mins ago", active: true },
              { key: '"allowed_origins"', msg: "Added array", time: "15 mins ago", active: false },
            ].map(({ key, msg, time, active }) => (
              <div key={key} className="flex gap-2 items-start relative">
                <div
                  className="flex items-center justify-center flex-shrink-0 z-10"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#201f1f",
                    border: "2px solid #121212",
                  }}
                >
                  <div
                    style={{
                      width: active ? "8px" : "6px",
                      height: active ? "8px" : "6px",
                      borderRadius: "50%",
                      backgroundColor: active ? "#C07040" : "#d9c2b6",
                    }}
                  />
                </div>
                <div
                  className="flex-grow p-2 rounded"
                  style={{
                    backgroundColor: "#131313",
                    border: "1px solid #262626",
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  <p style={{ fontSize: "14px", color: "#F5F1EA" }}>
                    {msg}{" "}
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "12px",
                        color: "#C07040",
                      }}
                    >
                      {key}
                    </span>{" "}
                    value
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#d9c2b6",
                      marginTop: "4px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
