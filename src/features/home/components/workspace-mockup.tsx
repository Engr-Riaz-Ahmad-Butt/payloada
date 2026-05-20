"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const FULL_JSON_STRING = `{
  "project": {
    "name": "JSONova",
    "version": "1.0.0",
    "features": [
      "Validation",
      "Formatting",
      "Conversion"
    ]
  }
}`;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function highlight(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const regex =
    /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(true|false|null)|([{}[\]])|([,:])|([\s\S])/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    const [, str, num, kw, brace, punct, other] = match;

    if (str) {
      const before = text.slice(0, match.index).trimEnd();
      const isKey = /[{,]$/.test(before) || before === "";
      tokens.push(
        <span key={index++} style={{ color: isKey ? "#C07040" : "#7DB87D" }}>
          {str}
        </span>,
      );
      continue;
    }

    if (num) {
      tokens.push(
        <span key={index++} style={{ color: "#D4B483" }}>
          {num}
        </span>,
      );
      continue;
    }

    if (kw) {
      tokens.push(
        <span key={index++} style={{ color: "#ffb68e" }}>
          {kw}
        </span>,
      );
      continue;
    }

    tokens.push(
      <span key={index++} style={{ color: "#d9c2b6" }}>
        {brace ?? punct ?? other}
      </span>,
    );
  }

  return tokens;
}

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
        <button
          type="button"
          className="flex cursor-pointer items-center py-0.5 text-left select-none"
          style={{ paddingLeft: indent, color: "#d9c2b6" }}
          onClick={() => setOpen((current) => !current)}
        >
          <span style={{ display: "inline-block", width: 12, fontSize: 11 }}>
            {open ? "v" : ">"}
          </span>
          {label !== null ? (
            <span style={{ color: "#C07040", fontWeight: 500, marginLeft: 2 }}>{label}</span>
          ) : null}
          <span style={{ marginLeft: label !== null ? 6 : 0 }}>{badge}</span>
        </button>

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
  } else if (typeof value === "number") {
    valueColor = "#D4B483";
  } else if (typeof value === "boolean" || value === null) {
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
    const intervalId = setInterval(() => setCursorVisible((value) => !value), 530);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (directionRef.current === "forward") {
        if (charIndexRef.current < FULL_JSON_STRING.length) {
          charIndexRef.current += 1;
          const current = FULL_JSON_STRING.slice(0, charIndexRef.current);
          setTyped(current);

          try {
            setParsedJson(JSON.parse(current) as JsonValue);
            setIsValid(true);
          } catch {
            setParsedJson(null);
            setIsValid(false);
          }

          timerRef.current = setTimeout(tick, 28);
          return;
        }

        timerRef.current = setTimeout(() => {
          directionRef.current = "backward";
          tick();
        }, 2800);
        return;
      }

      if (charIndexRef.current > 0) {
        charIndexRef.current = Math.max(charIndexRef.current - 3, 0);
        const current = FULL_JSON_STRING.slice(0, charIndexRef.current);
        setTyped(current);
        setParsedJson(null);
        setIsValid(false);
        timerRef.current = setTimeout(tick, 12);
        return;
      }

      timerRef.current = setTimeout(() => {
        directionRef.current = "forward";
        tick();
      }, 600);
    };

    timerRef.current = setTimeout(tick, 400);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const lineCount = typed.split("\n").length;
  const currentColumn = typed.length > 0 ? typed.split("\n").at(-1)!.length + 1 : 1;

  return (
    <div
      className="relative mt-4 w-[90%] max-w-5xl md:mt-6"
      style={{
        marginInline: "auto",
        perspective: "1200px",
      }}
    >
      <div
        className="relative flex min-h-[560px] w-full flex-col overflow-hidden rounded-[12px] border-[0.5px] md:min-h-0 md:h-[520px]"
        style={{
          backgroundColor: "#0D0D0D",
          borderColor: "#2A2F42",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          lineHeight: "20px",
          transform: "rotateX(2deg)",
          transformOrigin: "top center",
        }}
      >
        <div
          className="flex h-9 shrink-0 items-center justify-between border-b-[0.5px] px-4"
          style={{
            backgroundColor: "#0F1117",
            borderColor: "#2A2F42",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FF5C6C" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#F5A623" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#3DD68C" }} />
          </div>

          <div
            className="flex h-8 w-full max-w-[280px] items-center justify-center rounded-[6px] px-4"
            style={{ backgroundColor: "#1A1D24" }}
          >
            <span
              style={{
                color: "#8B92A8",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
              }}
              >
              jsonova.dev
            </span>
          </div>

          <div className="w-[52px]" />
        </div>

        <div className="flex grow flex-col overflow-hidden md:flex-row">
          <div
            className="flex min-h-[300px] flex-[1.15] flex-col border-b md:min-h-0 md:flex-1 md:border-b-0 md:border-r"
            style={{ borderColor: "#262626" }}
          >
            <div
              className="flex h-10 shrink-0 items-center justify-between border-b px-3 sm:px-4"
              style={{ backgroundColor: "#080808", borderColor: "#262626" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: "#d9c2b6", fontSize: 11 }}>{`<>`}</span>
                <span style={{ color: "#F5F1EA", fontSize: 12 }}>input.json</span>
              </div>

              <button
                type="button"
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
                className="flex w-9 shrink-0 flex-col items-end py-2 pr-2 select-none sm:w-10"
                style={{
                  backgroundColor: "#080808",
                  borderRight: "1px solid #1a1a1a",
                  color: "#3a3a3a",
                  fontSize: 11,
                  lineHeight: "20px",
                }}
              >
                {Array.from({ length: Math.max(lineCount, 9) }, (_, index) => (
                  <span key={index + 1}>{index + 1}</span>
                ))}
              </div>

              <div
                className="grow overflow-hidden p-2 text-left sm:p-3"
                style={{ backgroundColor: "#080808" }}
              >
                <pre
                  className="wrap-break-word whitespace-pre-wrap"
                  style={{ color: "#F5F1EA", lineHeight: "20px", fontSize: "12px" }}
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

          <div className="flex min-h-[220px] flex-[0.85] flex-col md:min-h-0 md:flex-1">
            <div
              className="flex min-h-10 shrink-0 flex-col items-start gap-2 border-b px-3 py-2 sm:h-10 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-0"
              style={{ backgroundColor: "#080808", borderColor: "#262626" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: "#d9c2b6", fontSize: 11 }}>Tree</span>
                <span style={{ color: "#F5F1EA", fontSize: 12 }}>Viewer</span>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 overflow-visible sm:w-auto sm:flex-nowrap">
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
                  {isValid ? <span style={{ fontSize: 9 }}>OK</span> : null}
                  {isValid ? "Valid JSON" : "Invalid"}
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
                  Local-only
                </div>
              </div>
            </div>

            <div
              className="grow overflow-auto p-3 text-left sm:p-4"
              style={{ backgroundColor: "#0a0a0a" }}
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
                  className="flex h-full items-center justify-center px-6 text-center"
                  style={{ color: "#3a3a3a", fontSize: 12 }}
                >
                  Waiting for valid JSON...
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 flex-col items-start justify-between gap-1 border-t px-3 py-2 text-[10px] sm:h-6 sm:flex-row sm:items-center sm:gap-3 sm:py-0"
          style={{
            backgroundColor: "#080808",
            borderColor: "#1a1a1a",
            color: "#3a3a3a",
          }}
        >
          <span>
            Ln {lineCount}, Col {currentColumn}
          </span>
          <span style={{ color: isValid ? "#7DB87D" : "#3a3a3a", transition: "color 0.3s" }}>
            {isValid ? "JSON ready" : "JSON waiting"}
          </span>
        </div>
      </div>
    </div>
  );
}
