"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Braces,
  Copy,
  Eye,
  FileUp,
  RotateCcw,
  Search,
  Send,
  Shield,
  Sparkles,
  WandSparkles,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type AiTask = "explain" | "fix" | "query" | "generate";

type ChatMsg =
  | { id: string; role: "user"; content: string; task: AiTask; createdAt: number }
  | {
      id: string;
      role: "assistant";
      content: string;
      task: AiTask;
      json: string | null;
      jsonPath: string | null;
      createdAt: number;
    }
  | { id: string; role: "loading" }
  | { id: string; role: "error"; message: string; code?: string; retryAfter?: number; createdAt: number };

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

type Suggestion = {
  task: AiTask;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  q?: string;
};

let _uid = 0;
const uid = () => String(++_uid);
const getNow = () => Date.now();
const AI_WORKSPACE_SESSION_KEY = "payloada-ai-workspace-session";

const TASKS: AiTask[] = ["explain", "fix", "query", "generate"];

const TASK_LABEL: Record<AiTask, string> = {
  explain: "Explain",
  fix: "Fix",
  query: "Query",
  generate: "Generate",
};

const PLACEHOLDERS: Record<AiTask, string> = {
  explain: "Ask anything about this JSON...",
  fix: "Describe what to fix, or press send...",
  query: "e.g. Find all users where active is true",
  generate: "e.g. Generate 5 realistic records from this schema",
};

const SUGGESTIONS: Suggestion[] = [
  { task: "explain", label: "Explain JSON", icon: Sparkles },
  { task: "fix", label: "Fix errors", icon: Wrench },
  { task: "query", label: "Query data", icon: Search, q: "Find the most important fields in this JSON" },
  { task: "generate", label: "Generate sample", icon: WandSparkles, q: "Generate 5 realistic records" },
  {
    task: "query",
    label: "Find sensitive fields",
    icon: Shield,
    q: "Find all fields that look like passwords, tokens, API keys, authorization headers, or secrets",
  },
  {
    task: "generate",
    label: "Generate TypeScript types",
    icon: Braces,
    q: "Generate TypeScript types for this JSON",
  },
];

export function AiWorkspace({
  source,
  onSendToEditor,
  onSetSource,
  onCopy,
  onViewJson,
}: {
  source: string;
  onSendToEditor: (json: string) => void;
  onSetSource?: (json: string) => void;
  onCopy: (value: string, message?: string) => Promise<void>;
  onViewJson?: () => void;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [task, setTask] = useState<AiTask>("explain");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasRestoredSessionRef = useRef(false);
  const hasJson = source.trim().length > 0;
  const jsonSizeKb = hasJson ? (new TextEncoder().encode(source).length / 1024).toFixed(1) : null;
  const lastAssistant = [...msgs].reverse().find((message): message is Extract<ChatMsg, { role: "assistant" }> => message.role === "assistant");
  const lastUser = [...msgs].reverse().find((message): message is Extract<ChatMsg, { role: "user" }> => message.role === "user");

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(AI_WORKSPACE_SESSION_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as {
        msgs?: ChatMsg[];
        task?: AiTask;
        input?: string;
        remaining?: number | null;
        countdown?: number;
      };

      if (Array.isArray(saved.msgs)) {
        setMsgs(saved.msgs);
      }
      if (saved.task && TASKS.includes(saved.task)) {
        setTask(saved.task);
      }
      if (typeof saved.input === "string") {
        setInput(saved.input);
      }
      if (typeof saved.remaining === "number" || saved.remaining === null) {
        setRemaining(saved.remaining ?? null);
      }
      if (typeof saved.countdown === "number" && saved.countdown > 0) {
        setCountdown(saved.countdown);
      }
    } catch {
      window.sessionStorage.removeItem(AI_WORKSPACE_SESSION_KEY);
    } finally {
      hasRestoredSessionRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredSessionRef.current) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        AI_WORKSPACE_SESSION_KEY,
        JSON.stringify({
          msgs,
          task,
          input,
          remaining,
          countdown,
        }),
      );
    } catch {
      // Ignore storage write failures and keep the in-memory experience working.
    }
  }, [countdown, input, msgs, remaining, task]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((current) => (current > 1 ? current - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      toast.error("Please select a JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result;
      if (typeof text !== "string") return;

      try {
        JSON.parse(text);
        onSetSource?.(text);
        toast.success(`Loaded ${file.name}`);
      } catch {
        toast.error("Invalid JSON file - could not parse");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  async function send(nextTask: AiTask, question?: string) {
    if (!hasJson) {
      toast.error("Paste JSON in the Editor first");
      return;
    }

    const content = question ?? input.trim();
    const createdAt = getNow();
    setInput("");
    setLoading(true);

    const loadingId = uid();
    setMsgs((previous) => [
      ...previous,
      {
        id: uid(),
        role: "user",
        content: content || getFallbackUserMessage(nextTask),
        task: nextTask,
        createdAt,
      },
      { id: loadingId, role: "loading" },
    ]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: nextTask, json: source, question: content || undefined }),
      });

      const data = (await res.json()) as AiApiResponse;
      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }

      if (!res.ok) {
        setCountdown(data.retryAfter ?? 0);
        setMsgs((previous) =>
          previous.map((message) =>
            message.id === loadingId
              ? {
                  id: loadingId,
                  role: "error" as const,
                  message: data.error ?? "Something went wrong",
                  code: data.code,
                  retryAfter: data.retryAfter,
                  createdAt: getNow(),
                }
              : message,
          ),
        );
        return;
      }

      const result = data.result ?? "";
      setMsgs((previous) =>
        previous.map((message) =>
          message.id === loadingId
            ? {
                id: loadingId,
                role: "assistant" as const,
                content: result,
                task: nextTask,
                json: extractFirstJsonBlock(result),
                jsonPath: extractJsonPath(result),
                createdAt: getNow(),
              }
            : message,
        ),
      );
      setCountdown(0);
    } catch {
      setMsgs((previous) =>
        previous.map((message) =>
          message.id === loadingId
            ? {
                id: loadingId,
                role: "error" as const,
                message: "Could not reach the AI service.",
                createdAt: getNow(),
              }
            : message,
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
    setRemaining(null);
    setInput("");

    try {
      window.sessionStorage.removeItem(AI_WORKSPACE_SESSION_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!loading && countdown <= 0 && hasJson) {
        void send(task);
      }
    }
  }

  async function handleCopyLast() {
    if (!lastAssistant) {
      return;
    }

    await onCopy(lastAssistant.content, "Copied last response");
  }

  function handleRegenerate() {
    if (!lastUser || loading || countdown > 0) {
      return;
    }

    void send(lastUser.task, lastUser.content);
  }

  return (
    <div className="flex h-full flex-col bg-obsidian-base">
      <div className="flex shrink-0 items-center justify-between border-b-[0.5px] border-ui-border bg-[#0F1117] px-4 py-2 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border-[0.5px] border-copper-accent bg-copper-accent/10">
            <Sparkles className="size-3.5 text-copper-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-text-primary">AI Assistant</span>
              <span className="rounded-sm border-[0.5px] border-copper-accent/30 bg-copper-accent/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-copper-accent">
                Beta
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSetSource ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-7 items-center gap-1.5 rounded-lg border-[0.5px] border-ui-border bg-transparent px-2.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-ui-border-hover hover:bg-surface-elevated/50 hover:text-text-primary"
              >
                <FileUp className="size-3.5" />
                Upload JSON
              </button>
            </>
          ) : null}
          {(msgs.length > 0 || input.trim()) && (
            <button
              type="button"
              onClick={clearChat}
              className="flex h-7 items-center gap-1.5 rounded-lg border-[0.5px] border-ui-border bg-transparent px-2.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-ui-border-hover hover:bg-surface-elevated/50 hover:text-text-primary"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </button>
          )}
          {onViewJson ? (
            <button
              type="button"
              onClick={onViewJson}
              className="flex h-7 items-center gap-1.5 rounded-lg border-[0.5px] border-ui-border bg-transparent px-2.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-ui-border-hover hover:bg-surface-elevated/50 hover:text-text-primary"
            >
              <Eye className="size-3.5" />
              View JSON
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b-[0.5px] border-ui-border bg-[#0F1117] px-4 py-1.5 sm:px-5">
        {hasJson ? (
          <span className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Using editor JSON
            <span className="text-[#5A6070]">- {jsonSizeKb} KB</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
            No JSON loaded
          </span>
        )}

        <span className="hidden h-3.5 w-px bg-ui-border sm:block" />
        <span className="font-mono text-[11px] text-text-secondary">
          Mode <span className="text-[#8B92A8]">{TASK_LABEL[task]}</span>
        </span>
        <span className="hidden h-3.5 w-px bg-ui-border sm:block" />
        <span className="font-mono text-[11px] text-text-secondary">
          Model <span className="text-[#8B92A8]">Gemini</span>
        </span>

        {remaining !== null && remaining <= 10 ? (
          <>
            <span className="hidden h-3.5 w-px bg-ui-border sm:block" />
            <span className="font-mono text-[11px] text-text-secondary">
              Uses left <span className="text-[#F5A623]">{remaining}</span>
            </span>
          </>
        ) : null}

      </div>

      <div className="flex shrink-0 gap-2 overflow-x-auto border-b-[0.5px] border-ui-border px-4 py-2 sm:px-5">
        {SUGGESTIONS.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => {
                setTask(suggestion.task);
                void send(suggestion.task, suggestion.q);
              }}
              className={cn(
                "flex h-7 shrink-0 items-center gap-1.5 rounded-full border-[0.5px] px-3 text-[10px] font-medium transition-colors",
                task === suggestion.task
                  ? "border-copper-accent bg-copper-accent/12 text-copper-accent shadow-[0_0_0_1px_rgba(192,112,64,0.12)]"
                  : "border-ui-border bg-[#0F1117] text-text-secondary hover:border-copper-accent/40 hover:bg-surface-elevated/40 hover:text-copper-accent",
              )}
            >
              <Icon className="size-3.5" />
              {suggestion.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3 sm:px-5">
        {!hasJson ? (
          <EmptyNoJson />
        ) : msgs.length === 0 ? (
          <WelcomeScreen
            onSuggest={(suggestion) => {
              setTask(suggestion.task);
              void send(suggestion.task, suggestion.q);
            }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {msgs.map((message) => {
              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-tr-sm border-[0.5px] border-[#3A2218] bg-[#1F140C] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <p className="text-[12px] leading-relaxed text-text-primary">{message.content}</p>
                      <p className="mt-1.5 text-right text-[10px] text-[#5A6070]">
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              }

              if (message.role === "loading") {
                return (
                  <div key={message.id} className="flex items-start gap-2.5">
                    <AiAvatar />
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border-[0.5px] border-ui-border bg-[#0F1117] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="h-1.5 w-1.5 rounded-full bg-copper-accent"
                          style={{ animation: `dot-b 1.2s ease-in-out ${index * 0.15}s infinite` }}
                        />
                      ))}
                      <style>{`@keyframes dot-b{0%,80%,100%{opacity:.2;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}`}</style>
                    </div>
                  </div>
                );
              }

              if (message.role === "error") {
                return (
                  <div key={message.id} className="flex items-start gap-2.5">
                    <AiAvatar error />
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border-[0.5px] border-red-500/20 bg-red-500/5 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <p className="text-[12px] font-semibold text-red-500 dark:text-red-400">Error</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{message.message}</p>
                      <p className="mt-1.5 text-[10px] text-[#5A6070]">{formatMessageTime(message.createdAt)}</p>
                      {countdown > 0 ? (
                        <p className="mt-2 text-[11px] text-text-secondary">Retry in {countdown}s</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void send(task)}
                          className="mt-2 text-[11px] font-medium text-copper-accent transition-opacity hover:opacity-75"
                        >
                          Try again {"->"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              if (message.role === "assistant") {
                return (
                  <div key={message.id} className="flex items-start gap-2.5">
                    <AiAvatar />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-copper-accent">Payloada AI</span>
                        <span className="rounded-md border-[0.5px] border-ui-border bg-surface-elevated px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em] text-text-secondary">
                          {TASK_LABEL[message.task]}
                        </span>
                      </div>
                      <div className="rounded-2xl rounded-tl-sm border-[0.5px] border-ui-border bg-[#0F1117] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <RenderedResponse text={message.content} />
                      </div>
                      <p className="mt-1.5 pl-0.5 text-[10px] text-[#5A6070]">
                        {formatMessageTime(message.createdAt)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-0.5">
                        <MsgBtn onClick={() => void onCopy(message.content, "Copied response")}>
                          <Copy className="size-3" /> Copy
                        </MsgBtn>
                        {message.jsonPath && message.task === "query" && (
                          <MsgBtn onClick={() => void onCopy(message.jsonPath!, "Copied JSONPath")} accent>
                            <Copy className="size-3" /> Copy JSONPath
                          </MsgBtn>
                        )}
                        {message.json && (message.task === "fix" || message.task === "generate") && (
                          <MsgBtn onClick={() => onSendToEditor(message.json!)} green>
                            <ArrowDownToLine className="size-3" />
                            {message.task === "generate" ? "Use in editor" : "Send to editor"}
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

      <div className="shrink-0 border-t-[0.5px] border-ui-border bg-obsidian-base px-4 py-2 sm:px-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {TASKS.map((nextTask) => (
              <button
                key={nextTask}
                type="button"
                onClick={() => setTask(nextTask)}
                className={cn(
                  "shrink-0 rounded-md border-[0.5px] px-2.5 py-1 text-[10px] font-medium transition-colors",
                  task === nextTask
                    ? "border-copper-accent bg-copper-accent/12 text-copper-accent"
                    : "border-ui-border bg-transparent text-text-secondary hover:border-ui-border-hover hover:bg-surface-elevated/40 hover:text-text-primary",
                )}
              >
                {TASK_LABEL[nextTask]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => void handleCopyLast()}
              disabled={!lastAssistant}
              className="flex h-7 items-center gap-1.5 rounded-md border-[0.5px] border-ui-border bg-transparent px-2.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-ui-border-hover hover:bg-surface-elevated/40 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Copy className="size-3.5" />
              Copy last
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={!lastUser || loading || countdown > 0 || !hasJson}
              className="flex h-7 items-center gap-1.5 rounded-md border-[0.5px] border-ui-border bg-transparent px-2.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-ui-border-hover hover:bg-surface-elevated/40 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" />
              Regenerate
            </button>
            <span className="flex h-7 items-center rounded-md border-[0.5px] border-ui-border bg-transparent px-2.5 text-[10px] font-medium text-text-secondary">
              JSON context: {hasJson ? "ON" : "OFF"}
            </span>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(task);
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 rounded-xl border-[0.5px] border-ui-border bg-[#0F1117] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={PLACEHOLDERS[task]}
              disabled={loading || countdown > 0 || !hasJson}
              rows={2}
              className="min-h-[36px] w-full resize-none bg-transparent text-[13px] leading-relaxed text-text-primary outline-none placeholder:text-text-secondary/50 disabled:opacity-50"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-[10px] text-[#5A6070]">Shift+Enter new line - Enter to send</p>
              <p className="text-[10px] text-[#5A6070]">{input.length} / 2000</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !hasJson || countdown > 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper-accent text-white transition-all hover:bg-copper-accent/85 disabled:opacity-40 focus-visible:outline-none"
          >
            <Send className="size-4" />
          </button>
        </form>

        <p className="mt-1.5 text-center text-[10px] text-text-secondary/60">
          JSON is only sent when you use AI actions.
        </p>
      </div>
    </div>
  );
}

function AiAvatar({ error = false }: { error?: boolean }) {
  return (
    <div
      className={cn(
        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-[0.5px]",
        error
          ? "border-red-500/30 bg-red-500/10"
          : "border-copper-accent/30 bg-copper-accent/10",
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
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[0.5px] border-copper-accent/30 bg-copper-accent/10">
        <Sparkles className="size-6 text-copper-accent" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-text-primary">Load JSON to start a conversation</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
          Paste or upload JSON in the Editor, then ask Payloada AI to explain, fix, query, or generate output from it.
        </p>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggest }: { onSuggest: (suggestion: Suggestion) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-[0.5px] border-copper-accent/30 bg-copper-accent/10">
          <Sparkles className="size-5 text-copper-accent" />
        </div>
        <p className="text-[16px] font-semibold text-text-primary">How can I help with this JSON?</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
          Ask a question, inspect the payload, or generate JSON-aware output from the current editor context.
        </p>
      </div>

      <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => onSuggest(suggestion)}
              className="flex items-center gap-3 rounded-xl border-[0.5px] border-ui-border bg-surface-elevated px-4 py-3 text-left transition-all hover:border-copper-accent/30 hover:bg-copper-accent/5"
            >
              <Icon className="size-4 shrink-0 text-copper-accent" />
              <span className="text-[13px] font-medium text-text-secondary">{suggestion.label}</span>
            </button>
          );
        })}
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
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (/^\*\*JSONPath:\*\*/.test(trimmed)) {
          return (
            <div
              key={index}
              className="rounded-md border-[0.5px] border-ui-border bg-surface-container px-3 py-2 font-mono text-[11px] text-copper-accent"
            >
              {renderInlineMarkup(trimmed)}
            </div>
          );
        }

        if (isSectionHeading(trimmed)) {
          const tone = getHeadingTone(trimmed);
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
              {renderInlineMarkup(trimmed)}
            </p>
          );
        }

        if (/^[-*]\s/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-accent" />
              <span>{renderInlineMarkup(trimmed.replace(/^[-*]\s/, ""))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="min-w-5 font-mono text-[11px] text-text-secondary">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span>{renderInlineMarkup(trimmed.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkup(trimmed)}</p>;
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
  return /^\*\*[^*]+\*\*$/.test(line) || /^(Overview|Key fields|Watchouts|What changed|Issues found)$/i.test(line);
}

function getHeadingTone(line: string) {
  const normalized = line.replace(/\*/g, "");
  if (/^(Watchouts|Issues found)$/i.test(normalized)) return "alert" as const;
  if (/^What changed$/i.test(normalized)) return "success" as const;
  return "default" as const;
}

function getFallbackUserMessage(task: AiTask) {
  switch (task) {
    case "explain":
      return "Help me understand this JSON";
    case "fix":
      return "Review and fix this JSON";
    case "query":
      return "Query this JSON";
    case "generate":
      return "Generate output from this JSON";
  }
}

function formatMessageTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
