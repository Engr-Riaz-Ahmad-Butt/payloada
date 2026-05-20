"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Link2, Shield, X } from "lucide-react";

// BUG-001: Practical URL length limit for cross-browser safety (~8 KB encoded)
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
  const previewText = useMemo(() => {
    const lines = source.split("\n").slice(0, 3);
    return lines.map((line) => (line.length > 84 ? `${line.slice(0, 84)}...` : line)).join("\n");
  }, [source]);

  // BUG-001 Fix B: encode without silent truncation; warn when payload is too large
  const { generatedUrl, isTooLarge } = useMemo(() => {
    const base =
      typeof window !== "undefined" ? `${window.location.origin}/workspace` : "/workspace";
    const encoded = encodeURIComponent(source);

    if (encoded.length > URL_SAFE_DATA_LIMIT) {
      return { generatedUrl: "", isTooLarge: true };
    }

    return { generatedUrl: `${base}?share=public&data=${encoded}`, isTooLarge: false };
  }, [source]);

  return (
    <div
      className="fixed inset-0 z-[86] overflow-y-auto bg-[rgba(10,10,14,0.8)] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-json-title"
    >
      <div
        className="mx-auto my-6 flex w-full max-w-[480px] flex-col overflow-hidden rounded-[16px] border-[0.5px] border-[#2A2F42] bg-[#13161E] sm:my-10"
        onClick={(event) => event.stopPropagation()}
        style={{ maxHeight: "calc(100vh - 48px)" }}
      >
        <div className="flex items-center justify-between border-b-[0.5px] border-ui-border px-5 py-4">
          <h2 id="share-json-title" className="text-[16px] font-semibold text-[#E8EAF0]">
            Share this JSON
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border-[0.5px] border-[#2A2F42] bg-[#1A1D24] p-2 text-[#8B92A8] transition-colors hover:border-[#C07040] hover:text-[#E8EAF0] focus-visible:border-[#C07040] focus-visible:outline-none"
            aria-label="Close share modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <pre className="overflow-hidden rounded-[8px] bg-[#0A0C0F] p-3 font-mono text-[12px] leading-6 text-[#8B92A8]">
            {previewText || "{ }"}
          </pre>

          {/* BUG-001 Fix B: show clear error instead of silently truncating */}
          {isTooLarge ? (
            <div className="flex items-start gap-3 rounded-[10px] border-[0.5px] border-[#5A3A1A] bg-[#1A0E00] px-4 py-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#C07040]" />
              <div>
                <p className="text-[13px] font-medium text-[#C07040]">JSON is too large to share via URL</p>
                <p className="mt-1 text-[12px] leading-[1.6] text-[#8B92A8]">
                  This payload exceeds the safe URL length limit. Download the file and share it directly instead.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 h-9 rounded-[8px] bg-[#C07040] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#D48050] focus-visible:outline-none"
                >
                  Close &amp; download instead
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* BUG-001 Fix A: only public link — no fake private/expiring options */}
              <div className="flex items-start gap-3 rounded-[10px] border-[0.5px] border-[#C07040] bg-[#1F140C] px-4 py-3">
                <Link2 className="mt-0.5 size-4 shrink-0 text-[#C07040]" />
                <div>
                  <p className="text-[13px] font-medium text-[#E8EAF0]">Public link</p>
                  <p className="mt-1 text-[12px] leading-[1.5] text-[#8B92A8]">
                    Anyone with this link can view the JSON. All data is encoded in the URL — nothing is stored on a server.
                  </p>
                </div>
              </div>

              <div className="rounded-[8px] border-[0.5px] border-ui-border bg-[#0A0C0F] p-3">
                <div className="flex items-center gap-3">
                  <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#3DD68C]">
                    {generatedUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => void onCopy(generatedUrl, "Copied share link")}
                    className="h-9 shrink-0 rounded-[8px] bg-[#C07040] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#D48050] focus-visible:outline-none"
                  >
                    Copy link
                  </button>
                </div>
              </div>

              {/* Coming soon: private & expiring links */}
              <div className="rounded-[10px] border-[0.5px] border-dashed border-[#2A2F42] px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#5A6070]">Coming soon — Pro</p>
                <p className="mt-1 text-[12px] leading-[1.6] text-[#3A4060]">
                  Password-protected and expiring links are planned for a future Pro release. All links are currently public and URL-encoded only.
                </p>
              </div>
            </>
          )}

          <div className="flex items-start gap-2 rounded-[8px] border-[0.5px] border-ui-border bg-[#11141B] px-3 py-3">
            <Shield className="mt-0.5 size-4 shrink-0 text-[#5A6070]" />
            <p className="text-[11px] leading-[1.6] text-[#5A6070]">
              Your JSON is processed locally. Nothing is stored on any server without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
