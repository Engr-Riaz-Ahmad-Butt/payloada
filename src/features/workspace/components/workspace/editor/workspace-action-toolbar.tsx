"use client";

import { ChevronDown, ClipboardPaste, Link2, Sparkles, Upload } from "lucide-react";

import { ToolbarButton } from "../shared";

export function WorkspaceActionToolbar({
  fileInputRef,
  onPaste,
  onUploadClick,
  onLoadUrlToggle,
  onTrySample,
  onUpload,
  onFormat,
  onMinify,
  onRepair,
  onOpenConverters,
  onJsonPath,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onPaste: () => void;
  onUploadClick: () => void;
  onLoadUrlToggle: () => void;
  onTrySample: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFormat: () => void;
  onMinify: () => void;
  onRepair: () => void;
  onOpenConverters: () => void;
  onJsonPath: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 overflow-x-auto border-b border-[#262626] bg-[#080808] px-5 py-3">
      <div className="flex shrink-0 gap-3">
        <ToolbarButton
          icon={<ClipboardPaste className="size-4" />}
          label="Paste"
          onClick={onPaste}
        />
        <ToolbarButton
          icon={<Upload className="size-4" />}
          label="Upload File"
          onClick={onUploadClick}
        />
        <ToolbarButton
          icon={<Link2 className="size-4" />}
          label="Load URL"
          onClick={onLoadUrlToggle}
        />
        <ToolbarButton
          icon={<Sparkles className="size-4" />}
          label="Try Sample"
          onClick={onTrySample}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={onUpload}
        />
      </div>

      <div className="flex shrink-0 items-center gap-3 text-[14px] font-semibold">
        <span className="text-[#4f4743]">TRANSFORM:</span>
        <button
          className="text-[#d69463] transition-colors hover:text-[#f5f1ea]"
          onClick={onFormat}
        >
          Format
        </button>
        <span className="text-[#363636]">•</span>
        <button
          className="text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
          onClick={onMinify}
        >
          Minify
        </button>
        <span className="text-[#363636]">•</span>
        <button
          className="text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
          onClick={onRepair}
        >
          Repair
        </button>
        <span className="text-[#363636]">•</span>
        <button
          className="inline-flex items-center gap-1 text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
          onClick={onOpenConverters}
        >
          Convert to
          <ChevronDown className="size-4" />
        </button>
        <span className="text-[#363636]">•</span>
        <button
          className="text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
          onClick={onJsonPath}
        >
          JSONPath
        </button>
      </div>
    </div>
  );
}
