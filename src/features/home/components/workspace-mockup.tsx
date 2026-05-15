"use client";

import { useEffect, useRef, useState } from "react";

const FULL_JSON_STRING = `{
  "project": {
    "name": "jsonLines",
    "version": "1.0.0",
    "features": [
      "Validation",
      "Formatting",
      "Conversion"
    ]
  }
}`;

function highlight(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex =
    /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(true|false|null)|([{}[\]])|([,:])|([\s\S])/g;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    const [, str, num, kw, brace, punct, other] = match;
    if (str) {
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

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

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
    const isArray = Array.isArray(value);
    const entries = isArray
      ? (value as JsonValue[]).map((item, index) => [String(index), item] as [string, JsonValue])
      : Object.entries(value as { [key: string]: JsonValue });
    const badge = isArray ? `[${entries.length}]` : `{${entries.length}}`;

    return (
      <div>
        <div
          className="cursor-pointer select-none py-0.5"
          style={{ paddingLeft: indent, color: "#d9c2b6" }}
          onClick={() => setOpen((current) => !current)}
        >
          <span style={{ fontSize: 11, width: 12, display: "inline-block" }}>
            {open ? "▾" : "▸"}
          </span>
          {label !== null ? (
            <span style={{ color: "#C07040", fontWeight: 500, marginLeft: 2 }}>{label}</span>
          ) : null}
          <span style={{ marginLeft: label !== null ? 6 : 0 }}>{badge}</span>
        </div>
        {open
          ? entries.map(([key, child]) => (
              <TreeNode key={key} label={isArray ? null : key} value={child} depth={depth + 1} />
            ))
          : null}
      </div>
    );
  }

  let valueColor = "#d9c2b6";
  let displayValue = String(value);

  if (typeof value === "string") {
    valueColor = "#7DB87D";
    displayValue = `"${value}"`;
  }

  if (typeof value === "number") {
    valueColor = "#D4B483";
  }

  if (typeof value === "boolean" || value === null) {
    valueColor = "#ffb68e";
  }

  return (
    <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: indent + 16 }}>
      {label !== null ? (
        <>
          <span style={{ color: "#C07040", fontWeight: 500 }}>{label}</span>
          <span style={{ color: "#d9c2b6" }}>:</span>
        </>
      ) : null}
      <span style={{ color: valueColor }}>{displayValue}</span>
    </div>
  );
}

export default function WorkspaceMockup() {
  const [typed, setTyped] = useState("");
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const charIndexRef = useRef(0);
  const directionRef = useRef<"forward" | "backward">("forward");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible((value) => !value), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (directionRef.current === "forward") {
        if (charIndexRef.current < FULL_JSON_STRING.length) {
          charIndexRef.current += 1;
          const current = FULL_JSON_STRING.slice(0, charIndexRef.current);
          setTyped(current);
          try {
            const parsed = JSON.parse(current) as JsonValue;
            setParsedJson(parsed);
            setIsValid(true);
          } catch {
            setIsValid(false);
          }
          timerRef.current = setTimeout(tick, 28);
        } else {
          timerRef.current = setTimeout(() => {
            directionRef.current = "backward";
            tick();
          }, 2800);
        }
      } else if (charIndexRef.current > 0) {
        charIndexRef.current -= 3;
        if (charIndexRef.current < 0) {
          charIndexRef.current = 0;
        }
        const current = FULL_JSON_STRING.slice(0, charIndexRef.current);
        setTyped(current);
        setIsValid(false);
        setParsedJson(null);
        timerRef.current = setTimeout(tick, 12);
      } else {
        timerRef.current = setTimeout(() => {
          directionRef.current = "forward";
          tick();
        }, 600);
      }
    };

    timerRef.current = setTimeout(tick, 400);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const lineCount = typed.split("\n").length;

  return (
    <div
      className="relative mt-4 flex h-95 w-full max-w-5xl flex-col overflow-hidden border"
      style={{
        backgroundColor: "#0d0d0d",
        borderColor: "#262626",
        borderRadius: "0.5rem",
        boxShadow: "0 8px 40px rgba(0,0,0,0.85)",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "13px",
        lineHeight: "20px",
      }}
    >
      <div className="flex h-full grow overflow-hidden">
        <div className="flex flex-1 flex-col border-r" style={{ borderColor: "#262626" }}>
          <div
            className="flex h-9.5 shrink-0 items-center justify-between border-b px-3"
            style={{ backgroundColor: "#080808", borderColor: "#262626" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#d9c2b6", fontSize: 11 }}>{`<>`}</span>
              <span style={{ color: "#F5F1EA", fontSize: 12 }}>input.json</span>
            </div>
            <button
              className="border px-2 py-0.5 text-xs transition-colors"
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

          <div className="flex grow overflow-hidden">
            <div
              className="flex w-[40px] shrink-0 flex-col items-end py-2 pr-2 select-none"
              style={{
                backgroundColor: "#080808",
                borderRight: "1px solid #1a1a1a",
                color: "#3a3a3a",
                fontSize: 12,
                lineHeight: "20px",
              }}
            >
              {Array.from({ length: Math.max(lineCount, 9) }, (_, index) => (
                <span key={index + 1}>{index + 1}</span>
              ))}
            </div>

            <div
              className="grow overflow-hidden p-2"
              style={{ backgroundColor: "#080808", textAlign: "left" }}
            >
              <pre
                className="wrap-break-word whitespace-pre-wrap"
                style={{ color: "#F5F1EA", lineHeight: "20px" }}
              >
                {highlight(typed)}
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

        <div className="flex flex-1 flex-col">
          <div
            className="flex h-9.5 shrink-0 items-center justify-between border-b px-3"
            style={{ backgroundColor: "#080808", borderColor: "#262626" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#d9c2b6", fontSize: 11 }}>☰</span>
              <span style={{ color: "#F5F1EA", fontSize: 12 }}>Viewer</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 border px-2 py-0.5"
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
                {isValid ? <span style={{ fontSize: 9 }}>✓</span> : null}
                {isValid ? "VALID JSON" : "INVALID"}
              </div>
              <div
                className="border px-2 py-0.5"
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

          <div
            className="grow overflow-auto p-3"
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
                className="flex h-full items-center justify-center"
                style={{ color: "#3a3a3a", fontSize: 12 }}
              >
                Waiting for valid JSON...
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex h-6 shrink-0 items-center justify-between border-t px-3"
        style={{
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
