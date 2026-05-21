import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Link2, Shield, X } from "lucide-react";

import { compressString } from "./compression";

const URL_SAFE_DATA_LIMIT = 8_000;

export function ShareModal({
  source,
  onClose,
  onCopy,
}: {
  source: string;
  onClose: () => void;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const workspaceOrigin =
    typeof window !== "undefined" ? `${window.location.origin}/workspace` : "/workspace";

  const previewText = useMemo(() => {
    const lines = source.split("\n").slice(0, 3);
    return lines.map((line) => (line.length > 84 ? `${line.slice(0, 84)}...` : line)).join("\n");
  }, [source]);

  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isTooLarge, setIsTooLarge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function generate() {
      if (active) setIsLoading(true);
      try {
        const compressed = await compressString(source);

        if (!active) return;

        if (compressed.length > URL_SAFE_DATA_LIMIT) {
          setIsTooLarge(true);
          setGeneratedUrl("");
        } else {
          setIsTooLarge(false);
          setGeneratedUrl(`${workspaceOrigin}?share=compressed&data=${compressed}`);
        }
      } catch {
        if (!active) return;
        const encoded = encodeURIComponent(source);
        if (encoded.length > URL_SAFE_DATA_LIMIT) {
          setIsTooLarge(true);
          setGeneratedUrl("");
        } else {
          setIsTooLarge(false);
          setGeneratedUrl(`${workspaceOrigin}?share=public&data=${encoded}`);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void generate();

    return () => {
      active = false;
    };
  }, [source, workspaceOrigin]);

  return (
    <div
      className="fixed inset-0 z-[86] overflow-y-auto bg-[rgba(10,10,14,0.8)] p-4"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-json-title"
    >
      <div
        className="mx-auto my-6 flex w-full max-w-[480px] flex-col overflow-hidden rounded-[16px] border-[0.5px] border-ui-border bg-surface sm:my-10"
        onClick={(event) => event.stopPropagation()}
        style={{ maxHeight: "calc(100vh - 48px)" }}
      >
        <div className="flex items-center justify-between border-b-[0.5px] border-ui-border px-5 py-4">
          <h2 id="share-json-title" className="text-[16px] font-semibold text-text-primary">
            Share this JSON
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border-[0.5px] border-ui-border bg-surface-elevated p-2 text-text-secondary transition-colors hover:border-copper-accent hover:text-text-primary focus-visible:border-copper-accent focus-visible:outline-none"
            aria-label="Close share modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <pre className="overflow-hidden rounded-[8px] bg-obsidian-base p-3 font-mono text-[12px] leading-6 text-text-secondary">
            {previewText || "{ }"}
          </pre>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border-[0.5px] border-ui-border bg-obsidian-base py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-ui-border border-t-copper-accent" />
              <p className="font-mono text-[11px] text-text-secondary">
                Securing and compressing link...
              </p>
            </div>
          ) : isTooLarge ? (
            <div className="flex items-start gap-3 rounded-[10px] border-[0.5px] border-copper-accent/30 bg-copper-accent/10 px-4 py-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-copper-accent" />
              <div>
                <p className="text-[13px] font-medium text-copper-accent">
                  JSON is too large to share via URL
                </p>
                <p className="mt-1 text-[12px] leading-[1.6] text-text-secondary">
                  This payload exceeds the safe URL length limit. Download the file and share it
                  directly instead.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 h-9 rounded-[8px] bg-copper-accent px-4 text-[13px] font-semibold text-white transition-colors hover:bg-copper-accent/90 focus-visible:outline-none"
                >
                  Close and download instead
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-[10px] border-[0.5px] border-copper-accent bg-copper-accent/10 px-4 py-3">
                <Link2 className="mt-0.5 size-4 shrink-0 text-copper-accent" />
                <div>
                  <p className="text-[13px] font-medium text-text-primary">Public link</p>
                  <p className="mt-1 text-[12px] leading-[1.5] text-text-secondary">
                    Anyone with this link can view the JSON. All data is encoded in the URL -
                    nothing is stored on a server.
                  </p>
                </div>
              </div>

              <div className="rounded-[8px] border-[0.5px] border-ui-border bg-obsidian-base p-3">
                <div className="flex items-center gap-3">
                  <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-emerald-600 dark:text-emerald-400">
                    {generatedUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => void onCopy(generatedUrl, "Copied share link")}
                    className="h-9 shrink-0 rounded-[8px] bg-copper-accent px-4 text-[15px] font-semibold text-white transition-colors hover:bg-copper-accent/90 focus-visible:outline-none"
                  >
                    Copy link
                  </button>
                </div>
              </div>

              <div className="rounded-[10px] border-[0.5px] border-dashed border-ui-border px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">
                  Coming soon - Pro
                </p>
                <p className="mt-1 text-[12px] leading-[1.6] text-text-tertiary">
                  Password-protected and expiring links are planned for a future Pro release. All
                  links are currently public and URL-encoded only.
                </p>
              </div>
            </>
          )}

          <div className="flex items-start gap-2 rounded-[8px] border-[0.5px] border-ui-border bg-surface-elevated px-3 py-3">
            <Shield className="mt-0.5 size-4 shrink-0 text-text-secondary" />
            <p className="text-[11px] leading-[1.6] text-text-secondary">
              Your JSON is processed locally. Nothing is stored on any server without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
