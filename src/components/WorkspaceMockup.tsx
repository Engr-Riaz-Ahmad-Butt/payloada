"use client";

import { useEffect, useState, useRef } from "react";

// ── The JSON we'll "type" ───────────────────────────────────────────────────
const FULL_JSON_STRING = `{
  "project": {
    "name": "JSONKit",
    "version": "1.0.0",
    "features": [
      "Validation",
      "Formatting",
      "Conversion"
    ]
  }
}`;

// ── Syntax-highlight a raw JSON string into spans ───────────────────────────
function highlight(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Simple regex tokeniser: strings, numbers, booleans/null, braces/brackets, colons/commas
  const regex =
    /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(true|false|null)|([{}[\]])|([,:])|([\s\S])/g;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    const [, str, num, kw, brace, punct, other] = match;
    if (str) {
      // Key vs value: if preceded (ignoring whitespace) by '{' or ',' or start, it's a key
      const before = text.slice(0, match.index).trimEnd();
      const isKey = /[{,]$/.test(before) || before === "";
      tokens.push(
        <span key={i++} style={{ color: isKey ? "#C07040" : "#7DB87D" }}>
          {str}
        </span>,
      );
    } else if (num) {
      tokens.push(
        <span key={i++} style={{ color: "#D4B483" }}>
          {num}
        </span>,
      );
    } else if (kw) {
      tokens.push(
        <span key={i++} style={{ color: "#ffb68e" }}>
          {kw}
        </span>,
      );
    } else if (brace || punct || other) {
      tokens.push(
        <span key={i++} style={{ color: "#d9c2b6" }}>
          {brace ?? punct ?? other}
        </span>,
      );
    }
  }
  return tokens;
}

// ── Tiny tree renderer ───────────────────────────────────────────────────────
type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function TreeNode({
  label,
  value,
  depth,
}: {
  label: string | null;
  value: JsonValue;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const indent = depth * 16;

  if (typeof value === "object" && value !== null) {
    const isArr = Array.isArray(value);
    const entries = isArr
      ? (value as JsonValue[]).map((v, i) => [String(i), v] as [string, JsonValue])
      : Object.entries(value as { [k: string]: JsonValue });
    const badge = isArr ? `[${entries.length}]` : `{${entries.length}}`;

    return (
      <div>
        <div
          className="flex items-center gap-1 cursor-pointer select-none py-[2px]"
          style={{ paddingLeft: indent }}
          onClick={() => setOpen((o) => !o)}
        >
          <span style={{ color: "#d9c2b6", fontSize: 11, width: 12, display: "inline-block" }}>
            {open ? "▾" : "▸"}
          </span>
          {label !== null && <span style={{ color: "#C07040", fontWeight: 500 }}>{label}</span>}
          <span style={{ color: "#d9c2b6", marginLeft: label !== null ? 4 : 0 }}>{badge}</span>
        </div>
        {open &&
          entries.map(([k, v]) => (
            <TreeNode key={k} label={isArr ? null : k} value={v} depth={depth + 1} />
          ))}
      </div>
    );
  }

  let valColor = "#d9c2b6";
  let valDisplay = String(value);
  if (typeof value === "string") {
    valColor = "#7DB87D";
    valDisplay = `"${value}"`;
  }
  if (typeof value === "number") {
    valColor = "#D4B483";
  }
  if (typeof value === "boolean" || value === null) {
    valColor = "#ffb68e";
  }

  return (
    <div className="flex items-center gap-1 py-[2px]" style={{ paddingLeft: indent + 16 }}>
      {label !== null && (
        <>
          <span style={{ color: "#C07040", fontWeight: 500 }}>{label}</span>
          <span style={{ color: "#d9c2b6" }}>:</span>
        </>
      )}
      <span style={{ color: valColor }}>{valDisplay}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorkspaceMockup() {
  const [typed, setTyped] = useState("");
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const charIndexRef = useRef(0);
  const directionRef = useRef<"forward" | "backward">("forward");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const tick = () => {
      if (directionRef.current === "forward") {
        if (charIndexRef.current < FULL_JSON_STRING.length) {
          charIndexRef.current += 1;
          const current = FULL_JSON_STRING.slice(0, charIndexRef.current);
          setTyped(current);
          try {
            const parsed = JSON.parse(current);
            setParsedJson(parsed);
            setIsValid(true);
          } catch {
            setIsValid(false);
          }
          timerRef.current = setTimeout(tick, 28);
        } else {
          // Pause at end, then erase
          timerRef.current = setTimeout(() => {
            directionRef.current = "backward";
            tick();
          }, 2800);
        }
      } else {
        if (charIndexRef.current > 0) {
          charIndexRef.current -= 3;
          if (charIndexRef.current < 0) charIndexRef.current = 0;
          const current = FULL_JSON_STRING.slice(0, charIndexRef.current);
          setTyped(current);
          setIsValid(false);
          setParsedJson(null);
          timerRef.current = setTimeout(tick, 12);
        } else {
          // Pause at empty, then type again
          timerRef.current = setTimeout(() => {
            directionRef.current = "forward";
            tick();
          }, 600);
        }
      }
    };

    timerRef.current = setTimeout(tick, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const lineCount = typed.split("\n").length;

  return (
    <div
      className="w-full max-w-5xl border overflow-hidden flex flex-col mt-4 relative"
      style={{
        backgroundColor: "#0d0d0d",
        borderColor: "#262626",
        borderRadius: "0.5rem",
        boxShadow: "0 8px 40px rgba(0,0,0,0.85)",
        height: "380px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "13px",
        lineHeight: "20px",
      }}
    >
      {/* ── Split Panels ── */}
      <div className="flex flex-grow overflow-hidden" style={{ height: "100%" }}>
        {/* LEFT: Editor Panel */}
        <div className="flex flex-col border-r" style={{ flex: 1, borderColor: "#262626" }}>
          {/* Tab bar */}
          <div
            className="flex items-center justify-between px-3 border-b flex-shrink-0"
            style={{ height: "38px", backgroundColor: "#080808", borderColor: "#262626" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#d9c2b6", fontSize: 11 }}>{"<>"}</span>
              <span style={{ color: "#F5F1EA", fontSize: 12 }}>input.json</span>
            </div>
            <button
              className="px-2 py-0.5 border text-xs transition-colors"
              style={{
                borderColor: "#262626",
                color: "#d9c2b6",
                borderRadius: "2px",
                fontSize: 11,
                cursor: "default",
              }}
            >
              Format
            </button>
          </div>

          {/* Code area */}
          <div className="flex flex-grow overflow-hidden">
            {/* Gutter */}
            <div
              className="flex flex-col items-end py-2 select-none flex-shrink-0"
              style={{
                width: "40px",
                backgroundColor: "#080808",
                borderRight: "1px solid #1a1a1a",
                color: "#3a3a3a",
                fontSize: 12,
                lineHeight: "20px",
                paddingRight: "8px",
              }}
            >
              {Array.from({ length: Math.max(lineCount, 9) }, (_, i) => (
                <span key={i + 1}>{i + 1}</span>
              ))}
            </div>

            {/* Editor text */}
            <div
              className="flex-grow p-2 overflow-hidden"
              style={{ backgroundColor: "#080808", textAlign: "left" }}
            >
              <pre
                className="whitespace-pre-wrap break-words"
                style={{ color: "#F5F1EA", lineHeight: "20px", textAlign: "left" }}
              >
                {highlight(typed)}
                {/* blinking cursor */}
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "14px",
                    backgroundColor: "#C07040",
                    verticalAlign: "text-bottom",
                    opacity: cursorVisible ? 1 : 0,
                    transition: "opacity 0.1s",
                    marginLeft: "1px",
                  }}
                />
              </pre>
            </div>
          </div>
        </div>

        {/* RIGHT: Viewer Panel */}
        <div className="flex flex-col" style={{ flex: 1 }}>
          {/* Tab bar */}
          <div
            className="flex items-center justify-between px-3 border-b flex-shrink-0"
            style={{ height: "38px", backgroundColor: "#080808", borderColor: "#262626" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#d9c2b6", fontSize: 11 }}>☰</span>
              <span style={{ color: "#F5F1EA", fontSize: 12 }}>Viewer</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Valid JSON badge */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 border"
                style={{
                  borderColor: isValid ? "#7DB87D" : "#262626",
                  borderRadius: "2px",
                  color: isValid ? "#7DB87D" : "#3a3a3a",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  transition: "all 0.3s",
                }}
              >
                {isValid && <span style={{ fontSize: 9 }}>✓</span>}
                {isValid ? "VALID JSON" : "INVALID"}
              </div>
              <div
                className="px-2 py-0.5 border"
                style={{
                  borderColor: "#262626",
                  color: "#d9c2b6",
                  borderRadius: "2px",
                  fontSize: 10,
                  letterSpacing: "0.04em",
                }}
              >
                LOCAL-ONLY
              </div>
            </div>
          </div>

          {/* Tree view */}
          <div
            className="flex-grow overflow-auto p-3"
            style={{ backgroundColor: "#0a0a0a", textAlign: "left" }}
          >
            {parsedJson ? (
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 13,
                  lineHeight: "22px",
                }}
              >
                <TreeNode label={null} value={parsedJson} depth={0} />
              </div>
            ) : (
              <div
                className="h-full flex items-center justify-center"
                style={{ color: "#3a3a3a", fontSize: 12 }}
              >
                Waiting for valid JSON…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        className="flex items-center justify-between px-3 border-t flex-shrink-0"
        style={{
          height: "24px",
          backgroundColor: "#080808",
          borderColor: "#1a1a1a",
          fontSize: 11,
          color: "#3a3a3a",
        }}
      >
        <span>
          Ln {lineCount}, Col {typed.length > 0 ? typed.split("\n").at(-1)!.length + 1 : 1}
        </span>
        <span style={{ color: isValid ? "#7DB87D" : "#3a3a3a", transition: "color 0.3s" }}>
          {isValid ? "● JSON" : "○ JSON"}
        </span>
      </div>
    </div>
  );
}
