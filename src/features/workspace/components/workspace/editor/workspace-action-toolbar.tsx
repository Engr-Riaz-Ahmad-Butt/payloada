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
  onSort,
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
  onSort: () => void;
  onOpenConverters: () => void;
  onJsonPath: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b-[0.5px] border-ui-border bg-obsidian-base px-4 py-3 sm:px-5 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
      <div className="flex flex-wrap gap-3 xl:shrink-0">
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

      <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold sm:gap-3 sm:text-[14px] xl:shrink-0">
        <span className="text-outline-variant">Transform:</span>
        <button className="text-copper-accent transition-colors hover:text-text-primary" onClick={onFormat}>
          Format
        </button>
        <span className="text-outline-variant">•</span>
        <button
          className="text-on-surface-variant transition-colors hover:text-text-primary"
          onClick={onMinify}
        >
          Minify
        </button>
        <span className="text-outline-variant">•</span>
        <button
          className="text-on-surface-variant transition-colors hover:text-text-primary"
          onClick={onRepair}
        >
          Repair
        </button>
        <span className="text-outline-variant">•</span>
        <button className="text-on-surface-variant transition-colors hover:text-text-primary" onClick={onSort}>
          Sort
        </button>
        <span className="text-outline-variant">•</span>
        <button
          className="inline-flex items-center gap-1 text-on-surface-variant transition-colors hover:text-text-primary"
          onClick={onOpenConverters}
        >
          Convert to
          <ChevronDown className="size-4" />
        </button>
        <span className="text-outline-variant">•</span>
        <button
          className="text-on-surface-variant transition-colors hover:text-text-primary"
          onClick={onJsonPath}
        >
          JSONPath
        </button>
      </div>
    </div>
  );
}
