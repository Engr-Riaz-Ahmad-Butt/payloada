"use client";

import React, { useMemo, useState } from "react";
import { Lock, Shield, X } from "lucide-react";

type ShareOption = "public" | "private" | "expiring";
type ExpiryDuration = "1h" | "24h" | "7d" | "30d";

const EXPIRY_OPTIONS: ExpiryDuration[] = ["1h", "24h", "7d", "30d"];

export function ShareModal({
  source,
  onClose,
  onCopy,
}: {
  source: string;
  onClose: () => void;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [shareOption, setShareOption] = useState<ShareOption>("public");
  const [expiryDuration, setExpiryDuration] = useState<ExpiryDuration>("24h");

  const previewText = useMemo(() => {
    const lines = source.split("\n").slice(0, 3);
    return lines.map((line) => (line.length > 84 ? `${line.slice(0, 84)}...` : line)).join("\n");
  }, [source]);

  const generatedUrl = useMemo(() => {
    const base =
      typeof window !== "undefined" ? `${window.location.origin}/workspace` : "/workspace";
    const encoded = encodeURIComponent(source.slice(0, 1500));

    if (shareOption === "private") {
      return `${base}?share=private&data=${encoded}`;
    }

    if (shareOption === "expiring") {
      return `${base}?share=expiring&ttl=${expiryDuration}&data=${encoded}`;
    }

    return `${base}?share=public&data=${encoded}`;
  }, [expiryDuration, shareOption, source]);

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

          <div className="space-y-2">
            <ShareOptionCard
              selected={shareOption === "public"}
              title="Public link"
              description="Anyone with link can view"
              onSelect={() => setShareOption("public")}
            />

            <ShareOptionCard
              selected={shareOption === "private"}
              title="Private link"
              description="Password protected"
              pro
              onSelect={() => setShareOption("private")}
            />

            <ShareOptionCard
              selected={shareOption === "expiring"}
              title="Expiring link"
              description="Choose duration"
              pro
              onSelect={() => setShareOption("expiring")}
            >
              {shareOption === "expiring" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {EXPIRY_OPTIONS.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setExpiryDuration(duration)}
                      className={
                        expiryDuration === duration
                          ? "rounded-[6px] border-[0.5px] border-[#C07040] bg-[#1F140C] px-2.5 py-1 text-[11px] font-medium text-[#C07040]"
                          : "rounded-[6px] border-[0.5px] border-[#2A2F42] bg-[#1A1D24] px-2.5 py-1 text-[11px] font-medium text-[#8B92A8]"
                      }
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              ) : null}
            </ShareOptionCard>
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

          <div className="flex items-start gap-2 rounded-[8px] border-[0.5px] border-ui-border bg-[#11141B] px-3 py-3">
            <Shield className="mt-0.5 size-4 shrink-0 text-[#5A6070]" />
            <p className="text-[11px] leading-[1.6] text-[#5A6070]">
              Your JSON is processed locally. Nothing is stored without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareOptionCard({
  selected,
  title,
  description,
  pro,
  onSelect,
  children,
}: {
  selected: boolean;
  title: string;
  description: string;
  pro?: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "block w-full rounded-[10px] border-[0.5px] border-[#C07040] bg-[#1F140C] px-4 py-3 text-left"
          : "block w-full rounded-[10px] border-[0.5px] border-ui-border bg-[#0F1117] px-4 py-3 text-left"
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            selected
              ? "mt-1 inline-flex h-3 w-3 rounded-full border-[2px] border-[#C07040] bg-[#C07040]"
              : "mt-1 inline-flex h-3 w-3 rounded-full border-[2px] border-[#5A6070]"
          }
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-medium text-[#E8EAF0]">{title}</p>
            {pro ? (
              <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#1A1D24] px-1.5 py-0.5 text-[9px] font-medium text-[#C07040]">
                <Lock className="size-2.5" />
                Pro
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] leading-[1.5] text-[#8B92A8]">{description}</p>
          {children}
        </div>
      </div>
    </button>
  );
}
