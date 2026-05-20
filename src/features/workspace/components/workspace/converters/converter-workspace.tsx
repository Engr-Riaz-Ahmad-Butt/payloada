"use client";

import React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import type { ConverterTab, JsonValue } from "../core/types";
import { SidebarEmpty, SmallAction } from "../shared";
import { CSV_ERROR_PREFIX } from "./converter-utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const TYPE_SYSTEM_TABS: ConverterTab[] = ["TypeScript", "Zod", "Prisma", "Mongoose"];
const DATA_FORMAT_TABS: ConverterTab[] = ["CSV", "YAML", "XML", "Schema"];

const FORMAT_META: Record<ConverterTab, string> = {
  TypeScript: "TypeScript interfaces — generated from your JSON",
  Zod: "Zod schema — runtime-safe validation code",
  CSV: "CSV export — flattened from JSON array",
  YAML: "YAML format — human-readable data serialization",
  XML: "XML export — structured markup from JSON",
  Schema: "JSON Schema — Draft 7 schema definition",
  Prisma: "Prisma schema — database model definition",
  Mongoose: "Mongoose schema — MongoDB model definition",
};

export function ConverterWorkspace({
  converterTab,
  setConverterTab,
  output,
  parsedValue,
  onCopy,
  onDownload,
  source,
  setSource,
}: {
  converterTab: ConverterTab;
  setConverterTab: React.Dispatch<React.SetStateAction<ConverterTab>>;
  output: string;
  parsedValue: JsonValue | null;
  onCopy: (value: string, message?: string) => Promise<void>;
  onDownload: (content: string, filename: string) => void;
  source: string;
  setSource: React.Dispatch<React.SetStateAction<string>>;
}) {
  const selectedDescription = converterTab ? FORMAT_META[converterTab] : "Choose a target format";

  return (
    <div className="grid h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
      <div className="flex min-h-0 flex-col border-b-[0.5px] border-ui-border xl:border-b-0 xl:border-r-[0.5px]">
        <div className="min-h-[320px] flex-1 bg-[#050505] xl:min-h-0">
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
        <div className="border-b-[0.5px] border-ui-border px-4 py-4 sm:px-5">
          <div className="mb-3">
            <p className="text-sm font-semibold text-[#d6c3b5]">Output</p>
            <p className="mt-1 text-[13px] font-normal leading-[1.6] text-[#8B92A8]">
              {selectedDescription}
            </p>
          </div>

          <div className="space-y-3">
            <ConverterButtonGroup
              label="Type systems"
              tabs={TYPE_SYSTEM_TABS}
              activeTab={converterTab}
              onSelect={setConverterTab}
            />
            <ConverterButtonGroup
              label="Data formats"
              tabs={DATA_FORMAT_TABS}
              activeTab={converterTab}
              onSelect={setConverterTab}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b-[0.5px] border-ui-border px-4 py-3 sm:px-5">
          <SmallAction
            label="Copy"
            onClick={() => onCopy(output, `Copied ${converterTab} output`)}
          />
          <SmallAction
            label="Download"
            onClick={() => onDownload(output, `jsonlines-${converterTab}.txt`)}
          />
          <SmallAction label="Regenerate" onClick={() => toast.success("Output regenerated")} />
          <SmallAction
            label="Format Output"
            onClick={() => toast.success("Output is already formatted")}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
          {parsedValue ? (
            output ? (
              <ConverterOutputPreview tab={converterTab} value={output} />
            ) : (
              <SidebarEmpty text={`Add valid JSON to generate ${converterTab} output.`} />
            )
          ) : (
            <SidebarEmpty
              text={`Cannot generate ${converterTab} because the JSON is invalid. Fix it first.`}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function ConverterButtonGroup({
  label,
  tabs,
  activeTab,
  onSelect,
}: {
  label: string;
  tabs: ConverterTab[];
  activeTab: ConverterTab;
  onSelect: React.Dispatch<React.SetStateAction<ConverterTab>>;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-normal tracking-[0.03em] text-[#3A4060]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className={cn(
              "h-7 rounded-[6px] border-[0.5px] px-3 text-[12px] font-medium transition-colors",
              activeTab === tab
                ? "border-[#C07040] bg-[#1F140C] text-[#C07040]"
                : "border-[#2A2F42] bg-[#1A1D24] text-[#8B92A8]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConverterOutputPreview({ tab, value }: { tab: ConverterTab; value: string }) {
  if (tab === "CSV") {
    return <CsvPreview value={value} />;
  }

  return (
    <pre className="overflow-auto rounded-sm border-[0.5px] border-ui-border bg-[#0a0a0a] p-4 font-mono text-[12px] leading-6 text-[#E8EAF0]">
      {renderHighlightedLines(tab, value)}
    </pre>
  );
}

function CsvPreview({ value }: { value: string }) {
  if (value.startsWith(CSV_ERROR_PREFIX)) {
    const errorMessage = value.replace(CSV_ERROR_PREFIX, "");
    return (
      <div className="rounded-[10px] border-[0.5px] border-[#5A3A1A] bg-[#1A0E00] px-4 py-4">
        <p className="text-[13px] font-medium text-[#C07040]">Cannot Export CSV</p>
        <p className="mt-1 text-[12px] leading-[1.6] text-[#8B92A8] whitespace-pre-line">
          {errorMessage}
        </p>
      </div>
    );
  }

  const rows = value
    .trim()
    .split("\n")
    .map((row) => row.split(","));

  if (!rows.length || rows.every((row) => row.length === 1 && row[0] === "")) {
    return <SidebarEmpty text="CSV export works best with an array of objects." />;
  }

  return (
    <div className="overflow-auto rounded-sm border-[0.5px] border-ui-border bg-[#0a0a0a]">
      <table className="min-w-full border-collapse font-mono text-[12px]">
        <thead>
          <tr className="bg-[#1A1D24] text-[#C07040]">
            {rows[0].map((cell, index) => (
              <th
                key={`${cell}-${index}`}
                className="border-b-[0.5px] border-ui-border px-3 py-2 text-left font-medium"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-[#0F1117]" : "bg-[#0A0C0F]"}>
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className="border-b-[0.5px] border-ui-border px-3 py-2 text-[#E8EAF0]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderHighlightedLines(tab: ConverterTab, value: string) {
  return value.split("\n").map((line, index) => (
    <div key={`${tab}-${index}`} className="whitespace-pre">
      {highlightLine(tab, line)}
    </div>
  ));
}

function highlightLine(tab: ConverterTab, line: string) {
  switch (tab) {
    case "TypeScript":
    case "Prisma":
    case "Mongoose":
    case "Schema":
      return highlightTypeSystemLine(line);
    case "Zod":
      return highlightZodLine(line);
    case "YAML":
      return highlightYamlLine(line);
    case "XML":
      return highlightXmlLine(line);
    default:
      return line;
  }
}

function highlightTypeSystemLine(line: string) {
  const tokens = tokenizePreservingWhitespace(line);

  return tokens.map((token, index) => {
    if (/^\s+$/.test(token)) {
      return token;
    }

    if (/^(export|interface|type|model|import|const|new|Schema)$/.test(token)) {
      return (
        <span key={index} style={{ color: "#79C0FF" }}>
          {token}
        </span>
      );
    }

    if (/^(string|number|boolean|any|null|unknown|Json|String|Int|Float|Boolean)$/.test(token)) {
      return (
        <span key={index} style={{ color: "#3DD68C" }}>
          {token}
        </span>
      );
    }

    if (/^[A-Z][A-Za-z0-9_]*$/.test(token) || /^jsonLinesRecord$/.test(token)) {
      return (
        <span key={index} style={{ color: "#C07040" }}>
          {token}
        </span>
      );
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*(?=[:(])/.test(token)) {
      return (
        <span key={index} style={{ color: "#C77DFF" }}>
          {token}
        </span>
      );
    }

    if (/^[{}:;,[\]()@]+$/.test(token)) {
      return (
        <span key={index} style={{ color: "#5A6070" }}>
          {token}
        </span>
      );
    }

    return <span key={index}>{token}</span>;
  });
}

function highlightZodLine(line: string) {
  const tokens = tokenizePreservingWhitespace(line);

  return tokens.map((token, index) => {
    if (/^\s+$/.test(token)) {
      return token;
    }

    if (token === "z") {
      return (
        <span key={index} style={{ color: "#C07040" }}>
          {token}
        </span>
      );
    }

    if (/^\.(object|string|number|array|boolean|null|unknown)$/.test(token)) {
      return (
        <span key={index} style={{ color: "#3DD68C" }}>
          {token}
        </span>
      );
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*(?=[:=])/.test(token)) {
      return (
        <span key={index} style={{ color: "#C77DFF" }}>
          {token}
        </span>
      );
    }

    if (/^[{}:;,[\]().]+$/.test(token)) {
      return (
        <span key={index} style={{ color: "#5A6070" }}>
          {token}
        </span>
      );
    }

    return <span key={index}>{token}</span>;
  });
}

function highlightYamlLine(line: string) {
  const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
  if (!match) {
    return line;
  }

  const [, indent, key, value] = match;

  return (
    <>
      {indent}
      <span style={{ color: "#C07040" }}>{key}</span>
      <span style={{ color: "#5A6070" }}>: </span>
      <span style={{ color: getYamlValueColor(value) }}>{value}</span>
    </>
  );
}

function highlightXmlLine(line: string) {
  return line.split(/(<[^>]+>)/g).map((part, index) => {
    if (!part) {
      return null;
    }

    if (part.startsWith("<") && part.endsWith(">")) {
      return (
        <span key={index} style={{ color: "#79C0FF" }}>
          {part}
        </span>
      );
    }

    return (
      <span key={index} style={{ color: "#E8EAF0" }}>
        {part}
      </span>
    );
  });
}

function getYamlValueColor(value: string) {
  if (/^(true|false)$/.test(value.trim())) {
    return "#79C0FF";
  }

  if (/^-?\d+(\.\d+)?$/.test(value.trim())) {
    return "#F5A623";
  }

  return "#3DD68C";
}

function tokenizePreservingWhitespace(line: string) {
  return line.split(
    /(\s+|(?=[{}:;,[\]()])|(?<=[{}:;,[\]()])|(?=\.object|\.string|\.number|\.array|\.boolean|\.null|\.unknown)|(?<=\.object|\.string|\.number|\.array|\.boolean|\.null|\.unknown))/g,
  );
}
