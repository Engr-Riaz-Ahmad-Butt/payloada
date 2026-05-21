"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Copy, RotateCcw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type AiTask = "explain" | "fix" | "query" | "generate";

type ChatMsg =
  | { id: string; role: "user"; content: string; task: AiTask }
  | { id: string; role: "assistant"; content: string; task: AiTask; json: string | null; jsonPath: string | null }
  | { id: string; role: "loading" }
  | { id: string; role: "error"; message: string; code?: string; retryAfter?: number };

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

let _uid = 0;
const uid = () => String(++_uid);

const TASKS: AiTask[] = ["explain", "fix", "query", "generate"];

const TASK_LABEL: Record<AiTask, string> = {
  explain: "Explain",
  fix: "Fix",
  query: "Query",
  generate: "Generate",
};

const PLACEHOLDERS: Record<AiTask, string> = {
  explain: "Ask anything about this JSON…",
  fix: "Describe what to fix, or press send…",
  query: "e.g. Find all users where active is true",
  generate: "e.g. 10 records with varied statuses",
};

const SUGGESTIONS = [
  { task: "explain" as AiTask, label: "Explain this JSON", icon: "📖", q: undefined as string | undefined },
  { task: "fix" as AiTask, label: "Fix all errors", icon: "🔧", q: undefined as string | undefined },
  {
    task: "query" as AiTask,
    label: "Find sensitive fields",
    icon: "🔍",
    q: "Find all fields that look like passwords, tokens, API keys, or secrets",
  },
  { task: "generate" as AiTask, label: "Generate 5 similar records", icon: "✨", q: "5 realistic records" },
];

export function AiWorkspace({
  source,
  onSendToEditor,
  onCopy,
}: {
  source: string;
  onSendToEditor: (json: string) => void;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [task, setTask] = useState<AiTask>("explain");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasJson = source.trim().length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => (c > 1 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  async function send(t: AiTask, q?: string) {
    if (!hasJson) {
      toast.error("Paste JSON in the Editor first");
      return;
    }

    const content = q ?? input.trim();
    setInput("");
    setLoading(true);

    const loadId = uid();
    setMsgs((p) => [
      ...p,
      { id: uid(), role: "user", content: content || TASK_LABEL[t], task: t },
      { id: loadId, role: "loading" },
    ]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: t, json: source, question: content || undefined }),
      });

      const data = (await res.json()) as AiApiResponse;
      if (data.remaining !== undefined) setRemaining(data.remaining);

      if (!res.ok) {
        setCountdown(data.retryAfter ?? 0);
        setMsgs((p) =>
          p.map((m) =>
            m.id === loadId
              ? {
                  id: loadId,
                  role: "error" as const,
                  message: data.error ?? "Something went wrong",
                  code: data.code,
                  retryAfter: data.retryAfter,
                }
              : m,
          ),
        );
        return;
      }

      const result = data.result ?? "";
      setMsgs((p) =>
        p.map((m) =>
          m.id === loadId
            ? {
                id: loadId,
                role: "assistant" as const,
                content: result,
                task: t,
                json: extractFirstJsonBlock(result),
                jsonPath: extractJsonPath(result),
              }
            : m,
        ),
      );
      setCountdown(0);
    } catch {
      setMsgs((p) =>
        p.map((m) =>
          m.id === loadId
            ? { id: loadId, role: "error" as const, message: "Could not reach the AI service." }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMsgs([]);
    setCountdown(0);
    setLoading(false);
  }

  return (
    <div className="flex h-full flex-col bg-obsidian-base">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-[0.5px] border-ui-border bg-surface/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-copper-accent/15">
            <Sparkles className="size-3.5 text-copper-accent" />
          </div>
          <span className="text-[14px] font-semibold text-text-primary">AI Assistant</span>
          <span className="rounded-full border-[0.5px] border-copper-accent/30 bg-copper-accent/10 px-2 py-0.5 text-[10px] font-medium text-copper-accent">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          {remaining !== null && remaining <= 10 && (
            <span className="text-[11px] text-text-secondary">{remaining}/10 today</span>
          )}
          {msgs.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="flex items-center gap-1 text-[11px] text-text-secondary transition-colors hover:text-text-primary"
            >
              <RotateCcw className="size-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {!hasJson ? (
          <EmptyNoJson />
        ) : msgs.length === 0 ? (
          <WelcomeScreen onSuggest={(s) => void send(s.task, s.q)} />
        ) : (
          <div className="flex flex-col gap-5 px-4 py-5 sm:px-5">
            {msgs.map((m) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[82%] rounded-2xl rounded-tr-sm border-[0.5px] border-ui-border bg-surface-container-high px-4 py-3">
                      <p className="text-[13px] leading-relaxed text-text-primary">{m.content}</p>
                      <p className="mt-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-copper-accent/60">
                        {TASK_LABEL[m.task]}
                      </p>
                    </div>
                  </div>
                );
              }

              if (m.role === "loading") {
                return (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <AiAvatar />
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border-[0.5px] border-ui-border bg-surface-elevated px-4 py-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-copper-accent"
                          style={{ animation: `dot-b 1.2s ease-in-out ${i * 0.15}s infinite` }}
                        />
                      ))}
                      <style>{`@keyframes dot-b{0%,80%,100%{opacity:.2;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}`}</style>
                    </div>
                  </div>
                );
              }

              if (m.role === "error") {
                return (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <AiAvatar error />
                    <div className="max-w-[82%] rounded-2xl rounded-tl-sm border-[0.5px] border-red-500/20 bg-red-500/5 px-4 py-3">
                      <p className="text-[12px] font-semibold text-red-500 dark:text-red-400">Error</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{m.message}</p>
                      {countdown > 0 ? (
                        <p className="mt-2 text-[11px] text-text-secondary">Retry in {countdown}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void send(task)}
                          className="mt-2 text-[11px] font-medium text-copper-accent transition-opacity hover:opacity-75"
                        >
                          Try again →
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              if (m.role === "assistant") {
                return (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <AiAvatar />
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl rounded-tl-sm border-[0.5px] border-ui-border bg-surface-elevated px-4 py-4">
                        <RenderedResponse text={m.content} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-0.5">
                        <MsgBtn onClick={() => void onCopy(m.content, "Copied response")}>
                          <Copy className="size-3" /> Copy
                        </MsgBtn>
                        {m.jsonPath && m.task === "query" && (
                          <MsgBtn onClick={() => void onCopy(m.jsonPath!, "Copied JSONPath")} accent>
                            <Copy className="size-3" /> Copy JSONPath
                          </MsgBtn>
                        )}
                        {m.json && (m.task === "fix" || m.task === "generate") && (
                          <MsgBtn onClick={() => onSendToEditor(m.json!)} green>
                            <ArrowDownToLine className="size-3" />
                            {m.task === "generate" ? "Use in editor" : "Send to editor"}
                          </MsgBtn>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t-[0.5px] border-ui-border bg-surface px-4 py-3 sm:px-5">
        {/* Task chips */}
        <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
          {TASKS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTask(t)}
              className={cn(
                "shrink-0 rounded-full border-[0.5px] px-3 py-1 text-[11px] font-medium transition-colors",
                task === t
                  ? "border-copper-accent bg-copper-accent/15 text-copper-accent"
                  : "border-ui-border bg-surface-elevated text-text-secondary hover:border-ui-border-hover hover:text-text-primary",
              )}
            >
              {TASK_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Input row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(task);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDERS[task]}
            disabled={loading || countdown > 0 || !hasJson}
            className="h-10 min-w-0 flex-1 rounded-xl border-[0.5px] border-ui-border bg-obsidian-base px-4 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/50 transition-colors focus-visible:border-copper-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !hasJson || countdown > 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper-accent text-white transition-all hover:bg-copper-accent/85 disabled:opacity-40 focus-visible:outline-none"
          >
            <Send className="size-4" />
          </button>
        </form>

        <p className="mt-2 text-[10px] text-text-secondary/60">
          Powered by Gemini · Don&apos;t share passwords or private keys
        </p>
      </div>
    </div>
  );
}

function AiAvatar({ error = false }: { error?: boolean }) {
  return (
    <div
      className={cn(
        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        error ? "bg-red-500/15" : "bg-copper-accent/15",
      )}
    >
      <Sparkles className={cn("size-3.5", error ? "text-red-500 dark:text-red-400" : "text-copper-accent")} />
    </div>
  );
}

function MsgBtn({
  children,
  onClick,
  accent,
  green,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
  green?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-md border-[0.5px] px-2.5 py-1 text-[10px] font-medium transition-colors hover:opacity-80",
        accent
          ? "border-copper-accent/30 bg-copper-accent/10 text-copper-accent"
          : green
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-ui-border bg-surface-elevated text-text-secondary hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

function EmptyNoJson() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
        <Sparkles className="size-6 text-text-secondary" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-text-primary">No JSON loaded</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
          Paste or upload JSON in the Editor first.
        </p>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggest }: { onSuggest: (s: (typeof SUGGESTIONS)[number]) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-accent/15">
          <Sparkles className="size-5 text-copper-accent" />
        </div>
        <p className="text-[16px] font-semibold text-text-primary">Ask anything about your JSON</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
          Explain, fix, query, or generate mock data.
        </p>
      </div>

      <div className="grid w-full max-w-xs gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSuggest(s)}
            className="flex items-center gap-3 rounded-xl border-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 text-left transition-all hover:border-copper-accent/30 hover:bg-copper-accent/5"
          >
            <span className="text-base leading-none">{s.icon}</span>
            <span className="text-[13px] font-medium text-text-secondary">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RenderedResponse({ text }: { text: string }) {
  const parts = splitOnCodeBlocks(text);
  return (
    <div className="space-y-3 text-[13px] leading-[1.7] text-text-secondary">
      {parts.map((part, index) =>
        part.type === "code" ? (
          <pre
            key={index}
            className="overflow-x-auto rounded-lg border-[0.5px] border-ui-border bg-obsidian-base p-3 font-mono text-[12px] leading-6 text-emerald-600 dark:text-emerald-400"
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
        const t = line.trim();
        if (!t) return null;

        if (/^\*\*JSONPath:\*\*/.test(t)) {
          return (
            <div
              key={index}
              className="rounded-md border-[0.5px] border-ui-border bg-surface-container px-3 py-2 font-mono text-[11px] text-copper-accent"
            >
              {renderInlineMarkup(t)}
            </div>
          );
        }

        if (isSectionHeading(t)) {
          const tone = getHeadingTone(t);
          return (
            <p
              key={index}
              className={cn(
                "pt-2 text-[12px] font-semibold",
                tone === "alert"
                  ? "text-copper-accent"
                  : tone === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-text-primary",
              )}
            >
              {renderInlineMarkup(t)}
            </p>
          );
        }

        if (/^[-*]\s/.test(t)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-accent" />
              <span>{renderInlineMarkup(t.replace(/^[-*]\s/, ""))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(t)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="min-w-5 font-mono text-[11px] text-text-secondary">{t.match(/^\d+\./)?.[0]}</span>
              <span>{renderInlineMarkup(t.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkup(t)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkup(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code
          key={index}
          className="rounded border-[0.5px] border-ui-border bg-surface-elevated px-1 font-mono text-[11px] text-copper-accent"
        >
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
    if (match.index > lastIndex) parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    parts.push({ type: "code", content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push({ type: "text", content: text.slice(lastIndex) });
  return parts;
}

function extractFirstJsonBlock(text: string): string | null {
  const match = /```(?:json)?\n?([\s\S]*?)```/.exec(text);
  if (!match) return null;
  try {
    JSON.parse(match[1].trim());
    return match[1].trim();
  } catch {
    return null;
  }
}

function extractJsonPath(text: string): string | null {
  return /\*\*JSONPath:\*\*\s*`([^`]+)`/.exec(text)?.[1] ?? null;
}

function isSectionHeading(line: string) {
  return (
    /^\*\*[^*]+\*\*$/.test(line) || /^(Key fields|Watchouts|What changed|Issues found)$/i.test(line)
  );
}

function getHeadingTone(line: string) {
  if (/^(Watchouts|Issues found)$/i.test(line.replace(/\*/g, ""))) return "alert" as const;
  if (/^What changed$/i.test(line.replace(/\*/g, ""))) return "success" as const;
  return "default" as const;
}
