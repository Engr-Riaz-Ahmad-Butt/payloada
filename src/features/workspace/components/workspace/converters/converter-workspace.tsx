"use client";

import React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import type { ConverterTab, JsonValue } from "../core/types";
import { CONVERTER_TABS } from "../core/constants";
import { cn } from "@/lib/utils";
import { CodePreview, SidebarEmpty, SmallAction } from "../shared";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export function ConverterWorkspace({
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
      <div className="flex min-h-0 flex-col border-b-[0.5px] border-ui-border xl:border-b-0 xl:border-r-[0.5px]">
        <div className="flex flex-col gap-3 border-b-[0.5px] border-ui-border bg-[#171717] px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#f5f1ea]">Converter workspace</p>
            <p className="mt-1 text-xs text-[#a89589]">
              Keep your JSON on the left and generated output on the right.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SmallAction label="Back" onClick={onBack} />
            <SmallAction label="Close" onClick={onClose} />
          </div>
        </div>
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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#d6c3b5]">Output</p>
            <span className="text-xs text-[#7b7068]">Choose an output format</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CONVERTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setConverterTab(tab)}
                className={cn(
                  "rounded-sm border-[0.5px] px-3 py-1.5 text-xs font-semibold transition-colors",
                  converterTab === tab
                    ? "border-[#2A2F42] bg-[#2a1c13] text-[#d69463]"
                    : "border-ui-border bg-[#0a0a0a] text-[#d6c3b5]",
                )}
              >
                {tab}
              </button>
            ))}
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
              <CodePreview value={output} />
            ) : (
              <SidebarEmpty text={`Add valid JSON to generate ${converterTab} output.`} />
            )
          ) : (
            <SidebarEmpty
              text={`JSON needs to be valid before ${converterTab} output can be generated.`}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
