"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Copy, Cpu, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type AiTask = "explain" | "fix" | "query" | "generate";

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: string; remaining: number }
  | {
      status: "error";
      message: string;
      code?: string;
      retryAfter?: number;
      provider?: string;
      model?: string;
      upstreamMessage?: string;
    };

type AiApiResponse = {
  result?: string;
  remaining?: number;
  error?: string;
  code?: string;
  retryAfter?: number;
  provider?: string;
  model?: string;
  upstreamMessage?: string;
};

const TABS: { id: AiTask; label: string }[] = [
  { id: "explain", label: "Explain" },
  { id: "fix", label: "Fix" },
  { id: "query", label: "Query" },
  { id: "generate", label: "Generate" },
];

const QUICK_ACTIONS: { task: AiTask; label: string; question?: string }[] = [
  { task: "explain", label: "Explain this JSON" },
  { task: "fix", label: "Fix all errors" },
  {
    task: "query",
    label: "Find sensitive fields",
    question: "Find all fields that look like passwords, tokens, API keys, or secrets",
  },
  { task: "generate", label: "Generate 5 similar records", question: "5 realistic records" },
];

const TAB_HINTS: Record<AiTask, string> = {
  explain: "Get a plain-English breakdown of your JSON - structure, fields, and purpose.",
  fix: "Detect and repair invalid JSON, or flag type mismatches and naming issues.",
  query: "Ask a natural-language question - get the matching data and its JSONPath.",
  generate: "Create realistic mock records that mirror your current JSON structure.",
};

const PLACEHOLDERS: Record<AiTask, string> = {
  explain: "Ask anything about this JSON...",
  fix: "Describe what to improve, or just press send...",
  query: "e.g. Find all users where active is true",
  generate: "e.g. 10 records with varied statuses",
};

export function AiWorkspace({
  source,
  onSendToEditor,
  onCopy,
}: {
  source: string;
  onSendToEditor: (json: string) => void;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<AiTask>("explain");
  const [question, setQuestion] = useState("");
  const [aiState, setAiState] = useState<AiState>({ status: "idle" });
  const [remaining, setRemaining] = useState<number | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasJson = source.trim().length > 0;
  const showRemaining = remaining !== null && remaining >= 0 && remaining <= 10;

  useEffect(() => {
    if (retryCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRetryCountdown((current) => (current > 1 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryCountdown]);

  function resetPanel() {
    setAiState({ status: "idle" });
    setQuestion("");
    setRetryCountdown(0);
  }

  async function runTask(task: AiTask, overrideQuestion?: string) {
    if (!hasJson) {
      toast.error("Paste JSON in the Editor first");
      return;
    }

    const q = overrideQuestion ?? (question.trim() || undefined);
    setAiState({ status: "loading" });

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, json: source, question: q }),
      });

      const data = (await res.json()) as AiApiResponse;

      if (!res.ok) {
        setRetryCountdown(data.retryAfter ?? 0);
        setAiState({
          status: "error",
          message: data.error ?? "Something went wrong",
          code: data.code,
          retryAfter: data.retryAfter,
          provider: data.provider,
          model: data.model,
          upstreamMessage: data.upstreamMessage,
        });
        return;
      }

      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }

      setRetryCountdown(0);
      setAiState({
        status: "done",
        result: data.result ?? "",
        remaining: data.remaining ?? 0,
      });
    } catch {
      setRetryCountdown(0);
      setAiState({
        status: "error",
        message: "Could not reach the AI service. Check your connection.",
      });
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void runTask(activeTab);
  }

  const doneResult = aiState.status === "done" ? aiState.result : null;
  const extractedJson = doneResult ? extractFirstJsonBlock(doneResult) : null;
  const extractedJsonPath = doneResult ? extractJsonPath(doneResult) : null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-obsidian-base">
      <div className="flex shrink-0 items-center justify-between border-b-[0.5px] border-ui-border bg-[#171717]/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-[#C07040]" />
          <h2 className="text-[14px] font-medium text-[#E8EAF0]">AI Assistant</h2>
          <span className="rounded-full border-[0.5px] border-[#C07040]/30 bg-[#1F140C] px-2 py-0.5 text-[10px] font-medium text-[#C07040]">
            Beta
          </span>
        </div>
        {showRemaining ? (
          <span className="text-[11px] text-[#5A6070]">{remaining} of 10 free today</span>
        ) : null}
      </div>

      <div className="flex shrink-0 border-b-[0.5px] border-ui-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              resetPanel();
            }}
            className={cn(
              "flex-1 py-2.5 text-[12px] font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-[#C07040] text-[#E8EAF0]"
                : "text-[#5A6070] hover:text-[#8B92A8]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hasJson ? (
          <EmptyNoJson />
        ) : aiState.status === "idle" ? (
          <IdleState
            activeTab={activeTab}
            onQuickAction={(action) => void runTask(action.task, action.question)}
          />
        ) : aiState.status === "loading" ? (
          <LoadingState />
        ) : aiState.status === "error" ? (
          <ErrorState
            message={aiState.message}
            code={aiState.code}
            retryAfter={retryCountdown}
            provider={aiState.provider}
            model={aiState.model}
            upstreamMessage={aiState.upstreamMessage}
            onRetry={retryCountdown > 0 ? undefined : () => void runTask(activeTab)}
          />
        ) : (
          <ResultState
            result={aiState.result}
            activeTab={activeTab}
            onReset={resetPanel}
            onCopy={() => void onCopy(aiState.result, "Copied AI response")}
            onCopyJsonPath={
              extractedJsonPath && activeTab === "query"
                ? () => void onCopy(extractedJsonPath, "Copied JSONPath")
                : undefined
            }
            onSendToEditor={
              extractedJson && (activeTab === "fix" || activeTab === "generate")
                ? () => {
                    onSendToEditor(extractedJson);
                    resetPanel();
                  }
                : undefined
            }
          />
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t-[0.5px] border-ui-border bg-[#0F1117] px-4 py-3 sm:px-5"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={PLACEHOLDERS[activeTab]}
            disabled={aiState.status === "loading" || retryCountdown > 0}
            className="h-9 min-w-0 flex-1 rounded-md border-[0.5px] border-ui-border bg-[#0A0C0F] px-3 text-[13px] text-[#E8EAF0] outline-none placeholder:text-[#3A4060] focus-visible:border-[#C07040] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={aiState.status === "loading" || !hasJson || retryCountdown > 0}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#C07040] text-white transition-colors hover:bg-[#D48050] disabled:opacity-40 focus-visible:outline-none"
          >
            <Send className="size-3.5" />
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-normal text-[#3A4060]">
          Queries are processed by Gemini. Do not send passwords, private keys, or personal
          data.
        </p>
      </form>
    </div>
  );
}

function EmptyNoJson() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1D24]">
        <Cpu className="size-6 text-[#5A6070]" />
      </div>
      <div>
        <p className="text-[15px] font-medium text-[#5A6070]">No JSON loaded</p>
        <p className="mt-1.5 text-[13px] leading-[1.6] text-[#3A4060]">
          Paste or upload JSON in the Editor, then return here to analyze it.
        </p>
      </div>
    </div>
  );
}

function IdleState({
  activeTab,
  onQuickAction,
}: {
  activeTab: AiTask;
  onQuickAction: (action: (typeof QUICK_ACTIONS)[number]) => void;
}) {
  const visibleActions = QUICK_ACTIONS.filter((action) =>
    activeTab === "explain"
      ? action.task === "explain" || action.task === "query"
      : action.task === activeTab,
  );

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
      <p className="text-[13px] leading-[1.6] text-[#5A6070]">{TAB_HINTS[activeTab]}</p>

      <div>
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#3A4060]">
          Quick actions
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onQuickAction(action)}
              className="flex items-center gap-2.5 rounded-xl border-[0.5px] border-ui-border bg-[#0F1117] px-3 py-2.5 text-left text-[12px] font-medium text-[#8B92A8] transition-colors hover:border-[#C07040]/40 hover:bg-[#1F140C] hover:text-[#E8EAF0]"
            >
              <span className="text-[#C07040]">*</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-[#C07040]"
            style={{ animation: `ai-pulse 1.2s ease-in-out ${index * 0.2}s infinite` }}
          />
        ))}
      </div>
      <p className="text-[13px] text-[#5A6070]">Thinking...</p>
      <style>{`@keyframes ai-pulse{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

function ErrorState({
  message,
  code,
  retryAfter,
  provider,
  model,
  upstreamMessage,
  onRetry,
}: {
  message: string;
  code?: string;
  retryAfter?: number;
  provider?: string;
  model?: string;
  upstreamMessage?: string;
  onRetry?: () => void;
}) {
  const isUpstreamRateLimit = code === "rate_limited_upstream";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-full max-w-sm rounded-xl border-[0.5px] border-[#FF5C6C]/40 bg-[#2A0D10] px-4 py-3">
        <p className="text-[13px] font-medium text-[#FF5C6C]">Error</p>
        <p className="mt-1 text-[12px] leading-[1.6] text-[#8B92A8]">{message}</p>
        {isUpstreamRateLimit ? (
          <div className="mt-3 rounded-lg border-[0.5px] border-[#2A2F42] bg-[#0F1117] px-3 py-2 text-left">
            <p className="font-mono text-[11px] text-[#5A6070]">
              Provider: <span className="text-[#E8EAF0]">{provider ?? "gemini"}</span>
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#5A6070]">
              Model: <span className="text-[#E8EAF0]">{model ?? "unknown"}</span>
            </p>
            {upstreamMessage ? (
              <p className="mt-1 break-words font-mono text-[11px] leading-[1.6] text-[#8B92A8]">
                Upstream: {upstreamMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#C07040] hover:text-[#D48050]"
        >
          <RotateCcw className="size-3" />
          Try again
        </button>
      ) : retryAfter && retryAfter > 0 ? (
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#5A6070]">
          <RotateCcw className="size-3" />
          Retry available in {retryAfter}s
        </div>
      ) : null}
    </div>
  );
}

function ResultState({
  result,
  activeTab,
  onReset,
  onCopy,
  onCopyJsonPath,
  onSendToEditor,
}: {
  result: string;
  activeTab: AiTask;
  onReset: () => void;
  onCopy: () => void;
  onCopyJsonPath?: () => void;
  onSendToEditor?: () => void;
}) {
  const sendButtonLabel = activeTab === "generate" ? "Use in editor" : "Send to editor";

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#3A4060]">
          Response
        </p>
        <div className="flex items-center gap-2">
          {onSendToEditor && activeTab === "fix" ? (
            <button
              type="button"
              onClick={onSendToEditor}
              className="flex items-center gap-1.5 rounded-md border-[0.5px] border-[#3DD68C]/30 bg-[#0D2E23] px-2.5 py-1.5 text-[11px] font-medium text-[#3DD68C] transition-colors hover:opacity-80"
            >
              <ArrowDownToLine className="size-3" />
              {sendButtonLabel}
            </button>
          ) : null}
          {onSendToEditor && activeTab === "generate" ? (
            <button
              type="button"
              onClick={onSendToEditor}
              className="flex items-center gap-1.5 rounded-md border-[0.5px] border-[#3DD68C]/30 bg-[#0D2E23] px-2.5 py-1.5 text-[11px] font-medium text-[#3DD68C] transition-colors hover:opacity-80"
            >
              <ArrowDownToLine className="size-3" />
              {sendButtonLabel}
            </button>
          ) : null}
          {onCopyJsonPath ? (
            <button
              type="button"
              onClick={onCopyJsonPath}
              className="flex items-center gap-1.5 rounded-md border-[0.5px] border-[#C07040]/30 bg-[#1F140C] px-2.5 py-1.5 text-[11px] font-medium text-[#C07040] transition-colors hover:opacity-80"
            >
              <Copy className="size-3" />
              Copy JSONPath
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1.5 rounded-md border-[0.5px] border-ui-border bg-[#1A1D24] px-2.5 py-1.5 text-[11px] font-medium text-[#8B92A8] transition-colors hover:text-[#E8EAF0]"
          >
            <Copy className="size-3" />
            Copy
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-md border-[0.5px] border-ui-border bg-[#1A1D24] px-2.5 py-1.5 text-[11px] font-medium text-[#8B92A8] transition-colors hover:text-[#E8EAF0]"
          >
            <RotateCcw className="size-3" />
            New
          </button>
        </div>
      </div>

      <div className="rounded-xl border-[0.5px] border-ui-border bg-[#0A0C0F] p-4">
        <RenderedResponse text={result} />
      </div>
    </div>
  );
}

function RenderedResponse({ text }: { text: string }) {
  const parts = splitOnCodeBlocks(text);

  return (
    <div className="space-y-3 text-[13px] leading-[1.7] text-[#8B92A8]">
      {parts.map((part, index) =>
        part.type === "code" ? (
          <pre
            key={index}
            className="overflow-x-auto rounded-md bg-[#0F1117] p-3 font-mono text-[12px] leading-6 text-[#3DD68C]"
          >
            <code>{part.content}</code>
          </pre>
        ) : (
          <InlineText key={index} text={part.content} />
        ),
      )}
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return null;
        }

        if (/^\*\*JSONPath:\*\*/.test(trimmedLine)) {
          return (
            <div
              key={index}
              className="rounded-md border-[0.5px] border-[#2A2F42] bg-[#0F1117] px-3 py-2 font-mono text-[11px] text-[#C07040]"
            >
              {renderInlineMarkup(trimmedLine)}
            </div>
          );
        }

        if (isSectionHeading(trimmedLine)) {
          const tone = getHeadingTone(trimmedLine);
          return (
            <p
              key={index}
              className={cn(
                "pt-2 text-[12px] font-semibold",
                tone === "alert"
                  ? "text-[#F5A623]"
                  : tone === "success"
                    ? "text-[#3DD68C]"
                    : "text-[#E8EAF0]",
              )}
            >
              {renderInlineMarkup(trimmedLine)}
            </p>
          );
        }

        if (/^[-*]\s/.test(trimmedLine)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C07040]" />
              <span>{renderInlineMarkup(trimmedLine.replace(/^[-*]\s/, ""))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmedLine)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="min-w-5 font-mono text-[11px] text-[#5A6070]">
                {trimmedLine.match(/^\d+\./)?.[0]}
              </span>
              <span>{renderInlineMarkup(trimmedLine.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkup(trimmedLine)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkup(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={index} className="font-semibold text-[#E8EAF0]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^`[^`]+`$/.test(part)) {
      return (
        <code key={index} className="rounded bg-[#1A1D24] px-1 font-mono text-[11px] text-[#C07040]">
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

type TextPart = { type: "text"; content: string } | { type: "code"; content: string };

function splitOnCodeBlocks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const regex = /```(?:\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    parts.push({ type: "code", content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts;
}

function extractFirstJsonBlock(text: string): string | null {
  const match = /```(?:json)?\n?([\s\S]*?)```/.exec(text);
  if (!match) {
    return null;
  }

  try {
    JSON.parse(match[1].trim());
    return match[1].trim();
  } catch {
    return null;
  }
}

function extractJsonPath(text: string): string | null {
  const match = /\*\*JSONPath:\*\*\s*`([^`]+)`/.exec(text);
  return match?.[1] ?? null;
}

function isSectionHeading(line: string) {
  return (
    /^\*\*[^*]+\*\*$/.test(line) ||
    /^(Key fields|Watchouts|What changed|Issues found)$/i.test(line)
  );
}

function getHeadingTone(line: string) {
  if (/^(Watchouts|Issues found)$/i.test(line.replace(/\*/g, ""))) {
    return "alert" as const;
  }

  if (/^What changed$/i.test(line.replace(/\*/g, ""))) {
    return "success" as const;
  }

  return "default" as const;
}
